// Script to test admin login
import { createClient } from '@supabase/supabase-js';

// Using hardcoded Supabase credentials from your .env file
const supabaseUrl = "https://ydisdyadjupyswcpbxzu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.u2hCWysJmyRyo4ZWBruDUSHAjzj9_Ibv81z7lPyx1JY";

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey.substring(0, 5) + '...');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client created');

// Test admin login
async function testAdminLogin() {
  console.log('\n=== Testing Admin Login ===');
  console.log('Email: admin@itsfait.com');
  console.log('Password: admin123');
  
  try {
    // Sign out first to ensure clean state
    await supabase.auth.signOut();
    console.log('Signed out previous session');
    
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@itsfait.com',
      password: 'admin123'
    });
    
    if (error) {
      console.error('❌ Admin login failed:', error.message);
      return false;
    }
    
    console.log('✅ Admin login successful!');
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
      console.warn('⚠️ No profile found for admin user');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Admin login exception:', err);
    return false;
  }
}

// Run the test
testAdminLogin();
