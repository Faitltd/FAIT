import React, { useState } from 'react';

const SimpleTestCalculator: React.FC = () => {
  const [roomType, setRoomType] = useState('kitchen');
  const [area, setArea] = useState(200);
  const [quality, setQuality] = useState('Good');
  const [estimate, setEstimate] = useState<{low: number, high: number} | null>(null);

  // Room cost data ($ per square foot)
  const roomCostData: any = {
    kitchen: {
      'Good': [100, 150],
      'Better': [150, 250],
      'Best': [250, 350],
      'Fully Custom': [350, 500],
    },
    bathroom: {
      'Good': [120, 170],
      'Better': [170, 270],
      'Best': [270, 370],
      'Fully Custom': [370, 520],
    },
    living_room: {
      'Good': [50, 80],
      'Better': [80, 120],
      'Best': [120, 180],
      'Fully Custom': [180, 250],
    },
    bedroom: {
      'Good': [40, 70],
      'Better': [70, 110],
      'Best': [110, 160],
      'Fully Custom': [160, 220],
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate estimate
  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();

    const costRange = roomCostData[roomType][quality];
    const lowCost = Math.round(area * costRange[0]);
    const highCost = Math.round(area * costRange[1]);

    setEstimate({ low: lowCost, high: highCost });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Simple Test Calculator</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <form onSubmit={calculateEstimate} className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Get a Ballpark Estimate</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="room-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  id="room-type"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="living_room">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                </select>
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                  Area (square feet)
                </label>
                <input
                  type="number"
                  id="area"
                  min="1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={area}
                  onChange={(e) => setArea(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Level
                </label>
                <select
                  id="quality"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="Good">Good</option>
                  <option value="Better">Better</option>
                  <option value="Best">Best</option>
                  <option value="Fully Custom">Fully Custom</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Calculate Estimate
              </button>
            </div>
          </form>
        </div>

        {/* Estimate Result */}
        {estimate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Estimated Cost</h3>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This is an estimate based on the information provided.
              Contact us for a more detailed quote.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleTestCalculator;
