// Test Authentication Script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== FAIT Authentication Test ===');
console.log('Supabase URL:', supabaseUrl || 'Not set');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present (hidden)' : 'Not set');

// Test credentials
const testCredentials = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  console.log('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase client
console.log('\nCreating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test authentication
async function testAuth() {
  console.log('\n=== Testing Authentication ===');
  
  for (const cred of testCredentials) {
    console.log(`\nTesting ${cred.type} login: ${cred.email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });
      
      if (error) {
        console.error(`❌ Login failed: ${error.message}`);
      } else {
        console.log('✅ Login successful!');
        console.log(`User ID: ${data.user.id}`);
        console.log(`Email: ${data.user.email}`);
        
        // Sign out
        await supabase.auth.signOut();
        console.log('✅ Signed out successfully');
      }
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }
}

// Run the tests
testAuth().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
