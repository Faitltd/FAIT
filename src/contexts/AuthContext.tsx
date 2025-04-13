import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define an interface for emergency user
interface EmergencyUser {
  email: string;
  userType: string;
  isEmergencyLogin: boolean;
}

interface AuthContextType {
  user: User | null;
  emergencyUser: EmergencyUser | null;
  loading: boolean;
  isEmergencyMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  emergencyUser: null,
  loading: true,
  isEmergencyMode: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [emergencyUser, setEmergencyUser] = useState<EmergencyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  useEffect(() => {
    // Check for emergency login first
    const emergencyAuth = localStorage.getItem('emergency_auth');
    if (emergencyAuth) {
      try {
        const parsedAuth = JSON.parse(emergencyAuth) as EmergencyUser;
        setEmergencyUser(parsedAuth);
        setIsEmergencyMode(true);
        setLoading(false);
        console.log('Using emergency authentication mode');
        return; // Skip Supabase auth if we're in emergency mode
      } catch (error) {
        console.error('Error parsing emergency auth:', error);
        localStorage.removeItem('emergency_auth');
      }
    }

    // If no emergency login, proceed with normal Supabase auth
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, emergencyUser, loading, isEmergencyMode }}>
      {children}
    </AuthContext.Provider>
  );
};