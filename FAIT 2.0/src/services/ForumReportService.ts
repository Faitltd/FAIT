import { supabase } from '../lib/supabase';

/**
 * Service for handling forum post reports
 */
export class ForumReportService {
  /**
   * Report a forum post
   * @param userId - The ID of the user reporting the post
   * @param postId - The ID of the post being reported
   * @param reason - The reason for reporting
   * @param details - Additional details about the report
   * @returns The created report
   */
  async reportPost(
    userId: string,
    postId: string,
    reason: string,
    details?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('forum_post_reports')
        .insert({
          post_id: postId,
          user_id: userId,
          reason,
          details: details || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error reporting post:', error);
        throw error;
      }

      // Create a notification for admins
      await this.notifyAdminsAboutReport(data);

      return data;
    } catch (error) {
      console.error('Error in reportPost:', error);
      throw error;
    }
  }

  /**
   * Get reports for a specific post
   * @param postId - The ID of the post
   * @returns List of reports for the post
   */
  async getReportsForPost(postId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('forum_post_reports')
        .select(`
          *,
          reporter:user_id(id, full_name, avatar_url),
          post:post_id(id, content, thread_id),
          moderator:moderator_id(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching post reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReportsForPost:', error);
      return [];
    }
  }

  /**
   * Get all pending reports
   * @param limit - Optional limit on number of reports to return
   * @param offset - Optional offset for pagination
   * @returns List of pending reports
   */
  async getPendingReports(limit?: number, offset?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('forum_post_reports')
        .select(`
          *,
          reporter:user_id(id, full_name, avatar_url),
          post:post_id(id, content, thread_id),
          thread:post:post_id(thread_id(id, title, slug))
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (limit !== undefined) {
        query = query.limit(limit);
      }

      if (offset !== undefined) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching pending reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingReports:', error);
      return [];
    }
  }

  /**
   * Update a report status
   * @param reportId - The ID of the report
   * @param status - The new status
   * @param moderatorId - The ID of the moderator handling the report
   * @param resolution - Optional resolution notes
   * @returns The updated report
   */
  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'resolved' | 'dismissed',
    moderatorId: string,
    resolution?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('forum_post_reports')
        .update({
          status,
          moderator_id: moderatorId,
          resolution: resolution || null,
          resolved_at: status !== 'pending' ? new Date().toISOString() : null
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        console.error('Error updating report status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateReportStatus:', error);
      throw error;
    }
  }

  /**
   * Notify admins about a new report
   * @param report - The report that was created
   * @private
   */
  private async notifyAdminsAboutReport(report: any): Promise<void> {
    try {
      // Get admins
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_role', 'admin');

      if (adminsError) {
        console.error('Error fetching admins:', adminsError);
        return;
      }

      // Get post and thread info
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          thread:thread_id(id, title)
        `)
        .eq('id', report.post_id)
        .single();

      if (postError) {
        console.error('Error fetching post for notification:', postError);
        return;
      }

      // Create notifications for each admin
      for (const admin of admins || []) {
        await supabase
          .from('notifications')
          .insert({
            user_id: admin.id,
            title: 'New Post Report',
            message: `A post in "${post.thread.title}" has been reported for "${report.reason}"`,
            type: 'forum_report',
            action_url: `/admin/forum/reports/${report.id}`,
            related_id: report.id,
            related_type: 'forum_post_report'
          });
      }
    } catch (error) {
      console.error('Error notifying admins about report:', error);
    }
  }
}

// Create a singleton instance
export const forumReportService = new ForumReportService();
