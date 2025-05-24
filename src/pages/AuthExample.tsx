/**
 * AuthExample Page
 * 
 * This page demonstrates the new authentication system.
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth, LoginForm, SessionTimeoutWarning } from '../modules/core/auth';

const AuthContent: React.FC = () => {
  const { 
    user, 
    userType, 
    userPermissions, 
    signOut, 
    isLocalAuth, 
    toggleAuthMode, 
    isDevelopmentMode, 
    toggleDevelopmentMode 
  } = useAuth();
  
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Example</h1>
      
      {user ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">User Type</p>
              <p className="font-medium capitalize">{userType || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">User ID</p>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Created At</p>
              <p className="font-medium">{new Date(user.created_at).toLocaleString()}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Permissions</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {userPermissions.map(permission => (
              <span 
                key={permission} 
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                {permission}
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
            
            <button
              onClick={() => setShowSessionWarning(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Show Session Warning
            </button>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Development Options</h3>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="localAuth"
                  checked={isLocalAuth}
                  onChange={() => toggleAuthMode()}
                  className="mr-2"
                />
                <label htmlFor="localAuth">
                  Use Local Authentication
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="devMode"
                  checked={isDevelopmentMode}
                  onChange={() => toggleDevelopmentMode()}
                  className="mr-2"
                />
                <label htmlFor="devMode">
                  Development Mode
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sign In</h2>
          <LoginForm />
        </div>
      )}
      
      {showSessionWarning && (
        <SessionTimeoutWarning 
          onSignOut={() => {
            signOut();
            setShowSessionWarning(false);
          }}
        />
      )}
    </div>
  );
};

const AuthExample: React.FC = () => {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
};

export default AuthExample;
