import { createClient } from '@supabase/supabase-js';

// These are placeholder values - in a real app, use environment variables
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.qQUxQHYGqBQrUQQl8_vJv1Uwl-5K1JgFvV5-Vf-BDWU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
