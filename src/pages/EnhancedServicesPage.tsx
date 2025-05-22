import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EnhancedServiceCard from '../components/services/EnhancedServiceCard';
import ServiceCategoryNav from '../components/services/ServiceCategoryNav';
import AdvancedSearchBar from '../components/search/AdvancedSearchBar';
import CategoryBubbles from '../components/services/CategoryBubbles';
import {
  Search,
  Filter,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUpDown,
  Tool,
  Home,
  Paintbrush,
  Wrench,
  Scissors,
  Truck,
  Leaf,
  Zap,
  Droplet
} from 'lucide-react';

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: string;
  category: string;
  subcategory?: string;
  service_agent_id: string;
  created_at: string;
  image_url?: string;
  service_agent: {
    id: string;
    full_name: string;
    avatar_url?: string;
    zip_code?: string;
  };
  avg_rating?: number;
  review_count?: number;
  featured?: boolean;
  verified?: boolean;
  top_rated?: boolean;
}

interface Category {
  name: string;
  icon: React.ReactNode;
  subcategories: string[];
}

const EnhancedServicesPage: React.FC = () => {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const location = useLocation();

  // Parse URL parameters
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';
  const zipParam = queryParams.get('zip') || '';
  const categoryParam = queryParams.get('category') || '';
  const agentParam = queryParams.get('agent') === 'true';

  // Parallax effects
  const heroParallax = useTransform(scrollY, [0, 500], [0, 150]);
  const categoryParallax = useTransform(scrollY, [200, 700], [0, 100]);

  // State
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [zipCode, setZipCode] = useState(zipParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'distance'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [userZipCode, setUserZipCode] = useState<string | null>(null);
  const [searchByAgent, setSearchByAgent] = useState(agentParam);

  // Categories with icons
  const categories: Category[] = [
    {
      name: 'Home Repair',
      icon: <Home className="h-6 w-6" />,
      subcategories: ['General Repairs', 'Furniture Assembly', 'Mounting', 'Drywall Repair']
    },
    {
      name: 'Plumbing',
      icon: <Droplet className="h-6 w-6" />,
      subcategories: ['Leak Repair', 'Drain Cleaning', 'Fixture Installation', 'Water Heater']
    },
    {
      name: 'Electrical',
      icon: <Zap className="h-6 w-6" />,
      subcategories: ['Lighting', 'Outlets & Switches', 'Ceiling Fans', 'Electrical Panel']
    },
    {
      name: 'Painting',
      icon: <Paintbrush className="h-6 w-6" />,
      subcategories: ['Interior', 'Exterior', 'Cabinet Refinishing', 'Deck Staining']
    },
    {
      name: 'Handyman',
      icon: <Wrench className="h-6 w-6" />,
      subcategories: ['General Maintenance', 'Door Repair', 'Window Repair', 'Weatherproofing']
    },
    {
      name: 'Cleaning',
      icon: <Scissors className="h-6 w-6" />,
      subcategories: ['House Cleaning', 'Deep Cleaning', 'Move-in/Move-out', 'Carpet Cleaning']
    },
    {
      name: 'Moving',
      icon: <Truck className="h-6 w-6" />,
      subcategories: ['Local Moving', 'Furniture Moving', 'Packing Services', 'Junk Removal']
    },
    {
      name: 'Landscaping',
      icon: <Leaf className="h-6 w-6" />,
      subcategories: ['Lawn Mowing', 'Garden Design', 'Tree Trimming', 'Irrigation']
    }
  ];

  useEffect(() => {
    fetchServices();
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

        if (data?.zip_code) {
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
        .eq('is_active', true);

      if (error) throw error;

      // Fetch ratings
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('service_package_id, rating')
        .in('service_package_id', data.map(service => service.id));

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      }

      // Group reviews by service_package_id
      const reviewsByServiceId = (reviewsData || []).reduce((acc, review) => {
        if (!acc[review.service_package_id]) {
          acc[review.service_package_id] = [];
        }
        acc[review.service_package_id].push(review.rating);
        return acc;
      }, {});

      // Add ratings and additional properties to services
      const servicesWithRatings = data.map((service, index) => {
        const ratings = reviewsByServiceId[service.id] || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

        // Add some demo properties for visual enhancement
        const featured = index % 7 === 0; // Every 7th item is featured
        const verified = avgRating > 3.5 || index % 3 === 0; // Verified if good rating or every 3rd
        const top_rated = avgRating >= 4.5; // Top rated if 4.5+ stars

        return {
          ...service,
          avg_rating: avgRating,
          review_count: ratings.length,
          featured,
          verified,
          top_rated
        };
      });

      setServices(servicesWithRatings);
    } catch (err) {
      console.error('Error fetching services:', err);
      const errorMessage = err instanceof Error
        ? `Failed to load services: ${err.message}`
        : 'Failed to load services. Please try again.';
      setError(errorMessage);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Apply search term filter with enhanced keyword search
    if (searchTerm) {
      const terms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 1);

      if (terms.length > 0) {
        filtered = filtered.filter(service => {
          // Create a combined text of all searchable fields
          const searchableText = [
            service.title,
            service.description,
            service.category,
            service.subcategory,
            service.service_agent.full_name,
            // Add any other fields that should be searchable
          ].filter(Boolean).join(' ').toLowerCase();

          // Check if all terms are found in the searchable text
          return terms.every(term => searchableText.includes(term));
        });
      }
    }

    // Apply zip code filter with agent search
    if (zipCode) {
      if (searchByAgent) {
        // Search for agents near the user's location
        filtered = filtered.filter(service => {
          if (!service.service_agent.zip_code) return false;

          // Check if first 3 digits match (same general area)
          const agentZipPrefix = service.service_agent.zip_code.substring(0, 3);
          const userZipPrefix = zipCode.substring(0, 3);

          return agentZipPrefix === userZipPrefix;
        });
      } else {
        // Standard zip code filter
        filtered = filtered.filter(service =>
          service.service_agent.zip_code &&
          service.service_agent.zip_code.substring(0, 3) === zipCode.substring(0, 3)
        );
      }
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
        // If we have user's zip code, sort by proximity
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

  const clearFilters = () => {
    setSearchTerm('');
    setZipCode(userZipCode || '');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 1000]);
    setSortBy('rating');
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Hero Section with Parallax - FAIT Style */}
      <div className="relative h-80 overflow-hidden bg-[#F9FAFB]">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(/images/services-hero.jpg)',
            y: heroParallax,
            height: '120%',
            top: '-10%',
            opacity: 0.1
          }}
        />

        {/* Decorative Images with Parallax */}
        <motion.img
          src="/images/decoration-1.png"
          alt=""
          className="absolute bottom-[80%] right-[10%] h-[262px] w-[446px] z-0 hidden md:block"
          style={{ y: useTransform(scrollY, [0, 500], [0, 100]) }}
        />

        <motion.img
          src="/images/decoration-2.png"
          alt=""
          className="absolute top-[10%] left-[5%] h-[462px] w-[146px] z-0 hidden md:block"
          style={{ y: useTransform(scrollY, [0, 500], [0, -50]) }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-4xl font-extrabold sm:text-5xl text-center text-[#2B4C32] font-ivy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find the Perfect Service
          </motion.h1>
          <motion.p
            className="mt-4 text-xl max-w-2xl text-center text-[#1A1E1D]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Browse our wide selection of professional home services
          </motion.p>

          {/* Advanced Search Bar - FAIT Style */}
          <motion.div
            className="h-[64px] max-w-[646px] w-full px-2 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col h-full w-full relative">
              <div className="flex h-[64px] w-full">
                <AdvancedSearchBar
                  initialSearchTerm={searchTerm}
                  initialZipCode={zipCode}
                  onSearch={(term, zip, byAgent) => {
                    setSearchTerm(term);
                    setZipCode(zip);
                    setSearchByAgent(byAgent);
                  }}
                  fullWidth
                  showAgentSearch
                  className="rounded-full border-2 border-[#595C5B] shadow-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Service Categories with Parallax */}
      <div className="relative py-16 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-dots-pattern bg-repeat opacity-5 z-0"
          style={{
            y: categoryParallax
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-gray-900 text-center mb-8 font-ivy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Browse by Category
          </motion.h2>

          {/* TaskRabbit-style Service Category Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ServiceCategoryNav />
          </motion.div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Sort */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
              </h2>
              {(searchTerm || zipCode || selectedCategory || selectedSubcategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
                <button
                  onClick={clearFilters}
                  className="ml-4 flex items-center text-company-lightpink hover:text-company-lighterpink text-sm font-medium"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-company-lightpink focus:border-company-lightpink"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="distance">Distance</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              className="mb-8 p-6 bg-white rounded-lg shadow-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-company-lightpink"
                      />
                      <span className="text-xs text-gray-500">Min: ${priceRange[0]}</span>
                    </div>
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-company-lightpink"
                      />
                      <span className="text-xs text-gray-500">Max: ${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Additional filters can be added here */}
              </div>
            </motion.div>
          )}

          {/* Service Cards */}
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-company-lightpink"></div>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchServices}
                className="px-4 py-2 bg-company-lightpink text-white rounded-md hover:bg-company-lighterpink"
              >
                Try Again
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-2">No services found matching your criteria.</p>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service, index) => (
                <EnhancedServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedServicesPage;
