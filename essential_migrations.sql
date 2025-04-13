/*
  # Essential Platform Updates for FAIT Co-Op
  
  This is a simplified version of the migrations that focuses on the most important changes
  and avoids problematic triggers.
*/

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Create service_agent_portfolio_items table
CREATE TABLE IF NOT EXISTS service_agent_portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on service_agent_portfolio_items table
ALTER TABLE service_agent_portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create policies for service_agent_portfolio_items
CREATE POLICY "Anyone can view portfolio items"
  ON service_agent_portfolio_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service agents can insert their own portfolio items"
  ON service_agent_portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own portfolio items"
  ON service_agent_portfolio_items FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own portfolio items"
  ON service_agent_portfolio_items FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Add photo_urls to warranty_claims table
ALTER TABLE warranty_claims
ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

-- Create storage bucket for warranty photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('warranty_photos', 'warranty_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for warranty photos
CREATE POLICY "Users can upload warranty photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'warranty_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view warranty photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'warranty_photos');

-- Create service_agent_work_history table
CREATE TABLE IF NOT EXISTS service_agent_work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on service_agent_work_history table
ALTER TABLE service_agent_work_history ENABLE ROW LEVEL SECURITY;

-- Create policies for service_agent_work_history
CREATE POLICY "Anyone can view work history"
  ON service_agent_work_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service agents can insert their own work history"
  ON service_agent_work_history FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own work history"
  ON service_agent_work_history FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own work history"
  ON service_agent_work_history FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Create service_agent_references table
CREATE TABLE IF NOT EXISTS service_agent_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on service_agent_references table
ALTER TABLE service_agent_references ENABLE ROW LEVEL SECURITY;

-- Create policies for service_agent_references
CREATE POLICY "Service agents can view their own references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (service_agent_id = auth.uid());

CREATE POLICY "Service agents can insert their own references"
  ON service_agent_references FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own references"
  ON service_agent_references FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own references"
  ON service_agent_references FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Update user_type in profiles
UPDATE profiles 
SET user_type = 'service_agent' 
WHERE user_type = 'contractor';

-- Rename columns in external_reviews if the table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'external_reviews'
  ) AND EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'external_reviews' 
    AND column_name = 'contractor_id'
  ) THEN
    ALTER TABLE external_reviews RENAME COLUMN contractor_id TO service_agent_id;
  END IF;
END $$;
