/*
  # Add missing INSERT policy for bookings table

  1. Changes
    - Add INSERT policy for bookings table to allow clients to create bookings
    - Add UPDATE policy for bookings table to allow clients to update their own bookings

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for bookings
*/

-- Add INSERT policy for bookings table
CREATE POLICY "Clients can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Add UPDATE policy for bookings table
CREATE POLICY "Clients can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Add DELETE policy for bookings table
CREATE POLICY "Clients can cancel their own bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (client_id = auth.uid() AND status = 'pending');
