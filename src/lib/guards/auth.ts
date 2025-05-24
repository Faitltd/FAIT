import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { auth } from '$lib/stores/auth';
import { get } from 'svelte/store';

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (!browser) return false;
  return get(auth).isAuthenticated;
}

/**
 * Check if user has a specific role
 * @param {string | string[]} roles - Role or roles to check
 * @returns {boolean} True if user has the role
 */
export function hasRole(roles: string | string[]): boolean {
  if (!browser) return false;
  
  const authState = get(auth);
  if (!authState.isAuthenticated || !authState.user) return false;
  
  const userRole = authState.user.role;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
}

/**
 * Redirect to login if user is not authenticated
 * @param {string} [redirectTo] - URL to redirect to after login
 * @returns {boolean} True if user is authenticated
 */
export function requireAuth(redirectTo?: string): boolean {
  if (!browser) return false;
  
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
    goto(loginUrl);
  }
  
  return authenticated;
}

/**
 * Redirect to home if user doesn't have the required role
 * @param {string | string[]} roles - Role or roles required
 * @param {string} [redirectTo] - URL to redirect to if user doesn't have the role
 * @returns {boolean} True if user has the role
 */
export function requireRole(roles: string | string[], redirectTo: string = '/'): boolean {
  if (!browser) return false;
  
  // First check if user is authenticated
  if (!requireAuth()) return false;
  
  // Then check if user has the required role
  const hasRequiredRole = hasRole(roles);
  
  if (!hasRequiredRole) {
    goto(redirectTo);
  }
  
  return hasRequiredRole;
}
