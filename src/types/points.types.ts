/**
 * Points system types
 */

export type PointsTransactionType = 
  | 'earned'      // Points earned through actions
  | 'spent'       // Points spent on rewards
  | 'expired'     // Points that have expired
  | 'adjusted';   // Manual adjustment by admin

export type PointsTransactionStatus =
  | 'pending'     // Transaction is pending processing
  | 'completed'   // Transaction has been completed
  | 'failed'      // Transaction processing failed
  | 'reversed';   // Transaction has been reversed

export interface PointsTransaction {
  id: string;
  user_id: string;
  points_amount: number;
  transaction_type: PointsTransactionType;
  transaction_status: PointsTransactionStatus;
  description: string;
  source: string;
  reference_id?: string;
  created_at: string;
  processed_at?: string;
}

export interface PointsBalance {
  total_earned: number;
  total_spent: number;
  total_expired: number;
  total_adjusted: number;
  current_balance: number;
  pending_points: number;
}

export interface PointsReward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  reward_value: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
}

export interface UserPointsReward {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'redeemed' | 'expired';
  created_at: string;
  redeemed_at?: string;
  reward?: PointsReward;
}

export interface PointsLeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  user_type: string;
  points: number;
  rank: number;
}

export interface PointsConfig {
  points_expiration_days: number;
  min_points_for_redemption: number;
  welcome_bonus_points: number;
  referral_bonus_points: number;
  verification_bonus_points: number;
  daily_login_points: number;
  booking_completion_points: number;
  review_submission_points: number;
  profile_completion_points: number;
}
