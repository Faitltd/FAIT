import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wrench, DollarSign, PlusCircle, Trash2 } from 'lucide-react';

// Define types for line items
type LineItem = {
  id: number;
  taskKey: string;
  label: string;
  quantity: number;
  low: number;
  high: number;
  avg: number;
};

const SimpleHandymanCalculator: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState('drywall_patching');
  const [quantity, setQuantity] = useState(1);
  const [estimate, setEstimate] = useState<{low: number, high: number, avg: number} | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [itemIdCounter, setItemIdCounter] = useState(1);

  // Pricing data based on comprehensive handyman task list
  const pricingData: any = {
    "drywall_patching": {
      "label": "Drywall patching and repair",
      "handyman": [200, 800],
      "contractor": [240, 900]
    },
    "touch_up_painting": {
      "label": "Touch-up painting",
      "handyman": [50, 150],
      "contractor": [60, 180]
    },
    "door_alignment": {
      "label": "Door alignment and hinge repair",
      "handyman": [50, 100],
      "contractor": [60, 120]
    },
    "squeaky_doors": {
      "label": "Fixing squeaky doors or floors",
      "handyman": [50, 100],
      "contractor": [60, 120]
    },
    "caulking": {
      "label": "Caulking windows, tubs, and sinks",
      "handyman": [175, 300],
      "contractor": [210, 360]
    },
    "weather_stripping": {
      "label": "Replacing weather stripping",
      "handyman": [100, 400],
      "contractor": [120, 480]
    },
    "door_knobs": {
      "label": "Replacing door knobs and locks",
      "handyman": [75, 200],
      "contractor": [90, 240]
    },
    "cabinet_hardware": {
      "label": "Tightening loose cabinet hardware",
      "handyman": [20, 50],
      "contractor": [30, 60]
    },
    "window_screens": {
      "label": "Replacing window screens",
      "handyman": [15, 50],
      "contractor": [25, 70]
    },
    "tv_mounting": {
      "label": "Mounting TVs or soundbars",
      "handyman": [100, 300],
      "contractor": [120, 360]
    },
    "leaky_faucets": {
      "label": "Fixing leaky faucets",
      "handyman": [65, 150],
      "contractor": [80, 190]
    },
    "showerheads": {
      "label": "Replacing showerheads",
      "handyman": [75, 150],
      "contractor": [90, 190]
    },
    "unclogging_drains": {
      "label": "Unclogging drains",
      "handyman": [100, 275],
      "contractor": [120, 330]
    },
    "replacing_toilets": {
      "label": "Replacing toilets",
      "handyman": [175, 275],
      "contractor": [210, 330]
    },
    "garbage_disposal": {
      "label": "Installing garbage disposals",
      "handyman": [80, 200],
      "contractor": [100, 240]
    },
    "toilet_repair": {
      "label": "Repairing toilet mechanisms",
      "handyman": [100, 310],
      "contractor": [120, 370]
    },
    "sink_traps": {
      "label": "Replacing sink traps (P-traps)",
      "handyman": [100, 150],
      "contractor": [120, 190]
    },
    "washing_machine_hoses": {
      "label": "Installing/replacing washing machine hoses",
      "handyman": [50, 100],
      "contractor": [60, 130]
    },
    "light_fixtures": {
      "label": "Replacing light fixtures",
      "handyman": [65, 175],
      "contractor": [80, 210]
    },
    "ceiling_fans": {
      "label": "Replacing ceiling fans",
      "handyman": [200, 300],
      "contractor": [240, 360]
    },
    "switches_outlets": {
      "label": "Swapping out switches or outlets",
      "handyman": [50, 150],
      "contractor": [60, 180]
    },
    "dimmers_timers": {
      "label": "Installing dimmers or timers",
      "handyman": [60, 150],
      "contractor": [80, 180]
    },
    "smoke_detectors": {
      "label": "Replacing smoke or CO detectors",
      "handyman": [50, 100],
      "contractor": [60, 130]
    },
    "doorbells": {
      "label": "Installing doorbells or chimes",
      "handyman": [50, 100],
      "contractor": [60, 130]
    },
    "exhaust_fans": {
      "label": "Replacing bathroom exhaust fans",
      "handyman": [175, 550],
      "contractor": [210, 660]
    },
    "gutter_cleaning": {
      "label": "Gutter cleaning",
      "handyman": [100, 225],
      "contractor": [120, 270]
    },
    "power_washing": {
      "label": "Power washing siding or walkways",
      "handyman": [150, 300],
      "contractor": [180, 360]
    },
    "fence_repair": {
      "label": "Fence repair",
      "handyman": [300, 800],
      "contractor": [360, 960]
    },
    "deck_repair": {
      "label": "Deck repair or staining",
      "handyman": [450, 1500],
      "contractor": [550, 1800]
    },
    "trim_siding": {
      "label": "Replacing rotten trim or siding",
      "handyman": [200, 600],
      "contractor": [250, 800]
    },
    "roof_patching": {
      "label": "Minor roof patching (shingle)",
      "handyman": [200, 800],
      "contractor": [250, 900]
    },
    "downspout_extensions": {
      "label": "Installing downspout extensions",
      "handyman": [50, 100],
      "contractor": [60, 130]
    },
    "holiday_lights": {
      "label": "Hanging holiday lights",
      "handyman": [220, 680],
      "contractor": [260, 780]
    },
    "furniture_assembly": {
      "label": "Building or assembling furniture",
      "handyman": [85, 200],
      "contractor": [110, 260]
    },
    "baseboards_trim": {
      "label": "Installing or repairing baseboards and trim",
      "handyman": [200, 800],
      "contractor": [250, 1000]
    },
    "cabinet_doors": {
      "label": "Replacing cabinet doors",
      "handyman": [50, 200],
      "contractor": [70, 250]
    },
    "closet_organizers": {
      "label": "Building closet organizers or shelves",
      "handyman": [200, 800],
      "contractor": [250, 900]
    },
    "stairs_railings": {
      "label": "Repairing stairs or railings",
      "handyman": [200, 600],
      "contractor": [250, 700]
    },
    "pet_doors": {
      "label": "Installing pet doors",
      "handyman": [200, 450],
      "contractor": [250, 550]
    },
    "vinyl_flooring": {
      "label": "Installing vinyl or laminate flooring",
      "handyman": [1000, 4000],
      "contractor": [1200, 4800]
    },
    "tile_grout": {
      "label": "Repairing tile grout",
      "handyman": [250, 1000],
      "contractor": [300, 1200]
    },
    "recaulking": {
      "label": "Re-caulking shower/tub joints",
      "handyman": [175, 300],
      "contractor": [210, 360]
    },
    "threshold_transitions": {
      "label": "Repairing or replacing threshold transitions",
      "handyman": [100, 300],
      "contractor": [120, 400]
    },
    "blinds_curtains": {
      "label": "Installing blinds or curtain rods",
      "handyman": [30, 250],
      "contractor": [50, 300]
    },
    "mailboxes": {
      "label": "Replacing mailboxes",
      "handyman": [150, 200],
      "contractor": [180, 260]
    },
    "childproofing": {
      "label": "Installing baby gates or childproofing",
      "handyman": [200, 700],
      "contractor": [250, 800]
    },
    "playsets_sheds": {
      "label": "Assembling playsets or sheds",
      "handyman": [200, 1000],
      "contractor": [250, 1200]
    },
    "moving_appliances": {
      "label": "Moving appliances or heavy furniture",
      "handyman": [700, 1500],
      "contractor": [800, 1800]
    },
    "thermostats": {
      "label": "Installing or replacing thermostats",
      "handyman": [80, 200],
      "contractor": [100, 240]
    }
  };

  // Calculate and show estimate
  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();

    const data = pricingData[selectedTask];

    // Calculate average prices
    const handymanAvg = Math.round((data.handyman[0] + data.handyman[1]) / 2);
    const contractorAvg = Math.round((data.contractor[0] + data.contractor[1]) / 2);

    const newEstimate = {
      low: data.handyman[0] * quantity,
      high: data.handyman[1] * quantity,
      avg: handymanAvg * quantity
    };

    setEstimate(newEstimate);

    // Automatically add to line items
    const newItem: LineItem = {
      id: itemIdCounter,
      taskKey: selectedTask,
      label: pricingData[selectedTask].label,
      quantity: quantity,
      low: newEstimate.low,
      high: newEstimate.high,
      avg: newEstimate.avg
    };

    setLineItems([...lineItems, newItem]);
    setItemIdCounter(itemIdCounter + 1);

    // Reset quantity for next calculation
    setQuantity(1);
  };

  // Add current estimate to line items
  const addToLineItems = () => {
    if (!estimate) return;

    const newItem: LineItem = {
      id: itemIdCounter,
      taskKey: selectedTask,
      label: pricingData[selectedTask].label,
      quantity: quantity,
      low: estimate.low,
      high: estimate.high,
      avg: estimate.avg
    };

    setLineItems([...lineItems, newItem]);
    setItemIdCounter(itemIdCounter + 1);

    // Reset form
    setQuantity(1);
    setEstimate(null);
  };

  // Remove a line item
  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  // Calculate totals for all line items
  const calculateTotals = () => {
    return lineItems.reduce(
      (totals, item) => {
        return {
          low: totals.low + item.low,
          high: totals.high + item.high,
          avg: totals.avg + item.avg
        };
      },
      { low: 0, high: 0, avg: 0 }
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Handyman Task Estimator</h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <form onSubmit={calculateEstimate} className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Get a Ballpark Estimate</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task
                </label>
                <select
                  id="task"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  {Object.entries(pricingData).map(([key, data]: [string, any]) => (
                    <option key={key} value={key}>{data.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
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
            <div className="flex justify-center my-4">
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Estimated Cost</h3>
            <p className="text-2xl font-bold text-blue-700">
              ${estimate.low} - ${estimate.high}
            </p>
            <p className="text-md text-blue-600 mt-1">
              Average: ${estimate.avg}
            </p>
            <p className="text-sm text-gray-600 mt-4">
              This is an estimate based on the information provided.
              Contact us for a more detailed quote.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Get a Detailed Quote
              </Link>
            </div>
          </div>
        )}

        {/* Line Items Section */}
        {lineItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Estimate (Items Added Automatically)</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Cost</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.label}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.low} - ${item.high}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.avg}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th scope="row" colSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">${calculateTotals().low} - ${calculateTotals().high}</td>
                      <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">${calculateTotals().avg}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <Link
                to="/calculator/estimate"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Back to Calculators
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleHandymanCalculator;
