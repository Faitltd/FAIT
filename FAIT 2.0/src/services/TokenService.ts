import { supabase } from '../lib/supabase';
import { 
  TokenBalance, 
  TokenTransaction, 
  Reward, 
  UserReward,
  Badge,
  UserBadge
} from '../types/token';

/**
 * Service for handling token-related functionality
 */
export class TokenService {
  /**
   * Get token balance for a user
   * @param userId - The ID of the user
   * @returns The token balance data
   */
  async getTokenBalance(userId: string): Promise<TokenBalance | null> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No records found, return default values
          return {
            id: '',
            user_id: userId,
            balance: 0,
            lifetime_earned: 0,
            lifetime_spent: 0,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          };
        }
        console.error('Error fetching token balance:', error);
        return null;
      }

      return data as TokenBalance;
    } catch (error) {
      console.error('Error in getTokenBalance:', error);
      return null;
    }
  }

  /**
   * Get token transactions for a user
   * @param userId - The ID of the user
   * @param limit - Optional limit on number of transactions to return
   * @returns List of token transactions
   */
  async getTokenTransactions(userId: string, limit?: number): Promise<TokenTransaction[]> {
    try {
      let query = supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching token transactions:', error);
        return [];
      }

      return data as TokenTransaction[];
    } catch (error) {
      console.error('Error in getTokenTransactions:', error);
      return [];
    }
  }

  /**
   * Award tokens to a user
   * @param userId - The ID of the user
   * @param amount - The amount of tokens to award
   * @param transactionType - The type of transaction
   * @param referenceId - Optional reference ID
   * @param description - Optional description
   * @returns True if successful, false otherwise
   */
  async awardTokens(
    userId: string,
    amount: number,
    transactionType: string,
    referenceId?: string,
    description?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('award_tokens', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: transactionType,
        p_reference_id: referenceId || null,
        p_description: description || null
      });

      if (error) {
        console.error('Error awarding tokens:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in awardTokens:', error);
      return false;
    }
  }

  /**
   * Spend tokens from a user
   * @param userId - The ID of the user
   * @param amount - The amount of tokens to spend
   * @param transactionType - The type of transaction
   * @param referenceId - Optional reference ID
   * @param description - Optional description
   * @returns True if successful, false otherwise
   */
  async spendTokens(
    userId: string,
    amount: number,
    transactionType: string,
    referenceId?: string,
    description?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('spend_tokens', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: transactionType,
        p_reference_id: referenceId || null,
        p_description: description || null
      });

      if (error) {
        console.error('Error spending tokens:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in spendTokens:', error);
      return false;
    }
  }

  /**
   * Get all available rewards
   * @param activeOnly - Whether to only return active rewards
   * @returns List of rewards
   */
  async getRewards(activeOnly: boolean = true): Promise<Reward[]> {
    try {
      let query = supabase
        .from('rewards')
        .select('*')
        .order('token_cost', { ascending: true });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }

      return data as Reward[];
    } catch (error) {
      console.error('Error in getRewards:', error);
      return [];
    }
  }

  /**
   * Get a specific reward
   * @param rewardId - The ID of the reward
   * @returns The reward data
   */
  async getReward(rewardId: string): Promise<Reward | null> {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

      if (error) {
        console.error('Error fetching reward:', error);
        return null;
      }

      return data as Reward;
    } catch (error) {
      console.error('Error in getReward:', error);
      return null;
    }
  }

  /**
   * Redeem a reward
   * @param userId - The ID of the user
   * @param rewardId - The ID of the reward
   * @returns The ID of the created user reward if successful, null otherwise
   */
  async redeemReward(userId: string, rewardId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_user_id: userId,
        p_reward_id: rewardId
      });

      if (error) {
        console.error('Error redeeming reward:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in redeemReward:', error);
      return null;
    }
  }

  /**
   * Get redeemed rewards for a user
   * @param userId - The ID of the user
   * @returns List of user rewards
   */
  async getUserRewards(userId: string): Promise<UserReward[]> {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          *,
          reward:reward_id(*)
        `)
        .eq('user_id', userId)
        .order('redeemed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user rewards:', error);
        return [];
      }

      return data as UserReward[];
    } catch (error) {
      console.error('Error in getUserRewards:', error);
      return [];
    }
  }

  /**
   * Get all badges
   * @param activeOnly - Whether to only return active badges
   * @returns List of badges
   */
  async getBadges(activeOnly: boolean = true): Promise<Badge[]> {
    try {
      let query = supabase
        .from('badges')
        .select('*')
        .order('name', { ascending: true });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching badges:', error);
        return [];
      }

      return data as Badge[];
    } catch (error) {
      console.error('Error in getBadges:', error);
      return [];
    }
  }

  /**
   * Get badges for a user
   * @param userId - The ID of the user
   * @returns List of user badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badge_id(*)
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (error) {
        console.error('Error fetching user badges:', error);
        return [];
      }

      return data as UserBadge[];
    } catch (error) {
      console.error('Error in getUserBadges:', error);
      return [];
    }
  }

  /**
   * Set a badge as featured for a user
   * @param userBadgeId - The ID of the user badge
   * @param isFeatured - Whether the badge should be featured
   * @returns True if successful, false otherwise
   */
  async setFeaturedBadge(userBadgeId: string, isFeatured: boolean): Promise<boolean> {
    try {
      // First, unfeature all badges for this user
      const { data: userBadge, error: fetchError } = await supabase
        .from('user_badges')
        .select('user_id')
        .eq('id', userBadgeId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching user badge:', fetchError);
        return false;
      }
      
      if (isFeatured) {
        // Unfeature all badges for this user
        const { error: unfeaturedError } = await supabase
          .from('user_badges')
          .update({ is_featured: false })
          .eq('user_id', userBadge.user_id);
        
        if (unfeaturedError) {
          console.error('Error unfeaturing badges:', unfeaturedError);
          return false;
        }
      }
      
      // Update the specified badge
      const { error } = await supabase
        .from('user_badges')
        .update({ is_featured: isFeatured })
        .eq('id', userBadgeId);
      
      if (error) {
        console.error('Error updating badge featured status:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in setFeaturedBadge:', error);
      return false;
    }
  }

  /**
   * Check and award badges for a user
   * @param userId - The ID of the user
   * @returns The number of badges awarded
   */
  async checkAndAwardBadges(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('check_and_award_badges', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error checking and awarding badges:', error);
        return 0;
      }

      return data;
    } catch (error) {
      console.error('Error in checkAndAwardBadges:', error);
      return 0;
    }
  }

  /**
   * Get token leaderboard
   * @param limit - Number of users to return
   * @returns List of users with their token balances
   */
  async getTokenLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select(`
          *,
          user:user_id(id, full_name, avatar_url, user_role)
        `)
        .order('balance', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching token leaderboard:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error in getTokenLeaderboard:', error);
      return [];
    }
  }
}

export const tokenService = new TokenService();
