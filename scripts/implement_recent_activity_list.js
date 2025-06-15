import fs from 'fs';
import path from 'path';

// Path to the component file
const componentPath = 'src/components/admin/RecentActivityList.jsx';

// Implementation for the RecentActivityList component
const recentActivityListImplementation = `import React from 'react';
import { format, formatDistance } from 'date-fns';

// List component showing recent activity

const RecentActivityList = ({ activity }) => {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            No recent activity to display
          </p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'UPDATE':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'DELETE':
        return (
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityDescription = (item) => {
    const adminName = item.admin ? \`\${item.admin.first_name} \${item.admin.last_name}\` : 'An admin';
    
    switch (item.action_type) {
      case 'CREATE':
        return \`\${adminName} created a new \${item.table_name.slice(0, -1)}\`;
      case 'UPDATE':
        return \`\${adminName} updated a \${item.table_name.slice(0, -1)}\`;
      case 'DELETE':
        return \`\${adminName} deleted a \${item.table_name.slice(0, -1)}\`;
      default:
        return \`\${adminName} performed an action on \${item.table_name}\`;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Recent Activity
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Latest actions performed by administrators
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {activity.map((item, index) => (
            <li key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center">
                {getActivityIcon(item.action_type)}
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityDescription(item)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.table_name} {item.record_id ? \`(ID: \${item.record_id.substring(0, 8)}...)\` : ''}
                  </p>
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  {formatDistance(new Date(item.created_at), new Date(), { addSuffix: true })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentActivityList;`;

// Write the implementation to the file
fs.writeFileSync(componentPath, recentActivityListImplementation);
console.log(`Implemented RecentActivityList component at ${componentPath}`);
