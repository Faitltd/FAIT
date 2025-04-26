-- Initialize database schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create verification levels enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_level') THEN
        CREATE TYPE verification_level AS ENUM ('basic', 'standard', 'premium');
    END IF;
END$$;

-- Create verification status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'expired');
    END IF;
END$$;

-- Create document type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
          'identity',
          'business_license',
          'insurance',
          'certification',
          'tax_document',
          'reference',
          'portfolio',
          'background_check'
        );
    END IF;
END$$;

-- Create document status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
    END IF;
END$$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  business_name VARCHAR(255),
  user_type VARCHAR(50) NOT NULL DEFAULT 'client',
  verification_badge_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unified service_agent_verification table
CREATE TABLE IF NOT EXISTS service_agent_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  verification_level verification_level NOT NULL DEFAULT 'basic',
  verification_status verification_status NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  background_check_status TEXT,
  background_check_id TEXT,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint to ensure one verification per service agent
  CONSTRAINT unique_service_agent_verification UNIQUE (service_agent_id)
);

-- Create verification documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID REFERENCES service_agent_verification(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL,
  document_status document_status NOT NULL DEFAULT 'pending',
  document_url TEXT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_number VARCHAR(255),
  issuing_authority VARCHAR(255),
  expiration_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  verified_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create verification history table for audit trail
CREATE TABLE IF NOT EXISTS verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID REFERENCES service_agent_verification(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(50) NOT NULL,
  previous_status verification_status,
  new_status verification_status,
  notes TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create onboarding progress table to track service agent onboarding
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  current_step VARCHAR(50) NOT NULL DEFAULT 'welcome',
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint to ensure one onboarding record per service agent
  CONSTRAINT unique_service_agent_onboarding UNIQUE (service_agent_id)
);

-- Create function to update verification status based on document approvals
CREATE OR REPLACE FUNCTION update_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If all required documents are approved, update verification status to 'in_review'
  IF (
    SELECT COUNT(*) FROM verification_documents
    WHERE verification_id = NEW.verification_id
    AND document_status = 'pending'
  ) = 0 THEN
    UPDATE service_agent_verification
    SET verification_status = 'in_review',
        updated_at = NOW()
    WHERE id = NEW.verification_id
    AND verification_status = 'pending';
    
    -- Add to verification history
    INSERT INTO verification_history (
      verification_id,
      action,
      previous_status,
      new_status,
      notes,
      performed_by
    ) VALUES (
      NEW.verification_id,
      'documents_approved',
      'pending',
      'in_review',
      'All required documents have been approved',
      NEW.verified_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document status changes
DROP TRIGGER IF EXISTS verification_document_status_change ON verification_documents;
CREATE TRIGGER verification_document_status_change
AFTER UPDATE OF document_status ON verification_documents
FOR EACH ROW
WHEN (OLD.document_status != NEW.document_status)
EXECUTE FUNCTION update_verification_status();

-- Create function to approve verification
CREATE OR REPLACE FUNCTION approve_verification(
  verification_id UUID,
  admin_id UUID,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_status verification_status;
  v_expiration_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current status
  SELECT verification_status INTO v_status
  FROM service_agent_verification
  WHERE id = verification_id;
  
  -- Check if verification can be approved
  IF v_status != 'in_review' AND v_status != 'pending' THEN
    RAISE EXCEPTION 'Verification cannot be approved from status: %', v_status;
  END IF;
  
  -- Set expiration date (1 year from now)
  v_expiration_date := NOW() + INTERVAL '1 year';
  
  -- Update verification status
  UPDATE service_agent_verification
  SET verification_status = 'approved',
      is_verified = true,
      verification_date = NOW(),
      expiration_date = v_expiration_date,
      verified_by = admin_id,
      updated_at = NOW()
  WHERE id = verification_id;
  
  -- Add to verification history
  INSERT INTO verification_history (
    verification_id,
    action,
    previous_status,
    new_status,
    notes,
    performed_by
  ) VALUES (
    verification_id,
    'approved',
    v_status,
    'approved',
    admin_notes,
    admin_id
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Create function to reject verification
CREATE OR REPLACE FUNCTION reject_verification(
  verification_id UUID,
  admin_id UUID,
  rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_status verification_status;
BEGIN
  -- Get current status
  SELECT verification_status INTO v_status
  FROM service_agent_verification
  WHERE id = verification_id;
  
  -- Check if verification can be rejected
  IF v_status != 'in_review' AND v_status != 'pending' THEN
    RAISE EXCEPTION 'Verification cannot be rejected from status: %', v_status;
  END IF;
  
  -- Update verification status
  UPDATE service_agent_verification
  SET verification_status = 'rejected',
      is_verified = false,
      rejection_reason = rejection_reason,
      verified_by = admin_id,
      updated_at = NOW()
  WHERE id = verification_id;
  
  -- Add to verification history
  INSERT INTO verification_history (
    verification_id,
    action,
    previous_status,
    new_status,
    notes,
    performed_by
  ) VALUES (
    verification_id,
    'rejected',
    v_status,
    'rejected',
    rejection_reason,
    admin_id
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Create function to get verification stats
CREATE OR REPLACE FUNCTION get_verification_stats()
RETURNS TABLE (
  pending_count BIGINT,
  in_review_count BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT,
  expired_count BIGINT,
  average_time_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE verification_status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE verification_status = 'in_review') AS in_review_count,
    COUNT(*) FILTER (WHERE verification_status = 'approved') AS approved_count,
    COUNT(*) FILTER (WHERE verification_status = 'rejected') AS rejected_count,
    COUNT(*) FILTER (WHERE verification_status = 'expired') AS expired_count,
    AVG(
      EXTRACT(EPOCH FROM (verification_date - created_at)) / 3600
    ) FILTER (WHERE verification_status = 'approved') AS average_time_hours
  FROM service_agent_verification;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if verification is expired
CREATE OR REPLACE FUNCTION check_verification_expiration()
RETURNS VOID AS $$
BEGIN
  UPDATE service_agent_verification
  SET verification_status = 'expired',
      is_verified = false,
      updated_at = NOW()
  WHERE verification_status = 'approved'
    AND expiration_date < NOW();
    
  -- Add to verification history
  INSERT INTO verification_history (
    verification_id,
    action,
    previous_status,
    new_status,
    notes
  )
  SELECT
    id,
    'expired',
    'approved',
    'expired',
    'Verification expired automatically'
  FROM service_agent_verification
  WHERE verification_status = 'expired'
    AND updated_at >= NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;
