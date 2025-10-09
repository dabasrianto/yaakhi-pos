const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `pos-keren-${CACHE_VERSION}`;
const STATIC_CACHE = `pos-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pos-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `pos-images-${CACHE_VERSION}`;

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
  'https://cdn.lineicons.com/4.0/lineicons.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Max cache size
const MAX_CACHE_SIZE = 50;
const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES).catch((error) => {
          console.error('[SW] Error caching static files:', error);
          // Don't fail installation if some files fail to cache
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('pos-') &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Helper function to limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    console.log(`[SW] Cache ${cacheName} exceeded ${maxSize} items, cleaning up`);
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxSize);
  }
}

// Helper function to check if response is valid
function isValidResponse(response) {
  return response &&
         response.status === 200 &&
         response.type === 'basic';
}

// Helper function to check if request should be cached
function shouldCache(request) {
  const url = new URL(request.url);

  // Don't cache Firebase/Firestore requests
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('firestore') ||
      url.hostname.includes('google-analytics')) {
    return false;
  }

  // Don't cache auth requests
  if (url.pathname.includes('/auth/')) {
    return false;
  }

  return true;
}

// Fetch event - Network First with Cache Fallback for dynamic content
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip requests that shouldn't be cached
  if (!shouldCache(request)) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache First strategy for static assets (CSS, JS, fonts, images)
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'image') {

    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (isValidResponse(response)) {
            const cacheName = request.destination === 'image' ? IMAGE_CACHE : STATIC_CACHE;
            const responseToCache = response.clone();

            caches.open(cacheName).then((cache) => {
              cache.put(request, responseToCache);
              limitCacheSize(cacheName, MAX_CACHE_SIZE);
            });
          }

          return response;
        }).catch(() => {
          // Return offline fallback if available
          return caches.match(request);
        });
      })
    );
    return;
  }

  // Network First strategy for HTML and API requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (isValidResponse(response)) {
          const responseToCache = response.clone();

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
            limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
          });
        }

        return response;
      })
      .catch(() => {
        // Try to return cached version
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }

          // Return a custom offline response
          return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'pos-data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let notificationData = {
    title: 'POS Keren',
    body: 'Notifikasi dari POS Keren',
    icon: '/icon.svg',
    badge: '/icon.svg'
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon.svg',
    badge: notificationData.badge || '/icon.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.primaryKey || 1,
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Buka',
        icon: '/icon.svg'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icon.svg'
      }
    ],
    tag: notificationData.tag || 'pos-notification',
    requireInteraction: false,
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');

    // Get all clients
    const allClients = await clients.matchAll({ includeUncontrolled: true });

    // Send sync message to all clients
    allClients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_DATA',
        timestamp: Date.now()
      });
    });

    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Error syncing offline data:', error);
    throw error;
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName.startsWith('pos-')) {
                console.log('[SW] Clearing cache:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        }).then(() => {
          event.ports[0].postMessage({ success: true });
        })
      );
      break;

    case 'CACHE_URLS':
      if (event.data.urls && Array.isArray(event.data.urls)) {
        event.waitUntil(
          caches.open(DYNAMIC_CACHE).then((cache) => {
            return cache.addAll(event.data.urls);
          }).then(() => {
            event.ports[0].postMessage({ success: true });
          })
        );
      }
      break;

    default:
      console.log('[SW] Unknown message type:', event.data.type);
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'content-sync') {
    event.waitUntil(syncOfflineData());
  }
});

console.log('[SW] Service Worker loaded:', CACHE_VERSION);