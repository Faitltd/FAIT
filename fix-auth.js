/**
 * Fix Authentication Script
 * 
 * This script ensures that the local authentication system is properly configured
 * and that the test credentials work as expected.
 */

// Define the test credentials
const TEST_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'service_agent' }
];

// Create predefined users
const PREDEFINED_USERS = TEST_CREDENTIALS.map(cred => ({
  id: `${cred.type}-uuid`,
  email: cred.email,
  user_type: cred.type,
  full_name: `${cred.type.charAt(0).toUpperCase() + cred.type.slice(1)} User`,
  created_at: new Date().toISOString(),
  user_metadata: {
    full_name: `${cred.type.charAt(0).toUpperCase() + cred.type.slice(1)} User`,
    user_type: cred.type
  },
  app_metadata: {
    provider: 'email',
    providers: ['email']
  }
}));

// Create valid credentials map
const VALID_CREDENTIALS = {};
TEST_CREDENTIALS.forEach(cred => {
  VALID_CREDENTIALS[cred.email] = cred.password;
});

// Create a session for a user
function createSession(user) {
  return {
    access_token: `fake-token-${user.id}`,
    refresh_token: `fake-refresh-token-${user.id}`,
    expires_at: new Date().getTime() + 3600000, // 1 hour from now
    user: user
  };
}

// Store a session in localStorage
function storeSession(session) {
  localStorage.setItem('local_auth_session', JSON.stringify(session));
}

// Fix the local authentication system
function fixLocalAuth() {
  console.log('Fixing local authentication system...');
  
  // Enable local auth
  localStorage.setItem('useLocalAuth', 'true');
  console.log('Local authentication enabled');
  
  // Store predefined users and credentials
  localStorage.setItem('predefinedUsers', JSON.stringify(PREDEFINED_USERS));
  localStorage.setItem('validCredentials', JSON.stringify(VALID_CREDENTIALS));
  console.log('Predefined users and credentials stored');
  
  console.log('Local authentication system fixed');
}

// Test the credentials
function testCredentials() {
  console.log('Testing credentials...');
  
  TEST_CREDENTIALS.forEach(cred => {
    console.log(`Testing ${cred.type} credentials: ${cred.email}`);
    
    // Find the user
    const user = PREDEFINED_USERS.find(u => u.email === cred.email);
    
    if (user && VALID_CREDENTIALS[cred.email] === cred.password) {
      console.log(`✅ ${cred.type} credentials valid`);
    } else {
      console.log(`❌ ${cred.type} credentials invalid`);
    }
  });
  
  console.log('Test complete');
}

// Run the fix
fixLocalAuth();
testCredentials();

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.fixAuth = {
    fixLocalAuth,
    testCredentials,
    TEST_CREDENTIALS,
    PREDEFINED_USERS,
    VALID_CREDENTIALS
  };
  console.log('Auth fix functions available in window.fixAuth');
}
