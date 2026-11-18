/* PHILHEALTH KING service worker: precache-all, cache-first, offline after first load. */
const CACHE = 'pk-2.2.2-f6441b9a23';
const PRECACHE = ["./", "app.js", "apple-touch-icon.png", "art/meadow-dark.svg", "art/meadow-light.svg", "art/meadow-mark.svg", "art/miner/anim/about-mini.png", "art/miner/anim/about-mini.webp", "art/miner/anim/claims-sheet.webp", "art/miner/anim/claims-still.webp", "art/miner/anim/hotdog-sheet.webp", "art/miner/anim/hotdog-still.webp", "art/miner/anim/mining-sheet.webp", "art/miner/anim/mining-still.webp", "art/miner/anim/stand-sheet.webp", "art/miner/anim/stand-still.webp", "art/miner/anim/welcome-cici.webp", "art/miner/compact/claims-sheet.webp", "art/miner/compact/hero-still.webp", "art/miner/compact/hotdog-sheet.webp", "art/miner/compact/mining-sheet.webp", "art/miner/compact/run-sheet.webp", "art/miner/compact/stand-sheet.webp", "art/miner/ground/ledge-dark.webp", "art/miner/ground/ledge-meta.json", "art/miner/ground/ledge.webp", "art/miner/ground/shadow-hops.json", "art/miner/ground/tex.webp", "art/miner/hero/hero-still.webp", "art/miner/hero/run-sheet.webp", "art/miner/manifest.json", "banner.css", "config.js", "crew.js", "crew2.css", "data.json", "fonts.css", "fonts/Baloo2-VF.latin.ttf", "fonts/MPLUSRounded1c-Bold.latin.woff2", "fonts/MPLUSRounded1c-Bold.peso.woff2", "fonts/MPLUSRounded1c-Regular.latin.woff2", "fonts/Nunito-VariableFont_wght.ttf", "fonts/OFL-baloo2.txt", "fonts/OFL-mplusrounded1c.txt", "fonts/OFL-nunito.txt", "ghibli-icons.js", "ghibli.css", "ghibli.js", "icons.js", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-1024.png", "icons/icon-192.png", "icons/icon-32.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "img/hdr-day.svg", "img/hdr-night.svg", "img/icon-A.png", "img/paper@2x.webp", "img/scene/cb.png", "img/scene/ch.png", "img/scene/ct.png", "img/scene/d-brush.png", "img/scene/d-cl-0.png", "img/scene/d-cl-1.png", "img/scene/d-cl-2.png", "img/scene/d-cloth.png", "img/scene/d-curL.png", "img/scene/d-curR.png", "img/scene/d-grass-0.png", "img/scene/d-grass-1.png", "img/scene/d-grass-2.png", "img/scene/d-hills.png", "img/scene/d-mug.png", "img/scene/d-scrub.png", "img/scene/d-towel.png", "img/scene/d-train.png", "img/scene/lan.png", "img/scene/leaves-0.png", "img/scene/leaves-1.png", "img/scene/leaves-2.png", "img/scene/leaves-3.png", "img/scene/n-brush.png", "img/scene/n-cl-0.png", "img/scene/n-cl-1.png", "img/scene/n-cl-2.png", "img/scene/n-cloth.png", "img/scene/n-curL.png", "img/scene/n-curR.png", "img/scene/n-grass-0.png", "img/scene/n-grass-1.png", "img/scene/n-grass-2.png", "img/scene/n-hills.png", "img/scene/n-mug.png", "img/scene/n-scrub.png", "img/scene/n-towel.png", "img/scene/n-train.png", "img/scene/steam.png", "img/wash@1x.webp", "index.html", "ios-safari.css", "lock.js", "log.js", "manifest.webmanifest", "meadow.css", "meadow.js", "migrate.js", "miner.css", "motion.css", "motion.js", "passport.css", "perf.css", "perf.js", "places.js", "polish.css", "privacy-policy.html", "pwa.css", "pwa.js", "quest.js", "scene-baked.js", "scene.css", "scene.js", "speed.css", "store.js", "style.css", "sync.js", "theme.css", "widget.js"];
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
    e.respondWith(fetch(req).then(res => {
      if (res && res.ok) {
        const cp = res.clone();
        caches.open(CACHE).then(c => { c.put('./', cp.clone()); c.put('index.html', cp); });
      }
      return res;
    }).catch(() => caches.match('./', {cacheName: CACHE}).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  })));
});
