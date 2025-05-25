/*
  # Add service areas management

  1. New Tables
    - `contractor_service_areas`
      - `id` (uuid, primary key)
      - `contractor_id` (uuid, references profiles)
      - `zip_code` (text)
      - `radius_miles` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `contractor_service_areas` table
    - Add policies for contractors to manage their service areas
    - Allow authenticated users to view service areas
*/

-- Create contractor_service_areas table
CREATE TABLE contractor_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  zip_code text NOT NULL,
  radius_miles integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contractor_id, zip_code)
);

-- Enable RLS
ALTER TABLE contractor_service_areas ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_contractor_service_areas_updated_at
  BEFORE UPDATE ON contractor_service_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
CREATE POLICY "Anyone can view service areas"
  ON contractor_service_areas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contractors can manage their service areas"
  ON contractor_service_areas
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());