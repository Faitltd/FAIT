// Script to create users and profiles in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using service role key for admin privileges');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    // Use the connection pooler for efficient connection management
    poolMode: 'transaction'
  }
});

async function runDatabaseFix() {
  try {
    console.log('Creating necessary tables...');

    // Create profiles table if it doesn't exist
    const { error: profilesTableError } = await supabase.rpc('create_profiles_table_if_not_exists');

    if (profilesTableError) {
      console.log('Note: Could not create profiles table via RPC. This is expected if the function does not exist.');
      console.log('Attempting to create profiles table directly...');

      // Try to create the table directly
      const { error: createTableError } = await supabase.from('profiles').select('id').limit(1);

      if (createTableError && createTableError.code === '42P01') {
        console.log('Profiles table does not exist. Creating it...');

        // Create the table
        const { error: createError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            user_type TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            avatar_url TEXT
          );
        `);

        if (createError) {
          console.error('Error creating profiles table:', createError);
        } else {
          console.log('Profiles table created successfully!');
        }
      } else {
        console.log('Profiles table already exists.');
      }
    } else {
      console.log('Profiles table created or already exists.');
    }

    // Now create the users with proper passwords using the Auth API
    await createUsers();

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function createUsers() {
  try {
    console.log('Creating/updating users with proper passwords...');

    // Create/update service agent
    try {
      console.log('Creating/updating service agent...');
      const { data: serviceAgentData, error: serviceAgentError } = await supabase.auth.admin.createUser({
        email: 'service@itsfait.com',
        password: 'service123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Service Agent',
          user_type: 'service_agent'
        }
      });

      if (serviceAgentError) {
        console.error('Error creating service agent:', serviceAgentError);

        // Try to update the user if it already exists
        if (serviceAgentError.message.includes('already exists')) {
          console.log('Service agent already exists. Trying to update password...');

          // Try to find the user
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', 'service@itsfait.com')
            .single();

          if (userError) {
            console.error('Error finding service agent:', userError);
          } else if (userData) {
            console.log('Found service agent with ID:', userData.id);

            // Update the user's password
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              userData.id,
              { password: 'service123' }
            );

            if (updateError) {
              console.error('Error updating service agent password:', updateError);
            } else {
              console.log('Service agent password updated successfully!');
            }

            // Make sure the profile exists
            await ensureProfile(userData.id, 'service@itsfait.com', 'Service Agent', 'service_agent');
          }
        }
      } else {
        console.log('Service agent created successfully:', serviceAgentData.user.id);

        // Make sure the profile exists
        await ensureProfile(serviceAgentData.user.id, 'service@itsfait.com', 'Service Agent', 'service_agent');
      }
    } catch (err) {
      console.error('Error processing service agent:', err);
    }

    // Create/update client
    try {
      console.log('Creating/updating client...');
      const { data: clientData, error: clientError } = await supabase.auth.admin.createUser({
        email: 'client@itsfait.com',
        password: 'client123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Client User',
          user_type: 'client'
        }
      });

      if (clientError) {
        console.error('Error creating client:', clientError);

        // Try to update the user if it already exists
        if (clientError.message.includes('already exists')) {
          console.log('Client already exists. Trying to update password...');

          // Try to find the user
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', 'client@itsfait.com')
            .single();

          if (userError) {
            console.error('Error finding client:', userError);
          } else if (userData) {
            console.log('Found client with ID:', userData.id);

            // Update the user's password
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              userData.id,
              { password: 'client123' }
            );

            if (updateError) {
              console.error('Error updating client password:', updateError);
            } else {
              console.log('Client password updated successfully!');
            }

            // Make sure the profile exists
            await ensureProfile(userData.id, 'client@itsfait.com', 'Client User', 'client');
          }
        }
      } else {
        console.log('Client created successfully:', clientData.user.id);

        // Make sure the profile exists
        await ensureProfile(clientData.user.id, 'client@itsfait.com', 'Client User', 'client');
      }
    } catch (err) {
      console.error('Error processing client:', err);
    }

    // Create/update admin
    try {
      console.log('Creating/updating admin...');
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@itsfait.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin User',
          user_type: 'admin'
        }
      });

      if (adminError) {
        console.error('Error creating admin:', adminError);

        // Try to update the user if it already exists
        if (adminError.message.includes('already exists')) {
          console.log('Admin already exists. Trying to update password...');

          // Try to find the user
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', 'admin@itsfait.com')
            .single();

          if (userError) {
            console.error('Error finding admin:', userError);
          } else if (userData) {
            console.log('Found admin with ID:', userData.id);

            // Update the user's password
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              userData.id,
              { password: 'admin123' }
            );

            if (updateError) {
              console.error('Error updating admin password:', updateError);
            } else {
              console.log('Admin password updated successfully!');
            }

            // Make sure the profile exists
            await ensureProfile(userData.id, 'admin@itsfait.com', 'Admin User', 'admin');

            // Make sure the admin is in the admin_users table
            try {
              const { error: adminUserError } = await supabase
                .from('admin_users')
                .upsert({
                  user_id: userData.id,
                  is_active: true
                });

              if (adminUserError) {
                console.error('Error updating admin_users table:', adminUserError);
              } else {
                console.log('Admin added to admin_users table');
              }
            } catch (err) {
              console.error('Error updating admin_users table:', err);
            }
          }
        }
      } else {
        console.log('Admin created successfully:', adminData.user.id);

        // Make sure the profile exists
        await ensureProfile(adminData.user.id, 'admin@itsfait.com', 'Admin User', 'admin');

        // Make sure the admin is in the admin_users table
        try {
          const { error: adminUserError } = await supabase
            .from('admin_users')
            .upsert({
              user_id: adminData.user.id,
              is_active: true
            });

          if (adminUserError) {
            console.error('Error updating admin_users table:', adminUserError);
          } else {
            console.log('Admin added to admin_users table');
          }
        } catch (err) {
          console.error('Error updating admin_users table:', err);
        }
      }
    } catch (err) {
      console.error('Error processing admin:', err);
    }

    console.log('All users processed!');

  } catch (error) {
    console.error('Error creating users:', error);
  }
}

// Helper function to ensure a profile exists
async function ensureProfile(userId, email, fullName, userType) {
  try {
    console.log(`Ensuring profile exists for ${userType} (${userId})...`);

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log(`No profile found for ${userType}. Creating one...`);

        // Create profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            full_name: fullName,
            user_type: userType,
            created_at: new Date(),
            updated_at: new Date()
          });

        if (insertError) {
          console.error(`Error creating profile for ${userType}:`, insertError);
        } else {
          console.log(`Profile created for ${userType}`);
        }
      } else {
        console.error(`Error checking profile for ${userType}:`, profileError);
      }
    } else {
      console.log(`Profile already exists for ${userType}. Updating...`);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: email,
          full_name: fullName,
          user_type: userType,
          updated_at: new Date()
        })
        .eq('id', userId);

      if (updateError) {
        console.error(`Error updating profile for ${userType}:`, updateError);
      } else {
        console.log(`Profile updated for ${userType}`);
      }
    }
  } catch (error) {
    console.error(`Error ensuring profile for ${userType}:`, error);
  }
}

// Execute the function
runDatabaseFix().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
