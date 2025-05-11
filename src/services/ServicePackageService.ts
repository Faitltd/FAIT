import { supabase } from '../lib/supabase';
import { handleApiError } from '../utils/errorHandling';

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration?: number;
  duration_unit?: string;
  category?: string;
  subcategory?: string;
  image_url?: string;
  is_active: boolean;
  service_agent_id: string;
  created_at: string;
  service_agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    zip_code?: string;
  };
  avg_rating?: number;
  review_count?: number;
  distance?: number;
}

export interface ServiceSearchParams {
  searchTerm?: string;
  zipCode?: string;
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  radius?: number;
}

/**
 * Service for handling service packages
 */
export class ServicePackageService {
  /**
   * Get all active service packages
   */
  static async getActiveServicePackages(): Promise<ServicePackage[]> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select(`
          *,
          service_agent:profiles!service_packages_service_agent_id_fkey(
            id,
            full_name,
            avatar_url,
            zip_code
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Fetch ratings in a single query
      const serviceIds = data.map(service => service.id);
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('service_package_id, rating')
        .in('service_package_id', serviceIds);

      if (reviewsError) throw reviewsError;

      // Group reviews by service_package_id
      const reviewsByServiceId = (reviewsData || []).reduce((acc, review) => {
        if (!acc[review.service_package_id]) {
          acc[review.service_package_id] = [];
        }
        acc[review.service_package_id].push(review.rating);
        return acc;
      }, {});

      // Add ratings to services
      return data.map(service => {
        const ratings = reviewsByServiceId[service.id] || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

        return {
          ...service,
          avg_rating: avgRating,
          review_count: ratings.length
        };
      });
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.getActiveServicePackages', 'Failed to fetch service packages');
    }
  }

  /**
   * Get service packages by service agent ID
   */
  static async getServicePackagesByServiceAgent(serviceAgentId: string): Promise<ServicePackage[]> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select(`
          *,
          service_agent:profiles!service_packages_service_agent_id_fkey(
            id,
            full_name,
            avatar_url,
            zip_code
          )
        `)
        .eq('service_agent_id', serviceAgentId);

      if (error) throw error;

      return data;
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.getServicePackagesByServiceAgent', 'Failed to fetch service agent packages');
    }
  }

  /**
   * Get a service package by ID
   */
  static async getServicePackageById(id: string): Promise<ServicePackage> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select(`
          *,
          service_agent:profiles!service_packages_service_agent_id_fkey(
            id,
            full_name,
            avatar_url,
            zip_code
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.getServicePackageById', 'Failed to fetch service package');
    }
  }

  /**
   * Create a new service package
   */
  static async createServicePackage(servicePackage: Omit<ServicePackage, 'id' | 'created_at'>): Promise<ServicePackage> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .insert(servicePackage)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.createServicePackage', 'Failed to create service package');
    }
  }

  /**
   * Update a service package
   */
  static async updateServicePackage(id: string, servicePackage: Partial<ServicePackage>): Promise<ServicePackage> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .update(servicePackage)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.updateServicePackage', 'Failed to update service package');
    }
  }

  /**
   * Delete a service package
   */
  static async deleteServicePackage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('service_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.deleteServicePackage', 'Failed to delete service package');
    }
  }

  /**
   * Toggle service package active status
   */
  static async toggleServicePackageActive(id: string, isActive: boolean): Promise<ServicePackage> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.toggleServicePackageActive', 'Failed to update service package status');
    }
  }

  /**
   * Search service packages
   */
  static async searchServicePackages(params: ServiceSearchParams): Promise<ServicePackage[]> {
    try {
      let query = supabase
        .from('service_packages')
        .select(`
          *,
          service_agent:profiles!service_packages_service_agent_id_fkey(
            id,
            full_name,
            avatar_url,
            zip_code
          )
        `)
        .eq('is_active', true);

      // Add category filter if provided
      if (params.category) {
        query = query.eq('category', params.category);
      }

      // Add subcategory filter if provided
      if (params.subcategory) {
        query = query.eq('subcategory', params.subcategory);
      }

      // Add price range filter
      if (params.priceMin && params.priceMin > 0) {
        query = query.gte('price', params.priceMin);
      }
      if (params.priceMax && params.priceMax < 1000) {
        query = query.lte('price', params.priceMax);
      }

      // Execute the query
      const { data, error } = await query;

      if (error) throw error;

      // Fetch ratings in a single query
      const serviceIds = data.map(service => service.id);
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('service_package_id, rating')
        .in('service_package_id', serviceIds);

      if (reviewsError) throw reviewsError;

      // Group reviews by service_package_id
      const reviewsByServiceId = (reviewsData || []).reduce((acc, review) => {
        if (!acc[review.service_package_id]) {
          acc[review.service_package_id] = [];
        }
        acc[review.service_package_id].push(review.rating);
        return acc;
      }, {});

      // Add ratings to services
      const servicesWithRatings = data.map(service => {
        const ratings = reviewsByServiceId[service.id] || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

        return {
          ...service,
          avg_rating: avgRating,
          review_count: ratings.length
        };
      });

      // Apply client-side filters
      let filteredServices = [...servicesWithRatings];

      // Apply search term filter
      if (params.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        filteredServices = filteredServices.filter(service =>
          service.title.toLowerCase().includes(term) ||
          service.description.toLowerCase().includes(term) ||
          (service.category && service.category.toLowerCase().includes(term)) ||
          (service.subcategory && service.subcategory.toLowerCase().includes(term))
        );
      }

      // Apply rating filter
      if (params.ratingMin && params.ratingMin > 0) {
        filteredServices = filteredServices.filter(service => 
          (service.avg_rating || 0) >= params.ratingMin!
        );
      }

      return filteredServices;
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.searchServicePackages', 'Failed to search service packages');
    }
  }

  /**
   * Get service package categories
   */
  static async getServiceCategories(): Promise<{ name: string, subcategories: string[] }[]> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('category, subcategory')
        .eq('is_active', true);

      if (error) throw error;

      // Group by category
      const categoryMap = new Map<string, Set<string>>();
      
      data.forEach(item => {
        if (!item.category) return;
        
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, new Set());
        }
        
        if (item.subcategory) {
          categoryMap.get(item.category)?.add(item.subcategory);
        }
      });

      // Convert to array of Category objects
      return Array.from(categoryMap.entries()).map(([name, subcats]) => ({
        name,
        subcategories: Array.from(subcats)
      }));
    } catch (error) {
      throw handleApiError(error, 'ServicePackageService.getServiceCategories', 'Failed to fetch service categories');
    }
  }
}
