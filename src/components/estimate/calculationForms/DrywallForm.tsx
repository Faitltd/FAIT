import React, { useState } from 'react';
import { DrywallCalculationParams } from '../../../types/estimate';

interface DrywallFormProps {
  params: DrywallCalculationParams;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const DrywallForm: React.FC<DrywallFormProps> = ({ params, onChange }) => {
  const [openingWidth, setOpeningWidth] = useState<string>('');
  const [openingHeight, setOpeningHeight] = useState<string>('');
  
  const addOpening = () => {
    const width = parseFloat(openingWidth);
    const height = parseFloat(openingHeight);
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return;
    }
    
    const newOpenings = [...params.openings || [], { width, height }];
    
    // Create a synthetic event to update the parent
    const syntheticEvent = {
      target: {
        name: 'openings',
        value: newOpenings
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    setOpeningWidth('');
    setOpeningHeight('');
  };
  
  const removeOpening = (index: number) => {
    const newOpenings = [...params.openings || []];
    newOpenings.splice(index, 1);
    
    // Create a synthetic event to update the parent
    const syntheticEvent = {
      target: {
        name: 'openings',
        value: newOpenings
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };
  
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <div className="sm:col-span-3">
        <label htmlFor="length" className="block text-sm font-medium text-gray-700">
          Wall Length (ft)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="length"
            id="length"
            value={params.length}
            onChange={onChange}
            min="0"
            step="0.01"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="height" className="block text-sm font-medium text-gray-700">
          Wall Height (ft)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="height"
            id="height"
            value={params.height}
            onChange={onChange}
            min="0"
            step="0.01"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="thickness" className="block text-sm font-medium text-gray-700">
          Drywall Thickness
        </label>
        <div className="mt-1">
          <select
            id="thickness"
            name="thickness"
            value={params.thickness}
            onChange={onChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="1/4">1/4 inch</option>
            <option value="3/8">3/8 inch</option>
            <option value="1/2">1/2 inch</option>
            <option value="5/8">5/8 inch (fire-rated)</option>
          </select>
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="wastage" className="block text-sm font-medium text-gray-700">
          Wastage (%)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="wastage"
            id="wastage"
            value={params.wastage}
            onChange={onChange}
            min="0"
            max="100"
            step="1"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      {/* Openings (doors, windows, etc.) */}
      <div className="sm:col-span-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Openings (doors, windows, etc.)</h4>
        
        <div className="flex space-x-2 mb-2">
          <div>
            <label htmlFor="opening-width" className="block text-xs font-medium text-gray-500">
              Width (ft)
            </label>
            <input
              type="number"
              id="opening-width"
              value={openingWidth}
              onChange={(e) => setOpeningWidth(e.target.value)}
              min="0"
              step="0.01"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="opening-height" className="block text-xs font-medium text-gray-500">
              Height (ft)
            </label>
            <input
              type="number"
              id="opening-height"
              value={openingHeight}
              onChange={(e) => setOpeningHeight(e.target.value)}
              min="0"
              step="0.01"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={addOpening}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>
        
        {params.openings && params.openings.length > 0 ? (
          <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
            {params.openings.map((opening, index) => (
              <li key={index} className="px-3 py-2 flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  {opening.width} ft × {opening.height} ft ({(opening.width * opening.height).toFixed(2)} sq ft)
                </span>
                <button
                  type="button"
                  onClick={() => removeOpening(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No openings added yet</p>
        )}
      </div>
      
      <div className="sm:col-span-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This calculator estimates the number of drywall sheets (4' x 8'), joint compound, tape, and screws needed for the wall area.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrywallForm;
