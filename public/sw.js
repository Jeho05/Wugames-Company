const CACHE_NAME = "wugams-v2";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ne jamais intercepter les requêtes cross-origin d'images Unsplash en cache-first avec fallback HTML
  // On laisse le navigateur gérer, ou on fait network-only
  const isCrossOrigin = url.origin !== self.location.origin;
  const isApi = url.pathname.startsWith("/api/");
  const isNextStatic = url.pathname.startsWith("/_next/");
  const isNavigate = request.mode === "navigate" || request.destination === "document";

  // API : network-only, pas de fallback HTML
  if (isApi) {
    event.respondWith(fetch(request).catch(() => Response.error()));
    return;
  }

  // Cross-origin (images Unsplash, fonts) : network-first, pas de cache HTML
  if (isCrossOrigin) {
    event.respondWith(fetch(request).catch(() => Response.error()));
    return;
  }

  // Navigation (pages) : network-first avec fallback offline
  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => undefined);
          }
          return res;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Assets statiques Next : cache-first avec network fallback
  if (isNextStatic || url.pathname.match(/\.(?:js|css|woff2?|png|jpg|jpeg|gif|webp|avif|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => undefined);
            }
            return res;
          })
          .catch(() => Response.error());
      })
    );
    return;
  }

  // Par défaut : network-first sans fallback HTML
  event.respondWith(fetch(request).catch(() => Response.error()));
});
