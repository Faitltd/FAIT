/**
 * Direct Authentication Bypass System
 *
 * This is a direct authentication system that works with the UnifiedAuthContext.
 * It only works for the three test accounts and is intended for testing and development.
 */

// Test credentials that must always work
const TEST_CREDENTIALS = {
  'admin@itsfait.com': {
    password: 'admin123',
    userType: 'admin',
    fullName: 'Admin User',
    userId: 'admin-direct-auth-id'
  },
  'client@itsfait.com': {
    password: 'client123',
    userType: 'client',
    fullName: 'Client User',
    userId: 'client-direct-auth-id'
  },
  'service@itsfait.com': {
    password: 'service123',
    userType: 'service_agent',
    fullName: 'Service Agent User',
    userId: 'service-direct-auth-id'
  }
};

// Check if direct auth is enabled
export const isDirectAuthEnabled = () => {
  return localStorage.getItem('useDirectAuth') === 'true';
};

// Enable or disable direct auth
export const setDirectAuth = (enabled) => {
  localStorage.setItem('useDirectAuth', enabled.toString());
  console.log(`[DirectAuth] ${enabled ? 'Enabled' : 'Disabled'}`);

  // If enabling direct auth, also enable local auth (since we're using UnifiedAuthContext)
  if (enabled) {
    localStorage.setItem('useLocalAuth', 'true');
  }

  // Force page reload to apply changes
  window.location.reload();
};

// Check if user is authenticated with direct auth
export const isDirectAuthAuthenticated = () => {
  return localStorage.getItem('directAuthSession') !== null;
};

// Get the current direct auth user
export const getDirectAuthUser = () => {
  const session = localStorage.getItem('directAuthSession');
  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch (err) {
    console.error('[DirectAuth] Error parsing session:', err);
    return null;
  }
};

/**
 * Sign in with direct auth
 * This function now returns a format compatible with UnifiedAuthContext
 */
export const directAuthSignIn = (email, password) => {
  // Convert email to lowercase and trim
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email exists in test credentials
  if (!TEST_CREDENTIALS[normalizedEmail]) {
    console.error('[DirectAuth] Email not found in test credentials');
    return {
      success: false,
      data: null,
      error: new Error('Invalid email or password')
    };
  }

  // Check if password matches
  if (TEST_CREDENTIALS[normalizedEmail].password !== password) {
    console.error('[DirectAuth] Password does not match');
    return {
      success: false,
      data: null,
      error: new Error('Invalid email or password')
    };
  }

  // Create user object in the format expected by UnifiedAuthContext
  const user = {
    id: TEST_CREDENTIALS[normalizedEmail].userId,
    email: normalizedEmail,
    user_metadata: {
      full_name: TEST_CREDENTIALS[normalizedEmail].fullName,
      user_type: TEST_CREDENTIALS[normalizedEmail].userType
    },
    app_metadata: {},
    created_at: new Date().toISOString()
  };

  // Create session object
  const session = {
    user: user,
    access_token: `direct-token-${Date.now()}`,
    refresh_token: `direct-refresh-${Date.now()}`,
    expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };

  // Store session in localStorage
  localStorage.setItem('directAuthSession', JSON.stringify(user));
  localStorage.setItem('localAuthSession', JSON.stringify(session));

  // Also set regular auth info for compatibility with other parts of the app
  localStorage.setItem('userType', TEST_CREDENTIALS[normalizedEmail].userType);
  localStorage.setItem('userEmail', normalizedEmail);
  localStorage.setItem('isAdminUser', (TEST_CREDENTIALS[normalizedEmail].userType === 'admin').toString());

  console.log('[DirectAuth] Login successful', user);

  return {
    success: true,
    data: { user, session },
    error: null
  };
};

/**
 * Sign out with direct auth
 * This function now returns a format compatible with UnifiedAuthContext
 */
export const directAuthSignOut = () => {
  localStorage.removeItem('directAuthSession');
  localStorage.removeItem('localAuthSession');
  localStorage.removeItem('userType');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAdminUser');

  console.log('[DirectAuth] Logged out');

  return { success: true, error: null };
};

/**
 * Get dashboard URL for user type
 */
export const getDirectAuthDashboardUrl = (userType) => {
  if (userType === 'admin') {
    return '/dashboard/admin';
  } else if (userType === 'service_agent') {
    return '/dashboard/service-agent';
  } else {
    return '/dashboard/client';
  }
};
