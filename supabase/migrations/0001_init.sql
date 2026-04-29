-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  passport TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment categories
CREATE TABLE equipment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment / Inventory (warehouse items)
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES equipment_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'dona',
  total_qty INTEGER NOT NULL DEFAULT 0 CHECK (total_qty >= 0),
  rented_qty INTEGER NOT NULL DEFAULT 0 CHECK (rented_qty >= 0),
  daily_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (daily_price >= 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','maintenance','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT rented_lte_total CHECK (rented_qty <= total_qty)
);

-- Rentals (one per agreement)
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_number TEXT NOT NULL UNIQUE, -- IJ-YYMMDD-NNNN
  customer_id UUID NOT NULL REFERENCES customers(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  days_count INTEGER NOT NULL CHECK (days_count >= 1),
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental items (line items per rental)
CREATE TABLE rental_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  equipment_name_snapshot TEXT NOT NULL,
  unit_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  daily_price NUMERIC(14,2) NOT NULL CHECK (daily_price >= 0),
  days_count INTEGER NOT NULL CHECK (days_count >= 1),
  subtotal NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','card','click','payme','bank','other')),
  notes TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rentals_customer ON rentals(customer_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_start_date ON rentals(start_date DESC);
CREATE INDEX idx_rental_items_rental ON rental_items(rental_id);
CREATE INDEX idx_rental_items_equipment ON rental_items(equipment_id);
CREATE INDEX idx_payments_rental ON payments(rental_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Trigger to update equipment.rented_qty when rental_items change
CREATE OR REPLACE FUNCTION update_equipment_rented_qty()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE equipment SET rented_qty = rented_qty + NEW.quantity WHERE id = NEW.equipment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE equipment SET rented_qty = GREATEST(0, rented_qty - OLD.quantity) WHERE id = OLD.equipment_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rental_items_qty_trigger
AFTER INSERT OR DELETE ON rental_items
FOR EACH ROW EXECUTE FUNCTION update_equipment_rented_qty();

-- When rental closed, return items to inventory
CREATE OR REPLACE FUNCTION handle_rental_close()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    UPDATE equipment e
    SET rented_qty = GREATEST(0, e.rented_qty - ri.quantity)
    FROM rental_items ri
    WHERE ri.rental_id = NEW.id AND ri.equipment_id = e.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rental_close_trigger
AFTER UPDATE OF status ON rentals
FOR EACH ROW EXECUTE FUNCTION handle_rental_close();

-- Auto-update paid_amount on payments
CREATE OR REPLACE FUNCTION update_rental_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rentals SET paid_amount = (
    SELECT COALESCE(SUM(amount), 0) FROM payments WHERE rental_id = COALESCE(NEW.rental_id, OLD.rental_id)
  ) WHERE id = COALESCE(NEW.rental_id, OLD.rental_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_update_paid_trigger
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION update_rental_paid_amount();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER rentals_updated_at BEFORE UPDATE ON rentals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS (basic — authenticated users can do everything)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON equipment_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON rentals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON rental_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Helper RPC: generate next rental number for today
CREATE OR REPLACE FUNCTION next_rental_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'IJ-' || to_char(NOW() AT TIME ZONE 'Asia/Tashkent', 'YYMMDD') || '-';
  cnt INT;
BEGIN
  SELECT COUNT(*) + 1 INTO cnt
  FROM rentals
  WHERE rental_number LIKE prefix || '%';
  RETURN prefix || lpad(cnt::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
