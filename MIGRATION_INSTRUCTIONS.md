# Database Migration Instructions

This document provides instructions for applying the database migrations to update your Supabase schema.

## Option 1: Using the Supabase Dashboard (Recommended)

1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Select your project: `ydisdyadjupyswcpbxzu`
3. Go to the SQL Editor
4. Open the file `fixed_migrations_v2.sql` from your local project
5. Copy the entire contents of the file
6. Paste the SQL into the SQL Editor in the Supabase Dashboard
7. Click "Run" to execute the migrations

## Option 2: Using the Supabase CLI (For Development)

If you have Docker running and want to apply migrations to your local development environment:

1. Start Docker
2. Start your local Supabase instance:
   ```
   npx supabase start
   ```
3. Apply the migrations:
   ```
   npx supabase migration up
   ```

## Option 3: Using psql (For Advanced Users)

If you have direct database access:

1. Connect to your database using psql:
   ```
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.ydisdyadjupyswcpbxzu.supabase.co:5432/postgres"
   ```
2. Execute the SQL file:
   ```
   \i combined_migrations.sql
   ```

## Verifying the Migrations

After applying the migrations, you should verify that the changes were applied correctly:

1. Check that the new tables exist:
   - `messages`
   - `service_agent_portfolio_items`
   - `service_agent_work_history`
   - `service_agent_references`

2. Check that the `warranty_claims` table has the new `photo_urls` column

3. Check that all "contractor" tables and columns have been renamed to "service_agent"

## Troubleshooting

If you encounter any errors during migration:

1. Check the error message for specific issues
2. Try running each migration file separately
3. If a specific statement fails, you can comment it out and continue with the rest
4. For policy-related errors, you may need to drop and recreate policies manually

## Rollback

If you need to roll back the migrations:

1. For table creation: Drop the newly created tables
   ```sql
   DROP TABLE IF EXISTS messages;
   DROP TABLE IF EXISTS service_agent_portfolio_items;
   DROP TABLE IF EXISTS service_agent_work_history;
   DROP TABLE IF EXISTS service_agent_references;
   ```

2. For column additions: Remove the added columns
   ```sql
   ALTER TABLE warranty_claims DROP COLUMN IF EXISTS photo_urls;
   ```

3. For renamed tables/columns: Rename them back
   ```sql
   -- Example (adjust as needed):
   ALTER TABLE service_agent_verifications RENAME TO contractor_verifications;
   ALTER TABLE contractor_verifications RENAME COLUMN service_agent_id TO contractor_id;
   ```
