import fs from 'fs';
import path from 'path';

// Path to the component file
const componentPath = 'src/components/admin/RevenueStatsCard.jsx';

// Implementation for the RevenueStatsCard component
const revenueStatsCardImplementation = `import React from 'react';

// Card component showing revenue statistics

const RevenueStatsCard = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Revenue Statistics
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Overview of platform revenue and financial metrics
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Total Revenue</dt>
            <dd className="mt-1 text-sm text-gray-900">\${stats.total_revenue.toFixed(2)}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Revenue (30 days)</dt>
            <dd className="mt-1 text-sm text-gray-900">\${stats.revenue_last_30_days.toFixed(2)}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Average Booking Value</dt>
            <dd className="mt-1 text-sm text-gray-900">\${stats.average_booking_value.toFixed(2)}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Subscription Revenue</dt>
            <dd className="mt-1 text-sm text-gray-900">\${stats.subscription_revenue.toFixed(2)}</dd>
          </div>
          
          {stats.revenue_by_month && stats.revenue_by_month.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-2">Monthly Revenue</dt>
              <dd className="mt-1">
                <div className="h-64 bg-gray-50 p-4 rounded-md">
                  <div className="h-full flex items-end space-x-2">
                    {stats.revenue_by_month.map((month, index) => {
                      const maxRevenue = Math.max(...stats.revenue_by_month.map(m => m.revenue));
                      const height = (month.revenue / maxRevenue) * 100;
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-500 rounded-t-sm" 
                            style={{ height: \`\${height}%\` }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                            {month.month}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default RevenueStatsCard;`;

// Write the implementation to the file
fs.writeFileSync(componentPath, revenueStatsCardImplementation);
console.log(`Implemented RevenueStatsCard component at ${componentPath}`);
