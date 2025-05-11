import React, { useState, useEffect } from 'react';
import { calculatePackagePrice } from '../../lib/api/pricingApi';
import TierSelector, { PricingTier } from './TierSelector';

interface PricingCalculatorProps {
  packageId: string;
  basePrice: number;
  goodPrice?: number | null;
  betterPrice?: number | null;
  bestPrice?: number | null;
  goodDescription?: string | null;
  betterDescription?: string | null;
  bestDescription?: string | null;
  features?: {
    id: string;
    name: string;
    tier: 'all' | 'good' | 'better' | 'best';
    is_included: boolean;
  }[];
  warrantyPeriods?: {
    tier: PricingTier;
    duration_days: number;
    description?: string | null;
  }[];
  initialTier?: PricingTier;
  onPriceCalculated?: (price: number, tier: PricingTier) => void;
  additionalOptions?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    selected?: boolean;
  }[];
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  packageId,
  basePrice,
  goodPrice,
  betterPrice,
  bestPrice,
  goodDescription,
  betterDescription,
  bestDescription,
  features = [],
  warrantyPeriods = [],
  initialTier = 'good',
  onPriceCalculated,
  additionalOptions = [],
}) => {
  const [selectedTier, setSelectedTier] = useState<PricingTier>(initialTier);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [basePackagePrice, setBasePackagePrice] = useState<number>(0);
  const [additionalOptionsPrice, setAdditionalOptionsPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate base package price when tier changes
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        
        // Use the API to calculate price or use local calculation
        let price;
        try {
          price = await calculatePackagePrice(packageId, selectedTier);
        } catch (error) {
          // Fallback to local calculation if API fails
          console.error('API price calculation failed, using local calculation:', error);
          
          switch (selectedTier) {
            case 'good':
              price = goodPrice || basePrice;
              break;
            case 'better':
              price = betterPrice || (goodPrice ? goodPrice * 1.5 : basePrice * 1.5);
              break;
            case 'best':
              price = bestPrice || (betterPrice ? betterPrice * 1.3 : (goodPrice ? goodPrice * 2 : basePrice * 2));
              break;
            default:
              price = basePrice;
          }
        }
        
        setBasePackagePrice(price);
      } catch (error) {
        console.error('Error calculating price:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrice();
  }, [packageId, selectedTier, basePrice, goodPrice, betterPrice, bestPrice]);

  // Calculate additional options price when selections change
  useEffect(() => {
    const optionsPrice = additionalOptions
      .filter(option => selectedOptions.includes(option.id))
      .reduce((sum, option) => sum + option.price, 0);
      
    setAdditionalOptionsPrice(optionsPrice);
  }, [selectedOptions, additionalOptions]);

  // Calculate total price when component values change
  useEffect(() => {
    const total = basePackagePrice + additionalOptionsPrice;
    setTotalPrice(total);
    
    if (onPriceCalculated) {
      onPriceCalculated(total, selectedTier);
    }
  }, [basePackagePrice, additionalOptionsPrice, selectedTier, onPriceCalculated]);

  // Handle tier selection
  const handleTierSelect = (tier: PricingTier) => {
    setSelectedTier(tier);
  };

  // Handle additional option toggle
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Tier selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Service Tier</h3>
        <TierSelector
          basePrice={basePrice}
          goodPrice={goodPrice}
          betterPrice={betterPrice}
          bestPrice={bestPrice}
          goodDescription={goodDescription}
          betterDescription={betterDescription}
          bestDescription={bestDescription}
          features={features}
          selectedTier={selectedTier}
          onSelectTier={handleTierSelect}
          warrantyPeriods={warrantyPeriods}
        />
      </div>
      
      {/* Additional options */}
      {additionalOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {additionalOptions.map((option) => (
                <li key={option.id} className="p-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`option-${option.id}`}
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={`option-${option.id}`} className="font-medium text-gray-700">
                        {option.name} ({formatPrice(option.price)})
                      </label>
                      {option.description && (
                        <p className="text-gray-500">{option.description}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Price summary */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Package ({selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Tier)</span>
              <span className="font-medium">{formatPrice(basePackagePrice)}</span>
            </div>
            
            {additionalOptionsPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Additional Options</span>
                <span className="font-medium">{formatPrice(additionalOptionsPrice)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingCalculator;
