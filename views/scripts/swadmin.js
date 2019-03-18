
var _CACHE = {
  'admin' : {
    'name': 'admin-v1',
    'urls': [
      '/icons/web_hi_res_512.png',
      '/scripts/receipt.js',
      '/scripts/main.js',
      '/scripts/main.css',
      '/scripts/toReceipt.js',
      '/scripts/config.js',
      '/scripts/statistics.js',
      '/include/jquery-3.2.1.min.js',
      '/include/vue.min.js',
      '/include/semantic.min.js',
      '/include/semantic.min.css',
      '/include/jquery.md5.min.js',
      '/include/jquery-ui-sortable.min.js',
      '/include/jquery.ui.touch-punch.min.js',
      '/include/calendar.min.css',
      '/include/calendar.min.js',
      '/include/tablesort.min.js',
      '/include/themes/default/assets/fonts/icons.woff2',
      '/index.html',
      '/login.html',
      '/admin.html',
      '/statistics.html',
      '/config.html',
      '/',
    ]
  }
}
var _CACHE_DATA = {
  'main': {
    'name': 'data-main-v1',
    'urls': [
      '/init',
    ]
  }
}

var cacheWhitelist = [_CACHE.admin.name, _CACHE_DATA.main.name];
//var cacheWhitelist = [];

self.addEventListener('install', function(e) {
  //self.skipWaiting();
  // Perform install steps
  e.waitUntil(
    caches.open(_CACHE.admin.name)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(_CACHE.admin.urls);
      })
  );
});

self.addEventListener('activate', function(e) {

  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(e) {

var urlpath = new URL(e.request.url).pathname;
 if (_CACHE_DATA.main.urls.indexOf(urlpath) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(_CACHE_DATA.main.name).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        })
        .catch(function() { // when failed to fetch form network, response with cache
          return caches.match(e.request).then(function(response){
            console.log('cache data');
            return response;
          })
        })
      })
    );
  }
  else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
