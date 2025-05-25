import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

interface DevelopmentModeToggleProps {
  className?: string;
}

/**
 * A component that allows toggling development mode
 * This is useful for testing and debugging
 */
const DevelopmentModeToggle: React.FC<DevelopmentModeToggleProps> = ({ className = '' }) => {
  const { isDevelopmentMode, toggleDevelopmentMode, isLocalAuth, toggleAuthMode } = useAuth();

  return (
    <div className={`rounded-md bg-amber-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Development Options</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              These options are for development and testing purposes only.
            </p>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isDevelopmentMode ? 'bg-amber-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isDevelopmentMode}
                onClick={toggleDevelopmentMode}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDevelopmentMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm">
                <span className="font-medium text-amber-900">Development Mode</span>
                {' '}
                <span className="text-amber-700">
                  {isDevelopmentMode ? 'Enabled' : 'Disabled'}
                </span>
              </span>
            </div>
            
            <div className="flex items-center mt-3">
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isLocalAuth ? 'bg-amber-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isLocalAuth}
                onClick={toggleAuthMode}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isLocalAuth ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm">
                <span className="font-medium text-amber-900">Local Authentication</span>
                {' '}
                <span className="text-amber-700">
                  {isLocalAuth ? 'Enabled' : 'Disabled'}
                </span>
              </span>
            </div>
          </div>
          
          {isDevelopmentMode && (
            <div className="mt-4 text-xs text-amber-700">
              <p className="font-semibold">Test Credentials:</p>
              <ul className="mt-1 list-disc list-inside">
                <li><strong>Admin:</strong> admin@itsfait.com / admin123</li>
                <li><strong>Client:</strong> client@itsfait.com / client123</li>
                <li><strong>Service Agent:</strong> service@itsfait.com / service123</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevelopmentModeToggle;
