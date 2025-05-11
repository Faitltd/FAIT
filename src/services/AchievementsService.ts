import { supabase } from '../lib/supabase';
import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress,
  AchievementStats
} from '../types/achievements.types';
import { pointsService } from './PointsService';

/**
 * Service for handling achievements system
 */
export class AchievementsService {
  /**
   * Get all achievements
   * @param includeHidden Whether to include hidden achievements
   * @returns List of achievements
   */
  async getAllAchievements(includeHidden: boolean = false): Promise<Achievement[]> {
    try {
      let query = supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('trigger_value', { ascending: true });

      if (!includeHidden) {
        query = query.eq('is_hidden', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data as Achievement[];
    } catch (error) {
      console.error('Error in getAllAchievements:', error);
      return [];
    }
  }

  /**
   * Get achievements by category
   * @param category Achievement category
   * @param includeHidden Whether to include hidden achievements
   * @returns List of achievements in the category
   */
  async getAchievementsByCategory(
    category: string,
    includeHidden: boolean = false
  ): Promise<Achievement[]> {
    try {
      let query = supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('trigger_value', { ascending: true });

      if (!includeHidden) {
        query = query.eq('is_hidden', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching achievements by category:', error);
        return [];
      }

      return data as Achievement[];
    } catch (error) {
      console.error('Error in getAchievementsByCategory:', error);
      return [];
    }
  }

  /**
   * Get user's achievements
   * @param userId User ID
   * @returns List of user's achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) {
        console.error('Error fetching user achievements:', error);
        return [];
      }

      return data as UserAchievement[];
    } catch (error) {
      console.error('Error in getUserAchievements:', error);
      return [];
    }
  }

  /**
   * Get user's achievement progress
   * @param userId User ID
   * @returns List of user's achievement progress
   */
  async getUserAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_achievement_progress', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user achievement progress:', error);
        return [];
      }

      // Get the achievements
      const achievementIds = data.map((progress: any) => progress.achievement_id);
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .in('id', achievementIds);

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        return data as AchievementProgress[];
      }

      // Add the achievements to the progress
      return data.map((progress: any) => {
        const achievement = achievements.find((a: any) => a.id === progress.achievement_id);
        return {
          ...progress,
          achievement
        };
      }) as AchievementProgress[];
    } catch (error) {
      console.error('Error in getUserAchievementProgress:', error);
      return [];
    }
  }

  /**
   * Get user's achievement stats
   * @param userId User ID
   * @returns User's achievement stats
   */
  async getUserAchievementStats(userId: string): Promise<AchievementStats> {
    try {
      const { data, error } = await supabase.rpc('get_user_achievement_stats', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user achievement stats:', error);
        return {
          total_achievements: 0,
          achievements_earned: 0,
          total_points_earned: 0,
          completion_percentage: 0
        };
      }

      return data as AchievementStats;
    } catch (error) {
      console.error('Error in getUserAchievementStats:', error);
      return {
        total_achievements: 0,
        achievements_earned: 0,
        total_points_earned: 0,
        completion_percentage: 0
      };
    }
  }

  /**
   * Check and award achievements for a user
   * @param userId User ID
   * @param triggerType Achievement trigger type
   * @param triggerValue Achievement trigger value
   * @returns List of awarded achievements
   */
  async checkAndAwardAchievements(
    userId: string,
    triggerType: string,
    triggerValue: number = 1
  ): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase.rpc('check_and_award_achievements', {
        p_user_id: userId,
        p_trigger_type: triggerType,
        p_trigger_value: triggerValue
      });

      if (error) {
        console.error('Error checking and awarding achievements:', error);
        return [];
      }

      // If achievements were awarded, award points
      if (data && data.length > 0) {
        for (const achievement of data) {
          await pointsService.awardPoints(
            userId,
            achievement.points_reward,
            `Achievement unlocked: ${achievement.name}`,
            'achievement',
            achievement.id
          );
        }

        // Get the full user achievements with achievement details
        const userAchievements = await this.getUserAchievements(userId);
        return userAchievements.filter(ua => 
          data.some((a: any) => a.id === ua.achievement_id)
        );
      }

      return [];
    } catch (error) {
      console.error('Error in checkAndAwardAchievements:', error);
      return [];
    }
  }

  /**
   * Check signup achievements
   * @param userId User ID
   * @returns List of awarded achievements
   */
  async checkSignupAchievements(userId: string): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'signup');
  }

  /**
   * Check profile completion achievements
   * @param userId User ID
   * @returns List of awarded achievements
   */
  async checkProfileCompletionAchievements(userId: string): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'profile_completion');
  }

  /**
   * Check verification achievements
   * @param userId User ID
   * @returns List of awarded achievements
   */
  async checkVerificationAchievements(userId: string): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'verification');
  }

  /**
   * Check booking count achievements
   * @param userId User ID
   * @param count Booking count
   * @returns List of awarded achievements
   */
  async checkBookingCountAchievements(
    userId: string,
    count: number
  ): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'booking_count', count);
  }

  /**
   * Check referral count achievements
   * @param userId User ID
   * @param count Referral count
   * @returns List of awarded achievements
   */
  async checkReferralCountAchievements(
    userId: string,
    count: number
  ): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'referral_count', count);
  }

  /**
   * Check review count achievements
   * @param userId User ID
   * @param count Review count
   * @returns List of awarded achievements
   */
  async checkReviewCountAchievements(
    userId: string,
    count: number
  ): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'review_count', count);
  }

  /**
   * Check login streak achievements
   * @param userId User ID
   * @param streak Login streak
   * @returns List of awarded achievements
   */
  async checkLoginStreakAchievements(
    userId: string,
    streak: number
  ): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'login_streak', streak);
  }

  /**
   * Check points earned achievements
   * @param userId User ID
   * @param points Points earned
   * @returns List of awarded achievements
   */
  async checkPointsEarnedAchievements(
    userId: string,
    points: number
  ): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'points_earned', points);
  }

  /**
   * Check forum posts achievements
   * @param userId User ID
   * @param count Forum posts count
   * @returns List of awarded achievements
   */
  async checkForumPostsAchievements(
    userId: string,
    count: number
  ): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'forum_posts', count);
  }

  /**
   * Check time on platform achievements
   * @param userId User ID
   * @param days Days on platform
   * @returns List of awarded achievements
   */
  async checkTimeOnPlatformAchievements(
    userId: string,
    days: number
  ): Promise<UserAchievement[]> {
    return this.checkAndAwardAchievements(userId, 'time_on_platform', days);
  }
}

// Create a singleton instance
export const achievementsService = new AchievementsService();
