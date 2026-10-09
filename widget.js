/* PHILHEALTH KING v2.0.0 - Android home-screen clipboard widget feed.
   Computes the widget numbers from the local store and hands them to the native AppWidgetProvider (PKWidget.java)
   through AndroidBridge.updateWidget(json). Patient privacy: initials only; no anesthesiologist line (PF = your share). */
(function () {
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function money(c) { var s = (Math.round(c) / 100).toFixed(2).split('.'); return '\u20B1' + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + s[1]; }
  function short(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '.' : s; }
  function data() {
    var S = window.PK_STORE; if (!S) return null;
    var t = S.today(), ym = t.slice(0, 7), all = S.all(), m = all.filter(function (e) { return e.date.slice(0, 7) === ym; });
    var r = S.paySummary(m), ra = S.paySummary(all);
    var or = all.filter(function (e) { return e.status === 'sched' && e.date >= t; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : a.created - b.created; });
    var todayList = or.filter(function (e) { return e.date === t; });
    function row(e) { var d = new Date(e.date + 'T00:00:00'); return { iso: e.date, date: e.date === t ? 'TODAY' : MON[d.getMonth()] + ' ' + d.getDate(), code: String(e.code || ''), desc: short(e.desc, 26), ini: S.iniShow(e.pt) }; }
    var sy = window.PK_SYNC && PK_SYNC.state ? PK_SYNC.state() : null, ago = sy && sy.signed && sy.last ? Math.round((Date.now() - sy.last) / 60000) : -1;
    var d = new Date(t + 'T00:00:00'), pct = r.donePF ? Math.round(100 * r.paidPF / r.donePF) : 0;
    return {
      v: 1, at: Date.now(), monthShort: MON[d.getMonth()], month: MONL[d.getMonth()] + ' ' + d.getFullYear(),
      cases: r.done, sched: r.sched, pf: money(r.donePF), paidN: r.paid, paid: money(r.paidPF), unpN: r.unpaid, unp: money(r.unpaidPF), pct: pct,
      allCases: ra.done, allPf: money(ra.donePF), todayN: todayList.length,
      today: todayList[0] ? row(todayList[0]) : null, next: or.slice(0, 8).map(row), todayIso: t,
      sync: sy && sy.signed ? (sy.err ? 'Sync paused' : 'Synced' + (ago >= 0 ? ' \u00B7 ' + (ago < 1 ? 'now' : ago < 60 ? ago + 'm' : Math.round(ago / 60) + 'h') : '')) : 'Offline'
    };
  }
  var tm = 0, last = '';
  function push() { tm = 0; var AB = window.AndroidBridge; if (!AB || !AB.updateWidget) return; var d = data(); if (!d) return; var j = JSON.stringify(Object.assign({}, d, { at: 0 })); if (j === last) return; last = j; try { AB.updateWidget(JSON.stringify(d)); } catch (e) {} }
  function soon() { if (!tm) tm = setTimeout(push, 600); }
  function init() { if (!window.PK_STORE) return setTimeout(init, 100); PK_STORE.onChange(soon); if (window.PK_SYNC && PK_SYNC.onChange) PK_SYNC.onChange(soon); soon();
    document.addEventListener('visibilitychange', function () { if (document.hidden) push(); }); setInterval(soon, 30 * 60000); }   // keep "today" correct across midnight
  window.PK_WIDGET = { data: data, push: push };
  init();
})();
