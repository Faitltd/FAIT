import { supabase } from '../lib/supabaseClient';

export async function getNotifications(limit = 20, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, count };
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
}

export async function getUnreadNotificationsCount() {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const { error } = await supabase.rpc('mark_notifications_as_read', {
      p_notification_ids: [notificationId]
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const { error } = await supabase.rpc('mark_all_notifications_as_read');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function subscribeToNotifications(callback) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Subscribe to notifications table changes
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    throw error;
  }
}

export async function createManualNotification(userId, type, title, message, data = {}) {
  try {
    const { data: notificationId, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_data: data
    });

    if (error) throw error;

    return notificationId;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function deleteNotification(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}
