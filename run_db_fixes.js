// Script to run database fixes with service role permissions
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using service role key for admin privileges');

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    // Use the connection pooler for efficient connection management
    poolMode: 'transaction'
  }
});
console.log('Supabase admin client created');

// Function to run SQL queries
async function runQuery(query, name) {
  console.log(`\n=== Running ${name} ===`);
  try {
    const { data, error } = await supabase.rpc('pgmoon_query', { query_text: query });

    if (error) {
      console.error(`❌ Error running ${name}:`, error.message);
      return false;
    }

    console.log(`✅ ${name} executed successfully`);
    console.log('Result:', data);
    return true;
  } catch (err) {
    console.error(`❌ Exception running ${name}:`, err);
    return false;
  }
}

// Run all database fixes
async function runDatabaseFixes() {
  // Read SQL files
  const schemaFixSQL = fs.readFileSync('fix_auth_schema.sql', 'utf8');
  const checkUsersSQL = fs.readFileSync('check_and_fix_users.sql', 'utf8');
  const checkProfilesSQL = fs.readFileSync('check_and_fix_profiles.sql', 'utf8');

  // Run schema fixes
  await runQuery(schemaFixSQL, 'Auth Schema Fix');

  // Check users
  await runQuery(checkUsersSQL, 'User Check');

  // Check profiles
  await runQuery(checkProfilesSQL, 'Profile Check');

  console.log('\n=== Database Fixes Complete ===');
  process.exit(0);
}

// Run the fixes
runDatabaseFixes();
