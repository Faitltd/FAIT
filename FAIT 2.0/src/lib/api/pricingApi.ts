import { supabase } from '../supabase';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  order_index: number;
  is_active: boolean;
}

interface ServicePackage {
  id: string;
  service_agent_id: string;
  category_id: string;
  title: string;
  description: string;
  base_price: number;
  good_tier_price: number | null;
  better_tier_price: number | null;
  best_tier_price: number | null;
  good_tier_description: string | null;
  better_tier_description: string | null;
  best_tier_description: string | null;
  duration_minutes: number | null;
  is_featured: boolean;
  is_active: boolean;
  location_type: 'on_site' | 'remote' | 'both';
  features?: ServicePackageFeature[];
  images?: ServicePackageImage[];
  warranty_periods?: WarrantyPeriod[];
  category?: ServiceCategory;
  service_agent?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface ServicePackageFeature {
  id: string;
  package_id: string;
  name: string;
  description: string | null;
  tier: 'all' | 'good' | 'better' | 'best';
  is_included: boolean;
  order_index: number;
}

interface ServicePackageImage {
  id: string;
  package_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  order_index: number;
}

interface WarrantyPeriod {
  id: string;
  service_package_id: string;
  tier: 'good' | 'better' | 'best';
  duration_days: number;
  description: string | null;
}

/**
 * Get all service categories
 */
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error('Failed to fetch service categories');
  }
};

/**
 * Get service packages with optional filtering
 */
export const getServicePackages = async (options?: {
  categoryId?: string;
  serviceAgentId?: string;
  featured?: boolean;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}): Promise<{ packages: ServicePackage[]; total: number }> => {
  try {
    let query = supabase
      .from('service_packages')
      .select(`
        *,
        category:category_id(*),
        service_agent:service_agent_id(id, full_name, avatar_url),
        features:service_package_features(*),
        images:service_package_images(*),
        warranty_periods(*)
      `, { count: 'exact' })
      .eq('is_active', true);
      
    // Apply filters
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    
    if (options?.serviceAgentId) {
      query = query.eq('service_agent_id', options.serviceAgentId);
    }
    
    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }
    
    if (options?.searchTerm) {
      query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
    }
    
    if (options?.minPrice !== undefined) {
      query = query.gte('base_price', options.minPrice);
    }
    
    if (options?.maxPrice !== undefined) {
      query = query.lte('base_price', options.maxPrice);
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    // Execute query
    const { data, error, count } = await query.order('is_featured', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return {
      packages: data,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching service packages:', error);
    throw new Error('Failed to fetch service packages');
  }
};

/**
 * Get a single service package by ID
 */
export const getServicePackageById = async (id: string): Promise<ServicePackage> => {
  try {
    const { data, error } = await supabase
      .from('service_packages')
      .select(`
        *,
        category:category_id(*),
        service_agent:service_agent_id(id, full_name, avatar_url),
        features:service_package_features(*),
        images:service_package_images(*),
        warranty_periods(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching service package:', error);
    throw new Error('Failed to fetch service package');
  }
};

/**
 * Create a new service package
 */
export const createServicePackage = async (
  serviceAgentId: string,
  packageData: Omit<ServicePackage, 'id' | 'service_agent_id' | 'created_at' | 'updated_at'>
): Promise<ServicePackage> => {
  try {
    // Insert the service package
    const { data: packageData, error: packageError } = await supabase
      .from('service_packages')
      .insert({
        ...packageData,
        service_agent_id: serviceAgentId,
      })
      .select()
      .single();
      
    if (packageError) {
      throw packageError;
    }
    
    return packageData;
  } catch (error) {
    console.error('Error creating service package:', error);
    throw new Error('Failed to create service package');
  }
};

/**
 * Update an existing service package
 */
export const updateServicePackage = async (
  id: string,
  serviceAgentId: string,
  packageData: Partial<Omit<ServicePackage, 'id' | 'service_agent_id' | 'created_at' | 'updated_at'>>
): Promise<ServicePackage> => {
  try {
    // Update the service package
    const { data: packageData, error: packageError } = await supabase
      .from('service_packages')
      .update({
        ...packageData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('service_agent_id', serviceAgentId)
      .select()
      .single();
      
    if (packageError) {
      throw packageError;
    }
    
    return packageData;
  } catch (error) {
    console.error('Error updating service package:', error);
    throw new Error('Failed to update service package');
  }
};

/**
 * Add features to a service package
 */
export const addServicePackageFeatures = async (
  packageId: string,
  serviceAgentId: string,
  features: Omit<ServicePackageFeature, 'id' | 'package_id' | 'created_at' | 'updated_at'>[]
): Promise<ServicePackageFeature[]> => {
  try {
    // Verify the service agent owns the package
    const { data: packageData, error: packageError } = await supabase
      .from('service_packages')
      .select('id')
      .eq('id', packageId)
      .eq('service_agent_id', serviceAgentId)
      .single();
      
    if (packageError) {
      throw packageError;
    }
    
    // Insert the features
    const { data: featuresData, error: featuresError } = await supabase
      .from('service_package_features')
      .insert(
        features.map(feature => ({
          ...feature,
          package_id: packageId,
        }))
      )
      .select();
      
    if (featuresError) {
      throw featuresError;
    }
    
    return featuresData;
  } catch (error) {
    console.error('Error adding service package features:', error);
    throw new Error('Failed to add service package features');
  }
};

/**
 * Update a service package feature
 */
export const updateServicePackageFeature = async (
  featureId: string,
  serviceAgentId: string,
  featureData: Partial<Omit<ServicePackageFeature, 'id' | 'package_id' | 'created_at' | 'updated_at'>>
): Promise<ServicePackageFeature> => {
  try {
    // Verify the service agent owns the package that contains this feature
    const { data: featureData, error: featureError } = await supabase
      .from('service_package_features')
      .select('package_id')
      .eq('id', featureId)
      .single();
      
    if (featureError) {
      throw featureError;
    }
    
    const { data: packageData, error: packageError } = await supabase
      .from('service_packages')
      .select('id')
      .eq('id', featureData.package_id)
      .eq('service_agent_id', serviceAgentId)
      .single();
      
    if (packageError) {
      throw packageError;
    }
    
    // Update the feature
    const { data: updatedFeature, error: updateError } = await supabase
      .from('service_package_features')
      .update({
        ...featureData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', featureId)
      .select()
      .single();
      
    if (updateError) {
      throw updateError;
    }
    
    return updatedFeature;
  } catch (error) {
    console.error('Error updating service package feature:', error);
    throw new Error('Failed to update service package feature');
  }
};

/**
 * Delete a service package feature
 */
export const deleteServicePackageFeature = async (
  featureId: string,
  serviceAgentId: string
): Promise<void> => {
  try {
    // Verify the service agent owns the package that contains this feature
    const { data: featureData, error: featureError } = await supabase
      .from('service_package_features')
      .select('package_id')
      .eq('id', featureId)
      .single();
      
    if (featureError) {
      throw featureError;
    }
    
    const { data: packageData, error: packageError } = await supabase
      .from('service_packages')
      .select('id')
      .eq('id', featureData.package_id)
      .eq('service_agent_id', serviceAgentId)
      .single();
      
    if (packageError) {
      throw packageError;
    }
    
    // Delete the feature
    const { error: deleteError } = await supabase
      .from('service_package_features')
      .delete()
      .eq('id', featureId);
      
    if (deleteError) {
      throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting service package feature:', error);
    throw new Error('Failed to delete service package feature');
  }
};

/**
 * Add warranty periods to a service package
 */
export const addWarrantyPeriods = async (
  packageId: string,
  serviceAgentId: string,
  warrantyPeriods: Omit<WarrantyPeriod, 'id' | 'service_package_id' | 'created_at' | 'updated_at'>[]
): Promise<WarrantyPeriod[]> => {
  try {
    // Verify the service agent owns the package
    const { data: packageData, error: packageError } = await supabase
      .from('service_packages')
      .select('id')
      .eq('id', packageId)
      .eq('service_agent_id', serviceAgentId)
      .single();
      
    if (packageError) {
      throw packageError;
    }
    
    // Insert the warranty periods
    const { data: warrantyData, error: warrantyError } = await supabase
      .from('warranty_periods')
      .insert(
        warrantyPeriods.map(warranty => ({
          ...warranty,
          service_package_id: packageId,
        }))
      )
      .select();
      
    if (warrantyError) {
      throw warrantyError;
    }
    
    return warrantyData;
  } catch (error) {
    console.error('Error adding warranty periods:', error);
    throw new Error('Failed to add warranty periods');
  }
};

/**
 * Calculate price for a service package based on selected tier
 */
export const calculatePackagePrice = async (
  packageId: string,
  tier: 'good' | 'better' | 'best'
): Promise<number> => {
  try {
    const { data: packageData, error } = await supabase
      .from('service_packages')
      .select('base_price, good_tier_price, better_tier_price, best_tier_price')
      .eq('id', packageId)
      .single();
      
    if (error) {
      throw error;
    }
    
    let price = packageData.base_price;
    
    switch (tier) {
      case 'good':
        price = packageData.good_tier_price || packageData.base_price;
        break;
      case 'better':
        price = packageData.better_tier_price || (packageData.good_tier_price * 1.5) || (packageData.base_price * 1.5);
        break;
      case 'best':
        price = packageData.best_tier_price || (packageData.better_tier_price * 1.3) || (packageData.good_tier_price * 2) || (packageData.base_price * 2);
        break;
    }
    
    return price;
  } catch (error) {
    console.error('Error calculating package price:', error);
    throw new Error('Failed to calculate package price');
  }
};
