// Script to run database fixes with service role permissions
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

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

// Function to execute SQL directly
async function executeSql(sql, name) {
  console.log(`\n=== Running ${name} ===`);
  try {
    const { data, error } = await supabase.rpc('pgmoon_query', { query_text: sql });

    if (error) {
      console.error(`❌ Error running ${name}:`, error.message);
      return false;
    }

    console.log(`✅ ${name} executed successfully`);
    if (data) {
      console.log('Result:', data);
    }
    return true;
  } catch (err) {
    console.error(`❌ Exception running ${name}:`, err);
    return false;
  }
}

// Function to check if profiles exist for test users
async function checkProfiles() {
  console.log('\n=== Checking Profiles for Test Users ===');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, user_type')
      .in('email', ['admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com']);

    if (error) {
      console.error('❌ Error checking profiles:', error.message);
      return false;
    }

    console.log('Found profiles:', data);

    // Check which profiles are missing
    const emails = data.map(profile => profile.email.toLowerCase());
    const missingProfiles = [];

    if (!emails.includes('admin@itsfait.com')) {
      missingProfiles.push('admin@itsfait.com');
    }
    if (!emails.includes('client@itsfait.com')) {
      missingProfiles.push('client@itsfait.com');
    }
    if (!emails.includes('service@itsfait.com')) {
      missingProfiles.push('service@itsfait.com');
    }

    if (missingProfiles.length > 0) {
      console.log('Missing profiles for:', missingProfiles);
      return missingProfiles;
    } else {
      console.log('✅ All test user profiles exist');
      return [];
    }
  } catch (err) {
    console.error('❌ Exception checking profiles:', err);
    return false;
  }
}

// Function to check if users exist
async function checkUsers() {
  console.log('\n=== Checking Users in auth.users ===');
  try {
    // We need to use RPC for this since we can't directly query auth.users
    const { data, error } = await supabase.rpc('pgmoon_query', {
      query_text: "SELECT id, email FROM auth.users WHERE LOWER(email) IN ('admin@itsfait.com', 'client@itsfait.com', 'service@itsfait.com')"
    });

    if (error) {
      console.error('❌ Error checking users:', error.message);
      return false;
    }

    console.log('Found users:', data);
    return data;
  } catch (err) {
    console.error('❌ Exception checking users:', err);
    return false;
  }
}

// Function to create missing profiles
async function createMissingProfiles(missingProfiles, users) {
  console.log('\n=== Creating Missing Profiles ===');

  // Map emails to user types
  const userTypes = {
    'admin@itsfait.com': 'admin',
    'client@itsfait.com': 'client',
    'service@itsfait.com': 'service_agent'
  };

  // Map emails to user IDs
  const userIds = {};
  users.forEach(user => {
    userIds[user.email.toLowerCase()] = user.id;
  });

  for (const email of missingProfiles) {
    const userId = userIds[email.toLowerCase()];
    const userType = userTypes[email.toLowerCase()];

    if (!userId) {
      console.error(`❌ Cannot create profile for ${email}: User ID not found`);
      continue;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email.toLowerCase(),
          user_type: userType,
          full_name: `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error(`❌ Error creating profile for ${email}:`, error.message);
      } else {
        console.log(`✅ Created profile for ${email}`);
      }
    } catch (err) {
      console.error(`❌ Exception creating profile for ${email}:`, err);
    }
  }
}

// Main function to run all checks and fixes
async function runDatabaseFixes() {
  console.log('=== Starting Database Fixes ===');

  // Check if users exist
  const users = await checkUsers();
  if (!users || users.length === 0) {
    console.error('❌ No test users found in auth.users table');
    console.log('Please create the test users first through the Supabase dashboard or API');
    return;
  }

  // Check if profiles exist
  const missingProfiles = await checkProfiles();
  if (missingProfiles && missingProfiles.length > 0) {
    // Create missing profiles
    await createMissingProfiles(missingProfiles, users);
  }

  console.log('\n=== Database Fixes Complete ===');
}

// Run the fixes
runDatabaseFixes();
