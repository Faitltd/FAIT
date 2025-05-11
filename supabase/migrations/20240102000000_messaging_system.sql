-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  service_package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, service_agent_id, booking_id)
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_service_agent_id ON conversations(service_agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET read = TRUE
  WHERE
    conversation_id = mark_messages_as_read.conversation_id AND
    sender_id != mark_messages_as_read.user_id AND
    read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count
  FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  WHERE
    (c.client_id = get_unread_message_count.user_id OR c.service_agent_id = get_unread_message_count.user_id) AND
    m.sender_id != get_unread_message_count.user_id AND
    m.read = FALSE;

  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a conversation if it doesn't exist
CREATE OR REPLACE FUNCTION create_conversation_if_not_exists(
  client_id UUID,
  service_agent_id UUID,
  booking_id UUID DEFAULT NULL,
  service_package_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Check if conversation already exists
  SELECT id INTO conversation_id
  FROM conversations
  WHERE
    client_id = create_conversation_if_not_exists.client_id AND
    service_agent_id = create_conversation_if_not_exists.service_agent_id AND
    (
      (booking_id IS NULL AND create_conversation_if_not_exists.booking_id IS NULL) OR
      booking_id = create_conversation_if_not_exists.booking_id
    );

  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (
      client_id,
      service_agent_id,
      booking_id,
      service_package_id
    ) VALUES (
      create_conversation_if_not_exists.client_id,
      create_conversation_if_not_exists.service_agent_id,
      create_conversation_if_not_exists.booking_id,
      create_conversation_if_not_exists.service_package_id
    )
    RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update conversation updated_at when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Add RLS policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (client_id = auth.uid() OR service_agent_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (client_id = auth.uid() OR service_agent_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (client_id = auth.uid() OR service_agent_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE client_id = auth.uid() OR service_agent_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE client_id = auth.uid() OR service_agent_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Message attachments policies
CREATE POLICY "Users can view attachments in their conversations"
  ON message_attachments
  FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM messages
      WHERE conversation_id IN (
        SELECT id FROM conversations
        WHERE client_id = auth.uid() OR service_agent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert attachments for their messages"
  ON message_attachments
  FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages
      WHERE sender_id = auth.uid()
    )
  );

-- Create storage bucket for attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for attachments
CREATE POLICY "Users can upload attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view attachments in their conversations"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = 'message_attachments' AND
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM messages
      WHERE conversation_id IN (
        SELECT id FROM conversations
        WHERE client_id = auth.uid() OR service_agent_id = auth.uid()
      )
    )
  );
