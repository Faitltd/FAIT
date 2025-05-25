import React from 'react';
import { Link } from 'react-router-dom';

// Card component showing active warranties

const ActiveWarrantiesCard = ({ warranties }) => {
  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Active Warranties
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your current service warranties
          </p>
        </div>
        <Link
          to="/warranty"
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View All
        </Link>
      </div>
      <div className="border-t border-gray-200">
        {!warranties || warranties.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active warranties</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any active service warranties.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {warranties.map((warranty) => {
              const daysRemaining = calculateDaysRemaining(warranty.end_date);
              const isExpiringSoon = daysRemaining <= 30;
              
              return (
                <li key={warranty.id}>
                  <Link to={'/warranty'} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {warranty.service_name}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {warranty.warranty_type}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {warranty.service_agent_name}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm sm:mt-0">
                          <p className={`${isExpiringSoon ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            {daysRemaining > 0 
                              ? `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}` 
                              : 'Expired'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              daysRemaining <= 7 ? 'bg-red-600' :
                              daysRemaining <= 30 ? 'bg-yellow-400' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, (daysRemaining / 365) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActiveWarrantiesCard;