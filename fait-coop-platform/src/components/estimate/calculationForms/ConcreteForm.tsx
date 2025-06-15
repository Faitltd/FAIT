import React from 'react';
import { ConcreteCalculationParams } from '../../../types/estimate';

interface ConcreteFormProps {
  params: ConcreteCalculationParams;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ConcreteForm: React.FC<ConcreteFormProps> = ({ params, onChange }) => {
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
        <label htmlFor="psi" className="block text-sm font-medium text-gray-700">
          Concrete Strength (PSI)
        </label>
        <div className="mt-1">
          <select
            id="psi"
            name="psi"
            value={params.psi}
            onChange={onChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="2500">2,500 PSI (Light residential)</option>
            <option value="3000">3,000 PSI (Standard residential)</option>
            <option value="3500">3,500 PSI (Enhanced residential)</option>
            <option value="4000">4,000 PSI (Light commercial)</option>
            <option value="4500">4,500 PSI (Standard commercial)</option>
            <option value="5000">5,000 PSI (Heavy-duty)</option>
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
            <p className="text-gray-500">Add steel reinforcement (rebar or mesh) to the concrete</p>
          </div>
        </div>
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
                Concrete is typically ordered in cubic yards. This calculator will convert your measurements to the appropriate units.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcreteForm;
