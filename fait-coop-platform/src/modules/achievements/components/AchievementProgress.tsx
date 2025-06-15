import React from 'react';
import { AchievementProgress as AchievementProgressType } from '../../../types/achievements.types';

interface AchievementProgressProps {
  progressItems: AchievementProgressType[];
  className?: string;
}

/**
 * Component to display achievement progress
 */
const AchievementProgress: React.FC<AchievementProgressProps> = ({ 
  progressItems,
  className = ''
}) => {
  if (progressItems.length === 0) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No achievements in progress</h3>
          <p className="mt-1 text-sm text-gray-500">
            Continue using the platform to make progress towards achievements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Achievements in Progress</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your progress towards upcoming achievements
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {progressItems.map((progress) => (
            <li key={progress.achievement_id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  {progress.achievement?.badge_image_url ? (
                    <img
                      className="h-12 w-12 rounded-full opacity-50"
                      src={progress.achievement.badge_image_url}
                      alt={progress.achievement.name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {progress.achievement?.name || 'Achievement'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {progress.achievement?.description || 'No description available'}
                    </p>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{progress.current_value} / {progress.target_value}</span>
                      <span>{Math.round(progress.percentage * 100)}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.round(progress.percentage * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      {progress.achievement?.points_reward || 0} points reward
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AchievementProgress;
