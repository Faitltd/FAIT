import React from 'react';
import { Challenge, UserChallenge } from '../../../types/gamification.types';

interface ChallengeCardProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onJoin?: (challengeId: string) => void;
  className?: string;
}

/**
 * Component to display a challenge card
 */
const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  userChallenge,
  onJoin,
  className = ''
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get difficulty badge
  const getDifficultyBadge = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Easy
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Medium
          </span>
        );
      case 'hard':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Hard
          </span>
        );
      case 'expert':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Expert
          </span>
        );
      default:
        return null;
    }
  };

  // Get category badge
  const getCategoryBadge = () => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (challenge.category) {
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
      </span>
    );
  };

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {challenge.badge_url ? (
              <img
                src={challenge.badge_url}
                alt={challenge.title}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            )}
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
              <div className="flex space-x-2 mt-1">
                {getDifficultyBadge()}
                {getCategoryBadge()}
              </div>
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {challenge.points} pts
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{challenge.description}</p>

        {/* Requirements */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
          <ul className="space-y-1">
            {challenge.requirements.map((req, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {req.action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({req.count} {req.count === 1 ? 'time' : 'times'})
              </li>
            ))}
          </ul>
        </div>

        {/* Rewards */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Rewards:</h4>
          <ul className="space-y-1">
            {challenge.rewards.map((reward, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <svg className="h-4 w-4 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {reward.type === 'points' && `${reward.value} points`}
                {reward.type === 'badge' && `Badge: ${reward.metadata?.name || 'Special Badge'}`}
                {reward.type === 'title' && `Title: ${reward.value}`}
                {reward.type === 'feature_unlock' && `Unlock: ${reward.metadata?.description || reward.value}`}
                {reward.type === 'discount' && `${reward.value}% Discount`}
              </li>
            ))}
          </ul>
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-500 mb-4">
          <span>Available from {formatDate(challenge.start_date)}</span>
          {challenge.end_date && <span> to {formatDate(challenge.end_date)}</span>}
          {challenge.is_repeatable && (
            <span className="ml-2">
              (Repeatable{challenge.cooldown_days ? ` every ${challenge.cooldown_days} days` : ''})
            </span>
          )}
        </div>

        {/* Progress or Join button */}
        {userChallenge ? (
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Progress</span>
              <span>{userChallenge.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${userChallenge.is_completed ? 'bg-green-600' : 'bg-blue-600'}`}
                style={{ width: `${userChallenge.progress}%` }}
              ></div>
            </div>
            {userChallenge.is_completed && (
              <div className="mt-2 text-sm text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed on {formatDate(userChallenge.completed_at || '')}
              </div>
            )}
          </div>
        ) : (
          onJoin && (
            <button
              onClick={() => onJoin(challenge.id)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Accept Challenge
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
