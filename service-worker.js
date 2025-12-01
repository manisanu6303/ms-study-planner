// Bump version whenever you change HTML/CSS/JS
const CACHE_NAME = "ms-study-planner-v3";

const URLS_TO_CACHE = [
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
  // NOTE: we are NOT caching index.html here
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// Clean up old caches when we activate a new service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Network-first for navigation requests (index.html / page loads)
// Cache-first for static assets (icons, manifest, etc.)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // For page navigations (like opening the app URL)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          // Optionally cache the latest index.html
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() =>
          caches.match(req).then((res) => res || caches.match("/"))
        )
    );
    return;
  }

  // For everything else: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
