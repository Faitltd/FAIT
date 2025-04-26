import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, MapPin, Star, DollarSign, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency, formatDuration } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: string;
  category: string;
  subcategory: string;
  service_agent_id: string;
  created_at: string;
  service_agent: {
    id: string;
    full_name: string;
    avatar_url?: string;
    zip_code?: string;
  };
  avg_rating?: number;
  review_count?: number;
}

interface Category {
  name: string;
  subcategories: string[];
}

interface ServiceSearchProps {
  initialZipCode?: string;
  initialCategory?: string;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({
  initialZipCode = '',
  initialCategory = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zipCode, setZipCode] = useState(initialZipCode);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'distance'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [userZipCode, setUserZipCode] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, searchTerm, zipCode, selectedCategory, selectedSubcategory, priceRange, sortBy]);

  const fetchUserProfile = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('zip_code')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data?.zip_code && !initialZipCode) {
          setZipCode(data.zip_code);
          setUserZipCode(data.zip_code);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

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
        .eq('status', 'active');

      if (error) throw error;

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

          const ratings = reviewData.map(review => review.rating);
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
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Get all unique categories and subcategories
      const { data, error } = await supabase
        .from('service_packages')
        .select('category, subcategory')
        .eq('status', 'active');

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
      const categoryArray: Category[] = Array.from(categoryMap.entries()).map(([name, subcats]) => ({
        name,
        subcategories: Array.from(subcats)
      }));

      setCategories(categoryArray);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term) ||
        (service.subcategory && service.subcategory.toLowerCase().includes(term))
      );
    }

    // Apply zip code filter
    if (zipCode) {
      filtered = filtered.filter(service => 
        service.service_agent.zip_code && 
        service.service_agent.zip_code.substring(0, 3) === zipCode.substring(0, 3)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
      
      // Apply subcategory filter
      if (selectedSubcategory) {
        filtered = filtered.filter(service => service.subcategory === selectedSubcategory);
      }
    }

    // Apply price range filter
    filtered = filtered.filter(service => 
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        break;
      case 'distance':
        // If we have user's zip code, sort by proximity (first 3 digits match = closer)
        if (userZipCode) {
          filtered.sort((a, b) => {
            const aZip = a.service_agent.zip_code || '';
            const bZip = b.service_agent.zip_code || '';
            
            // Exact match comes first
            if (aZip === userZipCode && bZip !== userZipCode) return -1;
            if (bZip === userZipCode && aZip !== userZipCode) return 1;
            
            // First 3 digits match comes next
            const aMatch = aZip.substring(0, 3) === userZipCode.substring(0, 3);
            const bMatch = bZip.substring(0, 3) === userZipCode.substring(0, 3);
            
            if (aMatch && !bMatch) return -1;
            if (bMatch && !aMatch) return 1;
            
            // Fall back to rating
            return (b.avg_rating || 0) - (a.avg_rating || 0);
          });
        }
        break;
    }

    setFilteredServices(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategory(e.target.value);
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = newValue;
      return newRange;
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'rating' | 'distance');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setZipCode(userZipCode || '');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 1000]);
    setSortBy('rating');
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Search and filter header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="relative flex-1 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search services..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="relative mb-4 md:mb-0 md:w-1/4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={zipCode}
              onChange={handleZipCodeChange}
              placeholder="ZIP Code"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>
        </div>
        
        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                id="subcategory"
                value={selectedSubcategory}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">All Subcategories</option>
                {selectedCategory && 
                  categories
                    .find(cat => cat.name === selectedCategory)
                    ?.subcategories.map(subcat => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))
                }
              </select>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="distance">Distance</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(e, 0)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">Min: {formatCurrency(priceRange[0])}</span>
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(e, 1)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">Max: {formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
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
              onClick={fetchServices}
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
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
            </p>
            
            <div className="space-y-4">
              {filteredServices.map(service => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <img
                            src={service.service_agent.avatar_url || '/default-avatar.png'}
                            alt={service.service_agent.full_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                          <p className="text-sm text-gray-500">
                            by {service.service_agent.full_name}
                          </p>
                          <div className="mt-1 flex items-center">
                            <div className="flex items-center">
                              {renderStars(service.avg_rating || 0)}
                            </div>
                            <span className="ml-1 text-sm text-gray-500">
                              ({service.review_count || 0} {service.review_count === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDuration(service.duration)}
                            </div>
                            {service.category && (
                              <div className="flex items-center">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {service.category}
                                </span>
                              </div>
                            )}
                            {service.subcategory && (
                              <div className="flex items-center">
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                  {service.subcategory}
                                </span>
                              </div>
                            )}
                            {service.service_agent.zip_code && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {service.service_agent.zip_code}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex flex-col items-end justify-between">
                      <div className="text-xl font-semibold text-gray-900">
                        {formatCurrency(service.price)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/booking/${service.id}`);
                        }}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;
