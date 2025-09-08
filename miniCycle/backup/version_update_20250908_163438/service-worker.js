const CACHE_VERSION = 'v26'; // Keep your existing version
const STATIC_CACHE = `miniCycle-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `miniCycle-dynamic-${CACHE_VERSION}`;

// ✅ Function to detect if device should use lite version
function shouldUseLiteVersion() {
  try {
    // Check if user explicitly chose full version
    const forceFullVersion = localStorage.getItem('miniCycleForceFullVersion');
    if (forceFullVersion === 'true') {
      console.log('🚀 User explicitly chose full version - allowing full version cache');
      return false;
    }
    
    // Device capability detection
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
    
    return isOldDevice || hasLowMemory || hasSlowConnection;
  } catch (error) {
    console.warn('⚠️ Error detecting device capabilities:', error);
    return false;
  }
}

// ✅ SMART CACHING: Different assets for different devices
function getCacheAssets() {
  const isLiteDevice = shouldUseLiteVersion();
  
  const commonAssets = [
    './',
    './manifest.json',
    './assets/images/logo/taskcycle_logo_blackandwhite_transparent.png',
    './assets/images/logo/App_Name_tp_bw.png',
    './assets/images/logo/logo.png',
    './assets/images/logo/app_name.png'
  ];
  
  if (isLiteDevice) {
    // ✅ LITE DEVICE: Only cache lite version files
    console.log('📱 Lite device detected - caching lite version only');
    return [
      ...commonAssets,
      './miniCycle-lite.html',
      './miniCycle-lite-scripts.js',
      './miniCycle-lite-styles.css'
    ];
  } else {
    // ✅ MODERN DEVICE: Cache everything
    console.log('� Modern device detected - caching all versions');
    return [
      ...commonAssets,
      './miniCycle.html',
      './miniCycle-lite.html',
      './miniCycle-styles.css', 
      './miniCycle-scripts.js',
      './miniCycle-lite-scripts.js',
      './miniCycle-lite-styles.css',
      './user-manual.html',
      './user-manual-styles.css'
    ];
  }
}

// ✅ Install event with selective caching
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  const assetsToCache = getCacheAssets();
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('💾 Caching assets:', assetsToCache);
        return cache.addAll(assetsToCache);
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

// ✅ SMART FETCH: Block full version for lite devices
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isLiteDevice = shouldUseLiteVersion();
  
  // ✅ CRITICAL: Block full version files for lite devices
  if (isLiteDevice && isFullVersionFile(url.pathname)) {
    console.log('� Lite device - blocking full version file:', url.pathname);
    
    // ✅ Redirect full version requests to lite version
    if (url.pathname.includes('miniCycle.html') && !url.pathname.includes('lite')) {
      console.log('🔄 Redirecting full version to lite version');
      event.respondWith(
        Response.redirect('./miniCycle-lite.html', 302)
      );
      return;
    }
    
    // ✅ Block other full version assets
    event.respondWith(
      new Response('', {
        status: 204,
        statusText: 'Blocked for lite device'
      })
    );
    return;
  }
  
  // ✅ Normal cache-first strategy for allowed files
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
              
              // ✅ Only cache if it's an allowed file for this device
              const shouldCache = isLiteDevice ? 
                isLiteVersionFile(url.pathname) : 
                true; // Modern devices can cache everything
              
              if (shouldCache) {
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              
              return response;
            });
        })
        .catch(error => {
          console.error('❌ Fetch failed:', error);
          
          // ✅ Fallback: redirect to lite version if full version fails
          if (isLiteDevice && url.pathname.includes('miniCycle.html')) {
            return caches.match('./miniCycle-lite.html');
          }
          
          throw error;
        })
    );
  }
});

// ✅ Helper function to check if file is full version
function isFullVersionFile(pathname) {
  const fullVersionFiles = [
    '/miniCycle.html',
    '/miniCycle-styles.css',
    '/miniCycle-scripts.js',
    '/user-manual.html',
    '/user-manual-styles.css'
  ];
  
  return fullVersionFiles.some(file => 
    pathname.endsWith(file) || pathname.includes(file)
  );
}

// ✅ Helper function to check if file is lite version
function isLiteVersionFile(pathname) {
  const liteVersionFiles = [
    '/miniCycle-lite.html',
    '/miniCycle-lite-styles.css',
    '/miniCycle-lite-scripts.js'
  ];
  
  return liteVersionFiles.some(file => 
    pathname.endsWith(file) || pathname.includes(file)
  ) || pathname === '/' || pathname.includes('assets/images/');
}

// ✅ Activate event with smart cleanup
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activated');
  
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

// ✅ Message handler for cache management
self.addEventListener('message', event => {
  console.log('📨 Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  
  if (event.data && event.data.type === 'CLEAR_FULL_VERSION_CACHE') {
    console.log('🗑️ Clearing full version cache for lite device');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.open(cacheName).then(cache => {
              return cache.keys().then(requests => {
                return Promise.all(
                  requests.map(request => {
                    const url = new URL(request.url);
                    if (isFullVersionFile(url.pathname)) {
                      console.log('🗑️ Deleting full version file from cache:', url.pathname);
                      return cache.delete(request);
                    }
                  })
                );
              });
            });
          })
        );
      }).then(() => {
        console.log('✅ Full version files cleared from cache');
        event.ports[0].postMessage({success: true});
      }).catch(error => {
        console.error('❌ Failed to clear full version cache:', error);
        event.ports[0].postMessage({success: false, error: error.message});
      })
    );
  }
}); 