-- Create booking_locks table
CREATE TABLE IF NOT EXISTS booking_locks (
  id UUID PRIMARY KEY,
  service_agent_id UUID NOT NULL REFERENCES profiles(id),
  client_id UUID NOT NULL REFERENCES profiles(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  CONSTRAINT booking_locks_service_agent_date_time_key UNIQUE (service_agent_id, scheduled_date, scheduled_time)
);

-- Add indexes for booking_locks
CREATE INDEX IF NOT EXISTS booking_locks_service_agent_id_idx ON booking_locks (service_agent_id);
CREATE INDEX IF NOT EXISTS booking_locks_client_id_idx ON booking_locks (client_id);
CREATE INDEX IF NOT EXISTS booking_locks_expires_at_idx ON booking_locks (expires_at);

-- Add columns to bookings table for recurring bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurrence_group UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurrence_sequence INTEGER;

-- Add columns to bookings table for cancellations and refunds
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_id TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS bookings_is_recurring_idx ON bookings (is_recurring);
CREATE INDEX IF NOT EXISTS bookings_recurrence_group_idx ON bookings (recurrence_group);
CREATE INDEX IF NOT EXISTS bookings_cancelled_at_idx ON bookings (cancelled_at);

-- Add RLS policies for booking_locks
ALTER TABLE booking_locks ENABLE ROW LEVEL SECURITY;

-- Policy for service agents to view their own locks
CREATE POLICY service_agent_select_locks ON booking_locks
  FOR SELECT
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Policy for clients to view their own locks
CREATE POLICY client_select_locks ON booking_locks
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Policy for clients to create locks
CREATE POLICY client_insert_locks ON booking_locks
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Policy for clients to delete their own locks
CREATE POLICY client_delete_locks ON booking_locks
  FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- Update RLS policies for bookings to handle recurring bookings
CREATE POLICY service_agent_select_recurring_bookings ON bookings
  FOR SELECT
  TO authenticated
  USING (
    service_agent_id = auth.uid() OR
    (is_recurring = TRUE AND recurrence_group IN (
      SELECT recurrence_group FROM bookings WHERE service_agent_id = auth.uid() AND is_recurring = TRUE
    ))
  );

CREATE POLICY client_select_recurring_bookings ON bookings
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    (is_recurring = TRUE AND recurrence_group IN (
      SELECT recurrence_group FROM bookings WHERE client_id = auth.uid() AND is_recurring = TRUE
    ))
  );
