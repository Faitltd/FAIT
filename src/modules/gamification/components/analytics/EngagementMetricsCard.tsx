import React from 'react';
import { GamificationEngagementMetrics } from '../../../../types/gamification-analytics.types';

interface EngagementMetricsCardProps {
  metrics: GamificationEngagementMetrics;
  isLoading?: boolean;
  className?: string;
}

/**
 * Component to display gamification engagement metrics
 */
const EngagementMetricsCard: React.FC<EngagementMetricsCardProps> = ({
  metrics,
  isLoading = false,
  className = ''
}) => {
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Format number
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Engagement Metrics</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Key metrics about user engagement with the gamification system
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Active Users</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatNumber(metrics.activeUsers)} / {formatNumber(metrics.totalUsers)} ({formatPercentage((metrics.activeUsers / metrics.totalUsers) * 100)})
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Engaged Users</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatNumber(metrics.engagedUsers)} / {formatNumber(metrics.totalUsers)} ({formatPercentage((metrics.engagedUsers / metrics.totalUsers) * 100)})
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Challenges Completed</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatNumber(metrics.totalChallengesCompleted)} (Avg. {metrics.challengesCompletedPerUser.toFixed(1)} per engaged user)
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Challenge Completion Rate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatPercentage(metrics.challengeCompletionRate)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Event Participation</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatNumber(metrics.totalEventParticipants)} ({formatPercentage(metrics.eventParticipationRate)} of eligible users)
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Daily Task Completion</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatPercentage(metrics.dailyTaskCompletionRate)} (Avg. {metrics.averageDailyTasksCompleted.toFixed(1)} tasks per user)
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Login Streaks</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Avg. {metrics.averageLoginStreak.toFixed(1)} days (Max: {metrics.maxLoginStreak} days)
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Teams</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatNumber(metrics.totalTeams)} teams (Avg. {metrics.averageTeamSize.toFixed(1)} members per team)
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Points Awarded</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatNumber(metrics.totalPointsAwarded)} (Avg. {formatNumber(Math.round(metrics.averagePointsPerUser))} per active user)
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default EngagementMetricsCard;
