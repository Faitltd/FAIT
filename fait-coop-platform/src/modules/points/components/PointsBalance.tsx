import React from 'react';
import { PointsBalance as PointsBalanceType } from '../../../types/points.types';

interface PointsBalanceProps {
  balance: PointsBalanceType;
  className?: string;
}

/**
 * Component to display points balance
 */
const PointsBalance: React.FC<PointsBalanceProps> = ({ 
  balance,
  className = ''
}) => {
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Your Points</h3>
        {balance.pending_points > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {formatNumber(balance.pending_points)} pending
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-blue-500 rounded-full p-3">
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-4">
          <div className="text-3xl font-semibold text-gray-900">
            {formatNumber(balance.current_balance)}
          </div>
          <div className="text-sm text-gray-500">Available Points</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-500">Total Earned</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {formatNumber(balance.total_earned)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm font-medium text-gray-500">Total Spent</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {formatNumber(balance.total_spent)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsBalance;
