const CACHE_VERSION = 'v13'; // ✅ Updated version
const STATIC_CACHE = `miniCycle-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `miniCycle-dynamic-${CACHE_VERSION}`;

// ✅ Define what files to cache on install
const STATIC_ASSETS = [
  './',
  './miniCycle.html',
  './miniCycle-styles.css', 
  './miniCycle-scripts.js',
  './miniCycle-lite-scripts.js',
  './miniCycle-styles.css',
  './miniCycle-lite-styles.css',
  './user-manual.html',
  './user-manual-styles.css',
  './assets/images/logo/taskcycle_logo_blackandwhite_transparent.png',
  './assets/images/logo/App_Name_tp_bw.png',
  './manifest.json'
];



// ✅ Install event with better error handling
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ✅ Activate event with better cache cleanup
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => 
        Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('miniCycle-') && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        )
      ),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activated successfully');
    })
  );
});

// ✅ Improved fetch strategy with better error handling
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // ✅ Don't cache redirect decisions
  if (event.request.url.includes('miniCycle.html') || 
      event.request.url.includes('miniCycle-lite.html')) {
    
    // ✅ Always check for device compatibility on HTML requests
    event.respondWith(
      fetch(event.request).catch(function() {
        // ✅ Fallback to cache only if network fails
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // ✅ Handle different resource types
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    // Network-first for HTML documents
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // Cache-first for CSS/JS with fallback
    event.respondWith(handleAssetRequest(request));
  } else {
    // Stale-while-revalidate for other assets
    event.respondWith(handleOtherRequest(request));
  }
});

// ✅ Network-first strategy for HTML documents
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Update cache with fresh content
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline page or error
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ✅ Cache-first strategy for CSS/JS assets
async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch asset:', request.url, error);
    return new Response('Asset not available offline', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// ✅ Stale-while-revalidate for other resources
async function handleOtherRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Return cached version immediately if available
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.log('[SW] Network error for:', request.url);
    return cachedResponse || new Response('Resource not available', {
      status: 404
    });
  });
  
  return cachedResponse || fetchPromise;
}

// ✅ Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received skip waiting message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
      caches: [STATIC_CACHE, DYNAMIC_CACHE]
    });
  }
});

// ✅ Log service worker lifecycle
console.log('[SW] Service Worker script loaded');