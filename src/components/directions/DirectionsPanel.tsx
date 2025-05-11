import React, { useState, useEffect } from 'react';
import { X, Navigation, Clock, ArrowRight } from 'lucide-react';
import TransportModeSelector from './TransportModeSelector';
import { 
  TransportMode, 
  getDirections, 
  formatDuration, 
  formatDistance 
} from '../../utils/directionsService';

interface DirectionsPanelProps {
  origin: string | google.maps.LatLng;
  destination: string | google.maps.LatLng;
  onClose: () => void;
  onDirectionsLoaded?: (result: google.maps.DirectionsResult) => void;
  className?: string;
}

/**
 * Panel for displaying directions information
 */
const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  origin,
  destination,
  onClose,
  onDirectionsLoaded,
  className = '',
}) => {
  const [transportMode, setTransportMode] = useState<TransportMode>('DRIVING');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch directions when origin, destination, or transport mode changes
  useEffect(() => {
    const fetchDirections = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getDirections({
          origin,
          destination,
          travelMode: transportMode,
        });

        setDirections(result);
        
        if (onDirectionsLoaded) {
          onDirectionsLoaded(result);
        }
      } catch (err) {
        console.error('Error fetching directions:', err);
        setError('Failed to get directions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDirections();
  }, [origin, destination, transportMode, onDirectionsLoaded]);

  // Get route information from directions result
  const getRouteInfo = () => {
    if (!directions || !directions.routes || directions.routes.length === 0) {
      return null;
    }

    const route = directions.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance?.text || '',
      duration: leg.duration?.text || '',
      startAddress: leg.start_address || '',
      endAddress: leg.end_address || '',
      steps: leg.steps || [],
    };
  };

  const routeInfo = getRouteInfo();

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg font-medium">Directions</h3>
        <button
          type="button"
          className="text-white hover:text-blue-100"
          onClick={onClose}
          aria-label="Close directions"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Transport mode selector */}
      <div className="px-4 py-2 border-b border-gray-200">
        <TransportModeSelector
          selectedMode={transportMode}
          onChange={setTransportMode}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-500">Getting directions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setTransportMode(transportMode)} // Re-trigger the fetch
            >
              Try Again
            </button>
          </div>
        ) : routeInfo ? (
          <div>
            {/* Route summary */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-gray-700">
                  <Navigation className="h-4 w-4 mr-1" />
                  <span>{routeInfo.distance}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{routeInfo.duration}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p className="mb-1 truncate">From: {routeInfo.startAddress}</p>
                <p className="truncate">To: {routeInfo.endAddress}</p>
              </div>
            </div>

            {/* Route steps */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {routeInfo.steps.map((step, index) => (
                <div key={index} className="flex">
                  <div className="mr-3 pt-1">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                      {index + 1}
                    </div>
                    {index < routeInfo.steps.length - 1 && (
                      <div className="h-full w-0.5 bg-blue-100 mx-auto mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: step.instructions }}></p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span className="mr-2">{step.distance?.text}</span>
                      <ArrowRight className="h-3 w-3 mx-1" />
                      <span>{step.duration?.text}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No directions available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectionsPanel;
