import React from 'react';
import { Link } from 'react-router-dom';
import { ForumThread } from '../../../types/forum.types';

interface ThreadListProps {
  threads: ForumThread[];
  className?: string;
}

/**
 * Component to display a list of forum threads
 */
const ThreadList: React.FC<ThreadListProps> = ({ 
  threads,
  className = ''
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (threads.length === 0) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No threads found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to start a discussion in this category.
          </p>
          <div className="mt-6">
            <Link
              to="new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Thread
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Threads</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {threads.length} discussion{threads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Thread
        </Link>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {threads.map((thread) => (
            <li key={thread.id} className={thread.is_pinned ? 'bg-blue-50' : ''}>
              <Link to={`/forum/thread/${thread.slug}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {thread.is_pinned && (
                        <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {thread.title}
                        </h4>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span>
                            Started by {thread.author?.first_name} {thread.author?.last_name}
                          </span>
                          <span className="mx-1">&middot;</span>
                          <span>
                            {formatDate(thread.created_at)}
                          </span>
                          {thread.is_locked && (
                            <>
                              <span className="mx-1">&middot;</span>
                              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              <span className="ml-1">Locked</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900">
                          {thread.post_count} {thread.post_count === 1 ? 'reply' : 'replies'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {thread.view_count} views
                        </span>
                      </div>
                      {thread.last_post && (
                        <div className="ml-6 flex-shrink-0 flex flex-col items-end">
                          <span className="text-xs text-gray-500">
                            Last reply
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(thread.last_post.created_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ThreadList;
