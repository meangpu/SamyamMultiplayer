const CACHE_NAME = "meangpu-SamyamMultiplayer-0.04-8-Dec-2024 4:19 AM-1733607056770";
const OFFLINE_URL = 'index.html';
const contentToCache = [
    "index.html",
    "Build/SamyamMultiplayer.loader.js",
    "Build/SamyamMultiplayer.framework.js.unityweb",
    "Build/SamyamMultiplayer.data.unityweb",
    "Build/SamyamMultiplayer.wasm.unityweb",
    "TemplateData/style.css"
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(contentToCache);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(existingCacheName) {
                    if (existingCacheName !== CACHE_NAME) {
                        return caches.delete(existingCacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        (async () => {
            try {
                // Try network first
                const networkResponse = await fetch(e.request);

                // If it's a successful response, update cache
                if (networkResponse && networkResponse.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(e.request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                // Network failed, try cache
                const cachedResponse = await caches.match(e.request);

                if (cachedResponse) {
                    return cachedResponse;
                }

                // If no cached response, return offline page
                return caches.match(OFFLINE_URL);
            }
        })()
    );
});
