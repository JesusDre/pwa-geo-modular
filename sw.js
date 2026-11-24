// =============================================================
// sw.js (Service Worker)
// -------------------------------------------------------------
// El Service Worker guarda una copia ("caché") de los archivos
// principales de la app para que puedan abrirse incluso sin
// conexión a internet. No tiene nada que ver con el GPS, solo
// se encarga de guardar y servir archivos.
// =============================================================

var NOMBRE_DEL_CACHE = 'pwa-geo-modular-v1';

// Lista de archivos que queremos guardar desde el primer momento.
// IMPORTANTE: geo-helper.js va incluido aquí, como pide la práctica.
var ARCHIVOS_DEL_APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './geo-helper.js',
  './app.js',
  './manifest.json'
];


// -------------------------------------------------------------
// Evento "install": se dispara una sola vez, cuando el
// navegador instala el Service Worker por primera vez.
// -------------------------------------------------------------
self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(NOMBRE_DEL_CACHE).then(function (cache) {
      return cache.addAll(ARCHIVOS_DEL_APP_SHELL);
    })
  );
});


// -------------------------------------------------------------
// Evento "fetch": se dispara cada vez que la página pide un
// archivo (HTML, CSS, JS, etc). Primero buscamos en el caché;
// si no está ahí, lo pedimos a internet como siempre.
// -------------------------------------------------------------
self.addEventListener('fetch', function (evento) {
  evento.respondWith(
    caches.match(evento.request).then(function (respuestaGuardada) {
      return respuestaGuardada || fetch(evento.request);
    })
  );
});


// -------------------------------------------------------------
// Evento "activate": limpia cachés viejos de versiones
// anteriores de la app, para no acumular archivos de más.
// -------------------------------------------------------------
self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nombresDeCaches) {
      return Promise.all(
        nombresDeCaches.map(function (nombre) {
          if (nombre !== NOMBRE_DEL_CACHE) {
            return caches.delete(nombre);
          }
        })
      );
    })
  );
});
