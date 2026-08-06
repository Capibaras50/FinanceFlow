/* Finance Flow - Service Worker */
const CACHE_VERSION = 'finance-flow-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-96.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache cross-origin requests (e.g. the API or Cloudinary uploads).
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations: serve the app shell from cache when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_VERSION)
            .then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() =>
          caches
            .match('/index.html', { cacheName: CACHE_VERSION })
            .then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Stale-while-revalidate for same-origin static assets (JS/CSS/images/icons).
  // API responses (JSON) are never cached: they always hit the network so that
  // created/updated data shows up immediately without a page reload.
  event.respondWith(
    caches.match(request, { cacheName: CACHE_VERSION }).then((cached) => {
      const networkFetch = fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
