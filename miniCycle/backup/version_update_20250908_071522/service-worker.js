const CACHE_VERSION = 'v22'; // Keep your existing version
const STATIC_CACHE = `miniCycle-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `miniCycle-dynamic-${CACHE_VERSION}`;

// ✅ ADD: Function to detect if device should use lite version
function shouldUseLiteVersion() {
  try {
    // Check if user explicitly chose full version
    const forceFullVersion = localStorage.getItem('miniCycleForceFullVersion');
    if (forceFullVersion === 'true') {
      console.log('🚀 User explicitly chose full version - allowing cache');
      return false;
    }
    
    // Device capability detection (same logic as your main app)
    const userAgent = navigator.userAgent.toLowerCase();
    const isOldDevice = 
      /android [1-4]\./i.test(userAgent) ||
      /chrome\/[1-4][0-9]\./i.test(userAgent) ||
      /firefox\/[1-4][0-9]\./i.test(userAgent) ||
      /safari\/[1-7]\./i.test(userAgent) ||
      /msie|trident/i.test(userAgent);
    
    const hasLowMemory = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const hasSlowConnection = navigator.connection && 
      (navigator.connection.effectiveType === 'slow-2g' || 
       navigator.connection.effectiveType === '2g' || 
       navigator.connection.effectiveType === '3g');
    
    const shouldUseLite = isOldDevice || hasLowMemory || hasSlowConnection;
    
    if (shouldUseLite) {
      console.log('📱 Old device detected - disabling PWA cache to prevent getting stuck');
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('⚠️ Error detecting device capabilities:', error);
    return false;
  }
}

// ✅ MODIFIED: Only cache for modern devices
const STATIC_ASSETS = [
  './',
  './miniCycle.html',
  './miniCycle-lite.html',
  './miniCycle-styles.css', 
  './miniCycle-scripts.js',
  './miniCycle-lite-scripts.js',
  './miniCycle-lite-styles.css',
  './user-manual.html',
  './user-manual-styles.css',
  './assets/images/logo/taskcycle_logo_blackandwhite_transparent.png',
  './assets/images/logo/App_Name_tp_bw.png',
  './assets/images/logo/logo.png',
  './assets/images/logo/app_name.png',
  './manifest.json'
];

// ✅ MODIFIED: Install event with device detection
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  // ✅ Check if this device should use lite version
  if (shouldUseLiteVersion()) {
    console.log('📱 Lite device detected - skipping cache installation');
    // Skip caching for lite devices
    self.skipWaiting();
    return;
  }
  
  // ✅ Normal caching for modern devices
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('💾 Caching static assets for modern device');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Failed to cache assets:', error);
      })
  );
});

// ✅ MODIFIED: Fetch event with device-aware caching
self.addEventListener('fetch', event => {
  // ✅ Skip caching for lite devices
  if (shouldUseLiteVersion()) {
    console.log('📱 Lite device - bypassing cache for:', event.request.url);
    // Always fetch from network for lite devices
    event.respondWith(fetch(event.request));
    return;
  }
  
  // ✅ Normal caching strategy for modern devices
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('💾 Serving from cache:', event.request.url);
            return response;
          }
          
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
        .catch(error => {
          console.error('❌ Fetch failed:', error);
          throw error;
        })
    );
  }
});

// ✅ MODIFIED: Activate event with lite device cleanup
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activated');
  
  // ✅ Clear all caches for lite devices
  if (shouldUseLiteVersion()) {
    console.log('📱 Lite device - clearing all caches');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Deleting cache for lite device:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('✅ All caches cleared for lite device');
        return self.clients.claim();
      })
    );
    return;
  }
  
  // ✅ Normal cache cleanup for modern devices
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName.startsWith('miniCycle-') && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE;
          })
          .map(cacheName => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('✅ Service Worker activated and old caches cleaned');
      return self.clients.claim();
    })
  );
});

// ✅ ADD: Message handler for manual cache clearing
self.addEventListener('message', event => {
  console.log('📨 Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ Manual cache clear requested');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('✅ All caches manually cleared');
        // Notify the client that cache is cleared
        event.ports[0].postMessage({success: true});
      }).catch(error => {
        console.error('❌ Failed to clear cache:', error);
        event.ports[0].postMessage({success: false, error: error.message});
      })
    );
  }
});