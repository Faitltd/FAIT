import React, { useState, useEffect, useRef } from 'react';
import { ServicePackage } from '../../pages/services/EnhancedServiceSearchPage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

interface ServiceSearchMapProps {
  services: ServicePackage[];
  userZipCode: string;
  onSelectService: (serviceId: string) => void;
}

interface Location {
  id: string;
  name: string;
  category: string;
  serviceAgentName: string;
  price: number;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const ServiceSearchMap: React.FC<ServiceSearchMapProps> = ({
  services,
  userZipCode,
  onSelectService
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [serviceLocations, setServiceLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }
    
    const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsApiKey) {
      setError('Google Maps API key is missing. Please check your environment variables.');
      setLoading(false);
      return;
    }
    
    // Define the callback function
    window.initMap = () => {
      setMapLoaded(true);
    };
    
    // Load the Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError('Failed to load Google Maps. Please try again later.');
      setLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      window.initMap = () => {};
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  
  // Get locations from zip codes
  useEffect(() => {
    if (!mapLoaded || !services.length) {
      if (!loading && !services.length) {
        setLoading(false);
      }
      return;
    }
    
    const getLocations = async () => {
      try {
        setLoading(true);
        
        const geocoder = new window.google.maps.Geocoder();
        
        // Get user location from zip code
        if (userZipCode) {
          try {
            const result = await new Promise<any>((resolve, reject) => {
              geocoder.geocode({ address: userZipCode }, (results: any, status: any) => {
                if (status === 'OK') {
                  resolve(results[0]);
                } else {
                  reject(new Error(`Geocoding failed: ${status}`));
                }
              });
            });
            
            const location = {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            };
            
            setUserLocation(location);
          } catch (err) {
            console.error('Error geocoding user zip code:', err);
          }
        }
        
        // Get service locations from zip codes
        const locations = await Promise.all(
          services.map(async (service) => {
            if (!service.service_agent.zip_code) return null;
            
            try {
              const result = await new Promise<any>((resolve, reject) => {
                geocoder.geocode({ address: service.service_agent.zip_code }, (results: any, status: any) => {
                  if (status === 'OK') {
                    resolve(results[0]);
                  } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                  }
                });
              });
              
              return {
                id: service.id,
                name: service.title,
                category: service.category,
                serviceAgentName: service.service_agent.full_name,
                price: service.price,
                rating: service.avg_rating,
                reviewCount: service.review_count,
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              };
            } catch (err) {
              console.error(`Error geocoding service zip code (${service.service_agent.zip_code}):`, err);
              return null;
            }
          })
        );
        
        // Filter out null values (failed geocoding)
        setServiceLocations(locations.filter(Boolean) as Location[]);
        setError(null);
      } catch (err) {
        console.error('Error getting locations:', err);
        setError('Failed to load map locations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    getLocations();
  }, [mapLoaded, services, userZipCode]);
  
  // Initialize map
  useEffect(() => {
    if (!mapLoaded || loading || !mapRef.current) return;
    
    try {
      const google = window.google;
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Create map
      const map = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: userLocation || { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco if no user location
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      
      googleMapRef.current = map;
      
      // Add user marker if user location is available
      if (userLocation) {
        const userMarker = new google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
        
        const userInfoWindow = new google.maps.InfoWindow({
          content: '<div class="p-2"><strong>Your Location</strong></div>',
        });
        
        userMarker.addListener('click', () => {
          userInfoWindow.open(map, userMarker);
        });
      }
      
      // Add service markers
      serviceLocations.forEach((location) => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: location.name,
        });
        
        markersRef.current.push(marker);
        
        // Add info window for service marker
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3">
              <h3 class="font-medium text-blue-600">${location.name}</h3>
              <p class="text-sm text-gray-500">${location.category}</p>
              <p class="text-sm">Provider: ${location.serviceAgentName}</p>
              <p class="text-sm">Price: ${formatCurrency(location.price)}</p>
              <p class="text-sm">Rating: ${location.rating ? location.rating.toFixed(1) : 'N/A'} (${location.reviewCount} reviews)</p>
              <button 
                id="book-${location.id}" 
                class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Book Service
              </button>
            </div>
          `,
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        // Add event listener for the Book button
        google.maps.event.addListener(infoWindow, 'domready', () => {
          document.getElementById(`book-${location.id}`)?.addEventListener('click', () => {
            onSelectService(location.id);
          });
        });
      });
      
      // Fit bounds to include all markers
      if (serviceLocations.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        
        if (userLocation) {
          bounds.extend(userLocation);
        }
        
        serviceLocations.forEach((location) => {
          bounds.extend({ lat: location.lat, lng: location.lng });
        });
        
        map.fitBounds(bounds);
        
        // Don't zoom in too far
        const listener = google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 15) {
            map.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try again later.');
    }
  }, [mapLoaded, loading, userLocation, serviceLocations, onSelectService]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-700 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-[600px] w-full rounded-md overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default ServiceSearchMap;
