// sw.js - Service Worker (guarda los archivos para abrir sin internet)

const CACHE_NAME = 'pwa-geo-modular-v2';

// geo-helper.js va en la lista, como pide la práctica
const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './geo-helper.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// install: guardar los archivos en caché
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARCHIVOS);
    })
  );
});

// activate: borrar cachés de versiones anteriores
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nombres) {
      const borrados = nombres
        .filter(function (nombre) {
          return nombre !== CACHE_NAME;
        })
        .map(function (nombre) {
          return caches.delete(nombre);
        });
      return Promise.all(borrados);
    })
  );
});

// fetch: Cache First (primero caché, si no está, internet)
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (enCache) {
      return enCache || fetch(event.request);
    })
  );
});
