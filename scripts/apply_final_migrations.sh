#!/bin/bash

# Apply final database migrations for FAIT Co-Op platform
# This script applies the remaining migrations to complete the contractor to service_agent transition

echo "Applying final database migrations..."

# Connect to the database
DB_CONTAINER="supabase_db_project_2"

# Function to execute SQL
execute_sql() {
  echo "Executing SQL: $1"
  docker exec -i $DB_CONTAINER psql -U postgres -d postgres -c "$1"
}

# Check if any contractor tables still exist
echo "Checking for remaining contractor tables..."
execute_sql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%contractor%';"

# Check if any contractor_id columns still exist
echo "Checking for remaining contractor_id columns..."
execute_sql "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%contractor_id%';"

# Update any remaining contractor references in commission_transactions
echo "Updating commission_transactions table..."
execute_sql "
-- Check if contractor_id column exists and service_agent_id doesn't exist
DO \$\$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'commission_transactions' 
    AND column_name = 'contractor_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'commission_transactions' 
    AND column_name = 'service_agent_id'
  ) THEN
    -- Add service_agent_id column
    ALTER TABLE commission_transactions ADD COLUMN service_agent_id UUID REFERENCES auth.users(id);
    
    -- Copy data from contractor_id to service_agent_id
    UPDATE commission_transactions SET service_agent_id = contractor_id;
    
    -- Drop contractor_id column
    ALTER TABLE commission_transactions DROP COLUMN contractor_id;
  END IF;
END
\$\$;
"

# Update any remaining contractor references in warranties
echo "Updating warranties table..."
execute_sql "
-- Check if contractor_id column exists and service_agent_id doesn't exist
DO \$\$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'warranties' 
    AND column_name = 'contractor_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'warranties' 
    AND column_name = 'service_agent_id'
  ) THEN
    -- Add service_agent_id column
    ALTER TABLE warranties ADD COLUMN service_agent_id UUID REFERENCES auth.users(id);
    
    -- Copy data from contractor_id to service_agent_id
    UPDATE warranties SET service_agent_id = contractor_id;
    
    -- Drop contractor_id column
    ALTER TABLE warranties DROP COLUMN contractor_id;
    
    -- Update foreign key references
    ALTER TABLE warranties 
      DROP CONSTRAINT IF EXISTS warranties_contractor_id_fkey,
      ADD CONSTRAINT warranties_service_agent_id_fkey 
        FOREIGN KEY (service_agent_id) 
        REFERENCES auth.users(id);
  END IF;
END
\$\$;
"

# Update any remaining contractor references in warranty_claims
echo "Updating warranty_claims table..."
execute_sql "
-- Check if contractor_id column exists and service_agent_id doesn't exist
DO \$\$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'warranty_claims' 
    AND column_name = 'contractor_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'warranty_claims' 
    AND column_name = 'service_agent_id'
  ) THEN
    -- Add service_agent_id column
    ALTER TABLE warranty_claims ADD COLUMN service_agent_id UUID REFERENCES auth.users(id);
    
    -- Copy data from contractor_id to service_agent_id
    UPDATE warranty_claims SET service_agent_id = contractor_id;
    
    -- Drop contractor_id column
    ALTER TABLE warranty_claims DROP COLUMN contractor_id;
    
    -- Update foreign key references
    ALTER TABLE warranty_claims 
      DROP CONSTRAINT IF EXISTS warranty_claims_contractor_id_fkey,
      ADD CONSTRAINT warranty_claims_service_agent_id_fkey 
        FOREIGN KEY (service_agent_id) 
        REFERENCES auth.users(id);
  END IF;
END
\$\$;
"

# Update any remaining contractor references in bookings
echo "Updating bookings table..."
execute_sql "
-- Check if contractor_id column exists and service_agent_id doesn't exist
DO \$\$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'contractor_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'service_agent_id'
  ) THEN
    -- Add service_agent_id column
    ALTER TABLE bookings ADD COLUMN service_agent_id UUID REFERENCES auth.users(id);
    
    -- Copy data from contractor_id to service_agent_id
    UPDATE bookings SET service_agent_id = contractor_id;
    
    -- Drop contractor_id column
    ALTER TABLE bookings DROP COLUMN contractor_id;
    
    -- Update foreign key references
    ALTER TABLE bookings 
      DROP CONSTRAINT IF EXISTS bookings_contractor_id_fkey,
      ADD CONSTRAINT bookings_service_agent_id_fkey 
        FOREIGN KEY (service_agent_id) 
        REFERENCES auth.users(id);
  END IF;
END
\$\$;
"

# Update any remaining contractor references in contractor_availability
echo "Updating contractor_availability table..."
execute_sql "
-- Check if contractor_availability table exists
DO \$\$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'contractor_availability'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'service_agent_availability'
  ) THEN
    -- Rename table
    ALTER TABLE contractor_availability RENAME TO service_agent_availability;
    
    -- Rename column
    ALTER TABLE service_agent_availability RENAME COLUMN contractor_id TO service_agent_id;
    
    -- Update foreign key references
    ALTER TABLE service_agent_availability 
      DROP CONSTRAINT IF EXISTS contractor_availability_contractor_id_fkey,
      ADD CONSTRAINT service_agent_availability_service_agent_id_fkey 
        FOREIGN KEY (service_agent_id) 
        REFERENCES auth.users(id);
  END IF;
END
\$\$;
"

# Update any remaining contractor references in contractor_unavailable_dates
echo "Updating contractor_unavailable_dates table..."
execute_sql "
-- Check if contractor_unavailable_dates table exists
DO \$\$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'contractor_unavailable_dates'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'service_agent_unavailable_dates'
  ) THEN
    -- Rename table
    ALTER TABLE contractor_unavailable_dates RENAME TO service_agent_unavailable_dates;
    
    -- Rename column
    ALTER TABLE service_agent_unavailable_dates RENAME COLUMN contractor_id TO service_agent_id;
    
    -- Update foreign key references
    ALTER TABLE service_agent_unavailable_dates 
      DROP CONSTRAINT IF EXISTS contractor_unavailable_dates_contractor_id_fkey,
      ADD CONSTRAINT service_agent_unavailable_dates_service_agent_id_fkey 
        FOREIGN KEY (service_agent_id) 
        REFERENCES auth.users(id);
  END IF;
END
\$\$;
"

# Update profiles table constraint to allow 'service_agent' as a valid user_type
echo "Updating profiles table constraint..."
execute_sql "
DO \$block\$
BEGIN
  -- Check if the constraint exists and modify it
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_user_type_check'
  ) THEN
    ALTER TABLE profiles
      DROP CONSTRAINT profiles_user_type_check;

    ALTER TABLE profiles
      ADD CONSTRAINT profiles_user_type_check
      CHECK (user_type IN ('client', 'service_agent', 'admin'));
  END IF;
END \$block\$;
"

# Update any remaining contractor references in subscription_features
echo "Updating subscription_features table..."
execute_sql "
UPDATE subscription_features 
SET user_type = 'service_agent' 
WHERE user_type = 'contractor';
"

# Verify the changes
echo "Verifying changes..."
execute_sql "SELECT COUNT(*) AS contractors_remaining FROM profiles WHERE user_type = 'contractor';"
execute_sql "SELECT COUNT(*) AS service_agents_count FROM profiles WHERE user_type = 'service_agent';"

echo "Migration complete!"
