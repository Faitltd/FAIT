import { supabase } from '../lib/supabase';
import {
  TimeRange,
  Metric,
  Chart,
  Dashboard,
  UserActivity,
  UserMetrics,
  GrowthMetrics,
  AnalyticsFilter,
  AnalyticsEvent,
  ABTest
} from '../types/analytics.types';

/**
 * Service for handling analytics functionality
 */
export class AnalyticsService {
  /**
   * Track an analytics event
   * @param eventType Event type
   * @param userId User ID (optional)
   * @param resourceType Resource type (optional)
   * @param resourceId Resource ID (optional)
   * @param metadata Additional metadata (optional)
   * @returns Created event
   */
  async trackEvent(
    eventType: string,
    userId?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ): Promise<AnalyticsEvent | null> {
    try {
      // Get user type if userId is provided
      let userType;
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .single();

        if (!profileError && profile) {
          userType = profile.user_type;
        }
      }

      // Create the event
      const { data, error } = await supabase
        .from('analytics_events')
        .insert([
          {
            event_type: eventType,
            user_id: userId,
            user_type: userType,
            resource_type: resourceType,
            resource_id: resourceId,
            metadata
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error tracking event:', error);
        return null;
      }

      return data as AnalyticsEvent;
    } catch (error) {
      console.error('Error in trackEvent:', error);
      return null;
    }
  }

  /**
   * Get growth metrics
   * @param filter Analytics filter
   * @returns Growth metrics
   */
  async getGrowthMetrics(filter: AnalyticsFilter): Promise<GrowthMetrics> {
    try {
      const { data, error } = await supabase.rpc('get_growth_metrics', {
        p_time_range: filter.time_range,
        p_custom_start_date: filter.custom_start_date,
        p_custom_end_date: filter.custom_end_date,
        p_user_segment: filter.user_segment || 'all'
      });

      if (error) {
        console.error('Error fetching growth metrics:', error);
        return {
          new_users: { value: 0 },
          active_users: { value: 0 },
          user_retention: { value: 0 },
          referrals: { value: 0 },
          conversion_rate: { value: 0 },
          verification_rate: { value: 0 },
          forum_activity: { value: 0 },
          points_awarded: { value: 0 },
          achievements_unlocked: { value: 0 }
        };
      }

      return data as GrowthMetrics;
    } catch (error) {
      console.error('Error in getGrowthMetrics:', error);
      return {
        new_users: { value: 0 },
        active_users: { value: 0 },
        user_retention: { value: 0 },
        referrals: { value: 0 },
        conversion_rate: { value: 0 },
        verification_rate: { value: 0 },
        forum_activity: { value: 0 },
        points_awarded: { value: 0 },
        achievements_unlocked: { value: 0 }
      };
    }
  }

  /**
   * Get user metrics
   * @param userId User ID
   * @returns User metrics
   */
  async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_metrics', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
      }

      return data as UserMetrics;
    } catch (error) {
      console.error('Error in getUserMetrics:', error);
      return null;
    }
  }

  /**
   * Get user activity
   * @param userId User ID
   * @param limit Number of activities to return
   * @param offset Offset for pagination
   * @returns List of user activities
   */
  async getUserActivity(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching user activity:', error);
        return [];
      }

      return data.map(event => ({
        user_id: event.user_id,
        action: event.event_type,
        resource_type: event.resource_type || '',
        resource_id: event.resource_id,
        metadata: event.metadata,
        created_at: event.created_at
      })) as UserActivity[];
    } catch (error) {
      console.error('Error in getUserActivity:', error);
      return [];
    }
  }

  /**
   * Get dashboard
   * @param dashboardId Dashboard ID
   * @param filter Analytics filter
   * @returns Dashboard
   */
  async getDashboard(
    dashboardId: string,
    filter: AnalyticsFilter
  ): Promise<Dashboard | null> {
    try {
      // Get dashboard definition
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('analytics_dashboards')
        .select('*')
        .eq('id', dashboardId)
        .single();

      if (dashboardError) {
        console.error('Error fetching dashboard:', dashboardError);
        return null;
      }

      // Get metrics
      const { data: metricsData, error: metricsError } = await supabase.rpc('get_dashboard_metrics', {
        p_dashboard_id: dashboardId,
        p_time_range: filter.time_range,
        p_custom_start_date: filter.custom_start_date,
        p_custom_end_date: filter.custom_end_date,
        p_user_segment: filter.user_segment || 'all'
      });

      if (metricsError) {
        console.error('Error fetching dashboard metrics:', metricsError);
        return null;
      }

      // Get charts
      const { data: chartsData, error: chartsError } = await supabase.rpc('get_dashboard_charts', {
        p_dashboard_id: dashboardId,
        p_time_range: filter.time_range,
        p_custom_start_date: filter.custom_start_date,
        p_custom_end_date: filter.custom_end_date,
        p_user_segment: filter.user_segment || 'all'
      });

      if (chartsError) {
        console.error('Error fetching dashboard charts:', chartsError);
        return null;
      }

      return {
        ...dashboardData,
        metrics: metricsData,
        charts: chartsData
      } as Dashboard;
    } catch (error) {
      console.error('Error in getDashboard:', error);
      return null;
    }
  }

  /**
   * Get all dashboards
   * @returns List of dashboards
   */
  async getAllDashboards(): Promise<Dashboard[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboards:', error);
        return [];
      }

      return data as Dashboard[];
    } catch (error) {
      console.error('Error in getAllDashboards:', error);
      return [];
    }
  }

  /**
   * Get A/B tests
   * @param status Filter by status (optional)
   * @returns List of A/B tests
   */
  async getABTests(status?: 'draft' | 'running' | 'completed' | 'cancelled'): Promise<ABTest[]> {
    try {
      let query = supabase
        .from('analytics_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching A/B tests:', error);
        return [];
      }

      return data as ABTest[];
    } catch (error) {
      console.error('Error in getABTests:', error);
      return [];
    }
  }

  /**
   * Get A/B test by ID
   * @param testId A/B test ID
   * @returns A/B test
   */
  async getABTestById(testId: string): Promise<ABTest | null> {
    try {
      const { data, error } = await supabase
        .from('analytics_ab_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) {
        console.error('Error fetching A/B test:', error);
        return null;
      }

      return data as ABTest;
    } catch (error) {
      console.error('Error in getABTestById:', error);
      return null;
    }
  }

  /**
   * Get user segment for A/B testing
   * @param userId User ID
   * @param testId A/B test ID
   * @returns Variant ID
   */
  async getUserABTestVariant(userId: string, testId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_ab_test_variant', {
        p_user_id: userId,
        p_test_id: testId
      });

      if (error) {
        console.error('Error fetching user A/B test variant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserABTestVariant:', error);
      return null;
    }
  }

  /**
   * Track A/B test conversion
   * @param userId User ID
   * @param testId A/B test ID
   * @param variantId Variant ID
   * @param conversionType Conversion type
   * @param metadata Additional metadata (optional)
   * @returns Success status
   */
  async trackABTestConversion(
    userId: string,
    testId: string,
    variantId: string,
    conversionType: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analytics_ab_test_conversions')
        .insert([
          {
            user_id: userId,
            test_id: testId,
            variant_id: variantId,
            conversion_type: conversionType,
            metadata
          }
        ]);

      if (error) {
        console.error('Error tracking A/B test conversion:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in trackABTestConversion:', error);
      return false;
    }
  }

  /**
   * Get time range dates
   * @param timeRange Time range
   * @param customStartDate Custom start date (for custom time range)
   * @param customEndDate Custom end date (for custom time range)
   * @returns Start and end dates
   */
  getTimeRangeDates(
    timeRange: TimeRange,
    customStartDate?: string,
    customEndDate?: string
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let endDate = new Date(now);
    let startDate = new Date(now);

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last_30_days':
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all_time':
        startDate = new Date(2020, 0, 1); // Arbitrary start date
        break;
      case 'custom':
        if (customStartDate) {
          startDate = new Date(customStartDate);
        }
        if (customEndDate) {
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { startDate, endDate };
  }
}

// Create a singleton instance
export const analyticsService = new AnalyticsService();
