/**
 * Module Initializer
 * 
 * This utility helps manage the initialization of application modules,
 * ensuring they are loaded in the correct order and only when needed.
 */

// Module initialization status
type ModuleStatus = 'pending' | 'initializing' | 'initialized' | 'failed';

// Module initialization function
type InitFunction = () => Promise<void>;

// Module dependency
type ModuleDependency = string;

// Module configuration
interface ModuleConfig {
  name: string;
  dependencies: ModuleDependency[];
  init: InitFunction;
  status: ModuleStatus;
  error?: Error;
}

/**
 * Module Initializer class
 */
class ModuleInitializer {
  private modules: Map<string, ModuleConfig> = new Map();
  private initPromises: Map<string, Promise<void>> = new Map();

  /**
   * Register a module
   * 
   * @param name Module name
   * @param init Initialization function
   * @param dependencies Dependencies (other module names)
   */
  public registerModule(name: string, init: InitFunction, dependencies: string[] = []): void {
    if (this.modules.has(name)) {
      console.warn(`Module '${name}' is already registered`);
      return;
    }

    this.modules.set(name, {
      name,
      dependencies,
      init,
      status: 'pending'
    });

    console.log(`Module '${name}' registered with dependencies: [${dependencies.join(', ')}]`);
  }

  /**
   * Initialize a module
   * 
   * @param name Module name
   * @returns Promise that resolves when the module is initialized
   */
  public async initializeModule(name: string): Promise<void> {
    // Check if module exists
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module '${name}' is not registered`);
    }

    // Check if module is already initialized or initializing
    if (module.status === 'initialized') {
      return;
    }

    // If module is already initializing, return the existing promise
    if (module.status === 'initializing' && this.initPromises.has(name)) {
      return this.initPromises.get(name);
    }

    // Create initialization promise
    const initPromise = this.doInitializeModule(module);
    this.initPromises.set(name, initPromise);

    return initPromise;
  }

  /**
   * Initialize all registered modules
   * 
   * @returns Promise that resolves when all modules are initialized
   */
  public async initializeAll(): Promise<void> {
    const moduleNames = Array.from(this.modules.keys());
    
    // Initialize modules in parallel, respecting dependencies
    await Promise.all(moduleNames.map(name => this.initializeModule(name)));
  }

  /**
   * Get module status
   * 
   * @param name Module name
   * @returns Module status
   */
  public getModuleStatus(name: string): ModuleStatus | undefined {
    return this.modules.get(name)?.status;
  }

  /**
   * Get all module statuses
   * 
   * @returns Map of module names to statuses
   */
  public getAllModuleStatuses(): Map<string, ModuleStatus> {
    const statuses = new Map<string, ModuleStatus>();
    
    this.modules.forEach((module, name) => {
      statuses.set(name, module.status);
    });
    
    return statuses;
  }

  /**
   * Reset a module's status to pending
   * 
   * @param name Module name
   */
  public resetModule(name: string): void {
    const module = this.modules.get(name);
    if (module) {
      module.status = 'pending';
      module.error = undefined;
      this.initPromises.delete(name);
    }
  }

  /**
   * Reset all modules
   */
  public resetAll(): void {
    this.modules.forEach((module) => {
      module.status = 'pending';
      module.error = undefined;
    });
    
    this.initPromises.clear();
  }

  /**
   * Internal method to initialize a module
   * 
   * @param module Module configuration
   * @returns Promise that resolves when the module is initialized
   */
  private async doInitializeModule(module: ModuleConfig): Promise<void> {
    // Update status
    module.status = 'initializing';
    
    try {
      // Initialize dependencies first
      if (module.dependencies.length > 0) {
        await Promise.all(
          module.dependencies.map(dep => this.initializeModule(dep))
        );
      }
      
      // Initialize the module
      await module.init();
      
      // Update status
      module.status = 'initialized';
      console.log(`Module '${module.name}' initialized successfully`);
    } catch (error) {
      // Update status
      module.status = 'failed';
      module.error = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to initialize module '${module.name}':`, error);
      
      // Rethrow the error
      throw error;
    }
  }
}

// Create a singleton instance
const moduleInitializer = new ModuleInitializer();

export default moduleInitializer;
