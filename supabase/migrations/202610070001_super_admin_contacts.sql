BEGIN;
-- Resolve authorization from protected, current Auth metadata, never editable profile fields or stale JWT roles.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND u.id = 'c5f19cb4-25d5-460e-9132-3658b1caecec'::uuid
    AND lower(u.email) = 'josejmzmo@gmail.com' AND u.email_confirmed_at IS NOT NULL
    AND u.raw_app_meta_data->>'role' = 'super_admin');
$$;
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND u.email_confirmed_at IS NOT NULL
    AND (u.raw_app_meta_data->>'role' = 'admin' OR public.is_super_admin()));
$$;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin(), public.is_admin() TO anon, authenticated, service_role;
-- Profile writes go through authorized server actions using the service role.
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read profiles" ON public.profiles;
CREATE POLICY "Admins can read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name',
    NULLIF(new.raw_user_meta_data->>'phone', ''), 'user');
  RETURN new;
END;
$$;
COMMIT;
