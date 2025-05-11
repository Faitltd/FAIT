/**
 * Utility for batch processing API calls and data operations
 */

interface BatchProcessorOptions<T> {
  /** Maximum batch size */
  batchSize?: number;
  /** Delay between batches in milliseconds */
  delayBetweenBatches?: number;
  /** Maximum number of retries for failed operations */
  maxRetries?: number;
  /** Whether to continue on error */
  continueOnError?: boolean;
  /** Function to determine if an item should be retried */
  shouldRetry?: (error: any, item: T, attemptNumber: number) => boolean;
  /** Progress callback */
  onProgress?: (processed: number, total: number, succeeded: number, failed: number) => void;
}

interface BatchResult<T, R> {
  /** Successful results */
  succeeded: { item: T; result: R }[];
  /** Failed items with errors */
  failed: { item: T; error: any; attempts: number }[];
  /** Total number of items processed */
  totalProcessed: number;
  /** Whether the batch processing completed successfully */
  completed: boolean;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Process items in batches
 */
export async function processBatches<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: BatchProcessorOptions<T> = {}
): Promise<BatchResult<T, R>> {
  const {
    batchSize = 10,
    delayBetweenBatches = 1000,
    maxRetries = 3,
    continueOnError = true,
    shouldRetry = () => true,
    onProgress
  } = options;

  const startTime = Date.now();
  const succeeded: { item: T; result: R }[] = [];
  const failed: { item: T; error: any; attempts: number }[] = [];
  let totalProcessed = 0;
  let completed = false;

  try {
    // Split items into batches
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchResults = await Promise.allSettled(
        batch.map(item => processWithRetry(item, processor, maxRetries, shouldRetry))
      );

      // Process batch results
      batchResults.forEach((result, index) => {
        const item = batch[index];
        
        if (result.status === 'fulfilled') {
          succeeded.push({ item, result: result.value.result });
        } else {
          const error = result.reason;
          const attempts = result.reason.attempts || 1;
          failed.push({ item, error, attempts });
          
          if (!continueOnError) {
            throw new Error(`Processing failed for item: ${JSON.stringify(item)}. Error: ${error}`);
          }
        }
        
        totalProcessed++;
        
        if (onProgress) {
          onProgress(totalProcessed, items.length, succeeded.length, failed.length);
        }
      });

      // Add delay between batches if not the last batch
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    completed = true;
  } catch (error) {
    console.error('Batch processing stopped due to error:', error);
    completed = false;
  }

  const executionTime = Date.now() - startTime;

  return {
    succeeded,
    failed,
    totalProcessed,
    completed,
    executionTime
  };
}

/**
 * Process a single item with retry logic
 */
async function processWithRetry<T, R>(
  item: T,
  processor: (item: T) => Promise<R>,
  maxRetries: number,
  shouldRetry: (error: any, item: T, attemptNumber: number) => boolean
): Promise<{ result: R; attempts: number }> {
  let attempts = 0;
  let lastError: any;

  while (attempts < maxRetries) {
    attempts++;
    
    try {
      const result = await processor(item);
      return { result, attempts };
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempts < maxRetries && shouldRetry(error, item, attempts)) {
        // Exponential backoff
        const backoffTime = Math.min(100 * Math.pow(2, attempts), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      break;
    }
  }

  // If we get here, all retries failed
  const enhancedError = new Error(`Failed after ${attempts} attempts: ${lastError?.message || 'Unknown error'}`);
  (enhancedError as any).originalError = lastError;
  (enhancedError as any).attempts = attempts;
  throw enhancedError;
}

/**
 * Split a large array into chunks and process each chunk
 */
export async function processLargeArray<T, R>(
  items: T[],
  processor: (items: T[]) => Promise<R[]>,
  options: BatchProcessorOptions<T[]> & { chunkSize?: number } = {}
): Promise<R[]> {
  const { chunkSize = 1000, ...batchOptions } = options;
  
  // Split into chunks
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  
  // Process chunks in batches
  const result = await processBatches(
    chunks,
    processor,
    batchOptions
  );
  
  // Combine results
  return result.succeeded.flatMap(item => item.result);
}

/**
 * Process a large dataset from a database or API with pagination
 */
export async function processLargeDataset<T, R>(
  fetcher: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  processor: (items: T[]) => Promise<R[]>,
  options: BatchProcessorOptions<T[]> & { pageSize?: number; maxPages?: number } = {}
): Promise<R[]> {
  const { pageSize = 100, maxPages = Infinity, ...batchOptions } = options;
  
  const allResults: R[] = [];
  let currentPage = 0;
  let hasMore = true;
  
  while (hasMore && currentPage < maxPages) {
    // Fetch page of data
    const { data, hasMore: moreData } = await fetcher(currentPage, pageSize);
    hasMore = moreData;
    
    if (data.length === 0) {
      break;
    }
    
    // Process this page
    const pageResults = await processor(data);
    allResults.push(...pageResults);
    
    currentPage++;
  }
  
  return allResults;
}
