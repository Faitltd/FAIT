/**
 * Authentication Services
 * 
 * This file exports the authentication services and provides a factory
 * for creating the appropriate authentication provider.
 */

import { AuthProvider } from '../types';
import { SupabaseAuthProvider } from './supabaseAuth';
import { LocalAuthProvider, TEST_USERS } from './localAuth';

// Default to local auth in development/test environments for reliability
const DEFAULT_LOCAL_AUTH = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test';

// Initialize auth mode from localStorage or default to local auth in development
let useLocalAuth = localStorage.getItem('useLocalAuth') === 'true' ||
                  (localStorage.getItem('useLocalAuth') === null && DEFAULT_LOCAL_AUTH);

/**
 * Create an authentication provider based on the current mode
 */
export function createAuthProvider(): AuthProvider {
  if (useLocalAuth) {
    console.log('[Auth] Using local authentication provider');
    return new LocalAuthProvider();
  } else {
    console.log('[Auth] Using Supabase authentication provider');
    return new SupabaseAuthProvider();
  }
}

/**
 * Toggle the authentication mode
 * @param newMode Optional explicit mode to set
 * @param reload Whether to reload the page after toggling
 * @returns The new auth mode
 */
export function toggleAuthMode(newMode?: boolean, reload: boolean = false): boolean {
  if (newMode !== undefined) {
    useLocalAuth = newMode;
  } else {
    useLocalAuth = !useLocalAuth;
  }

  // Persist the setting in localStorage
  localStorage.setItem('useLocalAuth', useLocalAuth.toString());

  console.log(`[Auth] Mode changed to: ${useLocalAuth ? 'local' : 'Supabase'}`);

  // Optionally reload the page to apply changes
  if (reload && typeof window !== 'undefined') {
    window.location.reload();
  }

  return useLocalAuth;
}

/**
 * Check if local authentication is being used
 */
export function isUsingLocalAuth(): boolean {
  return useLocalAuth;
}

/**
 * Get test users for local authentication
 */
export function getTestUsers(): typeof TEST_USERS {
  return TEST_USERS;
}

// Export all services
export { SupabaseAuthProvider } from './supabaseAuth';
export { LocalAuthProvider, TEST_USERS } from './localAuth';
