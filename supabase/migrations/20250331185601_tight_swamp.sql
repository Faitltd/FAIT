/*
  # Additional Admin Functions

  This migration adds additional admin functions for email-based checks.
  The admin_users and admin_audit_logs tables are already created in previous migrations.
*/

-- Create is_admin_by_email function
CREATE OR REPLACE FUNCTION is_admin_by_email(user_email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM admin_users au
        JOIN auth.users u ON au.user_id = u.id
        WHERE u.email = user_email
        AND au.is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- Create is_super_admin_by_email function
CREATE OR REPLACE FUNCTION is_super_admin_by_email(user_email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM admin_users au
        JOIN auth.users u ON au.user_id = u.id
        WHERE u.email = user_email
        AND au.role = 'super_admin'
        AND au.is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_audit_logs TO authenticated;
