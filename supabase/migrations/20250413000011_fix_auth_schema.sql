-- Fix the auth.users table schema issue with email_change column
-- This migration addresses the error: "unable to fetch records: sql: Scan error on column index 8, name "email_change": converting NULL to string is unsupported"

-- First, check if the column exists and its current type
DO $$
DECLARE
    column_type text;
BEGIN
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND column_name = 'email_change';

    -- If the column exists and is not of type text with NULL allowed
    IF column_type IS NOT NULL AND column_type != 'text' THEN
        -- Alter the column to be text and allow NULL values
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change TYPE text USING email_change::text';
    END IF;

    -- Make sure the column allows NULL values
    EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change DROP NOT NULL';
END $$;

-- Add a comment to explain the fix
COMMENT ON COLUMN auth.users.email_change IS 'New email address being changed to';
