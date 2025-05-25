import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePoints } from '../../modules/points/hooks/usePoints';
import PointsBalance from '../../modules/points/components/PointsBalance';
import PointsHistory from '../../modules/points/components/PointsHistory';
import PointsRewards from '../../modules/points/components/PointsRewards';
import PointsLeaderboard from '../../modules/points/components/PointsLeaderboard';

/**
 * Dashboard for points system
 */
const PointsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    balance, 
    transactions, 
    rewards, 
    leaderboard, 
    userRank,
    refreshPoints
  } = usePoints();
  
  const [activeTab, setActiveTab] = useState<'history' | 'rewards' | 'leaderboard'>('history');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>Please log in to access your points dashboard.</p>
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
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Points & Rewards</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Points Balance Section */}
            <div className="px-4 py-6 sm:px-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <PointsBalance balance={balance} />
              )}
            </div>

            {/* Tabs */}
            <div className="px-4 sm:px-0">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Points History
                  </button>
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className={`${
                      activeTab === 'rewards'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Rewards
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`${
                      activeTab === 'leaderboard'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Leaderboard
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 py-6 sm:px-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'history' && (
                    <PointsHistory transactions={transactions} />
                  )}
                  
                  {activeTab === 'rewards' && (
                    <PointsRewards 
                      rewards={rewards} 
                      balance={balance} 
                      onRedeemSuccess={refreshPoints}
                    />
                  )}
                  
                  {activeTab === 'leaderboard' && (
                    <PointsLeaderboard 
                      entries={leaderboard} 
                      userRank={userRank}
                    />
                  )}
                </>
              )}
            </div>
            
            {/* How to Earn Points */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">How to Earn Points</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Complete these actions to earn more points
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Daily Login</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        5 points per day
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Complete Profile</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        50 points
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Verification</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        200 points
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Refer a Friend</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        100 points per referral
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Complete a Booking</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        50 points per booking
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Submit a Review</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        25 points per review
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PointsDashboard;
