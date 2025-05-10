// Script to fix admin user
import { createClient } from '@supabase/supabase-js';

// Using hardcoded Supabase credentials from your .env file
const supabaseUrl = "https://ydisdyadjupyswcpbxzu.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQzMzU4NywiZXhwIjoyMDU5MDA5NTg3fQ.96Ark16R_T-InjvpbelqLzgPLt_OswZFFr876pg-C5A";

console.log('Supabase URL:', supabaseUrl);
console.log('Using service role key for admin privileges');

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase admin client created');

// Function to create a new admin user
async function createAdminUser() {
  console.log('\n=== Creating New Admin User ===');
  
  try {
    // First check if admin@itsfait.com already exists
    const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers({
      filters: {
        email: 'admin@itsfait.com'
      }
    });
    
    if (searchError) {
      console.error('❌ Error searching for existing admin user:', searchError.message);
      return null;
    }
    
    // If admin user exists, delete it first
    if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      const adminUser = existingUsers.users[0];
      console.log(`Found existing admin user: ${adminUser.email} (ID: ${adminUser.id})`);
      
      // Delete the user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(adminUser.id);
      
      if (deleteError) {
        console.error('❌ Error deleting existing admin user:', deleteError.message);
        return null;
      }
      
      console.log('✅ Deleted existing admin user');
    }
    
    // Create new admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@itsfait.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        user_type: 'admin'
      }
    });
    
    if (error) {
      console.error('❌ Error creating admin user:', error.message);
      return null;
    }
    
    console.log('✅ Created new admin user:', data.user.email);
    return data.user;
  } catch (err) {
    console.error('❌ Exception creating admin user:', err);
    return null;
  }
}

// Function to create admin profile
async function createAdminProfile(userId) {
  console.log('\n=== Creating Admin Profile ===');
  
  try {
    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('❌ Error checking for existing admin profile:', checkError.message);
      return false;
    }
    
    if (existingProfile) {
      console.log('Admin profile already exists, updating it...');
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: 'admin',
          full_name: 'Admin User',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating admin profile:', updateError.message);
        return false;
      }
      
      console.log('✅ Updated admin profile');
      return true;
    }
    
    // Create new profile
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
      console.error('❌ Error creating admin profile:', insertError.message);
      return false;
    }
    
    console.log('✅ Created admin profile');
    return true;
  } catch (err) {
    console.error('❌ Exception creating admin profile:', err);
    return false;
  }
}

// Main function to fix admin user
async function fixAdminUser() {
  console.log('=== Starting Admin User Fix ===');
  
  // Create or recreate admin user
  const adminUser = await createAdminUser();
  
  if (adminUser) {
    // Create or update admin profile
    await createAdminProfile(adminUser.id);
  }
  
  console.log('\n=== Admin User Fix Complete ===');
  console.log('Try logging in with admin@itsfait.com / admin123 now.');
}

// Run the fix
fixAdminUser();
