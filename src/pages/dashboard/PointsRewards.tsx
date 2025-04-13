import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  Star,
  Award,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type PointsTransaction = Database['public']['Tables']['points_transactions']['Row'];

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'service' | 'merchandise';
  value: number;
  icon: React.ReactNode;
}

const REWARDS: Reward[] = [
  {
    id: 'service-discount-10',
    title: '10% Off Next Service',
    description: 'Get 10% off your next service booking',
    pointsCost: 1000,
    type: 'discount',
    value: 10,
    icon: <DollarSign className="h-6 w-6 text-green-500" />,
  },
  {
    id: 'service-discount-25',
    title: '25% Off Next Service',
    description: 'Get 25% off your next service booking',
    pointsCost: 2500,
    type: 'discount',
    value: 25,
    icon: <DollarSign className="h-6 w-6 text-green-500" />,
  },
  {
    id: 'priority-service',
    title: 'Priority Service',
    description: 'Get priority scheduling for your next service',
    pointsCost: 1500,
    type: 'service',
    value: 0,
    icon: <Clock className="h-6 w-6 text-blue-500" />,
  },
  {
    id: 'maintenance-check',
    title: 'Free Maintenance Check',
    description: 'Get a free maintenance inspection',
    pointsCost: 2000,
    type: 'service',
    value: 0,
    icon: <CheckCircle className="h-6 w-6 text-purple-500" />,
  },
  {
    id: 'fait-merch',
    title: 'FAIT Co-Op Merchandise',
    description: 'Get exclusive FAIT Co-Op branded merchandise',
    pointsCost: 3000,
    type: 'merchandise',
    value: 0,
    icon: <Gift className="h-6 w-6 text-red-500" />,
  },
];

const PointsRewards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [confirmingRedemption, setConfirmingRedemption] = useState(false);

  useEffect(() => {
    const fetchPointsData = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch points transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('points_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (transactionsError) throw transactionsError;

        setTransactions(transactionsData);

        // Calculate total points
        const totalPoints = transactionsData.reduce((sum, transaction) => {
          return transaction.transaction_type === 'earned'
            ? sum + transaction.points_amount
            : sum - transaction.points_amount;
        }, 0);

        setPoints(totalPoints);
      } catch (err) {
        console.error('Error fetching points data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load points data');
      } finally {
        setLoading(false);
      }
    };

    fetchPointsData();
  }, [user, navigate]);

  const handleRedeemPoints = async (reward: Reward) => {
    if (points < reward.pointsCost) {
      setError('Insufficient points for this reward');
      return;
    }

    try {
      setConfirmingRedemption(true);

      // Create redemption transaction
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: user?.id,
          points_amount: reward.pointsCost,
          transaction_type: 'spent',
          description: `Redeemed for ${reward.title}`,
        });

      if (transactionError) throw transactionError;

      // Update local state
      setPoints(prev => prev - reward.pointsCost);
      setTransactions(prev => [
        {
          id: crypto.randomUUID(),
          user_id: user?.id || '',
          points_amount: reward.pointsCost,
          transaction_type: 'spent',
          description: `Redeemed for ${reward.title}`,
          created_at: new Date().toISOString(),
          booking_id: null,
        },
        ...prev,
      ]);

      // Reset UI state
      setSelectedReward(null);
      setConfirmingRedemption(false);
    } catch (err) {
      console.error('Error redeeming points:', err);
      setError(err instanceof Error ? err.message : 'Failed to redeem points');
      setConfirmingRedemption(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Points & Rewards</h1>
        <p className="mt-1 text-sm text-gray-500">
          Earn and redeem points for exclusive rewards and discounts
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Points Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Available Points</h2>
            <p className="mt-1 text-3xl font-bold text-blue-600">{points}</p>
          </div>
          <Award className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REWARDS.map((reward) => (
            <div
              key={reward.id}
              className={`bg-white rounded-lg shadow-sm p-6 ${
                points >= reward.pointsCost
                  ? 'cursor-pointer hover:shadow-md transition-shadow'
                  : 'opacity-50'
              }`}
              onClick={() => {
                if (points >= reward.pointsCost) {
                  setSelectedReward(reward);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{reward.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{reward.description}</p>
                </div>
                {reward.icon}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {reward.pointsCost} points
                  </span>
                </div>
                {points >= reward.pointsCost && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRedeemPoints(reward);
                    }}
                    disabled={confirmingRedemption}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {confirmingRedemption ? 'Redeeming...' : 'Redeem'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Points History</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        transaction.transaction_type === 'earned'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.transaction_type === 'earned' ? '+' : '-'}
                      {transaction.points_amount} points
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsRewards;