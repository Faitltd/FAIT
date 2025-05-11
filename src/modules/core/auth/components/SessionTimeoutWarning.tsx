/**
 * SessionTimeoutWarning Component
 * 
 * This component displays a warning when the user's session is about to expire.
 */

import React, { useState, useEffect } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';

export interface SessionTimeoutWarningProps {
  warningTime?: number; // Time in ms before expiry to show warning
  autoRefreshTime?: number; // Time in ms before expiry to auto-refresh
  onSignOut?: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  warningTime = 5 * 60 * 1000, // 5 minutes before expiry
  autoRefreshTime = 10 * 60 * 1000, // 10 minutes before expiry
  onSignOut
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const { 
    isExpiring, 
    timeRemaining, 
    refreshSession, 
    formatTimeRemaining 
  } = useSessionManager({
    warningTime,
    autoRefreshTime,
    onSessionExpiring: () => setIsVisible(true),
    onSessionRefreshed: () => setIsVisible(false)
  });

  // Hide the warning if not expiring
  useEffect(() => {
    if (!isExpiring) {
      setIsVisible(false);
    }
  }, [isExpiring]);

  if (!isVisible || !isExpiring || !timeRemaining) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50 border border-yellow-300">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">Session Timeout Warning</h3>
          <div className="mt-1 text-sm text-gray-500">
            <p>Your session will expire in {formatTimeRemaining()}.</p>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={refreshSession}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Stay Logged In
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setIsVisible(false)}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
