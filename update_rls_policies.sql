-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view availability" ON contractor_availability;
DROP POLICY IF EXISTS "Anyone can insert availability" ON contractor_availability;
DROP POLICY IF EXISTS "Anyone can update availability" ON contractor_availability;
DROP POLICY IF EXISTS "Anyone can delete availability" ON contractor_availability;

-- Create more secure policies
CREATE POLICY "Users can view own availability"
  ON contractor_availability FOR SELECT
  USING (contractor_id = auth.uid());

CREATE POLICY "Users can insert own availability"
  ON contractor_availability FOR INSERT
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Users can update own availability"
  ON contractor_availability FOR UPDATE
  USING (contractor_id = auth.uid());

CREATE POLICY "Users can delete own availability"
  ON contractor_availability FOR DELETE
  USING (contractor_id = auth.uid());
