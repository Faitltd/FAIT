import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, DollarSign, Navigation } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ServicePackage } from '../../pages/services/EnhancedServiceSearchPage';

interface ServiceCardProps {
  service: ServicePackage;
  onGetDirections?: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onGetDirections }) => {
  // Helper function to render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <Link to={`/services/${service.id}/reviews`} className="ml-1 text-sm text-gray-600 hover:text-blue-600">
          {rating.toFixed(1)}
          <span className="ml-1 text-xs text-gray-500">
            ({service.review_count})
          </span>
        </Link>
      </div>
    );
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="h-48 w-full bg-gray-200 relative">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <DollarSign className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium">
          {formatCurrency(service.price)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
              {service.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2 line-clamp-1">
              {service.category}
              {service.subcategory && ` › ${service.subcategory}`}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {service.service_agent.zip_code || 'Location not specified'}
            {service.distance !== undefined && ` (${service.distance.toFixed(1)} miles)`}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={service.service_agent.avatar_url || '/default-avatar.png'}
              alt={service.service_agent.full_name}
              className="h-6 w-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-700 truncate max-w-[120px]">
              {service.service_agent.full_name}
            </span>
          </div>

          {renderStars(service.avg_rating)}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/book/${service.id}`}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Book Now
          </Link>

          {onGetDirections && (
            <button
              onClick={() => onGetDirections(service.id)}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              type="button"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
