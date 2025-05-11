import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star } from 'lucide-react';

interface ServicePackageCardProps {
  servicePackage: any;
  className?: string;
}

const ServicePackageCard: React.FC<ServicePackageCardProps> = ({
  servicePackage,
  className = '',
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return null;
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      }
    }
  };

  const getLocationTypeLabel = (locationType: string) => {
    switch (locationType) {
      case 'on_site':
        return 'On Site';
      case 'remote':
        return 'Remote';
      case 'both':
        return 'On Site or Remote';
      default:
        return locationType;
    }
  };

  // Get primary image or placeholder
  const primaryImage = servicePackage.images?.find((img: any) => img.is_primary)?.image_url || 
                      servicePackage.images?.[0]?.image_url;

  // Get feature count by tier
  const goodFeatures = servicePackage.features?.filter(
    (f: any) => f.is_included && (f.tier === 'all' || f.tier === 'good')
  ).length || 0;
  
  const betterFeatures = servicePackage.features?.filter(
    (f: any) => f.is_included && (f.tier === 'all' || f.tier === 'good' || f.tier === 'better')
  ).length || 0;
  
  const bestFeatures = servicePackage.features?.filter(
    (f: any) => f.is_included && (f.tier === 'all' || f.tier === 'good' || f.tier === 'better' || f.tier === 'best')
  ).length || 0;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <Link to={`/services/${servicePackage.id}`}>
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={servicePackage.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          
          {servicePackage.is_featured && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
          
          {servicePackage.category && (
            <div className="absolute bottom-2 left-2 bg-blue-600 bg-opacity-80 text-white text-xs font-medium px-2 py-1 rounded">
              {servicePackage.category.name}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {servicePackage.title}
            </h3>
            <div className="text-lg font-bold text-blue-600 whitespace-nowrap ml-2">
              {formatPrice(servicePackage.base_price)}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            {servicePackage.duration_minutes && (
              <span className="flex items-center mr-3">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(servicePackage.duration_minutes)}
              </span>
            )}
            
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {getLocationTypeLabel(servicePackage.location_type)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {servicePackage.description}
          </p>
          
          {/* Service Provider */}
          {servicePackage.service_agent && (
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                {servicePackage.service_agent.avatar_url ? (
                  <img
                    src={servicePackage.service_agent.avatar_url}
                    alt={servicePackage.service_agent.full_name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">
                      {servicePackage.service_agent.full_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-2 text-sm text-gray-700 truncate">
                {servicePackage.service_agent.full_name}
              </div>
            </div>
          )}
          
          {/* Tier Indicators */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-gray-600">
                Good: {goodFeatures} features
              </span>
            </div>
            
            <div className="flex items-center">
              <Star className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-gray-600">
                Better: {betterFeatures} features
              </span>
            </div>
            
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-gray-600">
                Best: {bestFeatures} features
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServicePackageCard;
