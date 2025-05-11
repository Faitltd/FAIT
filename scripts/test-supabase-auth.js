// Test Supabase authentication directly
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Test credentials
const testCredentials = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

// Print environment variables
console.log('=== Environment Variables ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl || 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present (hidden)' : 'Not set');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Present (hidden)' : 'Not set');
console.log();

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client
console.log('=== Creating Supabase Client ===');
console.log('Creating client with URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

console.log('Supabase client created');
console.log();

// Test connection
async function testConnection() {
  console.log('=== Testing Connection ===');
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
  console.log();
}

// Test login with credentials
async function testLogin(email, password, type) {
  console.log(`=== Testing ${type} Login ===`);
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
      console.error(`❌ ${type} profile not found:`, profileError.message);
    } else {
      console.log(`✅ ${type} profile found:`, JSON.stringify(profileData));
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error testing ${type} login:`, err);
    return false;
  } finally {
    console.log();
  }
}

// Test admin API if service key is available
async function testAdminAPI() {
  if (!supabaseServiceKey) {
    console.log('=== Skipping Admin API Tests ===');
    console.log('SUPABASE_SERVICE_KEY not provided');
    console.log();
    return;
  }
  
  console.log('=== Testing Admin API ===');
  
  // Create admin client
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log('Listing users...');
    const { data, error } = await adminSupabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Admin API test failed:', error.message);
    } else {
      console.log('✅ Admin API test successful');
      console.log(`Found ${data.users.length} users`);
      
      // Check if test users exist
      for (const cred of testCredentials) {
        const user = data.users.find(u => u.email === cred.email);
        if (user) {
          console.log(`✅ ${cred.type} user exists:`, user.id);
        } else {
          console.log(`❌ ${cred.type} user does not exist`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Admin API test exception:', err);
  }
  console.log();
}

// Run all tests
async function runTests() {
  await testConnection();
  await testAdminAPI();
  
  let successCount = 0;
  
  for (const cred of testCredentials) {
    const success = await testLogin(cred.email, cred.password, cred.type);
    if (success) successCount++;
  }
  
  console.log('=== Test Summary ===');
  console.log(`${successCount} of ${testCredentials.length} logins successful`);
  
  // Final sign out
  await supabase.auth.signOut();
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
