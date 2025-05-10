/**
 * Authentication Types
 * 
 * This file defines the types used in the authentication module.
 */

import { User, Session } from '@supabase/supabase-js';

/**
 * User types in the system
 */
export type UserType = 'admin' | 'client' | 'service_agent';

/**
 * Permission types for authorization
 */
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

/**
 * User activity for tracking
 */
export interface UserActivity {
  action: string;
  timestamp: string;
  details?: string;
}

/**
 * Authentication provider interface
 */
export interface AuthProvider {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, userData: any) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateUserProfile: (data: any) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithFacebook: () => Promise<AuthResponse>;
  setupMFA: () => Promise<AuthResponse>;
  verifyMFA: (code: string) => Promise<AuthResponse>;
  disableMFA: () => Promise<AuthResponse>;
  refreshSession: () => Promise<AuthResponse>;
  getSessionExpiry: () => number | null;
  getUser: () => User | null;
  getSession: () => Session | null;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  data: any;
  error: Error | null;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
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
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, userData: any) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateUserProfile: (data: any) => Promise<AuthResponse>;

  // OAuth methods
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithFacebook: () => Promise<AuthResponse>;

  // MFA methods
  setupMFA: () => Promise<AuthResponse>;
  verifyMFA: (code: string) => Promise<AuthResponse>;
  disableMFA: () => Promise<AuthResponse>;

  // Session management
  refreshSession: () => Promise<AuthResponse>;
  getSessionExpiry: () => number | null;

  // Mode toggles
  toggleAuthMode: () => boolean;
  toggleDevelopmentMode: () => boolean;

  // Utility methods
  logUserActivity: (action: string, details?: string) => void;
  hasPermission: (permission: Permission) => boolean;
}

/**
 * Test user for local authentication
 */
export interface TestUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  user_type: UserType;
}
