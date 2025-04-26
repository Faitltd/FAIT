import { supabase } from '../../lib/supabase';
import { DailyTask, UserDailyTask } from '../../types/gamification.types';
import { pointsService } from '../PointsService';

/**
 * Service for handling daily task functionality
 */
export class DailyTaskService {
  /**
   * Get active daily tasks
   * @returns List of active daily tasks
   */
  async getActiveDailyTasks(): Promise<DailyTask[]> {
    try {
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active daily tasks:', error);
        return [];
      }

      return data as DailyTask[];
    } catch (error) {
      console.error('Error in getActiveDailyTasks:', error);
      return [];
    }
  }

  /**
   * Get user daily tasks
   * @param userId User ID
   * @returns List of user daily tasks
   */
  async getUserDailyTasks(userId: string): Promise<UserDailyTask[]> {
    try {
      // First, ensure user has today's tasks
      await this.ensureUserHasDailyTasks(userId);

      // Get user's daily tasks
      const { data, error } = await supabase
        .from('user_daily_tasks')
        .select('*, task:daily_tasks(*)')
        .eq('user_id', userId)
        .gte('created_at', this.getStartOfDay().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user daily tasks:', error);
        return [];
      }

      return data as UserDailyTask[];
    } catch (error) {
      console.error('Error in getUserDailyTasks:', error);
      return [];
    }
  }

  /**
   * Ensure user has today's daily tasks
   * @param userId User ID
   */
  private async ensureUserHasDailyTasks(userId: string): Promise<void> {
    try {
      // Check if user already has today's tasks
      const { data: existingTasks, error: checkError } = await supabase
        .from('user_daily_tasks')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', this.getStartOfDay().toISOString());

      if (checkError) {
        console.error('Error checking existing daily tasks:', checkError);
        return;
      }

      // If user already has tasks, no need to create new ones
      if (existingTasks.length > 0) {
        return;
      }

      // Get active daily tasks
      const activeTasks = await this.getActiveDailyTasks();

      // Create user daily tasks
      const userTasks = activeTasks.map(task => ({
        user_id: userId,
        task_id: task.id,
        progress: 0,
        is_completed: false,
        created_at: new Date().toISOString()
      }));

      if (userTasks.length > 0) {
        const { error: insertError } = await supabase
          .from('user_daily_tasks')
          .insert(userTasks);

        if (insertError) {
          console.error('Error creating user daily tasks:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserHasDailyTasks:', error);
    }
  }

  /**
   * Update tasks progress based on user activity
   * @param userId User ID
   * @param action Action type
   * @param targetId Target ID (optional)
   */
  async updateTasksProgress(
    userId: string,
    action: string,
    targetId?: string
  ): Promise<void> {
    try {
      // Get user's daily tasks
      const { data: userTasks, error } = await supabase
        .from('user_daily_tasks')
        .select('*, task:daily_tasks(*)')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .gte('created_at', this.getStartOfDay().toISOString());

      if (error) {
        console.error('Error fetching user daily tasks for progress update:', error);
        return;
      }

      // Process each task
      for (const userTask of userTasks) {
        const task = userTask.task;
        
        // Check if task matches this action
        if (task.action === action) {
          // Increment progress
          const newProgress = Math.min(task.target_count, userTask.progress + 1);
          const isCompleted = newProgress >= task.target_count;
          
          // Update user task
          await supabase
            .from('user_daily_tasks')
            .update({
              progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null
            })
            .eq('id', userTask.id);
          
          // Award points if completed
          if (isCompleted) {
            await pointsService.awardPoints(
              userId,
              task.points,
              `Completed daily task: ${task.title}`,
              'daily_task',
              task.id
            );
            
            // Record completion activity
            await supabase
              .from('gamification_activities')
              .insert([
                {
                  user_id: userId,
                  action: 'daily_task_completed',
                  target_id: task.id,
                  metadata: {
                    task_title: task.title,
                    points: task.points
                  }
                }
              ]);
          }
        }
      }
    } catch (error) {
      console.error('Error in updateTasksProgress:', error);
    }
  }

  /**
   * Get start of day date
   * @returns Date object for start of day
   */
  private getStartOfDay(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
