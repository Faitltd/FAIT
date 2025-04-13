#!/bin/bash

# Stop Supabase if it's running
supabase stop

# Create a backup of the problematic file
cp supabase/migrations/20250331174622_snowy_haze.sql supabase/migrations/20250331174622_snowy_haze.sql.bak

# Create a fixed version of the file
cat > supabase/migrations/20250331174622_snowy_haze.sql << 'EOF'
/*
  # Admin System Setup - Fixed Version

  This is a fixed version of the admin system setup migration.
*/

-- Create admin_roles enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_type') THEN
    CREATE TYPE admin_role_type AS ENUM (
      'super_admin',
      'verification_admin',
      'warranty_admin',
      'support_admin'
    );
  END IF;
END $$;

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role_type NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

-- Check if warranty_claims table exists and add admin fields
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warranty_claims') THEN
    -- Add admin handling fields to warranty_claims
    ALTER TABLE warranty_claims
    ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES admin_users(id),
    ADD COLUMN IF NOT EXISTS admin_notes text;
  END IF;
END $$;

-- Create is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create log_admin_action function
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO admin_audit_logs (
      admin_id,
      action,
      entity_type,
      entity_id,
      changes
    )
    VALUES (
      (SELECT id FROM admin_users WHERE user_id = auth.uid()),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  ELSIF (TG_OP = 'INSERT' OR TG_OP = 'DELETE') THEN
    INSERT INTO admin_audit_logs (
      admin_id,
      action,
      entity_type,
      entity_id,
      changes
    )
    VALUES (
      (SELECT id FROM admin_users WHERE user_id = auth.uid()),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE
        WHEN TG_OP = 'INSERT' THEN jsonb_build_object('new', to_jsonb(NEW))
        ELSE jsonb_build_object('old', to_jsonb(OLD))
      END
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers if tables exist
DO $$ 
BEGIN
  -- Check if contractor_verifications table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contractor_verifications') THEN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS audit_contractor_verifications ON contractor_verifications;
    
    -- Create trigger
    CREATE TRIGGER audit_contractor_verifications
      AFTER INSERT OR UPDATE OR DELETE ON contractor_verifications
      FOR EACH ROW EXECUTE FUNCTION log_admin_action();
  END IF;
  
  -- Check if warranty_claims table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warranty_claims') THEN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS audit_warranty_claims ON warranty_claims;
    
    -- Create trigger
    CREATE TRIGGER audit_warranty_claims
      AFTER INSERT OR UPDATE OR DELETE ON warranty_claims
      FOR EACH ROW EXECUTE FUNCTION log_admin_action();
  END IF;
END $$;

-- Add RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Add admin_users policies
DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
CREATE POLICY "Only admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Only super admins can manage admin_users" ON admin_users;
CREATE POLICY "Only super admins can manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Add admin_audit_logs policies
DROP POLICY IF EXISTS "Only admins can view audit logs" ON admin_audit_logs;
CREATE POLICY "Only admins can view audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Update existing policies for contractor verifications if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contractor_verifications') THEN
    DROP POLICY IF EXISTS "Contractors can view own verification" ON contractor_verifications;
    
    DROP POLICY IF EXISTS "Access contractor verifications" ON contractor_verifications;
    CREATE POLICY "Access contractor verifications"
      ON contractor_verifications
      FOR ALL
      TO authenticated
      USING (
        contractor_id = auth.uid() OR
        is_admin()
      )
      WITH CHECK (
        contractor_id = auth.uid() OR
        is_admin()
      );
  END IF;
END $$;

-- Update existing policies for warranty claims if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warranty_claims') THEN
    DROP POLICY IF EXISTS "Users can view own warranty claims" ON warranty_claims;
    
    DROP POLICY IF EXISTS "Access warranty claims" ON warranty_claims;
    CREATE POLICY "Access warranty claims"
      ON warranty_claims
      FOR ALL
      TO authenticated
      USING (
        client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM service_packages sp
          JOIN bookings b ON b.service_package_id = sp.id
          WHERE b.id = warranty_claims.booking_id
          AND sp.contractor_id = auth.uid()
        ) OR
        is_admin()
      )
      WITH CHECK (
        client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM service_packages sp
          JOIN bookings b ON b.service_package_id = sp.id
          WHERE b.id = warranty_claims.booking_id
          AND sp.contractor_id = auth.uid()
        ) OR
        is_admin()
      );
  END IF;
END $$;
EOF

# Create a migration to fix auth schema issues
cat > supabase/migrations/20250413000005_fix_auth_schema.sql << 'EOF'
/*
  # Fix Auth Schema Issues

  This migration fixes issues with the auth.users table schema that cause
  authentication errors, particularly with the email_change column.
*/

-- Check and fix the email_change column issue
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
EOF

# Fix the SMTP settings in config.toml
cp supabase/config.toml supabase/config.toml.bak

# Remove any invalid SMTP settings
sed -i '' '/connection_timeout/d' supabase/config.toml
sed -i '' '/max_connections/d' supabase/config.toml
sed -i '' '/pool =/d' supabase/config.toml
sed -i '' '/tls =/d' supabase/config.toml

echo "Migrations and config files fixed. Now try starting Supabase again."
