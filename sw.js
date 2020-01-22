var cacheName = "the-conscious-timer";
// Specify all files that should be pre-cached
// A mask cannot be used here
var preCache = [
  "./",
  // Pre-cache the app shell components
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  // as long as SW is loaded after the page load I need to add
  // all the components into the pre-cache list
  "bell.wav",
  "images/bell-white.svg",
  "images/bell-color.svg",
  "images/icons/favicon.ico",
  "images/icons/icon-72x72.png",
  "images/icons/icon-96x96.png",
  "images/icons/icon-128x128.png",
  "images/icons/icon-144x144.png",
  "images/icons/icon-192x192.png",
  "images/icons/icon-384x384.png",
  "images/icons/icon-512x512.png"
];

self.addEventListener("install", event => {
  // Perform install steps
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    // Returns a promise to know how long installation takes,
    // and whether it succeeded or not.
    caches.open(cacheName).then(function(cache) {
      console.log("[ServiceWorker] Caching app shell");
      // If any of the files fail to download,
      // then the install step will fail.
      return cache.addAll(preCache);
    })
  );
});

// To serve data offline I need to add an event listener to "fetch"
self.addEventListener("fetch", event => {
  console.log("[ServiceWorker] Fetch data: ", event.request.url);
  event.respondWith(
    caches.match(event.request).then(response => {
      // This method looks at the request and finds any cached results
      // from any of the caches your service worker created.
      if (response) {
        return response;
      }
      return fetch(event.request).then(function(response) {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        var responseToCache = response.clone();

        caches.open(cacheName).then(function(cache) {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// When a service worker is activated
self.addEventListener("activate", event => {
  // it set itself as the controller for all clients within its scope.
  console.log("[ServiceWorker] Activate SW");
  event.waitUntil(self.clients.claim());
});
