// Test login functionality with required credentials
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test credentials
const testCredentials = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

async function testLogin() {
  console.log('=== Testing Login Functionality ===');
  console.log('Supabase URL:', supabaseUrl);
  
  let successCount = 0;
  
  // Test each set of credentials
  for (const cred of testCredentials) {
    console.log(`\nTesting ${cred.type} login (${cred.email})...`);
    
    try {
      // Sign out first to ensure clean state
      await supabase.auth.signOut();
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });
      
      if (error) {
        console.error(`❌ Login failed: ${error.message}`);
        console.error('Error details:', error);
      } else if (data && data.user) {
        console.log('✅ Login successful!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        
        // Get user profile to determine user type
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('❌ Error fetching profile:', profileError.message);
        } else if (profileData) {
          console.log('User type:', profileData.user_type);
        }
        
        successCount++;
      } else {
        console.error('❌ Login failed: No user data returned');
      }
    } catch (err) {
      console.error('❌ Exception during login:', err);
    }
  }
  
  console.log('\n=== Login Test Summary ===');
  console.log(`${successCount} of ${testCredentials.length} logins successful`);
  
  // Final sign out
  await supabase.auth.signOut();
  
  return successCount === testCredentials.length;
}

// Run the test
testLogin()
  .then(success => {
    if (success) {
      console.log('\n✅ All login tests passed!');
      process.exit(0);
    } else {
      console.error('\n❌ Some login tests failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error running tests:', err);
    process.exit(1);
  });
