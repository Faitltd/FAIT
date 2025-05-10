import React, { useState, useEffect } from 'react';
import { Check, Star, Award, Trophy } from 'lucide-react';

export type PricingTier = 'good' | 'better' | 'best';

interface TierOption {
  id: PricingTier;
  name: string;
  description: string;
  price: number;
  features: string[];
  icon: React.ReactNode;
  color: string;
}

interface TierSelectorProps {
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
  selectedTier?: PricingTier;
  onSelectTier: (tier: PricingTier) => void;
  warrantyPeriods?: {
    tier: PricingTier;
    duration_days: number;
    description?: string | null;
  }[];
}

const TierSelector: React.FC<TierSelectorProps> = ({
  basePrice,
  goodPrice,
  betterPrice,
  bestPrice,
  goodDescription,
  betterDescription,
  bestDescription,
  features = [],
  selectedTier = 'good',
  onSelectTier,
  warrantyPeriods = [],
}) => {
  const [tiers, setTiers] = useState<TierOption[]>([]);

  useEffect(() => {
    // Calculate prices if not provided
    const calculatedGoodPrice = goodPrice || basePrice;
    const calculatedBetterPrice = betterPrice || calculatedGoodPrice * 1.5;
    const calculatedBestPrice = bestPrice || calculatedBetterPrice * 1.3;

    // Get warranty information
    const goodWarranty = warrantyPeriods.find(w => w.tier === 'good');
    const betterWarranty = warrantyPeriods.find(w => w.tier === 'better');
    const bestWarranty = warrantyPeriods.find(w => w.tier === 'best');

    // Prepare features for each tier
    const goodFeatures = features
      .filter(f => f.is_included && (f.tier === 'all' || f.tier === 'good'))
      .map(f => f.name);

    const betterFeatures = features
      .filter(f => f.is_included && (f.tier === 'all' || f.tier === 'good' || f.tier === 'better'))
      .map(f => f.name);

    const bestFeatures = features
      .filter(f => f.is_included && (f.tier === 'all' || f.tier === 'good' || f.tier === 'better' || f.tier === 'best'))
      .map(f => f.name);

    // Add warranty features if available
    if (goodWarranty) {
      goodFeatures.push(`${goodWarranty.duration_days} day warranty`);
    }

    if (betterWarranty) {
      betterFeatures.push(`${betterWarranty.duration_days} day warranty`);
    }

    if (bestWarranty) {
      bestFeatures.push(`${bestWarranty.duration_days} day warranty`);
    }

    // Create tier options
    const tierOptions: TierOption[] = [
      {
        id: 'good',
        name: 'Good',
        description: goodDescription || 'Basic service package with essential features',
        price: calculatedGoodPrice,
        features: goodFeatures,
        icon: <Star className="h-6 w-6" />,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      {
        id: 'better',
        name: 'Better',
        description: betterDescription || 'Enhanced service package with additional features',
        price: calculatedBetterPrice,
        features: betterFeatures,
        icon: <Award className="h-6 w-6" />,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
      },
      {
        id: 'best',
        name: 'Best',
        description: bestDescription || 'Premium service package with all available features',
        price: calculatedBestPrice,
        features: bestFeatures,
        icon: <Trophy className="h-6 w-6" />,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
      },
    ];

    setTiers(tierOptions);
  }, [
    basePrice,
    goodPrice,
    betterPrice,
    bestPrice,
    goodDescription,
    betterDescription,
    bestDescription,
    features,
    warrantyPeriods,
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`border rounded-lg overflow-hidden ${
              selectedTier === tier.id
                ? 'ring-2 ring-primary-500 border-primary-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`p-4 ${tier.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {tier.icon}
                  <h3 className="ml-2 text-lg font-semibold">{tier.name}</h3>
                </div>
                {selectedTier === tier.id && (
                  <div className="bg-white rounded-full p-1">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="text-2xl font-bold">{formatPrice(tier.price)}</div>
                <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-2 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectTier(tier.id)}
                className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  selectedTier === tier.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
                }`}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierSelector;
