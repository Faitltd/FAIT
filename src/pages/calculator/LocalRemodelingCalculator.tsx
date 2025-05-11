import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

// Define types
type RoomEntry = {
  id: number;
  room: string;
  quality: string;
  area: number;
  lowCost: number;
  highCost: number;
  descriptor: string;
};

type CostRate = {
  low: number;
  high: number;
};

type CostRates = {
  [key: string]: {
    [key: string]: CostRate;
  };
};

type Descriptors = {
  [key: string]: {
    [key: string]: string;
  };
};

export const LocalRemodelingCalculator: React.FC = () => {
  const [rooms, setRooms] = useState<RoomEntry[]>([]);
  const [roomIdCounter, setRoomIdCounter] = useState(0);
  const [totalLow, setTotalLow] = useState(0);
  const [totalHigh, setTotalHigh] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [areaMethod, setAreaMethod] = useState<'square' | 'dimensions'>('square');
  const [squareFootage, setSquareFootage] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('Primary Bedroom');
  const [selectedQuality, setSelectedQuality] = useState('Good');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pricing ranges for each renovation type (4 tiers)
  const costRates: CostRates = {
    "Primary Bedroom": {
      "Good": { low: 50, high: 100 },
      "Better": { low: 150, high: 200 },
      "Best": { low: 250, high: 300 },
      "Fully Custom": { low: 500, high: 800 }
    },
    "Guest Bedroom": {
      "Good": { low: 50, high: 100 },
      "Better": { low: 150, high: 200 },
      "Best": { low: 250, high: 300 },
      "Fully Custom": { low: 450, high: 700 }
    },
    "Kitchen / Dining": {
      "Good": { low: 125, high: 200 },
      "Better": { low: 200, high: 300 },
      "Best": { low: 300, high: 400 },
      "Fully Custom": { low: 500, high: 600 }
    },
    "Living Room": {
      "Good": { low: 50, high: 100 },
      "Better": { low: 100, high: 150 },
      "Best": { low: 150, high: 200 },
      "Fully Custom": { low: 250, high: 300 }
    }
  };

  // Design catalog–style descriptors
  const descriptors: Descriptors = {
    "Primary Bedroom": {
      "Good": "<ul><li>Standard quality materials</li><li>Basic design</li></ul>",
      "Better": "<ul><li>Premium quality materials</li><li>Enhanced design</li></ul>",
      "Best": "<ul><li>High-end materials</li><li>Custom design</li></ul>",
      "Fully Custom": "<ul><li>Luxury materials</li><li>Bespoke design</li></ul>"
    }
  };

  // Set default descriptors for all room types
  useEffect(() => {
    for (const room in costRates) {
      if (!descriptors[room]) {
        descriptors[room] = {
          "Good": "<ul><li>Standard quality materials</li><li>Basic design</li></ul>",
          "Better": "<ul><li>Premium quality materials</li><li>Enhanced design</li></ul>",
          "Best": "<ul><li>High-end materials</li><li>Custom design</li></ul>",
          "Fully Custom": "<ul><li>Luxury materials</li><li>Bespoke design</li></ul>"
        };
      }
    }
  }, []);

  // Update totals when rooms change
  useEffect(() => {
    let newTotalLow = 0;
    let newTotalHigh = 0;

    rooms.forEach(room => {
      newTotalLow += room.lowCost;
      newTotalHigh += room.highCost;
    });

    setTotalLow(newTotalLow);
    setTotalHigh(newTotalHigh);
  }, [rooms]);

  // Calculate area based on input method
  const calculateArea = (): number => {
    if (areaMethod === 'square') {
      return parseFloat(squareFootage) || 0;
    } else {
      const lengthVal = parseFloat(length) || 0;
      const widthVal = parseFloat(width) || 0;
      return lengthVal * widthVal;
    }
  };

  // Add a new room to the list
  const addRoom = (event: React.FormEvent) => {
    event.preventDefault();

    const area = calculateArea();

    if (isNaN(area) || area <= 0) {
      alert("Please enter a valid area.");
      return;
    }

    const rate = costRates[selectedRoom][selectedQuality];
    const lowCost = area * rate.low;
    const highCost = area * rate.high;
    const descriptorText = descriptors[selectedRoom][selectedQuality];

    const newRoom: RoomEntry = {
      id: roomIdCounter,
      room: selectedRoom,
      quality: selectedQuality,
      area: area,
      lowCost: lowCost,
      highCost: highCost,
      descriptor: descriptorText
    };

  return (
    <div className="font-sans">
      <div className="calculator-section bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Renovation Cost Calculator</h1>
        </div>

        <p className="text-center text-gray-600 mb-8">
          This calculator provides an estimated budget range based on your room square footage and selected level of materials and work.
        </p>

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Room to Estimate</h2>
            <form onSubmit={addRoom}>
              <div className="mb-4">
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Renovation Type (Room):
                </label>
                <select
                  id="room"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  {Object.keys(costRates).map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Quality Level:
                </label>
                <select
                  id="quality"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                >
                  <option value="Good">Good</option>
                  <option value="Better">Better</option>
                  <option value="Best">Best</option>
                  <option value="Fully Custom">Fully Custom</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-1">
                  Square Footage:
                </label>
                <input
                  type="number"
                  id="squareFootage"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter square feet"
                  min="0"
                  step="any"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Room to Estimate
              </button>
            </form>
          </div>
        )}

        {/* Total Cost */}
        {rooms.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Estimated Cost</h3>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(totalLow)} - {formatCurrency(totalHigh)}
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

  return (
    <div className="font-sans">
      <div className="calculator-section bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Renovation Cost Calculator</h1>
        </div>

        <p className="text-center text-gray-600 mb-8">
          This calculator provides an estimated budget range based on your room square footage and selected level of materials and work.
        </p>

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Room to Estimate</h2>
            <form onSubmit={addRoom}>
              <div className="mb-4">
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Renovation Type (Room):
                </label>
                <select
                  id="room"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  {Object.keys(costRates).map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Quality Level:
                </label>
                <select
                  id="quality"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                >
                  <option value="Good">Good</option>
                  <option value="Better">Better</option>
                  <option value="Best">Best</option>
                  <option value="Fully Custom">Fully Custom</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-1">
                  Square Footage:
                </label>
                <input
                  type="number"
                  id="squareFootage"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter square feet"
                  min="0"
                  step="any"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Room to Estimate
              </button>
            </form>
          </div>
        )}

        {/* Total Cost */}
        {rooms.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Estimated Cost</h3>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(totalLow)} - {formatCurrency(totalHigh)}
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

    setRooms([...rooms, newRoom]);
    setRoomIdCounter(roomIdCounter + 1);
    setShowForm(false);

    // Reset form fields
    setSquareFootage('');
    setLength('');
    setWidth('');

    // Show success message
    setSuccessMessage(`${selectedRoom} added to estimate`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
