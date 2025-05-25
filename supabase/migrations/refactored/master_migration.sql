/*
  # Master Migration for FAIT Co-op

  This file runs all the refactored migrations in order:
  1. 00_utility_functions.sql - Utility functions for migrations
  2. 01_rename_contractor_tables.sql - Rename contractor tables to service_agent
  3. 02_create_messages_table.sql - Create messages table
  4. 03_create_service_agent_tables.sql - Create service agent tables
  5. 04_update_warranty_claims.sql - Update warranty claims
  6. 05_update_rls_policies.sql - Update RLS policies
*/

-- Start transaction
BEGIN;

-- Run migrations in order
\i 'supabase/migrations/refactored/00_utility_functions.sql'
\i 'supabase/migrations/refactored/01_rename_contractor_tables.sql'
\i 'supabase/migrations/refactored/02_create_messages_table.sql'
\i 'supabase/migrations/refactored/03_create_service_agent_tables.sql'
\i 'supabase/migrations/refactored/04_update_warranty_claims.sql'
\i 'supabase/migrations/refactored/05_update_rls_policies.sql'

-- Commit transaction
COMMIT;
