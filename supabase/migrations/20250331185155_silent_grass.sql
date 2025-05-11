/*
  # Set up admin user and permissions

  This migration:
  1. Creates admin check functions
  2. Creates admin user record
  3. Logs the action
  4. Grants necessary permissions
*/

-- Create or replace admin check functions with user_id parameter
CREATE OR REPLACE FUNCTION is_admin_with_id(user_id uuid)
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

-- Ensure admin_users table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    RAISE EXCEPTION 'Table admin_users does not exist';
  END IF;
END $$;

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

-- Create admin user record
INSERT INTO admin_users (
  id,
  user_id,
  role,
  is_active
)
SELECT
  gen_random_uuid(),
  'b204e4c2-ff21-4f8c-ac15-ef6da4bf42bf',
  'super_admin',
  true
WHERE EXISTS (
  SELECT 1 FROM auth.users
  WHERE id = 'b204e4c2-ff21-4f8c-ac15-ef6da4bf42bf'
);

-- Log the action
INSERT INTO admin_audit_logs (
  id,
  admin_id,
  action,
  entity_type,
  entity_id,
  changes
)
SELECT
  gen_random_uuid(),
  'b204e4c2-ff21-4f8c-ac15-ef6da4bf42bf',
  'setup_admin_user',
  'admin_users',
  'b204e4c2-ff21-4f8c-ac15-ef6da4bf42bf',
  jsonb_build_object(
    'role', 'super_admin',
    'name', 'FAIT Admin'
  )
WHERE EXISTS (
  SELECT 1 FROM auth.users
  WHERE id = 'b204e4c2-ff21-4f8c-ac15-ef6da4bf42bf'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_with_id TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;