/**
 * Test Authentication Credentials
 *
 * This script tests the authentication credentials to ensure they work as expected.
 * It uses the Supabase client to sign in with the test credentials.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Test credentials
const TEST_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.Iy_qqNtTzVi-XVKzBqDWOUGJdFV9ckLynR_bRLUvdnY';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function to sign in with credentials
async function testCredentials(email, password, type) {
  console.log(`Testing ${type} credentials: ${email} / ${password}`);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`❌ ${type} login failed:`, error.message);
      return false;
    }

    if (data?.user) {
      console.log(`✅ ${type} login successful!`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`User Email: ${data.user.email}`);
      console.log(`User Metadata:`, data.user.user_metadata);
      return true;
    } else {
      console.error(`❌ ${type} login failed: No user data returned`);
      return false;
    }
  } catch (err) {
    console.error(`❌ ${type} login failed with exception:`, err);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('=== Testing Authentication Credentials ===');
  console.log(`Using Supabase URL: ${supabaseUrl}`);

  let allPassed = true;

  for (const cred of TEST_CREDENTIALS) {
    const success = await testCredentials(cred.email, cred.password, cred.type);
    if (!success) {
      allPassed = false;
    }
    console.log('---');
  }

  if (allPassed) {
    console.log('✅ All authentication tests passed!');
    process.exit(0);
  } else {
    console.error('❌ Some authentication tests failed!');
    process.exit(1);
  }
}

// Run the tests
runTests();
