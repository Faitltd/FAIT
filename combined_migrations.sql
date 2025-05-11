-- Now add policies for messages table (which should exist by now)
DO $block$
BEGIN
  -- We only create policies if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    -- Create policies
    BEGIN
      DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping view policy: %', SQLERRM;
    END;
    
    BEGIN
      CREATE POLICY "Users can view their own messages"
        ON messages FOR SELECT
        TO authenticated
        USING (sender_id = auth.uid() OR recipient_id = auth.uid());
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating view policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping insert policy: %', SQLERRM;
    END;
    
    BEGIN
      CREATE POLICY "Users can insert their own messages"
        ON messages FOR INSERT
        TO authenticated
        WITH CHECK (sender_id = auth.uid());
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating insert policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping update policy: %', SQLERRM;
    END;
    
    BEGIN
      CREATE POLICY "Users can update their own messages"
        ON messages FOR UPDATE
        TO authenticated
        USING (sender_id = auth.uid() OR recipient_id = auth.uid())
        WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating update policy: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Table messages does not exist, skipping policy creation';
  END IF;
END $block$;/*
  # Combined Platform Updates for FAIT Co-Op

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

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Function to safely rename tables if they exist
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'safe_rename_table'
  ) THEN
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
  END IF;
END;
$block$;

-- Function to safely rename columns if they exist
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'safe_rename_column'
  ) THEN
    CREATE OR REPLACE FUNCTION safe_rename_column(tbl_name text, old_column text, new_column text) RETURNS void AS $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = tbl_name
            AND column_name = old_column
        ) THEN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = tbl_name
                AND column_name = new_column
            ) THEN
                EXECUTE 'ALTER TABLE ' || tbl_name || ' RENAME COLUMN ' || old_column || ' TO ' || new_column;
                RAISE NOTICE 'Column % in table % renamed to %', old_column, tbl_name, new_column;
            ELSE
                RAISE NOTICE 'Target column % in table % already exists, skipping rename', new_column, tbl_name;
            END IF;
        ELSE
            RAISE NOTICE 'Source column % in table % does not exist, skipping rename', old_column, tbl_name;
        END IF;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END;
$block$;

-- Rename tables using the safe_rename_table function
DO $block$
BEGIN
  PERFORM safe_rename_table('contractor_verifications', 'service_agent_verifications');
  PERFORM safe_rename_table('contractor_service_areas', 'service_agent_service_areas');
  PERFORM safe_rename_table('contractor_portfolio_items', 'service_agent_portfolio_items');
  PERFORM safe_rename_table('contractor_work_history', 'service_agent_work_history');
  PERFORM safe_rename_table('contractor_references', 'service_agent_references');
END;
$block$;

-- Rename columns in tables using the safe_rename_column function
DO $block$
BEGIN
  -- Only attempt to rename columns if the tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_verifications') THEN
    PERFORM safe_rename_column('service_agent_verifications', 'contractor_id', 'service_agent_id');
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_service_areas') THEN
    PERFORM safe_rename_column('service_agent_service_areas', 'contractor_id', 'service_agent_id');
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_portfolio_items') THEN
    PERFORM safe_rename_column('service_agent_portfolio_items', 'contractor_id', 'service_agent_id');
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_work_history') THEN
    PERFORM safe_rename_column('service_agent_work_history', 'contractor_id', 'service_agent_id');
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_references') THEN
    PERFORM safe_rename_column('service_agent_references', 'contractor_id', 'service_agent_id');
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_reviews') THEN
    PERFORM safe_rename_column('external_reviews', 'contractor_id', 'service_agent_id');
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_packages') THEN
    PERFORM safe_rename_column('service_packages', 'contractor_id', 'service_agent_id');
  END IF;
END;
$block$;

-- Update user_type in profiles (only if the table exists)
DO $block$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'profiles'
  ) THEN
    UPDATE profiles
    SET user_type = 'service_agent'
    WHERE user_type = 'contractor';
  ELSE
    RAISE NOTICE 'Table profiles does not exist, skipping update';
  END IF;
END $block$;

-- Standardize is_admin function
DO $block$
BEGIN
  CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
  RETURNS boolean AS $$
  BEGIN
    -- First check admin_users table (preferred method)
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'admin_users'
    ) THEN
      IF EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id = $1
        AND is_active = true
      ) THEN
        RETURN true;
      END IF;
    END IF;

    -- Fallback to profiles table check
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'profiles'
    ) THEN
      RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = $1
        AND user_type = 'admin'
      );
    END IF;
    
    -- If neither table exists, return false
    RETURN false;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
END $block$;

-- Update profiles table constraint to allow 'service_agent' as a valid user_type
DO $block$
BEGIN
  -- Check if the table exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'profiles'
  ) THEN
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
  ELSE
    RAISE NOTICE 'Table profiles does not exist, skipping constraint update';
  END IF;
END $block$;

-- Creating all tables first, before any policy operations

-- Create messages table if it doesn't exist
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    -- Check if required tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
      CREATE TABLE messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
        sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        content text NOT NULL,
        is_read boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      
      RAISE NOTICE 'Created messages table with foreign key references';
    ELSE
      -- Create without foreign key references
      CREATE TABLE messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid,
        sender_id uuid,
        recipient_id uuid,
        content text NOT NULL,
        is_read boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      
      RAISE NOTICE 'Created messages table without foreign key references (required tables not found)';
    END IF;
    
    -- Enable RLS on messages table
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    
    -- Create trigger for updating updated_at immediately after creating the table
    CREATE TRIGGER update_messages_updated_at
      BEFORE UPDATE ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create service_agent_portfolio_items table if it doesn't exist and wasn't renamed
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_portfolio_items') THEN
    -- Check if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
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
    ELSE
      -- Create without foreign key reference
      CREATE TABLE service_agent_portfolio_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        service_agent_id uuid,
        title text NOT NULL,
        description text,
        image_url text NOT NULL,
        tags text[] DEFAULT '{}',
        is_featured boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      
      RAISE NOTICE 'Created service_agent_portfolio_items table without foreign key reference (profiles table not found)';
    END IF;

    -- Enable RLS on service_agent_portfolio_items table
    ALTER TABLE service_agent_portfolio_items ENABLE ROW LEVEL SECURITY;
    
    -- Create trigger for updating updated_at immediately after creating the table
    CREATE TRIGGER update_service_agent_portfolio_items_updated_at
      BEFORE UPDATE ON service_agent_portfolio_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create policies for service_agent_portfolio_items
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_portfolio_items') THEN
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
  END IF;
END $block$;

-- Add photo_urls to warranty_claims table
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warranty_claims') THEN
    ALTER TABLE warranty_claims
    ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';
  ELSE
    RAISE NOTICE 'Table warranty_claims does not exist, skipping column addition';
  END IF;
END $block$;

-- Create storage bucket for warranty photos
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('warranty_photos', 'warranty_photos', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Storage buckets table does not exist, skipping bucket creation';
  END IF;
END $block$;

-- Create storage policies for warranty photos
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
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
  ELSE
    RAISE NOTICE 'Storage objects table does not exist, skipping policy creation';
  END IF;
END $block$;

-- Create service_agent_work_history table if it doesn't exist and wasn't renamed
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_work_history') THEN
    -- Check if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
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
    ELSE
      -- Create without foreign key reference
      CREATE TABLE service_agent_work_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        service_agent_id uuid,
        company_name text NOT NULL,
        position text NOT NULL,
        start_date date NOT NULL,
        end_date date,
        description text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      
      RAISE NOTICE 'Created service_agent_work_history table without foreign key reference (profiles table not found)';
    END IF;

    -- Enable RLS on service_agent_work_history table
    ALTER TABLE service_agent_work_history ENABLE ROW LEVEL SECURITY;
    
    -- Create trigger for updating updated_at immediately after creating the table
    CREATE TRIGGER update_service_agent_work_history_updated_at
      BEFORE UPDATE ON service_agent_work_history
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create policies for service_agent_work_history
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_work_history') THEN
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
  END IF;
END $block$;

-- Create service_agent_references table if it doesn't exist and wasn't renamed
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_references') THEN
    -- Check if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
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
    ELSE
      -- Create without foreign key reference
      CREATE TABLE service_agent_references (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        service_agent_id uuid,
        name text NOT NULL,
        company text,
        email text,
        phone text,
        relationship text NOT NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      
      RAISE NOTICE 'Created service_agent_references table without foreign key reference (profiles table not found)';
    END IF;

    -- Enable RLS on service_agent_references table
    ALTER TABLE service_agent_references ENABLE ROW LEVEL SECURITY;
    
    -- Create trigger for updating updated_at immediately after creating the table
    CREATE TRIGGER update_service_agent_references_updated_at
      BEFORE UPDATE ON service_agent_references
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create policies for service_agent_references
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_references') THEN
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
  END IF;
END $block$;

-- Create notification trigger for new messages
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    
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
        RAISE WARNING 'Error creating message notification: %', SQLERRM;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger for new message notifications
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
  ELSE
    RAISE NOTICE 'Messages or notifications table does not exist, skipping notification trigger creation';
  END IF;
END $block$;

-- Create notification trigger for warranty claim status changes
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warranty_claims') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    
    CREATE OR REPLACE FUNCTION notify_warranty_status_change()
    RETURNS TRIGGER AS $$
    DECLARE
      service_agent_id uuid;
    BEGIN
      -- Only proceed if status has changed
      IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
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

        -- Get service agent ID from booking if bookings and service_packages tables exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') AND
           EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_packages') THEN
          
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
        END IF;
      END IF;

      RETURN NEW;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error creating warranty claim notification: %', SQLERRM;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger for warranty claim status change notifications
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname = 'notify_warranty_status_change_trigger'
      AND c.relname = 'warranty_claims'
      AND n.nspname = 'public'
    ) THEN
      CREATE TRIGGER notify_warranty_status_change_trigger
        AFTER UPDATE OF status ON warranty_claims
        FOR EACH ROW
        EXECUTE FUNCTION notify_warranty_status_change();
    END IF;
  ELSE
    RAISE NOTICE 'Warranty_claims or notifications table does not exist, skipping notification trigger creation';
  END IF;
END $block$;

-- Drop and recreate policies for service_agent_verifications
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_verifications') THEN
    -- Check if column service_agent_id exists before creating policies
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'service_agent_verifications'
      AND column_name = 'service_agent_id'
    ) THEN
      -- Drop old policies if they exist
      DROP POLICY IF EXISTS "Contractors can view own verification" ON service_agent_verifications;

      -- Create new policies
      CREATE POLICY "Service agents can view own verification"
        ON service_agent_verifications FOR SELECT
        TO authenticated
        USING (service_agent_id = auth.uid());
    ELSE
      RAISE NOTICE 'Column service_agent_id does not exist in table service_agent_verifications, skipping policy creation';
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating policies for service_agent_verifications: %', SQLERRM;
END $block$;

-- Drop and recreate policies for service_agent_service_areas
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_service_areas') THEN
    -- Check if column service_agent_id exists before creating policies
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'service_agent_service_areas'
      AND column_name = 'service_agent_id'
    ) THEN
      -- Drop old policies if they exist
      DROP POLICY IF EXISTS "Contractors can manage own service areas" ON service_agent_service_areas;

      -- Create new policies
      CREATE POLICY "Service agents can manage own service areas"
        ON service_agent_service_areas FOR ALL
        TO authenticated
        USING (service_agent_id = auth.uid())
        WITH CHECK (service_agent_id = auth.uid());
    ELSE
      RAISE NOTICE 'Column service_agent_id does not exist in table service_agent_service_areas, skipping policy creation';
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating policies for service_agent_service_areas: %', SQLERRM;
END $block$;

-- Drop and recreate policies for external_reviews
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_reviews') THEN
    -- Check if column service_agent_id exists before creating policies
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'external_reviews'
      AND column_name = 'service_agent_id'
    ) THEN
      -- Drop old policies if they exist
      DROP POLICY IF EXISTS "Contractors can manage own external reviews" ON external_reviews;

      -- Create new policies
      CREATE POLICY "Service agents can manage own external reviews"
        ON external_reviews FOR ALL
        TO authenticated
        USING (service_agent_id = auth.uid())
        WITH CHECK (service_agent_id = auth.uid());
    ELSE
      RAISE NOTICE 'Column service_agent_id does not exist in table external_reviews, skipping policy creation';
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating policies for external_reviews: %', SQLERRM;
END $block$;

-- Commit the transaction
COMMIT;