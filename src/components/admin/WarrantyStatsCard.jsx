import React from 'react';

// Card component showing warranty statistics

const WarrantyStatsCard = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Warranty Statistics
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Overview of warranties and claims
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Total Warranties</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.total_warranties}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Active Warranties</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.active_warranties}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Expired Warranties</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.expired_warranties}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Total Claims</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.total_claims}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Pending Claims</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.pending_claims}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Resolved Claims</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.resolved_claims}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Rejected Claims</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.rejected_claims}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Claim Resolution Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${stats.claim_resolution_rate}%` }}
                  ></div>
                </div>
                <span>{stats.claim_resolution_rate}%</span>
              </div>
            </dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 mb-2">Warranty Status Distribution</dt>
            <dd className="mt-1">
              <div className="flex h-16">
                <div 
                  className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(stats.active_warranties / stats.total_warranties) * 100}%` }}
                >
                  {Math.round((stats.active_warranties / stats.total_warranties) * 100)}%
                </div>
                <div 
                  className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(stats.expired_warranties / stats.total_warranties) * 100}%` }}
                >
                  {Math.round((stats.expired_warranties / stats.total_warranties) * 100)}%
                </div>
              </div>
              <div className="flex text-xs text-gray-500 mt-1 justify-between">
                <div>Active</div>
                <div>Expired</div>
              </div>
            </dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 mb-2">Claim Status Distribution</dt>
            <dd className="mt-1">
              <div className="flex h-16">
                <div 
                  className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(stats.pending_claims / stats.total_claims) * 100}%` }}
                >
                  {Math.round((stats.pending_claims / stats.total_claims) * 100)}%
                </div>
                <div 
                  className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(stats.resolved_claims / stats.total_claims) * 100}%` }}
                >
                  {Math.round((stats.resolved_claims / stats.total_claims) * 100)}%
                </div>
                <div 
                  className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(stats.rejected_claims / stats.total_claims) * 100}%` }}
                >
                  {Math.round((stats.rejected_claims / stats.total_claims) * 100)}%
                </div>
              </div>
              <div className="flex text-xs text-gray-500 mt-1 justify-between">
                <div>Pending</div>
                <div>Resolved</div>
                <div>Rejected</div>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default WarrantyStatsCard;