/* Healing Meadow dashboard chrome. Uses existing features only; no new business logic. */
(function () {
  function hour() {
    var src = window.PK_TODAY || null;
    var d = src ? new Date(src) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.getHours();
  }
  function hello() {
    var h = hour();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
  function name() {
    return 'Doc';
  }
  function ensureChrome() {
    var hdr = document.querySelector('#home .win.hdr');
    if (hdr && !hdr.querySelector('.meadow-paint')) {
      var paint = document.createElement('div'); paint.className = 'meadow-paint'; paint.setAttribute('aria-hidden', 'true');
      var fx = document.createElement('div'); fx.className = 'meadow-fx'; fx.setAttribute('aria-hidden', 'true');
      fx.innerHTML = '<i class="mf-cloud c1"></i><i class="mf-cloud c2"></i>';
      hdr.insertBefore(fx, hdr.firstChild);
      hdr.insertBefore(paint, hdr.firstChild);
    }
    var dock = document.querySelector('#home .topdock');
    var dash = document.getElementById('meadowDash');
    if (!dash && dock) {
      dash = document.createElement('div'); dash.id = 'meadowDash'; dash.className = 'meadow-dash';
      var cat = document.getElementById('catmenu');
      dock.insertBefore(dash, cat || null);
    }
    return dash;
  }
  function notes() {
    var out = [];
    try {
      if (window.PK_STORE && PK_STORE.backupStatus) {
        var st = PK_STORE.backupStatus();
        if (st && st.due) out.push('Back up your procedure log? ' + st.newCount + ' new or changed ' + (st.newCount === 1 ? 'entry' : 'entries') + (st.last ? ' since your last backup.' : ' not backed up yet.') + ' <a href="#/about">Open Backup / Sync</a>');
      }
    } catch (e) {}
    out.push('Base schedule is PC 2024-0037 (as of Sep 25, 2026). Cataract surgery follows PC 2025-0001 packages.');
    out.push('Amounts are a reference only — verify against official PhilHealth circulars before you claim. <a href="#/rules">Claim rules</a>');
    return out;
  }
  function paint() {
    var dash = ensureChrome();
    if (!dash) return;
    var greet = hello() + ', ' + name();
    var items = [
      { href: '#/', cat: '', title: 'Case Rates', sub: 'Browse RVS, ICD-10 and packages', ico: '\u2630' },
      { href: '#/', cat: 'img', title: 'Image-guided', sub: 'Annex B guidance codes', ico: '\u25C9' },
      { href: '#/calc', cat: '', title: 'Claim Calculator', sub: '1st + 2nd case rate', ico: '\u2211' },
      { href: '#/log', cat: '', title: 'Procedure Log', sub: 'New procedure, details, calendar', ico: '\u2713' },
      { href: '#/rules', cat: '', title: 'Claim rules', sub: 'Circulars and how rates work', ico: '\u00A7' },
      { href: '#/about', cat: '', title: 'Backup / Sync', sub: 'Google Drive restore and backup', ico: '\u21BB' }
    ];
    var h = '<p class="meadow-hi" id="meadowHi">' + greet + '</p><div class="md-grid">';
    items.forEach(function (it) {
      h += '<a class="md-card" href="' + it.href + '"' + (it.cat ? ' data-mdcat="' + it.cat + '"' : '') + '><span class="md-ico" aria-hidden="true">' + it.ico + '</span><b>' + it.title + '</b><span>' + it.sub + '</span></a>';
    });
    h += '</div><div class="md-ann"><h3>Notes</h3><ul>' + notes().map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul></div>';
    dash.innerHTML = h;
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('[data-mdcat]');
    if (!a) return;
    var cat = a.getAttribute('data-mdcat');
    if (!cat) return;
    ev.preventDefault();
    if (location.hash && location.hash !== '#/' && location.hash !== '#') location.hash = '#/';
    var btn = document.querySelector('#catmenu [data-cat="' + cat + '"]');
    if (btn) btn.click();
    var list = document.getElementById('list') || document.getElementById('catmenu');
    if (list && list.scrollIntoView) list.scrollIntoView({ block: 'start' });
  });
  function go() { try { paint(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  window.addEventListener('hashchange', go);
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#themeBtn, #crewBtn, [href="#/crew"]')) setTimeout(go, 80);
  });
  window.PK_MEADOW = { paint: paint };
})();
