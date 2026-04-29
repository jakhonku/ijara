export type RentalStatus = "active" | "closed" | "overdue";
export type EquipmentStatus = "active" | "maintenance" | "archived";
export type PaymentMethod = "cash" | "card" | "click" | "payme" | "bank" | "other";

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  passport: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface Equipment {
  id: string;
  category_id: string | null;
  name: string;
  unit: string;
  total_qty: number;
  rented_qty: number;
  daily_price: number;
  description: string | null;
  status: EquipmentStatus;
  created_at: string;
  updated_at: string;
}

export interface EquipmentWithCategory extends Equipment {
  category: EquipmentCategory | null;
}

export interface Rental {
  id: string;
  rental_number: string;
  customer_id: string;
  start_date: string;
  expected_return_date: string;
  actual_return_date: string | null;
  days_count: number;
  total_amount: number;
  paid_amount: number;
  status: RentalStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalItem {
  id: string;
  rental_id: string;
  equipment_id: string;
  equipment_name_snapshot: string;
  unit_snapshot: string;
  quantity: number;
  daily_price: number;
  days_count: number;
  subtotal: number;
  created_at: string;
}

export interface Payment {
  id: string;
  rental_id: string;
  amount: number;
  method: PaymentMethod;
  notes: string | null;
  paid_at: string;
  created_at: string;
}

export interface RentalWithCustomer extends Rental {
  customer: Customer;
}

export interface RentalDetail extends Rental {
  customer: Customer;
  items: RentalItem[];
  payments: Payment[];
}

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Customer, "id" | "created_at" | "updated_at">>;
      };
      equipment_categories: {
        Row: EquipmentCategory;
        Insert: Omit<EquipmentCategory, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<EquipmentCategory, "id" | "created_at">>;
      };
      equipment: {
        Row: Equipment;
        Insert: Omit<Equipment, "id" | "created_at" | "updated_at" | "rented_qty"> & {
          id?: string;
          rented_qty?: number;
        };
        Update: Partial<Omit<Equipment, "id" | "created_at" | "updated_at">>;
      };
      rentals: {
        Row: Rental;
        Insert: Omit<Rental, "id" | "created_at" | "updated_at" | "paid_amount" | "actual_return_date" | "status"> & {
          id?: string;
          paid_amount?: number;
          actual_return_date?: string | null;
          status?: RentalStatus;
        };
        Update: Partial<Omit<Rental, "id" | "created_at" | "updated_at">>;
      };
      rental_items: {
        Row: RentalItem;
        Insert: Omit<RentalItem, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<RentalItem, "id" | "created_at">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at" | "paid_at"> & {
          id?: string;
          paid_at?: string;
        };
        Update: Partial<Omit<Payment, "id" | "created_at">>;
      };
    };
  };
}
