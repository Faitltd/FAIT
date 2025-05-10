import React, { useState, useEffect } from 'react';
import { toggleAuthMode, isUsingLocalAuth } from '../lib/supabase';

const AuthModeSelector: React.FC = () => {
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    // Check current auth mode
    setIsLocal(isUsingLocalAuth());
  }, []);

  const handleToggle = () => {
    // Toggle auth mode
    const newMode = toggleAuthMode();
    setIsLocal(newMode);

    // Reload the page to apply changes
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-md text-white text-sm font-bold ${
          isLocal ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {isLocal ? 'Using Local Auth' : 'Using Supabase Auth'}
      </button>
    </div>
  );
};

export default AuthModeSelector;
