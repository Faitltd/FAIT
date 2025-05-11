/*
  Warranty Eligibility Tracking Migration
  
  This migration adds tables and functions needed for the Warranty Eligibility Tracking module:
  
  1. Enhances the warranties table with eligibility fields
  2. Adds warranty_types table for different warranty categories
  3. Adds warranty_claims table for tracking claims
  4. Adds functions for warranty period calculation
*/

-- Start transaction
BEGIN;

-- Create warranty_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.warranty_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  premium_duration_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranties table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.warranties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  warranty_type_id UUID REFERENCES public.warranty_types(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'void')),
  is_premium BOOLEAN DEFAULT FALSE,
  auto_renewal BOOLEAN DEFAULT FALSE,
  terms_document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranty_claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_id UUID NOT NULL REFERENCES public.warranties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')),
  resolution_notes TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id)
);

-- Create warranty_claim_updates table for tracking the history of claim updates
CREATE TABLE IF NOT EXISTS public.warranty_claim_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_claim_id UUID NOT NULL REFERENCES public.warranty_claims(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  update_notes TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to calculate warranty end date based on type and premium status
CREATE OR REPLACE FUNCTION calculate_warranty_end_date(
  start_date DATE,
  warranty_type_id UUID,
  is_premium BOOLEAN
) RETURNS DATE AS $$
DECLARE
  duration_days INTEGER;
  end_date DATE;
BEGIN
  -- Get the appropriate duration based on premium status
  IF is_premium THEN
    SELECT premium_duration_days INTO duration_days
    FROM public.warranty_types
    WHERE id = warranty_type_id;
    
    -- If premium_duration_days is NULL, fall back to regular duration
    IF duration_days IS NULL THEN
      SELECT duration_days INTO duration_days
      FROM public.warranty_types
      WHERE id = warranty_type_id;
    END IF;
  ELSE
    SELECT duration_days INTO duration_days
    FROM public.warranty_types
    WHERE id = warranty_type_id;
  END IF;
  
  -- Calculate end date
  end_date := start_date + (duration_days * INTERVAL '1 day');
  
  RETURN end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a warranty is eligible for a claim
CREATE OR REPLACE FUNCTION is_warranty_eligible_for_claim(warranty_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  warranty_record public.warranties%ROWTYPE;
BEGIN
  -- Get the warranty record
  SELECT * INTO warranty_record
  FROM public.warranties
  WHERE id = warranty_id;
  
  -- Check if warranty exists
  IF warranty_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if warranty is active
  IF warranty_record.status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if warranty is not expired
  IF warranty_record.end_date < CURRENT_DATE THEN
    RETURN FALSE;
  END IF;
  
  -- All checks passed, warranty is eligible
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update warranty status based on end date
CREATE OR REPLACE FUNCTION update_warranty_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if warranty has expired
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status := 'expired';
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update warranty status before insert or update
DROP TRIGGER IF EXISTS warranty_status_update_trigger ON public.warranties;
CREATE TRIGGER warranty_status_update_trigger
BEFORE INSERT OR UPDATE ON public.warranties
FOR EACH ROW
EXECUTE FUNCTION update_warranty_status();

-- Function to create a warranty claim update record
CREATE OR REPLACE FUNCTION create_warranty_claim_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create an update record if the status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.warranty_claim_updates (
      warranty_claim_id,
      previous_status,
      new_status,
      updated_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.resolved_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create warranty claim update record after update
DROP TRIGGER IF EXISTS warranty_claim_update_trigger ON public.warranty_claims;
CREATE TRIGGER warranty_claim_update_trigger
AFTER UPDATE ON public.warranty_claims
FOR EACH ROW
EXECUTE FUNCTION create_warranty_claim_update();

-- Add RLS policies
ALTER TABLE public.warranty_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claim_updates ENABLE ROW LEVEL SECURITY;

-- Warranty types policies
CREATE POLICY "Admins can manage warranty types"
ON public.warranty_types
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Everyone can view warranty types"
ON public.warranty_types FOR SELECT
USING (true);

-- Warranties policies
CREATE POLICY "Users can view warranties they're involved with"
ON public.warranties FOR SELECT
USING (
  client_id = auth.uid() OR 
  contractor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can create warranties"
ON public.warranties FOR INSERT
WITH CHECK (
  contractor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can update warranties they created"
ON public.warranties FOR UPDATE
USING (
  contractor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Warranty claims policies
CREATE POLICY "Users can view warranty claims they're involved with"
ON public.warranty_claims FOR SELECT
USING (
  client_id = auth.uid() OR 
  contractor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Clients can create warranty claims"
ON public.warranty_claims FOR INSERT
WITH CHECK (
  client_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can update warranty claims assigned to them"
ON public.warranty_claims FOR UPDATE
USING (
  contractor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Warranty claim updates policies
CREATE POLICY "Users can view warranty claim updates they're involved with"
ON public.warranty_claim_updates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.warranty_claims
    WHERE id = warranty_claim_updates.warranty_claim_id
    AND (client_id = auth.uid() OR contractor_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Insert default warranty types
INSERT INTO public.warranty_types (name, description, duration_days, premium_duration_days)
VALUES 
  ('Standard', 'Basic warranty coverage for all projects', 90, 180),
  ('Extended', 'Extended warranty with longer coverage period', 180, 365),
  ('Premium', 'Comprehensive warranty with priority service', 365, 730)
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;
