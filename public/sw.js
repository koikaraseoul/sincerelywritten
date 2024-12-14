const CACHE_NAME = 'sincerelywritten-v4'; // Increment cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Cache populated successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache population failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Special handling for icon requests
  if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
    console.log('Fetching image:', event.request.url);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Found in cache:', event.request.url);
          return response;
        }

        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('Caching new response for:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(error => {
          console.error('Fetch failed:', error);
          throw error;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Activating new service worker...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
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