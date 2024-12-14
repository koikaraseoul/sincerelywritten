const CACHE_NAME = 'sincerelywritten-v7';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opening cache and adding resources...');
        return Promise.all(
          urlsToCache.map(url =>
            fetch(url, { cache: 'no-cache' })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.error(`Failed to cache ${url}:`, error);
              })
          )
        );
      })
      .then(() => {
        console.log('Cache populated successfully');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('.png')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('Found icon in cache:', event.request.url);
            return response;
          }
          console.log('Fetching icon:', event.request.url);
          return fetch(event.request)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            })
            .catch(error => {
              console.error('Error fetching icon:', error);
              return new Response('Icon not found', { status: 404 });
            });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Activating new service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});