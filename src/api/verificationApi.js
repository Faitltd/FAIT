import { supabase } from '../lib/supabase';

/**
 * Verification API Service
 * Handles all verification-related operations
 */

export const verificationApi = {
  /**
   * Submit a new verification request
   */
  async submitVerificationRequest(requestData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          ...requestData
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error submitting verification request:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user's verification requests
   */
  async getUserVerificationRequests() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          verification_documents (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a specific verification request
   */
  async getVerificationRequest(requestId) {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          verification_documents (*),
          profiles!verification_requests_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching verification request:', error);
      return { data: null, error };
    }
  },

  /**
   * Upload verification document
   */
  async uploadVerificationDocument(requestId, file, documentType) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${requestId}/${documentType}_${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      // Save document reference
      const { data, error } = await supabase
        .from('verification_documents')
        .insert({
          verification_request_id: requestId,
          document_type: documentType,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error uploading verification document:', error);
      return { data: null, error };
    }
  },

  /**
   * Update verification request (for users - only pending requests)
   */
  async updateVerificationRequest(requestId, updates) {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .update(updates)
        .eq('id', requestId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating verification request:', error);
      return { data: null, error };
    }
  },

  /**
   * Get verification history for current user
   */
  async getUserVerificationHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('verification_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching verification history:', error);
      return { data: null, error };
    }
  },

  /**
   * Check if user is verified
   */
  async checkVerificationStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified, verified_at, verification_expires_at, verification_badge_type')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error checking verification status:', error);
      return { data: null, error };
    }
  },

  // Admin functions
  /**
   * Get all verification requests (admin only)
   */
  async getAllVerificationRequests(filters = {}) {
    try {
      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          verification_documents (*),
          profiles!verification_requests_user_id_fkey (
            full_name,
            email,
            phone,
            role
          )
        `);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all verification requests:', error);
      return { data: null, error };
    }
  },

  /**
   * Review verification request (admin only)
   */
  async reviewVerificationRequest(requestId, decision, notes = '', rejectionReason = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updates = {
        status: decision,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes
      };

      if (decision === 'rejected') {
        updates.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('verification_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error reviewing verification request:', error);
      return { data: null, error };
    }
  },

  /**
   * Get verification statistics (admin only)
   */
  async getVerificationStatistics() {
    try {
      const { data, error } = await supabase
        .rpc('get_verification_statistics');

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error fetching verification statistics:', error);
      return { data: null, error };
    }
  },

  /**
   * Verify document (admin only)
   */
  async verifyDocument(documentId, verified, notes = '') {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .update({
          verified,
          verification_notes: notes
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error verifying document:', error);
      return { data: null, error };
    }
  }
};

export default verificationApi;