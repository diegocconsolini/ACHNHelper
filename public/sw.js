// Service worker for ACNH Helper Suite — app-shell offline strategy.
//
// What we cache:
//   - GETs to /_next/static/* (chunks/CSS, immutable, long TTL)
//   - GETs to / and /app (HTML shell)
//   - GETs to /assets-web/* (sprite manifest + WebP files)
//
// What we DON'T cache:
//   - /api/* — always network; user data must stay fresh
//   - /api/auth/* — auth flows must hit the network
//   - POST/PUT/DELETE — never cached
//
// Strategy: stale-while-revalidate for HTML shell, cache-first for static
// assets, network-only for everything else.

const CACHE_NAME = 'acnh-portal-v1';
const SHELL_URLS = ['/', '/app'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets-web/');
}

function isShell(url) {
  return url.pathname === '/' || url.pathname === '/app';
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (isStaticAsset(url)) {
    // Cache-first
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        }).catch(() => cached || Response.error());
      })
    );
    return;
  }

  if (isShell(url)) {
    // Stale-while-revalidate
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkPromise = fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        }).catch(() => cached);
        return cached || networkPromise;
      })
    );
  }
});
