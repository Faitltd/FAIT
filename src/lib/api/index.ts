import { supabase } from '../supabase';
import type { Database } from '../database.types';

// Types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ServicePackage = Database['public']['Tables']['service_packages']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type ServiceAgentVerification = Database['public']['Tables']['service_agent_verifications']['Row'];
export type ExternalReview = Database['public']['Tables']['external_reviews']['Row'];
export type WarrantyClaim = Database['public']['Tables']['warranty_claims']['Row'];

// Error handling
export class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('API Error:', error);
  throw new ApiError(error.message || 'An unknown error occurred', error.status);
};

// Profiles API
export const profilesApi = {
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async updateProfile(profile: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async uploadProfilePhoto(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file);
      
    if (uploadError) handleSupabaseError(uploadError);
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);
      
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  }
};

// Service Packages API
export const servicePackagesApi = {
  async getServicePackages(filters?: { isActive?: boolean }) {
    let query = supabase
      .from('service_packages')
      .select('*');
      
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async getServicePackageById(id: string) {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async createServicePackage(servicePackage: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('service_packages')
      .insert({
        ...servicePackage,
        service_agent_id: user.id
      })
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async updateServicePackage(id: string, servicePackage: Partial<ServicePackage>) {
    const { data, error } = await supabase
      .from('service_packages')
      .update(servicePackage)
      .eq('id', id)
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async toggleServicePackageActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('service_packages')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  }
};

// Bookings API
export const bookingsApi = {
  async getBookings(filters?: { status?: string, isServiceAgent?: boolean }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey(id, full_name, email, phone, avatar_url),
        service_package:service_packages(*)
      `);
    
    if (filters?.isServiceAgent) {
      query = query.eq('service_package.service_agent_id', user.id);
    } else {
      query = query.eq('client_id', user.id);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async getBookingById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey(id, full_name, email, phone, avatar_url),
        service_package:service_packages(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...booking,
        client_id: user.id
      })
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async updateBookingStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  }
};

// Messages API
export const messagesApi = {
  async getMessages(bookingId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async sendMessage(bookingId: string, recipientId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        recipient_id: recipientId,
        content
      })
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async markMessagesAsRead(bookingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('booking_id', bookingId)
      .eq('recipient_id', user.id)
      .eq('is_read', false);
      
    if (error) handleSupabaseError(error);
    return data;
  }
};

// Service Agent Availability API
export const availabilityApi = {
  async getAvailability() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('service_agent_availability')
      .select('*')
      .eq('service_agent_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async addAvailability(availability: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('service_agent_availability')
      .insert({
        ...availability,
        service_agent_id: user.id
      })
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async deleteAvailability(id: string) {
    const { data, error } = await supabase
      .from('service_agent_availability')
      .delete()
      .eq('id', id);
      
    if (error) handleSupabaseError(error);
    return true;
  }
};

// Reviews API
export const reviewsApi = {
  async getReviews(serviceAgentId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:profiles!reviews_client_id_fkey(full_name, avatar_url),
        booking:bookings!reviews_booking_id_fkey(
          id,
          service_package:service_packages!bookings_service_package_id_fkey(title)
        )
      `)
      .in(
        'booking.service_package.service_agent_id',
        [serviceAgentId]
      )
      .order('created_at', { ascending: false });
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async addReview(bookingId: string, servicePackageId: string, rating: number, comment: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        service_package_id: servicePackageId,
        client_id: user.id,
        rating,
        comment
      })
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  }
};

// External Reviews API
export const externalReviewsApi = {
  async getExternalReviews(serviceAgentId: string) {
    const { data, error } = await supabase
      .from('external_reviews')
      .select('*')
      .eq('service_agent_id', serviceAgentId)
      .order('created_at', { ascending: false });
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async addExternalReview(platform: string, url: string, rating: number, reviewCount: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('external_reviews')
      .insert({
        service_agent_id: user.id,
        platform,
        url,
        rating,
        review_count: reviewCount
      })
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async deleteExternalReview(id: string) {
    const { error } = await supabase
      .from('external_reviews')
      .delete()
      .eq('id', id);
      
    if (error) handleSupabaseError(error);
    return true;
  }
};

// Warranty Claims API
export const warrantyClaimsApi = {
  async getWarrantyClaims(isServiceAgent = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    let query = supabase
      .from('warranty_claims')
      .select(`
        *,
        booking:bookings(
          *,
          service_package:service_packages(*)
        ),
        client:profiles!warranty_claims_client_id_fkey(full_name, email, phone)
      `);
    
    if (isServiceAgent) {
      query = query.eq('booking.service_package.service_agent_id', user.id);
    } else {
      query = query.eq('client_id', user.id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async getWarrantyClaimById(id: string) {
    const { data, error } = await supabase
      .from('warranty_claims')
      .select(`
        *,
        booking:bookings(
          *,
          service_package:service_packages(*)
        ),
        client:profiles!warranty_claims_client_id_fkey(full_name, email, phone)
      `)
      .eq('id', id)
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async createWarrantyClaim(bookingId: string, description: string, photoUrls: string[] = []) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const { data, error } = await supabase
      .from('warranty_claims')
      .insert({
        booking_id: bookingId,
        client_id: user.id,
        description,
        photo_urls: photoUrls,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async updateWarrantyClaimStatus(id: string, status: string, resolutionNotes?: string) {
    const updateData: any = { status };
    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }
    
    const { data, error } = await supabase
      .from('warranty_claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) handleSupabaseError(error);
    return data;
  },
  
  async uploadWarrantyPhoto(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError('User not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('warranty_photos')
      .upload(fileName, file);
      
    if (uploadError) handleSupabaseError(uploadError);
    
    const { data: { publicUrl } } = supabase.storage
      .from('warranty_photos')
      .getPublicUrl(fileName);
      
    return publicUrl;
  }
};
