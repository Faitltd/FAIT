/**
 * Authentication Context
 * 
 * This file provides the main authentication context for the application.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  AuthContextType, 
  UserType, 
  Permission, 
  UserActivity,
  AuthResponse
} from '../types';
import { 
  createAuthProvider, 
  toggleAuthMode as toggleAuthModeService,
  isUsingLocalAuth
} from '../services';

// Create the context with undefined as default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to determine user type from user object
const determineUserType = (user: User | null): UserType | null => {
  if (!user) return null;

  // Check user metadata for user_type
  const userType = user.user_metadata?.user_type as UserType;
  if (userType) return userType;

  // Check email domain as fallback
  const email = user.email;
  if (email) {
    if (email.endsWith('@admin.itsfait.com')) return 'admin';
    if (email.endsWith('@service.itsfait.com')) return 'service_agent';
    return 'client'; // Default to client
  }

  return null;
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
  // Create the auth provider
  const [authProvider] = useState(createAuthProvider());
  
  // User state
  const [user, setUser] = useState<User | null>(authProvider.getUser());
  const [session, setSession] = useState<Session | null>(authProvider.getSession());
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType | null>(determineUserType(user));
  const [userPermissions, setUserPermissions] = useState<Permission[]>(determineUserPermissions(userType));
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);

  // Mode state
  const [isLocalAuth, setIsLocalAuth] = useState(isUsingLocalAuth());
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(() => {
    return localStorage.getItem('developmentMode') === 'true';
  });

  // Initialize auth state
  useEffect(() => {
    console.log(`[Auth] Initializing with ${isLocalAuth ? 'local' : 'Supabase'} auth`);

    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Get current user and session
        const currentUser = authProvider.getUser();
        const currentSession = authProvider.getSession();
        
        setUser(currentUser);
        setSession(currentSession);
        setUserType(determineUserType(currentUser));
        
        console.log('[Auth] Auth initialized:', currentUser?.email);
      } catch (err) {
        console.error('[Auth] Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [authProvider, isLocalAuth]);

  // Update permissions when user type changes
  useEffect(() => {
    const permissions = determineUserPermissions(userType);
    setUserPermissions(permissions);
    console.log(`[Auth] User permissions updated:`, permissions);
  }, [userType]);

  // Log user activity
  const logUserActivity = (action: string, details?: string) => {
    const activity: UserActivity = {
      action,
      timestamp: new Date().toISOString(),
      details
    };

    setRecentActivity(prev => [activity, ...prev.slice(0, 9)]);
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  // Toggle auth mode
  const toggleAuthMode = (): boolean => {
    const newMode = toggleAuthModeService(undefined, true);
    setIsLocalAuth(newMode);
    logUserActivity('toggle_auth_mode', `Switched to ${newMode ? 'local' : 'Supabase'} auth`);
    return newMode;
  };

  // Toggle development mode
  const toggleDevelopmentMode = (): boolean => {
    const newMode = !isDevelopmentMode;
    setIsDevelopmentMode(newMode);
    localStorage.setItem('developmentMode', newMode.toString());
    logUserActivity('toggle_development_mode', `Development mode ${newMode ? 'enabled' : 'disabled'}`);
    return newMode;
  };

  // Authentication methods
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const result = await authProvider.signIn(email, password);
      
      if (!result.error && result.data) {
        setUser(result.data.user);
        setSession(result.data.session);
        setUserType(determineUserType(result.data.user));
        logUserActivity('sign_in', `Signed in as ${email}`);
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<AuthResponse> => {
    try {
      const result = await authProvider.signUp(email, password, userData);
      
      if (!result.error && result.data) {
        setUser(result.data.user);
        setSession(result.data.session);
        setUserType(determineUserType(result.data.user));
        logUserActivity('sign_up', `Signed up as ${email}`);
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authProvider.signOut();
      setUser(null);
      setSession(null);
      setUserType(null);
      logUserActivity('sign_out', 'Signed out');
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const result = await authProvider.resetPassword(email);
      
      if (!result.error) {
        logUserActivity('reset_password', `Password reset requested for ${email}`);
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const updateUserProfile = async (data: any): Promise<AuthResponse> => {
    try {
      const result = await authProvider.updateUserProfile(data);
      
      if (!result.error && result.data) {
        setUser(result.data.user);
        logUserActivity('update_profile', 'Profile updated');
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] Profile update error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    try {
      const result = await authProvider.signInWithGoogle();
      
      if (!result.error && result.data) {
        // For local auth, user will be set immediately
        // For Supabase, user will be set after redirect
        if (isLocalAuth && result.data.user) {
          setUser(result.data.user);
          setSession(result.data.session);
          setUserType(determineUserType(result.data.user));
          logUserActivity('sign_in_google', `Signed in with Google`);
        }
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] Google sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const signInWithFacebook = async (): Promise<AuthResponse> => {
    try {
      const result = await authProvider.signInWithFacebook();
      
      if (!result.error && result.data) {
        // For local auth, user will be set immediately
        // For Supabase, user will be set after redirect
        if (isLocalAuth && result.data.user) {
          setUser(result.data.user);
          setSession(result.data.session);
          setUserType(determineUserType(result.data.user));
          logUserActivity('sign_in_facebook', `Signed in with Facebook`);
        }
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] Facebook sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const setupMFA = async (): Promise<AuthResponse> => {
    try {
      const result = await authProvider.setupMFA();
      
      if (!result.error) {
        logUserActivity('setup_mfa', 'MFA setup initiated');
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] MFA setup error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const verifyMFA = async (code: string): Promise<AuthResponse> => {
    try {
      const result = await authProvider.verifyMFA(code);
      
      if (!result.error) {
        logUserActivity('verify_mfa', 'MFA verified');
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] MFA verification error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const disableMFA = async (): Promise<AuthResponse> => {
    try {
      const result = await authProvider.disableMFA();
      
      if (!result.error) {
        logUserActivity('disable_mfa', 'MFA disabled');
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] MFA disable error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const refreshSession = async (): Promise<AuthResponse> => {
    try {
      const result = await authProvider.refreshSession();
      
      if (!result.error && result.data) {
        setUser(result.data.user);
        setSession(result.data.session);
        logUserActivity('refresh_session', 'Session refreshed');
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] Session refresh error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const getSessionExpiry = (): number | null => {
    return authProvider.getSessionExpiry();
  };

  // Create context value
  const value: AuthContextType = {
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

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
