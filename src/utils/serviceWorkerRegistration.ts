/**
 * Service Worker Registration Utility
 * 
 * This utility handles the registration and management of the service worker,
 * providing offline support, background syncing, and advanced caching.
 */

// Configuration options for service worker
export interface ServiceWorkerConfig {
  /** Whether to enable the service worker */
  enabled: boolean;
  /** Path to the service worker file */
  path: string;
  /** Scope of the service worker */
  scope?: string;
  /** Whether to register immediately */
  immediate?: boolean;
  /** Whether to update on reload */
  updateOnReload?: boolean;
  /** Callback when service worker is registered */
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when service worker is updated */
  onUpdated?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when service worker registration fails */
  onError?: (error: Error) => void;
}

// Default configuration
const defaultConfig: ServiceWorkerConfig = {
  enabled: true,
  path: '/service-worker.js',
  immediate: true,
  updateOnReload: true
};

/**
 * Register the service worker
 */
export function registerServiceWorker(customConfig: Partial<ServiceWorkerConfig> = {}): Promise<ServiceWorkerRegistration | null> {
  // Merge custom config with defaults
  const config = { ...defaultConfig, ...customConfig };
  
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return Promise.resolve(null);
  }
  
  // Check if service worker is enabled
  if (!config.enabled) {
    console.log('Service worker is disabled');
    return Promise.resolve(null);
  }
  
  // Register the service worker
  return navigator.serviceWorker.register(config.path, { scope: config.scope })
    .then((registration) => {
      console.log('Service worker registered:', registration);
      
      // Check for updates
      if (config.updateOnReload) {
        registration.update().catch((error) => {
          console.error('Error updating service worker:', error);
        });
      }
      
      // Handle updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker is available
                console.log('New service worker is available');
                
                if (config.onUpdated) {
                  config.onUpdated(registration);
                }
              } else {
                // Service worker is installed for the first time
                console.log('Service worker installed for the first time');
              }
            }
          };
        }
      };
      
      // Call registered callback
      if (config.onRegistered) {
        config.onRegistered(registration);
      }
      
      return registration;
    })
    .catch((error) => {
      console.error('Error registering service worker:', error);
      
      // Call error callback
      if (config.onError) {
        config.onError(error);
      }
      
      throw error;
    });
}

/**
 * Unregister the service worker
 */
export function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }
  
  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.unregister();
    })
    .then((success) => {
      console.log('Service worker unregistered:', success);
      return success;
    })
    .catch((error) => {
      console.error('Error unregistering service worker:', error);
      return false;
    });
}

/**
 * Check if the service worker is registered
 */
export function isServiceWorkerRegistered(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }
  
  return navigator.serviceWorker.getRegistration()
    .then((registration) => {
      return !!registration;
    })
    .catch(() => {
      return false;
    });
}

/**
 * Send a message to the service worker
 */
export function sendMessageToServiceWorker(message: any): Promise<any> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return Promise.reject(new Error('No active service worker'));
  }
  
  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };
    
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

/**
 * Request a background sync
 */
export function requestBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return Promise.reject(new Error('Background sync not supported'));
  }
  
  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.sync.register(tag);
    })
    .then(() => {
      console.log('Background sync registered:', tag);
    })
    .catch((error) => {
      console.error('Error registering background sync:', error);
      throw error;
    });
}

/**
 * Subscribe to push notifications
 */
export function subscribeToPushNotifications(applicationServerKey: string): Promise<PushSubscription> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return Promise.reject(new Error('Push notifications not supported'));
  }
  
  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
      });
    })
    .then((subscription) => {
      console.log('Push notification subscription:', subscription);
      return subscription;
    })
    .catch((error) => {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    });
}

/**
 * Convert URL-safe base64 to Uint8Array
 * (Required for push notification subscription)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Auto-register service worker if immediate is true
if (defaultConfig.enabled && defaultConfig.immediate) {
  registerServiceWorker().catch((error) => {
    console.error('Auto-registration of service worker failed:', error);
  });
}
