import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DirectAuthContextType {
  directAuthEnabled: boolean;
  enableDirectAuth: () => void;
  disableDirectAuth: () => void;
  isDirectAuthAvailable: boolean;
}

const DirectAuthContext = createContext<DirectAuthContextType | undefined>(undefined);

export const DirectAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [directAuthEnabled, setDirectAuthEnabled] = useState(false);
  const [isDirectAuthAvailable, setIsDirectAuthAvailable] = useState(false);

  useEffect(() => {
    // Check if direct auth is available in this environment
    const checkDirectAuthAvailability = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'direct_auth_available')
          .single();

        if (error) {
          console.error('Error checking direct auth availability:', error);
          setIsDirectAuthAvailable(false);
          return;
        }

        setIsDirectAuthAvailable(data?.value === 'true');
      } catch (error) {
        console.error('Error in checkDirectAuthAvailability:', error);
        setIsDirectAuthAvailable(false);
      }
    };

    checkDirectAuthAvailability();

    // Check if direct auth is enabled in local storage
    const storedDirectAuth = localStorage.getItem('directAuthEnabled');
    if (storedDirectAuth === 'true') {
      setDirectAuthEnabled(true);
    }
  }, []);

  const enableDirectAuth = () => {
    setDirectAuthEnabled(true);
    localStorage.setItem('directAuthEnabled', 'true');
  };

  const disableDirectAuth = () => {
    setDirectAuthEnabled(false);
    localStorage.setItem('directAuthEnabled', 'false');
  };

  const value = {
    directAuthEnabled,
    enableDirectAuth,
    disableDirectAuth,
    isDirectAuthAvailable,
  };

  return <DirectAuthContext.Provider value={value}>{children}</DirectAuthContext.Provider>;
};

export const useDirectAuth = () => {
  const context = useContext(DirectAuthContext);
  if (context === undefined) {
    throw new Error('useDirectAuth must be used within a DirectAuthProvider');
  }
  return context;
};
