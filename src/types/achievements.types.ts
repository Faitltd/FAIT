/**
 * Achievements system types
 */

export type AchievementCategory = 
  | 'onboarding'    // Achievements related to getting started
  | 'engagement'    // Achievements related to platform engagement
  | 'bookings'      // Achievements related to bookings
  | 'referrals'     // Achievements related to referrals
  | 'verification'  // Achievements related to verification
  | 'reviews'       // Achievements related to reviews
  | 'community'     // Achievements related to community participation
  | 'milestones';   // Achievements related to milestones

export type AchievementTriggerType =
  | 'signup'                // Triggered on signup
  | 'profile_completion'    // Triggered when profile is completed
  | 'verification'          // Triggered when verification is completed
  | 'booking_count'         // Triggered based on booking count
  | 'booking_value'         // Triggered based on booking value
  | 'referral_count'        // Triggered based on referral count
  | 'review_count'          // Triggered based on review count
  | 'login_streak'          // Triggered based on login streak
  | 'points_earned'         // Triggered based on points earned
  | 'forum_posts'           // Triggered based on forum posts
  | 'time_on_platform';     // Triggered based on time on platform

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  trigger_type: AchievementTriggerType;
  trigger_value: number;
  points_reward: number;
  badge_image_url: string;
  is_active: boolean;
  is_hidden: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achieved_at: string;
  points_awarded: number;
  achievement?: Achievement;
}

export interface AchievementProgress {
  achievement_id: string;
  current_value: number;
  target_value: number;
  percentage: number;
  achievement?: Achievement;
}

export interface AchievementStats {
  total_achievements: number;
  achievements_earned: number;
  total_points_earned: number;
  completion_percentage: number;
}
