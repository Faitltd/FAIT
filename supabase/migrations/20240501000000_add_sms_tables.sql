-- Create SMS messages table
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_text TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  media_urls JSONB,
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create SMS conversations table to group messages
CREATE TABLE IF NOT EXISTS sms_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  phone_number TEXT NOT NULL,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);

-- Create SMS templates table for common messages
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_messages_user_id ON sms_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_external_id ON sms_messages(external_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_from_to ON sms_messages(from_number, to_number);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_user_id ON sms_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone ON sms_conversations(phone_number);

-- Add RLS policies
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY view_own_sms_messages ON sms_messages
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own outbound messages
CREATE POLICY insert_own_sms_messages ON sms_messages
  FOR INSERT WITH CHECK (user_id = auth.uid() AND direction = 'outbound');

-- Users can update status of their own messages
CREATE POLICY update_own_sms_messages ON sms_messages
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can view their own conversations
CREATE POLICY view_own_sms_conversations ON sms_conversations
  FOR SELECT USING (user_id = auth.uid());

-- Users can manage their own conversations
CREATE POLICY manage_own_sms_conversations ON sms_conversations
  FOR ALL USING (user_id = auth.uid());

-- Users can view global templates and their own templates
CREATE POLICY view_sms_templates ON sms_templates
  FOR SELECT USING (is_global OR user_id = auth.uid());

-- Users can manage their own templates
CREATE POLICY manage_own_sms_templates ON sms_templates
  FOR ALL USING (user_id = auth.uid());

-- Admins can manage all SMS resources
CREATE POLICY admin_manage_sms_messages ON sms_messages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
  ));

CREATE POLICY admin_manage_sms_conversations ON sms_conversations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
  ));

CREATE POLICY admin_manage_sms_templates ON sms_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
  ));

-- Create function to update conversation on message insert
CREATE OR REPLACE FUNCTION update_sms_conversation()
RETURNS TRIGGER AS $$
BEGIN
  -- For inbound messages, the user_id is the recipient
  -- For outbound messages, the user_id is the sender
  IF NEW.direction = 'inbound' THEN
    -- Update or create conversation for inbound message
    INSERT INTO sms_conversations (user_id, phone_number, last_message_text, last_message_at, unread_count)
    VALUES (NEW.user_id, NEW.from_number, NEW.message_text, NEW.created_at, 1)
    ON CONFLICT (user_id, phone_number) DO UPDATE SET
      last_message_text = NEW.message_text,
      last_message_at = NEW.created_at,
      unread_count = sms_conversations.unread_count + 1,
      updated_at = NOW();
  ELSE
    -- Update or create conversation for outbound message
    INSERT INTO sms_conversations (user_id, phone_number, last_message_text, last_message_at, unread_count)
    VALUES (NEW.user_id, NEW.to_number, NEW.message_text, NEW.created_at, 0)
    ON CONFLICT (user_id, phone_number) DO UPDATE SET
      last_message_text = NEW.message_text,
      last_message_at = NEW.created_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation on message insert
CREATE TRIGGER trigger_update_sms_conversation
AFTER INSERT ON sms_messages
FOR EACH ROW
EXECUTE FUNCTION update_sms_conversation();

-- Create function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_sms_conversation_read(conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sms_conversations
  SET unread_count = 0, updated_at = NOW()
  WHERE id = conversation_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND (profiles.id = sms_conversations.user_id OR profiles.user_type = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some default global SMS templates
INSERT INTO sms_templates (name, template_text, is_global)
VALUES 
  ('Booking Confirmation', 'Your booking with {{service_agent_name}} has been confirmed for {{booking_date}} at {{booking_time}}. Reply HELP for assistance.', TRUE),
  ('Booking Reminder', 'Reminder: Your appointment with {{service_agent_name}} is tomorrow at {{booking_time}}. Reply C to confirm or R to reschedule.', TRUE),
  ('Service Completed', 'Thank you for using FAIT Co-Op! Your service has been completed. Please rate your experience: {{review_link}}', TRUE),
  ('Welcome Message', 'Welcome to FAIT Co-Op! We''re excited to have you join our community. Reply STOP to unsubscribe from messages.', TRUE)
ON CONFLICT DO NOTHING;
