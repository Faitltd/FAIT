/**
 * Utility for dividing large inputs into manageable chunks and processing them
 */

interface ChunkProcessorOptions {
  /** Maximum size of each chunk in characters */
  maxChunkSize?: number;
  /** Whether to process chunks in parallel */
  parallel?: boolean;
  /** Delimiter to use for splitting (default is paragraph) */
  delimiter?: string | RegExp;
  /** Whether to preserve delimiters in the output */
  preserveDelimiters?: boolean;
  /** Optional callback for progress updates */
  onProgress?: (processed: number, total: number) => void;
}

/**
 * Divides text input into chunks based on logical boundaries
 */
export function splitIntoChunks(
  input: string,
  options: ChunkProcessorOptions = {}
): string[] {
  const {
    maxChunkSize = 5000,
    delimiter = /\n\s*\n/, // Default to paragraph breaks
    preserveDelimiters = true
  } = options;

  // If input is smaller than max chunk size, return as is
  if (input.length <= maxChunkSize) {
    return [input];
  }

  // Split by delimiter
  const parts = preserveDelimiters
    ? input.split(new RegExp(`(?<=${delimiter})`))
    : input.split(delimiter);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const part of parts) {
    // If adding this part would exceed max size and we already have content,
    // push current chunk and start a new one
    if (currentChunk.length + part.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = part;
    } 
    // If the part itself is larger than max size, we need to split it further
    else if (part.length > maxChunkSize) {
      // Push current chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      // Split large part by sentences or just characters if needed
      const subParts = splitLargePart(part, maxChunkSize);
      chunks.push(...subParts);
    } 
    // Otherwise, add to current chunk
    else {
      currentChunk += part;
    }
  }

  // Add the last chunk if not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Splits a large part that exceeds max chunk size
 */
function splitLargePart(part: string, maxChunkSize: number): string[] {
  // Try to split by sentences first
  const sentenceDelimiter = /[.!?]\s+/;
  const sentences = part.split(sentenceDelimiter);
  
  // If we have multiple sentences, try to group them
  if (sentences.length > 1) {
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const sentenceWithDelimiter = sentence + '. ';
      
      if (currentChunk.length + sentenceWithDelimiter.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = sentenceWithDelimiter;
      } else {
        currentChunk += sentenceWithDelimiter;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  // If we can't split by sentences, split by character
  const chunks: string[] = [];
  for (let i = 0; i < part.length; i += maxChunkSize) {
    chunks.push(part.substring(i, i + maxChunkSize));
  }
  
  return chunks;
}

/**
 * Process chunks sequentially
 */
export async function processSequentially<T, R>(
  chunks: T[],
  processor: (chunk: T, index: number) => Promise<R>,
  options: ChunkProcessorOptions = {}
): Promise<R[]> {
  const { onProgress } = options;
  const results: R[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const result = await processor(chunks[i], i);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }
  }
  
  return results;
}

/**
 * Process chunks in parallel
 */
export async function processInParallel<T, R>(
  chunks: T[],
  processor: (chunk: T, index: number) => Promise<R>,
  options: ChunkProcessorOptions = {}
): Promise<R[]> {
  const { onProgress } = options;
  let processed = 0;
  
  const promises = chunks.map(async (chunk, index) => {
    const result = await processor(chunk, index);
    
    if (onProgress) {
      processed++;
      onProgress(processed, chunks.length);
    }
    
    return result;
  });
  
  return Promise.all(promises);
}

/**
 * Main function to process large inputs by chunking
 */
export async function processLargeInput<R>(
  input: string,
  processor: (chunk: string, index: number) => Promise<R>,
  options: ChunkProcessorOptions = {}
): Promise<R[]> {
  const { parallel = false, onProgress } = options;
  
  // Split input into chunks
  const chunks = splitIntoChunks(input, options);
  
  // Process chunks
  if (parallel) {
    return processInParallel(chunks, processor, { onProgress });
  } else {
    return processSequentially(chunks, processor, { onProgress });
  }
}

/**
 * Merge results from chunk processing
 */
export function mergeResults<T>(results: T[], merger?: (results: T[]) => T): T {
  if (merger) {
    return merger(results);
  }
  
  // Default merger for string results
  if (results.length > 0 && typeof results[0] === 'string') {
    return results.join('') as unknown as T;
  }
  
  // For arrays, concatenate them
  if (results.length > 0 && Array.isArray(results[0])) {
    return results.flat() as unknown as T;
  }
  
  // For objects, merge them
  if (results.length > 0 && typeof results[0] === 'object' && results[0] !== null) {
    return Object.assign({}, ...results) as unknown as T;
  }
  
  // Default fallback
  return results[0];
}
