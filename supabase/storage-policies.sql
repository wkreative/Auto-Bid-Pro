-- Run this SQL in your Supabase Dashboard SQL Editor
-- Go to: https://supabase.com/dashboard/project/utdtmlsiuwrrwnvzwejl/sql/new

-- Make the bucket public (so URLs are accessible)
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle_media', 'vehicle_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to view/download files (RLS is already enabled by default on storage.objects)
DROP POLICY IF EXISTS "Anyone can view files in vehicle_media" ON storage.objects;
CREATE POLICY "Anyone can view files in vehicle_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle_media');

-- Allow admins to upload files
DROP POLICY IF EXISTS "Admins can upload files to vehicle_media" ON storage.objects;
CREATE POLICY "Admins can upload files to vehicle_media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle_media' AND public.is_admin());

-- Allow admins to update files
DROP POLICY IF EXISTS "Admins can update files in vehicle_media" ON storage.objects;
CREATE POLICY "Admins can update files in vehicle_media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicle_media' AND public.is_admin())
  WITH CHECK (bucket_id = 'vehicle_media' AND public.is_admin());

-- Allow admins to delete files
DROP POLICY IF EXISTS "Admins can delete files from vehicle_media" ON storage.objects;
CREATE POLICY "Admins can delete files from vehicle_media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicle_media' AND public.is_admin());
