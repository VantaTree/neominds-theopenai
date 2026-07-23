const CACHE_NAME = "theopenai-pwa-v1";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/logos/logo_mini.png",
  "/icons/pwa-192x192.png",
  "/icons/pwa-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/maskable-icon-512x512.png",
];

// Install event - Pre-cache core shell resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - Clean old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event handling strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip non-GET requests and browser extensions / external scheme calls
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first for navigation/HTML requests to always serve fresh content when online
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match("/");
          });
        })
    );
    return;
  }

  // Cache-first for static assets (images, stylesheets, scripts, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next load (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {/* ignore network errors on background fetch */});

        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200 && request.url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
