/*
  # Fix Admin System Setup

  This migration fixes syntax errors in the previous admin system setup migration.
*/

-- Add admin fields to warranty_claims table
ALTER TABLE IF EXISTS warranty_claims
ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES admin_users(id),
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
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
