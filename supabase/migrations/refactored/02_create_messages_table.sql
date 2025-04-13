/*
  # Create Messages Table
  
  This migration:
  1. Creates the messages table for communication between clients and service agents
  2. Sets up RLS policies for the messages table
  3. Creates a trigger for updating the updated_at column
  4. Creates a notification trigger for new messages
*/

-- Start transaction
BEGIN;

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
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'update_messages_updated_at'
    AND c.relname = 'messages'
    AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER update_messages_updated_at
      BEFORE UPDATE ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());

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
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new message notifications
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'notify_new_message_trigger'
    AND c.relname = 'messages'
    AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER notify_new_message_trigger
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION notify_new_message();
  END IF;
END $block$;

-- Commit transaction
COMMIT;
