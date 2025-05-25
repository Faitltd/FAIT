import React, { useState } from 'react';
import { PageLayout } from '../modules/core/components/layout/PageLayout';
import { MapDisplay } from '../modules/maps/components/map/MapDisplay';
import { LocationSearch } from '../modules/maps/components/search/LocationSearch';
import { GeocodingResult, MapMarker, MarkerType } from '../modules/maps/types/maps';
import { Button } from '../modules/core/components/ui/Button';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key

/**
 * MapsPage component for displaying and interacting with maps
 */
const MapsPage: React.FC = () => {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 }); // San Francisco
  const [zoom, setZoom] = useState(12);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const [savedLocations, setSavedLocations] = useState<{ name: string; location: GeocodingResult }[]>([]);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [locationName, setLocationName] = useState('');

  // Handle location selection
  const handleLocationSelect = (result: GeocodingResult) => {
    setSelectedLocation(result);
    setCenter(result.location);
    setZoom(15);
    
    // Add marker for selected location
    const newMarker: MapMarker = {
      id: `location-${Date.now()}`,
      position: result.location,
      title: result.formattedAddress || result.address,
      type: MarkerType.CUSTOM,
    };
    
    setMarkers([...markers, newMarker]);
  };

  // Handle marker click
  const handleMarkerClick = (marker: MapMarker) => {
    console.log('Marker clicked:', marker);
  };

  // Handle map click
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      
      // Add marker at clicked position
      const newMarker: MapMarker = {
        id: `map-click-${Date.now()}`,
        position,
        title: `Marker at ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        type: MarkerType.CUSTOM,
      };
      
      setMarkers([...markers, newMarker]);
    }
  };

  // Handle save location
  const handleSaveLocation = () => {
    if (selectedLocation && locationName) {
      setSavedLocations([
        ...savedLocations,
        {
          name: locationName,
          location: selectedLocation,
        },
      ]);
      
      setLocationName('');
      setSelectedLocation(null);
    }
  };

  // Handle load saved location
  const handleLoadSavedLocation = (location: GeocodingResult) => {
    setCenter(location.location);
    setZoom(15);
    setShowSavedLocations(false);
  };

  // Handle clear markers
  const handleClearMarkers = () => {
    setMarkers([]);
  };

  return (
    <PageLayout
      title="Maps"
      description="Explore locations and service areas"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Search Location</h2>
            
            <LocationSearch
              apiKey={GOOGLE_MAPS_API_KEY}
              onSelect={handleLocationSelect}
              placeholder="Enter an address or location"
              className="mb-4"
            />
            
            {selectedLocation && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Selected Location</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{selectedLocation.formattedAddress || selectedLocation.address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Lat: {selectedLocation.location.lat.toFixed(6)}, Lng: {selectedLocation.location.lng.toFixed(6)}
                  </p>
                  
                  <div className="mt-3">
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Enter a name for this location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    
                    <Button
                      onClick={handleSaveLocation}
                      disabled={!locationName}
                      className="w-full"
                    >
                      Save Location
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Saved Locations</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedLocations(!showSavedLocations)}
                >
                  {showSavedLocations ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showSavedLocations && (
                <div className="bg-gray-50 p-3 rounded-md">
                  {savedLocations.length === 0 ? (
                    <p className="text-gray-500">No saved locations yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {savedLocations.map((saved, index) => (
                        <li key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                          <p className="font-medium">{saved.name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {saved.location.formattedAddress || saved.location.address}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1"
                            onClick={() => handleLoadSavedLocation(saved.location)}
                          >
                            Load
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleClearMarkers}
                disabled={markers.length === 0}
                className="w-full"
              >
                Clear All Markers
              </Button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <MapDisplay
              apiKey={GOOGLE_MAPS_API_KEY}
              initialCenter={center}
              initialZoom={zoom}
              markers={markers}
              height="600px"
              width="100%"
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MapsPage;
