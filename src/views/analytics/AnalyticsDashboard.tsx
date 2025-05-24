import React, { useEffect } from 'react';
import { useAnalytics } from '../../modules/analytics/hooks/useAnalytics';
import TimeRangeSelector from '../../modules/analytics/components/TimeRangeSelector';
import UserSegmentSelector from '../../modules/analytics/components/UserSegmentSelector';
import MetricCard from '../../modules/analytics/components/MetricCard';
import ChartCard from '../../modules/analytics/components/ChartCard';
import { Link } from 'react-router-dom';

/**
 * Main analytics dashboard view
 */
const AnalyticsDashboard: React.FC = () => {
  const { 
    isLoading, 
    error, 
    timeRange, 
    userSegment, 
    growthMetrics,
    handleTimeRangeChange,
    handleUserSegmentChange,
    fetchGrowthMetrics
  } = useAnalytics();

  // Fetch growth metrics on mount
  useEffect(() => {
    fetchGrowthMetrics();
  }, []);

  // Convert growth metrics to metric cards
  const getMetricCards = () => {
    if (!growthMetrics) return [];

    return [
      {
        id: 'new_users',
        name: 'New Users',
        description: 'Number of new user registrations',
        type: 'count',
        value: growthMetrics.new_users,
        icon: 'users'
      },
      {
        id: 'active_users',
        name: 'Active Users',
        description: 'Number of users who have been active',
        type: 'count',
        value: growthMetrics.active_users,
        icon: 'activity'
      },
      {
        id: 'user_retention',
        name: 'User Retention',
        description: 'Percentage of users who return after their first visit',
        type: 'percentage',
        value: growthMetrics.user_retention,
        icon: 'retention'
      },
      {
        id: 'referrals',
        name: 'Referrals',
        description: 'Number of new users who joined via referrals',
        type: 'count',
        value: growthMetrics.referrals,
        icon: 'referrals'
      },
      {
        id: 'conversion_rate',
        name: 'Conversion Rate',
        description: 'Percentage of visitors who register',
        type: 'percentage',
        value: growthMetrics.conversion_rate,
        icon: 'conversion'
      },
      {
        id: 'verification_rate',
        name: 'Verification Rate',
        description: 'Percentage of service agents who complete verification',
        type: 'percentage',
        value: growthMetrics.verification_rate,
        icon: 'verification'
      },
      {
        id: 'forum_activity',
        name: 'Forum Activity',
        description: 'Number of posts and threads in the forum',
        type: 'count',
        value: growthMetrics.forum_activity,
        icon: 'forum'
      },
      {
        id: 'points_awarded',
        name: 'Points Awarded',
        description: 'Total number of points awarded to users',
        type: 'count',
        value: growthMetrics.points_awarded,
        icon: 'points'
      },
      {
        id: 'achievements_unlocked',
        name: 'Achievements Unlocked',
        description: 'Number of achievements unlocked by users',
        type: 'count',
        value: growthMetrics.achievements_unlocked,
        icon: 'achievements'
      }
    ];
  };

  // Sample chart data (in a real app, this would come from the API)
  const sampleCharts = [
    {
      id: 'user_growth',
      title: 'User Growth',
      description: 'Number of new users over time',
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'New Users',
            data: [65, 78, 90, 115, 130, 155],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2
          }
        ]
      }
    },
    {
      id: 'user_segments',
      title: 'User Segments',
      description: 'Distribution of users by type',
      type: 'pie',
      data: {
        labels: ['Clients', 'Service Agents', 'Admins'],
        datasets: [
          {
            data: [65, 30, 5],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 1
          }
        ]
      }
    },
    {
      id: 'referral_sources',
      title: 'Referral Sources',
      description: 'Where referrals are coming from',
      type: 'bar',
      data: {
        labels: ['Direct', 'Email', 'Social', 'Search', 'Ads'],
        datasets: [
          {
            label: 'Referrals',
            data: [45, 30, 25, 15, 10],
            backgroundColor: '#10b981',
            borderWidth: 0
          }
        ]
      }
    },
    {
      id: 'engagement_metrics',
      title: 'Engagement Metrics',
      description: 'Key engagement metrics over time',
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Forum Posts',
            data: [25, 30, 35, 40, 45, 50],
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderWidth: 2
          },
          {
            label: 'Points Earned',
            data: [100, 120, 150, 170, 200, 230],
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2
          },
          {
            label: 'Achievements',
            data: [5, 8, 12, 15, 18, 22],
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            borderWidth: 2
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
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Analytics Dashboard</h1>
              <div className="flex space-x-4">
                <Link
                  to="/analytics/ab-tests"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  A/B Tests
                </Link>
                <Link
                  to="/analytics/user-metrics"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  User Metrics
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TimeRangeSelector 
                  selectedRange={timeRange}
                  onRangeChange={handleTimeRangeChange}
                />
                <UserSegmentSelector 
                  selectedSegment={userSegment}
                  onSegmentChange={handleUserSegmentChange}
                />
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
                    <h3 className="text-sm font-medium text-red-800">Error loading analytics data</h3>
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
              <div className="space-y-8">
                {/* Metrics */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Growth Metrics</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {getMetricCards().map((metric) => (
                      <MetricCard key={metric.id} metric={metric} />
                    ))}
                  </div>
                </div>

                {/* Charts */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Charts</h2>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {sampleCharts.map((chart) => (
                      <ChartCard key={chart.id} chart={chart} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
