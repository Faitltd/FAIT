-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(p_notification_ids UUID[])
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE
  WHERE id = ANY(p_notification_ids) AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE
  WHERE user_id = auth.uid() AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_data
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Create trigger function for new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  conversation_record RECORD;
  recipient_id UUID;
  service_name TEXT;
  sender_name TEXT;
BEGIN
  -- Get conversation details
  SELECT * INTO conversation_record
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Get sender name
  SELECT first_name || ' ' || last_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Determine recipient
  IF NEW.sender_id = conversation_record.client_id THEN
    recipient_id := conversation_record.service_agent_id;
  ELSE
    recipient_id := conversation_record.client_id;
  END IF;
  
  -- Get service name if available
  IF conversation_record.service_id IS NOT NULL THEN
    SELECT name INTO service_name
    FROM services
    WHERE id = conversation_record.service_id;
  END IF;
  
  -- Create notification
  PERFORM create_notification(
    recipient_id,
    'new_message',
    'New message from ' || sender_name,
    NEW.content,
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'sender_name', sender_name,
      'service_id', conversation_record.service_id,
      'service_name', service_name,
      'booking_id', conversation_record.booking_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;
CREATE TRIGGER notify_new_message_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();

-- Create trigger function for booking status changes
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  service_name TEXT;
  client_id UUID;
  service_agent_id UUID;
  client_name TEXT;
  service_agent_name TEXT;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get service name
  SELECT name INTO service_name
  FROM services
  WHERE id = NEW.service_id;
  
  -- Get client and service agent IDs
  client_id := NEW.client_id;
  service_agent_id := NEW.service_agent_id;
  
  -- Get client name
  SELECT first_name || ' ' || last_name INTO client_name
  FROM profiles
  WHERE id = client_id;
  
  -- Get service agent name
  SELECT first_name || ' ' || last_name INTO service_agent_name
  FROM profiles
  WHERE id = service_agent_id;
  
  -- Create notification for client
  PERFORM create_notification(
    client_id,
    'booking_status_changed',
    'Booking status updated',
    'Your booking for ' || service_name || ' has been ' || NEW.status,
    jsonb_build_object(
      'booking_id', NEW.id,
      'service_id', NEW.service_id,
      'service_name', service_name,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'service_agent_id', service_agent_id,
      'service_agent_name', service_agent_name
    )
  );
  
  -- Create notification for service agent
  IF NEW.status = 'pending' THEN
    PERFORM create_notification(
      service_agent_id,
      'booking_created',
      'New booking request',
      'You have a new booking request from ' || client_name || ' for ' || service_name,
      jsonb_build_object(
        'booking_id', NEW.id,
        'service_id', NEW.service_id,
        'service_name', service_name,
        'status', NEW.status,
        'client_id', client_id,
        'client_name', client_name
      )
    );
  ELSE
    PERFORM create_notification(
      service_agent_id,
      'booking_status_changed',
      'Booking status updated',
      'Booking from ' || client_name || ' for ' || service_name || ' has been ' || NEW.status,
      jsonb_build_object(
        'booking_id', NEW.id,
        'service_id', NEW.service_id,
        'service_name', service_name,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'client_id', client_id,
        'client_name', client_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking status changes
DROP TRIGGER IF EXISTS notify_booking_status_change_trigger ON bookings;
CREATE TRIGGER notify_booking_status_change_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_booking_status_change();

-- Create trigger function for new bookings
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  service_name TEXT;
  client_name TEXT;
  service_agent_name TEXT;
BEGIN
  -- Get service name
  SELECT name INTO service_name
  FROM services
  WHERE id = NEW.service_id;
  
  -- Get client name
  SELECT first_name || ' ' || last_name INTO client_name
  FROM profiles
  WHERE id = NEW.client_id;
  
  -- Get service agent name
  SELECT first_name || ' ' || last_name INTO service_agent_name
  FROM profiles
  WHERE id = NEW.service_agent_id;
  
  -- Create notification for service agent
  PERFORM create_notification(
    NEW.service_agent_id,
    'booking_created',
    'New booking request',
    'You have a new booking request from ' || client_name || ' for ' || service_name,
    jsonb_build_object(
      'booking_id', NEW.id,
      'service_id', NEW.service_id,
      'service_name', service_name,
      'status', NEW.status,
      'client_id', NEW.client_id,
      'client_name', client_name
    )
  );
  
  -- Create notification for client
  PERFORM create_notification(
    NEW.client_id,
    'booking_created',
    'Booking request submitted',
    'Your booking request for ' || service_name || ' with ' || service_agent_name || ' has been submitted',
    jsonb_build_object(
      'booking_id', NEW.id,
      'service_id', NEW.service_id,
      'service_name', service_name,
      'status', NEW.status,
      'service_agent_id', NEW.service_agent_id,
      'service_agent_name', service_agent_name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new bookings
DROP TRIGGER IF EXISTS notify_new_booking_trigger ON bookings;
CREATE TRIGGER notify_new_booking_trigger
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_new_booking();

-- Create trigger function for warranty claim status changes
CREATE OR REPLACE FUNCTION notify_warranty_claim_status_change()
RETURNS TRIGGER AS $$
DECLARE
  service_name TEXT;
  client_id UUID;
  service_agent_id UUID;
  client_name TEXT;
  service_agent_name TEXT;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get service name
  SELECT s.name INTO service_name
  FROM services s
  JOIN bookings b ON s.id = b.service_id
  WHERE b.id = NEW.booking_id;
  
  -- Get client and service agent IDs
  SELECT b.client_id, b.service_agent_id INTO client_id, service_agent_id
  FROM bookings b
  WHERE b.id = NEW.booking_id;
  
  -- Get client name
  SELECT first_name || ' ' || last_name INTO client_name
  FROM profiles
  WHERE id = client_id;
  
  -- Get service agent name
  SELECT first_name || ' ' || last_name INTO service_agent_name
  FROM profiles
  WHERE id = service_agent_id;
  
  -- Create notification for client
  PERFORM create_notification(
    client_id,
    'warranty_claim_status_changed',
    'Warranty claim status updated',
    'Your warranty claim for ' || service_name || ' has been ' || NEW.status,
    jsonb_build_object(
      'warranty_claim_id', NEW.id,
      'booking_id', NEW.booking_id,
      'service_name', service_name,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'service_agent_id', service_agent_id,
      'service_agent_name', service_agent_name
    )
  );
  
  -- Create notification for service agent
  PERFORM create_notification(
    service_agent_id,
    'warranty_claim_status_changed',
    'Warranty claim status updated',
    'Warranty claim from ' || client_name || ' for ' || service_name || ' has been ' || NEW.status,
    jsonb_build_object(
      'warranty_claim_id', NEW.id,
      'booking_id', NEW.booking_id,
      'service_name', service_name,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'client_id', client_id,
      'client_name', client_name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for warranty claim status changes
DROP TRIGGER IF EXISTS notify_warranty_claim_status_change_trigger ON warranty_claims;
CREATE TRIGGER notify_warranty_claim_status_change_trigger
AFTER UPDATE ON warranty_claims
FOR EACH ROW
EXECUTE FUNCTION notify_warranty_claim_status_change();

-- Create trigger function for new warranty claims
CREATE OR REPLACE FUNCTION notify_new_warranty_claim()
RETURNS TRIGGER AS $$
DECLARE
  service_name TEXT;
  client_id UUID;
  service_agent_id UUID;
  client_name TEXT;
  service_agent_name TEXT;
BEGIN
  -- Get service name
  SELECT s.name INTO service_name
  FROM services s
  JOIN bookings b ON s.id = b.service_id
  WHERE b.id = NEW.booking_id;
  
  -- Get client and service agent IDs
  SELECT b.client_id, b.service_agent_id INTO client_id, service_agent_id
  FROM bookings b
  WHERE b.id = NEW.booking_id;
  
  -- Get client name
  SELECT first_name || ' ' || last_name INTO client_name
  FROM profiles
  WHERE id = client_id;
  
  -- Get service agent name
  SELECT first_name || ' ' || last_name INTO service_agent_name
  FROM profiles
  WHERE id = service_agent_id;
  
  -- Create notification for service agent
  PERFORM create_notification(
    service_agent_id,
    'warranty_claim_created',
    'New warranty claim',
    'You have a new warranty claim from ' || client_name || ' for ' || service_name,
    jsonb_build_object(
      'warranty_claim_id', NEW.id,
      'booking_id', NEW.booking_id,
      'service_name', service_name,
      'status', NEW.status,
      'client_id', client_id,
      'client_name', client_name
    )
  );
  
  -- Create notification for client
  PERFORM create_notification(
    client_id,
    'warranty_claim_created',
    'Warranty claim submitted',
    'Your warranty claim for ' || service_name || ' with ' || service_agent_name || ' has been submitted',
    jsonb_build_object(
      'warranty_claim_id', NEW.id,
      'booking_id', NEW.booking_id,
      'service_name', service_name,
      'status', NEW.status,
      'service_agent_id', service_agent_id,
      'service_agent_name', service_agent_name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new warranty claims
DROP TRIGGER IF EXISTS notify_new_warranty_claim_trigger ON warranty_claims;
CREATE TRIGGER notify_new_warranty_claim_trigger
AFTER INSERT ON warranty_claims
FOR EACH ROW
EXECUTE FUNCTION notify_new_warranty_claim();
