const CACHE_VERSION = 'v1'; // ← bump this when you deploy
const STATIC_CACHE = `miniCycle-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll([
      './miniCycle.html',
      './miniCycle-styles.css',
      './miniCycle-scripts.js',
      './user-manual.html',
      './user-manual-styles.css',
      './assets/images/logo/taskcycle_logo_blackandwhite_transparent.png',
      './assets/images/logo/App_Name_tp_bw.png',
      './manifest.json',
      // Add any other critical assets
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k.startsWith('miniCycle-') && k !== STATIC_CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first for HTML so edits show immediately; cache-first for assets.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(STATIC_CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  }
});