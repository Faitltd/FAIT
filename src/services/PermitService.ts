import { supabase } from '../lib/supabase';

// Types for permit data
export interface Permit {
  id?: string;
  permit_number: string;
  permit_type: string;
  status: string;
  address: string;
  description?: string;
  issue_date?: Date;
  expiration_date?: Date;
  valuation?: number;
  square_footage?: number;
  parcel_id?: string;
  external_id?: string;
  external_source?: string;
}

export interface PermitInspection {
  id?: string;
  permit_id: string;
  inspection_type: string;
  status: string;
  scheduled_date?: Date;
  completed_date?: Date;
  inspector_name?: string;
  comments?: string;
  external_id?: string;
  external_source?: string;
}

export interface ProjectPermit {
  id?: string;
  project_id: string;
  permit_id: string;
}

export interface PermitNotification {
  id?: string;
  permit_id: string;
  user_id: string;
  notification_type: string;
  message: string;
  is_read: boolean;
}

// Mock API configuration - to be replaced with actual Accela API credentials
const API_CONFIG = {
  baseUrl: 'https://apis.accela.com/v4',
  apiKey: import.meta.env.VITE_ACCELA_API_KEY || '',
  agency: 'DENVER'
};

class PermitService {
  /**
   * Search for permits by address
   * @param address The address to search for
   * @returns Array of permits matching the address
   */
  async searchPermitsByAddress(address: string): Promise<Permit[]> {
    try {
      // First, check our database for existing permits at this address
      const { data: existingPermits, error: dbError } = await supabase
        .from('permits')
        .select('*')
        .ilike('address', `%${address}%`);

      if (dbError) {
        console.error('Error fetching permits from database:', dbError);
        throw dbError;
      }

      // TODO: Implement actual API call to Denver ePermits (Accela API)
      // For now, we'll return the existing permits from our database
      // In a real implementation, we would:
      // 1. Call the Accela API to get permits for this address
      // 2. Compare with our database to find new permits
      // 3. Save new permits to our database
      // 4. Return the combined list

      return existingPermits as Permit[];
    } catch (error) {
      console.error('Error in searchPermitsByAddress:', error);
      throw error;
    }
  }

  /**
   * Search for permits by permit number
   * @param permitNumber The permit number to search for
   * @returns The permit matching the permit number, if found
   */
  async getPermitByNumber(permitNumber: string): Promise<Permit | null> {
    try {
      // Check our database first
      const { data: existingPermit, error: dbError } = await supabase
        .from('permits')
        .select('*')
        .eq('permit_number', permitNumber)
        .single();

      if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching permit from database:', dbError);
        throw dbError;
      }

      if (existingPermit) {
        return existingPermit as Permit;
      }

      // TODO: Implement actual API call to Denver ePermits (Accela API)
      // For now, return null if not found in our database
      return null;
    } catch (error) {
      console.error('Error in getPermitByNumber:', error);
      throw error;
    }
  }

  /**
   * Get inspections for a permit
   * @param permitId The ID of the permit
   * @returns Array of inspections for the permit
   */
  async getInspectionsForPermit(permitId: string): Promise<PermitInspection[]> {
    try {
      const { data: inspections, error } = await supabase
        .from('permit_inspections')
        .select('*')
        .eq('permit_id', permitId);

      if (error) {
        console.error('Error fetching inspections:', error);
        throw error;
      }

      return inspections as PermitInspection[];
    } catch (error) {
      console.error('Error in getInspectionsForPermit:', error);
      throw error;
    }
  }

  /**
   * Link a permit to a project
   * @param projectId The ID of the project
   * @param permitId The ID of the permit
   * @returns The created project_permit record
   */
  async linkPermitToProject(projectId: string, permitId: string): Promise<ProjectPermit> {
    try {
      const { data, error } = await supabase
        .from('project_permits')
        .insert({
          project_id: projectId,
          permit_id: permitId
        })
        .select()
        .single();

      if (error) {
        console.error('Error linking permit to project:', error);
        throw error;
      }

      return data as ProjectPermit;
    } catch (error) {
      console.error('Error in linkPermitToProject:', error);
      throw error;
    }
  }

  /**
   * Unlink a permit from a project
   * @param projectId The ID of the project
   * @param permitId The ID of the permit
   * @returns True if successful
   */
  async unlinkPermitFromProject(projectId: string, permitId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_permits')
        .delete()
        .match({
          project_id: projectId,
          permit_id: permitId
        });

      if (error) {
        console.error('Error unlinking permit from project:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in unlinkPermitFromProject:', error);
      throw error;
    }
  }

  /**
   * Get permits for a project
   * @param projectId The ID of the project
   * @returns Array of permits linked to the project
   */
  async getPermitsForProject(projectId: string): Promise<Permit[]> {
    try {
      const { data, error } = await supabase
        .from('project_permits')
        .select(`
          permit_id,
          permits:permit_id (*)
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching permits for project:', error);
        throw error;
      }

      // Extract the permits from the joined data
      return data.map(item => item.permits) as Permit[];
    } catch (error) {
      console.error('Error in getPermitsForProject:', error);
      throw error;
    }
  }

  /**
   * Get a permit by ID
   * @param permitId The ID of the permit
   * @returns The permit data
   */
  async getPermitById(permitId: string): Promise<{ data: Permit | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('permits')
        .select('*')
        .eq('id', permitId)
        .single();

      return { data: data as Permit, error };
    } catch (error) {
      console.error('Error in getPermitById:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a notification for a permit update
   * @param permitId The ID of the permit
   * @param userId The ID of the user to notify
   * @param type The type of notification
   * @param message The notification message
   * @returns The created notification
   */
  async createPermitNotification(
    permitId: string,
    userId: string,
    type: string,
    message: string
  ): Promise<PermitNotification> {
    try {
      const { data, error } = await supabase
        .from('permit_notifications')
        .insert({
          permit_id: permitId,
          user_id: userId,
          notification_type: type,
          message: message,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating permit notification:', error);
        throw error;
      }

      return data as PermitNotification;
    } catch (error) {
      console.error('Error in createPermitNotification:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId The ID of the notification
   * @returns True if successful
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('permit_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * @param userId The ID of the user
   * @param unreadOnly Whether to only return unread notifications
   * @returns Array of notifications for the user
   */
  async getNotificationsForUser(userId: string, unreadOnly = false): Promise<PermitNotification[]> {
    try {
      let query = supabase
        .from('permit_notifications')
        .select(`
          *,
          permits:permit_id (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data as unknown as PermitNotification[];
    } catch (error) {
      console.error('Error in getNotificationsForUser:', error);
      throw error;
    }
  }

  /**
   * Save a permit to the database
   * @param permit The permit to save
   * @returns The saved permit
   */
  async savePermit(permit: Permit): Promise<Permit> {
    try {
      // Check if the permit already exists
      const existingPermit = await this.getPermitByNumber(permit.permit_number);

      if (existingPermit) {
        // Update the existing permit
        const { data, error } = await supabase
          .from('permits')
          .update(permit)
          .eq('id', existingPermit.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating permit:', error);
          throw error;
        }

        return data as Permit;
      } else {
        // Insert a new permit
        const { data, error } = await supabase
          .from('permits')
          .insert(permit)
          .select()
          .single();

        if (error) {
          console.error('Error inserting permit:', error);
          throw error;
        }

        return data as Permit;
      }
    } catch (error) {
      console.error('Error in savePermit:', error);
      throw error;
    }
  }

  /**
   * Save an inspection to the database
   * @param inspection The inspection to save
   * @returns The saved inspection
   */
  async saveInspection(inspection: PermitInspection): Promise<PermitInspection> {
    try {
      // Check if the inspection already exists by external_id if available
      let existingInspection = null;

      if (inspection.external_id) {
        const { data, error } = await supabase
          .from('permit_inspections')
          .select('*')
          .eq('external_id', inspection.external_id)
          .eq('external_source', inspection.external_source || 'denver_epermits')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking for existing inspection:', error);
          throw error;
        }

        existingInspection = data;
      }

      if (existingInspection) {
        // Update the existing inspection
        const { data, error } = await supabase
          .from('permit_inspections')
          .update(inspection)
          .eq('id', existingInspection.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating inspection:', error);
          throw error;
        }

        return data as PermitInspection;
      } else {
        // Insert a new inspection
        const { data, error } = await supabase
          .from('permit_inspections')
          .insert(inspection)
          .select()
          .single();

        if (error) {
          console.error('Error inserting inspection:', error);
          throw error;
        }

        return data as PermitInspection;
      }
    } catch (error) {
      console.error('Error in saveInspection:', error);
      throw error;
    }
  }
}

export const permitService = new PermitService();
export default permitService;
