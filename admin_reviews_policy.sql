-- Add policy for admins to manage reviews
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Alternative approach if using the profiles.user_type approach
CREATE POLICY "Admins can manage all reviews (user_type approach)"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  );