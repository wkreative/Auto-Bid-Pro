-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE vehicle_status AS ENUM ('draft', 'published', 'sold', 'reserved', 'archived');
CREATE TYPE bid_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'won', 'lost', 'negotiating');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- Users and Profiles (extended from auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status subscription_status DEFAULT 'unpaid',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  trim TEXT,
  vin TEXT UNIQUE NOT NULL,
  mileage INTEGER,
  engine TEXT,
  transmission TEXT,
  fuel_type TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  title_type TEXT,
  condition TEXT,
  location TEXT,
  starting_price NUMERIC,
  estimated_auction_price NUMERIC,
  estimated_repair_cost NUMERIC,
  estimated_transport_cost NUMERIC,
  admin_fees NUMERIC,
  estimated_total_cost NUMERIC,
  estimated_resale_value NUMERIC,
  estimated_profit NUMERIC,
  risk_level risk_level,
  description TEXT,
  internal_notes TEXT,
  sale_type TEXT DEFAULT 'auction',
  direct_sale_price NUMERIC,
  status vehicle_status DEFAULT 'draft',
  auction_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Images
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Videos
CREATE TABLE vehicle_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Documents
CREATE TABLE vehicle_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status bid_status DEFAULT 'submitted',
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bid History
CREATE TABLE bid_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
  old_status bid_status,
  new_status bid_status,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Alerts
CREATE TABLE vehicle_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  brand TEXT,
  model TEXT,
  max_price NUMERIC,
  max_mileage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)

-- Purchases (direct sale)
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
CREATE TRIGGER update_purchases_modtime BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Financing Applications
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

-- Create a secure function to check admin status bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL USING (public.is_admin());

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published vehicles" ON vehicles FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage vehicles" ON vehicles FOR ALL USING (public.is_admin());

ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read vehicle images for published vehicles" ON vehicle_images FOR SELECT USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_id AND status = 'published'));
CREATE POLICY "Admins can manage vehicle images" ON vehicle_images FOR ALL USING (public.is_admin());

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bids" ON bids FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bids" ON bids FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bids if submitted" ON bids FOR UPDATE USING (user_id = auth.uid() AND status = 'submitted');
CREATE POLICY "Admins can manage bids" ON bids FOR ALL USING (public.is_admin());

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (user_id = auth.uid());

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (user_id = auth.uid());

ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own financing applications" ON financing_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own financing applications" ON financing_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage financing applications" ON financing_applications FOR ALL USING (public.is_admin());

-- Storage RLS Policies (for the vehicle_media bucket)
-- RLS is already enabled by default on storage.objects in Supabase
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle_media', 'vehicle_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can view files in vehicle_media" ON storage.objects;
CREATE POLICY "Anyone can view files in vehicle_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle_media');

DROP POLICY IF EXISTS "Admins can upload files to vehicle_media" ON storage.objects;
CREATE POLICY "Admins can upload files to vehicle_media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle_media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update files in vehicle_media" ON storage.objects;
CREATE POLICY "Admins can update files in vehicle_media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicle_media' AND public.is_admin())
  WITH CHECK (bucket_id = 'vehicle_media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete files from vehicle_media" ON storage.objects;
CREATE POLICY "Admins can delete files from vehicle_media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicle_media' AND public.is_admin());

-- Triggers

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_vehicles_modtime BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_subscriptions_modtime BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_bids_modtime BEFORE UPDATE ON bids FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_financing_applications_modtime BEFORE UPDATE ON financing_applications FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
