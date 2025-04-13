-- Add policies for admin users to manage reviews

-- Assuming you have a way to identify admins (e.g., via a role in profiles table or a separate admins table)
-- Option 1: If you have an is_admin column in the profiles table
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Option 2: If you have a separate admin_users table
-- CREATE POLICY "Admins can manage all reviews"
--   ON reviews
--   FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM admin_users
--       WHERE admin_users.user_id = auth.uid()
--     )
--   );

-- Option 3: If you're using Supabase service roles for admin operations
-- No policy needed as service roles bypass RLS