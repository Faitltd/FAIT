import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabaseUrl = PUBLIC_SUPABASE_URL || 'https://absmquyhavntfoojvskl.supabase.co';
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic21xdXloYXZudGZvb2p2c2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTU3OTMsImV4cCI6MjA2MzgzMTc5M30.-rC8zYJP17taedZOTPsbnb-pr9nFxa9sQC421JviWAc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
