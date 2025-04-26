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

// Define valid credentials
const VALID_CREDENTIALS: {[key: string]: string} = {
  'admin@itsfait.com': 'admin123',
  'client@itsfait.com': 'client123',
  'service@itsfait.com': 'service123'
};

// Add any email with these passwords
const VALID_TEST_PASSWORDS = ['password', 'admin123', 'client123', 'service123', 'test123'];

// Storage keys
const SESSION_KEY = 'local_auth_session';

/**
 * Sign in with email and password
 */
export const signInWithPassword = async ({ email, password }: { email: string, password: string }): Promise<{ data: { session: LocalSession | null, user: LocalUser | null }, error: Error | null }> => {
  try {
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Trim email to prevent whitespace issues
    const trimmedEmail = email.trim();

    // Find user by email
    let user = PREDEFINED_USERS.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());

    // Check if the email exists in our valid credentials
    if (user && VALID_CREDENTIALS[trimmedEmail] === password) {
      // Create session for predefined user
      const session = createSession(user);
      storeSession(session);
      return {
        data: { session, user },
        error: null
      };
    }

    // For testing: Allow any email with valid test passwords
    if (VALID_TEST_PASSWORDS.includes(password)) {
      // Create a new user based on the email
      const userType: UserType =
        trimmedEmail.includes('admin') ? 'admin' :
        trimmedEmail.includes('service') ? 'service_agent' : 'client';

      const newUser: LocalUser = {
        id: `user-${Date.now()}`,
        email: trimmedEmail,
        user_type: userType,
        full_name: trimmedEmail.split('@')[0],
        created_at: new Date().toISOString(),
        user_metadata: {
          full_name: trimmedEmail.split('@')[0],
          user_type: userType
        }
      };

      // Create session for the new user
      const session = createSession(newUser);
      storeSession(session);

      return {
        data: { session, user: newUser },
        error: null
      };
    }

    throw new Error('Invalid email or password');
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
 * Get current user
 */
export const getUser = async (): Promise<{ data: { user: LocalUser | null }, error: Error | null }> => {
  try {
    const { data, error } = await getSession();
    if (error) throw error;

    return {
      data: { user: data.session?.user || null },
      error: null
    };
  } catch (error) {
    return {
      data: { user: null },
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
