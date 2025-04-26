-- Migration for Contractor Verification and Onboarding System

-- Create verification levels enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_level') THEN
        CREATE TYPE verification_level AS ENUM ('basic', 'standard', 'premium');
    END IF;
END$$;

-- Create verification status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'expired');
    END IF;
END$$;

-- Create document type enum if it doesn't exist
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

-- Create document status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
    END IF;
END$$;

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

-- Add verification badge field to profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'verification_badge_visible'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN verification_badge_visible BOOLEAN DEFAULT true;
    END IF;
END$$;

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

-- Create trigger for document status changes if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'verification_document_status_change'
    ) THEN
        CREATE TRIGGER verification_document_status_change
        AFTER UPDATE OF document_status ON verification_documents
        FOR EACH ROW
        WHEN (OLD.document_status != NEW.document_status)
        EXECUTE FUNCTION update_verification_status();
    END IF;
END$$;

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

-- Create RLS policies for verification tables
ALTER TABLE service_agent_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Service agents can view their own verification
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'service_agent_verification'
        AND policyname = 'service_agent_view_own_verification'
    ) THEN
        CREATE POLICY service_agent_view_own_verification ON service_agent_verification
          FOR SELECT
          USING (service_agent_id = auth.uid());
    END IF;
END$$;

-- Service agents can insert their own verification
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'service_agent_verification'
        AND policyname = 'service_agent_insert_own_verification'
    ) THEN
        CREATE POLICY service_agent_insert_own_verification ON service_agent_verification
          FOR INSERT
          WITH CHECK (service_agent_id = auth.uid());
    END IF;
END$$;

-- Service agents can view their own documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'verification_documents'
        AND policyname = 'service_agent_view_own_documents'
    ) THEN
        CREATE POLICY service_agent_view_own_documents ON verification_documents
          FOR SELECT
          USING (verification_id IN (
            SELECT id FROM service_agent_verification WHERE service_agent_id = auth.uid()
          ));
    END IF;
END$$;

-- Service agents can insert their own documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'verification_documents'
        AND policyname = 'service_agent_insert_own_documents'
    ) THEN
        CREATE POLICY service_agent_insert_own_documents ON verification_documents
          FOR INSERT
          WITH CHECK (verification_id IN (
            SELECT id FROM service_agent_verification WHERE service_agent_id = auth.uid()
          ));
    END IF;
END$$;

-- Service agents can view their own verification history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'verification_history'
        AND policyname = 'service_agent_view_own_history'
    ) THEN
        CREATE POLICY service_agent_view_own_history ON verification_history
          FOR SELECT
          USING (verification_id IN (
            SELECT id FROM service_agent_verification WHERE service_agent_id = auth.uid()
          ));
    END IF;
END$$;

-- Service agents can view their own onboarding progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'onboarding_progress'
        AND policyname = 'service_agent_view_own_onboarding'
    ) THEN
        CREATE POLICY service_agent_view_own_onboarding ON onboarding_progress
          FOR SELECT
          USING (service_agent_id = auth.uid());
    END IF;
END$$;

-- Service agents can update their own onboarding progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'onboarding_progress'
        AND policyname = 'service_agent_update_own_onboarding'
    ) THEN
        CREATE POLICY service_agent_update_own_onboarding ON onboarding_progress
          FOR UPDATE
          USING (service_agent_id = auth.uid())
          WITH CHECK (service_agent_id = auth.uid());
    END IF;
END$$;

-- Service agents can insert their own onboarding progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'onboarding_progress'
        AND policyname = 'service_agent_insert_own_onboarding'
    ) THEN
        CREATE POLICY service_agent_insert_own_onboarding ON onboarding_progress
          FOR INSERT
          WITH CHECK (service_agent_id = auth.uid());
    END IF;
END$$;

-- Admins can view all verifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'service_agent_verification'
        AND policyname = 'admin_view_all_verifications'
    ) THEN
        CREATE POLICY admin_view_all_verifications ON service_agent_verification
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
    END IF;
END$$;

-- Admins can update all verifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'service_agent_verification'
        AND policyname = 'admin_update_all_verifications'
    ) THEN
        CREATE POLICY admin_update_all_verifications ON service_agent_verification
          FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
    END IF;
END$$;

-- Admins can view all documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'verification_documents'
        AND policyname = 'admin_view_all_documents'
    ) THEN
        CREATE POLICY admin_view_all_documents ON verification_documents
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
    END IF;
END$$;

-- Admins can update all documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'verification_documents'
        AND policyname = 'admin_update_all_documents'
    ) THEN
        CREATE POLICY admin_update_all_documents ON verification_documents
          FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
    END IF;
END$$;

-- Admins can view all verification history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'verification_history'
        AND policyname = 'admin_view_all_history'
    ) THEN
        CREATE POLICY admin_view_all_history ON verification_history
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
    END IF;
END$$;

-- Admins can insert verification history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'verification_history'
        AND policyname = 'admin_insert_history'
    ) THEN
        CREATE POLICY admin_insert_history ON verification_history
          FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
    END IF;
END$$;

-- Admins can view all onboarding progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'onboarding_progress'
        AND policyname = 'admin_view_all_onboarding'
    ) THEN
        CREATE POLICY admin_view_all_onboarding ON onboarding_progress
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
    END IF;
END$$;

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

-- Create a scheduled job to check for expired verifications daily
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        SELECT cron.schedule(
          'check-verification-expiration',
          '0 0 * * *', -- Run at midnight every day
          'SELECT check_verification_expiration()'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron extension not available, skipping scheduled job creation';
END$$;

-- Create storage bucket for verification documents if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'storage'
        AND table_name = 'buckets'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('verification_documents', 'Verification Documents', false)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END$$;

-- Set up storage policies for verification documents
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'storage'
        AND table_name = 'objects'
    ) THEN
        BEGIN
            CREATE POLICY "Service agents can upload their own documents" ON storage.objects
              FOR INSERT
              TO authenticated
              WITH CHECK (
                bucket_id = 'verification_documents' AND
                (storage.foldername(name))[1] = auth.uid()::text
              );
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Policy "Service agents can upload their own documents" already exists';
        END;
        
        BEGIN
            CREATE POLICY "Service agents can view their own documents" ON storage.objects
              FOR SELECT
              TO authenticated
              USING (
                bucket_id = 'verification_documents' AND
                (storage.foldername(name))[1] = auth.uid()::text
              );
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Policy "Service agents can view their own documents" already exists';
        END;
        
        BEGIN
            CREATE POLICY "Admins can view all verification documents" ON storage.objects
              FOR SELECT
              TO authenticated
              USING (
                bucket_id = 'verification_documents' AND
                EXISTS (
                  SELECT 1 FROM profiles
                  WHERE id = auth.uid() AND user_type = 'admin'
                )
              );
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Policy "Admins can view all verification documents" already exists';
        END;
    END IF;
END$$;
