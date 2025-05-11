/*
  # Add contractor availability management

  1. New Tables
    - `contractor_availability`
      - Stores contractor's available time slots
      - Links to contractor profiles
      - Tracks recurring and one-time availability

  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control
*/

-- Create contractor_availability table
CREATE TABLE IF NOT EXISTS contractor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week integer, -- 0-6 for Sunday-Saturday, NULL for one-time availability
  start_time time NOT NULL,
  end_time time NOT NULL,
  start_date date, -- For one-time availability
  end_date date, -- For one-time availability
  is_recurring boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure either day_of_week (recurring) or start_date/end_date (one-time) is set
  CONSTRAINT availability_type_check CHECK (
    (is_recurring = true AND day_of_week IS NOT NULL AND start_date IS NULL AND end_date IS NULL) OR
    (is_recurring = false AND day_of_week IS NULL AND start_date IS NOT NULL)
  )
);

-- Add index for faster queries
CREATE INDEX contractor_availability_contractor_id_idx ON contractor_availability(contractor_id);

-- Enable RLS
ALTER TABLE contractor_availability ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Contractors can manage their own availability"
  ON contractor_availability
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Anyone can view contractor availability"
  ON contractor_availability
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_contractor_availability_updated_at
  BEFORE UPDATE ON contractor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();