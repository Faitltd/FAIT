# Chunked Processing Utilities

This document provides an overview of the chunked processing utilities in the FAIT Co-Op Platform.

## Overview

The chunked processing utilities provide a way to process large inputs (text, files, arrays, etc.) in smaller, manageable chunks. This is useful for:

- Processing large files without running out of memory
- Handling large API requests by breaking them into smaller chunks
- Improving UI responsiveness when processing large datasets
- Enabling progress tracking for long-running operations

## Available Utilities

### 1. Chunk Processor (`src/utils/chunkProcessor.ts`)

Divides text or array inputs into logical chunks and processes them sequentially or in parallel.

```typescript
import { processLargeInput, splitIntoChunks } from '../utils/chunkProcessor';

// Process a large text input
const results = await processLargeInput(
  largeTextInput,
  async (chunk, index) => {
    // Process each chunk
    return processedChunk;
  },
  {
    maxChunkSize: 5000,
    parallel: false,
    onProgress: (processed, total) => {
      console.log(`Processed ${processed}/${total} chunks`);
    }
  }
);
```

### 2. Batch Processor (`src/utils/batchProcessor.ts`)

Processes arrays of items in batches, with support for retries and error handling.

```typescript
import { processBatches } from '../utils/batchProcessor';

// Process items in batches
const result = await processBatches(
  items,
  async (item) => {
    // Process each item
    return processedItem;
  },
  {
    batchSize: 10,
    delayBetweenBatches: 1000,
    maxRetries: 3,
    onProgress: (processed, total, succeeded, failed) => {
      console.log(`Processed ${processed}/${total} items (${succeeded} succeeded, ${failed} failed)`);
    }
  }
);
```

### 3. File Processor (`src/utils/fileProcessor.ts`)

Reads and processes large files in chunks.

```typescript
import { processTextFile } from '../utils/fileProcessor';

// Process a large text file
const results = await processTextFile(
  file,
  async (chunk, index) => {
    // Process each chunk
    return processedChunk;
  },
  {
    encoding: 'utf-8',
    parallel: true,
    maxParallel: 4,
    onProgress: (processed, total) => {
      console.log(`Processed ${processed}/${total} chunks`);
    }
  }
);
```

### 4. Chunked API Request (`src/utils/chunkedApiRequest.ts`)

Makes API requests with large payloads by breaking them into smaller chunks.

```typescript
import { chunkedApiRequest, chunkedFileUpload } from '../utils/chunkedApiRequest';

// Make a chunked API request
const response = await chunkedApiRequest(
  'https://api.example.com/data',
  largePayload,
  {
    maxChunkSize: 1024 * 1024, // 1MB
    onProgress: (sent, total) => {
      console.log(`Sent ${sent}/${total} bytes`);
    }
  }
);

// Upload a large file in chunks
const uploadResponse = await chunkedFileUpload(
  'https://api.example.com/upload',
  file,
  {
    maxChunkSize: 1024 * 1024 * 5, // 5MB
    fieldName: 'file',
    metadata: { userId: '123' },
    onProgress: (uploaded, total) => {
      console.log(`Uploaded ${uploaded}/${total} bytes`);
    }
  }
);
```

### 5. Script Runner (`src/utils/scriptRunner.ts`)

Executes scripts and functions with timeout and error handling.

```typescript
import { executeScript, generateExecutableScript } from '../utils/scriptRunner';

// Execute a script
const result = await executeScript(
  () => {
    // Long-running operation
    return result;
  },
  {
    timeout: 30000,
    handleErrors: true,
    logger: console.log
  }
);

// Generate a ready-to-run script
const { script, instructions } = generateExecutableScript(
  `
  // Script content
  const result = processData(largeData);
  console.log(result);
  `,
  [
    'Copy the script below',
    'Open your browser console',
    'Paste and execute'
  ]
);
```

## React Hooks and Components

### 1. useChunkedProcessing Hook (`src/hooks/useChunkedProcessing.ts`)

React hook for processing large inputs in chunks with state management.

```tsx
import { useChunkedProcessing } from '../hooks/useChunkedProcessing';

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

### 2. ChunkedProcessor Component (`src/components/common/ChunkedProcessor.tsx`)

React component for processing large inputs with customizable UI.

```tsx
import ChunkedProcessor from '../components/common/ChunkedProcessor';

function MyComponent() {
  return (
    <ChunkedProcessor
      input={largeInput}
      processor={async (chunk, index) => {
        // Process each chunk
        return processedChunk;
      }}
      renderProcessing={({ progress, processedChunks, totalChunks, cancel }) => (
        <div>
          <ProgressBar value={progress} />
          <div>Processing chunk {processedChunks} of {totalChunks}</div>
          <button onClick={cancel}>Cancel</button>
        </div>
      )}
      renderResult={(result) => (
        <div>
          <h2>Processing Complete</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      maxChunkSize={5000}
      parallel={true}
      autoStart={true}
      onComplete={(result) => console.log('Processing complete:', result)}
    />
  );
}
```

### 3. ChunkedFileUpload Component (`src/components/common/ChunkedFileUpload.tsx`)

React component for uploading large files in chunks with UI feedback.

```tsx
import ChunkedFileUpload from '../components/common/ChunkedFileUpload';

function MyComponent() {
  return (
    <ChunkedFileUpload
      url="https://api.example.com/upload"
      maxFileSize={1024 * 1024 * 100} // 100MB
      maxChunkSize={1024 * 1024 * 5} // 5MB
      accept="image/*,.pdf"
      fieldName="file"
      metadata={{ userId: '123' }}
      onComplete={(response) => console.log('Upload complete:', response)}
      onError={(error) => console.error('Upload failed:', error)}
      buttonLabel="Select File"
      dragDropLabel="or drag and drop file here"
    />
  );
}
```

## Command-Line Script

The `scripts/process-large-input.js` script provides a command-line interface for processing large files in chunks.

### Usage

```bash
npm run process-large-input -- --input <file> --output <file> --processor <file> [options]
```

### Options

- `--input <file>`: Input file path (required)
- `--output <file>`: Output file path (required)
- `--processor <file>`: JavaScript file with processor function (required)
- `--chunk-size <size>`: Chunk size in bytes (default: 1MB)
- `--parallel`: Process chunks in parallel (default: false)
- `--max-parallel <n>`: Maximum parallel operations (default: 4)
- `--delimiter <regex>`: Regex for splitting input (default: paragraph breaks)
- `--format <format>`: Output format (json, text, default: text)
- `--verbose`: Enable verbose logging

### Example

```bash
npm run process-large-input -- --input large-text.txt --output results.json --processor scripts/sample-processor.js --chunk-size 10000 --parallel --format json
```

## Best Practices

1. **Choose appropriate chunk sizes**: Too small chunks create overhead, too large chunks defeat the purpose.
2. **Consider memory usage**: When processing in parallel, ensure your system has enough memory.
3. **Handle errors gracefully**: Implement proper error handling for each chunk.
4. **Provide progress feedback**: Always use the `onProgress` callback for long-running operations.
5. **Test with realistic data**: Test with data sizes similar to what you expect in production.
6. **Preserve logical boundaries**: When splitting text, try to preserve paragraphs, sentences, or other logical units.
7. **Implement cancellation**: Allow users to cancel long-running operations.
8. **Merge results carefully**: Ensure the merged result maintains the correct structure and order.

## Implementation Details

### Chunking Strategies

The utilities use different strategies for chunking based on the input type:

- **Text**: Split by paragraphs, then sentences, then characters if needed
- **Files**: Split by fixed-size chunks, preserving logical boundaries where possible
- **Arrays**: Split by fixed number of items
- **API Requests**: Split by fixed-size chunks with metadata to track order

### Parallel Processing

When using parallel processing:

- A concurrency limit prevents overwhelming the system
- Results are reordered to match the original input order
- Error handling ensures one failed chunk doesn't stop the entire process

### Progress Tracking

Progress is tracked by:

- Counting processed chunks
- Measuring bytes processed for files
- Calculating percentage completion
- Providing callbacks for UI updates
