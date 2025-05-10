/**
 * Web Worker Manager
 * 
 * This utility provides a centralized way to manage web workers,
 * handling worker creation, message passing, and termination.
 */

// Types for worker messages
export interface WorkerRequest {
  id: string;
  action: string;
  data: any;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface WorkerOptions {
  maxConcurrency?: number;
  terminateOnComplete?: boolean;
  timeout?: number;
  onError?: (error: Error) => void;
}

// Worker types
export enum WorkerType {
  MAPS = 'maps',
  DATA = 'data',
  COMPUTATION = 'computation',
  CUSTOM = 'custom'
}

// Map worker types to their script paths
const workerPaths: Record<string, string> = {
  [WorkerType.MAPS]: '/workers/maps-worker.js',
  [WorkerType.DATA]: '/workers/data-worker.js',
  [WorkerType.COMPUTATION]: '/workers/computation-worker.js'
};

/**
 * Web Worker Manager class
 */
export class WebWorkerManager {
  private workers: Map<string, Worker> = new Map();
  private pendingTasks: Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeoutId?: number;
  }> = new Map();
  private options: WorkerOptions;
  private taskCounter: number = 0;
  
  /**
   * Create a new WebWorkerManager
   */
  constructor(options: WorkerOptions = {}) {
    this.options = {
      maxConcurrency: navigator.hardwareConcurrency || 4,
      terminateOnComplete: false,
      timeout: 30000, // 30 seconds
      ...options
    };
  }
  
  /**
   * Run a task in a worker
   */
  public async runTask<T = any>(
    workerType: WorkerType | string,
    action: string,
    data: any,
    options: Partial<WorkerOptions> = {}
  ): Promise<T> {
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
      
      worker.postMessage(request);
    });
  }
  
  /**
   * Run multiple tasks in parallel
   */
  public async runTasks<T = any>(
    workerType: WorkerType | string,
    tasks: Array<{ action: string; data: any }>,
    options: Partial<WorkerOptions> = {}
  ): Promise<T[]> {
    return Promise.all(
      tasks.map(task => this.runTask<T>(workerType, task.action, task.data, options))
    );
  }
  
  /**
   * Terminate all workers
   */
  public terminateAll(): void {
    this.workers.forEach(worker => {
      worker.terminate();
    });
    
    this.workers.clear();
    
    // Reject all pending tasks
    this.pendingTasks.forEach((task, taskId) => {
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      
      task.reject(new Error('Worker terminated'));
    });
    
    this.pendingTasks.clear();
  }
  
  /**
   * Terminate a specific worker
   */
  public terminateWorker(workerType: WorkerType | string): void {
    const worker = this.workers.get(workerType);
    
    if (worker) {
      worker.terminate();
      this.workers.delete(workerType);
      
      // Reject all pending tasks for this worker
      this.pendingTasks.forEach((task, taskId) => {
        if (taskId.startsWith(`${workerType}_`)) {
          if (task.timeoutId) {
            clearTimeout(task.timeoutId);
          }
          
          task.reject(new Error(`Worker ${workerType} terminated`));
          this.pendingTasks.delete(taskId);
        }
      });
    }
  }
  
  /**
   * Get the number of active workers
   */
  public getActiveWorkerCount(): number {
    return this.workers.size;
  }
  
  /**
   * Get the number of pending tasks
   */
  public getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }
  
  /**
   * Check if web workers are supported
   */
  public static isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }
  
  /**
   * Create a worker from a function
   */
  public static createWorkerFromFunction(fn: Function): Worker {
    // Convert the function to a string
    const fnString = fn.toString();
    
    // Create a blob URL
    const blob = new Blob(
      [`self.onmessage = ${fnString}`],
      { type: 'application/javascript' }
    );
    
    const url = URL.createObjectURL(blob);
    
    // Create the worker
    const worker = new Worker(url);
    
    // Clean up the URL when the worker is terminated
    worker.addEventListener('message', () => {
      URL.revokeObjectURL(url);
    }, { once: true });
    
    return worker;
  }
  
  /**
   * Get or create a worker
   */
  private getWorker(workerType: WorkerType | string): Worker {
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
    let workerPath = workerPaths[workerType];
    
    // If it's a custom worker, use the type as the path
    if (!workerPath && workerType.startsWith('/')) {
      workerPath = workerType;
    }
    
    if (!workerPath) {
      throw new Error(`Unknown worker type: ${workerType}`);
    }
    
    const worker = new Worker(workerPath);
    this.workers.set(workerType, worker);
    
    return worker;
  }
  
  /**
   * Handle a message from a worker
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const response = event.data;
    
    // Find the pending task
    const task = this.pendingTasks.get(response.id);
    
    if (!task) {
      console.warn(`Received response for unknown task: ${response.id}`);
      return;
    }
    
    // Clear the timeout
    if (task.timeoutId) {
      clearTimeout(task.timeoutId);
    }
    
    // Remove the task from pending
    this.pendingTasks.delete(response.id);
    
    // Resolve or reject the promise
    if (response.success) {
      task.resolve(response.result);
    } else {
      const error = new Error(response.error?.message || 'Unknown error');
      if (response.error?.stack) {
        error.stack = response.error.stack;
      }
      task.reject(error);
    }
    
    // Terminate the worker if configured to do so
    if (this.options.terminateOnComplete && this.pendingTasks.size === 0) {
      this.terminateAll();
    }
  }
  
  /**
   * Handle a worker error
   */
  private handleWorkerError(event: ErrorEvent): void {
    console.error('Worker error:', event);
    
    // Call the error handler if provided
    if (this.options.onError) {
      this.options.onError(new Error(`Worker error: ${event.message}`));
    }
    
    // We can't determine which task caused the error, so we don't reject any tasks
  }
  
  /**
   * Handle a task timeout
   */
  private handleTaskTimeout(taskId: string, workerType: WorkerType | string, action: string): void {
    const task = this.pendingTasks.get(taskId);
    
    if (!task) {
      return;
    }
    
    // Remove the task from pending
    this.pendingTasks.delete(taskId);
    
    // Reject the promise
    const error = new Error(`Task ${action} timed out after ${this.options.timeout}ms`);
    task.reject(error);
    
    // Call the error handler if provided
    if (this.options.onError) {
      this.options.onError(error);
    }
    
    // Terminate and recreate the worker to prevent memory leaks
    this.terminateWorker(workerType);
  }
}

// Create a singleton instance
export const workerManager = new WebWorkerManager();

/**
 * Hook for using web workers in React components
 */
export function useWebWorker(workerType: WorkerType | string, options: Partial<WorkerOptions> = {}) {
  return {
    /**
     * Run a task in a worker
     */
    runTask: <T = any>(action: string, data: any): Promise<T> => {
      return workerManager.runTask<T>(workerType, action, data, options);
    },
    
    /**
     * Run multiple tasks in parallel
     */
    runTasks: <T = any>(tasks: Array<{ action: string; data: any }>): Promise<T[]> => {
      return workerManager.runTasks<T>(workerType, tasks, options);
    },
    
    /**
     * Terminate the worker
     */
    terminate: (): void => {
      workerManager.terminateWorker(workerType);
    },
    
    /**
     * Check if web workers are supported
     */
    isSupported: WebWorkerManager.isSupported()
  };
}

export default workerManager;
