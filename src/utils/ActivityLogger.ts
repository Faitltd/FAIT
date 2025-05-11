import { supabase } from '../lib/supabaseClient';

/**
 * Activity types for logging
 */
export enum ActivityType {
  // Authentication activities
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PROFILE_UPDATE = 'profile_update',
  
  // Service agent activities
  SERVICE_CREATED = 'service_created',
  SERVICE_UPDATED = 'service_updated',
  SERVICE_DELETED = 'service_deleted',
  AVAILABILITY_UPDATED = 'availability_updated',
  
  // Client activities
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  BOOKING_CANCELLED = 'booking_cancelled',
  REVIEW_SUBMITTED = 'review_submitted',
  
  // Admin activities
  USER_VERIFIED = 'user_verified',
  USER_REJECTED = 'user_rejected',
  SYSTEM_SETTING_UPDATED = 'system_setting_updated',
  
  // Payment activities
  PAYMENT_PROCESSED = 'payment_processed',
  REFUND_PROCESSED = 'refund_processed',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  
  // Other activities
  ACCOUNT_DEACTIVATED = 'account_deactivated',
  ACCOUNT_REACTIVATED = 'account_reactivated',
  ERROR = 'error'
}

/**
 * Interface for activity data
 */
interface ActivityData {
  [key: string]: any;
}

/**
 * Class for logging user activities
 */
class ActivityLogger {
  /**
   * Log an activity
   * @param userId User ID
   * @param activityType Type of activity
   * @param data Additional data related to the activity
   * @param ipAddress IP address (optional)
   * @returns Promise<boolean> Success status
   */
  static async logActivity(
    userId: string,
    activityType: ActivityType,
    data: ActivityData = {},
    ipAddress?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: data,
          ip_address: ipAddress,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      
      // Try to log the error itself
      try {
        await supabase
          .from('user_activities')
          .insert({
            user_id: userId,
            activity_type: ActivityType.ERROR,
            activity_data: {
              error_message: error instanceof Error ? error.message : 'Unknown error',
              original_activity_type: activityType,
              original_activity_data: data
            },
            created_at: new Date().toISOString()
          });
      } catch (logError) {
        console.error('Error logging activity error:', logError);
      }
      
      return false;
    }
  }
  
  /**
   * Get activities for a user
   * @param userId User ID
   * @param limit Number of activities to return (default: 50)
   * @param offset Offset for pagination (default: 0)
   * @param activityTypes Filter by activity types (optional)
   * @returns Promise<any[]> Array of activities
   */
  static async getUserActivities(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    activityTypes?: ActivityType[]
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (activityTypes && activityTypes.length > 0) {
        query = query.in('activity_type', activityTypes);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }
  
  /**
   * Get all activities (admin only)
   * @param limit Number of activities to return (default: 50)
   * @param offset Offset for pagination (default: 0)
   * @param userId Filter by user ID (optional)
   * @param activityTypes Filter by activity types (optional)
   * @returns Promise<any[]> Array of activities
   */
  static async getAllActivities(
    limit: number = 50,
    offset: number = 0,
    userId?: string,
    activityTypes?: ActivityType[]
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('user_activities')
        .select(`
          *,
          user:profiles!user_activities_user_id_fkey(
            id,
            full_name,
            email,
            user_type
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (activityTypes && activityTypes.length > 0) {
        query = query.in('activity_type', activityTypes);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching all activities:', error);
      return [];
    }
  }
  
  /**
   * Get activity statistics
   * @param userId User ID (optional, for admin to get stats for a specific user)
   * @param days Number of days to include in stats (default: 30)
   * @returns Promise<any> Activity statistics
   */
  static async getActivityStats(userId?: string, days: number = 30): Promise<any> {
    try {
      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Format dates for SQL
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      // Build the query
      let query = supabase.rpc('get_activity_stats', {
        p_start_date: startDateStr,
        p_end_date: endDateStr,
        p_user_id: userId || null
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || {};
    } catch (error) {
      console.error('Error fetching activity statistics:', error);
      return {};
    }
  }
}

export default ActivityLogger;
