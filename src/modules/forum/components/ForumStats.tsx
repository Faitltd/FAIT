import React from 'react';
import { ForumStats as ForumStatsType } from '../../../types/forum.types';

interface ForumStatsProps {
  stats: ForumStatsType;
  className?: string;
}

/**
 * Component to display forum statistics
 */
const ForumStats: React.FC<ForumStatsProps> = ({ 
  stats,
  className = ''
}) => {
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Forum Statistics</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Overview of forum activity
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Categories</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {stats.total_categories}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Threads</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {stats.total_threads}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Posts</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {stats.total_posts}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Users</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {stats.total_users}
            </dd>
          </div>
          {stats.latest_user && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Latest User</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  {stats.latest_user.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full mr-2"
                      src={stats.latest_user.avatar_url}
                      alt={`${stats.latest_user.first_name} ${stats.latest_user.last_name}`}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                      <span className="text-sm font-medium text-gray-500">
                        {stats.latest_user.first_name?.[0] || ''}
                        {stats.latest_user.last_name?.[0] || ''}
                      </span>
                    </div>
                  )}
                  <span>
                    {stats.latest_user.first_name} {stats.latest_user.last_name} (joined {formatDate(stats.latest_user.created_at)})
                  </span>
                </div>
              </dd>
            </div>
          )}
          {stats.most_active_category && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Most Active Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {stats.most_active_category.name} ({stats.most_active_category.post_count} posts)
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ForumStats;
