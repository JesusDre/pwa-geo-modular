# Reporte con Ubicación (pwa-geo-modular)

Práctica del **Tema 6.3 — Geolocalización Consciente y Reutilizable**, de la
asignatura *Desarrollo de Aplicaciones Web Progresivas (PWA)*.

La aplicación pide la ubicación del dispositivo de forma **ética y no
invasiva**: primero explica por qué la necesita, solo la solicita cuando el
usuario lo pide con un clic, y si el permiso es rechazado (o no hay GPS)
siempre ofrece una alternativa manual. Nunca deja a la persona bloqueada.

## ¿Cómo está organizado el código?

```
pwa-geo-modular/
├── index.html        Estructura de la pantalla (las "tarjetas" de la interfaz)
├── styles.css        Apariencia (colores, tarjetas, botones)
├── geo-helper.js      Módulo reutilizable: todo lo relacionado al GPS/ubicación
├── app.js             Lógica de la pantalla: qué tarjeta mostrar y cuándo
├── sw.js              Service Worker: guarda los archivos para usarlos sin internet
├── manifest.json      Datos para poder "instalar" la app
├── icono.svg          Ícono (favicon)
├── icons/             Íconos PNG 192 y 512 para instalar la app
└── README.md          Este archivo
```

Cada archivo hace **una sola cosa**:

- **`geo-helper.js`** no sabe nada de botones ni de pantallas. Solo expone
  dos funciones que cualquier parte de la app puede usar:
  - `obtenerUbicacionActual(opciones)` → regresa una Promesa con
    `{ latitud, longitud, precisionMetros, timestamp }`.
  - `consultarEstadoPermisoGeo()` → regresa una Promesa con
    `'granted'`, `'denied'` o `'prompt'`.
- **`app.js`** solo se encarga de la interfaz: muestra y oculta tarjetas,
  y le pide ayuda a `geo-helper.js` cuando el usuario presiona un botón.

Así, si en el futuro se quisiera reusar la ubicación en otro módulo (por
ejemplo, un check-in o un mapa de sucursales), bastaría con llamar a
`obtenerUbicacionActual().then(...)` sin tocar nada de `geo-helper.js`.

## Reglas técnicas que sigue el proyecto

- 100% JavaScript Vanilla, sin librerías externas.
- Cero `async`/`await`. Toda la asincronía usa `new Promise()` y se consume
  con `.then()` / `.catch()`.
- Rutas relativas (`./archivo.js`) para que funcione igual en local y en
  GitHub Pages.
- `geo-helper.js` está incluido en la lista de archivos que el Service
  Worker guarda en caché (`sw.js`).

## Flujo de Pre-Permiso (UX ética)

1. El usuario ve un botón **"Adjuntar mi ubicación"**. No se pide nada
   automáticamente al abrir la página.
2. Al presionarlo, se consulta `consultarEstadoPermisoGeo()`:
   - `'granted'` → se pide la ubicación directo, sin mostrar explicación de
     nuevo.
   - `'prompt'` → se muestra una tarjeta explicando por qué se necesita la
     ubicación, con un botón para confirmar antes de abrir el diálogo nativo.
   - `'denied'` → se muestra de inmediato el selector manual de ciudad, ya
     que JavaScript no puede volver a abrir el diálogo del navegador.
3. Si ocurre un error (por ejemplo `TIMEOUT` en una laptop sin GPS), la app
   tampoco se bloquea: cae en el mismo selector manual de zona.

## Indicador de calidad de señal

Junto a las coordenadas se muestra el margen de error (`accuracy`) y una
etiqueta:

- Menos de 30 metros → 🟢 **Precisión GPS Alta**
- 30 metros o más → 🟡 **Ubicación Aproximada (Wi-Fi / IP)**

## Cómo probarlo en tu computadora

No se necesita instalar nada. Como los navegadores exigen HTTPS (o
`localhost`) para usar geolocalización, basta con levantar un servidor local
sencillo desde la carpeta del proyecto, por ejemplo:

```powershell
# Si tienes Python instalado:
python -m http.server 8080

# Si tienes la extensión "Live Server" en VS Code, también funciona.
```

Luego abre `http://localhost:8080` en el navegador.

## Cómo subirlo a GitHub Pages

1. Crea un repositorio en GitHub y sube todos los archivos de esta carpeta.
2. Entra a **Settings → Pages** del repositorio.
3. En "Branch" elige `main` (o la rama donde subiste el código) y la
   carpeta `/ (root)`.
4. Guarda y espera un par de minutos. GitHub te dará un enlace como:
   `https://tu-usuario.github.io/pwa-geo-modular/`
5. Abre ese enlace tanto en tu laptop como en tu teléfono para comparar el
   valor de `accuracy` entre ambos dispositivos.

## Cosas a tener en cuenta por plataforma

- **iPhone / Safari:** la solicitud de ubicación solo funciona si nace de un
  clic directo del usuario (por eso el botón "Sí, compartir mi ubicación"
  está dentro de la tarjeta de pre-permiso, nunca se dispara solo).
- **Laptops sin GPS:** dependen de Wi-Fi o IP, así que `accuracy` suele ser
  mayor a 30 metros y es normal ver la etiqueta "Ubicación Aproximada".
- **Permiso denegado:** una vez bloqueado, el navegador no vuelve a
  preguntar. El selector manual de zona explica cómo reactivarlo desde los
  ajustes del navegador.
