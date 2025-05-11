import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../utils/errorHandling';

interface UseFetchOptions<T> {
  initialData?: T;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  errorMessage?: string;
}

/**
 * A custom hook for data fetching with built-in error handling and loading states
 * @param fetchFn The async function to fetch data
 * @param options Options for the hook
 * @returns An object with data, loading state, error state, and refetch function
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
) {
  const {
    initialData,
    dependencies = [],
    onSuccess,
    onError,
    errorMessage = 'Failed to fetch data'
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const formattedError = handleApiError(err, 'useFetch', errorMessage);
      setError(formattedError);
      if (onError) onError(formattedError);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, errorMessage, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
