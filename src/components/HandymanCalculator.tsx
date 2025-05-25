import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Hammer, Clock } from 'lucide-react';

const handymanPricing = {
  "Demolition": {
    "Standard demolition": { rate: 75, unit: "hour" },
    "Cabinet/countertop removal": { rate: 62.50, unit: "sqft", range: [50, 75] },
    "Floor removal": { rate: 2.50, unit: "sqft", range: [1, 4] },
    "Wall removal": { rate: 20, unit: "sqft", range: [15, 25] }
  },
  "Framing": {
    "Basic wall framing": { rate: 25, unit: "linear-ft", range: [20, 30] },
    "Ceiling framing": { rate: 4, unit: "sqft", range: [3, 5] },
    "Floor framing/platform": { rate: 12, unit: "sqft", range: [10, 14] },
    "Specialty framing": { rate: 87.50, unit: "hour", range: [75, 100] }
  },
  "Drywall": {
    "Hanging and finishing": { rate: 5, unit: "sqft", range: [4, 6] },
    "Patch and repair": { rate: 112.50, unit: "hour", range: [75, 150] },
    "Ceiling work": { rate: 6.50, unit: "sqft", range: [5, 8] },
    "Specialty texturing": { rate: 3, unit: "sqft", range: [2, 4] }
  },
  "Plumbing": {
    "Fixture installation": { rate: 175, unit: "fixture", range: [100, 250] },
    "Supply line installation": { rate: 112.50, unit: "line", range: [75, 150] },
    "Drain line installation": { rate: 225, unit: "line", range: [150, 300] },
    "Bathroom rough-in": { rate: 1500, unit: "complete", range: [1000, 2000] },
    "Kitchen plumbing": { rate: 2250, unit: "complete", range: [1500, 3000] }
  },
  "Electrical": {
    "Light fixture installation": { rate: 112.50, unit: "fixture", range: [75, 150] },
    "Recessed lighting": { rate: 115, unit: "fixture", range: [80, 150] },
    "Switch/outlet installation": { rate: 70, unit: "location", range: [40, 100] },
    "Appliance hookup": { rate: 200, unit: "appliance", range: [100, 300] },
    "Panel work": { rate: 100, unit: "hour", range: [75, 125] }
  },
  "HVAC": {
    "Vent installation": { rate: 1.25, unit: "sqft", range: [0.50, 2] },
    "Ductwork modification": { rate: 112.50, unit: "hour", range: [75, 150] },
    "Hood vent installation": { rate: 375, unit: "complete", range: [250, 500] },
    "Gas line installation": { rate: 87.50, unit: "linear-ft", range: [75, 100] }
  },
  "Tile Work": {
    "Floor tile installation": { rate: 20, unit: "sqft", range: [10, 30] },
    "Wall tile installation": { rate: 18.50, unit: "sqft", range: [12, 25] },
    "Backsplash installation": { rate: 30, unit: "sqft", range: [20, 40] },
    "Custom shower": { rate: 57.50, unit: "sqft", range: [40, 75] },
    "Stone/specialty materials": { rate: 10, unit: "sqft", range: [5, 15] }
  },
  "Cabinetry": {
    "Cabinet installation": { rate: 225, unit: "cabinet", range: [150, 300] },
    "Custom built-ins": { rate: 100, unit: "linear-ft", range: [75, 125] },
    "Cabinet door/hardware": { rate: 12.50, unit: "piece", range: [10, 15] },
    "Cabinet modification": { rate: 87.50, unit: "hour", range: [75, 100] }
  },
  "Countertop Installation": {
    "Laminate": { rate: 32.50, unit: "sqft", range: [25, 40] },
    "Quartz/granite": { rate: 55, unit: "sqft", range: [40, 70] },
    "Specialty edges": { rate: 37.50, unit: "linear-ft", range: [25, 50] },
    "Cutouts": { rate: 175, unit: "each", range: [100, 250] }
  },
  "Flooring": {
    "Carpet installation": { rate: 2.75, unit: "sqft", range: [1.50, 4] },
    "Luxury vinyl plank": { rate: 3, unit: "sqft", range: [2, 4] },
    "Hardwood installation": { rate: 6, unit: "sqft", range: [4, 8] },
    "Tile flooring": { rate: 12.50, unit: "sqft", range: [10, 15] },
    "Stair installation": { rate: 300, unit: "stair", range: [250, 350] }
  },
  "Trim Work": {
    "Baseboard installation": { rate: 2.25, unit: "linear-ft", range: [1.50, 3] },
    "Door casing": { rate: 57.50, unit: "door", range: [40, 75] },
    "Crown molding": { rate: 5, unit: "linear-ft", range: [3, 7] },
    "Custom trim work": { rate: 87.50, unit: "hour", range: [75, 100] }
  },
  "Painting": {
    "Wall painting": { rate: 1.38, unit: "sqft", range: [0.75, 2] },
    "Ceiling painting": { rate: 1.75, unit: "sqft", range: [1, 2.50] },
    "Trim painting": { rate: 2, unit: "linear-ft", range: [1, 3] },
    "Door painting": { rate: 115, unit: "door", range: [80, 150] },
    "Cabinet painting": { rate: 57.50, unit: "piece", range: [40, 75] }
  },
  "Glass Installation": {
    "Standard shower door": { rate: 275, unit: "complete", range: [200, 350] },
    "Custom shower enclosure": { rate: 112.50, unit: "sqft", range: [75, 150] },
    "Glass panel installation": { rate: 125, unit: "linear-ft", range: [100, 150] }
  },
  "Finishing Work": {
    "Cleanup": { rate: 137.50, unit: "hour", range: [75, 200] },
    "Site protection": { rate: 225, unit: "project", range: [150, 300] },
    "Project management": { rate: 12.5, unit: "percent" },
    "Final detailing": { rate: 87.50, unit: "hour", range: [75, 100] }
  }
};

type TaskSelection = {
  category: string;
  task: string;
  quantity: number;
};

const HandymanCalculator = () => {
  const [selections, setSelections] = useState<TaskSelection[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>(Object.keys(handymanPricing)[0]);
  const [currentTask, setCurrentTask] = useState<string>(
    Object.keys(handymanPricing[Object.keys(handymanPricing)[0] as keyof typeof handymanPricing])[0]
  );
  const [quantity, setQuantity] = useState<string>('');

  const addSelection = () => {
    if (!quantity || parseFloat(quantity) <= 0) return;

    setSelections(prev => [...prev, {
      category: currentCategory,
      task: currentTask,
      quantity: parseFloat(quantity)
    }]);
    setQuantity('');
  };

  const removeSelection = (index: number) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = useMemo(() => {
    const subtotal = selections.reduce((total, selection) => {
      const taskData = handymanPricing[selection.category as keyof typeof handymanPricing][selection.task];
      return total + (taskData.rate * selection.quantity);
    }, 0);

    const projectManagement = subtotal * 0.125; // 12.5%
    const total = subtotal + projectManagement;

    return {
      subtotal,
      projectManagement,
      total
    };
  }, [selections]);

  const currentTaskData = handymanPricing[currentCategory as keyof typeof handymanPricing][currentTask];

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'hour': return 'hours';
      case 'sqft': return 'sq ft';
      case 'linear-ft': return 'linear ft';
      case 'fixture': return 'fixtures';
      case 'line': return 'lines';
      case 'complete': return 'units';
      case 'cabinet': return 'cabinets';
      case 'piece': return 'pieces';
      case 'each': return 'units';
      case 'stair': return 'stairs';
      case 'door': return 'doors';
      case 'project': return 'projects';
      case 'percent': return '%';
      default: return unit;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <Hammer className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Handyman Task Calculator</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={currentCategory}
              onChange={(e) => {
                setCurrentCategory(e.target.value);
                setCurrentTask(Object.keys(handymanPricing[e.target.value as keyof typeof handymanPricing])[0]);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {Object.keys(handymanPricing).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Task</label>
            <select
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {Object.keys(handymanPricing[currentCategory as keyof typeof handymanPricing]).map((task) => (
                <option key={task} value={task}>{task}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Task Rate</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">
                {currentTaskData.range ? 
                  `$${currentTaskData.range[0]}-${currentTaskData.range[1]}` :
                  `$${currentTaskData.rate}`} per {getUnitLabel(currentTaskData.unit)}
              </span>
            </div>
            {currentTaskData.unit === 'hour' && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">Hourly rate</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity ({getUnitLabel(currentTaskData.unit)})
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step={currentTaskData.unit === 'hour' ? '0.5' : '1'}
              placeholder={`Enter ${getUnitLabel(currentTaskData.unit)}`}
              className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={addSelection}
              disabled={!quantity || parseFloat(quantity) <= 0}
              className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {selections.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Tasks</h3>
            <div className="space-y-4">
              {selections.map((selection, index) => {
                const taskData = handymanPricing[selection.category as keyof typeof handymanPricing][selection.task];
                const cost = taskData.rate * selection.quantity;

                return (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{selection.task}</h4>
                        <p className="text-sm text-gray-500">{selection.category}</p>
                      </div>
                      <button
                        onClick={() => removeSelection(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium text-gray-900">
                          {selection.quantity} {getUnitLabel(taskData.unit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium text-gray-900">
                          ${taskData.rate}/{getUnitLabel(taskData.unit)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Task Total:</span>
                        <span className="font-bold text-blue-600">
                          ${Math.round(cost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Labor Subtotal</span>
                <span className="font-medium text-gray-900">
                  ${Math.round(calculateTotal.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Project Management (12.5%)</span>
                <span className="font-medium text-gray-900">
                  ${Math.round(calculateTotal.projectManagement).toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Estimate</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${Math.round(calculateTotal.total).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This is a rough estimate based on standard labor rates. Actual costs may vary based on
                project complexity, site conditions, and contractor availability.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandymanCalculator;