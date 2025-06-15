import React from 'react';
import { CustomCalculationParams } from '../../../types/estimate';

interface CustomFormProps {
  params: CustomCalculationParams;
  variables: { name: string; value: number }[];
  onFormulaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVariableChange: (index: number, field: 'name' | 'value', value: string) => void;
  onAddVariable: () => void;
  onRemoveVariable: (index: number) => void;
}

const CustomForm: React.FC<CustomFormProps> = ({ 
  params, 
  variables, 
  onFormulaChange, 
  onVariableChange, 
  onAddVariable, 
  onRemoveVariable 
}) => {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <div className="sm:col-span-6">
        <label htmlFor="formula" className="block text-sm font-medium text-gray-700">
          Formula
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="formula"
            id="formula"
            value={params.formula}
            onChange={onFormulaChange}
            placeholder="e.g., x * y + z"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Use JavaScript syntax. Available operators: +, -, *, /, **, Math.sqrt(), Math.pow(), etc.
        </p>
      </div>
      
      <div className="sm:col-span-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">Variables</h4>
          <button
            type="button"
            onClick={onAddVariable}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Variable
          </button>
        </div>
        
        {variables.length > 0 ? (
          <div className="space-y-2">
            {variables.map((variable, index) => (
              <div key={index} className="flex space-x-2 items-center">
                <div className="w-1/3">
                  <label htmlFor={`var-name-${index}`} className="sr-only">Variable Name</label>
                  <input
                    type="text"
                    id={`var-name-${index}`}
                    value={variable.name}
                    onChange={(e) => onVariableChange(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div className="w-1/3">
                  <label htmlFor={`var-value-${index}`} className="sr-only">Variable Value</label>
                  <input
                    type="number"
                    id={`var-value-${index}`}
                    value={variable.value}
                    onChange={(e) => onVariableChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    step="0.01"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveVariable(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No variables added yet</p>
        )}
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
                The custom calculator allows you to create your own formula using JavaScript syntax. Define variables and use them in your formula to calculate the result.
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
                Example: To calculate the area of a circle, use the formula <code>Math.PI * Math.pow(radius, 2)</code> with a variable named <code>radius</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomForm;
