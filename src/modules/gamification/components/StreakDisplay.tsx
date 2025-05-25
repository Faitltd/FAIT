import React from 'react';
import { Streak } from '../../../types/gamification.types';

interface StreakDisplayProps {
  streaks: Streak[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Component to display user streaks
 */
const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streaks,
  isLoading = false,
  className = ''
}) => {
  // Get streak type name
  const getStreakTypeName = (type: string) => {
    switch (type) {
      case 'login':
        return 'Login Streak';
      case 'forum':
        return 'Forum Activity Streak';
      case 'activity':
        return 'Platform Activity Streak';
      default:
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Streak`;
    }
  };

  // Get streak icon
  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'login':
        return (
          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'forum':
        return (
          <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        );
      case 'activity':
        return (
          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Streaks</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Keep your streaks going to earn bonus points and special titles
        </p>
      </div>
      <div className="border-t border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : streaks.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {streaks.map((streak) => (
              <li key={streak.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStreakIcon(streak.type)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{getStreakTypeName(streak.type)}</div>
                      <div className="text-sm text-gray-500">
                        Last activity: {formatDate(streak.last_activity_date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold text-blue-600">{streak.current_count} days</div>
                      {streak.longest_count > streak.current_count && (
                        <div className="text-xs text-gray-500">
                          Best: {streak.longest_count} days
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex">
                      {[...Array(Math.min(7, streak.current_count))].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full mx-0.5 ${
                            i < 3 ? 'bg-blue-400' : i < 5 ? 'bg-blue-500' : 'bg-blue-600'
                          }`}
                        ></div>
                      ))}
                      {streak.current_count > 7 && (
                        <div className="ml-1 text-xs text-blue-600">+{streak.current_count - 7}</div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-sm text-gray-500">No streaks available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;
