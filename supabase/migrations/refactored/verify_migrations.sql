/*
  # Verify Migrations
  
  This script verifies that all migrations were applied correctly:
  1. Checks if new tables exist
  2. Checks if columns were renamed
  3. Checks if user_type was updated
  4. Checks if policies were created
  5. Checks if storage buckets were created
*/

-- Check if new tables exist
SELECT 'Checking if new tables exist...' AS check_description;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'messages'
) AS messages_table_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'service_agent_portfolio_items'
) AS portfolio_items_table_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'service_agent_work_history'
) AS work_history_table_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'service_agent_references'
) AS references_table_exists;

-- Check if columns were renamed
SELECT 'Checking if columns were renamed...' AS check_description;

SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_name = 'service_packages'
  AND column_name = 'service_agent_id'
) AS service_agent_id_exists_in_service_packages;

SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_name = 'external_reviews'
  AND column_name = 'service_agent_id'
) AS service_agent_id_exists_in_external_reviews;

-- Check if user_type was updated
SELECT 'Checking if user_type was updated...' AS check_description;

SELECT COUNT(*) AS contractors_remaining
FROM profiles
WHERE user_type = 'contractor';

SELECT COUNT(*) AS service_agents_count
FROM profiles
WHERE user_type = 'service_agent';

-- Check if policies were created
SELECT 'Checking if policies were created...' AS check_description;

SELECT 
  schemaname, 
  tablename, 
  policyname
FROM pg_policies
WHERE 
  tablename = 'messages' OR
  tablename = 'service_agent_portfolio_items' OR
  tablename = 'service_agent_work_history' OR
  tablename = 'service_agent_references' OR
  tablename = 'service_agent_verifications' OR
  tablename = 'service_agent_service_areas' OR
  tablename = 'external_reviews' OR
  tablename = 'service_packages';

-- Check storage buckets
SELECT 'Checking if storage buckets were created...' AS check_description;

SELECT name, public
FROM storage.buckets
WHERE name = 'warranty_photos';

-- Check if triggers were created
SELECT 'Checking if triggers were created...' AS check_description;

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE 
  trigger_name LIKE '%update_%_updated_at' OR
  trigger_name LIKE '%notify_%';

-- Check if functions were created
SELECT 'Checking if functions were created...' AS check_description;

SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE 
  routine_name IN (
    'update_updated_at_column',
    'safe_rename_table',
    'safe_rename_column',
    'is_admin',
    'notify_new_message',
    'notify_warranty_status_change'
  )
  AND routine_schema = 'public';

-- Final check
SELECT 'Migration verification complete.' AS check_description;
