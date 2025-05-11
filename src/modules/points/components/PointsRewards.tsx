import React, { useState } from 'react';
import { PointsReward, PointsBalance as PointsBalanceType } from '../../../types/points.types';
import { pointsService } from '../../../services/PointsService';

interface PointsRewardsProps {
  rewards: PointsReward[];
  balance: PointsBalanceType;
  onRedeemSuccess?: () => void;
  className?: string;
}

/**
 * Component to display available rewards
 */
const PointsRewards: React.FC<PointsRewardsProps> = ({ 
  rewards,
  balance,
  onRedeemSuccess,
  className = ''
}) => {
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      setError(null);
      setSuccess(null);

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }

      if (balance.current_balance < reward.points_cost) {
        throw new Error('Insufficient points balance');
      }

      const result = await pointsService.redeemReward(
        // We're assuming the user is authenticated and we have their ID
        // In a real app, you'd get this from your auth context
        'current-user-id',
        rewardId
      );

      if (!result) {
        throw new Error('Failed to redeem reward');
      }

      setSuccess(`Successfully redeemed ${reward.name}`);
      
      // Call the success callback if provided
      if (onRedeemSuccess) {
        onRedeemSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  if (rewards.length === 0) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rewards available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later for available rewards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Available Rewards</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Redeem your points for these rewards
        </p>
      </div>
      
      {error && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mx-4 mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {reward.image_url && (
                <div className="h-48 w-full bg-gray-200">
                  <img
                    src={reward.image_url}
                    alt={reward.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="text-lg font-medium text-gray-900">{reward.name}</h4>
                <p className="mt-1 text-sm text-gray-500">{reward.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-900">{reward.points_cost} points</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRedeem(reward.id)}
                    disabled={balance.current_balance < reward.points_cost || redeeming === reward.id}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                      balance.current_balance >= reward.points_cost
                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                        : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {redeeming === reward.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Redeeming...
                      </>
                    ) : balance.current_balance >= reward.points_cost ? (
                      'Redeem'
                    ) : (
                      'Not enough points'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PointsRewards;
