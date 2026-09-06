/* Finance Flow - Service Worker */
const CACHE_VERSION = 'finance-flow-v3';
const SHARE_CACHE = 'finance-flow-shared-image';
const SHARE_TARGET_PATH = '/share-target';
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
  const url = new URL(request.url);

  // Web Share Target: the system share sheet POSTs the shared image here.
  // Stash it in a cache and redirect to the app, which picks it up on boot.
  if (request.method === 'POST' && url.pathname === SHARE_TARGET_PATH) {
    event.respondWith(
      (async () => {
        try {
          const formData = await request.formData();
          const file = formData.get('image');
          if (file) {
            const cache = await caches.open(SHARE_CACHE);
            await cache.put('/latest', new Response(file, { headers: { 'Content-Type': file.type || 'image/jpeg' } }));
          }
        } catch (e) {
          // Ignore and still open the app.
        }
        return Response.redirect('/?shared=1', 303);
      })()
    );
    return;
  }

  if (request.method !== 'GET') return;

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
