import React from 'react';
import { FramingCalculationParams } from '../../../types/estimate';

interface FramingFormProps {
  params: FramingCalculationParams;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FramingForm: React.FC<FramingFormProps> = ({ params, onChange }) => {
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
        <label htmlFor="spacing" className="block text-sm font-medium text-gray-700">
          Stud Spacing (inches)
        </label>
        <div className="mt-1">
          <select
            id="spacing"
            name="spacing"
            value={params.spacing}
            onChange={onChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="12">12 inches on center</option>
            <option value="16">16 inches on center</option>
            <option value="19.2">19.2 inches on center</option>
            <option value="24">24 inches on center</option>
          </select>
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Lumber Size
        </label>
        <div className="mt-1">
          <select
            id="type"
            name="type"
            value={params.type}
            onChange={onChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="2x4">2x4</option>
            <option value="2x6">2x6</option>
            <option value="2x8">2x8</option>
            <option value="2x10">2x10</option>
            <option value="2x12">2x12</option>
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
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This calculator estimates the number of studs, plates, and total board feet needed for wall framing. It includes top and bottom plates and corner studs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FramingForm;
