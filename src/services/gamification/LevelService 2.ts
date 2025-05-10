import { supabase } from '../../lib/supabase';
import { UserLevel, LevelDefinition } from '../../types/gamification.types';

/**
 * Service for handling user level functionality
 */
export class LevelService {
  /**
   * Get level definitions
   * @returns List of level definitions
   */
  async getLevelDefinitions(): Promise<LevelDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('level_definitions')
        .select('*, rewards(*)')
        .order('level', { ascending: true });

      if (error) {
        console.error('Error fetching level definitions:', error);
        return [];
      }

      return data as LevelDefinition[];
    } catch (error) {
      console.error('Error in getLevelDefinitions:', error);
      return [];
    }
  }

  /**
   * Get user level
   * @param userId User ID
   * @returns User level if found
   */
  async getUserLevel(userId: string): Promise<UserLevel | null> {
    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No level found, create initial level
          return this.initializeUserLevel(userId);
        }
        console.error('Error fetching user level:', error);
        return null;
      }

      return data as UserLevel;
    } catch (error) {
      console.error('Error in getUserLevel:', error);
      return null;
    }
  }

  /**
   * Initialize user level
   * @param userId User ID
   * @returns Created user level
   */
  private async initializeUserLevel(userId: string): Promise<UserLevel | null> {
    try {
      // Get level 1 definition
      const { data: levelDefinition, error: levelError } = await supabase
        .from('level_definitions')
        .select('*')
        .eq('level', 1)
        .single();

      if (levelError) {
        console.error('Error fetching level 1 definition:', levelError);
        return null;
      }

      // Get user's current points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId);

      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
        return null;
      }

      // Calculate total points
      const totalPoints = pointsData.reduce((sum, item) => sum + item.points, 0);

      // Create user level
      const { data, error } = await supabase
        .from('user_levels')
        .insert([
          {
            user_id: userId,
            level: 1,
            points_required: levelDefinition.points_required,
            current_points: totalPoints,
            progress_percentage: Math.min(100, Math.round((totalPoints / levelDefinition.points_required) * 100))
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user level:', error);
        return null;
      }

      return data as UserLevel;
    } catch (error) {
      console.error('Error in initializeUserLevel:', error);
      return null;
    }
  }

  /**
   * Check level progress and level up if needed
   * @param userId User ID
   * @returns Updated user level
   */
  async checkLevelProgress(userId: string): Promise<UserLevel | null> {
    try {
      // Get user level
      const userLevel = await this.getUserLevel(userId);
      if (!userLevel) {
        return null;
      }

      // Get user's current points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId);

      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
        return null;
      }

      // Calculate total points
      const totalPoints = pointsData.reduce((sum, item) => sum + item.points, 0);

      // Get next level definition
      const { data: nextLevelDefinition, error: levelError } = await supabase
        .from('level_definitions')
        .select('*, rewards(*)')
        .eq('level', userLevel.level + 1)
        .single();

      // If no next level or not enough points, just update progress
      if (levelError || totalPoints < nextLevelDefinition.points_required) {
        // Update progress
        const { data, error } = await supabase
          .from('user_levels')
          .update({
            current_points: totalPoints,
            progress_percentage: Math.min(100, Math.round((totalPoints / userLevel.points_required) * 100)),
            updated_at: new Date().toISOString()
          })
          .eq('id', userLevel.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user level progress:', error);
          return null;
        }

        return data as UserLevel;
      }

      // Level up!
      const { data, error } = await supabase
        .from('user_levels')
        .update({
          level: userLevel.level + 1,
          points_required: nextLevelDefinition.points_required,
          current_points: totalPoints,
          progress_percentage: Math.min(100, Math.round((totalPoints / nextLevelDefinition.points_required) * 100)),
          unlocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userLevel.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user level:', error);
        return null;
      }

      // Award level up rewards
      await this.awardLevelUpRewards(userId, nextLevelDefinition);

      // Record level up activity
      await supabase
        .from('gamification_activities')
        .insert([
          {
            user_id: userId,
            action: 'level_up',
            target_id: nextLevelDefinition.level.toString(),
            metadata: {
              level: nextLevelDefinition.level,
              name: nextLevelDefinition.name
            }
          }
        ]);

      return data as UserLevel;
    } catch (error) {
      console.error('Error in checkLevelProgress:', error);
      return null;
    }
  }

  /**
   * Award level up rewards
   * @param userId User ID
   * @param levelDefinition Level definition
   */
  private async awardLevelUpRewards(userId: string, levelDefinition: LevelDefinition): Promise<void> {
    try {
      // Process each reward (similar to challenge rewards)
      for (const reward of levelDefinition.rewards) {
        switch (reward.type) {
          case 'title':
            // Award title
            if (typeof reward.value === 'string') {
              await supabase
                .from('user_titles')
                .insert([
                  {
                    user_id: userId,
                    title: reward.value,
                    source: 'level',
                    source_id: levelDefinition.level.toString(),
                    is_active: false,
                    unlocked_at: new Date().toISOString()
                  }
                ]);
            }
            break;
          
          case 'feature_unlock':
            // Unlock feature
            if (typeof reward.value === 'string' && reward.metadata) {
              await supabase
                .from('user_features')
                .insert([
                  {
                    user_id: userId,
                    feature_key: reward.value,
                    metadata: reward.metadata,
                    source: 'level',
                    source_id: levelDefinition.level.toString(),
                    unlocked_at: new Date().toISOString()
                  }
                ]);
            }
            break;
          
          case 'discount':
            // Create discount code
            if (typeof reward.value === 'number' && reward.metadata) {
              await supabase
                .from('user_discounts')
                .insert([
                  {
                    user_id: userId,
                    discount_percentage: reward.value,
                    code: `${userId.substring(0, 8)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    metadata: reward.metadata,
                    source: 'level',
                    source_id: levelDefinition.level.toString(),
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    created_at: new Date().toISOString()
                  }
                ]);
            }
            break;
        }
      }
    } catch (error) {
      console.error('Error in awardLevelUpRewards:', error);
    }
  }
}
