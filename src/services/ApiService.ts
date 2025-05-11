import { supabase } from '../lib/supabase';
import { apiCache } from '../lib/cacheUtils';

/**
 * Base API service with caching and error handling
 */
export class ApiService {
  /**
   * Fetch data with caching
   * @param fetcher Function that fetches data
   * @param cacheKey Cache key
   * @param expiresIn Cache expiration time in milliseconds
   */
  protected async fetchWithCache<T>(
    fetcher: () => Promise<{ data: T | null; error: any }>,
    cacheKey: string,
    expiresIn: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = apiCache.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Fetch fresh data
    const { data, error } = await fetcher();

    if (error) {
      console.error(`API error for ${cacheKey}:`, error);
      throw new Error(error.message || 'An error occurred while fetching data');
    }

    if (!data) {
      throw new Error('No data returned from API');
    }

    // Cache the result
    apiCache.set(cacheKey, data, { expiresIn });

    return data;
  }

  /**
   * Clear cache for a specific key
   */
  protected clearCache(cacheKey: string): void {
    apiCache.remove(cacheKey);
  }

  /**
   * Clear all cache entries that match a pattern
   */
  protected clearCacheByPattern(pattern: string): void {
    const stats = apiCache.getStats();
    const regex = new RegExp(pattern);

    for (const key of stats.keys) {
      if (regex.test(key)) {
        apiCache.remove(key);
      }
    }
  }

  /**
   * Handle API errors consistently
   */
  protected handleError(error: any, customMessage?: string): never {
    const message = customMessage || error.message || 'An unexpected error occurred';
    console.error('API Error:', error);
    
    // You could add error reporting here (e.g., Sentry)
    
    throw new Error(message);
  }
}

/**
 * Service for profile-related API calls
 */
export class ProfileService extends ApiService {
  /**
   * Get the current user's profile
   */
  async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      return this.fetchWithCache(
        () => supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        `profile:${user.id}`
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch user profile');
    }
  }

  /**
   * Get a user profile by ID
   */
  async getUserProfile(userId: string) {
    try {
      return this.fetchWithCache(
        () => supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        `profile:${userId}`
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch user profile');
    }
  }

  /**
   * Update a user profile
   */
  async updateUserProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Clear the cache for this profile
      this.clearCache(`profile:${userId}`);

      return data;
    } catch (error) {
      return this.handleError(error, 'Failed to update user profile');
    }
  }
}

/**
 * Service for service-related API calls
 */
export class ServicePackageService extends ApiService {
  /**
   * Get all active service packages
   */
  async getActiveServicePackages() {
    try {
      return this.fetchWithCache(
        () => supabase
          .from('service_packages')
          .select(`
            *,
            profiles(full_name, zip_code),
            avg_rating:reviews(rating),
            review_count:reviews(count)
          `)
          .eq('is_active', true),
        'service_packages:active',
        10 * 60 * 1000 // 10 minutes cache
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch service packages');
    }
  }

  /**
   * Get service packages by service agent ID
   */
  async getServicePackagesByServiceAgent(serviceAgentId: string) {
    try {
      return this.fetchWithCache(
        () => supabase
          .from('service_packages')
          .select(`
            *,
            profiles(full_name, zip_code),
            avg_rating:reviews(rating),
            review_count:reviews(count)
          `)
          .eq('service_agent_id', serviceAgentId),
        `service_packages:agent:${serviceAgentId}`,
        5 * 60 * 1000 // 5 minutes cache
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch service agent packages');
    }
  }

  /**
   * Get a service package by ID
   */
  async getServicePackageById(id: string) {
    try {
      return this.fetchWithCache(
        () => supabase
          .from('service_packages')
          .select(`
            *,
            profiles(full_name, zip_code),
            avg_rating:reviews(rating),
            review_count:reviews(count)
          `)
          .eq('id', id)
          .single(),
        `service_package:${id}`,
        5 * 60 * 1000 // 5 minutes cache
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch service package');
    }
  }

  /**
   * Create a new service package
   */
  async createServicePackage(servicePackageData: any) {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .insert(servicePackageData)
        .select()
        .single();

      if (error) throw error;

      // Clear relevant caches
      this.clearCacheByPattern('service_packages:');
      this.clearCacheByPattern(`service_packages:agent:${servicePackageData.service_agent_id}`);

      return data;
    } catch (error) {
      return this.handleError(error, 'Failed to create service package');
    }
  }

  /**
   * Update a service package
   */
  async updateServicePackage(id: string, servicePackageData: any) {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .update(servicePackageData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Clear relevant caches
      this.clearCache(`service_package:${id}`);
      this.clearCacheByPattern('service_packages:');
      this.clearCacheByPattern(`service_packages:agent:${data.service_agent_id}`);

      return data;
    } catch (error) {
      return this.handleError(error, 'Failed to update service package');
    }
  }

  /**
   * Delete a service package
   */
  async deleteServicePackage(id: string) {
    try {
      // First get the service package to know the service_agent_id
      const servicePackage = await this.getServicePackageById(id);
      
      const { error } = await supabase
        .from('service_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear relevant caches
      this.clearCache(`service_package:${id}`);
      this.clearCacheByPattern('service_packages:');
      if (servicePackage) {
        this.clearCacheByPattern(`service_packages:agent:${servicePackage.service_agent_id}`);
      }

      return true;
    } catch (error) {
      return this.handleError(error, 'Failed to delete service package');
    }
  }

  /**
   * Search service packages
   */
  async searchServicePackages(params: any) {
    try {
      // Don't cache search results as they're likely to be unique per user
      const { data, error } = await supabase
        .from('service_packages')
        .select(`
          *,
          profiles(full_name, zip_code),
          avg_rating:reviews(rating),
          review_count:reviews(count)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Apply client-side filtering
      let filteredData = data;

      // Filter by search term
      if (params.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (service: any) =>
            service.title.toLowerCase().includes(term) ||
            service.description.toLowerCase().includes(term)
        );
      }

      // Filter by trade
      if (params.trade) {
        filteredData = filteredData.filter(
          (service: any) => service.trade === params.trade
        );
      }

      // Filter by price range
      if (params.priceMin !== undefined || params.priceMax !== undefined) {
        filteredData = filteredData.filter((service: any) => {
          if (params.priceMin !== undefined && service.price < params.priceMin) {
            return false;
          }
          if (params.priceMax !== undefined && service.price > params.priceMax) {
            return false;
          }
          return true;
        });
      }

      return filteredData;
    } catch (error) {
      return this.handleError(error, 'Failed to search service packages');
    }
  }
}

/**
 * Service for booking-related API calls
 */
export class BookingService extends ApiService {
  /**
   * Get bookings for a client
   */
  async getClientBookings(clientId: string) {
    try {
      return this.fetchWithCache(
        () => supabase
          .from('bookings')
          .select(`
            *,
            service_agent:profiles!bookings_service_agent_id_fkey(id, first_name, last_name, avatar_url),
            service_package:service_packages(id, title, price)
          `)
          .eq('client_id', clientId)
          .order('booking_date', { ascending: false }),
        `bookings:client:${clientId}`,
        2 * 60 * 1000 // 2 minutes cache (shorter for bookings)
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch client bookings');
    }
  }

  /**
   * Get bookings for a service agent
   */
  async getServiceAgentBookings(serviceAgentId: string) {
    try {
      return this.fetchWithCache(
        () => supabase
          .from('bookings')
          .select(`
            *,
            client:profiles!bookings_client_id_fkey(id, first_name, last_name, avatar_url),
            service_package:service_packages(id, title, price)
          `)
          .eq('service_agent_id', serviceAgentId)
          .order('booking_date', { ascending: false }),
        `bookings:agent:${serviceAgentId}`,
        2 * 60 * 1000 // 2 minutes cache
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch service agent bookings');
    }
  }

  /**
   * Get a booking by ID
   */
  async getBookingById(id: string) {
    try {
      return this.fetchWithCache(
        () => supabase
          .from('bookings')
          .select(`
            *,
            client:profiles!bookings_client_id_fkey(id, first_name, last_name, avatar_url, email, phone),
            service_agent:profiles!bookings_service_agent_id_fkey(id, first_name, last_name, avatar_url, email, phone),
            service_package:service_packages(*)
          `)
          .eq('id', id)
          .single(),
        `booking:${id}`,
        2 * 60 * 1000 // 2 minutes cache
      );
    } catch (error) {
      return this.handleError(error, 'Failed to fetch booking');
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: any) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Clear relevant caches
      this.clearCacheByPattern(`bookings:client:${bookingData.client_id}`);
      this.clearCacheByPattern(`bookings:agent:${bookingData.service_agent_id}`);

      return data;
    } catch (error) {
      return this.handleError(error, 'Failed to create booking');
    }
  }

  /**
   * Update a booking
   */
  async updateBooking(id: string, bookingData: any) {
    try {
      // First get the booking to know the client_id and service_agent_id
      const booking = await this.getBookingById(id);
      
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Clear relevant caches
      this.clearCache(`booking:${id}`);
      if (booking) {
        this.clearCacheByPattern(`bookings:client:${booking.client_id}`);
        this.clearCacheByPattern(`bookings:agent:${booking.service_agent_id}`);
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'Failed to update booking');
    }
  }
}

// Create singleton instances
export const profileService = new ProfileService();
export const servicePackageService = new ServicePackageService();
export const bookingService = new BookingService();
