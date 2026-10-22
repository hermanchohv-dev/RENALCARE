# RENALCARE: demo instalable sin conexión

Esta variante contiene únicamente perfiles ficticios y funciona sin API, PostgreSQL, Expo Go ni Mac encendido después de instalarse. Las consultas son simuladas y se guardan solo en el dispositivo. No existe atención médica, seguimiento real de ambulancias ni notificaciones reales. No introducir datos personales.

## Generar la demo en el Mac

Desde la raíz del repositorio actualizado:

```bash
cd renal_care_app/react_native_space
YARN_NODE_LINKER=node-modules corepack yarn install --immutable
YARN_NODE_LINKER=node-modules corepack yarn prepare:map
YARN_NODE_LINKER=node-modules corepack yarn tsc --noEmit
YARN_NODE_LINKER=node-modules corepack yarn test:demo
YARN_NODE_LINKER=node-modules corepack yarn build:pwa
```

`build:pwa` activa explícitamente EXPO_PUBLIC_DEMO_MODE=true para exportar la variante local. El arranque habitual con servidor sigue disponible; una exportación web habitual no sustituye este comando. No se necesita .env para la demo. No se incluyen credenciales ni la base de datos del Mac.

La carpeta resultante es `renal_care_app/react_native_space/dist-pwa`. Contiene HTML, JavaScript, estilos, imágenes, fuentes, manifiesto y el service worker con todos los recursos de esta versión. No abrir index.html con doble clic: se necesita HTTPS (o localhost para probar en un ordenador).

## Publicación gratuita desde el navegador

1. Crear o utilizar una cuenta gratuita de Netlify y abrir https://app.netlify.com/drop . Revisar los límites vigentes del plan gratuito; no se necesita dominio propio.
2. Arrastrar **la carpeta dist-pwa** completa, no el código fuente ni un ZIP ni la carpeta superior. Esta acción publica la demo y sus datos ficticios para cualquiera con el enlace.
3. Conservar la URL HTTPS asignada. Para actualizar una instalación, publicar la nueva carpeta en **el mismo sitio**, no crear otra URL cada vez.

También puede usarse cualquier alojamiento estático HTTPS que sirva la carpeta en la **raíz de un dominio** y redirija las rutas de navegación a index.html. El archivo `_redirects` incluido configura esto en Netlify. No publicar sin adaptar rutas en un subdirectorio como /RENALCARE/ de GitHub Pages.

## Instalar en iPhone

1. Abrir el enlace HTTPS en **Safari** con conexión.
2. Esperar el aviso **Disponible sin conexión**; significa que el service worker terminó de almacenar los recursos.
3. Compartir → Añadir a pantalla de inicio (activar Abrir como app si iOS lo ofrece).
4. Abrir el icono nuevo **con internet una vez**, esperar otra vez Disponible sin conexión y seleccionar un perfil ficticio.
5. Cerrar la app, activar modo avión y abrir desde el icono. Comprobar Herman, María y Carlos, historia, tratamiento, dieta, simulación de ambulancia y guardar una consulta ficticia.

Después de esta preparación no depende de que el Mac o un servidor estén encendidos. La primera descarga y las actualizaciones sí requieren conexión. iOS puede eliminar los datos del sitio; si sucede habrá que abrir con internet de nuevo. No usar navegación privada para instalar. Las preferencias y consultas no se comparten entre dispositivos y pueden perderse al borrar los datos de Safari.

## Actualizaciones y comprobación

Cada exportación genera una versión de caché distinta a partir del contenido. Abrir con internet y volver a abrir la app permite instalar la nueva versión. Si el almacenamiento está lleno puede fallar la preparación: no desconectar hasta ver el aviso de disponibilidad. Se conservan las cachés antiguas para no romper pestañas abiertas de una versión anterior. Para liberar todo el espacio, eliminar los datos del sitio desde los ajustes de Safari (también borra preferencias, consultas y sesión demo).

Las pruebas automáticas no sustituyen la comprobación en Safari y en el icono de inicio del iPhone. La demo no es una aplicación nativa de App Store.

## Pruebas automatizadas

`test:demo` verifica los tres perfiles, datos de las pantallas, credenciales, consultas por paciente y rechazo de rutas no disponibles (4 pruebas).

Para la prueba completa del navegador, después de `build:pwa`:

```bash
cd renal_care_app/react_native_space
YARN_NODE_LINKER=node-modules corepack yarn playwright install chromium
YARN_NODE_LINKER=node-modules corepack yarn test:pwa
```

La prueba crea su servidor local temporal, descarga los recursos, desactiva la red, cierra la pestaña y abre otra desde cero. Recorre todos los perfiles, las pantallas clínicas, la simulación de ambulancia, guardado y recuperación de consultas ficticias y cierre de sesión. Comprueba que no hay peticiones a /api/ ni errores de ejecución. Puede usarse PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH si Chromium está instalado por el sistema.

Validación de esta entrega: TypeScript sin errores; 4 pruebas de API local aprobadas; prueba de navegador Chromium sin red aprobada. No se ha probado todavía la instalación en un iPhone físico ni se ha publicado el sitio.

## Edición 2: iconos incluidos como SVG

Los 34 iconos de la aplicación se dibujan directamente con react-native-svg;
no dependen de fuentes .ttf/.woff ni de una CDN. La franja superior indica
«Edición 2» para distinguir esta entrega de instalaciones anteriores.
La prueba de navegador bloquea las fuentes y comprueba que los iconos SVG
siguen visibles tras cerrar y reabrir sin red.

Para actualizar una copia existente: git pull --ff-only y después build:pwa.
Subir de nuevo dist-pwa al mismo sitio de Netlify. Confirmar «Edición 2»
abriendo la URL con internet antes de probar desde el icono instalado.


## Transporte: mapa real y simulación de 45 segundos

El marcador es una ambulancia SVG vista desde arriba, con carrocería blanca,
ventanas, ruedas, luces azules/rojas y cruz sanitaria. El panel muestra salida,
destino, distancia y tiempo ilustrativo. Permite iniciar, pausar, continuar,
volver al inicio y repetir. No solicita transportes ni utiliza GPS.

Antes de generar esta versión hay que ejecutar `yarn prepare:map` desde
`renal_care_app/react_native_space`. Requiere internet durante la preparación;
no necesita cuenta ni clave. Descarga una pequeña zona de Logroño de Overpass,
identifica El Espolón y el Hospital San Pedro por sus etiquetas OSM y calcula
un recorrido por vías accesibles a vehículos respetando sus sentidos registrados.
No tiene información de tráfico, restricciones de giro ni accesos operativos:
es un recorrido ilustrativo, no un navegador para conductores.

El resultado se guarda en `src/transport/logrono-map.json`, incluyendo fecha,
procedencia, identificadores OSM, licencia, calles y coordenadas. Después de
incorporarlo con `build:pwa`, no necesita servidor de mapas ni conexión durante
la demostración. La cartografía es © OpenStreetMap contributors, distribuida
bajo ODbL 1.0: https://www.openstreetmap.org/copyright . Mantener la atribución
visible al compartir la demo y el archivo de datos.

Si Overpass no responde, no se altera un mapa anterior. Puede reintentarse más
tarde o proporcionar un JSON Overpass ya descargado con
`node scripts/prepare-map.cjs /ruta/al/archivo.json`. El comando no inventa
ubicaciones si no encuentra los lugares o un recorrido conectado. `build:pwa`
rechaza datos pendientes y mapas marcados como pruebas; no publicar una
geometría de prueba como si fuera Logroño.

La red del entorno de desarrollo en la nube no permite todavía descargar
OpenStreetMap. El código y las pruebas están preparados; la cartografía real
queda pendiente de descargar desde el Mac o de habilitar los dominios del
entorno. La prueba de importación y del simulador utiliza una red ficticia,
marcada como tal, sin presentarla como cartografía real.

Pruebas específicas: `yarn test:transport` verifica identificación de lugares,
sentidos únicos, exclusión de vías privadas, errores de descarga y avance por
distancia. La prueba PWA comprueba pausa, continuación, llegada y repetición
sin red. Las ubicaciones y el trazado reales se deben revisar tras la descarga.
