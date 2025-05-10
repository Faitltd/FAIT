/**
 * Authentication Fix Script
 * 
 * This script fixes authentication issues by ensuring the local authentication system
 * is properly configured and the test credentials work as expected.
 */

// Enable local authentication
function enableLocalAuth() {
  console.log('Enabling local authentication...');
  localStorage.setItem('useLocalAuth', 'true');
  console.log('Local authentication enabled');
}

// Clear any existing authentication data
function clearAuthData() {
  console.log('Clearing existing authentication data...');
  localStorage.removeItem('local_auth_session');
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('localAuthUser');
  localStorage.removeItem('directAuthSession');
  console.log('Authentication data cleared');
}

// Set up test credentials
function setupTestCredentials() {
  console.log('Setting up test credentials...');
  
  // Define user types
  const UserType = {
    ADMIN: 'admin',
    CLIENT: 'client',
    SERVICE_AGENT: 'service_agent'
  };
  
  // Define predefined users
  const PREDEFINED_USERS = [
    {
      id: 'admin-uuid',
      email: 'admin@itsfait.com',
      user_type: UserType.ADMIN,
      full_name: 'Admin User',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: 'Admin User',
        user_type: UserType.ADMIN
      },
      app_metadata: {
        provider: 'email',
        providers: ['email']
      }
    },
    {
      id: 'client-uuid',
      email: 'client@itsfait.com',
      user_type: UserType.CLIENT,
      full_name: 'Client User',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: 'Client User',
        user_type: UserType.CLIENT
      },
      app_metadata: {
        provider: 'email',
        providers: ['email']
      }
    },
    {
      id: 'service-uuid',
      email: 'service@itsfait.com',
      user_type: UserType.SERVICE_AGENT,
      full_name: 'Service Agent',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: 'Service Agent',
        user_type: UserType.SERVICE_AGENT
      },
      app_metadata: {
        provider: 'email',
        providers: ['email']
      }
    }
  ];
  
  // Define valid credentials
  const VALID_CREDENTIALS = {
    'admin@itsfait.com': 'admin123',
    'client@itsfait.com': 'client123',
    'service@itsfait.com': 'service123'
  };
  
  // Store in localStorage for the local authentication system to use
  localStorage.setItem('predefinedUsers', JSON.stringify(PREDEFINED_USERS));
  localStorage.setItem('validCredentials', JSON.stringify(VALID_CREDENTIALS));
  
  console.log('Test credentials set up successfully');
}

// Create a session for the admin user to pre-authenticate
function createAdminSession() {
  console.log('Creating admin session...');
  
  const adminUser = {
    id: 'admin-uuid',
    email: 'admin@itsfait.com',
    user_type: 'admin',
    full_name: 'Admin User',
    created_at: new Date().toISOString(),
    user_metadata: {
      full_name: 'Admin User',
      user_type: 'admin'
    },
    app_metadata: {
      provider: 'email',
      providers: ['email']
    }
  };
  
  const session = {
    user: adminUser,
    access_token: `fake-token-${Date.now()}`,
    refresh_token: `fake-refresh-${Date.now()}`,
    expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  localStorage.setItem('local_auth_session', JSON.stringify(session));
  console.log('Admin session created');
}

// Fix authentication
function fixAuthentication() {
  console.log('Fixing authentication...');
  
  // Step 1: Enable local authentication
  enableLocalAuth();
  
  // Step 2: Clear existing authentication data
  clearAuthData();
  
  // Step 3: Set up test credentials
  setupTestCredentials();
  
  // Step 4: Create admin session (optional)
  // createAdminSession();
  
  console.log('Authentication fixed successfully');
  console.log('You can now log in with the following credentials:');
  console.log('- Admin: admin@itsfait.com / admin123');
  console.log('- Client: client@itsfait.com / client123');
  console.log('- Service Agent: service@itsfait.com / service123');
}

// Run the fix
fixAuthentication();

// Make the functions available globally
window.authFix = {
  enableLocalAuth,
  clearAuthData,
  setupTestCredentials,
  createAdminSession,
  fixAuthentication
};
