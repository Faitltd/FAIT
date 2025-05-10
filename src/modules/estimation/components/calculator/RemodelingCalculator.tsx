import React, { useState, useEffect } from 'react';
import { Button } from '../../../core/components/ui/Button';

export interface RemodelingCalculatorProps {
  onCalculate?: (estimate: RemodelingEstimate) => void;
}

export interface RemodelingEstimate {
  roomType: string;
  squareFootage: number;
  quality: 'basic' | 'standard' | 'premium';
  includeDemolition: boolean;
  includePermits: boolean;
  totalCost: number;
  breakdown: {
    materials: number;
    labor: number;
    demolition?: number;
    permits?: number;
  };
}

/**
 * RemodelingCalculator component for estimating remodeling costs
 */
export const RemodelingCalculator: React.FC<RemodelingCalculatorProps> = ({
  onCalculate,
}) => {
  const [roomType, setRoomType] = useState('kitchen');
  const [squareFootage, setSquareFootage] = useState(100);
  const [quality, setQuality] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [includeDemolition, setIncludeDemolition] = useState(true);
  const [includePermits, setIncludePermits] = useState(true);
  const [estimate, setEstimate] = useState<RemodelingEstimate | null>(null);

  // Base costs per square foot by room type and quality
  const baseCosts = {
    kitchen: {
      basic: 75,
      standard: 150,
      premium: 300,
    },
    bathroom: {
      basic: 100,
      standard: 200,
      premium: 350,
    },
    bedroom: {
      basic: 30,
      standard: 60,
      premium: 120,
    },
    livingRoom: {
      basic: 40,
      standard: 80,
      premium: 150,
    },
  };

  // Additional costs
  const demolitionCostPerSqFt = 10;
  const permitCost = 500;

  // Calculate estimate
  const calculateEstimate = () => {
    // Get base cost per square foot
    const baseCostPerSqFt = baseCosts[roomType as keyof typeof baseCosts][quality];
    
    // Calculate material and labor costs
    const materialCost = baseCostPerSqFt * squareFootage * 0.6; // 60% of base cost
    const laborCost = baseCostPerSqFt * squareFootage * 0.4; // 40% of base cost
    
    // Calculate additional costs
    const demolitionCost = includeDemolition ? demolitionCostPerSqFt * squareFootage : 0;
    const permitsCost = includePermits ? permitCost : 0;
    
    // Calculate total cost
    const totalCost = materialCost + laborCost + demolitionCost + permitsCost;
    
    // Create estimate object
    const newEstimate: RemodelingEstimate = {
      roomType,
      squareFootage,
      quality,
      includeDemolition,
      includePermits,
      totalCost,
      breakdown: {
        materials: materialCost,
        labor: laborCost,
        ...(includeDemolition && { demolition: demolitionCost }),
        ...(includePermits && { permits: permitsCost }),
      },
    };
    
    setEstimate(newEstimate);
    onCalculate?.(newEstimate);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Remodeling Cost Calculator</h2>
      
      <div className="mb-4">
        <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
          Room Type
        </label>
        <select
          id="roomType"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="kitchen">Kitchen</option>
          <option value="bathroom">Bathroom</option>
          <option value="bedroom">Bedroom</option>
          <option value="livingRoom">Living Room</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-1">
          Square Footage: {squareFootage} sq ft
        </label>
        <input
          type="range"
          id="squareFootage"
          min="50"
          max="500"
          step="10"
          value={squareFootage}
          onChange={(e) => setSquareFootage(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quality
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="quality"
              value="basic"
              checked={quality === 'basic'}
              onChange={() => setQuality('basic')}
              className="mr-2"
            />
            Basic
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="quality"
              value="standard"
              checked={quality === 'standard'}
              onChange={() => setQuality('standard')}
              className="mr-2"
            />
            Standard
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="quality"
              value="premium"
              checked={quality === 'premium'}
              onChange={() => setQuality('premium')}
              className="mr-2"
            />
            Premium
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeDemolition}
            onChange={(e) => setIncludeDemolition(e.target.checked)}
            className="mr-2"
          />
          Include Demolition
        </label>
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includePermits}
            onChange={(e) => setIncludePermits(e.target.checked)}
            className="mr-2"
          />
          Include Permits
        </label>
      </div>
      
      <div className="mb-6">
        <Button onClick={calculateEstimate}>
          Calculate Estimate
        </Button>
      </div>
      
      {estimate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Estimate Summary</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-gray-600">Room Type:</div>
            <div className="capitalize">{estimate.roomType.replace(/([A-Z])/g, ' $1').trim()}</div>
            
            <div className="text-gray-600">Square Footage:</div>
            <div>{estimate.squareFootage} sq ft</div>
            
            <div className="text-gray-600">Quality:</div>
            <div className="capitalize">{estimate.quality}</div>
          </div>
          
          <h4 className="font-medium mb-2">Cost Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-gray-600">Materials:</div>
            <div>{formatCurrency(estimate.breakdown.materials)}</div>
            
            <div className="text-gray-600">Labor:</div>
            <div>{formatCurrency(estimate.breakdown.labor)}</div>
            
            {estimate.breakdown.demolition && (
              <>
                <div className="text-gray-600">Demolition:</div>
                <div>{formatCurrency(estimate.breakdown.demolition)}</div>
              </>
            )}
            
            {estimate.breakdown.permits && (
              <>
                <div className="text-gray-600">Permits:</div>
                <div>{formatCurrency(estimate.breakdown.permits)}</div>
              </>
            )}
          </div>
          
          <div className="border-t pt-2 flex justify-between items-center">
            <div className="text-lg font-bold">Total Estimate:</div>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(estimate.totalCost)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
