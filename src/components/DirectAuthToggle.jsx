import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isDirectAuthEnabled, setDirectAuth } from '../lib/directAuth';
import { useAuth } from '../contexts/UnifiedAuthContext';

/**
 * DirectAuthToggle - A component to toggle between direct authentication and other methods
 * Now integrated with UnifiedAuthContext
 */
const DirectAuthToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const { isLocalAuth } = useAuth();

  // Check if direct auth is enabled on mount and when isLocalAuth changes
  useEffect(() => {
    const directAuthStatus = isDirectAuthEnabled();
    console.log('[DirectAuthToggle] Direct auth status:', directAuthStatus, 'Local auth:', isLocalAuth);
    setEnabled(directAuthStatus);
  }, [isLocalAuth]);

  const handleToggle = () => {
    console.log('[DirectAuthToggle] Toggling direct auth from', enabled, 'to', !enabled);
    setDirectAuth(!enabled);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 mr-3">
          Direct Auth Mode
        </span>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            enabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
          aria-label={enabled ? 'Disable direct authentication' : 'Enable direct authentication'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {enabled ? (
          <p>Using direct authentication bypass</p>
        ) : (
          <p>Using normal authentication</p>
        )}
      </div>
      <div className="mt-2">
        <Link
          to="/direct-login"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Go to Direct Login
        </Link>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>Auth Mode: {isLocalAuth ? 'Local' : 'Supabase'}</p>
      </div>
    </div>
  );
};

export default DirectAuthToggle;
