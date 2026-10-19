-- Run this in your Supabase SQL Editor to enable public & authenticated access:

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 1. Permissions for labour_posts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.labour_posts TO anon, authenticated;

-- 2. Permissions for job_applicants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applicants TO anon, authenticated;

-- 3. Permissions for reviews
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated;

-- 4. Permissions for profiles and professional_details
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.professional_details TO anon, authenticated;
