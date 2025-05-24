import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
    precip_mm: number;
    precip_in: number;
  };
  forecast?: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: {
        time: string;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      }[];
    }[];
  };
}

// Mock weather data for demonstration
const mockWeatherData: WeatherData = {
  location: {
    name: "San Francisco",
    region: "California",
    country: "United States of America",
    lat: 37.78,
    lon: -122.42,
    localtime: "2023-10-15 14:30"
  },
  current: {
    temp_c: 18.5,
    temp_f: 65.3,
    condition: {
      text: "Partly cloudy",
      icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
    },
    wind_mph: 12.5,
    wind_kph: 20.2,
    wind_dir: "W",
    humidity: 68,
    feelslike_c: 17.8,
    feelslike_f: 64.0,
    uv: 4,
    precip_mm: 0.0,
    precip_in: 0.0
  },
  forecast: {
    forecastday: [
      {
        date: "2023-10-15",
        day: {
          maxtemp_c: 20.5,
          maxtemp_f: 68.9,
          mintemp_c: 14.2,
          mintemp_f: 57.6,
          avgtemp_c: 17.3,
          avgtemp_f: 63.1,
          condition: {
            text: "Partly cloudy",
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
          },
          daily_chance_of_rain: 10,
          daily_chance_of_snow: 0
        },
        astro: {
          sunrise: "07:15 AM",
          sunset: "06:35 PM"
        },
        hour: [
          {
            time: "2023-10-15 00:00",
            temp_c: 15.3,
            temp_f: 59.5,
            condition: {
              text: "Clear",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png"
            },
            chance_of_rain: 0
          },
          {
            time: "2023-10-15 06:00",
            temp_c: 14.2,
            temp_f: 57.6,
            condition: {
              text: "Clear",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png"
            },
            chance_of_rain: 0
          },
          {
            time: "2023-10-15 12:00",
            temp_c: 19.8,
            temp_f: 67.6,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
            },
            chance_of_rain: 0
          },
          {
            time: "2023-10-15 18:00",
            temp_c: 17.5,
            temp_f: 63.5,
            condition: {
              text: "Partly cloudy",
              icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
            },
            chance_of_rain: 10
          }
        ]
      },
      {
        date: "2023-10-16",
        day: {
          maxtemp_c: 21.2,
          maxtemp_f: 70.2,
          mintemp_c: 15.0,
          mintemp_f: 59.0,
          avgtemp_c: 18.1,
          avgtemp_f: 64.6,
          condition: {
            text: "Sunny",
            icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
          },
          daily_chance_of_rain: 0,
          daily_chance_of_snow: 0
        },
        astro: {
          sunrise: "07:16 AM",
          sunset: "06:33 PM"
        },
        hour: []
      },
      {
        date: "2023-10-17",
        day: {
          maxtemp_c: 22.0,
          maxtemp_f: 71.6,
          mintemp_c: 15.5,
          mintemp_f: 59.9,
          avgtemp_c: 18.8,
          avgtemp_f: 65.8,
          condition: {
            text: "Sunny",
            icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
          },
          daily_chance_of_rain: 0,
          daily_chance_of_snow: 0
        },
        astro: {
          sunrise: "07:17 AM",
          sunset: "06:32 PM"
        },
        hour: []
      }
    ]
  }
};

interface WeatherProps {
  apiKey?: string; // Optional API key for real weather data
}

const Weather: React.FC<WeatherProps> = ({ apiKey }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [useMockData, setUseMockData] = useState(true); // Set to false when using real API

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
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
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    if (location) {
      if (useMockData) {
        // Use mock data for demonstration
        setWeatherData(mockWeatherData);
      } else {
        fetchWeatherData();
      }
    }
  }, [location, useMockData]);

  // Fetch weather data from WeatherAPI.com
  const fetchWeatherData = async () => {
    if (!location || !apiKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location.lat},${location.lng}&days=3&aqi=yes&alerts=yes`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again later.');
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
    
    try {
      // For demonstration, we'll just set mock data
      setWeatherData(mockWeatherData);
      setLoading(false);
      
      // In a real implementation, you would geocode the address and fetch real weather data
      // const geocodeResponse = await fetch(...);
      // const geocodeData = await geocodeResponse.json();
      // setLocation({ lat: geocodeData.results[0].geometry.location.lat, lng: geocodeData.results[0].geometry.location.lng });
    } catch (err) {
      console.error('Error searching address:', err);
      setError('Failed to find location. Please check your address and try again.');
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Local Weather</h2>
      <p className="text-lg mb-6">
        Check the current weather and forecast for your area.
      </p>
      
      <form onSubmit={handleAddressSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address for weather data"
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
          >
            {loading ? 'Searching...' : 'Check Weather'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </form>
      
      {loading && <LoadingSpinner />}
      
      {weatherData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Current Weather */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{weatherData.location.name}</h3>
                <p className="text-blue-100">{weatherData.location.region}, {weatherData.location.country}</p>
                <p className="text-blue-100">{new Date(weatherData.location.localtime).toLocaleString()}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <img 
                  src={`https:${weatherData.current.condition.icon}`} 
                  alt={weatherData.current.condition.text}
                  className="w-16 h-16"
                />
                <div className="ml-4">
                  <p className="text-4xl font-bold">{Math.round(weatherData.current.temp_f)}°F</p>
                  <p className="text-blue-100">{weatherData.current.condition.text}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <p className="text-blue-100">Feels Like</p>
                <p className="text-xl font-semibold">{Math.round(weatherData.current.feelslike_f)}°F</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100">Humidity</p>
                <p className="text-xl font-semibold">{weatherData.current.humidity}%</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100">Wind</p>
                <p className="text-xl font-semibold">{weatherData.current.wind_mph} mph</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100">Precipitation</p>
                <p className="text-xl font-semibold">{weatherData.current.precip_in}" in</p>
              </div>
            </div>
          </div>
          
          {/* Forecast */}
          {weatherData.forecast && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">3-Day Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weatherData.forecast.forecastday.map((day, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-lg mb-2">{formatDate(day.date)}</h4>
                    <div className="flex items-center mb-3">
                      <img 
                        src={`https:${day.day.condition.icon}`} 
                        alt={day.day.condition.text}
                        className="w-12 h-12"
                      />
                      <div className="ml-2">
                        <p className="text-gray-700">{day.day.condition.text}</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">High</p>
                        <p className="font-semibold">{Math.round(day.day.maxtemp_f)}°F</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Low</p>
                        <p className="font-semibold">{Math.round(day.day.mintemp_f)}°F</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Rain</p>
                        <p className="font-semibold">{day.day.daily_chance_of_rain}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Weather;
