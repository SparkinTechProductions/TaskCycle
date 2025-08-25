self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('miniCycle-cache').then((cache) => {
      return cache.addAll([
        './miniCycle.html',
        './miniCycle-styles.css',
        './miniCycle-scripts.js',
        './assets/images/logo/taskcycle_logo_blackandwhite_transparent.png',
        './assets/images/logo/App_Name_tp_bw.png',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});