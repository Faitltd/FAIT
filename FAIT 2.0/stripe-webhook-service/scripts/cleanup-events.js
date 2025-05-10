const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupProcessedEvents() {
  try {
    console.log('🧹 Cleaning up old processed events...');
    
    // Call the cleanup function
    const { error } = await supabase.rpc('cleanup_processed_events');
    
    if (error) {
      console.error(`❌ Error cleaning up processed events: ${error.message}`);
      return;
    }
    
    console.log('✅ Processed events cleanup complete!');
  } catch (error) {
    console.error('❌ Error in cleanup job:', error);
  }
}

// Run the cleanup
cleanupProcessedEvents();
