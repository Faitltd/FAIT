import React from 'react';
import { RoofCalculationParams } from '../../../types/estimate';

interface RoofFormProps {
  params: RoofCalculationParams;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const RoofForm: React.FC<RoofFormProps> = ({ params, onChange }) => {
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
        <label htmlFor="pitch" className="block text-sm font-medium text-gray-700">
          Pitch (degrees)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="pitch"
            id="pitch"
            value={params.pitch}
            onChange={onChange}
            min="0"
            max="45"
            step="1"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Common roof pitches: 4/12 = 18.4°, 6/12 = 26.6°, 8/12 = 33.7°, 12/12 = 45°
        </p>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="overhang" className="block text-sm font-medium text-gray-700">
          Overhang (ft)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="overhang"
            id="overhang"
            value={params.overhang}
            onChange={onChange}
            min="0"
            step="0.1"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="sm:col-span-3">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Roof Type
        </label>
        <div className="mt-1">
          <select
            id="type"
            name="type"
            value={params.type}
            onChange={onChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="shingle">Asphalt Shingle</option>
            <option value="metal">Metal</option>
            <option value="tile">Tile</option>
            <option value="flat">Flat/Membrane</option>
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
    </div>
  );
};

export default RoofForm;
