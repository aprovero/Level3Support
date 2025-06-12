// =======================
// 🔁 CACHE VERSIONING
// =======================
const CACHE_NAME = 'toolhub-cache-v9'; // ⬅️ Update this every time you change assets

const ASSETS_TO_CACHE = [
  '/index.html', '/404.html', '/offline.html',
  '/contacts.html', '/parameter-comparison.html', '/rej603-configurator.html',
  '/tools-data.json', '/manifest.json',

  // JavaScript files
  '/js/common.js', '/js/contacts.js', '/js/papaparse.min.js',
  '/js/parameter-comparison.js', '/js/tools-hub.js',

  // CSS files
  '/css/parameter-comparison.css', '/css/rej603-configurator.css', '/css/shared-styles.css',

  // Icons
  '/icons/icon-72.png', '/icons/icon-96.png', '/icons/icon-128.png',
  '/icons/icon-144.png', '/icons/icon-152.png', '/icons/icon-192.png',
  '/icons/icon-256.png', '/icons/icon-384.png', '/icons/icon-512.png',
  '/icons/ToolHUB.ico',

  // Images
  '/images/ABB_LOGO.png', '/images/CLAUDE_LOGO.png', '/images/COE_LOGO.png',
  '/images/CONTACT_ANDRES.png', '/images/CONTACT_CRISTHIAN.png',
  '/images/CONTACT_FABIO.png', '/images/CONTACT_FELIPE.png',
  '/images/CONTACT_GABRIEL.png', '/images/CONTACT_JAVIER.png',
  '/images/CONTACT_LUCAS.png', '/images/CONTACT_MAURICIO.png',
  '/images/contact-icon.png', '/images/hmm-character.png', '/images/hmm-character.webp',
  '/images/LOGO.png', '/images/placeholder.png', '/images/resource-icon.png',
  '/images/SIMPLE_LOGO.png', '/images/Sungrow-logo.png',
  '/images/tool-hub-banner.png', '/images/tool-hub-banner.svg', '/images/training-icon.png',
  '/images/wink-character.webp'
];

const INDEX_HTML = '/index.html';
const OFFLINE_HTML = '/offline.html';
const NOT_FOUND_HTML = '/404.html';

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
// 🌐 FETCH EVENT (UPDATED)
// =======================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 👣 If navigating (HTML page)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // 🟢 If page exists, use network version and optionally cache
          return res.status === 404
            ? caches.match(NOT_FOUND_HTML)
            : res;
        })
        .catch(() => {
          // ❌ If offline, fallback to cached version or offline
          return caches.match(req.url)
            .then(match => match || caches.match(INDEX_HTML))
            .catch(() => caches.match(OFFLINE_HTML));
        })
    );
    return;
  }

  // 📦 For static assets (JS, CSS, images, fonts, etc.)
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).catch(() => {
        // Only fallback to offline page for HTML
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match(OFFLINE_HTML);
        }

        // Otherwise just fail silently for images, icons, etc.
        return new Response('', { status: 404 });
      });
    })
  );
});


  // Non-navigation: CSS, JS, Images, etc.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );

// =======================
// 💬 MESSAGE HANDLER
// =======================
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING command');
    self.skipWaiting();
  }
});