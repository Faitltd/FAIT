// Script to check exact email addresses in the database
import { createClient } from '@supabase/supabase-js';

// Using hardcoded Supabase credentials from your .env file
const supabaseUrl = "https://ydisdyadjupyswcpbxzu.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQzMzU4NywiZXhwIjoyMDU5MDA5NTg3fQ.96Ark16R_T-InjvpbelqLzgPLt_OswZFFr876pg-C5A";

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to check profiles
async function checkProfiles() {
  console.log('=== Checking Profiles ===');

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, user_type')
      .ilike('email', '%itsfait.com%');

    if (error) {
      console.error('Error querying profiles:', error.message);
      return;
    }

    console.log('Found profiles:');
    data.forEach(profile => {
      console.log(`- ${profile.email} (${profile.user_type}) [ID: ${profile.id}]`);
    });
  } catch (err) {
    console.error('Exception checking profiles:', err);
  }
}

// Function to test login with exact credentials
async function testLogin(email, password) {
  console.log(`\n=== Testing Login for ${email} ===`);

  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.u2hCWysJmyRyo4ZWBruDUSHAjzj9_Ibv81z7lPyx1JY";
  const loginClient = createClient(supabaseUrl, anonKey);

  try {
    // Sign out first
    await loginClient.auth.signOut();

    // Try to sign in
    const { data, error } = await loginClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`❌ Login failed: ${error.message}`);
    } else {
      console.log(`✅ Login successful for ${email}`);
      console.log(`User ID: ${data.user.id}`);
    }
  } catch (err) {
    console.error('Exception during login test:', err);
  }
}

// Function to reset password for a user
async function resetPassword(email) {
  console.log(`\n=== Resetting Password for ${email} ===`);

  try {
    // Find the user
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();

    if (searchError) {
      console.error('Error searching for users:', searchError.message);
      return;
    }

    const user = users.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Reset password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: email.split('@')[0] + '123' }
    );

    if (updateError) {
      console.error(`Error resetting password: ${updateError.message}`);
    } else {
      console.log(`✅ Password reset to ${email.split('@')[0]}123`);
    }
  } catch (err) {
    console.error('Exception resetting password:', err);
  }
}

// Run all checks
async function runChecks() {
  // Check profiles
  await checkProfiles();

  // Test logins
  await testLogin('client@itsfait.com', 'client123');
  await testLogin('service@itsfait.com', 'service123');

  // Reset passwords
  await resetPassword('client@itsfait.com');
  await resetPassword('service@itsfait.com');
}

runChecks();
