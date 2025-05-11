import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Clock, Pin, Lock } from 'lucide-react';
import { ForumThread, ForumCategory } from '../../types/forum';
import { formatDistanceToNow } from 'date-fns';

interface ThreadListProps {
  threads: ForumThread[];
  category: ForumCategory;
  isLoading: boolean;
  totalThreads: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  category,
  isLoading,
  totalThreads,
  currentPage,
  onPageChange,
  pageSize
}) => {
  const totalPages = Math.ceil(totalThreads / pageSize);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Threads Found</h3>
        <p className="text-gray-500 mb-4">
          There are no threads in this category yet. Be the first to start a discussion!
        </p>
        <Link
          to={`/forum/category/${category.slug}/new-thread`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Thread
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
        <Link
          to={`/forum/category/${category.slug}/new-thread`}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Thread
        </Link>
      </div>
      
      <div className="space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    {thread.is_pinned && (
                      <Pin className="h-4 w-4 text-blue-600 mr-1" />
                    )}
                    {thread.is_locked && (
                      <Lock className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <Link to={`/forum/thread/${thread.slug}`}>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {thread.title}
                      </h3>
                    </Link>
                  </div>
                  
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      {thread.author?.avatar_url ? (
                        <img
                          src={thread.author.avatar_url}
                          alt={thread.author.full_name}
                          className="h-5 w-5 rounded-full mr-1"
                        />
                      ) : (
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span>{thread.author?.full_name || 'Unknown'}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md">
                  <span className="text-lg font-semibold text-gray-900">{thread.post_count || 0}</span>
                  <span className="text-xs text-gray-500">replies</span>
                </div>
              </div>
              
              {thread.latest_post && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>
                      Latest reply by{' '}
                      <span className="font-medium text-gray-700">
                        {thread.latest_post.author?.full_name || 'Unknown'}
                      </span>
                      {' '}{formatDistanceToNow(new Date(thread.latest_post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  page === currentPage
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ThreadList;
