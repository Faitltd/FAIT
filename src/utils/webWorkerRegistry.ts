/**
 * Web Worker Registry
 * 
 * This module provides a centralized registry for web workers, making it easy
 * to create, manage, and use web workers throughout the application.
 */

// Worker types
export enum WorkerType {
  IMAGE = 'image',
  DATA = 'data',
  MAPS = 'maps',
  COMPUTATION = 'computation',
  CHUNK = 'chunk'
}

// Worker paths
const WORKER_PATHS: Record<WorkerType, string> = {
  [WorkerType.IMAGE]: '/workers/image-worker.js',
  [WorkerType.DATA]: '/workers/data-processing-worker.js',
  [WorkerType.MAPS]: '/workers/maps-worker.js',
  [WorkerType.COMPUTATION]: '/workers/computation-worker.js',
  [WorkerType.CHUNK]: '/workers/chunk-processor.js'
};

// Worker request interface
export interface WorkerRequest {
  id: string;
  action: string;
  data: any;
}

// Worker response interface
export interface WorkerResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

// Worker options interface
export interface WorkerOptions {
  /** Maximum number of concurrent workers */
  maxConcurrency?: number;
  /** Whether to terminate the worker after task completion */
  terminateOnComplete?: boolean;
  /** Timeout for worker tasks (ms) */
  timeout?: number;
  /** Callback for worker errors */
  onError?: (error: Error) => void;
  /** Whether to use SharedArrayBuffer for data transfer */
  useSharedArrayBuffer?: boolean;
}

/**
 * Web Worker Registry class
 */
export class WebWorkerRegistry {
  private workers: Map<string, Worker> = new Map();
  private pendingTasks: Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeoutId?: number;
  }> = new Map();
  private options: WorkerOptions;
  private taskCounter: number = 0;
  
  /**
   * Create a new WebWorkerRegistry
   */
  constructor(options: WorkerOptions = {}) {
    this.options = {
      maxConcurrency: navigator.hardwareConcurrency || 4,
      terminateOnComplete: false,
      timeout: 30000, // 30 seconds
      useSharedArrayBuffer: false,
      ...options
    };
  }
  
  /**
   * Run a task in a worker
   */
  public async runTask<T = any>(
    workerType: WorkerType,
    action: string,
    data: any,
    options: Partial<WorkerOptions> = {}
  ): Promise<T> {
    // Check if web workers are supported
    if (!WebWorkerRegistry.isSupported()) {
      throw new Error('Web Workers are not supported in this browser');
    }
    
    // Generate a unique task ID
    const taskId = `task_${Date.now()}_${this.taskCounter++}`;
    
    // Get or create a worker
    const worker = this.getWorker(workerType);
    
    // Create the task promise
    return new Promise<T>((resolve, reject) => {
      // Set up task timeout
      const timeoutMs = options.timeout || this.options.timeout;
      let timeoutId: number | undefined;
      
      if (timeoutMs) {
        timeoutId = window.setTimeout(() => {
          this.handleTaskTimeout(taskId, workerType, action);
        }, timeoutMs);
      }
      
      // Store the pending task
      this.pendingTasks.set(taskId, {
        resolve,
        reject,
        timeoutId
      });
      
      // Set up message handler for this worker if not already set
      if (!worker.onmessage) {
        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);
      }
      
      // Send the task to the worker
      const request: WorkerRequest = {
        id: taskId,
        action,
        data
      };
      
      // Use SharedArrayBuffer if enabled and supported
      if (this.options.useSharedArrayBuffer && window.SharedArrayBuffer) {
        // Convert large data to SharedArrayBuffer if possible
        // This is a simplified example - real implementation would be more complex
        if (data && data.buffer && data.buffer instanceof ArrayBuffer) {
          const sharedBuffer = new SharedArrayBuffer(data.buffer.byteLength);
          const sharedView = new Uint8Array(sharedBuffer);
          const originalView = new Uint8Array(data.buffer);
          sharedView.set(originalView);
          request.data = sharedView;
        }
      }
      
      worker.postMessage(request);
    });
  }
  
  /**
   * Run multiple tasks in parallel
   */
  public async runTasks<T = any>(
    workerType: WorkerType,
    tasks: Array<{ action: string; data: any }>,
    options: Partial<WorkerOptions> = {}
  ): Promise<T[]> {
    return Promise.all(
      tasks.map(task => this.runTask<T>(workerType, task.action, task.data, options))
    );
  }
  
  /**
   * Terminate a worker
   */
  public terminateWorker(workerType: WorkerType): void {
    const worker = this.workers.get(workerType);
    
    if (worker) {
      worker.terminate();
      this.workers.delete(workerType);
    }
  }
  
  /**
   * Terminate all workers
   */
  public terminateAllWorkers(): void {
    this.workers.forEach(worker => {
      worker.terminate();
    });
    
    this.workers.clear();
  }
  
  /**
   * Handle worker message
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const response = event.data;
    
    if (!response || !response.id) {
      console.error('Invalid worker response:', response);
      return;
    }
    
    const pendingTask = this.pendingTasks.get(response.id);
    
    if (!pendingTask) {
      console.warn('No pending task found for response:', response);
      return;
    }
    
    // Clear timeout
    if (pendingTask.timeoutId) {
      clearTimeout(pendingTask.timeoutId);
    }
    
    // Remove from pending tasks
    this.pendingTasks.delete(response.id);
    
    // Handle success or error
    if (response.success) {
      pendingTask.resolve(response.result);
    } else {
      const error = new Error(response.error?.message || 'Unknown worker error');
      if (response.error?.stack) {
        error.stack = response.error.stack;
      }
      pendingTask.reject(error);
    }
  }
  
  /**
   * Handle worker error
   */
  private handleWorkerError(event: ErrorEvent): void {
    console.error('Worker error:', event);
    
    // Call error callback
    if (this.options.onError) {
      this.options.onError(new Error(event.message));
    }
  }
  
  /**
   * Handle task timeout
   */
  private handleTaskTimeout(taskId: string, workerType: WorkerType, action: string): void {
    const pendingTask = this.pendingTasks.get(taskId);
    
    if (!pendingTask) {
      return;
    }
    
    // Remove from pending tasks
    this.pendingTasks.delete(taskId);
    
    // Reject the promise
    const error = new Error(`Worker task timed out: ${workerType} - ${action}`);
    pendingTask.reject(error);
    
    // Call error callback
    if (this.options.onError) {
      this.options.onError(error);
    }
  }
  
  /**
   * Get or create a worker
   */
  private getWorker(workerType: WorkerType): Worker {
    // Check if we already have a worker of this type
    if (this.workers.has(workerType)) {
      return this.workers.get(workerType)!;
    }
    
    // Check if we've reached the maximum number of workers
    if (this.workers.size >= this.options.maxConcurrency!) {
      // Get the first worker in the map
      const [firstWorkerType] = this.workers.keys();
      return this.workers.get(firstWorkerType)!;
    }
    
    // Create a new worker
    const workerPath = WORKER_PATHS[workerType];
    
    if (!workerPath) {
      throw new Error(`Unknown worker type: ${workerType}`);
    }
    
    const worker = new Worker(workerPath);
    this.workers.set(workerType, worker);
    
    return worker;
  }
  
  /**
   * Check if web workers are supported
   */
  public static isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }
}

// Create a singleton instance
export const workerRegistry = new WebWorkerRegistry();

/**
 * Hook for using web workers in React components
 */
export function useWebWorker(workerType: WorkerType, options: Partial<WorkerOptions> = {}) {
  return {
    /**
     * Run a task in a worker
     */
    runTask: <T = any>(action: string, data: any): Promise<T> => {
      return workerRegistry.runTask<T>(workerType, action, data, options);
    },
    
    /**
     * Run multiple tasks in parallel
     */
    runTasks: <T = any>(tasks: Array<{ action: string; data: any }>): Promise<T[]> => {
      return workerRegistry.runTasks<T>(workerType, tasks, options);
    },
    
    /**
     * Terminate the worker
     */
    terminate: (): void => {
      workerRegistry.terminateWorker(workerType);
    },
    
    /**
     * Check if web workers are supported
     */
    isSupported: WebWorkerRegistry.isSupported()
  };
}

export default workerRegistry;
