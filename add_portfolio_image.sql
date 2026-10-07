-- Run this in your Supabase SQL Editor to add the missing column for portfolio images

ALTER TABLE public.professional_details ADD COLUMN IF NOT EXISTS portfolio_image_url TEXT;

-- Also ensure that any authenticated user can update this new column
GRANT UPDATE (portfolio_image_url) ON public.professional_details TO authenticated;
