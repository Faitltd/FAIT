import React from 'react';
import { useAuth } from '../contexts/UnifiedAuthContext';

const AuthToggle: React.FC = () => {
  const { isLocalAuth, toggleAuthMode } = useAuth();

  const handleToggle = () => {
    toggleAuthMode();
  };

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 bg-gray-800 text-white px-3 py-2 rounded-md text-sm shadow-lg hover:bg-gray-700 transition-colors"
      >
        <span className={`inline-block w-3 h-3 rounded-full ${isLocalAuth ? 'bg-green-500' : 'bg-blue-500'}`}></span>
        <span>{isLocalAuth ? 'Using Local Auth' : 'Using Supabase Auth'}</span>
      </button>
    </div>
  );
};

export default AuthToggle;
