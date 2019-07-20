self.importScripts('/js/dbhelper.js');
var cache_name = 'resturant-cache';
self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(cache_name).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        'dist/css/styles.min.css',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/img/1.webp',
        '/img/2.webp',
        '/img/3.webp',
        '/img/4.webp',
        '/img/5.webp',
        '/img/6.webp',
        '/img/7.webp',
        '/img/8.webp',
        '/img/9.webp',
        '/img/10.webp',
      ]);
    })
  );
});
self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
  );
});
self.addEventListener('sync', function(event) {
  if (event.tag == 'myFirstSync') {
    event.waitUntil(DBHelper.offlinepost());
  }
});
self.addEventListener('push', (event) => {
  console.log('Received a push event', event);
  const options = {
    title: 'Message',
    body: 'Offline mode',
    icon: '/img/faicon/android-chrome-192x192.png',
    tag: 'tag-for-this-notification',
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})


