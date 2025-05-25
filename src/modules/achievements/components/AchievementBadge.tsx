import React from 'react';
import { UserAchievement } from '../../../types/achievements.types';

interface AchievementBadgeProps {
  achievement: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

/**
 * Component to display an achievement badge
 */
const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement,
  size = 'md',
  showTooltip = true,
  className = ''
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  // Determine size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer`}
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => showTooltip && setShowDetails(false)}
        onClick={() => setShowDetails(!showDetails)}
      >
        {achievement.achievement?.badge_image_url ? (
          <img
            className="h-full w-full object-cover"
            src={achievement.achievement.badge_image_url}
            alt={achievement.achievement.name}
          />
        ) : (
          <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center`}>
            <svg className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'} text-blue-600`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="absolute z-10 w-64 px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <div className="font-medium text-gray-900 dark:text-white">
            {achievement.achievement?.name || 'Achievement'}
          </div>
          <div className="mt-1 text-gray-500 dark:text-gray-400">
            {achievement.achievement?.description || 'No description available'}
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {achievement.points_awarded} points
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Achieved on {formatDate(achievement.achieved_at)}
          </div>
          <div className="absolute w-2 h-2 bg-white border-t border-l border-gray-200 -top-1 left-1/2 transform -translate-x-1/2 rotate-45 dark:bg-gray-800 dark:border-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
