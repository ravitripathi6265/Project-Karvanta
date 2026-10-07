-- Create user roles ENUM
CREATE TYPE public.user_role AS ENUM ('customer', 'contractor', 'worker', 'admin');

-- Create profile status ENUM
CREATE TYPE public.profile_status AS ENUM ('pending', 'approved', 'rejected');

-- Create Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role public.user_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  status public.profile_status DEFAULT 'approved',
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create Contractor/Worker Details Table
CREATE TABLE public.professional_details (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  skills TEXT[],
  experience_years INTEGER,
  rate_per_day DECIMAL,
  languages TEXT[],
  bio TEXT
);

-- Row Level Security (RLS) for Professional Details
ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professional details viewable by everyone" ON public.professional_details FOR SELECT USING (true);
CREATE POLICY "Users can insert own professional details" ON public.professional_details FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own professional details" ON public.professional_details FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile automatically after a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create Reviews Table for Contractors/Workers
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
