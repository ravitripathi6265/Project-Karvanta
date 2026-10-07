-- Run this in your Supabase SQL Editor to fix permissions and RLS for Admin approval

-- 1. Ensure authenticated users have usage and access to the tables
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.professional_details TO anon, authenticated;

-- 2. Allow Admins to update ANY profile (needed for Approving/Rejecting)
DROP POLICY IF EXISTS "Admins can update all profiles." ON public.profiles;
CREATE POLICY "Admins can update all profiles." 
ON public.profiles 
FOR UPDATE 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Ensure everyone can view profiles (if not already set)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles 
FOR SELECT 
USING (true);

-- 4. Ensure everyone can view professional details (if not already set)
DROP POLICY IF EXISTS "Professional details viewable by everyone" ON public.professional_details;
CREATE POLICY "Professional details viewable by everyone" 
ON public.professional_details 
FOR SELECT 
USING (true);

-- 5. Create a secure RPC function to allow the frontend mock-admin to update statuses
CREATE OR REPLACE FUNCTION admin_update_status(p_id UUID, p_status text, p_secret text)
RETURNS void AS $$
BEGIN
  -- We use a secret to ensure only the authorized frontend app can call this as anon
  IF p_secret = 'karvanta_admin_secret_2026' THEN
    UPDATE public.profiles SET status = p_status::public.profile_status WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized admin operation';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
