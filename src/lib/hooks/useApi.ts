import { useState, useCallback } from 'react';
import { ApiError } from '../api';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T, P extends any[]> extends UseApiState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * A hook to handle API calls with loading and error states
 * @param apiFunction The API function to call
 * @param options Options for success and error callbacks
 * @returns An object with data, loading state, error state, and execute function
 */
export function useApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await apiFunction(...params);
        setState({ data, isLoading: false, error: null });
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        const apiError = error instanceof ApiError 
          ? error 
          : new ApiError(error instanceof Error ? error.message : 'An unknown error occurred');
        setState({ data: null, isLoading: false, error: apiError });
        options.onError?.(apiError);
        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useApi;
