// Fix admin user
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

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

// Create a new admin user
async function createAdminUser() {
  console.log('=== Creating New Admin User ===');
  
  try {
    // First, try to sign up a new admin user
    console.log('Signing up new admin user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@itsfait.com',
      password: 'admin123',
      options: {
        data: {
          full_name: 'Admin User',
          user_type: 'admin'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
      
      // If sign up failed, try to sign in with the credentials
      console.log('Trying to sign in with admin credentials...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@itsfait.com',
        password: 'admin123'
      });
      
      if (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
        return null;
      }
      
      console.log('✅ Sign in successful!');
      return signInData.user;
    }
    
    console.log('✅ Sign up successful!');
    return signUpData.user;
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    return null;
  }
}

// Create or update admin profile
async function createOrUpdateAdminProfile(userId) {
  console.log('=== Creating/Updating Admin Profile ===');
  
  if (!userId) {
    console.error('❌ No user ID provided');
    return;
  }
  
  try {
    // Check if profile exists
    console.log('Checking if profile exists...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError.message);
      return;
    }
    
    if (existingProfile) {
      console.log('✅ Profile exists, updating...');
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: 'admin',
          full_name: 'Admin User',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
      } else {
        console.log('✅ Profile updated successfully!');
      }
    } else {
      console.log('Profile does not exist, creating...');
      
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'admin@itsfait.com',
          user_type: 'admin',
          full_name: 'Admin User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('❌ Error creating profile:', insertError.message);
      } else {
        console.log('✅ Profile created successfully!');
      }
    }
  } catch (err) {
    console.error('❌ Error creating/updating profile:', err);
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('=== Testing Admin Login ===');
  
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
      console.error('❌ Admin profile not found:', profileError.message);
    } else {
      console.log('✅ Admin profile found:', JSON.stringify(profileData));
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error testing admin login:', err);
    return false;
  }
}

// Run the fix
async function runFix() {
  // First, test if admin login works
  const loginWorks = await testAdminLogin();
  
  if (loginWorks) {
    console.log('✅ Admin login already works!');
    return;
  }
  
  console.log('❌ Admin login does not work, attempting to fix...');
  
  // Create a new admin user
  const user = await createAdminUser();
  
  if (user) {
    // Create or update admin profile
    await createOrUpdateAdminProfile(user.id);
    
    // Test admin login again
    const fixedLogin = await testAdminLogin();
    
    if (fixedLogin) {
      console.log('✅ Fix successful! Admin login now works.');
    } else {
      console.log('❌ Fix unsuccessful. Admin login still does not work.');
    }
  } else {
    console.log('❌ Could not create or sign in as admin user.');
  }
  
  // Final sign out
  await supabase.auth.signOut();
}

// Run the fix
runFix().catch(err => {
  console.error('Error running fix:', err);
  process.exit(1);
});
