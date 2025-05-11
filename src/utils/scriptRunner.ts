/**
 * Utility for running scripts and functions automatically
 */

interface ScriptRunnerOptions {
  /** Maximum execution time in milliseconds */
  timeout?: number;
  /** Whether to catch and handle errors */
  handleErrors?: boolean;
  /** Callback for logging */
  logger?: (message: string) => void;
}

/**
 * Executes a script or function with timeout and error handling
 */
export async function executeScript<T>(
  script: string | (() => T | Promise<T>),
  options: ScriptRunnerOptions = {}
): Promise<T> {
  const {
    timeout = 30000,
    handleErrors = true,
    logger = console.log
  } = options;

  // Create a promise that resolves with the script result
  const executionPromise = new Promise<T>(async (resolve, reject) => {
    try {
      let result: T;
      
      if (typeof script === 'string') {
        // Execute string script using Function constructor
        const scriptFn = new Function(script + '; return null;');
        result = scriptFn() as T;
      } else {
        // Execute function
        result = await script();
      }
      
      resolve(result);
    } catch (error) {
      if (handleErrors) {
        logger(`Error executing script: ${error instanceof Error ? error.message : String(error)}`);
        // Return a default value or partial result if possible
        resolve(null as unknown as T);
      } else {
        reject(error);
      }
    }
  });

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Script execution timed out after ${timeout}ms`));
    }, timeout);
  });

  // Race the execution against the timeout
  return Promise.race([executionPromise, timeoutPromise]);
}

/**
 * Generates a ready-to-run script with instructions
 */
export function generateExecutableScript(
  scriptContent: string,
  instructions: string[] = []
): { script: string; instructions: string[] } {
  // Wrap the script in an IIFE for safety
  const wrappedScript = `
(async function() {
  try {
    ${scriptContent}
  } catch (error) {
    console.error('Error executing script:', error);
  }
})();
`;

  // Default instructions if none provided
  const defaultInstructions = [
    'Copy the script below',
    'Open your browser console (F12 or Ctrl+Shift+J / Cmd+Option+J)',
    'Paste the script and press Enter to execute'
  ];

  return {
    script: wrappedScript,
    instructions: instructions.length > 0 ? instructions : defaultInstructions
  };
}

/**
 * Executes multiple scripts in sequence
 */
export async function executeScriptSequence<T>(
  scripts: (string | (() => T | Promise<T>))[],
  options: ScriptRunnerOptions = {}
): Promise<T[]> {
  const results: T[] = [];
  
  for (const script of scripts) {
    const result = await executeScript(script, options);
    results.push(result);
  }
  
  return results;
}

/**
 * Creates a self-executing script that can be run in chunks
 */
export function createChunkedScript(
  chunks: string[],
  processorName: string = 'processChunk',
  finalCallbackName: string = 'onComplete'
): string {
  const chunksJSON = JSON.stringify(chunks);
  
  return `
// Self-executing chunked script
(function() {
  // Store chunks
  const chunks = ${chunksJSON};
  let currentChunkIndex = 0;
  const results = [];
  
  // Define processor function (replace with your implementation)
  function ${processorName}(chunk, index) {
    console.log(\`Processing chunk \${index + 1}/\${chunks.length}\`);
    // Process the chunk here
    return chunk; // Replace with actual processing
  }
  
  // Define completion callback
  function ${finalCallbackName}(allResults) {
    console.log('All chunks processed:', allResults);
    // Handle final results here
  }
  
  // Process next chunk
  function processNextChunk() {
    if (currentChunkIndex >= chunks.length) {
      ${finalCallbackName}(results);
      return;
    }
    
    const chunk = chunks[currentChunkIndex];
    const result = ${processorName}(chunk, currentChunkIndex);
    results.push(result);
    currentChunkIndex++;
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(processNextChunk, 0);
  }
  
  // Start processing
  processNextChunk();
})();
`;
}
