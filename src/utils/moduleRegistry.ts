/**
 * Module Registry
 * 
 * This module registers all application modules with the module initializer,
 * defining their dependencies and initialization functions.
 */

import moduleInitializer from './moduleInitializer';
import { getSupabaseClient, testSupabaseConnection } from './supabaseClient';
import { registerServiceWorker, isServiceWorkerActive } from './serviceWorkerRegistration';
import { safeWorkerRegistry, WorkerType } from './webWorkerRegistryWrapper';
import { getBestSupportedFormat, ImageFormat } from './imageOptimization';

/**
 * Initialize the core module
 */
const initCoreModule = async (): Promise<void> => {
  console.log('Initializing core module...');
  
  // Nothing specific to initialize here
  // This is a placeholder for any future core initialization
};

/**
 * Initialize the auth module
 */
const initAuthModule = async (): Promise<void> => {
  console.log('Initializing auth module...');
  
  // Initialize Supabase client
  await getSupabaseClient();
  
  // Test connection
  await testSupabaseConnection();
};

/**
 * Initialize the service worker module
 */
const initServiceWorkerModule = async (): Promise<void> => {
  console.log('Initializing service worker module...');
  
  try {
    // Register service worker
    const registration = await registerServiceWorker({
      onSuccess: (reg) => {
        console.log('Service worker registered successfully:', reg);
      },
      onError: (error) => {
        console.error('Service worker registration failed:', error);
      }
    });
    
    if (registration) {
      console.log('Service worker is active');
    }
  } catch (error) {
    console.error('Error registering service worker:', error);
    // Don't throw, allow the application to continue without service worker
  }
};

/**
 * Initialize the web workers module
 */
const initWebWorkersModule = async (): Promise<void> => {
  console.log('Initializing web workers module...');
  
  try {
    // Check if web workers are supported
    if (safeWorkerRegistry.isSupported()) {
      // Preload image worker with a simple task
      await safeWorkerRegistry.runTask(WorkerType.IMAGE, 'ping', {})
        .then(() => console.log('Image worker preloaded'))
        .catch((error) => console.error('Error preloading image worker:', error));
      
      // Preload data worker with a simple task
      await safeWorkerRegistry.runTask(WorkerType.DATA, 'ping', {})
        .then(() => console.log('Data worker preloaded'))
        .catch((error) => console.error('Error preloading data worker:', error));
    } else {
      console.log('Web workers not supported in this environment');
    }
  } catch (error) {
    console.error('Error initializing web workers:', error);
    // Don't throw, allow the application to continue without web workers
  }
};

/**
 * Initialize the image optimization module
 */
const initImageOptimizationModule = async (): Promise<void> => {
  console.log('Initializing image optimization module...');
  
  try {
    // Detect best supported image format
    const bestFormat = await getBestSupportedFormat();
    console.log('Best supported image format:', bestFormat);
    
    // Store in localStorage for future use
    localStorage.setItem('bestImageFormat', bestFormat);
  } catch (error) {
    console.error('Error detecting best image format:', error);
    // Fallback to WebP
    localStorage.setItem('bestImageFormat', ImageFormat.WEBP);
  }
};

/**
 * Initialize the maps module
 */
const initMapsModule = async (): Promise<void> => {
  console.log('Initializing maps module...');
  
  // Maps initialization will be handled by the GoogleMapsLoader component
  // This is just a placeholder for any additional maps initialization
};

/**
 * Initialize the booking module
 */
const initBookingModule = async (): Promise<void> => {
  console.log('Initializing booking module...');
  
  // Booking module depends on auth and maps
  // This is a placeholder for any additional booking initialization
};

/**
 * Initialize the projects module
 */
const initProjectsModule = async (): Promise<void> => {
  console.log('Initializing projects module...');
  
  // Projects module depends on auth
  // This is a placeholder for any additional projects initialization
};

/**
 * Initialize the messaging module
 */
const initMessagingModule = async (): Promise<void> => {
  console.log('Initializing messaging module...');
  
  // Messaging module depends on auth
  // This is a placeholder for any additional messaging initialization
};

/**
 * Register all modules
 */
export const registerModules = (): void => {
  // Register core module (no dependencies)
  moduleInitializer.registerModule('core', initCoreModule, []);
  
  // Register auth module (depends on core)
  moduleInitializer.registerModule('auth', initAuthModule, ['core']);
  
  // Register service worker module (depends on core)
  moduleInitializer.registerModule('serviceWorker', initServiceWorkerModule, ['core']);
  
  // Register web workers module (depends on core)
  moduleInitializer.registerModule('webWorkers', initWebWorkersModule, ['core']);
  
  // Register image optimization module (depends on core and web workers)
  moduleInitializer.registerModule('imageOptimization', initImageOptimizationModule, ['core', 'webWorkers']);
  
  // Register maps module (depends on core)
  moduleInitializer.registerModule('maps', initMapsModule, ['core']);
  
  // Register booking module (depends on auth and maps)
  moduleInitializer.registerModule('booking', initBookingModule, ['auth', 'maps']);
  
  // Register projects module (depends on auth)
  moduleInitializer.registerModule('projects', initProjectsModule, ['auth']);
  
  // Register messaging module (depends on auth)
  moduleInitializer.registerModule('messaging', initMessagingModule, ['auth']);
};

/**
 * Initialize all modules
 */
export const initializeAllModules = async (): Promise<void> => {
  // Register modules if not already registered
  if (moduleInitializer.getAllModuleStatuses().size === 0) {
    registerModules();
  }
  
  // Initialize all modules
  await moduleInitializer.initializeAll();
};

/**
 * Initialize specific modules
 */
export const initializeModules = async (moduleNames: string[]): Promise<void> => {
  // Register modules if not already registered
  if (moduleInitializer.getAllModuleStatuses().size === 0) {
    registerModules();
  }
  
  // Initialize specified modules
  await Promise.all(moduleNames.map(name => moduleInitializer.initializeModule(name)));
};

export default moduleInitializer;
