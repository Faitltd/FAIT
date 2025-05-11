/*
  # Update RLS Policies
  
  This migration:
  1. Updates RLS policies for service_agent_verifications
  2. Updates RLS policies for service_agent_service_areas
  3. Updates RLS policies for external_reviews
  4. Ensures all policies use service_agent_id instead of contractor_id
*/

-- Start transaction
BEGIN;

-- Drop and recreate policies for service_agent_verifications
DO $block$
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
END $block$;

-- Drop and recreate policies for service_agent_service_areas
DO $block$
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
END $block$;

-- Drop and recreate policies for external_reviews
DO $block$
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
END $block$;

-- Drop and recreate policies for service_packages
DO $block$
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
END $block$;

-- Commit transaction
COMMIT;
