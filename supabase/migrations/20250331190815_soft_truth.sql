/*
  # Admin Functions Migration

  1. Grant necessary permissions for existing admin functions
*/

-- Grant permissions for existing admin functions

-- Example usage
CREATE OR REPLACE FUNCTION check_admin_status(check_id uuid)
RETURNS TABLE (
  admin_status boolean,
  super_admin_status boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    is_admin_with_id(check_id) AS admin_status,
    is_super_admin(check_id) AS super_admin_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_with_id TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_status TO authenticated;