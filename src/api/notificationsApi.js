import { supabase } from '../lib/supabaseClient';

export async function getNotifications(limit = 20, offset = 0) {

  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      console.log('User not authenticated, returning empty notifications');
      return { data: [], count: 0 };
    }

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id) // Make sure to filter by user_id
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { data: [], count: 0 }; // Return empty data instead of throwing
  }
}

export async function getUnreadNotificationsCount() {

  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      console.log('User not authenticated, returning 0 unread notifications');
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id) // Make sure to filter by user_id
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      console.log('User not authenticated, skipping mark notification as read');
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase.rpc('mark_notifications_as_read', {
      p_notification_ids: [notificationId]
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message }; // Return error info instead of throwing
  }
}

export async function markAllNotificationsAsRead() {

  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      console.log('User not authenticated, skipping mark all notifications as read');
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase.rpc('mark_all_notifications_as_read');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message }; // Return error info instead of throwing
  }
}

export async function subscribeToNotifications(callback) {
  try {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      console.log('User not authenticated, skipping notifications subscription');
      // Return a dummy subscription object
      return {
        unsubscribe: () => console.log('Unsubscribing from dummy subscription')
      };
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
    // Return a dummy subscription object instead of throwing
    return {
      unsubscribe: () => console.log('Unsubscribing from dummy subscription')
    };
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
