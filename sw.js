// =======================
// 🔁 CACHE VERSIONING
// =======================
const CACHE_NAME = 'toolhub-cache-v4'; // ⬅️ Update this every time you change assets

const ASSETS_TO_CACHE = [
  '/', '/index.html', '/404.html', '/offline.html',
  '/contacts.html', '/parameter-comparison.html', '/rej603-configurator.html',
  '/tools-data.json', '/manifest.json',

  // JavaScript
  '/js/common.js', '/js/contacts.js', '/js/papaparse.min.js',
  '/js/parameter-comparison.js', '/js/tools-hub.js',

  // CSS
  '/css/parameter-comparison.css', '/css/rej603-configurator.css', '/css/shared-styles.css',

  // Icons
  '/icons/icon-72.png', '/icons/icon-96.png', '/icons/icon-128.png',
  '/icons/icon-144.png', '/icons/icon-152.png', '/icons/icon-192.png',
  '/icons/icon-256.png', '/icons/icon-384.png', '/icons/icon-512.png',
  '/icons/ToolHUB.ico',

  // Images
  '/images/ABB_LOGO.png', '/images/CLAUDE_LOGO.png', '/images/COE_LOGO.png',
  '/images/CONTACT_ANDRES.png', '/images/CONTACT_CRISTHIAN.png', '/images/CONTACT_FABIO.png',
  '/images/CONTACT_FELIPE.png', '/images/CONTACT_GABRIEL.png', '/images/CONTACT_JAVIER.png',
  '/images/CONTACT_LUCAS.png', '/images/CONTACT_MAURICIO.png', '/images/contact-icon.png',
  '/images/hmm-character.png', '/images/hmm-character.webp',
  '/images/LOGO.png', '/images/placeholder.png', '/images/resource-icon.png',
  '/images/SIMPLE_LOGO.png', '/images/Sungrow-logo.png',
  '/images/tool-hub-banner.png', '/images/tool-hub-banner.svg',
  '/images/training-icon.png', '/images/wink-character.png', '/images/wink-character.webp',
];

// =======================
// ⚙️ INSTALL EVENT
// =======================
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// =======================
// ♻️ ACTIVATE EVENT
// =======================
self.addEventListener('activate', event => {
  console.log('[SW] Activating new version...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Take control immediately
});

// =======================
// 🌐 FETCH EVENT
// =======================
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).catch(() => caches.match('/offline.html'));
      })
    );
    return;
  }

  // Fallback for all other assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

// =======================
// 💬 MESSAGE HANDLER
// =======================
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING command');
    self.skipWaiting();
  }
});