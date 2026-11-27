// app.js - Lógica de la pantalla
// No sabe cómo funciona el GPS: solo usa las funciones de geo-helper.js

// ---------- Elementos del HTML ----------
const tarjetaInicio = document.getElementById('tarjetaInicio');
const tarjetaPrePermiso = document.getElementById('tarjetaPrePermiso');
const tarjetaCargando = document.getElementById('tarjetaCargando');
const tarjetaResultado = document.getElementById('tarjetaResultado');
const tarjetaManual = document.getElementById('tarjetaManual');
const tarjetaMensaje = document.getElementById('tarjetaMensaje');

const textoLatitud = document.getElementById('textoLatitud');
const textoLongitud = document.getElementById('textoLongitud');
const textoPrecision = document.getElementById('textoPrecision');
const etiquetaCalidad = document.getElementById('etiquetaCalidad');
const textoMotivoManual = document.getElementById('textoMotivoManual');
const selectorZona = document.getElementById('selectorZona');
const textoConfirmacionZona = document.getElementById('textoConfirmacionZona');
const textoMensaje = document.getElementById('textoMensaje');

const todasLasTarjetas = [
  tarjetaInicio,
  tarjetaPrePermiso,
  tarjetaCargando,
  tarjetaResultado,
  tarjetaManual,
  tarjetaMensaje
];

// Oculta todas las tarjetas y muestra solo la que pedimos
function mostrarSoloEsta(tarjeta) {
  todasLasTarjetas.forEach(function (t) {
    t.classList.add('oculto');
  });
  tarjeta.classList.remove('oculto');
}

// Escribe las coordenadas y la etiqueta de calidad
function mostrarResultado(ubicacion) {
  textoLatitud.textContent = ubicacion.latitud.toFixed(5);
  textoLongitud.textContent = ubicacion.longitud.toFixed(5);
  textoPrecision.textContent = ubicacion.precisionMetros;

  // Menos de 30 m = GPS; 30 m o más = Wi-Fi o IP
  if (ubicacion.precisionMetros < 30) {
    etiquetaCalidad.textContent = 'Precisión GPS Alta';
    etiquetaCalidad.className = 'etiqueta etiqueta-alta';
  } else {
    etiquetaCalidad.textContent = 'Ubicación Aproximada (Wi-Fi / IP)';
    etiquetaCalidad.className = 'etiqueta etiqueta-baja';
  }

  mostrarSoloEsta(tarjetaResultado);
}

// Plan B: selector manual de zona (permiso negado, TIMEOUT, sin GPS...)
function habilitarSelectorManualZona(motivo) {
  textoMotivoManual.textContent = motivo;
  textoConfirmacionZona.classList.add('oculto');
  mostrarSoloEsta(tarjetaManual);
}

// Pide la ubicación real usando geo-helper.js
function pedirUbicacion() {
  mostrarSoloEsta(tarjetaCargando);

  obtenerUbicacionActual()
    .then(function (ubicacion) {
      mostrarResultado(ubicacion);
    })
    .catch(function (error) {
      habilitarSelectorManualZona(error.message);
    });
}

// ---------- Botón "Adjuntar mi ubicación" (flujo de pre-permiso) ----------
document.getElementById('botonAdjuntarUbicacion').addEventListener('click', function () {
  consultarEstadoPermisoGeo().then(function (estado) {
    if (estado === 'granted') {
      // Ya había aceptado: pedimos directo
      pedirUbicacion();
    } else if (estado === 'denied') {
      // Ya lo había bloqueado: JavaScript no puede volver a preguntar
      habilitarSelectorManualZona(
        'El permiso de ubicación está bloqueado. Puedes activarlo desde los ajustes del navegador o elegir tu zona manualmente.'
      );
    } else {
      // 'prompt': primero explicamos por qué pedimos la ubicación
      mostrarSoloEsta(tarjetaPrePermiso);
    }
  });
});

// "Sí, compartir mi ubicación": este clic abre el diálogo nativo
document.getElementById('botonConfirmarUbicacion').addEventListener('click', function () {
  pedirUbicacion();
});

// "No, gracias" y "Volver a intentar": regresar al inicio
document.getElementById('botonCancelarUbicacion').addEventListener('click', function () {
  mostrarSoloEsta(tarjetaInicio);
});

document.getElementById('botonReintentar').addEventListener('click', function () {
  mostrarSoloEsta(tarjetaInicio);
});

// "Guardar zona" del selector manual
document.getElementById('botonGuardarZona').addEventListener('click', function () {
  if (selectorZona.value === '') {
    textoMensaje.textContent = 'Por favor elige una ciudad antes de guardar.';
    mostrarSoloEsta(tarjetaMensaje);
    return;
  }

  const ciudad = selectorZona.options[selectorZona.selectedIndex].text;
  textoConfirmacionZona.textContent = 'Zona guardada: ' + ciudad;
  textoConfirmacionZona.classList.remove('oculto');
});

// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(function (registro) {
      console.log('Service Worker registrado. Scope:', registro.scope);
    })
    .catch(function (error) {
      console.log('Error al registrar el Service Worker:', error);
    });
}
