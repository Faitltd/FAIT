/*
  # Rollback Migrations
  
  This script will undo the changes made by the migrations:
  - 20250401010000_platform_updates.sql
  - 20250401020000_rename_contractor_tables.sql
  
  WARNING: This will delete data in the new tables. Make sure to back up any important data first.
*/

-- Drop new tables
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS service_agent_portfolio_items;
DROP TABLE IF EXISTS service_agent_work_history;
DROP TABLE IF EXISTS service_agent_references;

-- Remove photo_urls column from warranty_claims
ALTER TABLE warranty_claims DROP COLUMN IF EXISTS photo_urls;

-- Rename service_agent tables back to contractor tables
-- Only if the rename was successful and the original tables don't exist

-- Check and rename service_agent_verifications back to contractor_verifications
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'service_agent_verifications'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'contractor_verifications'
  ) THEN
    ALTER TABLE service_agent_verifications RENAME TO contractor_verifications;
    ALTER TABLE contractor_verifications RENAME COLUMN service_agent_id TO contractor_id;
  END IF;
END $$;

-- Check and rename service_agent_service_areas back to contractor_service_areas
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'service_agent_service_areas'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'contractor_service_areas'
  ) THEN
    ALTER TABLE service_agent_service_areas RENAME TO contractor_service_areas;
    ALTER TABLE contractor_service_areas RENAME COLUMN service_agent_id TO contractor_id;
  END IF;
END $$;

-- Rename service_agent_id back to contractor_id in external_reviews
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'external_reviews' 
    AND column_name = 'service_agent_id'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'external_reviews' 
    AND column_name = 'contractor_id'
  ) THEN
    ALTER TABLE external_reviews RENAME COLUMN service_agent_id TO contractor_id;
  END IF;
END $$;

-- Update user_type back to contractor
UPDATE profiles 
SET user_type = 'contractor' 
WHERE user_type = 'service_agent';

-- Drop storage bucket for warranty photos
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM storage.buckets 
    WHERE name = 'warranty_photos'
  ) THEN
    DELETE FROM storage.buckets WHERE name = 'warranty_photos';
  END IF;
END $$;

-- Drop notification triggers
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;
DROP TRIGGER IF EXISTS notify_warranty_status_change_trigger ON warranty_claims;

-- Drop functions
DROP FUNCTION IF EXISTS notify_new_message();
DROP FUNCTION IF EXISTS notify_warranty_status_change();
DROP FUNCTION IF EXISTS safe_rename_table(text, text);
DROP FUNCTION IF EXISTS safe_rename_column(text, text, text);
