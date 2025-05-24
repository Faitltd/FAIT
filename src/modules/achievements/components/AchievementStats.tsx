import React from 'react';
import { AchievementStats as AchievementStatsType } from '../../../types/achievements.types';

interface AchievementStatsProps {
  stats: AchievementStatsType;
  className?: string;
}

/**
 * Component to display achievement statistics
 */
const AchievementStats: React.FC<AchievementStatsProps> = ({ 
  stats,
  className = ''
}) => {
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Achievement Progress</h3>
        <p className="text-sm text-gray-500">Your achievement journey</p>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{stats.achievements_earned} / {stats.total_achievements} achievements</span>
          <span>{Math.round(stats.completion_percentage * 100)}%</span>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${Math.min(100, Math.round(stats.completion_percentage * 100))}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-500">Achievements Earned</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {formatNumber(stats.achievements_earned)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-500">Points Earned</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {formatNumber(stats.total_points_earned)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementStats;
