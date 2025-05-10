/**
 * useSessionManager Hook
 * 
 * This hook manages the user session, including auto-refresh and timeout warnings.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface UseSessionManagerOptions {
  warningTime?: number; // Time in ms before expiry to show warning
  autoRefreshTime?: number; // Time in ms before expiry to auto-refresh
  onSessionExpiring?: () => void; // Callback when session is about to expire
  onSessionRefreshed?: () => void; // Callback when session is refreshed
}

/**
 * Hook to manage the user session
 * @param options Configuration options
 * @returns Object with session status and management functions
 */
export const useSessionManager = (options: UseSessionManagerOptions = {}) => {
  const { 
    warningTime = 5 * 60 * 1000, // 5 minutes before expiry
    autoRefreshTime = 10 * 60 * 1000, // 10 minutes before expiry
    onSessionExpiring,
    onSessionRefreshed
  } = options;
  
  const { user, session, refreshSession, getSessionExpiry, signOut } = useAuth();
  const [isExpiring, setIsExpiring] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (warningTimer) clearTimeout(warningTimer);
    if (refreshTimer) clearTimeout(refreshTimer);
    setWarningTimer(null);
    setRefreshTimer(null);
  }, [warningTimer, refreshTimer]);

  // Refresh the session
  const handleRefreshSession = useCallback(async () => {
    if (user) {
      try {
        const result = await refreshSession();
        if (!result.error) {
          setIsExpiring(false);
          if (onSessionRefreshed) onSessionRefreshed();
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    }
  }, [user, refreshSession, onSessionRefreshed]);

  // Set up session timers
  useEffect(() => {
    if (user && session) {
      clearTimers();
      
      const expiryTime = getSessionExpiry();
      if (!expiryTime) return;
      
      const now = Date.now();
      const timeToExpiry = expiryTime - now;
      
      if (timeToExpiry <= 0) {
        // Session already expired
        signOut();
        return;
      }
      
      // Set warning timer
      if (timeToExpiry > warningTime) {
        const newWarningTimer = setTimeout(() => {
          setIsExpiring(true);
          if (onSessionExpiring) onSessionExpiring();
        }, timeToExpiry - warningTime);
        
        setWarningTimer(newWarningTimer);
      } else {
        // Already in warning period
        setIsExpiring(true);
        if (onSessionExpiring) onSessionExpiring();
      }
      
      // Set auto-refresh timer
      if (timeToExpiry > autoRefreshTime) {
        const newRefreshTimer = setTimeout(() => {
          handleRefreshSession();
        }, timeToExpiry - autoRefreshTime);
        
        setRefreshTimer(newRefreshTimer);
      } else {
        // Need to refresh now
        handleRefreshSession();
      }
      
      // Update time remaining
      setTimeRemaining(Math.max(0, timeToExpiry));
      
      // Set up interval to update time remaining
      const interval = setInterval(() => {
        const newExpiryTime = getSessionExpiry();
        if (!newExpiryTime) {
          clearInterval(interval);
          return;
        }
        
        const newTimeToExpiry = newExpiryTime - Date.now();
        setTimeRemaining(Math.max(0, newTimeToExpiry));
        
        if (newTimeToExpiry <= 0) {
          clearInterval(interval);
          signOut();
        }
      }, 1000);
      
      return () => {
        clearTimers();
        clearInterval(interval);
      };
    } else {
      clearTimers();
      setIsExpiring(false);
      setTimeRemaining(null);
    }
  }, [
    user, 
    session, 
    getSessionExpiry, 
    warningTime, 
    autoRefreshTime, 
    handleRefreshSession, 
    clearTimers, 
    signOut, 
    onSessionExpiring
  ]);

  return {
    isExpiring,
    timeRemaining,
    refreshSession: handleRefreshSession,
    formatTimeRemaining: () => {
      if (!timeRemaining) return '';
      
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
};

export default useSessionManager;
