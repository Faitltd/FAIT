/**
 * Google OAuth Test Script
 * 
 * This script helps verify that your Google OAuth credentials are properly configured.
 * It checks:
 * 1. If the required environment variables are set
 * 2. If the Google Client ID is valid
 * 
 * Usage:
 * node scripts/test-oauth.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;

// Check if environment variables are set
console.log('\n🔍 Checking environment variables...');
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in .env file');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in .env file');
  process.exit(1);
}

if (!googleClientId) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is not set in .env file');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Validate Google Client ID format
console.log('\n🔍 Validating Google Client ID format...');
if (!googleClientId.endsWith('.apps.googleusercontent.com')) {
  console.warn('⚠️ Google Client ID does not have the expected format (should end with .apps.googleusercontent.com)');
} else {
  console.log('✅ Google Client ID has the correct format');
}

// Check if Supabase client can be initialized
console.log('\n🔍 Testing Supabase connection...');
try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized successfully');
  
  // Check if Google OAuth is enabled in Supabase
  console.log('\n🔍 Checking if Google OAuth provider is available...');
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
  } else {
    console.log('✅ Successfully connected to Supabase');
    
    // Attempt to get OAuth URL (this doesn't actually sign in)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/oauth-callback',
          queryParams: {
            client_id: googleClientId
          }
        }
      });
      
      if (error) {
        console.error('❌ Error generating OAuth URL:', error.message);
      } else if (data && data.url) {
        console.log('✅ Successfully generated Google OAuth URL');
        console.log('🔗 OAuth URL contains client_id:', data.url.includes(googleClientId));
      }
    } catch (err) {
      console.error('❌ Error testing OAuth URL generation:', err.message);
    }
  }
} catch (err) {
  console.error('❌ Error initializing Supabase client:', err.message);
}

console.log('\n📋 Summary:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Google Client ID:', googleClientId);
console.log('\n🔧 Next steps:');
console.log('1. Make sure Google OAuth is enabled in your Supabase dashboard');
console.log('2. Verify that the redirect URL is properly configured in both Supabase and Google Cloud Console');
console.log('3. Try signing in with Google in your application');
console.log('\nFor more details, see the Google OAuth Setup Guide in docs/google-oauth-setup.md');
