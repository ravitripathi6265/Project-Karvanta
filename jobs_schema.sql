-- Create jobs table for the Labour Chowk
CREATE TABLE public.labour_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  city TEXT,
  locality TEXT,
  start_date DATE,
  start_time TEXT,
  workers_needed INTEGER DEFAULT 1,
  daily_rate DECIMAL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Applicants table (Many-to-Many between labour_posts and workers/profiles)
CREATE TABLE public.job_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.labour_posts(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, worker_id)
);

-- RLS for jobs
ALTER TABLE public.labour_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public jobs are viewable by everyone" ON public.labour_posts FOR SELECT USING (true);
CREATE POLICY "Customers can insert jobs" ON public.labour_posts FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update their own jobs" ON public.labour_posts FOR UPDATE USING (auth.uid() = customer_id);

-- RLS for applicants
ALTER TABLE public.job_applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants viewable by everyone" ON public.job_applicants FOR SELECT USING (true);
CREATE POLICY "Workers can apply" ON public.job_applicants FOR INSERT WITH CHECK (auth.uid() = worker_id);
