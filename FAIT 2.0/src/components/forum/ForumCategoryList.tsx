import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Clock } from 'lucide-react';
import { ForumCategory } from '../../types/forum';
import { formatDistanceToNow } from 'date-fns';

interface ForumCategoryListProps {
  categories: ForumCategory[];
  isLoading: boolean;
}

const ForumCategoryList: React.FC<ForumCategoryListProps> = ({ categories, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
        <p className="text-gray-500">
          There are no forum categories available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <Link to={`/forum/category/${category.slug}`}>
              <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
            </Link>
            <p className="text-gray-500 mt-1">{category.description}</p>
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{category.thread_count || 0} threads</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{category.post_count || 0} posts</span>
                </div>
              </div>
              
              {category.latest_thread && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    Latest: <Link 
                      to={`/forum/thread/${category.latest_thread.slug}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {category.latest_thread.title.length > 30
                        ? `${category.latest_thread.title.substring(0, 30)}...`
                        : category.latest_thread.title
                      }
                    </Link>
                    {' '}{formatDistanceToNow(new Date(category.latest_thread.created_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForumCategoryList;
