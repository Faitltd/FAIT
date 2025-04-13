import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Hammer, Package2 } from 'lucide-react';
import HandymanCalculator from './HandymanCalculator';

const pricingData = {
  "Primary Bedroom": {
    "labor": 65,
    "material": {
      "Good": { "low": 30, "high": 50 },
      "Better": { "low": 58, "high": 83 },
      "Best": { "low": 85, "high": 115 },
      "Fully Custom": { "low": 165, "high": 225 }
    }
  },
  "Guest Bedroom": {
    "labor": 58,
    "material": {
      "Good": { "low": 28, "high": 48 },
      "Better": { "low": 55, "high": 75 },
      "Best": { "low": 80, "high": 105 },
      "Fully Custom": { "low": 150, "high": 195 }
    }
  },
  "Half Bath Renovation": {
    "labor": 258,
    "material": {
      "Good": { "low": 83, "high": 110 },
      "Better": { "low": 138, "high": 193 },
      "Best": { "low": 200, "high": 263 },
      "Fully Custom": { "low": 288, "high": 400 }
    }
  },
  "Full Bath Renovation": {
    "labor": 237,
    "material": {
      "Good": { "low": 88, "high": 138 },
      "Better": { "low": 165, "high": 225 },
      "Best": { "low": 250, "high": 325 },
      "Fully Custom": { "low": 350, "high": 475 }
    }
  },
  "Kitchen / Dining": {
    "labor": 167,
    "material": {
      "Good": { "low": 113, "high": 163 },
      "Better": { "low": 170, "high": 225 },
      "Best": { "low": 250, "high": 338 },
      "Fully Custom": { "low": 388, "high": 525 }
    }
  },
  "Wet Bar": {
    "labor": 177,
    "material": {
      "Good": { "low": 88, "high": 138 },
      "Better": { "low": 143, "high": 198 },
      "Best": { "low": 220, "high": 285 },
      "Fully Custom": { "low": 338, "high": 450 }
    }
  },
  "Living Room": {
    "labor": 63,
    "material": {
      "Good": { "low": 25, "high": 40 },
      "Better": { "low": 43, "high": 65 },
      "Best": { "low": 68, "high": 93 },
      "Fully Custom": { "low": 120, "high": 170 }
    }
  },
  "Dining Room": {
    "labor": 63,
    "material": {
      "Good": { "low": 35, "high": 55 },
      "Better": { "low": 58, "high": 80 },
      "Best": { "low": 85, "high": 115 },
      "Fully Custom": { "low": 135, "high": 180 }
    }
  },
  "Home Gym": {
    "labor": 72,
    "material": {
      "Good": { "low": 25, "high": 45 },
      "Better": { "low": 48, "high": 68 },
      "Best": { "low": 75, "high": 103 },
      "Fully Custom": { "low": 135, "high": 175 }
    }
  },
  "Closet": {
    "labor": 87,
    "material": {
      "Good": { "low": 30, "high": 50 },
      "Better": { "low": 58, "high": 85 },
      "Best": { "low": 100, "high": 138 },
      "Fully Custom": { "low": 188, "high": 253 }
    }
  },
  "Utility Room": {
    "labor": 82,
    "material": {
      "Good": { "low": 25, "high": 45 },
      "Better": { "low": 48, "high": 68 },
      "Best": { "low": 70, "high": 105 },
      "Fully Custom": { "low": 115, "high": 165 }
    }
  },
  "Hallways / Stairs": {
    "labor": 57,
    "material": {
      "Good": { "low": 13, "high": 25 },
      "Better": { "low": 25, "high": 38 },
      "Best": { "low": 38, "high": 55 },
      "Fully Custom": { "low": 68, "high": 95 }
    }
  }
};

const finishDetails = {
  "Primary Bedroom": {
    "Good": "Basic materials including standard paint, carpet or laminate flooring, and off-the-shelf lighting fixtures.",
    "Better": "Mid-grade materials such as premium paint, engineered hardwood flooring, and semi-custom lighting fixtures.",
    "Best": "High-quality materials featuring designer paint, solid hardwood flooring, and designer lighting fixtures.",
    "Fully Custom": "Luxury materials including specialty finishes, premium hardwood or natural stone flooring, and custom lighting solutions."
  },
  "Guest Bedroom": {
    "Good": "Standard materials with basic paint, carpet or vinyl flooring, and simple lighting fixtures.",
    "Better": "Enhanced materials including quality paint, engineered hardwood, and attractive lighting options.",
    "Best": "Premium materials featuring high-end paint, quality hardwood flooring, and upscale lighting fixtures.",
    "Fully Custom": "Luxury materials with custom paint finishes, premium flooring options, and bespoke lighting designs."
  },
  "Half Bath Renovation": {
    "Good": "Basic fixtures, standard tile, stock vanity, and builder-grade toilet.",
    "Better": "Enhanced fixtures, quality porcelain tile, semi-custom vanity, and comfort-height toilet.",
    "Best": "Premium fixtures, designer tile, custom vanity, and high-efficiency toilet.",
    "Fully Custom": "Luxury fixtures, natural stone or artisan tile, fully custom vanity, and top-of-the-line toilet."
  },
  "Full Bath Renovation": {
    "Good": "Standard fixtures, basic tile, stock vanity, builder-grade toilet, and standard tub/shower.",
    "Better": "Quality fixtures, porcelain tile, semi-custom vanity, comfort-height toilet, and upgraded shower system.",
    "Best": "Premium fixtures, designer tile, custom vanity, high-efficiency toilet, and luxury shower system with body jets.",
    "Fully Custom": "Luxury fixtures, natural stone or artisan tile, fully custom vanity, top-of-the-line toilet, and spa-quality shower experience."
  },
  "Kitchen / Dining": {
    "Good": "Stock cabinets, laminate countertops, basic appliances, and standard fixtures.",
    "Better": "Semi-custom cabinets, quartz countertops, stainless steel appliances, and quality fixtures.",
    "Best": "Custom cabinets, premium quartz or granite countertops, high-end appliances, and designer fixtures.",
    "Fully Custom": "Fully custom cabinets, luxury stone countertops, professional-grade appliances, and specialty fixtures."
  },
  "Wet Bar": {
    "Good": "Standard cabinets, laminate countertops, basic sink and faucet.",
    "Better": "Semi-custom cabinets, quartz countertops, quality sink and faucet.",
    "Best": "Custom cabinets, premium stone countertops, high-end sink and faucet, with wine refrigerator.",
    "Fully Custom": "Luxury custom cabinets, exotic stone countertops, designer sink and faucet, with specialized refrigeration and accessories."
  },
  "Living Room": {
    "Good": "Basic paint, standard flooring, and simple lighting.",
    "Better": "Premium paint, engineered wood or quality laminate flooring, and enhanced lighting.",
    "Best": "Designer paint, hardwood flooring, and custom lighting plan.",
    "Fully Custom": "Specialty finishes, premium hardwood or natural stone flooring, and architectural lighting."
  },
  "Dining Room": {
    "Good": "Standard paint, basic flooring, and simple lighting fixtures.",
    "Better": "Quality paint, engineered hardwood, and attractive lighting.",
    "Best": "Designer paint, premium hardwood, and statement lighting fixture.",
    "Fully Custom": "Custom finishes, luxury flooring, and artistic lighting solutions."
  },
  "Home Gym": {
    "Good": "Basic rubber flooring, standard paint, and simple fixtures.",
    "Better": "Premium rubber flooring, moisture-resistant paint, and enhanced fixtures.",
    "Best": "Professional-grade flooring, specialized wall treatments, and custom storage solutions.",
    "Fully Custom": "Competition-quality flooring, custom wall systems, integrated audio/visual, and specialized storage."
  },
  "Closet": {
    "Good": "Basic shelving and hanging rods with melamine surfaces.",
    "Better": "Enhanced organization system with adjustable components and laminate finishes.",
    "Best": "Custom organization system with specialized storage and real wood finishes.",
    "Fully Custom": "Bespoke closet system with luxury finishes, integrated lighting, and specialized storage for collections."
  },
  "Utility Room": {
    "Good": "Basic cabinets, laminate countertops, and standard fixtures.",
    "Better": "Enhanced cabinets, solid surface countertops, and quality fixtures.",
    "Best": "Custom cabinets, premium countertops, and specialized utility fixtures.",
    "Fully Custom": "Fully custom storage solutions, luxury-grade materials, and high-efficiency utility fixtures."
  },
  "Hallways / Stairs": {
    "Good": "Basic paint, standard flooring, and builder-grade railings.",
    "Better": "Quality paint, engineered wood, and enhanced railings.",
    "Best": "Premium paint, hardwood treads, and custom railings.",
    "Fully Custom": "Designer finishes, luxury hardwood or stone, and architectural railings."
  }
} as const;

type QualityLevel = 'Good' | 'Better' | 'Best' | 'Fully Custom';
type RoomSelection = {
  room: string;
  quality: QualityLevel;
  sqft: number;
};

const CostCalculator = () => {
  const [activeTab, setActiveTab] = useState<'renovation' | 'handyman'>('renovation');
  const [selections, setSelections] = useState<RoomSelection[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>(Object.keys(pricingData)[0]);
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>('Best');
  const [currentSqft, setCurrentSqft] = useState<string>('');
  const [useDirectInput, setUseDirectInput] = useState(true);
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');

  const calculatedSqft = useMemo(() => {
    if (!length || !width) return 0;
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (isNaN(l) || isNaN(w)) return 0;
    return l * w;
  }, [length, width]);

  const addSelection = () => {
    const sqft = useDirectInput ? 
      (currentSqft ? parseFloat(currentSqft) : 0) : 
      calculatedSqft;

    if (sqft <= 0) return;

    setSelections(prev => [...prev, {
      room: currentRoom,
      quality: currentQuality,
      sqft
    }]);
    
    if (useDirectInput) {
      setCurrentSqft('');
    } else {
      setLength('');
      setWidth('');
    }
  };

  const removeSelection = (index: number) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  };

  const calculateCosts = useMemo(() => {
    const costs = selections.reduce((acc, selection) => {
      const roomData = pricingData[selection.room as keyof typeof pricingData];
      const laborCost = roomData.labor * selection.sqft;
      const materialRange = roomData.material[selection.quality];
      const avgMaterialCost = ((materialRange.low + materialRange.high) / 2) * selection.sqft;
      
      return {
        labor: acc.labor + laborCost,
        material: acc.material + avgMaterialCost,
        total: acc.total + laborCost + avgMaterialCost
      };
    }, { labor: 0, material: 0, total: 0 });

    const projectManagement = costs.total * 0.125;
    
    return {
      ...costs,
      projectManagement,
      grandTotal: costs.total + projectManagement
    };
  }, [selections]);

  const currentRoomRates = useMemo(() => {
    const room = pricingData[currentRoom as keyof typeof pricingData];
    const materialRange = room.material[currentQuality];
    return {
      labor: room.labor,
      materialLow: materialRange.low,
      materialHigh: materialRange.high
    };
  }, [currentRoom, currentQuality]);

  const currentFinishDetails = useMemo(() => {
    return finishDetails[currentRoom as keyof typeof finishDetails][currentQuality];
  }, [currentRoom, currentQuality]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Cost Calculator</h2>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('renovation')}
              className={`${
                activeTab === 'renovation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Renovation Calculator
            </button>
            <button
              onClick={() => setActiveTab('handyman')}
              className={`${
                activeTab === 'handyman'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Handyman Tasks
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'renovation' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Room Type</label>
              <select
                value={currentRoom}
                onChange={(e) => setCurrentRoom(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {Object.keys(pricingData).map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quality Level</label>
              <select
                value={currentQuality}
                onChange={(e) => setCurrentQuality(e.target.value as QualityLevel)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {Object.keys(pricingData[currentRoom as keyof typeof pricingData].material).map((quality) => (
                  <option key={quality} value={quality}>{quality}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Selection Rates (per sq ft)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Hammer className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">
                  Labor: ${currentRoomRates.labor}
                </span>
              </div>
              <div className="flex items-center">
                <Package2 className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">
                  Materials: ${currentRoomRates.materialLow}-${currentRoomRates.materialHigh}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Finish Details</h4>
            <p className="text-sm text-blue-700">{currentFinishDetails}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={useDirectInput}
                  onChange={() => setUseDirectInput(true)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Enter square footage directly</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!useDirectInput}
                  onChange={() => setUseDirectInput(false)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Calculate from length × width</span>
              </label>
            </div>

            {useDirectInput ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Square Footage</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    value={currentSqft}
                    onChange={(e) => setCurrentSqft(e.target.value)}
                    min="1"
                    placeholder="Enter square footage"
                    className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addSelection}
                    disabled={!currentSqft || isNaN(Number(currentSqft)) || Number(currentSqft) <= 0}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Length (feet)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    min="1"
                    placeholder="Enter length"
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width (feet)</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      min="1"
                      placeholder="Enter width"
                      className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={addSelection}
                      disabled={calculatedSqft <= 0}
                      className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add ({calculatedSqft} sq ft)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selections.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Rooms</h3>
              <div className="space-y-4">
                {selections.map((selection, index) => {
                  const roomData = pricingData[selection.room as keyof typeof pricingData];
                  const laborCost = roomData.labor * selection.sqft;
                  const materialRange = roomData.material[selection.quality];
                  const avgMaterialCost = ((materialRange.low + materialRange.high) / 2) * selection.sqft;
                  const totalRoomCost = laborCost + avgMaterialCost;

                  return (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{selection.room}</h4>
                        <button
                          onClick={() => removeSelection(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Quality Level:</span>
                          <span className="font-medium text-gray-900">{selection.quality}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Square Footage:</span>
                          <span className="font-medium text-gray-900">{selection.sqft} sq ft</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Labor Cost:</span>
                          <span className="font-medium text-gray-900">
                            ${Math.round(laborCost).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Materials Cost:</span>
                          <span className="font-medium text-gray-900">
                            ${Math.round(avgMaterialCost).toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Room Total:</span>
                          <span className="font-bold text-blue-600">
                            ${Math.round(totalRoomCost).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium mb-1">Included in {selection.quality}:</p>
                        <p>{finishDetails[selection.room as keyof typeof finishDetails][selection.quality]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Labor Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(calculateCosts.labor).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Materials Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(calculateCosts.material).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Project Management (12.5%)</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(calculateCosts.projectManagement).toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Estimate</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${Math.round(calculateCosts.grandTotal).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This is a rough estimate based on average material costs and standard labor rates.
                  Actual costs may vary based on specific requirements and contractor availability.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <HandymanCalculator />
      )}
    </div>
  );
};

export default CostCalculator;