import React from 'react';

const ClientDashboardFixed: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Client Dashboard
        </h1>
        <p className="text-gray-600">Welcome to your dashboard. Use the links below to navigate:</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <a href="/dashboard/client/bookings" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Bookings</h3>
                <p className="text-sm text-gray-500">View and manage your service bookings</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/dashboard/client/messages" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                <p className="text-sm text-gray-500">Communicate with service agents</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/dashboard/client/warranty" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Warranty Claims</h3>
                <p className="text-sm text-gray-500">Submit and track warranty claims</p>
              </div>
            </div>
          </div>
        </a>
        
        <a href="/services" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Find Services</h3>
                <p className="text-sm text-gray-500">Browse available services</p>
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
        <p className="mb-4">If you need assistance with your client account, please contact our support team.</p>
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

export default ClientDashboardFixed;
