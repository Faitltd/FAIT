import React, { useState, useEffect, useRef } from 'react';
import { GeocodingResult } from '../../types/maps';
import { Button } from '../../../core/components/ui/Button';

export interface LocationSearchProps {
  apiKey: string;
  onSelect?: (result: GeocodingResult) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  buttonText?: string;
  showButton?: boolean;
}

/**
 * LocationSearch component for searching locations using Google Places Autocomplete
 */
export const LocationSearch: React.FC<LocationSearchProps> = ({
  apiKey,
  onSelect,
  placeholder = 'Search for a location',
  initialValue = '',
  className,
  buttonText = 'Search',
  showButton = true,
}) => {
  const [value, setValue] = useState(initialValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptError, setIsScriptError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsScriptLoaded(true);
      return;
    }
    
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    googleMapsScript.onload = () => {
      setIsScriptLoaded(true);
    };
    
    googleMapsScript.onerror = () => {
      setIsScriptError('Failed to load Google Maps script');
    };
    
    document.head.appendChild(googleMapsScript);
    
    return () => {
      document.head.removeChild(googleMapsScript);
    };
  }, [apiKey]);

  // Initialize services
  useEffect(() => {
    if (isScriptLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService (it requires a DOM element)
      const dummyDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(dummyDiv);
      
      // Create a new session token
      sessionToken.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [isScriptLoaded]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (newValue.length > 2 && autocompleteService.current && sessionToken.current) {
      setIsLoading(true);
      setError(null);
      
      autocompleteService.current.getPlacePredictions(
        {
          input: newValue,
          sessionToken: sessionToken.current,
        },
        (results, status) => {
          setIsLoading(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setPredictions([]);
          } else {
            setError('Failed to get predictions');
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  };

  // Handle prediction selection
  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (placesService.current && sessionToken.current) {
      setIsLoading(true);
      setError(null);
      
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['geometry', 'formatted_address', 'address_component'],
          sessionToken: sessionToken.current,
        },
        (result, status) => {
          setIsLoading(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            // Extract address components
            const addressComponents: any = {};
            result.address_components?.forEach((component) => {
              if (component.types.includes('street_number') || component.types.includes('route')) {
                addressComponents.street = addressComponents.street 
                  ? `${addressComponents.street} ${component.long_name}`
                  : component.long_name;
              } else if (component.types.includes('locality')) {
                addressComponents.city = component.long_name;
              } else if (component.types.includes('administrative_area_level_1')) {
                addressComponents.state = component.short_name;
              } else if (component.types.includes('postal_code')) {
                addressComponents.zipCode = component.long_name;
              } else if (component.types.includes('country')) {
                addressComponents.country = component.long_name;
              }
            });
            
            // Create geocoding result
            const geocodingResult: GeocodingResult = {
              address: prediction.description,
              location: {
                lat: result.geometry?.location?.lat() || 0,
                lng: result.geometry?.location?.lng() || 0,
              },
              placeId: prediction.place_id,
              formattedAddress: result.formatted_address || prediction.description,
              addressComponents,
            };
            
            // Call onSelect callback
            if (onSelect) {
              onSelect(geocodingResult);
            }
            
            // Update input value
            setValue(prediction.description);
            
            // Clear predictions
            setPredictions([]);
            
            // Create a new session token for the next search
            sessionToken.current = new google.maps.places.AutocompleteSessionToken();
          } else {
            setError('Failed to get place details');
          }
        }
      );
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (value && predictions.length > 0) {
      handlePredictionSelect(predictions[0]);
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && predictions.length > 0) {
      handlePredictionSelect(predictions[0]);
    }
  };

  if (isScriptError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {isScriptError}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      <div className="flex">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isScriptLoaded || isLoading}
        />
        
        {showButton && (
          <Button
            className="ml-2"
            onClick={handleSearchClick}
            disabled={!isScriptLoaded || isLoading || !value}
          >
            {buttonText}
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mt-1 text-sm text-red-600">{error}</div>
      )}
      
      {predictions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handlePredictionSelect(prediction)}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
