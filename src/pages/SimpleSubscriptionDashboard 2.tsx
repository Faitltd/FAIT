import React from 'react';

const SimpleSubscriptionDashboard: React.FC = () => {
  const userType = localStorage.getItem('userType') || 'client';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Subscription Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User: {userEmail}</h2>
        <h3 className="text-lg font-medium mb-4">User Type: {userType}</h3>
        <p className="mb-4">This is a simplified version of the subscription dashboard for testing purposes.</p>
        
        <div className="flex space-x-4">
          <a
            href="/debug"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Debug Page
          </a>
          <a
            href="/test-login"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Features</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Basic Profile</span>
            </div>
            {userType === 'service_agent' && (
              <>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Service Listings</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Booking Management</span>
                </div>
              </>
            )}
            {userType === 'client' && (
              <>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Service Search</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Booking Services</span>
                </div>
              </>
            )}
            {userType === 'admin' && (
              <>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>User Management</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>System Configuration</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${userType === 'admin' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            <span className="font-medium">Active</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">
                {userType === 'service_agent' ? 'Pro Contractor' : 
                 userType === 'admin' ? 'Admin' : 'Basic Client'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">
                {userType === 'service_agent' ? '$75/month' : 
                 userType === 'admin' ? 'N/A' : 'Free'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Renewal Date:</span>
              <span className="font-medium">
                {userType === 'service_agent' ? 'Dec 31, 2024' : 
                 userType === 'admin' ? 'N/A' : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <a 
          href="/dashboard/client" 
          className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2">Client Dashboard</h3>
          <p className="text-gray-600">View the client dashboard</p>
        </a>
        
        <a 
          href="/dashboard/service-agent" 
          className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2">Service Agent Dashboard</h3>
          <p className="text-gray-600">View the service agent dashboard</p>
        </a>
        
        <a 
          href="/" 
          className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium mb-2">Home</h3>
          <p className="text-gray-600">Return to the home page</p>
        </a>
      </div>
    </div>
  );
};

export default SimpleSubscriptionDashboard;
