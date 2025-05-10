import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Home, DollarSign, PlusCircle, Trash2, RefreshCw } from 'lucide-react';

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

const RemodelingCalculator: React.FC = () => {
  const navigate = useNavigate();
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
    "Half Bath Renovation": {
      "Good": { low: 200, high: 300 },
      "Better": { low: 300, high: 400 },
      "Best": { low: 400, high: 500 },
      "Fully Custom": { low: 600, high: 700 }
    },
    "Full Bath Renovation": {
      "Good": { low: 300, high: 450 },
      "Better": { low: 450, high: 600 },
      "Best": { low: 600, high: 750 },
      "Fully Custom": { low: 800, high: 900 }
    },
    "Kitchen / Dining": {
      "Good": { low: 125, high: 200 },
      "Better": { low: 200, high: 300 },
      "Best": { low: 300, high: 400 },
      "Fully Custom": { low: 500, high: 600 }
    },
    "Wet Bar": {
      "Good": { low: 200, high: 400 },
      "Better": { low: 400, high: 500 },
      "Best": { low: 500, high: 600 },
      "Fully Custom": { low: 700, high: 800 }
    },
    "Living Room": {
      "Good": { low: 50, high: 100 },
      "Better": { low: 100, high: 150 },
      "Best": { low: 150, high: 200 },
      "Fully Custom": { low: 250, high: 300 }
    },
    "Dining Room": {
      "Good": { low: 100, high: 150 },
      "Better": { low: 150, high: 200 },
      "Best": { low: 200, high: 250 },
      "Fully Custom": { low: 300, high: 350 }
    },
    "Home Gym": {
      "Good": { low: 50, high: 100 },
      "Better": { low: 100, high: 150 },
      "Best": { low: 150, high: 200 },
      "Fully Custom": { low: 250, high: 300 }
    },
    "Closet": {
      "Good": { low: 75, high: 125 },
      "Better": { low: 125, high: 175 },
      "Best": { low: 175, high: 225 },
      "Fully Custom": { low: 250, high: 300 }
    },
    "Utility Room": {
      "Good": { low: 50, high: 100 },
      "Better": { low: 100, high: 150 },
      "Best": { low: 150, high: 200 },
      "Fully Custom": { low: 200, high: 250 }
    },
    "Hallways / Stairs": {
      "Good": { low: 20, high: 50 },
      "Better": { low: 50, high: 80 },
      "Best": { low: 80, high: 110 },
      "Fully Custom": { low: 120, high: 140 }
    }
  };

  // Design catalog–style descriptors
  const descriptors: Descriptors = {
    "Primary Bedroom": {
      "Good": "<ul><li>Designer-selected paint palette with satin finish</li><li>Efficiently organized wardrobe with soft-close hardware</li><li>Engineered hardwood flooring</li><li>LED lighting with dimmers</li><li>Modern ceiling fan</li></ul>",
      "Better": "<ul><li>Custom wall treatments and molding</li><li>Integrated closet systems with LED lighting</li><li>Premium hardwood flooring</li><li>Motorized window treatments</li><li>Smart home integration</li></ul>",
      "Best": "<ul><li>Custom millwork and storage solutions</li><li>Walk-in dressing suite</li><li>Heated floors and premium finishes</li><li>Smart home climate and lighting controls</li><li>Concealed home theater system</li></ul>",
      "Fully Custom": "<ul><li>Completely bespoke design</li><li>Rare luxury materials and finishes</li><li>Fully integrated smart home technology</li><li>One-of-a-kind architectural elements</li></ul>"
    }
  };

  // Set default descriptors for all room types
  useEffect(() => {
    for (const room in costRates) {
      if (!descriptors[room]) {
        descriptors[room] = {
          "Good": "<ul><li>Standard quality materials and finishes</li><li>Practical design elements</li><li>Energy efficient lighting</li><li>Durable surfaces</li></ul>",
          "Better": "<ul><li>Premium quality materials</li><li>Enhanced design elements</li><li>Custom lighting solutions</li><li>Upgraded fixtures and finishes</li></ul>",
          "Best": "<ul><li>High-end materials and finishes</li><li>Custom design elements</li><li>Smart home integration</li><li>Luxury fixtures and hardware</li></ul>",
          "Fully Custom": "<ul><li>Completely bespoke design</li><li>One-of-a-kind solutions</li><li>Artisan craftsmanship</li><li>Rare and exclusive materials</li></ul>"
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

  // Toggle the area input method
  const toggleAreaInput = (method: 'square' | 'dimensions') => {
    setAreaMethod(method);
  };

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

  // Update a room's quality level
  const updateRoom = (roomId: number, newQuality: string) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const rate = costRates[room.room][newQuality];
        return {
          ...room,
          quality: newQuality,
          lowCost: room.area * rate.low,
          highCost: room.area * rate.high,
          descriptor: descriptors[room.room][newQuality]
        };
      }
      return room;
    }));

    // Show success message
    setSuccessMessage("Room updated successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Delete a room from the list
  const deleteRoom = (roomId: number) => {
    setRooms(rooms.filter(room => room.id !== roomId));

    if (rooms.length === 1) {
      setShowForm(true);
    }

    // Show success message
    setSuccessMessage("Room removed from estimate");
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

  return (
    <div className="font-sans">
      <div className="calculator-section bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Renovation Cost Calculator</h1>
        </div>

        <p className="text-center text-gray-600 mb-8">
          This calculator provides an estimated budget range based on your room square footage and selected level of materials and work.
          Dream big and let's talk about your vision!
          <br /><br />
          Please note: All pricing is dependent upon the quality and type of materials you choose.
        </p>

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Process Flow Section */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">How We Work With You</h3>
          <div className="flex overflow-x-auto pb-4 space-x-4">
            {[
              { step: 1, title: "Discovery Call", desc: "We listen to understand your vision, goals, and timeline." },
              { step: 2, title: "Site Visit", desc: "Our expert team visits your home to assess the space." },
              { step: 3, title: "Ballpark Estimate", desc: "We provide a transparent preliminary budget range." },
              { step: 4, title: "Collaborative Review", desc: "Together we refine the scope and priorities." },
              { step: 5, title: "Design Agreement", desc: "We formalize our partnership with a clear roadmap." },
              { step: 6, title: "Personalized Design", desc: "Our design team creates custom layouts and material selections." },
              { step: 7, title: "Fixed Price Quote", desc: "We provide a comprehensive, detailed estimate." },
              { step: 8, title: "Contract Signing", desc: "Clear documentation secures your timeline, scope, and costs." },
              { step: 9, title: "Managed Construction", desc: "Our dedicated team handles all scheduling and coordination." },
              { step: 10, title: "Dream Fulfilled", desc: "We proudly walk you through your beautifully transformed space." }
            ].map((item) => (
              <div key={item.step} className="min-w-[160px] bg-white p-4 rounded-lg shadow-sm border-b-2 border-blue-500 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 text-sm font-medium">
                  {item.step}
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Input Method:
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={areaMethod === 'square'}
                      onChange={() => toggleAreaInput('square')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Enter Square Footage</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={areaMethod === 'dimensions'}
                      onChange={() => toggleAreaInput('dimensions')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Enter Dimensions</span>
                  </label>
                </div>
              </div>

              {areaMethod === 'square' ? (
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
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
                      Length (ft):
                    </label>
                    <input
                      type="number"
                      id="length"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter length"
                      min="0"
                      step="any"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                      Width (ft):
                    </label>
                    <input
                      type="number"
                      id="width"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter width"
                      min="0"
                      step="any"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Room to Estimate
              </button>
            </form>
          </div>
        )}

        {/* Room Entries */}
        {rooms.length > 0 && (
          <div className="space-y-6 mb-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{room.room} - {room.quality}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete Room"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Area: {room.area.toFixed(2)} sq ft</p>
                    <p className="text-sm font-medium text-gray-800">
                      Estimated Cost: {formatCurrency(room.lowCost)} - {formatCurrency(room.highCost)}
                    </p>
                  </div>
                  <div>
                    <label htmlFor={`quality-${room.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Update Quality Level:
                    </label>
                    <div className="flex space-x-2">
                      <select
                        id={`quality-${room.id}`}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={room.quality}
                        onChange={(e) => updateRoom(room.id, e.target.value)}
                      >
                        <option value="Good">Good</option>
                        <option value="Better">Better</option>
                        <option value="Best">Best</option>
                        <option value="Fully Custom">Fully Custom</option>
                      </select>
                      <button
                        onClick={() => updateRoom(room.id, room.quality)}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        title="Update Room"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="bg-gray-50 p-4 rounded-md text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: room.descriptor }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Another Room Button */}
        {rooms.length > 0 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Another Room
          </button>
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
            <button
              onClick={() => navigate('/contact')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Get a Detailed Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemodelingCalculator;
