import React, { useState, useEffect, useRef } from 'react';
import { getGeocode, getLatLng } from '../../api/geocodingApi';

const ServiceSearchMap = ({ services, userZipCode, onSelectService }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [serviceLocations, setServiceLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  
  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }
      
      const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!googleMapsApiKey) {
        setError('Google Maps API key is missing. Please check your environment variables.');
        setLoading(false);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load Google Maps API. Please try again later.');
        setLoading(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    };
    
    loadGoogleMapsAPI();
  }, []);
  
  // Get geocoded locations
  useEffect(() => {
    const getLocations = async () => {
      if (!mapLoaded || !services || services.length === 0) return;
      
      try {
        setLoading(true);
        
        // Get user location from zip code
        if (userZipCode) {
          try {
            const userGeocode = await getGeocode(userZipCode);
            const userLatLng = await getLatLng(userGeocode[0]);
            setUserLocation(userLatLng);
          } catch (err) {
            console.error('Error geocoding user zip code:', err);
            // Continue even if user location can't be determined
          }
        }
        
        // Get service locations
        const locations = await Promise.all(
          services.map(async (service) => {
            try {
              if (!service.zip_code) return null;
              
              const geocode = await getGeocode(service.zip_code);
              const latLng = await getLatLng(geocode[0]);
              
              return {
                id: service.id,
                name: service.name,
                position: latLng,
                price: service.price,
                rating: service.average_rating,
                serviceAgentName: service.service_agent_name,
                category: service.category
              };
            } catch (err) {
              console.error(`Error geocoding service ${service.id}:`, err);
              return null;
            }
          })
        );
        
        // Filter out null values (failed geocoding)
        setServiceLocations(locations.filter(Boolean));
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
    if (!mapLoaded || loading) return;
    
    try {
      const google = window.google;
      
      // Create map
      const map = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: userLocation || { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco if no user location
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      
      googleMapRef.current = map;
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Add user marker if available
      if (userLocation) {
        const userMarker = new google.maps.Marker({
          position: userLocation,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          title: 'Your Location',
          zIndex: 1000,
        });
        
        markersRef.current.push(userMarker);
        
        // Add info window for user marker
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
          position: location.position,
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
              <p class="text-sm">Price: $${location.price.toFixed(2)}</p>
              <p class="text-sm">Rating: ${location.rating ? location.rating.toFixed(1) : 'N/A'}</p>
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
        
        // Add event listener for book button
        google.maps.event.addListener(infoWindow, 'domready', () => {
          document.getElementById(`book-${location.id}`).addEventListener('click', () => {
            onSelectService(location.id);
          });
        });
      });
      
      // Fit bounds to include all markers
      if (markersRef.current.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markersRef.current.forEach(marker => {
          bounds.extend(marker.getPosition());
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
  
  if (error) {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg shadow-md"
        style={{ position: 'relative' }}
      ></div>
      <div className="mt-2 text-sm text-gray-500">
        {serviceLocations.length} service{serviceLocations.length !== 1 ? 's' : ''} shown on map
      </div>
    </div>
  );
};

export default ServiceSearchMap;
