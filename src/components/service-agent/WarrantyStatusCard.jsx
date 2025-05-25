import React from 'react';
import { Link } from 'react-router-dom';

// Card component showing warranty status

const WarrantyStatusCard = ({ warranties }) => {
  if (!warranties) {
    return null;
  }

  const { total_warranties, active_warranties, expired_warranties } = warranties;

  // Calculate percentages for the chart
  const activePercentage = total_warranties > 0 ? (active_warranties / total_warranties) * 100 : 0;
  const expiredPercentage = total_warranties > 0 ? (expired_warranties / total_warranties) * 100 : 0;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Warranty Status
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Overview of your service warranties
          </p>
        </div>
        <Link
          to="/warranty"
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View All
        </Link>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {total_warranties === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No warranties</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any service warranties yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{total_warranties}</div>
                <div className="text-sm text-gray-500">Total Warranties</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{active_warranties}</div>
                <div className="text-sm text-green-600">Active</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{expired_warranties}</div>
                <div className="text-sm text-red-600">Expired</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Warranty Status Distribution</h4>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${activePercentage}%`, float: 'left' }}
                ></div>
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${expiredPercentage}%`, float: 'left' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <div>Active: {activePercentage.toFixed(1)}%</div>
                <div>Expired: {expiredPercentage.toFixed(1)}%</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Warranty Claims</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-yellow-600">{warranties.pending_claims || 0}</div>
                  <div className="text-xs text-yellow-600">Pending Claims</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-600">{warranties.resolved_claims || 0}</div>
                  <div className="text-xs text-blue-600">Resolved Claims</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Link
                to="/warranty/claims"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Warranty Claims
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyStatusCard;