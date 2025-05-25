import React from 'react';

const StaticHome: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to FAIT Co-Op</h1>
        <p className="text-gray-600 mb-8">Please select an option below to continue:</p>
        
        <div className="space-y-4">
          <a 
            href="/test-login" 
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Test Login
          </a>
          
          <a 
            href="/dashboard/client" 
            className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Client Dashboard
          </a>
          
          <a 
            href="/dashboard/service-agent" 
            className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Service Agent Dashboard
          </a>
          
          <a 
            href="/debug" 
            className="block w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Debug Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaticHome;
