/**
 * Web Worker Utilities
 * 
 * This utility provides a way to create and manage web workers.
 */

/**
 * Options for creating a web worker
 */
export interface CreateWorkerOptions {
  /** Name of the worker */
  name?: string;
  /** Whether to use a shared worker */
  shared?: boolean;
  /** Timeout for worker operations (ms) */
  timeout?: number;
  /** Whether to terminate the worker when idle */
  terminateWhenIdle?: boolean;
  /** Idle timeout before termination (ms) */
  idleTimeout?: number;
}

/**
 * Default options for creating a web worker
 */
const defaultOptions: CreateWorkerOptions = {
  name: 'worker',
  shared: false,
  timeout: 30000,
  terminateWhenIdle: false,
  idleTimeout: 60000
};

/**
 * Create a web worker from a function
 * 
 * @param workerFunction - Function to run in the worker
 * @param options - Worker options
 * @returns Web worker instance
 * 
 * @example
 * ```ts
 * // Create a worker
 * const worker = createWorker(() => {
 *   // Worker code
 *   self.onmessage = (e) => {
 *     const result = heavyComputation(e.data);
 *     self.postMessage(result);
 *   };
 * });
 * 
 * // Use the worker
 * worker.postMessage(data);
 * worker.onmessage = (e) => {
 *   console.log('Result:', e.data);
 * };
 * ```
 */
export function createWorker(
  workerFunction: Function,
  options: CreateWorkerOptions = {}
): Worker {
  // Merge options with defaults
  const { name, shared, timeout, terminateWhenIdle, idleTimeout } = {
    ...defaultOptions,
    ...options
  };

  // Convert the worker function to a string
  const workerCode = `
    // Worker: ${name}
    (${workerFunction.toString()})();
  `;

  // Create a blob URL for the worker
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  // Create the worker
  const worker = new Worker(url);

  // Set up worker timeout
  if (timeout) {
    worker.addEventListener('message', () => {
      // Reset the timeout on each message
      if ((worker as any)._timeoutId) {
        clearTimeout((worker as any)._timeoutId);
      }
    });
  }

  // Set up idle termination
  if (terminateWhenIdle && idleTimeout) {
    let idleTimeoutId: number;

    const resetIdleTimeout = () => {
      if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
      }

      idleTimeoutId = window.setTimeout(() => {
        worker.terminate();
        URL.revokeObjectURL(url);
      }, idleTimeout);
    };

    // Reset idle timeout on message
    worker.addEventListener('message', resetIdleTimeout);

    // Initial idle timeout
    resetIdleTimeout();
  }

  // Clean up the blob URL when the worker is terminated
  const originalTerminate = worker.terminate;
  worker.terminate = () => {
    originalTerminate.call(worker);
    URL.revokeObjectURL(url);
  };

  return worker;
}

/**
 * Create a worker pool for parallel processing
 * 
 * @param workerFunction - Function to run in the workers
 * @param poolSize - Number of workers in the pool
 * @param options - Worker options
 * @returns Worker pool
 * 
 * @example
 * ```ts
 * // Create a worker pool
 * const pool = createWorkerPool(() => {
 *   // Worker code
 *   self.onmessage = (e) => {
 *     const result = heavyComputation(e.data);
 *     self.postMessage(result);
 *   };
 * }, 4);
 * 
 * // Process data in parallel
 * const results = await pool.process([data1, data2, data3, data4]);
 * console.log('Results:', results);
 * 
 * // Clean up the pool
 * pool.terminate();
 * ```
 */
export function createWorkerPool(
  workerFunction: Function,
  poolSize: number = navigator.hardwareConcurrency || 4,
  options: CreateWorkerOptions = {}
) {
  // Create workers
  const workers: Worker[] = [];
  for (let i = 0; i < poolSize; i++) {
    workers.push(createWorker(workerFunction, {
      ...options,
      name: `${options.name || 'worker'}-${i}`
    }));
  }

  // Track available workers
  const availableWorkers = [...workers];
  const busyWorkers = new Set<Worker>();

  // Process data with the next available worker
  const processWithWorker = (data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Get the next available worker
      const worker = availableWorkers.shift();
      if (!worker) {
        reject(new Error('No workers available'));
        return;
      }

      // Mark the worker as busy
      busyWorkers.add(worker);

      // Set up message handler
      const handleMessage = (e: MessageEvent) => {
        // Clean up
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);

        // Mark the worker as available
        busyWorkers.delete(worker);
        availableWorkers.push(worker);

        // Resolve with the result
        resolve(e.data);
      };

      // Set up error handler
      const handleError = (e: ErrorEvent) => {
        // Clean up
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);

        // Mark the worker as available
        busyWorkers.delete(worker);
        availableWorkers.push(worker);

        // Reject with the error
        reject(e.error);
      };

      // Set up handlers
      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', handleError);

      // Send data to the worker
      worker.postMessage(data);
    });
  };

  // Process multiple data items in parallel
  const process = async (dataItems: any[]): Promise<any[]> => {
    // Process all data items
    const promises = dataItems.map(data => processWithWorker(data));
    return Promise.all(promises);
  };

  // Terminate all workers
  const terminate = () => {
    workers.forEach(worker => worker.terminate());
  };

  return {
    workers,
    process,
    terminate,
    poolSize
  };
}

export default createWorker;
