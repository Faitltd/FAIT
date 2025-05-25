import { supabase } from '../lib/supabase';
import { 
  Referral, 
  ReferralCode, 
  ReferralReward, 
  ReferralStats,
  ReferralProgram,
  ReferralStatus,
  ReferralUserType,
  ReferralRewardType
} from '../types/referral.types';

/**
 * Service for handling referrals
 */
export class ReferralService {
  /**
   * Get referral program details
   * @returns Referral program details
   */
  async getReferralProgram(): Promise<ReferralProgram> {
    try {
      const { data, error } = await supabase
        .from('referral_program')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching referral program:', error);
        // Return default values if not found
        return {
          client_reward_amount: 100,
          service_agent_reward_amount: 200,
          referred_client_reward_amount: 50,
          referred_service_agent_reward_amount: 50,
          reward_type: 'points',
          expiration_days: 30,
          terms_and_conditions: 'Standard terms and conditions apply.'
        };
      }

      return data as ReferralProgram;
    } catch (error) {
      console.error('Error in getReferralProgram:', error);
      // Return default values on error
      return {
        client_reward_amount: 100,
        service_agent_reward_amount: 200,
        referred_client_reward_amount: 50,
        referred_service_agent_reward_amount: 50,
        reward_type: 'points',
        expiration_days: 30,
        terms_and_conditions: 'Standard terms and conditions apply.'
      };
    }
  }

  /**
   * Get user's referral code
   * @param userId User ID
   * @returns Referral code
   */
  async getUserReferralCode(userId: string): Promise<ReferralCode | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No referral code found, create one
          return this.createReferralCode(userId);
        }
        console.error('Error fetching referral code:', error);
        return null;
      }

      return data as ReferralCode;
    } catch (error) {
      console.error('Error in getUserReferralCode:', error);
      return null;
    }
  }

  /**
   * Create a referral code for a user
   * @param userId User ID
   * @returns Created referral code
   */
  async createReferralCode(userId: string): Promise<ReferralCode | null> {
    try {
      // Generate a random code
      const code = this.generateReferralCode();

      const { data, error } = await supabase
        .from('referral_codes')
        .insert([
          { user_id: userId, code }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating referral code:', error);
        return null;
      }

      return data as ReferralCode;
    } catch (error) {
      console.error('Error in createReferralCode:', error);
      return null;
    }
  }

  /**
   * Generate a random referral code
   * @returns Random referral code
   */
  private generateReferralCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Get referral by code
   * @param code Referral code
   * @returns Referral if found
   */
  async getReferralByCode(code: string): Promise<{ referrerId: string } | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('user_id')
        .eq('code', code)
        .single();

      if (error) {
        console.error('Error fetching referral by code:', error);
        return null;
      }

      return { referrerId: data.user_id };
    } catch (error) {
      console.error('Error in getReferralByCode:', error);
      return null;
    }
  }

  /**
   * Track a referral
   * @param referrerId Referrer user ID
   * @param referredId Referred user ID
   * @param referralCode Referral code used
   * @param userType Type of referred user
   * @returns Created referral
   */
  async trackReferral(
    referrerId: string,
    referredId: string,
    referralCode: string,
    userType: ReferralUserType
  ): Promise<Referral | null> {
    try {
      // Check if the referred user already has a referral
      const { data: existingReferral, error: checkError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', referredId)
        .single();

      if (!checkError && existingReferral) {
        console.log('User already has a referral:', existingReferral);
        return existingReferral as Referral;
      }

      // Create the referral
      const { data, error } = await supabase
        .from('referrals')
        .insert([
          {
            referrer_id: referrerId,
            referred_id: referredId,
            referral_code: referralCode,
            referred_user_type: userType,
            status: 'pending'
          }
        ])
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey(id, first_name, last_name, email, avatar_url),
          referred:profiles!referrals_referred_id_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error tracking referral:', error);
        return null;
      }

      return data as Referral;
    } catch (error) {
      console.error('Error in trackReferral:', error);
      return null;
    }
  }

  /**
   * Get referrals made by a user
   * @param userId User ID
   * @returns List of referrals
   */
  async getReferralsMade(userId: string): Promise<Referral[]> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:profiles!referrals_referred_id_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals made:', error);
        return [];
      }

      return data as Referral[];
    } catch (error) {
      console.error('Error in getReferralsMade:', error);
      return [];
    }
  }

  /**
   * Get referral that brought a user to the platform
   * @param userId User ID
   * @returns Referral if found
   */
  async getUserReferral(userId: string): Promise<Referral | null> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .eq('referred_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No referral found
          return null;
        }
        console.error('Error fetching user referral:', error);
        return null;
      }

      return data as Referral;
    } catch (error) {
      console.error('Error in getUserReferral:', error);
      return null;
    }
  }

  /**
   * Convert a referral
   * @param referralId Referral ID
   * @param conversionType Type of conversion
   * @param conversionValue Value of conversion (optional)
   * @returns Updated referral
   */
  async convertReferral(
    referralId: string,
    conversionType: string,
    conversionValue?: number
  ): Promise<Referral | null> {
    try {
      // Start a transaction
      const { data, error } = await supabase.rpc('convert_referral', {
        p_referral_id: referralId,
        p_conversion_type: conversionType,
        p_conversion_value: conversionValue
      });

      if (error) {
        console.error('Error converting referral:', error);
        return null;
      }

      // Get the updated referral
      return this.getReferralById(referralId);
    } catch (error) {
      console.error('Error in convertReferral:', error);
      return null;
    }
  }

  /**
   * Get a referral by ID
   * @param referralId Referral ID
   * @returns Referral if found
   */
  async getReferralById(referralId: string): Promise<Referral | null> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey(id, first_name, last_name, email, avatar_url),
          referred:profiles!referrals_referred_id_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .eq('id', referralId)
        .single();

      if (error) {
        console.error('Error fetching referral by ID:', error);
        return null;
      }

      return data as Referral;
    } catch (error) {
      console.error('Error in getReferralById:', error);
      return null;
    }
  }

  /**
   * Get rewards for a user
   * @param userId User ID
   * @returns List of rewards
   */
  async getUserRewards(userId: string): Promise<ReferralReward[]> {
    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select(`
          *,
          referral:referrals(
            id,
            referrer_id,
            referred_id,
            referred:profiles!referrals_referred_id_fkey(first_name, last_name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user rewards:', error);
        return [];
      }

      return data as ReferralReward[];
    } catch (error) {
      console.error('Error in getUserRewards:', error);
      return [];
    }
  }

  /**
   * Get referral statistics for a user
   * @param userId User ID
   * @returns Referral statistics
   */
  async getUserReferralStats(userId: string): Promise<ReferralStats> {
    try {
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user referral stats:', error);
        return {
          total_referrals: 0,
          pending_referrals: 0,
          converted_referrals: 0,
          conversion_rate: 0,
          total_rewards: 0,
          total_reward_value: 0
        };
      }

      return data as ReferralStats;
    } catch (error) {
      console.error('Error in getUserReferralStats:', error);
      return {
        total_referrals: 0,
        pending_referrals: 0,
        converted_referrals: 0,
        conversion_rate: 0,
        total_rewards: 0,
        total_reward_value: 0
      };
    }
  }

  /**
   * Generate a referral link
   * @param code Referral code
   * @returns Referral link
   */
  generateReferralLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${code}`;
  }
}

// Create a singleton instance
export const referralService = new ReferralService();
