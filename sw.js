/* PHILHEALTH KING service worker: precache-all, cache-first, offline after first load. */
const CACHE = 'pk-2.1.2-54e26d8c19';
const PRECACHE = ["./", "app.js", "apple-touch-icon.png", "art/f-blink.webp", "art/f-default-clip.webp", "art/f-default.webp", "art/m-blink.webp", "art/m-default.webp", "config.js", "crew-art.js", "crew.js", "crew2.css", "data.json", "fonts.css", "fonts/Fredoka-VF.latin.woff2", "fonts/MPLUSRounded1c-Bold.latin.woff2", "fonts/MPLUSRounded1c-Bold.peso.woff2", "fonts/MPLUSRounded1c-Regular.latin.woff2", "fonts/MochiyPopOne-Regular.latin.woff2", "fonts/OFL-fredoka.txt", "fonts/OFL-mochiypopone.txt", "fonts/OFL-mplusrounded1c.txt", "ghibli-icons.js", "ghibli.css", "ghibli.js", "icons.js", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "img/hdr-day.svg", "img/hdr-night.svg", "img/icon-A.png", "img/paper@2x.webp", "img/scene/cb.png", "img/scene/ch.png", "img/scene/ct.png", "img/scene/d-brush.png", "img/scene/d-cl-0.png", "img/scene/d-cl-1.png", "img/scene/d-cl-2.png", "img/scene/d-cloth.png", "img/scene/d-curL.png", "img/scene/d-curR.png", "img/scene/d-grass-0.png", "img/scene/d-grass-1.png", "img/scene/d-grass-2.png", "img/scene/d-hills.png", "img/scene/d-mug.png", "img/scene/d-scrub.png", "img/scene/d-towel.png", "img/scene/d-train.png", "img/scene/lan.png", "img/scene/leaves-0.png", "img/scene/leaves-1.png", "img/scene/leaves-2.png", "img/scene/leaves-3.png", "img/scene/n-brush.png", "img/scene/n-cl-0.png", "img/scene/n-cl-1.png", "img/scene/n-cl-2.png", "img/scene/n-cloth.png", "img/scene/n-curL.png", "img/scene/n-curR.png", "img/scene/n-grass-0.png", "img/scene/n-grass-1.png", "img/scene/n-grass-2.png", "img/scene/n-hills.png", "img/scene/n-mug.png", "img/scene/n-scrub.png", "img/scene/n-towel.png", "img/scene/n-train.png", "img/scene/steam.png", "img/wash@1x.webp", "index.html", "lock.js", "log.js", "manifest.webmanifest", "migrate.js", "motion.css", "motion.js", "paint.js", "perf.css", "perf.js", "places.js", "pwa.css", "pwa.js", "quest.js", "scene-baked.js", "scene.css", "scene.js", "store.js", "style.css", "sync.js", "theme.css", "widget.js"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pk-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./', {cacheName: CACHE}).then(r => r || caches.match('index.html')).then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  })));
});
