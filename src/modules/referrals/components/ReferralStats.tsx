import React from 'react';
import { ReferralStats as ReferralStatsType } from '../../../types/referral.types';

interface ReferralStatsProps {
  stats: ReferralStatsType;
  className?: string;
}

/**
 * Component to display referral statistics
 */
const ReferralStats: React.FC<ReferralStatsProps> = ({ 
  stats,
  className = ''
}) => {
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Referral Statistics</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Referrals
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.total_referrals)}
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Converted Referrals
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.converted_referrals)}
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Conversion Rate
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatPercent(stats.conversion_rate)}
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Referrals
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.pending_referrals)}
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Rewards
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.total_rewards)}
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Reward Value
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.total_reward_value)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralStats;
