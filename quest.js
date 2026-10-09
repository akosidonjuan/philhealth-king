/* PHILHEALTH KING "Quest" tab: procedure calendar (month / agenda), day view, add/backtrack/edit/delete, search & filter.
   Uses PK_STORE (same entries as Log Pose). Dates use Month/Day/Year dropdowns. Patient initials only. */
(function () {
  var S = function () { return window.PK_STORE; }, C = function () { return window.EENT_CORE; };
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var ui = { ym: null, sel: null, view: 'month', form: null, find: { q: '', preset: 'all', from: null, to: null, loc: 'all', fac: '', as: 'all', status: 'all' }, armDel: 0, pay: 'all', code: '', sumScope: 'month', sumAll: false, sumOpen: (function () { try { return localStorage.getItem('pk_qsum_open') !== '0'; } catch (e) { return true; } })() };
  function flt(x) { return Object.assign({ pay: ui.pay, code: ui.code }, x || {}); }
  function esc(s) { return C().esc(s); } function money(c) { return C().z(c / 100); }
  function parse(d) { var p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ymd(dt) { return S().ymd(dt); }
  function addDays(d, n) { var x = parse(d); x.setDate(x.getDate() + n); return ymd(x); }
  function longDate(d) { var x = parse(d); return DOW[x.getDay()] + ', ' + MON[x.getMonth()].slice(0, 3) + ' ' + x.getDate() + ', ' + x.getFullYear(); }
  function dim(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function box() { return document.getElementById('questBody'); }
  function iniBadge(e) { var full = S().reveal() && e.name, s = S().ptLabel(e, full); return '<span class="ini' + (s ? '' : ' none') + (full ? ' full' : '') + '" title="' + (full ? 'Patient name' : 'Patient initials') + '">' + (s ? esc(s) : 'No name') + '</span>'; }
  function eyeBtn() { var on = S().reveal(); return '<button class="rbtn sm q-eye' + (on ? ' on' : '') + '" data-qeye aria-pressed="' + on + '" title="' + (on ? 'Hide full names (show initials)' : 'Show full names') + '">' + (on ? '\u{1F441} Hide names' : '\u{1F441} Show names') + '</button>'; }
  function blockReason(r) { if (!r) return 'Pick a code.'; if (r.kind === 'PKG') return 'Packages have no PF split; not logged.'; if (C().isCataract(r)) return 'Cataract surgery is paid via PC 2025-0001 packages (no PF split).'; if (r.pf == null) return 'No PF in the source table.'; return null; }
  function autoPF(r, as) { return r ? C().cents(as === '2' ? r.second_pf : r.pf) : null; }

  // ---------- date dropdowns (Month / Day / Year) ----------
  function dateSel(id, d, label) {
    var p = d.split('-'), y = +p[0], m = +p[1] - 1, dd = +p[2], ty = +S().today().slice(0, 4), h = '<div class="dsel" role="group" aria-label="' + (label || 'Date') + '">';
    h += '<select id="' + id + '_m" aria-label="Month">' + MON.map(function (n, i) { return '<option value="' + i + '"' + (i === m ? ' selected' : '') + '>' + n.slice(0, 3) + '</option>'; }).join('') + '</select>';
    h += '<select id="' + id + '_d" aria-label="Day">'; for (var i = 1; i <= dim(y, m); i++) h += '<option' + (i === dd ? ' selected' : '') + '>' + i + '</option>'; h += '</select>';
    h += '<select id="' + id + '_y" aria-label="Year">'; for (var yy = ty + 2; yy >= 2015; yy--) h += '<option' + (yy === y ? ' selected' : '') + '>' + yy + '</option>'; h += '</select></div>';
    return h;
  }
  function readSel(id) { var m = document.getElementById(id + '_m'); if (!m) return null; var y = +document.getElementById(id + '_y').value, mo = +m.value, d = Math.min(+document.getElementById(id + '_d').value, dim(y, mo)); return y + '-' + S().pad(mo + 1) + '-' + S().pad(d); }

  // ---------- month / agenda ----------
  function toolbar() {
    var y = ui.ym[0], m = ui.ym[1];
    return '<div class="q-bar"><button class="rbtn sm q-nav" data-q="prev" aria-label="Previous month">\u25C0</button><div class="q-title">' + MON[m] + ' ' + y + '</div><button class="rbtn sm q-nav" data-q="next" aria-label="Next month">\u25B6</button>' +
      '<button class="rbtn sm" data-q="today">Today</button></div>' + summaryHTML() + filterBar() +
      '<div class="q-bar2"><div class="seg q-view"><button class="segb' + (ui.view === 'month' ? ' on' : '') + '" data-qv="month">Month</button><button class="segb' + (ui.view === 'agenda' ? ' on' : '') + '" data-qv="agenda">Agenda</button></div>' +
      eyeBtn() + '<a class="rbtn sm" href="#/quest/find">' + pix('scroll', 16) + ' Search</a></div>' +
      '<div class="btnrow left q-add"><a class="rbtn" href="#/quest/new/' + ui.sel + '">+ New Quest</a><a class="rbtn back" href="#/quest/new/' + addDays(S().today(), -1) + '?past=1">\u21B6 Add past procedure</a></div>';
  }
  function monthHTML() {
    var y = ui.ym[0], m = ui.ym[1], first = new Date(y, m, 1).getDay(), n = dim(y, m), t = S().today();
    var from = y + '-' + S().pad(m + 1) + '-01', to = y + '-' + S().pad(m + 1) + '-' + S().pad(n), per = {};
    S().filter(flt({ from: from, to: to })).forEach(function (e) { var k = e.date; per[k] = per[k] || { n: 0, s: 0, u: 0, a: 0, dots: [] }; per[k].n++; if (e.anes) per[k].a++; if (e.status === 'sched') per[k].s++; else if (e.pay !== 'paid') per[k].u++; per[k].dots.push(e.status === 'sched' ? 'dot-s' : e.pay === 'paid' ? 'dot-p' : 'dot-u'); });
    var h = '<div class="qcal" id="qcal"><div class="qdow">' + DOW.map(function (d) { return '<span>' + d.slice(0, 2) + '</span>'; }).join('') + '</div><div class="qgrid">';
    for (var i = 0; i < first; i++) h += '<span class="qd empty"></span>';
    for (var d = 1; d <= n; d++) {
      var k = y + '-' + S().pad(m + 1) + '-' + S().pad(d), p = per[k], cls = 'qd' + (k === t ? ' today' : '') + (k === ui.sel ? ' sel' : '') + (k > t ? ' fut' : '');
      h += '<button class="' + cls + '" data-qday="' + k + '" aria-label="' + longDate(k) + (p ? ', ' + p.n + ' procedure' + (p.n > 1 ? 's' : '') + (p.u ? ', ' + p.u + ' unpaid' : '') + (p.a ? ', ' + p.a + ' with anesthesiologist' : '') : '') + '"><span class="qn">' + d + '</span>' +
        (p ? '<span class="qc' + (p.s === p.n ? ' sched' : '') + '">' + p.n + '</span>' + (p.a ? '<span class="qanes" aria-hidden="true" title="With anesthesiologist">A</span>' : '') + '<span class="qdots">' + p.dots.slice(0, 4).map(function (c) { return '<i class="' + c + '"></i>'; }).join('') + '</span>' : '') + '</button>';
    }
    return h + '</div></div>';
  }
  function entryRow(e, showDate) {
    var r = C().BY[e.rid], L = S().LOCBY[e.loc];
    return '<li class="qe' + (e.status === 'sched' ? ' sched' : '') + '" data-qedit="' + esc(e.id) + '">' + iniBadge(e) +
      '<div class="qe-m"><div class="qe-c">' + C().kindTag(r || { kind: e.kind }) + esc(e.code) + ' <span class="bl ' + (e.as === '2' ? 'ok2' : 'first') + '">' + (e.as === '2' ? '2nd' : '1st') + '</span>' + (e.status === 'sched' ? ' <span class="bl schedb">Scheduled</span>' : '') + (e.anes ? ' <span class="bl anesb" title="With anesthesiologist">\u2695 Anes' + (e.anesName ? ' \u00B7 ' + esc(e.anesName) : '') + '</span>' : '') + '</div>' +
      '<div class="qe-d">' + esc(e.desc) + '</div><div class="qe-w">' + (showDate ? esc(longDate(e.date)) + ' \u00B7 ' : '') + '<span class="locb ' + e.loc + '">' + pix(L[2], 12) + L[1] + '</span> ' + esc(e.fac || '\u2014') + (e.note ? ' \u00B7 ' + esc(e.note) : '') + '</div></div>' +
      '<div class="qe-pf">' + money(S().myPF(e)) + '<span>' + (e.anes ? 'your 70%' : 'PF') + '</span>' + (e.anes ? '<span class="qe-an">Anes ' + money(S().anesPF(e)) + '</span>' : '') + payPill(e) + '</div></li>';
  }
  function payPill(e) { var pd = e.pay === 'paid'; return '<button class="paypill ' + (pd ? 'paid' : 'unpaid') + '" data-qpay="' + esc(e.id) + '" aria-pressed="' + pd + '" aria-label="' + (pd ? 'Paid' + (e.paidDate ? ' on ' + esc(e.paidDate) : '') + '. Tap to mark unpaid' : 'Unpaid. Tap to mark paid') + '">' + (pd ? '\u2713 PAID' : 'UNPAID') + '</button>'; }
  function dayHTML(d) {
    var list = S().filter(flt({ from: d, to: d })).sort(function (a, b) { return a.created - b.created; }), t = S().today();
    var h = '<div class="qday"><div class="qday-h"><b>' + esc(longDate(d)) + (d === t ? ' \u00B7 Today' : '') + '</b><span>' + list.length + ' quest' + (list.length === 1 ? '' : 's') + ' \u00B7 PF ' + money(S().sum(list)) + (S().sumAnes(list) ? ' \u00B7 Anes ' + money(S().sumAnes(list)) : '') + '</span></div>';
    h += list.length ? '<ul class="qlist">' + list.map(function (e) { return entryRow(e, false); }).join('') + '</ul>' : '<p class="hint">No procedures on this day.</p>';
    h += '<div class="btnrow left"><a class="rbtn" href="#/quest/new/' + d + (d < t ? '?past=1' : '') + '">' + (d < t ? '+ Add past procedure' : d > t ? '+ Schedule OR' : '+ Add procedure') + '</a></div></div>';
    return h;
  }
  function agendaHTML() {
    var y = ui.ym[0], m = ui.ym[1], list = S().filter(flt({ from: y + '-' + S().pad(m + 1) + '-01', to: y + '-' + S().pad(m + 1) + '-' + S().pad(dim(y, m)) }));
    if (!list.length) return '<p class="hint">No procedures in ' + MON[m] + ' ' + y + (ui.pay !== 'all' || ui.code ? ' match the filter' : '') + '.</p>';
    return grouped(list);
  }
  function grouped(list) {
    var h = '<ul class="qlist agenda">', cur = '';
    list.forEach(function (e) {
      if (e.date !== cur) { cur = e.date; var dl = list.filter(function (x) { return x.date === cur; }); h += '<li class="qgh" data-qday="' + cur + '"><span>' + esc(longDate(cur)) + '</span><b>' + dl.length + ' \u00B7 ' + money(S().sum(dl)) + '</b></li>'; }
      h += entryRow(e, false);
    });
    return h + '</ul>';
  }
  // ---------- payment filter bar + summary panel ----------
  function filterBar(inFind) {
    var chip = function (v, t) { return '<button class="chipbtn pay-' + v + (ui.pay === v ? ' on' : '') + '" data-qpayf="' + v + '" aria-pressed="' + (ui.pay === v) + '">' + t + '</button>'; };
    var h = '<div class="q-filt" role="group" aria-label="Payment filter"><span class="lbl">Payment</span>' + chip('all', 'All') + chip('paid', '\u2713 Paid') + chip('unpaid', 'Unpaid');
    if (ui.code) { var r = C().BY[S().all().filter(function (e) { return e.code === ui.code; }).map(function (e) { return e.rid; })[0]]; h += '<button class="chipbtn on codechip" data-qcode="" aria-label="Clear procedure filter ' + esc(ui.code) + '">' + esc(ui.code) + (r ? ' ' + esc(r.desc.slice(0, 16)) + '\u2026' : '') + ' \u2715</button>'; }
    if (ui.pay !== 'all' || ui.code) h += '<button class="linkbtn" data-qclear>Clear filters</button>';
    return h + '</div>';
  }
  function scopeList() {
    var y = ui.ym[0], m = ui.ym[1], sc = ui.sumScope;
    if (sc === 'month') return { label: MON[m] + ' ' + y, list: S().filter(flt({ from: y + '-' + S().pad(m + 1) + '-01', to: y + '-' + S().pad(m + 1) + '-' + S().pad(dim(y, m)) })) };
    if (sc === 'year') return { label: String(y), list: S().filter(flt({ from: y + '-01-01', to: y + '-12-31' })) };
    if (sc === 'filter') { var f = ui.find, rg = presetRange(f.preset); return { label: 'Search results', list: S().filter(flt({ q: f.q, from: rg[0], to: rg[1], loc: f.loc, fac: f.fac, as: f.as, status: f.status })) }; }
    return { label: 'All time', list: S().filter(flt({})) };
  }
  function summaryHTML() {
    var open = ui.sumOpen, sc = scopeList(), r = S().paySummary(sc.list), pct = r.donePF ? Math.round(r.paidPF / r.donePF * 100) : 0;
    var h = '<div class="qsum' + (open ? ' open' : '') + '"><button class="qsum-h" data-qsum aria-expanded="' + open + '"><span>' + pix('chest', 18) + ' PF Summary \u00B7 ' + esc(sc.label) + '</span><b>' + (open ? '\u25B2' : money(r.unpaidPF) + ' unpaid \u25BC') + '</b></button>';
    if (!open) return h + '</div>';
    h += '<div class="qsum-b"><div class="seg qsum-sc">' + [['month', 'Month'], ['year', 'Year'], ['all', 'All time'], ['filter', 'Search']].map(function (o) { return '<button class="segb' + (ui.sumScope === o[0] ? ' on' : '') + '" data-qscope="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
    if (ui.pay !== 'all' || ui.code) h += '<p class="hint qsum-f">Filtered: ' + (ui.pay !== 'all' ? (ui.pay === 'paid' ? 'Paid only' : 'Unpaid only') : '') + (ui.pay !== 'all' && ui.code ? ' \u00B7 ' : '') + (ui.code ? 'procedure ' + esc(ui.code) : '') + '</p>';
    h += '<div class="qsum-cnt"><div><b>' + r.saved + '</b><span>Saved</span></div><div><b>' + r.done + '</b><span>Done</span></div><div><b>' + r.sched + '</b><span>Sched.</span></div><div class="is-paid"><b>' + r.paid + '</b><span>Paid</span></div><div class="is-unpd"><b>' + r.unpaid + '</b><span>Unpaid</span></div></div>';
    h += '<div class="qsum-pf"><div class="is-paid"><span>Paid PF</span><b>' + money(r.paidPF) + '</b></div><div class="is-unpd"><span>Unpaid (receivable)</span><b>' + money(r.unpaidPF) + '</b></div><div><span>Total PF (done)</span><b>' + money(r.donePF) + '</b></div></div>' + (r.anesN ? '<div class="qsum-anes"><span>\u2695 Anesthesiologist share (30%) \u00B7 ' + r.anesDoneN + ' done case' + (r.anesDoneN === 1 ? '' : 's') + '</span><b>' + money(r.anesDonePF) + '</b><i>Your totals above already exclude this \u00B7 gross PF (done) ' + money(r.grossDonePF) + (r.anesSchedN ? ' \u00B7 +' + money(r.anesSchedPF) + ' on ' + r.anesSchedN + ' scheduled' : '') + '</i></div>' : '');
    h += '<div class="bounty"><div class="bounty-l"><span>PF collected</span><b>' + pct + '%</b></div><div class="pxbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="PF collected"><i style="width:' + pct + '%"></i></div></div>';
    if (r.sched) h += '<p class="hint">Scheduled: ' + r.sched + ' \u00B7 expected PF ' + money(r.schedPF) + (r.prepaid ? ' \u00B7 ' + r.prepaid + ' marked paid in advance (' + money(r.prepaidPF) + ')' : '') + '</p>';
    var locs = Object.keys(r.byLoc);
    if (locs.length) h += '<div class="qsum-sec">By location <span>paid / unpaid</span></div><div class="qsum-loc">' + locs.map(function (k) { var L = S().LOCBY[k] || S().LOCBY.none, x = r.byLoc[k]; return '<div>' + pix(L[2], 14) + '<span>' + esc(L[1]) + ' (' + x.done + ')</span><b class="pdt">' + money(x.paidPF) + '</b><b class="udt">' + money(x.unpaidPF) + '</b></div>'; }).join('') + '</div>';
    var codes = Object.keys(r.byCode).map(function (k) { return r.byCode[k]; }).sort(function (a, b) { return (b.n - a.n) || (b.unpaidPF - a.unpaidPF) || (a.code < b.code ? -1 : 1); });
    if (codes.length) {
      var show = ui.sumAll ? codes : codes.slice(0, 6);
      h += '<div class="qsum-sec">By procedure <span>(tap to filter)</span></div><table class="qproc"><thead><tr><th>Procedure</th><th>Done</th><th class="is-paid">Paid</th><th class="is-unpd">Unpd</th><th>PF paid / unpaid</th></tr></thead><tbody>' +
        show.map(function (c) { var nm = (C().BY[c.rid] || { desc: c.desc }).desc || ''; return '<tr class="' + (ui.code === c.code ? 'on' : '') + '" data-qcode="' + esc(ui.code === c.code ? '' : c.code) + '" tabindex="0" role="button" aria-label="Filter to ' + esc(c.code) + '"><td><b>' + esc(c.code) + '</b><span>' + esc(nm.slice(0, 30)) + (nm.length > 30 ? '\u2026' : '') + '</span></td><td>' + c.done + (c.sched ? '<i>+' + c.sched + '</i>' : '') + '</td><td class="is-paid">' + c.paid + '</td><td class="is-unpd">' + c.unpaid + '</td><td><span class="pdt">' + money(c.paidPF) + '</span><span class="udt">' + money(c.unpaidPF) + '</span></td></tr>'; }).join('') + '</tbody></table>' +
        (codes.length > 6 ? '<button class="linkbtn" data-qsumall>' + (ui.sumAll ? 'Show top 6' : 'Show all ' + codes.length + ' procedures') + '</button>' : '');
    }
    return h + '</div></div>';
  }
  var undoFn = null;
  function showUndo(txt, fn) {
    var b = document.getElementById('undobar'); if (!b) { b = document.createElement('div'); b.id = 'undobar'; b.className = 'toast undo'; document.body.appendChild(b); }
    b.innerHTML = esc(txt) + ' <button class="rbtn sm" id="undoBtn">Undo</button>'; b.classList.add('show'); undoFn = fn;
    clearTimeout(showUndo._t); showUndo._t = setTimeout(function () { b.classList.remove('show'); undoFn = null; }, 5000);
  }
  function renderBoard() {
    var h = (window.PK_BACKUP_BANNER ? PK_BACKUP_BANNER() : '') + '<div class="win"><div class="tb"><span class="tb-t">Quest Board : OR Calendar</span><span class="tb-btns" aria-hidden="true"><i>_</i><i>x</i></span></div><div class="wbody">' + toolbar();
    h += ui.view === 'month' ? monthHTML() + dayHTML(ui.sel) : agendaHTML();
    h += '<p class="disc">' + esc(S().NAME_NOTICE) + ' Initials are shown until you tap \u201CShow names\u201D.</p></div></div>';
    box().innerHTML = h; bindSwipe();
    if (ui.slide) { var gg = document.querySelector('#qcal .qgrid'); if (gg) gg.classList.add(ui.slide > 0 ? 'm-inr' : 'm-inl'); ui.slide = 0; }
    if (ui.pop) { var pc = document.querySelector('.qd.sel'); if (pc) pc.classList.add('m-pop'); ui.pop = false; }
  }
  function bindSwipe() {   // live drag with momentum: follow the finger, fling past 50px or fast flick, else spring back
    var g = document.querySelector('#qcal .qgrid'); if (!g) return; var x0 = null, y0 = 0, t0 = 0, dx = 0, horiz = null, lastX = 0, lastT = 0, vx = 0;
    g.addEventListener('touchstart', function (e) { x0 = lastX = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = lastT = performance.now(); dx = 0; vx = 0; horiz = null; }, { passive: true });
    g.addEventListener('touchmove', function (e) {
      if (x0 == null) return; var x = e.touches[0].clientX, y = e.touches[0].clientY, now = performance.now();
      if (horiz == null && (Math.abs(x - x0) > 8 || Math.abs(y - y0) > 8)) horiz = Math.abs(x - x0) > Math.abs(y - y0) * 1.2;
      if (!horiz) return; dx = x - x0; if (now > lastT) vx = 0.6 * vx + 0.4 * (x - lastX) / (now - lastT); lastX = x; lastT = now;
      g.classList.add('m-drag'); g.style.transform = 'translate3d(' + dx + 'px,0,0)'; g.style.opacity = String(Math.max(0.4, 1 - Math.abs(dx) / 500));
    }, { passive: true });
    g.addEventListener('touchend', function () {
      if (x0 == null) return; x0 = null; g.classList.remove('m-drag');
      if (horiz && (Math.abs(dx) > 50 || Math.abs(vx) > 0.45)) {
        var k = (Math.abs(dx) > 50 ? dx : vx) < 0 ? 1 : -1;
        if (window.PK_FX && PK_FX.reduced()) { shift(k); return; }
        g.classList.add('m-out'); g.style.transform = 'translate3d(' + (k > 0 ? -60 : 60) + '%,0,0)'; g.style.opacity = '0'; setTimeout(function () { shift(k); }, 150);
      } else if (horiz) { g.classList.add('m-snap'); g.style.transform = ''; g.style.opacity = ''; setTimeout(function () { g.classList.remove('m-snap'); }, 300); }
    }, { passive: true });
  }
  function shift(k) { var y = ui.ym[0], m = ui.ym[1] + k; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } ui.ym = [y, m]; var dd = Math.min(+ui.sel.slice(8), dim(y, m)); ui.sel = y + '-' + S().pad(m + 1) + '-' + S().pad(dd); ui.slide = k; renderBoard(); }

  // ---------- search / filter ----------
  function presetRange(p) {
    var t = S().today(), d = parse(t);
    if (p === 'week') { var w = addDays(t, -d.getDay()); return [w, addDays(w, 6)]; }
    if (p === 'month') return [t.slice(0, 8) + '01', t.slice(0, 8) + S().pad(dim(d.getFullYear(), d.getMonth()))];
    if (p === 'year') return [t.slice(0, 4) + '-01-01', t.slice(0, 4) + '-12-31'];
    if (p === 'custom') return [ui.find.from || addDays(t, -30), ui.find.to || t];
    return [null, null];
  }
  function renderFind() {
    var f = ui.find, rg = presetRange(f.preset), res = S().filter(flt({ q: f.q, from: rg[0], to: rg[1], loc: f.loc, fac: f.fac, as: f.as, status: f.status }));
    var seg = function (key, opts) { return '<div class="seg">' + opts.map(function (o) { return '<button class="segb' + (f[key] === o[0] ? ' on' : '') + '" data-qf="' + key + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; };
    var h = '<div class="win"><div class="tb"><span class="tb-t">Quest Log : Search</span><span class="tb-btns"><a class="tbx" href="#/quest" aria-label="Back to calendar">x</a></span></div><div class="wbody">';
    h += '<div class="searchrow"><input id="qf_q" type="search" placeholder="Initials, code, procedure, facility, note" value="' + esc(f.q) + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search procedures"></div>';
    h += '<div class="qf-row"><span class="lbl">When</span><div class="chips">' + [['all', 'All time'], ['week', 'This week'], ['month', 'This month'], ['year', 'This year'], ['custom', 'Custom']].map(function (o) { return '<button class="chipbtn' + (f.preset === o[0] ? ' on' : '') + '" data-qf="preset" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    if (f.preset === 'custom') h += '<div class="qf-row"><span class="lbl">From</span>' + dateSel('qf_from', rg[0], 'From') + '</div><div class="qf-row"><span class="lbl">To</span>' + dateSel('qf_to', rg[1], 'To') + '</div>';
    var usedT = {}; S().all().forEach(function (e) { usedT[e.loc] = 1; });
    h += '<div class="qf-row"><span class="lbl">Location</span><div class="chips">' + [['all', 'All']].concat(S().types().filter(function (t) { return !t.hidden || usedT[t.id]; }).map(function (t) { return [t.id, t.name]; })).map(function (o) { return '<button class="chipbtn' + (f.loc === o[0] ? ' on' : '') + '" data-qf="loc" data-v="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></div>';
    var facs = S().facilities();
    h += '<div class="qf-row"><span class="lbl">Facility</span><select id="qf_fac" class="qsel"><option value="">All facilities</option>' + facs.map(function (x) { return '<option' + (x === f.fac ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></div>';
    h += '<div class="qf-row"><span class="lbl">Case rate</span>' + seg('as', [['all', 'All'], ['1', '1st'], ['2', '2nd']]) + '</div>';
    h += filterBar(true);
    h += '<div class="qf-row"><span class="lbl">Status</span>' + seg('status', [['all', 'All'], ['done', 'Done'], ['sched', 'Scheduled']]) + '</div>';
    h += '<div class="qf-sum" id="qf_sum"><b>' + res.length + '</b> result' + (res.length === 1 ? '' : 's') + ' \u00B7 PF total <b>' + money(S().sum(res)) + '</b>' + (res.some(function (e) { return e.status === 'sched'; }) ? '<span> (includes scheduled)</span>' : '') + (function () { var r = S().paySummary(res); return '<br><span class="pdt">Paid ' + r.paid + ' \u00B7 ' + money(r.paidPF) + '</span> <span class="udt">Unpaid ' + r.unpaid + ' \u00B7 ' + money(r.unpaidPF) + '</span> <button class="linkbtn" data-qsumfind>Summary \u203A</button>'; })() + '</div>';
    h += res.length ? grouped(res) : '<p class="hint">No matching procedures.</p>';
    h += '</div></div>';
    var hadFocus = document.activeElement && document.activeElement.id === 'qf_q', pos = hadFocus ? document.activeElement.selectionStart : 0;
    box().innerHTML = h; if (window.PK_QHL && f.q) PK_QHL(box(), f.q);
    if (hadFocus) { var i = document.getElementById('qf_q'); i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) {} }
  }
  // highlight search tokens inside result rows (descriptions, codes, facility, initials)
  window.PK_QHL = function (root, q) {
    C().setHL(q); Array.prototype.forEach.call(root.querySelectorAll('.qe-d,.qe-w'), function (el) {
      Array.prototype.forEach.call(el.childNodes, function (n) { if (n.nodeType === 3 && n.textContent.trim()) { var s = document.createElement('span'); s.innerHTML = C().hl(n.textContent); el.replaceChild(s, n); } }); });
    var tk = q.toUpperCase().replace(/[^A-Z ]/g, '').trim().split(/\s+/);
    Array.prototype.forEach.call(root.querySelectorAll('.ini:not(.none)'), function (el) { var raw = el.textContent.replace(/\./g, ''); if (tk.some(function (t) { return t && raw.indexOf(t) >= 0; })) el.classList.add('hit'); });
    C().setHL('');
  };

  // ---------- form ----------
  function newForm(date, rid, past) { var t = S().today(), r0 = S().defaultPlace() || S().quickPicks()[0]; date = date || ui.sel || t; return { id: null, date: date, pt: '', name: '', rid: rid || null, as: '1', pf: rid ? autoPF(C().BY[rid], '1') : null, pfEdited: false, status: date > t ? 'sched' : 'done', statusTouched: false, pay: 'unpaid', paidDate: '', loc: (r0 && r0.loc) || 'hospital', fac: (r0 && r0.fac) || '', note: '', anes: false, anesName: '', past: !!past }; }
  function formFromEntry(e) { return { id: e.id, date: e.date, pay: e.pay, paidDate: e.paidDate, pt: e.pt, name: e.name || '', rid: e.rid, as: e.as, pf: e.pf_c, pfEdited: !e.pf_auto, status: e.status, statusTouched: true, loc: e.loc, fac: e.fac, note: e.note, anes: !!e.anes, anesName: e.anesName || '', past: false, code: e.code, desc: e.desc, kind: e.kind }; }
  function renderForm() {
    var f = ui.form, c = C(), r = f.rid ? c.BY[f.rid] : null, blk = r ? blockReason(r) : null, t = S().today(), ap = r ? autoPF(r, f.as) : null;
    var h = '<div class="win"><div class="tb"><span class="tb-t">' + (f.id ? 'Edit Quest' : 'New Quest') + '</span><span class="tb-btns"><button class="tbx" data-qform="cancel" aria-label="Close">x</button></span></div><div class="wbody pform qform">';
    if (f.past || f.date < t) h += '<div class="q-past">' + pix('qmap', 16) + ' <b>Backtracking:</b> adding a past procedure (' + esc(longDate(f.date)) + ').</div>';
    h += '<div class="pfrow"><span class="lbl">Date</span>' + dateSel('qd', f.date) + '</div>';
    h += '<div class="pfrow q-quick"><span class="lbl"></span><button class="chipbtn" data-qdate="' + t + '">Today</button><button class="chipbtn" data-qdate="' + addDays(t, -1) + '">Yesterday</button><button class="chipbtn" data-qdate="' + addDays(t, -7) + '">1 week ago</button></div>';
    h += '<div class="pfrow"><span class="lbl">Status</span><div class="seg"><button class="segb' + (f.status === 'done' ? ' on' : '') + '" data-qst="done">Done</button><button class="segb' + (f.status === 'sched' ? ' on' : '') + '" data-qst="sched">Scheduled</button></div></div>';
    h += '<div class="pfrow"><span class="lbl">Payment</span><div class="seg"><button class="segb' + (f.pay !== 'paid' ? ' on' : '') + '" data-qfpay="unpaid">Unpaid</button><button class="segb' + (f.pay === 'paid' ? ' on' : '') + '" data-qfpay="paid">\u2713 Paid</button></div></div>';
    if (f.pay === 'paid') h += '<div class="pfrow"><span class="lbl">Paid on</span>' + dateSel('qpd', f.paidDate || t, 'Paid date') + '</div>' + (f.status === 'sched' ? '<div class="warnbox">This procedure is still <b>scheduled</b>. Mark it paid only if the PF was received in advance.</div>' : '');
    var ini0 = f.name ? S().iniFrom(f.name) : f.pt;
    h += '<div class="pfrow col q-namerow"><label for="q_name">Patient name</label><input id="q_name" class="q-name" type="text" inputmode="text" autocapitalize="words" autocomplete="off" spellcheck="false" maxlength="100" placeholder="e.g. Juan dela Cruz" value="' + esc(f.name || '') + '">' +
      '<span class="hint q-ini-h">' + (ini0 ? 'Shown as <b>' + esc(S().iniShow(ini0)) + '</b> on widgets, the mascot, notifications and the calendar' : 'Full name, editable any time. Initials are made from it for compact views.') + '</span>' +
      (!f.name && f.pt ? '<span class="hint">Older entry: initials only (' + esc(S().iniShow(f.pt)) + '). Type the full name to replace them.</span>' : '') +
      '<p class="q-privacy">\u{1F512} ' + esc(S().NAME_NOTICE) + '</p></div>';
    if (r || f.code) h += '<div class="lp-sel">' + (r ? c.ico(r, 22) : '') + '<div class="lp-m"><div class="lp-code">' + c.kindTag(r || { kind: f.kind }) + esc(r ? r.code : f.code) + '</div><div class="lp-d">' + esc(r ? r.desc : f.desc) + '</div></div><button class="rbtn sm" data-qform="unpick">Change</button></div>';
    else h += '<div class="pfrow col"><span class="lbl">Procedure / diagnosis</span><div class="picker"><div class="pkrow"><input id="q_code" class="pk" type="search" placeholder="Code or any part of the name (e.g. nas)" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search code"></div><ul class="dd" id="q_dd"></ul></div></div>';
    if (blk) h += '<div class="warnbox">' + esc(blk) + '</div>';
    var ok2 = r && c.canBeSecond(r);
    h += '<div class="pfrow"><span class="lbl">Claimed as</span><div class="seg"><button class="segb' + (f.as === '1' ? ' on' : '') + '" data-qas="1">1st case rate</button><button class="segb' + (f.as === '2' ? ' on' : '') + '" data-qas="2"' + (ok2 ? '' : ' disabled title="Not in Annex D"') + '>2nd case rate</button></div></div>';
    h += '<div class="pfrow"><label for="q_pf">PF (\u20B1)</label><input id="q_pf" type="text" inputmode="decimal" value="' + (f.pf != null ? (f.pf / 100).toFixed(2) : '') + '" placeholder="auto from code">' +
      (ap != null ? '<span class="hint">' + (f.pfEdited && f.pf !== ap ? 'Edited \u00B7 <button class="linkbtn" data-qform="pfreset">reset to ' + money(ap) + '</button>' : 'Auto from code') + '</span>' : '') + '</div>';
    h += '<div class="pfrow anesrow"><span class="lbl">Anesthesiologist</span><button class="anes-sw' + (f.anes ? ' on' : '') + '" role="switch" aria-checked="' + !!f.anes + '" data-qanes><i></i><span>With anesthesiologist</span></button></div>';
    if (f.anes) h += '<div class="pfrow"><label for="q_anesn">Anesthesiologist name</label><input id="q_anesn" type="text" maxlength="60" autocomplete="off" placeholder="optional, e.g. Dr. Reyes" value="' + esc(f.anesName || '') + '"></div>';
    h += '<div id="anesSplit" class="anes-split' + (f.anes ? '' : ' off') + '" aria-live="polite">' + splitHTML(f) + '</div>';
    h += '<div class="pfrow"><span class="lbl">Location<button class="linkbtn editpl" data-editplaces>Edit places</button></span><div class="locseg" role="radiogroup">' + S().LOCS.map(function (l) { return '<button class="locopt' + (f.loc === l[0] ? ' on' : '') + '" role="radio" aria-checked="' + (f.loc === l[0]) + '" data-qloc="' + l[0] + '">' + pix(l[2], 24) + '<span>' + l[1] + '</span></button>'; }).join('') + '</div></div>';
    var rec = S().quickPicks(); if (f.loc !== 'none' && !S().LOCS.some(function (l) { return l[0] === f.loc; })) h = h.replace('<div class="locseg" role="radiogroup">', '<div class="locseg" role="radiogroup"><span class="hint">Current: ' + esc(S().LOCBY[f.loc][1]) + '</span>');
    h += '<div class="pfrow"><label for="q_fac">Facility</label><input id="q_fac" type="text" list="q_facs" maxlength="80" placeholder="e.g. St. Luke\u2019s Medical Center" value="' + esc(f.fac) + '"><datalist id="q_facs">' + S().facilities().map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>';
    if (rec.length) h += '<div class="lp-recent"><span class="lbl">Quick picks</span>' + rec.map(function (x, i) { var L = S().LOCBY[x.loc] || S().LOCBY.none; return '<button class="chipbtn' + (x.fac === f.fac ? ' on' : '') + '" data-qrec="' + i + '">' + (x.fav ? '\u2605 ' : '') + pix(L[2], 12) + esc(x.fac) + '</button>'; }).join('') + '</div>';
    h += '<div class="pfrow"><label for="q_note">Note</label><input id="q_note" type="text" maxlength="120" placeholder="optional (no identifiers)" value="' + esc(f.note) + '"></div>';
    var can = (r && !blk) || (f.id && f.code);
    h += '<div class="btnrow left"><button class="rbtn" data-qform="save"' + (can ? '' : ' disabled') + '>' + (f.id ? 'Save changes' : 'Save quest') + '</button><button class="rbtn" data-qform="cancel">Cancel</button>' +
      (f.id ? '<button class="rbtn danger" data-qform="del">' + (ui.armDel > Date.now() ? 'Tap again to delete' : 'Delete') + '</button>' : '') + '</div></div></div>';
    box().innerHTML = h;
    if (!r && !f.code) ddRender('');
  }
  function splitHTML(f) {
    var pf = f.pf != null ? f.pf : 0;
    if (!f.anes) return '<span class="hint">Toggle on if an anesthesiologist shares this case: you keep 70% of the PF, the anesthesiologist gets 30%.</span>';
    var me = Math.round(pf * 0.7), an = pf - me;
    return '<div class="as-bar" aria-hidden="true"><i style="width:70%"></i></div><div class="as-row"><div class="as-me"><span>Your PF \u00B7 70%</span><b>' + money(me) + '</b></div><div class="as-an"><span>Anesthesiologist \u00B7 30%</span><b>' + money(an) + '</b></div></div><div class="as-base">of PF ' + money(pf) + (f.as === '2' ? ' (2nd case rate PF)' : '') + '</div>';
  }
  function ddRender(q) {
    var c = C(), el = document.getElementById('q_dd'); if (!el) return;
    var res = c.rankSearch(q || '', c.RECS.filter(function (r) { return !blockReason(r); }));
    if (!res) { el.innerHTML = '<li class="ddh">Type any part of a code or description \u2014 "nas" finds nasal, paranasal, nasopharynx\u2026</li>'; return; }
    c.setHL(q);
    el.innerHTML = res.slice(0, 20).map(function (r) { return '<li class="ddr" data-qpick="' + esc(r.id) + '">' + c.ico(r, 18) + '<div class="ddm"><div class="ddc">' + c.kindTag(r) + '<b>' + c.hl(r.code) + '</b></div><div class="ddd">' + c.hl(r.desc) + '</div></div><div class="dda"><span class="r">PF ' + c.z(r.pf) + '</span></div></li>'; }).join('') +
      (res.length > 20 ? '<li class="ddh">' + (res.length - 20) + ' more \u2014 type more to narrow.</li>' : res.length ? '' : '<li class="ddh">No loggable matches.</li>');
    c.setHL('');
  }
  function readForm() {
    var f = ui.form; if (!f) return; var d = readSel('qd'); if (d) { if (d !== f.date && !f.statusTouched) f.status = d > S().today() ? 'sched' : 'done'; f.date = d; }
    var pdd = readSel('qpd'); if (pdd) f.paidDate = pdd;
    var g = function (id) { var e = document.getElementById(id); return e ? e.value : null; };
    var nm = g('q_name'); if (nm != null) { f.name = S().nameClean(nm); if (f.name) f.pt = S().iniFrom(f.name); } var fac = g('q_fac'); if (fac != null) f.fac = fac; var note = g('q_note'); if (note != null) f.note = note; var an = g('q_anesn'); if (an != null) f.anesName = an;
    var pf = g('q_pf'); if (pf != null) { var v = Math.round(parseFloat(String(pf).replace(/[^0-9.]/g, '')) * 100); if (isFinite(v)) { var ap = f.rid ? autoPF(C().BY[f.rid], f.as) : null; if (v !== f.pf) { f.pfEdited = ap == null || v !== ap; f.pf = v; } } }
  }
  function saveForm() {
    readForm(); var f = ui.form, r = f.rid ? C().BY[f.rid] : null, st = S();
    var rec = { date: f.date, name: f.name || '', pt: f.pt, status: f.status, pay: f.pay, paidDate: f.pay === 'paid' ? (f.paidDate || S().today()) : '', as: f.as, loc: f.loc, fac: f.fac.trim(), note: f.note, anes: !!f.anes, anesName: f.anes ? (f.anesName || '').trim() : '', pf_c: f.pf != null ? f.pf : autoPF(r, f.as), pf_auto: !f.pfEdited };
    if (r) { rec.rid = r.id; rec.code = r.code; rec.kind = r.kind; rec.desc = r.desc.slice(0, 160); }
    var out = f.id ? st.update(f.id, rec) : st.add(rec); if (!out) { C().toast('Could not save'); return; }
    ui.form = null; ui.sel = out.date; ui.ym = [+out.date.slice(0, 4), +out.date.slice(5, 7) - 1];
    C().toast((f.id ? 'Updated ' : 'Quest logged: ') + out.code + (out.pt ? ' \u00B7 ' + st.iniShow(out.pt) : ''));
    if (window.PK_CREW) PK_CREW.react(out.status === 'sched' ? 'Quest scheduled!' : 'Quest complete!');
    // first time a full name is saved and no PIN is set: suggest turning the PIN on (once)
    if (out.name && !(window.PK_LOCK && PK_LOCK.on()) && !st.prefs().pinNudged) { st.setPref('pinNudged', 1); setTimeout(function () { pinNudge(); }, 400); }
    if (window.PK_FX) PK_FX.saved(out);
    location.hash = '#/quest/day/' + out.date;
  }
  function undoBar(e) {
    var b = document.getElementById('undobar'); if (!b) { b = document.createElement('div'); b.id = 'undobar'; b.className = 'toast undo'; document.body.appendChild(b); }
    b.innerHTML = 'Deleted ' + esc(e.code) + (e.pt ? ' \u00B7 ' + esc(S().iniShow(e.pt)) : '') + ' <button class="rbtn sm" id="undoBtn">Undo</button>'; b.classList.add('show');
    clearTimeout(undoBar._t); undoBar._t = setTimeout(function () { b.classList.remove('show'); }, 6000);
  }

  // ---------- routing ----------
  function route(h) {
    if (!C()) return;
    var t = S().today(); if (!ui.sel) { ui.sel = t; ui.ym = [+t.slice(0, 4), +t.slice(5, 7) - 1]; }
    var m;
    if ((m = h.match(/^#\/quest\/day\/(\d{4}-\d{2}-\d{2})/))) { ui.sel = m[1]; ui.ym = [+m[1].slice(0, 4), +m[1].slice(5, 7) - 1]; ui.view = 'month'; ui.form = null; renderBoard(); }
    else if (h === '#/quest/find') { ui.form = null; renderFind(); }
    else if ((m = h.match(/^#\/quest\/new(?:\/(\d{4}-\d{2}-\d{2}))?(\?past=1)?/))) { if (!ui.form || ui.form.id || !ui.form._keep) { ui.form = newForm(m[1], window.PK_PENDING_RID || null, !!m[2]); window.PK_PENDING_RID = null; } ui.form._keep = false; renderForm(); }
    else if ((m = h.match(/^#\/quest\/edit\/(.+)$/))) { var e = S().find(decodeURIComponent(m[1])); if (!e) { location.hash = '#/quest'; return; } if (ui.form && ui.form._keep && ui.form.id === e.id) { ui.form._keep = false; renderForm(); return; } ui.form = formFromEntry(e); ui.armDel = 0; renderForm(); }
    else { ui.form = null; renderBoard(); }
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target : null; if (!t) return; var b;
    if ((b = t.closest('#undoBtn'))) { var f0 = undoFn; undoFn = null; document.getElementById('undobar').classList.remove('show'); if (f0 && f0()) { C().toast('Restored'); rerender(); } return; }
    if ((b = t.closest('[data-qpay]'))) { ev.stopPropagation(); var e0 = S().find(b.dataset.qpay); if (!e0) return; var toPaid = e0.pay !== 'paid', res0 = S().setPaid(e0.id, toPaid);
      rerender(); showUndo((toPaid ? 'Marked PAID' : 'Marked UNPAID') + ' \u00B7 ' + e0.code + (e0.pt ? ' ' + S().iniShow(e0.pt) : '') + (toPaid && e0.status === 'sched' ? ' (still scheduled!)' : ''), function () { return !!S().update(e0.id, res0.prev); }); return; }
    if ((b = t.closest('[data-qpayf]'))) { var v = b.dataset.qpayf; ui.pay = ui.pay === v ? 'all' : v; rerender(); return; }
    if ((b = t.closest('[data-qcode]')) && t.closest('#quest')) { ui.code = b.dataset.qcode; rerender(); return; }
    if ((b = t.closest('[data-qclear]'))) { ui.pay = 'all'; ui.code = ''; rerender(); return; }
    if ((b = t.closest('[data-qsum]'))) { ui.sumOpen = !ui.sumOpen; try { localStorage.setItem('pk_qsum_open', ui.sumOpen ? '1' : '0'); } catch (x) {} renderBoard(); return; }
    if ((b = t.closest('[data-qscope]'))) { ui.sumScope = b.dataset.qscope; renderBoard(); return; }
    if ((b = t.closest('[data-qsumall]'))) { ui.sumAll = !ui.sumAll; renderBoard(); return; }
    if ((b = t.closest('[data-qsumfind]'))) { ui.sumScope = 'filter'; ui.sumOpen = true; location.hash = '#/quest'; return; }

    if ((b = t.closest('[data-logadd]'))) { window.PK_PENDING_RID = b.dataset.logadd; location.hash = '#/quest/new/' + S().today(); ev.preventDefault(); return; }
    if ((b = t.closest('[data-qedit]'))) { location.hash = '#/quest/edit/' + encodeURIComponent(b.dataset.qedit); return; }
    if (!t.closest('#quest')) return;
    if ((b = t.closest('[data-qday]'))) { if (b.classList.contains('qgh')) { location.hash = '#/quest/day/' + b.dataset.qday; return; } ui.sel = b.dataset.qday; ui.pop = true; renderBoard(); return; }
    if ((b = t.closest('[data-q]'))) { var a = b.dataset.q; if (a === 'prev') shift(-1); else if (a === 'next') shift(1); else if (a === 'today') { var td = S().today(); ui.sel = td; ui.ym = [+td.slice(0, 4), +td.slice(5, 7) - 1]; renderBoard(); } return; }
    if ((b = t.closest('[data-qv]'))) { ui.view = b.dataset.qv; renderBoard(); return; }
    if ((b = t.closest('[data-qf]'))) { var k = b.dataset.qf; if (k === 'preset' && b.dataset.v === 'custom') { var rg = presetRange(ui.find.preset === 'custom' ? 'custom' : ui.find.preset); ui.find.from = rg[0] || addDays(S().today(), -30); ui.find.to = rg[1] || S().today(); } ui.find[k] = b.dataset.v; renderFind(); return; }
    if (!ui.form) return;
    if ((b = t.closest('[data-qform]'))) { var act = b.dataset.qform;
      if (act === 'save') return saveForm();
      if (act === 'cancel') { var back = ui.form.date; ui.form = null; location.hash = '#/quest/day/' + back; return; }
      if (act === 'unpick') { readForm(); ui.form.rid = null; ui.form.code = null; renderForm(); return; }
      if (act === 'pfreset') { readForm(); ui.form.pf = autoPF(C().BY[ui.form.rid], ui.form.as); ui.form.pfEdited = false; renderForm(); return; }
      if (act === 'del') { readForm(); if (ui.armDel > Date.now()) { var e = S().find(ui.form.id), d0 = ui.form.date; S().del(ui.form.id); ui.form = null; showUndo('Deleted ' + e.code + (e.pt ? ' \u00B7 ' + S().iniShow(e.pt) : ''), function () { return S().undo(); }); location.hash = '#/quest/day/' + d0; } else { ui.armDel = Date.now() + 3000; renderForm(); setTimeout(function () { if (ui.form && ui.armDel && ui.armDel <= Date.now()) renderForm(); }, 3100); } return; }
      return; }
    if ((b = t.closest('[data-qpick]'))) { readForm(); ui.form.rid = b.dataset.qpick; ui.form.as = '1'; ui.form.pf = autoPF(C().BY[ui.form.rid], '1'); ui.form.pfEdited = false; renderForm(); return; }
    if ((b = t.closest('[data-qas]'))) { readForm(); ui.form.as = b.dataset.qas; if (!ui.form.pfEdited && ui.form.rid) ui.form.pf = autoPF(C().BY[ui.form.rid], ui.form.as); renderForm(); return; }
    if ((b = t.closest('[data-qfpay]'))) { readForm(); ui.form.pay = b.dataset.qfpay; if (ui.form.pay === 'paid' && !ui.form.paidDate) ui.form.paidDate = S().today(); renderForm(); return; }
    if ((b = t.closest('[data-qanes]'))) { readForm(); ui.form.anes = !ui.form.anes; renderForm(); var sw = document.querySelector('[data-qanes]'); if (sw) sw.focus({ preventScroll: true }); return; }
    if ((b = t.closest('[data-qst]'))) { readForm(); ui.form.status = b.dataset.qst; ui.form.statusTouched = true; renderForm(); return; }
    if ((b = t.closest('[data-qloc]'))) { readForm(); ui.form.loc = b.dataset.qloc; renderForm(); return; }
    if ((b = t.closest('[data-qrec]'))) { readForm(); var x = S().quickPicks()[+b.dataset.qrec]; ui.form.loc = x.loc; ui.form.fac = x.fac; renderForm(); return; }
    if ((b = t.closest('[data-qdate]'))) { readForm(); ui.form.date = b.dataset.qdate; if (!ui.form.statusTouched) ui.form.status = ui.form.date > S().today() ? 'sched' : 'done'; renderForm(); return; }
  });
  document.addEventListener('change', function (ev) {
    var id = ev.target.id || '';
    if (/^(qd|qpd)_[mdy]$/.test(id) && ui.form) { readForm(); renderForm(); return; }
    if (/^qf_(from|to)_[mdy]$/.test(id)) { ui.find.from = readSel('qf_from'); ui.find.to = readSel('qf_to'); renderFind(); return; }
    if (id === 'qf_fac') { ui.find.fac = ev.target.value; renderFind(); }
  });
  function pinNudge() {
    var b = document.getElementById('pinNudge'); if (!b) { b = document.createElement('div'); b.id = 'pinNudge'; b.className = 'toast undo pin-nudge'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.innerHTML = '\u{1F512} You\u2019re now saving patient names. Turn on the PIN lock so only you can open Quest and Log Pose. <a class="rbtn sm" href="#/about" data-pinnudge>Set PIN</a> <button class="rbtn sm back" data-pinnudge>Later</button>';
    b.classList.add('show'); clearTimeout(pinNudge._t); pinNudge._t = setTimeout(function () { b.classList.remove('show'); }, 9000);
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-qeye],[data-pinnudge]'); if (!t) return;
    if (t.hasAttribute('data-qeye')) { S().setReveal(!S().reveal()); if (ui.form == null && box()) renderBoard(); return; }
    var nb = document.getElementById('pinNudge'); if (nb) nb.classList.remove('show');
  });
  window.PK_QUEST_NUDGE = pinNudge;
  var deb; document.addEventListener('input', function (ev) {
    var id = ev.target.id;
    if (id === 'q_code') { clearTimeout(deb); var v = ev.target.value; deb = setTimeout(function () { ddRender(v); }, 90); }
    if (id === 'q_name') { var s0 = S().iniFrom(ev.target.value), hp = document.querySelector('.q-ini-h'); if (hp) hp.innerHTML = s0 ? 'Shown as <b>' + esc(S().iniShow(s0)) + '</b> on widgets, the mascot, notifications and the calendar' : 'Full name, editable any time. Initials are made from it for compact views.'; }
    if (id === 'q_pf' && ui.form) { var v1 = Math.round(parseFloat(String(ev.target.value).replace(/[^0-9.]/g, '')) * 100); var sp = document.getElementById('anesSplit'); if (sp && isFinite(v1)) sp.innerHTML = splitHTML({ anes: ui.form.anes, pf: v1, as: ui.form.as }); }
    if (id === 'qf_q') { clearTimeout(deb); var q = ev.target.value; deb = setTimeout(function () { ui.find.q = q; renderFind(); }, 140); }
  });
  function rerender() { var h = location.hash || ''; if (h.indexOf('#/quest') === 0) route(h); }
  function goToday() {
    var t = S().today(); ui.sel = t; ui.ym = [+t.slice(0, 4), +t.slice(5, 7) - 1]; ui.view = 'month'; ui.form = null;
    if (location.hash === '#/quest') { renderBoard(); } else location.hash = '#/quest';
    setTimeout(function () { var d = document.querySelector('.qd.today'); if (d) { d.focus({ preventScroll: true }); var r = document.getElementById('qcal').getBoundingClientRect(); if (r.top < 0 || r.bottom > window.innerHeight) window.scrollTo({ top: window.scrollY + r.top - 60, behavior: 'auto' }); } }, 60);
  }
  window.PK_QUEST = { route: route, goToday: goToday, _keepForm: function () { if (ui.form) { readForm(); ui.form._keep = true; } }, _ui: ui, _readForm: readForm, _save: saveForm };
})();
