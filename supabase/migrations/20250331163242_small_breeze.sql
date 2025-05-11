/*
  # Service Areas Migration

  1. Changes
    - Safely handle existing contractor_service_areas table
    - Add RLS policies if they don't exist
    - Add trigger if it doesn't exist

  2. Security
    - Enable RLS
    - Add policies for viewing and managing service areas
*/

-- Check and create trigger function if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger
    WHERE tgname = 'update_contractor_service_areas_updated_at'
  ) THEN
    CREATE TRIGGER update_contractor_service_areas_updated_at
      BEFORE UPDATE ON contractor_service_areas
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE contractor_service_areas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view service areas" ON contractor_service_areas;
  DROP POLICY IF EXISTS "Contractors can manage their service areas" ON contractor_service_areas;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
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