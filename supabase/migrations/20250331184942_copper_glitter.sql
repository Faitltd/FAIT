-- Create or replace the setup_admin_user function with proper error handling
-- Ensure the admin_role_type enum exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_type') THEN
    CREATE TYPE admin_role_type AS ENUM ('super_admin', 'admin', 'moderator');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION setup_admin_user(
  admin_id uuid,
  admin_email text,
  admin_name text,
  admin_role admin_role_type DEFAULT 'super_admin'
)
RETURNS void AS $$
BEGIN
  -- Validate inputs
  IF admin_id IS NULL OR admin_email IS NULL OR admin_name IS NULL THEN
    RAISE EXCEPTION 'All parameters must be provided';
  END IF;

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

  -- Log the action
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    admin_id,
    'setup_admin_user',
    'admin_users',
    admin_id,
    jsonb_build_object(
      'email', admin_email,
      'role', admin_role,
      'name', admin_name
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION setup_admin_user TO authenticated;

-- Add comment explaining usage
COMMENT ON FUNCTION setup_admin_user IS 'Sets up an admin user with the given parameters. Requires the user to already exist in auth.users.';