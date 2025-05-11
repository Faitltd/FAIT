-- Comprehensive fix for Supabase auth schema issues
-- This migration addresses multiple potential issues with the auth schema

-- First, check and fix the email_change column issue
DO $$
DECLARE
    column_type text;
    column_nullable text;
BEGIN
    -- Check email_change column
    SELECT data_type, is_nullable INTO column_type, column_nullable
    FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND column_name = 'email_change';

    -- If the column exists and is not of type text or doesn't allow NULL
    IF column_type IS NOT NULL THEN
        -- Alter the column to be text
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change TYPE text USING email_change::text';
        
        -- Make sure it allows NULL values
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change DROP NOT NULL';
        
        RAISE NOTICE 'Fixed email_change column in auth.users table';
    ELSE
        RAISE NOTICE 'email_change column not found or already properly configured';
    END IF;
    
    -- Check if email_change_token_new column exists and fix it if needed
    SELECT data_type, is_nullable INTO column_type, column_nullable
    FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND column_name = 'email_change_token_new';
      
    IF column_type IS NOT NULL THEN
        -- Alter the column to be text
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change_token_new TYPE text USING email_change_token_new::text';
        
        -- Make sure it allows NULL values
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change_token_new DROP NOT NULL';
        
        RAISE NOTICE 'Fixed email_change_token_new column in auth.users table';
    END IF;
    
    -- Check if email_change_token_current column exists and fix it if needed
    SELECT data_type, is_nullable INTO column_type, column_nullable
    FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND column_name = 'email_change_token_current';
      
    IF column_type IS NOT NULL THEN
        -- Alter the column to be text
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change_token_current TYPE text USING email_change_token_current::text';
        
        -- Make sure it allows NULL values
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN email_change_token_current DROP NOT NULL';
        
        RAISE NOTICE 'Fixed email_change_token_current column in auth.users table';
    END IF;
    
    -- Check if phone_change column exists and fix it if needed
    SELECT data_type, is_nullable INTO column_type, column_nullable
    FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND column_name = 'phone_change';
      
    IF column_type IS NOT NULL THEN
        -- Alter the column to be text
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN phone_change TYPE text USING phone_change::text';
        
        -- Make sure it allows NULL values
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN phone_change DROP NOT NULL';
        
        RAISE NOTICE 'Fixed phone_change column in auth.users table';
    END IF;
    
    -- Check if phone_change_token column exists and fix it if needed
    SELECT data_type, is_nullable INTO column_type, column_nullable
    FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND column_name = 'phone_change_token';
      
    IF column_type IS NOT NULL THEN
        -- Alter the column to be text
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN phone_change_token TYPE text USING phone_change_token::text';
        
        -- Make sure it allows NULL values
        EXECUTE 'ALTER TABLE auth.users ALTER COLUMN phone_change_token DROP NOT NULL';
        
        RAISE NOTICE 'Fixed phone_change_token column in auth.users table';
    END IF;
END $$;

-- Add comments to explain the fixes
COMMENT ON COLUMN auth.users.email_change IS 'New email address being changed to';
COMMENT ON COLUMN auth.users.email_change_token_new IS 'Token to verify the new email';
COMMENT ON COLUMN auth.users.email_change_token_current IS 'Token to verify the current email';
COMMENT ON COLUMN auth.users.phone_change IS 'New phone number being changed to';
COMMENT ON COLUMN auth.users.phone_change_token IS 'Token to verify the new phone number';

-- Verify the schema is now correct
DO $$
BEGIN
    RAISE NOTICE 'Auth schema fix completed successfully';
END $$;
