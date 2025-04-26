// Hook for using local authentication bypass
import { useState, useEffect } from 'react';
import { localAuthBypass } from '../lib/localAuthBypass';

export const useLocalAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user on mount
  useEffect(() => {
    const currentUser = localAuthBypass.getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    const { data, error } = localAuthBypass.signInWithEmailAndPassword(email, password);
    
    if (error) {
      return { error };
    }
    
    setUser(data.user);
    return { data, error: null };
  };

  // Sign out function
  const signOut = () => {
    localAuthBypass.signOut();
    setUser(null);
    return { error: null };
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
};

export default useLocalAuth;
