import React from 'react';

const ForumPage = () => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Community Forum
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Connect with other members of the community
        </p>
      </div>
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">Coming Soon!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Our community forum is currently under development. Check back soon!
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get Notified When Live
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
