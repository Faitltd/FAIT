/**
 * Utility for processing large files in chunks
 */

interface FileProcessorOptions {
  /** Chunk size in bytes */
  chunkSize?: number;
  /** Whether to process chunks in parallel */
  parallel?: boolean;
  /** Maximum number of parallel operations */
  maxParallel?: number;
  /** Progress callback */
  onProgress?: (processed: number, total: number) => void;
}

/**
 * Read a file in chunks
 */
export function readFileInChunks(
  file: File,
  options: FileProcessorOptions = {}
): Promise<ArrayBuffer[]> {
  const { chunkSize = 1024 * 1024, onProgress } = options; // Default 1MB chunks
  
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    const chunks: ArrayBuffer[] = [];
    let offset = 0;
    
    const readNextChunk = () => {
      const slice = file.slice(offset, offset + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };
    
    fileReader.onload = (e) => {
      if (e.target?.result) {
        chunks.push(e.target.result as ArrayBuffer);
        offset += chunkSize;
        
        if (onProgress) {
          onProgress(Math.min(offset, file.size), file.size);
        }
        
        if (offset < file.size) {
          readNextChunk();
        } else {
          resolve(chunks);
        }
      }
    };
    
    fileReader.onerror = (e) => {
      reject(new Error(`Error reading file: ${e}`));
    };
    
    readNextChunk();
  });
}

/**
 * Process a file in chunks
 */
export async function processFile<T>(
  file: File,
  processor: (chunk: ArrayBuffer, index: number) => Promise<T>,
  options: FileProcessorOptions = {}
): Promise<T[]> {
  const { parallel = false, maxParallel = 4, onProgress } = options;
  
  // Read file in chunks
  const chunks = await readFileInChunks(file, options);
  
  // Process chunks
  if (parallel) {
    // Process in parallel with concurrency limit
    const results: T[] = [];
    let processed = 0;
    
    // Process chunks in batches to limit concurrency
    for (let i = 0; i < chunks.length; i += maxParallel) {
      const batch = chunks.slice(i, i + maxParallel);
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const index = i + batchIndex;
        const result = await processor(chunk, index);
        
        if (onProgress) {
          processed++;
          onProgress(processed, chunks.length);
        }
        
        return { index, result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Ensure results are in the correct order
      batchResults.forEach(({ index, result }) => {
        results[index] = result;
      });
    }
    
    return results;
  } else {
    // Process sequentially
    const results: T[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const result = await processor(chunks[i], i);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, chunks.length);
      }
    }
    
    return results;
  }
}

/**
 * Read a text file in chunks
 */
export function readTextFileInChunks(
  file: File,
  options: FileProcessorOptions & { encoding?: string } = {}
): Promise<string[]> {
  const { encoding = 'utf-8', onProgress } = options;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const decoder = new TextDecoder(encoding);
    let offset = 0;
    const chunks: string[] = [];
    
    // Determine chunk size based on file size
    // For text files, we use line breaks as natural boundaries
    const chunkSize = Math.max(1024 * 64, Math.floor(file.size / 20)); // At least 64KB chunks
    
    const readNextChunk = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    
    reader.onload = (e) => {
      if (e.target?.result) {
        const chunk = decoder.decode(e.target.result as ArrayBuffer, { stream: true });
        chunks.push(chunk);
        offset += chunkSize;
        
        if (onProgress) {
          onProgress(Math.min(offset, file.size), file.size);
        }
        
        if (offset < file.size) {
          readNextChunk();
        } else {
          // Process the chunks to ensure they break at logical boundaries
          resolve(normalizeTextChunks(chunks));
        }
      }
    };
    
    reader.onerror = (e) => {
      reject(new Error(`Error reading file: ${e}`));
    };
    
    readNextChunk();
  });
}

/**
 * Normalize text chunks to break at logical boundaries
 */
function normalizeTextChunks(chunks: string[]): string[] {
  if (chunks.length <= 1) {
    return chunks;
  }
  
  const normalizedChunks: string[] = [];
  let currentChunk = chunks[0];
  
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // Find a logical boundary in the current chunk
    const lastNewlineIndex = currentChunk.lastIndexOf('\n');
    
    if (lastNewlineIndex !== -1 && lastNewlineIndex !== currentChunk.length - 1) {
      // Split at the last newline
      const firstPart = currentChunk.substring(0, lastNewlineIndex + 1);
      const secondPart = currentChunk.substring(lastNewlineIndex + 1);
      
      normalizedChunks.push(firstPart);
      currentChunk = secondPart + chunk;
    } else {
      // No good boundary found, just append
      currentChunk += chunk;
    }
  }
  
  // Add the last chunk
  if (currentChunk.length > 0) {
    normalizedChunks.push(currentChunk);
  }
  
  return normalizedChunks;
}

/**
 * Process a text file in chunks
 */
export async function processTextFile<T>(
  file: File,
  processor: (chunk: string, index: number) => Promise<T>,
  options: FileProcessorOptions & { encoding?: string } = {}
): Promise<T[]> {
  const { parallel = false, maxParallel = 4, onProgress } = options;
  
  // Read file in chunks
  const chunks = await readTextFileInChunks(file, options);
  
  // Process chunks
  if (parallel) {
    // Process in parallel with concurrency limit
    const results: T[] = [];
    let processed = 0;
    
    // Process chunks in batches to limit concurrency
    for (let i = 0; i < chunks.length; i += maxParallel) {
      const batch = chunks.slice(i, i + maxParallel);
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const index = i + batchIndex;
        const result = await processor(chunk, index);
        
        if (onProgress) {
          processed++;
          onProgress(processed, chunks.length);
        }
        
        return { index, result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Ensure results are in the correct order
      batchResults.forEach(({ index, result }) => {
        results[index] = result;
      });
    }
    
    return results;
  } else {
    // Process sequentially
    const results: T[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const result = await processor(chunks[i], i);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, chunks.length);
      }
    }
    
    return results;
  }
}
