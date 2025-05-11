/*
  # Utility Functions for FAIT Co-Op Database
  
  This file contains utility functions used across migrations:
  1. update_updated_at_column: For automatically updating timestamps
  2. safe_rename_table: For safely renaming tables
  3. safe_rename_column: For safely renaming columns
  4. is_admin: For checking admin status
*/

-- Start transaction
BEGIN;

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to safely rename tables if they exist
CREATE OR REPLACE FUNCTION safe_rename_table(old_name text, new_name text) 
RETURNS void AS $$
DECLARE
  table_exists boolean;
  target_exists boolean;
BEGIN
  -- Check if source table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = old_name
  ) INTO table_exists;
  
  -- Check if target table already exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = new_name
  ) INTO target_exists;
  
  -- Only proceed if source exists and target doesn't
  IF table_exists AND NOT target_exists THEN
    EXECUTE 'ALTER TABLE ' || quote_ident(old_name) || ' RENAME TO ' || quote_ident(new_name);
    RAISE NOTICE 'Table % renamed to %', old_name, new_name;
  ELSIF NOT table_exists THEN
    RAISE NOTICE 'Source table % does not exist, skipping rename', old_name;
  ELSIF target_exists THEN
    RAISE NOTICE 'Target table % already exists, skipping rename', new_name;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error renaming table % to %: %', old_name, new_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to safely rename columns if they exist
DROP FUNCTION IF EXISTS safe_rename_column(text, text, text);
CREATE OR REPLACE FUNCTION safe_rename_column(tbl_name text, old_column text, new_column text) 
RETURNS void AS $$
DECLARE
  column_exists boolean;
  target_exists boolean;
BEGIN
  -- Check if source column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = tbl_name
    AND column_name = old_column
  ) INTO column_exists;
  
  -- Check if target column already exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = tbl_name
    AND column_name = new_column
  ) INTO target_exists;
  
  -- Only proceed if source exists and target doesn't
  IF column_exists AND NOT target_exists THEN
    EXECUTE 'ALTER TABLE ' || quote_ident(tbl_name) || ' RENAME COLUMN ' || 
            quote_ident(old_column) || ' TO ' || quote_ident(new_column);
    RAISE NOTICE 'Column % in table % renamed to %', old_column, tbl_name, new_column;
  ELSIF NOT column_exists THEN
    RAISE NOTICE 'Source column % in table % does not exist, skipping rename', old_column, tbl_name;
  ELSIF target_exists THEN
    RAISE NOTICE 'Target column % in table % already exists, skipping rename', new_column, tbl_name;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error renaming column % to % in table %: %', old_column, new_column, tbl_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Standardized is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  -- First check admin_users table (preferred method)
  IF EXISTS (
    SELECT 1
    FROM admin_users
    WHERE user_id = $1
    AND is_active = true
  ) THEN
    RETURN true;
  END IF;

  -- Fallback to profiles table check
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = $1
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commit transaction
COMMIT;
