/*
  # Update Warranty Claims
  
  This migration:
  1. Adds photo_urls to warranty_claims table
  2. Creates a storage bucket for warranty photos
  3. Sets up storage policies for warranty photos
  4. Creates a notification trigger for warranty claim status changes
*/

-- Start transaction
BEGIN;

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

-- Create notification trigger for warranty claim status changes
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating warranty notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for warranty claim status change notifications
DO $block$
BEGIN
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
END $block$;

-- Commit transaction
COMMIT;
