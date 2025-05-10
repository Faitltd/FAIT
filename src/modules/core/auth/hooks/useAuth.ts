/**
 * useAuth Hook
 * 
 * This hook provides access to the authentication context.
 */

import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import { AuthContextType } from '../types';

/**
 * Hook to access the authentication context
 * @returns The authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
