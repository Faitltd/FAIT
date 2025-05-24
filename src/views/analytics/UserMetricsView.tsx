import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../modules/analytics/hooks/useAnalytics';
import { useAuth } from '../../contexts/AuthContext';
import MetricCard from '../../modules/analytics/components/MetricCard';
import ChartCard from '../../modules/analytics/components/ChartCard';

/**
 * View for user metrics
 */
const UserMetricsView: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, error, userMetrics, userActivity, fetchUserMetrics, fetchUserActivity } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch user metrics on mount or when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      fetchUserMetrics(selectedUserId);
      fetchUserActivity(selectedUserId);
    } else if (user) {
      // Default to current user
      setSelectedUserId(user.id);
    }
  }, [selectedUserId]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // In a real app, this would call an API to search for users
    // For now, we'll just simulate it with a timeout
    setIsLoading(true);
    setTimeout(() => {
      setSearchResults([
        {
          id: '1',
          full_name: 'John Doe',
          user_type: 'client',
          email: 'john.doe@example.com'
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          user_type: 'service_agent',
          email: 'jane.smith@example.com'
        },
        {
          id: '3',
          full_name: 'Bob Johnson',
          user_type: 'client',
          email: 'bob.johnson@example.com'
        }
      ].filter(u => 
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      setIsLoading(false);
    }, 500);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  // Get user type badge
  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case 'client':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Client
          </span>
        );
      case 'service_agent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Service Agent
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {userType}
          </span>
        );
    }
  };

  // Convert user metrics to metric cards
  const getUserMetricCards = () => {
    if (!userMetrics) return [];

    return [
      {
        id: 'total_logins',
        name: 'Total Logins',
        description: 'Number of times the user has logged in',
        type: 'count',
        value: { value: userMetrics.total_logins },
        icon: 'activity'
      },
      {
        id: 'total_sessions',
        name: 'Total Sessions',
        description: 'Number of sessions the user has had',
        type: 'count',
        value: { value: userMetrics.total_sessions },
        icon: 'activity'
      },
      {
        id: 'average_session_duration',
        name: 'Avg. Session Duration',
        description: 'Average length of user sessions in minutes',
        type: 'average',
        value: { value: userMetrics.average_session_duration },
        unit: 'min',
        icon: 'activity'
      },
      {
        id: 'total_actions',
        name: 'Total Actions',
        description: 'Number of actions performed by the user',
        type: 'count',
        value: { value: userMetrics.total_actions },
        icon: 'activity'
      },
      {
        id: 'engagement_score',
        name: 'Engagement Score',
        description: 'Overall engagement score out of 100',
        type: 'count',
        value: { value: userMetrics.engagement_score },
        icon: 'activity'
      }
    ];
  };

  // Sample chart data (in a real app, this would come from the API)
  const sampleUserCharts = [
    {
      id: 'user_activity_over_time',
      title: 'User Activity Over Time',
      description: 'Number of actions performed by the user over time',
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Actions',
            data: [25, 30, 35, 40, 45, 50],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2
          }
        ]
      }
    },
    {
      id: 'user_actions_by_type',
      title: 'Actions by Type',
      description: 'Distribution of user actions by type',
      type: 'pie',
      data: {
        labels: ['Page Views', 'Clicks', 'Form Submissions', 'Downloads', 'Shares'],
        datasets: [
          {
            data: [45, 25, 15, 10, 5],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 1
          }
        ]
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">User Metrics</h1>
              <div className="flex space-x-4">
                <Link
                  to="/analytics"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* User search */}
            <div className="bg-white shadow rounded-lg my-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Search Users</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Search for a user to view their metrics
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex rounded-md shadow-sm">
                    <div className="relative flex-grow focus-within:z-10">
                      <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      <span>Search</span>
                    </button>
                  </div>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500">Search Results</h4>
                    <ul className="mt-2 divide-y divide-gray-200">
                      {searchResults.map((result) => (
                        <li key={result.id} className="py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedUserId(result.id)}
                            className="w-full text-left hover:bg-gray-50 p-2 rounded-md"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{result.full_name}</p>
                                <p className="text-sm text-gray-500">{result.email}</p>
                              </div>
                              <div>
                                {getUserTypeBadge(result.user_type)}
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading user metrics</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {userMetrics ? (
                  <div className="space-y-8">
                    {/* User info */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            {userMetrics.avatar_url ? (
                              <img
                                className="h-12 w-12 rounded-full"
                                src={userMetrics.avatar_url}
                                alt={userMetrics.full_name}
                              />
                            ) : (
                              <span className="text-lg font-medium text-gray-500">
                                {userMetrics.full_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <h2 className="text-xl font-bold text-gray-900">{userMetrics.full_name}</h2>
                            <div className="flex items-center mt-1">
                              {getUserTypeBadge(userMetrics.user_type)}
                              <span className="ml-2 text-sm text-gray-500">
                                Joined {formatDate(userMetrics.signup_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">User Metrics</h2>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {getUserMetricCards().map((metric) => (
                          <MetricCard key={metric.id} metric={metric} />
                        ))}
                      </div>
                    </div>

                    {/* Charts */}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">User Activity Charts</h2>
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {sampleUserCharts.map((chart) => (
                          <ChartCard key={chart.id} chart={chart} />
                        ))}
                      </div>
                    </div>

                    {/* Activity log */}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Log</h2>
                      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          {userActivity.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                              {userActivity.map((activity, index) => (
                                <li key={index} className="py-4">
                                  <div className="flex space-x-3">
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium">{activity.action}</h3>
                                        <p className="text-sm text-gray-500">{formatDate(activity.created_at)} at {formatTime(activity.created_at)}</p>
                                      </div>
                                      {activity.resource_type && (
                                        <p className="text-sm text-gray-500">
                                          {activity.resource_type}{activity.resource_id ? ` (${activity.resource_id})` : ''}
                                        </p>
                                      )}
                                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                        <div className="mt-2 text-sm text-gray-700">
                                          <details>
                                            <summary className="text-blue-600 cursor-pointer">Additional details</summary>
                                            <pre className="mt-2 text-xs overflow-auto bg-gray-50 p-2 rounded">
                                              {JSON.stringify(activity.metadata, null, 2)}
                                            </pre>
                                          </details>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-500">No activity recorded for this user.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No user selected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Search for a user to view their metrics.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserMetricsView;
