// A service worker for caching app assets to enable offline functionality.

const CACHE_NAME = 'sublimequest-cache-v2';
// Core files for the app shell. External CDN assets are intentionally
// excluded to avoid install failures when offline; they'll be fetched
// on demand and cached at runtime by the fetch handler.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event: opens a cache and adds the core app shell files to it.
self.addEventListener('install', (event) => {
  // Activate the new service worker as soon as it's finished installing.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache assets during install:', err);
      })
  );
});

// Fetch event: serve static assets from cache, use network-first for APIs.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first strategy for API or cross-origin requests.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Only cache static assets and navigation requests.
  if (
    event.request.mode === 'navigate' ||
    ['style', 'script', 'image', 'font'].includes(event.request.destination)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => caches.match('/index.html'));
      })
    );
  }
});

// Activate event: removes old caches to keep things clean.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
