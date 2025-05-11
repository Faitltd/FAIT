/**
 * useProtectedRoute Hook
 * 
 * This hook provides protection for routes that require authentication.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Permission } from '../types';

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requiredPermissions?: Permission[];
  requiredUserType?: 'admin' | 'client' | 'service_agent';
}

/**
 * Hook to protect routes that require authentication
 * @param options Configuration options
 * @returns Object with loading state and authentication status
 */
export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const { 
    redirectTo = '/login', 
    requiredPermissions = [], 
    requiredUserType 
  } = options;
  
  const { user, loading, userType, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!loading) {
      let authorized = !!user;
      
      // Check user type if required
      if (authorized && requiredUserType && userType !== requiredUserType) {
        authorized = false;
      }
      
      // Check permissions if required
      if (authorized && requiredPermissions.length > 0) {
        authorized = requiredPermissions.every(permission => hasPermission(permission));
      }
      
      setIsAuthorized(authorized);
      setIsCheckingAuth(false);
      
      // Redirect if not authorized
      if (!authorized) {
        navigate(redirectTo, { 
          state: { from: location.pathname },
          replace: true 
        });
      }
    }
  }, [
    user, 
    loading, 
    userType, 
    hasPermission, 
    requiredPermissions, 
    requiredUserType, 
    navigate, 
    redirectTo, 
    location.pathname
  ]);

  return { 
    isCheckingAuth: loading || isCheckingAuth, 
    isAuthorized 
  };
};

export default useProtectedRoute;
