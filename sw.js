// v3 — принудительный сброс старого кеша
const CACHE_NAME = 'parte-v3';

self.addEventListener('install', function(e) {
  self.skipWaiting(); // активируемся немедленно
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        return caches.delete(k); // удаляем ВСЕ старые кеши
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Сеть всегда в приоритете, кеш не используем
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return new Response('Offline', {status: 503});
    })
  );
});
