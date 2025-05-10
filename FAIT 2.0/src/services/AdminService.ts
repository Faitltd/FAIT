import { supabase } from '../lib/supabase';
import {
  AdminUser,
  VerificationRequest,
  Dispute,
  DisputeMessage,
  AuditLog,
  SystemSettings,
  PlatformStats,
  UserActivityLog
} from '../types/admin';
import { Profile } from '../types/user';

/**
 * Service for handling admin functionality
 */
export class AdminService {
  /**
   * Get all users with pagination
   * @param page - Page number
   * @param pageSize - Number of users per page
   * @param searchQuery - Optional search query
   * @returns List of users and total count
   */
  async getUsers(
    page: number = 1,
    pageSize: number = 20,
    searchQuery?: string
  ): Promise<{ users: Profile[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Build query
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Add search if provided
      if (searchQuery) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );
      }

      // Add pagination
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching users:', error);
        return { users: [], total: 0 };
      }

      return { users: data as Profile[], total: count || 0 };
    } catch (error) {
      console.error('Error in getUsers:', error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Get user by ID
   * @param userId - The ID of the user to retrieve
   * @returns The user data
   */
  async getUserById(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * @param userId - The ID of the user to update
   * @param updates - The profile data to update
   * @returns The updated user profile
   */
  async updateUser(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  }

  /**
   * Get admin users
   * @returns List of admin users
   */
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*, profile:user_id(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }

      // Transform the data to match the AdminUser interface
      const adminUsers = data.map(item => ({
        ...item.profile,
        admin_role: item.admin_role,
        permissions: item.permissions,
        last_login: item.last_login,
        is_active: item.is_active
      }));

      return adminUsers as AdminUser[];
    } catch (error) {
      console.error('Error in getAdminUsers:', error);
      return [];
    }
  }

  /**
   * Create admin user
   * @param userId - The ID of the user to make an admin
   * @param adminRole - The admin role to assign
   * @param permissions - The permissions to grant
   * @returns The created admin user
   */
  async createAdminUser(
    userId: string,
    adminRole: string,
    permissions: string[]
  ): Promise<AdminUser | null> {
    try {
      // First, check if the user exists
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        return null;
      }

      // Create admin user
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          admin_role: adminRole,
          permissions: permissions,
          is_active: true
        })
        .select('*, profile:user_id(*)')
        .single();

      if (error) {
        console.error('Error creating admin user:', error);
        return null;
      }

      // Transform the data to match the AdminUser interface
      const adminUser = {
        ...data.profile,
        admin_role: data.admin_role,
        permissions: data.permissions,
        last_login: data.last_login,
        is_active: data.is_active
      };

      return adminUser as AdminUser;
    } catch (error) {
      console.error('Error in createAdminUser:', error);
      return null;
    }
  }

  /**
   * Update admin user
   * @param userId - The ID of the admin user to update
   * @param updates - The admin user data to update
   * @returns The updated admin user
   */
  async updateAdminUser(
    userId: string,
    updates: Partial<AdminUser>
  ): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .update({
          admin_role: updates.admin_role,
          permissions: updates.permissions,
          is_active: updates.is_active
        })
        .eq('user_id', userId)
        .select('*, profile:user_id(*)')
        .single();

      if (error) {
        console.error('Error updating admin user:', error);
        return null;
      }

      // Transform the data to match the AdminUser interface
      const adminUser = {
        ...data.profile,
        admin_role: data.admin_role,
        permissions: data.permissions,
        last_login: data.last_login,
        is_active: data.is_active
      };

      return adminUser as AdminUser;
    } catch (error) {
      console.error('Error in updateAdminUser:', error);
      return null;
    }
  }

  /**
   * Get verification requests with pagination
   * @param page - Page number
   * @param pageSize - Number of requests per page
   * @param status - Optional status filter
   * @returns List of verification requests and total count
   */
  async getVerificationRequests(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<{ requests: VerificationRequest[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Build query
      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          user:user_id(*),
          reviewer:reviewed_by(*),
          documents:verification_documents(*)
        `, { count: 'exact' });

      // Add status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Add pagination
      const { data, count, error } = await query
        .order('submitted_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching verification requests:', error);
        return { requests: [], total: 0 };
      }

      return { requests: data as VerificationRequest[], total: count || 0 };
    } catch (error) {
      console.error('Error in getVerificationRequests:', error);
      return { requests: [], total: 0 };
    }
  }

  /**
   * Get verification request by ID
   * @param requestId - The ID of the verification request to retrieve
   * @returns The verification request data
   */
  async getVerificationRequestById(requestId: string): Promise<VerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          user:user_id(*),
          reviewer:reviewed_by(*),
          documents:verification_documents(*)
        `)
        .eq('id', requestId)
        .single();

      if (error) {
        console.error('Error fetching verification request by ID:', error);
        return null;
      }

      return data as VerificationRequest;
    } catch (error) {
      console.error('Error in getVerificationRequestById:', error);
      return null;
    }
  }

  /**
   * Update verification request status
   * @param requestId - The ID of the verification request to update
   * @param status - The new status
   * @param reviewerId - The ID of the reviewer
   * @param rejectionReason - Optional rejection reason
   * @param expirationDate - Optional expiration date
   * @returns The updated verification request
   */
  async updateVerificationStatus(
    requestId: string,
    status: string,
    reviewerId: string,
    rejectionReason?: string,
    expirationDate?: string
  ): Promise<VerificationRequest | null> {
    try {
      const updates: any = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId
      };

      if (status === 'rejected' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      if (status === 'approved' && expirationDate) {
        updates.expiration_date = expirationDate;
      }

      const { data, error } = await supabase
        .from('verification_requests')
        .update(updates)
        .eq('id', requestId)
        .select(`
          *,
          user:user_id(*),
          reviewer:reviewed_by(*),
          documents:verification_documents(*)
        `)
        .single();

      if (error) {
        console.error('Error updating verification status:', error);
        return null;
      }

      return data as VerificationRequest;
    } catch (error) {
      console.error('Error in updateVerificationStatus:', error);
      return null;
    }
  }

  /**
   * Get disputes with pagination
   * @param page - Page number
   * @param pageSize - Number of disputes per page
   * @param status - Optional status filter
   * @returns List of disputes and total count
   */
  async getDisputes(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<{ disputes: Dispute[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Build query
      let query = supabase
        .from('disputes')
        .select(`
          *,
          creator:created_by(*),
          assignee:assigned_to(*)
        `, { count: 'exact' });

      // Add status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Add pagination
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching disputes:', error);
        return { disputes: [], total: 0 };
      }

      return { disputes: data as Dispute[], total: count || 0 };
    } catch (error) {
      console.error('Error in getDisputes:', error);
      return { disputes: [], total: 0 };
    }
  }

  /**
   * Get dispute by ID
   * @param disputeId - The ID of the dispute to retrieve
   * @returns The dispute data
   */
  async getDisputeById(disputeId: string): Promise<Dispute | null> {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          creator:created_by(*),
          assignee:assigned_to(*),
          messages:dispute_messages(
            *,
            user:user_id(*)
          )
        `)
        .eq('id', disputeId)
        .single();

      if (error) {
        console.error('Error fetching dispute by ID:', error);
        return null;
      }

      return data as Dispute;
    } catch (error) {
      console.error('Error in getDisputeById:', error);
      return null;
    }
  }

  /**
   * Update dispute
   * @param disputeId - The ID of the dispute to update
   * @param updates - The dispute data to update
   * @returns The updated dispute
   */
  async updateDispute(
    disputeId: string,
    updates: Partial<Dispute>
  ): Promise<Dispute | null> {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .update(updates)
        .eq('id', disputeId)
        .select(`
          *,
          creator:created_by(*),
          assignee:assigned_to(*)
        `)
        .single();

      if (error) {
        console.error('Error updating dispute:', error);
        return null;
      }

      return data as Dispute;
    } catch (error) {
      console.error('Error in updateDispute:', error);
      return null;
    }
  }

  /**
   * Add dispute message
   * @param disputeId - The ID of the dispute
   * @param userId - The ID of the user adding the message
   * @param message - The message content
   * @param isInternal - Whether the message is internal (admin only)
   * @returns The created dispute message
   */
  async addDisputeMessage(
    disputeId: string,
    userId: string,
    message: string,
    isInternal: boolean = false
  ): Promise<DisputeMessage | null> {
    try {
      const { data, error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          user_id: userId,
          message,
          is_internal: isInternal
        })
        .select(`
          *,
          user:user_id(*)
        `)
        .single();

      if (error) {
        console.error('Error adding dispute message:', error);
        return null;
      }

      return data as DisputeMessage;
    } catch (error) {
      console.error('Error in addDisputeMessage:', error);
      return null;
    }
  }

  /**
   * Get audit logs with pagination
   * @param page - Page number
   * @param pageSize - Number of logs per page
   * @param entityType - Optional entity type filter
   * @param userId - Optional user ID filter
   * @returns List of audit logs and total count
   */
  async getAuditLogs(
    page: number = 1,
    pageSize: number = 20,
    entityType?: string,
    userId?: string
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Build query
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id(*)
        `, { count: 'exact' });

      // Add filters if provided
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Add pagination
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return { logs: [], total: 0 };
      }

      return { logs: data as AuditLog[], total: count || 0 };
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get system settings
   * @param isPublic - Whether to get only public settings
   * @returns List of system settings
   */
  async getSystemSettings(isPublic: boolean = false): Promise<SystemSettings[]> {
    try {
      let query = supabase
        .from('system_settings')
        .select(`
          *,
          updater:updated_by(*)
        `);

      if (isPublic) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query
        .order('setting_key', { ascending: true });

      if (error) {
        console.error('Error fetching system settings:', error);
        return [];
      }

      return data as SystemSettings[];
    } catch (error) {
      console.error('Error in getSystemSettings:', error);
      return [];
    }
  }

  /**
   * Update system setting
   * @param settingKey - The key of the setting to update
   * @param settingValue - The new value
   * @param userId - The ID of the user updating the setting
   * @returns The updated system setting
   */
  async updateSystemSetting(
    settingKey: string,
    settingValue: string,
    userId: string
  ): Promise<SystemSettings | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          setting_value: settingValue,
          updated_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('setting_key', settingKey)
        .select(`
          *,
          updater:updated_by(*)
        `)
        .single();

      if (error) {
        console.error('Error updating system setting:', error);
        return null;
      }

      return data as SystemSettings;
    } catch (error) {
      console.error('Error in updateSystemSetting:', error);
      return null;
    }
  }

  /**
   * Get platform statistics
   * @returns Platform statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_platform_stats');

      if (error) {
        console.error('Error fetching platform stats:', error);
        return {
          total_users: 0,
          active_users: 0,
          total_projects: 0,
          active_projects: 0,
          total_disputes: 0,
          open_disputes: 0,
          total_verifications: 0,
          pending_verifications: 0
        };
      }

      return data as PlatformStats;
    } catch (error) {
      console.error('Error in getPlatformStats:', error);
      return {
        total_users: 0,
        active_users: 0,
        total_projects: 0,
        active_projects: 0,
        total_disputes: 0,
        open_disputes: 0,
        total_verifications: 0,
        pending_verifications: 0
      };
    }
  }

  /**
   * Get user activity logs
   * @param userId - The ID of the user
   * @param page - Page number
   * @param pageSize - Number of logs per page
   * @returns List of user activity logs and total count
   */
  async getUserActivityLogs(
    userId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ logs: UserActivityLog[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      const { data, count, error } = await supabase
        .from('user_activity_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching user activity logs:', error);
        return { logs: [], total: 0 };
      }

      return { logs: data as UserActivityLog[], total: count || 0 };
    } catch (error) {
      console.error('Error in getUserActivityLogs:', error);
      return { logs: [], total: 0 };
    }
  }
}

export const adminService = new AdminService();
