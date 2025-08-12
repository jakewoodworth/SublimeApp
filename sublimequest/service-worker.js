// A service worker for caching app assets to enable offline functionality.

const CACHE_NAME = 'sublimequest-cache-v1';
// These are the core files for the app shell.
// Other assets (JS modules, etc.) will be cached on-the-fly by the fetch handler.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap',
];

// Install event: opens a cache and adds the core app shell files to it.
self.addEventListener('install', (event) => {
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
    caches.match(event.request)
      .then((response) => {
        // Cache hit: return the response from the cache.
        if (response) {
          return response;
        }

        // Not in cache: fetch from the network.
        return fetch(event.request).then(
          (response) => {
            // If the response is valid, cache it for future use.
            if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          }
        );
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
    })
  );
});
