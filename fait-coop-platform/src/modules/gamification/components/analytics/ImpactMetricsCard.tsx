import React from 'react';
import { GamificationImpactMetrics, UserEngagementLevel } from '../../../../types/gamification-analytics.types';

interface ImpactMetricsCardProps {
  metrics: GamificationImpactMetrics;
  isLoading?: boolean;
  className?: string;
}

/**
 * Component to display gamification impact metrics
 */
const ImpactMetricsCard: React.FC<ImpactMetricsCardProps> = ({
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

  // Get color class based on difference value
  const getDifferenceColorClass = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  // Format engagement level for display
  const formatEngagementLevel = (level: UserEngagementLevel) => {
    return level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Business Impact Metrics</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          How gamification affects key business metrics
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
              <dt className="text-sm font-medium text-gray-500">User Retention</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatPercentage(metrics.retentionRate)}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Retention by Engagement</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="space-y-1">
                  {Object.entries(metrics.retentionByEngagementLevel).map(([level, rate]) => (
                    <li key={level}>
                      <span className="font-medium">{formatEngagementLevel(level as UserEngagementLevel)}:</span> {formatPercentage(rate)}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Session Metrics</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div>Avg. Session Duration: {metrics.averageSessionDuration.toFixed(1)} minutes</div>
                <div>Sessions Per User: {metrics.sessionsPerUser.toFixed(1)}</div>
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Activity by Engagement</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="space-y-1">
                  {Object.entries(metrics.activityByEngagementLevel).map(([level, sessions]) => (
                    <li key={level}>
                      <span className="font-medium">{formatEngagementLevel(level as UserEngagementLevel)}:</span> {sessions.toFixed(1)} sessions per week
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Business Metrics</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div>Bookings Per User: {metrics.bookingsPerUser.toFixed(2)}</div>
                <div>Avg. Booking Value: ${metrics.bookingValuePerUser.toFixed(2)}</div>
                <div>Referrals Per User: {metrics.referralsPerUser.toFixed(2)}</div>
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Engaged vs. Non-Engaged</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="mb-2">
                  <span className="font-medium">Retention:</span> 
                  <span className="ml-2">{formatPercentage(metrics.engagedVsNonEngagedRetention.engaged)} vs. {formatPercentage(metrics.engagedVsNonEngagedRetention.nonEngaged)}</span>
                  <span className={`ml-2 ${getDifferenceColorClass(metrics.engagedVsNonEngagedRetention.difference)}`}>
                    ({metrics.engagedVsNonEngagedRetention.difference > 0 ? '+' : ''}{formatPercentage(metrics.engagedVsNonEngagedRetention.difference)})
                  </span>
                </div>
                <div>
                  <span className="font-medium">Bookings:</span> 
                  <span className="ml-2">{metrics.engagedVsNonEngagedBookings.engaged.toFixed(2)} vs. {metrics.engagedVsNonEngagedBookings.nonEngaged.toFixed(2)}</span>
                  <span className={`ml-2 ${getDifferenceColorClass(metrics.engagedVsNonEngagedBookings.difference)}`}>
                    ({metrics.engagedVsNonEngagedBookings.difference > 0 ? '+' : ''}{metrics.engagedVsNonEngagedBookings.difference.toFixed(2)})
                  </span>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default ImpactMetricsCard;
