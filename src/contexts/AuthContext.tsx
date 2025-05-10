/**
 * AuthContext.tsx
 *
 * This file provides the main authentication context for the application.
 * It uses the UnifiedAuthContext as the underlying implementation.
 */

import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import UnifiedAuthContext, {
  useAuth as useUnifiedAuth,
  AuthProvider as UnifiedAuthProvider,
  UserType,
  Permission as UnifiedPermission,
  UserActivity as UnifiedUserActivity
} from './UnifiedAuthContext';

// Define user permission types
export type Permission =
  | 'create:project'
  | 'edit:project'
  | 'delete:project'
  | 'view:project'
  | 'create:service'
  | 'edit:service'
  | 'delete:service'
  | 'view:service'
  | 'manage:users'
  | 'view:analytics'
  | 'process:payments'
  | 'view:payments'
  | 'manage:system'
  | UnifiedPermission; // Include unified permissions

// Define user activity type for tracking
export type UserActivity = {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view';
  resource_type: string;
  resource_id?: string;
  details?: object;
  created_at: string;
  ip_address?: string;
};

// Define the context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userType: UserType | null;
  isLocalAuth: boolean;
  isDevelopmentMode: boolean;
  userPermissions: Permission[];
  recentActivity: UserActivity[];

  // Authentication methods
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signUp: (email: string, password: string, userData?: object) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;

  // OAuth methods
  signInWithGoogle: () => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signInWithFacebook: () => Promise<{
    error: Error | null;
    data: any | null;
  }>;

  // MFA methods
  setupMFA: () => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  verifyMFA: (code: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  disableMFA: () => Promise<{
    error: Error | null;
    data: any | null;
  }>;

  // Session management
  refreshSession: () => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  getSessionExpiry: () => number | null;

  // User profile methods
  updateUserProfile: (data: object) => Promise<{
    error: Error | null;
    data: { user: User | null } | null;
  }>;

  // Development mode methods
  toggleDevelopmentMode: () => void;
  toggleAuthMode: () => void;

  // User activity methods
  logUserActivity: (activity: Omit<UserActivity, 'id' | 'user_id' | 'created_at'>) => Promise<void>;

  // Permission methods
  hasPermission: (permission: Permission) => boolean;
}

// Create a context that will be used by components
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const unifiedAuth = useUnifiedAuth();

  // Create a compatibility layer to match the expected interface
  const auth: AuthContextType = {
    user: unifiedAuth.user,
    session: unifiedAuth.session,
    loading: unifiedAuth.loading,
    userType: unifiedAuth.userType,
    isLocalAuth: unifiedAuth.isLocalAuth,
    isDevelopmentMode: unifiedAuth.isDevelopmentMode,
    userPermissions: unifiedAuth.userPermissions as Permission[],
    recentActivity: unifiedAuth.recentActivity as unknown as UserActivity[],

    // Authentication methods
    signIn: async (email, password) => {
      const result = await unifiedAuth.signIn(email, password);
      return {
        data: result.data,
        error: result.error
      };
    },

    signUp: async (email, password, userData) => {
      const result = await unifiedAuth.signUp(email, password, userData || {});
      return {
        data: result.data,
        error: result.error
      };
    },

    signOut: async () => {
      await unifiedAuth.signOut();
      return { error: null };
    },

    resetPassword: async (email) => {
      const result = await unifiedAuth.resetPassword(email);
      return {
        error: result.error
      };
    },

    // OAuth methods
    signInWithGoogle: async () => {
      const result = await unifiedAuth.signInWithGoogle();
      return {
        data: result.data,
        error: result.error
      };
    },

    signInWithFacebook: async () => {
      const result = await unifiedAuth.signInWithFacebook();
      return {
        data: result.data,
        error: result.error
      };
    },

    // MFA methods
    setupMFA: async () => {
      const result = await unifiedAuth.setupMFA();
      return {
        data: result.data,
        error: result.error
      };
    },

    verifyMFA: async (code) => {
      const result = await unifiedAuth.verifyMFA(code);
      return {
        data: result.data,
        error: result.error
      };
    },

    disableMFA: async () => {
      const result = await unifiedAuth.disableMFA();
      return {
        data: result.data,
        error: result.error
      };
    },

    // Session management
    refreshSession: async () => {
      const result = await unifiedAuth.refreshSession();
      return {
        data: result.data,
        error: result.error
      };
    },

    getSessionExpiry: () => {
      return unifiedAuth.getSessionExpiry();
    },

    // User profile methods
    updateUserProfile: async (data) => {
      const result = await unifiedAuth.updateUserProfile(data);
      return {
        data: result.data,
        error: result.error
      };
    },

    // Development mode methods
    toggleDevelopmentMode: () => {
      unifiedAuth.toggleDevelopmentMode();
    },

    toggleAuthMode: () => {
      unifiedAuth.toggleAuthMode();
      return unifiedAuth.isLocalAuth;
    },

    // User activity methods
    logUserActivity: async (activity) => {
      unifiedAuth.logUserActivity(activity.action, JSON.stringify(activity.details));
    },

    // Permission methods
    hasPermission: (permission) => {
      // Convert permission format if needed
      const unifiedPermission = permission as UnifiedPermission;
      return unifiedAuth.hasPermission(unifiedPermission);
    }
  };

  return auth;
};

// Provider component that wraps the application
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <UnifiedAuthProvider>
      {children}
    </UnifiedAuthProvider>
  );
}

export default AuthContext;