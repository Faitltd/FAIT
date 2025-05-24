import { supabase } from '../../lib/supabase';
import { ChallengeService } from './ChallengeService';
import { LeaderboardService } from './LeaderboardService';
import { LevelService } from './LevelService';
import { EventService } from './EventService';
import { TeamService } from './TeamService';
import { DailyTaskService } from './DailyTaskService';
import { StreakService } from './StreakService';
import { UserTitle, GamificationSettings } from '../../types/gamification.types';

/**
 * Main service for handling gamification functionality
 */
export class GamificationService {
  public challenges: ChallengeService;
  public leaderboards: LeaderboardService;
  public levels: LevelService;
  public events: EventService;
  public teams: TeamService;
  public dailyTasks: DailyTaskService;
  public streaks: StreakService;

  constructor() {
    this.challenges = new ChallengeService();
    this.leaderboards = new LeaderboardService();
    this.levels = new LevelService();
    this.events = new EventService();
    this.teams = new TeamService();
    this.dailyTasks = new DailyTaskService();
    this.streaks = new StreakService();
  }

  /**
   * Track user activity for gamification
   * @param userId User ID
   * @param action Action type
   * @param targetId Target ID (optional)
   * @param metadata Additional metadata (optional)
   * @returns Success status
   */
  async trackActivity(
    userId: string,
    action: string,
    targetId?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // Record the activity
      const { error } = await supabase
        .from('gamification_activities')
        .insert([
          {
            user_id: userId,
            action,
            target_id: targetId,
            metadata
          }
        ]);

      if (error) {
        console.error('Error tracking activity:', error);
        return false;
      }

      // Update challenges progress
      await this.challenges.updateChallengesProgress(userId, action, targetId, metadata);
      
      // Update daily tasks progress
      await this.dailyTasks.updateTasksProgress(userId, action, targetId);
      
      // Update streaks
      await this.streaks.updateStreaks(userId, action);
      
      // Check level progress
      await this.levels.checkLevelProgress(userId);

      return true;
    } catch (error) {
      console.error('Error in trackActivity:', error);
      return false;
    }
  }

  /**
   * Get user titles
   * @param userId User ID
   * @returns List of user titles
   */
  async getUserTitles(userId: string): Promise<UserTitle[]> {
    try {
      const { data, error } = await supabase
        .from('user_titles')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching user titles:', error);
        return [];
      }

      return data as UserTitle[];
    } catch (error) {
      console.error('Error in getUserTitles:', error);
      return [];
    }
  }

  /**
   * Set active title for user
   * @param userId User ID
   * @param titleId Title ID
   * @returns Success status
   */
  async setActiveTitle(userId: string, titleId: string): Promise<boolean> {
    try {
      // First, set all titles to inactive
      await supabase
        .from('user_titles')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Then, set the selected title to active
      const { error } = await supabase
        .from('user_titles')
        .update({ is_active: true })
        .eq('id', titleId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error setting active title:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setActiveTitle:', error);
      return false;
    }
  }

  /**
   * Get user gamification settings
   * @param userId User ID
   * @returns User gamification settings
   */
  async getGamificationSettings(userId: string): Promise<GamificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('gamification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          return this.createDefaultGamificationSettings(userId);
        }
        console.error('Error fetching gamification settings:', error);
        return null;
      }

      return data as GamificationSettings;
    } catch (error) {
      console.error('Error in getGamificationSettings:', error);
      return null;
    }
  }

  /**
   * Update user gamification settings
   * @param userId User ID
   * @param settings Settings to update
   * @returns Updated settings
   */
  async updateGamificationSettings(
    userId: string,
    settings: Partial<GamificationSettings>
  ): Promise<GamificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('gamification_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating gamification settings:', error);
        return null;
      }

      return data as GamificationSettings;
    } catch (error) {
      console.error('Error in updateGamificationSettings:', error);
      return null;
    }
  }

  /**
   * Create default gamification settings for a user
   * @param userId User ID
   * @returns Default settings
   */
  private async createDefaultGamificationSettings(userId: string): Promise<GamificationSettings | null> {
    try {
      const defaultSettings = {
        user_id: userId,
        notifications_enabled: true,
        leaderboard_visibility: 'public',
        achievement_sharing: true,
        challenge_reminders: true,
        daily_task_reminders: true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('gamification_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (error) {
        console.error('Error creating default gamification settings:', error);
        return null;
      }

      return data as GamificationSettings;
    } catch (error) {
      console.error('Error in createDefaultGamificationSettings:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const gamificationService = new GamificationService();
