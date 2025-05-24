-- Client Verifications Table
CREATE TABLE client_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('not_started', 'in_progress', 'pending_review', 'approved', 'rejected', 'expired')),
  id_document_url TEXT,
  address_document_url TEXT,
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  reviewer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_client_verifications_user_id ON client_verifications(user_id);

-- Add RLS policies
ALTER TABLE client_verifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own verification records
CREATE POLICY "Users can view their own verification records"
  ON client_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own verification records
CREATE POLICY "Users can insert their own verification records"
  ON client_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own verification records that are in progress
CREATE POLICY "Users can update their own in-progress verification records"
  ON client_verifications
  FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('in_progress'))
  WITH CHECK (auth.uid() = user_id AND status IN ('in_progress', 'pending_review'));

-- Policy for admins to view all verification records
CREATE POLICY "Admins can view all verification records"
  ON client_verifications
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Policy for admins to update verification records
CREATE POLICY "Admins can update verification records"
  ON client_verifications
  FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_client_verifications_updated_at
BEFORE UPDATE ON client_verifications
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create a storage bucket for verification documents
-- Note: This would typically be done through the Supabase dashboard or API
-- INSERT INTO storage.buckets (id, name) VALUES ('verification_documents', 'Verification Documents');

-- Set up storage policies for the verification documents bucket
-- Note: This would typically be done through the Supabase dashboard or API
/*
CREATE POLICY "Users can upload their own verification documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'verification_documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own verification documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'verification_documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all verification documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'verification_documents' AND
    auth.uid() IN (SELECT user_id FROM admin_users)
  );
*/
