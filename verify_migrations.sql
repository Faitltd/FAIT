-- Verify migrations script
-- Run this after applying migrations to verify they were applied correctly

-- Check if new tables exist
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

-- Check if warranty_claims has photo_urls column
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'warranty_claims' 
  AND column_name = 'photo_urls'
) AS warranty_claims_photo_urls_exists;

-- Check if contractor tables were renamed
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'contractor_verifications'
) AS contractor_verifications_still_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'service_agent_verifications'
) AS service_agent_verifications_exists;

-- Check if user_type was updated
SELECT COUNT(*) AS contractors_remaining
FROM profiles
WHERE user_type = 'contractor';

SELECT COUNT(*) AS service_agents_count
FROM profiles
WHERE user_type = 'service_agent';

-- Check if policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname
FROM pg_policies
WHERE 
  tablename = 'messages' OR
  tablename = 'service_agent_portfolio_items' OR
  tablename = 'service_agent_work_history' OR
  tablename = 'service_agent_references';

-- Check storage buckets
SELECT name, public
FROM storage.buckets
WHERE name = 'warranty_photos';
