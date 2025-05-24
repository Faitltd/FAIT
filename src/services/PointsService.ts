import { supabase } from '../lib/supabase';
import { 
  PointsTransaction, 
  PointsBalance, 
  PointsReward, 
  UserPointsReward,
  PointsLeaderboardEntry,
  PointsConfig
} from '../types/points.types';

/**
 * Service for handling points system
 */
export class PointsService {
  /**
   * Get points configuration
   * @returns Points configuration
   */
  async getPointsConfig(): Promise<PointsConfig> {
    try {
      const { data, error } = await supabase
        .from('points_config')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching points config:', error);
        // Return default values if not found
        return {
          points_expiration_days: 365,
          min_points_for_redemption: 100,
          welcome_bonus_points: 100,
          referral_bonus_points: 100,
          verification_bonus_points: 200,
          daily_login_points: 5,
          booking_completion_points: 50,
          review_submission_points: 25,
          profile_completion_points: 50
        };
      }

      return data as PointsConfig;
    } catch (error) {
      console.error('Error in getPointsConfig:', error);
      // Return default values on error
      return {
        points_expiration_days: 365,
        min_points_for_redemption: 100,
        welcome_bonus_points: 100,
        referral_bonus_points: 100,
        verification_bonus_points: 200,
        daily_login_points: 5,
        booking_completion_points: 50,
        review_submission_points: 25,
        profile_completion_points: 50
      };
    }
  }

  /**
   * Get user's points balance
   * @param userId User ID
   * @returns Points balance
   */
  async getUserPointsBalance(userId: string): Promise<PointsBalance> {
    try {
      const { data, error } = await supabase.rpc('get_user_points_balance', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user points balance:', error);
        return {
          total_earned: 0,
          total_spent: 0,
          total_expired: 0,
          total_adjusted: 0,
          current_balance: 0,
          pending_points: 0
        };
      }

      return data as PointsBalance;
    } catch (error) {
      console.error('Error in getUserPointsBalance:', error);
      return {
        total_earned: 0,
        total_spent: 0,
        total_expired: 0,
        total_adjusted: 0,
        current_balance: 0,
        pending_points: 0
      };
    }
  }

  /**
   * Get user's points transactions
   * @param userId User ID
   * @param limit Number of transactions to return
   * @param offset Offset for pagination
   * @returns List of points transactions
   */
  async getUserPointsTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PointsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching user points transactions:', error);
        return [];
      }

      return data as PointsTransaction[];
    } catch (error) {
      console.error('Error in getUserPointsTransactions:', error);
      return [];
    }
  }

  /**
   * Award points to a user
   * @param userId User ID
   * @param amount Points amount
   * @param description Description of the transaction
   * @param source Source of the points
   * @param referenceId Reference ID (optional)
   * @returns Created points transaction
   */
  async awardPoints(
    userId: string,
    amount: number,
    description: string,
    source: string,
    referenceId?: string
  ): Promise<PointsTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .insert([
          {
            user_id: userId,
            points_amount: amount,
            transaction_type: 'earned',
            transaction_status: 'completed',
            description,
            source,
            reference_id: referenceId,
            processed_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error awarding points:', error);
        return null;
      }

      return data as PointsTransaction;
    } catch (error) {
      console.error('Error in awardPoints:', error);
      return null;
    }
  }

  /**
   * Spend points from a user
   * @param userId User ID
   * @param amount Points amount
   * @param description Description of the transaction
   * @param source Source of the points spending
   * @param referenceId Reference ID (optional)
   * @returns Created points transaction
   */
  async spendPoints(
    userId: string,
    amount: number,
    description: string,
    source: string,
    referenceId?: string
  ): Promise<PointsTransaction | null> {
    try {
      // Check if user has enough points
      const balance = await this.getUserPointsBalance(userId);
      if (balance.current_balance < amount) {
        throw new Error('Insufficient points balance');
      }

      const { data, error } = await supabase
        .from('points_transactions')
        .insert([
          {
            user_id: userId,
            points_amount: amount,
            transaction_type: 'spent',
            transaction_status: 'completed',
            description,
            source,
            reference_id: referenceId,
            processed_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error spending points:', error);
        return null;
      }

      return data as PointsTransaction;
    } catch (error) {
      console.error('Error in spendPoints:', error);
      return null;
    }
  }

  /**
   * Get available rewards
   * @returns List of available rewards
   */
  async getAvailableRewards(): Promise<PointsReward[]> {
    try {
      const { data, error } = await supabase
        .from('points_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true });

      if (error) {
        console.error('Error fetching available rewards:', error);
        return [];
      }

      return data as PointsReward[];
    } catch (error) {
      console.error('Error in getAvailableRewards:', error);
      return [];
    }
  }

  /**
   * Get user's redeemed rewards
   * @param userId User ID
   * @returns List of user's redeemed rewards
   */
  async getUserRewards(userId: string): Promise<UserPointsReward[]> {
    try {
      const { data, error } = await supabase
        .from('user_points_rewards')
        .select(`
          *,
          reward:points_rewards(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user rewards:', error);
        return [];
      }

      return data as UserPointsReward[];
    } catch (error) {
      console.error('Error in getUserRewards:', error);
      return [];
    }
  }

  /**
   * Redeem a reward
   * @param userId User ID
   * @param rewardId Reward ID
   * @returns Created user reward
   */
  async redeemReward(
    userId: string,
    rewardId: string
  ): Promise<UserPointsReward | null> {
    try {
      // Get the reward
      const { data: reward, error: rewardError } = await supabase
        .from('points_rewards')
        .select('*')
        .eq('id', rewardId)
        .eq('is_active', true)
        .single();

      if (rewardError || !reward) {
        console.error('Error fetching reward:', rewardError);
        return null;
      }

      // Check if user has enough points
      const balance = await this.getUserPointsBalance(userId);
      if (balance.current_balance < reward.points_cost) {
        throw new Error('Insufficient points balance');
      }

      // Start a transaction
      const { data, error } = await supabase.rpc('redeem_points_reward', {
        p_user_id: userId,
        p_reward_id: rewardId,
        p_points_cost: reward.points_cost
      });

      if (error) {
        console.error('Error redeeming reward:', error);
        return null;
      }

      // Get the created user reward
      const { data: userReward, error: userRewardError } = await supabase
        .from('user_points_rewards')
        .select(`
          *,
          reward:points_rewards(*)
        `)
        .eq('user_id', userId)
        .eq('reward_id', rewardId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (userRewardError) {
        console.error('Error fetching user reward:', userRewardError);
        return null;
      }

      return userReward as UserPointsReward;
    } catch (error) {
      console.error('Error in redeemReward:', error);
      return null;
    }
  }

  /**
   * Get points leaderboard
   * @param limit Number of entries to return
   * @param userType Filter by user type (optional)
   * @returns Leaderboard entries
   */
  async getPointsLeaderboard(
    limit: number = 10,
    userType?: string
  ): Promise<PointsLeaderboardEntry[]> {
    try {
      let query = supabase.rpc('get_points_leaderboard', {
        p_limit: limit
      });

      if (userType) {
        query = query.eq('user_type', userType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching points leaderboard:', error);
        return [];
      }

      return data as PointsLeaderboardEntry[];
    } catch (error) {
      console.error('Error in getPointsLeaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's rank on the leaderboard
   * @param userId User ID
   * @returns User's rank and points
   */
  async getUserLeaderboardRank(
    userId: string
  ): Promise<{ rank: number; points: number } | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_leaderboard_rank', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user leaderboard rank:', error);
        return null;
      }

      return data as { rank: number; points: number };
    } catch (error) {
      console.error('Error in getUserLeaderboardRank:', error);
      return null;
    }
  }

  /**
   * Award daily login points
   * @param userId User ID
   * @returns Created points transaction
   */
  async awardDailyLoginPoints(userId: string): Promise<PointsTransaction | null> {
    try {
      const config = await this.getPointsConfig();
      return this.awardPoints(
        userId,
        config.daily_login_points,
        'Daily login bonus',
        'login'
      );
    } catch (error) {
      console.error('Error in awardDailyLoginPoints:', error);
      return null;
    }
  }

  /**
   * Award profile completion points
   * @param userId User ID
   * @returns Created points transaction
   */
  async awardProfileCompletionPoints(userId: string): Promise<PointsTransaction | null> {
    try {
      const config = await this.getPointsConfig();
      return this.awardPoints(
        userId,
        config.profile_completion_points,
        'Profile completion bonus',
        'profile_completion'
      );
    } catch (error) {
      console.error('Error in awardProfileCompletionPoints:', error);
      return null;
    }
  }

  /**
   * Award verification points
   * @param userId User ID
   * @returns Created points transaction
   */
  async awardVerificationPoints(userId: string): Promise<PointsTransaction | null> {
    try {
      const config = await this.getPointsConfig();
      return this.awardPoints(
        userId,
        config.verification_bonus_points,
        'Verification bonus',
        'verification'
      );
    } catch (error) {
      console.error('Error in awardVerificationPoints:', error);
      return null;
    }
  }

  /**
   * Award booking completion points
   * @param userId User ID
   * @param bookingId Booking ID
   * @returns Created points transaction
   */
  async awardBookingCompletionPoints(
    userId: string,
    bookingId: string
  ): Promise<PointsTransaction | null> {
    try {
      const config = await this.getPointsConfig();
      return this.awardPoints(
        userId,
        config.booking_completion_points,
        'Booking completion bonus',
        'booking_completion',
        bookingId
      );
    } catch (error) {
      console.error('Error in awardBookingCompletionPoints:', error);
      return null;
    }
  }

  /**
   * Award review submission points
   * @param userId User ID
   * @param reviewId Review ID
   * @returns Created points transaction
   */
  async awardReviewSubmissionPoints(
    userId: string,
    reviewId: string
  ): Promise<PointsTransaction | null> {
    try {
      const config = await this.getPointsConfig();
      return this.awardPoints(
        userId,
        config.review_submission_points,
        'Review submission bonus',
        'review_submission',
        reviewId
      );
    } catch (error) {
      console.error('Error in awardReviewSubmissionPoints:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const pointsService = new PointsService();
