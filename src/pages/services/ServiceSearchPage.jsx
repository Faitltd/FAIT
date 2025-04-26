import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import MainLayout from '../../components/MainLayout';
import ServiceSearchFilters from '../../components/services/ServiceSearchFilters';
import ServiceSearchResults from '../../components/services/ServiceSearchResults';
import ServiceSearchMap from '../../components/services/ServiceSearchMap';
import { searchServices } from '../../api/servicesApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ServiceSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State for search parameters
  const [zipCode, setZipCode] = useState(queryParams.get('zip') || '');
  const [category, setCategory] = useState(queryParams.get('category') || '');
  const [searchTerm, setSearchTerm] = useState(queryParams.get('q') || '');
  const [radius, setRadius] = useState(parseInt(queryParams.get('radius') || '25', 10));
  const [priceMin, setPriceMin] = useState(parseInt(queryParams.get('price_min') || '0', 10));
  const [priceMax, setPriceMax] = useState(parseInt(queryParams.get('price_max') || '1000', 10));
  const [ratingMin, setRatingMin] = useState(parseInt(queryParams.get('rating_min') || '0', 10));
  
  // State for view options
  const [viewMode, setViewMode] = useState(queryParams.get('view') || 'list');
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'distance');
  const [sortDirection, setSortDirection] = useState(queryParams.get('dir') || 'asc');
  
  // State for results
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  // State for user profile
  const [userProfile, setUserProfile] = useState(null);
  
  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
          
          // If no zip code is provided in the URL but user has one in profile, use that
          if (!zipCode && profile?.zip_code) {
            setZipCode(profile.zip_code);
            updateQueryParams({ zip: profile.zip_code });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  // Update URL when search parameters change
  const updateQueryParams = (params) => {
    const newParams = new URLSearchParams(location.search);
    
    // Update or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // Update URL without reloading the page
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    
    // Update URL parameters
    updateQueryParams({
      zip: zipCode,
      category: category,
      q: searchTerm,
      radius: radius,
      price_min: priceMin,
      price_max: priceMax,
      rating_min: ratingMin,
      view: viewMode,
      sort: sortBy,
      dir: sortDirection,
      page: 1 // Reset to first page on new search
    });
    
    // Reset page to 1 for new searches
    setPage(1);
    
    // Fetch results
    fetchServices();
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateQueryParams({ page: newPage });
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    // If clicking the same field, toggle direction
    const newDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortBy(field);
    setSortDirection(newDirection);
    updateQueryParams({ sort: field, dir: newDirection });
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateQueryParams({ view: mode });
  };
  
  // Fetch services based on search parameters
  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const searchParams = {
        zipCode,
        category,
        searchTerm,
        radius,
        priceMin,
        priceMax,
        ratingMin,
        sortBy,
        sortDirection,
        page,
        limit: 10 // Number of results per page
      };
      
      const { services, totalCount, totalPages: pages } = await searchServices(searchParams);
      
      setServices(services);
      setTotalResults(totalCount);
      setTotalPages(pages);
      setError(null);
    } catch (err) {
      console.error('Error searching services:', err);
      setError('Failed to load services. Please try again.');
      setServices([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch services when search parameters change
  useEffect(() => {
    fetchServices();
  }, [page, sortBy, sortDirection]);
  
  // Fetch services on initial load if URL has search parameters
  useEffect(() => {
    if (location.search) {
      fetchServices();
    }
  }, [location.search]);
  
  return (
    <MainLayout currentPage="search">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Find Services</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Search Filters */}
              <ServiceSearchFilters
                zipCode={zipCode}
                setZipCode={setZipCode}
                category={category}
                setCategory={setCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                radius={radius}
                setRadius={setRadius}
                priceMin={priceMin}
                setPriceMin={setPriceMin}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                ratingMin={ratingMin}
                setRatingMin={setRatingMin}
                onSearch={handleSearch}
              />
              
              {/* View Toggle */}
              <div className="mt-6 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('list')}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('grid')}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('map')}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      viewMode === 'map'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Map View
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  {totalResults > 0 ? (
                    <span>
                      Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalResults)} of {totalResults} results
                    </span>
                  ) : (
                    <span>No results found</span>
                  )}
                </div>
              </div>
              
              {/* Results */}
              {loading ? (
                <div className="mt-6 flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              ) : viewMode === 'map' ? (
                <ServiceSearchMap
                  services={services}
                  userZipCode={zipCode}
                  onSelectService={(serviceId) => navigate(`/book/${serviceId}`)}
                />
              ) : (
                <ServiceSearchResults
                  services={services}
                  viewMode={viewMode}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default ServiceSearchPage;
