import React from 'react';

const StaticServiceAgentDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Service Agent Dashboard
        </h1>
        <p className="text-gray-600">Manage your services and service agent profile</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/test-login" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                <p className="text-sm text-gray-500">View and respond to client messages</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/test-login" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Jobs</h3>
                <p className="text-sm text-gray-500">Manage your upcoming and completed jobs</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/test-login" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Services</h3>
                <p className="text-sm text-gray-500">Manage your service listings</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/test-login" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Update your profile and preferences</p>
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* Subscription Dashboard Link */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
        <p className="mb-4">Manage your subscription plan and billing information.</p>
        <a href="/subscription/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          View Subscription Dashboard
        </a>
      </div>

      {/* Debug Link */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
        <p className="mb-4">If you need assistance with your service agent account, please contact our support team.</p>
        <a href="/debug" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
          View Debug Page
        </a>
      </div>

      {/* Test Login Link */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Login</h2>
        <p className="mb-4">Return to the test login page to switch user types.</p>
        <a href="/test-login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700">
          Back to Test Login
        </a>
      </div>
    </div>
  );
};

export default StaticServiceAgentDashboard;
