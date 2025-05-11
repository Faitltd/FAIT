-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, service_agent_id, booking_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they are part of
CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = service_agent_id);

-- Clients can insert conversations with service agents
CREATE POLICY "Clients can create conversations with service agents" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Service agents can insert conversations with clients
CREATE POLICY "Service agents can create conversations with clients" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = service_agent_id);

-- Users can update conversations they are part of
CREATE POLICY "Users can update their own conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = service_agent_id);

-- Create RLS policies for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id
    AND (client_id = auth.uid() OR service_agent_id = auth.uid())
  )
);

-- Users can insert messages in conversations they are part of
CREATE POLICY "Users can insert messages in their conversations" 
ON public.messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id
    AND (client_id = auth.uid() OR service_agent_id = auth.uid())
  )
);

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" 
ON public.messages FOR UPDATE 
USING (sender_id = auth.uid());

-- Create RLS policies for message attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for messages they can see
CREATE POLICY "Users can view attachments for messages they can see" 
ON public.message_attachments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.id = message_id
    AND (c.client_id = auth.uid() OR c.service_agent_id = auth.uid())
  )
);

-- Users can insert attachments for messages they send
CREATE POLICY "Users can insert attachments for messages they send" 
ON public.message_attachments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages
    WHERE id = message_id
    AND sender_id = auth.uid()
  )
);

-- Create function to create conversation when booking is created
CREATE OR REPLACE FUNCTION public.create_conversation_for_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a conversation for the booking if it doesn't exist
  INSERT INTO public.conversations (client_id, service_agent_id, booking_id, service_id)
  VALUES (NEW.client_id, NEW.service_agent_id, NEW.id, NEW.service_id)
  ON CONFLICT (client_id, service_agent_id, booking_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create conversation when booking is created
CREATE TRIGGER create_conversation_after_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_conversation_for_booking();

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(conversation_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.messages
  SET read = TRUE
  WHERE conversation_id = $1
    AND sender_id != $2
    AND read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread message count for a user
CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM public.messages m
  JOIN public.conversations c ON m.conversation_id = c.id
  WHERE (c.client_id = $1 OR c.service_agent_id = $1)
    AND m.sender_id != $1
    AND m.read = FALSE;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
