import React from 'react';
import { FoundationCalculationParams } from '../../../types/estimate';

interface FoundationFormProps {
  params: FoundationCalculationParams;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FoundationForm: React.FC<FoundationFormProps> = ({ params, onChange }) => {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <div className="sm:col-span-3">
        <label htmlFor="length" className="block text-sm font-medium text-gray-700">
          Length (ft)
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
        <label htmlFor="width" className="block text-sm font-medium text-gray-700">
          Width (ft)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="width"
            id="width"
            value={params.width}
            onChange={onChange}
            min="0"
            step="0.01"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="depth" className="block text-sm font-medium text-gray-700">
          Depth (inches)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="depth"
            id="depth"
            value={params.depth}
            onChange={onChange}
            min="0"
            step="0.5"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="thickness" className="block text-sm font-medium text-gray-700">
          Thickness (inches)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="thickness"
            id="thickness"
            value={params.thickness}
            onChange={onChange}
            min="0"
            step="0.5"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Foundation Type
        </label>
        <div className="mt-1">
          <select
            id="type"
            name="type"
            value={params.type}
            onChange={onChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="slab">Slab</option>
            <option value="crawlspace">Crawlspace</option>
            <option value="basement">Basement</option>
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
      
      <div className="sm:col-span-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="reinforcement"
              name="reinforcement"
              type="checkbox"
              checked={params.reinforcement}
              onChange={onChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="reinforcement" className="font-medium text-gray-700">
              Include Reinforcement
            </label>
            <p className="text-gray-500">Add steel reinforcement (rebar or mesh) to the foundation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationForm;
