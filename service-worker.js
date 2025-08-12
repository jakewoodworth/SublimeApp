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

// Fetch event: serves requests from cache if available, otherwise fetches from network.
self.addEventListener('fetch', (event) => {
  // Always go to the network for Gemini API calls.
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit: return the response from the cache.
      if (response) {
        return response;
      }

      // Not in cache: fetch from the network and cache it.
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
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
