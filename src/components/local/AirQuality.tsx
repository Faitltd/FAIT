import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner';

interface AirQualityData {
  indexes: {
    code: string;
    displayName: string;
    aqi: number;
    category: string;
    dominantPollutant: string;
    color: {
      red: number;
      green: number;
      blue: number;
    };
  }[];
  pollutants: {
    code: string;
    displayName: string;
    fullName: string;
    concentration: {
      value: number;
      units: string;
    };
    additionalInfo: {
      sources: string;
      effects: string;
    };
  }[];
  healthRecommendations: {
    generalPopulation: string;
    elderly: string;
    children: string;
    athletes: string;
    pregnantWomen: string;
    asthmaOrLungDiseaseOrHeartDisease: string;
  };
  dateTime: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface AirQualityProps {
  apiKey: string;
}

const AirQuality: React.FC<AirQualityProps> = ({ apiKey }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [manualSearch, setManualSearch] = useState(false);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation && !manualSearch) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to get your location. Please enter your address manually.');
          setLoading(false);
        }
      );
    }
  }, [manualSearch]);

  // Fetch air quality data when location changes
  useEffect(() => {
    if (location) {
      fetchAirQualityData();
    }
  }, [location]);

  // Fetch air quality data from Google Air Quality API
  const fetchAirQualityData = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: {
              latitude: location.lat,
              longitude: location.lng,
            },
            extraComputations: [
              'HEALTH_RECOMMENDATIONS',
              'DOMINANT_POLLUTANT_CONCENTRATION',
              'POLLUTANT_CONCENTRATION',
              'LOCAL_AQI',
              'POLLUTANT_ADDITIONAL_INFO',
            ],
            languageCode: 'en',
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch air quality data');
      }
      
      const data = await response.json();
      setAirQualityData(data);
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('Failed to fetch air quality data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle address search
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }
    
    setLoading(true);
    setError(null);
    setManualSearch(true);
    
    try {
      // Use Google Geocoding API to convert address to coordinates
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      
      if (!geocodeResponse.ok) {
        throw new Error('Failed to geocode address');
      }
      
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('No results found for this address');
      }
      
      const { lat, lng } = geocodeData.results[0].geometry.location;
      setLocation({ lat, lng });
    } catch (err) {
      console.error('Error geocoding address:', err);
      setError('Failed to find location. Please check your address and try again.');
      setLoading(false);
    }
  };

  // Get color for AQI value
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500'; // Good
    if (aqi <= 100) return 'bg-yellow-400'; // Moderate
    if (aqi <= 150) return 'bg-orange-500'; // Unhealthy for Sensitive Groups
    if (aqi <= 200) return 'bg-red-500'; // Unhealthy
    if (aqi <= 300) return 'bg-purple-600'; // Very Unhealthy
    return 'bg-red-900'; // Hazardous
  };

  // Get category text for AQI value
  const getAqiCategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Local Air Quality</h2>
      <p className="text-lg mb-6">
        Check the current air quality in your area and get health recommendations based on pollution levels.
      </p>
      
      <form onSubmit={handleAddressSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address for air quality data"
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
          >
            {loading ? 'Searching...' : 'Check Air Quality'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </form>
      
      {loading && <LoadingSpinner />}
      
      {airQualityData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Main AQI Display */}
          {airQualityData.indexes && airQualityData.indexes.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Current Air Quality</h3>
                  <p className="text-gray-600">
                    {new Date(airQualityData.dateTime).toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getAqiColor(airQualityData.indexes[0].aqi)}`}>
                    <span className="text-3xl font-bold text-white">{Math.round(airQualityData.indexes[0].aqi)}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-xl font-semibold">{getAqiCategory(airQualityData.indexes[0].aqi)}</p>
                    <p className="text-gray-600">
                      {airQualityData.indexes[0].displayName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Pollutants */}
          {airQualityData.pollutants && airQualityData.pollutants.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Pollutants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {airQualityData.pollutants.map((pollutant, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-lg">{pollutant.displayName}</h4>
                    <p className="text-gray-600 text-sm mb-2">{pollutant.fullName}</p>
                    <p className="font-medium">
                      {pollutant.concentration.value.toFixed(2)} {pollutant.concentration.units}
                    </p>
                    {pollutant.additionalInfo && (
                      <button
                        className="mt-2 text-blue-600 text-sm hover:underline"
                        onClick={() => alert(`Sources: ${pollutant.additionalInfo.sources}\n\nEffects: ${pollutant.additionalInfo.effects}`)}
                      >
                        More Info
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Health Recommendations */}
          {airQualityData.healthRecommendations && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Health Recommendations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">General Population</h4>
                  <p>{airQualityData.healthRecommendations.generalPopulation}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Children</h4>
                    <p>{airQualityData.healthRecommendations.children}</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Elderly</h4>
                    <p>{airQualityData.healthRecommendations.elderly}</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Athletes</h4>
                    <p>{airQualityData.healthRecommendations.athletes}</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Pregnant Women</h4>
                    <p>{airQualityData.healthRecommendations.pregnantWomen}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">People with Asthma, Lung or Heart Disease</h4>
                  <p>{airQualityData.healthRecommendations.asthmaOrLungDiseaseOrHeartDisease}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AirQuality;
