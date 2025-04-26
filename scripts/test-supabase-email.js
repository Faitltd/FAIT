// Test script for Supabase email configuration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../supabase/.env') });

// Read the App Password from the environment
const appPassword = process.env.GOOGLE_APP_PASSWORD;

if (!appPassword) {
  console.error('Error: GOOGLE_APP_PASSWORD not found in environment variables');
  console.error('Make sure you have set it in supabase/.env file');
  process.exit(1);
}

// Supabase configuration
const supabaseUrl = 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.u2hCWysJmyRyo4ZWBruDUSHAjzj9_Ibv81z7lPyx1JY';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test password reset
async function testPasswordReset() {
  console.log('Testing password reset email...');

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail('admin@fait-coop.com', {
      redirectTo: 'http://localhost:5173/reset-password',
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      process.exit(1);
    }

    console.log('Password reset email request successful!');
    console.log('Data:', data);
    console.log('Check your email (including spam folder) for the reset link.');

    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the test
testPasswordReset();
