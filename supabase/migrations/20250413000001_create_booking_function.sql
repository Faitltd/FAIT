/*
  # Create database function for booking creation

  1. Changes
    - Add a database function to create bookings
    - This function can be called by authenticated users without requiring direct INSERT permissions

  2. Security
    - The function performs its own validation to ensure users can only create bookings for themselves
    - This provides a more secure way to create bookings until proper RLS policies are in place
*/

-- Create a function to create bookings
CREATE OR REPLACE FUNCTION create_booking(
  client_id uuid,
  service_package_id uuid,
  scheduled_date timestamptz,
  total_amount decimal,
  notes text DEFAULT NULL,
  status text DEFAULT 'pending'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Function runs with the privileges of the creator
AS $$
DECLARE
  booking_id uuid;
  result json;
BEGIN
  -- Verify that the client_id matches the authenticated user
  IF client_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only create bookings for yourself';
  END IF;

  -- Verify that the service package exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM service_packages
    WHERE id = service_package_id
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Service package not found or not active';
  END IF;

  -- Insert the booking
  INSERT INTO bookings (
    client_id,
    service_package_id,
    scheduled_date,
    total_amount,
    notes,
    status
  )
  VALUES (
    client_id,
    service_package_id,
    scheduled_date,
    total_amount,
    notes,
    status
  )
  RETURNING id INTO booking_id;

  -- Get the created booking
  SELECT row_to_json(b)
  FROM bookings b
  WHERE b.id = booking_id
  INTO result;

  RETURN result;
END;
$$;
