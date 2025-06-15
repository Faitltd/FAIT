import type { User } from '../stores/auth';

export type UserRole = 'client' | 'provider' | 'admin';

export interface Permission {
  resource: string;
  action: string;
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  client: [
    { resource: 'bookings', action: 'create' },
    { resource: 'bookings', action: 'read_own' },
    { resource: 'bookings', action: 'update_own' },
    { resource: 'bookings', action: 'cancel_own' },
    { resource: 'services', action: 'read' },
    { resource: 'reviews', action: 'create' },
    { resource: 'reviews', action: 'read' },
    { resource: 'profile', action: 'read_own' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'messages', action: 'read_own' },
    { resource: 'messages', action: 'send' },
  ],
  provider: [
    { resource: 'bookings', action: 'read_assigned' },
    { resource: 'bookings', action: 'update_assigned' },
    { resource: 'bookings', action: 'complete' },
    { resource: 'services', action: 'create_own' },
    { resource: 'services', action: 'read' },
    { resource: 'services', action: 'update_own' },
    { resource: 'services', action: 'delete_own' },
    { resource: 'availability', action: 'manage_own' },
    { resource: 'reviews', action: 'read' },
    { resource: 'profile', action: 'read_own' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'messages', action: 'read_own' },
    { resource: 'messages', action: 'send' },
    { resource: 'earnings', action: 'read_own' },
  ],
  admin: [
    { resource: 'bookings', action: 'read_all' },
    { resource: 'bookings', action: 'update_all' },
    { resource: 'bookings', action: 'delete_all' },
    { resource: 'services', action: 'read_all' },
    { resource: 'services', action: 'update_all' },
    { resource: 'services', action: 'delete_all' },
    { resource: 'users', action: 'read_all' },
    { resource: 'users', action: 'update_all' },
    { resource: 'users', action: 'delete_all' },
    { resource: 'reviews', action: 'read_all' },
    { resource: 'reviews', action: 'moderate' },
    { resource: 'analytics', action: 'read_all' },
    { resource: 'system', action: 'manage' },
    { resource: 'messages', action: 'read_all' },
    { resource: 'messages', action: 'send' },
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, resource: string, action: string): boolean {
  if (!user) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
  return userPermissions.some(
    permission => permission.resource === resource && permission.action === action
  );
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  
  return permissions.some(permission => 
    hasPermission(user, permission.resource, permission.action)
  );
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  
  return permissions.every(permission => 
    hasPermission(user, permission.resource, permission.action)
  );
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

/**
 * Get all permissions for a user's role
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user) return [];
  return ROLE_PERMISSIONS[user.role as UserRole] || [];
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return false;

  // Define route access rules
  const routeAccess: Record<string, UserRole[]> = {
    '/admin': ['admin'],
    '/dashboard/admin': ['admin'],
    '/dashboard/provider': ['provider', 'admin'],
    '/dashboard/client': ['client', 'provider', 'admin'],
    '/services/manage': ['provider', 'admin'],
    '/bookings/manage': ['provider', 'admin'],
    '/analytics': ['admin'],
    '/users/manage': ['admin'],
  };

  const allowedRoles = routeAccess[route];
  if (!allowedRoles) return true; // Public route

  return hasAnyRole(user, allowedRoles);
}

/**
 * Filter data based on user permissions
 */
export function filterByPermission<T extends { user_id?: string; client_id?: string; service_agent_id?: string }>(
  user: User | null,
  data: T[],
  resource: string
): T[] {
  if (!user) return [];

  if (hasPermission(user, resource, 'read_all')) {
    return data;
  }

  if (hasPermission(user, resource, 'read_own')) {
    return data.filter(item => 
      item.user_id === user.id || 
      item.client_id === user.id || 
      item.service_agent_id === user.id
    );
  }

  if (hasPermission(user, resource, 'read_assigned')) {
    return data.filter(item => item.service_agent_id === user.id);
  }

  return [];
}

/**
 * Session security utilities
 */
export const sessionSecurity = {
  /**
   * Check if session is expired
   */
  isSessionExpired(expiresAt: number | null): boolean {
    if (!expiresAt) return true;
    return Date.now() > expiresAt * 1000;
  },

  /**
   * Get session time remaining in minutes
   */
  getSessionTimeRemaining(expiresAt: number | null): number {
    if (!expiresAt) return 0;
    const remaining = (expiresAt * 1000) - Date.now();
    return Math.max(0, Math.floor(remaining / (1000 * 60)));
  },

  /**
   * Check if session needs refresh (less than 5 minutes remaining)
   */
  needsRefresh(expiresAt: number | null): boolean {
    return this.getSessionTimeRemaining(expiresAt) < 5;
  }
};
