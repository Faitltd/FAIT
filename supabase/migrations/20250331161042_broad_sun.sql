/*
  # Add contractor portfolio and verification features

  1. New Tables
    - `contractor_portfolio_items`
      - `id` (uuid, primary key)
      - `contractor_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `image_urls` (text array)
      - `completion_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `contractor_work_history`
      - `id` (uuid, primary key)
      - `contractor_id` (uuid, references profiles)
      - `company_name` (text)
      - `position` (text)
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `contractor_references`
      - `id` (uuid, primary key)
      - `contractor_id` (uuid, references profiles)
      - `full_name` (text)
      - `company` (text)
      - `position` (text)
      - `email` (text)
      - `phone` (text)
      - `relationship` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add admin_verified and admin_verified_at to contractor_verifications
    - Add portfolio_items storage bucket

  3. Security
    - Enable RLS on all new tables
    - Add policies for contractor access
    - Add storage policies for portfolio images
*/

-- Create contractor_portfolio_items table
CREATE TABLE contractor_portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  image_urls text[] NOT NULL,
  completion_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contractor_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage their own portfolio items"
  ON contractor_portfolio_items
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Anyone can view portfolio items"
  ON contractor_portfolio_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Create contractor_work_history table
CREATE TABLE contractor_work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contractor_work_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage their own work history"
  ON contractor_work_history
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Anyone can view work history"
  ON contractor_work_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create contractor_references table
CREATE TABLE contractor_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contractor_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can manage their own references"
  ON contractor_references
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Anyone can view references"
  ON contractor_references
  FOR SELECT
  TO authenticated
  USING (true);

-- Add admin verification fields to contractor_verifications
ALTER TABLE contractor_verifications
ADD COLUMN admin_verified boolean DEFAULT false,
ADD COLUMN admin_verified_at timestamptz;

-- Create portfolio_items storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-items', 'portfolio-items', true);

-- Allow authenticated users to upload portfolio images
CREATE POLICY "Users can upload their own portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-items' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view portfolio images
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-items');

-- Allow users to update their own portfolio images
CREATE POLICY "Users can update their own portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-items' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portfolio-items' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure the update_updated_at_column function exists
DO $outer$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $inner$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $inner$ LANGUAGE plpgsql;
  END IF;
END;
$outer$;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_contractor_portfolio_items_updated_at
  BEFORE UPDATE ON contractor_portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_work_history_updated_at
  BEFORE UPDATE ON contractor_work_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_references_updated_at
  BEFORE UPDATE ON contractor_references
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();