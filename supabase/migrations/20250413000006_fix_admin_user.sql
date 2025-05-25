/*
  # Fix Admin User Creation

  This migration creates a setup_admin_user function and fixes the admin user creation.
*/

-- Create function to set up admin user
DROP FUNCTION IF EXISTS setup_admin_user;

CREATE FUNCTION setup_admin_user(
  user_id_param uuid,
  email_param text,
  full_name_param text,
  admin_role_param admin_role_type DEFAULT 'super_admin'
) RETURNS void AS $$
BEGIN
  -- Create profile if it doesn't exist
  INSERT INTO profiles (id, email, full_name, user_type)
  VALUES (user_id_param, email_param, full_name_param, 'admin')
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    user_type = 'admin';

  -- Create admin user entry if it doesn't exist
  INSERT INTO admin_users (user_id, role, is_active)
  VALUES (user_id_param, admin_role_param, true)
  ON CONFLICT (user_id) DO UPDATE
  SET
    role = EXCLUDED.role,
    is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin user if they don't exist
DO $$
DECLARE
  admin_id uuid;
  admin_email text := 'admin@itsfait.com';
  admin_name text := 'FAIT Admin';
BEGIN
  -- Check if the user exists in auth.users
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = admin_email;

  -- Only proceed if the user exists
  IF admin_id IS NOT NULL THEN
    -- Set up admin user with proper roles and profile
    PERFORM setup_admin_user(
      admin_id,
      admin_email,
      admin_name,
      'super_admin'
    );
  END IF;
END;
$$;
