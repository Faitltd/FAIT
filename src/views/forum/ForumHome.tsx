import React from 'react';
import { Link } from 'react-router-dom';
import { useForum } from '../../modules/forum/hooks/useForum';
import CategoryList from '../../modules/forum/components/CategoryList';
import ForumStats from '../../modules/forum/components/ForumStats';

/**
 * Forum home page
 */
const ForumHome: React.FC = () => {
  const { isLoading, error, categories, stats, userStats } = useForum();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Community Forum</h1>
              <Link
                to="/forum/search"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search
              </Link>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading forum data</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6 py-6">
                {/* User stats if logged in */}
                {userStats && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Your Forum Activity</h3>
                      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white overflow-hidden shadow rounded-md">
                          <div className="px-4 py-5 sm:p-6">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Posts
                              </dt>
                              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                {userStats.post_count}
                              </dd>
                            </dl>
                          </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow rounded-md">
                          <div className="px-4 py-5 sm:p-6">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Threads
                              </dt>
                              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                {userStats.thread_count}
                              </dd>
                            </dl>
                          </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow rounded-md">
                          <div className="px-4 py-5 sm:p-6">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Solutions
                              </dt>
                              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                {userStats.solution_count}
                              </dd>
                            </dl>
                          </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow rounded-md">
                          <div className="px-4 py-5 sm:p-6">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Reputation
                              </dt>
                              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                {userStats.reputation}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories */}
                <CategoryList categories={categories} />

                {/* Forum Stats */}
                <ForumStats stats={stats} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ForumHome;
