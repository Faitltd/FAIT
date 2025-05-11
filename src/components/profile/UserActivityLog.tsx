import React, { useState, useEffect } from 'react';
import { Clock, Filter, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ActivityLogger, { ActivityType } from '../../utils/ActivityLogger';
import LoadingSpinner from '../LoadingSpinner';

interface UserActivityLogProps {
  userId?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

/**
 * Component to display user activity log
 */
const UserActivityLog: React.FC<UserActivityLogProps> = ({
  userId,
  limit = 10,
  showFilters = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType[]>([]);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Activity type groups for filtering
  const activityGroups = [
    {
      name: 'Authentication',
      types: [
        ActivityType.LOGIN,
        ActivityType.LOGOUT,
        ActivityType.PASSWORD_RESET,
        ActivityType.PROFILE_UPDATE
      ]
    },
    {
      name: 'Services',
      types: [
        ActivityType.SERVICE_CREATED,
        ActivityType.SERVICE_UPDATED,
        ActivityType.SERVICE_DELETED,
        ActivityType.AVAILABILITY_UPDATED
      ]
    },
    {
      name: 'Bookings',
      types: [
        ActivityType.BOOKING_CREATED,
        ActivityType.BOOKING_UPDATED,
        ActivityType.BOOKING_CANCELLED,
        ActivityType.REVIEW_SUBMITTED
      ]
    },
    {
      name: 'Payments',
      types: [
        ActivityType.PAYMENT_PROCESSED,
        ActivityType.REFUND_PROCESSED,
        ActivityType.SUBSCRIPTION_CREATED,
        ActivityType.SUBSCRIPTION_UPDATED,
        ActivityType.SUBSCRIPTION_CANCELLED
      ]
    },
    {
      name: 'Account',
      types: [
        ActivityType.ACCOUNT_DEACTIVATED,
        ActivityType.ACCOUNT_REACTIVATED
      ]
    }
  ];
  
  // Fetch activities
  useEffect(() => {
    fetchActivities();
  }, [userId, page, activityTypeFilter]);
  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }
      
      // Fetch activities
      const activities = await ActivityLogger.getUserActivities(
        targetUserId,
        limit,
        page * limit,
        activityTypeFilter.length > 0 ? activityTypeFilter : undefined
      );
      
      setActivities(activities);
      
      // Estimate total pages (this is a simplification, in a real app you'd get the count from the server)
      setTotalPages(Math.max(1, Math.ceil(activities.length / limit)));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle activity type filter toggle
  const toggleActivityTypeFilter = (type: ActivityType) => {
    setActivityTypeFilter(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  // Handle activity group filter toggle
  const toggleActivityGroupFilter = (types: ActivityType[]) => {
    setActivityTypeFilter(prev => {
      // Check if all types in the group are already selected
      const allSelected = types.every(type => prev.includes(type));
      
      if (allSelected) {
        // Remove all types in the group
        return prev.filter(type => !types.includes(type));
      } else {
        // Add all types in the group that aren't already selected
        const newTypes = types.filter(type => !prev.includes(type));
        return [...prev, ...newTypes];
      }
    });
  };
  
  // Format activity for display
  const formatActivity = (activity: any) => {
    const { activity_type, activity_data, created_at } = activity;
    
    // Format date
    const date = new Date(created_at);
    const formattedDate = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Format activity type for display
    const formatActivityType = (type: string) => {
      return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    // Get activity description
    let description = '';
    switch (activity_type) {
      case ActivityType.LOGIN:
        description = 'Logged in';
        break;
      case ActivityType.LOGOUT:
        description = 'Logged out';
        break;
      case ActivityType.PASSWORD_RESET:
        description = 'Reset password';
        break;
      case ActivityType.PROFILE_UPDATE:
        description = 'Updated profile information';
        break;
      case ActivityType.SERVICE_CREATED:
        description = `Created service: ${activity_data.service_title || 'Unknown service'}`;
        break;
      case ActivityType.SERVICE_UPDATED:
        description = `Updated service: ${activity_data.service_title || 'Unknown service'}`;
        break;
      case ActivityType.SERVICE_DELETED:
        description = `Deleted service: ${activity_data.service_title || 'Unknown service'}`;
        break;
      case ActivityType.AVAILABILITY_UPDATED:
        description = 'Updated availability';
        break;
      case ActivityType.BOOKING_CREATED:
        description = `Created booking #${activity_data.booking_id || 'Unknown'}`;
        break;
      case ActivityType.BOOKING_UPDATED:
        description = `Updated booking #${activity_data.booking_id || 'Unknown'}`;
        break;
      case ActivityType.BOOKING_CANCELLED:
        description = `Cancelled booking #${activity_data.booking_id || 'Unknown'}`;
        break;
      case ActivityType.REVIEW_SUBMITTED:
        description = `Submitted a ${activity_data.rating || ''} star review`;
        break;
      case ActivityType.PAYMENT_PROCESSED:
        description = `Processed payment of ${activity_data.amount ? `$${activity_data.amount}` : 'unknown amount'}`;
        break;
      case ActivityType.REFUND_PROCESSED:
        description = `Processed refund of ${activity_data.amount ? `$${activity_data.amount}` : 'unknown amount'}`;
        break;
      case ActivityType.SUBSCRIPTION_CREATED:
        description = `Created ${activity_data.plan || ''} subscription`;
        break;
      case ActivityType.SUBSCRIPTION_UPDATED:
        description = `Updated subscription to ${activity_data.plan || ''}`;
        break;
      case ActivityType.SUBSCRIPTION_CANCELLED:
        description = 'Cancelled subscription';
        break;
      case ActivityType.ACCOUNT_DEACTIVATED:
        description = 'Deactivated account';
        break;
      case ActivityType.ACCOUNT_REACTIVATED:
        description = 'Reactivated account';
        break;
      case ActivityType.ERROR:
        description = `Error: ${activity_data.error_message || 'Unknown error'}`;
        break;
      default:
        description = formatActivityType(activity_type);
    }
    
    return {
      formattedDate,
      formattedTime,
      description,
      activityType: formatActivityType(activity_type),
      data: activity_data
    };
  };
  
  // Filter activities by search query
  const filteredActivities = activities.filter(activity => {
    if (!searchQuery.trim()) return true;
    
    const { activity_type, activity_data } = activity;
    const query = searchQuery.toLowerCase();
    
    // Check activity type
    if (activity_type.toLowerCase().includes(query)) return true;
    
    // Check activity data
    if (activity_data) {
      const dataString = JSON.stringify(activity_data).toLowerCase();
      if (dataString.includes(query)) return true;
    }
    
    // Check formatted description
    const { description } = formatActivity(activity);
    if (description.toLowerCase().includes(query)) return true;
    
    return false;
  });
  
  return (
    <div className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Activity Log</h2>
        
        {showFilters && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`ml-1 h-4 w-4 transform ${showFilterOptions ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={fetchActivities}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
      
      {showFilters && showFilterOptions && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div>
              <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Activity Type</h3>
              <div className="space-y-2">
                {activityGroups.map((group) => (
                  <div key={group.name} className="border border-gray-200 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleActivityGroupFilter(group.types)}
                      className="w-full px-4 py-2 text-left text-sm font-medium bg-gray-100 hover:bg-gray-200 focus:outline-none"
                    >
                      {group.name}
                    </button>
                    <div className="p-2 bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        {group.types.map((type) => (
                          <div key={type} className="flex items-center">
                            <input
                              id={`filter-${type}`}
                              type="checkbox"
                              checked={activityTypeFilter.includes(type)}
                              onChange={() => toggleActivityTypeFilter(type)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`filter-${type}`} className="ml-2 text-sm text-gray-700">
                              {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {activityTypeFilter.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActivityTypeFilter([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="px-6 py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-500">
            {searchQuery || activityTypeFilter.length > 0
              ? 'No activities match your search or filter criteria.'
              : 'No activities have been recorded yet.'}
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => {
              const { formattedDate, formattedTime, description, activityType } = formatActivity(activity);
              
              return (
                <li key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activityType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{formattedDate}</p>
                      <p className="text-xs text-gray-500">{formattedTime}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {page + 1} of {totalPages}
              </span>
              
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivityLog;
