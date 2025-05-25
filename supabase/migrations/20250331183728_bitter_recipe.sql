/*
  # Admin Setup Migration
  
  1. Changes
    - Create admin functions and policies
    - Add admin setup function
    
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create or replace the is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = $1 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the is_super_admin function
CREATE OR REPLACE FUNCTION is_super_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = $1 
    AND role = 'super_admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set up an admin user
CREATE OR REPLACE FUNCTION setup_admin_user(
  admin_id uuid,
  admin_email text,
  admin_name text,
  admin_role admin_role_type DEFAULT 'super_admin'
)
RETURNS void AS $$
BEGIN
  -- Create profile if it doesn't exist
  INSERT INTO profiles (
    id,
    email,
    full_name,
    user_type
  ) 
  VALUES (
    admin_id,
    admin_email,
    admin_name,
    'client'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

  -- Create admin user record if it doesn't exist
  INSERT INTO admin_users (
    user_id,
    role,
    is_active
  )
  VALUES (
    admin_id,
    admin_role,
    true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Update admin_users policies
DROP POLICY IF EXISTS "Only super admins can manage admin_users" ON admin_users;
CREATE POLICY "Only super admins can manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
CREATE POLICY "Only admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add admin-specific policies to other tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Note: After applying this migration, use the Supabase Dashboard to:
-- 1. Create the admin@itsfait.com user through Authentication
-- 2. Get the user's UUID
-- 3. Run: SELECT setup_admin_user('USER_UUID', 'admin@itsfait.com', 'FAIT Admin', 'super_admin');