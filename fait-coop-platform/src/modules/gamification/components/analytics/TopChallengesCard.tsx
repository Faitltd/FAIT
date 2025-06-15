import React from 'react';
import { ChallengeMetric } from '../../../../types/gamification-analytics.types';

interface TopChallengesCardProps {
  challenges: ChallengeMetric[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Component to display top challenges
 */
const TopChallengesCard: React.FC<TopChallengesCardProps> = ({
  challenges,
  isLoading = false,
  className = ''
}) => {
  // Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Easy
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Medium
          </span>
        );
      case 'hard':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            Hard
          </span>
        );
      case 'expert':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Expert
          </span>
        );
      default:
        return null;
    }
  };

  // Get category badge
  const getCategoryBadge = (category: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (category) {
      case 'community':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'service':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'verification':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'referral':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'special':
        bgColor = 'bg-pink-100';
        textColor = 'text-pink-800';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Top Challenges</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Most popular challenges by completion count
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          {challenges.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
              No challenge data available
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {challenges.map((challenge) => (
                <li key={challenge.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{challenge.title}</h4>
                      <div className="mt-1 flex space-x-2">
                        {getDifficultyBadge(challenge.difficulty)}
                        {getCategoryBadge(challenge.category)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {challenge.completions.toLocaleString()} completions
                      </div>
                      <div className="text-sm text-gray-500">
                        {challenge.completionRate.toFixed(1)}% completion rate
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${challenge.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TopChallengesCard;
