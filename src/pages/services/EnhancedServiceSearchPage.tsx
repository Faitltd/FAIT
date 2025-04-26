import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ServiceSearchFilters from '../../components/services/ServiceSearchFilters';
import ServiceSearchResults from '../../components/services/ServiceSearchResults';
import ServiceSortControls from '../../components/services/ServiceSortControls';
import ServiceSearchMap from '../../components/services/ServiceSearchMap';
import { Grid, List, MapPin } from 'lucide-react';

// Define service package type
export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  image_url?: string;
  status: string;
  service_agent_id: string;
  created_at: string;
  service_agent: {
    id: string;
    full_name: string;
    avatar_url?: string;
    zip_code?: string;
  };
  avg_rating: number;
  review_count: number;
  distance?: number;
}

// Define filter state type
interface FilterState {
  searchTerm: string;
  zipCode: string;
  category: string;
  subcategory: string;
  priceMin: number;
  priceMax: number;
  ratingMin: number;
  radius: number;
  sortBy: 'price' | 'rating' | 'distance' | 'newest';
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'map';
  page: number;
}

const EnhancedServiceSearchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);

  // Initialize state with query parameters or defaults
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: queryParams.get('q') || '',
    zipCode: queryParams.get('zip') || '',
    category: queryParams.get('category') || '',
    subcategory: queryParams.get('subcategory') || '',
    priceMin: parseInt(queryParams.get('priceMin') || '0', 10),
    priceMax: parseInt(queryParams.get('priceMax') || '1000', 10),
    ratingMin: parseInt(queryParams.get('ratingMin') || '0', 10),
    radius: parseInt(queryParams.get('radius') || '25', 10),
    sortBy: (queryParams.get('sortBy') as FilterState['sortBy']) || 'distance',
    sortDirection: (queryParams.get('sortDirection') as FilterState['sortDirection']) || 'asc',
    viewMode: (queryParams.get('viewMode') as FilterState['viewMode']) || 'grid',
    page: parseInt(queryParams.get('page') || '1', 10)
  });

  const [services, setServices] = useState<ServicePackage[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<{name: string, subcategories: string[]}[]>([]);
  const [userZipCode, setUserZipCode] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.searchTerm) params.set('q', filters.searchTerm);
    if (filters.zipCode) params.set('zip', filters.zipCode);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.priceMin > 0) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax < 1000) params.set('priceMax', filters.priceMax.toString());
    if (filters.ratingMin > 0) params.set('ratingMin', filters.ratingMin.toString());
    if (filters.radius !== 25) params.set('radius', filters.radius.toString());
    if (filters.sortBy !== 'distance') params.set('sortBy', filters.sortBy);
    if (filters.sortDirection !== 'asc') params.set('sortDirection', filters.sortDirection);
    if (filters.viewMode !== 'grid') params.set('viewMode', filters.viewMode);
    if (filters.page > 1) params.set('page', filters.page.toString());

    navigate({ search: params.toString() }, { replace: true });
  }, [filters, navigate]);

  // Fetch user profile for zip code
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !filters.zipCode) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('zip_code')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (data?.zip_code) {
            setFilters(prev => ({ ...prev, zipCode: data.zip_code }));
            setUserZipCode(data.zip_code);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('service_packages')
          .select('category, subcategory')
          .eq('status', 'active');

        if (error) throw error;

        // Group by category
        const categoryMap = new Map<string, Set<string>>();

        if (data && Array.isArray(data)) {
          data.forEach(item => {
            if (!item.category) return;

            if (!categoryMap.has(item.category)) {
              categoryMap.set(item.category, new Set());
            }

            if (item.subcategory) {
              categoryMap.get(item.category)?.add(item.subcategory);
            }
          });
        } else {
          console.warn('No category data returned or data is not an array');
        }

        // Convert to array of Category objects
        const categoryArray = Array.from(categoryMap.entries()).map(([name, subcats]) => ({
          name,
          subcategories: Array.from(subcats)
        }));

        setCategories(categoryArray);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Start building the query
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
          .eq('status', 'active');

        // Add category filter if provided
        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        // Add subcategory filter if provided
        if (filters.subcategory) {
          query = query.eq('subcategory', filters.subcategory);
        }

        // Add price range filter
        if (filters.priceMin > 0) {
          query = query.gte('price', filters.priceMin);
        }
        if (filters.priceMax < 1000) {
          query = query.lte('price', filters.priceMax);
        }

        // Execute the query
        const { data, error } = await query;

        if (error) throw error;

        if (!data || !Array.isArray(data)) {
          throw new Error('No service data returned or data is not an array');
        }

        // Fetch ratings for each service
        const servicesWithRatings = await Promise.all(
          data.map(async (service) => {
            const { data: reviewData, error: reviewError } = await supabase
              .from('reviews')
              .select('rating')
              .eq('service_package_id', service.id);

            if (reviewError) {
              console.error('Error fetching reviews:', reviewError);
              return {
                ...service,
                avg_rating: 0,
                review_count: 0
              };
            }

            const ratings = reviewData && Array.isArray(reviewData)
              ? reviewData.map(review => review.rating)
              : [];
            const avgRating = ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              : 0;

            return {
              ...service,
              avg_rating: avgRating,
              review_count: ratings.length
            };
          })
        );

        setServices(servicesWithRatings);

        // Apply client-side filters
        applyFilters(servicesWithRatings);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
        setServices([]);
        setFilteredServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [
    filters.category,
    filters.subcategory,
    filters.priceMin,
    filters.priceMax
  ]);

  // Apply client-side filters and sorting
  const applyFilters = (servicesList = services) => {
    if (!servicesList || !Array.isArray(servicesList)) {
      console.warn('No services to filter or services is not an array');
      setFilteredServices([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    let filtered = [...servicesList];

    // Apply search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term) ||
        (service.subcategory && service.subcategory.toLowerCase().includes(term))
      );
    }

    // Apply zip code and radius filter
    if (filters.zipCode) {
      // This is a simplified approach. In a real app, you'd use a geolocation service
      filtered = filtered.filter(service => {
        if (!service.service_agent || !service.service_agent.zip_code) return false;

        // Simple distance calculation based on zip code prefix
        // In a real app, you would calculate actual distance
        const serviceZip = service.service_agent.zip_code;
        const userZip = filters.zipCode;

        try {
          // Calculate a simple "distance" based on zip code
          // This is just a placeholder - real distance calculation would be more complex
          const zipDistance = Math.abs(
            parseInt(serviceZip.substring(0, 5) || '0', 10) -
            parseInt(userZip.substring(0, 5) || '0', 10)
          );
          const estimatedMiles = zipDistance / 10; // Very rough approximation

          // Add distance to service object for sorting
          service.distance = estimatedMiles;

          return estimatedMiles <= filters.radius;
        } catch (err) {
          console.warn('Error calculating distance:', err);
          return false;
        }
      });
    }

    // Apply rating filter
    if (filters.ratingMin > 0) {
      filtered = filtered.filter(service => service.avg_rating >= filters.ratingMin);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.avg_rating - b.avg_rating;
          break;
        case 'distance':
          comparison = (a.distance || Infinity) - (b.distance || Infinity);
          break;
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        default:
          comparison = 0;
      }

      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    // Calculate pagination
    const totalItems = filtered.length;
    const itemsPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    // Ensure current page is valid
    const currentPage = Math.min(filters.page, totalPages);
    if (currentPage !== filters.page) {
      setFilters(prev => ({ ...prev, page: currentPage }));
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedServices = filtered.slice(startIndex, startIndex + itemsPerPage);

    setFilteredServices(paginatedServices);
    setTotalResults(totalItems);
    setTotalPages(totalPages);
  };

  // Apply filters when relevant filter values change
  useEffect(() => {
    applyFilters();
  }, [
    filters.searchTerm,
    filters.zipCode,
    filters.ratingMin,
    filters.radius,
    filters.sortBy,
    filters.sortDirection,
    filters.page
  ]);

  // Handle filter changes
  const handleFilterChange = (name: keyof FilterState, value: any) => {
    setFilters(prev => {
      // Reset page to 1 when changing filters
      const newFilters = { ...prev, [name]: value, page: name === 'page' ? value : 1 };
      return newFilters;
    });
  };

  // Handle view mode toggle
  const handleViewModeChange = (mode: FilterState['viewMode']) => {
    setFilters(prev => ({ ...prev, viewMode: mode }));
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200">
          <ServiceSearchFilters
            filters={filters}
            categories={categories}
            onFilterChange={handleFilterChange}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>

        {/* Results Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-3 sm:mb-0">
            <p className="text-sm text-gray-500">
              {loading ? (
                'Searching...'
              ) : (
                `${totalResults} ${totalResults === 1 ? 'service' : 'services'} found`
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Controls */}
            <ServiceSortControls
              sortBy={filters.sortBy}
              sortDirection={filters.sortDirection}
              onSortChange={(sortBy, sortDirection) => {
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortDirection', sortDirection);
              }}
            />

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 ${
                  filters.viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-white text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`p-2 border-l border-gray-300 ${
                  filters.viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-white text-gray-500 hover:text-gray-700'
                }`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('map')}
                className={`p-2 border-l border-gray-300 ${
                  filters.viewMode === 'map'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-white text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Map view"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => applyFilters()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-2">No services found matching your criteria.</p>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          ) : filters.viewMode === 'map' ? (
            <ServiceSearchMap
              services={filteredServices}
              userZipCode={filters.zipCode}
              onSelectService={(serviceId) => navigate(`/book/${serviceId}`)}
            />
          ) : (
            <ServiceSearchResults
              services={filteredServices}
              viewMode={filters.viewMode}
              page={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default EnhancedServiceSearchPage;
