import React, { useState, useEffect, ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Error boundary component for catching rendering errors
class ServicePageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('Error in ImprovedServicePackages component:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-4 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
          <p className="mt-2 text-red-700">
            {this.state.error?.message || 'An unknown error occurred'}
          </p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Reload Page
            </button>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-red-700">Error Details</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-sm">
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Service category images with fallbacks
const categoryImages = {
  plumbing: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  hvac: 'https://images.unsplash.com/photo-1581275288578-bfb98a6fa4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  landscaping: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  cleaning: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  carpentry: 'https://images.unsplash.com/photo-1601564921647-b446262bbc6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  painting: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  roofing: 'https://images.unsplash.com/photo-1632759145351-1d170f2a9ddd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  default: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
};

// Default fallback image for hero section
const heroImage = 'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80';

// Service categories
const serviceCategories = [
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'landscaping', name: 'Landscaping' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'painting', name: 'Painting' },
  { id: 'roofing', name: 'Roofing' }
];

// Mock data for search results (fallback if API fails)
const mockSearchResults = [
  {
    id: 1,
    title: 'Plumbing Repair',
    provider: 'John\'s Plumbing Services',
    rating: 4.8,
    reviews: 124,
    price: '$75/hour',
    distance: '2.3 miles',
    category: 'plumbing',
    description: 'Professional plumbing services including leak repairs, drain cleaning, and fixture installation.',
    image: 'https://images.unsplash.com/photo-1606274741559-d3a3b4a7d20f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    title: 'Electrical Installation',
    provider: 'Bright Spark Electric',
    rating: 4.7,
    reviews: 98,
    price: '$85/hour',
    distance: '3.1 miles',
    category: 'electrical',
    description: 'Licensed electricians for all your electrical needs, from minor repairs to full home rewiring.',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    title: 'HVAC Maintenance',
    provider: 'Cool Comfort Systems',
    rating: 4.9,
    reviews: 156,
    price: '$95/hour',
    distance: '1.8 miles',
    category: 'hvac',
    description: 'Heating and cooling system maintenance, repair, and installation by certified technicians.',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

const ImprovedServicePackages: React.FC = () => {
  console.log('ImprovedServicePackages component rendering');

  const navigate = useNavigate();
  const { user } = useAuth();
  const [zipCode, setZipCode] = useState('');
  const [searchRadius, setSearchRadius] = useState('10');
  const [searchCategory, setSearchCategory] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Component initialized');

  // Get user profile and zip code if logged in
  useEffect(() => {
    console.log('ImprovedServicePackages useEffect running');
    setDebugInfo(prev => `${prev}\nFetching user profile`);

    const fetchUserProfile = async () => {
      if (!user) {
        console.log('No user found, skipping profile fetch');
        setDebugInfo(prev => `${prev}\nNo user found, skipping profile fetch`);
        return;
      }

      try {
        console.log('Fetching user profile for user:', user.id);
        setDebugInfo(prev => `${prev}\nFetching profile for user: ${user.id}`);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setDebugInfo(prev => `${prev}\nError fetching profile: ${error.message}`);
          return;
        }

        if (data) {
          console.log('User profile fetched successfully:', data);
          setDebugInfo(prev => `${prev}\nProfile fetched successfully`);
          setUserProfile(data);
          if (data.zip_code) {
            console.log('Setting zip code from profile:', data.zip_code);
            setZipCode(data.zip_code);
          }
        }
      } catch (err) {
        console.error('Error in profile fetch:', err);
        setDebugInfo(prev => `${prev}\nError in profile fetch: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    fetchUserProfile();

    return () => {
      console.log('ImprovedServicePackages useEffect cleanup');
    };
  }, [user]);

  // Filter results based on category if one is selected
  const filteredResults = searchCategory
    ? services.filter(service => service.category === searchCategory)
    : services;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate zip code
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid zip code');
      return;
    }

    setError(null);
    setHasSearched(true);

    // In a real app, we would fetch services from the API
    // For now, we'll use the mock data
    setServices(mockSearchResults);

    // Create search params for navigation
    const searchParams = new URLSearchParams();
    if (zipCode) searchParams.set('zip', zipCode);
    if (searchRadius) searchParams.set('radius', searchRadius);
    if (searchCategory) searchParams.set('category', searchCategory);

    // Navigate to the enhanced service search page with the search parameters
    navigate(`/services/search?${searchParams.toString()}`);
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-500">{rating} reviews</span>
      </div>
    );
  };

  // Safe Google Maps URL creation
  const getGoogleMapsUrl = () => {
    try {
      console.log('Getting Google Maps URL');
      setDebugInfo(prev => `${prev}\nGetting Google Maps URL`);

      // Try to get API key from environment variables
      let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      // Log the API key status for debugging
      if (!apiKey) {
        console.warn('Google Maps API key is missing from environment variables');
        setDebugInfo(prev => `${prev}\nGoogle Maps API key is missing from environment variables`);

        // Fallback to a hardcoded key for development purposes only
        // In production, this should be properly set in environment variables
        apiKey = 'AIzaSyCouikAluUnbD8iQJatqlzxSUCoT7QiZog';
        console.log('Using fallback API key');
        setDebugInfo(prev => `${prev}\nUsing fallback API key`);
      } else {
        console.log(`Google Maps API key available: ${apiKey.substring(0, 4)}...`);
        setDebugInfo(prev => `${prev}\nGoogle Maps API key available`);
      }

      const url = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=service+providers+near+${zipCode || 'Denver'}&zoom=12`;
      console.log('Google Maps URL created successfully');
      setDebugInfo(prev => `${prev}\nGoogle Maps URL created successfully: ${url.substring(0, 50)}...`);

      return url;
    } catch (err) {
      console.error('Error creating Google Maps URL:', err);
      setDebugInfo(prev => `${prev}\nError creating Google Maps URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMapError(true);
      return null;
    }
  };

  return (
    <div className="py-10">
      {/* Hero Section with Background Image */}
      <div className="px-4 py-6 sm:px-0">
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Service professionals"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = 'https://via.placeholder.com/1500x500?text=Service+Professionals';
              }}
            />
            <div className="absolute inset-0 bg-blue-700 mix-blend-multiply" />
          </div>
          <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="block text-white">Find Trusted Service Professionals</span>
              <span className="block text-blue-200">In Your Area</span>
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-center text-xl text-blue-100 sm:max-w-3xl">
              Connect with verified service agents for all your home improvement and maintenance needs.
            </p>
            <div className="mt-10 max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="sm:flex">
                <div className="min-w-0 flex-1">
                  <label htmlFor="zip-code-hero" className="sr-only">Zip code</label>
                  <input
                    id="zip-code-hero"
                    type="text"
                    placeholder="Enter your zip code"
                    className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <button
                    type="submit"
                    className="block w-full py-3 px-4 rounded-md shadow bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
                  >
                    Search
                  </button>
                </div>
              </form>
              {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Find Services Near You</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Advanced Search Form */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-2">
                        <label htmlFor="zip-code" className="block text-sm font-medium text-gray-700">
                          Zip Code
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="zip-code"
                            id="zip-code"
                            autoComplete="postal-code"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="Enter zip code"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="search-radius" className="block text-sm font-medium text-gray-700">
                          Search Radius (miles)
                        </label>
                        <div className="mt-1">
                          <select
                            id="search-radius"
                            name="search-radius"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(e.target.value)}
                          >
                            <option value="5">5 miles</option>
                            <option value="10">10 miles</option>
                            <option value="25">25 miles</option>
                            <option value="50">50 miles</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Service Category
                        </label>
                        <div className="mt-1">
                          <select
                            id="category"
                            name="category"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                          >
                            <option value="">All Categories</option>
                            {serviceCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Map Section with Error Handling */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Service Locations</h2>
                  <div className="mt-4 border-2 border-gray-300 border-dashed rounded-lg h-96 flex items-center justify-center bg-gray-100 relative overflow-hidden">
                    {/* Interactive Map Component with Error Handling */}
                    {!mapError && getGoogleMapsUrl() && (
                      <div className="absolute inset-0 w-full h-full">
                        <iframe
                          src={getGoogleMapsUrl() || ''}
                          className="w-full h-full"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Service Providers Map"
                          onError={(e) => {
                            console.error('Map iframe failed to load');
                            setMapError(true);
                            setDebugInfo(prev => `${prev}\nMap iframe failed to load`);
                            // Hide the iframe on error
                            e.currentTarget.style.display = 'none';
                          }}
                        ></iframe>
                      </div>
                    )}

                    {/* Fallback for when map fails to load */}
                    {mapError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center p-6">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Map Unavailable</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            We're unable to load the map at this time. Please try again later.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className={`absolute inset-0 ${!mapError ? 'bg-white bg-opacity-70' : 'bg-white'} flex items-center justify-center pointer-events-none`}>
                      <div className="text-center p-6 bg-white bg-opacity-90 rounded-lg shadow-sm pointer-events-auto">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Map View</h3>
                        {mapError && (
                          <p className="mt-1 text-sm text-red-500">
                            Unable to load map. Please try again later.
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          {hasSearched
                            ? `Showing service providers near ${zipCode} within ${searchRadius} miles`
                            : 'Enter a zip code and search radius to view service providers on the map'}
                        </p>
                        {!hasSearched && (
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (!zipCode || zipCode.length < 5) {
                                  setError('Please enter a valid zip code');
                                  return;
                                }
                                setError(null);
                                const searchParams = new URLSearchParams();
                                if (zipCode) searchParams.set('zip', zipCode);
                                if (searchRadius) searchParams.set('radius', searchRadius);
                                if (searchCategory) searchParams.set('category', searchCategory);
                                navigate(`/services/search?${searchParams.toString()}`);
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Search Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Information (only visible in development) */}
            {import.meta.env.DEV && (
              <div className="px-4 py-6 sm:px-0">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Debug Information</h2>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                    {debugInfo}
                  </pre>
                </div>
              </div>
            )}

            {/* Popular Categories */}
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Service Categories</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {serviceCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      // Create search params and navigate to search page
                      const searchParams = new URLSearchParams();
                      searchParams.set('category', category.id);
                      navigate(`/services/search?${searchParams.toString()}`);
                    }}
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow relative"
                  >
                    <div className="h-32 w-full">
                      <img
                        src={categoryImages[category.id as keyof typeof categoryImages] || categoryImages.default}
                        alt={category.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = 'https://via.placeholder.com/500x500?text=' + category.name;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
                      <div className="absolute inset-0 flex items-end p-4">
                        <h3 className="text-lg font-medium text-white">{category.name}</h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* How It Works Section */}
            <div className="px-4 py-12 sm:px-0">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  How It Works
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                  Finding and booking services is easy with FAIT Co-Op
                </p>
              </div>

              <div className="mt-10">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-3 text-xl font-medium text-gray-900">Search</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Enter your zip code and search for services in your area. Filter by category, price, and more.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-3 text-xl font-medium text-gray-900">Book</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Choose a service provider and book an appointment at a time that works for you.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-3 text-xl font-medium text-gray-900">Relax</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Sit back and relax while our verified service professionals take care of your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrap the component with the error boundary
const ImprovedServicePackagesWithErrorBoundary: React.FC = () => {
  return (
    <ServicePageErrorBoundary>
      <ImprovedServicePackages />
    </ServicePageErrorBoundary>
  );
};

export default ImprovedServicePackagesWithErrorBoundary;
