// =======================
// 🔁 CACHE VERSIONING
// =======================
const CACHE_NAME = 'level3support-cache-v46';

const ASSETS_TO_CACHE = [
  '/index.html', '/404.html', '/offline.html',
  '/parameter-comparison.html', '/rej603-configurator.html',
  '/tools-data.json', '/manifest.json',

  // JavaScript files
  '/js/common.js', '/js/papaparse.min.js', '/js/tool-resources.js',
  '/js/parameter-comparison.js', '/js/tools-hub.js',
  '/js/clipping-curtailment-check.js',
  '/js/irradiance-sensor-check.js',
  '/js/tracker-angle-qaqc.js',
  '/js/capa-tracker.js',
  '/js/inverter-derating-analyzer.js',
  '/js/power-triangle.js',
  '/js/inverter-capability-curve-check.js',
  '/js/grid-event-excursion-log.js',
  '/js/battery-soc-imbalance-analyzer.js',
  '/js/battery-temperature-spread.js',
  '/js/number-base-converter.js',
  '/js/fuse-derating-calculator.js',
  '/js/analyzer.js',

  // HTML files for new tools
  '/clipping-curtailment-check.html',
  '/irradiance-sensor-check.html',
  '/tracker-angle-qaqc.html',
  '/capa-tracker.html',
  '/inverter-derating-analyzer.html',
  '/power-triangle.html',
  '/inverter-capability-curve-check.html',
  '/grid-event-excursion-log.html',
  '/battery-soc-imbalance-analyzer.html',
  '/battery-temperature-spread.html',
  '/number-base-converter.html',
  '/fuse-derating-calculator.html',
  '/torque-spec-finder.html',
  '/analyzer.html',

  // CSS files
  '/css/parameter-comparison.css', '/css/rej603-configurator.css', '/css/shared-styles.css', '/css/analyzer.css',

  // Icons
  '/icons/icon-72.png', '/icons/icon-96.png', '/icons/icon-128.png',
  '/icons/icon-144.png', '/icons/icon-152.png', '/icons/icon-192.png',
  '/icons/icon-256.png', '/icons/icon-384.png', '/icons/icon-512.png',
  '/icons/ToolHUB.ico',

  // Images
  '/images/ABB_LOGO.png', '/images/APROVERO_LOGO.png', '/images/L3S_ICON.png',
  '/images/hmm-character.png', '/images/hmm-character.webp',
  '/images/L3S_HEADER_LOGO.png', '/images/placeholder.png',
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
  self.skipWaiting();
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
  self.clients.claim();
});

// =======================
// 🌐 FETCH EVENT
// =======================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          return res.status === 404
            ? caches.match(NOT_FOUND_HTML)
            : res;
        })
        .catch(() => {
          return caches.match(req.url)
            .then(match => match || caches.match(INDEX_HTML))
            .catch(() => caches.match(OFFLINE_HTML));
        })
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => {
        return cached || fetch(req).catch(() => {
          if (req.headers.get('accept')?.includes('text/html')) {
            return caches.match(OFFLINE_HTML);
          }
          return new Response('', { status: 404 });
        });
      })
    );
  }
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
