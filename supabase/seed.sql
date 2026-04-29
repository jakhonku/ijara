-- Categories
INSERT INTO equipment_categories (name, icon) VALUES
  ('Og''ir texnika', 'Truck'),
  ('Yengil texnika', 'Tractor'),
  ('Asboblar', 'Wrench'),
  ('Qoliplar/Leshalar', 'LayoutGrid'),
  ('Elektr asboblar', 'Plug')
ON CONFLICT (name) DO NOTHING;

-- Equipment
INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Og''ir texnika'),
  'Ekskavator JCB JS220',
  'dona',
  2,
  2500000,
  'O''rta sinfdagi gusenitsali ekskavator',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Ekskavator JCB JS220');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Og''ir texnika'),
  'Buldozer Komatsu D65',
  'dona',
  1,
  3000000,
  'Quvvatli buldozer',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Buldozer Komatsu D65');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Og''ir texnika'),
  'Avtokran 25 t',
  'dona',
  1,
  3500000,
  '25 tonnali yuk ko''taruvchi kran',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Avtokran 25 t');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Yengil texnika'),
  'Beton mikser 6 m³',
  'dona',
  3,
  1200000,
  'Beton aralashtirgich avtomashina',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Beton mikser 6 m³');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Yengil texnika'),
  'Mini yuk tashuvchi Bobcat',
  'dona',
  2,
  900000,
  'Kichik gabaritli yuk tashish vositasi',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Mini yuk tashuvchi Bobcat');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Asboblar'),
  'Beton vibrator',
  'dona',
  10,
  80000,
  'Qo''l vibratori',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Beton vibrator');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Asboblar'),
  'Otboyniy bolg''a',
  'dona',
  6,
  150000,
  'Pnevmatik otboyniy bolg''a',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Otboyniy bolg''a');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Qoliplar/Leshalar'),
  'Devor qolipi (3x1 m)',
  'dona',
  120,
  35000,
  'Beton qolipi panel',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Devor qolipi (3x1 m)');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Qoliplar/Leshalar'),
  'Lesha (4 m)',
  'dona',
  80,
  20000,
  'Qurilish leshasi 4 metr',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Lesha (4 m)');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Elektr asboblar'),
  'Generator 5 kVt',
  'dona',
  4,
  300000,
  'Benzin generatori 5 kVt',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Generator 5 kVt');

INSERT INTO equipment (category_id, name, unit, total_qty, daily_price, description, status)
SELECT
  (SELECT id FROM equipment_categories WHERE name = 'Elektr asboblar'),
  'Bolgarka Bosch GWS',
  'dona',
  8,
  120000,
  'Burchakli silliqlash mashinasi',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Bolgarka Bosch GWS');
