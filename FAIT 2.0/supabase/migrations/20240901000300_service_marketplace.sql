-- Add service marketplace functionality

-- Start transaction
BEGIN;

-- Create service categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service packages table
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  good_tier_price DECIMAL(10, 2),
  better_tier_price DECIMAL(10, 2),
  best_tier_price DECIMAL(10, 2),
  good_tier_description TEXT,
  better_tier_description TEXT,
  best_tier_description TEXT,
  duration_minutes INTEGER,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  location_type VARCHAR(50) NOT NULL DEFAULT 'on_site' 
    CHECK (location_type IN ('on_site', 'remote', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service package features table
CREATE TABLE IF NOT EXISTS public.service_package_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tier VARCHAR(20) NOT NULL 
    CHECK (tier IN ('all', 'good', 'better', 'best')),
  is_included BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service package images table
CREATE TABLE IF NOT EXISTS public.service_package_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  location VARCHAR(255),
  zip_code VARCHAR(20),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'in_progress', 'completed', 'canceled', 'expired')),
  is_remote BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  price_quote DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  selected_tier VARCHAR(20) 
    CHECK (selected_tier IN ('good', 'better', 'best')),
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'canceled')),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project milestones table
CREATE TABLE IF NOT EXISTS public.booking_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranty periods table
CREATE TABLE IF NOT EXISTS public.warranty_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_package_id UUID NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL 
    CHECK (tier IN ('good', 'better', 'best')),
  duration_days INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_package_id, tier)
);

-- Create warranty claims table
CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  response_text TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_package_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_package_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy for viewing service categories
CREATE POLICY "Anyone can view active service categories"
ON public.service_categories FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy for viewing service packages
CREATE POLICY "Anyone can view active service packages"
ON public.service_packages FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy for service agents to manage their packages
CREATE POLICY "Service agents can manage their own packages"
ON public.service_packages FOR ALL
TO authenticated
USING (service_agent_id = auth.uid());

-- Policy for viewing job postings
CREATE POLICY "Anyone can view open job postings"
ON public.job_postings FOR SELECT
TO authenticated
USING (status = 'open');

-- Policy for clients to manage their job postings
CREATE POLICY "Clients can manage their own job postings"
ON public.job_postings FOR ALL
TO authenticated
USING (client_id = auth.uid());

-- Policy for service agents to view their job applications
CREATE POLICY "Service agents can view their own job applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (service_agent_id = auth.uid());

-- Policy for clients to view applications to their jobs
CREATE POLICY "Clients can view applications to their jobs"
ON public.job_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings
    WHERE job_postings.id = job_applications.job_id
    AND job_postings.client_id = auth.uid()
  )
);

-- Policy for service agents to create job applications
CREATE POLICY "Service agents can create job applications"
ON public.job_applications FOR INSERT
TO authenticated
WITH CHECK (service_agent_id = auth.uid());

-- Policy for viewing bookings
CREATE POLICY "Users can view bookings they are part of"
ON public.bookings FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR service_agent_id = auth.uid());

-- Insert default service categories
INSERT INTO public.service_categories (name, description, order_index, is_active)
VALUES
  ('Home Renovation', 'Full home renovation services including kitchen, bathroom, and living spaces', 1, true),
  ('Plumbing', 'Plumbing installation, repair, and maintenance services', 2, true),
  ('Electrical', 'Electrical installation, repair, and maintenance services', 3, true),
  ('Carpentry', 'Custom carpentry, woodworking, and furniture making', 4, true),
  ('Painting', 'Interior and exterior painting services', 5, true),
  ('Landscaping', 'Landscape design, installation, and maintenance', 6, true),
  ('Cleaning', 'Residential and commercial cleaning services', 7, true),
  ('HVAC', 'Heating, ventilation, and air conditioning services', 8, true),
  ('Roofing', 'Roof installation, repair, and maintenance', 9, true),
  ('Flooring', 'Hardwood, tile, carpet, and other flooring services', 10, true)
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;
