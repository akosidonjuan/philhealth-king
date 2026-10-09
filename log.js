/* PHILHEALTH KING "Log Pose": PF totals over the same store as Quest (PK_STORE). Done procedures count toward PF logged;
   scheduled ones are listed separately. Entries show patient initials; tap to edit in Quest. CSV / JSON backup / import. */
(function () {
  var ui = { filter: 'all' };
  function S() { return window.PK_STORE; } function C() { return window.EENT_CORE; }
  function money(c) { return C().z(c / 100); } function esc(s) { return C().esc(s); }
  function download(name, txt, type) { var AB = window.AndroidBridge; if (AB && AB.saveFile) { try { AB.saveFile(name, type, txt); return; } catch (e) {} } return webDownload(name, txt, type); }
  function doImport(text) { var r; try { r = S().importAny(JSON.parse(text)); } catch (x) { r = { error: 'Not a valid JSON file' }; } C().toast(r.error || ('Imported ' + r.added + ' new, ' + r.updated + ' updated' + (r.skipped ? ', ' + r.skipped + ' skipped' : ''))); if (window.EENT_CORE && r && !r.error) { var o; try { o = JSON.parse(text); } catch (x) {} if (o && Array.isArray(o.favorites)) EENT_CORE.favMerge(o.favorites); } rerenderAll(); return r; }
  function rerenderAll() { var h = location.hash || ''; if (h === '#/log') render(); else if (h.indexOf('#/quest') === 0 && window.PK_QUEST) PK_QUEST.route(h); }
  window.EENT_IMPORT = doImport;   // Android bridge calls this after the system file picker
  // CSV patient column: initials only (default) / full names / none
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
  function render() {
    var c = C(), box = document.getElementById('logBody'); if (!c) return;
    var done = S().filter({ status: 'done' }), sched = S().filter({ status: 'sched' });
    var usedT = {}; done.forEach(function (e) { usedT[e.loc] = 1; }); var TL = S().types().filter(function (t) { return !t.hidden || usedT[t.id]; }).map(function (t) { return [t.id, t.name, t.icon]; }); if (usedT.none) TL.push(S().LOCBY.none);
    var tot = { all: S().sum(done) }, cnt = { all: done.length }; TL.forEach(function (l) { var x = done.filter(function (e) { return e.loc === l[0]; }); tot[l[0]] = S().sum(x); cnt[l[0]] = x.length; });
    var shown = ui.filter === 'all' ? done : done.filter(function (e) { return e.loc === ui.filter; });
    var h = (window.PK_BACKUP_BANNER ? PK_BACKUP_BANNER() : '') + '<div class="win"><div class="tb"><span class="tb-t">Log Pose : PF Ledger</span><span class="tb-btns" aria-hidden="true"><i>_</i><i>x</i></span></div><div class="wbody">';
    h += '<div class="lp-sum"><div class="lp-big"><span class="lp-k">Your PF logged</span><span class="lp-v">' + money(tot.all) + '</span><span class="lp-c">' + cnt.all + ' done' + (sched.length ? ' \u00B7 ' + sched.length + ' scheduled (' + money(S().sum(sched)) + ')' : '') + '</span></div>' +
      (function () { var r = S().paySummary(done), pct = r.donePF ? Math.round(r.paidPF / r.donePF * 100) : 0; return '<div class="lp-pay"><div class="is-paid"><span>Paid (' + r.paid + ')</span><b>' + money(r.paidPF) + '</b></div><div class="is-unpd"><span>Unpaid (' + r.unpaid + ')</span><b>' + money(r.unpaidPF) + '</b></div></div><div class="pxbar" role="progressbar" aria-label="PF collected" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' + (r.anesN ? '<div class="lp-anes"><span>\u2695 Anesthesiologist share \u00B7 ' + r.anesN + ' case' + (r.anesN === 1 ? '' : 's') + ' \u00B7 30%</span><b>' + money(r.anesPF) + '</b><i>Already excluded from your totals \u00B7 gross case-rate PF ' + money(r.grossPF) + '</i></div>' : ''); })() + '<div class="lp-locs">' + TL.map(function (l) { return '<div class="lp-loc">' + pix(l[2], 18) + '<span>' + esc(l[1]) + '</span><b>' + money(tot[l[0]]) + '</b><i>' + cnt[l[0]] + '</i></div>'; }).join('') + '</div></div>';
    h += '<div class="btnrow left"><a class="rbtn" href="#/quest/new/' + S().today() + '">+ New entry</a><a class="rbtn sm" href="#/quest/find">Search</a><button class="rbtn sm" data-lp="csv">Export CSV</button><button class="rbtn sm" data-lp="more">Backup\u2026</button></div>';
    if (ui.more) h += '<div class="lp-more">' + csvPtHTML('csvPt') +
      '<div class="btnrow left"><button class="rbtn sm" data-lp="json">Backup JSON</button><button class="rbtn sm" data-lp="import">Import backup</button><input type="file" id="lpImport" accept=".json,application/json,text/plain" hidden></div>' +
      '<p class="hint">Backup JSON keeps full patient names (it is your own copy; keep it private). Import accepts PHILHEALTH KING backups and EENT PHILHEALTH procedure-log backups (entries without initials show as \u201CNo initials\u201D).</p></div>';
    h += '<div class="tabsrow lp-f" role="tablist">' + [['all', 'All']].concat(TL).map(function (l) { return '<button class="tab' + (ui.filter === l[0] ? ' on' : '') + '" data-lpf="' + l[0] + '">' + esc(l[1]) + ' (' + cnt[l[0]] + ')</button>'; }).join('') + '</div>';
    if (!shown.length) h += '<p class="hint">No done procedures' + (ui.filter === 'all' ? ' yet. Add one in Quest or with \u201CLog PF\u201D on any code.' : ' for this location type.') + '</p>';
    else {
      var mo = '';
      h += '<ul class="lp-list">' + shown.map(function (e) {
        var m = e.date.slice(0, 7), r = c.BY[e.rid], hd = '', L = S().LOCBY[e.loc], ini = S().ptLabel(e, S().reveal());
        if (m !== mo) { mo = m; var sub = S().sum(shown.filter(function (x) { return x.date.slice(0, 7) === m; })); hd = '<li class="lp-mo"><span>' + new Date(m + '-01T00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) + '</span><b>' + money(sub) + '</b></li>'; }
        return hd + '<li class="lp-e" data-qedit="' + esc(e.id) + '">' + (r ? c.ico(r, 22) : '') + '<div class="lp-m"><div class="lp-code">' + c.kindTag(r || { kind: e.kind }) + esc(e.code) + (e.as === '2' ? ' <span class="bl ok2">2nd</span>' : '') + ' <span class="ini sm' + (ini ? '' : ' none') + '">' + (ini ? esc(ini) : 'No name') + '</span></div><div class="lp-d">' + esc(e.desc) + '</div>' +
          '<div class="lp-w"><span class="locb ' + e.loc + '">' + pix(L[2], 12) + L[1] + '</span> ' + esc(e.fac || '\u2014') + ' \u00B7 ' + esc(e.date) + '</div></div><div class="lp-pf">' + money(S().myPF(e)) + (e.anes ? '<span class="lp-an">\u2695 Anes ' + money(S().anesPF(e)) + '</span>' : '') + '<span class="' + (e.pay === 'paid' ? 'pdt' : 'udt') + '">' + (e.pay === 'paid' ? '\u2713 Paid' : 'Unpaid') + '</span></div></li>';
      }).join('') + '</ul>';
    }
    h += '<p class="disc">Saved on this device only; never uploaded. PF is the PhilHealth PF portion (auto from the code unless edited); not your actual professional fee.</p></div></div>';
    box.innerHTML = h;
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
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'csvIni') S().setPref('csvIni', e.target.checked);
    if (e.target.id === 'lpImport' && e.target.files[0]) { var fr = new FileReader(); fr.onload = function () { doImport(String(fr.result || '')); }; fr.readAsText(e.target.files[0]); e.target.value = ''; }
  });
  window.PK_LOG = { render: render, _filter: function (f) { ui.filter = f; }, _more: function (m) { ui.more = m; } };
})();
