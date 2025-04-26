import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../modules/analytics/hooks/useAnalytics';
import ABTestCard from '../../modules/analytics/components/ABTestCard';

/**
 * View for A/B tests
 */
const ABTestsView: React.FC = () => {
  const { isLoading, error, abTests, fetchABTests } = useAnalytics();
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'running' | 'completed' | 'cancelled'>('all');

  // Fetch A/B tests on mount
  useEffect(() => {
    if (statusFilter === 'all') {
      fetchABTests();
    } else {
      fetchABTests(statusFilter);
    }
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">A/B Tests</h1>
              <div className="flex space-x-4">
                <Link
                  to="/analytics"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
                <Link
                  to="/analytics/ab-tests/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New A/B Test
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Status filter */}
            <div className="bg-white shadow rounded-lg my-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Filter by Status</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border ${
                        statusFilter === 'all' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      onClick={() => setStatusFilter('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border ${
                        statusFilter === 'draft' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      onClick={() => setStatusFilter('draft')}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border ${
                        statusFilter === 'running' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      onClick={() => setStatusFilter('running')}
                    >
                      Running
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border ${
                        statusFilter === 'completed' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      onClick={() => setStatusFilter('completed')}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border ${
                        statusFilter === 'cancelled' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      onClick={() => setStatusFilter('cancelled')}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                    <h3 className="text-sm font-medium text-red-800">Error loading A/B tests</h3>
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
                {/* A/B Tests */}
                {abTests.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {abTests.map((test) => (
                      <ABTestCard key={test.id} test={test} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No A/B tests found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new A/B test.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/analytics/ab-tests/new"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          New A/B Test
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ABTestsView;
