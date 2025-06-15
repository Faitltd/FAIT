// Script to create a service agent account
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Hard-code the values from .env
const envVars = {
  VITE_SUPABASE_URL: 'https://ydisdyadjupyswcpbxzu.supabase.co',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQzMzU4NywiZXhwIjoyMDU5MDA5NTg3fQ.96Ark16R_T-InjvpbelqLzgPLt_OswZFFr876pg-C5A'
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || envVars.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createServiceAgent() {
  try {
    // 1. First try to sign in with the credentials to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'service@itsfait.com',
      password: 'service123'
    });

    let userId;

    if (signInError) {
      console.log('Sign in failed, trying to create user:', signInError.message);

      // Create the user if sign in fails
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: 'service@itsfait.com',
        password: 'service123',
        email_confirm: true
      });

      if (userError) {
        throw userError;
      }

      console.log('User created successfully:', userData.user.id);
      userId = userData.user.id;
    } else {
      console.log('User already exists, signed in successfully:', signInData.user.id);
      userId = signInData.user.id;
    }

    // 2. Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'service@itsfait.com')
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      throw profileCheckError;
    }

    if (existingProfile) {
      console.log('Profile already exists, updating it');

      // Update the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: 'service_agent',
          full_name: 'Service Agent'
        })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      console.log('Profile updated successfully:', profileData);
    } else {
      console.log('Creating new profile');

      // Create the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
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
    }

    console.log('Service agent account created or updated successfully!');

  } catch (error) {
    console.error('Error creating service agent account:', error);
  }
}

// Execute the function
createServiceAgent().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
