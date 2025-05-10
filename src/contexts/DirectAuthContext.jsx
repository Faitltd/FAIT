/**
 * DirectAuthContext.jsx
 *
 * This file provides a compatibility layer for direct authentication.
 * It uses the UnifiedAuthContext as the underlying implementation.
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from './UnifiedAuthContext';
import { isDirectAuthEnabled, directAuthSignOut } from '../lib/directAuth';

// Create the context
const DirectAuthContext = createContext(null);

// Custom hook to use the direct auth context
export const useDirectAuth = () => {
  const unifiedAuth = useAuth();

  // Create a compatibility layer
  return {
    user: unifiedAuth.user,
    loading: unifiedAuth.loading,
    enabled: isDirectAuthEnabled(),
    signOut: async () => {
      directAuthSignOut();
      await unifiedAuth.signOut();
    }
  };
};

// Provider component that uses the UnifiedAuthContext
export const DirectAuthProvider = ({ children }) => {
  return children;
};

export default DirectAuthContext;
