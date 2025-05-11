/*
  # Rename Contractor Tables to Service Agent

  1. Changes
    - Rename contractor_verifications to service_agent_verifications
    - Rename contractor_service_areas to service_agent_service_areas
    - Rename contractor_portfolio_items to service_agent_portfolio_items
    - Rename contractor_work_history to service_agent_work_history
    - Rename contractor_references to service_agent_references
    - Update foreign key references
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies with updated table names
*/

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
CREATE OR REPLACE FUNCTION safe_rename_column(table_name_param text, old_column text, new_column text) RETURNS void AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = table_name_param
        AND column_name = old_column
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = table_name_param
            AND column_name = new_column
        ) THEN
            EXECUTE 'ALTER TABLE ' || table_name_param || ' RENAME COLUMN ' || old_column || ' TO ' || new_column;
            RAISE NOTICE 'Column % in table % renamed to %', old_column, table_name_param, new_column;
        ELSE
            RAISE NOTICE 'Target column % in table % already exists, skipping rename', new_column, table_name_param;
        END IF;
    ELSE
        RAISE NOTICE 'Source column % in table % does not exist, skipping rename', old_column, table_name_param;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Rename tables
SELECT safe_rename_table('contractor_verifications', 'service_agent_verifications');
SELECT safe_rename_table('contractor_service_areas', 'service_agent_service_areas');
SELECT safe_rename_table('contractor_portfolio_items', 'service_agent_portfolio_items');
SELECT safe_rename_table('contractor_work_history', 'service_agent_work_history');
SELECT safe_rename_table('contractor_references', 'service_agent_references');

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

-- Update user_type in profiles
UPDATE profiles
SET user_type = 'service_agent'
WHERE user_type = 'contractor';

-- Drop and recreate policies for service_agent_verifications
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

-- Drop and recreate policies for service_agent_service_areas
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

-- Drop and recreate policies for external_reviews
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
