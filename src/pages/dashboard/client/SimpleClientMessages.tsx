import React from 'react';
import { Link } from 'react-router-dom';

const SimpleClientMessages = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/client" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Client Messages</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
        <p className="text-gray-600">
          This is a simplified version of the Client Messages page.
          The full messaging functionality is currently under maintenance.
        </p>
        <div className="mt-4">
          <Link 
            to="/dashboard/client" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimpleClientMessages;
