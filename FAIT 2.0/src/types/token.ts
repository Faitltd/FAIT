import { Profile } from './user';

export type RewardStatus = 'pending' | 'fulfilled' | 'cancelled';
export type BadgeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TokenBalance {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  last_updated: string;
  created_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  token_cost: number;
  is_active: boolean;
  quantity_available: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
  status: RewardStatus;
  fulfilled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  reward?: Reward;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  category: string;
  difficulty: BadgeDifficulty;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  is_featured: boolean;
  created_at: string;
  
  // Joined fields
  badge?: Badge;
}

export interface AchievementRule {
  id: string;
  badge_id: string;
  rule_type: string;
  rule_value: Record<string, any>;
  token_reward: number;
  created_at: string;
  updated_at: string;
}
