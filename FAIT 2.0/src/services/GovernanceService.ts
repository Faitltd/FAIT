import { supabase } from '../lib/supabase';
import { 
  GovernanceRole, 
  MemberRole, 
  DividendEligibility, 
  DividendDistribution,
  DividendPayment,
  BylawsVersion,
  BylawsAcknowledgment
} from '../types/governance';

/**
 * Service for handling governance-related functionality
 */
export class GovernanceService {
  /**
   * Get all governance roles
   * @returns List of governance roles
   */
  async getGovernanceRoles(): Promise<GovernanceRole[]> {
    try {
      const { data, error } = await supabase
        .from('governance_roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching governance roles:', error);
        return [];
      }

      return data as GovernanceRole[];
    } catch (error) {
      console.error('Error in getGovernanceRoles:', error);
      return [];
    }
  }

  /**
   * Create a new governance role
   * @param role - The role data to create
   * @returns The created role
   */
  async createGovernanceRole(role: Partial<GovernanceRole>): Promise<GovernanceRole | null> {
    try {
      const { data, error } = await supabase
        .from('governance_roles')
        .insert(role)
        .select()
        .single();

      if (error) {
        console.error('Error creating governance role:', error);
        return null;
      }

      return data as GovernanceRole;
    } catch (error) {
      console.error('Error in createGovernanceRole:', error);
      return null;
    }
  }

  /**
   * Update a governance role
   * @param roleId - The ID of the role to update
   * @param updates - The role data to update
   * @returns The updated role
   */
  async updateGovernanceRole(roleId: string, updates: Partial<GovernanceRole>): Promise<GovernanceRole | null> {
    try {
      const { data, error } = await supabase
        .from('governance_roles')
        .update(updates)
        .eq('id', roleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating governance role:', error);
        return null;
      }

      return data as GovernanceRole;
    } catch (error) {
      console.error('Error in updateGovernanceRole:', error);
      return null;
    }
  }

  /**
   * Delete a governance role
   * @param roleId - The ID of the role to delete
   * @returns True if successful, false otherwise
   */
  async deleteGovernanceRole(roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('governance_roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        console.error('Error deleting governance role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteGovernanceRole:', error);
      return false;
    }
  }

  /**
   * Get member roles for a specific member
   * @param memberId - The ID of the member
   * @returns List of member roles
   */
  async getMemberRoles(memberId: string): Promise<MemberRole[]> {
    try {
      const { data, error } = await supabase
        .from('member_roles')
        .select(`
          *,
          role:role_id(*)
        `)
        .eq('member_id', memberId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching member roles:', error);
        return [];
      }

      return data as MemberRole[];
    } catch (error) {
      console.error('Error in getMemberRoles:', error);
      return [];
    }
  }

  /**
   * Assign a role to a member
   * @param memberRole - The member role data to create
   * @returns The created member role
   */
  async assignMemberRole(memberRole: Partial<MemberRole>): Promise<MemberRole | null> {
    try {
      const { data, error } = await supabase
        .from('member_roles')
        .insert(memberRole)
        .select()
        .single();

      if (error) {
        console.error('Error assigning member role:', error);
        return null;
      }

      return data as MemberRole;
    } catch (error) {
      console.error('Error in assignMemberRole:', error);
      return null;
    }
  }

  /**
   * Update a member role
   * @param memberRoleId - The ID of the member role to update
   * @param updates - The member role data to update
   * @returns The updated member role
   */
  async updateMemberRole(memberRoleId: string, updates: Partial<MemberRole>): Promise<MemberRole | null> {
    try {
      const { data, error } = await supabase
        .from('member_roles')
        .update(updates)
        .eq('id', memberRoleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating member role:', error);
        return null;
      }

      return data as MemberRole;
    } catch (error) {
      console.error('Error in updateMemberRole:', error);
      return null;
    }
  }

  /**
   * Remove a role from a member
   * @param memberRoleId - The ID of the member role to remove
   * @returns True if successful, false otherwise
   */
  async removeMemberRole(memberRoleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('member_roles')
        .delete()
        .eq('id', memberRoleId);

      if (error) {
        console.error('Error removing member role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeMemberRole:', error);
      return false;
    }
  }

  /**
   * Check if a member has a specific role
   * @param memberId - The ID of the member
   * @param roleName - The name of the role
   * @returns True if the member has the role, false otherwise
   */
  async hasMemberRole(memberId: string, roleName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_governance_role', {
          member_id: memberId,
          role_name: roleName
        });

      if (error) {
        console.error('Error checking member role:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in hasMemberRole:', error);
      return false;
    }
  }

  /**
   * Get dividend eligibility for a member
   * @param memberId - The ID of the member
   * @returns The dividend eligibility data
   */
  async getDividendEligibility(memberId: string): Promise<DividendEligibility | null> {
    try {
      const { data, error } = await supabase
        .from('dividend_eligibility')
        .select(`
          *,
          member:member_id(*)
        `)
        .eq('member_id', memberId)
        .order('eligibility_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No records found
          return null;
        }
        console.error('Error fetching dividend eligibility:', error);
        return null;
      }

      return data as DividendEligibility;
    } catch (error) {
      console.error('Error in getDividendEligibility:', error);
      return null;
    }
  }

  /**
   * Calculate dividend shares for a member
   * @param memberId - The ID of the member
   * @returns The number of shares
   */
  async calculateDividendShares(memberId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_dividend_shares', {
          member_id: memberId
        });

      if (error) {
        console.error('Error calculating dividend shares:', error);
        return 0;
      }

      return data;
    } catch (error) {
      console.error('Error in calculateDividendShares:', error);
      return 0;
    }
  }

  /**
   * Update dividend eligibility for a member
   * @param memberId - The ID of the member
   * @param status - The eligibility status
   * @param notes - Optional notes
   * @returns The updated dividend eligibility
   */
  async updateDividendEligibility(
    memberId: string, 
    status: string,
    notes?: string
  ): Promise<DividendEligibility | null> {
    try {
      // Calculate shares
      const shares = await this.calculateDividendShares(memberId);
      
      // Check if eligibility record exists
      const { data: existingData, error: existingError } = await supabase
        .from('dividend_eligibility')
        .select('id')
        .eq('member_id', memberId)
        .order('eligibility_date', { ascending: false })
        .limit(1);
      
      if (existingError) {
        console.error('Error checking existing dividend eligibility:', existingError);
        return null;
      }
      
      let result;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        const { data, error } = await supabase
          .from('dividend_eligibility')
          .update({
            eligibility_status: status,
            shares,
            notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData[0].id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating dividend eligibility:', error);
          return null;
        }
        
        result = data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('dividend_eligibility')
          .insert({
            member_id: memberId,
            eligibility_status: status,
            shares,
            notes: notes || null
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating dividend eligibility:', error);
          return null;
        }
        
        result = data;
      }

      return result as DividendEligibility;
    } catch (error) {
      console.error('Error in updateDividendEligibility:', error);
      return null;
    }
  }

  /**
   * Get all dividend distributions
   * @returns List of dividend distributions
   */
  async getDividendDistributions(): Promise<DividendDistribution[]> {
    try {
      const { data, error } = await supabase
        .from('dividend_distributions')
        .select('*')
        .order('distribution_date', { ascending: false });

      if (error) {
        console.error('Error fetching dividend distributions:', error);
        return [];
      }

      return data as DividendDistribution[];
    } catch (error) {
      console.error('Error in getDividendDistributions:', error);
      return [];
    }
  }

  /**
   * Create a new dividend distribution
   * @param distribution - The distribution data to create
   * @returns The created distribution
   */
  async createDividendDistribution(
    distribution: Partial<DividendDistribution>
  ): Promise<DividendDistribution | null> {
    try {
      const { data, error } = await supabase
        .from('dividend_distributions')
        .insert(distribution)
        .select()
        .single();

      if (error) {
        console.error('Error creating dividend distribution:', error);
        return null;
      }

      return data as DividendDistribution;
    } catch (error) {
      console.error('Error in createDividendDistribution:', error);
      return null;
    }
  }

  /**
   * Get dividend payments for a distribution
   * @param distributionId - The ID of the distribution
   * @returns List of dividend payments
   */
  async getDividendPayments(distributionId: string): Promise<DividendPayment[]> {
    try {
      const { data, error } = await supabase
        .from('dividend_payments')
        .select(`
          *,
          member:member_id(*)
        `)
        .eq('distribution_id', distributionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dividend payments:', error);
        return [];
      }

      return data as DividendPayment[];
    } catch (error) {
      console.error('Error in getDividendPayments:', error);
      return [];
    }
  }

  /**
   * Get dividend payments for a member
   * @param memberId - The ID of the member
   * @returns List of dividend payments
   */
  async getMemberDividendPayments(memberId: string): Promise<DividendPayment[]> {
    try {
      const { data, error } = await supabase
        .from('dividend_payments')
        .select(`
          *,
          distribution:distribution_id(*)
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching member dividend payments:', error);
        return [];
      }

      return data as DividendPayment[];
    } catch (error) {
      console.error('Error in getMemberDividendPayments:', error);
      return [];
    }
  }

  /**
   * Get all bylaws versions
   * @param activeOnly - Whether to only return active versions
   * @returns List of bylaws versions
   */
  async getBylawsVersions(activeOnly: boolean = false): Promise<BylawsVersion[]> {
    try {
      let query = supabase
        .from('bylaws_versions')
        .select(`
          *,
          creator:created_by(*)
        `)
        .order('effective_date', { ascending: false });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bylaws versions:', error);
        return [];
      }

      return data as BylawsVersion[];
    } catch (error) {
      console.error('Error in getBylawsVersions:', error);
      return [];
    }
  }

  /**
   * Get the latest active bylaws version
   * @returns The latest active bylaws version
   */
  async getLatestBylawsVersion(): Promise<BylawsVersion | null> {
    try {
      const { data, error } = await supabase
        .from('bylaws_versions')
        .select(`
          *,
          creator:created_by(*)
        `)
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No records found
          return null;
        }
        console.error('Error fetching latest bylaws version:', error);
        return null;
      }

      return data as BylawsVersion;
    } catch (error) {
      console.error('Error in getLatestBylawsVersion:', error);
      return null;
    }
  }

  /**
   * Create a new bylaws version
   * @param bylaws - The bylaws data to create
   * @returns The created bylaws version
   */
  async createBylawsVersion(bylaws: Partial<BylawsVersion>): Promise<BylawsVersion | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('bylaws_versions')
        .insert({
          ...bylaws,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bylaws version:', error);
        return null;
      }

      return data as BylawsVersion;
    } catch (error) {
      console.error('Error in createBylawsVersion:', error);
      return null;
    }
  }

  /**
   * Check if a member has acknowledged the latest bylaws
   * @param memberId - The ID of the member
   * @returns True if acknowledged, false otherwise
   */
  async hasAcknowledgedLatestBylaws(memberId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_acknowledged_latest_bylaws', {
          member_id: memberId
        });

      if (error) {
        console.error('Error checking bylaws acknowledgment:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in hasAcknowledgedLatestBylaws:', error);
      return false;
    }
  }

  /**
   * Acknowledge bylaws
   * @param bylawsVersionId - The ID of the bylaws version
   * @returns The created acknowledgment
   */
  async acknowledgeBylaws(bylawsVersionId: string): Promise<BylawsAcknowledgment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Get client IP and user agent
      let ipAddress = '';
      let userAgent = '';
      
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = data.ip;
        userAgent = navigator.userAgent;
      } catch (err) {
        console.error('Error getting IP address:', err);
      }
      
      const { data, error } = await supabase
        .from('bylaws_acknowledgments')
        .insert({
          bylaws_version_id: bylawsVersionId,
          member_id: user.id,
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .select()
        .single();

      if (error) {
        console.error('Error acknowledging bylaws:', error);
        return null;
      }

      return data as BylawsAcknowledgment;
    } catch (error) {
      console.error('Error in acknowledgeBylaws:', error);
      return null;
    }
  }

  /**
   * Get bylaws acknowledgments for a version
   * @param bylawsVersionId - The ID of the bylaws version
   * @returns List of acknowledgments
   */
  async getBylawsAcknowledgments(bylawsVersionId: string): Promise<BylawsAcknowledgment[]> {
    try {
      const { data, error } = await supabase
        .from('bylaws_acknowledgments')
        .select(`
          *,
          member:member_id(*),
          bylaws_version:bylaws_version_id(*)
        `)
        .eq('bylaws_version_id', bylawsVersionId)
        .order('acknowledged_at', { ascending: false });

      if (error) {
        console.error('Error fetching bylaws acknowledgments:', error);
        return [];
      }

      return data as BylawsAcknowledgment[];
    } catch (error) {
      console.error('Error in getBylawsAcknowledgments:', error);
      return [];
    }
  }
}

export const governanceService = new GovernanceService();
