import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Gift,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { Reward, TokenBalance } from '../../types/token';
import { tokenService } from '../../services/TokenService';

interface RewardsListProps {
  userId: string;
  onRedeemSuccess?: () => void;
  className?: string;
}

const RewardsList: React.FC<RewardsListProps> = ({
  userId,
  onRedeemSuccess,
  className = ''
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cost' | 'name'>('cost');
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);

  useEffect(() => {
    fetchRewards();
    fetchBalance();
  }, [userId]);

  useEffect(() => {
    filterAndSortRewards();
  }, [rewards, searchTerm, sortBy]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const data = await tokenService.getRewards(true);
      setRewards(data);
      setError(null);
    } catch (err) {
      setError('Failed to load rewards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const data = await tokenService.getTokenBalance(userId);
      setBalance(data);
    } catch (err) {
      console.error('Failed to load token balance:', err);
    }
  };

  const filterAndSortRewards = () => {
    let filtered = [...rewards];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reward =>
        reward.name.toLowerCase().includes(term) ||
        (reward.description && reward.description.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    if (sortBy === 'cost') {
      filtered.sort((a, b) => a.token_cost - b.token_cost);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRewards(filtered);
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      setRedeemSuccess(null);
      setRedeemError(null);

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }

      if (!balance || balance.balance < reward.token_cost) {
        throw new Error('Insufficient token balance');
      }

      const result = await tokenService.redeemReward(userId, rewardId);

      if (!result) {
        throw new Error('Failed to redeem reward');
      }

      setRedeemSuccess(`Successfully redeemed ${reward.name}`);

      // Refresh balance
      fetchBalance();

      // Call the success callback if provided
      if (onRedeemSuccess) {
        onRedeemSuccess();
      }
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setRedeemError(err instanceof Error ? err.message : 'Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  const isAvailable = (reward: Reward) => {
    // Check quantity
    if (reward.quantity_available !== null && reward.quantity_available <= 0) {
      return false;
    }

    // Check date range
    const now = new Date();
    if (reward.start_date && new Date(reward.start_date) > now) {
      return false;
    }
    if (reward.end_date && new Date(reward.end_date) < now) {
      return false;
    }

    return true;
  };

  const canAfford = (reward: Reward) => {
    return balance && balance.balance >= reward.token_cost;
  };

  if (loading) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Available Rewards</h3>
        <p className="mt-1 text-sm text-gray-500">
          Redeem your tokens for these exclusive rewards
        </p>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rewards..."
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <label htmlFor="sort-by" className="text-sm text-gray-700 mr-2">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'cost' | 'name')}
              className="focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md text-sm"
            >
              <option value="cost">Token Cost</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {redeemSuccess && (
        <div className="p-3 bg-green-50 border-b border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700">{redeemSuccess}</span>
          </div>
        </div>
      )}

      {redeemError && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{redeemError}</span>
          </div>
        </div>
      )}

      {filteredRewards.length === 0 ? (
        <div className="p-8 text-center">
          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No rewards match your search criteria.' : 'No rewards are currently available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredRewards.map((reward) => {
            const available = isAvailable(reward);
            const affordable = canAfford(reward);

            return (
              <div
                key={reward.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {reward.image_url ? (
                  <div className="h-40 bg-gray-200 relative">
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                    {!available && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium px-2 py-1 rounded-md bg-red-500">
                          Not Available
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <Gift className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-gray-900">{reward.name}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {reward.token_cost} tokens
                    </span>
                  </div>

                  {reward.description && (
                    <p className="mt-1 text-xs text-gray-500">{reward.description}</p>
                  )}

                  {reward.quantity_available !== null && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <span>
                        {reward.quantity_available > 0
                          ? `${reward.quantity_available} remaining`
                          : 'Out of stock'}
                      </span>
                    </div>
                  )}

                  {(reward.start_date || reward.end_date) && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {reward.start_date && `From ${new Date(reward.start_date).toLocaleDateString()}`}
                        {reward.start_date && reward.end_date && ' to '}
                        {reward.end_date && `${new Date(reward.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={!available || !affordable || redeeming === reward.id}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                        available && affordable
                          ? 'text-white bg-primary-500 hover:bg-primary-600'
                          : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                    >
                      {redeeming === reward.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Redeeming...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {available && affordable
                            ? 'Redeem'
                            : !affordable
                              ? 'Not enough tokens'
                              : 'Not available'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RewardsList;
