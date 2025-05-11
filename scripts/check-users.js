// Script to check if users exist and can be authenticated
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

async function checkUsers() {
  const users = [
    { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' },
    { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
    { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' }
  ];

  console.log('Checking if users exist and can be authenticated...');

  for (const user of users) {
    try {
      console.log(`\nTesting ${user.type} login (${user.email})...`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.error(`❌ ${user.type} login failed:`, error.message);
      } else {
        console.log(`✅ ${user.type} login successful!`);
        console.log(`User ID: ${data.user.id}`);

        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error(`❌ ${user.type} profile not found:`, profileError.message);
        } else {
          console.log(`✅ ${user.type} profile found:`);
          console.log(`  Full Name: ${profileData.full_name}`);
          console.log(`  User Type: ${profileData.user_type}`);
        }

        // Sign out
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error(`Error testing ${user.type} login:`, err);
    }
  }
}

// Execute the function
checkUsers().then(() => {
  console.log('\nUser check completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
