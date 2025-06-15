// Script to fix the service agent account in Supabase
import { createClient } from '@supabase/supabase-js';

// Hard-code the values from .env
const supabaseUrl = 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQzMzU4NywiZXhwIjoyMDU5MDA5NTg3fQ.96Ark16R_T-InjvpbelqLzgPLt_OswZFFr876pg-C5A';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixServiceAgent() {
  try {
    // 1. Try to sign in with the credentials to get the user ID
    console.log('Trying to sign in with service agent credentials...');

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'service@itsfait.com',
      password: 'service123'
    });

    let userId;

    if (signInError) {
      console.log('Sign in failed, trying to update password:', signInError.message);

      // Try to update the password
      console.log('Trying to update password for service@itsfait.com...');

      const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
        'service@itsfait.com',
        {
          redirectTo: 'http://localhost:5173/reset-password'
        }
      );

      if (resetError) {
        console.error('Error resetting password:', resetError);
      } else {
        console.log('Password reset email sent successfully');
      }

      // Try to create a new user
      console.log('Trying to create a new service agent user...');

      try {
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email: 'service@itsfait.com',
          password: 'service123',
          email_confirm: true,
          user_metadata: {
            user_type: 'service_agent',
            full_name: 'Service Agent'
          }
        });

        if (createError) {
          console.error('Error creating user:', createError);
        } else {
          console.log('User created successfully:', userData.user.id);
          userId = userData.user.id;
        }
      } catch (err) {
        console.error('Error creating user:', err);
      }
    } else {
      console.log('Sign in successful, user ID:', signInData.user.id);
      userId = signInData.user.id;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          user_type: 'service_agent',
          full_name: 'Service Agent'
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
      } else {
        console.log('User metadata updated successfully');
      }
    }

    if (!userId) {
      throw new Error('Could not get or create user ID');
    }

    console.log('User ID:', userId);

    // 3. Create or update the profile
    console.log('Creating profile for service agent...');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: 'service@itsfait.com',
        full_name: 'Service Agent',
        user_type: 'service_agent'
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    console.log('Profile created successfully:', profileData);
    console.log('Service agent account fixed successfully!');

  } catch (error) {
    console.error('Error fixing service agent account:', error);
  }
}

// Execute the function
fixServiceAgent().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
