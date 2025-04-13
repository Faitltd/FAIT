/*

  # Initial Schema Setup for FAIT Co-Op

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user information
      - Stores user type (client/contractor) and profile data
    - `contractor_verifications`
      - Tracks contractor vetting process
      - Stores document URLs and verification status
    - `service_packages`
      - Defines fixed-price service offerings
      - Links to contractor profiles
    - `bookings`
      - Stores service booking information
      - Links clients, contractors, and service packages
    - `warranty_claims`
      - Tracks warranty claims and their status
    - `points_transactions`
      - Records point earnings and current balances

  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control
    - Ensure data privacy between users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('client', 'contractor')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (current_setting('request.jwt.claim.sub')::uuid = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create contractor_verifications table
CREATE TABLE IF NOT EXISTS contractor_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text,
  license_type text,
  license_expiry date,
  insurance_provider text,
  insurance_expiry date,
  background_check_status text DEFAULT 'pending',
  background_check_date timestamptz,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to validate contractor type
CREATE OR REPLACE FUNCTION check_contractor_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = NEW.contractor_id AND user_type = 'contractor'
  ) THEN
    RAISE EXCEPTION 'Contractor verification can only be created for users with contractor type';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce contractor type check
CREATE TRIGGER ensure_contractor_type
  BEFORE INSERT OR UPDATE ON contractor_verifications
  FOR EACH ROW
  EXECUTE FUNCTION check_contractor_type();

ALTER TABLE contractor_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own verification"
  ON contractor_verifications FOR SELECT
  TO authenticated
  USING (contractor_id = current_setting('request.jwt.claim.sub')::uuid);

-- Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price decimal NOT NULL,
  duration interval,
  scope text[] NOT NULL,
  exclusions text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active service packages"
  ON service_packages FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Contractors can manage own packages"
  ON service_packages FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid());

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id),
  service_package_id uuid REFERENCES service_packages(id),
  scheduled_date timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_amount decimal NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM service_packages
      WHERE service_packages.id = service_package_id
      AND service_packages.contractor_id = auth.uid()
    )
  );

-- Create warranty_claims table
CREATE TABLE IF NOT EXISTS warranty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  client_id uuid REFERENCES profiles(id),
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'resolved')),
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warranty claims"
  ON warranty_claims FOR SELECT
  TO authenticated
  USING (client_id = current_setting('request.jwt.claim.sub')::uuid);

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  points_amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
  description text NOT NULL,
  booking_id uuid REFERENCES bookings(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points transactions"
  ON points_transactions FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claim.sub')::uuid);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_verifications_updated_at
  BEFORE UPDATE ON contractor_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_packages_updated_at
  BEFORE UPDATE ON service_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_claims_updated_at
  BEFORE UPDATE ON warranty_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();