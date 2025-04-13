# Step-by-Step Migration Guide

If you encounter issues with the full migration script, you can apply the migrations in smaller chunks. This guide breaks down the process into manageable steps.

## Prerequisites

1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Select your project: `ydisdyadjupyswcpbxzu`
3. Go to the SQL Editor

## Step 1: Create the Messages Table

```sql
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 2: Create Policies for Messages

```sql
-- Create simplified policies for messages
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
```

## Step 3: Create Portfolio Items Table

```sql
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
```

## Step 4: Create Policies for Portfolio Items

```sql
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
```

## Step 5: Update Warranty Claims Table

```sql
-- Add photo_urls to warranty_claims table
ALTER TABLE warranty_claims
ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';
```

## Step 6: Create Storage Bucket for Warranty Photos

```sql
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
```

## Step 7: Create Work History Table

```sql
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
```

## Step 8: Create Policies for Work History

```sql
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
```

## Step 9: Create References Table

```sql
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
```

## Step 10: Create Notification Triggers

```sql
-- Create notification trigger for new messages (fixed version)
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
```

## Step 11: Create Warranty Status Change Trigger

```sql
-- Create notification trigger for warranty claim status changes (fixed version)
CREATE OR REPLACE FUNCTION notify_warranty_status_change()
RETURNS TRIGGER AS $$
DECLARE
  service_agent_id uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for warranty claim status change notifications
CREATE TRIGGER notify_warranty_status_change_trigger
  AFTER UPDATE OF status ON warranty_claims
  FOR EACH ROW
  EXECUTE FUNCTION notify_warranty_status_change();
```

## Step 12: Create Helper Functions for Renaming

```sql
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
```

## Step 13: Rename Tables

```sql
-- Rename tables
SELECT safe_rename_table('contractor_verifications', 'service_agent_verifications');
SELECT safe_rename_table('contractor_service_areas', 'service_agent_service_areas');
SELECT safe_rename_table('contractor_portfolio_items', 'service_agent_portfolio_items');
SELECT safe_rename_table('contractor_work_history', 'service_agent_work_history');
SELECT safe_rename_table('contractor_references', 'service_agent_references');
```

## Step 14: Rename Columns

```sql
-- Rename columns in service_agent_verifications
SELECT safe_rename_column('service_agent_verifications', 'contractor_id', 'service_agent_id');

-- Rename columns in service_agent_service_areas
SELECT safe_rename_column('service_agent_service_areas', 'contractor_id', 'service_agent_id');

-- Rename columns in service_agent_portfolio_items
SELECT safe_rename_column('service_agent_portfolio_items', 'contractor_id', 'service_agent_id');

-- Rename columns in service_agent_work_history
SELECT safe_rename_column('service_agent_work_history', 'contractor_id', 'service_agent_id');

-- Rename columns in service_agent_references
SELECT safe_rename_column('service_agent_references', 'contractor_id', 'service_agent_id');

-- Rename columns in external_reviews
SELECT safe_rename_column('external_reviews', 'contractor_id', 'service_agent_id');
```

## Step 15: Update User Types

```sql
-- Update user_type in profiles
UPDATE profiles 
SET user_type = 'service_agent' 
WHERE user_type = 'contractor';
```

## Verification

After completing all steps, run the verification script to ensure all changes were applied correctly:

```sql
-- Check if new tables exist
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'messages'
) AS messages_table_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'service_agent_portfolio_items'
) AS portfolio_items_table_exists;

-- Check if warranty_claims has photo_urls column
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'warranty_claims' 
  AND column_name = 'photo_urls'
) AS warranty_claims_photo_urls_exists;

-- Check if user_type was updated
SELECT COUNT(*) AS contractors_remaining
FROM profiles
WHERE user_type = 'contractor';

SELECT COUNT(*) AS service_agents_count
FROM profiles
WHERE user_type = 'service_agent';
```
