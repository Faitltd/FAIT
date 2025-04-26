import { createClient } from '@supabase/supabase-js';
import { getDistance } from './geocodingApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Search for services based on various criteria
 * @param {Object} params - Search parameters
 * @param {string} params.zipCode - User's zip code
 * @param {string} params.category - Service category
 * @param {string} params.searchTerm - Search term
 * @param {number} params.radius - Search radius in miles
 * @param {number} params.priceMin - Minimum price
 * @param {number} params.priceMax - Maximum price
 * @param {number} params.ratingMin - Minimum rating
 * @param {string} params.sortBy - Sort field (price, distance, rating)
 * @param {string} params.sortDirection - Sort direction (asc, desc)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of results per page
 * @returns {Promise<Object>} Search results
 */
export const searchServices = async (params) => {
  try {
    const {
      zipCode,
      category,
      searchTerm,
      radius = 25,
      priceMin = 0,
      priceMax = 1000,
      ratingMin = 0,
      sortBy = 'distance',
      sortDirection = 'asc',
      page = 1,
      limit = 10
    } = params;
    
    // Start building the query
    let query = supabase
      .from('services')
      .select(`
        *,
        service_agent:service_agent_id (id, first_name, last_name, zip_code, avatar_url),
        reviews!inner (rating),
        review_count:reviews (count)
      `, { count: 'exact' })
      .eq('is_active', true);
    
    // Add search term filter if provided
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    // Add price range filter
    query = query.gte('price', priceMin).lte('price', priceMax);
    
    // Add rating filter
    if (ratingMin > 0) {
      query = query.gte('average_rating', ratingMin);
    }
    
    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Process the results
    let services = data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      price_type: service.price_type,
      image_url: service.image_url,
      service_agent_id: service.service_agent_id,
      service_agent_name: `${service.service_agent.first_name} ${service.service_agent.last_name}`,
      service_agent_image: service.service_agent.avatar_url,
      zip_code: service.service_agent.zip_code,
      average_rating: service.average_rating,
      review_count: service.review_count,
      distance: null // Will be calculated below if zip code is provided
    }));
    
    // Calculate distances if zip code is provided
    if (zipCode) {
      services = await Promise.all(
        services.map(async service => {
          try {
            if (service.zip_code) {
              const distance = await getDistance(zipCode, service.zip_code);
              return { ...service, distance };
            }
            return service;
          } catch (err) {
            console.error(`Error calculating distance for service ${service.id}:`, err);
            return service;
          }
        })
      );
      
      // Filter by radius
      services = services.filter(service => 
        service.distance === null || service.distance <= radius
      );
    }
    
    // Sort results
    services.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = (b.average_rating || 0) - (a.average_rating || 0);
          break;
        case 'distance':
          // Handle null distances (put them at the end)
          if (a.distance === null && b.distance === null) {
            comparison = 0;
          } else if (a.distance === null) {
            comparison = 1;
          } else if (b.distance === null) {
            comparison = -1;
          } else {
            comparison = a.distance - b.distance;
          }
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(services.length / limit);
    
    return {
      services,
      totalCount: services.length,
      totalPages
    };
  } catch (error) {
    console.error('Error searching services:', error);
    throw error;
  }
};

/**
 * Get a service by ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} Service details
 */
export const getServiceById = async (serviceId) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        service_agent:service_agent_id (id, first_name, last_name, zip_code, avatar_url, phone, email),
        reviews (id, rating, comment, created_at, client:client_id (first_name, last_name, avatar_url))
      `)
      .eq('id', serviceId)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      service_agent_name: `${data.service_agent.first_name} ${data.service_agent.last_name}`,
      service_agent_image: data.service_agent.avatar_url,
      reviews: data.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        client_name: `${review.client.first_name} ${review.client.last_name}`,
        client_avatar: review.client.avatar_url
      }))
    };
  } catch (error) {
    console.error('Error getting service by ID:', error);
    throw error;
  }
};

/**
 * Get services by service agent ID
 * @param {string} serviceAgentId - Service agent ID
 * @returns {Promise<Array>} List of services
 */
export const getServicesByServiceAgentId = async (serviceAgentId) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        reviews (rating),
        review_count:reviews (count)
      `)
      .eq('service_agent_id', serviceAgentId);
    
    if (error) throw error;
    
    return data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      price_type: service.price_type,
      image_url: service.image_url,
      is_active: service.is_active,
      average_rating: service.average_rating,
      review_count: service.review_count
    }));
  } catch (error) {
    console.error('Error getting services by service agent ID:', error);
    throw error;
  }
};

/**
 * Create a new service
 * @param {Object} service - Service data
 * @returns {Promise<Object>} Created service
 */
export const createService = async (service) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

/**
 * Update a service
 * @param {string} serviceId - Service ID
 * @param {Object} updates - Service updates
 * @returns {Promise<Object>} Updated service
 */
export const updateService = async (serviceId, updates) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

/**
 * Delete a service
 * @param {string} serviceId - Service ID
 * @returns {Promise<void>}
 */
export const deleteService = async (serviceId) => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};
