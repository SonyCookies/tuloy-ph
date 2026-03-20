const CACHE_NAME = 'tuloyph-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Required by browsers to mark the app as installable.
  // We can add caching logic here later for offline support.
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cacheResponse = await caches.match(event.request);
      if (cacheResponse) {
        return cacheResponse;
      }
      // If fetch fails and nothing in cache, return a simple error response
      // This prevents the "Uncaught (in promise) TypeError: Failed to convert value to 'Response'" error.
      return new Response('Network error occurred', {
        status: 408,
        statusText: 'Network error occurred',
      });
    })
  );
});
