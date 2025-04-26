// Local authentication bypass for testing
// This is a temporary solution for testing purposes only

// Store the current user in memory
let currentUser = null;

export const localAuthBypass = {
  // Sign in with email and password
  signInWithEmailAndPassword: (email, password) => {
    // Define test users
    const testUsers = {
      'admin@itsfait.com': {
        id: 'admin-uuid',
        email: 'admin@itsfait.com',
        user_metadata: {
          full_name: 'Admin User',
        },
        user_type: 'admin',
      },
      'client@itsfait.com': {
        id: 'client-uuid',
        email: 'client@itsfait.com',
        user_metadata: {
          full_name: 'Client User',
        },
        user_type: 'client',
      },
      'service@itsfait.com': {
        id: 'service-uuid',
        email: 'service@itsfait.com',
        user_metadata: {
          full_name: 'Service Agent',
        },
        user_type: 'service_agent',
      },
    };

    // Check if the email exists in our test users
    if (testUsers[email]) {
      // For testing, we'll accept any password
      currentUser = testUsers[email];
      
      // Store in localStorage for persistence
      localStorage.setItem('localAuthUser', JSON.stringify(currentUser));
      
      return {
        data: {
          user: currentUser,
          session: {
            access_token: 'fake-token',
            refresh_token: 'fake-refresh-token',
            expires_at: new Date().getTime() + 3600000, // 1 hour from now
          }
        },
        error: null
      };
    }
    
    // Return error for invalid credentials
    return {
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' }
    };
  },
  
  // Get the current user
  getUser: () => {
    if (!currentUser) {
      // Try to get from localStorage
      const storedUser = localStorage.getItem('localAuthUser');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    }
    
    return currentUser;
  },
  
  // Sign out
  signOut: () => {
    currentUser = null;
    localStorage.removeItem('localAuthUser');
    return { error: null };
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localAuthBypass.getUser();
  }
};
