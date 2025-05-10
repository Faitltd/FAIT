#!/usr/bin/env node

/**
 * This script tests the authentication functionality with Supabase
 * 
 * Usage:
 * node scripts/test-auth.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  try {
    // Load environment variables from .env file
    const envFilePath = path.resolve(path.dirname(__dirname), '.env');
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Parse environment variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    });
    
    // Get Supabase URL and anon key
    const supabaseUrl = envVars.VITE_SUPABASE_URL;
    const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env file');
      process.exit(1);
    }
    
    console.log('Testing authentication with Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test authentication
    const email = await prompt('Enter email: ');
    const password = await prompt('Enter password: ');
    
    console.log('Attempting to sign in...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Authentication failed:', error.message);
      process.exit(1);
    }
    
    console.log('Authentication successful!');
    console.log('User:', data.user.email);
    console.log('Session expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
    
    // Test fetching user profile
    console.log('\nFetching user profile...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
    } else {
      console.log('Profile data:');
      console.log(profileData);
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('\nSigned out successfully');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
