/*
  # Add Contractor Specialties and Certifications

  1. New Tables
    - `contractor_specialties`
      - `id` (uuid, primary key)
      - `contractor_id` (uuid, references profiles)
      - `specialty` (text)
      - `years_experience` (integer)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `contractor_certifications`
      - `id` (uuid, primary key)
      - `contractor_id` (uuid, references profiles)
      - `certification_name` (text)
      - `issuing_organization` (text)
      - `issue_date` (date)
      - `expiry_date` (date, nullable)
      - `certification_number` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing specialties and certifications
*/

-- Create contractor specialty type if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contractor_specialty_type') THEN
    CREATE TYPE contractor_specialty_type AS ENUM (
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'roofing',
      'hvac',
      'landscaping',
      'masonry',
      'flooring',
      'general'
    );
  END IF;
END $$;

-- Create contractor_specialties table
CREATE TABLE contractor_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  specialty contractor_specialty_type NOT NULL,
  years_experience integer NOT NULL CHECK (years_experience >= 0),
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contractor_certifications table
CREATE TABLE contractor_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  issuing_organization text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  certification_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure expiry date is after issue date if provided
  CONSTRAINT certification_dates_check CHECK (expiry_date IS NULL OR expiry_date > issue_date)
);

-- Enable RLS
ALTER TABLE contractor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_certifications ENABLE ROW LEVEL SECURITY;

-- Create triggers for updating updated_at
CREATE TRIGGER update_contractor_specialties_updated_at
  BEFORE UPDATE ON contractor_specialties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_certifications_updated_at
  BEFORE UPDATE ON contractor_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for contractor_specialties
CREATE POLICY "Anyone can view specialties"
  ON contractor_specialties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contractors can manage their specialties"
  ON contractor_specialties
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

-- Add RLS policies for contractor_certifications
CREATE POLICY "Anyone can view certifications"
  ON contractor_certifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contractors can manage their certifications"
  ON contractor_certifications
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

-- Add more specialties to the enum type if needed
DO $$ BEGIN
  -- Check if we need to add more values to the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'contractor_specialty_type'::regtype
    AND enumlabel = 'Interior Design'
  ) THEN
    -- Add new values to the enum
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'General Contracting';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Interior Design';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Kitchen & Bath';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Basement Finishing';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Home Automation';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Solar Installation';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Windows & Doors';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Siding';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Concrete Work';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Drywall';
    ALTER TYPE contractor_specialty_type ADD VALUE IF NOT EXISTS 'Custom Cabinetry';
  END IF;
END $$;;

-- Add specialty type constraint
ALTER TABLE contractor_specialties
ADD CONSTRAINT specialty_type_check
CHECK (specialty::contractor_specialty_type IS NOT NULL);