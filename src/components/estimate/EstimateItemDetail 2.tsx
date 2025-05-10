import React, { useState } from 'react';
import { EstimateItem, EstimateCalculation } from '../../types/estimate';
import { estimateService } from '../../services/EstimateService';

interface EstimateItemDetailProps {
  item: EstimateItem;
  onUpdate?: (updatedItem: EstimateItem) => void;
  onCalculate?: () => void;
  onClose?: () => void;
}

const EstimateItemDetail: React.FC<EstimateItemDetailProps> = ({ 
  item, 
  onUpdate,
  onCalculate,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<EstimateItem>(item);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'unit_cost') {
      // Update total_cost when quantity or unit_cost changes
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : editedItem.quantity;
      const unitCost = name === 'unit_cost' ? parseFloat(value) || 0 : editedItem.unit_cost;
      
      setEditedItem(prev => ({
        ...prev,
        [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
        total_cost: quantity * unitCost
      }));
    } else {
      setEditedItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedItem = await estimateService.updateItem(item.id, {
        name: editedItem.name,
        description: editedItem.description,
        quantity: editedItem.quantity,
        unit: editedItem.unit,
        unit_cost: editedItem.unit_cost,
        total_cost: editedItem.quantity * editedItem.unit_cost
      });
      
      onUpdate(updatedItem);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCalculationTypeName = (type?: string) => {
    if (!type) return 'None';
    
    switch (type) {
      case 'foundation':
        return 'Foundation';
      case 'wall':
        return 'Wall';
      case 'roof':
        return 'Roof';
      case 'floor':
        return 'Floor';
      case 'concrete':
        return 'Concrete';
      case 'framing':
        return 'Framing';
      case 'drywall':
        return 'Drywall';
      case 'paint':
        return 'Paint';
      case 'custom':
        return 'Custom';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const renderCalculationDetails = (calculation: EstimateCalculation) => {
    const { calculation_type, parameters, result } = calculation;
    
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          {getCalculationTypeName(calculation_type)} Calculation
        </h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="text-xs font-medium text-gray-500 mb-1">Parameters</h6>
            <ul className="text-xs text-gray-700 space-y-1">
              {Object.entries(parameters).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h6 className="text-xs font-medium text-gray-500 mb-1">Results</h6>
            <ul className="text-xs text-gray-700 space-y-1">
              {Object.entries(result).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {
                    typeof value === 'object' 
                      ? JSON.stringify(value) 
                      : value
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">Item Details</h4>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              {onUpdate && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
              )}
              {onCalculate && (
                <button
                  onClick={onCalculate}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Calculate
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedItem.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              ) : (
                <div className="text-sm text-gray-900">{item.name}</div>
              )}
            </dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1">
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedItem.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              ) : (
                <div className="text-sm text-gray-900">{item.description || 'No description'}</div>
              )}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Quantity</dt>
            <dd className="mt-1">
              {isEditing ? (
                <input
                  type="number"
                  name="quantity"
                  value={editedItem.quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              ) : (
                <div className="text-sm text-gray-900">{item.quantity}</div>
              )}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1">
              {isEditing ? (
                <input
                  type="text"
                  name="unit"
                  value={editedItem.unit}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              ) : (
                <div className="text-sm text-gray-900">{item.unit}</div>
              )}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit Cost</dt>
            <dd className="mt-1">
              {isEditing ? (
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="unit_cost"
                    value={editedItem.unit_cost}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-900">{formatCurrency(item.unit_cost)}</div>
              )}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1">
              <div className="text-sm text-gray-900 font-bold">{formatCurrency(isEditing ? editedItem.quantity * editedItem.unit_cost : item.total_cost)}</div>
            </dd>
          </div>
        </dl>
      </div>
      
      {/* Calculation Details */}
      {item.calculations && item.calculations.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Calculation Details</h5>
          
          {item.calculations.map((calculation) => (
            <div key={calculation.id}>
              {renderCalculationDetails(calculation)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstimateItemDetail;
