/*
  # Rename contractor_id to service_agent_id in service_packages table

  1. Changes
    - Rename contractor_id to service_agent_id in service_packages table
    - Update RLS policies for service_packages table

  2. Security
    - Maintain existing RLS policies with updated column names
*/

-- Rename contractor_id to service_agent_id in service_packages table
SELECT safe_rename_column('service_packages', 'contractor_id', 'service_agent_id');

-- Drop and recreate policies for service_packages
DO $$
BEGIN
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Contractors can manage own packages" ON service_packages;

    -- Create new policies
    CREATE POLICY "Service agents can manage own packages"
      ON service_packages FOR ALL
      TO authenticated
      USING (service_agent_id = auth.uid())
      WITH CHECK (service_agent_id = auth.uid());
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating policies for service_packages: %', SQLERRM;
END $$;
