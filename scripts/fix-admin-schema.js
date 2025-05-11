// Script to fix the admin user database schema issue
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase client with service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin user details
const adminEmail = 'admin@itsfait.com';
const adminPassword = 'admin123';

/**
 * Test if admin login works
 */
async function testAdminLogin() {
  console.log('Testing admin login...');
  
  try {
    // Sign out first to ensure clean state
    await supabase.auth.signOut();
    
    // Attempt to sign in as admin
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (error) {
      console.error('❌ Admin login failed:', error.message);
      return false;
    }
    
    console.log('✅ Admin login successful!');
    console.log('User ID:', data.user.id);
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching admin profile:', profileError.message);
    } else if (profileData) {
      console.log('✅ Admin profile found:', profileData.user_type);
    } else {
      console.log('❌ Admin profile not found');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error testing admin login:', err);
    return false;
  }
}

/**
 * Fix admin user in auth.users table
 */
async function fixAdminUser() {
  console.log('Fixing admin user in auth.users table...');
  
  try {
    // First, try to find the admin user
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      filter: {
        email: adminEmail
      }
    });
    
    if (userError) {
      console.error('❌ Error finding admin user:', userError.message);
      return null;
    }
    
    let adminUser = userData.users.find(user => user.email === adminEmail);
    
    if (adminUser) {
      console.log('✅ Admin user found, updating...');
      
      // Update the admin user
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        {
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            full_name: 'Admin User',
            user_type: 'admin'
          }
        }
      );
      
      if (updateError) {
        console.error('❌ Error updating admin user:', updateError.message);
        return null;
      }
      
      console.log('✅ Admin user updated successfully');
      return updateData.user;
    } else {
      console.log('❌ Admin user not found, creating new admin user...');
      
      // Create a new admin user
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin User',
          user_type: 'admin'
        }
      });
      
      if (createError) {
        console.error('❌ Error creating admin user:', createError.message);
        return null;
      }
      
      console.log('✅ Admin user created successfully');
      return createData.user;
    }
  } catch (err) {
    console.error('❌ Error fixing admin user:', err);
    return null;
  }
}

/**
 * Fix admin profile in profiles table
 */
async function fixAdminProfile(userId) {
  console.log('Fixing admin profile in profiles table...');
  
  try {
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError && !profileError.message.includes('No rows found')) {
      console.error('❌ Error checking admin profile:', profileError.message);
      return false;
    }
    
    if (existingProfile) {
      console.log('✅ Admin profile found, updating...');
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: adminEmail,
          full_name: 'Admin User',
          user_type: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating admin profile:', updateError.message);
        return false;
      }
      
      console.log('✅ Admin profile updated successfully');
    } else {
      console.log('❌ Admin profile not found, creating new profile...');
      
      // Create a new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: adminEmail,
          full_name: 'Admin User',
          user_type: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('❌ Error creating admin profile:', insertError.message);
        return false;
      }
      
      console.log('✅ Admin profile created successfully');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error fixing admin profile:', err);
    return false;
  }
}

/**
 * Fix admin_users table entry
 */
async function fixAdminUsersTable(userId) {
  console.log('Fixing admin_users table entry...');
  
  try {
    // Check if admin_users table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    if (tableError && !tableError.message.includes('relation "admin_users" does not exist')) {
      console.error('❌ Error checking admin_users table:', tableError.message);
      return false;
    }
    
    // If table doesn't exist, we can skip this step
    if (tableError && tableError.message.includes('relation "admin_users" does not exist')) {
      console.log('ℹ️ admin_users table does not exist, skipping...');
      return true;
    }
    
    // Check if admin exists in admin_users
    const { data: existingAdmin, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (adminError && !adminError.message.includes('No rows found')) {
      console.error('❌ Error checking admin_users entry:', adminError.message);
      return false;
    }
    
    if (existingAdmin) {
      console.log('✅ Admin entry found in admin_users, updating...');
      
      // Update the admin entry
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('❌ Error updating admin_users entry:', updateError.message);
        return false;
      }
      
      console.log('✅ admin_users entry updated successfully');
    } else {
      console.log('❌ Admin entry not found in admin_users, creating new entry...');
      
      // Create a new admin entry
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          role: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('❌ Error creating admin_users entry:', insertError.message);
        return false;
      }
      
      console.log('✅ admin_users entry created successfully');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error fixing admin_users table:', err);
    return false;
  }
}

/**
 * Main function to fix admin user schema issues
 */
async function fixAdminSchema() {
  console.log('=== Starting Admin Schema Fix ===');
  
  // First, test if admin login works
  const loginWorks = await testAdminLogin();
  
  if (loginWorks) {
    console.log('✅ Admin login already works! No fix needed.');
    return true;
  }
  
  console.log('❌ Admin login does not work, attempting to fix...');
  
  // Fix admin user in auth.users table
  const adminUser = await fixAdminUser();
  
  if (!adminUser) {
    console.error('❌ Failed to fix admin user in auth.users table.');
    return false;
  }
  
  // Fix admin profile in profiles table
  const profileFixed = await fixAdminProfile(adminUser.id);
  
  if (!profileFixed) {
    console.error('❌ Failed to fix admin profile in profiles table.');
    return false;
  }
  
  // Fix admin_users table entry
  const adminUsersFixed = await fixAdminUsersTable(adminUser.id);
  
  if (!adminUsersFixed) {
    console.error('❌ Failed to fix admin_users table entry.');
    // This is not critical, so we can continue
  }
  
  // Test admin login again
  const fixedLogin = await testAdminLogin();
  
  if (fixedLogin) {
    console.log('✅ Fix successful! Admin login now works.');
    return true;
  } else {
    console.error('❌ Fix unsuccessful. Admin login still does not work.');
    return false;
  }
}

// Run the fix
fixAdminSchema()
  .then(success => {
    if (success) {
      console.log('\n✅ Admin schema fix completed successfully!');
      process.exit(0);
    } else {
      console.error('\n❌ Admin schema fix failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error running admin schema fix:', err);
    process.exit(1);
  });
