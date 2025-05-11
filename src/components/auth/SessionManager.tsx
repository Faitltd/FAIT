import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SessionManagerProps {
  // Time in milliseconds before session expiry to show warning
  warningTime?: number;
  // Time in milliseconds to auto-refresh before expiry
  autoRefreshTime?: number;
  // Children to render
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  warningTime = 5 * 60 * 1000, // 5 minutes by default
  autoRefreshTime = 10 * 60 * 1000, // 10 minutes by default
  children
}) => {
  const { user, session, refreshSession, signOut, getSessionExpiry } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate time remaining in session
  const calculateTimeRemaining = useCallback(() => {
    const expiryTime = getSessionExpiry();
    if (!expiryTime) return null;
    
    const remaining = expiryTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [getSessionExpiry]);

  // Handle session refresh
  const handleRefresh = async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshSession();
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle session logout
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Check session status periodically
  useEffect(() => {
    if (!user || !session) return;

    const checkSession = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining !== null) {
        // Show warning if session is about to expire
        if (remaining <= warningTime && remaining > 0) {
          setShowWarning(true);
        }
        
        // Auto-refresh if within refresh window
        if (remaining <= autoRefreshTime && remaining > 0 && !isRefreshing) {
          handleRefresh();
        }
        
        // Force logout if session has expired
        if (remaining <= 0) {
          handleLogout();
        }
      }
    };
    
    // Check immediately
    checkSession();
    
    // Set up interval to check session status
    const intervalId = setInterval(checkSession, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user, session, warningTime, autoRefreshTime, calculateTimeRemaining, isRefreshing]);

  // Format time remaining for display
  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Expired';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <>
      {children}
      
      {/* Session expiry warning modal */}
      {showWarning && timeRemaining !== null && timeRemaining > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Session Expiring Soon</h3>
            <p className="text-gray-600 mb-4">
              Your session will expire in {formatTimeRemaining(timeRemaining)}. Would you like to stay logged in?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleLogout}
              >
                Log Out
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Stay Logged In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionManager;
