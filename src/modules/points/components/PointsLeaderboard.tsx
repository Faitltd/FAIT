import React from 'react';
import { PointsLeaderboardEntry } from '../../../types/points.types';

interface PointsLeaderboardProps {
  entries: PointsLeaderboardEntry[];
  userRank?: { rank: number; points: number } | null;
  className?: string;
}

/**
 * Component to display points leaderboard
 */
const PointsLeaderboard: React.FC<PointsLeaderboardProps> = ({ 
  entries,
  userRank,
  className = ''
}) => {
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  // Get medal for top 3 ranks
  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 2:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 3:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center">
            <svg className="h-5 w-5 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">{rank}</span>
          </div>
        );
    }
  };

  if (entries.length === 0) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leaderboard data</h3>
          <p className="mt-1 text-sm text-gray-500">
            The leaderboard will be updated soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Points Leaderboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Top point earners in the community
        </p>
      </div>
      
      {userRank && (
        <div className="bg-blue-50 px-4 py-3 border-t border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-800">{userRank.rank}</span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-blue-800">Your Rank</div>
              </div>
            </div>
            <div className="text-sm font-semibold text-blue-800">
              {formatNumber(userRank.points)} points
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <li key={entry.user_id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getMedal(entry.rank)}
                  <div className="ml-3">
                    <div className="flex items-center">
                      {entry.avatar_url ? (
                        <img
                          className="h-8 w-8 rounded-full mr-2"
                          src={entry.avatar_url}
                          alt={entry.full_name}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-500">
                            {entry.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {entry.full_name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.user_type === 'service_agent' ? 'Service Agent' : 'Client'}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatNumber(entry.points)} points
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PointsLeaderboard;
