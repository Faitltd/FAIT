import React, { useState, useEffect } from 'react';
import { toggleAuthMode, isUsingLocalAuth } from '../lib/supabase';

const AuthModeSelector: React.FC = () => {
  const [useLocalAuth, setUseLocalAuth] = useState(false);
  
  // Initialize state from current setting
  useEffect(() => {
    setUseLocalAuth(isUsingLocalAuth());
  }, []);
  
  // Handle toggle
  const handleToggle = () => {
    const newMode = !useLocalAuth;
    toggleAuthMode(newMode);
    setUseLocalAuth(newMode);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 mr-3">
            {useLocalAuth ? 'Using Local Auth' : 'Using Supabase Auth'}
          </span>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              useLocalAuth ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useLocalAuth ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {useLocalAuth 
            ? 'Using browser storage for authentication (no database required)' 
            : 'Using Supabase for authentication (requires database connection)'}
        </div>
      </div>
    </div>
  );
};

export default AuthModeSelector;
