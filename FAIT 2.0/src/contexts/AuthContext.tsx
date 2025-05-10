import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from '../lib/supabase';

// Define the type for the context
interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create and export the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => null,
  logout: async () => {},
  loading: true,
});

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create and export the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // For development purposes - set to true to bypass authentication
  const DEV_MODE = true;

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      if (DEV_MODE) {
        // Create a mock user for development
        setUser({
          id: 'dev-user-id',
          email: 'dev@example.com',
          user_metadata: {
            name: 'Development User'
          }
        });
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    checkSession();

    if (!DEV_MODE) {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null);
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Define the login function with debug logging
  const login = async (email: string, password: string) => {
    console.log('Login function called with email:', email);

    if (DEV_MODE) {
      console.log('DEV MODE: Bypassing authentication');
      const mockUser = {
        id: 'dev-user-id',
        email: email,
        user_metadata: {
          name: 'Development User'
        }
      };
      setUser(mockUser);
      return { user: mockUser };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      throw error;
    }

    console.log('Login successful, data:', data);
    return data;
  };

  // Define the logout function
  const logout = async () => {
    if (DEV_MODE) {
      console.log('DEV MODE: Simulating logout');
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
