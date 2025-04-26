# Chunking Utilities for Large Input Processing

This document provides an overview of the chunking utilities available in the FAIT Co-Op Platform for processing large inputs efficiently.

## Overview

The chunking utilities provide a way to process large inputs (text, files, arrays, etc.) by dividing them into smaller, manageable chunks. This approach offers several benefits:

- **Memory Efficiency**: Process large datasets without running out of memory
- **Responsiveness**: Keep the UI responsive by processing data in smaller chunks
- **Progress Tracking**: Show progress to users during long-running operations
- **Parallelization**: Process chunks in parallel for better performance
- **Error Resilience**: Handle errors in individual chunks without failing the entire operation

## Available Utilities

### 1. Core Chunking Utilities (`src/utils/chunkProcessor.ts`)

The core utilities for splitting and processing chunks:

```typescript
// Split text into chunks
const chunks = splitTextIntoChunks(largeText, { maxChunkSize: 5000 });

// Process chunks sequentially
const results = await processSequentially(chunks, async (chunk, index) => {
  // Process each chunk
  return processedChunk;
});

// Process chunks in parallel
const results = await processInParallel(chunks, async (chunk, index) => {
  // Process each chunk
  return processedChunk;
});

// Process a large input (text or array)
const results = await processLargeInput(largeInput, async (chunk, index) => {
  // Process each chunk
  return processedChunk;
}, {
  maxChunkSize: 5000,
  parallel: true,
  maxConcurrent: 4,
  onProgress: (processed, total) => {
    console.log(`Progress: ${processed}/${total}`);
  }
});

// Merge results
const finalResult = mergeResults(results);
```

### 2. Browser-Based Chunking (`src/utils/browserChunking.ts`)

Utilities optimized for browser environments, including Web Worker support:

```typescript
// Process a large string with Web Workers
const results = await processStringWithWorker(largeText, {
  maxChunkSize: 1024 * 1024, // 1MB
  concurrency: 4,
  workerUrl: '/workers/chunk-processor.js',
  onProgress: (processed, total) => {
    console.log(`Progress: ${processed}/${total}`);
  }
});

// Process a large file in chunks
const results = await processFileInChunks(file, async (chunk, index) => {
  // Process each chunk
  return processedChunk;
}, {
  maxChunkSize: 1024 * 1024 * 10, // 10MB
  concurrency: 4,
  onProgress: (processed, total) => {
    console.log(`Progress: ${processed}/${total}`);
  }
});

// Generate a self-executing chunked script
const script = generateChunkedScript(largeText, (chunk) => {
  // Process each chunk
  return processedChunk;
}, {
  maxChunkSize: 5000,
  onProgress: 'console.log(`Progress: ${processed}/${total}`)',
  onComplete: 'console.log("Processing complete:", results)'
});
```

### 3. React Hook (`src/hooks/useChunkedProcessing.ts`)

A React hook for processing large inputs with state management:

```tsx
function MyComponent() {
  const { 
    isProcessing, 
    progress, 
    result, 
    error, 
    startProcessing, 
    reset 
  } = useChunkedProcessing(
    largeInput,
    async (chunk, index) => {
      // Process each chunk
      return processedChunk;
    },
    {
      maxChunkSize: 5000,
      parallel: true,
      maxConcurrent: 4,
      autoStart: false
    }
  );

  return (
    <div>
      {isProcessing && <ProgressBar value={progress} />}
      {error && <ErrorMessage error={error} onRetry={reset} />}
      {result && <ResultDisplay result={result} />}
      <button onClick={startProcessing} disabled={isProcessing}>
        Start Processing
      </button>
    </div>
  );
}
```

### 4. React Component (`src/components/common/ChunkedProcessor.tsx`)

A ready-to-use React component for processing large inputs:

```tsx
function MyComponent() {
  return (
    <ChunkedProcessor
      input={largeInput}
      processor={async (chunk, index) => {
        // Process each chunk
        return processedChunk;
      }}
      useWorkers={true}
      workerUrl="/workers/chunk-processor.js"
      maxChunkSize={5000}
      parallel={true}
      maxConcurrent={4}
      renderResult={(result) => (
        <div>
          <h2>Processing Complete</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      renderProcessing={(progress) => (
        <div>
          <ProgressBar value={progress} />
          <p>Processing... {progress}%</p>
        </div>
      )}
      autoStart={true}
      onComplete={(result) => console.log('Processing complete:', result)}
    />
  );
}
```

### 5. Command-Line Script (`scripts/process-large-file.js`)

A Node.js script for processing large files:

```bash
node scripts/process-large-file.js \
  --input large-file.txt \
  --output results.json \
  --chunk-size 1048576 \
  --parallel \
  --max-parallel 4 \
  --processor scripts/sample-text-processor.js \
  --format json
```

## Web Worker

The platform includes a pre-configured Web Worker for chunk processing (`public/workers/chunk-processor.js`), which supports:

- Text processing
- JSON processing
- Binary data processing

## Best Practices

### 1. Choosing Chunk Size

- **Text Data**: 5,000-10,000 characters per chunk is usually a good balance
- **Binary Data**: 1-10 MB per chunk depending on the processing complexity
- **JSON/Objects**: 100-1,000 objects per chunk depending on object size

### 2. Preserving Logical Boundaries

The chunking utilities attempt to preserve logical boundaries:

- Text is split at paragraph boundaries when possible
- If paragraphs are too large, text is split at sentence boundaries
- Only as a last resort is text split at arbitrary character positions

### 3. Parallel vs. Sequential Processing

- **Parallel**: Better for CPU-intensive operations and when chunks are independent
- **Sequential**: Better for memory-intensive operations or when order matters

### 4. Error Handling

Always implement proper error handling for chunk processing:

```typescript
try {
  const results = await processLargeInput(largeInput, async (chunk, index) => {
    try {
      return await processChunk(chunk);
    } catch (error) {
      console.error(`Error processing chunk ${index}:`, error);
      return { error: error.message, chunkIndex: index };
    }
  });
} catch (error) {
  console.error('Fatal error in processing:', error);
}
```

### 5. Progress Reporting

Always provide progress feedback for long-running operations:

```typescript
const results = await processLargeInput(largeInput, processor, {
  onProgress: (processed, total) => {
    const percentage = Math.round((processed / total) * 100);
    updateProgressBar(percentage);
  }
});
```

## Implementation Examples

### Example 1: Processing a Large Text File

```typescript
import { processLargeInput } from '../utils/chunkProcessor';
import fs from 'fs';

async function processLargeTextFile(filePath) {
  // Read the file
  const text = fs.readFileSync(filePath, 'utf8');
  
  // Process the text in chunks
  const results = await processLargeInput(text, async (chunk) => {
    // Count words, sentences, etc.
    const words = chunk.split(/\s+/).filter(word => word.length > 0);
    const sentences = chunk.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length
    };
  }, {
    maxChunkSize: 10000,
    parallel: true,
    maxConcurrent: 4
  });
  
  // Merge results
  const totalWords = results.reduce((sum, result) => sum + result.wordCount, 0);
  const totalSentences = results.reduce((sum, result) => sum + result.sentenceCount, 0);
  
  return {
    totalWords,
    totalSentences,
    averageWordsPerSentence: totalWords / totalSentences
  };
}
```

### Example 2: Processing Large API Responses

```typescript
import { processLargeInput } from '../utils/chunkProcessor';

async function processLargeApiResponse(apiUrl) {
  // Fetch data
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  // Process the data in chunks
  const results = await processLargeInput(data, async (chunk) => {
    // Process each item in the chunk
    return chunk.map(item => ({
      id: item.id,
      processed: processItem(item)
    }));
  }, {
    maxChunkSize: 100, // 100 items per chunk
    parallel: true
  });
  
  // Flatten results
  return results.flat();
}
```

### Example 3: Using the React Hook in a Component

```tsx
import React, { useState } from 'react';
import useChunkedProcessing from '../hooks/useChunkedProcessing';

function TextAnalyzer() {
  const [text, setText] = useState('');
  
  const { 
    isProcessing, 
    progress, 
    result, 
    startProcessing 
  } = useChunkedProcessing(
    text,
    async (chunk) => {
      // Analyze text chunk
      const words = chunk.split(/\s+/).filter(word => word.length > 0);
      const wordFrequency = {};
      
      for (const word of words) {
        const normalized = word.toLowerCase().replace(/[^\w]/g, '');
        if (normalized) {
          wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
        }
      }
      
      return { wordFrequency };
    },
    { autoStart: false }
  );
  
  // Merge word frequencies from all chunks
  const mergedFrequency = result?.reduce((merged, chunkResult) => {
    for (const [word, count] of Object.entries(chunkResult.wordFrequency)) {
      merged[word] = (merged[word] || 0) + count;
    }
    return merged;
  }, {});
  
  // Get top 10 words
  const topWords = mergedFrequency 
    ? Object.entries(mergedFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    : [];
  
  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        rows={10} 
        cols={50}
      />
      
      <button onClick={startProcessing} disabled={isProcessing || !text}>
        Analyze Text
      </button>
      
      {isProcessing && (
        <div>
          <progress value={progress} max={100} />
          <p>Analyzing... {progress}%</p>
        </div>
      )}
      
      {topWords.length > 0 && (
        <div>
          <h3>Top 10 Words</h3>
          <ul>
            {topWords.map(([word, count]) => (
              <li key={word}>
                {word}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Conclusion

The chunking utilities provide a powerful way to process large inputs efficiently in both browser and Node.js environments. By breaking large tasks into smaller chunks, you can improve performance, provide better user feedback, and handle errors more gracefully.
