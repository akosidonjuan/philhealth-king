/* PHILHEALTH KING — Ghibli-inspired layer (v2.0.0): ambient header (clouds, fireflies),
   sync chip + optional Google sign-in / account card (real: sync.js).
   v2.1 preview: the cosmetic Ward Shop, credits, wardrobe and hair studio were removed (JC).
   Simple-pass: leaf gusts and drifting header leaves/petals removed. */
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
    s.innerHTML = h; hb.insertBefore(s, hb.firstChild);
  }

  // ---------- sync chip + account (v2: real optional Google sign-in / Drive appDataFolder sync, see sync.js) ----------
  function SY() { return window.PK_SYNC; }
  function ago(t) { if (!t) return 'never'; var m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; }
  function chip() { var tb = document.querySelector('.hdr .tb-btns'); if (!tb) return; var c = document.getElementById('syncChip'); if (!c) { c = document.createElement('a'); c.id = 'syncChip'; c.href = '#/about'; c.setAttribute('role', 'status'); tb.insertBefore(c, tb.firstChild); }
    var a = SY() ? SY().state() : { signed: false }, ing = a.state === 'ing', bad = !!a.err && !ing;
    c.className = 'syncchip' + (a.signed ? (ing ? ' ing' : bad ? ' off' : '') : ' off');
    c.textContent = a.signed ? (ing ? 'Syncing\u2026' : bad ? 'Sync paused' : 'Synced \u00B7 ' + ago(a.last).replace(' ago', '')) : 'Offline';
    c.setAttribute('aria-label', a.signed ? (bad ? 'Google Drive sync paused: ' + a.err : 'Google Drive sync: last synced ' + ago(a.last)) : 'Not signed in: data is saved on this phone only'); }
  var GLOGO = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.360 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.470-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  var TEST_NOTE = 'Sign-in is in test mode: Google may ask you to sign in again about every 7 days.';
  var SYNC_NOTE = 'Optional. Your log syncs to a hidden app folder in <b>your own</b> Google Drive (appDataFolder: the app cannot see your other files). There is no PHILHEALTH KING server. Works fully offline; changes sync when you are back online; the newest edit of each entry wins. <b>' + TEST_NOTE + '</b>';
  function welcomeHTML() {
    var ok = SY() && SY().configured();
    return '<div class="wl"><div class="wl-sky" aria-hidden="true"></div><div class="wl-card"><div class="wl-docs"><img class="wl-cici" src="art/miner/anim/welcome-cici.webp" alt="Cici the Legendary PhilHealth Miner" width="132" height="132" onerror="this.onerror=null;this.src=\'art/miner/hero/hero-still.webp\'"></div>' +
      '<h1 class="wl-t"><img class="wl-ico" src="icons/icon-192.png" alt="">PHILHEALTH KING</h1><p class="wl-s">Your case rates and procedure log \u2014 kept safe across phones.</p>' +
      (ok ? '<button class="gsi" type="button" data-gx="signin">' + GLOGO + '<span>Sign in with Google</span></button>'
        : '<button class="gsi soon" type="button" data-gx="soon" aria-disabled="true">' + GLOGO + '<span>Sign-in coming soon \u2014 continue offline</span></button>') +
      '<button class="wl-off" type="button" data-gx="offline">Continue offline</button>' +
      '<p class="wl-n">' + SYNC_NOTE + '</p>' +
      '<div class="wl-iconopt"><img class="wl-iconpreview" src="icons/icon-192.png" alt="Leaf and sun app icon" width="56" height="56"><p>Preview app icon: leaf and sun. Not in the shipped APK yet.</p></div></div></div>';
  }
  function aboutTop() { var u = (window.PK_CONFIG || {}).pagesUrl, h = aboutTop0();
    if (u && /^https:\/\//.test(u)) { var priv = u.replace(/\/?$/, '/') + 'privacy-policy.html'; h = h.replace(/<\/div>$/, '<div class="acc-s">iPhone / web version: <a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https:\/\//, '')) + '</a> \u00B7 <a href="' + esc(priv) + '" target="_blank" rel="noopener">Privacy policy</a></div></div>'); }
    return h; }
  function aboutTop0() {
    var y = SY(), a = y ? y.state() : { signed: false }, ok = y && y.configured();
    if (!a.signed) return '<div class="acc acc-off"><div class="acc-m"><b>Not signed in</b><span>' + (ok ? 'Your data is on this phone only. Sign in to sync it to your own Google Drive.' : 'Sign-in coming soon \u2014 continue offline. Everything works on this phone.') + '</span></div>' +
      '<div class="btnrow left acc-restore">' + (ok ? '<button class="rbtn sm pri" data-gx="signin">' + GLOGO + ' Sign in to sync</button>' : '<button class="rbtn sm" data-gx="soon" aria-disabled="true">Sign-in coming soon</button>') +
      '<button class="rbtn sm" data-gx="restore" disabled>Restore from Google Drive</button></div>' +
      '<p class="acc-hint">Sign in to restore your backup from Google Drive.</p>' +
      (ok ? '<p class="acc-test">' + TEST_NOTE + '</p>' : '') + '</div>';
    var ini = esc((a.name || a.email || 'D').charAt(0).toUpperCase());
    var waiting = y.held && y.held();
    return '<div class="acc"><div class="acc-h"><span class="acc-av" aria-hidden="true">' + ini + '</span><div class="acc-m"><b>' + esc(a.name || 'Signed in') + '</b><span>' + esc(a.email) + '</span></div><span class="syncchip' + (a.err || waiting ? ' off' : '') + '">' + (a.state === 'ing' ? 'Syncing\u2026' : a.err ? 'Paused' : waiting ? 'Backup waiting' : 'Synced') + '</span></div>' +
      '<div class="acc-s">' + pix('sync', 16) + ' Last synced ' + ago(a.last) + (a.n != null ? ' \u00B7 ' + a.n + ' entries' : '') + ' \u00B7 Google Drive (hidden app folder)' + (waiting ? '<br><small>There\u2019s a backup on Drive \u2014 Restore or Back up now whenever you\u2019re ready.</small>' : '') + (a.err && a.err !== 'offline' ? '<br><small>Last attempt: ' + esc(a.err) + '</small>' : '') + '</div>' +
      '<div class="btnrow left"><button class="rbtn sm pri" data-gx="sync">Sync now</button><button class="rbtn sm" data-gx="device">Use on another device</button><button class="rbtn sm" data-gx="signout">Sign out</button></div>' +
      '<div class="btnrow left acc-restore"><button class="rbtn sm pri" data-gx="restore">Restore from Google Drive</button><button class="rbtn sm" data-gx="backupnow">Back up now</button></div>' +
      '<p class="acc-test">' + TEST_NOTE + '</p></div>';
  }

  // v2.1 preview: the Ward Shop, credits, wardrobe and hair studio are removed (JC, 4 Oct 2026). Cici the Legendary PhilHealth Miner is the on-screen avatar (preview).
  window.PK_EQ = function () { return {}; }; window.PK_PET = function () { return ''; };
  var PAGES = { welcome: function () { document.getElementById('welcomeBody').innerHTML = welcomeHTML(); document.body.classList.add('pk-welcome'); return 'welcome'; } };
  window.addEventListener('hashchange', function () { if (location.hash !== '#/welcome') document.body.classList.remove('pk-welcome'); });
  window.PK_EXTRA = {
    match: function (h) { return h === '#/welcome'; },
    route: function () { return PAGES.welcome(); },
    aboutTop: aboutTop
  };

  function casesW(n) { n = +n || 0; return n === 1 ? '1 case' : n.toLocaleString('en-US') + ' cases'; }
  function fmtWhen(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(+d)) return '';
    try { return d.toLocaleString('en-PH', { timeZone: 'Asia/Manila', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return d.toISOString(); }
  }
  function pkrBox() {
    var d = document.getElementById('pkrestore');
    if (!d) {
      d = document.createElement('div'); d.id = 'pkrestore'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      document.body.appendChild(d);
      d.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-pkr]'); if (!b) return;
        var a = b.dataset.pkr;
        if (a === 'later' || a === 'cancel' || a === 'ok') { hideRestore(); return; }
        if (a === 'go') { doRestore(); return; }
        if (a === 'signin') { hideRestore(); if (SY()) SY().signIn(); return; }
      });
    }
    return d;
  }
  function hideRestore() { var d = document.getElementById('pkrestore'); if (d) { d.classList.remove('show'); d.innerHTML = ''; } document.body.classList.remove('pk-sheet'); }
  function showRestore(html, label) {
    var d = pkrBox(); d.setAttribute('aria-label', label || 'Restore from Google Drive');
    d.innerHTML = '<div class="pkr-card">' + html + '</div>';
    d.classList.add('show'); document.body.classList.add('pk-sheet');
    if (location.hash === '#/welcome') location.hash = '#/';
  }
  function extraBits(info) {
    var bits = [];
    if (info.favs) bits.push(info.favs === 1 ? '1 favorite' : info.favs + ' favorites');
    if (info.places) bits.push(info.places === 1 ? '1 saved place' : info.places + ' saved places');
    return bits.length ? ' Plus ' + bits.join(' and ') + '.' : '';
  }
  function offerCopy(info, kind) {
    var when = fmtWhen(info.modifiedTime || info.at), n = info.n || 0;
    var title, lead;
    if (kind === 'confirm') {
      title = n ? 'Restore ' + casesW(n) + '?' : 'Restore your backup?';
      lead = n
        ? 'This is from your Drive backup' + (when ? ' (last updated ' + esc(when) + ')' : '') + '.'
        : 'Your Drive backup has favorites and places, but no cases yet' + (when ? ' (last updated ' + esc(when) + ')' : '') + '.';
    } else {
      title = 'Restore from Google Drive?';
      lead = n
        ? 'We found a backup with <b>' + casesW(n) + '</b> in your Google Drive.'
        : 'We found a backup in your Google Drive (favorites and places, no cases yet).';
    }
    var whenLine = (kind === 'offer' && when) ? '<p class="pkr-when">Last updated: ' + esc(when) + '</p>' : '';
    var note = 'We\u2019ll merge this into this phone \u2014 existing entries stay, and the newest edit wins. Your doctor, theme and PIN stay on this phone.';
    if (kind === 'confirm') note = 'We\u2019ll merge this into this phone. We won\u2019t erase entries already here (newest edit wins). Your doctor, theme and PIN stay on this phone.';
    var actions = kind === 'confirm'
      ? '<div class="btnrow left"><button class="rbtn pri" data-pkr="go">Restore</button><button class="rbtn" data-pkr="cancel">Cancel</button></div>'
      : '<div class="btnrow left"><button class="rbtn pri" data-pkr="go">Restore</button><button class="rbtn" data-pkr="later">Not now</button></div>';
    return '<h2 id="pkr-t">' + title + '</h2><p>' + lead + extraBits(info) + '</p>' + whenLine + '<p class="pkr-note">' + note + '</p>' + actions;
  }
  function oopsCopy(err) {
    if (err === 'empty') return '<h2 id="pkr-t">No backup yet</h2><p>There\u2019s no backup in your Google Drive yet. Log a case first, then tap Back up now.</p><div class="btnrow left"><button class="rbtn pri" data-pkr="ok">OK</button></div>';
    if (err === 'offline') return '<h2 id="pkr-t">You\u2019re offline</h2><p>We can\u2019t reach Google Drive right now. Try again when you\u2019re back online.</p><div class="btnrow left"><button class="rbtn pri" data-pkr="ok">OK</button></div>';
    if (err === 'auth') return '<h2 id="pkr-t">Session expired</h2><p>Session expired. Please sign in again.</p><div class="btnrow left"><button class="rbtn pri" data-pkr="signin">Sign in again</button><button class="rbtn" data-pkr="cancel">Not now</button></div>';
    if (err === 'signed-out') return '<h2 id="pkr-t">Please sign in</h2><p>Sign in with Google to restore your backup from Drive.</p><div class="btnrow left"><button class="rbtn pri" data-pkr="ok">OK</button></div>';
    return '<h2 id="pkr-t">Couldn\u2019t restore</h2><p>Something went sideways. Try again in a bit.</p><p class="pkr-note">' + esc(err) + '</p><div class="btnrow left"><button class="rbtn pri" data-pkr="ok">OK</button></div>';
  }
  function toastRestore(r) {
    var T = C() && C().toast; if (!T) return;
    if (r && r.ok) {
      if (r.added || r.updated) {
        var msg = 'Restored ' + casesW(r.added || 0) + (r.updated ? ' (' + r.updated + ' updated)' : '') + '. Welcome back!';
        T(msg, 3200);
      } else T('Already up to date \u2014 ' + casesW(r.n) + ' on this phone.', 2800);
      if (window.PK_CREW && PK_CREW.play) PK_CREW.play('happy'); /* eClaims-success face on restore */
    }
  }
  var pendingInfo = null;
  function doRestore() {
    var y = SY(); if (!y || !y.restoreNow) return;
    showRestore('<h2 id="pkr-t">Restoring\u2026</h2><p>Getting your backup from Drive. Just a moment.</p>', 'Restoring');
    y.restoreNow().then(function (r) {
      hideRestore();
      if (!r || r.err) { showRestore(oopsCopy((r && r.err) || 'error'), 'Restore could not finish'); if (window.PK_CREW && PK_CREW.play) PK_CREW.play((r && r.err) === 'offline' ? 'offline' : 'error'); return; }
      PAGES_ABOUT(); toastRestore(r);
    });
  }
  window.PK_RESTORE = {
    offer: function (info) { pendingInfo = info || {}; showRestore(offerCopy(pendingInfo, 'offer'), 'Restore from Google Drive'); },
    confirm: function (info) { pendingInfo = info || pendingInfo || {}; showRestore(offerCopy(pendingInfo, 'confirm'), 'Confirm restore from Google Drive'); },
    oops: function (err) { showRestore(oopsCopy(err), err === 'empty' ? 'No backup yet' : 'Restore'); },
    hide: hideRestore,
    ask: function () {
      var y = SY(); if (!y || !y.state().signed) { showRestore(oopsCopy('signed-out'), 'Please sign in'); return; }
      if (navigator.onLine === false) { showRestore(oopsCopy('offline'), 'You\u2019re offline'); return; }
      showRestore('<h2 id="pkr-t">Checking Drive\u2026</h2><p>Looking for your backup. Just a moment.</p>', 'Checking Drive');
      y.peekRemote().then(function (info) {
        if (!info || info.err) { showRestore(oopsCopy((info && info.err) || 'error'), 'Restore'); return; }
        if (!info.hasData) { showRestore(oopsCopy('empty'), 'No backup yet'); return; }
        PK_RESTORE.confirm(info);
      });
    },
    _show: showRestore   // preview screenshots
  };

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target : null; if (!t) return; var b;
    if ((b = t.closest('[data-gx]'))) { var a = b.dataset.gx, y = SY();
      if (a === 'offline') { if (y) y.continueOffline(); C().toast('Continuing offline \u2014 data stays on this phone'); location.hash = '#/'; return; }
      if (a === 'soon' || !y) { C().toast('Sign-in coming soon \u2014 continue offline. Everything works on this phone.'); return; }
      if (a === 'signin') { y.signIn().then(function () { if (location.hash === '#/welcome' && y.state().signed) location.hash = '#/'; else if (location.hash === '#/about') PAGES_ABOUT(); }); return; }
      if (a === 'sync') { y.syncNow({ toast: true, force: true }); return; }
      if (a === 'backupnow') { y.backupNow(); return; }
      if (a === 'restore') { if (!y || !y.state().signed || b.disabled) return; PK_RESTORE.ask(); return; }
      if (a === 'signout') { y.signOut(); PAGES_ABOUT(); return; }
      if (a === 'device') { C().toast('On the other phone: install PHILHEALTH KING and sign in with this same Google account'); return; }
      return; }
  });
  function PAGES_ABOUT() { if (location.hash === '#/about') { var ab = document.getElementById('aboutBody'), top = ab && ab.querySelector('.acc'); if (top) { var d = document.createElement('div'); d.innerHTML = aboutTop(); top.replaceWith(d.firstChild); } } }
  function hookSync() { if (window.PK_SYNC) { PK_SYNC.onChange(function () { chip(); PAGES_ABOUT(); }); chip(); var y = PK_SYNC; if (y.configured() && !y.state().signed && !y.offlineChosen() && (location.hash === '' || location.hash === '#/') && window.PK_CREW && PK_CREW.chosen()) location.hash = '#/welcome'; } else setTimeout(hookSync, 50); }
  function init() { sky(); chip(); hookSync(); if (window.PK_CREW && PK_CREW.remount) PK_CREW.remount(); lastV = (document.querySelector('.view.active') || {}).id || null; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
(function () { var l = document.querySelector('.logo-slot'); if (l) l.innerHTML = '<img class="pk-appico" src="icons/icon-192.png" alt="" width="34" height="34">'; })();   // JC's pick: concept 3 leaf-sun (preview)
