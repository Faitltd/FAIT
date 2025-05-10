import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Clock
} from 'lucide-react';
import { TokenBalance, TokenTransaction } from '../../types/token';
import { tokenService } from '../../services/TokenService';

interface TokenBalanceDisplayProps {
  userId: string;
  showTransactions?: boolean;
  transactionLimit?: number;
  className?: string;
}

const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({ 
  userId, 
  showTransactions = true,
  transactionLimit = 5,
  className = ''
}) => {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTokenData();
  }, [userId]);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      const balanceData = await tokenService.getTokenBalance(userId);
      setBalance(balanceData);
      
      if (showTransactions) {
        const transactionsData = await tokenService.getTokenTransactions(userId, transactionLimit);
        setTransactions(transactionsData);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load token data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchTokenData();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'project_completion':
        return 'Project Completion';
      case 'review_submission':
        return 'Review Submission';
      case 'referral_bonus':
        return 'Referral Bonus';
      case 'reward_redemption':
        return 'Reward Redemption';
      case 'badge_reward':
        return 'Badge Reward';
      case 'daily_login':
        return 'Daily Login';
      case 'profile_completion':
        return 'Profile Completion';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
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
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Token Balance</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`text-gray-400 hover:text-gray-500 ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">{balance?.balance || 0}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Earned: {balance?.lifetime_earned || 0}</span>
            </div>
            <div className="flex items-center justify-end text-sm text-red-600 mt-1">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>Spent: {balance?.lifetime_spent || 0}</span>
            </div>
          </div>
        </div>
        
        {balance?.last_updated && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last updated: {formatDate(balance.last_updated)}</span>
          </div>
        )}
      </div>

      {showTransactions && transactions.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700">Recent Transactions</h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getTransactionTypeDisplay(transaction.transaction_type)}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-gray-500">{transaction.description}</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {transactions.length >= transactionLimit && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => window.location.href = '/tokens/transactions'}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All Transactions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenBalanceDisplay;
