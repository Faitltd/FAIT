import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Building, AlertCircle } from 'lucide-react';

interface LocationStepProps {
  bookingData: any;
  updateBookingData: (step: string, data: any) => void;
  service: any;
}

const LocationStep: React.FC<LocationStepProps> = ({ 
  bookingData, 
  updateBookingData, 
  service 
}) => {
  const [address, setAddress] = useState(bookingData.location.address || '');
  const [city, setCity] = useState(bookingData.location.city || '');
  const [state, setState] = useState(bookingData.location.state || '');
  const [zip, setZip] = useState(bookingData.location.zip || '');
  const [locationType, setLocationType] = useState('home');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  
  // Simulate fetching saved locations
  useEffect(() => {
    // In a real app, this would fetch from the backend
    const mockSavedLocations = [
      {
        id: '1',
        name: 'Home',
        type: 'home',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      {
        id: '2',
        name: 'Office',
        type: 'work',
        address: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103'
      }
    ];
    
    setSavedLocations(mockSavedLocations);
  }, []);
  
  // Update booking data when form changes
  useEffect(() => {
    if (address && city && state && zip) {
      updateBookingData('location', { address, city, state, zip });
    }
  }, [address, city, state, zip, updateBookingData]);
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!zip.trim()) {
      newErrors.zip = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      newErrors.zip = 'Please enter a valid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateBookingData('location', { address, city, state, zip });
    }
  };
  
  // Handle selecting a saved location
  const handleSelectLocation = (location: any) => {
    setAddress(location.address);
    setCity(location.city);
    setState(location.state);
    setZip(location.zip);
    setLocationType(location.type);
    setErrors({});
  };
  
  // US States for dropdown
  const usStates = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Service Location</h2>
      
      {/* Saved Locations */}
      {savedLocations.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saved Locations
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedLocations.map(location => (
              <motion.button
                key={location.id}
                onClick={() => handleSelectLocation(location)}
                className={`p-4 rounded-md border ${
                  address === location.address
                    ? 'border-company-lightpink bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                } text-left`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center mb-1">
                  {location.type === 'home' ? (
                    <Home className="h-4 w-4 text-gray-500 mr-2" />
                  ) : (
                    <Building className="h-4 w-4 text-gray-500 mr-2" />
                  )}
                  <span className="font-medium">{location.name}</span>
                </div>
                <div className="text-sm text-gray-600">{location.address}</div>
                <div className="text-sm text-gray-600">
                  {location.city}, {location.state} {location.zip}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
      
      {/* Location Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location Type
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setLocationType('home')}
            className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${
              locationType === 'home'
                ? 'bg-company-lightpink text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </button>
          <button
            type="button"
            onClick={() => setLocationType('work')}
            className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center ${
              locationType === 'work'
                ? 'bg-company-lightpink text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building className="h-5 w-5 mr-2" />
            Work
          </button>
        </div>
      </div>
      
      {/* Location Form */}
      <form onSubmit={handleSubmit}>
        {/* Address */}
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink`}
              placeholder="123 Main St"
            />
            {errors.address && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        
        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* City */}
          <div className="mb-4">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`block w-full px-3 py-3 border ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink`}
              placeholder="San Francisco"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          
          {/* State */}
          <div className="mb-4">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State*
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={`block w-full px-3 py-3 border ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink`}
            >
              <option value="">Select State</option>
              {usStates.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
          
          {/* ZIP */}
          <div className="mb-4">
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code*
            </label>
            <input
              type="text"
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className={`block w-full px-3 py-3 border ${
                errors.zip ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink`}
              placeholder="94105"
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-600">{errors.zip}</p>
            )}
          </div>
        </div>
        
        {/* Save Location Checkbox */}
        <div className="mt-2 mb-4">
          <div className="flex items-center">
            <input
              id="save-location"
              type="checkbox"
              className="h-4 w-4 text-company-lightpink focus:ring-company-lightpink border-gray-300 rounded"
            />
            <label htmlFor="save-location" className="ml-2 block text-sm text-gray-700">
              Save this location for future bookings
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LocationStep;
