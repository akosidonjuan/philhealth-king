/* PHILHEALTH KING — Ghibli-inspired layer (v2.0.0): ambient header (clouds, fireflies, drifting leaves), wind-gust leaves on tab
   switches, sync chip + optional Google sign-in / account card (real: sync.js).
   v2.1 preview: the cosmetic Ward Shop, credits, wardrobe and hair studio were removed (JC). */
(function () {
  var html = document.documentElement, RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  function C() { return window.EENT_CORE; } function S() { return window.PK_STORE; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  // ---------- ambient header ----------
  function sky() {
    var hb = document.querySelector('.hdr .hdr-body'); if (!hb || hb.querySelector('.g-sky')) return;
    var s = document.createElement('span'); s.className = 'g-sky'; s.setAttribute('aria-hidden', 'true'); var h = '';
    h += '<i class="cld" style="top:8px;animation-delay:-6s"></i><i class="cld" style="top:30px;animation-delay:-24s;animation-duration:52s;transform:scale(.7)"></i>';
    [[22, 64], [34, 40], [58, 70], [66, 30], [78, 58], [88, 76], [12, 36]].forEach(function (p, i) { h += '<i class="ff" style="left:' + p[0] + '%;top:' + p[1] + '%;animation-delay:' + (-i * 1.1).toFixed(1) + 's;animation-duration:' + (6 + i % 3) + 's"></i>'; });
    h += '<i class="lf" style="top:14px;animation-delay:-2s"></i><i class="pt" style="top:4px;animation-delay:-7s"></i><i class="lf" style="top:40px;animation-delay:-9s;animation-duration:15s"></i>';
    s.innerHTML = h; hb.insertBefore(s, hb.firstChild);
  }
  // ---------- wind gust: leaves + petals blow across on tab switches ----------
  var layer, ORD = { home: 0, detail: 0, calc: 1, quest: 2, log: 3, about: 4, crew: 4, places: 4, rules: 4 }, lastV = null;
  var COLS = ['#8cc48a', '#6fae74', '#f7b9c8', '#ffd9a8', '#b9dca0'];
  function gust(dir) {
    if (RM && RM.matches) return;
    if (!layer) { layer = document.createElement('div'); layer.id = 'gfx'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
    var W = innerWidth, H = innerHeight;
    for (var i = 0; i < 9; i++) {
      var e = document.createElement('i'), y = H * (0.12 + Math.random() * 0.7), sz = 8 + Math.random() * 8, x0 = dir > 0 ? -30 : W + 30, x1 = dir > 0 ? W + 40 : -40;
      e.style.cssText = 'width:' + sz + 'px;height:' + (sz * 0.6) + 'px;background:' + COLS[i % COLS.length] + ';animation-delay:' + (i * 38) + 'ms;--d:' + (0.8 + Math.random() * 0.4).toFixed(2) + 's;--x0:' + x0 + 'px;--y0:' + y + 'px;--x1:' + x1 + 'px;--y1:' + (y + (Math.random() * 120 - 40)) + 'px;--rot:' + (dir * (360 + Math.random() * 360)) + 'deg';
      layer.appendChild(e); (function (el) { el.addEventListener('animationend', function () { el.remove(); }); setTimeout(function () { el.remove(); }, 1800); })(e);
    }
  }
  window.addEventListener('hashchange', function () { setTimeout(function () { var v = document.querySelector('.view.active'); if (!v) return; var id = v.id;
    if (lastV != null && id !== lastV && ORD[id] !== ORD[lastV] && id !== 'detail' && lastV !== 'detail') gust((ORD[id] || 0) > (ORD[lastV] || 0) ? 1 : -1); lastV = id; }, 0); });

  // ---------- sync chip + account (v2: real optional Google sign-in / Drive appDataFolder sync, see sync.js) ----------
  function SY() { return window.PK_SYNC; }
  function ago(t) { if (!t) return 'never'; var m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; }
  function chip() { var tb = document.querySelector('.hdr .tb-btns'); if (!tb) return; var c = document.getElementById('syncChip'); if (!c) { c = document.createElement('a'); c.id = 'syncChip'; c.href = '#/about'; c.setAttribute('role', 'status'); tb.insertBefore(c, tb.firstChild); }
    var a = SY() ? SY().state() : { signed: false }, ing = a.state === 'ing', bad = !!a.err && !ing;
    c.className = 'syncchip' + (a.signed ? (ing ? ' ing' : bad ? ' off' : '') : ' off');
    c.textContent = a.signed ? (ing ? 'Syncing\u2026' : bad ? 'Sync paused' : 'Synced \u00B7 ' + ago(a.last).replace(' ago', '')) : 'Offline';
    c.setAttribute('aria-label', a.signed ? (bad ? 'Google Drive sync paused: ' + a.err : 'Google Drive sync: last synced ' + ago(a.last)) : 'Not signed in: data is saved on this phone only'); }
  var GLOGO = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.360 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.470-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  var SYNC_NOTE = 'Optional. Your log syncs to a hidden app folder in <b>your own</b> Google Drive (appDataFolder: the app cannot see your other files). There is no PHILHEALTH KING server. Works fully offline; changes sync when you are back online; the newest edit of each entry wins.';
  function welcomeHTML() {
    var ok = SY() && SY().configured();
    return '<div class="wl"><div class="wl-sky" aria-hidden="true"></div><div class="wl-card"><div class="wl-docs">' + PK_ART.build('fdoc', 'wlf', { w: 96 }) + PK_ART.build('mdoc', 'wlm', { w: 96 }) + '</div>' +
      '<h1 class="wl-t"><img class="wl-ico" src="img/icon-A.png" alt="">PHILHEALTH KING</h1><p class="wl-s">Your case rates, OR calendar and PF ledger \u2014 kept safe across phones.</p>' +
      (ok ? '<button class="gsi" type="button" data-gx="signin">' + GLOGO + '<span>Sign in with Google</span></button>'
        : '<button class="gsi soon" type="button" data-gx="soon" aria-disabled="true">' + GLOGO + '<span>Sign-in coming soon \u2014 continue offline</span></button>') +
      '<button class="wl-off" type="button" data-gx="offline">Continue offline</button>' +
      '<p class="wl-n">' + SYNC_NOTE + '</p></div></div>';
  }
  function aboutTop() { var u = (window.PK_CONFIG || {}).pagesUrl, h = aboutTop0();
    return u && /^https:\/\//.test(u) ? h.replace(/<\/div>$/, '<div class="acc-s">iPhone / web version: <a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https:\/\//, '')) + '</a></div></div>') : h; }
  function aboutTop0() {
    var y = SY(), a = y ? y.state() : { signed: false }, ok = y && y.configured();
    if (!a.signed) return '<div class="acc acc-off"><div class="acc-m"><b>Not signed in</b><span>' + (ok ? 'Your data is on this phone only. Sign in to sync it to your own Google Drive.' : 'Sign-in coming soon \u2014 continue offline. Everything works on this phone.') + '</span></div>' +
      (ok ? '<button class="rbtn sm pri" data-gx="signin">' + GLOGO + ' Sign in to sync</button>' : '<button class="rbtn sm" data-gx="soon" aria-disabled="true">Sign-in coming soon</button>') + '</div>';
    var ini = esc((a.name || a.email || 'D').charAt(0).toUpperCase());
    return '<div class="acc"><div class="acc-h"><span class="acc-av" aria-hidden="true">' + ini + '</span><div class="acc-m"><b>' + esc(a.name || 'Signed in') + '</b><span>' + esc(a.email) + '</span></div><span class="syncchip' + (a.err ? ' off' : '') + '">' + (a.state === 'ing' ? 'Syncing\u2026' : a.err ? 'Paused' : 'Synced') + '</span></div>' +
      '<div class="acc-s">' + pix('sync', 16) + ' Last synced ' + ago(a.last) + (a.n != null ? ' \u00B7 ' + a.n + ' entries' : '') + ' \u00B7 Google Drive (hidden app folder)' + (a.err && a.err !== 'offline' ? '<br><small>Last attempt: ' + esc(a.err) + '</small>' : '') + '</div>' +
      '<div class="btnrow left"><button class="rbtn sm pri" data-gx="sync">Sync now</button><button class="rbtn sm" data-gx="device">Use on another device</button><button class="rbtn sm" data-gx="signout">Sign out</button></div></div>';
  }

  // v2.1 preview: the Ward Shop, credits, wardrobe and hair studio are removed (JC, 4 Oct 2026). The doctors use the original painted sprites.
  window.PK_EQ = function () { return {}; }; window.PK_PET = function () { return ''; };
  var PAGES = { welcome: function () { document.getElementById('welcomeBody').innerHTML = welcomeHTML(); document.body.classList.add('pk-welcome'); return 'welcome'; } };
  window.addEventListener('hashchange', function () { if (location.hash !== '#/welcome') document.body.classList.remove('pk-welcome'); });
  window.PK_EXTRA = {
    match: function (h) { return h === '#/welcome'; },
    route: function () { return PAGES.welcome(); },
    aboutTop: aboutTop
  };
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target : null; if (!t) return; var b;
    if ((b = t.closest('[data-gx]'))) { var a = b.dataset.gx, y = SY();
      if (a === 'offline') { if (y) y.continueOffline(); C().toast('Continuing offline \u2014 data stays on this phone'); location.hash = '#/'; return; }
      if (a === 'soon' || !y) { C().toast('Sign-in coming soon \u2014 continue offline. Everything works on this phone.'); return; }
      if (a === 'signin') { y.signIn().then(function () { if (location.hash === '#/welcome' && y.state().signed) location.hash = '#/'; else if (location.hash === '#/about') PAGES_ABOUT(); }); return; }
      if (a === 'sync') { y.syncNow({ toast: true }); return; }
      if (a === 'signout') { y.signOut(); PAGES_ABOUT(); return; }
      if (a === 'device') { C().toast('On the other phone: install PHILHEALTH KING and sign in with this same Google account'); return; }
      return; }
  });
  function PAGES_ABOUT() { if (location.hash === '#/about') { var ab = document.getElementById('aboutBody'), top = ab && ab.querySelector('.acc'); if (top) { var d = document.createElement('div'); d.innerHTML = aboutTop(); top.replaceWith(d.firstChild); } } }
  function hookSync() { if (window.PK_SYNC) { PK_SYNC.onChange(function () { chip(); PAGES_ABOUT(); }); chip(); var y = PK_SYNC; if (y.configured() && !y.state().signed && !y.offlineChosen() && (location.hash === '' || location.hash === '#/')) location.hash = '#/welcome'; } else setTimeout(hookSync, 50); }
  function init() { sky(); chip(); hookSync(); if (window.PK_CREW && PK_CREW.remount) PK_CREW.remount(); lastV = (document.querySelector('.view.active') || {}).id || null; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
(function () { var l = document.querySelector('.logo-slot'); if (l) l.innerHTML = '<img class="pk-appico" src="img/icon-A.png" alt="" width="34" height="34">'; })();   // JC's pick: icon A "Lantern Crest"
