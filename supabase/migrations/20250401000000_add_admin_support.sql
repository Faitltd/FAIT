/*
  Add Admin Support

  This migration:
  1. Extends the user_type in profiles table to include 'admin'
  2. Creates admin-specific policies for each table
  3. Gives admins broader access to manage data across the platform
*/

-- Modify the profiles table to include 'admin' as a valid user type
ALTER TABLE profiles
  DROP CONSTRAINT profiles_user_type_check,
  ADD CONSTRAINT profiles_user_type_check
    CHECK (user_type IN ('client', 'contractor', 'admin'));

-- Add admin policies for profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- Add admin policies for contractor_verifications
DROP POLICY IF EXISTS "Admins can view all verifications" ON contractor_verifications;

CREATE POLICY "Admins can view all verifications"
  ON contractor_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

DROP POLICY IF EXISTS "Admins can update all verifications" ON contractor_verifications;

CREATE POLICY "Admins can update all verifications"
  ON contractor_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- Add admin policies for service_packages
DROP POLICY IF EXISTS "Admins can manage all service packages" ON service_packages;

CREATE POLICY "Admins can manage all service packages"
  ON service_packages FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- Add admin policies for bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;

CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- Add admin policies for warranty_claims
DROP POLICY IF EXISTS "Admins can view all warranty claims" ON warranty_claims;

CREATE POLICY "Admins can view all warranty claims"
  ON warranty_claims FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

DROP POLICY IF EXISTS "Admins can update all warranty claims" ON warranty_claims;

CREATE POLICY "Admins can update all warranty claims"
  ON warranty_claims FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- Add admin policies for points_transactions
DROP POLICY IF EXISTS "Admins can view all points transactions" ON points_transactions;

CREATE POLICY "Admins can view all points transactions"
  ON points_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- Create a function to check if a user is an admin
DROP FUNCTION IF EXISTS is_admin_by_profile();

CREATE OR REPLACE FUNCTION is_admin_by_profile()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin@itsfait.com to be an admin
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Get the user ID for admin@itsfait.com
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@itsfait.com';

  -- Update the profile if the user exists
  IF admin_id IS NOT NULL THEN
    UPDATE profiles
    SET user_type = 'admin'
    WHERE id = admin_id;
  END IF;
END;
$$;
