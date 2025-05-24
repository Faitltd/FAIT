import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, CheckCircle, XCircle, Star, ChevronUp, ChevronDown, Filter, MapPin, Search, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ReviewsList from '../components/ReviewsList';
import VerificationBadge from '../components/VerificationBadge';
import type { Database } from '../lib/database.types';

type ServicePackage = Database['public']['Tables']['service_packages']['Row'] & {
  // We'll fetch profiles separately if needed
  serviceAgentProfile?: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'city' | 'state' | 'avatar_url'>;
  reviewCount?: number;
  averageRating?: number;
};

const ServicePackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [userProfile, setUserProfile] = useState<{ user_type: string; zip_code?: string } | null>(null);

  // Sorting and filtering state
  const [sortField, setSortField] = useState<'title' | 'price' | 'distance' | 'rating'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterTrade, setFilterTrade] = useState<string>('');
  const [filterPriceMin, setFilterPriceMin] = useState<string>('');
  const [filterPriceMax, setFilterPriceMax] = useState<string>('');
  const [filterDistance, setFilterDistance] = useState<string>('50'); // Default 50 miles
  const [searchTerm, setSearchTerm] = useState<string>('');
  // List of available trades (same as in ServiceForm)
  const TRADES = [
    "Demolition & Disposal",
    "Electrical",
    "Plumbing",
    "Carpentry / Framing",
    "Window Installation",
    "Flooring",
    "Insulation",
    "Tile",
    "Shower Glass Installation",
    "Drywall",
    "Painting",
    "Storage Solutions",
    "HVAC",
    "Roofing",
    "Siding",
    "Deck Building",
    "Cabinetry",
    "Countertop Installation",
    "Appliance Installation",
    "Lighting & Fixtures",
    "Door Installation",
    "Custom Closets & Shelving",
    "Smart Home Integration",
    "Permitting & Inspection Services",
    "Finish Carpentry",
    "Waterproofing",
    "Soundproofing",
    "Fireplace Installation",
    "Accessibility Modifications",
    "Garage Doors"
  ];

  // Fetch user profile to determine user type and zip code
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type, zip_code')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Don't set error state here to avoid blocking the page
      }
    };

    fetchUserProfile();
  }, [user]);

  // No need to fetch trades as we have a predefined list

  // Fetch services based on user type
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        // Different query based on user type
        if (userProfile?.user_type === 'service_agent' && user) {
          // For service agents: Show only their own services
          // Simplified query - just get the service packages
          const { data, error } = await supabase
            .from('service_packages')
            .select('*')
            .eq('service_agent_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setServices(data as ServicePackage[] || []);
        } else {
          // For clients or non-logged in users: Show all active services
          // Simplified query - just get the service packages
          const { data, error } = await supabase
            .from('service_packages')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

          if (error) throw error;
          setServices(data as ServicePackage[] || []);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, userProfile, user]);

  const handleBookService = async (serviceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${serviceId}`);
  };

  const handleEditService = (serviceId: string) => {
    navigate(`/services/edit/${serviceId}`);
  };

  const handleCreateService = () => {
    navigate('/services/create');
  };

  const calculateOverallRating = (service: ServicePackage) => {
    if (!service.reviews || service.reviews.length === 0) return null;

    const ratings = service.reviews
      .filter(review => review && review.rating) // Filter out null reviews or ratings
      .map(review => review.rating);

    if (ratings.length === 0) return null;

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return average.toFixed(1);
  };

  // Calculate approximate distance between zip codes
  // This is a very simplified approach - in a real app, you'd use a geolocation service
  const calculateDistance = (zipCode1?: string, zipCode2?: string): number => {
    if (!zipCode1 || !zipCode2) return 999; // Default to a large distance if either zip is missing

    // Simple comparison based on first 3 digits
    const prefix1 = zipCode1.substring(0, 3);
    const prefix2 = zipCode2.substring(0, 3);

    if (prefix1 === prefix2) return 0; // Same area

    // Very rough approximation
    const diff = Math.abs(parseInt(prefix1) - parseInt(prefix2));
    return diff * 5; // Rough estimate: each prefix difference is about 5 miles
  };

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    if (!services) return [];

    // First apply filters
    let result = [...services];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(service =>
        service.title.toLowerCase().includes(term) ||
        (service.description && service.description.toLowerCase().includes(term))
      );
    }

    // Filter by trade
    if (filterTrade) {
      result = result.filter(service => service.trade === filterTrade);
    }

    // Filter by price range
    if (filterPriceMin) {
      const minPrice = parseFloat(filterPriceMin);
      if (!isNaN(minPrice)) {
        result = result.filter(service => service.price >= minPrice);
      }
    }

    if (filterPriceMax) {
      const maxPrice = parseFloat(filterPriceMax);
      if (!isNaN(maxPrice)) {
        result = result.filter(service => service.price <= maxPrice);
      }
    }

    // Filter by distance
    if (filterDistance && userProfile?.zip_code) {
      const maxDistance = parseInt(filterDistance);
      if (!isNaN(maxDistance)) {
        result = result.filter(service => {
          // Since we don't have profiles data, we'll skip distance filtering for now
          return true;
        });
      }
    }

    // Then sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;

        case 'price':
          comparison = a.price - b.price;
          break;

        case 'distance':
          // Since we don't have profiles data, we'll skip distance sorting for now
          comparison = 0;
          break;

        case 'rating':
          // Since we don't have reviews data, we'll skip rating sorting for now
          comparison = 0;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [services, sortField, sortDirection, filterTrade, filterPriceMin, filterPriceMax, filterDistance, searchTerm, userProfile?.zip_code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          {userProfile?.user_type === 'service_agent' ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Your Services</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage the services you offer to clients
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Available Services</h1>
              <p className="mt-2 text-lg text-gray-600">
                Browse and book services from our verified service agents
              </p>
            </>
          )}
        </div>

        {userProfile?.user_type === 'service_agent' && (
          <button
            onClick={handleCreateService}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Service
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          {userProfile?.user_type === 'service_agent' ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't created any services yet</h3>
              <p className="text-gray-600 mb-4">Create your first service to start getting bookings from clients.</p>
              <button
                onClick={handleCreateService}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create New Service
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services available</h3>
              <p className="text-gray-600">Check back later for new service offerings.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">
                        by Service Agent
                      </p>
                      {/* Verification badge removed as we're not fetching verification data */}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {service.price}
                </span>
              </div>

              {/* Rating placeholder */}

              <p className="mt-4 text-gray-600">{service.description}</p>

              {service.duration && (
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Duration: {service.duration}</span>
                </div>
              )}

              {service.scope && service.scope.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Includes:</h4>
                  <ul className="mt-2 space-y-2">
                    {service.scope.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.exclusions && service.exclusions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Not Included:</h4>
                  <ul className="mt-2 space-y-2">
                    {service.exclusions.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}



              {/* Reviews section removed as we're not fetching reviews data */}

              <div className="mt-6">
                {userProfile?.user_type === 'service_agent' && (service.service_agent_id === user?.id || service.contractor_id === user?.id) ? (
                  <button
                    onClick={() => handleEditService(service.id)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Edit Service
                  </button>
                ) : (
                  <button
                    onClick={() => handleBookService(service.id)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default ServicePackages;
