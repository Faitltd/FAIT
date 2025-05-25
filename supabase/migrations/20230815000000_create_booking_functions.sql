-- Create function to check if a service agent is available for a specific date and time
CREATE OR REPLACE FUNCTION check_service_agent_availability(
  p_service_agent_id UUID,
  p_service_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INTEGER;
  v_is_available BOOLEAN;
  v_has_availability BOOLEAN;
  v_is_unavailable_date BOOLEAN;
  v_has_conflict BOOLEAN;
BEGIN
  -- Get day of week (0 = Sunday, 1 = Monday, etc.)
  v_day_of_week := EXTRACT(DOW FROM p_service_date);
  
  -- Check if the date is marked as unavailable
  SELECT EXISTS (
    SELECT 1
    FROM service_agent_unavailable_dates
    WHERE service_agent_id = p_service_agent_id
    AND date = p_service_date
  ) INTO v_is_unavailable_date;
  
  -- If the date is unavailable, return false
  IF v_is_unavailable_date THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the service agent has availability set for this day
  SELECT EXISTS (
    SELECT 1
    FROM service_agent_availability
    WHERE service_agent_id = p_service_agent_id
    AND day_of_week = v_day_of_week
  ) INTO v_has_availability;
  
  -- If no availability is set for this day, return false
  IF NOT v_has_availability THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the requested time falls within the service agent's availability
  SELECT EXISTS (
    SELECT 1
    FROM service_agent_availability
    WHERE service_agent_id = p_service_agent_id
    AND day_of_week = v_day_of_week
    AND start_time <= p_start_time
    AND end_time >= p_end_time
  ) INTO v_is_available;
  
  -- If the time is outside availability, return false
  IF NOT v_is_available THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicts with existing bookings
  SELECT EXISTS (
    SELECT 1
    FROM bookings
    WHERE service_agent_id = p_service_agent_id
    AND scheduled_date = p_service_date
    AND status IN ('pending', 'confirmed')
    AND (
      -- New booking starts during an existing booking
      (p_start_time >= scheduled_time AND p_start_time < scheduled_time + (duration || ' minutes')::INTERVAL)
      -- New booking ends during an existing booking
      OR (p_end_time > scheduled_time AND p_end_time <= scheduled_time + (duration || ' minutes')::INTERVAL)
      -- New booking completely contains an existing booking
      OR (p_start_time <= scheduled_time AND p_end_time >= scheduled_time + (duration || ' minutes')::INTERVAL)
    )
  ) INTO v_has_conflict;
  
  -- If there's a conflict, return false
  IF v_has_conflict THEN
    RETURN FALSE;
  END IF;
  
  -- If all checks pass, return true
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to lock a time slot for booking
CREATE OR REPLACE FUNCTION lock_time_slot(
  p_service_agent_id UUID,
  p_service_date DATE,
  p_start_time TIME,
  p_duration INTEGER,
  p_client_id UUID
) RETURNS UUID AS $$
DECLARE
  v_end_time TIME;
  v_is_available BOOLEAN;
  v_lock_id UUID;
BEGIN
  -- Calculate end time
  v_end_time := p_start_time + (p_duration || ' minutes')::INTERVAL;
  
  -- Check if the time slot is available
  SELECT check_service_agent_availability(
    p_service_agent_id,
    p_service_date,
    p_start_time,
    v_end_time
  ) INTO v_is_available;
  
  -- If the time slot is not available, return NULL
  IF NOT v_is_available THEN
    RETURN NULL;
  END IF;
  
  -- Generate a lock ID
  v_lock_id := gen_random_uuid();
  
  -- Insert a temporary lock record
  INSERT INTO booking_locks (
    id,
    service_agent_id,
    client_id,
    scheduled_date,
    scheduled_time,
    duration,
    expires_at
  ) VALUES (
    v_lock_id,
    p_service_agent_id,
    p_client_id,
    p_service_date,
    p_start_time,
    p_duration,
    NOW() + INTERVAL '15 minutes'
  );
  
  -- Return the lock ID
  RETURN v_lock_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to release a time slot lock
CREATE OR REPLACE FUNCTION release_time_slot_lock(
  p_lock_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Delete the lock record
  DELETE FROM booking_locks
  WHERE id = p_lock_id;
  
  -- Return true if a record was deleted
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks() RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Delete expired locks
  DELETE FROM booking_locks
  WHERE expires_at < NOW()
  RETURNING COUNT(*) INTO v_count;
  
  -- Return the number of deleted locks
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to clean up expired locks
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_locks() RETURNS TRIGGER AS $$
BEGIN
  PERFORM cleanup_expired_locks();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the bookings table
CREATE TRIGGER cleanup_locks_on_booking
BEFORE INSERT ON bookings
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_cleanup_expired_locks();
