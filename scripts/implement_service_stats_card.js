import fs from 'fs';
import path from 'path';

// Path to the component file
const componentPath = 'src/components/admin/ServiceStatsCard.jsx';

// Implementation for the ServiceStatsCard component
const serviceStatsCardImplementation = `import React from 'react';

// Card component showing service statistics

const ServiceStatsCard = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Service Statistics
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Overview of services and performance metrics
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Total Services</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.total_services}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Active Services</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.active_services}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
            <dd className="mt-1 text-sm text-gray-900 flex items-center">
              {stats.average_service_rating.toFixed(1)}
              <div className="ml-2 flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={\`h-4 w-4 \${star <= Math.round(stats.average_service_rating) ? 'text-yellow-400' : 'text-gray-300'}\`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </dd>
          </div>
          
          {stats.services_by_category && stats.services_by_category.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-2">Services by Category</dt>
              <dd className="mt-1">
                <div className="space-y-2">
                  {stats.services_by_category.map((category, index) => {
                    const maxCount = Math.max(...stats.services_by_category.map(c => c.count));
                    const width = (category.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-32 text-sm text-gray-600 truncate">
                          {category.category}
                        </div>
                        <div className="flex-1 ml-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: \`\${width}%\` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-2 text-sm text-gray-600 w-10 text-right">
                          {category.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </dd>
            </div>
          )}
          
          {stats.top_booked_services && stats.top_booked_services.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-2">Top Booked Services</dt>
              <dd className="mt-1">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bookings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.top_booked_services.map((service, index) => (
                        <tr key={index}>
                          <td className="py-2 pl-4 pr-3 text-xs text-gray-900 truncate max-w-xs">
                            {service.name}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 text-right">
                            {service.booking_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ServiceStatsCard;`;

// Write the implementation to the file
fs.writeFileSync(componentPath, serviceStatsCardImplementation);
console.log(`Implemented ServiceStatsCard component at ${componentPath}`);
