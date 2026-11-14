const CACHE_NAME = "inote-webapps-v1.3.4";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./apps.json",
  "./app-history.json",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./App/resin_calculator.html",
  "./App/triangle_solver.html",
  "./App/pack_cover_calculator.html",
  "./App/bolt_length_calculator.html",
  "./App/unit_converter.html",
  "./App/torque_converter.html",
  "./App/torque_extension_calculator.html"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith("inote-webapps-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation: always try the network first so each app opens from the latest
  // deployed file. Use the cached copy only when the device is offline.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          const cacheKey = new Request(url.origin + url.pathname);
          await cache.put(cacheKey, response.clone());
        }
        return response;
      } catch (_) {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        const home = await caches.match("./index.html");
        return home || new Response("오프라인 상태입니다.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })());
    return;
  }

  // Pre-cached static resources: cache first, then refresh from the network.
  const isPrecached = PRECACHE_URLS.some(path =>
    new URL(path, self.location.href).pathname === url.pathname
  );
  if (!isPrecached) return;

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_) {
      return new Response("오프라인 상태입니다.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
