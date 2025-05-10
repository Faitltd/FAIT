// Script to log in with test users and fix profiles if needed
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
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin', userType: 'admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client', userType: 'client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent', userType: 'service_agent' }
];

// Function to check if profile exists
async function checkProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking profile:', error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception checking profile:', err);
    return null;
  }
}

// Function to create profile
async function createProfile(userId, email, userType, fullName) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        user_type: userType,
        full_name: fullName || `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`Error creating profile for ${email}:`, error.message);
      return false;
    }
    
    console.log(`Created profile for ${email}`);
    return true;
  } catch (err) {
    console.error(`Exception creating profile for ${email}:`, err);
    return false;
  }
}

// Test login and fix profile if needed
async function testLoginAndFixProfile(email, password, type, userType) {
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
    const profile = await checkProfile(data.user.id);
    
    if (profile) {
      console.log(`✅ Profile found for ${email}:`, profile);
      
      // Check if profile has correct user_type
      if (profile.user_type !== userType) {
        console.log(`Profile has incorrect user_type: ${profile.user_type}, should be ${userType}`);
        
        // Update profile
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              user_type: userType,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
          
          if (updateError) {
            console.error(`❌ Error updating profile for ${email}:`, updateError.message);
          } else {
            console.log(`✅ Updated profile for ${email} to user_type: ${userType}`);
          }
        } catch (err) {
          console.error(`❌ Exception updating profile for ${email}:`, err);
        }
      }
    } else {
      console.log(`⚠️ No profile found for ${email}, creating one...`);
      
      // Create profile
      const fullName = data.user.user_metadata?.full_name || `${type} User`;
      await createProfile(data.user.id, email, userType, fullName);
      
      // Verify profile was created
      const newProfile = await checkProfile(data.user.id);
      if (newProfile) {
        console.log(`✅ Profile created and verified for ${email}`);
      } else {
        console.error(`❌ Failed to verify profile creation for ${email}`);
      }
    }
    
    return true;
  } catch (err) {
    console.error(`❌ ${type} login exception:`, err);
    return false;
  }
}

// Run all tests and fixes
async function runTestsAndFixes() {
  // Test each set of credentials
  for (const cred of testCredentials) {
    await testLoginAndFixProfile(cred.email, cred.password, cred.type, cred.userType);
  }
  
  console.log('\n=== Testing and Fixes Complete ===');
  console.log('You should now be able to log in with all test credentials.');
}

// Execute the tests and fixes
runTestsAndFixes();
