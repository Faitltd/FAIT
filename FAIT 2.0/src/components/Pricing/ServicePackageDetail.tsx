import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Award, Trophy, Check, Shield } from 'lucide-react';
import PricingCalculator from './PricingCalculator';
import { PricingTier } from './TierSelector';

interface ServicePackageDetailProps {
  servicePackage: any;
  onBookService?: (tier: PricingTier, price: number) => void;
  showBookButton?: boolean;
}

const ServicePackageDetail: React.FC<ServicePackageDetailProps> = ({
  servicePackage,
  onBookService,
  showBookButton = true,
}) => {
  const [selectedTier, setSelectedTier] = useState<PricingTier>('good');
  const [calculatedPrice, setCalculatedPrice] = useState<number>(
    servicePackage.good_tier_price || servicePackage.base_price
  );

  const handlePriceCalculated = (price: number, tier: PricingTier) => {
    setCalculatedPrice(price);
    setSelectedTier(tier);
  };

  const handleBookService = () => {
    if (onBookService) {
      onBookService(selectedTier, calculatedPrice);
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A';
    
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{servicePackage.title}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              {servicePackage.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  {servicePackage.category.name}
                </span>
              )}
              
              {servicePackage.duration_minutes && (
                <span className="flex items-center mr-4">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(servicePackage.duration_minutes)}
                </span>
              )}
              
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {getLocationTypeLabel(servicePackage.location_type)}
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-500">Starting at</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(servicePackage.base_price)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Service Details */}
          <div className="md:col-span-2">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{servicePackage.description}</p>
            </div>
            
            {/* Service Provider Info */}
            {servicePackage.service_agent && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h2>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {servicePackage.service_agent.avatar_url ? (
                      <img
                        src={servicePackage.service_agent.avatar_url}
                        alt={servicePackage.service_agent.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg font-medium">
                          {servicePackage.service_agent.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {servicePackage.service_agent.full_name}
                    </h3>
                    <Link
                      to={`/profile/${servicePackage.service_agent.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Features */}
            {servicePackage.features && servicePackage.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Good Tier Features */}
                  <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
                    <div className="flex items-center mb-3">
                      <Star className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-blue-800">Good Tier Features</h3>
                    </div>
                    <ul className="space-y-2">
                      {servicePackage.features
                        .filter((f: any) => f.is_included && (f.tier === 'all' || f.tier === 'good'))
                        .map((feature: any) => (
                          <li key={feature.id} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="ml-2 text-gray-700">{feature.name}</span>
                          </li>
                        ))}
                      {servicePackage.warranty_periods?.find((w: any) => w.tier === 'good') && (
                        <li className="flex items-start">
                          <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="ml-2 text-gray-700">
                            {servicePackage.warranty_periods.find((w: any) => w.tier === 'good').duration_days} day warranty
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Better Tier Features */}
                  <div className="border border-purple-200 rounded-md p-4 bg-purple-50">
                    <div className="flex items-center mb-3">
                      <Award className="h-5 w-5 text-purple-600 mr-2" />
                      <h3 className="font-medium text-purple-800">Better Tier Features</h3>
                    </div>
                    <ul className="space-y-2">
                      {servicePackage.features
                        .filter((f: any) => f.is_included && f.tier === 'better')
                        .map((feature: any) => (
                          <li key={feature.id} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="ml-2 text-gray-700">{feature.name}</span>
                          </li>
                        ))}
                      {servicePackage.warranty_periods?.find((w: any) => w.tier === 'better') && (
                        <li className="flex items-start">
                          <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="ml-2 text-gray-700">
                            {servicePackage.warranty_periods.find((w: any) => w.tier === 'better').duration_days} day warranty
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Best Tier Features */}
                  <div className="border border-amber-200 rounded-md p-4 bg-amber-50 md:col-span-2">
                    <div className="flex items-center mb-3">
                      <Trophy className="h-5 w-5 text-amber-600 mr-2" />
                      <h3 className="font-medium text-amber-800">Best Tier Features</h3>
                    </div>
                    <ul className="space-y-2">
                      {servicePackage.features
                        .filter((f: any) => f.is_included && f.tier === 'best')
                        .map((feature: any) => (
                          <li key={feature.id} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="ml-2 text-gray-700">{feature.name}</span>
                          </li>
                        ))}
                      {servicePackage.warranty_periods?.find((w: any) => w.tier === 'best') && (
                        <li className="flex items-start">
                          <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="ml-2 text-gray-700">
                            {servicePackage.warranty_periods.find((w: any) => w.tier === 'best').duration_days} day warranty
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Pricing Calculator */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Calculator</h2>
              
              <PricingCalculator
                packageId={servicePackage.id}
                basePrice={servicePackage.base_price}
                goodPrice={servicePackage.good_tier_price}
                betterPrice={servicePackage.better_tier_price}
                bestPrice={servicePackage.best_tier_price}
                goodDescription={servicePackage.good_tier_description}
                betterDescription={servicePackage.better_tier_description}
                bestDescription={servicePackage.best_tier_description}
                features={servicePackage.features}
                warrantyPeriods={servicePackage.warranty_periods}
                initialTier="good"
                onPriceCalculated={handlePriceCalculated}
              />
              
              {showBookButton && (
                <div className="mt-6">
                  <button
                    onClick={handleBookService}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Book This Service
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePackageDetail;
