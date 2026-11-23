/* PHILHEALTH KING single local store for procedures ("quests") = Log Pose entries. Data stays on the device unless the user opts in to Google Drive sync (sync.js).
   v4 (preview): optional full patient NAME (editable; on this device + the user's own backup only). Initials are derived from it and are
   what compact views show (widgets, mascot, notifications, default calendar); full names only after the eye toggle. No time field.
   localStorage pk_pflog_v1 = {v:3, entries:[{id, rid, code, kind, desc, date:'YYYY-MM-DD', pt:'JDC'|'', status:'done'|'sched',
     as:'1'|'2', pf_c:int, pf_auto:bool, loc:'hospital'|'clinic'|'center'|'none', fac, note, created, updated}]}
   Older entries (v1 Log Pose, EENT backups) are migrated: no initials -> shown as "No name". pk_fac_recent = [{loc, fac}], pk_prefs = {csvIni:true}. */
(function () {
  var KEY = 'pk_pflog_v1', TOMB = 'pk_tomb', RKEY = 'pk_fac_recent', PKEY = 'pk_prefs', TKEY = 'pk_loctypes', PLKEY = 'pk_places';
  function get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  // Editable location types: [{id, name, icon, hidden}] (hidden = deleted but kept so old entries still show their label)
  var DEF_TYPES = [{ id: 'hospital', name: 'Hospital', icon: 'hosp' }, { id: 'clinic', name: 'Clinic', icon: 'clinic' }, { id: 'center', name: 'Center', icon: 'center' }];
  var TYPE_ICONS = ['hosp', 'clinic', 'center', 'anchor', 'wheel', 'jolly', 'strawhat', 'qmap', 'logpose', 'chest', 'helm', 'star', 'scroll', 'crab', 'bolt', 'fire'];
  function cleanTypes(a) { var seen = {}, out = []; (Array.isArray(a) ? a : []).forEach(function (t) { if (!t || !t.id || seen[t.id] || t.id === 'none') return; seen[t.id] = 1;
    out.push({ id: String(t.id).slice(0, 24), name: String(t.name || t.id).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 24) || 'Place', icon: TYPE_ICONS.indexOf(t.icon) >= 0 ? t.icon : 'anchor', hidden: !!t.hidden }); });
    return out.length ? out : DEF_TYPES.map(function (t) { return Object.assign({}, t); }); }
  var types = cleanTypes(get(TKEY));
  function LOCS() { return types.filter(function (t) { return !t.hidden; }).map(function (t) { return [t.id, t.name, t.icon]; }); }
  function LOCBY() { var m = { none: ['none', 'Unspecified', 'scroll'] }; types.forEach(function (t) { m[t.id] = [t.id, t.name + (t.hidden ? ' (old)' : ''), t.icon]; }); return m; }
  function saveTypes() { put(TKEY, types); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return ymd(window.PK_TODAY ? new Date(window.PK_TODAY) : new Date()); }
  function ini(s) { return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); }       // letters only, max 4
  function iniShow(s) { s = ini(s); return s ? s.split('').join('.') + '.' : ''; }
  // full name -> initials: first letter of each word (accents folded: Ñ -> N), max 4; "Dela Cruz, Juan" and "Juan dela Cruz" both work
  function nameClean(s) { return String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100); }
  function iniFrom(name) { var w = nameClean(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[\s,]+/).filter(function (x) { return /[A-Za-z]/.test(x); });
    if (name.indexOf(',') > 0 && w.length > 1) { var c = name.split(',')[0].trim().split(/\s+/).length; w = w.slice(c).concat(w.slice(0, c)); }
    return ini(w.map(function (x) { return x.replace(/[^A-Za-z]/g, '').charAt(0); }).join('')); }
  var reveal = false;   // eye toggle: session only (every launch starts with initials)
  var clean = function (s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').slice(0, n); };
  function norm(e) {
    if (!e || typeof e !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) return null;
    var pf = Math.round(+e.pf_c); if (!isFinite(pf) || pf < 0 || pf > 1e10) return null;
    return { id: clean(e.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)), 40), rid: clean(e.rid, 40), code: clean(e.code, 20), kind: clean(e.kind || 'RVS', 4), desc: clean(e.desc, 160),
      date: e.date, name: nameClean(e.name), pt: nameClean(e.name) ? iniFrom(e.name) : ini(e.pt), status: e.status === 'sched' ? 'sched' : 'done',
      pay: e.pay === 'paid' ? 'paid' : 'unpaid', paidDate: e.pay === 'paid' && /^\d{4}-\d{2}-\d{2}$/.test(e.paidDate || '') ? e.paidDate : '',
      as: e.as === '2' ? '2' : '1', pf_c: pf, pf_auto: e.pf_auto !== false, loc: LOCBY()[e.loc] ? e.loc : 'none', fac: clean(e.fac, 80).trim(), note: clean(e.note, 160),
      anes: e.anes === true || e.anes === 1 || e.anes === '1', anesName: e.anes ? clean(e.anesName, 60).trim() : '',
      created: +e.created || Date.now(), updated: +e.updated || +e.created || Date.now() };
  }
  var raw = get(KEY) || { v: 3, entries: [] }, db = { v: 3, entries: [] };
  (raw.entries || []).forEach(function (e) { var n = norm(e); if (n) db.entries.push(n); });
  var recent = get(RKEY) || [], prefs = Object.assign({ csvIni: true }, get(PKEY) || {}); if (!prefs.csvPt) prefs.csvPt = prefs.csvIni === false ? 'none' : 'ini'; var subs = [], undoBuf = null;
  function save() { var ok = put(KEY, db); subs.forEach(function (f) { try { f(); } catch (e) {} }); return ok; }
  if (raw.v !== 3) save();
  // Saved places: [{name, loc, fav (default for new quests), hidden (not in quick picks)}]
  function lc(x) { return String(x || '').toLowerCase(); }
  var places = get(PLKEY);
  if (!Array.isArray(places)) { places = []; var sn = {}; recent.concat(db.entries.slice().sort(function (a, b) { return b.created - a.created; }).map(function (e) { return { loc: e.loc, fac: e.fac }; }))
    .forEach(function (r) { if (r.fac && !sn[lc(r.fac)]) { sn[lc(r.fac)] = 1; places.push({ name: r.fac, loc: r.loc, fav: false, hidden: false }); } }); put(PLKEY, places); }
  function savePlaces() { put(PLKEY, places); }
  function placeBy(name) { for (var i = 0; i < places.length; i++) if (lc(places[i].name) === lc(name)) return places[i]; return null; }
  function remember(loc, fac) { if (!fac) return; recent = [{ loc: loc, fac: fac }].concat(recent.filter(function (x) { return lc(x.fac) !== lc(fac); })).slice(0, 8); put(RKEY, recent);
    if (!placeBy(fac)) { places.push({ name: fac, loc: loc, fav: false, hidden: false }); savePlaces(); } }
  function tomb(id) { var t = get(TOMB) || {}; t[id] = Date.now(); put(TOMB, t); }
  function find(id) { for (var i = 0; i < db.entries.length; i++) if (db.entries[i].id === id) return db.entries[i]; return null; }
  function sortFn(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : a.created - b.created; }   // newest day first; within a day, entry order
  function matchT(e, t) {
    var tl = t.toLowerCase(), td = tl.replace(/\./g, '');
    if (td && e.pt.toLowerCase().indexOf(td) >= 0) return true;                       // initials: "jd", "J.D." both match JDC
    if (e.name && e.name.toLowerCase().indexOf(tl) >= 0) return true;                  // full name (search works even while names are hidden)
    return [e.code, e.desc, e.fac, e.note].some(function (s) { s = String(s || '').toLowerCase(); return s.indexOf(tl) >= 0 || (td && s.replace(/\./g, '').indexOf(td) >= 0); });
  }
  function filter(f) {   // f: {q, from, to, loc, fac, as, status}
    f = f || {}; var toks = String(f.q || '').trim().split(/\s+/).filter(Boolean);
    return db.entries.filter(function (e) {
      if (f.from && e.date < f.from) return false; if (f.to && e.date > f.to) return false;
      if (f.loc && f.loc !== 'all' && e.loc !== f.loc) return false; if (f.fac && e.fac.toLowerCase() !== String(f.fac).toLowerCase()) return false;
      if (f.as && f.as !== 'all' && e.as !== f.as) return false; if (f.pay && f.pay !== 'all' && e.pay !== f.pay) return false; if (f.code && e.code !== f.code) return false; if (f.status && f.status !== 'all' && e.status !== f.status) return false;
      return toks.every(function (t) { return matchT(e, t); });
    }).sort(sortFn);
  }
  // payment summary over a list: done entries split paid/unpaid; scheduled counted separately (paid scheduled = prepaid)
  // anesthesiologist split: user keeps 70% of the PF (rounded to the centavo), anesthesiologist gets the remainder (30%)
  function myPF(e) { return e.anes ? Math.round(e.pf_c * 0.7) : e.pf_c; }
  function anesPF(e) { return e.anes ? e.pf_c - myPF(e) : 0; }
  function paySummary(list) {
    var r = { saved: list.length, done: 0, sched: 0, paid: 0, unpaid: 0, paidPF: 0, unpaidPF: 0, donePF: 0, schedPF: 0, prepaid: 0, prepaidPF: 0, anesN: 0, anesPF: 0, anesDoneN: 0, anesSchedN: 0, grossDonePF: 0, anesDonePF: 0, anesSchedPF: 0, grossPF: 0, byLoc: {}, byCode: {} };
    list.forEach(function (e) {
      var c = r.byCode[e.code] || (r.byCode[e.code] = { code: e.code, kind: e.kind, rid: e.rid, desc: e.desc, n: 0, done: 0, sched: 0, paid: 0, unpaid: 0, paidPF: 0, unpaidPF: 0 }); c.n++;
      var m = myPF(e), a = anesPF(e); r.grossPF += e.pf_c; if (e.anes) { r.anesN++; r.anesPF += a; if (e.status === 'sched') { r.anesSchedPF += a; r.anesSchedN++; } else { r.anesDonePF += a; r.anesDoneN++; r.grossDonePF += e.pf_c; } }
      if (e.status === 'sched') { r.sched++; r.schedPF += m; c.sched++; if (e.pay === 'paid') { r.prepaid++; r.prepaidPF += m; } return; }
      var L = r.byLoc[e.loc] || (r.byLoc[e.loc] = { done: 0, paidPF: 0, unpaidPF: 0 }); r.done++; r.donePF += m; L.done++; c.done++;
      if (e.pay === 'paid') { r.paid++; r.paidPF += m; L.paidPF += m; c.paid++; c.paidPF += m; } else { r.unpaid++; r.unpaidPF += m; L.unpaidPF += m; c.unpaid++; c.unpaidPF += m; }
    });
    return r;
  }
  function sum(list) { var t = 0; list.forEach(function (e) { t += myPF(e); }); return t; }
  function sumAnes(list) { var t = 0; list.forEach(function (e) { t += anesPF(e); }); return t; }
  function sumGross(list) { var t = 0; list.forEach(function (e) { t += e.pf_c; }); return t; }
  function csv(opts) {
    var mode = opts && opts.pt ? opts.pt : opts && opts.ini != null ? (opts.ini ? 'ini' : 'none') : prefs.csvPt || 'ini', withIni = mode !== 'none', full = mode === 'full';   // default: initials only
    var head = ['date', 'status'].concat(full ? ['patient_name'] : []).concat(withIni ? ['patient_initials'] : []).concat(['code', 'type', 'description', 'claimed_as', 'pf_php', 'with_anesthesiologist', 'anesthesiologist', 'my_pf_php', 'anes_pf_php', 'payment', 'paid_date', 'location_type', 'facility', 'note']);
    var rows = [head]; db.entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : a.created - b.created; }).forEach(function (e) {
      rows.push([e.date, e.status === 'sched' ? 'scheduled' : 'done'].concat(full ? [e.name || ''] : []).concat(withIni ? [iniShow(e.pt)] : []).concat([e.code, e.kind, e.desc, e.as === '2' ? '2nd' : '1st', (e.pf_c / 100).toFixed(2), e.anes ? 'yes' : 'no', e.anesName, (myPF(e) / 100).toFixed(2), (anesPF(e) / 100).toFixed(2), e.pay, e.paidDate, LOCBY()[e.loc][1], e.fac, e.note]));
    });
    return rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n');
  }
  function importAny(o) {   // PHILHEALTH KING backup, EENT PHILHEALTH backup ({proclog:{entries}}) or a bare {entries}
    var arr = o && o.quests && Array.isArray(o.quests.entries) ? o.quests.entries : o && o.proclog && Array.isArray(o.proclog.entries) ? o.proclog.entries : o && Array.isArray(o.entries) ? o.entries : null;
    if (!arr) return { error: 'No procedure log found in this file.' };
    if (o.loctypes) { var have = {}; types.forEach(function (t) { have[t.id] = t; }); cleanTypes(o.loctypes).forEach(function (t) { if (!have[t.id]) types.push(t); else { have[t.id].name = t.name; have[t.id].icon = t.icon; } }); saveTypes(); }
    if (Array.isArray(o.places)) { o.places.forEach(function (p) { if (!p || !p.name) return; var q = placeBy(p.name); if (q) { q.loc = LOCBY()[p.loc] ? p.loc : q.loc; q.hidden = !!p.hidden; if (p.fav) { places.forEach(function (x) { x.fav = false; }); q.fav = true; } } else { if (p.fav) places.forEach(function (x) { x.fav = false; }); places.push({ name: String(p.name).slice(0, 80), loc: LOCBY()[p.loc] ? p.loc : 'none', fav: !!p.fav && !p.hidden, hidden: !!p.hidden }); } }); savePlaces(); }
    var added = 0, updated = 0, bad = 0, map = {}; db.entries.forEach(function (e, i) { map[e.id] = i; });
    var BY = window.EENT_CORE && EENT_CORE.BY;
    arr.forEach(function (x) { if (x && BY && BY[x.rid]) { var r = BY[x.rid]; x = Object.assign({}, x); if (!x.code) x.code = r.code; if (!x.kind) x.kind = r.kind; if (!x.desc) x.desc = String(r.desc || '').slice(0, 120); if (x.pf_c == null || x.pf_c === '') x.pf_c = Math.round((x.as === '2' ? r.second_pf : r.pf) * 100); }
      if (x && !String(x.name || '').trim() && x.pt && window.PK_INI_NAME) { x = Object.assign({}, x, { name: PK_INI_NAME(x.pt) }); }   // v1 backups: initials -> name field
      var n = norm(x); if (!n) { bad++; return; }
      if (map[n.id] == null) { map[n.id] = db.entries.length; db.entries.push(n); added++; } else if (n.updated > db.entries[map[n.id]].updated) { db.entries[map[n.id]] = n; updated++; } });
    save(); return { added: added, updated: updated, skipped: bad };
  }
  function uses(pred) { var n = 0; db.entries.forEach(function (e) { if (pred(e)) n++; }); return n; }
  // gentle backup reminder: due when entries changed since the last backup and 14+ days passed since the last backup (or first unbacked entry) and since the last snooze
  var BKEY = 'pk_backup_state', DAY = 864e5;
  function bstate() { return Object.assign({ last: 0, snooze: 0 }, get(BKEY) || {}); }
  function backupStatus(now) {
    now = now || Date.now(); var b = bstate();
    var fresh = db.entries.filter(function (e) { return e.updated > b.last; }); if (!fresh.length) return { due: false, newCount: 0, last: b.last };
    var since = b.last || Math.min.apply(null, fresh.map(function (e) { return e.created; }));
    var due = now - since >= 14 * DAY && now - b.snooze >= 14 * DAY;
    return { due: due, newCount: fresh.length, last: b.last, days: Math.floor((now - since) / DAY) };
  }
  var api = {
    backupStatus: backupStatus, markBackup: function () { var b = bstate(); b.last = Date.now(); put(BKEY, b); }, snoozeBackup: function (now) { var b = bstate(); b.snooze = now || Date.now(); put(BKEY, b); },
    TYPE_ICONS: TYPE_ICONS,
    types: function () { return types.map(function (t) { return Object.assign({ uses: uses(function (e) { return e.loc === t.id; }) }, t); }); },
    addType: function (name, icon) { name = String(name || '').trim().slice(0, 24); if (!name) return null; var id = 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      types.push({ id: id, name: name, icon: TYPE_ICONS.indexOf(icon) >= 0 ? icon : 'anchor', hidden: false }); saveTypes(); save(); return id; },
    updateType: function (id, patch) { var t = types.filter(function (x) { return x.id === id; })[0]; if (!t) return false; if (patch.name != null && String(patch.name).trim()) t.name = String(patch.name).trim().slice(0, 24);
      if (patch.icon && TYPE_ICONS.indexOf(patch.icon) >= 0) t.icon = patch.icon; saveTypes(); save(); return true; },
    moveType: function (id, d) { var act = types.filter(function (t) { return !t.hidden; }), i = act.map(function (t) { return t.id; }).indexOf(id), j = i + d; if (i < 0 || j < 0 || j >= act.length) return false;
      var a = types.indexOf(act[i]), b = types.indexOf(act[j]), tmp = types[a]; types[a] = types[b]; types[b] = tmp; saveTypes(); save(); return true; },
    deleteType: function (id, mode, target) {   // mode: 'reassign' (move entries + places to target) | 'keep' (entries keep old label; type hidden from pickers)
      var t = types.filter(function (x) { return x.id === id; })[0]; if (!t || LOCS().length <= 1 && !t.hidden) return { error: 'Keep at least one location type.' };
      var n = uses(function (e) { return e.loc === id; });
      if (n && mode === 'reassign') { if (!target || target === id || !LOCBY()[target]) return { error: 'Pick a type to move entries to.' }; db.entries.forEach(function (e) { if (e.loc === id) { e.loc = target; e.updated = Date.now(); } }); }
      places.forEach(function (p) { if (p.loc === id) p.loc = mode === 'reassign' && target ? target : (LOCS().filter(function (l) { return l[0] !== id; })[0] || ['none'])[0]; });
      recent.forEach(function (r) { if (r.loc === id && mode === 'reassign') r.loc = target; });
      if (n && mode !== 'reassign') t.hidden = true; else types = types.filter(function (x) { return x.id !== id; });
      saveTypes(); savePlaces(); put(RKEY, recent); save(); return { moved: mode === 'reassign' ? n : 0, kept: mode !== 'reassign' ? n : 0 }; },
    places: function () { return places.map(function (p) { return Object.assign({ uses: uses(function (e) { return lc(e.fac) === lc(p.name); }) }, p); }); },
    placeUse: function (name) { return uses(function (e) { return lc(e.fac) === lc(name); }); },
    defaultPlace: function () { var p = places.filter(function (x) { return x.fav && !x.hidden; })[0]; return p ? { loc: p.loc, fac: p.name } : null; },
    quickPicks: function () { var out = [], sn = {}; function add(loc, fac) { var p = placeBy(fac); if (!fac || sn[lc(fac)] || (p && p.hidden)) return; sn[lc(fac)] = 1; out.push({ loc: p ? p.loc : loc, fac: p ? p.name : fac, fav: !!(p && p.fav) }); }
      places.forEach(function (p) { if (p.fav) add(p.loc, p.name); }); recent.forEach(function (r) { add(r.loc, r.fac); }); places.forEach(function (p) { add(p.loc, p.name); }); return out.slice(0, 6); },
    addPlace: function (name, loc, o) { name = String(name || '').trim().slice(0, 80); if (!name) return { error: 'Enter a place name.' }; if (placeBy(name)) return { error: 'That place already exists.' };
      o = o || {}; if (o.fav) places.forEach(function (p) { p.fav = false; }); places.push({ name: name, loc: LOCBY()[loc] ? loc : LOCS()[0][0], fav: !!o.fav, hidden: !!o.hidden }); savePlaces(); save(); return { ok: true }; },
    updatePlace: function (old, patch, o) {   // patch {name, loc, fav, hidden}; o {applyType: also set loc on existing entries of this place}
      var p = placeBy(old); if (!p) return { error: 'Place not found.' }; o = o || {}; var r = { renamed: 0, retyped: 0 };
      var nn = patch.name != null ? String(patch.name).trim().slice(0, 80) : p.name; if (!nn) return { error: 'Enter a place name.' };
      if (lc(nn) !== lc(p.name) && placeBy(nn)) return { error: 'Another place already has that name.' };
      if (nn !== p.name) { db.entries.forEach(function (e) { if (lc(e.fac) === lc(p.name)) { e.fac = nn; e.updated = Date.now(); r.renamed++; } }); recent.forEach(function (x) { if (lc(x.fac) === lc(p.name)) x.fac = nn; }); p.name = nn; }
      if (patch.loc && LOCBY()[patch.loc]) { p.loc = patch.loc; if (o.applyType) db.entries.forEach(function (e) { if (lc(e.fac) === lc(p.name) && e.loc !== patch.loc) { e.loc = patch.loc; e.updated = Date.now(); r.retyped++; } }); recent.forEach(function (x) { if (lc(x.fac) === lc(p.name)) x.loc = p.loc; }); }
      if (patch.fav != null) { if (patch.fav) places.forEach(function (x) { x.fav = false; }); p.fav = !!patch.fav; }
      if (patch.hidden != null) p.hidden = !!patch.hidden; if (p.hidden) p.fav = false;
      savePlaces(); put(RKEY, recent); save(); return r; },
    deletePlace: function (name) { var p = placeBy(name); if (!p) return false; places = places.filter(function (x) { return x !== p; }); recent = recent.filter(function (x) { return lc(x.fac) !== lc(name); }); savePlaces(); put(RKEY, recent); save(); return true; },
    today: today, ymd: ymd, pad: pad, ini: ini, iniShow: iniShow, iniFrom: iniFrom, nameClean: nameClean, NAME_NOTICE: 'Patient names are stored only on your device (and your own Google account backup if you turn on sync). They are for your personal records only and are never shared or made public, in line with the Data Privacy Act of 2012 (RA 10173).',
    reveal: function () { return reveal; }, setReveal: function (v) { reveal = !!v; subs.forEach(function (f) { try { f(); } catch (e) {} }); },
    ptLabel: function (e, full) { return full && e.name ? e.name : iniShow(e.pt); },   // compact surfaces call ptLabel(e) = initials
    usesNames: function () { return db.entries.some(function (e) { return !!e.name; }); },
    all: function () { return db.entries.slice().sort(sortFn); }, find: find, filter: filter, sum: sum, sumAnes: sumAnes, sumGross: sumGross, myPF: myPF, anesPF: anesPF, paySummary: paySummary,
    setPaid: function (id, paid, date) { var e = find(id); if (!e) return null; var prev = { pay: e.pay, paidDate: e.paidDate }; var n = api.update(id, { pay: paid ? 'paid' : 'unpaid', paidDate: paid ? (date || e.paidDate || today()) : '' }); return n ? { entry: n, prev: prev } : null; }, recent: function () { return recent.slice(); },
    facilities: function () { var s = {}; db.entries.forEach(function (e) { if (e.fac) s[e.fac] = 1; }); recent.forEach(function (r) { s[r.fac] = 1; }); return Object.keys(s).sort(); },
    add: function (e) { var n = norm(Object.assign({}, e, { id: null, created: Date.now(), updated: Date.now() })); if (!n) return null; db.entries.push(n); remember(n.loc, n.fac); save(); return n; },
    update: function (id, patch) { var i = db.entries.indexOf(find(id)); if (i < 0) return null; var n = norm(Object.assign({}, db.entries[i], patch, { id: id, updated: Date.now() })); if (!n) return null; db.entries[i] = n; remember(n.loc, n.fac); save(); return n; },
    del: function (id) { var e = find(id); if (!e) return false; undoBuf = e; db.entries = db.entries.filter(function (x) { return x.id !== id; }); tomb(id); save(); return true; },
    undo: function () { if (!undoBuf) return false; undoBuf.updated = Date.now(); db.entries.push(undoBuf); var t = get(TOMB) || {}; delete t[undoBuf.id]; put(TOMB, t); undoBuf = null; save(); return true; },
    wipe: function () { db.entries.forEach(function (e) { tomb(e.id); }); db.entries = []; save(); },
    // v2 optional Google Drive sync (sync.js): deletions leave a tombstone {id: deletedAt} so another phone does not resurrect them
    _tombs: function () { return get(TOMB) || {}; },
    _syncState: function () { return { entries: db.entries.slice(), tomb: get(TOMB) || {}, places: places.slice(), loctypes: types.slice() }; },
    _applySync: function (o) {   // merged result from sync.js: replaces entries (already newest-wins merged), tombstones, places/types when given
      var out = []; (o.entries || []).forEach(function (e) { var n = norm(e); if (n) out.push(n); }); db.entries = out; if (o.tomb) put(TOMB, o.tomb);
      if (o.loctypes) { types = cleanTypes(o.loctypes); saveTypes(); } if (Array.isArray(o.places)) { places = o.places.filter(function (p) { return p && p.name; }); savePlaces(); }
      save(); },
    prefs: function () { return prefs; }, setPref: function (k, v) { prefs[k] = v; put(PKEY, prefs); },
    csv: csv, importAny: importAny, backup: function () { return { app: 'PHILHEALTH KING', v: 3, exported: new Date().toISOString(), quests: { v: 3, entries: db.entries.slice() }, loctypes: types.slice(), places: places.slice(), favorites: window.EENT_CORE ? EENT_CORE.favList() : [] }; },
    onChange: function (f) { subs.push(f); },
    _seedPlaces: function (t, pl) { if (t) { types = cleanTypes(t); saveTypes(); } if (pl) { places = pl; savePlaces(); } save(); },
    _seed: function (entries, rec) { put(BKEY, { last: Date.now(), snooze: 0 }); db.entries = []; entries.forEach(function (e, i) { var n = norm(Object.assign({ created: 1000 + i }, e)); if (n) db.entries.push(n); }); recent = rec || []; put(RKEY, recent);
      places = []; var sn = {}; recent.concat(db.entries.slice().reverse().map(function (e) { return { loc: e.loc, fac: e.fac }; })).forEach(function (r) { if (r.fac && !sn[lc(r.fac)]) { sn[lc(r.fac)] = 1; places.push({ name: r.fac, loc: r.loc, fav: false, hidden: false }); } }); savePlaces(); save(); }
  };
  Object.defineProperty(api, 'LOCS', { get: LOCS }); Object.defineProperty(api, 'LOCBY', { get: LOCBY });
  window.PK_STORE = api;
})();