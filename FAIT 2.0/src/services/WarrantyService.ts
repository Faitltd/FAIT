import { supabase } from '../lib/supabase';
import { 
  Warranty, 
  WarrantyType, 
  WarrantyClaim, 
  WarrantyClaimUpdate 
} from '../types/warranty';

/**
 * Service for handling warranty-related functionality
 */
export class WarrantyService {
  /**
   * Get a warranty by ID
   * @param warrantyId - The ID of the warranty to retrieve
   * @returns The warranty data
   */
  async getWarranty(warrantyId: string): Promise<Warranty | null> {
    try {
      const { data, error } = await supabase
        .from('warranties')
        .select(`
          *,
          client:client_id(*),
          contractor:contractor_id(*),
          project:project_id(*),
          warranty_type:warranty_type_id(*)
        `)
        .eq('id', warrantyId)
        .single();

      if (error) {
        console.error('Error fetching warranty:', error);
        return null;
      }

      return data as Warranty;
    } catch (error) {
      console.error('Error in getWarranty:', error);
      return null;
    }
  }

  /**
   * Get all warranties for the current user
   * @param userRole - The role of the current user ('client', 'contractor', 'admin')
   * @param status - Optional status filter
   * @returns List of warranties
   */
  async getWarranties(userRole: string, status?: string): Promise<Warranty[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('warranties')
        .select(`
          *,
          client:client_id(*),
          contractor:contractor_id(*),
          project:project_id(*),
          warranty_type:warranty_type_id(*)
        `);

      // Filter by user role
      if (userRole === 'client') {
        query = query.eq('client_id', user.id);
      } else if (userRole === 'contractor') {
        query = query.eq('contractor_id', user.id);
      }

      // Filter by status if provided
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching warranties:', error);
        return [];
      }

      return data as Warranty[];
    } catch (error) {
      console.error('Error in getWarranties:', error);
      return [];
    }
  }

  /**
   * Create a new warranty
   * @param warranty - The warranty data to create
   * @returns The created warranty
   */
  async createWarranty(warranty: Partial<Warranty>): Promise<Warranty | null> {
    try {
      // Calculate end date if warranty type is provided
      if (warranty.warranty_type_id && warranty.start_date) {
        const { data: endDateData, error: endDateError } = await supabase
          .rpc('calculate_warranty_end_date', {
            start_date: warranty.start_date,
            warranty_type_id: warranty.warranty_type_id,
            is_premium: warranty.is_premium || false
          });

        if (endDateError) {
          console.error('Error calculating warranty end date:', endDateError);
        } else {
          warranty.end_date = endDateData;
        }
      }

      const { data, error } = await supabase
        .from('warranties')
        .insert(warranty)
        .select()
        .single();

      if (error) {
        console.error('Error creating warranty:', error);
        return null;
      }

      return data as Warranty;
    } catch (error) {
      console.error('Error in createWarranty:', error);
      return null;
    }
  }

  /**
   * Update a warranty
   * @param warrantyId - The ID of the warranty to update
   * @param updates - The warranty data to update
   * @returns The updated warranty
   */
  async updateWarranty(warrantyId: string, updates: Partial<Warranty>): Promise<Warranty | null> {
    try {
      // Recalculate end date if warranty type or premium status is changed
      if ((updates.warranty_type_id || updates.is_premium !== undefined) && !updates.end_date) {
        // Get current warranty data
        const { data: currentWarranty, error: warrantyError } = await supabase
          .from('warranties')
          .select('start_date, warranty_type_id, is_premium')
          .eq('id', warrantyId)
          .single();

        if (warrantyError) {
          console.error('Error fetching current warranty:', warrantyError);
        } else {
          const startDate = updates.start_date || currentWarranty.start_date;
          const warrantyTypeId = updates.warranty_type_id || currentWarranty.warranty_type_id;
          const isPremium = updates.is_premium !== undefined ? updates.is_premium : currentWarranty.is_premium;

          const { data: endDateData, error: endDateError } = await supabase
            .rpc('calculate_warranty_end_date', {
              start_date: startDate,
              warranty_type_id: warrantyTypeId,
              is_premium: isPremium
            });

          if (endDateError) {
            console.error('Error calculating warranty end date:', endDateError);
          } else {
            updates.end_date = endDateData;
          }
        }
      }

      const { data, error } = await supabase
        .from('warranties')
        .update(updates)
        .eq('id', warrantyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating warranty:', error);
        return null;
      }

      return data as Warranty;
    } catch (error) {
      console.error('Error in updateWarranty:', error);
      return null;
    }
  }

  /**
   * Get all warranty types
   * @returns List of warranty types
   */
  async getWarrantyTypes(): Promise<WarrantyType[]> {
    try {
      const { data, error } = await supabase
        .from('warranty_types')
        .select('*')
        .order('duration_days', { ascending: true });

      if (error) {
        console.error('Error fetching warranty types:', error);
        return [];
      }

      return data as WarrantyType[];
    } catch (error) {
      console.error('Error in getWarrantyTypes:', error);
      return [];
    }
  }

  /**
   * Check if a warranty is eligible for a claim
   * @param warrantyId - The ID of the warranty to check
   * @returns True if eligible, false otherwise
   */
  async isWarrantyEligibleForClaim(warrantyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_warranty_eligible_for_claim', {
          warranty_id: warrantyId
        });

      if (error) {
        console.error('Error checking warranty eligibility:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in isWarrantyEligibleForClaim:', error);
      return false;
    }
  }

  /**
   * Create a new warranty claim
   * @param claim - The claim data to create
   * @returns The created claim
   */
  async createWarrantyClaim(claim: Partial<WarrantyClaim>): Promise<WarrantyClaim | null> {
    try {
      // Check if warranty is eligible for a claim
      const isEligible = await this.isWarrantyEligibleForClaim(claim.warranty_id!);
      if (!isEligible) {
        console.error('Warranty is not eligible for a claim');
        return null;
      }

      const { data, error } = await supabase
        .from('warranty_claims')
        .insert(claim)
        .select()
        .single();

      if (error) {
        console.error('Error creating warranty claim:', error);
        return null;
      }

      return data as WarrantyClaim;
    } catch (error) {
      console.error('Error in createWarrantyClaim:', error);
      return null;
    }
  }

  /**
   * Get a warranty claim by ID
   * @param claimId - The ID of the claim to retrieve
   * @returns The claim data
   */
  async getWarrantyClaim(claimId: string): Promise<WarrantyClaim | null> {
    try {
      const { data, error } = await supabase
        .from('warranty_claims')
        .select(`
          *,
          client:client_id(*),
          contractor:contractor_id(*),
          warranty:warranty_id(*),
          resolver:resolved_by(*)
        `)
        .eq('id', claimId)
        .single();

      if (error) {
        console.error('Error fetching warranty claim:', error);
        return null;
      }

      return data as WarrantyClaim;
    } catch (error) {
      console.error('Error in getWarrantyClaim:', error);
      return null;
    }
  }

  /**
   * Get all warranty claims for a warranty
   * @param warrantyId - The ID of the warranty
   * @returns List of claims
   */
  async getWarrantyClaims(warrantyId: string): Promise<WarrantyClaim[]> {
    try {
      const { data, error } = await supabase
        .from('warranty_claims')
        .select(`
          *,
          client:client_id(*),
          contractor:contractor_id(*),
          warranty:warranty_id(*),
          resolver:resolved_by(*)
        `)
        .eq('warranty_id', warrantyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching warranty claims:', error);
        return [];
      }

      return data as WarrantyClaim[];
    } catch (error) {
      console.error('Error in getWarrantyClaims:', error);
      return [];
    }
  }

  /**
   * Update a warranty claim
   * @param claimId - The ID of the claim to update
   * @param updates - The claim data to update
   * @returns The updated claim
   */
  async updateWarrantyClaim(claimId: string, updates: Partial<WarrantyClaim>): Promise<WarrantyClaim | null> {
    try {
      // If status is being updated to a resolved status, set resolved_at and resolved_by
      if (updates.status && ['approved', 'rejected', 'completed'].includes(updates.status)) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          updates.resolved_at = new Date().toISOString();
          updates.resolved_by = user.id;
        }
      }

      const { data, error } = await supabase
        .from('warranty_claims')
        .update(updates)
        .eq('id', claimId)
        .select()
        .single();

      if (error) {
        console.error('Error updating warranty claim:', error);
        return null;
      }

      return data as WarrantyClaim;
    } catch (error) {
      console.error('Error in updateWarrantyClaim:', error);
      return null;
    }
  }

  /**
   * Get claim updates for a warranty claim
   * @param claimId - The ID of the claim
   * @returns List of claim updates
   */
  async getWarrantyClaimUpdates(claimId: string): Promise<WarrantyClaimUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('warranty_claim_updates')
        .select(`
          *,
          updater:updated_by(*)
        `)
        .eq('warranty_claim_id', claimId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching warranty claim updates:', error);
        return [];
      }

      return data as WarrantyClaimUpdate[];
    } catch (error) {
      console.error('Error in getWarrantyClaimUpdates:', error);
      return [];
    }
  }
}

export const warrantyService = new WarrantyService();
