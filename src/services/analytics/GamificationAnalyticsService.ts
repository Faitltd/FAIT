import { supabase } from '../../lib/supabase';
import {
  GamificationEngagementMetrics,
  GamificationImpactMetrics,
  UserEngagementMetrics,
  UserEngagementLevel,
  ChallengeMetric,
  EventMetric,
  PointSourceMetric,
  AnalyticsFilterOptions,
  GamificationAnalyticsDashboard,
  TimeSeriesData
} from '../../types/gamification-analytics.types';

/**
 * Service for gamification analytics
 */
export class GamificationAnalyticsService {
  /**
   * Get engagement metrics for the gamification system
   * @param options Filter options
   * @returns Engagement metrics
   */
  async getEngagementMetrics(options: AnalyticsFilterOptions): Promise<GamificationEngagementMetrics> {
    try {
      // Build date filter based on options
      const dateFilter = this.buildDateFilter(options);
      
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get active users (users who logged in during the period)
      const { count: activeUsers } = await supabase
        .from('gamification_activities')
        .select('user_id', { count: 'exact', head: true })
        .eq('action', 'login')
        .filter('created_at', 'gte', dateFilter.startDate)
        .filter('created_at', 'lte', dateFilter.endDate);
      
      // Get engaged users (users who completed at least one challenge)
      const { count: engagedUsers } = await supabase
        .from('user_challenges')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_completed', true)
        .filter('completed_at', 'gte', dateFilter.startDate)
        .filter('completed_at', 'lte', dateFilter.endDate);
      
      // Get total challenges completed
      const { count: totalChallengesCompleted } = await supabase
        .from('user_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .filter('completed_at', 'gte', dateFilter.startDate)
        .filter('completed_at', 'lte', dateFilter.endDate);
      
      // Get challenge completion rate
      const { count: totalChallengeAttempts } = await supabase
        .from('user_challenges')
        .select('*', { count: 'exact', head: true })
        .filter('created_at', 'gte', dateFilter.startDate)
        .filter('created_at', 'lte', dateFilter.endDate);
      
      const challengeCompletionRate = totalChallengeAttempts > 0 
        ? (totalChallengesCompleted / totalChallengeAttempts) * 100 
        : 0;
      
      // Get most popular challenges
      const { data: popularChallenges } = await supabase
        .rpc('get_popular_challenges', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate,
          limit_count: 10
        });
      
      // Get event metrics
      const { count: totalEventParticipants } = await supabase
        .from('user_event_participations')
        .select('*', { count: 'exact', head: true })
        .filter('joined_at', 'gte', dateFilter.startDate)
        .filter('joined_at', 'lte', dateFilter.endDate);
      
      const { count: totalPotentialParticipants } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .filter('start_date', 'lte', dateFilter.endDate)
        .filter('end_date', 'gte', dateFilter.startDate);
      
      const eventParticipationRate = totalPotentialParticipants > 0 
        ? (totalEventParticipants / (totalPotentialParticipants * totalUsers)) * 100 
        : 0;
      
      // Get most popular events
      const { data: popularEvents } = await supabase
        .rpc('get_popular_events', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate,
          limit_count: 5
        });
      
      // Get daily task metrics
      const { data: dailyTaskStats } = await supabase
        .rpc('get_daily_task_stats', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const dailyTaskCompletionRate = dailyTaskStats?.[0]?.completion_rate || 0;
      const averageDailyTasksCompleted = dailyTaskStats?.[0]?.avg_completed || 0;
      
      // Get streak metrics
      const { data: streakStats } = await supabase
        .rpc('get_streak_stats');
      
      const averageLoginStreak = streakStats?.[0]?.avg_streak || 0;
      const maxLoginStreak = streakStats?.[0]?.max_streak || 0;
      const usersWithActiveStreaks = streakStats?.[0]?.active_streaks || 0;
      
      // Get team metrics
      const { count: totalTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });
      
      const { data: teamStats } = await supabase
        .rpc('get_team_stats');
      
      const averageTeamSize = teamStats?.[0]?.avg_size || 0;
      const teamChallengesCompleted = teamStats?.[0]?.challenges_completed || 0;
      
      // Get point metrics
      const { data: pointStats } = await supabase
        .rpc('get_point_stats', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const totalPointsAwarded = pointStats?.[0]?.total_points || 0;
      const averagePointsPerUser = activeUsers > 0 ? totalPointsAwarded / activeUsers : 0;
      
      // Get points by source
      const { data: pointsBySource } = await supabase
        .rpc('get_points_by_source', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const pointsAwardedBySource: PointSourceMetric[] = pointsBySource?.map(item => ({
        source: item.source,
        points: item.points,
        percentage: (item.points / totalPointsAwarded) * 100
      })) || [];
      
      // Calculate challenges completed per user
      const challengesCompletedPerUser = engagedUsers > 0 ? totalChallengesCompleted / engagedUsers : 0;
      
      // Format challenge metrics
      const mostPopularChallenges: ChallengeMetric[] = popularChallenges?.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        category: challenge.category,
        difficulty: challenge.difficulty,
        completions: challenge.completions,
        completionRate: challenge.completion_rate
      })) || [];
      
      // Format event metrics
      const mostPopularEvents: EventMetric[] = popularEvents?.map(event => ({
        id: event.id,
        title: event.title,
        type: event.type,
        participants: event.participants,
        participationRate: event.participation_rate,
        challengesCompletedRate: event.challenges_completed_rate
      })) || [];
      
      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        engagedUsers: engagedUsers || 0,
        totalChallengesCompleted: totalChallengesCompleted || 0,
        challengesCompletedPerUser,
        mostPopularChallenges,
        challengeCompletionRate,
        totalEventParticipants: totalEventParticipants || 0,
        eventParticipationRate,
        mostPopularEvents,
        dailyTaskCompletionRate,
        averageDailyTasksCompleted,
        averageLoginStreak,
        maxLoginStreak,
        usersWithActiveStreaks,
        totalTeams: totalTeams || 0,
        averageTeamSize,
        teamChallengesCompleted,
        totalPointsAwarded,
        averagePointsPerUser,
        pointsAwardedBySource
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      throw error;
    }
  }

  /**
   * Get impact metrics for the gamification system
   * @param options Filter options
   * @returns Impact metrics
   */
  async getImpactMetrics(options: AnalyticsFilterOptions): Promise<GamificationImpactMetrics> {
    try {
      // Build date filter based on options
      const dateFilter = this.buildDateFilter(options);
      
      // Get retention metrics
      const { data: retentionData } = await supabase
        .rpc('get_retention_metrics', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const retentionRate = retentionData?.[0]?.overall_retention || 0;
      
      // Get retention by engagement level
      const { data: retentionByLevel } = await supabase
        .rpc('get_retention_by_engagement_level', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const retentionByEngagementLevel: Record<UserEngagementLevel, number> = {
        [UserEngagementLevel.INACTIVE]: 0,
        [UserEngagementLevel.CASUAL]: 0,
        [UserEngagementLevel.ENGAGED]: 0,
        [UserEngagementLevel.HIGHLY_ENGAGED]: 0,
        [UserEngagementLevel.POWER_USER]: 0
      };
      
      retentionByLevel?.forEach(item => {
        retentionByEngagementLevel[item.engagement_level as UserEngagementLevel] = item.retention_rate;
      });
      
      // Get activity metrics
      const { data: activityData } = await supabase
        .rpc('get_activity_metrics', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const averageSessionDuration = activityData?.[0]?.avg_session_duration || 0;
      const sessionsPerUser = activityData?.[0]?.sessions_per_user || 0;
      
      // Get activity by engagement level
      const { data: activityByLevel } = await supabase
        .rpc('get_activity_by_engagement_level', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const activityByEngagementLevel: Record<UserEngagementLevel, number> = {
        [UserEngagementLevel.INACTIVE]: 0,
        [UserEngagementLevel.CASUAL]: 0,
        [UserEngagementLevel.ENGAGED]: 0,
        [UserEngagementLevel.HIGHLY_ENGAGED]: 0,
        [UserEngagementLevel.POWER_USER]: 0
      };
      
      activityByLevel?.forEach(item => {
        activityByEngagementLevel[item.engagement_level as UserEngagementLevel] = item.avg_sessions;
      });
      
      // Get business metrics
      const { data: businessMetrics } = await supabase
        .rpc('get_business_metrics', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const bookingsPerUser = businessMetrics?.[0]?.bookings_per_user || 0;
      const bookingValuePerUser = businessMetrics?.[0]?.booking_value_per_user || 0;
      const referralsPerUser = businessMetrics?.[0]?.referrals_per_user || 0;
      
      // Get comparison metrics
      const { data: comparisonData } = await supabase
        .rpc('get_engagement_comparison_metrics', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const engagedVsNonEngagedRetention = {
        engaged: comparisonData?.[0]?.engaged_retention || 0,
        nonEngaged: comparisonData?.[0]?.non_engaged_retention || 0,
        difference: comparisonData?.[0]?.retention_difference || 0
      };
      
      const engagedVsNonEngagedBookings = {
        engaged: comparisonData?.[0]?.engaged_bookings || 0,
        nonEngaged: comparisonData?.[0]?.non_engaged_bookings || 0,
        difference: comparisonData?.[0]?.bookings_difference || 0
      };
      
      return {
        retentionRate,
        retentionByEngagementLevel,
        averageSessionDuration,
        sessionsPerUser,
        activityByEngagementLevel,
        bookingsPerUser,
        bookingValuePerUser,
        referralsPerUser,
        engagedVsNonEngagedRetention,
        engagedVsNonEngagedBookings
      };
    } catch (error) {
      console.error('Error getting impact metrics:', error);
      throw error;
    }
  }

  /**
   * Get user engagement metrics
   * @param userId User ID
   * @returns User engagement metrics
   */
  async getUserEngagementMetrics(userId: string): Promise<UserEngagementMetrics> {
    try {
      const { data } = await supabase
        .rpc('get_user_engagement_metrics', {
          user_id: userId
        });
      
      if (!data || data.length === 0) {
        throw new Error('User engagement metrics not found');
      }
      
      const metrics = data[0];
      
      // Determine engagement level based on metrics
      let engagementLevel = UserEngagementLevel.INACTIVE;
      
      if (metrics.total_points > 1000 && metrics.challenges_completed > 20 && metrics.days_active > 30) {
        engagementLevel = UserEngagementLevel.POWER_USER;
      } else if (metrics.total_points > 500 && metrics.challenges_completed > 10 && metrics.days_active > 14) {
        engagementLevel = UserEngagementLevel.HIGHLY_ENGAGED;
      } else if (metrics.total_points > 200 && metrics.challenges_completed > 5 && metrics.days_active > 7) {
        engagementLevel = UserEngagementLevel.ENGAGED;
      } else if (metrics.total_points > 0 || metrics.challenges_completed > 0) {
        engagementLevel = UserEngagementLevel.CASUAL;
      }
      
      return {
        userId,
        engagementLevel,
        totalPoints: metrics.total_points || 0,
        challengesCompleted: metrics.challenges_completed || 0,
        eventsParticipated: metrics.events_participated || 0,
        dailyTasksCompleted: metrics.daily_tasks_completed || 0,
        currentLoginStreak: metrics.current_login_streak || 0,
        longestLoginStreak: metrics.longest_login_streak || 0,
        lastActivityDate: metrics.last_activity_date || new Date().toISOString(),
        daysActive: metrics.days_active || 0,
        averageSessionsPerWeek: metrics.avg_sessions_per_week || 0,
        teamParticipation: metrics.team_participation || false
      };
    } catch (error) {
      console.error(`Error getting user engagement metrics for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user engagement distribution
   * @param options Filter options
   * @returns Distribution of users by engagement level
   */
  async getUserEngagementDistribution(options: AnalyticsFilterOptions): Promise<Record<UserEngagementLevel, number>> {
    try {
      const dateFilter = this.buildDateFilter(options);
      
      const { data } = await supabase
        .rpc('get_user_engagement_distribution', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate
        });
      
      const distribution: Record<UserEngagementLevel, number> = {
        [UserEngagementLevel.INACTIVE]: 0,
        [UserEngagementLevel.CASUAL]: 0,
        [UserEngagementLevel.ENGAGED]: 0,
        [UserEngagementLevel.HIGHLY_ENGAGED]: 0,
        [UserEngagementLevel.POWER_USER]: 0
      };
      
      data?.forEach(item => {
        distribution[item.engagement_level as UserEngagementLevel] = item.count;
      });
      
      return distribution;
    } catch (error) {
      console.error('Error getting user engagement distribution:', error);
      throw error;
    }
  }

  /**
   * Get time series data for points awarded over time
   * @param options Filter options
   * @returns Time series data
   */
  async getPointsAwardedOverTime(options: AnalyticsFilterOptions): Promise<TimeSeriesData[]> {
    try {
      const dateFilter = this.buildDateFilter(options);
      const interval = this.getTimeInterval(options.timePeriod);
      
      const { data } = await supabase
        .rpc('get_points_over_time', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate,
          time_interval: interval
        });
      
      return data?.map(item => ({
        date: item.date,
        value: item.points,
        category: item.source
      })) || [];
    } catch (error) {
      console.error('Error getting points awarded over time:', error);
      throw error;
    }
  }

  /**
   * Get time series data for user engagement over time
   * @param options Filter options
   * @returns Time series data
   */
  async getUserEngagementOverTime(options: AnalyticsFilterOptions): Promise<TimeSeriesData[]> {
    try {
      const dateFilter = this.buildDateFilter(options);
      const interval = this.getTimeInterval(options.timePeriod);
      
      const { data } = await supabase
        .rpc('get_user_engagement_over_time', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate,
          time_interval: interval
        });
      
      return data?.map(item => ({
        date: item.date,
        value: item.active_users,
        category: 'Active Users'
      })) || [];
    } catch (error) {
      console.error('Error getting user engagement over time:', error);
      throw error;
    }
  }

  /**
   * Get time series data for retention over time
   * @param options Filter options
   * @returns Time series data
   */
  async getRetentionOverTime(options: AnalyticsFilterOptions): Promise<TimeSeriesData[]> {
    try {
      const dateFilter = this.buildDateFilter(options);
      const interval = this.getTimeInterval(options.timePeriod);
      
      const { data } = await supabase
        .rpc('get_retention_over_time', {
          start_date: dateFilter.startDate,
          end_date: dateFilter.endDate,
          time_interval: interval
        });
      
      return data?.map(item => ({
        date: item.date,
        value: item.retention_rate,
        category: 'Retention Rate'
      })) || [];
    } catch (error) {
      console.error('Error getting retention over time:', error);
      throw error;
    }
  }

  /**
   * Get complete gamification analytics dashboard data
   * @param options Filter options
   * @returns Dashboard data
   */
  async getAnalyticsDashboard(options: AnalyticsFilterOptions): Promise<GamificationAnalyticsDashboard> {
    try {
      const engagementMetrics = await this.getEngagementMetrics(options);
      const impactMetrics = await this.getImpactMetrics(options);
      const userEngagementDistribution = await this.getUserEngagementDistribution(options);
      const pointsAwardedOverTime = await this.getPointsAwardedOverTime(options);
      const userEngagementOverTime = await this.getUserEngagementOverTime(options);
      const retentionOverTime = await this.getRetentionOverTime(options);
      
      return {
        engagementMetrics,
        impactMetrics,
        userEngagementDistribution,
        topChallenges: engagementMetrics.mostPopularChallenges,
        topEvents: engagementMetrics.mostPopularEvents,
        pointsAwardedOverTime,
        userEngagementOverTime,
        retentionOverTime
      };
    } catch (error) {
      console.error('Error getting analytics dashboard:', error);
      throw error;
    }
  }

  /**
   * Build date filter based on options
   * @param options Filter options
   * @returns Date filter
   */
  private buildDateFilter(options: AnalyticsFilterOptions): { startDate: string; endDate: string } {
    const endDate = options.endDate || new Date().toISOString();
    let startDate = options.startDate;
    
    if (!startDate) {
      const now = new Date();
      
      switch (options.timePeriod) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1)).toISOString();
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
          break;
        case 'all_time':
          startDate = '2000-01-01T00:00:00Z';
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      }
    }
    
    return { startDate, endDate };
  }

  /**
   * Get time interval for time series data
   * @param timePeriod Time period
   * @returns Time interval
   */
  private getTimeInterval(timePeriod: string): string {
    switch (timePeriod) {
      case 'day':
        return 'hour';
      case 'week':
        return 'day';
      case 'month':
        return 'day';
      case 'quarter':
        return 'week';
      case 'year':
        return 'month';
      case 'all_time':
        return 'month';
      default:
        return 'day';
    }
  }
}

// Export singleton instance
export const gamificationAnalyticsService = new GamificationAnalyticsService();
