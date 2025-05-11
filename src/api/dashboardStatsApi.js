import { supabase, isUsingLocalAuth } from '../lib/supabase';
import {
  simulatedClientDashboardStats,
  simulatedServiceAgentDashboardStats,
  simulatedAdminDashboardStats,
  simulatedRecentActivity
} from '../utils/simulatedData';

export async function getAdminDashboardStats() {
  try {
    // Use simulated data if in local auth mode
    if (isUsingLocalAuth()) {
      console.log('Using simulated admin dashboard stats');
      return simulatedAdminDashboardStats;
    }

    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    throw error;
  }
}

export async function getServiceAgentDashboardStats(serviceAgentId) {
  try {
    // Use simulated data if in local auth mode
    if (isUsingLocalAuth()) {
      console.log('Using simulated service agent dashboard stats');
      return simulatedServiceAgentDashboardStats;
    }

    const { data, error } = await supabase.rpc('get_service_agent_dashboard_stats', {
      p_service_agent_id: serviceAgentId
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting service agent dashboard stats:', error);
    throw error;
  }
}

export async function getClientDashboardStats(clientId) {
  try {
    // Use simulated data if in local auth mode
    if (isUsingLocalAuth()) {
      console.log('Using simulated client dashboard stats');
      return simulatedClientDashboardStats;
    }

    const { data, error } = await supabase.rpc('get_client_dashboard_stats', {
      p_client_id: clientId
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting client dashboard stats:', error);
    throw error;
  }
}

export async function getRecentActivity(userId, userType) {
  try {
    // Use simulated data if in local auth mode
    if (isUsingLocalAuth()) {
      console.log('Using simulated recent activity data');
      return simulatedRecentActivity;
    }

    let query;

    if (userType === 'admin') {
      // Get recent activity for admin (audit logs, new users, bookings, etc.)
      query = supabase
        .from('admin_audit_logs')
        .select(`
          id,
          action_type,
          table_name,
          created_at,
          admin:admin_id(
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
    } else if (userType === 'service_agent') {
      // Get recent activity for service agent (bookings, messages, etc.)
      query = supabase
        .from('bookings')
        .select(`
          id,
          status,
          service_date,
          created_at,
          client:client_id(
            id,
            first_name,
            last_name
          ),
          services:service_id(
            id,
            name
          )
        `)
        .eq('service_agent_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
    } else {
      // Get recent activity for client (bookings, messages, etc.)
      query = supabase
        .from('bookings')
        .select(`
          id,
          status,
          service_date,
          created_at,
          service_agent:service_agent_id(
            id,
            first_name,
            last_name
          ),
          services:service_id(
            id,
            name
          )
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw error;
  }
}

export async function getUnreadCounts(userId) {
  try {
    // Use simulated data if in local auth mode
    if (isUsingLocalAuth()) {
      console.log('Using simulated unread counts data');
      return {
        messages: 3,
        notifications: 2,
        pendingBookings: 2,
        total: 7
      };
    }

    // Get unread message count
    const { count: messageCount, error: messageError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('read', false)
      .neq('sender_id', userId)
      .in('conversation_id', (query) => {
        query
          .from('conversations')
          .select('id')
          .or(`client_id.eq.${userId},service_agent_id.eq.${userId}`);
      });

    if (messageError) throw messageError;

    // Get unread notification count
    const { count: notificationCount, error: notificationError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (notificationError) throw notificationError;

    // Get pending booking count
    const { count: pendingBookingCount, error: bookingError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .or(`client_id.eq.${userId},service_agent_id.eq.${userId}`);

    if (bookingError) throw bookingError;

    return {
      messages: messageCount || 0,
      notifications: notificationCount || 0,
      pendingBookings: pendingBookingCount || 0,
      total: (messageCount || 0) + (notificationCount || 0) + (pendingBookingCount || 0)
    };
  } catch (error) {
    console.error('Error getting unread counts:', error);
    throw error;
  }
}
