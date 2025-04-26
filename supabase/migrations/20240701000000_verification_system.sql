-- Verification System Migration

-- Add verification_status to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_review, approved, rejected, expired
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_date TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_request_id UUID REFERENCES verification_requests(id) NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- license, insurance, certification, identity, business, other
  document_url TEXT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create function to update timestamp on verification_requests
CREATE OR REPLACE FUNCTION update_verification_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_verification_request_timestamp
BEFORE UPDATE ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_verification_request_timestamp();

-- Create function to approve verification request
CREATE OR REPLACE FUNCTION approve_verification_request(
  p_request_id UUID,
  p_admin_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update the verification request
  UPDATE verification_requests
  SET 
    status = 'approved',
    review_date = NOW(),
    reviewed_by = p_admin_id,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Update the user's profile
  UPDATE profiles
  SET 
    verification_status = 'approved',
    verification_date = NOW()
  FROM verification_requests
  WHERE verification_requests.id = p_request_id
    AND profiles.id = verification_requests.user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to reject verification request
CREATE OR REPLACE FUNCTION reject_verification_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update the verification request
  UPDATE verification_requests
  SET 
    status = 'rejected',
    review_date = NOW(),
    reviewed_by = p_admin_id,
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Update the user's profile
  UPDATE profiles
  SET 
    verification_status = 'rejected'
  FROM verification_requests
  WHERE verification_requests.id = p_request_id
    AND profiles.id = verification_requests.user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get verification stats
CREATE OR REPLACE FUNCTION get_verification_stats()
RETURNS TABLE (
  total_requests BIGINT,
  approved_requests BIGINT,
  pending_requests BIGINT,
  rejected_requests BIGINT,
  average_approval_time FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_requests,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT AS approved_requests,
    COUNT(*) FILTER (WHERE status IN ('pending', 'in_review'))::BIGINT AS pending_requests,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT AS rejected_requests,
    EXTRACT(EPOCH FROM AVG(review_date - request_date) FILTER (WHERE status = 'approved')) / 3600 AS average_approval_time
  FROM verification_requests;
END;
$$ LANGUAGE plpgsql;

-- Set up RLS policies
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification requests"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update verification requests"
  ON verification_requests FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    ) OR 
    (auth.uid() = user_id AND status = 'pending')
  );

CREATE POLICY "Admins can view all verification requests"
  ON verification_requests FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Document policies
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification documents"
  ON verification_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_documents.verification_request_id
      AND verification_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own verification documents"
  ON verification_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_request_id
      AND verification_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all verification documents"
  ON verification_documents FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Storage policies
CREATE POLICY "Users can upload their own verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() = (
      SELECT user_id FROM verification_requests
      WHERE id::text = (string_to_array(path, '/')[1])::uuid
    )
  );

CREATE POLICY "Users can view their own verification documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (
      auth.uid() = (
        SELECT user_id FROM verification_requests
        WHERE id::text = (string_to_array(path, '/')[1])::uuid
      ) OR
      auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_request_id ON verification_documents(verification_request_id);
