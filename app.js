// =============================================================
// app.js
// -------------------------------------------------------------
// Aquí vive la lógica de la pantalla (la interfaz). Este archivo
// NO sabe cómo funciona el GPS por dentro, solo le pide ayuda a
// "geo-helper.js" cuando la necesita. Así mantenemos el código
// ordenado: cada archivo hace una sola cosa.
//
// Reglas que seguimos aquí:
//  - Solo JavaScript normal (sin librerías externas).
//  - Nada de async/await. Usamos .then() y .catch().
// =============================================================


// -------------------------------------------------------------
// PASO 1: guardamos en variables todos los elementos del HTML
// que vamos a usar, para no tener que buscarlos varias veces.
// -------------------------------------------------------------
var tarjetaInicio = document.getElementById('tarjetaInicio');
var botonAdjuntarUbicacion = document.getElementById('botonAdjuntarUbicacion');

var tarjetaPrePermiso = document.getElementById('tarjetaPrePermiso');
var botonConfirmarUbicacion = document.getElementById('botonConfirmarUbicacion');
var botonCancelarUbicacion = document.getElementById('botonCancelarUbicacion');

var tarjetaCargando = document.getElementById('tarjetaCargando');

var tarjetaResultado = document.getElementById('tarjetaResultado');
var textoLatitud = document.getElementById('textoLatitud');
var textoLongitud = document.getElementById('textoLongitud');
var textoPrecision = document.getElementById('textoPrecision');
var etiquetaCalidad = document.getElementById('etiquetaCalidad');
var botonReintentar = document.getElementById('botonReintentar');

var tarjetaManual = document.getElementById('tarjetaManual');
var textoMotivoManual = document.getElementById('textoMotivoManual');
var selectorZona = document.getElementById('selectorZona');
var botonGuardarZona = document.getElementById('botonGuardarZona');
var textoConfirmacionZona = document.getElementById('textoConfirmacionZona');

var tarjetaMensaje = document.getElementById('tarjetaMensaje');
var textoMensaje = document.getElementById('textoMensaje');

// Guardamos todas las tarjetas en una lista, así es fácil
// esconderlas todas de un solo golpe.
var todasLasTarjetas = [
  tarjetaInicio,
  tarjetaPrePermiso,
  tarjetaCargando,
  tarjetaResultado,
  tarjetaManual,
  tarjetaMensaje
];


// -------------------------------------------------------------
// FUNCIÓN: ocultarTodasLasTarjetas
// Le pone la clase "oculto" a cada tarjeta de la lista.
// -------------------------------------------------------------
function ocultarTodasLasTarjetas() {
  todasLasTarjetas.forEach(function (tarjeta) {
    tarjeta.classList.add('oculto');
  });
}


// -------------------------------------------------------------
// FUNCIÓN: mostrarSoloEsta
// Oculta todas las tarjetas y luego muestra únicamente la que
// nos pidieron.
// -------------------------------------------------------------
function mostrarSoloEsta(tarjetaAMostrar) {
  ocultarTodasLasTarjetas();
  tarjetaAMostrar.classList.remove('oculto');
}


// -------------------------------------------------------------
// FUNCIÓN: mostrarResultadoEnPantalla
// Recibe el objeto de ubicación que entrega geo-helper.js y
// escribe los datos en la tarjeta de resultado.
// -------------------------------------------------------------
function mostrarResultadoEnPantalla(ubicacion) {
  textoLatitud.textContent = ubicacion.latitud.toFixed(5);
  textoLongitud.textContent = ubicacion.longitud.toFixed(5);
  textoPrecision.textContent = ubicacion.precisionMetros;

  // Regla del desafío: menos de 30 metros = alta precisión (GPS).
  // 30 metros o más = ubicación aproximada (Wi-Fi / IP).
  if (ubicacion.precisionMetros < 30) {
    etiquetaCalidad.textContent = '🟢 Precisión GPS Alta';
    etiquetaCalidad.className = 'etiqueta etiqueta-alta';
  } else {
    etiquetaCalidad.textContent = '🟡 Ubicación Aproximada (Wi-Fi / IP)';
    etiquetaCalidad.className = 'etiqueta etiqueta-baja';
  }

  mostrarSoloEsta(tarjetaResultado);
}


// -------------------------------------------------------------
// FUNCIÓN: mostrarSelectorManual
// Es nuestro "Plan B". Se usa cuando el permiso fue rechazado,
// cuando no hay GPS, o cuando ocurrió un error (por ejemplo
// TIMEOUT). La aplicación nunca debe quedarse bloqueada.
// -------------------------------------------------------------
function mostrarSelectorManual(motivo) {
  textoMotivoManual.textContent = motivo;
  textoConfirmacionZona.classList.add('oculto');
  mostrarSoloEsta(tarjetaManual);
}


// -------------------------------------------------------------
// FUNCIÓN: mostrarMensajeDeError
// Para errores generales que no tienen que ver con el permiso.
// -------------------------------------------------------------
function mostrarMensajeDeError(mensaje) {
  textoMensaje.textContent = mensaje;
  mostrarSoloEsta(tarjetaMensaje);
}


// -------------------------------------------------------------
// FUNCIÓN: pedirUbicacionDeVerdad
// Esta es la función que realmente llama a geo-helper.js para
// obtener las coordenadas. Mientras espera, muestra la tarjeta
// de "Cargando".
// -------------------------------------------------------------
function pedirUbicacionDeVerdad() {
  mostrarSoloEsta(tarjetaCargando);

  obtenerUbicacionActual()
    .then(function (ubicacion) {
      mostrarResultadoEnPantalla(ubicacion);
    })
    .catch(function (error) {
      // Si algo falla (permiso denegado, timeout, sin GPS, etc.)
      // nunca dejamos a la persona sin opciones: mostramos el
      // selector manual de zona.
      mostrarSelectorManual(error.message);
    });
}


// -------------------------------------------------------------
// EVENTO PRINCIPAL: clic en "Adjuntar mi ubicación"
// -------------------------------------------------------------
// Aquí seguimos el flujo de "Pre-Permiso" que pide la práctica:
//   1. Preguntamos si el permiso ya se conoce (consultarEstado...)
//   2. Si ya estaba aceptado -> pedimos la ubicación directo.
//   3. Si todavía no se sabe -> mostramos la tarjeta explicativa.
//   4. Si ya estaba rechazado -> mostramos el selector manual.
// -------------------------------------------------------------
botonAdjuntarUbicacion.addEventListener('click', function () {

  consultarEstadoPermisoDeUbicacion().then(function (estado) {

    if (estado === 'granted') {
      // El usuario ya había aceptado antes: no hace falta
      // mostrarle de nuevo la tarjeta explicativa.
      pedirUbicacionDeVerdad();

    } else if (estado === 'denied') {
      // El usuario ya había rechazado el permiso. JavaScript no
      // puede volver a abrir el diálogo nativo, así que vamos
      // directo al Plan B.
      mostrarSelectorManual(
        'El permiso de ubicación está bloqueado. Puedes activarlo ' +
        'desde los ajustes del navegador o ingresar tu zona manualmente.'
      );

    } else {
      // estado === 'prompt' -> todavía no se le ha preguntado.
      // Mostramos primero la tarjeta explicativa (Pre-Permiso).
      mostrarSoloEsta(tarjetaPrePermiso);
    }
  });
});


// -------------------------------------------------------------
// EVENTO: clic en "Sí, compartir mi ubicación" (dentro de la
// tarjeta de Pre-Permiso). Este clic es el que realmente abre
// el diálogo nativo del navegador.
// -------------------------------------------------------------
botonConfirmarUbicacion.addEventListener('click', function () {
  pedirUbicacionDeVerdad();
});


// -------------------------------------------------------------
// EVENTO: clic en "No, gracias". Regresamos a la pantalla
// inicial sin pedir nada.
// -------------------------------------------------------------
botonCancelarUbicacion.addEventListener('click', function () {
  mostrarSoloEsta(tarjetaInicio);
});


// -------------------------------------------------------------
// EVENTO: clic en "Volver a intentar" (desde la tarjeta de
// resultado). Simplemente repetimos el flujo desde el inicio.
// -------------------------------------------------------------
botonReintentar.addEventListener('click', function () {
  mostrarSoloEsta(tarjetaInicio);
});


// -------------------------------------------------------------
// EVENTO: clic en "Guardar zona" (dentro del selector manual).
// -------------------------------------------------------------
botonGuardarZona.addEventListener('click', function () {
  var zonaElegida = selectorZona.value;

  if (zonaElegida === '') {
    mostrarMensajeDeError('Por favor elige una ciudad antes de guardar.');
    return;
  }

  // En una aplicación real, aquí guardaríamos la zona elegida en
  // IndexedDB o la mandaríamos junto con el reporte. Para esta
  // práctica solo mostramos una confirmación en pantalla.
  textoConfirmacionZona.textContent = 'Zona guardada: ' + selectorZona.options[selectorZona.selectedIndex].text;
  textoConfirmacionZona.classList.remove('oculto');
});


// -------------------------------------------------------------
// PASO FINAL: registrar el Service Worker (para que la PWA
// funcione sin conexión). Si el navegador no lo soporta, no
// pasa nada grave, la app sigue funcionando normal.
// -------------------------------------------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(function () {
      console.log('Service Worker registrado correctamente.');
    })
    .catch(function (error) {
      console.warn('No se pudo registrar el Service Worker:', error.message);
    });
}
