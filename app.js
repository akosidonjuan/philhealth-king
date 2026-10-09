(function () {
  'use strict';
  var D = null, RECS = [], BY = {}, CATS = [], CATBY = {}, ELIG = [], CALCPOOL = [];
  var state = { cat: 'ent', q: '', chip: null, favOnly: false, scopeAll: true, calcP: null, calcS: null, calcPkg: null, rulesPage: 0 };
  // ---------- favorites ----------
  // Storage (unchanged key since v1.2.0): localStorage 'eent_favs_v2' = {"RVS:69436":1,"ICD:H66.9":1,"PKG:ECCEOD1":1}.
  // v1.0.0-v1.1.0 used 'ent_favs_v1' = {"69436":1} (ENT RVS codes). It is merged once (flag 'eent_favs_mig1'), never deleted.
  // Keys are canonicalised to record ids after data loads, so 'h669', 'ICD:H669', 'H66.9' all map to 'ICD:H66.9'.
  var FAVKEY = 'eent_favs_v2', MIGKEY = 'eent_favs_mig1', favs = {}, favRaw = {}, favOrphans = {};
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function parseFavs(txt) {
    if (!txt) return null; var o; try { o = JSON.parse(txt); } catch (e) { return null; }
    var out = {};
    if (Array.isArray(o)) o.forEach(function (k) { if (typeof k === 'string') out[k] = 1; });
    else if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { if (o[k]) out[k] = 1; });
    return out;
  }
  (function loadFavs() {
    var v2 = parseFavs(lsGet(FAVKEY)), hadV2 = lsGet(FAVKEY) != null;
    favRaw = v2 || {};
    if (!lsGet(MIGKEY)) {
      // v1.2.0/1.2.1 already migrated ent_favs_v1 when they first created eent_favs_v2; only merge if v2 never existed.
      if (!hadV2) { var v1 = parseFavs(lsGet('ent_favs_v1')); if (v1) Object.keys(v1).forEach(function (c) { favRaw[/^[A-Z]{3}:/.test(c) ? c : 'RVS:' + c] = 1; }); }
      lsSet(MIGKEY, '1');
    }
  })();
  var FAVIDX = {};
  function favNorm(k) { return String(k).toLowerCase().replace(/\./g, '').replace(/\s+/g, ''); }
  function favKey(k) {   // any code / id spelling -> canonical record id (or null)
    if (!k) return null; if (BY[k]) return k;
    var n = favNorm(k); return FAVIDX[n] || FAVIDX[n.replace(/^(rvs|icd|pkg):/, '')] || null;
  }
  function initFavs() {
    RECS.forEach(function (r) { FAVIDX[r.kind.toLowerCase() + ':' + r._n] = r.id; if (!FAVIDX[r._n]) FAVIDX[r._n] = r.id; });
    favs = {}; favOrphans = {};
    Object.keys(favRaw).forEach(function (k) { var id = favKey(k); if (id) favs[id] = 1; else favOrphans[k] = 1; });
    saveFavs();
  }
  function saveFavs() {
    var o = {}; Object.keys(favOrphans).forEach(function (k) { o[k] = 1; }); Object.keys(favs).forEach(function (k) { o[k] = 1; });   // keep unknown keys (e.g. codes from a future data set)
    if (!lsSet(FAVKEY, JSON.stringify(o))) toast('Could not save favorites (storage unavailable)');
  }
  function isFav(id) { var k = favKey(id); return !!(k && favs[k]); }
  function favCount() { return Object.keys(favs).length; }
  function starBtn(r, cls) { var on = !!favs[r.id]; return '<button class="star' + (on ? ' on' : '') + (cls ? ' ' + cls : '') + '" data-favt="' + esc(r.id) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Remove ' : 'Add ') + esc(r.code) + (on ? ' from' : ' to') + ' favorites">' + (on ? '\u2605' : '\u2606') + '</button>'; }
  function toggleFav(id) {
    var k = favKey(id); if (!k) return;
    if (favs[k]) { delete favs[k]; toast('Removed ' + BY[k].code + ' from favorites'); } else { favs[k] = 1; toast('Added ' + BY[k].code + ' to favorites'); }
    saveFavs(); refreshFavUI(k);
  }
  function refreshFavUI(k) {
    var on = !!favs[k], r = BY[k];
    Array.prototype.forEach.call(document.querySelectorAll('[data-favt="' + k + '"]'), function (b) {
      if (b.classList.contains('star')) { b.classList.toggle('on', on); b.textContent = on ? '\u2605' : '\u2606'; b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + r.code + (on ? ' from' : ' to') + ' favorites'); }
      else { b.classList.toggle('on', on); b.textContent = on ? '\u2605 Favorited' : '\u2606 Favorite'; }
    });
    renderChips();
    if (lastView === 'home' && state.favOnly) { var y = window.scrollY; renderList(false); window.scrollTo(0, y); }
    else if (lastView === 'detail') {
      var iid = document.querySelector('#dBody .iid'), m = iid && iid.querySelector('.fav');
      if (iid && on && !m) iid.insertAdjacentHTML('beforeend', ' <span class="fav">\u2605</span>'); else if (m && !on) m.remove();
    }
  }

  var ICON = { 'Ear': 'ear', 'Nose & sinuses': 'nose', 'Oral cavity': 'mouth', 'Pharynx/tonsils/adenoids': 'throat', 'Salivary': 'drop', 'Larynx': 'larynx',
    'Trachea & tracheostomy': 'trachea', 'Thyroid/parathyroid': 'thyroid', 'Neck dissection & masses': 'neck', 'Facial bones/maxillofacial': 'skull',
    'Head & neck skin/soft tissue/facial nerve': 'scalpel', 'Lens/cataract': 'eye', 'I&D/debridement': 'scalpel', 'Lesion biopsy/excision/destruction': 'scalpel',
    'Mohs surgery': 'scalpel', 'Repairs': 'band', 'Grafts & flaps': 'band', 'Burns': 'fire', 'Nails': 'band', 'Other skin': 'band', 'Breast': 'person',
    'Eye': 'eye', 'Throat/pharynx/larynx': 'throat', 'Oral cavity & salivary': 'mouth', 'Thyroid': 'thyroid', 'Head & neck neoplasms': 'crab',
    'Head & neck injuries/FB': 'bolt', 'Other': 'scroll', 'Adult cataract ECCE/IOL (PC 2025-0001)': 'chest', 'Pediatric cataract (PC 2025-0001)': 'chest',
    "Children's optometry (PC 2025-0002)": 'glasses' };
  function icoName(r) { return ICON[r.sub] || (r.cat === 'eye' ? 'eye' : r.cat === 'skin' ? 'scalpel' : r.cat === 'icd' ? 'scroll' : 'ear'); }
  function ico(r, size) { return '<span class="slot">' + pix(icoName(r), size || 24) + '</span>'; }

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function z(n) {
    if (n == null || n === '') return '\u2014';
    var cents = Math.round(Math.abs(n) * 100), ip = Math.floor(cents / 100), fp = cents % 100;
    var s = String(ip).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (n < 0 ? '-' : '') + s + (fp ? '.' + (fp < 10 ? '0' : '') + fp : '') + ' \u20B1';
  }
  function add(a, b) { return Math.round(((a || 0) + (b || 0)) * 100) / 100; }
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 1600); }
  function copyText(txt, label) {
    var done = function () { toast(label || ('Copied ' + txt)); };
    try { if (window.AndroidBridge && AndroidBridge.copy) { AndroidBridge.copy(txt); done(); return; } } catch (e) {}
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, fallback); } else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed'); } document.body.removeChild(ta); }
  }
  function kindTag(r) { return '<span class="kind ' + r.kind + '">' + r.kind + '</span>'; }
  function inCat(r, c) { if (r.cat === c) return true; for (var i = 0; i < r.xt.length; i++) if (r.xt[i][0] === c) return true; return false; }
  function inChip(r, c, chip) { if (r.cat === c && r.sub === chip) return true; for (var i = 0; i < r.xt.length; i++) if (r.xt[i][0] === c && r.xt[i][1] === chip) return true; return false; }
  function isCataract(r) { return !!(r && r.packages); }
  function canBeSecond(r) { return r.second_case_rate != null && !r.second_blocked; }

  // ---------- search (debounced; dots optional in codes) ----------
  function norm(s) { return s.toLowerCase(); }
  function matches(r, toks) { for (var i = 0; i < toks.length; i++) { var t = toks[i]; if (r._s.indexOf(t) === -1 && r._n.indexOf(t.replace(/\./g, '')) === -1) return false; } return true; }
  // PK: highlight every case-insensitive substring hit of the query tokens (search is substring-anywhere, not prefix/whole-word)
  var HLT = [];
  function setHL(q) { HLT = norm(q || '').trim().split(/\s+/).filter(Boolean).sort(function (a, b) { return b.length - a.length; }); }
  function hl(txt) {
    txt = String(txt == null ? '' : txt); if (!HLT.length) return esc(txt);
    var low = txt.toLowerCase(), marks = new Array(txt.length + 1).join('0').split('');
    HLT.forEach(function (t) { var tt = t, i = 0; if (!tt) return; while ((i = low.indexOf(tt, i)) >= 0) { for (var k = i; k < i + tt.length; k++) marks[k] = '1'; i += tt.length; }
      var td = tt.replace(/\./g, ''); if (td && td !== tt) { var lc = low.replace(/\./g, ''); var j = lc.indexOf(td); if (j >= 0) { var map = [], n = 0; for (var q2 = 0; q2 < low.length; q2++) if (low[q2] !== '.') map[n++] = q2; for (var k2 = j; k2 < j + td.length; k2++) marks[map[k2]] = '1'; } } });
    var out = '', on = false;
    for (var i2 = 0; i2 < txt.length; i2++) { var m = marks[i2] === '1'; if (m && !on) { out += '<mark>'; on = true; } if (!m && on) { out += '</mark>'; on = false; } out += esc(txt[i2]); }
    return out + (on ? '</mark>' : '');
  }
  function filtered(q, pool) { var toks = norm(q).trim().split(/\s+/).filter(Boolean); if (!toks.length) return pool.slice(); var out = pool.filter(function (r) { return matches(r, toks); });
    var t0 = toks[0], t0n = t0.replace(/\./g, ''), re0 = new RegExp('(^|[^a-z0-9])' + t0.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    var sc = function (r) { return r._n.indexOf(t0n) === 0 ? 0 : r._n.indexOf(t0n) > 0 ? 1 : re0.test(r.desc.toLowerCase()) ? 2 : 3; };
    return out.map(function (r, i) { return [sc(r), i, r]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (x) { return x[2]; }); }

  // ---------- HOME ----------
  function renderCatMenu() {
    $('catmenu').innerHTML = CATS.map(function (c) {
      return '<button class="cat' + (state.cat === c.id ? ' on' : '') + '" data-cat="' + c.id + '" title="' + esc(c.label) + '">' + pix(c.icon, 20) + '<span class="cl">' + esc(c.short) + '</span><span class="cn">' + c.count + (c.xcount ? '+' + c.xcount : '') + '</span></button>';
    }).join('');
  }
  function renderChips() {
    var c = CATBY[state.cat];
    var h = '<button class="tab' + (state.favOnly ? ' on' : '') + '" data-fav="1">\u2605 Fav' + (favCount() ? ' ' + favCount() : '') + '</button>';
    h += '<button class="tab' + (!state.chip && !state.favOnly ? ' on' : '') + '" data-chip="">All</button>';
    c.chips.forEach(function (ch) { h += '<button class="tab' + (state.chip === ch ? ' on' : '') + '" data-chip="' + esc(ch) + '">' + esc(ch) + '</button>'; });
    $('chips').innerHTML = h;
  }
  var PAGE = 100, shown = PAGE, lastRes = [];
  function rowHTML(r, showCat) {
    var ov = r.xt.filter(function (t) { return t[0] !== r.cat; }).map(function (t) { return CATBY[t[0]].short; });
    var amt = isCataract(r) ? '<div class="amt">pkg</div><div class="amt2">see packages</div>'
      : '<div class="amt">' + z(r.case_rate) + '</div><div class="amt2">' + (r.kind === 'PKG' ? 'package' : canBeSecond(r) ? '2nd ' + z(r.second_case_rate) : '2nd: none') + '</div>';
    return '<li class="row" data-id="' + esc(r.id) + '">' + ico(r) +
      '<div class="mid"><div class="idl">' + kindTag(r) + hl(r.code) + (r.borderline ? '<span class="bl" title="Borderline inclusion">B</span>' : '') + (canBeSecond(r) ? '<span class="bl ok2" title="Allowed as 2nd case rate">2nd</span>' : '') + '</div>' +
      '<div class="desc">' + hl(r.desc) + '</div><div class="sub">' + (showCat ? esc(CATBY[r.cat].short) + ' \u00B7 ' : '') + esc(r.sub) + (ov.length ? '<span class="xl">also in ' + esc(ov.join(', ')) + '</span>' : '') + '</div></div>' +
      '<div class="amts">' + amt + starBtn(r, 'rstar') + '</div></li>';
  }
  function setList(html) { var L = $('list'); if (L._h === html && L.childElementCount) return; L.innerHTML = html; L._h = html; }   // skip re-parsing an identical list (tab switches back to home)
  function renderList(reset) {
    if (reset) shown = PAGE; setHL(state.q);
    var global = state.scopeAll && state.q.trim();
    var res, head;
    if (global) {
      res = filtered(state.q, RECS);
      var per = {}; res.forEach(function (r) { per[r.cat] = (per[r.cat] || 0) + 1; });
      head = 'Search all (' + res.length + ')';
      $('chips').style.display = 'none';
      lastRes = res;
      $('count').textContent = head;
      var h0 = '<li class="srchead">' + CATS.filter(function (c) { return per[c.id]; }).map(function (c) { return esc(c.short) + ' ' + per[c.id]; }).join(' \u00B7 ') + (res.length ? '' : 'No matching codes.') + '</li>';
      setList(h0 + res.slice(0, shown).map(function (r) { return rowHTML(r, true); }).join('') + (res.length > shown ? '<li class="empty"><button class="rbtn" id="more">Next (' + (res.length - shown) + ' more)</button></li>' : ''));
      return;
    }
    $('chips').style.display = '';
    var c = state.cat;
    if (state.favOnly) { renderFavList(); return; }
    var pool = RECS.filter(function (r) {
      if (!inCat(r, c)) return false;
      if (state.favOnly && !favs[r.id]) return false;
      if (state.chip && !inChip(r, c, state.chip)) return false;
      return true;
    });
    res = filtered(state.q, pool); lastRes = res;
    $('count').textContent = CATBY[c].label + ' (' + res.length + ')' + (state.chip ? ' \u00B7 ' + state.chip : '') + (state.favOnly ? ' \u00B7 favorites' : '');
    if (!res.length) { $('list').innerHTML = '<li class="empty">' + (state.favOnly ? 'No favorites here yet. Open a code and press Favorite.' : 'No matching codes.') + '</li>'; return; }
    setList(res.slice(0, shown).map(function (r) { return rowHTML(r, false); }).join('') + (res.length > shown ? '<li class="empty"><button class="rbtn" id="more">Next (' + (res.length - shown) + ' more)</button></li>' : ''));
  }

  var KORDER = { RVS: 0, ICD: 1, PKG: 2 }, CORDER = { ent: 0, eye: 1, skin: 2, icd: 3, pkg: 4 };
  function renderFavList() {
    var all = Object.keys(favs).map(function (k) { return BY[k]; }).filter(Boolean);
    var res = filtered(state.q, all);
    res.sort(function (a, b) { return KORDER[a.kind] - KORDER[b.kind] || CORDER[a.cat] - CORDER[b.cat] || (a._n < b._n ? -1 : a._n > b._n ? 1 : 0); });
    lastRes = res;
    $('count').textContent = '\u2605 Favorites \u00B7 all sections (' + res.length + (state.q.trim() ? ' of ' + all.length : '') + ')';
    if (!all.length) { $('list').innerHTML = '<li class="empty favempty"><b>No favorites yet.</b><br>Tap the \u2606 star on any code (ENT, Eye, Skin, ICD-10 or eye package) in a list, on its detail page or in the calculator search. Starred codes from every section appear here.</li>'; return; }
    if (!res.length) { $('list').innerHTML = '<li class="empty">No favorites match \u201C' + esc(state.q) + '\u201D.</li>'; return; }
    var LBL = { RVS: 'RVS procedures', ICD: 'ICD-10 conditions', PKG: 'Eye packages' }, h = '', cur = null;
    res.forEach(function (r) {
      if (r.kind !== cur) { cur = r.kind; h += '<li class="favgrp">' + LBL[cur] + ' (' + res.filter(function (x) { return x.kind === cur; }).length + ')</li>'; }
      h += rowHTML(r, true);
    });
    $('list').innerHTML = h;
  }

  // ---------- DETAIL ----------
  function st(k, v, cls, rowcls) { return '<div class="st' + (rowcls ? ' ' + rowcls : '') + '"><span class="k">' + k + '</span><span class="c">:</span><span class="v' + (cls ? ' ' + cls : '') + '">' + v + '</span></div>'; }
  function renderDetail(id) {
    var r = BY[id];
    if (!r) { location.hash = '#/'; return; }
    $('dTitle').textContent = (r.kind === 'ICD' ? 'Condition : ' : r.kind === 'PKG' ? 'Package : ' : 'Item Info : ') + r.code;
    var bounty = isCataract(r) ? 'SEE PACKAGES' : z(r.case_rate);
    var src = String(r.source || '').split(' ').slice(0, 2).join(' '), pfc = r.pf != null ? Math.round(r.pf * 100) : null, me = pfc != null ? Math.round(pfc * 0.7) : null;
    var h = '<div class="ch-desk"><div class="chart" role="group" aria-label="Case chart ' + esc(r.code) + '"><span class="ch-clip" aria-hidden="true"></span>' +
      '<div class="ch-h"><span class="ch-rx" aria-hidden="true">\u211E</span><span class="ch-t">Case Chart</span><span class="ch-k">' + (r.kind === 'ICD' ? 'ICD-10 \u00B7 case rate' : r.kind === 'PKG' ? 'Package rate' : 'RVS \u00B7 case rate') + '</span></div>' +
      '<div class="ch-pt"><span class="ch-ico">' + pix(icoName(r), 56) + '</span><div class="ch-id"><div class="ch-code">' + esc(r.code) + '</div><div class="ch-name">' + esc(r.desc.split(/[;,]/)[0].slice(0, 60)) + '</div></div></div>' +
      '<div class="ch-l ch-main"><span>Case rate</span><b class="ch-amt">' + esc(bounty) + '</b></div>' +
      (r.pf != null && !isCataract(r) ? '<div class="ch-split"><div><span>PF</span><b>' + z(r.pf) + '</b></div><div><span>HCI</span><b>' + z(r.hci) + '</b></div></div>' +
        '<div class="ch-an"><span>\u2695 With anesthesiologist</span> you ' + z(me / 100) + ' \u00B7 anes ' + z((pfc - me) / 100) + '</div>' : '') +
      '<div class="ch-l ch-2"><span>2nd case rate</span><b>' + (canBeSecond(r) ? z(r.second_case_rate) : 'Not allowed') + '</b></div>' +
      (src ? '<span class="ch-stamp" aria-label="Source ' + esc(src) + '">' + esc(src) + '</span>' : '') +
      '<div class="ch-foot">PHILHEALTH KING \u00B7 Ward of Case Rates</div></div></div>';
    h += '<div class="ihead">' + ico(r, 36) + '<div><div class="iid">' + kindTag(r) + esc(r.code) + (favs[r.id] ? ' <span class="fav">\u2605</span>' : '') + '</div><div class="iname">' + esc(r.desc) + '</div></div></div>';
    h += '<div class="stats">';
    if (r.kind === 'PKG') {
      h += st('Package Rate', z(r.case_rate), 'z') + st('PF / HCI', 'Not split in source') + st('2nd Case Rate', esc(r.second_blocked), 'bad');
      if (r.applies_to) h += st('Applies to RVS', esc(r.applies_to.join(', ')));
      h += st('Group', esc(r.sub)) + st('Source', esc(r.source)) + st('Effectivity', esc(r.effectivity || ''));
    } else if (isCataract(r)) {
      h += st('Effective', 'PC 2025-0001 package rate (see list below)', '') +
        st('Annex C rate', '<span class="sup">' + z(r.case_rate) + '</span> superseded', 'z') + st('PF', '<span class="sup">' + z(r.pf) + '</span>', 'z', 'sub') + st('HCI', '<span class="sup">' + z(r.hci) + '</span>', 'z', 'sub') +
        st('2nd Case Rate', 'Cannot be used as 2nd case rate (PC 2025-0001)' + (r.annexc_second != null ? '. Annex C listed ' + z(r.annexc_second) + ', superseded' : ''), 'bad') +
        st('Subsite', esc(r.sub)) + st('Source', esc(r.source) + '; PC 2025-0001');
    } else {
      h += st('1st Case Rate', z(r.case_rate), 'z') + st('PF', z(r.pf), 'z', 'sub') + st('HCI', z(r.hci), 'z', 'sub') +
        (canBeSecond(r) ? st('2nd Case Rate', z(r.second_case_rate), 'z') + st('PF', z(r.second_pf), 'z', 'sub') + st('HCI', z(r.second_hci), 'z', 'sub')
          : st('2nd Case Rate', 'Cannot be used as 2nd case rate (not in Annex D)', 'bad')) +
        st(r.kind === 'ICD' ? 'Organ group' : 'Subsite', esc(r.sub)) + st('Category', esc(CATBY[r.cat].label)) + st('Source', esc(r.source)) +
        st('2nd CR source', canBeSecond(r) ? 'PC 2024-0037 Annex D' : 'Not in PC 2024-0037 Annex D') + st('Effectivity', esc(D.meta.effectivity));
    }
    var ov = r.xt.map(function (t) { return CATBY[t[0]].short + ' / ' + t[1]; });
    if (ov.length) h += st('Also listed in', esc(ov.join('; ')));
    h += '</div>';
    if (isCataract(r)) {
      h += '<div class="sec">PC 2025-0001 packages (effective amounts)</div><div class="pkgs">' + r.packages.map(function (pc) {
        var p = BY['PKG:' + pc]; return '<div class="st" data-go="' + esc(p.id) + '"><span class="k">' + esc(p.code) + '</span><span class="v">' + esc(p.desc) + '<br><span class="z" style="color:var(--zeny)">' + z(p.case_rate) + '</span></span></div>';
      }).join('') + '</div><div class="note">Per PC 2025-0001: CPSA required; BCVA and biometry documents required; not claimable as second case rate. Package amounts are per eye unless marked "Both Eyes".</div>';
    }
    if (r.borderline || r.notes) h += '<div class="warnbox"><b>' + (r.borderline ? 'Borderline inclusion' : 'Note') + '</b><br>' + esc(r.basis) + (r.notes ? '<br>' + esc(r.notes) : '') + '</div>';
    else h += '<div class="note"><b>Inclusion basis:</b> ' + esc(r.basis) + '</div>';
    var calcable = true;
    h += '<div class="btnrow left"><button class="rbtn" data-copy="' + esc(r.code) + '">Copy</button>' +
      '<button class="rbtn' + (favs[r.id] ? ' on' : '') + '" data-favt="' + esc(r.id) + '">' + (favs[r.id] ? '\u2605 Favorited' : '\u2606 Favorite') + '</button>' +
      (calcable ? '<button class="rbtn" data-calcp="' + esc(r.id) + '">Use as Primary</button>' : '') +
      (calcable && r.kind !== 'PKG' ? '<button class="rbtn" data-calcs="' + esc(r.id) + '"' + (canBeSecond(r) ? '' : ' disabled title="Not eligible as 2nd case rate"') + '>Use as Secondary</button>' : '') +
      (r.pf != null && r.kind !== 'PKG' && !isCataract(r) ? '<button class="rbtn" data-logadd="' + esc(r.id) + '">Log PF</button>' : '') +
      '<button class="rbtn" data-back>Close</button></div>';
    h += '<p class="disc">Reference only; verify against official PhilHealth circulars.</p>';
    $('dBody').innerHTML = h;
    window.scrollTo(0, 0);
  }

  // ---------- CALCULATOR ----------
  // Money is handled in integer centavos so totals are exact (PC 2024-0037 amounts have at most 2 decimals).
  function cents(n) { return n == null ? null : Math.round(n * 100); }
  function peso(c) { return c == null ? null : c / 100; }
  // Why a record cannot be the 2nd case rate (null = eligible). Order matters: most specific reason first.
  function secondIssue(P, S) {
    if (!S) return null;
    if (P && S.id === P.id) return { k: 'same', t: 'Same code as the 1st case rate. PC 35 s.2013 Sec. IV.D.4.b: a case rate group cannot be both 1st and 2nd in one claim, except procedures with laterality (its Annex 7, not available here). Not calculated.' };
    if (S.kind === 'PKG') return { k: 'pkg', t: 'Packages are not in PC 2024-0037 Annex D' + (S.applies_to ? ', and PC 2025-0001 says the cataract case rate shall not be claimed as a second case rate' : '') + '. Not calculated.' };
    if (isCataract(S)) return { k: 'cat', t: 'Cataract surgery: PC 2025-0001 \u2014 \u201Cshall not be claimed as a second case rate.\u201D Not calculated.' };
    if (S.second_case_rate == null) return { k: 'annexd', t: (S.kind === 'ICD' ? 'This ICD-10 code' : 'This RVS code') + ' is not in PC 2024-0037 Annex D. PC 35 s.2013 Sec. IV.D.4.c: conditions/procedures not in the list \u201Cshall not be reimbursed as second case rate.\u201D Not calculated.' };
    return null;
  }
  function eligBadge(r) {
    var is = secondIssue(null, r);
    return is ? '<span class="el no">No 2nd</span>' : '<span class="el ok">2nd ' + z(r.second_case_rate) + '</span>';
  }
  // Pure computation used by the UI and by ENT_TEST.compute (automated matrix).
  function compute(pid, sid, pkgid) {
    var P = pid ? BY[pid] : null, S = sid ? BY[sid] : null, out = { ok: false, issue: null, first: null, second: null, total: null };
    if (!P) return out;
    if (isCataract(P)) {
      var pk = pkgid ? BY[pkgid] : null;
      if (!pk || P.packages.indexOf(pk.code) < 0) { out.need = 'package'; out.issue = S ? secondIssue(P, S) : null; return out; }
      out.first = { code: P.code, via: pk.code, cr: cents(pk.case_rate), pf: null, hci: null };
    } else if (P.kind === 'PKG') out.first = { code: P.code, cr: cents(P.case_rate), pf: null, hci: null };
    else out.first = { code: P.code, cr: cents(P.case_rate), pf: cents(P.pf), hci: cents(P.hci) };
    out.issue = secondIssue(P, S);
    if (S && !out.issue) out.second = { code: S.code, cr: cents(S.second_case_rate), pf: cents(S.second_pf), hci: cents(S.second_hci) };
    var f = out.first, s = out.second;
    out.total = { cr: f.cr + (s ? s.cr : 0), pf: f.pf == null ? null : f.pf + (s ? s.pf : 0), hci: f.hci == null ? null : f.hci + (s ? s.hci : 0) };
    out.ok = true; return out;
  }
  // ---- type-ahead search for the calculator slots ----
  var CALC_ALL = [];
  function rankSearch(q, pool) {
    var toks = norm(q).trim().split(/\s+/).filter(Boolean); if (!toks.length) return null;
    var qn = toks.join('').replace(/\./g, ''), res = [];
    var reW = new RegExp('(^|[^a-z0-9])' + toks[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    for (var i = 0; i < pool.length; i++) {
      var r = pool[i]; if (!matches(r, toks)) continue;
      var sc = r._n === qn ? 0 : r._n.indexOf(qn) === 0 ? 1 : r._n.indexOf(qn) >= 0 ? 2 : reW.test(r.desc.toLowerCase()) ? 3 : 4;
      res.push([sc, r]);
    }
    res.sort(function (a, b) { return a[0] - b[0] || (a[1]._n < b[1]._n ? -1 : a[1]._n > b[1]._n ? 1 : 0); });
    return res.map(function (x) { return x[1]; });
  }
  var DDMAX = 30;
  function ddRow(which, r, blocked) {
    var amt = which === 'p' ? (isCataract(r) ? 'pkg' : z(r.case_rate)) : (blocked ? '\u2014' : z(r.second_case_rate));
    return '<li class="ddr' + (blocked ? ' blk' : '') + '" data-pick="' + which + '" data-id="' + esc(r.id) + '"' + (blocked ? ' aria-disabled="true"' : '') + '>' + ico(r, 18) +
      '<div class="ddm"><div class="ddc">' + kindTag(r) + '<b>' + hl(r.code) + '</b> <span class="ddcat">' + esc(CATBY[r.cat].short) + '</span></div><div class="ddd">' + hl(r.desc) + '</div></div>' +
      starBtn(r, 'ddstar') + '<div class="dda"><span class="r">' + amt + '</span>' + (which === 'p' ? (r.kind === 'PKG' ? '<span class="el no">Package</span>' : eligBadge(r)) : (blocked ? '<span class="el no">Not allowed</span>' : '<span class="el ok">Annex D</span>')) + '</div></li>';
  }
  function ddRender(which, q) {
    var el = $('dd_' + which); if (!el) return;
    var P = state.calcP ? BY[state.calcP] : null, h = '';
    var res = rankSearch(q || '', CALC_ALL); setHL(q);
    if (which === 'p') {
      var list = res || CALC_ALL;
      h = list.slice(0, DDMAX).map(function (r) { return ddRow('p', r, false); }).join('');
      if (!res) h = '<li class="ddh">Type a code (69436, H66.9 or h669) or words (e.g. tonsil, cataract). ' + CALC_ALL.length + ' codes: ENT, Eye, Skin, ICD-10, eye packages.</li>' + h;
      else if (!res.length) h = '<li class="ddh">No matching codes.</li>';
      else if (res.length > DDMAX) h += '<li class="ddh">' + (res.length - DDMAX) + ' more \u2014 type more to narrow down.</li>';
    } else {
      var src = res || CALC_ALL.filter(function (r) { return !secondIssue(P, r); });
      var ok = [], bad = [];
      src.forEach(function (r) { (secondIssue(P, r) ? bad : ok).push(r); });
      h = ok.slice(0, DDMAX).map(function (r) { return ddRow('s', r, false); }).join('');
      if (!res) h = '<li class="ddh">Only PC 2024-0037 Annex D codes can be the 2nd case rate (' + ok.length + ' here). Type to search.</li>' + h;
      else {
        if (!ok.length) h = '<li class="ddh">No eligible 2nd case rate matches.</li>';
        else if (ok.length > DDMAX) h += '<li class="ddh">' + (ok.length - DDMAX) + ' more eligible \u2014 type more to narrow down.</li>';
        if (bad.length) h += '<li class="ddh bad">Not allowed as 2nd (' + bad.length + '):</li>' + bad.slice(0, 8).map(function (r) { return ddRow('s', r, true); }).join('') + (bad.length > 8 ? '<li class="ddh">\u2026 ' + (bad.length - 8) + ' more not allowed</li>' : '');
      }
    }
    el.innerHTML = h;
  }
  function slotHTML(which, sel, label, hint) {
    var h = '<div class="dslot" id="slot_' + which + '"><h3>' + label + '</h3>';
    if (sel) {
      var r = BY[sel], P = state.calcP ? BY[state.calcP] : null;
      var is = which === 's' ? secondIssue(P, r) : null;
      var amt = which === 'p' ? (isCataract(r) ? null : r.case_rate) : (is ? null : r.second_case_rate);
      h += '<div class="sel' + (is ? ' blk' : '') + '">' + ico(r) + '<div class="t"><b>' + kindTag(r) + esc(r.code) + '</b> ' + esc(r.desc) +
        '<div class="z">' + (which === 'p' && isCataract(r) ? 'PC 2025-0001 package' : amt != null ? z(amt) + (which === 's' ? ' <span class="el ok">Annex D</span>' : '') : '<span class="el no">Not allowed as 2nd</span>') + '</div></div>' +
        starBtn(r, 'selstar') + '<button class="tbx big" data-clear="' + which + '" aria-label="Remove">x</button></div>';
      if (is) h += '<div class="blockbox" role="alert"><b>Blocked:</b> ' + esc(is.t) + '</div>';
      if (which === 'p' && isCataract(r)) {
        h += '<select class="selpkg" id="selpkg"><option value="">Choose PC 2025-0001 package\u2026</option>' + r.packages.map(function (pc) { var p = BY['PKG:' + pc]; return '<option value="' + esc(p.id) + '"' + (state.calcPkg === p.id ? ' selected' : '') + '>' + esc(p.code) + ' \u2014 ' + esc(p.desc) + ' \u2014 ' + z(p.case_rate) + '</option>'; }).join('') + '</select>';
      }
    } else {
      h += '<div class="picker"><div class="pkrow"><input id="pk_' + which + '" class="pk" data-which="' + which + '" type="search" enterkeyhint="search" placeholder="' + (which === 'p' ? 'Code, ICD (h669) or name' : 'Search eligible 2nd codes') + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search ' + (which === 'p' ? 'primary' : 'secondary') + ' code"><button class="rbtn sm pkx" data-pkx="' + which + '" aria-label="Clear">Clear</button></div><ul class="dd" id="dd_' + which + '" role="listbox"></ul></div>';
    }
    if (hint) h += '<p class="hint">' + hint + '</p>';
    return h + '</div>';
  }
  function primaryAmounts() { var c = compute(state.calcP, state.calcS, state.calcPkg); return c.ok ? c : null; }
  function calcSummary() {
    var P = BY[state.calcP], c = compute(state.calcP, state.calcS, state.calcPkg);
    if (!c.ok) return null;
    var f = c.first, s = c.second, T = c.total;
    var t = '1st ' + P.code + (f.via ? ' via package ' + f.via : '') + ': ' + z(peso(f.cr)) + (f.pf != null ? ' (PF ' + z(peso(f.pf)) + ', HCI ' + z(peso(f.hci)) + ')' : ' (package; PF/HCI not split)');
    if (s) t += '\n2nd ' + s.code + ' (Annex D): ' + z(peso(s.cr)) + ' (PF ' + z(peso(s.pf)) + ', HCI ' + z(peso(s.hci)) + ')';
    else if (c.issue) t += '\n2nd ' + BY[state.calcS].code + ': not allowed, not counted';
    t += '\nTotal: ' + z(peso(T.cr)) + (T.pf != null ? ' (PF ' + z(peso(T.pf)) + ', HCI ' + z(peso(T.hci)) + ')' : '');
    return t + '\nSource: PhilHealth PC 2024-0037 Annex A/B/C/D' + (f.via || P.kind === 'PKG' ? ', PC 2025-0001/0002' : '') + ' (reference only)';
  }
  function renderCalc() {
    var P = state.calcP ? BY[state.calcP] : null, S = state.calcS ? BY[state.calcS] : null;
    var h = '<div class="deal">' + slotHTML('p', state.calcP, 'Primary (1st case rate)', 'Any code in this app (RVS, ICD-10 or eye package). Paid at the full case rate; cataract RVS codes are paid via the chosen PC 2025-0001 package.');
    h += slotHTML('s', state.calcS, 'Secondary (2nd case rate, optional)', 'Only codes in PC 2024-0037 Annex D (' + ELIG.length + ' RVS codes here; none of the EENT ICD-10 codes is in Annex D). Paid at the printed Annex D amount and PF/HCI split. Same code, packages and cataract codes are blocked.');
    if (P) {
      var c = compute(state.calcP, state.calcS, state.calcPkg);
      if (!c.ok) h += '<div class="totals"><p class="hint">Choose the PC 2025-0001 package that applies (per eye, IOL type, pediatric) to compute the total.</p></div>';
      else {
        var f = c.first, s = c.second, T = c.total, split = f.pf != null, zc = function (v) { return v == null ? '\u2014' : z(peso(v)); };
        h += '<div class="totals" id="calcTotals"><table class="tbl"><tr><th></th><th>Case rate</th><th>PF</th><th>HCI</th></tr>' +
          '<tr><td>1st ' + esc(f.via || f.code) + '</td><td>' + zc(f.cr) + '</td><td>' + zc(f.pf) + '</td><td>' + zc(f.hci) + '</td></tr>' +
          (s ? '<tr><td>2nd ' + esc(s.code) + '</td><td>' + zc(s.cr) + '</td><td>' + zc(s.pf) + '</td><td>' + zc(s.hci) + '</td></tr>'
             : '<tr><td colspan="4" class="nosec">' + (c.issue ? '2nd ' + esc(S.code) + ' not allowed \u2014 not counted' : 'No second case rate selected') + '</td></tr>') +
          '<tr class="tot"><td>Total</td><td>' + zc(T.cr) + '</td><td>' + (split ? zc(T.pf) : '\u2014') + '</td><td>' + (split ? zc(T.hci) : '\u2014') + '</td></tr></table>';
        var notes = [];
        if (!split) notes.push('Package rates (PC 2025-0001/0002) are not split into PF/HCI in the source, so PF/HCI totals are not shown.');
        if (s && (isCataract(P) || P.kind === 'PKG')) notes.push('PC 2025-0001 bars cataract only as the 2nd case rate; it does not bar a 2nd case rate after a cataract package. Verify with PhilHealth before claiming.');
        if (s && s.cr === cents(S.case_rate)) notes.push(S.code + ' is exempt from the 50% rule (PC 35 s.2013 Sec. IV.D.6, simple debridement): Annex D pays the full amount with the first-case PF/HCI split.');
        if (s && P.kind !== 'PKG' && !isCataract(P) && S.case_rate > P.case_rate) notes.push('The 2nd code has a higher full case rate (' + z(S.case_rate) + ') than the 1st (' + z(P.case_rate) + '). PC 35 s.2013 Sec. IV.D.4.a: the 1st case rate is the one that used the most resources. Check the order.');
        if (s && P.kind !== S.kind) notes.push('Medical condition + procedure combinations are allowed (PC 35 s.2013 Sec. IV.D.5).');
        if (P && S && !c.issue && !secondIssue(S, P)) notes.push('<button class="rbtn sm" id="swap">Swap 1st \u21C4 2nd</button>');
        else if (P && S && !c.issue) notes.push('Swap not possible: the 1st code (' + esc(P.code) + ') is not allowed as a 2nd case rate.');
        h += notes.map(function (n) { return '<p class="hint">\u2022 ' + n + '</p>'; }).join('') + '</div>';
      }
    }
    h += '</div><div class="btnrow"><button class="rbtn" id="calcOk"' + (P ? '' : ' disabled') + ' title="Copy summary">OK (Copy)</button><button class="rbtn" id="calcCancel">Cancel</button></div>';
    h += '<p class="disc">Estimate only, using the published Annex A/B/C/D amounts and PC 2025-0001/0002 packages. Claims remain subject to PhilHealth rules and review. See <a class="lnk" href="#/rules">Rules</a>. Reference only; verify against official PhilHealth circulars.</p>';
    $('calcBody').innerHTML = h;
    if (!state.calcP) ddRender('p', '');
    if (!state.calcS) ddRender('s', '');
  }

  // ---------- RULES (NPC dialogue, paged) ----------
  function q(text, src) { return '<div class="q">\u201C' + text + '\u201D<span class="src">' + src + '</span></div>'; }
  function rulesPages() {
    var nIcd = CATBY.icd.count;
    return [
      '<div class="h">How the app applies them</div>' +
        '\u2022 <b>First case rate</b> = full amount in PC 2024-0037 Annex A (ICD-10) or Annex B (RVS); Annex C for codes excluded from the 50% adjustment.<br>' +
        '\u2022 <b>Second case rate</b> = the amount printed in PC 2024-0037 Annex D (' + ELIG.length + ' of the codes in this app). Codes not in Annex D are shown as \u201CCannot be used as 2nd case rate\u201D.<br>' +
        '\u2022 <b>Cataract</b> RVS 66840/66850/66852/66920/66930/66940/66982/66983/66984/66987 are paid via PC 2025-0001 packages; their Annex C rate is shown as superseded and they cannot be a second case rate.<br>' +
        '\u2022 The calculator never pairs a code with itself.<br>' +
        '\u2022 <b>ICD as 2nd?</b> Allowed only if the ICD-10 code is in Annex D (PC 35 s.2013 IV.D.4.c/IV.D.5). Annex D lists only 28 ICD codes (I23-I24, obstetric O-codes, FP0), none of them EENT, so no ICD code here can be 2nd. A procedure (RVS) <b>can</b> be 2nd after an ICD 1st.<br>' +
        '\u2022 2nd amounts and PF/HCI splits are the printed Annex D values (50% of the full rate: procedures 40% PF + 10% HCI, medical 30% PF + 20% HCI; simple debridement codes paid in full with the first-case split, PC 35 IV.D.6).',
      '<div class="h">PC 2024-0037 (50% adjustment, admissions from Jan 1, 2025)</div>' +
        q('Conditions with a corresponding case rate shall be paid the full amount indicated in the rate schedule. Payment rules of rationalized case rates shall remain in effect.', 'PC 2024-0037, Sec. F.1') +
        q('Annex D: List of Medical Conditions and Procedures Allowed as Second Case Rate', 'PC 2024-0037, list of annexes (Annex D columns: Second Case Rate \u2014 Case Rate, Health Facility Fee, Professional Fee)'),
      '<div class="h">PC 2024-0012 (Rules for Adjusting Case Rates, Rev. 1)</div>' +
        q('The adjustment shall apply to the first and second case rates in accordance with existing rules.', 'PC 2024-0012'),
      '<div class="h">PC 35 s.2013 \u2014 ACR Policy No. 2 (the \u201Cexisting rules\u201D)</div>' +
        q('The first case rate shall be the medical condition or procedure that used the most resources (drugs and medicines, laboratories and diagnostics, professional fees, etc) in managing the patient. The second case rate shall be the medical condition, or procedure with the second most resources used.', 'PC 35 s.2013, Sec. IV.D.4.a') +
        q('A case rate group shall not be allowed to be used both as first and second case rate in one claim except for procedures with laterality.', 'PC 35 s.2013, Sec. IV.D.4.b'),
      '<div class="h">PC 35 s.2013 (continued)</div>' +
        q('Medical conditions and procedures not included in Annex 3 shall not be reimbursed as second case rate.', 'PC 35 s.2013, Sec. IV.D.4.c (the 2013 Annex 3 list is now PC 2024-0037 Annex D)') +
        q('\u2026the provider shall be paid the full case rate amount for the first case rate plus 50% of the second case rate. \u2026 If the second case rate is a procedure, the 50% shall be divided into 40% professional fee and 10% health care institution fee.', 'PC 35 s.2013, Sec. IV.D.5'),
      '<div class="h">PC 35 s.2013 (continued)</div>' +
        q('When the identified procedures are done on both sides during one confinement, the second procedure shall be considered as the second case rate and shall be reimbursed at 50% of the case rate for the procedure \u2026 These procedures, however, may not be claimed as second case rate together with other medical conditions/procedures.', 'PC 35 s.2013, Sec. IV.G.4 (procedures listed in its Annex 7)'),
      '<div class="h">Packages with no second case rate</div>' +
        q('The case rate for cataract surgery shall not be claimed as a \u201Csecond\u201D case rate.', 'PC 2025-0001 (ECCE with IOL package) \u2014 applied to the 10 cataract RVS codes and all ECCE/PCS packages') +
        q('There shall be no second case rate.', 'PC 2026-0008 (moderate to severe leptospirosis package) \u2014 not EENT; for reference'),
      '<div class="h">Criteria: RVS codes in this app</div>' +
        '\u2022 <b>ENT/Head & Neck RVS</b>: the 604-code ENT set (ear 69000-69979, nose 30000-31299 + nasal fractures, larynx, cervical trachea, oral cavity 40490-42299, salivary, pharynx, thyroid/parathyroid, neck, facial skeleton 21010-21499, head & neck skin/facial nerve).<br>' +
        '\u2022 <b>Eye RVS</b>: all codes 65091-68899 in Annex B/C, plus blepharoplasty 15820-15823. ENT facial-skeleton codes with ORBIT in the description are cross-listed under Eye \u203A Orbit.<br>' +
        '\u2022 <b>Skin RVS</b>: all integumentary codes 10040-19499 not already in ENT or Eye (those are cross-listed). Breast 19000-19499 is its own subsite (flagged borderline).',
      '<div class="h">Criteria: ICD-10 codes in this app (' + nIcd + ')</div>' +
        'Only codes present in PC 2024-0037 Annex A/C. Eye H00-H59, Q10-Q15; Ear H60-H95, Q16-Q17; Nose J00-J01, J30-J34, Q30; Throat J02-J06, J35-J39, Q31, A36.0-A36.2, A69.1 (borderline Q32, J95.0, J95.5, A38); Oral K00-K14, Q35-Q38, A69.0; Thyroid E00-E07; Neoplasms C00-C14, C30-C32, C41.0-C41.1, C43.0-C43.4, C44.0-C44.4, C69, C72.3, C72.4, C73, C76.0, C77.0, D10, D11, D14.0-D14.1, D31, D34, D44.0 (borderline C75.0, D16.4-D16.5, D33.3, D35.1, D44.2, D44.6); Injuries S00-S19 except S06, T15-T16, T17.0-T17.3, T26, T28.0, T28.5 (borderline S02.0-S02.1, S12-S14, T20, T90 except T90.5); Other G51, A36 other (borderline).<br>Excluded: S06 intracranial injuries, T90.5.',
      '<div class="h">Not verified / not enforced</div>' +
        '\u2022 The PC 35 s.2013 circular body was read from philhealth.gov.ph, but its annexes (Annex 3 list, Annex 4 examples, Annex 7 procedures with laterality) were not obtained. Bilateral (same-code) claims are therefore not calculated.<br>' +
        '\u2022 No list of disallowed code pairs was found in the sources reviewed, so the app does not flag disallowed pairs beyond the rules above.<br>' +
        '\u2022 Quotes from scanned circulars were taken from OCR text and cleaned of OCR errors.<br><br>' +
        '<span class="src">Reference only; verify against official PhilHealth circulars.</span>'
    ];
  }
  function renderRules() {
    var pages = rulesPages(), i = Math.max(0, Math.min(state.rulesPage, pages.length - 1)); state.rulesPage = i;
    var last = i === pages.length - 1;
    $('rulesBody').innerHTML = '<div class="npc"><div class="ntag">' + pix('npc', 16) + '[PhilHealth Guide]</div>' +
      '<div class="ntxt">' + pages[i] + (last ? '' : ' <span class="caret">\u25BC</span>') + '</div>' +
      '<div class="nfoot"><span class="pg">' + (i + 1) + ' / ' + pages.length + '</span>' +
      '<button class="rbtn" id="rPrev"' + (i === 0 ? ' disabled' : '') + '>Back</button>' +
      (last ? '<button class="rbtn" id="rClose">Close</button>' : '<button class="rbtn" id="rNext">Next</button><button class="rbtn" id="rClose">Close</button>') + '</div></div>';
  }

  // ---------- ABOUT ----------
  function cname() { return window.PK_CREW ? PK_CREW.name() : 'Luffy'; }
  function cfem() { return !!(window.EENT_PROFILE && EENT_PROFILE.charGender() === 'f'); }
  function privacyHTML() {
    var L = window.PK_LOCK, on = L && L.on(), c = on ? L.cfg() : null, ps = window.PK_STORE ? PK_STORE.prefs() : {};
    var h = '<div class="sec">Patient privacy</div><div class="note" style="margin-top:0">' + esc(PK_STORE.NAME_NOTICE) + '</div>' +
      '<ul class="note privlist"><li>Compact views show <b>initials only</b>: home-screen widgets, the mascot\u2019s lines, notifications and the calendar. Tap \u201CShow names\u201D (eye) in Quest to see full names; it resets every launch.</li>' +
      '<li>CSV export uses initials by default; full names only if you pick \u201CFull names\u201D.</li><li>Backup JSON keeps full names so a restore is complete. Store it somewhere private.</li>' +
      '<li>Turn on the PIN lock below if anyone else uses this phone.</li>' +
      '<li><b>Optional Google sync</b> (off unless you sign in): your log, places and favourites are copied to a hidden app folder in <b>your own</b> Google Drive (Drive appDataFolder; the app cannot see your other Drive files). It is used only to keep your phones in step: no PHILHEALTH KING server, no analytics, nothing shared. Sign out any time; your data stays on this phone. Without sign-in nothing leaves the device.</li></ul>';
    h += '<div class="pfrow"><span class="lbl">PIN lock</span><div class="seg"><button class="segb' + (on ? '' : ' on') + '" data-pin="off">Off</button><button class="segb' + (on ? ' on' : '') + '" data-pin="on">On</button></div></div>';
    if (on) h += '<div class="pfrow"><span class="lbl">Locks</span><div class="seg"><button class="segb' + (c.scope !== 'app' ? ' on' : '') + '" data-pinscope="quest">Quest + Log Pose</button><button class="segb' + (c.scope === 'app' ? ' on' : '') + '" data-pinscope="app">Whole app</button></div></div><div class="btnrow left"><button class="rbtn sm" data-pin="change">Change PIN</button><button class="rbtn sm" data-pin="lock">Lock now</button></div>';
    if (pinSetup) h += '<div class="pfrow"><label for="pin1">' + (pinSetup === 2 ? 'Repeat PIN' : 'New PIN (4\u20136 digits)') + '</label><input id="pin1" type="password" inputmode="numeric" maxlength="6" autocomplete="off" pattern="[0-9]*"><button class="rbtn sm" data-pin="next">' + (pinSetup === 2 ? 'Save' : 'Next') + '</button></div>';
    h += window.PK_CSVPT ? PK_CSVPT('csvPtA') : '';
    return h;
  }
  var pinSetup = 0, pinFirst = '';
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pin],[data-pinscope]'); if (!b || !window.PK_LOCK) return;
    if (b.dataset.pinscope) { var c = PK_LOCK.cfg(); c.scope = b.dataset.pinscope; localStorage.setItem('pk_lock', JSON.stringify(c)); renderAbout(); return; }
    var a = b.dataset.pin;
    if (a === 'off') { if (PK_LOCK.on()) { PK_LOCK.show(function () { PK_LOCK.clear(); toast('PIN lock off'); renderAbout(); }); } pinSetup = 0; renderAbout(); return; }
    if (a === 'on' || a === 'change') { if (PK_LOCK.on() && a === 'on') return; pinSetup = 1; renderAbout(); var i = $('pin1'); if (i) i.focus(); return; }
    if (a === 'lock') { PK_LOCK.lockNow(); toast('Locked'); return; }
    if (a === 'next') { var v = ($('pin1').value || '').replace(/\D/g, ''); if (v.length < 4) { toast('PIN must be 4\u20136 digits'); return; }
      if (pinSetup === 1) { pinFirst = v; pinSetup = 2; renderAbout(); $('pin1').focus(); return; }
      if (v !== pinFirst) { pinSetup = 1; toast('PINs did not match'); renderAbout(); return; }
      PK_LOCK.setPin(v, (PK_LOCK.cfg() || {}).scope || 'quest'); pinSetup = 0; pinFirst = ''; toast('PIN lock on'); renderAbout(); }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'csvIniA' && window.PK_STORE) PK_STORE.setPref('csvIni', e.target.checked); });
  function renderAbout() {
    var nb = RECS.filter(function (r) { return r.borderline; }).length;
    var h = '<div class="binfo"><div class="portrait">' + pix('strawhat', 48) + '</div><div><div class="dev">Developed by Dr. Juan Carlo Navarrete</div><div class="devsub">PHILHEALTH KING \u00B7 v' + esc(window.APP_VERSION || '2.1.2') + '</div></div></div>' +
      (window.PK_CREW ? PK_CREW.aboutHTML() : '') + privacyHTML() +
      '<div class="btnrow left"><a class="rbtn" href="#/places">' + pix('anchor', 16) + ' Places &amp; location types</a><a class="rbtn" href="#/rules">' + pix('wheel', 16) + ' Claim rules</a></div>' +
      '<div class="note">Offline lookup of PhilHealth All Case Rates for eye, ear, nose, throat, head &amp; neck and skin: RVS procedure codes, ICD-10 medical case rates and eye packages.</div>' +
      '<div class="grid">' + st('Base circular', 'PhilHealth Circular 2024-0037 (50% adjustment of select case rates)') +
      st('Case rates', 'Annex A (ICD-10), Annex B (RVS), Annex C (excluded from 50%)') + st('2nd case rates', 'Annex D') +
      st('Eye packages', 'PC 2025-0001 (cataract ECCE/IOL, pediatric), PC 2025-0002 (children\u2019s optometry)') +
      st('Effectivity', 'Admissions from January 1, 2025 (packages per their circulars)') + st('Data as of', 'September 25, 2026') +
      CATS.map(function (c) { return st(c.label, c.count + ' codes' + (c.xcount ? ' (+' + c.xcount + ' cross-listed)' : '')); }).join('') +
      st('Total', RECS.length + ' records; ' + ELIG.length + ' allowed as 2nd CR; ' + nb + ' borderline') + '</div>' +
      '<div class="sec">Currency of the data</div><div class="note" style="margin-top:0">As of Sep 25, 2026, the base schedule is PC 2024-0037. Cataract surgery is governed by PC 2025-0001 packages. Later circulars reviewed (e.g. PC 2026-0005 maternal/gyne, PC 2026-0008 leptospirosis, PC 2026-0012 DRG shadow billing) do not override the codes in this app; payment is still by All Case Rates.</div>' +
      '<div class="sec">Notes</div><div class="note" style="margin-top:0">\u2022 Amounts copied from official PhilHealth PDF annexes; descriptions were reconstructed from PDF layout and may have minor wording/order issues.<br>\u2022 \u201CBorderline\u201D (B) marks codes whose classification overlaps other specialties.<br>\u2022 Categories/subsites were assigned for this app by RVS/ICD-10 range, not by PhilHealth. Full criteria: Rules tab.<br>\u2022 Fonts: Mochiy Pop One, Fredoka and M PLUS Rounded 1c (SIL Open Font License 1.1; licenses in fonts/OFL-*.txt). Icons, scenery and the painted Doktor / Doktora are original art made for this app (Ghibli-inspired mood; no film characters or studio assets).<br>\u2022 Mascot: ' + esc(cname()) + '. Tap the mascot for tips; hide it with the toggle above.</div>' +
      '<div class="warnbox"><b>Disclaimer</b><br>Reference only; verify against official PhilHealth circulars.</div>';
    $('aboutBody').innerHTML = (window.PK_EXTRA ? PK_EXTRA.aboutTop() : '') + h;
  }

  // ---------- ROUTER ----------
  function show(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.view'), function (v) { v.classList.toggle('active', v.id === id); });
    var tab = id === 'detail' ? 'home' : (id === 'crew' || id === 'rules' || id === 'places') ? 'about' : id;
    Array.prototype.forEach.call(document.querySelectorAll('.menubar a'), function (a) { a.classList.toggle('on', a.dataset.tab === tab); });
  }
  var homeScroll = 0, lastView = 'home';
  function route() {
    var hsh = location.hash || '#/';
    if (lastView === 'home') homeScroll = window.scrollY;
    var m;
    if (window.PK_LOCK && PK_LOCK.guarded(hsh)) { show('locked'); PK_LOCK.show(route); return; }
    if (hsh.indexOf('#/quest') === 0 && window.PK_QUEST) { PK_QUEST.route(hsh); show('quest'); if (lastView !== 'quest' || !/^#\/quest\/(day|find)?$/.test(hsh)) window.scrollTo(0, 0); lastView = 'quest'; return; }
    if ((m = hsh.match(/^#\/item\/(.+)$/))) { renderDetail(decodeURIComponent(m[1])); show('detail'); lastView = 'detail'; }
    else if (hsh === '#/calc') { renderCalc(); show('calc'); lastView = 'calc'; window.scrollTo(0, 0); }
    else if (hsh === '#/rules') { renderRules(); show('rules'); lastView = 'rules'; window.scrollTo(0, 0); }
    else if (hsh === '#/log' && window.PK_LOG) { PK_LOG.render(); show('log'); lastView = 'log'; window.scrollTo(0, 0); }
    else if (hsh === '#/crew' && window.PK_CREW) { PK_CREW.renderPicker(); show('crew'); lastView = 'crew'; window.scrollTo(0, 0); }
    else if (hsh === '#/places' && window.PK_PLACES) { PK_PLACES.render(); show('places'); lastView = 'places'; window.scrollTo(0, 0); }
    else if (window.PK_EXTRA && PK_EXTRA.match(hsh)) { var xv = PK_EXTRA.route(hsh); show(xv); lastView = xv; window.scrollTo(0, 0); }
    else if (hsh === '#/about') { renderAbout(); show('about'); lastView = 'about'; window.scrollTo(0, 0); }
    else { renderList(false); show('home'); lastView = 'home'; window.scrollTo(0, homeScroll); }
  }
  function goBack() { if (history.length > 1) history.back(); else location.hash = '#/'; }
  function sparkle(x, y) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (var i = 0; i < 6; i++) {
      var s = document.createElement('i'); s.className = 'spark';
      var a = (Math.PI * 2 * i) / 6, d = 14 + (i % 2) * 6;
      s.style.left = (x - 2) + 'px'; s.style.top = (y - 2) + 'px';
      s.style.setProperty('--dx', Math.round(Math.cos(a) * d) + 'px'); s.style.setProperty('--dy', Math.round(Math.sin(a) * d) + 'px');
      document.body.appendChild(s); setTimeout(function (el) { return function () { el.remove(); }; }(s), 500);
    }
  }
  function setCat(c) { state.cat = c; state.chip = null; state.favOnly = false; renderCatMenu(); renderChips(); renderList(true); window.scrollTo(0, 0); }

  // ---------- EVENTS ----------
  function bind() {
    Array.prototype.forEach.call(document.querySelectorAll('.menubar .slot'), function (s) { s.innerHTML = pix(s.dataset.ico, 22); });
    var qi = $('q'), deb = null;
    qi.addEventListener('input', function () {
      $('clearQ').style.display = qi.value ? 'inline-block' : 'none';
      clearTimeout(deb); deb = setTimeout(function () { state.q = qi.value; renderList(true); window.scrollTo(0, 0); }, 140);
    });
    $('clearQ').addEventListener('click', function () { qi.value = ''; state.q = ''; this.style.display = 'none'; renderList(true); qi.focus(); });
    $('scope').addEventListener('click', function () { state.scopeAll = !state.scopeAll; this.textContent = state.scopeAll ? 'All' : 'Tab'; qi.placeholder = state.scopeAll ? 'Search all: code (H66.9 or H669) or description' : 'Search this tab'; renderList(true); });
    $('catmenu').addEventListener('click', function (e) { var b = e.target.closest('.cat'); if (b) setCat(b.dataset.cat); });
    $('chips').addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return;
      if (b.dataset.fav) { state.favOnly = !state.favOnly; if (state.favOnly) state.chip = null; }
      else { state.chip = b.dataset.chip || null; state.favOnly = false; }
      renderChips(); renderList(true); window.scrollTo(0, 0);
    });
    $('list').addEventListener('click', function (e) {
      if (e.target.id === 'more') { shown += PAGE; renderList(false); return; }
      var sb = e.target.closest('[data-favt]'); if (sb) { e.stopPropagation(); toggleFav(sb.dataset.favt); return; }
      var row = e.target.closest('.row'); if (row) location.hash = '#/item/' + encodeURIComponent(row.dataset.id);
    });
    var pkDeb = null;
    document.addEventListener('input', function (e) {
      var t = e.target; if (!t.classList || !t.classList.contains('pk')) return;
      clearTimeout(pkDeb); pkDeb = setTimeout(function () { ddRender(t.dataset.which, t.value); }, 90);
    });

    document.addEventListener('change', function (e) { if (e.target.id === 'selpkg') { state.calcPkg = e.target.value || null; renderCalc(); } });
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? (e.target.closest('button,[data-back],[data-go]') || e.target) : e.target;
      if (t.classList && (t.classList.contains('rbtn') || t.classList.contains('tab') || t.classList.contains('cat'))) sparkle(e.clientX, e.clientY);
      var ds = t.dataset || {};
      if (ds.back !== undefined) { goBack(); return; }
      if (ds.go) { location.hash = '#/item/' + encodeURIComponent(ds.go); return; }
      if (ds.copy) { copyText(ds.copy); return; }
      if (ds.favt) { toggleFav(ds.favt); return; }
      if (ds.calcp) { state.calcP = ds.calcp; state.calcPkg = null; if (state.calcS === state.calcP) state.calcS = null; location.hash = '#/calc'; return; }
      if (ds.calcs && !t.disabled) { if (state.calcP === ds.calcs) { toast('Same code as the 1st case rate'); return; } state.calcS = ds.calcs; location.hash = '#/calc'; return; }
      if (ds.pkx) { var inp = $('pk_' + ds.pkx); if (inp) { inp.value = ''; ddRender(ds.pkx, ''); inp.focus(); } return; }
      if (ds.clear) { if (ds.clear === 'p') { state.calcP = null; state.calcPkg = null; } else state.calcS = null; renderCalc(); return; }
      if (t.id === 'swap') { var p0 = state.calcP; if (secondIssue(BY[state.calcS], BY[p0])) { toast('Swap not allowed'); return; } state.calcP = state.calcS; state.calcS = p0; state.calcPkg = null; renderCalc(); return; }
      if (t.id === 'calcOk' && state.calcP) { var sm = calcSummary(); if (sm) copyText(sm, 'Summary copied'); else toast('Choose a package first'); return; }
      if (t.id === 'calcCancel') { state.calcP = null; state.calcS = null; state.calcPkg = null; renderCalc(); return; }
      if (t.id === 'rNext') { state.rulesPage++; renderRules(); window.scrollTo(0, 0); return; }
      if (t.id === 'rPrev') { state.rulesPage--; renderRules(); window.scrollTo(0, 0); return; }
      if (t.id === 'rClose') { state.rulesPage = 0; location.hash = '#/'; return; }
      var li = e.target.closest && e.target.closest('li[data-pick]');
      if (li) {
        if (li.dataset.pick === 'p') { state.calcP = li.dataset.id; state.calcPkg = null; if (state.calcS === state.calcP) state.calcS = null; }
        else { var iss = secondIssue(state.calcP ? BY[state.calcP] : null, BY[li.dataset.id]); if (iss) { toast('Not allowed as 2nd case rate'); return; } state.calcS = li.dataset.id; }
        renderCalc(); window.scrollTo(0, 0);
      }
    });
    window.addEventListener('hashchange', route);
  }

  function init(data) {
    D = data; RECS = data.records; CATS = data.meta.cats;
    CATS.forEach(function (c) { CATBY[c.id] = c; });
    RECS.forEach(function (r) { r._s = (r.code + ' ' + r.desc).toLowerCase(); r._n = r.code.toLowerCase().replace(/\./g, ''); BY[r.id] = r; });
    ELIG = RECS.filter(function (r) { return r.kind !== 'PKG' && canBeSecond(r); });
    CALCPOOL = RECS.filter(function (r) { return r.kind !== 'PKG'; }); CALC_ALL = RECS.slice();
    initFavs();
    window.EENT_CORE = { BY: BY, RECS: RECS, CATBY: CATBY, rankSearch: rankSearch, hl: hl, setHL: setHL, kindTag: kindTag, compute: compute, canBeSecond: canBeSecond, peso: peso, route: route, secondIssue: secondIssue, isCataract: isCataract, cents: cents, z: z, esc: esc, ico: ico, toast: toast, sparkle: sparkle,
      favList: function () { return Object.keys(favs).sort(); }, favMerge: function (arr) { var n = 0; (arr || []).forEach(function (k) { var id = typeof k === 'string' && favKey(k); if (id && !favs[id]) { favs[id] = 1; n++; } }); if (n) { saveFavs(); renderChips(); } return n; }, rerenderAbout: function () { if (lastView === 'about') renderAbout(); } };
    renderCatMenu(); renderChips(); bind(); route();
  }
  window.ENT_TEST = { state: state, setCalc: function (p, s, pkg) { state.calcP = p; state.calcS = s; state.calcPkg = pkg || null; }, setCat: function (c) { setCat(c); }, setRulesPage: function (i) { state.rulesPage = i; }, compute: compute, secondIssue: function (p, s) { return secondIssue(p ? BY[p] : null, BY[s]); }, search: function (q) { return (rankSearch(q, CALC_ALL) || []).map(function (r) { return r.id; }); }, listSearch: function (q, cat) { return filtered(q, cat ? RECS.filter(function (r) { return inCat(r, cat); }) : RECS).map(function (r) { return r.id; }); }, hl: function (q, t) { setHL(q); return hl(t); }, render: function () { renderCalc(); }, favs: function () { return Object.keys(favs).sort(); }, toggleFav: function (k) { toggleFav(k); }, favKey: function (k) { return favKey(k); } };
  fetch('data.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(init).catch(function (e) {
    document.getElementById('list').innerHTML = '<li class="empty">Could not load data: ' + esc(e.message) + '</li>';
  });
})();
