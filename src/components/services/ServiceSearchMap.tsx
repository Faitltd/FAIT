import React, { useState, useEffect, useRef } from 'react';
import { ServicePackage } from '../../pages/services/EnhancedServiceSearchPage';
import LoadingSpinner from '../../components/LoadingSpinner';
import MapSkeleton from '../../components/skeletons/MapSkeleton';
import { formatCurrency } from '../../utils/formatters';
import {
  loadGoogleMapsApi,
  isGoogleMapsLoaded,
  isGoogleMapsFallbackMode,
  geocodeAddress,
  getGoogleMapsPerformanceMetrics,
  processMarkerClustering
} from '../../utils/googleMapsLoader';
import { saveUserLocation } from '../../utils/locationStorage';
import {
  getDirections,
  renderDirections,
  clearDirections,
  TransportMode
} from '../../utils/directionsService';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import LazyMapContainer from '../../components/LazyMapContainer';
import DirectionsPanel from '../../components/directions/DirectionsPanel';

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
  const [showDirections, setShowDirections] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('DRIVING');
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);

  // Load Google Maps API
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    let timeoutId: number | null = null;

    const loadMapsApi = () => {
      // Check if already loaded
      if (isGoogleMapsLoaded()) {
        console.log('Google Maps already loaded in ServiceSearchMap');
        setMapLoaded(true);
        return;
      }

      console.log(`Attempting to load Google Maps API in ServiceSearchMap... (Attempt ${retryCount + 1}/${maxRetries + 1})`);

      // Set a timeout to detect if loading takes too long
      timeoutId = window.setTimeout(() => {
        console.warn('Google Maps loading is taking longer than expected');
      }, 3000);

      // Load Google Maps API with places library
      loadGoogleMapsApi(['places'])
        .then(() => {
          if (timeoutId) clearTimeout(timeoutId);
          console.log('Google Maps API loaded successfully in ServiceSearchMap');
          setMapLoaded(true);
        })
        .catch((err) => {
          if (timeoutId) clearTimeout(timeoutId);
          console.error('Failed to load Google Maps API', err);

          // Retry logic
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying Google Maps API load (${retryCount}/${maxRetries})...`);

            // Exponential backoff: 1s, 2s, 4s
            const backoffDelay = Math.pow(2, retryCount - 1) * 1000;
            setTimeout(loadMapsApi, backoffDelay);
          } else {
            setError(`Failed to load Google Maps API after ${maxRetries + 1} attempts: ${err.message || 'Unknown error'}`);
            setLoading(false);
          }
        });
    };

    // Start the loading process
    loadMapsApi();

    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Get locations from zip codes
  useEffect(() => {
    if (!mapLoaded) {
      return;
    }

    // Always proceed with geocoding the user location, even if there are no services
    const getLocations = async () => {
      try {
        setLoading(true);

        // Start performance measurement
        const geocodeStartTime = performance.now();
        let geocodeSuccessCount = 0;
        let geocodeCacheHits = 0;

        // Get user location from zip code
        if (userZipCode) {
          try {
            // Use the cached geocoding function
            const location = await geocodeAddress(userZipCode);
            setUserLocation(location);
            geocodeSuccessCount++;

            // Save the user's location to localStorage if it's valid
            saveUserLocation(userZipCode, location);

            // Check if it was a cache hit by comparing timestamps
            const metrics = getGoogleMapsPerformanceMetrics();
            if (performance.now() - geocodeStartTime < 10) { // If it took less than 10ms, it was likely a cache hit
              geocodeCacheHits++;
            }
          } catch (err) {
            console.error('Error geocoding user zip code:', err);
            // If we can't geocode the user zip code, use a default location
            setUserLocation({ lat: 39.7392, lng: -104.9903 }); // Denver, CO as default
          }
        } else {
          // If no user zip code is provided, use a default location
          setUserLocation({ lat: 39.7392, lng: -104.9903 }); // Denver, CO as default
        }

        // Only process service locations if there are services
        if (services.length > 0) {
          // Get service locations from zip codes using batch processing for better performance
          // Process in batches of 5 to avoid overwhelming the geocoding service
          const batchSize = 5;
          const locations: Location[] = [];

          // Create batches of services
          for (let i = 0; i < services.length; i += batchSize) {
            const batch = services.slice(i, i + batchSize);

            // Process each batch in parallel
            const batchResults = await Promise.all(
              batch.map(async (service) => {
                if (!service.service_agent.zip_code) return null;

                try {
                  // Use the cached geocoding function
                  const location = await geocodeAddress(service.service_agent.zip_code);
                  geocodeSuccessCount++;

                  // Check if it was a cache hit
                  if (performance.now() - geocodeStartTime < 10 * (geocodeSuccessCount)) { // Adjust threshold based on number of geocodes
                    geocodeCacheHits++;
                  }

                  return {
                    id: service.id,
                    name: service.title,
                    category: service.category,
                    serviceAgentName: service.service_agent.full_name,
                    price: service.price,
                    rating: service.avg_rating,
                    reviewCount: service.review_count,
                    lat: location.lat,
                    lng: location.lng
                  };
                } catch (err) {
                  console.error(`Error geocoding service zip code (${service.service_agent.zip_code}):`, err);
                  return null;
                }
              })
            );

            // Add batch results to locations
            locations.push(...batchResults.filter(Boolean) as Location[]);

            // Add a small delay between batches to avoid rate limiting
            if (i + batchSize < services.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          // Set the locations
          setServiceLocations(locations);

          // Log geocoding performance in development mode
          if (process.env.NODE_ENV === 'development') {
            const geocodeDuration = performance.now() - geocodeStartTime;
            console.log(`Geocoding performance: ${geocodeDuration.toFixed(2)}ms for ${geocodeSuccessCount} locations (${geocodeCacheHits} cache hits)`);
          }
        } else {
          // If there are no services, set an empty array
          setServiceLocations([]);
          console.log('No services to display on map');
        }

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
    if (!mapLoaded || loading || !mapRef.current) {
      console.log('Not initializing map yet:', { mapLoaded, loading, mapRefExists: !!mapRef.current });
      return;
    }

    // Check if Google Maps is actually available
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not available despite mapLoaded being true');
      setError('Google Maps API not available. Please refresh the page and try again.');
      return;
    }

    try {
      const google = window.google;
      console.log('Initializing map with Google Maps API');

      // Clear existing markers
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        });
      }
      markersRef.current = [];

      // Force clear any existing content in the map container
      if (mapRef.current) {
        while (mapRef.current.firstChild) {
          mapRef.current.removeChild(mapRef.current.firstChild);
        }
      }

      // Create map with a slight delay to ensure DOM is ready
      setTimeout(() => {
        if (!mapRef.current) {
          console.error('Map container reference lost during timeout');
          setError('Map container reference lost. Please refresh the page.');
          return;
        }

        try {
          // Create map
          const map = new google.maps.Map(mapRef.current, {
            zoom: 10,
            center: userLocation || { lat: 39.7392, lng: -104.9903 }, // Default to Denver if no user location
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });

          googleMapRef.current = map;
          console.log('Map initialized successfully');

          // Force a resize event to ensure the map renders correctly
          setTimeout(() => {
            if (map && google) {
              google.maps.event.trigger(map, 'resize');
            }
          }, 100);
        } catch (err) {
          console.error('Error creating map instance:', err);
          setError('Error creating map instance. Please try again.');
        }
      }, 100);

      // Add user marker and other elements after map is initialized
      setTimeout(() => {
        if (!googleMapRef.current || !window.google || !window.google.maps) {
          console.error('Map or Google Maps API not available for adding markers');
          return;
        }

        const map = googleMapRef.current;
        const google = window.google;

        // Add user marker if user location is available
        if (userLocation) {
          try {
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

            // If no services, add a "No services found" info window
            if (serviceLocations.length === 0) {
              const noServicesInfoWindow = new google.maps.InfoWindow({
                position: userLocation,
                content: `
                  <div class="p-3">
                    <h3 class="font-medium text-blue-600">No Services Found</h3>
                    <p class="text-sm text-gray-500">No service providers were found in this area.</p>
                    <p class="text-sm">Try zooming out to see services in nearby areas, or try a different location.</p>
                  </div>
                `,
              });

              // Open the info window automatically
              noServicesInfoWindow.open(map);

              // Add a search area circle
              const searchCircle = new google.maps.Circle({
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                map,
                center: userLocation,
                radius: 8000, // 8km ~ 5 miles
              });
            }
          } catch (err) {
            console.error('Error adding user marker:', err);
            // Continue with the rest of the map initialization
          }
        }
      }, 200);

      // Add service markers after map is initialized
      setTimeout(() => {
        if (!googleMapRef.current || !window.google || !window.google.maps) {
          console.error('Map or Google Maps API not available for adding service markers');
          return;
        }

        const map = googleMapRef.current;
        const google = window.google;

        // Add service markers
        if (serviceLocations && serviceLocations.length > 0) {
          console.log(`Adding ${serviceLocations.length} service markers to map`);

          // Clear existing markers and clusterer
          if (markerClustererRef.current) {
            markerClustererRef.current.clearMarkers();
            markerClustererRef.current = null;
          }

          if (markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
              if (marker && marker.setMap) {
                marker.setMap(null);
              }
            });
            markersRef.current = [];
          }

          // Create markers for clustering
          const markers = serviceLocations.map((location) => {
            try {
              // Create marker without setting the map yet (will be handled by clusterer)
              const marker = new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                title: location.name,
                // Don't set map here - the clusterer will handle this
                animation: google.maps.Animation.DROP
              });

              // Add info window for service marker
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-3">
                    <h3 class="font-medium text-blue-600">${location.name}</h3>
                    <p class="text-sm text-gray-500">${location.category}</p>
                    <p class="text-sm">Provider: ${location.serviceAgentName}</p>
                    <p class="text-sm">Price: ${formatCurrency(location.price)}</p>
                    <p class="text-sm">Rating: ${location.rating ? location.rating.toFixed(1) : 'N/A'} (${location.reviewCount} reviews)</p>
                    <div class="flex space-x-2 mt-2">
                      <button
                        id="book-${location.id}"
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Book Service
                      </button>
                      <button
                        id="directions-${location.id}"
                        class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                        </svg>
                        Directions
                      </button>
                    </div>
                  </div>
                `,
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });

              // Add event listeners for the Book and Directions buttons
              google.maps.event.addListener(infoWindow, 'domready', () => {
                // Book button event listener
                document.getElementById(`book-${location.id}`)?.addEventListener('click', () => {
                  onSelectService(location.id);
                });

                // Directions button event listener
                document.getElementById(`directions-${location.id}`)?.addEventListener('click', () => {
                  setSelectedServiceId(location.id);
                  setShowDirections(true);

                  // If we have a directions renderer, clear it
                  if (directionsRenderer) {
                    clearDirections(directionsRenderer);
                  }

                  // Get directions if user location is available
                  if (userLocation) {
                    getDirections({
                      origin: userLocation,
                      destination: { lat: location.lat, lng: location.lng },
                      travelMode: transportMode
                    })
                    .then(result => {
                      // Render directions on the map
                      const renderer = renderDirections(map, result);
                      setDirectionsRenderer(renderer);
                    })
                    .catch(err => {
                      console.error('Error getting directions:', err);
                      setError('Failed to get directions. Please try again.');
                    });
                  }
                });
              });

              // Store marker for later reference
              markersRef.current.push(marker);

              return marker;
            } catch (err) {
              console.error('Error creating service marker:', err);
              return null;
            }
          }).filter(Boolean) as google.maps.Marker[];

          // Create marker clusterer
          if (markers.length > 0) {
            try {
              // Try to use web worker for clustering first
              const currentZoom = map.getZoom();

              // Use the web worker to process clustering
              processMarkersWithWorker(serviceLocations, map, currentZoom)
                .then(({ clusters, markers: singleMarkers }) => {
                  console.log(`Web worker clustering successful: ${clusters.length} clusters, ${singleMarkers.length} single markers`);

                  // Clear existing markers if any
                  if (markersRef.current.length > 0) {
                    markersRef.current.forEach(marker => {
                      if (marker && marker.setMap) {
                        marker.setMap(null);
                      }
                    });
                    markersRef.current = [];
                  }

                  // Create cluster markers
                  clusters.forEach(cluster => {
                    try {
                      // Different sizes and colors based on count
                      const count = cluster.count;
                      const size = count < 10 ? 40 : count < 50 ? 50 : 60;
                      const color = count < 10 ? '#4285F4' : count < 50 ? '#137333' : '#F29900';

                      const clusterMarker = new google.maps.Marker({
                        position: cluster.position,
                        map,
                        label: {
                          text: String(count),
                          color: "white",
                          fontSize: '12px',
                          fontWeight: 'bold'
                        },
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          fillColor: color,
                          fillOpacity: 0.8,
                          strokeColor: "#FFFFFF",
                          strokeWeight: 2,
                          scale: size / 10
                        },
                        zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                      });

                      // Add click listener to zoom in or expand cluster
                      clusterMarker.addListener('click', () => {
                        // If zoom is at max, show info window with list of services
                        if (map.getZoom() >= 15) {
                          // Create content for info window with list of services
                          const content = `
                            <div class="p-3">
                              <h3 class="font-medium text-blue-600">Service Cluster</h3>
                              <p class="text-sm text-gray-500">${cluster.count} services in this area</p>
                              <div class="mt-2 max-h-40 overflow-y-auto">
                                ${cluster.markers.map(marker => `
                                  <div class="py-2 border-b border-gray-100">
                                    <p class="font-medium">${marker.data.name}</p>
                                    <p class="text-xs text-gray-500">${marker.data.category}</p>
                                    <p class="text-xs">Provider: ${marker.data.serviceAgentName}</p>
                                    <button
                                      id="cluster-book-${marker.data.id}"
                                      class="mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                    >
                                      Book
                                    </button>
                                  </div>
                                `).join('')}
                              </div>
                            </div>
                          `;

                          const infoWindow = new google.maps.InfoWindow({
                            content,
                            position: cluster.position
                          });

                          infoWindow.open(map);

                          // Add event listeners for the Book buttons
                          google.maps.event.addListener(infoWindow, 'domready', () => {
                            cluster.markers.forEach(marker => {
                              document.getElementById(`cluster-book-${marker.data.id}`)?.addEventListener('click', () => {
                                onSelectService(marker.data.id);
                                infoWindow.close();
                              });
                            });
                          });
                        } else {
                          // Zoom in to see individual markers
                          map.setZoom(map.getZoom() + 2);
                          map.setCenter(cluster.position);
                        }
                      });

                      // Store marker for later reference
                      markersRef.current.push(clusterMarker);
                    } catch (err) {
                      console.error('Error creating cluster marker:', err);
                    }
                  });

                  // Add single markers to the map
                  singleMarkers.forEach(markerData => {
                    // Find the corresponding marker in the original markers array
                    const originalMarker = markers.find(m => {
                      const pos = m.getPosition();
                      return pos &&
                        pos.lat() === markerData.position.lat &&
                        pos.lng() === markerData.position.lng;
                    });

                    if (originalMarker) {
                      originalMarker.setMap(map);
                      markersRef.current.push(originalMarker);
                    }
                  });

                  console.log('Web worker clustering rendering complete');
                })
                .catch(err => {
                  console.error('Web worker clustering failed, falling back to traditional clustering:', err);

                  // Fall back to traditional clustering
                  createTraditionalClustering();
                });

              // Define the traditional clustering function for fallback
              const createTraditionalClustering = () => {
                // Create custom renderer for better styling
                const renderer = {
                  render: ({ count, position }: { count: number, position: google.maps.LatLng }) => {
                    // Different sizes and colors based on count
                    const size = count < 10 ? 40 : count < 50 ? 50 : 60;
                    const color = count < 10 ? '#4285F4' : count < 50 ? '#137333' : '#F29900';

                    return new google.maps.Marker({
                      position,
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: color,
                        fillOpacity: 0.8,
                        strokeWeight: 2,
                        strokeColor: '#FFFFFF',
                        scale: size / 10,
                      },
                      label: {
                        text: count.toString(),
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      },
                      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                    });
                  }
                };

                // Create the clusterer with custom options
                markerClustererRef.current = new MarkerClusterer({
                  map,
                  markers,
                  renderer,
                  algorithm: {
                    calculate: (markers, numStyles) => {
                      // Create clusters based on proximity
                      const clusters = [];
                      const remaining = [...markers];

                      // Simple clustering algorithm - can be optimized further
                      while (remaining.length > 0) {
                        const marker = remaining.pop();
                        if (!marker) continue;

                        const cluster = {
                          position: marker.getPosition() as google.maps.LatLng,
                          markers: [marker]
                        };

                        // Find nearby markers within 50 pixels
                        for (let i = remaining.length - 1; i >= 0; i--) {
                          const pos1 = marker.getPosition();
                          const pos2 = remaining[i].getPosition();

                          if (pos1 && pos2) {
                            const distance = google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2);
                            // Group markers within 500 meters
                            if (distance < 500) {
                              cluster.markers.push(remaining[i]);
                              remaining.splice(i, 1);
                            }
                          }
                        }

                        clusters.push(cluster);
                      }

                      return clusters;
                    }
                  },
                  onClusterClick: (cluster, map) => {
                    // Custom behavior when clicking a cluster
                    const markers = cluster.markers;

                    // If there are few markers, zoom to fit them
                    if (markers.length < 10) {
                      const bounds = new google.maps.LatLngBounds();
                      markers.forEach(marker => {
                        bounds.extend(marker.getPosition() as google.maps.LatLng);
                      });
                      map.fitBounds(bounds);
                    } else {
                      // For larger clusters, zoom in one level
                      map.setZoom(map.getZoom() + 1);
                      map.setCenter(cluster.position);
                    }
                  }
                });

                console.log('Traditional marker clusterer created successfully with', markers.length, 'markers');
              };
            } catch (err) {
              console.error('Error in clustering process:', err);

              // Fallback to adding markers directly to the map
              markers.forEach(marker => marker.setMap(map));
            }
          } else {
            console.log('No valid markers to cluster');
          }
        } else {
          console.log('No service locations to add to map');
        }
      }, 300);

      // Set appropriate zoom and bounds after map and markers are initialized
      setTimeout(() => {
        if (!googleMapRef.current || !window.google || !window.google.maps) {
          console.error('Map or Google Maps API not available for setting bounds');
          return;
        }

        const map = googleMapRef.current;
        const google = window.google;

        // Set appropriate zoom and bounds
        if (serviceLocations && serviceLocations.length > 0) {
          try {
            // If we have services, fit bounds to include all markers
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
          } catch (err) {
            console.error('Error setting map bounds:', err);
            // Fall back to centering on user location
            if (userLocation) {
              map.setCenter(userLocation);
              map.setZoom(12);
            }
          }
        } else if (userLocation) {
          // If we have no services but have a user location, center on user location with appropriate zoom
          map.setCenter(userLocation);
          map.setZoom(12); // City level zoom
        }

        // Add a message overlay for no services
        if (serviceLocations.length === 0 && mapRef.current) {
          try {
            const messageOverlay = document.createElement('div');
            messageOverlay.className = 'absolute top-4 left-0 right-0 mx-auto w-max bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-10 text-center';
            messageOverlay.innerHTML = `
              <div class="flex items-center">
                <svg class="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium">No services found in this area. Try zooming out to see more.</span>
              </div>
            `;

            // Add the message to the map container
            mapRef.current.appendChild(messageOverlay);

            // Remove the message after 10 seconds
            setTimeout(() => {
              if (messageOverlay.parentNode) {
                messageOverlay.parentNode.removeChild(messageOverlay);
              }
            }, 10000);
          } catch (err) {
            console.error('Error adding message overlay:', err);
            // Not critical, so continue
          }
        }

        console.log('Map bounds and zoom set successfully');
      }, 400);

      console.log('Map initialization process started successfully');
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try again later.');
    }
  }, [mapLoaded, loading, userLocation, serviceLocations, onSelectService]);

  // Handle getting directions for a specific service
  const handleGetDirections = (serviceId: string) => {
    // Find the service location
    const serviceLocation = serviceLocations.find(location => location.id === serviceId);

    if (!serviceLocation || !userLocation || !googleMapRef.current) {
      setError('Unable to get directions. Please try again.');
      return;
    }

    setSelectedServiceId(serviceId);
    setShowDirections(true);

    // If we have a directions renderer, clear it
    if (directionsRenderer) {
      clearDirections(directionsRenderer);
    }

    // Get directions
    getDirections({
      origin: userLocation,
      destination: { lat: serviceLocation.lat, lng: serviceLocation.lng },
      travelMode: transportMode
    })
    .then(result => {
      // Render directions on the map
      const renderer = renderDirections(googleMapRef.current, result);
      setDirectionsRenderer(renderer);
    })
    .catch(err => {
      console.error('Error getting directions:', err);
      setError('Failed to get directions. Please try again.');
    });
  };

  // Handle closing directions panel
  const handleCloseDirections = () => {
    setShowDirections(false);
    setSelectedServiceId(null);

    // Clear directions from map
    if (directionsRenderer) {
      clearDirections(directionsRenderer);
      setDirectionsRenderer(null);
    }
  };

  // Handle transport mode change
  const handleTransportModeChange = (mode: TransportMode) => {
    setTransportMode(mode);

    // If we have a selected service, update the directions
    if (selectedServiceId) {
      handleGetDirections(selectedServiceId);
    }
  };

  // Process marker clustering using web worker
  const processMarkersWithWorker = async (
    locations: Location[],
    map: google.maps.Map,
    currentZoom: number
  ) => {
    console.log('Processing markers with web worker');

    // Start performance measurement
    const startTime = performance.now();

    try {
      // Format marker data for the worker
      const markerData = locations.map(location => ({
        position: { lat: location.lat, lng: location.lng },
        id: location.id,
        data: location
      }));

      // Process clustering in web worker
      const result = await processMarkerClustering(markerData, {
        gridSize: 60,
        maxZoom: 15,
        currentZoom,
        minClusterSize: 2
      });

      // Log performance in dev mode
      if (process.env.NODE_ENV === 'development') {
        const duration = performance.now() - startTime;
        console.log(`Clustered ${markerData.length} markers in ${duration.toFixed(2)}ms (${result.clusters.length} clusters, ${result.markers.length} single markers)`);
      }

      return result;
    } catch (error) {
      console.error('Error processing markers with web worker:', error);
      throw error;
    }
  };

  if (loading) {
    return <MapSkeleton />;
  }

  // Use the LazyMapContainer component which handles lazy loading and fallback rendering
  return (
    <div className="relative">
      <LazyMapContainer
        className="h-[600px] w-full rounded-md overflow-hidden"
        fallbackMessage="Map service is currently unavailable. You can still search for services by entering your zip code."
        threshold={0.1}
        rootMargin="200px 0px"
        loadImmediately={true} // Load immediately for now, can be set to false for true lazy loading
        onMapLoad={() => {
          console.log('Map loaded via LazyMapContainer');
          setMapLoaded(true);
        }}
      >
        <div
          ref={mapRef}
          className="h-full w-full"
        >
          {error && (
            <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-10 text-center">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium text-red-700">{error}</span>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    loadGoogleMapsApi(['places'], true)
                      .then(() => {
                        setMapLoaded(true);
                      })
                      .catch((err) => {
                        setError(`Failed to load map: ${err.message || 'Unknown error'}`);
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                  className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </LazyMapContainer>

      {/* Directions Panel */}
      {showDirections && selectedServiceId && userLocation && (
        <div className="absolute top-4 right-4 w-80 z-20">
          <DirectionsPanel
            origin={userLocation}
            destination={serviceLocations.find(loc => loc.id === selectedServiceId) || userLocation}
            onClose={handleCloseDirections}
            onDirectionsLoaded={(result) => {
              if (googleMapRef.current && directionsRenderer) {
                clearDirections(directionsRenderer);
              }
              if (googleMapRef.current) {
                const renderer = renderDirections(googleMapRef.current, result);
                setDirectionsRenderer(renderer);
              }
            }}
          />
        </div>
      )}

      {/* Debug overlay - only shown in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-10 text-xs max-w-xs">
          <p><strong>Map Status:</strong> {mapLoaded ? 'API Loaded' : 'API Loading...'}</p>
          <p><strong>Fallback Mode:</strong> {isGoogleMapsFallbackMode() ? 'Yes' : 'No'}</p>
          <p><strong>User Zip:</strong> {userZipCode || 'None'}</p>
          <p><strong>Services:</strong> {services.length}</p>
          <p><strong>Locations:</strong> {serviceLocations.length}</p>
          <p><strong>Google Maps:</strong> {window.google && window.google.maps ? 'Available' : 'Not Available'}</p>
          {error && <p className="text-red-500 mt-2"><strong>Error:</strong> {error}</p>}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                setError(null);
                setMapLoaded(false);
                setLoading(true);

                console.log('Manual retry initiated');

                // Force reload Google Maps API
                loadGoogleMapsApi(['places'], true)
                  .then(() => {
                    console.log('Google Maps API loaded successfully on manual retry');
                    setMapLoaded(true);
                  })
                  .catch((err) => {
                    console.error('Failed to load Google Maps API on manual retry', err);
                    setError(err.message || 'Failed to load Google Maps API');
                  });
              }}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Retry Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSearchMap;
