/**
 * Service Worker Registration
 * 
 * This file handles the registration and updates of the service worker
 * with proper error handling and resilience.
 */

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

// Check if the app is running in development mode
const isDevelopment = import.meta.env.DEV;

/**
 * Register the service worker
 * 
 * @param {Object} config - Configuration options
 * @returns {Promise<ServiceWorkerRegistration|null>} - Service worker registration or null
 */
export const registerServiceWorker = async (config = {}) => {
  const {
    swUrl = '/service-worker.js',
    onSuccess = null,
    onUpdate = null,
    onError = null,
  } = config;
  
  // Don't register service worker in development by default
  if (isDevelopment && !config.enableInDevelopment) {
    console.log('Service worker registration skipped in development');
    return null;
  }
  
  // Check if service workers are supported
  if (!isServiceWorkerSupported) {
    console.warn('Service workers are not supported in this browser');
    return null;
  }
  
  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register(swUrl);
    console.log('Service worker registered:', registration);
    
    // Handle updates
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      
      if (!installingWorker) {
        return;
      }
      
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // At this point, the updated precached content has been fetched,
            // but the previous service worker will still serve the older
            // content until all client tabs are closed.
            console.log('New content is available and will be used when all tabs for this page are closed.');
            
            // Execute callback
            if (onUpdate) {
              onUpdate(registration);
            }
          } else {
            // At this point, everything has been precached.
            // It's the perfect time to display a "Content is cached for offline use." message.
            console.log('Content is cached for offline use.');
            
            // Execute callback
            if (onSuccess) {
              onSuccess(registration);
            }
          }
        }
      };
    };
    
    return registration;
  } catch (error) {
    console.error('Error updating service worker:', error);
    
    // Execute error callback
    if (onError) {
      onError(error);
    }
    
    return null;
  }
};

/**
 * Unregister all service workers
 * 
 * @returns {Promise<boolean>} - True if unregistration was successful
 */
export const unregisterServiceWorker = async () => {
  if (!isServiceWorkerSupported) {
    return false;
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    console.log('Service workers unregistered');
    return true;
  } catch (error) {
    console.error('Error unregistering service workers:', error);
    return false;
  }
};

/**
 * Check if the service worker is active
 * 
 * @returns {Promise<boolean>} - True if service worker is active
 */
export const isServiceWorkerActive = async () => {
  if (!isServiceWorkerSupported) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return !!registration.active;
  } catch (error) {
    console.error('Error checking service worker status:', error);
    return false;
  }
};

/**
 * Update the service worker
 * 
 * @returns {Promise<boolean>} - True if update was successful
 */
export const updateServiceWorker = async () => {
  if (!isServiceWorkerSupported) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service worker updated');
    return true;
  } catch (error) {
    console.error('Error updating service worker:', error);
    return false;
  }
};

/**
 * Send a message to the service worker
 * 
 * @param {Object} message - Message to send
 * @returns {Promise<any>} - Response from service worker
 */
export const sendMessageToServiceWorker = async (message) => {
  if (!isServiceWorkerSupported) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (!registration.active) {
      console.warn('No active service worker found');
      return null;
    }
    
    // Create a message channel
    const messageChannel = new MessageChannel();
    
    // Return a promise that resolves with the response
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      registration.active.postMessage(message, [messageChannel.port2]);
    });
  } catch (error) {
    console.error('Error sending message to service worker:', error);
    return null;
  }
};
