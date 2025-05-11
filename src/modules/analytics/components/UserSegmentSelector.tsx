import React from 'react';
import { UserSegment } from '../../../types/analytics.types';

interface UserSegmentSelectorProps {
  selectedSegment: UserSegment;
  onSegmentChange: (segment: UserSegment) => void;
  className?: string;
}

/**
 * Component to select a user segment for analytics
 */
const UserSegmentSelector: React.FC<UserSegmentSelectorProps> = ({ 
  selectedSegment,
  onSegmentChange,
  className = ''
}) => {
  const segments: { id: UserSegment; name: string; description: string }[] = [
    { id: 'all', name: 'All Users', description: 'All registered users' },
    { id: 'clients', name: 'Clients', description: 'Users registered as clients' },
    { id: 'service_agents', name: 'Service Agents', description: 'Users registered as service agents' },
    { id: 'verified', name: 'Verified Users', description: 'Users who have completed verification' },
    { id: 'unverified', name: 'Unverified Users', description: 'Users who have not completed verification' },
    { id: 'active', name: 'Active Users', description: 'Users who have been active in the last 30 days' },
    { id: 'inactive', name: 'Inactive Users', description: 'Users who have not been active in the last 30 days' },
    { id: 'new', name: 'New Users', description: 'Users who registered in the last 30 days' },
    { id: 'returning', name: 'Returning Users', description: 'Users who have logged in more than once' }
  ];

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Segment</h3>
            <p className="mt-1 text-sm text-gray-500">
              Filter analytics data by user segment
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {segments.map((segment) => (
              <button
                key={segment.id}
                type="button"
                className={`inline-flex items-center px-4 py-2 border ${
                  selectedSegment === segment.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700'
                } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                onClick={() => onSegmentChange(segment.id)}
              >
                <span className="truncate">{segment.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSegmentSelector;
