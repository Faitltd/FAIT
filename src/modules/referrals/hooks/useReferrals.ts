import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { referralService } from '../../../services/ReferralService';
import { 
  ReferralCode, 
  Referral, 
  ReferralReward, 
  ReferralStats,
  ReferralProgram
} from '../../../types/referral.types';

/**
 * Hook for accessing referral functionality
 */
export const useReferrals = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    pending_referrals: 0,
    converted_referrals: 0,
    conversion_rate: 0,
    total_rewards: 0,
    total_reward_value: 0
  });
  const [referralProgram, setReferralProgram] = useState<ReferralProgram | null>(null);
  const [userReferral, setUserReferral] = useState<Referral | null>(null);

  // Fetch referral data
  const fetchReferralData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get referral code
      const code = await referralService.getUserReferralCode(user.id);
      setReferralCode(code);
      
      // Get referrals made
      const referralsData = await referralService.getReferralsMade(user.id);
      setReferrals(referralsData);
      
      // Get rewards
      const rewardsData = await referralService.getUserRewards(user.id);
      setRewards(rewardsData);
      
      // Get stats
      const statsData = await referralService.getUserReferralStats(user.id);
      setStats(statsData);
      
      // Get referral program
      const programData = await referralService.getReferralProgram();
      setReferralProgram(programData);
      
      // Get user's referral
      const userReferralData = await referralService.getUserReferral(user.id);
      setUserReferral(userReferralData);
    } catch (err: any) {
      console.error('Error fetching referral data:', err);
      setError(err.message || 'Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch referral data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchReferralData();
    } else {
      setIsLoading(false);
      setReferralCode(null);
      setReferrals([]);
      setRewards([]);
      setStats({
        total_referrals: 0,
        pending_referrals: 0,
        converted_referrals: 0,
        conversion_rate: 0,
        total_rewards: 0,
        total_reward_value: 0
      });
      setReferralProgram(null);
      setUserReferral(null);
    }
  }, [user]);

  // Generate referral link
  const getReferralLink = () => {
    if (!referralCode) return '';
    return referralService.generateReferralLink(referralCode.code);
  };

  // Refresh referral data
  const refreshReferrals = () => {
    fetchReferralData();
  };

  return {
    isLoading,
    error,
    referralCode,
    referrals,
    rewards,
    stats,
    referralProgram,
    userReferral,
    getReferralLink,
    refreshReferrals
  };
};
