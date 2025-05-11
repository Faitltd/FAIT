#!/usr/bin/env node

/**
 * Command-line script for processing large inputs in chunks
 * 
 * Usage:
 *   node process-large-input.js --input <file> --output <file> [options]
 * 
 * Options:
 *   --input <file>       Input file path (required)
 *   --output <file>      Output file path (required)
 *   --chunk-size <size>  Chunk size in bytes (default: 1MB)
 *   --parallel           Process chunks in parallel (default: false)
 *   --max-parallel <n>   Maximum parallel operations (default: 4)
 *   --processor <file>   JavaScript file with processor function (required)
 *   --delimiter <regex>  Regex for splitting input (default: paragraph breaks)
 *   --format <format>    Output format (json, text, default: text)
 *   --verbose            Enable verbose logging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  input: '',
  output: '',
  chunkSize: 1024 * 1024, // 1MB
  parallel: false,
  maxParallel: 4,
  processor: '',
  delimiter: /\n\s*\n/, // Paragraph breaks
  format: 'text',
  verbose: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--input' && i + 1 < args.length) {
    options.input = args[++i];
  } else if (arg === '--output' && i + 1 < args.length) {
    options.output = args[++i];
  } else if (arg === '--chunk-size' && i + 1 < args.length) {
    options.chunkSize = parseInt(args[++i], 10);
  } else if (arg === '--parallel') {
    options.parallel = true;
  } else if (arg === '--max-parallel' && i + 1 < args.length) {
    options.maxParallel = parseInt(args[++i], 10);
  } else if (arg === '--processor' && i + 1 < args.length) {
    options.processor = args[++i];
  } else if (arg === '--delimiter' && i + 1 < args.length) {
    options.delimiter = new RegExp(args[++i]);
  } else if (arg === '--format' && i + 1 < args.length) {
    options.format = args[++i];
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
}

// Validate required options
if (!options.input) {
  console.error('Error: Input file is required (--input <file>)');
  process.exit(1);
}

if (!options.output) {
  console.error('Error: Output file is required (--output <file>)');
  process.exit(1);
}

if (!options.processor) {
  console.error('Error: Processor file is required (--processor <file>)');
  process.exit(1);
}

// Validate input file
if (!fs.existsSync(options.input)) {
  console.error(`Error: Input file not found: ${options.input}`);
  process.exit(1);
}

// Validate processor file
if (!fs.existsSync(options.processor)) {
  console.error(`Error: Processor file not found: ${options.processor}`);
  process.exit(1);
}

// Load processor function
let processorFn;
try {
  const processorModule = await import(path.resolve(options.processor));
  processorFn = processorModule.default || processorModule.processor;
  
  if (typeof processorFn !== 'function') {
    console.error('Error: Processor file must export a function named "processor" or a default function');
    process.exit(1);
  }
} catch (error) {
  console.error('Error loading processor file:', error);
  process.exit(1);
}

// Function to split input into chunks
function splitIntoChunks(input, delimiter, chunkSize) {
  // If input is smaller than chunk size, return as is
  if (input.length <= chunkSize) {
    return [input];
  }
  
  // Split by delimiter
  const parts = input.split(delimiter);
  const chunks = [];
  let currentChunk = '';
  
  for (const part of parts) {
    // If adding this part would exceed max size and we already have content,
    // push current chunk and start a new one
    if (currentChunk.length + part.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = part;
    } 
    // If the part itself is larger than max size, split it further
    else if (part.length > chunkSize) {
      // Push current chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      // Split large part by sentences or just characters if needed
      for (let i = 0; i < part.length; i += chunkSize) {
        chunks.push(part.substring(i, Math.min(i + chunkSize, part.length)));
      }
    } 
    // Otherwise, add to current chunk
    else {
      currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + part;
    }
  }
  
  // Add the last chunk if not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Process chunks sequentially
async function processSequentially(chunks) {
  const results = [];
  
  for (let i = 0; i < chunks.length; i++) {
    if (options.verbose) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
    } else {
      process.stdout.write(`\rProcessing: ${Math.round((i / chunks.length) * 100)}%`);
    }
    
    const result = await processorFn(chunks[i], i);
    results.push(result);
  }
  
  if (!options.verbose) {
    process.stdout.write('\rProcessing: 100%\n');
  }
  
  return results;
}

// Process chunks in parallel
async function processInParallel(chunks) {
  const results = new Array(chunks.length);
  let completed = 0;
  
  // Create a pool of workers
  const pool = [];
  let nextChunkIndex = 0;
  
  // Function to process a chunk
  const processChunk = async (chunkIndex) => {
    try {
      const result = await processorFn(chunks[chunkIndex], chunkIndex);
      results[chunkIndex] = result;
      completed++;
      
      if (options.verbose) {
        console.log(`Completed chunk ${chunkIndex + 1}/${chunks.length}`);
      } else {
        process.stdout.write(`\rProcessing: ${Math.round((completed / chunks.length) * 100)}%`);
      }
      
      // Process next chunk if available
      if (nextChunkIndex < chunks.length) {
        return processChunk(nextChunkIndex++);
      }
    } catch (error) {
      console.error(`Error processing chunk ${chunkIndex}:`, error);
      throw error;
    }
  };
  
  // Start initial workers
  for (let i = 0; i < Math.min(options.maxParallel, chunks.length); i++) {
    pool.push(processChunk(nextChunkIndex++));
  }
  
  // Wait for all workers to complete
  await Promise.all(pool);
  
  if (!options.verbose) {
    process.stdout.write('\rProcessing: 100%\n');
  }
  
  return results;
}

// Merge results based on format
function mergeResults(results) {
  if (options.format === 'json') {
    // For JSON, merge arrays or objects
    if (results.length > 0 && Array.isArray(results[0])) {
      return results.flat();
    } else if (results.length > 0 && typeof results[0] === 'object' && results[0] !== null) {
      return Object.assign({}, ...results);
    } else {
      return results;
    }
  } else {
    // For text, join with newlines
    return results.join('\n');
  }
}

// Main function
async function main() {
  console.log('Reading input file...');
  const input = fs.readFileSync(options.input, 'utf8');
  
  console.log('Splitting into chunks...');
  const chunks = splitIntoChunks(input, options.delimiter, options.chunkSize);
  console.log(`Split into ${chunks.length} chunks`);
  
  console.log('Processing chunks...');
  const startTime = Date.now();
  
  let results;
  if (options.parallel) {
    console.log(`Processing in parallel (max ${options.maxParallel} workers)...`);
    results = await processInParallel(chunks);
  } else {
    console.log('Processing sequentially...');
    results = await processSequentially(chunks);
  }
  
  const endTime = Date.now();
  console.log(`Processing completed in ${(endTime - startTime) / 1000} seconds`);
  
  console.log('Merging results...');
  const mergedResult = mergeResults(results);
  
  console.log('Writing output file...');
  if (options.format === 'json') {
    fs.writeFileSync(options.output, JSON.stringify(mergedResult, null, 2));
  } else {
    fs.writeFileSync(options.output, mergedResult);
  }
  
  console.log('Done!');
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
