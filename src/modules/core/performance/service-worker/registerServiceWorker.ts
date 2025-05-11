/**
 * Service Worker Registration
 * 
 * This utility provides a way to register a service worker for offline support.
 */

/**
 * Service worker registration options
 */
export interface ServiceWorkerOptions {
  /** Path to the service worker file */
  path?: string;
  /** Scope of the service worker */
  scope?: string;
  /** Callback when service worker is registered successfully */
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when service worker is updated */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when service worker registration fails */
  onError?: (error: Error) => void;
  /** Whether to register the service worker immediately */
  immediate?: boolean;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Default options for service worker registration
 */
const defaultOptions: ServiceWorkerOptions = {
  path: '/service-worker.js',
  scope: '/',
  immediate: true,
  debug: false
};

/**
 * Register a service worker for offline support
 * 
 * @param options - Service worker options
 * @returns Promise that resolves with the service worker registration
 * 
 * @example
 * ```ts
 * // Register service worker with default options
 * registerServiceWorker();
 * 
 * // Register service worker with custom options
 * registerServiceWorker({
 *   path: '/custom-service-worker.js',
 *   scope: '/app/',
 *   onSuccess: (registration) => console.log('Service worker registered'),
 *   onUpdate: (registration) => console.log('Service worker updated'),
 *   onError: (error) => console.error('Service worker registration failed:', error)
 * });
 * ```
 */
export function registerServiceWorker(
  options: ServiceWorkerOptions = {}
): Promise<ServiceWorkerRegistration | undefined> {
  // Merge options with defaults
  const { path, scope, onSuccess, onUpdate, onError, immediate, debug } = {
    ...defaultOptions,
    ...options
  };

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    const error = new Error('Service workers are not supported in this browser');
    if (onError) onError(error);
    return Promise.reject(error);
  }

  // Log debug messages if debug is enabled
  const log = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[ServiceWorker] ${message}`, ...args);
    }
  };

  // Function to register the service worker
  const register = (): Promise<ServiceWorkerRegistration | undefined> => {
    log('Registering service worker...');

    return navigator.serviceWorker
      .register(path as string, { scope })
      .then(registration => {
        log('Service worker registered:', registration);

        // Handle service worker updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; notify the user
                log('New content is available; please refresh.');
                if (onUpdate) onUpdate(registration);
              } else {
                // Content is cached for offline use
                log('Content is cached for offline use.');
                if (onSuccess) onSuccess(registration);
              }
            }
          };
        };

        return registration;
      })
      .catch(error => {
        console.error('Error during service worker registration:', error);
        if (onError) onError(error);
        throw error;
      });
  };

  // Register immediately or return a function to register later
  if (immediate) {
    // Register when the window loads
    if (window.addEventListener) {
      window.addEventListener('load', () => {
        register();
      });
    }
    
    // Return a promise that resolves when the service worker is registered
    return register();
  } else {
    // Return a promise that resolves when the service worker is registered
    return Promise.resolve(undefined);
  }
}

/**
 * Unregister all service workers
 * 
 * @returns Promise that resolves when all service workers are unregistered
 * 
 * @example
 * ```ts
 * // Unregister all service workers
 * unregisterServiceWorker()
 *   .then(() => console.log('All service workers unregistered'))
 *   .catch(error => console.error('Error unregistering service workers:', error));
 * ```
 */
export function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      // Unregister all service workers
      return Promise.all(
        registrations.map(registration => registration.unregister())
      ).then(results => results.every(Boolean));
    });
}

/**
 * Check if the app is installed (PWA)
 * 
 * @returns Whether the app is installed
 * 
 * @example
 * ```ts
 * // Check if the app is installed
 * if (isAppInstalled()) {
 *   console.log('App is installed');
 * } else {
 *   console.log('App is not installed');
 * }
 * ```
 */
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Check if the app can be installed (PWA)
 * 
 * @returns Promise that resolves with whether the app can be installed
 * 
 * @example
 * ```ts
 * // Check if the app can be installed
 * canInstallApp().then(canInstall => {
 *   if (canInstall) {
 *     console.log('App can be installed');
 *   } else {
 *     console.log('App cannot be installed');
 *   }
 * });
 * ```
 */
export function canInstallApp(): Promise<boolean> {
  return new Promise(resolve => {
    // Check if the app is already installed
    if (isAppInstalled()) {
      resolve(false);
      return;
    }

    // Check if the beforeinstallprompt event is supported
    if (!window.addEventListener) {
      resolve(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    let deferredPrompt: any;
    const listener = (e: any) => {
      deferredPrompt = e;
      window.removeEventListener('beforeinstallprompt', listener);
      resolve(true);
    };

    window.addEventListener('beforeinstallprompt', listener);

    // Resolve after a timeout if the event doesn't fire
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', listener);
      resolve(!!deferredPrompt);
    }, 1000);
  });
}

export default registerServiceWorker;
