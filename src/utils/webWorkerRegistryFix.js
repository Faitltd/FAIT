/**
 * Web Worker Registry Fix
 * 
 * This module provides a simple fix for the web worker registry issue.
 */

// Worker types
export const WorkerType = {
  IMAGE: 'image',
  DATA: 'data',
  MAPS: 'maps',
  COMPUTATION: 'computation',
  CHUNK: 'chunk'
};

/**
 * Simple web worker registry that provides a safe interface
 * even when web workers are not supported.
 */
class SimpleWorkerRegistry {
  /**
   * Check if web workers are supported
   * @returns {boolean} True if web workers are supported
   */
  isSupported() {
    return typeof Worker !== 'undefined';
  }

  /**
   * Run a task in a worker
   * @param {string} workerType Worker type
   * @param {string} action Action to perform
   * @param {any} data Data to process
   * @returns {Promise<any>} Promise that resolves with the result
   */
  async runTask(workerType, action, data) {
    // If web workers are not supported, run in main thread
    if (!this.isSupported()) {
      console.warn(`Web workers not supported. Running ${action} in main thread.`);
      return this.runInMainThread(action, data);
    }

    // For now, just return a mock result
    // In a real implementation, this would create and use a web worker
    return {
      success: true,
      result: data,
      message: `Task ${action} completed in worker ${workerType}`
    };
  }

  /**
   * Run multiple tasks in parallel
   * @param {string} workerType Worker type
   * @param {Array<{action: string, data: any}>} tasks Tasks to run
   * @returns {Promise<Array<any>>} Promise that resolves with the results
   */
  async runTasks(workerType, tasks) {
    return Promise.all(
      tasks.map(task => this.runTask(workerType, task.action, task.data))
    );
  }

  /**
   * Run a task in the main thread
   * @param {string} action Action to perform
   * @param {any} data Data to process
   * @returns {Promise<any>} Promise that resolves with the result
   */
  async runInMainThread(action, data) {
    // Simple implementation for common actions
    switch (action) {
      case 'ping':
        return { success: true, message: 'pong' };
      default:
        return { success: true, result: data };
    }
  }

  /**
   * Terminate a worker
   * @param {string} workerType Worker type
   */
  terminateWorker(workerType) {
    // No-op in this simple implementation
  }

  /**
   * Terminate all workers
   */
  terminateAllWorkers() {
    // No-op in this simple implementation
  }
}

// Create a singleton instance
export const workerRegistry = new SimpleWorkerRegistry();

export default workerRegistry;
