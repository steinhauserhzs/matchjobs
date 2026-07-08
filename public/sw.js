/* MatchJobs PWA — service worker
 * Estratégia: network-first para navegação (conteúdo sempre fresco,
 * fallback offline ao cache) e cache-first para assets estáticos. */
const CACHE = "matchjobs-v2";
const CORE = [
  "/",
  "/empresa",
  "/hunter",
  "/admin",
  "/manifest.webmanifest",
  "/hero.png",
  "/hero-calm.png",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((r) => {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put(request, cp));
          return r;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  e.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((r) => {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put(request, cp));
          return r;
        }),
    ),
  );
});
