const CACHE_NAME = 'toolhub-cache-v1';
const ASSETS_TO_CACHE = [
  '/', // Root entry point
  '/index.html',
  '/404.html',
  '/offline.html',
  '/contacts.html',
  '/parameter-comparison.html',
  '/rej603-configurator.html',
  '/tools-data.json',
  '/manifest.json',

  // JavaScript files
  '/js/common.js',
  '/js/contacts.js',
  '/js/papaparse.min.js',
  '/js/parameter-comparison.js',
  '/js/tools-hub.js',

  // CSS files
  '/css/parameter-comparison.css',
  '/css/rej603-configurator.css',
  '/css/shared-styles.css',

  // PWA Icons
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-256.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/icons/ToolHUB.ico',

  // Image assets
  '/images/ABB_LOGO.png',
  '/images/CLAUDE_LOGO.png',
  '/images/COE_LOGO.png',
  '/images/CONTACT_ANDRES.png',
  '/images/CONTACT_CRISTHIAN.png',
  '/images/CONTACT_FABIO.png',
  '/images/CONTACT_FELIPE.png',
  '/images/CONTACT_GABRIEL.png',
  '/images/CONTACT_JAVIER.png',
  '/images/CONTACT_LUCAS.png',
  '/images/CONTACT_MAURICIO.png',
  '/images/contact-icon.png',
  '/images/hmm-character.png',
  '/images/hmm-character.webp',
  '/images/LOGO.png',
  '/images/placeholder.png',
  '/images/resource-icon.png',
  '/images/SIMPLE_LOGO.png',
  '/images/Sungrow-logo.png',
  '/images/tool-hub-banner.png',
  '/images/tool-hub-banner.svg',
  '/images/training-icon.png'
];


// Install event: pre-cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate SW immediately
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: cache-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // Optional: fallback for offline
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});