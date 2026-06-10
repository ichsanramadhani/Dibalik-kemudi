const CACHE_NAME = "latio-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install
self.addEventListener("install", (event) => {
  console.log("SW Installed");

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("SW Activated");

  event.waitUntil(
    Promise.all([
      self.clients.claim(),

      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("Deleting old cache:", cache);
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {

            if (
              event.request.method === "GET" &&
              networkResponse.status === 200
            ) {
              const responseClone = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }

            return networkResponse;
          });
      })
  );
});

// Listen update request from page
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});