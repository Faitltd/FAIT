-- Update conversations table to ensure status field exists and add completed status
BEGIN;

-- Check if status column exists in conversations table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'status'
    ) THEN
        -- Add status column if it doesn't exist
        ALTER TABLE conversations ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
    ELSE
        -- If status column exists, make sure it allows 'completed' status
        ALTER TABLE conversations 
        DROP CONSTRAINT IF EXISTS conversations_status_check;
    END IF;
    
    -- Add constraint to ensure valid status values
    ALTER TABLE conversations 
    ADD CONSTRAINT conversations_status_check 
    CHECK (status IN ('active', 'archived', 'completed'));
END $$;

-- Create function to automatically close conversations when a booking is completed
CREATE OR REPLACE FUNCTION close_conversation_on_booking_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If booking status changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
        -- Update the conversation status to 'completed'
        UPDATE conversations
        SET status = 'completed', updated_at = NOW()
        WHERE booking_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to close conversations when bookings are completed
DROP TRIGGER IF EXISTS close_conversation_on_booking_completion ON bookings;
CREATE TRIGGER close_conversation_on_booking_completion
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION close_conversation_on_booking_completion();

-- Add admin policy to view all conversations
DO $$
BEGIN
    -- Drop the policy if it exists
    BEGIN
        DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    -- Create the policy
    CREATE POLICY "Admins can view all conversations" 
    ON conversations FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );
END $$;

COMMIT;
