/*
  # Rename Contractor Tables to Service Agent
  
  This migration:
  1. Renames all contractor tables to service_agent tables
  2. Renames contractor_id columns to service_agent_id
  3. Updates user_type in profiles from 'contractor' to 'service_agent'
  4. Updates the profiles table constraint to allow 'service_agent'
*/

-- Start transaction
BEGIN;

-- Rename tables
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
SELECT safe_rename_column('service_packages', 'contractor_id', 'service_agent_id');

-- Update user_type in profiles
UPDATE profiles
SET user_type = 'service_agent'
WHERE user_type = 'contractor';

-- Update profiles table constraint to allow 'service_agent' as a valid user_type
DO $block$
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
END $block$;

-- Commit transaction
COMMIT;
