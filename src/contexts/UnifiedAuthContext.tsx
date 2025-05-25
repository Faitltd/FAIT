import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Define user types
export type UserType = 'admin' | 'client' | 'service_agent';

// Define permission types
export type Permission =
  | 'view_dashboard'
  | 'manage_projects'
  | 'manage_services'
  | 'manage_users'
  | 'manage_bookings'
  | 'view_analytics'
  | 'manage_payments'
  | 'manage_subscriptions'
  | 'manage_verifications'
  | 'manage_warranties'
  | 'send_messages';

// Define user activity type for tracking
export interface UserActivity {
  action: string;
  timestamp: string;
  details?: string;
}

// Define the context type
interface AuthContextType {
  // User state
  user: User | null;
  session: Session | null;
  loading: boolean;
  userType: UserType | null;
  userPermissions: Permission[];
  recentActivity: UserActivity[];

  // Authentication mode
  isLocalAuth: boolean;
  isDevelopmentMode: boolean;

  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ data: any; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: Error | null }>;
  updateUserProfile: (data: any) => Promise<{ data: any; error: Error | null }>;

  // OAuth methods
  signInWithGoogle: () => Promise<{ data: any; error: Error | null }>;
  signInWithFacebook: () => Promise<{ data: any; error: Error | null }>;

  // MFA methods
  setupMFA: () => Promise<{ data: any; error: Error | null }>;
  verifyMFA: (code: string) => Promise<{ data: any; error: Error | null }>;
  disableMFA: () => Promise<{ data: any; error: Error | null }>;

  // Session management
  refreshSession: () => Promise<{ data: any; error: Error | null }>;
  getSessionExpiry: () => number | null;

  // Mode toggles
  toggleAuthMode: () => boolean;
  toggleDevelopmentMode: () => boolean;

  // Utility methods
  logUserActivity: (action: string, details?: string) => void;
  hasPermission: (permission: Permission) => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Predefined test users for local authentication
const TEST_USERS = [
  {
    id: 'admin-uuid',
    email: 'admin@itsfait.com',
    password: 'admin123',
    user_type: 'admin',
    full_name: 'Admin User',
  },
  {
    id: 'client-uuid',
    email: 'client@itsfait.com',
    password: 'client123',
    user_type: 'client',
    full_name: 'Client User',
  },
  {
    id: 'service-uuid',
    email: 'service@itsfait.com',
    password: 'service123',
    user_type: 'service_agent',
    full_name: 'Service Agent',
  },
];

// Helper function to determine user type from user object
const determineUserType = (user: User | null): UserType | null => {
  if (!user) return null;

  // Check user metadata first
  if (user.user_metadata?.user_type) {
    return user.user_metadata.user_type as UserType;
  }

  // Check email patterns as fallback
  const email = user.email?.toLowerCase() || '';
  if (email.includes('admin')) return 'admin';
  if (email.includes('service')) return 'service_agent';
  return 'client';
};

// Helper function to determine permissions based on user type
const determineUserPermissions = (userType: UserType | null): Permission[] => {
  if (!userType) return [];

  const basePermissions: Permission[] = ['view_dashboard', 'send_messages'];

  switch (userType) {
    case 'admin':
      return [
        ...basePermissions,
        'manage_projects',
        'manage_services',
        'manage_users',
        'manage_bookings',
        'view_analytics',
        'manage_payments',
        'manage_subscriptions',
        'manage_verifications',
        'manage_warranties'
      ];
    case 'service_agent':
      return [
        ...basePermissions,
        'manage_projects',
        'manage_services',
        'manage_bookings'
      ];
    case 'client':
      return [
        ...basePermissions,
        'manage_projects'
      ];
    default:
      return basePermissions;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);

  // Mode state
  const [isLocalAuth, setIsLocalAuth] = useState(() => {
    return localStorage.getItem('useLocalAuth') === 'true' ||
           (import.meta.env.MODE === 'development' && localStorage.getItem('useLocalAuth') !== 'false');
  });
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(() => {
    return localStorage.getItem('developmentMode') === 'true';
  });

  // Initialize auth state
  useEffect(() => {
    console.log(`[Auth] Initializing with ${isLocalAuth ? 'local' : 'Supabase'} auth`);

    const initAuth = async () => {
      try {
        setLoading(true);

        if (isLocalAuth) {
          // Check for local session
          const localSession = localStorage.getItem('localAuthSession');
          if (localSession) {
            try {
              const parsedSession = JSON.parse(localSession);
              setUser(parsedSession.user);
              setSession(parsedSession);
              setUserType(determineUserType(parsedSession.user));
              console.log('[Auth] Restored local session for', parsedSession.user.email);
            } catch (err) {
              console.error('[Auth] Error parsing local session:', err);
              localStorage.removeItem('localAuthSession');
            }
          }
        } else {
          // Check for Supabase session
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setUser(data.session.user);
            setSession(data.session);
            setUserType(determineUserType(data.session.user));
            console.log('[Auth] Restored Supabase session for', data.session.user.email);
          }
        }
      } catch (err) {
        console.error('[Auth] Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up Supabase auth listener if not using local auth
    if (!isLocalAuth) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('[Auth] Auth state changed:', event);
          setUser(session?.user || null);
          setSession(session);
          setUserType(determineUserType(session?.user || null));
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isLocalAuth]);

  // Update permissions when user type changes
  useEffect(() => {
    const permissions = determineUserPermissions(userType);
    setUserPermissions(permissions);
    console.log(`[Auth] User permissions updated:`, permissions);
  }, [userType]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log(`[Auth] Sign in attempt with ${isLocalAuth ? 'local' : 'Supabase'} auth`);

    try {
      if (isLocalAuth) {
        // Local authentication
        const normalizedEmail = email.toLowerCase().trim();
        const testUser = TEST_USERS.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);

        if (testUser) {
          // Create mock user and session
          const mockUser = {
            id: testUser.id,
            email: testUser.email,
            user_metadata: {
              full_name: testUser.full_name,
              user_type: testUser.user_type
            },
            app_metadata: {},
            created_at: new Date().toISOString()
          } as User;

          const mockSession = {
            user: mockUser,
            access_token: `local-token-${Date.now()}`,
            refresh_token: `local-refresh-${Date.now()}`,
            expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          };

          // Store in local storage
          localStorage.setItem('localAuthSession', JSON.stringify(mockSession));

          // Update state
          setUser(mockUser);
          setSession(mockSession as unknown as Session);
          setUserType(testUser.user_type as UserType);

          // Log activity
          logUserActivity('sign_in', `Local auth sign in as ${testUser.user_type}`);

          console.log('[Auth] Local sign in successful for', email);
          return { data: { user: mockUser, session: mockSession }, error: null };
        } else {
          console.error('[Auth] Local sign in failed: Invalid credentials');
          return { data: null, error: new Error('Invalid email or password') };
        }
      } else {
        // Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('[Auth] Supabase sign in error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('sign_in', `Supabase auth sign in`);

        console.log('[Auth] Supabase sign in successful for', email);
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: any) => {
    console.log(`[Auth] Sign up attempt with ${isLocalAuth ? 'local' : 'Supabase'} auth`);

    try {
      if (isLocalAuth) {
        // For local auth, just sign in the user as if they already exist
        return signIn(email, password);
      } else {
        // Supabase authentication
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData
          }
        });

        if (error) {
          console.error('[Auth] Supabase sign up error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('sign_up', `New user registration`);

        console.log('[Auth] Supabase sign up successful for', email);
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Sign out function
  const signOut = async () => {
    console.log(`[Auth] Sign out with ${isLocalAuth ? 'local' : 'Supabase'} auth`);

    try {
      // Log activity before signing out
      logUserActivity('sign_out');

      if (isLocalAuth) {
        // Local authentication
        localStorage.removeItem('localAuthSession');
      } else {
        // Supabase authentication
        await supabase.auth.signOut();
      }

      // Clear state
      setUser(null);
      setSession(null);
      setUserType(null);

      console.log('[Auth] Sign out successful');
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    console.log(`[Auth] Reset password attempt with ${isLocalAuth ? 'local' : 'Supabase'} auth`);

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        console.log('[Auth] Local reset password for', email);
        return { data: {}, error: null };
      } else {
        // Supabase authentication
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
          console.error('[Auth] Supabase reset password error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('reset_password_request', `Password reset requested for ${email}`);

        console.log('[Auth] Supabase reset password email sent to', email);
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Update user profile function
  const updateUserProfile = async (userData: any) => {
    console.log(`[Auth] Update profile with ${isLocalAuth ? 'local' : 'Supabase'} auth`);

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        if (!user) {
          return { data: null, error: new Error('No user logged in') };
        }

        // Update the mock user
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...userData
          }
        };

        // Update the session in local storage
        const localSession = localStorage.getItem('localAuthSession');
        if (localSession) {
          const parsedSession = JSON.parse(localSession);
          parsedSession.user = updatedUser;
          localStorage.setItem('localAuthSession', JSON.stringify(parsedSession));
        }

        // Update state
        setUser(updatedUser);

        // Log activity
        logUserActivity('profile_update', 'User profile updated');

        console.log('[Auth] Local profile update successful');
        return { data: { user: updatedUser }, error: null };
      } else {
        // Supabase authentication
        const { data, error } = await supabase.auth.updateUser({
          data: userData
        });

        if (error) {
          console.error('[Auth] Supabase profile update error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('profile_update', 'User profile updated');

        console.log('[Auth] Supabase profile update successful');
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] Profile update error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Toggle auth mode function
  const toggleAuthMode = () => {
    const newMode = !isLocalAuth;
    setIsLocalAuth(newMode);
    localStorage.setItem('useLocalAuth', newMode.toString());
    console.log(`[Auth] Switched to ${newMode ? 'local' : 'Supabase'} auth`);

    // Log activity
    logUserActivity('toggle_auth_mode', `Switched to ${newMode ? 'local' : 'Supabase'} auth`);

    // Force reload to apply changes
    window.location.reload();

    return newMode;
  };

  // Toggle development mode function
  const toggleDevelopmentMode = () => {
    const newMode = !isDevelopmentMode;
    setIsDevelopmentMode(newMode);
    localStorage.setItem('developmentMode', newMode.toString());
    console.log(`[Auth] Development mode ${newMode ? 'enabled' : 'disabled'}`);

    // Log activity
    logUserActivity('toggle_dev_mode', `Development mode ${newMode ? 'enabled' : 'disabled'}`);

    return newMode;
  };

  // Log user activity
  const logUserActivity = (action: string, details?: string) => {
    const activity: UserActivity = {
      action,
      timestamp: new Date().toISOString(),
      details
    };

    setRecentActivity(prev => {
      const newActivity = [activity, ...prev];
      // Keep only the 20 most recent activities
      return newActivity.slice(0, 20);
    });

    console.log(`[Auth] Activity logged: ${action}${details ? ` - ${details}` : ''}`);
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  // OAuth sign in methods
  const signInWithGoogle = async () => {
    console.log('[Auth] Google sign in attempt');

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        // Use the admin user for testing
        const testUser = TEST_USERS.find(u => u.email === 'admin@itsfait.com');

        if (testUser) {
          // Create mock user and session
          const mockUser = {
            id: testUser.id,
            email: testUser.email,
            user_metadata: {
              full_name: testUser.full_name,
              user_type: testUser.user_type,
              auth_provider: 'google'
            },
            app_metadata: {},
            created_at: new Date().toISOString()
          } as User;

          const mockSession = {
            user: mockUser,
            access_token: `local-google-token-${Date.now()}`,
            refresh_token: `local-google-refresh-${Date.now()}`,
            expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          };

          // Store in local storage
          localStorage.setItem('localAuthSession', JSON.stringify(mockSession));

          // Update state
          setUser(mockUser);
          setSession(mockSession as unknown as Session);
          setUserType(testUser.user_type as UserType);

          // Log activity
          logUserActivity('sign_in', `Local auth sign in with Google as ${testUser.user_type}`);

          console.log('[Auth] Local Google sign in successful');
          return { data: { user: mockUser, session: mockSession }, error: null };
        } else {
          return { data: null, error: new Error('Google authentication failed') };
        }
      } else {
        // Supabase OAuth authentication
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/oauth-callback`
          }
        });

        if (error) {
          console.error('[Auth] Google sign in error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('sign_in', 'Google sign in initiated');

        console.log('[Auth] Google sign in initiated');
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] Google sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const signInWithFacebook = async () => {
    console.log('[Auth] Facebook sign in attempt');

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        // Use the client user for testing
        const testUser = TEST_USERS.find(u => u.email === 'client@itsfait.com');

        if (testUser) {
          // Create mock user and session
          const mockUser = {
            id: testUser.id,
            email: testUser.email,
            user_metadata: {
              full_name: testUser.full_name,
              user_type: testUser.user_type,
              auth_provider: 'facebook'
            },
            app_metadata: {},
            created_at: new Date().toISOString()
          } as User;

          const mockSession = {
            user: mockUser,
            access_token: `local-facebook-token-${Date.now()}`,
            refresh_token: `local-facebook-refresh-${Date.now()}`,
            expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          };

          // Store in local storage
          localStorage.setItem('localAuthSession', JSON.stringify(mockSession));

          // Update state
          setUser(mockUser);
          setSession(mockSession as unknown as Session);
          setUserType(testUser.user_type as UserType);

          // Log activity
          logUserActivity('sign_in', `Local auth sign in with Facebook as ${testUser.user_type}`);

          console.log('[Auth] Local Facebook sign in successful');
          return { data: { user: mockUser, session: mockSession }, error: null };
        } else {
          return { data: null, error: new Error('Facebook authentication failed') };
        }
      } else {
        // Supabase OAuth authentication
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: `${window.location.origin}/oauth-callback`
          }
        });

        if (error) {
          console.error('[Auth] Facebook sign in error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('sign_in', 'Facebook sign in initiated');

        console.log('[Auth] Facebook sign in initiated');
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] Facebook sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // MFA methods
  const setupMFA = async () => {
    console.log('[Auth] MFA setup attempt');

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        console.log('[Auth] Local MFA setup (mock)');

        // Store MFA setup in local storage
        localStorage.setItem('localMFAEnabled', 'true');

        // Log activity
        logUserActivity('mfa_setup', 'MFA setup completed (local)');

        return {
          data: {
            id: 'mock-mfa-id',
            qr_code: 'https://via.placeholder.com/150?text=Mock+QR+Code',
            secret: 'MOCKSECRET123456'
          },
          error: null
        };
      } else {
        // Supabase MFA setup
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp'
        });

        if (error) {
          console.error('[Auth] MFA setup error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('mfa_setup', 'MFA setup initiated');

        console.log('[Auth] MFA setup successful');
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] MFA setup error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const verifyMFA = async (code: string) => {
    console.log('[Auth] MFA verification attempt');

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        console.log('[Auth] Local MFA verification (mock)');

        // For testing, accept any 6-digit code
        if (code.length === 6 && /^\d+$/.test(code)) {
          // Log activity
          logUserActivity('mfa_verify', 'MFA verification successful (local)');

          return { data: { success: true }, error: null };
        } else {
          return { data: null, error: new Error('Invalid verification code') };
        }
      } else {
        // Supabase MFA verification
        const { data, error } = await supabase.auth.mfa.challenge({
          factorId: 'totp'
        });

        if (error) {
          console.error('[Auth] MFA challenge error:', error);
          return { data: null, error };
        }

        const challengeId = data.id;

        const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
          factorId: 'totp',
          challengeId,
          code
        });

        if (verifyError) {
          console.error('[Auth] MFA verification error:', verifyError);
          return { data: null, error: verifyError };
        }

        // Log activity
        logUserActivity('mfa_verify', 'MFA verification successful');

        console.log('[Auth] MFA verification successful');
        return { data: verifyData, error: null };
      }
    } catch (error) {
      console.error('[Auth] MFA verification error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const disableMFA = async () => {
    console.log('[Auth] MFA disable attempt');

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        console.log('[Auth] Local MFA disable (mock)');

        // Remove MFA setup from local storage
        localStorage.removeItem('localMFAEnabled');

        // Log activity
        logUserActivity('mfa_disable', 'MFA disabled (local)');

        return { data: { success: true }, error: null };
      } else {
        // Supabase MFA disable
        const { data, error } = await supabase.auth.mfa.unenroll({
          factorId: 'totp'
        });

        if (error) {
          console.error('[Auth] MFA disable error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('mfa_disable', 'MFA disabled');

        console.log('[Auth] MFA disable successful');
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] MFA disable error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  // Session management methods
  const refreshSession = async () => {
    console.log('[Auth] Session refresh attempt');

    try {
      if (isLocalAuth) {
        // Mock implementation for local auth
        console.log('[Auth] Local session refresh (mock)');

        // Get current session
        const localSession = localStorage.getItem('localAuthSession');
        if (!localSession) {
          return { data: null, error: new Error('No active session') };
        }

        // Parse and update expiry
        const parsedSession = JSON.parse(localSession);
        parsedSession.expires_at = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Store updated session
        localStorage.setItem('localAuthSession', JSON.stringify(parsedSession));

        // Update state
        setSession(parsedSession as unknown as Session);

        // Log activity
        logUserActivity('session_refresh', 'Session refreshed (local)');

        return { data: parsedSession, error: null };
      } else {
        // Supabase session refresh
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          console.error('[Auth] Session refresh error:', error);
          return { data: null, error };
        }

        // Log activity
        logUserActivity('session_refresh', 'Session refreshed');

        console.log('[Auth] Session refresh successful');
        return { data, error: null };
      }
    } catch (error) {
      console.error('[Auth] Session refresh error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const getSessionExpiry = (): number | null => {
    if (isLocalAuth) {
      // Get expiry from local storage
      const localSession = localStorage.getItem('localAuthSession');
      if (localSession) {
        try {
          const parsedSession = JSON.parse(localSession);
          return parsedSession.expires_at;
        } catch (error) {
          console.error('[Auth] Error parsing local session:', error);
          return null;
        }
      }
      return null;
    } else {
      // Get expiry from Supabase session
      return session?.expires_at ?? null;
    }
  };

  // Create context value
  const value = {
    user,
    session,
    loading,
    userType,
    isLocalAuth,
    isDevelopmentMode,
    userPermissions,
    recentActivity,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    signInWithGoogle,
    signInWithFacebook,
    setupMFA,
    verifyMFA,
    disableMFA,
    refreshSession,
    getSessionExpiry,
    toggleAuthMode,
    toggleDevelopmentMode,
    logUserActivity,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
