import { supabase } from '../lib/supabaseClient';

export async function getUserWarranties(userId) {
  try {
    const { data, error } = await supabase
      .from('warranties')
      .select(`
        id,
        start_date,
        end_date,
        status,
        bookings:booking_id(
          id,
          service_date,
          price
        ),
        services:service_id(
          id,
          name,
          description
        ),
        service_agent:service_agent_id(
          id,
          first_name,
          last_name,
          email
        ),
        warranty_types:warranty_type_id(
          id,
          name,
          description,
          duration_days
        )
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting user warranties:', error);
    throw error;
  }
}

export async function getServiceAgentWarranties(userId) {
  try {
    const { data, error } = await supabase
      .from('warranties')
      .select(`
        id,
        start_date,
        end_date,
        status,
        bookings:booking_id(
          id,
          service_date,
          price
        ),
        services:service_id(
          id,
          name,
          description
        ),
        client:client_id(
          id,
          first_name,
          last_name,
          email
        ),
        warranty_types:warranty_type_id(
          id,
          name,
          description,
          duration_days
        )
      `)
      .eq('service_agent_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting service agent warranties:', error);
    throw error;
  }
}

export async function getWarranty(warrantyId) {
  try {
    const { data, error } = await supabase
      .from('warranties')
      .select(`
        id,
        start_date,
        end_date,
        status,
        client_id,
        service_agent_id,
        bookings:booking_id(
          id,
          service_date,
          price,
          status
        ),
        services:service_id(
          id,
          name,
          description
        ),
        client:client_id(
          id,
          first_name,
          last_name,
          email
        ),
        service_agent:service_agent_id(
          id,
          first_name,
          last_name,
          email
        ),
        warranty_types:warranty_type_id(
          id,
          name,
          description,
          duration_days
        )
      `)
      .eq('id', warrantyId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting warranty:', error);
    throw error;
  }
}

export async function createWarrantyClaim(warrantyId, description, attachments = []) {
  try {
    // Get warranty details
    const warranty = await getWarranty(warrantyId);

    // Create claim
    const { data: claim, error } = await supabase
      .from('warranty_claims')
      .insert({
        warranty_id: warrantyId,
        client_id: warranty.client_id,
        service_agent_id: warranty.service_agent_id,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Upload attachments if any
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        const fileExt = attachment.name.split('.').pop();
        const filePath = `warranty_claims/${claim.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('warranty_attachments')
          .upload(filePath, attachment);

        if (uploadError) throw uploadError;

        // Create attachment record
        const { error: attachmentError } = await supabase
          .from('warranty_claim_attachments')
          .insert({
            warranty_claim_id: claim.id,
            file_name: attachment.name,
            file_type: attachment.type,
            file_size: attachment.size,
            file_path: filePath
          });

        if (attachmentError) throw attachmentError;
      }
    }

    return claim;
  } catch (error) {
    console.error('Error creating warranty claim:', error);
    throw error;
  }
}

export async function getUserWarrantyClaims(userId) {
  try {
    const { data, error } = await supabase
      .from('warranty_claims')
      .select(`
        id,
        description,
        status,
        created_at,
        updated_at,
        resolution,
        resolved_at,
        warranties:warranty_id(
          id,
          start_date,
          end_date,
          services:service_id(
            id,
            name
          )
        ),
        service_agent:service_agent_id(
          id,
          first_name,
          last_name
        ),
        attachments:warranty_claim_attachments(
          id,
          file_name,
          file_type,
          file_size,
          file_path
        )
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting user warranty claims:', error);
    throw error;
  }
}

export async function getServiceAgentWarrantyClaims(userId) {
  try {
    const { data, error } = await supabase
      .from('warranty_claims')
      .select(`
        id,
        description,
        status,
        created_at,
        updated_at,
        resolution,
        resolved_at,
        warranties:warranty_id(
          id,
          start_date,
          end_date,
          services:service_id(
            id,
            name
          )
        ),
        client:client_id(
          id,
          first_name,
          last_name
        ),
        attachments:warranty_claim_attachments(
          id,
          file_name,
          file_type,
          file_size,
          file_path
        )
      `)
      .eq('service_agent_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting service agent warranty claims:', error);
    throw error;
  }
}

export async function getAllWarrantyClaims() {
  try {
    const { data, error } = await supabase
      .from('warranty_claims')
      .select(`
        id,
        description,
        status,
        created_at,
        updated_at,
        resolution,
        resolved_at,
        admin_notes,
        warranties:warranty_id(
          id,
          start_date,
          end_date,
          services:service_id(
            id,
            name
          )
        ),
        client:client_id(
          id,
          first_name,
          last_name,
          email
        ),
        service_agent:service_agent_id(
          id,
          first_name,
          last_name,
          email
        ),
        resolver:resolved_by(
          id,
          first_name,
          last_name
        ),
        attachments:warranty_claim_attachments(
          id,
          file_name,
          file_type,
          file_size,
          file_path
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting all warranty claims:', error);
    throw error;
  }
}

export async function getWarrantyClaim(claimId) {
  try {
    const { data, error } = await supabase
      .from('warranty_claims')
      .select(`
        id,
        description,
        status,
        created_at,
        updated_at,
        resolution,
        resolved_at,
        admin_notes,
        warranties:warranty_id(
          id,
          start_date,
          end_date,
          bookings:booking_id(
            id,
            service_date,
            price
          ),
          services:service_id(
            id,
            name,
            description
          )
        ),
        client:client_id(
          id,
          first_name,
          last_name,
          email
        ),
        service_agent:service_agent_id(
          id,
          first_name,
          last_name,
          email
        ),
        resolver:resolved_by(
          id,
          first_name,
          last_name
        ),
        attachments:warranty_claim_attachments(
          id,
          file_name,
          file_type,
          file_size,
          file_path
        )
      `)
      .eq('id', claimId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting warranty claim:', error);
    throw error;
  }
}

export async function updateWarrantyClaim(claimId, updates, adminId) {
  try {
    const { error } = await supabase
      .from('warranty_claims')
      .update({
        ...updates,
        ...(updates.status === 'resolved' ? {
          resolved_by: adminId,
          resolved_at: new Date().toISOString()
        } : {})
      })
      .eq('id', claimId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating warranty claim:', error);
    throw error;
  }
}

export async function getWarrantyAttachmentUrl(filePath) {
  try {
    // Check which bucket to use based on the file path
    const bucket = filePath.startsWith('warranty_photos/') ? 'warranty_photos' : 'warranty_attachments';

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) throw error;

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting warranty attachment URL:', error);
    throw error;
  }
}

/**
 * Get completed bookings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of completed bookings
 */
export async function getUserCompletedBookings(userId) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_date,
        service:service_id (id, name, description),
        service_agent:service_agent_id (id, first_name, last_name)
      `)
      .eq('client_id', userId)
      .eq('status', 'completed')
      .order('service_date', { ascending: false });

    if (error) throw error;

    // Filter out bookings that already have warranty claims
    const { data: existingClaims, error: claimsError } = await supabase
      .from('warranty_claims')
      .select('booking_id')
      .eq('client_id', userId);

    if (claimsError) throw claimsError;

    const claimedBookingIds = existingClaims.map(claim => claim.booking_id);

    return data.filter(booking => !claimedBookingIds.includes(booking.id));
  } catch (error) {
    console.error('Error getting user completed bookings:', error);
    throw error;
  }
}

/**
 * Add a resolution to a warranty claim
 * @param {string} claimId - Warranty claim ID
 * @param {string} resolution - Resolution description
 * @returns {Promise<Object>} Updated warranty claim
 */
export async function addWarrantyClaimResolution(claimId, resolution) {
  try {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get claim details
    const { data: claim, error: claimError } = await supabase
      .from('warranty_claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (claimError) throw claimError;

    // Check if user is the service agent of the claim
    if (claim.service_agent_id !== user.id) {
      throw new Error('You can only add resolutions to warranty claims for your own services');
    }

    // Update claim with resolution
    const { data, error } = await supabase
      .from('warranty_claims')
      .update({
        resolution,
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by: user.id
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding warranty claim resolution:', error);
    throw error;
  }
}
