-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Only the system can insert notifications
CREATE POLICY "Only the system can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- Create function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
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

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_as_read(
  p_notification_ids UUID[]
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE id = ANY(p_notification_ids)
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read()
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE user_id = auth.uid()
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a booking notification
CREATE OR REPLACE FUNCTION public.create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify service agent about new booking
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.service_agent_id,
      'booking_created',
      'New Booking Request',
      'You have received a new booking request.',
      jsonb_build_object(
        'booking_id', NEW.id,
        'service_id', NEW.service_id,
        'client_id', NEW.client_id,
        'service_date', NEW.service_date
      )
    );
  
  -- Notify client about booking status change
  ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    -- Notify client
    PERFORM public.create_notification(
      NEW.client_id,
      'booking_status_changed',
      'Booking Status Updated',
      'Your booking status has been updated to ' || NEW.status || '.',
      jsonb_build_object(
        'booking_id', NEW.id,
        'service_id', NEW.service_id,
        'service_agent_id', NEW.service_agent_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
    
    -- If status changed to confirmed, also notify service agent
    IF NEW.status = 'confirmed' THEN
      PERFORM public.create_notification(
        NEW.service_agent_id,
        'booking_confirmed',
        'Booking Confirmed',
        'A booking has been confirmed.',
        jsonb_build_object(
          'booking_id', NEW.id,
          'service_id', NEW.service_id,
          'client_id', NEW.client_id,
          'service_date', NEW.service_date
        )
      );
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking notifications
CREATE TRIGGER create_booking_notification_trigger
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_booking_notification();

-- Create function to create a message notification
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  conversation_record RECORD;
  recipient_id UUID;
  service_name TEXT;
BEGIN
  -- Get conversation details
  SELECT 
    c.client_id,
    c.service_agent_id,
    s.name AS service_name
  INTO conversation_record
  FROM public.conversations c
  LEFT JOIN public.services s ON c.service_id = s.id
  WHERE c.id = NEW.conversation_id;
  
  -- Determine recipient
  IF NEW.sender_id = conversation_record.client_id THEN
    recipient_id := conversation_record.service_agent_id;
  ELSE
    recipient_id := conversation_record.client_id;
  END IF;
  
  -- Create notification
  PERFORM public.create_notification(
    recipient_id,
    'new_message',
    'New Message',
    'You have received a new message.',
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'service_name', conversation_record.service_name
    )
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message notifications
CREATE TRIGGER create_message_notification_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.create_message_notification();

-- Create function to create a warranty claim notification
CREATE OR REPLACE FUNCTION public.create_warranty_claim_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- New claim created - notify service agent
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.service_agent_id,
      'warranty_claim_created',
      'New Warranty Claim',
      'A warranty claim has been filed against your service.',
      jsonb_build_object(
        'claim_id', NEW.id,
        'warranty_id', NEW.warranty_id,
        'client_id', NEW.client_id
      )
    );
  
  -- Claim status changed - notify client
  ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    PERFORM public.create_notification(
      NEW.client_id,
      'warranty_claim_status_changed',
      'Warranty Claim Updated',
      'Your warranty claim status has been updated to ' || NEW.status || '.',
      jsonb_build_object(
        'claim_id', NEW.id,
        'warranty_id', NEW.warranty_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for warranty claim notifications
CREATE TRIGGER create_warranty_claim_notification_trigger
AFTER INSERT OR UPDATE ON public.warranty_claims
FOR EACH ROW
EXECUTE FUNCTION public.create_warranty_claim_notification();
