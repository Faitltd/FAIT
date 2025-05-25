/**
 * Web Worker Registry Wrapper
 * 
 * This module provides a safe wrapper around the WebWorkerRegistry to handle
 * environments where web workers might not be supported or available.
 */

import { WorkerType } from './webWorkerRegistry';

// Define a minimal interface that matches the original
interface WorkerRegistryInterface {
  isSupported: () => boolean;
  runTask: <T = any>(workerType: WorkerType, action: string, data: any) => Promise<T>;
  runTasks: <T = any>(workerType: WorkerType, tasks: Array<{ action: string; data: any }>) => Promise<T[]>;
  terminateWorker: (workerType: WorkerType) => void;
  terminateAllWorkers: () => void;
}

/**
 * Fallback implementation for environments without web worker support
 */
class FallbackWorkerRegistry implements WorkerRegistryInterface {
  isSupported() {
    return false;
  }

  async runTask<T = any>(_workerType: WorkerType, action: string, data: any): Promise<T> {
    console.warn(`Web Workers not supported. Running '${action}' in main thread.`);
    
    // Implement fallback processing for common tasks
    switch (action) {
      case 'ping':
        return { success: true, message: 'Fallback ping response' } as unknown as T;
      
      case 'processImage':
        console.warn('Image processing not available without web workers');
        return data as T;
      
      case 'processData':
        console.warn('Data processing not available without web workers');
        return data as T;
      
      default:
        console.warn(`No fallback implementation for action: ${action}`);
        return data as T;
    }
  }

  async runTasks<T = any>(
    workerType: WorkerType, 
    tasks: Array<{ action: string; data: any }>
  ): Promise<T[]> {
    return Promise.all(
      tasks.map(task => this.runTask<T>(workerType, task.action, task.data))
    );
  }

  terminateWorker(_workerType: WorkerType): void {
    // No-op in fallback implementation
  }

  terminateAllWorkers(): void {
    // No-op in fallback implementation
  }
}

// Create a safe wrapper that dynamically imports the real registry when available
class SafeWorkerRegistry implements WorkerRegistryInterface {
  private registry: WorkerRegistryInterface | null = null;
  private fallback = new FallbackWorkerRegistry();
  private initialized = false;
  private initializing = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the registry
   */
  private async initialize(): Promise<void> {
    if (this.initialized || this.initializing) {
      return this.initPromise;
    }

    this.initializing = true;
    
    this.initPromise = new Promise<void>(async (resolve) => {
      try {
        // Check if web workers are supported
        if (typeof Worker !== 'undefined') {
          // Dynamically import the real registry
          const { workerRegistry } = await import('./webWorkerRegistry');
          this.registry = workerRegistry;
        } else {
          console.warn('Web Workers are not supported in this environment. Using fallback implementation.');
          this.registry = this.fallback;
        }
      } catch (error) {
        console.error('Error initializing worker registry:', error);
        this.registry = this.fallback;
      } finally {
        this.initialized = true;
        this.initializing = false;
        resolve();
      }
    });

    return this.initPromise;
  }

  /**
   * Check if web workers are supported
   */
  isSupported(): boolean {
    if (!this.initialized) {
      return typeof Worker !== 'undefined';
    }
    
    return this.registry?.isSupported() || false;
  }

  /**
   * Run a task in a worker
   */
  async runTask<T = any>(workerType: WorkerType, action: string, data: any): Promise<T> {
    await this.initialize();
    
    if (this.registry) {
      return this.registry.runTask<T>(workerType, action, data);
    }
    
    return this.fallback.runTask<T>(workerType, action, data);
  }

  /**
   * Run multiple tasks in parallel
   */
  async runTasks<T = any>(
    workerType: WorkerType, 
    tasks: Array<{ action: string; data: any }>
  ): Promise<T[]> {
    await this.initialize();
    
    if (this.registry) {
      return this.registry.runTasks<T>(workerType, tasks);
    }
    
    return this.fallback.runTasks<T>(workerType, tasks);
  }

  /**
   * Terminate a worker
   */
  async terminateWorker(workerType: WorkerType): Promise<void> {
    await this.initialize();
    
    if (this.registry) {
      this.registry.terminateWorker(workerType);
    }
  }

  /**
   * Terminate all workers
   */
  async terminateAllWorkers(): Promise<void> {
    await this.initialize();
    
    if (this.registry) {
      this.registry.terminateAllWorkers();
    }
  }
}

// Export a singleton instance
export const safeWorkerRegistry = new SafeWorkerRegistry();

// Re-export WorkerType for convenience
export { WorkerType } from './webWorkerRegistry';

export default safeWorkerRegistry;
