import React, { useState } from 'react';
import { useEstimation } from '../../hooks/useEstimation';
import { HandymanTaskEstimate, TaskType } from '../../types/estimation';
import { Button } from '../../../core/components/ui/Button';
import { LoadingSpinner } from '../../../core/components/common/LoadingSpinner';

export interface HandymanEstimatorProps {
  onEstimateGenerated?: (estimate: HandymanTaskEstimate) => void;
  onEstimateSaved?: (estimate: HandymanTaskEstimate) => void;
}

/**
 * HandymanEstimator component for estimating handyman tasks
 */
export const HandymanEstimator: React.FC<HandymanEstimatorProps> = ({
  onEstimateGenerated,
  onEstimateSaved,
}) => {
  const {
    handymanEstimate,
    isLoading,
    error,
    calculateHandymanTaskEstimate,
    saveHandymanTaskEstimate,
    resetEstimates,
  } = useEstimation();

  const [taskType, setTaskType] = useState<TaskType>(TaskType.PLUMBING);
  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [estimatedHours, setEstimatedHours] = useState<number>(2);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get task type label
  const getTaskTypeLabel = (type: TaskType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Handle calculate estimate
  const handleCalculateEstimate = async () => {
    try {
      const estimate = await calculateHandymanTaskEstimate(
        taskType,
        description,
        quantity,
        estimatedHours
      );
      
      onEstimateGenerated?.(estimate);
    } catch (err) {
      console.error('Error calculating estimate:', err);
    }
  };

  // Handle save estimate
  const handleSaveEstimate = async () => {
    if (!handymanEstimate) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const savedEstimate = await saveHandymanTaskEstimate(handymanEstimate);
      onEstimateSaved?.(savedEstimate);
    } catch (err) {
      console.error('Error saving estimate:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save estimate');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setTaskType(TaskType.PLUMBING);
    setDescription('');
    setQuantity(1);
    setEstimatedHours(2);
    resetEstimates();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Handyman Task Estimator</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {saveError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error saving estimate: {saveError}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
          Task Type
        </label>
        <select
          id="taskType"
          value={taskType}
          onChange={(e) => setTaskType(e.target.value as TaskType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {Object.values(TaskType).map((type) => (
            <option key={type} value={type}>
              {getTaskTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Task Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the task in detail..."
          disabled={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity: {quantity}
          </label>
          <input
            type="range"
            id="quantity"
            min="1"
            max="10"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Hours: {estimatedHours}
          </label>
          <input
            type="range"
            id="estimatedHours"
            min="0.5"
            max="8"
            step="0.5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
            className="w-full"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <Button
          onClick={handleCalculateEstimate}
          disabled={isLoading || !description.trim()}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Calculate Estimate'}
        </Button>
      </div>
      
      {handymanEstimate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Estimate Summary</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-gray-600">Task Type:</div>
            <div className="capitalize">{getTaskTypeLabel(handymanEstimate.taskType)}</div>
            
            <div className="text-gray-600">Description:</div>
            <div>{handymanEstimate.description}</div>
            
            <div className="text-gray-600">Quantity:</div>
            <div>{handymanEstimate.quantity}</div>
            
            <div className="text-gray-600">Estimated Hours:</div>
            <div>{handymanEstimate.estimatedHours}</div>
          </div>
          
          <h4 className="font-medium mb-2">Cost Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-gray-600">Hourly Rate:</div>
            <div>{formatCurrency(handymanEstimate.hourlyRate)}</div>
            
            <div className="text-gray-600">Labor Cost:</div>
            <div>{formatCurrency(handymanEstimate.hourlyRate * handymanEstimate.estimatedHours)}</div>
            
            <div className="text-gray-600">Materials Cost:</div>
            <div>{formatCurrency(handymanEstimate.materialsCost)}</div>
          </div>
          
          <div className="border-t pt-2 flex justify-between items-center">
            <div className="text-lg font-bold">Total Estimate:</div>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(handymanEstimate.totalCost)}</div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSaveEstimate} disabled={isSaving}>
              {isSaving ? <LoadingSpinner size="sm" /> : 'Save Estimate'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
