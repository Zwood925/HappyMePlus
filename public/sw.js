const CACHE_NAME = 'happyme-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Bypass all cross-origin requests (Firebase, Google APIs, etc)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // 2. 🚨 Bypass Next.js dynamic chunks to prevent hanging!
  if (event.request.url.includes('/_next/')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) return response;
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});