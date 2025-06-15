// Test login functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables or use hardcoded values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.Iy_qqNtTzVi-XVKzBqDWOUGJdFV9ckLynR_bRLUvdnY';

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
        console.error(`❌ ${cred.type} login failed:`, error.message);
      } else {
        console.log(`✅ ${cred.type} login successful!`);
        console.log(`User ID: ${data.user.id}`);
        
        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error(`❌ ${cred.type} profile not found:`, profileError.message);
          
          // Try to create profile
          console.log(`Attempting to create profile for ${cred.type}...`);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: cred.email,
              user_type: cred.type === 'Admin' ? 'admin' : 
                         cred.type === 'Service Agent' ? 'service_agent' : 'client',
              full_name: cred.type + ' User',
              created_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error(`❌ Failed to create profile:`, insertError.message);
          } else {
            console.log(`✅ Profile created successfully!`);
          }
        } else {
          console.log(`✅ ${cred.type} profile found:`);
          console.log(`  Full Name: ${profileData.full_name || 'Not set'}`);
          console.log(`  User Type: ${profileData.user_type || 'Not set'}`);
        }
      }
    } catch (err) {
      console.error(`Error testing ${cred.type} login:`, err);
    }
  }
  
  // Sign out at the end
  await supabase.auth.signOut();
  console.log('\nAll tests completed.');
}

// Run the tests
testLogin().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
