/*
  # Combined Platform Updates for FAIT Co-op

  1. New Tables
    - `messages`: For the messaging system between clients and service agents
    - `service_agent_portfolio_items`: For service agents to showcase their work

  2. Updates
    - Add photo_urls to warranty_claims table
    - Update RLS policies for new tables
    - Add triggers for notifications
    - Rename contractor tables to service_agent tables
    - Update user_type in profiles

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for access control
    - Maintain existing RLS policies with updated table names
*/

-- Start transaction for atomicity
BEGIN;

-- Ensure the update_updated_at_column function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END;
$$;

-- Standardize is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  -- First check admin_users table (preferred method)
  IF EXISTS (
    SELECT 1
    FROM admin_users
    WHERE user_id = $1
    AND is_active = true
  ) THEN
    RETURN true;
  END IF;

  -- Fallback to profiles table check
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = $1
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles table constraint to allow 'service_agent' as a valid user_type
DO $$
BEGIN
  -- Check if the constraint exists and modify it
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_user_type_check'
  ) THEN
    ALTER TABLE profiles
      DROP CONSTRAINT profiles_user_type_check;

    ALTER TABLE profiles
      ADD CONSTRAINT profiles_user_type_check
      CHECK (user_type IN ('client', 'service_agent', 'admin'));
  END IF;
END $$;

-- Function to safely rename tables if they exist
CREATE OR REPLACE FUNCTION safe_rename_table(old_name text, new_name text) RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = old_name) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = new_name) THEN
            EXECUTE 'ALTER TABLE ' || old_name || ' RENAME TO ' || new_name;
            RAISE NOTICE 'Table % renamed to %', old_name, new_name;
        ELSE
            RAISE NOTICE 'Target table % already exists, skipping rename', new_name;
        END IF;
    ELSE
        RAISE NOTICE 'Source table % does not exist, skipping rename', old_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely rename columns if they exist
CREATE OR REPLACE FUNCTION safe_rename_column(table_name text, old_column text, new_column text) RETURNS void AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = $1
        AND column_name = $2
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = $1
            AND column_name = $3
        ) THEN
            EXECUTE 'ALTER TABLE ' || table_name || ' RENAME COLUMN ' || old_column || ' TO ' || new_column;
            RAISE NOTICE 'Column % in table % renamed to %', old_column, table_name, new_column;
        ELSE
            RAISE NOTICE 'Target column % in table % already exists, skipping rename', new_column, table_name;
        END IF;
    ELSE
        RAISE NOTICE 'Source column % in table % does not exist, skipping rename', old_column, table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Rename tables first to avoid duplicate table creation
SELECT safe_rename_table('contractor_verifications', 'service_agent_verifications');
SELECT safe_rename_table('contractor_service_areas', 'service_agent_service_areas');
SELECT safe_rename_table('contractor_portfolio_items', 'service_agent_portfolio_items');
SELECT safe_rename_table('contractor_work_history', 'service_agent_work_history');
SELECT safe_rename_table('contractor_references', 'service_agent_references');

-- Rename columns in tables
SELECT safe_rename_column('service_agent_verifications', 'contractor_id', 'service_agent_id');
SELECT safe_rename_column('service_agent_service_areas', 'contractor_id', 'service_agent_id');
SELECT safe_rename_column('service_agent_portfolio_items', 'contractor_id', 'service_agent_id');
SELECT safe_rename_column('service_agent_work_history', 'contractor_id', 'service_agent_id');
SELECT safe_rename_column('service_agent_references', 'contractor_id', 'service_agent_id');
SELECT safe_rename_column('external_reviews', 'contractor_id', 'service_agent_id');

-- Update user_type in profiles
UPDATE profiles
SET user_type = 'service_agent'
WHERE user_type = 'contractor';

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
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
  WITH CHECK (sender_id = auth.uid() OR (recipient_id = auth.uid() AND OLD.is_read = false AND NEW.is_read = true));

-- Create service_agent_portfolio_items table if it doesn't exist and wasn't renamed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_portfolio_items') THEN
    CREATE TABLE service_agent_portfolio_items (
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
  END IF;
END $$;

-- Create policies for service_agent_portfolio_items
DROP POLICY IF EXISTS "Anyone can view portfolio items" ON service_agent_portfolio_items;
CREATE POLICY "Anyone can view portfolio items"
  ON service_agent_portfolio_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service agents can insert their own portfolio items" ON service_agent_portfolio_items;
CREATE POLICY "Service agents can insert their own portfolio items"
  ON service_agent_portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can update their own portfolio items" ON service_agent_portfolio_items;
CREATE POLICY "Service agents can update their own portfolio items"
  ON service_agent_portfolio_items FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can delete their own portfolio items" ON service_agent_portfolio_items;
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
DROP POLICY IF EXISTS "Users can upload warranty photos" ON storage.objects;
CREATE POLICY "Users can upload warranty photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'warranty_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view warranty photos" ON storage.objects;
CREATE POLICY "Users can view warranty photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'warranty_photos');

-- Create service_agent_work_history table if it doesn't exist and wasn't renamed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_work_history') THEN
    CREATE TABLE service_agent_work_history (
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
  END IF;
END $$;

-- Create policies for service_agent_work_history
DROP POLICY IF EXISTS "Anyone can view work history" ON service_agent_work_history;
CREATE POLICY "Anyone can view work history"
  ON service_agent_work_history FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service agents can insert their own work history" ON service_agent_work_history;
CREATE POLICY "Service agents can insert their own work history"
  ON service_agent_work_history FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can update their own work history" ON service_agent_work_history;
CREATE POLICY "Service agents can update their own work history"
  ON service_agent_work_history FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can delete their own work history" ON service_agent_work_history;
CREATE POLICY "Service agents can delete their own work history"
  ON service_agent_work_history FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Create service_agent_references table if it doesn't exist and wasn't renamed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_references') THEN
    CREATE TABLE service_agent_references (
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
  END IF;
END $$;

-- Create policies for service_agent_references
DROP POLICY IF EXISTS "Service agents can view their own references" ON service_agent_references;
CREATE POLICY "Service agents can view their own references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all references" ON service_agent_references;
CREATE POLICY "Admins can view all references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Service agents can insert their own references" ON service_agent_references;
CREATE POLICY "Service agents can insert their own references"
  ON service_agent_references FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can update their own references" ON service_agent_references;
CREATE POLICY "Service agents can update their own references"
  ON service_agent_references FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can delete their own references" ON service_agent_references;
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
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;
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
DROP TRIGGER IF EXISTS notify_warranty_status_change_trigger ON warranty_claims;
CREATE TRIGGER notify_warranty_status_change_trigger
  AFTER UPDATE OF status ON warranty_claims
  FOR EACH ROW
  EXECUTE FUNCTION notify_warranty_status_change();

-- Update policies for service_agent_verifications
DO $$
BEGIN
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Contractors can view own verification" ON service_agent_verifications;

    -- Create new policies
    CREATE POLICY "Service agents can view own verification"
      ON service_agent_verifications FOR SELECT
      TO authenticated
      USING (service_agent_id = auth.uid());
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating policies for service_agent_verifications: %', SQLERRM;
END $$;

-- Update policies for service_agent_service_areas
DO $$
BEGIN
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Contractors can manage own service areas" ON service_agent_service_areas;

    -- Create new policies
    CREATE POLICY "Service agents can manage own service areas"
      ON service_agent_service_areas FOR ALL
      TO authenticated
      USING (service_agent_id = auth.uid())
      WITH CHECK (service_agent_id = auth.uid());
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating policies for service_agent_service_areas: %', SQLERRM;
END $$;

-- Update policies for external_reviews
DO $$
BEGIN
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Contractors can manage own external reviews" ON external_reviews;

    -- Create new policies
    CREATE POLICY "Service agents can manage own external reviews"
      ON external_reviews FOR ALL
      TO authenticated
      USING (service_agent_id = auth.uid())
      WITH CHECK (service_agent_id = auth.uid());
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating policies for external_reviews: %', SQLERRM;
END $$;

-- Commit the transaction
COMMIT;
