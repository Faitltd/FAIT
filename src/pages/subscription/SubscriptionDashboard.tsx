import React from 'react';

const SubscriptionDashboard: React.FC = () => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Subscription Dashboard
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage your subscription
        </p>
      </div>
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">No active subscription</h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have an active subscription yet. Subscribe to unlock premium features.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
