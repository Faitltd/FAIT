import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Simplified version of the ImprovedServicePackages component for debugging
 * This component removes all external dependencies and complex logic
 * to isolate rendering issues
 */
const DebugServicePackages: React.FC = () => {
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Component mounted');
  const [googleMapsStatus, setGoogleMapsStatus] = useState<string>('Not checked');
  const [windowObjects, setWindowObjects] = useState<string[]>([]);

  // Log component lifecycle for debugging
  useEffect(() => {
    console.log('DebugServicePackages component mounted');

    // Log any errors that might occur during rendering
    try {
      // Test if we can access window object
      if (window) {
        setDebugInfo(prev => `${prev}\nWindow object accessible`);

        // Check for Google Maps API
        if (window.google && window.google.maps) {
          setGoogleMapsStatus('Loaded and available');
          setDebugInfo(prev => `${prev}\nGoogle Maps API is loaded and available`);
        } else if (window.google) {
          setGoogleMapsStatus('Google object exists but maps is not available');
          setDebugInfo(prev => `${prev}\nGoogle object exists but maps is not available`);
        } else {
          setGoogleMapsStatus('Not loaded');
          setDebugInfo(prev => `${prev}\nGoogle Maps API is not loaded`);
        }

        // Log available window objects for debugging
        const objects = Object.keys(window).filter(key =>
          typeof window[key] === 'object' && window[key] !== null
        ).slice(0, 20); // Limit to first 20 to avoid overwhelming

        setWindowObjects(objects);
        setDebugInfo(prev => `${prev}\nAvailable window objects: ${objects.join(', ')}`);
      }
    } catch (err) {
      console.error('Error in DebugServicePackages useEffect:', err);
      setDebugInfo(prev => `${prev}\nError: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return () => {
      console.log('DebugServicePackages component unmounted');
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate zip code
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid zip code');
      return;
    }

    setError(null);

    // Create search params for navigation
    const searchParams = new URLSearchParams();
    if (zipCode) searchParams.set('zip', zipCode);

    // Navigate to the enhanced service search page with the search parameters
    navigate(`/services/search?${searchParams.toString()}`);
  };

  // Function to check Google Maps API status
  const checkGoogleMapsStatus = () => {
    try {
      if (window.google && window.google.maps) {
        setGoogleMapsStatus('Loaded and available');
        setDebugInfo(prev => `${prev}\n[${new Date().toISOString()}] Google Maps API is loaded and available`);

        // Try to create a map object to verify it's fully loaded
        try {
          const testLatLng = new window.google.maps.LatLng(0, 0);
          setDebugInfo(prev => `${prev}\nSuccessfully created LatLng object`);
        } catch (err) {
          setDebugInfo(prev => `${prev}\nError creating LatLng object: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } else if (window.google) {
        setGoogleMapsStatus('Google object exists but maps is not available');
        setDebugInfo(prev => `${prev}\n[${new Date().toISOString()}] Google object exists but maps is not available`);
      } else {
        setGoogleMapsStatus('Not loaded');
        setDebugInfo(prev => `${prev}\n[${new Date().toISOString()}] Google Maps API is not loaded`);
      }
    } catch (err) {
      setDebugInfo(prev => `${prev}\nError checking Google Maps status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Debug Services Page</h1>
        <p className="mt-2 text-gray-600">This is a simplified version of the services page for debugging</p>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900">Find Trusted Service Professionals</h2>
          <p className="mt-2 text-gray-600">Connect with verified service agents for all your home improvement and maintenance needs.</p>

          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter your zip code"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Search
              </button>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900">Debug Information</h2>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">Google Maps Status: </span>
              <span className={`text-sm ${googleMapsStatus === 'Loaded and available' ? 'text-green-600' : 'text-red-600'}`}>
                {googleMapsStatus}
              </span>
            </div>
            <button
              onClick={checkGoogleMapsStatus}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
            >
              Check Status
            </button>
          </div>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-sm max-h-60">
            {debugInfo}
          </pre>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900">Find Services Near You</h2>
          <p className="mt-2 text-gray-600">Enter your zip code to find service providers in your area.</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900">Popular Service Categories</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {['Plumbing', 'Electrical', 'HVAC', 'Landscaping'].map((category) => (
              <div key={category} className="p-4 bg-white shadow rounded-lg">
                <h3 className="font-medium">{category}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900">How It Works</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="font-medium">Search</h3>
              <p className="mt-2 text-sm text-gray-600">Enter your zip code and search for services in your area.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="font-medium">Book</h3>
              <p className="mt-2 text-sm text-gray-600">Choose a service provider and book an appointment.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="font-medium">Relax</h3>
              <p className="mt-2 text-sm text-gray-600">Sit back and relax while our verified service professionals take care of your needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugServicePackages;
