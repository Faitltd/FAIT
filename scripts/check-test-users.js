// Check if test users exist in the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables or use hardcoded values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY is required to check users');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test users to check
const testUsers = [
  { email: 'admin@itsfait.com', type: 'Admin' },
  { email: 'client@itsfait.com', type: 'Client' },
  { email: 'service@itsfait.com', type: 'Service Agent' }
];

async function checkUsers() {
  console.log('=== Checking Test Users ===');
  console.log('Supabase URL:', supabaseUrl);
  
  for (const user of testUsers) {
    console.log(`\nChecking ${user.type} (${user.email})...`);
    
    try {
      // Check if user exists in auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
        filter: {
          email: user.email
        }
      });
      
      if (userError) {
        console.error(`❌ Error checking ${user.type}:`, userError.message);
        continue;
      }
      
      if (!userData || userData.users.length === 0) {
        console.log(`❌ ${user.type} user does not exist in auth.users`);
        console.log('Creating user...');
        
        // Create the user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.type === 'Admin' ? 'admin123' : 
                   user.type === 'Client' ? 'client123' : 'service123',
          email_confirm: true,
          user_metadata: {
            full_name: `${user.type} User`,
            user_type: user.type === 'Admin' ? 'admin' : 
                      user.type === 'Service Agent' ? 'service_agent' : 'client'
          }
        });
        
        if (createError) {
          console.error(`❌ Failed to create ${user.type}:`, createError.message);
        } else {
          console.log(`✅ ${user.type} created successfully!`);
          console.log(`User ID: ${newUser.user.id}`);
          
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: newUser.user.id,
              email: user.email,
              user_type: user.type === 'Admin' ? 'admin' : 
                        user.type === 'Service Agent' ? 'service_agent' : 'client',
              full_name: `${user.type} User`,
              created_at: new Date().toISOString()
            });
          
          if (profileError) {
            console.error(`❌ Failed to create profile:`, profileError.message);
          } else {
            console.log(`✅ Profile created successfully!`);
          }
        }
      } else {
        console.log(`✅ ${user.type} user exists in auth.users`);
        const userId = userData.users[0].id;
        console.log(`User ID: ${userId}`);
        
        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error(`❌ ${user.type} profile not found:`, profileError.message);
          
          // Create profile
          console.log(`Creating profile for ${user.type}...`);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user.email,
              user_type: user.type === 'Admin' ? 'admin' : 
                        user.type === 'Service Agent' ? 'service_agent' : 'client',
              full_name: `${user.type} User`,
              created_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error(`❌ Failed to create profile:`, insertError.message);
          } else {
            console.log(`✅ Profile created successfully!`);
          }
        } else {
          console.log(`✅ ${user.type} profile found:`);
          console.log(`  Full Name: ${profileData.full_name || 'Not set'}`);
          console.log(`  User Type: ${profileData.user_type || 'Not set'}`);
        }
        
        // Reset password to ensure it's correct
        console.log(`Resetting password for ${user.type}...`);
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { 
            password: user.type === 'Admin' ? 'admin123' : 
                     user.type === 'Client' ? 'client123' : 'service123'
          }
        );
        
        if (updateError) {
          console.error(`❌ Failed to reset password:`, updateError.message);
        } else {
          console.log(`✅ Password reset successfully!`);
        }
      }
    } catch (err) {
      console.error(`Error checking ${user.type}:`, err);
    }
  }
  
  console.log('\nAll checks completed.');
}

// Run the checks
checkUsers().catch(err => {
  console.error('Error running checks:', err);
  process.exit(1);
});
