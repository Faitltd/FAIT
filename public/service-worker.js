/**
 * FAIT Co-op Service Worker
 *
 * This service worker provides offline support, background syncing,
 * and advanced caching strategies for the FAIT Co-op platform.
 */

// Cache names
const CACHE_NAMES = {
  static: 'static-cache-v1',
  dynamic: 'dynamic-cache-v1',
  images: 'images-cache-v1',
  fonts: 'fonts-cache-v1',
  api: 'api-cache-v1',
  documents: 'documents-cache-v1'
};

// Resources to cache immediately on install
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  // Skip waiting to activate immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[Service Worker] Caching static resources');
        // Use individual cache.add calls instead of cache.addAll to handle failures gracefully
        return Promise.all(
          STATIC_RESOURCES.map(url =>
            cache.add(url).catch(error => {
              console.error(`[Service Worker] Failed to cache ${url}:`, error);
              // Continue despite the error
              return Promise.resolve();
            })
          )
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  // Claim clients to control all open tabs
  self.clients.claim();

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any cache that's not in our current cache names
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request, CACHE_NAMES.api));
    return;
  }

  // Image requests - cache first, then network
  if (event.request.destination === 'image' ||
      url.pathname.match(/\.(png|jpg|jpeg|svg|gif)$/)) {
    event.respondWith(cacheFirstStrategy(event.request, CACHE_NAMES.images));
    return;
  }

  // Font requests - cache first, then network
  if (event.request.destination === 'font' ||
      url.pathname.match(/\.(woff|woff2|ttf|otf)$/)) {
    event.respondWith(cacheFirstStrategy(event.request, CACHE_NAMES.fonts));
    return;
  }

  // Document requests - network first, then cache, then offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithOfflineStrategy(event.request, CACHE_NAMES.static)
    );
    return;
  }

  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidateStrategy(event.request, CACHE_NAMES.dynamic));
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);

  let data = { title: 'New Notification', body: 'You have a new notification.' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
  }

  const options = {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Cache strategies
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Clone the response to store in cache
    const responseToCache = networkResponse.clone();

    // Update the cache in the background
    caches.open(cacheName).then((cache) => {
      cache.put(request, responseToCache);
    });

    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || Promise.reject('No network and no cache');
  }
}

async function cacheFirstStrategy(request, cacheName) {
  // Try cache first
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then((networkResponse) => {
        caches.open(cacheName).then((cache) => {
          cache.put(request, networkResponse);
        });
      })
      .catch(() => {
        // Ignore network errors
      });

    return cachedResponse;
  }

  // If not in cache, get from network and cache
  try {
    const networkResponse = await fetch(request);

    // Clone the response to store in cache
    const responseToCache = networkResponse.clone();

    // Update the cache
    caches.open(cacheName).then((cache) => {
      cache.put(request, responseToCache);
    });

    return networkResponse;
  } catch (error) {
    return Promise.reject('Not in cache and network failed');
  }
}

async function staleWhileRevalidateStrategy(request, cacheName) {
  // Try cache first
  const cachedResponse = await caches.match(request);

  // Fetch from network to update cache (don't await)
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      caches.open(cacheName).then((cache) => {
        cache.put(request, networkResponse.clone());
      });
      return networkResponse;
    })
    .catch(() => {
      // Return null if network fetch fails
      return null;
    });

  // Return cached response immediately if available
  return cachedResponse || fetchPromise;
}

async function networkFirstWithOfflineStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Clone the response to store in cache
    const responseToCache = networkResponse.clone();

    // Update the cache in the background
    caches.open(cacheName).then((cache) => {
      cache.put(request, responseToCache);
    });

    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, return offline page
    return caches.match('/offline.html');
  }
}

// Background sync functions
async function syncMessages() {
  // Get pending messages from IndexedDB
  const pendingMessages = await getPendingMessages();

  // Send each message to the server
  const sendPromises = pendingMessages.map(async (message) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        // Mark message as sent
        await markMessageAsSent(message.id);
      }
    } catch (error) {
      console.error('[Service Worker] Failed to sync message:', error);
    }
  });

  return Promise.all(sendPromises);
}

async function syncBookings() {
  // Implementation similar to syncMessages
  // Will be implemented when the IndexedDB structure is defined
  return Promise.resolve();
}

// Helper functions for IndexedDB operations
// These will be implemented when the IndexedDB structure is defined
async function getPendingMessages() {
  return [];
}

async function markMessageAsSent(id) {
  return Promise.resolve();
}
