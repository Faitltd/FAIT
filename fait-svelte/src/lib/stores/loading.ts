import { writable } from 'svelte/store';

interface LoadingState {
  isLoading: boolean;
  message: string;
}

const createLoadingStore = () => {
  const { subscribe, update, set } = writable<LoadingState>({
    isLoading: false,
    message: ''
  });

  return {
    subscribe,
    show: (message = 'Loading...') => {
      update(() => ({
        isLoading: true,
        message
      }));
    },
    hide: () => {
      update(() => ({
        isLoading: false,
        message: ''
      }));
    },
    // Utility to wrap async functions with loading state
    withLoading: async <T>(
      promise: Promise<T>,
      message = 'Loading...'
    ): Promise<T> => {
      try {
        update(() => ({
          isLoading: true,
          message
        }));
        return await promise;
      } finally {
        update(() => ({
          isLoading: false,
          message: ''
        }));
      }
    }
  };
};

export const loading = createLoadingStore();
