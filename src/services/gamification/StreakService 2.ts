import { supabase } from '../../lib/supabase';
import { Streak } from '../../types/gamification.types';
import { pointsService } from '../PointsService';

/**
 * Service for handling streak functionality
 */
export class StreakService {
  /**
   * Get user streaks
   * @param userId User ID
   * @returns List of user streaks
   */
  async getUserStreaks(userId: string): Promise<Streak[]> {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .order('type', { ascending: true });

      if (error) {
        console.error('Error fetching user streaks:', error);
        return [];
      }

      return data as Streak[];
    } catch (error) {
      console.error('Error in getUserStreaks:', error);
      return [];
    }
  }

  /**
   * Get user streak by type
   * @param userId User ID
   * @param type Streak type
   * @returns User streak if found
   */
  async getUserStreakByType(userId: string, type: string): Promise<Streak | null> {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No streak found, create it
          return this.createUserStreak(userId, type);
        }
        console.error('Error fetching user streak by type:', error);
        return null;
      }

      return data as Streak;
    } catch (error) {
      console.error('Error in getUserStreakByType:', error);
      return null;
    }
  }

  /**
   * Create user streak
   * @param userId User ID
   * @param type Streak type
   * @returns Created streak
   */
  private async createUserStreak(userId: string, type: string): Promise<Streak | null> {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .insert([
          {
            user_id: userId,
            type,
            current_count: 0,
            longest_count: 0,
            last_activity_date: null
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user streak:', error);
        return null;
      }

      return data as Streak;
    } catch (error) {
      console.error('Error in createUserStreak:', error);
      return null;
    }
  }

  /**
   * Update streaks based on user activity
   * @param userId User ID
   * @param action Action type
   */
  async updateStreaks(userId: string, action: string): Promise<void> {
    try {
      // Map action to streak type
      let streakType: string | null = null;
      
      if (action === 'login') {
        streakType = 'login';
      } else if (action.startsWith('forum_')) {
        streakType = 'forum';
      } else if (action !== 'view_page') {
        streakType = 'activity';
      }
      
      if (!streakType) {
        return;
      }
      
      // Get user streak
      const streak = await this.getUserStreakByType(userId, streakType);
      if (!streak) {
        return;
      }
      
      // Check if streak should be updated
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActivityDate = streak.last_activity_date ? new Date(streak.last_activity_date) : null;
      
      if (lastActivityDate) {
        lastActivityDate.setHours(0, 0, 0, 0);
        
        // If already updated today, no need to update again
        if (lastActivityDate.getTime() === today.getTime()) {
          return;
        }
        
        // Check if streak is broken (more than 1 day since last activity)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivityDate.getTime() !== yesterday.getTime()) {
          // Streak broken, reset to 1
          await this.resetStreak(streak.id, today.toISOString());
          return;
        }
      }
      
      // Increment streak
      const newCount = (streak.current_count || 0) + 1;
      const newLongestCount = Math.max(newCount, streak.longest_count || 0);
      
      // Update streak
      await supabase
        .from('streaks')
        .update({
          current_count: newCount,
          longest_count: newLongestCount,
          last_activity_date: today.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', streak.id);
      
      // Award streak milestone rewards if applicable
      await this.checkStreakMilestones(userId, streakType, newCount);
    } catch (error) {
      console.error('Error in updateStreaks:', error);
    }
  }

  /**
   * Reset streak
   * @param streakId Streak ID
   * @param activityDate Activity date
   */
  private async resetStreak(streakId: string, activityDate: string): Promise<void> {
    try {
      await supabase
        .from('streaks')
        .update({
          current_count: 1,
          last_activity_date: activityDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', streakId);
    } catch (error) {
      console.error('Error in resetStreak:', error);
    }
  }

  /**
   * Check streak milestones and award rewards
   * @param userId User ID
   * @param streakType Streak type
   * @param streakCount Current streak count
   */
  private async checkStreakMilestones(
    userId: string,
    streakType: string,
    streakCount: number
  ): Promise<void> {
    try {
      // Define milestone points
      const milestones = [
        { count: 3, points: 5 },
        { count: 7, points: 10 },
        { count: 14, points: 20 },
        { count: 30, points: 50 },
        { count: 60, points: 100 },
        { count: 90, points: 150 },
        { count: 180, points: 300 },
        { count: 365, points: 1000 }
      ];
      
      // Check if current count matches a milestone
      const milestone = milestones.find(m => m.count === streakCount);
      
      if (milestone) {
        // Award points
        await pointsService.awardPoints(
          userId,
          milestone.points,
          `${streakCount}-day ${this.getStreakTypeName(streakType)} streak`,
          'streak_milestone',
          `${streakType}_${streakCount}`
        );
        
        // Record milestone activity
        await supabase
          .from('gamification_activities')
          .insert([
            {
              user_id: userId,
              action: 'streak_milestone',
              target_id: `${streakType}_${streakCount}`,
              metadata: {
                streak_type: streakType,
                streak_count: streakCount,
                points: milestone.points
              }
            }
          ]);
        
        // For significant milestones, award titles
        if (streakCount >= 30) {
          const titlePrefix = this.getStreakTitlePrefix(streakType);
          let title = '';
          
          if (streakCount >= 365) {
            title = `${titlePrefix} Legend`;
          } else if (streakCount >= 180) {
            title = `${titlePrefix} Master`;
          } else if (streakCount >= 90) {
            title = `${titlePrefix} Expert`;
          } else if (streakCount >= 30) {
            title = `${titlePrefix} Enthusiast`;
          }
          
          if (title) {
            await supabase
              .from('user_titles')
              .insert([
                {
                  user_id: userId,
                  title,
                  source: 'streak',
                  source_id: `${streakType}_${streakCount}`,
                  is_active: false,
                  unlocked_at: new Date().toISOString()
                }
              ]);
          }
        }
      }
    } catch (error) {
      console.error('Error in checkStreakMilestones:', error);
    }
  }

  /**
   * Get streak type name
   * @param streakType Streak type
   * @returns Streak type name
   */
  private getStreakTypeName(streakType: string): string {
    switch (streakType) {
      case 'login':
        return 'login';
      case 'forum':
        return 'forum activity';
      case 'activity':
        return 'platform activity';
      default:
        return streakType;
    }
  }

  /**
   * Get streak title prefix
   * @param streakType Streak type
   * @returns Streak title prefix
   */
  private getStreakTitlePrefix(streakType: string): string {
    switch (streakType) {
      case 'login':
        return 'Loyal';
      case 'forum':
        return 'Community';
      case 'activity':
        return 'Dedicated';
      default:
        return 'Consistent';
    }
  }
}
