import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gamificationAnalyticsService } from '../../services/analytics/GamificationAnalyticsService';
import { UserEngagementMetrics, UserEngagementLevel } from '../../types/gamification-analytics.types';
import { useAuth } from '../../contexts/AuthContext';

/**
 * User Engagement Profile View
 */
const UserEngagementProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<UserEngagementMetrics | null>(null);
  const [userName, setUserName] = useState<string>('User');

  // Fetch user engagement metrics
  useEffect(() => {
    const fetchUserMetrics = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user engagement metrics
        const userMetrics = await gamificationAnalyticsService.getUserEngagementMetrics(userId);
        setMetrics(userMetrics);
        
        // Fetch user profile to get name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', userId)
          .single();
        
        if (profile) {
          setUserName(`${profile.first_name} ${profile.last_name}`);
        }
      } catch (err: any) {
        console.error('Error fetching user engagement metrics:', err);
        setError(err.message || 'Failed to load user engagement data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserMetrics();
  }, [userId]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get engagement level badge
  const getEngagementLevelBadge = (level: UserEngagementLevel) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    switch (level) {
      case UserEngagementLevel.POWER_USER:
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case UserEngagementLevel.HIGHLY_ENGAGED:
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case UserEngagementLevel.ENGAGED:
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-800';
        break;
      case UserEngagementLevel.CASUAL:
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case UserEngagementLevel.INACTIVE:
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  // Check if user is authorized to view this profile
  const isAuthorized = () => {
    if (!currentUser) return false;
    
    // User can view their own profile
    if (currentUser.id === userId) return true;
    
    // Admins can view any profile
    if (currentUser.user_metadata?.role === 'admin') return true;
    
    return false;
  };

  if (!isAuthorized()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m0 0V6m0 2h2m-2 0H9" />
            </svg>
            <h2 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h2>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to view this user's engagement profile.
            </p>
            <div className="mt-6">
              <Link
                to="/gamification"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Engagement Profile: {userName}
              </h1>
              <Link
                to="/gamification"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                    <h3 className="text-sm font-medium text-red-800">Error loading user engagement data</h3>
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
              <div className="space-y-6 py-6">
                {metrics && (
                  <>
                    {/* Engagement Overview */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900">Engagement Overview</h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Summary of user's engagement with the platform
                          </p>
                        </div>
                        <div>
                          {getEngagementLevelBadge(metrics.engagementLevel)}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Total Points</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.totalPoints.toLocaleString()}
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Challenges Completed</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.challengesCompleted.toLocaleString()}
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Events Participated</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.eventsParticipated.toLocaleString()}
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Daily Tasks Completed</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.dailyTasksCompleted.toLocaleString()}
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Team Participation</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.teamParticipation ? 'Yes' : 'No'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Activity Metrics */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Metrics</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Details about user's activity on the platform
                        </p>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Current Login Streak</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.currentLoginStreak} days
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Longest Login Streak</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.longestLoginStreak} days
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Last Activity</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formatDate(metrics.lastActivityDate)}
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Days Active</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.daysActive} days
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Average Sessions Per Week</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {metrics.averageSessionsPerWeek.toFixed(1)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Engagement Visualization */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Engagement Visualization</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Visual representation of user's engagement metrics
                        </p>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        {/* Points Progress */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Points Progress</h4>
                            <span className="text-sm text-gray-500">{metrics.totalPoints.toLocaleString()} points</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min((metrics.totalPoints / 10000) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>2,500</span>
                            <span>5,000</span>
                            <span>7,500</span>
                            <span>10,000+</span>
                          </div>
                        </div>

                        {/* Login Streak */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Login Streak</h4>
                            <span className="text-sm text-gray-500">{metrics.currentLoginStreak} days (Max: {metrics.longestLoginStreak} days)</span>
                          </div>
                          <div className="flex space-x-1">
                            {[...Array(Math.min(30, Math.max(metrics.longestLoginStreak, 7)))].map((_, i) => (
                              <div
                                key={i}
                                className={`h-6 flex-1 rounded ${
                                  i < metrics.currentLoginStreak ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                              ></div>
                            ))}
                          </div>
                        </div>

                        {/* Activity Heatmap (simplified) */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Level</h4>
                          <div className="grid grid-cols-7 gap-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                              <div key={i} className="text-xs text-center text-gray-500">{day}</div>
                            ))}
                            {[...Array(28)].map((_, i) => {
                              // This is a simplified visualization - in a real implementation,
                              // you would use actual activity data for each day
                              const activityLevel = Math.random();
                              let bgColor = 'bg-gray-100';
                              
                              if (activityLevel > 0.8) bgColor = 'bg-green-500';
                              else if (activityLevel > 0.6) bgColor = 'bg-green-400';
                              else if (activityLevel > 0.4) bgColor = 'bg-green-300';
                              else if (activityLevel > 0.2) bgColor = 'bg-green-200';
                              
                              return (
                                <div
                                  key={i}
                                  className={`h-4 rounded ${bgColor}`}
                                  title={`Activity level: ${Math.round(activityLevel * 100)}%`}
                                ></div>
                              );
                            })}
                          </div>
                          <div className="flex justify-end mt-1">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>Less</span>
                              <div className="h-3 w-3 bg-gray-100 rounded"></div>
                              <div className="h-3 w-3 bg-green-200 rounded"></div>
                              <div className="h-3 w-3 bg-green-300 rounded"></div>
                              <div className="h-3 w-3 bg-green-400 rounded"></div>
                              <div className="h-3 w-3 bg-green-500 rounded"></div>
                              <span>More</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserEngagementProfile;
