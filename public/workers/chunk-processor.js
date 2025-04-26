/**
 * Web Worker for processing chunks of data
 * 
 * This worker receives chunks of data, processes them, and returns the results.
 * It can be used with the browserChunking.ts utility.
 */

// Handle messages from the main thread
self.onmessage = function(e) {
  const { action, chunk, chunkIndex, processorType } = e.data;
  
  if (action === 'process') {
    try {
      // Process the chunk based on processor type
      let result;
      
      switch (processorType) {
        case 'text':
          result = processTextChunk(chunk);
          break;
        case 'json':
          result = processJsonChunk(chunk);
          break;
        case 'binary':
          result = processBinaryChunk(chunk);
          break;
        default:
          // Default text processing
          result = processTextChunk(chunk);
      }
      
      // Send the result back to the main thread
      self.postMessage({ 
        chunkIndex, 
        result,
        success: true 
      });
    } catch (error) {
      // Send error back to the main thread
      self.postMessage({ 
        chunkIndex, 
        error: { 
          message: error.message, 
          stack: error.stack 
        },
        success: false
      });
    }
  }
};

/**
 * Process a text chunk
 */
function processTextChunk(chunk) {
  // Count words
  const words = chunk.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Count sentences
  const sentences = chunk.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Count paragraphs
  const paragraphs = chunk.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  // Calculate average word length
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = wordCount > 0 ? totalWordLength / wordCount : 0;
  
  // Calculate average sentence length
  const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Find most common words (top 10)
  const wordFrequency = {};
  for (const word of words) {
    const normalizedWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (normalizedWord.length > 3) { // Skip short words
      wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    }
  }
  
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
  
  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    averageWordLength,
    averageSentenceLength,
    topWords,
    // Include a sample of the first 100 characters
    sample: chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '')
  };
}

/**
 * Process a JSON chunk
 */
function processJsonChunk(chunk) {
  // Parse JSON if it's a string
  const data = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;
  
  // If it's an array, process each item
  if (Array.isArray(data)) {
    return {
      count: data.length,
      processed: data.map(item => {
        // Simple processing - extract keys and types
        if (typeof item === 'object' && item !== null) {
          return Object.entries(item).reduce((result, [key, value]) => {
            result[key] = typeof value;
            return result;
          }, {});
        }
        return typeof item;
      })
    };
  }
  
  // If it's an object, process its properties
  if (typeof data === 'object' && data !== null) {
    return {
      keys: Object.keys(data),
      types: Object.entries(data).reduce((result, [key, value]) => {
        result[key] = typeof value;
        return result;
      }, {})
    };
  }
  
  // For primitive types, return as is
  return { value: data, type: typeof data };
}

/**
 * Process a binary chunk (ArrayBuffer)
 */
function processBinaryChunk(chunk) {
  // Convert ArrayBuffer to Uint8Array for processing
  const data = new Uint8Array(chunk);
  
  // Calculate basic statistics
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / data.length;
  
  // Calculate min and max
  let min = 255;
  let max = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }
  
  // Calculate histogram (frequency of each byte value)
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    histogram[data[i]]++;
  }
  
  // Detect if this might be text
  const textChars = histogram[9] + histogram[10] + histogram[13] + 
                    histogram[32] + histogram[44] + histogram[46];
  const isProbablyText = textChars > data.length * 0.1;
  
  return {
    size: data.length,
    mean,
    min,
    max,
    histogram,
    isProbablyText
  };
}
