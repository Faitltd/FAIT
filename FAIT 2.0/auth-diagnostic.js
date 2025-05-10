// FAIT 2.0 Authentication Diagnostic Tool
import { createClient } from '@supabase/supabase-js';

// Default Supabase credentials (from your codebase)
const DEFAULT_SUPABASE_URL = 'https://ydisdyadjupyswcpbxzu.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.Iy_qqNtTzVi-XVKzBqDWOUGJdFV9ckLynR_bRLUvdnY';

// Test credentials from your codebase
const TEST_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

// Get environment variables
const envSupabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const envSupabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Log configuration
console.log('=== FAIT 2.0 Authentication Diagnostic ===');
console.log('Environment Variables:');
console.log('- VITE_SUPABASE_URL:', envSupabaseUrl || 'Not set');
console.log('- VITE_SUPABASE_ANON_KEY:', envSupabaseKey ? 'Set (hidden)' : 'Not set');
console.log('\nUsing:');
const supabaseUrl = envSupabaseUrl || DEFAULT_SUPABASE_URL;
const supabaseKey = envSupabaseKey || DEFAULT_SUPABASE_KEY;
console.log('- Supabase URL:', supabaseUrl);
console.log('- Using default key:', !envSupabaseKey);

// Check localStorage
console.log('\nChecking localStorage:');
try {
  const localAuthMode = localStorage.getItem('useLocalAuth');
  console.log('- useLocalAuth:', localAuthMode);
  
  const storedSession = localStorage.getItem('supabase.auth.token');
  console.log('- Existing session:', storedSession ? 'Found' : 'None');
  
  // Clear any existing sessions if needed
  if (storedSession) {
    console.log('- Clearing existing session for testing');
    localStorage.removeItem('supabase.auth.token');
  }
} catch (error) {
  console.error('- Error accessing localStorage:', error.message);
}

// Create Supabase client
console.log('\nInitializing Supabase client...');
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  console.log('- Supabase client created successfully');
  
  // Check if auth methods exist
  if (supabase.auth) {
    console.log('- Auth module exists');
    console.log('- signInWithPassword method:', typeof supabase.auth.signInWithPassword === 'function' ? 'Exists' : 'Missing');
    console.log('- signOut method:', typeof supabase.auth.signOut === 'function' ? 'Exists' : 'Missing');
  } else {
    console.error('- Auth module missing!');
  }
} catch (error) {
  console.error('- Failed to create Supabase client:', error.message);
}

// Test authentication
async function testAuth() {
  console.log('\n=== Testing Authentication ===');
  
  if (!supabase || !supabase.auth) {
    console.error('Cannot test authentication: Supabase client not properly initialized');
    return;
  }
  
  // Test each credential
  for (const cred of TEST_CREDENTIALS) {
    console.log(`\nTesting ${cred.type} login: ${cred.email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });
      
      if (error) {
        console.error(`- Login failed: ${error.message}`);
        console.error('- Error details:', error);
      } else if (data?.user) {
        console.log('- Login successful!');
        console.log('- User ID:', data.user.id);
        console.log('- Email:', data.user.email);
        console.log('- User metadata:', data.user.user_metadata);
        
        // Check for session
        if (data.session) {
          console.log('- Session expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
        } else {
          console.warn('- No session returned despite successful login');
        }
        
        // Sign out
        await supabase.auth.signOut();
        console.log('- Signed out successfully');
      } else {
        console.warn('- Login did not return an error but no user data was returned');
      }
    } catch (err) {
      console.error(`- Error during authentication: ${err.message}`);
    }
  }
}

// Check for custom login
async function testCustomLogin() {
  console.log('\n=== Testing Custom Email/Password ===');
  
  const email = prompt('Enter email (or leave empty to skip):');
  if (!email) {
    console.log('Skipping custom login test');
    return;
  }
  
  const password = prompt('Enter password:');
  
  try {
    console.log(`Testing login with: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error(`- Login failed: ${error.message}`);
    } else if (data?.user) {
      console.log('- Login successful!');
      console.log('- User ID:', data.user.id);
      console.log('- Email:', data.user.email);
      
      // Sign out
      await supabase.auth.signOut();
      console.log('- Signed out successfully');
    } else {
      console.warn('- Login did not return an error but no user data was returned');
    }
  } catch (err) {
    console.error(`- Error during authentication: ${err.message}`);
  }
}

// Run tests
async function runDiagnostic() {
  await testAuth();
  await testCustomLogin();
  
  console.log('\n=== Diagnostic Complete ===');
  console.log('If you are still experiencing issues, please check:');
  console.log('1. Your Supabase project configuration');
  console.log('2. Network connectivity to Supabase');
  console.log('3. Browser console for additional errors');
  console.log('4. That the test users exist in your Supabase instance');
}

// Run the diagnostic
runDiagnostic();
