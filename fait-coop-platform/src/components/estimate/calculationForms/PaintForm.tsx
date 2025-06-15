import React from 'react';
import { PaintCalculationParams } from '../../../types/estimate';

interface PaintFormProps {
  params: PaintCalculationParams;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PaintForm: React.FC<PaintFormProps> = ({ params, onChange }) => {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <div className="sm:col-span-3">
        <label htmlFor="area" className="block text-sm font-medium text-gray-700">
          Surface Area (sq ft)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="area"
            id="area"
            value={params.area}
            onChange={onChange}
            min="0"
            step="0.01"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="coats" className="block text-sm font-medium text-gray-700">
          Number of Coats
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="coats"
            id="coats"
            value={params.coats}
            onChange={onChange}
            min="1"
            max="5"
            step="1"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Paint Type
        </label>
        <div className="mt-1">
          <select
            id="type"
            name="type"
            value={params.type}
            onChange={onChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
            <option value="primer">Primer</option>
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This calculator estimates the amount of paint needed in gallons. One gallon typically covers 350-400 square feet, depending on the surface and paint type.
              </p>
            </div>
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
                To calculate wall area: Measure the perimeter of the room (in feet) and multiply by the ceiling height. Then subtract the area of doors and windows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintForm;
