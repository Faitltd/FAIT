import React from 'react';
import { LeaderboardEntry } from '../../../types/gamification.types';
import { useAuth } from '../../../contexts/AuthContext';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title: string;
  description?: string;
  highlightCurrentUser?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * Component to display a leaderboard
 */
const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  title,
  description,
  highlightCurrentUser = true,
  isLoading = false,
  className = ''
}) => {
  const { user } = useAuth();

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 font-bold">
          1
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-600 font-bold">
          2
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-700 text-yellow-100 font-bold">
          3
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-medium">
          {rank}
        </div>
      );
    }
  };

  // Get user type badge
  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case 'client':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Client
          </span>
        );
      case 'service_agent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Service Agent
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {userType}
          </span>
        );
    }
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="border-t border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : entries.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <li
                key={entry.user_id}
                className={`px-4 py-4 sm:px-6 ${
                  highlightCurrentUser && user && entry.user_id === user.id
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getRankBadge(entry.rank)}
                    <div className="ml-3 flex items-center">
                      {entry.user.avatar_url ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={entry.user.avatar_url}
                          alt={`${entry.user.first_name} ${entry.user.last_name}`}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {entry.user.first_name.charAt(0)}
                          {entry.user.last_name.charAt(0)}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.user.first_name} {entry.user.last_name}
                          {highlightCurrentUser && user && entry.user_id === user.id && (
                            <span className="ml-2 text-xs text-blue-600">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getUserTypeBadge(entry.user.user_type)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {entry.score.toLocaleString()} {entry.score === 1 ? 'point' : 'points'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-sm text-gray-500">No entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
