import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { Database } from '../lib/database.types';

type ServiceArea = Database['public']['Tables']['service_agent_service_areas']['Row'];

interface ServiceAreaMapProps {
  areas: ServiceArea[];
  className?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ServiceAreaMap: React.FC<ServiceAreaMapProps> = ({ areas, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Check if API key is available
        if (!GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key is missing. Please check your environment variables.');
        }

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['geometry', 'places']
        });

        const google = await loader.load();
        const geocoder = new google.maps.Geocoder();

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { lat: 0, lng: 0 },
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const bounds = new google.maps.LatLngBounds();
        const circles: google.maps.Circle[] = [];

        // Create service area circles
        await Promise.all(areas.map(async (area) => {
          try {
            const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode({ address: area.zip_code }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                  resolve(results);
                } else {
                  console.error(`Geocoding failed for ZIP code ${area.zip_code}:`, status);
                  reject(new Error(`Geocoding failed for ZIP code ${area.zip_code}: ${status}`));
                }
              });
            });

            const location = result[0].geometry.location;
            bounds.extend(location);

            // Create circle for service area
            const circle = new google.maps.Circle({
              map,
              center: location,
              radius: area.radius_miles * 1609.34, // Convert miles to meters
              fillColor: '#3B82F6',
              fillOpacity: 0.2,
              strokeColor: '#2563EB',
              strokeOpacity: 0.8,
              strokeWeight: 2
            });

            circles.push(circle);

            // Add marker at center
            new google.maps.Marker({
              position: location,
              map,
              title: `Service area: ${area.zip_code}`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
              }
            });
          } catch (error) {
            console.error(`Error processing ZIP code ${area.zip_code}:`, error);
          }
        }));

        // Fit map to bounds
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          const zoom = map.getZoom();
          if (zoom && zoom > 12) {
            map.setZoom(12);
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoading(false);
      }
    };

    if (areas.length > 0) {
      initMap();
    } else {
      setLoading(false);
    }
  }, [areas]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        <div className="font-medium mb-1">Error loading map:</div>
        <div>{error}</div>
        {!GOOGLE_MAPS_API_KEY && (
          <div className="mt-2 text-xs">
            Google Maps API key is missing. Please check your environment variables.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div
        ref={mapRef}
        className={`w-full h-full rounded-lg ${areas.length === 0 ? 'bg-gray-100' : ''}`}
      >
        {areas.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500">
            No service areas defined
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAreaMap;