/**
 * Local Authentication Module
 * 
 * This module provides a mock authentication system for testing and development
 * without requiring a connection to Supabase.
 */

// Mock user database
const users = [
  {
    id: 'admin-123',
    email: 'admin@itsfait.com',
    password: 'admin123',
    user_type: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    full_name: 'Admin User',
    created_at: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'client-123',
    email: 'client@itsfait.com',
    password: 'client123',
    user_type: 'client',
    first_name: 'Client',
    last_name: 'User',
    full_name: 'Client User',
    created_at: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'service-123',
    email: 'service@itsfait.com',
    password: 'service123',
    user_type: 'service_agent',
    first_name: 'Service',
    last_name: 'Agent',
    full_name: 'Service Agent',
    created_at: '2023-01-01T00:00:00.000Z',
  },
];

// User types
export enum UserType {
  ADMIN = 'admin',
  CLIENT = 'client',
  SERVICE_AGENT = 'service_agent',
}

// Local storage keys
const LOCAL_AUTH_KEY = 'localAuth';
const LOCAL_AUTH_SESSION_KEY = 'localAuthSession';

// Helper to generate a session
const generateSession = (user: any) => {
  const session = {
    access_token: `mock_token_${user.id}`,
    refresh_token: `mock_refresh_${user.id}`,
    expires_at: Date.now() + 3600 * 1000, // 1 hour from now
    user: {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      user_metadata: {
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
      },
    },
  };
  return session;
};

// Check if we're using local auth
export const isUsingLocalAuth = (): boolean => {
  return localStorage.getItem('useLocalAuth') === 'true';
};

// Enable local auth
export const enableLocalAuth = (): void => {
  localStorage.setItem('useLocalAuth', 'true');
  console.log('Local authentication enabled');
};

// Disable local auth
export const disableLocalAuth = (): void => {
  localStorage.removeItem('useLocalAuth');
  localStorage.removeItem(LOCAL_AUTH_KEY);
  localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
  console.log('Local authentication disabled');
};

// Sign in with email and password
export const signInWithPassword = (params: { email: string, password: string }): any => {
  const { email, password } = params;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return {
      data: null,
      error: {
        message: 'Invalid login credentials',
      },
    };
  }
  
  const session = generateSession(user);
  
  // Store in local storage
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
  localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(session));
  
  return {
    data: {
      user: session.user,
      session,
    },
    error: null,
  };
};

// Sign up with email and password
export const signUp = (params: { email: string, password: string, options?: { data?: any } }): any => {
  const { email, password, options } = params;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return {
      data: null,
      error: {
        message: 'User already exists',
      },
    };
  }
  
  // Create new user
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    user_type: options?.data?.user_type || 'client',
    first_name: options?.data?.first_name || '',
    last_name: options?.data?.last_name || '',
    full_name: options?.data?.first_name && options?.data?.last_name 
      ? `${options.data.first_name} ${options.data.last_name}` 
      : email.split('@')[0],
    created_at: new Date().toISOString(),
  };
  
  // Add to mock database
  users.push(newUser);
  
  // Generate session
  const session = generateSession(newUser);
  
  // Store in local storage
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
  localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(session));
  
  return {
    data: {
      user: session.user,
      session,
    },
    error: null,
  };
};

// Sign out
export const signOut = (): any => {
  localStorage.removeItem(LOCAL_AUTH_KEY);
  localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
  
  return {
    error: null,
  };
};

// Get current session
export const getSession = (): any => {
  const sessionStr = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
  
  if (!sessionStr) {
    return {
      data: { session: null },
      error: null,
    };
  }
  
  try {
    const session = JSON.parse(sessionStr);
    
    // Check if session is expired
    if (session.expires_at < Date.now()) {
      localStorage.removeItem(LOCAL_AUTH_KEY);
      localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
      
      return {
        data: { session: null },
        error: null,
      };
    }
    
    return {
      data: { session },
      error: null,
    };
  } catch (error) {
    console.error('Error parsing local auth session:', error);
    return {
      data: { session: null },
      error: null,
    };
  }
};

// Get current user
export const getUser = (): any => {
  const { data } = getSession();
  
  if (!data.session) {
    return {
      data: { user: null },
      error: null,
    };
  }
  
  return {
    data: { user: data.session.user },
    error: null,
  };
};

// Reset password
export const resetPasswordForEmail = (email: string): any => {
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return {
      data: null,
      error: {
        message: 'User not found',
      },
    };
  }
  
  console.log(`Password reset requested for ${email}`);
  
  return {
    data: {},
    error: null,
  };
};

// Update user
export const updateUser = (params: { data: any }): any => {
  const { data: userData } = params;
  const { data } = getUser();
  
  if (!data.user) {
    return {
      data: null,
      error: {
        message: 'No user logged in',
      },
    };
  }
  
  const userIndex = users.findIndex(u => u.id === data.user.id);
  
  if (userIndex === -1) {
    return {
      data: null,
      error: {
        message: 'User not found',
      },
    };
  }
  
  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...userData,
  };
  
  // Update session
  const session = generateSession(users[userIndex]);
  localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(session));
  
  return {
    data: {
      user: session.user,
    },
    error: null,
  };
};
