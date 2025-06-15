import React from 'react';
import { UserLevel } from '../../../types/gamification.types';

interface LevelProgressProps {
  userLevel: UserLevel;
  nextLevelInfo?: {
    next_level: number;
    next_level_name: string;
    points_needed: number;
    rewards: any[];
  };
  className?: string;
}

/**
 * Component to display user level progress
 */
const LevelProgress: React.FC<LevelProgressProps> = ({
  userLevel,
  nextLevelInfo,
  className = ''
}) => {
  // Get level icon
  const getLevelIcon = (level: number) => {
    return (
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          {getLevelIcon(userLevel.level)}
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Level {userLevel.level}</h3>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500">
                {userLevel.current_points.toLocaleString()} points
              </span>
              {nextLevelInfo && (
                <span className="ml-2 text-xs text-gray-400">
                  ({nextLevelInfo.points_needed.toLocaleString()} more to level {nextLevelInfo.next_level})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Progress to Level {nextLevelInfo ? nextLevelInfo.next_level : userLevel.level + 1}</span>
            <span>{userLevel.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-blue-600"
              style={{ width: `${userLevel.progress_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Next level rewards */}
        {nextLevelInfo && nextLevelInfo.rewards && nextLevelInfo.rewards.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Level {nextLevelInfo.next_level} Rewards:
            </h4>
            <ul className="space-y-1">
              {nextLevelInfo.rewards.map((reward, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <svg className="h-4 w-4 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {reward.type === 'title' && `Title: ${reward.value}`}
                  {reward.type === 'feature_unlock' && `Unlock: ${reward.metadata?.description || reward.value}`}
                  {reward.type === 'discount' && `${reward.value}% Discount`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelProgress;
