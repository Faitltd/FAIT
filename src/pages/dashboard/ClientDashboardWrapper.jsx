import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import ClientDashboardFixed from './ClientDashboardFixed';
import AuthContext from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// This wrapper component bridges the gap between the UnifiedAuthContext and the AuthContext
// It takes the user from UnifiedAuthContext and passes it to the AuthContext
const ClientDashboardWrapper = () => {
  const unifiedAuth = useAuth();

  // Create a value object for the old AuthContext
  const authContextValue = {
    user: unifiedAuth.user,
    session: unifiedAuth.session,
    signOut: unifiedAuth.signOut,
    loading: unifiedAuth.loading,
    signIn: unifiedAuth.signIn,
    signUp: unifiedAuth.signUp,
    resetPassword: unifiedAuth.resetPassword
  };

  // Monkey patch the supabase client to make it available in the ClientDashboard
  if (!window.supabaseClientPatched) {
    window.supabaseClientPatched = true;
    // Make the supabase client from supabase.ts available as supabaseClient.js
    window.supabaseFromTS = supabase;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <ClientDashboardFixed />
    </AuthContext.Provider>
  );
};

export default ClientDashboardWrapper;
