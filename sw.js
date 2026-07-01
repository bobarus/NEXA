const CACHE_NAME = 'parte-v1';

// При установке — кешируем основной файл
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['./parte_app.html']);
    })
  );
  self.skipWaiting();
});

// При активации — удаляем старые кеши
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Запросы: сначала сеть, при ошибке — кеш
// API-запросы к Google Apps Script всегда идут через сеть
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Apps Script и Google APIs — только через сеть, никогда не кешируем
  if (url.includes('script.google.com') || url.includes('googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Обновляем кеш свежей версией
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(function() {
        // Если нет сети — отдаём из кеша
        return caches.match(event.request);
      })
  );
});
