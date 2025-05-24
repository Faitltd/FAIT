import { useState, useCallback, useEffect } from 'react';
import { splitIntoChunks } from '../utils/chunkProcessor';

interface ChunkedProcessingOptions<T, R> {
  /** Maximum size of each chunk */
  maxChunkSize?: number;
  /** Whether to process chunks in parallel */
  parallel?: boolean;
  /** Maximum number of parallel operations */
  maxConcurrent?: number;
  /** Delay between processing chunks in ms */
  chunkDelay?: number;
  /** Function to merge results */
  mergeResults?: (results: R[]) => T;
  /** Whether to auto-start processing */
  autoStart?: boolean;
}

interface ChunkedProcessingState<T, R> {
  /** Whether processing is in progress */
  isProcessing: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Number of chunks processed */
  processedChunks: number;
  /** Total number of chunks */
  totalChunks: number;
  /** Processing results for each chunk */
  chunkResults: R[];
  /** Final merged result */
  result: T | null;
  /** Error if processing failed */
  error: Error | null;
}

/**
 * Hook for processing large inputs in chunks
 */
export function useChunkedProcessing<T, R = any>(
  input: string | any[],
  processor: (chunk: string | any[], index: number) => Promise<R>,
  options: ChunkedProcessingOptions<T, R> = {}
) {
  const {
    maxChunkSize = 5000,
    parallel = false,
    maxConcurrent = 4,
    chunkDelay = 0,
    mergeResults,
    autoStart = false,
  } = options;

  const [state, setState] = useState<ChunkedProcessingState<T, R>>({
    isProcessing: false,
    progress: 0,
    processedChunks: 0,
    totalChunks: 0,
    chunkResults: [],
    result: null,
    error: null,
  });

  // Split input into chunks
  const getChunks = useCallback(() => {
    if (typeof input === 'string') {
      return splitIntoChunks(input, { maxChunkSize });
    } else if (Array.isArray(input)) {
      const chunks: any[][] = [];
      for (let i = 0; i < input.length; i += maxChunkSize) {
        chunks.push(input.slice(i, i + maxChunkSize));
      }
      return chunks;
    }
    return [];
  }, [input, maxChunkSize]);

  // Process a single chunk
  const processChunk = useCallback(
    async (chunk: string | any[], index: number): Promise<R> => {
      try {
        return await processor(chunk, index);
      } catch (error) {
        console.error(`Error processing chunk ${index}:`, error);
        throw error;
      }
    },
    [processor]
  );

  // Process all chunks sequentially
  const processSequentially = useCallback(
    async (chunks: (string | any[])[]) => {
      const results: R[] = [];
      let processedCount = 0;

      for (let i = 0; i < chunks.length; i++) {
        try {
          const result = await processChunk(chunks[i], i);
          results.push(result);
          processedCount++;

          setState((prev) => ({
            ...prev,
            progress: Math.round((processedCount / chunks.length) * 100),
            processedChunks: processedCount,
            chunkResults: [...prev.chunkResults, result],
          }));

          if (chunkDelay > 0 && i < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, chunkDelay));
          }
        } catch (error) {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error : new Error(String(error)),
            isProcessing: false,
          }));
          return results;
        }
      }

      return results;
    },
    [processChunk, chunkDelay]
  );

  // Process chunks in parallel with concurrency limit
  const processInParallel = useCallback(
    async (chunks: (string | any[])[]) => {
      const results: R[] = new Array(chunks.length);
      let processedCount = 0;
      let activePromises = 0;
      let nextChunkIndex = 0;

      return new Promise<R[]>((resolve, reject) => {
        const processNextChunk = async () => {
          if (nextChunkIndex >= chunks.length) {
            if (activePromises === 0) {
              resolve(results);
            }
            return;
          }

          const chunkIndex = nextChunkIndex++;
          activePromises++;

          try {
            const result = await processChunk(chunks[chunkIndex], chunkIndex);
            results[chunkIndex] = result;
            processedCount++;
            activePromises--;

            setState((prev) => ({
              ...prev,
              progress: Math.round((processedCount / chunks.length) * 100),
              processedChunks: processedCount,
              chunkResults: [...prev.chunkResults.filter((_, i) => i !== chunkIndex), result],
            }));

            // Process next chunk
            processNextChunk();
          } catch (error) {
            activePromises--;
            setState((prev) => ({
              ...prev,
              error: error instanceof Error ? error : new Error(String(error)),
              isProcessing: false,
            }));
            reject(error);
          }
        };

        // Start initial batch of promises
        for (let i = 0; i < Math.min(maxConcurrent, chunks.length); i++) {
          processNextChunk();
        }
      });
    },
    [processChunk, maxConcurrent]
  );

  // Start processing
  const startProcessing = useCallback(async () => {
    try {
      const chunks = getChunks();
      if (chunks.length === 0) {
        setState({
          isProcessing: false,
          progress: 100,
          processedChunks: 0,
          totalChunks: 0,
          chunkResults: [],
          result: null,
          error: null,
        });
        return;
      }

      setState({
        isProcessing: true,
        progress: 0,
        processedChunks: 0,
        totalChunks: chunks.length,
        chunkResults: [],
        result: null,
        error: null,
      });

      // Process chunks
      const results = parallel
        ? await processInParallel(chunks)
        : await processSequentially(chunks);

      // Merge results
      let finalResult: T | null = null;
      if (mergeResults) {
        finalResult = mergeResults(results);
      } else if (typeof input === 'string' && results.every((r) => typeof r === 'string')) {
        // Default string merging
        finalResult = results.join('') as unknown as T;
      } else if (Array.isArray(input) && results.every(Array.isArray)) {
        // Default array merging
        finalResult = results.flat() as unknown as T;
      } else {
        finalResult = results[0] as unknown as T;
      }

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        result: finalResult,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, [getChunks, parallel, processInParallel, processSequentially, mergeResults, input]);

  // Reset processing state
  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      processedChunks: 0,
      totalChunks: 0,
      chunkResults: [],
      result: null,
      error: null,
    });
  }, []);

  // Auto-start processing if enabled
  useEffect(() => {
    if (autoStart && input && !state.isProcessing && !state.result && !state.error) {
      startProcessing();
    }
  }, [autoStart, input, startProcessing, state.isProcessing, state.result, state.error]);

  return {
    ...state,
    startProcessing,
    reset,
  };
}

export default useChunkedProcessing;
