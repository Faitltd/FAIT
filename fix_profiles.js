// Script to fix profiles for test users
import { createClient } from '@supabase/supabase-js';

// Using hardcoded Supabase credentials from your .env file
const supabaseUrl = "https://ydisdyadjupyswcpbxzu.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQzMzU4NywiZXhwIjoyMDU5MDA5NTg3fQ.96Ark16R_T-InjvpbelqLzgPLt_OswZFFr876pg-C5A";

console.log('Supabase URL:', supabaseUrl);
console.log('Using service role key for admin privileges');

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase admin client created');

// Test credentials
const testUsers = [
  { email: 'admin@itsfait.com', userType: 'admin', fullName: 'Admin User' },
  { email: 'client@itsfait.com', userType: 'client', fullName: 'Client User' },
  { email: 'service@itsfait.com', userType: 'service_agent', fullName: 'Service Agent User' }
];

// Function to get users from auth
async function getUsers() {
  console.log('\n=== Getting Users ===');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error getting users:', error.message);
      return null;
    }
    
    // Filter to only our test users
    const testUserEmails = testUsers.map(u => u.email.toLowerCase());
    const filteredUsers = data.users.filter(u => 
      testUserEmails.includes(u.email.toLowerCase())
    );
    
    console.log(`Found ${filteredUsers.length} test users:`);
    filteredUsers.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });
    
    return filteredUsers;
  } catch (err) {
    console.error('❌ Exception getting users:', err);
    return null;
  }
}

// Function to check if profiles exist for test users
async function checkProfiles() {
  console.log('\n=== Checking Profiles for Test Users ===');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, user_type')
      .in('email', testUsers.map(u => u.email.toLowerCase()));
    
    if (error) {
      console.error('❌ Error checking profiles:', error.message);
      return null;
    }
    
    console.log(`Found ${data.length} profiles:`);
    data.forEach(profile => {
      console.log(`- ${profile.email} (${profile.user_type})`);
    });
    
    return data;
  } catch (err) {
    console.error('❌ Exception checking profiles:', err);
    return null;
  }
}

// Function to create or update profiles
async function fixProfiles(users, existingProfiles) {
  console.log('\n=== Fixing Profiles ===');
  
  // Create a map of existing profiles by email
  const profileMap = {};
  if (existingProfiles) {
    existingProfiles.forEach(profile => {
      profileMap[profile.email.toLowerCase()] = profile;
    });
  }
  
  // Process each test user
  for (const user of users) {
    const testUser = testUsers.find(tu => tu.email.toLowerCase() === user.email.toLowerCase());
    if (!testUser) continue;
    
    const email = user.email.toLowerCase();
    const existingProfile = profileMap[email];
    
    if (existingProfile) {
      console.log(`Profile exists for ${email}, checking if it needs updates...`);
      
      // Check if profile needs updates
      if (existingProfile.user_type !== testUser.userType) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              user_type: testUser.userType,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          if (error) {
            console.error(`❌ Error updating profile for ${email}:`, error.message);
          } else {
            console.log(`✅ Updated profile for ${email} to user_type: ${testUser.userType}`);
          }
        } catch (err) {
          console.error(`❌ Exception updating profile for ${email}:`, err);
        }
      } else {
        console.log(`✅ Profile for ${email} is already correct`);
      }
    } else {
      console.log(`Creating new profile for ${email}...`);
      
      try {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: email,
            user_type: testUser.userType,
            full_name: testUser.fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error(`❌ Error creating profile for ${email}:`, error.message);
        } else {
          console.log(`✅ Created profile for ${email}`);
        }
      } catch (err) {
        console.error(`❌ Exception creating profile for ${email}:`, err);
      }
    }
  }
}

// Main function to run all checks and fixes
async function runProfileFixes() {
  console.log('=== Starting Profile Fixes ===');
  
  // Get users
  const users = await getUsers();
  if (!users || users.length === 0) {
    console.error('❌ No test users found');
    return;
  }
  
  // Check existing profiles
  const profiles = await checkProfiles();
  
  // Fix profiles
  await fixProfiles(users, profiles);
  
  console.log('\n=== Profile Fixes Complete ===');
  console.log('Try logging in with your test credentials now.');
}

// Run the fixes
runProfileFixes();
