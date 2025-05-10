import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import TokenBalanceDisplay from '../components/tokens/TokenBalanceDisplay';
import RewardsList from '../components/tokens/RewardsList';
import BadgesDisplay from '../components/tokens/BadgesDisplay';

const TokensPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'balance' | 'rewards' | 'badges'>('balance');
  const [rewardRedeemed, setRewardRedeemed] = useState(false);

  useEffect(() => {
    // Reset the reward redeemed flag after a short delay
    if (rewardRedeemed) {
      const timer = setTimeout(() => {
        setRewardRedeemed(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [rewardRedeemed]);

  const handleRewardRedeemed = () => {
    setRewardRedeemed(true);
  };

  if (!user) {
    return (
      <ResponsiveLayout title="Tokens & Rewards">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please log in to access tokens and rewards.
              </p>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Tokens & Rewards">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tokens & Rewards</h1>
        <p className="text-gray-500">Earn tokens for your activities and redeem them for rewards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <TokenBalanceDisplay 
            userId={user.id} 
            showTransactions={true}
            transactionLimit={3}
          />
        </div>
        
        <div className="lg:col-span-2">
          <BadgesDisplay 
            userId={user.id} 
            editable={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('balance')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'balance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Token History
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'rewards'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rewards
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'badges'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Badges
            </button>
          </nav>
        </div>
        
        <div>
          {activeTab === 'balance' && (
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Token Transaction History</h2>
              <TokenBalanceDisplay 
                userId={user.id} 
                showTransactions={true}
                transactionLimit={10}
              />
            </div>
          )}
          
          {activeTab === 'rewards' && (
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Available Rewards</h2>
              <RewardsList 
                userId={user.id} 
                onRedeemSuccess={handleRewardRedeemed}
              />
            </div>
          )}
          
          {activeTab === 'badges' && (
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Badges</h2>
              <BadgesDisplay 
                userId={user.id} 
                editable={true}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">How to Earn Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Complete Projects</h3>
            <p className="text-xs text-gray-500">
              Earn 50 tokens for each successfully completed project.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Write Reviews</h3>
            <p className="text-xs text-gray-500">
              Earn 10 tokens for each review you submit after a completed project.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Refer Members</h3>
            <p className="text-xs text-gray-500">
              Earn 100 tokens for each new member who joins through your referral.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Attend Events</h3>
            <p className="text-xs text-gray-500">
              Earn 15 tokens for each community event you attend.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Civic Participation</h3>
            <p className="text-xs text-gray-500">
              Earn 25 tokens for participating in cooperative governance activities.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Earn Badges</h3>
            <p className="text-xs text-gray-500">
              Many badges come with token rewards when you earn them.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default TokensPage;
