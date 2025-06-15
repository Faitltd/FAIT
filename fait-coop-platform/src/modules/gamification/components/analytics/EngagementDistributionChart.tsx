import React from 'react';
import { UserEngagementLevel } from '../../../../types/gamification-analytics.types';

interface EngagementDistributionChartProps {
  distribution: Record<UserEngagementLevel, number>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Component to display user engagement distribution chart
 */
const EngagementDistributionChart: React.FC<EngagementDistributionChartProps> = ({
  distribution,
  isLoading = false,
  className = ''
}) => {
  // Format engagement level for display
  const formatEngagementLevel = (level: UserEngagementLevel) => {
    return level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get color for engagement level
  const getColorForLevel = (level: UserEngagementLevel) => {
    switch (level) {
      case UserEngagementLevel.POWER_USER:
        return 'bg-green-600';
      case UserEngagementLevel.HIGHLY_ENGAGED:
        return 'bg-green-500';
      case UserEngagementLevel.ENGAGED:
        return 'bg-blue-500';
      case UserEngagementLevel.CASUAL:
        return 'bg-yellow-500';
      case UserEngagementLevel.INACTIVE:
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  // Calculate total users
  const totalUsers = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  // Calculate percentage for each level
  const getPercentage = (count: number) => {
    return totalUsers > 0 ? (count / totalUsers) * 100 : 0;
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">User Engagement Distribution</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Distribution of users by engagement level
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {/* Bar chart */}
          <div className="space-y-4">
            {Object.entries(distribution).map(([level, count]) => (
              <div key={level} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700">
                  {formatEngagementLevel(level as UserEngagementLevel)}
                </div>
                <div className="flex-1">
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${getColorForLevel(level as UserEngagementLevel)}`}
                      style={{ width: `${getPercentage(count)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-24 pl-4 text-sm text-gray-600 text-right">
                  {count.toLocaleString()} ({getPercentage(count).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <div>Total Users: {totalUsers.toLocaleString()}</div>
              <div>
                Active Engagement: {(
                  getPercentage(distribution[UserEngagementLevel.ENGAGED]) + 
                  getPercentage(distribution[UserEngagementLevel.HIGHLY_ENGAGED]) + 
                  getPercentage(distribution[UserEngagementLevel.POWER_USER])
                ).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementDistributionChart;
