import { supabase } from '../../lib/supabase';
import { Leaderboard, LeaderboardEntry } from '../../types/gamification.types';

/**
 * Service for handling leaderboard functionality
 */
export class LeaderboardService {
  /**
   * Get active leaderboards
   * @returns List of active leaderboards
   */
  async getActiveLeaderboards(): Promise<Leaderboard[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active leaderboards:', error);
        return [];
      }

      return data as Leaderboard[];
    } catch (error) {
      console.error('Error in getActiveLeaderboards:', error);
      return [];
    }
  }

  /**
   * Get leaderboard by ID
   * @param leaderboardId Leaderboard ID
   * @returns Leaderboard if found
   */
  async getLeaderboardById(leaderboardId: string): Promise<Leaderboard | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('id', leaderboardId)
        .single();

      if (error) {
        console.error('Error fetching leaderboard by ID:', error);
        return null;
      }

      return data as Leaderboard;
    } catch (error) {
      console.error('Error in getLeaderboardById:', error);
      return null;
    }
  }

  /**
   * Get leaderboard entries
   * @param leaderboardId Leaderboard ID
   * @param limit Number of entries to return
   * @param offset Offset for pagination
   * @returns List of leaderboard entries
   */
  async getLeaderboardEntries(
    leaderboardId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<LeaderboardEntry[]> {
    try {
      // Get the leaderboard
      const leaderboard = await this.getLeaderboardById(leaderboardId);
      if (!leaderboard) {
        throw new Error('Leaderboard not found');
      }

      // Determine the query based on leaderboard type
      let query = '';
      let params: any = {
        limit,
        offset
      };

      switch (leaderboard.type) {
        case 'points':
          query = `
            SELECT 
              ROW_NUMBER() OVER (ORDER BY SUM(points) DESC) as rank,
              user_id,
              json_build_object(
                'first_name', p.first_name,
                'last_name', p.last_name,
                'avatar_url', p.avatar_url,
                'user_type', p.user_type
              ) as user,
              SUM(points) as score,
              json_build_object(
                'points_breakdown', json_agg(json_build_object('reason', reason, 'points', points, 'created_at', created_at))
              ) as metadata
            FROM user_points up
            JOIN profiles p ON up.user_id = p.id
            WHERE 1=1
          `;
          
          // Add period filter
          if (leaderboard.period !== 'all_time') {
            let startDate;
            
            switch (leaderboard.period) {
              case 'daily':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'weekly':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'monthly':
                startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'custom':
                if (leaderboard.start_date) {
                  startDate = new Date(leaderboard.start_date);
                }
                break;
            }
            
            if (startDate) {
              query += ` AND up.created_at >= $1`;
              params.startDate = startDate.toISOString();
            }
            
            if (leaderboard.period === 'custom' && leaderboard.end_date) {
              query += ` AND up.created_at <= $2`;
              params.endDate = new Date(leaderboard.end_date).toISOString();
            }
          }
          
          // Add category filter
          if (leaderboard.category) {
            query += ` AND up.source_type = $3`;
            params.category = leaderboard.category;
          }
          
          // Group by user and add limit/offset
          query += `
            GROUP BY up.user_id, p.first_name, p.last_name, p.avatar_url, p.user_type
            ORDER BY score DESC
            LIMIT $4 OFFSET $5
          `;
          break;
          
        case 'achievements':
          query = `
            SELECT 
              ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
              user_id,
              json_build_object(
                'first_name', p.first_name,
                'last_name', p.last_name,
                'avatar_url', p.avatar_url,
                'user_type', p.user_type
              ) as user,
              COUNT(*) as score,
              json_build_object(
                'achievements', json_agg(json_build_object('id', a.id, 'name', a.name, 'unlocked_at', ua.unlocked_at))
              ) as metadata
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            JOIN profiles p ON ua.user_id = p.id
            WHERE 1=1
          `;
          
          // Add period filter
          if (leaderboard.period !== 'all_time') {
            let startDate;
            
            switch (leaderboard.period) {
              case 'daily':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'weekly':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'monthly':
                startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'custom':
                if (leaderboard.start_date) {
                  startDate = new Date(leaderboard.start_date);
                }
                break;
            }
            
            if (startDate) {
              query += ` AND ua.unlocked_at >= $1`;
              params.startDate = startDate.toISOString();
            }
            
            if (leaderboard.period === 'custom' && leaderboard.end_date) {
              query += ` AND ua.unlocked_at <= $2`;
              params.endDate = new Date(leaderboard.end_date).toISOString();
            }
          }
          
          // Add category filter
          if (leaderboard.category) {
            query += ` AND a.category = $3`;
            params.category = leaderboard.category;
          }
          
          // Group by user and add limit/offset
          query += `
            GROUP BY ua.user_id, p.first_name, p.last_name, p.avatar_url, p.user_type
            ORDER BY score DESC
            LIMIT $4 OFFSET $5
          `;
          break;
          
        case 'challenges':
          query = `
            SELECT 
              ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
              user_id,
              json_build_object(
                'first_name', p.first_name,
                'last_name', p.last_name,
                'avatar_url', p.avatar_url,
                'user_type', p.user_type
              ) as user,
              COUNT(*) as score,
              json_build_object(
                'challenges', json_agg(json_build_object('id', c.id, 'title', c.title, 'completed_at', uc.completed_at))
              ) as metadata
            FROM user_challenges uc
            JOIN challenges c ON uc.challenge_id = c.id
            JOIN profiles p ON uc.user_id = p.id
            WHERE uc.is_completed = true
          `;
          
          // Add period filter
          if (leaderboard.period !== 'all_time') {
            let startDate;
            
            switch (leaderboard.period) {
              case 'daily':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'weekly':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'monthly':
                startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'custom':
                if (leaderboard.start_date) {
                  startDate = new Date(leaderboard.start_date);
                }
                break;
            }
            
            if (startDate) {
              query += ` AND uc.completed_at >= $1`;
              params.startDate = startDate.toISOString();
            }
            
            if (leaderboard.period === 'custom' && leaderboard.end_date) {
              query += ` AND uc.completed_at <= $2`;
              params.endDate = new Date(leaderboard.end_date).toISOString();
            }
          }
          
          // Add category filter
          if (leaderboard.category) {
            query += ` AND c.category = $3`;
            params.category = leaderboard.category;
          }
          
          // Group by user and add limit/offset
          query += `
            GROUP BY uc.user_id, p.first_name, p.last_name, p.avatar_url, p.user_type
            ORDER BY score DESC
            LIMIT $4 OFFSET $5
          `;
          break;
          
        case 'custom':
          // For custom leaderboards, we'll use a stored procedure
          const { data, error } = await supabase.rpc('get_custom_leaderboard', {
            p_leaderboard_id: leaderboardId,
            p_limit: limit,
            p_offset: offset
          });
          
          if (error) {
            console.error('Error fetching custom leaderboard entries:', error);
            return [];
          }
          
          return data as LeaderboardEntry[];
      }
      
      // Execute the query
      const { data, error } = await supabase.rpc('execute_leaderboard_query', {
        p_query: query,
        p_params: params
      });
      
      if (error) {
        console.error('Error fetching leaderboard entries:', error);
        return [];
      }
      
      return data as LeaderboardEntry[];
    } catch (error) {
      console.error('Error in getLeaderboardEntries:', error);
      return [];
    }
  }

  /**
   * Get user rank in leaderboard
   * @param leaderboardId Leaderboard ID
   * @param userId User ID
   * @returns User rank and entry
   */
  async getUserLeaderboardRank(
    leaderboardId: string,
    userId: string
  ): Promise<{ rank: number; entry: LeaderboardEntry | null }> {
    try {
      // Get all entries (this could be optimized with a stored procedure)
      const entries = await this.getLeaderboardEntries(leaderboardId, 1000, 0);
      
      // Find user entry
      const userEntry = entries.find(entry => entry.user_id === userId);
      
      if (!userEntry) {
        return { rank: 0, entry: null };
      }
      
      return { rank: userEntry.rank, entry: userEntry };
    } catch (error) {
      console.error('Error in getUserLeaderboardRank:', error);
      return { rank: 0, entry: null };
    }
  }
}
