import React, { useState, useEffect } from 'react';
import useChunkedProcessing from '../../hooks/useChunkedProcessing';

interface ChunkedProcessorProps<T, R> {
  /** Input data to process */
  input: string | any[];
  /** Function to process each chunk */
  processor: (chunk: string | any[], index: number) => Promise<R>;
  /** Function to render the processing UI */
  renderProcessing?: (state: {
    progress: number;
    processedChunks: number;
    totalChunks: number;
    cancel: () => void;
  }) => React.ReactNode;
  /** Function to render the result */
  renderResult: (result: T) => React.ReactNode;
  /** Function to render error state */
  renderError?: (error: Error, retry: () => void) => React.ReactNode;
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
  /** Callback when processing is complete */
  onComplete?: (result: T) => void;
  /** Callback when processing fails */
  onError?: (error: Error) => void;
}

/**
 * Component for processing large inputs in chunks with UI feedback
 */
function ChunkedProcessor<T, R = any>({
  input,
  processor,
  renderProcessing,
  renderResult,
  renderError,
  maxChunkSize = 5000,
  parallel = false,
  maxConcurrent = 4,
  chunkDelay = 0,
  mergeResults,
  autoStart = true,
  onComplete,
  onError,
}: ChunkedProcessorProps<T, R>) {
  const [isCancelled, setIsCancelled] = useState(false);

  const {
    isProcessing,
    progress,
    processedChunks,
    totalChunks,
    result,
    error,
    startProcessing,
    reset,
  } = useChunkedProcessing<T, R>(input, processor, {
    maxChunkSize,
    parallel,
    maxConcurrent,
    chunkDelay,
    mergeResults,
    autoStart,
  });

  // Handle completion
  useEffect(() => {
    if (!isProcessing && result && !error && !isCancelled && onComplete) {
      onComplete(result);
    }
  }, [isProcessing, result, error, isCancelled, onComplete]);

  // Handle error
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle cancellation
  const handleCancel = () => {
    setIsCancelled(true);
    reset();
  };

  // Handle retry
  const handleRetry = () => {
    setIsCancelled(false);
    reset();
    startProcessing();
  };

  // Default processing UI
  const defaultProcessingUI = (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600">
        Processing chunk {processedChunks} of {totalChunks} ({progress}%)
      </p>
      <button
        onClick={handleCancel}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Cancel
      </button>
    </div>
  );

  // Default error UI
  const defaultErrorUI = (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-red-600 mb-4">Error: {error?.message}</div>
      <button
        onClick={handleRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  if (isProcessing) {
    return renderProcessing
      ? renderProcessing({
          progress,
          processedChunks,
          totalChunks,
          cancel: handleCancel,
        })
      : defaultProcessingUI;
  }

  if (error) {
    return renderError ? renderError(error, handleRetry) : defaultErrorUI;
  }

  if (result) {
    return renderResult(result);
  }

  return null;
}

export default ChunkedProcessor;
