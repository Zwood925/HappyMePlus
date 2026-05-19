const CACHE_NAME = 'happyme-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - force activation instantly
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches to prevent ghost bugs
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

// Fetch event - NETWORK FIRST strategy (fixes Next.js chunk hanging)
self.addEventListener('fetch', (event) => {
  // Completely bypass Firebase and API requests
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('/api/')) {
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