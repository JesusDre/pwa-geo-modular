// =============================================================
// geo-helper.js
// -------------------------------------------------------------
// Este archivo es nuestra "cajita de herramientas" para pedir la
// ubicación del dispositivo. La idea es muy sencilla: cualquier
// otra parte de la aplicación (por ejemplo app.js) puede pedirle
// la ubicación a este archivo sin tener que saber cómo funciona
// por dentro el GPS del teléfono o la computadora.
//
// Reglas que seguimos aquí:
//  - Solo JavaScript normal (sin librerías externas).
//  - Nada de async/await. Usamos new Promise() y .then()/.catch().
// =============================================================


// -------------------------------------------------------------
// FUNCIÓN 1: traducirErrorDeUbicacion
// -------------------------------------------------------------
// El navegador nos avisa los errores con un número (1, 2 o 3).
// Esta función convierte ese número en una frase que cualquier
// persona pueda entender.
// -------------------------------------------------------------
function traducirErrorDeUbicacion(error) {
  if (error.code === 1) {
    // error.PERMISSION_DENIED
    return 'Permiso de ubicación denegado. Puedes ingresar tu zona manualmente.';
  }

  if (error.code === 2) {
    // error.POSITION_UNAVAILABLE
    return 'No fue posible determinar tu ubicación (sin señal de GPS o Wi-Fi).';
  }

  if (error.code === 3) {
    // error.TIMEOUT
    return 'Se agotó el tiempo de espera intentando obtener tu ubicación.';
  }

  return 'Ocurrió un error inesperado al consultar la ubicación.';
}


// -------------------------------------------------------------
// FUNCIÓN 2: obtenerUbicacionActual
// -------------------------------------------------------------
// Pide UNA sola lectura de la posición actual del dispositivo.
// Regresa una Promesa:
//    - Si todo sale bien -> resolve(objetoConLaUbicacion)
//    - Si algo falla     -> reject(unError)
//
// "opcionesPersonalizadas" es opcional. Si no se manda nada, se
// usan unos valores por defecto que funcionan bien casi siempre.
// -------------------------------------------------------------
function obtenerUbicacionActual(opcionesPersonalizadas) {

  // Valores por defecto para pedir la ubicación.
  var opcionesPorDefecto = {
    enableHighAccuracy: true, // intenta usar el GPS si existe
    timeout: 8000,            // espera máximo 8 segundos
    maximumAge: 30000         // acepta una lectura de hasta 30 segundos de antigüedad
  };

  // Si nos mandaron opciones propias, las mezclamos con las de
  // por defecto (las propias siempre ganan).
  var opciones = Object.assign({}, opcionesPorDefecto, opcionesPersonalizadas);

  return new Promise(function (resolve, reject) {

    // Primero revisamos si el navegador sabe usar geolocalización.
    if (!('geolocation' in navigator)) {
      reject(new Error('Este navegador no soporta la Geolocation API.'));
      return;
    }

    // Esta es la función que el navegador llama cuando SÍ pudo
    // encontrar la ubicación.
    function cuandoHayExito(posicion) {
      resolve({
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
        precisionMetros: Math.round(posicion.coords.accuracy),
        timestamp: posicion.timestamp
      });
    }

    // Esta es la función que el navegador llama cuando algo falla.
    function cuandoHayError(error) {
      reject(new Error(traducirErrorDeUbicacion(error)));
    }

    // Aquí le pedimos al navegador la ubicación de verdad.
    navigator.geolocation.getCurrentPosition(cuandoHayExito, cuandoHayError, opciones);
  });
}


// -------------------------------------------------------------
// FUNCIÓN 3: consultarEstadoPermisoDeUbicacion
// -------------------------------------------------------------
// Antes de mostrar el diálogo nativo del navegador, es buena idea
// saber si el usuario ya había aceptado o rechazado el permiso
// antes. Esta función regresa una Promesa que entrega un texto:
//    'granted' -> ya lo había aceptado
//    'denied'  -> ya lo había rechazado
//    'prompt'  -> todavía no se le ha preguntado
// -------------------------------------------------------------
function consultarEstadoPermisoDeUbicacion() {

  // No todos los navegadores tienen la Permissions API.
  // Si no existe, asumimos 'prompt' (preguntar normalmente).
  if (!('permissions' in navigator)) {
    return Promise.resolve('prompt');
  }

  return navigator.permissions.query({ name: 'geolocation' })
    .then(function (resultado) {
      return resultado.state; // 'granted', 'denied' o 'prompt'
    })
    .catch(function () {
      // Si algo sale mal preguntando el permiso, mejor seguimos
      // el camino normal (mostrar la tarjeta de pre-permiso).
      return 'prompt';
    });
}
