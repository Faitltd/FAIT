/**
 * Local Authentication Module
 * 
 * This module provides a temporary authentication solution when Supabase is not available.
 * It mimics the Supabase auth API but stores data locally in the browser.
 */

// Define user types
export type UserType = 'admin' | 'client' | 'service_agent';

// Define user interface
export interface LocalUser {
  id: string;
  email: string;
  user_type: UserType;
  full_name: string;
  created_at: string;
  user_metadata: {
    full_name: string;
    user_type: UserType;
  };
}

// Define session interface
export interface LocalSession {
  user: LocalUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Predefined users for testing
const PREDEFINED_USERS: LocalUser[] = [
  {
    id: 'admin-uuid',
    email: 'admin@itsfait.com',
    user_type: 'admin',
    full_name: 'Admin User',
    created_at: new Date().toISOString(),
    user_metadata: {
      full_name: 'Admin User',
      user_type: 'admin'
    }
  },
  {
    id: 'client-uuid',
    email: 'client@itsfait.com',
    user_type: 'client',
    full_name: 'Client User',
    created_at: new Date().toISOString(),
    user_metadata: {
      full_name: 'Client User',
      user_type: 'client'
    }
  },
  {
    id: 'service-uuid',
    email: 'service@itsfait.com',
    user_type: 'service_agent',
    full_name: 'Service Agent',
    created_at: new Date().toISOString(),
    user_metadata: {
      full_name: 'Service Agent',
      user_type: 'service_agent'
    }
  }
];

// Storage keys
const SESSION_KEY = 'local_auth_session';

/**
 * Sign in with email and password
 */
export const signInWithPassword = async (email: string, password: string): Promise<{ data: { session: LocalSession | null, user: LocalUser | null }, error: Error | null }> => {
  try {
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email (in a real app, we would check the password too)
    const user = PREDEFINED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // For demo purposes, accept any email with password "password"
      if (password === 'password') {
        // Create a new user based on the email
        const newUser: LocalUser = {
          id: `user-${Date.now()}`,
          email: email,
          user_type: 'client', // Default to client
          full_name: email.split('@')[0],
          created_at: new Date().toISOString(),
          user_metadata: {
            full_name: email.split('@')[0],
            user_type: 'client'
          }
        };
        
        // Create session
        const session = createSession(newUser);
        
        // Store session
        storeSession(session);
        
        return {
          data: { session, user: newUser },
          error: null
        };
      }
      
      throw new Error('Invalid credentials');
    }
    
    // Create session
    const session = createSession(user);
    
    // Store session
    storeSession(session);
    
    return {
      data: { session, user },
      error: null
    };
  } catch (error) {
    return {
      data: { session: null, user: null },
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    // Remove session from storage
    localStorage.removeItem(SESSION_KEY);
    
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
};

/**
 * Get current session
 */
export const getSession = async (): Promise<{ data: { session: LocalSession | null }, error: Error | null }> => {
  try {
    // Get session from storage
    const sessionStr = localStorage.getItem(SESSION_KEY);
    
    if (!sessionStr) {
      return { data: { session: null }, error: null };
    }
    
    // Parse session
    const session = JSON.parse(sessionStr) as LocalSession;
    
    // Check if session is expired
    if (session.expires_at < Date.now()) {
      // Remove expired session
      localStorage.removeItem(SESSION_KEY);
      return { data: { session: null }, error: null };
    }
    
    return { data: { session }, error: null };
  } catch (error) {
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
};

/**
 * Create a session for a user
 */
const createSession = (user: LocalUser): LocalSession => {
  return {
    user,
    access_token: `fake-token-${Date.now()}`,
    refresh_token: `fake-refresh-${Date.now()}`,
    expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
};

/**
 * Store session in localStorage
 */
const storeSession = (session: LocalSession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/**
 * Check if a user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const { data } = await getSession();
  return data.session?.user.user_type === 'admin';
};

/**
 * Get user type
 */
export const getUserType = async (): Promise<UserType | null> => {
  const { data } = await getSession();
  return data.session?.user.user_type || null;
};
