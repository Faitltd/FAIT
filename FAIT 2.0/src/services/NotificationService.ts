import { supabase } from '../lib/supabase';
import { Notification } from '../types/communication';

/**
 * Service for handling notifications
 */
export class NotificationService {
  /**
   * Get notifications for the current user
   * @param limit - Optional limit on number of notifications to return
   * @param offset - Optional offset for pagination
   * @returns List of notifications and total count
   */
  async getNotifications(limit: number = 20, offset: number = 0): Promise<{ data: Notification[]; count: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: [], count: 0 };
      }

      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching notifications:', error);
        return { data: [], count: 0 };
      }

      return { data: data as Notification[], count: count || 0 };
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return { data: [], count: 0 };
    }
  }

  /**
   * Get unread notifications count for the current user
   * @returns Number of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return 0;
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId - The ID of the notification to mark as read
   * @returns Success status
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for the current user
   * @returns Success status
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }

  /**
   * Create a notification for a user
   * @param userId - The ID of the user to notify
   * @param title - The notification title
   * @param message - The notification message
   * @param type - The notification type
   * @param actionUrl - Optional URL to navigate to when clicking the notification
   * @param relatedId - Optional ID of the related entity
   * @param relatedType - Optional type of the related entity
   * @returns The created notification
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    actionUrl?: string,
    relatedId?: string,
    relatedType?: string
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          action_url: actionUrl,
          related_id: relatedId,
          related_type: relatedType,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data as Notification;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  }

  /**
   * Delete a notification
   * @param notificationId - The ID of the notification to delete
   * @returns Success status
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time notifications
   * @param callback - Function to call when a new notification is received
   * @returns Supabase subscription
   */
  async subscribeToNotifications(callback: (notification: Notification) => void): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            callback(payload.new as Notification);
          }
        )
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error in subscribeToNotifications:', error);
      return null;
    }
  }

  /**
   * Create a forum reply notification
   * @param postAuthorId - The ID of the post author
   * @param replyAuthorName - The name of the user who replied
   * @param threadTitle - The title of the thread
   * @param threadSlug - The slug of the thread
   * @param postId - The ID of the post
   * @returns The created notification
   */
  async createForumReplyNotification(
    postAuthorId: string,
    replyAuthorName: string,
    threadTitle: string,
    threadSlug: string,
    postId: string
  ): Promise<Notification | null> {
    return this.createNotification(
      postAuthorId,
      'New Reply to Your Post',
      `${replyAuthorName} replied to your post in "${threadTitle}"`,
      'forum_reply',
      `/forum/thread/${threadSlug}#post-${postId}`,
      postId,
      'forum_post'
    );
  }

  /**
   * Create a forum mention notification
   * @param mentionedUserId - The ID of the mentioned user
   * @param mentioningUserName - The name of the user who mentioned them
   * @param threadTitle - The title of the thread
   * @param threadSlug - The slug of the thread
   * @param postId - The ID of the post
   * @returns The created notification
   */
  async createForumMentionNotification(
    mentionedUserId: string,
    mentioningUserName: string,
    threadTitle: string,
    threadSlug: string,
    postId: string
  ): Promise<Notification | null> {
    return this.createNotification(
      mentionedUserId,
      'You Were Mentioned',
      `${mentioningUserName} mentioned you in "${threadTitle}"`,
      'forum_mention',
      `/forum/thread/${threadSlug}#post-${postId}`,
      postId,
      'forum_post'
    );
  }

  /**
   * Create a solution notification
   * @param postAuthorId - The ID of the post author
   * @param threadAuthorName - The name of the thread author
   * @param threadTitle - The title of the thread
   * @param threadSlug - The slug of the thread
   * @param postId - The ID of the post
   * @returns The created notification
   */
  async createSolutionNotification(
    postAuthorId: string,
    threadAuthorName: string,
    threadTitle: string,
    threadSlug: string,
    postId: string
  ): Promise<Notification | null> {
    return this.createNotification(
      postAuthorId,
      'Your Post Was Marked as Solution',
      `${threadAuthorName} marked your post as the solution in "${threadTitle}"`,
      'forum_solution',
      `/forum/thread/${threadSlug}#post-${postId}`,
      postId,
      'forum_post'
    );
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();
