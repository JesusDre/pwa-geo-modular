// geo-helper.js - Módulo reutilizable de geolocalización
// Convierte la API de callbacks de navigator.geolocation en promesas.

// Convierte el código de error del navegador (1, 2 o 3) en un mensaje claro
function traducirErrorGeolocalizacion(error) {
  if (error.code === 1) {
    return 'Permiso de ubicación denegado. Puedes ingresar tu zona manualmente.';
  }
  if (error.code === 2) {
    return 'No fue posible determinar tu ubicación (señal GPS o Wi-Fi no disponible).';
  }
  if (error.code === 3) {
    return 'Se agotó el tiempo de espera intentando obtener las coordenadas.';
  }
  return 'Ocurrió un error inesperado al consultar la ubicación.';
}

// Pide UNA lectura de la ubicación. Regresa una promesa.
function obtenerUbicacionActual(opcionesPersonalizadas) {
  // Las opciones que nos manden reemplazan a las de por defecto
  const opciones = Object.assign(
    {
      enableHighAccuracy: true, // usar GPS si existe
      timeout: 8000,            // esperar máximo 8 segundos
      maximumAge: 30000         // aceptar una lectura de hasta 30 segundos
    },
    opcionesPersonalizadas
  );

  return new Promise(function (resolve, reject) {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este navegador no soporta la API de Geolocalización.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (posicion) {
        resolve({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
          precisionMetros: Math.round(posicion.coords.accuracy),
          timestamp: posicion.timestamp
        });
      },
      function (error) {
        reject(new Error(traducirErrorGeolocalizacion(error)));
      },
      opciones
    );
  });
}

// Consulta si el permiso ya se había dado: 'granted', 'denied' o 'prompt'
function consultarEstadoPermisoGeo() {
  if (!('permissions' in navigator)) {
    return Promise.resolve('prompt');
  }

  return navigator.permissions.query({ name: 'geolocation' })
    .then(function (resultado) {
      return resultado.state;
    })
    .catch(function () {
      return 'prompt';
    });
}
