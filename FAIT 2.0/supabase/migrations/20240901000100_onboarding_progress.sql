-- Add onboarding progress tracking

-- Start transaction
BEGIN;

-- Create onboarding steps table
CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  user_role VARCHAR(50) NOT NULL DEFAULT 'all' 
    CHECK (user_role IN ('all', 'client', 'contractor', 'admin', 'ally')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user onboarding progress table
CREATE TABLE IF NOT EXISTS public.user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.onboarding_steps(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, step_id)
);

-- Add onboarding_completed field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add RLS policies
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policy for viewing onboarding steps
CREATE POLICY "Anyone can view onboarding steps"
ON public.onboarding_steps FOR SELECT
TO authenticated
USING (true);

-- Policy for viewing user onboarding progress
CREATE POLICY "Users can view their own onboarding progress"
ON public.user_onboarding_progress FOR SELECT
USING (user_id = auth.uid());

-- Policy for updating user onboarding progress
CREATE POLICY "Users can update their own onboarding progress"
ON public.user_onboarding_progress FOR UPDATE
USING (user_id = auth.uid());

-- Policy for inserting user onboarding progress
CREATE POLICY "Users can insert their own onboarding progress"
ON public.user_onboarding_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create function to update profile when all required onboarding steps are completed
CREATE OR REPLACE FUNCTION update_onboarding_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_required INTEGER;
  completed_required INTEGER;
BEGIN
  -- Count total required steps for the user's role
  SELECT COUNT(*) INTO total_required
  FROM public.onboarding_steps s
  JOIN public.profiles p ON auth.uid() = p.id
  WHERE s.required = true
  AND (s.user_role = 'all' OR s.user_role = p.user_role);
  
  -- Count completed required steps for the user
  SELECT COUNT(*) INTO completed_required
  FROM public.user_onboarding_progress p
  JOIN public.onboarding_steps s ON p.step_id = s.id
  WHERE p.user_id = NEW.user_id
  AND p.completed = true
  AND s.required = true;
  
  -- If all required steps are completed, update the profile
  IF completed_required >= total_required THEN
    UPDATE public.profiles
    SET 
      onboarding_completed = true,
      onboarding_completed_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update onboarding completion
CREATE TRIGGER update_onboarding_completion_trigger
AFTER INSERT OR UPDATE ON public.user_onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION update_onboarding_completion();

-- Insert default onboarding steps
INSERT INTO public.onboarding_steps (name, description, order_index, required, user_role)
VALUES
  ('Create Account', 'Sign up for a FAIT Co-op account', 1, true, 'all'),
  ('Complete Profile', 'Fill out your personal information', 2, true, 'all'),
  ('Verify Email', 'Verify your email address', 3, true, 'all'),
  ('Add Profile Photo', 'Upload a profile photo', 4, false, 'all'),
  ('Add Payment Method', 'Add a payment method for transactions', 5, true, 'client'),
  ('Verify Identity', 'Complete identity verification', 6, true, 'contractor'),
  ('Upload License', 'Upload professional license information', 7, true, 'contractor'),
  ('Add Insurance', 'Add insurance information', 8, true, 'contractor'),
  ('Create Service Listings', 'Create your service listings', 9, true, 'contractor'),
  ('Set Availability', 'Set your availability calendar', 10, true, 'contractor'),
  ('Sign Membership Agreement', 'Review and sign membership agreement', 11, true, 'all'),
  ('Complete Orientation', 'Complete the orientation process', 12, true, 'all')
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;
