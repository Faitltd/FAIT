/*
  # Add service package reviews relation

  1. Changes
    - Add service_package_id column to reviews table
    - Add foreign key constraint to link reviews to service packages
    - Update RLS policies to reflect the new relationship

  2. Security
    - Maintain existing RLS policies
    - Add service package relationship checks
*/

-- Add service_package_id column to reviews table
-- Ensure the service_packages table and id column exist before adding the foreign key
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_packages') THEN
    RAISE EXCEPTION 'Table service_packages does not exist';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_packages' AND column_name = 'id') THEN
    RAISE EXCEPTION 'Column id does not exist in service_packages';
  END IF;
END $$;

ALTER TABLE reviews
ADD COLUMN service_package_id uuid REFERENCES service_packages(id) ON DELETE CASCADE;

-- Update existing reviews to link to service packages through bookings
UPDATE reviews r
SET service_package_id = b.service_package_id
FROM bookings b
WHERE r.booking_id = b.id;

-- Add NOT NULL constraint after data migration
ALTER TABLE reviews
ALTER COLUMN service_package_id SET NOT NULL;

-- Update RLS policies to include service package checks
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;

CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Clients can create reviews" ON reviews;

CREATE POLICY "Clients can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.client_id = auth.uid()
      AND bookings.status = 'completed'
      AND bookings.service_package_id = reviews.service_package_id
    )
  );

DROP POLICY IF EXISTS "Clients can update their own reviews" ON reviews;
CREATE POLICY "Clients can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());