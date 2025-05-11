#!/usr/bin/env node

/**
 * This script runs the database migrations against Supabase.
 * It uses the Supabase JS client to execute SQL files.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get migration files
const migrationsDir = path.join(__dirname, '..', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to ensure correct order

async function runMigrations() {
  console.log('Running migrations...');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Running migration: ${file}`);

    try {
      // Execute the SQL
      const { error } = await supabase.rpc('pgmigrate', { query: sql });

      if (error) {
        console.error(`❌ Error running migration ${file}:`, error);
        // Continue with other migrations
      } else {
        console.log(`✅ Migration ${file} completed successfully`);
      }
    } catch (err) {
      console.error(`❌ Error running migration ${file}:`, err);
      // Continue with other migrations
    }
  }

  console.log('Migrations completed');
}

// Create pgmigrate function if it doesn't exist
async function createMigrationFunction() {
  console.log('Creating migration function...');

  const { error } = await supabase.rpc('create_migration_function', {
    query: `
      CREATE OR REPLACE FUNCTION pgmigrate(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
      END;
      $$;
    `
  });

  if (error) {
    // If the function doesn't exist, create it directly using raw SQL
    const { error: directError } = await supabase.rpc('pgmigrate', {
      query: `
        CREATE OR REPLACE FUNCTION pgmigrate(query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE query;
        END;
        $$;
      `
    });

    if (directError) {
      console.error('❌ Error creating migration function:', directError);
      console.log('Attempting to create function using SQL query...');

      // Try a different approach - execute SQL directly
      try {
        const { data, error: sqlError } = await supabase
          .from('_sql')
          .select('*')
          .execute(`
            CREATE OR REPLACE FUNCTION pgmigrate(query text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE query;
            END;
            $$;
          `);

        if (sqlError) {
          console.error('❌ Error creating migration function with SQL:', sqlError);
          process.exit(1);
        }
      } catch (err) {
        console.error('❌ Failed to create migration function:', err);
        console.log('Please create the pgmigrate function manually in the Supabase SQL editor');
        process.exit(1);
      }
    }
  }

  console.log('✅ Migration function created');
}

// Main function
async function main() {
  try {
    await createMigrationFunction();
    await runMigrations();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
