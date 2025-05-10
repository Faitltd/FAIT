import { supabase } from '../../lib/supabase';
import { Challenge, UserChallenge, UserChallengeActivity } from '../../types/gamification.types';
import { pointsService } from '../PointsService';

/**
 * Service for handling challenge functionality
 */
export class ChallengeService {
  /**
   * Get active challenges
   * @returns List of active challenges
   */
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, requirements(*), rewards(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active challenges:', error);
        return [];
      }

      return data as Challenge[];
    } catch (error) {
      console.error('Error in getActiveChallenges:', error);
      return [];
    }
  }

  /**
   * Get challenge by ID
   * @param challengeId Challenge ID
   * @returns Challenge if found
   */
  async getChallengeById(challengeId: string): Promise<Challenge | null> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, requirements(*), rewards(*)')
        .eq('id', challengeId)
        .single();

      if (error) {
        console.error('Error fetching challenge by ID:', error);
        return null;
      }

      return data as Challenge;
    } catch (error) {
      console.error('Error in getChallengeById:', error);
      return null;
    }
  }

  /**
   * Get user challenges
   * @param userId User ID
   * @returns List of user challenges
   */
  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenges(*, requirements(*), rewards(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user challenges:', error);
        return [];
      }

      return data as UserChallenge[];
    } catch (error) {
      console.error('Error in getUserChallenges:', error);
      return [];
    }
  }

  /**
   * Get user challenge by ID
   * @param userId User ID
   * @param challengeId Challenge ID
   * @returns User challenge if found
   */
  async getUserChallenge(userId: string, challengeId: string): Promise<UserChallenge | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenges(*, requirements(*), rewards(*))')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (error) {
        console.error('Error fetching user challenge:', error);
        return null;
      }

      return data as UserChallenge;
    } catch (error) {
      console.error('Error in getUserChallenge:', error);
      return null;
    }
  }

  /**
   * Join a challenge
   * @param userId User ID
   * @param challengeId Challenge ID
   * @returns Created user challenge
   */
  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge | null> {
    try {
      // Check if user already joined this challenge
      const existingChallenge = await this.getUserChallenge(userId, challengeId);
      if (existingChallenge) {
        return existingChallenge;
      }

      // Get the challenge
      const challenge = await this.getChallengeById(challengeId);
      if (!challenge || !challenge.is_active) {
        throw new Error('Challenge not found or not active');
      }

      // Check if challenge is repeatable or if user has already completed it
      if (!challenge.is_repeatable) {
        const { data: completedChallenge, error: completedError } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('is_completed', true)
          .single();

        if (!completedError && completedChallenge) {
          throw new Error('Challenge already completed and not repeatable');
        }
      }

      // Check cooldown period if applicable
      if (challenge.is_repeatable && challenge.cooldown_days) {
        const cooldownDate = new Date();
        cooldownDate.setDate(cooldownDate.getDate() - challenge.cooldown_days);

        const { data: recentChallenge, error: recentError } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('is_completed', true)
          .gte('completed_at', cooldownDate.toISOString())
          .single();

        if (!recentError && recentChallenge) {
          throw new Error(`Challenge in cooldown period (${challenge.cooldown_days} days)`);
        }
      }

      // Create user challenge
      const { data, error } = await supabase
        .from('user_challenges')
        .insert([
          {
            user_id: userId,
            challenge_id: challengeId,
            progress: 0,
            is_completed: false,
            last_progress_date: new Date().toISOString()
          }
        ])
        .select('*, challenge:challenges(*, requirements(*), rewards(*))')
        .single();

      if (error) {
        console.error('Error joining challenge:', error);
        return null;
      }

      return data as UserChallenge;
    } catch (error) {
      console.error('Error in joinChallenge:', error);
      return null;
    }
  }

  /**
   * Update challenges progress based on user activity
   * @param userId User ID
   * @param action Action type
   * @param targetId Target ID (optional)
   * @param metadata Additional metadata (optional)
   */
  async updateChallengesProgress(
    userId: string,
    action: string,
    targetId?: string,
    metadata?: any
  ): Promise<void> {
    try {
      // Get user's active challenges
      const { data: userChallenges, error } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenges(*, requirements(*))')
        .eq('user_id', userId)
        .eq('is_completed', false);

      if (error) {
        console.error('Error fetching user challenges for progress update:', error);
        return;
      }

      // Process each challenge
      for (const userChallenge of userChallenges) {
        const challenge = userChallenge.challenge;
        
        // Check if challenge has requirements matching this action
        const matchingRequirements = challenge.requirements.filter(req => 
          req.action === action && 
          (!req.target_id || req.target_id === targetId)
        );

        if (matchingRequirements.length === 0) continue;

        // Record activity for each matching requirement
        for (const requirement of matchingRequirements) {
          await this.recordChallengeActivity(
            userId,
            challenge.id,
            requirement.type,
            action,
            1
          );
        }

        // Check if challenge is completed
        await this.checkChallengeCompletion(userId, challenge.id);
      }
    } catch (error) {
      console.error('Error in updateChallengesProgress:', error);
    }
  }

  /**
   * Record challenge activity
   * @param userId User ID
   * @param challengeId Challenge ID
   * @param requirementType Requirement type
   * @param action Action
   * @param progress Progress amount
   * @returns Created activity
   */
  private async recordChallengeActivity(
    userId: string,
    challengeId: string,
    requirementType: string,
    action: string,
    progress: number
  ): Promise<UserChallengeActivity | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_activities')
        .insert([
          {
            user_id: userId,
            challenge_id: challengeId,
            requirement_type: requirementType,
            action,
            progress
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error recording challenge activity:', error);
        return null;
      }

      // Update user challenge progress
      await this.updateChallengeProgress(userId, challengeId);

      return data as UserChallengeActivity;
    } catch (error) {
      console.error('Error in recordChallengeActivity:', error);
      return null;
    }
  }

  /**
   * Update challenge progress
   * @param userId User ID
   * @param challengeId Challenge ID
   */
  private async updateChallengeProgress(userId: string, challengeId: string): Promise<void> {
    try {
      // Get the challenge and its requirements
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*, requirements(*)')
        .eq('id', challengeId)
        .single();

      if (challengeError) {
        console.error('Error fetching challenge for progress update:', challengeError);
        return;
      }

      // Calculate progress for each requirement
      let totalProgress = 0;
      let totalRequirements = challenge.requirements.length;

      for (const requirement of challenge.requirements) {
        // Get total activity for this requirement
        const { data: activities, error: activitiesError } = await supabase
          .from('user_challenge_activities')
          .select('progress')
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('requirement_type', requirement.type)
          .eq('action', requirement.action);

        if (activitiesError) {
          console.error('Error fetching challenge activities:', activitiesError);
          continue;
        }

        // Sum up progress
        const totalActivityProgress = activities.reduce((sum, activity) => sum + activity.progress, 0);
        
        // Calculate percentage of completion for this requirement
        const requirementProgress = Math.min(1, totalActivityProgress / requirement.count);
        
        // Add to total progress
        totalProgress += requirementProgress;
      }

      // Calculate overall progress percentage (0-100)
      const progressPercentage = Math.round((totalProgress / totalRequirements) * 100);

      // Update user challenge
      await supabase
        .from('user_challenges')
        .update({
          progress: progressPercentage,
          last_progress_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
    } catch (error) {
      console.error('Error in updateChallengeProgress:', error);
    }
  }

  /**
   * Check if a challenge is completed
   * @param userId User ID
   * @param challengeId Challenge ID
   */
  private async checkChallengeCompletion(userId: string, challengeId: string): Promise<void> {
    try {
      // Get user challenge
      const { data: userChallenge, error: challengeError } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenges(*)')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (challengeError) {
        console.error('Error fetching user challenge for completion check:', challengeError);
        return;
      }

      // Check if already completed
      if (userChallenge.is_completed) {
        return;
      }

      // Check if progress is 100%
      if (userChallenge.progress >= 100) {
        // Mark as completed
        await supabase
          .from('user_challenges')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('challenge_id', challengeId);

        // Award rewards
        await this.awardChallengeRewards(userId, challengeId);
      }
    } catch (error) {
      console.error('Error in checkChallengeCompletion:', error);
    }
  }

  /**
   * Award challenge rewards
   * @param userId User ID
   * @param challengeId Challenge ID
   */
  private async awardChallengeRewards(userId: string, challengeId: string): Promise<void> {
    try {
      // Get challenge with rewards
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*, rewards(*)')
        .eq('id', challengeId)
        .single();

      if (challengeError) {
        console.error('Error fetching challenge for rewards:', challengeError);
        return;
      }

      // Process each reward
      for (const reward of challenge.rewards) {
        switch (reward.type) {
          case 'points':
            // Award points
            await pointsService.awardPoints(
              userId,
              Number(reward.value),
              `Completed challenge: ${challenge.title}`,
              'challenge_completion',
              challengeId
            );
            break;
          
          case 'badge':
            // Award badge (create user achievement)
            if (typeof reward.value === 'string') {
              await supabase
                .from('user_achievements')
                .insert([
                  {
                    user_id: userId,
                    achievement_id: reward.value,
                    unlocked_at: new Date().toISOString()
                  }
                ]);
            }
            break;
          
          case 'title':
            // Award title
            if (typeof reward.value === 'string') {
              await supabase
                .from('user_titles')
                .insert([
                  {
                    user_id: userId,
                    title: reward.value,
                    source: 'challenge',
                    source_id: challengeId,
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
                    source: 'challenge',
                    source_id: challengeId,
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
                    source: 'challenge',
                    source_id: challengeId,
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    created_at: new Date().toISOString()
                  }
                ]);
            }
            break;
        }
      }
    } catch (error) {
      console.error('Error in awardChallengeRewards:', error);
    }
  }
}
