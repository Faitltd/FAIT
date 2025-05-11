/**
 * Browser-based utilities for processing large inputs in chunks
 * This is optimized for client-side use with Web Workers
 */

interface ChunkingOptions {
  /** Maximum chunk size in bytes or characters */
  maxChunkSize?: number;
  /** Number of chunks to process in parallel */
  concurrency?: number;
  /** Progress callback */
  onProgress?: (processed: number, total: number) => void;
  /** Whether to use Web Workers for processing */
  useWorkers?: boolean;
  /** URL to the worker script */
  workerUrl?: string;
}

/**
 * Process a large string in chunks using a worker
 */
export async function processStringWithWorker(
  input: string,
  options: ChunkingOptions = {}
): Promise<any[]> {
  const {
    maxChunkSize = 1024 * 1024, // 1MB
    concurrency = navigator.hardwareConcurrency || 4,
    onProgress,
    workerUrl = '/workers/chunk-processor.js'
  } = options;
  
  return new Promise((resolve, reject) => {
    try {
      // Split the input into chunks
      const chunks = splitStringIntoChunks(input, maxChunkSize);
      const totalChunks = chunks.length;
      let processedChunks = 0;
      const results: any[] = new Array(totalChunks);
      let activeWorkers = 0;
      let nextChunkIndex = 0;
      const workers: Worker[] = [];
      
      // Create worker pool
      const createWorker = () => {
        const worker = new Worker(workerUrl);
        
        worker.onmessage = (e) => {
          const { chunkIndex, result } = e.data;
          
          // Store the result
          results[chunkIndex] = result;
          processedChunks++;
          
          // Report progress
          if (onProgress) {
            onProgress(processedChunks, totalChunks);
          }
          
          // Process next chunk or finish
          if (nextChunkIndex < totalChunks) {
            const nextChunk = chunks[nextChunkIndex];
            worker.postMessage({ 
              action: 'process', 
              chunk: nextChunk, 
              chunkIndex: nextChunkIndex++ 
            });
          } else {
            worker.terminate();
            activeWorkers--;
            
            // If all workers are done, resolve the promise
            if (activeWorkers === 0) {
              resolve(results);
            }
          }
        };
        
        worker.onerror = (error) => {
          console.error('Worker error:', error);
          worker.terminate();
          activeWorkers--;
          reject(error);
        };
        
        workers.push(worker);
        return worker;
      };
      
      // Start workers
      const workerCount = Math.min(concurrency, totalChunks);
      for (let i = 0; i < workerCount; i++) {
        const worker = createWorker();
        activeWorkers++;
        
        if (nextChunkIndex < totalChunks) {
          const chunk = chunks[nextChunkIndex];
          worker.postMessage({ 
            action: 'process', 
            chunk, 
            chunkIndex: nextChunkIndex++ 
          });
        }
      }
      
      // Handle the case where there are no chunks
      if (totalChunks === 0) {
        resolve([]);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Process a large file in chunks
 */
export async function processFileInChunks(
  file: File,
  processor: (chunk: ArrayBuffer, chunkIndex: number) => Promise<any>,
  options: ChunkingOptions = {}
): Promise<any[]> {
  const {
    maxChunkSize = 1024 * 1024 * 10, // 10MB
    concurrency = navigator.hardwareConcurrency || 4,
    onProgress
  } = options;
  
  return new Promise((resolve, reject) => {
    try {
      // Calculate total chunks
      const totalChunks = Math.ceil(file.size / maxChunkSize);
      let processedChunks = 0;
      const results: any[] = new Array(totalChunks);
      let activeReaders = 0;
      let nextChunkIndex = 0;
      
      // Function to read and process a chunk
      const processNextChunk = () => {
        if (nextChunkIndex >= totalChunks) {
          return;
        }
        
        const chunkIndex = nextChunkIndex++;
        const start = chunkIndex * maxChunkSize;
        const end = Math.min(start + maxChunkSize, file.size);
        
        activeReaders++;
        
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const chunk = e.target?.result as ArrayBuffer;
            const result = await processor(chunk, chunkIndex);
            
            results[chunkIndex] = result;
            processedChunks++;
            
            if (onProgress) {
              onProgress(processedChunks, totalChunks);
            }
            
            activeReaders--;
            
            // Process next chunk or finish
            if (nextChunkIndex < totalChunks) {
              processNextChunk();
            } else if (activeReaders === 0) {
              resolve(results);
            }
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          activeReaders--;
          reject(error);
        };
        
        const blob = file.slice(start, end);
        reader.readAsArrayBuffer(blob);
      };
      
      // Start initial readers
      for (let i = 0; i < Math.min(concurrency, totalChunks); i++) {
        processNextChunk();
      }
      
      // Handle the case where there are no chunks
      if (totalChunks === 0) {
        resolve([]);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Split a string into chunks preserving logical boundaries
 */
function splitStringIntoChunks(input: string, maxChunkSize: number): string[] {
  // If input is small enough, return as is
  if (input.length <= maxChunkSize) {
    return [input];
  }
  
  // Try to split by paragraphs
  const paragraphDelimiter = /\n\s*\n/;
  const paragraphs = input.split(paragraphDelimiter);
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed max size and we already have content,
    // push current chunk and start a new one
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } 
    // If the paragraph itself is larger than max size, split it further
    else if (paragraph.length > maxChunkSize) {
      // Push current chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      // Try to split by sentences
      const sentenceDelimiter = /[.!?]\s+/;
      const sentences = paragraph.split(sentenceDelimiter);
      
      if (sentences.length > 1) {
        let sentenceChunk = '';
        
        for (const sentence of sentences) {
          const sentenceWithDelimiter = sentence + '. ';
          
          if (sentenceChunk.length + sentenceWithDelimiter.length > maxChunkSize && sentenceChunk.length > 0) {
            chunks.push(sentenceChunk);
            sentenceChunk = sentenceWithDelimiter;
          } else {
            sentenceChunk += sentenceWithDelimiter;
          }
        }
        
        if (sentenceChunk.length > 0) {
          currentChunk = sentenceChunk;
        }
      } else {
        // If we can't split by sentences, split by character
        for (let i = 0; i < paragraph.length; i += maxChunkSize) {
          chunks.push(paragraph.substring(i, i + maxChunkSize));
        }
      }
    } 
    // Otherwise, add to current chunk
    else {
      currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk if not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Create a Web Worker for chunk processing
 */
export function createChunkProcessorWorker(processorFn: (chunk: any) => any): Worker {
  const workerCode = `
    // Worker for processing chunks
    self.onmessage = function(e) {
      const { action, chunk, chunkIndex } = e.data;
      
      if (action === 'process') {
        try {
          // Process the chunk
          const processorFn = ${processorFn.toString()};
          const result = processorFn(chunk);
          
          // Send the result back
          self.postMessage({ chunkIndex, result });
        } catch (error) {
          self.postMessage({ 
            chunkIndex, 
            error: { message: error.message, stack: error.stack } 
          });
        }
      }
    };
  `;
  
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  
  // Clean up the URL when the worker is terminated
  worker.addEventListener('message', () => {
    URL.revokeObjectURL(url);
  }, { once: true });
  
  return worker;
}

/**
 * Generate a self-executing chunked script
 */
export function generateChunkedScript(
  input: string,
  processorFn: (chunk: string) => any,
  options: {
    maxChunkSize?: number;
    onProgress?: string;
    onComplete?: string;
  } = {}
): string {
  const {
    maxChunkSize = 5000,
    onProgress = 'console.log(`Processing: ${Math.round(processed / total * 100)}%`)',
    onComplete = 'console.log("Processing complete:", results)'
  } = options;
  
  // Split the input into chunks
  const chunks = splitStringIntoChunks(input, maxChunkSize);
  const chunksJSON = JSON.stringify(chunks);
  
  // Create the self-executing script
  return `
// Self-executing chunked script
(function() {
  // Processor function
  const processorFn = ${processorFn.toString()};
  
  // Input chunks
  const chunks = ${chunksJSON};
  const total = chunks.length;
  let processed = 0;
  const results = [];
  
  // Process chunks sequentially
  function processNextChunk(index) {
    if (index >= chunks.length) {
      // All chunks processed
      ${onComplete};
      return;
    }
    
    try {
      // Process the chunk
      const result = processorFn(chunks[index]);
      results.push(result);
      processed++;
      
      // Report progress
      ${onProgress};
      
      // Process next chunk (use setTimeout to avoid blocking UI)
      setTimeout(() => processNextChunk(index + 1), 0);
    } catch (error) {
      console.error(\`Error processing chunk \${index}:\`, error);
      // Continue with next chunk
      setTimeout(() => processNextChunk(index + 1), 0);
    }
  }
  
  // Start processing
  processNextChunk(0);
})();
  `;
}
