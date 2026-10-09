/* PHILHEALTH KING v2.1.1 smoothness helper (see perf.css): passive listeners only, no layout reads on scroll.
   Ambient scene loops hold still while the page scrolls (.pk-p) and, as before, while a transition runs or the app is idle
   (html.m-busy / html.m-idle -> .pk-h). The hold classes go on the few scene containers, not on <html>: a class change on <html>
   that a "html.x .sc *" rule depends on re-styles every element of the page (~1,500), a change on a container only re-styles
   its own small subtree. Scene pieces that are off screen get .pk-off (IntersectionObserver), so they cost nothing. */
(function () {
  'use strict';
  var html = document.documentElement, on = false, t = 0, held = false;
  var SCROLL = '.hdr-body, .sc, #sc-fx, #gfx, #mfx', HOLD = '.sc, .m-sky, .g-sky, .hdr-body', HOLDRE = /(^|\s)m-(idle|busy)(\s|$)/;
  function mark(sel, cls, v, root) { var els = (root || document).querySelectorAll(sel); for (var i = 0; i < els.length; i++) els[i].classList.toggle(cls, v); }
  function end() { on = false; mark(SCROLL, 'pk-p', false); }
  addEventListener('scroll', function () { if (!on) { on = true; mark(SCROLL, 'pk-p', true); } clearTimeout(t); t = setTimeout(end, 180); }, { passive: true, capture: true });
  function holdSync() { var h = HOLDRE.test(html.className); if (h !== held) { held = h; mark(HOLD, 'pk-h', h); } }
  function added(ms) {   // new scene nodes pick up the current hold state before they are first rendered (observer runs before paint)
    for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) { var n = ms[i].addedNodes[j]; if (n.nodeType !== 1) continue;
      if (held) { if (n.matches(HOLD)) n.classList.add('pk-h'); if (n.firstElementChild) mark(HOLD, 'pk-h', true, n); }
      if (on) { if (n.matches(SCROLL)) n.classList.add('pk-p'); if (n.firstElementChild) mark(SCROLL, 'pk-p', true, n); } }
  }
  if (window.MutationObserver) {
    new MutationObserver(holdSync).observe(html, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(function (ms) { if (held || on) added(ms); soon(); }).observe(document.body || html, { childList: true, subtree: true });
  }
  holdSync();
  var io = 'IntersectionObserver' in window && new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('pk-off', !e.isIntersecting); }); }, { rootMargin: '64px 0px' });
  var q = 0;
  function scan() { q = 0; if (!io) return; var els = document.querySelectorAll('.sc, .g-sky'); for (var i = 0; i < els.length; i++) if (!els[i]._pkio) { els[i]._pkio = 1; io.observe(els[i]); } }
  function soon() { if (!q) q = setTimeout(scan, 250); }
  window.addEventListener('hashchange', soon); window.addEventListener('load', soon);
  soon();
})();
