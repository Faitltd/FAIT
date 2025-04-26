import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAchievements } from '../../modules/achievements/hooks/useAchievements';
import AchievementsList from '../../modules/achievements/components/AchievementsList';
import AchievementProgress from '../../modules/achievements/components/AchievementProgress';
import AchievementStats from '../../modules/achievements/components/AchievementStats';
import AchievementBadge from '../../modules/achievements/components/AchievementBadge';
import { AchievementCategory } from '../../types/achievements.types';

/**
 * Dashboard for achievements system
 */
const AchievementsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    userAchievements, 
    progress, 
    stats,
    getAchievementsByCategory
  } = useAchievements();
  
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

  // Filter achievements by category
  const filteredAchievements = activeCategory === 'all'
    ? userAchievements
    : userAchievements.filter(ua => ua.achievement?.category === activeCategory);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>Please log in to access your achievements dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Achievements</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Achievement Stats Section */}
            <div className="px-4 py-6 sm:px-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <AchievementStats stats={stats} />
              )}
            </div>

            {/* Achievement Badges */}
            {!isLoading && userAchievements.length > 0 && (
              <div className="px-4 py-6 sm:px-0">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Badges</h3>
                  <div className="flex flex-wrap gap-4">
                    {userAchievements.slice(0, 10).map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        size="md"
                      />
                    ))}
                    {userAchievements.length > 10 && (
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                        <span className="text-sm font-medium text-gray-500">
                          +{userAchievements.length - 10}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div className="px-4 sm:px-0">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`${
                      activeCategory === 'all'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveCategory('onboarding')}
                    className={`${
                      activeCategory === 'onboarding'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Onboarding
                  </button>
                  <button
                    onClick={() => setActiveCategory('engagement')}
                    className={`${
                      activeCategory === 'engagement'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Engagement
                  </button>
                  <button
                    onClick={() => setActiveCategory('referrals')}
                    className={`${
                      activeCategory === 'referrals'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Referrals
                  </button>
                  <button
                    onClick={() => setActiveCategory('verification')}
                    className={`${
                      activeCategory === 'verification'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Verification
                  </button>
                  <button
                    onClick={() => setActiveCategory('bookings')}
                    className={`${
                      activeCategory === 'bookings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Bookings
                  </button>
                  <button
                    onClick={() => setActiveCategory('milestones')}
                    className={`${
                      activeCategory === 'milestones'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Milestones
                  </button>
                </nav>
              </div>
            </div>

            {/* Achievements List */}
            <div className="px-4 py-6 sm:px-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <AchievementsList achievements={filteredAchievements} />
              )}
            </div>
            
            {/* Achievement Progress */}
            <div className="px-4 py-6 sm:px-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <AchievementProgress progressItems={progress} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AchievementsDashboard;
