/*
  # Create Service Agent Tables
  
  This migration:
  1. Creates service_agent_portfolio_items table if it doesn't exist
  2. Creates service_agent_work_history table if it doesn't exist
  3. Creates service_agent_references table if it doesn't exist
  4. Sets up RLS policies for all tables
  5. Creates triggers for updating the updated_at column
*/

-- Start transaction
BEGIN;

-- Create service_agent_portfolio_items table if it doesn't exist and wasn't renamed
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_portfolio_items') THEN
    CREATE TABLE service_agent_portfolio_items (
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
  END IF;
END $block$;

-- Create trigger for updating updated_at
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'update_service_agent_portfolio_items_updated_at'
    AND c.relname = 'service_agent_portfolio_items'
    AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER update_service_agent_portfolio_items_updated_at
      BEFORE UPDATE ON service_agent_portfolio_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create policies for service_agent_portfolio_items
DROP POLICY IF EXISTS "Anyone can view portfolio items" ON service_agent_portfolio_items;
CREATE POLICY "Anyone can view portfolio items"
  ON service_agent_portfolio_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service agents can insert their own portfolio items" ON service_agent_portfolio_items;
CREATE POLICY "Service agents can insert their own portfolio items"
  ON service_agent_portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can update their own portfolio items" ON service_agent_portfolio_items;
CREATE POLICY "Service agents can update their own portfolio items"
  ON service_agent_portfolio_items FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can delete their own portfolio items" ON service_agent_portfolio_items;
CREATE POLICY "Service agents can delete their own portfolio items"
  ON service_agent_portfolio_items FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Create service_agent_work_history table if it doesn't exist and wasn't renamed
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_work_history') THEN
    CREATE TABLE service_agent_work_history (
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
  END IF;
END $block$;

-- Create trigger for updating updated_at
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'update_service_agent_work_history_updated_at'
    AND c.relname = 'service_agent_work_history'
    AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER update_service_agent_work_history_updated_at
      BEFORE UPDATE ON service_agent_work_history
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create policies for service_agent_work_history
DROP POLICY IF EXISTS "Anyone can view work history" ON service_agent_work_history;
CREATE POLICY "Anyone can view work history"
  ON service_agent_work_history FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service agents can insert their own work history" ON service_agent_work_history;
CREATE POLICY "Service agents can insert their own work history"
  ON service_agent_work_history FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can update their own work history" ON service_agent_work_history;
CREATE POLICY "Service agents can update their own work history"
  ON service_agent_work_history FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can delete their own work history" ON service_agent_work_history;
CREATE POLICY "Service agents can delete their own work history"
  ON service_agent_work_history FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Create service_agent_references table if it doesn't exist and wasn't renamed
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_agent_references') THEN
    CREATE TABLE service_agent_references (
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
  END IF;
END $block$;

-- Create trigger for updating updated_at
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'update_service_agent_references_updated_at'
    AND c.relname = 'service_agent_references'
    AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER update_service_agent_references_updated_at
      BEFORE UPDATE ON service_agent_references
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $block$;

-- Create policies for service_agent_references
DROP POLICY IF EXISTS "Service agents can view their own references" ON service_agent_references;
CREATE POLICY "Service agents can view their own references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all references" ON service_agent_references;
CREATE POLICY "Admins can view all references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Service agents can insert their own references" ON service_agent_references;
CREATE POLICY "Service agents can insert their own references"
  ON service_agent_references FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can update their own references" ON service_agent_references;
CREATE POLICY "Service agents can update their own references"
  ON service_agent_references FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

DROP POLICY IF EXISTS "Service agents can delete their own references" ON service_agent_references;
CREATE POLICY "Service agents can delete their own references"
  ON service_agent_references FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Commit transaction
COMMIT;
