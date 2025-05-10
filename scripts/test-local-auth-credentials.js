/**
 * Test Local Authentication Credentials
 *
 * This script tests the local authentication credentials to ensure they work as expected.
 * It uses the local authentication system directly.
 */

// Import the local auth module
const localAuth = require('../src/lib/localAuth');

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
    const { data, error } = await localAuth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`❌ ${type} login failed:`, error.message);
      return false;
    }

    if (data?.user) {
      console.log(`✅ ${type} login successful!`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`User Email: ${data.user.email}`);
      console.log(`User Type: ${data.user.user_type}`);
      console.log(`User Metadata:`, data.user.user_metadata);
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

// Run tests
async function runTests() {
  console.log('=== Testing Local Authentication Credentials ===');

  let allPassed = true;

  for (const cred of TEST_CREDENTIALS) {
    const success = await testCredentials(cred.email, cred.password, cred.type);
    if (!success) {
      allPassed = false;
    }
    console.log('---');
  }

  if (allPassed) {
    console.log('✅ All local authentication tests passed!');
    process.exit(0);
  } else {
    console.error('❌ Some local authentication tests failed!');
    process.exit(1);
  }
}

// Run the tests
runTests();
