/*
  # Set up initial admin user

  This migration creates a function to generate a secure password hash.
  The actual admin user creation is handled in a later migration.
*/

-- Create function to generate password hash
CREATE OR REPLACE FUNCTION generate_password_hash(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;