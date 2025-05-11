import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGamification } from '../../modules/gamification/hooks/useGamification';
import ChallengeCard from '../../modules/gamification/components/ChallengeCard';

/**
 * Challenges View
 */
const ChallengesView: React.FC = () => {
  const {
    isLoading,
    error,
    activeChallenges,
    userChallenges,
    joinChallenge,
    trackActivity
  } = useGamification();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Track page view
  useEffect(() => {
    trackActivity('view_challenges_page');
  }, []);

  // Get user challenge for a challenge
  const getUserChallenge = (challengeId: string) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId);
  };

  // Handle challenge join
  const handleJoinChallenge = async (challengeId: string) => {
    await joinChallenge(challengeId);
    trackActivity('join_challenge', challengeId);
  };

  // Get unique categories
  const getCategories = () => {
    const categories = new Set<string>();
    activeChallenges.forEach(challenge => {
      categories.add(challenge.category);
    });
    return Array.from(categories);
  };

  // Get unique difficulties
  const getDifficulties = () => {
    const difficulties = new Set<string>();
    activeChallenges.forEach(challenge => {
      difficulties.add(challenge.difficulty);
    });
    return Array.from(difficulties);
  };

  // Filter challenges
  const getFilteredChallenges = () => {
    let filtered = activeChallenges;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === categoryFilter);
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === difficultyFilter);
    }

    // Filter by status
    if (filter === 'active') {
      filtered = filtered.filter(challenge => {
        const userChallenge = getUserChallenge(challenge.id);
        return userChallenge && !userChallenge.is_completed;
      });
    } else if (filter === 'completed') {
      filtered = filtered.filter(challenge => {
        const userChallenge = getUserChallenge(challenge.id);
        return userChallenge && userChallenge.is_completed;
      });
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Challenges</h1>
              <Link
                to="/gamification"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
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
                    <h3 className="text-sm font-medium text-red-800">Error loading challenges</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg my-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Filter Challenges</h3>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {/* Status filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          filter === 'all' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setFilter('all')}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          filter === 'active' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setFilter('active')}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          filter === 'completed' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setFilter('completed')}
                      >
                        Completed
                      </button>
                    </div>
                  </div>

                  {/* Category filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          categoryFilter === 'all' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setCategoryFilter('all')}
                      >
                        All Categories
                      </button>
                      {getCategories().map(category => (
                        <button
                          key={category}
                          type="button"
                          className={`inline-flex items-center justify-center px-4 py-2 border ${
                            categoryFilter === category 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-300 bg-white text-gray-700'
                          } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                          onClick={() => setCategoryFilter(category)}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Difficulty</label>
                    <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          difficultyFilter === 'all' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setDifficultyFilter('all')}
                      >
                        All Difficulties
                      </button>
                      {getDifficulties().map(difficulty => (
                        <button
                          key={difficulty}
                          type="button"
                          className={`inline-flex items-center justify-center px-4 py-2 border ${
                            difficultyFilter === difficulty 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-300 bg-white text-gray-700'
                          } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                          onClick={() => setDifficultyFilter(difficulty)}
                        >
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6 py-6">
                {/* Challenges grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredChallenges().map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      userChallenge={getUserChallenge(challenge.id)}
                      onJoin={handleJoinChallenge}
                    />
                  ))}
                </div>

                {/* Empty state */}
                {getFilteredChallenges().length === 0 && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No challenges found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters to find challenges.
                      </p>
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

export default ChallengesView;
