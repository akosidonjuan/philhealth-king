/* PHILHEALTH KING motion layer: view transitions, springs, staggers, ripples, particles, save splash + bounty roll-up,
   ambient header sky with idle/background pause. Pure transform/opacity; honours prefers-reduced-motion. */
(function () {
  'use strict';
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reduced() { return RM.matches; }
  var ORDER = { home: 0, detail: 0, calc: 1, quest: 2, log: 3, about: 4, places: 4, rules: 4, crew: 4, welcome: 0, locked: 2 };
  var html = document.documentElement, lastView = null, lastHash = location.hash || '#/';
  function activeView() { return document.querySelector('.view.active'); }
  function once(el, cls, ms) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, ms); }

  // ---------- view enter: slide/crossfade + panel springs + row stagger ----------
  var busyT = 0;
  function busy(ms) { html.classList.add('m-busy'); clearTimeout(busyT); busyT = setTimeout(function () { html.classList.remove('m-busy'); }, ms); }   // ambient loops hold still while a transition runs
  function enter(v, dir) {   // no forced reflow: classes go on in the next frame, come off after the animation
    if (!v) return; busy(800);
    requestAnimationFrame(function () {
      var wins = v.querySelectorAll('.win'), n = 0;
      var sx = (dir > 0 ? 26 : dir < 0 ? -26 : 0) + 'px', bk = v.querySelectorAll('.bkrem');   // --sx goes on the animated pieces themselves (non-inherited, perf.css)
      for (var b = 0; b < bk.length; b++) bk[b].style.setProperty('--sx', sx);
      for (var i = 0; i < wins.length && n < 3; i++) { var w = wins[i]; if (w.closest('.topdock') || w.closest('.win') !== w && w.parentElement.closest('.win')) continue; w.style.setProperty('--sx', sx); w.style.setProperty('--i', n++); stamp(w, 'm-spr', 650 + n * 45); }
      if (!n) stamp(v, dir > 0 ? 'm-vr' : dir < 0 ? 'm-vl' : 'm-vf', 380);
      var rows = v.querySelectorAll('.row, .qe, .lp-e, .prow, .qgh'), k = 0;
      for (var j = 0; j < rows.length && k < 8; j++) { rows[j].style.setProperty('--i', k++); stamp(rows[j], 'm-row', 560); }
    });
  }
  function stamp(el, cls, ms) { el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); el.style.removeProperty('--i'); }, ms); }
  function onRoute() {
    var h = location.hash || '#/', v = activeView(); if (!v) return;
    var same = v.id === lastView, sub = h !== lastHash;
    if (!same) enter(v, lastView == null ? 0 : Math.sign((ORDER[v.id] || 0) - (ORDER[lastView] || 0)) || (v.id === 'detail' ? 1 : lastView === 'detail' ? -1 : 0));
    else if (sub && v.id === 'quest') enter(v, 0);           // Quest sub-pages (day, form, search) crossfade
    lastView = v.id; lastHash = h;
    if (pendingSave) setTimeout(saveFx, 60);
  }
  window.addEventListener('hashchange', function () { setTimeout(onRoute, 0); });

  // ---------- ripple on press ----------
  var RIP = '.rbtn, .tab, .chipbtn, .menubar a, .paypill, .qd, .row, .prow, .qe, .icoopt';
  document.addEventListener('pointerdown', function (e) {
    lastPt = { x: e.clientX, y: e.clientY };
    if (reduced()) return;
    var t = e.target.closest && e.target.closest(RIP); if (!t || t.disabled) return;
    t.classList.add('m-rh');
    var r = t.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, d = document.createElement('span');
    d.className = 'm-rip'; d.style.width = d.style.height = s + 'px'; d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px';
    t.appendChild(d); setTimeout(function () { d.remove(); }, 520);
  }, { passive: true, capture: true });
  var lastPt = { x: innerWidth / 2, y: innerHeight / 2 };

  // ---------- particle overlay ----------
  var layer = null;
  function fx() { if (!layer) { layer = document.createElement('div'); layer.id = 'mfx'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); } return layer; }
  function part(cls, x, y, dx, dy, delay, txt) {
    var p = document.createElement('i'); p.className = cls;
    p.style.setProperty('--x0', x + 'px'); p.style.setProperty('--y0', y + 'px'); p.style.setProperty('--dx', (dx || 0) + 'px'); p.style.setProperty('--dy', (dy || 0) + 'px');
    if (delay) p.style.animationDelay = delay + 'ms'; if (txt) p.textContent = txt;
    fx().appendChild(p); p.addEventListener('animationend', function () { p.remove(); }); setTimeout(function () { p.remove(); }, 1700 + (delay || 0));
  }
  function coinBurst(x, y) {
    if (reduced()) return; busy(900);
    for (var i = 0; i < 12; i++) { var a = -Math.PI / 2 + (i / 11 - .5) * 2.4, sp = 50 + Math.random() * 40; part('coin', x, y, Math.cos(a) * sp, Math.sin(a) * sp + 30, i * 12); }
    for (var k = 0; k < 6; k++) { var b = Math.random() * Math.PI * 2; part('spk', x, y, Math.cos(b) * 44, Math.sin(b) * 44, 40); }
    part('chk', x, y, 0, 0, 0, '\u2713');
  }
  function splash(x, y) {
    if (reduced()) return; busy(1000);
    part('ring', x, y); setTimeout(function () { part('ring', x, y); }, 120);
    for (var i = 0; i < 14; i++) { var a = -Math.PI + (i / 13) * Math.PI, sp = 40 + Math.random() * 50; part('drop', x, y, Math.cos(a) * sp, Math.sin(a) * sp - 10, i * 8); }
    for (var k = 0; k < 8; k++) { var b = Math.random() * Math.PI * 2; part('spk', x, y, Math.cos(b) * 60, Math.sin(b) * 60, 60 + k * 10); }
  }
  // Paid toggle: gold burst + seafoam check (read the state before quest.js flips it)
  document.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('[data-qpay]'); if (!p) return;
    var toPaid = !p.classList.contains('paid'), id = p.dataset.qpay, r = p.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    setTimeout(function () {
      var n = document.querySelector('.view.active [data-qpay="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (n) once(n, 'm-pop', 500);
      if (toPaid) coinBurst(x, y);
    }, 0);
  }, true);

  // ---------- save quest: splash + bounty roll-up ----------
  var pendingSave = null;
  function rollNum(el, ms) {
    var tn = null, w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { if (/\d[\d,]*(\.\d+)?\s*\u20B1|\u20B1\s*\d/.test(n.nodeValue)) { tn = n; break; } }
    if (!tn) return;
    var m = tn.nodeValue.match(/(\d[\d,]*)(\.\d+)?(?=\s*\u20B1)/) || tn.nodeValue.match(/(\d[\d,]*)(\.\d+)?/); if (!m) return;
    var full = m[0], dec = m[2] ? m[2].length - 1 : 0, to = parseFloat(full.replace(/,/g, '')), pre = tn.nodeValue.slice(0, m.index), post = tn.nodeValue.slice(m.index + full.length), t0 = performance.now();
    if (!(to > 0)) return;
    function fmt(v) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
    (function tick(now) { var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); tn.nodeValue = pre + fmt(k < 1 ? to * e : to) + post; if (k < 1) requestAnimationFrame(tick); })(t0);
    once(el, 'm-roll', 950);
  }
  function saveFx() {
    var s = pendingSave; pendingSave = null; if (!s || reduced()) return;
    splash(s.x, s.y);
    var h = document.querySelector('.view.active .qday-h span'); if (h) rollNum(h, 900);
    var hr = h ? h.getBoundingClientRect() : null;
    if (s.pf > 0 && window.EENT_CORE) part('bty', Math.max(120, Math.min(innerWidth - 120, hr ? hr.left + hr.width / 2 : innerWidth / 2)), hr ? hr.top : 120, 0, 0, 150, '+' + EENT_CORE.z(s.pf / 100) + ' PF \u2726');
  }
  window.PK_FX = {
    saved: function (entry) { pendingSave = { x: lastPt.x, y: lastPt.y, pf: entry && entry.status !== 'sched' ? (window.PK_STORE && PK_STORE.myPF ? PK_STORE.myPF(entry) : entry.pf_c) : 0 }; },
    coinBurst: coinBurst, splash: splash, roll: rollNum, reduced: reduced
  };

  // ---------- ambient header sky ----------
  function sky() {
    var hb = document.querySelector('.hdr .hdr-body'); if (!hb || hb.querySelector('.m-sky')) return;
    var s = document.createElement('span'); s.className = 'm-sky'; s.setAttribute('aria-hidden', 'true');
    var h = '', st = [[8, 20], [22, 60], [36, 14], [49, 44], [63, 22], [74, 62], [86, 30], [95, 12]];
    st.forEach(function (p, i) { h += '<i class="st" style="left:' + p[0] + '%;top:' + p[1] + '%;animation-delay:' + (-i * 0.73).toFixed(2) + 's;animation-duration:' + (2 + (i % 3) * 0.7) + 's"></i>'; });
    h += '<i class="sun"></i><i class="cl" style="top:8px;animation-delay:-4s"></i><i class="cl" style="top:26px;animation-delay:-17s;animation-duration:34s;transform:scale(.7)"></i>';
    s.innerHTML = h; hb.insertBefore(s, hb.firstChild);
  }
  // idle / background: pause ambient loops after 12 s without input or when hidden
  var idleT = 0;
  function wake() { html.classList.remove('m-idle'); clearTimeout(idleT); idleT = setTimeout(function () { html.classList.add('m-idle'); }, 12000); }
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, wake, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) html.classList.add('m-idle'); else wake(); });

  function init() { sky(); wake(); lastView = (activeView() || {}).id || null; enter(activeView(), 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
