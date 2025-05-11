// Test Supabase authentication connection
import { createClient } from '@supabase/supabase-js';

// Using hardcoded Supabase credentials from your .env file
const supabaseUrl = "https://ydisdyadjupyswcpbxzu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.u2hCWysJmyRyo4ZWBruDUSHAjzj9_Ibv81z7lPyx1JY";

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey.substring(0, 5) + '...');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client created');

// Test credentials
const testCredentials = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

// Test connection
async function testConnection() {
  console.log('\n=== Testing Connection ===');
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Connection test successful');
      if (data.session) {
        console.log('Session found:', data.session.user.email);
      } else {
        console.log('No active session');
      }
    }
  } catch (err) {
    console.error('❌ Connection test exception:', err);
  }
}

// Test login with credentials
async function testLogin(email, password, type) {
  console.log(`\n=== Testing ${type} Login ===`);
  console.log('Email:', email);
  console.log('Password:', password);

  try {
    // Sign out first to ensure clean state
    await supabase.auth.signOut();
    console.log('Signed out previous session');

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`❌ ${type} login failed:`, error.message);
      return false;
    }

    console.log(`✅ ${type} login successful!`);
    console.log('User ID:', data.user.id);
    console.log('User email:', data.user.email);
    console.log('User metadata:', JSON.stringify(data.user.user_metadata));

    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
    } else if (profileData) {
      console.log('✅ Profile found:', JSON.stringify(profileData));
    } else {
      console.warn('⚠️ No profile found for user');
    }

    return true;
  } catch (err) {
    console.error(`❌ ${type} login exception:`, err);
    return false;
  }
}

// Run all tests
async function runTests() {
  await testConnection();

  // Test each set of credentials
  for (const cred of testCredentials) {
    await testLogin(cred.email, cred.password, cred.type);
  }

  console.log('\n=== Testing Complete ===');
}

// Execute the tests
runTests();
