import { useState, useCallback } from 'react';
import { estimationService } from '../services/estimationService';
import { 
  RemodelingEstimate, 
  HandymanTaskEstimate,
  RoomType,
  QualityLevel,
  TaskType
} from '../types/estimation';

interface UseEstimationResult {
  remodelingEstimate: RemodelingEstimate | null;
  handymanEstimate: HandymanTaskEstimate | null;
  isLoading: boolean;
  error: string | null;
  calculateRemodelingEstimate: (
    roomType: RoomType,
    squareFootage: number,
    quality: QualityLevel,
    includeDemolition: boolean,
    includePermits: boolean
  ) => Promise<RemodelingEstimate>;
  saveRemodelingEstimate: (estimate: RemodelingEstimate) => Promise<RemodelingEstimate>;
  calculateHandymanTaskEstimate: (
    taskType: TaskType,
    description: string,
    quantity: number,
    estimatedHours: number
  ) => Promise<HandymanTaskEstimate>;
  saveHandymanTaskEstimate: (estimate: HandymanTaskEstimate) => Promise<HandymanTaskEstimate>;
  resetEstimates: () => void;
}

/**
 * Hook for managing estimates
 */
export function useEstimation(): UseEstimationResult {
  const [remodelingEstimate, setRemodelingEstimate] = useState<RemodelingEstimate | null>(null);
  const [handymanEstimate, setHandymanEstimate] = useState<HandymanTaskEstimate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRemodelingEstimate = useCallback(
    async (
      roomType: RoomType,
      squareFootage: number,
      quality: QualityLevel,
      includeDemolition: boolean,
      includePermits: boolean
    ): Promise<RemodelingEstimate> => {
      setIsLoading(true);
      setError(null);

      try {
        const estimate = await estimationService.calculateRemodelingEstimate(
          roomType,
          squareFootage,
          quality,
          includeDemolition,
          includePermits
        );
        
        setRemodelingEstimate(estimate);
        return estimate;
      } catch (err) {
        console.error('Error calculating remodeling estimate:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate remodeling estimate');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const saveRemodelingEstimate = useCallback(
    async (estimate: RemodelingEstimate): Promise<RemodelingEstimate> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await estimationService.saveRemodelingEstimate(estimate);
        return response.data;
      } catch (err) {
        console.error('Error saving remodeling estimate:', err);
        setError(err instanceof Error ? err.message : 'Failed to save remodeling estimate');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const calculateHandymanTaskEstimate = useCallback(
    async (
      taskType: TaskType,
      description: string,
      quantity: number,
      estimatedHours: number
    ): Promise<HandymanTaskEstimate> => {
      setIsLoading(true);
      setError(null);

      try {
        const estimate = await estimationService.calculateHandymanTaskEstimate(
          taskType,
          description,
          quantity,
          estimatedHours
        );
        
        setHandymanEstimate(estimate);
        return estimate;
      } catch (err) {
        console.error('Error calculating handyman task estimate:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate handyman task estimate');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const saveHandymanTaskEstimate = useCallback(
    async (estimate: HandymanTaskEstimate): Promise<HandymanTaskEstimate> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await estimationService.saveHandymanTaskEstimate(estimate);
        return response.data;
      } catch (err) {
        console.error('Error saving handyman task estimate:', err);
        setError(err instanceof Error ? err.message : 'Failed to save handyman task estimate');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetEstimates = useCallback(() => {
    setRemodelingEstimate(null);
    setHandymanEstimate(null);
    setError(null);
  }, []);

  return {
    remodelingEstimate,
    handymanEstimate,
    isLoading,
    error,
    calculateRemodelingEstimate,
    saveRemodelingEstimate,
    calculateHandymanTaskEstimate,
    saveHandymanTaskEstimate,
    resetEstimates,
  };
}
