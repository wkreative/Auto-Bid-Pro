-- ============================================================
-- EJECUTAR EN SUPABASE DASHBOARD > SQL EDITOR
-- 1. Abre https://supabase.com/dashboard/project/utdtmlsiuwrrwnvzwejl
-- 2. Ve a "SQL Editor"
-- 3. Pega TODO este contenido
-- 4. Haz clic en "RUN"
-- ============================================================

-- 1. Agregar columnas de tipo de venta a vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'auction';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS direct_sale_price NUMERIC;

-- 2. Crear tabla de solicitudes de financiamiento
CREATE TABLE IF NOT EXISTS financing_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  dob DATE,
  address TEXT,
  annual_income NUMERIC,
  employment_status TEXT,
  credit_score TEXT,
  loan_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own financing applications" ON financing_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own financing applications" ON financing_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage financing applications" ON financing_applications FOR ALL USING (public.is_admin());

-- 3. Crear tabla de compras directas
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own purchases" ON purchases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage purchases" ON purchases FOR ALL USING (public.is_admin());

-- 4. Insertar 10 vehículos de demostración
INSERT INTO vehicles (id, brand, model, year, trim, vin, mileage, engine, transmission, fuel_type, exterior_color, interior_color, condition, location, starting_price, direct_sale_price, estimated_repair_cost, estimated_transport_cost, admin_fees, estimated_resale_value, risk_level, description, sale_type, status)
VALUES
  (uuid_generate_v4(), 'Toyota', 'Corolla', 2022, 'LE', 'DEMO-TOY-COR-0001', 39000, '1.8L 4-Cilindros', 'Automática', 'Gasolina', 'Blanco', 'Beige', 'Excelente', 'Caguas, PR', 12500, NULL, 500, 250, 300, 16500, 'low', 'Sedán automático, motor de cuatro cilindros, cámara de reversa, Bluetooth, aire acondicionado y excelente rendimiento de combustible.', 'auction', 'published'),
  (uuid_generate_v4(), 'Toyota', 'RAV4', 2021, 'LE', 'DEMO-TOY-RAV-0002', 66000, '2.5L 4-Cilindros', 'Automática', 'Gasolina', 'Gris', 'Negro', 'Buena', 'San Juan, PR', NULL, 18900, 800, 350, 400, 22000, 'low', 'SUV compacta automática, interior espacioso, cámara de reversa, controles en el guía y amplio espacio de carga.', 'direct_sale', 'published'),
  (uuid_generate_v4(), 'Hyundai', 'Accent', 2022, 'SE', 'DEMO-HYU-ACC-0003', 42500, '1.6L 4-Cilindros', 'Automática', 'Gasolina', 'Azul', 'Gris', 'Excelente', 'Bayamón, PR', 9800, NULL, 400, 200, 250, 13000, 'low', 'Sedán económico de cuatro cilindros, transmisión automática, pantalla multimedia y bajo consumo de combustible.', 'auction', 'published'),
  (uuid_generate_v4(), 'Kia', 'Forte', 2023, 'LXS', 'DEMO-KIA-FOR-0004', 31200, '2.0L 4-Cilindros', 'Automática', 'Gasolina', 'Rojo', 'Negro', 'Excelente', 'Carolina, PR', NULL, 14500, 300, 250, 350, 17500, 'low', 'Sedán moderno con cámara de reversa, Apple CarPlay, Android Auto, controles en el guía y amplio baúl.', 'direct_sale', 'published'),
  (uuid_generate_v4(), 'Toyota', 'Tacoma', 2020, 'SR5', 'DEMO-TOY-TAC-0005', 58700, '3.5L V6', 'Automática', 'Gasolina', 'Negro', 'Negro', 'Buena', 'Arecibo, PR', 22000, NULL, 1200, 500, 400, 28000, 'medium', 'Pickup de doble cabina, transmisión automática, cámara de reversa, acondicionada para trabajo y uso personal.', 'auction', 'published'),
  (uuid_generate_v4(), 'Nissan', 'Sentra', 2021, 'SV', 'DEMO-NIS-SEN-0006', 47800, '2.0L 4-Cilindros', 'Automática', 'Gasolina', 'Plateado', 'Negro', 'Buena', 'Ponce, PR', NULL, 11200, 600, 300, 300, 14500, 'low', 'Sedán automático con botón de encendido, cámara de reversa, sistemas de asistencia al conductor y pantalla táctil.', 'direct_sale', 'published'),
  (uuid_generate_v4(), 'Toyota', 'Corolla Cross', 2023, 'LE', 'DEMO-TOY-CRC-0007', 26000, '2.0L 4-Cilindros', 'Automática', 'Gasolina', 'Blanco', 'Gris', 'Excelente', 'San Juan, PR', 16500, NULL, 200, 300, 350, 20500, 'low', 'SUV compacta automática, cámara de reversa, conectividad móvil, buen espacio interior y excelente economía de combustible.', 'auction', 'published'),
  (uuid_generate_v4(), 'Honda', 'CR-V', 2020, 'EX', 'DEMO-HON-CRV-0008', 54300, '1.5L Turbo 4-Cilindros', 'Automática', 'Gasolina', 'Gris', 'Beige', 'Buena', 'Guaynabo, PR', NULL, 17800, 700, 400, 350, 22000, 'low', 'SUV cómoda y espaciosa, motor eficiente, cámara de reversa, sistema multimedia y amplio espacio de carga.', 'direct_sale', 'published'),
  (uuid_generate_v4(), 'Mitsubishi', 'Outlander Sport', 2021, 'ES', 'DEMO-MIT-OUT-0009', 44600, '2.0L 4-Cilindros', 'Automática', 'Gasolina', 'Gris', 'Negro', 'Buena', 'Mayagüez, PR', 10500, NULL, 500, 350, 250, 13500, 'medium', 'SUV compacta automática, cámara de reversa, pantalla táctil, aire acondicionado y buen espacio para pasajeros.', 'auction', 'published'),
  (uuid_generate_v4(), 'Hyundai', 'Tucson', 2022, 'SE', 'DEMO-HYU-TUC-0010', 37900, '2.5L 4-Cilindros', 'Automática', 'Gasolina', 'Azul', 'Gris', 'Excelente', 'Toa Baja, PR', NULL, 15300, 400, 300, 350, 19000, 'low', 'SUV automática con cámara de reversa, conectividad Bluetooth, controles en el guía y amplio compartimiento de carga.', 'direct_sale', 'published');
