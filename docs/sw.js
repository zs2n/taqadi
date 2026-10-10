/* تقاضي الأخوياء — service worker
   يحفظ ملفات اللعبة عشان تفتح بسرعة، والقاضي نفسه يحتاج إنترنت. */
const VERSION = "taqadi-v1";
const SHELL = ["./", "index.html", "privacy.html", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;               // calls to the judge server go straight to the network
  const url = new URL(req.url);

  // fonts: serve from cache, refresh in the background
  if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // pages: network first so updates arrive, cache when offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
    return;
  }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
