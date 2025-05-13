import { useState, useEffect, useCallback } from 'react';
import { ApiClient, ApiError } from '@fait/api-client';

interface UseApiOptions<T> {
  initialData?: T;
  skip?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi<T>(
  apiClient: ApiClient,
  apiMethod: keyof ApiClient,
  args: any[] = [],
  options: UseApiOptions<T> = {}
) {
  const { initialData = null, skip = false, onSuccess, onError } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: !skip,
    error: null,
  });

  const execute = useCallback(
    async (executeArgs: any[] = args) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // @ts-ignore - We're using a dynamic method name
        const data = await apiClient[apiMethod](...executeArgs);
        setState({ data, loading: false, error: null });
        onSuccess?.(data);
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        setState({ data: null, loading: false, error: apiError });
        onError?.(apiError);
        throw apiError;
      }
    },
    [apiClient, apiMethod, onSuccess, onError]
  );

  useEffect(() => {
    if (!skip) {
      execute(args).catch(() => {
        // Error is already handled in the execute function
      });
    }
  }, [skip, execute, ...args]);

  return {
    ...state,
    execute,
    refetch: () => execute(args),
  };
}
