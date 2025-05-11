// Run this script with: node scripts/fix-profile-creation.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndFixDatabase() {
  console.log('=== Profile Creation Diagnostic Tool ===');
  
  try {
    // 1. Check if the user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Authentication error:', sessionError.message);
      return;
    }
    
    if (!session) {
      console.error('❌ No active session. Please log in first.');
      return;
    }
    
    console.log('✅ Authenticated as:', session.user.email);
    
    // 2. Check if tables exist
    console.log('\n=== Checking Required Tables ===');
    
    // Check profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      console.log('   This table might not exist or you might not have access to it.');
    } else {
      console.log('✅ Profiles table exists');
    }
    
    // Check contractor_verifications table
    const { data: verificationsData, error: verificationsError } = await supabase
      .from('contractor_verifications')
      .select('count(*)', { count: 'exact', head: true });
    
    if (verificationsError) {
      console.error('❌ Contractor verifications table error:', verificationsError.message);
      console.log('   This table might not exist or you might not have access to it.');
    } else {
      console.log('✅ Contractor verifications table exists');
    }
    
    // Check points_transactions table
    const { data: pointsData, error: pointsError } = await supabase
      .from('points_transactions')
      .select('count(*)', { count: 'exact', head: true });
    
    if (pointsError) {
      console.error('❌ Points transactions table error:', pointsError.message);
      console.log('   This table might not exist or you might not have access to it.');
    } else {
      console.log('✅ Points transactions table exists');
    }
    
    // 3. Check if the user already has a profile
    console.log('\n=== Checking User Profile ===');
    
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError.message);
    } else if (existingProfile) {
      console.log('⚠️ User already has a profile:');
      console.log('   ID:', existingProfile.id);
      console.log('   Type:', existingProfile.user_type);
      console.log('   Name:', existingProfile.full_name);
      console.log('   Email:', existingProfile.email);
      
      // Ask if user wants to delete the existing profile
      console.log('\n⚠️ You already have a profile. To fix profile creation issues, you may need to delete it.');
      console.log('   To delete your profile, run this script with the --delete-profile flag.');
    } else {
      console.log('✅ No existing profile found. You can create a new profile.');
    }
    
    // 4. Check for delete flag
    if (process.argv.includes('--delete-profile') && existingProfile) {
      console.log('\n=== Deleting Existing Profile ===');
      
      // Delete points transactions
      const { error: deletePointsError } = await supabase
        .from('points_transactions')
        .delete()
        .eq('user_id', session.user.id);
      
      if (deletePointsError) {
        console.error('❌ Error deleting points transactions:', deletePointsError.message);
      } else {
        console.log('✅ Points transactions deleted');
      }
      
      // Delete contractor verifications if user is a contractor
      if (existingProfile.user_type === 'contractor') {
        const { error: deleteVerificationsError } = await supabase
          .from('contractor_verifications')
          .delete()
          .eq('contractor_id', session.user.id);
        
        if (deleteVerificationsError) {
          console.error('❌ Error deleting contractor verifications:', deleteVerificationsError.message);
        } else {
          console.log('✅ Contractor verifications deleted');
        }
      }
      
      // Delete profile
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);
      
      if (deleteProfileError) {
        console.error('❌ Error deleting profile:', deleteProfileError.message);
      } else {
        console.log('✅ Profile deleted successfully');
        console.log('   You can now try creating a new profile.');
      }
    }
    
    // 5. Test creating a profile
    if (process.argv.includes('--test-create') && !existingProfile) {
      console.log('\n=== Testing Profile Creation ===');
      
      const userType = 'client'; // Default to client for testing
      
      // 1. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          user_type: userType,
          full_name: session.user.user_metadata?.full_name || 'Test User',
          email: session.user.email,
          phone: null,
        });
      
      if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
      } else {
        console.log('✅ Profile created successfully');
        
        // 3. Create initial points transaction
        const { error: pointsError } = await supabase
          .from('points_transactions')
          .insert({
            user_id: session.user.id,
            points_amount: 100,
            transaction_type: 'earned',
            description: 'Welcome bonus for joining FAIT Co-Op',
          });
        
        if (pointsError) {
          console.error('❌ Error creating points transaction:', pointsError.message);
        } else {
          console.log('✅ Points transaction created successfully');
        }
      }
    }
    
    console.log('\n=== Recommendations ===');
    console.log('1. Check if all required tables exist in your Supabase database');
    console.log('2. Verify that the RLS policies allow the user to insert records');
    console.log('3. Check for any constraint violations in the database');
    console.log('4. If you already have a profile, try deleting it with --delete-profile flag');
    console.log('5. Test profile creation with --test-create flag');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkAndFixDatabase();
