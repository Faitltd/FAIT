import React from 'react';
import { UserAchievement } from '../../../types/achievements.types';

interface AchievementsListProps {
  achievements: UserAchievement[];
  className?: string;
}

/**
 * Component to display a list of user achievements
 */
const AchievementsList: React.FC<AchievementsListProps> = ({ 
  achievements,
  className = ''
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (achievements.length === 0) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No achievements yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete actions on the platform to earn achievements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Achievements</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Badges and rewards you've earned
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {achievements.map((userAchievement) => (
            <li key={userAchievement.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  {userAchievement.achievement?.badge_image_url ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={userAchievement.achievement.badge_image_url}
                      alt={userAchievement.achievement.name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {userAchievement.achievement?.name || 'Achievement'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {userAchievement.achievement?.description || 'No description available'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">
                        {userAchievement.points_awarded} points
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Achieved on {formatDate(userAchievement.achieved_at)}
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

export default AchievementsList;
