const CACHE_NAME = "inote-webapps-v1.2.0";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./apps.json",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./App/resin_calculator_web_v2.html",
  "./App/triangle_solver_v3.html",
  "./App/PackCoverCalc.html",
  "./App/hex_bolt_calculator_web_v2.html",
  "./App/text_converter.html",
  "./App/unit_coverter_v3.html",
  "./App/torque_web_converter_v3.html",
  "./App/torque_web_calculator_v2.html"
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
    await Promise.all(keys.filter(key => key.startsWith("inote-webapps-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML pages and app shell: serve cached copy first for reliable offline access.
  if (request.mode === "navigate" || PRECACHE_URLS.some(path => new URL(path, self.location.href).pathname === url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        const fallback = await caches.match("./index.html");
        return fallback || new Response("오프라인 상태입니다.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
  }
});
