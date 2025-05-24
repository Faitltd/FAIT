import React from 'react';

interface MapSkeletonProps {
  className?: string;
  height?: string;
}

/**
 * Skeleton component for map loading
 */
const MapSkeleton: React.FC<MapSkeletonProps> = ({ 
  className = '', 
  height = 'h-[600px]' 
}) => {
  return (
    <div className={`relative ${height} w-full rounded-md overflow-hidden bg-gray-100 ${className}`}>
      {/* Map background */}
      <div className="absolute inset-0 bg-gray-200 animate-pulse">
        {/* Simulated map grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{ 
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Simulated markers */}
      <div className="absolute top-1/4 left-1/4 h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 left-1/2 h-4 w-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-2/3 left-1/3 h-4 w-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      <div className="absolute top-1/2 left-3/4 h-4 w-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>

      {/* Simulated controls */}
      <div className="absolute top-4 right-4 w-10 h-20 bg-white rounded shadow-md"></div>
      <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded shadow-md"></div>
    </div>
  );
};

export default MapSkeleton;
