/* PHILHEALTH KING "Log Pose": merged procedure tab — New procedure, calendar, details list.
   Same PK_STORE as before. Done procedures count toward PF logged; scheduled ones are listed too.
   Entries show patient initials; tap to see details, then edit. CSV / JSON backup / import. */
(function () {
  var ui = { filter: 'all', q: '', day: null, span: 'all', more: false };
  function S() { return window.PK_STORE; } function C() { return window.EENT_CORE; }
  function money(c) { return C().z(c / 100); } function esc(s) { return C().esc(s); }
  function download(name, txt, type) { var AB = window.AndroidBridge; if (AB && AB.saveFile) { try { AB.saveFile(name, type, txt); return; } catch (e) {} } return webDownload(name, txt, type); }
  function doImport(text) { var r; try { r = S().importAny(JSON.parse(text)); } catch (x) { r = { error: 'Not a valid JSON file' }; } C().toast(r.error || ('Imported ' + r.added + ' new, ' + r.updated + ' updated' + (r.skipped ? ', ' + r.skipped + ' skipped' : ''))); if (window.EENT_CORE && r && !r.error) { var o; try { o = JSON.parse(text); } catch (x) {} if (o && Array.isArray(o.favorites)) EENT_CORE.favMerge(o.favorites); } rerenderAll(); return r; }
  function rerenderAll() { var h = location.hash || ''; if (h === '#/log' || h === '#/log/' || /^#\/log\/(day|item)\//.test(h)) { if (window.PK_LOG) PK_LOG.route(h); } else if (h.indexOf('#/log') === 0 && window.PK_QUEST) PK_QUEST.route(h); else if (h.indexOf('#/quest') === 0 && window.PK_QUEST) PK_QUEST.route(h); }
  window.EENT_IMPORT = doImport;   // Android bridge calls this after the system file picker
  function csvPtHTML(nm) { var v = S().prefs().csvPt || 'ini'; return '<div class="pfrow"><span class="lbl">CSV patient column</span><div class="seg" role="radiogroup">' +
    [['ini', 'Initials only'], ['full', 'Full names'], ['none', 'None']].map(function (o) { return '<button class="segb' + (v === o[0] ? ' on' : '') + '" role="radio" aria-checked="' + (v === o[0]) + '" data-csvpt="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>'; }
  window.PK_CSVPT = csvPtHTML;
  document.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('[data-csvpt]'); if (!b) return; S().setPref('csvPt', b.dataset.csvpt); S().setPref('csvIni', b.dataset.csvpt !== 'none');
    b.parentNode.querySelectorAll('[data-csvpt]').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); }); });
  function backupNow() { download('philhealth-king-backup-' + S().today() + '.json', JSON.stringify(S().backup(), null, 1), 'application/json'); S().markBackup(); C().toast('Backup saved (contains initials)'); rerenderAll(); }
  window.PK_BACKUP_BANNER = function () {
    var st = S().backupStatus(); if (!st.due) return '';
    return '<div class="bkrem" role="status">' + pix('chest', 18) + '<span>Back up your log? ' + st.newCount + ' new/changed entr' + (st.newCount === 1 ? 'y' : 'ies') + (st.last ? ' since your last backup ' + st.days + ' days ago.' : ' not backed up yet.') + '</span><button class="rbtn sm" data-bk="now">Backup now</button><button class="linkbtn" data-bk="later">Later</button></div>';
  };
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-bk]'); if (!b) return; if (b.dataset.bk === 'now') backupNow(); else { S().snoozeBackup(); C().toast('Reminder snoozed for 2 weeks'); rerenderAll(); } });
  function webDownload(name, txt, type) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  function setDay(d) {
    ui.day = d || null;
    if (ui.day) ui.span = 'day';
    var Q = window.PK_QUEST && PK_QUEST._ui;
    if (Q) {
      Q.sel = ui.day || '';
      if (ui.day) Q.ym = [+ui.day.slice(0, 4), +ui.day.slice(5, 7) - 1];
    }
  }
  function ensureCal() {
    var t = S().today(), Q = window.PK_QUEST && PK_QUEST._ui;
    if (Q && !Q.ym) Q.ym = [+t.slice(0, 4), +t.slice(5, 7) - 1];
    if (Q) Q.sel = ui.day || '';
  }
  function monthRange() {
    ensureCal();
    var Q = PK_QUEST._ui, y = Q.ym[0], m = Q.ym[1], last = new Date(y, m + 1, 0).getDate();
    var pad = S().pad;
    return { y: y, m: m, from: y + '-' + pad(m + 1) + '-01', to: y + '-' + pad(m + 1) + '-' + pad(last), title: new Date(y, m, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) };
  }
  function longDate(d) {
    var p = d.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  function eyeBtn() {
    var on = S().reveal();
    return '<button class="rbtn sm q-eye' + (on ? ' on' : '') + '" data-qeye aria-pressed="' + on + '" title="' + (on ? 'Hide full names (show initials)' : 'Show full names') + '">' + (on ? '\u{1F441} Hide names' : '\u{1F441} Show names') + '</button>';
  }
  function rowHTML(e) {
    var c = C(), r = c.BY[e.rid], L = S().LOCBY[e.loc], ini = S().ptLabel(e, S().reveal());
    return '<li class="lp-e' + (e.status === 'sched' ? ' sched' : '') + '" data-qedit="' + esc(e.id) + '"><div class="lp-ico">' + (r ? c.ico(r, 22) : '') + '</div><div class="lp-m"><div class="lp-code">' + c.kindTag(r || { kind: e.kind }) + '<span class="lp-rvs">' + esc(e.code) + '</span>' + (e.as === '2' ? ' <span class="bl ok2">2nd</span>' : '') + '<span class="ini sm' + (ini ? '' : ' none') + '">' + (ini ? esc(ini) : 'No name') + '</span></div><div class="lp-d">' + esc(e.desc) + '</div>' +
      '<div class="lp-w"><span class="locb ' + e.loc + '">' + pix(L[2], 12) + L[1] + '</span><span class="lp-meta">' + esc(e.fac || '\u2014') + ' \u00B7 ' + esc(e.date) + (e.status === 'sched' ? ' \u00B7 Scheduled' : '') + '</span></div></div><div class="lp-pf">' + money(S().myPF(e)) + (e.anes ? '<span class="lp-an">\u2695 Anes ' + money(S().anesPF(e)) + '</span>' : '') + '<span class="' + (e.pay === 'paid' ? 'pdt' : 'udt') + '">' + (e.pay === 'paid' ? '\u2713 Paid' : 'Unpaid') + '</span></div></li>';
  }

  function render() {
    var c = C(), box = document.getElementById('logBody'); if (!c || !box) return;
    ensureCal();
    var mr = monthRange();
    var newDate = ui.day || S().today();
    var opts = {};
    if (ui.day) { opts.from = ui.day; opts.to = ui.day; }
    else if (ui.span === 'month') { opts.from = mr.from; opts.to = mr.to; }
    if (ui.q) opts.q = ui.q;
    var scoped = S().filter(opts);
    var usedT = {}; S().all().forEach(function (e) { usedT[e.loc] = 1; });
    var TL = S().types().filter(function (t) { return !t.hidden || usedT[t.id]; }).map(function (t) { return [t.id, t.name, t.icon]; });
    if (usedT.none) TL.push(S().LOCBY.none);
    var shown = ui.filter === 'all' ? scoped : scoped.filter(function (e) { return e.loc === ui.filter; });
    var done = shown.filter(function (e) { return e.status === 'done'; });
    var sched = shown.filter(function (e) { return e.status === 'sched'; });
    var totDone = S().sum(done), pay = S().paySummary(shown), pct = pay.donePF ? Math.round(pay.paidPF / pay.donePF * 100) : 0;
    var chipSrc = ui.filter === 'all' ? scoped : S().filter(opts);
    var cnt = { all: chipSrc.length };
    TL.forEach(function (l) { cnt[l[0]] = chipSrc.filter(function (e) { return e.loc === l[0]; }).length; });

    var h = (window.PK_BACKUP_BANNER ? PK_BACKUP_BANNER() : '') + '<div class="win"><div class="tb"><span class="tb-t">Log Pose</span><span class="tb-btns">' + eyeBtn() + '</span></div><div class="wbody lp-home">';
    h += '<div class="btnrow left q-add lp-hero"><a class="rbtn pri" href="#/log/new/' + newDate + (newDate < S().today() ? '?past=1' : '') + '">+ New procedure</a><a class="rbtn sm back" href="#/log/new/' + (function () { var t = S().today(), p; try { var d = t.split("-"); var x = new Date(+d[0], +d[1] - 1, +d[2] - 1); p = x.getFullYear() + "-" + S().pad(x.getMonth() + 1) + "-" + S().pad(x.getDate()); } catch (e) { p = t; } return p; })() + '?past=1">Add past</a></div>';
    h += '<div class="lp-cal">' + (window.PK_QUEST && PK_QUEST.monthBar ? PK_QUEST.monthBar() : '') + '</div>';
    h += '<div class="lp-sum"><div class="lp-big"><span class="lp-k">Your PF</span><span class="lp-v">' + money(totDone) + '</span><span class="lp-c">' + done.length + ' done' + (sched.length ? ' \u00B7 ' + sched.length + ' scheduled (' + money(S().sum(sched)) + ')' : '') + (pay.donePF ? ' \u00B7 ' + pct + '% collected' : '') + '</span></div>';
    h += '<div class="lp-pay"><div class="is-paid"><span>Paid (' + pay.paid + ')</span><b>' + money(pay.paidPF) + '</b></div><div class="is-unpd"><span>Unpaid (' + pay.unpaid + ')</span><b>' + money(pay.unpaidPF) + '</b></div></div>';
    if (pay.anesN) h += '<div class="lp-anes"><span>\u2695 Anesthesiologist share \u00B7 ' + pay.anesN + ' case' + (pay.anesN === 1 ? '' : 's') + ' \u00B7 30%</span><b>' + money(pay.anesPF) + '</b><i>Already excluded from your totals</i></div>';
    h += '</div>';
    h += '<div class="lp-tools"><div class="tabsrow lp-f" role="tablist">' + [['all', 'All']].concat(TL).map(function (l) { return '<button class="tab' + (ui.filter === l[0] ? ' on' : '') + '" data-lpf="' + l[0] + '">' + esc(l[1]) + ' (' + (cnt[l[0]] || 0) + ')</button>'; }).join('') + '</div>';
    h += '<input id="lp_q" class="lp-q" type="search" placeholder="Search name, code, place\u2026" value="' + esc(ui.q) + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search procedures"></div>';
    var hd = ui.day ? longDate(ui.day) : (ui.span === 'month' ? mr.title : 'All procedures');
    var links = '';
    if (ui.day) links += '<button class="linkbtn" data-lpdayclear>Whole month</button> <button class="linkbtn" data-lpspan="all">All</button>';
    else if (ui.span === 'month') links += '<button class="linkbtn" data-lpspan="all">All procedures</button>';
    else links += '<button class="linkbtn" data-lpspan="month">This month</button>';
    h += '<div class="lp-dayhd"><b>' + hd + '</b>' + links + '<span class="lp-dhc">' + shown.length + ' procedure' + (shown.length === 1 ? '' : 's') + '</span></div>';
    if (!shown.length) {
      var why = ui.q ? 'No matching procedures.' : (ui.filter !== 'all' ? 'No procedures for this location.' : (ui.day ? 'No procedures on this day.' : (ui.span === 'month' ? 'No procedures this month. Tap + New procedure to add one.' : 'No procedures yet. Tap + New procedure to add one.')));
      h += '<p class="hint">' + why + '</p>';
    } else {
      var cur = '';
      h += '<ul class="lp-list">';
      shown.forEach(function (e) {
        if (e.date !== cur) {
          cur = e.date;
          var sub = shown.filter(function (x) { return x.date === cur; });
          h += '<li class="lp-mo"><span>' + esc(longDate(cur)) + '</span><b>' + money(S().sum(sub)) + '</b></li>';
        }
        h += rowHTML(e);
      });
      h += '</ul>';
    }
    h += '<div class="btnrow left lp-foot"><a class="rbtn sm" href="#/log/find">Search</a><button class="rbtn sm" data-lp="csv">Export CSV</button><button class="rbtn sm" data-lp="more">Backup\u2026</button></div>';
    if (ui.more) h += '<div class="lp-more">' + csvPtHTML('csvPt') +
      '<div class="btnrow left"><button class="rbtn sm" data-lp="json">Backup JSON</button><button class="rbtn sm" data-lp="import">Import backup</button><input type="file" id="lpImport" accept=".json,application/json,text/plain" hidden></div>' +
      '<p class="hint">Backup JSON keeps full patient names (it is your own copy; keep it private). Import accepts PHILHEALTH KING backups and EENT PHILHEALTH procedure-log backups (entries without initials show as \u201CNo initials\u201D).</p></div>';
    h += '<p class="disc">Saved on this device only unless you back up or sync. PF is the PhilHealth PF portion (auto from the code unless edited); not your actual professional fee.</p></div></div>';
    box.innerHTML = h;
    if (window.PK_QUEST && PK_QUEST._afterCal) PK_QUEST._afterCal();
    var qi = document.getElementById('lp_q');
    if (qi && ui._qFocus) { var pos = ui._qPos || qi.value.length; qi.focus(); try { qi.setSelectionRange(pos, pos); } catch (e) {} ui._qFocus = false; }
  }

  function renderItem(id) {
    var c = C(), box = document.getElementById('logBody'); if (!c || !box) return;
    var e = S().find(id);
    if (!e) { location.hash = '#/log'; return; }
    var r = c.BY[e.rid], L = S().LOCBY[e.loc], ini = S().ptLabel(e, S().reveal()), full = S().reveal() && e.name;
    var h = '<div class="win"><div class="tb"><span class="tb-t">Procedure</span><span class="tb-btns"><a class="tbx" href="#/log" aria-label="Close">x</a></span></div><div class="wbody lp-item">';
    h += '<div class="lp-itemh"><div class="lp-when">' + esc(longDate(e.date)) + '</div>';
    h += '<div class="ihead">' + (r ? c.ico(r, 36) : '') + '<div><div class="iid">' + c.kindTag(r || { kind: e.kind }) + esc(e.code) + (e.as === '2' ? ' <span class="bl ok2">2nd</span>' : '') + '</div><div class="iname">' + esc(e.desc) + '</div></div></div></div>';
    h += '<div class="stats">';
    h += '<div class="st"><span class="k">Patient</span><span class="c">:</span><span class="v">' + (full ? esc(e.name) : (ini ? esc(ini) : 'No name')) + (full ? '' : (e.name ? ' <span class="hint">(initials \u2014 use Show names)</span>' : '')) + '</span></div>';
    h += '<div class="st"><span class="k">Place</span><span class="c">:</span><span class="v"><span class="locb ' + e.loc + '">' + pix(L[2], 12) + L[1] + '</span> ' + esc(e.fac || '\u2014') + '</span></div>';
    h += '<div class="st"><span class="k">Status</span><span class="c">:</span><span class="v">' + (e.status === 'sched' ? 'Scheduled' : 'Done') + ' \u00B7 <span class="' + (e.pay === 'paid' ? 'pdt' : 'udt') + '">' + (e.pay === 'paid' ? '\u2713 Paid' + (e.paidDate ? ' ' + esc(e.paidDate) : '') : 'Unpaid') + '</span></span></div>';
    h += '<div class="st"><span class="k">Your PF</span><span class="c">:</span><span class="v z">' + money(S().myPF(e)) + '</span></div>';
    if (e.anes) h += '<div class="st"><span class="k">Anesthesiologist</span><span class="c">:</span><span class="v">\u2695 ' + money(S().anesPF(e)) + (e.anesName ? ' \u00B7 ' + esc(e.anesName) : '') + ' (30% share, excluded from your PF)</span></div>';
    if (e.note) h += '<div class="st"><span class="k">Note</span><span class="c">:</span><span class="v">' + esc(e.note) + '</span></div>';
    h += '</div>';
    h += '<div class="btnrow left"><a class="rbtn pri" href="#/log/edit/' + encodeURIComponent(e.id) + '">Edit</a>';
    if (e.pay !== 'paid') h += '<button class="rbtn" data-qpay="' + esc(e.id) + '">Mark paid</button>';
    else h += '<button class="rbtn" data-qpay="' + esc(e.id) + '">Mark unpaid</button>';
    h += '<a class="rbtn back" href="#/log">Close</a></div>';
    h += '<p class="disc">Patient names stay on this device. Compact views show initials only until you tap Show names.</p></div></div>';
    box.innerHTML = h;
    setDay(e.date);
  }

  function route(h) {
    if (window.PK_QUEST && PK_QUEST.route) return PK_QUEST.route(h);
    render();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null; if (!t || !t.closest('#log')) return; var b;
    if ((b = t.closest('[data-lp]'))) { var a = b.dataset.lp;
      if (a === 'csv') { download('philhealth-king-pf-log.csv', S().csv(), 'text/csv'); C().toast('CSV exported' + ({ ini: ' (initials only)', full: ' (with full names)', none: ' (no patient column)' })[S().prefs().csvPt || 'ini']); }
      if (a === 'json') backupNow();
      if (a === 'import') { var AB = window.AndroidBridge; if (AB && AB.openFile) { try { AB.openFile(); return; } catch (x) {} } document.getElementById('lpImport').click(); }
      if (a === 'more') { ui.more = !ui.more; render(); }
      return; }
    if ((b = t.closest('[data-lpf]'))) { ui.filter = b.dataset.lpf; render(); }
    if ((b = t.closest('[data-lpdayclear]'))) { setDay(null); ui.span = 'month'; render(); }
    if ((b = t.closest('[data-lpspan]'))) { setDay(null); ui.span = b.dataset.lpspan; render(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'lp_q') {
      clearTimeout(render._q);
      var el = e.target, v = el.value, pos = el.selectionStart;
      render._q = setTimeout(function () { ui.q = v; ui._qFocus = true; ui._qPos = pos; render(); }, 120);
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'csvIni') S().setPref('csvIni', e.target.checked);
    if (e.target.id === 'lpImport' && e.target.files[0]) { var fr = new FileReader(); fr.onload = function () { doImport(String(fr.result || '')); }; fr.readAsText(e.target.files[0]); e.target.value = ''; }
  });
  window.PK_LOG = { render: render, route: route, setDay: setDay, day: function () { return ui.day; }, renderItem: renderItem, _filter: function (f) { ui.filter = f; }, _more: function (m) { ui.more = m; }, _span: function (v) { ui.span = v || 'all'; ui.day = null; } };
})();
