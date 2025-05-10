import React from 'react';
import { MessageSquare, Users, Layers, Award } from 'lucide-react';
import { ForumStats, ForumUserStats } from '../../types/forum';

interface ForumStatsComponentProps {
  stats: ForumStats;
  userStats?: ForumUserStats | null;
  isLoading: boolean;
}

const ForumStatsComponent: React.FC<ForumStatsComponentProps> = ({
  stats,
  userStats,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Forum Statistics</h3>
        <div className="animate-pulse space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
          
          {userStats && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Forum Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <Layers className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-lg font-semibold text-gray-900">{stats.total_categories}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Threads</p>
            <p className="text-lg font-semibold text-gray-900">{stats.total_threads}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Posts</p>
            <p className="text-lg font-semibold text-gray-900">{stats.total_posts}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Users className="h-5 w-5 text-orange-500 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Members</p>
            <p className="text-lg font-semibold text-gray-900">{stats.total_users}</p>
          </div>
        </div>
      </div>
      
      {userStats && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Your Activity</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Your Threads</p>
                <p className="text-lg font-semibold text-gray-900">{userStats.thread_count}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Your Posts</p>
                <p className="text-lg font-semibold text-gray-900">{userStats.post_count}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Solutions</p>
                <p className="text-lg font-semibold text-gray-900">{userStats.solution_count}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Reactions</p>
                <p className="text-lg font-semibold text-gray-900">{userStats.reaction_count}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumStatsComponent;
