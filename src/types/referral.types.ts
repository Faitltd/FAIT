/**
 * Referral system types
 */

export type ReferralStatus = 
  | 'pending'      // Referral link used but user hasn't completed verification/transaction
  | 'converted'    // Referred user has completed the required action
  | 'rewarded'     // Reward has been issued to the referrer
  | 'expired';     // Referral has expired

export type ReferralRewardStatus =
  | 'pending'      // Reward is pending processing
  | 'processed'    // Reward has been processed
  | 'failed';      // Reward processing failed

export type ReferralRewardType =
  | 'points'       // Points reward
  | 'credit'       // Account credit
  | 'discount';    // Discount on services

export type ReferralUserType =
  | 'client'       // Client user type
  | 'service_agent'; // Service agent user type

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: ReferralStatus;
  referred_user_type: ReferralUserType;
  created_at: string;
  converted_at?: string;
  referrer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  referred?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface ReferralReward {
  id: string;
  referral_id: string;
  user_id: string;
  reward_type: ReferralRewardType;
  reward_amount: number;
  status: ReferralRewardStatus;
  created_at: string;
  processed_at?: string;
}

export interface ReferralConversion {
  id: string;
  referral_id: string;
  conversion_type: string;
  conversion_value?: number;
  created_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  converted_referrals: number;
  conversion_rate: number;
  total_rewards: number;
  total_reward_value: number;
}

export interface ReferralProgram {
  client_reward_amount: number;
  service_agent_reward_amount: number;
  referred_client_reward_amount: number;
  referred_service_agent_reward_amount: number;
  reward_type: ReferralRewardType;
  expiration_days: number;
  terms_and_conditions: string;
}
