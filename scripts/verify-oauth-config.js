// Run this script with: node scripts/verify-oauth-config.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;

console.log('=== Google OAuth Configuration Verification ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Google Client ID:', googleClientId);

// Verify environment variables
if (!supabaseUrl || !supabaseAnonKey || !googleClientId) {
  console.error('❌ Missing environment variables. Please check your .env file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate OAuth URL (this doesn't actually sign in)
async function verifyOAuthConfig() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5174/oauth-callback',
        queryParams: {
          client_id: googleClientId
        }
      }
    });

    if (error) {
      console.error('❌ Error generating OAuth URL:', error.message);
      return;
    }

    if (data && data.url) {
      console.log('✅ Successfully generated Google OAuth URL');
      console.log('✅ OAuth URL contains client_id:', data.url.includes(googleClientId));
      console.log('\nOAuth URL (for debugging):', data.url);
    }
  } catch (err) {
    console.error('❌ Error testing OAuth configuration:', err.message);
  }
}

verifyOAuthConfig();
