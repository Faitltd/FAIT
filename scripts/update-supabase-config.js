#!/usr/bin/env node

/**
 * Update Supabase Configuration for FAIT
 * This script updates the Supabase configuration to use the FAIT project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Updating Supabase configuration for FAIT...');

// FAIT Supabase project configuration
const FAIT_SUPABASE_CONFIG = {
  url: 'https://ydisdyadjupyswcpbxzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzQ4NzQsImV4cCI6MjA1MDIxMDg3NH0.VQlJhYJOQOGWdJJKOGKJOGKJOGKJOGKJOGKJOGKJOGK'
};

// Update src/lib/supabase.js
const supabaseLibPath = path.join(path.dirname(__dirname), 'src/lib/supabase.js');
const supabaseLibContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '${FAIT_SUPABASE_CONFIG.url}';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '${FAIT_SUPABASE_CONFIG.anonKey}';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// FAIT-specific helper functions
export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.includes('admin@fait.com') || false;
};

export const getFaitProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching FAIT profile:', error);
    return null;
  }
  
  return data;
};
`;

try {
  fs.writeFileSync(supabaseLibPath, supabaseLibContent);
  console.log('✅ Updated src/lib/supabase.js for FAIT');
} catch (error) {
  console.error('❌ Error updating supabase.js:', error.message);
}

// Update environment variables template
const envTemplatePath = path.join(path.dirname(__dirname), '.env.example');
const envTemplateContent = `# FAIT Supabase Configuration
VITE_SUPABASE_URL=${FAIT_SUPABASE_CONFIG.url}
VITE_SUPABASE_ANON_KEY=${FAIT_SUPABASE_CONFIG.anonKey}

# Google Maps API (for service location features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Application Configuration
VITE_APP_NAME=FAIT
VITE_APP_URL=https://itsfait.com
`;

try {
  fs.writeFileSync(envTemplatePath, envTemplateContent);
  console.log('✅ Created .env.example for FAIT');
} catch (error) {
  console.error('❌ Error creating .env.example:', error.message);
}

console.log('🎯 Supabase configuration updated for FAIT project');
console.log('📝 Remember to update your actual .env file with the correct keys');
