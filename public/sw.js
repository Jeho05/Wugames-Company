const CACHE_NAME = "wugams-v3";
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

  // FIX v3: ne JAMAIS intercepter le cross-origin (Unsplash, fonts, CDN)
  // Laisser le navigateur gérer directement = images s'affichent, pas de latence SW, pas de fallback HTML corrompu
  const isCrossOrigin = url.origin !== self.location.origin;
  if (isCrossOrigin) return;

  const isApi = url.pathname.startsWith("/api/");
  const isNextStatic = url.pathname.startsWith("/_next/");
  const isNextImage = url.pathname === "/_next/image";
  const isNavigate = request.mode === "navigate" || request.destination === "document";

  // API : network-only, jamais de cache/fallback HTML
  if (isApi) return;

  // Navigation (pages) : network-first avec fallback offline propre
  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Ne cacher que les HTML 200 réels, pas les redirects/erreurs
          if (res.ok && res.headers.get("content-type")?.includes("text/html")) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => undefined);
          }
          return res;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // _next/image (optimisation Next) : stale-while-revalidate, pas de blocage
  if (isNextImage) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => undefined);
            }
            return res;
          })
          .catch(() => cached || Response.error());
        return cached || network;
      })
    );
    return;
  }

  // Assets statiques Next : cache-first (immutable)
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

  // Par défaut : network-only, pas de fallback HTML (évite de servir HTML à la place d'images/JS)
});
