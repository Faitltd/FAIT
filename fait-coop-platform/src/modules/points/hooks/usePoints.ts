import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { pointsService } from '../../../services/PointsService';
import { 
  PointsBalance, 
  PointsTransaction, 
  PointsReward, 
  UserPointsReward,
  PointsLeaderboardEntry,
  PointsConfig
} from '../../../types/points.types';

/**
 * Hook for accessing points functionality
 */
export const usePoints = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<PointsBalance>({
    total_earned: 0,
    total_spent: 0,
    total_expired: 0,
    total_adjusted: 0,
    current_balance: 0,
    pending_points: 0
  });
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [rewards, setRewards] = useState<PointsReward[]>([]);
  const [userRewards, setUserRewards] = useState<UserPointsReward[]>([]);
  const [leaderboard, setLeaderboard] = useState<PointsLeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; points: number } | null>(null);
  const [config, setConfig] = useState<PointsConfig | null>(null);

  // Fetch points data
  const fetchPointsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get points balance
      const balanceData = await pointsService.getUserPointsBalance(user.id);
      setBalance(balanceData);
      
      // Get transactions
      const transactionsData = await pointsService.getUserPointsTransactions(user.id);
      setTransactions(transactionsData);
      
      // Get available rewards
      const rewardsData = await pointsService.getAvailableRewards();
      setRewards(rewardsData);
      
      // Get user rewards
      const userRewardsData = await pointsService.getUserRewards(user.id);
      setUserRewards(userRewardsData);
      
      // Get leaderboard
      const leaderboardData = await pointsService.getPointsLeaderboard();
      setLeaderboard(leaderboardData);
      
      // Get user rank
      const userRankData = await pointsService.getUserLeaderboardRank(user.id);
      setUserRank(userRankData);
      
      // Get points config
      const configData = await pointsService.getPointsConfig();
      setConfig(configData);
    } catch (err: any) {
      console.error('Error fetching points data:', err);
      setError(err.message || 'Failed to load points data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch points data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchPointsData();
    } else {
      setIsLoading(false);
      setBalance({
        total_earned: 0,
        total_spent: 0,
        total_expired: 0,
        total_adjusted: 0,
        current_balance: 0,
        pending_points: 0
      });
      setTransactions([]);
      setRewards([]);
      setUserRewards([]);
      setLeaderboard([]);
      setUserRank(null);
      setConfig(null);
    }
  }, [user]);

  // Award points
  const awardPoints = async (
    amount: number,
    description: string,
    source: string,
    referenceId?: string
  ) => {
    if (!user) return null;
    
    try {
      const result = await pointsService.awardPoints(
        user.id,
        amount,
        description,
        source,
        referenceId
      );
      
      if (result) {
        // Refresh points data
        fetchPointsData();
      }
      
      return result;
    } catch (err) {
      console.error('Error awarding points:', err);
      return null;
    }
  };

  // Spend points
  const spendPoints = async (
    amount: number,
    description: string,
    source: string,
    referenceId?: string
  ) => {
    if (!user) return null;
    
    try {
      const result = await pointsService.spendPoints(
        user.id,
        amount,
        description,
        source,
        referenceId
      );
      
      if (result) {
        // Refresh points data
        fetchPointsData();
      }
      
      return result;
    } catch (err) {
      console.error('Error spending points:', err);
      return null;
    }
  };

  // Redeem reward
  const redeemReward = async (rewardId: string) => {
    if (!user) return null;
    
    try {
      const result = await pointsService.redeemReward(user.id, rewardId);
      
      if (result) {
        // Refresh points data
        fetchPointsData();
      }
      
      return result;
    } catch (err) {
      console.error('Error redeeming reward:', err);
      return null;
    }
  };

  // Refresh points data
  const refreshPoints = () => {
    fetchPointsData();
  };

  return {
    isLoading,
    error,
    balance,
    transactions,
    rewards,
    userRewards,
    leaderboard,
    userRank,
    config,
    awardPoints,
    spendPoints,
    redeemReward,
    refreshPoints
  };
};
