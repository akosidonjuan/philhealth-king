/* PHILHEALTH KING optional PIN lock (off by default). 4-6 digit PIN, stored only as salted SHA-256 (pk_lock = {salt, hash, scope:'quest'|'app'}).
   Scope 'quest' locks Quest + Log Pose; 'app' locks everything. Re-locks when the app goes to background. 5 wrong tries -> 30 s wait.
   The Quest/Log views are blanked while the app is backgrounded (app-switcher thumbnail) whenever a PIN is set. */
(function () {
  var KEY = 'pk_lock', unlocked = false, fails = 0, waitUntil = 0, entry = '', onOk = null;
  function sha256(ascii) {   // compact public-domain SHA-256 (sync; works without crypto.subtle / secure context)
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mp = Math.pow, maxW = mp(2, 32), res = '', words = [], bl = ascii.length * 8, hash = [], k = [], pc = 0, isC = {};
    for (var c = 2; pc < 64; c++) { if (!isC[c]) { for (var i = 0; i < 313; i += c) isC[i] = c; hash[pc] = (mp(c, .5) * maxW) | 0; k[pc++] = (mp(c, 1 / 3) * maxW) | 0; } }
    hash = hash.slice(0, 8); ascii += '\x80'; while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) { var j = ascii.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = ((bl / maxW) | 0); words[words.length] = bl;
    for (j = 0; j < words.length;) { var w = words.slice(j, j += 16), oh = hash; hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) { var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0; }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oh[i]) | 0; }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; res += ((b < 16) ? 0 : '') + b.toString(16); }
    return res;
  }
  function cfg() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function on() { var c = cfg(); return !!(c && c.hash); }
  function guarded(h) { var c = cfg(); if (!c || !c.hash || unlocked) return false; return c.scope === 'app' || /^#\/(quest|log)/.test(h || ''); }
  function check(pin) { var c = cfg(); return c && sha256(c.salt + ':' + pin) === c.hash; }
  function setPin(pin, scope) { var salt = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(KEY, JSON.stringify({ salt: salt, hash: sha256(salt + ':' + pin), scope: scope || 'quest' })); unlocked = true; }
  function clear() { localStorage.removeItem(KEY); unlocked = false; }
  function el() { var d = document.getElementById('pklock'); if (!d) { d = document.createElement('div'); d.id = 'pklock'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Enter PIN'); document.body.appendChild(d); } return d; }
  function draw(msg) {
    var wait = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000)), keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
    el().innerHTML = '<div class="win lockwin"><div class="tb"><span class="tb-t">' + ((cfg() || {}).scope === 'app' ? 'PHILHEALTH KING' : 'Quest Log') + ' is locked</span></div><div class="wbody">' +
      '<div class="lk-ico">' + pix('lock', 40) + '</div><div class="lk-dots">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<i class="' + (i < entry.length ? 'on' : '') + (i >= 4 ? ' opt' : '') + '"></i>'; }).join('') + '</div>' +
      '<div class="lk-msg" aria-live="polite">' + (wait ? 'Too many tries. Wait ' + wait + ' s.' : (msg || 'Enter your 4\u20136 digit PIN')) + '</div>' +
      '<div class="lk-pad">' + keys.map(function (k) { return '<button class="rbtn lk-k" data-lk="' + k + '"' + (wait ? ' disabled' : '') + '>' + (k === 'del' ? '\u232B' : k === 'ok' ? 'OK' : k) + '</button>'; }).join('') + '</div>' +
      '<a class="lk-cancel" href="#/" data-lk="cancel">Back to Rates</a></div></div>';
    if (wait) setTimeout(function () { if (document.getElementById('pklock').classList.contains('show')) draw(); }, 1000);
  }
  function show(cb) { entry = ''; onOk = cb; draw(); el().classList.add('show'); document.body.classList.add('pk-locked'); }
  function hide() { el().classList.remove('show'); document.body.classList.remove('pk-locked'); }
  function submit() {
    if (Date.now() < waitUntil) return;
    if (entry.length >= 4 && check(entry)) { unlocked = true; fails = 0; hide(); var f = onOk; onOk = null; if (f) f(); return; }
    fails++; entry = ''; if (fails >= 5) { waitUntil = Date.now() + 30000; fails = 0; } draw('Wrong PIN');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lk]'); if (!b) return; var k = b.dataset.lk;
    if (k === 'cancel') { hide(); return; }
    if (k === 'del') entry = entry.slice(0, -1); else if (k === 'ok') return submit(); else if (entry.length < 6) entry += k;
    draw(); if (entry.length === 6) submit();
  });
  document.addEventListener('visibilitychange', function () {
    if (!on()) return;
    if (document.hidden) { document.body.classList.add('pk-bg'); unlocked = false; }
    else { document.body.classList.remove('pk-bg'); if (guarded(location.hash)) show(function () { window.dispatchEvent(new HashChangeEvent('hashchange')); }); }
  });
  window.PK_LOCK = { on: on, guarded: guarded, show: show, hide: hide, setPin: setPin, clear: clear, check: check, cfg: cfg, lockNow: function () { unlocked = false; }, _sha: sha256 };
})();
