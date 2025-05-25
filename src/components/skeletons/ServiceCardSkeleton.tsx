import React from 'react';

interface ServiceCardSkeletonProps {
  count?: number;
}

/**
 * Skeleton component for service card loading
 */
const ServiceCardSkeleton: React.FC<ServiceCardSkeletonProps> = ({ count = 1 }) => {
  const renderSkeleton = () => (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 w-full bg-gray-200 relative">
        <div className="absolute top-2 right-2 bg-gray-300 h-6 w-20 rounded-md"></div>
      </div>

      <div className="p-4">
        {/* Title and category */}
        <div className="flex justify-between items-start">
          <div className="w-full">
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          </div>
        </div>

        {/* Description */}
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>

        {/* Location */}
        <div className="flex items-center mb-3">
          <div className="h-4 w-4 bg-gray-300 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Agent and rating */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gray-300 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>

          <div className="flex items-center">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-4">
          <div className="h-9 bg-gray-300 rounded-md w-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {count === 1 ? (
        renderSkeleton()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(count)].map((_, i) => (
            <div key={i}>{renderSkeleton()}</div>
          ))}
        </div>
      )}
    </>
  );
};

export default ServiceCardSkeleton;
