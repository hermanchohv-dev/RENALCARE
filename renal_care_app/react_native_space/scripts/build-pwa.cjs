const { spawnSync } = require('node:child_process');
const { readFileSync, writeFileSync, readdirSync, statSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const root = resolve(__dirname, '..');
const result = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'export', '--platform', 'web', '--output-dir', 'dist-pwa'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, EXPO_PUBLIC_DEMO_MODE: 'true', CI: '1' },
});
if (result.status !== 0) process.exit(result.status ?? 1);
const output = join(root, 'dist-pwa');
// Expo output=single no utiliza +html.tsx: preparar el HTML exportado aquí.
const indexPath = join(output, 'index.html');
let html = readFileSync(indexPath, 'utf8')
  .replace('<html lang="en">', '<html lang="es">')
  .replace(/<title>.*?<\/title>/, '<title>RenalCare · Demo</title>')
  .replace(/<meta name="viewport"[^>]+>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />')
  .replace('</head>', `
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#0D9488" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="RenalCare Demo" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <style>body{padding-top:env(safe-area-inset-top);box-sizing:border-box;}</style>
  </head>`);
writeFileSync(indexPath, html);
function walk(dir, prefix = '') {
  return readdirSync(dir).flatMap(name => {
    const relative = prefix + name;
    return statSync(join(dir, name)).isDirectory() ? walk(join(dir, name), relative + '/') : [relative];
  });
}
const files = walk(output).filter(f => !f.startsWith('_') || f.startsWith('_expo/'))
  .filter(f => !['sw.js'].includes(f) && !f.endsWith('.map')).sort();
if (files.some(f => f.includes('.env'))) throw new Error('Configuración privada en exportación');
const hash = createHash('sha256');
hash.update(readFileSync(__filename));
for (const file of files) hash.update(file).update(readFileSync(join(output, file)));
const version = hash.digest('hex').slice(0, 16);
// Conservar @ en rutas de paquetes: las peticiones de fuentes de Expo lo usan sin escapar.
const urls = files.map(f => encodeURI('/' + f));
const sw = `// Generado por build-pwa.cjs. Cambia al cambiar cualquier recurso.
const CACHE = 'renalcare-demo-${version}';
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS.map(url => new Request(url, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  // Conservar versiones anteriores: las pestañas abiertas pueden necesitar sus archivos.
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(cache => cache.match('/index.html')).then(response => response || fetch(event.request)));
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request, {ignoreSearch: true});
    return cached || fetch(event.request);
  })());
});
`;
writeFileSync(join(output, 'sw.js'), sw);
console.log(`PWA lista: ${files.length} recursos incluidos; versión ${version}. Publicar dist-pwa en la raíz de un sitio HTTPS.`);
