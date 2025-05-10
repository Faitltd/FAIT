/**
 * Local Authentication Test Script
 * 
 * This script tests the local authentication system without requiring a connection to Supabase.
 */

// Import the local authentication module
import * as localAuth from '../src/lib/localAuth.js';

// Enable local authentication
localAuth.enableLocalAuth();

// Test credentials
const TEST_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

// Test function to sign in with credentials
async function testCredentials(email, password, type) {
  console.log(`Testing ${type} credentials: ${email} / ${password}`);

  try {
    const { data, error } = localAuth.signInWithPassword({ email, password });

    if (error) {
      console.error(`❌ ${type} login failed:`, error.message);
      return false;
    }

    if (data?.user) {
      console.log(`✅ ${type} login successful!`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`User Email: ${data.user.email}`);
      console.log(`User Type: ${data.user.user_type}`);
      return true;
    } else {
      console.error(`❌ ${type} login failed: No user data returned`);
      return false;
    }
  } catch (err) {
    console.error(`❌ ${type} login failed with exception:`, err);
    return false;
  }
}

// Test signup function
async function testSignup() {
  console.log('Testing signup...');
  
  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';
  
  try {
    const { data, error } = localAuth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          user_type: 'client'
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error.message);
      return false;
    }
    
    if (data?.user) {
      console.log('✅ Signup successful!');
      console.log(`User ID: ${data.user.id}`);
      console.log(`User Email: ${data.user.email}`);
      console.log(`User Type: ${data.user.user_type}`);
      return true;
    } else {
      console.error('❌ Signup failed: No user data returned');
      return false;
    }
  } catch (err) {
    console.error('❌ Signup failed with exception:', err);
    return false;
  }
}

// Test password reset
async function testPasswordReset() {
  console.log('Testing password reset...');
  
  try {
    const { data, error } = localAuth.resetPasswordForEmail('client@itsfait.com');
    
    if (error) {
      console.error('❌ Password reset failed:', error.message);
      return false;
    }
    
    console.log('✅ Password reset successful!');
    return true;
  } catch (err) {
    console.error('❌ Password reset failed with exception:', err);
    return false;
  }
}

// Test user update
async function testUserUpdate() {
  console.log('Testing user update...');
  
  // First sign in
  const { data: signInData } = localAuth.signInWithPassword({
    email: 'client@itsfait.com',
    password: 'client123'
  });
  
  if (!signInData?.user) {
    console.error('❌ User update test failed: Could not sign in');
    return false;
  }
  
  try {
    const { data, error } = localAuth.updateUser({
      data: {
        first_name: 'Updated',
        last_name: 'Client'
      }
    });
    
    if (error) {
      console.error('❌ User update failed:', error.message);
      return false;
    }
    
    if (data?.user) {
      console.log('✅ User update successful!');
      console.log(`User ID: ${data.user.id}`);
      console.log(`User Metadata:`, data.user.user_metadata);
      return true;
    } else {
      console.error('❌ User update failed: No user data returned');
      return false;
    }
  } catch (err) {
    console.error('❌ User update failed with exception:', err);
    return false;
  }
}

// Test sign out
async function testSignOut() {
  console.log('Testing sign out...');
  
  try {
    const { error } = localAuth.signOut();
    
    if (error) {
      console.error('❌ Sign out failed:', error.message);
      return false;
    }
    
    // Verify session is cleared
    const { data } = localAuth.getSession();
    
    if (data.session) {
      console.error('❌ Sign out failed: Session still exists');
      return false;
    }
    
    console.log('✅ Sign out successful!');
    return true;
  } catch (err) {
    console.error('❌ Sign out failed with exception:', err);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== Testing Local Authentication ===');
  
  let allPassed = true;
  let testResults = {
    login: true,
    signup: true,
    passwordReset: true,
    userUpdate: true,
    signOut: true
  };

  // Test login for each credential
  for (const cred of TEST_CREDENTIALS) {
    const success = await testCredentials(cred.email, cred.password, cred.type);
    if (!success) {
      allPassed = false;
      testResults.login = false;
    }
    console.log('---');
  }
  
  // Test signup
  const signupSuccess = await testSignup();
  if (!signupSuccess) {
    allPassed = false;
    testResults.signup = false;
  }
  console.log('---');
  
  // Test password reset
  const passwordResetSuccess = await testPasswordReset();
  if (!passwordResetSuccess) {
    allPassed = false;
    testResults.passwordReset = false;
  }
  console.log('---');
  
  // Test user update
  const userUpdateSuccess = await testUserUpdate();
  if (!userUpdateSuccess) {
    allPassed = false;
    testResults.userUpdate = false;
  }
  console.log('---');
  
  // Test sign out
  const signOutSuccess = await testSignOut();
  if (!signOutSuccess) {
    allPassed = false;
    testResults.signOut = false;
  }
  
  // Print summary
  console.log('=== Test Summary ===');
  console.log(`Login: ${testResults.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Signup: ${testResults.signup ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Password Reset: ${testResults.passwordReset ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Update: ${testResults.userUpdate ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Sign Out: ${testResults.signOut ? '✅ PASS' : '❌ FAIL'}`);
  
  if (allPassed) {
    console.log('✅ All authentication tests passed!');
    process.exit(0);
  } else {
    console.error('❌ Some authentication tests failed!');
    process.exit(1);
  }
}

// Run the tests
runTests();
