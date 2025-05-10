/*
  Member Ledger & Governance Migration
  
  This migration adds tables and functions needed for the Member Ledger & Governance module:
  
  1. Adds governance_roles table for role management
  2. Adds dividend_eligibility table for tracking dividend eligibility
  3. Adds bylaws_versions table for storing bylaws versions
  4. Adds bylaws_acknowledgments table for tracking acknowledgments
*/

-- Start transaction
BEGIN;

-- Create governance_roles table
CREATE TABLE IF NOT EXISTS public.governance_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member_roles table to associate members with governance roles
CREATE TABLE IF NOT EXISTS public.member_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.governance_roles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, role_id, start_date)
);

-- Create dividend_eligibility table
CREATE TABLE IF NOT EXISTS public.dividend_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  eligibility_date DATE NOT NULL DEFAULT CURRENT_DATE,
  eligibility_status VARCHAR(50) NOT NULL CHECK (eligibility_status IN ('eligible', 'ineligible', 'pending')),
  shares INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dividend_distributions table
CREATE TABLE IF NOT EXISTS public.dividend_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(12, 2) NOT NULL,
  distribution_status VARCHAR(50) NOT NULL CHECK (distribution_status IN ('pending', 'approved', 'distributed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dividend_payments table
CREATE TABLE IF NOT EXISTS public.dividend_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distribution_id UUID NOT NULL REFERENCES public.dividend_distributions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bylaws_versions table
CREATE TABLE IF NOT EXISTS public.bylaws_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bylaws_acknowledgments table
CREATE TABLE IF NOT EXISTS public.bylaws_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bylaws_version_id UUID NOT NULL REFERENCES public.bylaws_versions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bylaws_version_id, member_id)
);

-- Function to check if a member has a specific governance role
CREATE OR REPLACE FUNCTION has_governance_role(member_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_role BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.member_roles mr
    JOIN public.governance_roles gr ON mr.role_id = gr.id
    WHERE mr.member_id = $1
    AND gr.name = $2
    AND mr.is_active = TRUE
    AND (mr.end_date IS NULL OR mr.end_date >= CURRENT_DATE)
  ) INTO has_role;
  
  RETURN has_role;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate dividend shares for a member
CREATE OR REPLACE FUNCTION calculate_dividend_shares(member_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_shares INTEGER := 0;
  member_tenure INTEGER;
  completed_projects INTEGER;
  governance_role_count INTEGER;
BEGIN
  -- Calculate tenure in months
  SELECT EXTRACT(YEAR FROM AGE(NOW(), created_at)) * 12 +
         EXTRACT(MONTH FROM AGE(NOW(), created_at))
  INTO member_tenure
  FROM public.profiles
  WHERE id = member_id;
  
  -- Count completed projects
  SELECT COUNT(*)
  INTO completed_projects
  FROM public.projects
  WHERE contractor_id = member_id AND status = 'completed';
  
  -- Count active governance roles
  SELECT COUNT(*)
  INTO governance_role_count
  FROM public.member_roles
  WHERE member_id = member_id AND is_active = TRUE;
  
  -- Calculate shares based on tenure, projects, and roles
  -- This is a simple formula that can be adjusted as needed
  total_shares := (member_tenure * 1) + (completed_projects * 5) + (governance_role_count * 10);
  
  RETURN total_shares;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a member has acknowledged the latest bylaws
CREATE OR REPLACE FUNCTION has_acknowledged_latest_bylaws(member_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  latest_version_id UUID;
  has_acknowledged BOOLEAN;
BEGIN
  -- Get the latest active bylaws version
  SELECT id INTO latest_version_id
  FROM public.bylaws_versions
  WHERE is_active = TRUE
  ORDER BY effective_date DESC
  LIMIT 1;
  
  -- Check if the member has acknowledged this version
  IF latest_version_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT EXISTS (
    SELECT 1
    FROM public.bylaws_acknowledgments
    WHERE bylaws_version_id = latest_version_id
    AND member_id = $1
  ) INTO has_acknowledged;
  
  RETURN has_acknowledged;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE public.governance_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bylaws_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bylaws_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Governance roles policies
CREATE POLICY "Admins can manage governance roles"
ON public.governance_roles
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Everyone can view governance roles"
ON public.governance_roles FOR SELECT
USING (true);

-- Member roles policies
CREATE POLICY "Admins can manage member roles"
ON public.member_roles
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Members can view their own roles"
ON public.member_roles FOR SELECT
USING (
  member_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Dividend eligibility policies
CREATE POLICY "Admins can manage dividend eligibility"
ON public.dividend_eligibility
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Members can view their own dividend eligibility"
ON public.dividend_eligibility FOR SELECT
USING (
  member_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Dividend distributions policies
CREATE POLICY "Admins can manage dividend distributions"
ON public.dividend_distributions
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Everyone can view dividend distributions"
ON public.dividend_distributions FOR SELECT
USING (true);

-- Dividend payments policies
CREATE POLICY "Admins can manage dividend payments"
ON public.dividend_payments
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Members can view their own dividend payments"
ON public.dividend_payments FOR SELECT
USING (
  member_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Bylaws versions policies
CREATE POLICY "Admins can manage bylaws versions"
ON public.bylaws_versions
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Everyone can view active bylaws versions"
ON public.bylaws_versions FOR SELECT
USING (
  is_active = TRUE OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Bylaws acknowledgments policies
CREATE POLICY "Admins can view all bylaws acknowledgments"
ON public.bylaws_acknowledgments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Members can view their own bylaws acknowledgments"
ON public.bylaws_acknowledgments FOR SELECT
USING (
  member_id = auth.uid()
);

CREATE POLICY "Members can create their own bylaws acknowledgments"
ON public.bylaws_acknowledgments FOR INSERT
WITH CHECK (
  member_id = auth.uid()
);

-- Insert default governance roles
INSERT INTO public.governance_roles (name, description, permissions)
VALUES 
  ('Board Member', 'Member of the Board of Directors', '{"can_vote": true, "can_approve_dividends": true, "can_modify_bylaws": true}'),
  ('Committee Chair', 'Chair of a committee', '{"can_vote": true, "can_create_committees": true}'),
  ('Regular Member', 'Regular cooperative member', '{"can_vote": true}')
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;
