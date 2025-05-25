-- Add admin access to conversations and messages
-- This migration adds RLS policies to allow admins to view all conversations and messages

-- First, let's check which messaging system is active
-- We'll add policies for both the older direct messaging system and the newer conversation-based system

-- For the older messaging system (messages with sender_id and recipient_id)
DO $$
BEGIN
    -- Check if the messages table exists with sender_id and recipient_id columns
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'sender_id'
        AND column_name = 'recipient_id'
    ) THEN
        -- Create policy for admins to view all messages
        DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
        CREATE POLICY "Admins can view all messages" 
        ON messages FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.user_type = 'admin'
            )
        );
    END IF;
END
$$;

-- For the newer conversation-based messaging system
DO $$
BEGIN
    -- Check if the conversations table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'conversations'
    ) THEN
        -- Create policy for admins to view all conversations
        DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
        CREATE POLICY "Admins can view all conversations" 
        ON conversations FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.user_type = 'admin'
            )
        );
        
        -- Create policy for admins to view all conversation participants
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'conversation_participants'
        ) THEN
            DROP POLICY IF EXISTS "Admins can view all conversation participants" ON conversation_participants;
            CREATE POLICY "Admins can view all conversation participants" 
            ON conversation_participants FOR SELECT 
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.user_type = 'admin'
                )
            );
        END IF;
        
        -- Create policy for admins to view all messages in conversations
        DROP POLICY IF EXISTS "Admins can view all conversation messages" ON messages;
        CREATE POLICY "Admins can view all conversation messages" 
        ON messages FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.user_type = 'admin'
            )
        );
    END IF;
END
$$;
