// Check Supabase configuration and test users
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Test credentials
const testCredentials = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'service_agent' }
];

// Print environment variables
console.log('=== Environment Variables ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl || 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present (hidden)' : 'Not set');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Present (hidden)' : 'Not set');
console.log();

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

// Check for service key
if (!supabaseServiceKey) {
  console.log('⚠️ SUPABASE_SERVICE_KEY not provided');
  console.log('Cannot perform admin operations without service key');
  console.log();
}

// Check Supabase configuration files
async function checkConfigFiles() {
  console.log('=== Checking Configuration Files ===');
  
  // Check .env file
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ .env file exists');
      
      // Check for required variables
      const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
      const hasSupabaseAnonKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');
      const hasServiceKey = envContent.includes('SUPABASE_SERVICE_KEY=');
      
      console.log('  - VITE_SUPABASE_URL:', hasSupabaseUrl ? 'Present' : 'Missing');
      console.log('  - VITE_SUPABASE_ANON_KEY:', hasSupabaseAnonKey ? 'Present' : 'Missing');
      console.log('  - SUPABASE_SERVICE_KEY:', hasServiceKey ? 'Present' : 'Missing');
    } else {
      console.log('❌ .env file does not exist');
    }
  } catch (err) {
    console.error('❌ Error checking .env file:', err);
  }
  
  // Check supabase.ts file
  try {
    const supabasePath = path.resolve('src/lib/supabase.ts');
    if (fs.existsSync(supabasePath)) {
      const supabaseContent = fs.readFileSync(supabasePath, 'utf8');
      console.log('✅ supabase.ts file exists');
      
      // Check for key imports
      const importsCreateClient = supabaseContent.includes('createClient');
      const usesEnvVars = supabaseContent.includes('import.meta.env.VITE_SUPABASE_URL') || 
                          supabaseContent.includes('process.env.VITE_SUPABASE_URL');
      
      console.log('  - Imports createClient:', importsCreateClient ? 'Yes' : 'No');
      console.log('  - Uses environment variables:', usesEnvVars ? 'Yes' : 'No');
      
      // Check for local auth
      const hasLocalAuth = supabaseContent.includes('useLocalAuth') || 
                          supabaseContent.includes('localAuth');
      
      console.log('  - Has local auth implementation:', hasLocalAuth ? 'Yes' : 'No');
    } else {
      console.log('❌ supabase.ts file does not exist');
    }
  } catch (err) {
    console.error('❌ Error checking supabase.ts file:', err);
  }
  
  console.log();
}

// Test connection
async function testConnection() {
  console.log('=== Testing Connection ===');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Connection test successful');
      if (data.session) {
        console.log('Session found:', data.session.user.email);
      } else {
        console.log('No active session');
      }
    }
  } catch (err) {
    console.error('❌ Connection test exception:', err);
  }
  console.log();
}

// Check if admin API is available
async function checkAdminAPI() {
  if (!supabaseServiceKey) {
    console.log('=== Skipping Admin API Check ===');
    console.log('SUPABASE_SERVICE_KEY not provided');
    console.log();
    return false;
  }
  
  console.log('=== Checking Admin API ===');
  
  // Create admin client
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log('Testing admin API...');
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      limit: 1
    });
    
    if (error) {
      console.error('❌ Admin API check failed:', error.message);
      console.log();
      return false;
    }
    
    console.log('✅ Admin API is available');
    console.log();
    return true;
  } catch (err) {
    console.error('❌ Admin API check exception:', err);
    console.log();
    return false;
  }
}

// Check if test users exist
async function checkTestUsers() {
  console.log('=== Checking Test Users ===');
  
  const adminApiAvailable = await checkAdminAPI();
  
  if (adminApiAvailable && supabaseServiceKey) {
    // Create admin client
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Check each test user
    for (const cred of testCredentials) {
      console.log(`Checking ${cred.type} user (${cred.email})...`);
      
      try {
        // Check if user exists
        const { data, error } = await adminSupabase.auth.admin.listUsers({
          filter: {
            email: cred.email
          }
        });
        
        if (error) {
          console.error(`❌ Error checking ${cred.type} user:`, error.message);
          continue;
        }
        
        if (!data || data.users.length === 0) {
          console.log(`❌ ${cred.type} user does not exist`);
          
          // Ask if we should create the user
          console.log(`Would you like to create the ${cred.type} user? (y/n)`);
          const answer = await new Promise(resolve => {
            process.stdin.once('data', data => {
              resolve(data.toString().trim().toLowerCase());
            });
          });
          
          if (answer === 'y' || answer === 'yes') {
            console.log(`Creating ${cred.type} user...`);
            
            // Create the user
            const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
              email: cred.email,
              password: cred.password,
              email_confirm: true,
              user_metadata: {
                full_name: `${cred.type.charAt(0).toUpperCase() + cred.type.slice(1)} User`,
                user_type: cred.type
              }
            });
            
            if (createError) {
              console.error(`❌ Failed to create ${cred.type} user:`, createError.message);
            } else {
              console.log(`✅ ${cred.type} user created successfully!`);
              console.log(`User ID: ${newUser.user.id}`);
              
              // Create profile
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: newUser.user.id,
                  email: cred.email,
                  user_type: cred.type,
                  full_name: `${cred.type.charAt(0).toUpperCase() + cred.type.slice(1)} User`,
                  created_at: new Date().toISOString()
                });
              
              if (profileError) {
                console.error(`❌ Failed to create profile:`, profileError.message);
              } else {
                console.log(`✅ Profile created successfully!`);
              }
            }
          }
        } else {
          console.log(`✅ ${cred.type} user exists`);
          console.log(`User ID: ${data.users[0].id}`);
          
          // Check if profile exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.users[0].id)
            .single();
          
          if (profileError) {
            console.error(`❌ ${cred.type} profile not found:`, profileError.message);
            
            // Ask if we should create the profile
            console.log(`Would you like to create a profile for the ${cred.type} user? (y/n)`);
            const answer = await new Promise(resolve => {
              process.stdin.once('data', data => {
                resolve(data.toString().trim().toLowerCase());
              });
            });
            
            if (answer === 'y' || answer === 'yes') {
              console.log(`Creating profile for ${cred.type} user...`);
              
              // Create profile
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.users[0].id,
                  email: cred.email,
                  user_type: cred.type,
                  full_name: `${cred.type.charAt(0).toUpperCase() + cred.type.slice(1)} User`,
                  created_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error(`❌ Failed to create profile:`, insertError.message);
              } else {
                console.log(`✅ Profile created successfully!`);
              }
            }
          } else {
            console.log(`✅ ${cred.type} profile found:`);
            console.log(`  Full Name: ${profileData.full_name || 'Not set'}`);
            console.log(`  User Type: ${profileData.user_type || 'Not set'}`);
          }
          
          // Ask if we should reset the password
          console.log(`Would you like to reset the password for the ${cred.type} user? (y/n)`);
          const answer = await new Promise(resolve => {
            process.stdin.once('data', data => {
              resolve(data.toString().trim().toLowerCase());
            });
          });
          
          if (answer === 'y' || answer === 'yes') {
            console.log(`Resetting password for ${cred.type} user...`);
            
            // Reset password
            const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
              data.users[0].id,
              { 
                password: cred.password
              }
            );
            
            if (updateError) {
              console.error(`❌ Failed to reset password:`, updateError.message);
            } else {
              console.log(`✅ Password reset successfully!`);
            }
          }
        }
      } catch (err) {
        console.error(`❌ Error checking ${cred.type} user:`, err);
      }
      
      console.log();
    }
  } else {
    // Test login with each credential
    for (const cred of testCredentials) {
      console.log(`Testing ${cred.type} login (${cred.email})...`);
      
      try {
        // Sign out first to ensure clean state
        await supabase.auth.signOut();
        
        // Attempt to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cred.email,
          password: cred.password
        });
        
        if (error) {
          console.error(`❌ ${cred.type} login failed:`, error.message);
        } else {
          console.log(`✅ ${cred.type} login successful!`);
          console.log(`User ID: ${data.user.id}`);
          
          // Check if profile exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            console.error(`❌ ${cred.type} profile not found:`, profileError.message);
          } else {
            console.log(`✅ ${cred.type} profile found:`);
            console.log(`  Full Name: ${profileData.full_name || 'Not set'}`);
            console.log(`  User Type: ${profileData.user_type || 'Not set'}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error testing ${cred.type} login:`, err);
      }
      
      console.log();
    }
  }
}

// Run all checks
async function runChecks() {
  await checkConfigFiles();
  await testConnection();
  await checkTestUsers();
  
  // Final sign out
  await supabase.auth.signOut();
  
  console.log('=== All checks completed ===');
  process.exit(0);
}

// Run the checks
runChecks().catch(err => {
  console.error('Error running checks:', err);
  process.exit(1);
});
