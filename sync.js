/* PHILHEALTH KING v2: OPTIONAL Google sign-in + Google Drive appDataFolder sync. Offline-first: the app never needs it.
   - Data lives in localStorage on this device. When signed in, one hidden file (pk-sync-v1.json) in the user's OWN Drive app folder
     (scope drive.appdata: the app cannot see any other Drive file; there is no PHILHEALTH KING server).
   - Merge: per log entry the newest edit wins by its `updated` timestamp; deletions leave tombstones (newer tombstone beats an older
     edit); places / location types / favourites are small documents: the side changed most recently wins (v2.1: the shop was removed, so it is no longer synced).
   - Android APK: native Google Identity AuthorizationClient (Play services) via AndroidBridge.googleAuthorize -> access token.
     PWA: Google Identity Services token client (accounts.google.com/gsi/client). Both then call the Drive REST API with fetch().
   - Until real OAuth client IDs are in config.js the button shows "Sign-in coming soon - continue offline". */
(function () {
  var CFG = window.PK_CONFIG || {}, AB = window.AndroidBridge, NATIVE = !!(AB && AB.googleAuthorize);
  var SCOPE = CFG.driveScope || 'https://www.googleapis.com/auth/drive.appdata', SCOPES = SCOPE + ' openid email profile', FILE = 'pk-sync-v1.json';
  var DRV = 'https://www.googleapis.com/drive/v3/files', UPL = 'https://www.googleapis.com/upload/drive/v3/files';
  var SKEY = 'pk_sync', OKEY = 'pk_sync_offline', HKEY = 'pk_sync_hash';
  function get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var st = Object.assign({ signed: false, email: '', name: '', last: 0, err: '' }, get(SKEY) || {}), busy = false, tok = null, tokExp = 0, subs = [], timer = 0;
  function save() { put(SKEY, st); subs.forEach(function (f) { try { f(st); } catch (e) {} }); }
  function configured() { return NATIVE ? !!(CFG.androidClientId && (!AB.googleAuthAvailable || AB.googleAuthAvailable() === '1')) : !!CFG.webClientId; }

  // ---------- tokens ----------
  var pend = {}, nreq = 0;
  function nativeToken(interactive) { return new Promise(function (res, rej) { var id = 'r' + (++nreq); pend[id] = [res, rej]; try { AB.googleAuthorize(!!interactive, id); } catch (e) { delete pend[id]; rej(e); } }); }
  var gisP = null, tc = null, tcCb = null;
  function loadGIS() { if (gisP) return gisP; gisP = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = function () { res(); }; s.onerror = function () { gisP = null; rej(new Error('Could not reach Google (offline?)')); }; document.head.appendChild(s); }); return gisP; }
  function webToken(interactive) { return loadGIS().then(function () { return new Promise(function (res, rej) {
    if (!tc) tc = google.accounts.oauth2.initTokenClient({ client_id: CFG.webClientId, scope: SCOPES, callback: function (r) { var f = tcCb; tcCb = null; if (f) f(r); },
      error_callback: function (e) { var f = tcCb; tcCb = null; if (f) f({ error: (e && e.type) || 'popup_closed' }); } });
    tcCb = function (r) { if (r && r.access_token) res({ token: r.access_token, expires: Date.now() + (+r.expires_in || 3500) * 1000 }); else rej(new Error(r && r.error || 'sign-in cancelled')); };
    tc.requestAccessToken({ prompt: interactive ? (st.signed ? '' : 'consent') : 'none', login_hint: st.email || undefined }); }); }); }
  function token(interactive) {
    if (tok && Date.now() < tokExp - 60000) return Promise.resolve(tok);
    return (NATIVE ? nativeToken(interactive) : webToken(interactive)).then(function (r) { tok = r.token; tokExp = r.expires || Date.now() + 3300000; return tok; });
  }
  function api(method, url, body, ctype) {
    return token(false).then(function (t) { var h = { Authorization: 'Bearer ' + t }; if (ctype) h['Content-Type'] = ctype;
      return fetch(url, { method: method, headers: h, body: body }).then(function (r) { if (r.status === 401) { tok = null; throw new Error('auth'); } if (!r.ok) throw new Error('Drive ' + r.status); return r; }); });
  }

  // ---------- merge ----------
  function hash(o) { var s = JSON.stringify(o || null), h = 5381; for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); }
  function localDoc() {
    var S = window.PK_STORE._syncState(), C = window.EENT_CORE, hs = get(HKEY) || {}, now = Date.now();
    var blobs = { places: S.places, loctypes: S.loctypes, favs: C && C.favList ? C.favList() : [] }, b = {};
    Object.keys(blobs).forEach(function (k) { var h = hash(blobs[k]), prev = hs[k] || {}; b[k] = { v: blobs[k], at: prev.h === h ? prev.at || 0 : now }; });
    return { app: 'PHILHEALTH KING', fmt: 1, at: now, entries: S.entries, tomb: S.tomb, blobs: b };
  }
  function merge(L, R) {
    var by = {}, tomb = Object.assign({}, R.tomb || {});
    Object.keys(L.tomb || {}).forEach(function (id) { tomb[id] = Math.max(tomb[id] || 0, L.tomb[id]); });
    [R.entries || [], L.entries || []].forEach(function (arr) { arr.forEach(function (e) { if (!e || !e.id) return; var o = by[e.id]; if (!o || (+e.updated || 0) > (+o.updated || 0)) by[e.id] = e; }); });
    var entries = Object.keys(by).map(function (id) { return by[id]; }).filter(function (e) { return !(tomb[e.id] && tomb[e.id] >= (+e.updated || 0)); });
    var cut = Date.now() - 400 * 864e5; Object.keys(tomb).forEach(function (id) { if (tomb[id] < cut) delete tomb[id]; });   // forget tombstones after ~13 months
    var blobs = {}, lb = L.blobs || {}, rb = R.blobs || {};
    ['places', 'loctypes', 'favs'].forEach(function (k) { var l = lb[k], r = rb[k]; blobs[k] = !r ? l : !l ? r : (r.at > l.at ? r : l); });
    if (lb.favs && rb.favs) blobs.favs = { v: Array.from(new Set([].concat(lb.favs.v || [], rb.favs.v || []))).sort(), at: Math.max(lb.favs.at, rb.favs.at) };
    return { app: 'PHILHEALTH KING', fmt: 1, at: Date.now(), entries: entries, tomb: tomb, blobs: blobs };
  }
  function applyLocal(M) {
    var b = M.blobs || {}; window.PK_STORE._applySync({ entries: M.entries, tomb: M.tomb, places: b.places && b.places.v, loctypes: b.loctypes && b.loctypes.v });
    if (b.favs && b.favs.v && window.EENT_CORE && EENT_CORE.favMerge) EENT_CORE.favMerge(b.favs.v);
    var hs = {}; Object.keys(b).forEach(function (k) { if (b[k]) hs[k] = { h: hash(k === 'favs' && window.EENT_CORE ? EENT_CORE.favList() : b[k].v), at: b[k].at }; }); put(HKEY, hs);
  }

  // ---------- Drive ----------
  function findFile() { return api('GET', DRV + '?spaces=appDataFolder&fields=files(id,modifiedTime)&q=' + encodeURIComponent("name='" + FILE + "'")).then(function (r) { return r.json(); })
    .then(function (j) { return j.files && j.files[0] ? j.files[0].id : null; }); }
  function upload(id, doc) {
    var body = JSON.stringify(doc);
    if (id) return api('PATCH', UPL + '/' + id + '?uploadType=media', body, 'application/json');
    var b = 'pkb' + Date.now(), meta = JSON.stringify({ name: FILE, parents: ['appDataFolder'], mimeType: 'application/json' });
    return api('POST', UPL + '?uploadType=multipart', '--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + b + '\r\nContent-Type: application/json\r\n\r\n' + body + '\r\n--' + b + '--', 'multipart/related; boundary=' + b);
  }
  function syncNow(o) {
    o = o || {}; if (!st.signed || busy) return Promise.resolve(false); if (navigator.onLine === false) { st.err = 'offline'; save(); return Promise.resolve(false); }
    busy = true; st.err = ''; st.state = 'ing'; save(); var fid = null;
    return findFile().then(function (id) { fid = id; return id ? api('GET', DRV + '/' + id + '?alt=media').then(function (r) { return r.json(); }) : null; })
      .then(function (remote) { var L = localDoc(), M = remote && remote.app === 'PHILHEALTH KING' ? merge(L, remote) : L; applyLocal(M); return upload(fid, M).then(function () { return M; }); })
      .then(function (M) { busy = false; st.state = ''; st.last = Date.now(); st.n = M.entries.length; save(); if (o.toast && window.EENT_CORE) EENT_CORE.toast('Synced \u00B7 ' + M.entries.length + ' entries'); return true; })
      .catch(function (e) { busy = false; st.state = ''; st.err = String(e && e.message || e); save(); if (o.toast && window.EENT_CORE) EENT_CORE.toast(st.err === 'auth' ? 'Sign in again to sync' : 'Sync paused \u2014 ' + (navigator.onLine === false ? 'offline' : 'will retry')); return false; });
  }
  function signIn() {
    if (!configured()) { if (window.EENT_CORE) EENT_CORE.toast('Sign-in coming soon \u2014 continue offline'); return Promise.resolve(false); }
    return token(true).then(function (t) { return fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + t } }).then(function (r) { return r.ok ? r.json() : {}; }); })
      .then(function (u) { st.signed = true; st.email = u.email || ''; st.name = u.given_name || u.name || ''; st.err = ''; save(); put(OKEY, 1); return syncNow({ toast: true }); })
      .catch(function (e) { if (window.EENT_CORE) EENT_CORE.toast('Sign-in did not finish \u2014 you can keep working offline'); st.err = String(e && e.message || e); save(); return false; });
  }
  function signOut() {
    var t = tok; tok = null; tokExp = 0; if (t) try { fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(t), { method: 'POST', mode: 'no-cors' }); } catch (e) {}
    if (NATIVE && AB.googleSignOut) try { AB.googleSignOut(); } catch (e) {}
    st = { signed: false, email: '', name: '', last: 0, err: '' }; save(); localStorage.removeItem(HKEY); if (window.EENT_CORE) EENT_CORE.toast('Signed out \u2014 your data stays on this phone');
  }
  function soon(ms) { if (!st.signed) return; clearTimeout(timer); timer = setTimeout(function () { syncNow(); }, ms || 4000); }
  if (window.PK_STORE && PK_STORE.onChange) PK_STORE.onChange(function () { if (!busy) soon(5000); });
  window.addEventListener('online', function () { soon(1500); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') soon(2500); });
  if (st.signed) soon(3000);
  window.PK_SYNC = {
    configured: configured, native: NATIVE, state: function () { return st; }, signIn: signIn, signOut: signOut, syncNow: syncNow,
    offlineChosen: function () { return !!get(OKEY); }, continueOffline: function () { put(OKEY, 1); },
    onChange: function (f) { subs.push(f); },
    _native: function (id, json) { var p = pend[id]; if (!p) return; delete pend[id]; var r = {}; try { r = JSON.parse(json); } catch (e) {} if (r.token) p[0]({ token: r.token, expires: Date.now() + 3300000 }); else p[1](new Error(r.error || 'cancelled')); },
    _merge: merge, _localDoc: localDoc, _applyLocal: applyLocal,
    _demo: function (o) { st = Object.assign({}, st, o); subs.forEach(function (f) { try { f(st); } catch (e) {} }); }   // screenshots/tests only: not saved, no network
  };
})();
