/*
  # Platform Updates for FAIT Co-Op

  1. New Tables
    - `messages`: For the messaging system between clients and service agents
    - `service_agent_portfolio_items`: For service agents to showcase their work

  2. Updates
    - Add photo_urls to warranty_claims table
    - Update RLS policies for new tables
    - Add triggers for notifications

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for access control
*/

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Create service_agent_portfolio_items table
CREATE TABLE IF NOT EXISTS service_agent_portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on service_agent_portfolio_items table
ALTER TABLE service_agent_portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating updated_at
CREATE TRIGGER update_service_agent_portfolio_items_updated_at
  BEFORE UPDATE ON service_agent_portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for service_agent_portfolio_items
CREATE POLICY "Anyone can view portfolio items"
  ON service_agent_portfolio_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service agents can insert their own portfolio items"
  ON service_agent_portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own portfolio items"
  ON service_agent_portfolio_items FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own portfolio items"
  ON service_agent_portfolio_items FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Add photo_urls to warranty_claims table
ALTER TABLE warranty_claims
ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

-- Create storage bucket for warranty photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('warranty_photos', 'warranty_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for warranty photos
CREATE POLICY "Users can upload warranty photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'warranty_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view warranty photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'warranty_photos');

-- Create service_agent_work_history table
CREATE TABLE IF NOT EXISTS service_agent_work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on service_agent_work_history table
ALTER TABLE service_agent_work_history ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating updated_at
CREATE TRIGGER update_service_agent_work_history_updated_at
  BEFORE UPDATE ON service_agent_work_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for service_agent_work_history
CREATE POLICY "Anyone can view work history"
  ON service_agent_work_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service agents can insert their own work history"
  ON service_agent_work_history FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own work history"
  ON service_agent_work_history FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own work history"
  ON service_agent_work_history FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Create service_agent_references table
CREATE TABLE IF NOT EXISTS service_agent_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on service_agent_references table
ALTER TABLE service_agent_references ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating updated_at
CREATE TRIGGER update_service_agent_references_updated_at
  BEFORE UPDATE ON service_agent_references
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for service_agent_references
CREATE POLICY "Service agents can view their own references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (service_agent_id = auth.uid());

CREATE POLICY "Admins can view all references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Service agents can insert their own references"
  ON service_agent_references FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own references"
  ON service_agent_references FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own references"
  ON service_agent_references FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Create notification trigger for new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for recipient
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    is_read
  ) VALUES (
    NEW.recipient_id,
    'New Message',
    'You have received a new message',
    'message',
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new message notifications
CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Create notification trigger for warranty claim status changes
CREATE OR REPLACE FUNCTION notify_warranty_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Insert notification for client
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      is_read
    ) VALUES (
      NEW.client_id,
      'Warranty Claim Update',
      'Your warranty claim status has been updated to ' || NEW.status,
      'system',
      false
    );

    -- Get service agent ID from booking
    DECLARE
      service_agent_id uuid;
    BEGIN
      SELECT sp.service_agent_id INTO service_agent_id
      FROM bookings b
      JOIN service_packages sp ON b.service_package_id = sp.id
      WHERE b.id = NEW.booking_id;

      -- Insert notification for service agent if found
      IF service_agent_id IS NOT NULL THEN
        INSERT INTO notifications (
          user_id,
          title,
          message,
          type,
          is_read
        ) VALUES (
          service_agent_id,
          'Warranty Claim Update',
          'A warranty claim for your service has been updated to ' || NEW.status,
          'system',
          false
        );
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for warranty claim status change notifications
CREATE TRIGGER notify_warranty_status_change_trigger
  AFTER UPDATE OF status ON warranty_claims
  FOR EACH ROW
  EXECUTE FUNCTION notify_warranty_status_change();
