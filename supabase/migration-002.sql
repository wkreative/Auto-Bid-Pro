-- Run in Supabase Dashboard SQL Editor
-- Add sale_type and direct_sale_price to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'auction';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS direct_sale_price NUMERIC;

-- Create financing applications table
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

CREATE POLICY "Users can view own financing applications"
  ON financing_applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own financing applications"
  ON financing_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage financing applications"
  ON financing_applications FOR ALL
  USING (public.is_admin());

CREATE TRIGGER update_financing_applications_modtime BEFORE UPDATE ON financing_applications
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Create purchases table for direct sale flow
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

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own purchases"
  ON purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage purchases"
  ON purchases FOR ALL
  USING (public.is_admin());

CREATE TRIGGER update_purchases_modtime BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
