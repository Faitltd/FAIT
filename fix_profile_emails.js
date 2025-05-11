// Script to fix profile emails
import { createClient } from '@supabase/supabase-js';

// Using hardcoded Supabase credentials from your .env file
const supabaseUrl = "https://ydisdyadjupyswcpbxzu.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQzMzU4NywiZXhwIjoyMDU5MDA5NTg3fQ.96Ark16R_T-InjvpbelqLzgPLt_OswZFFr876pg-C5A";

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to update profile emails
async function updateProfileEmails() {
  console.log('=== Updating Profile Emails ===');
  
  try {
    // Update client profile
    const { error: clientError } = await supabase
      .from('profiles')
      .update({ 
        email: 'client@itsfait.com',
        updated_at: new Date().toISOString()
      })
      .eq('id', '5c8b427f-5344-43fc-85ba-34480b9a92f4');
    
    if (clientError) {
      console.error('Error updating client profile:', clientError.message);
    } else {
      console.log('✅ Updated client profile email');
    }
    
    // Update service agent profile
    const { error: serviceError } = await supabase
      .from('profiles')
      .update({ 
        email: 'service@itsfait.com',
        updated_at: new Date().toISOString()
      })
      .eq('id', 'd04c0bc7-3aa9-4718-8751-9f2ab55fb232');
    
    if (serviceError) {
      console.error('Error updating service agent profile:', serviceError.message);
    } else {
      console.log('✅ Updated service agent profile email');
    }
  } catch (err) {
    console.error('Exception updating profile emails:', err);
  }
}

// Run the update
updateProfileEmails();
