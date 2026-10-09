/* PHILHEALTH KING crew (v2.1 preview, JC 4 Oct 2026): ONE doctor on screen, the one the user picked (Doktor = male, Doktora = female).
   The choice is asked once on first run (the picker opens as "Who are you?") and can be changed any time in About -> Change / the picker.
   The doctor is JC's ORIGINAL painted sprite, static, standing in a reserved bottom-left corner on the tab bar (left of every list's text,
   never over the prices); every view gets bottom padding so nothing is permanently hidden behind it. No walking, no idle actions.
   The only animation is talking: every 7 s the doctor either says one of JC's 6 lines (speech bubble; never the same line twice in a
   row) or sends a floating emoji; bubble and emoji alternate. The bubble sits beside the head (tail at the mouth) or above it and never
   covers the face. CSS opacity / transform only (no JS per frame). Pauses: tab hidden, forms/sheets/PIN, welcome, "Show doctor" off. */
(function () {
  var CREW = [['fdoc', 'Doktora', 'female'], ['mdoc', 'Doktor', 'male']];
  // Mascot lines: exactly JC's six. Never the same line twice in a row.
  var LINES = ['Dokie pa CF4!', "Don't forget the proper RVS codes!", 'G lang boy, di ka pa ma flag nyan!',
    'Always check with Philhealth online if nababayaran yung claims', 'Nag-notify lang ng \u2018payment,\u2019 kinilig na ulit ako.', "Philhealth King let's go!"];
  var EMOJI = ['\uD83D\uDCB8', '\u2705', '\uD83D\uDCCB', '\uD83D\uDC4D', '\uD83C\uDF89', '\u2764\uFE0F'];   // money wings, check, clipboard, thumbs up, party, heart
  var EVERY = 7000, BUBMS = 4600, MH = 124;   // MH = Doktor's frame height in css px (Doktora keeps her painted relative height)
  var lastLine = -1, lastEmo = -1;
  function pickLine() { var i; do { i = Math.floor(Math.random() * LINES.length); } while (i === lastLine && LINES.length > 1); lastLine = i; return LINES[i]; }
  function pickEmoji() { var i; do { i = Math.floor(Math.random() * EMOJI.length); } while (i === lastEmo); lastEmo = i; return EMOJI[i]; }
  var KEY = 'pk_crew', EKEY = 'pk_crew_on';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var cur = 0, on = ls(EKEY) !== '0', chosen = false;
  (function () { var id = ls(KEY); CREW.forEach(function (c, i) { if (c[0] === id) { cur = i; chosen = true; } }); })();
  var RMq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false }, RM = RMq.matches;
  var nInst = 0;
  function svg(i, w, pfx) { return PK_ART.build(CREW[i][0], (pfx || 'u') + (++nInst) + '_', { w: w }); }
  function id() { return CREW[cur][0]; }

  // ---- DOM: one fixed overlay; the doctor is the only thing that takes taps ----
  var dock = document.createElement('div'); dock.id = 'crewdock';
  dock.innerHTML = '<button type="button" class="cd-doc" aria-label="Open Quest calendar"><span class="cd-shadow" aria-hidden="true"></span><img class="cd-img" alt="" draggable="false"></button>' +
    '<div class="cm-bub" hidden role="status" aria-live="polite"><span class="cm-bt"></span><i class="cm-tail" aria-hidden="true"></i></div>';
  document.body.appendChild(dock);
  var FIG = dock.querySelector('.cd-doc'), IMG = FIG.querySelector('img'), bub = dock.querySelector('.cm-bub'), bt = bub.querySelector('.cm-bt');
  var ready = false;
  function mount() {
    var k = id() === 'mdoc' ? 'm' : 'f', m = PK_PAINT.META[k], h = Math.round(MH * m.h / PK_PAINT.META.m.h), w = Math.round(h * (m.w + 2 * PK_PAINT.MX) / m.h);
    var r = PK_PAINT.still(id(), PK_PAINT.ORIG, h, false);
    FIG.dataset.doc = id(); IMG.setAttribute('data-pk', r.key); IMG.width = w; IMG.height = h; FIG.style.width = w + 'px'; FIG.style.height = h + 'px';
    document.documentElement.style.setProperty('--crew-w', w + 'px'); document.documentElement.style.setProperty('--crew-h', h + 'px');
    ready = !!r.url; IMG.onload = function () { if (IMG.src.indexOf('data:image/png') === 0) ready = true; }; IMG.src = r.url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    bub.hidden = true;
  }
  // ---- geometry: face box + mouth + the painted figure's box, in viewport px (bubble, emoji and tests) ----
  function geo() {
    var r = IMG.getBoundingClientRect(); if (!r.width) return null;
    var k = id() === 'mdoc' ? 'm' : 'f', m = PK_PAINT.META[k], MX = PK_PAINT.MX, u = r.height / m.h, f = m.face;
    return { face: { l: r.left + (f[0] + MX) * u - 3, r: r.left + (f[2] + MX) * u + 3, t: r.top + Math.min(f[1], m.top) * u - 3, b: r.top + f[3] * u + 3 },
      mouth: { x: r.left + (m.mouth[0] + MX) * u, y: r.top + m.mouth[1] * u },
      body: { l: r.left + MX * u, r: r.left + (m.w + MX) * u, t: r.top + Math.min(f[1], m.top) * u, b: r.top + m.foot * u } };
  }
  function hit(a, f) { return !(a.r <= f.l || a.l >= f.r || a.b <= f.t || a.t >= f.b); }
  // ---- speech bubble: to the right of the head (the doctor stands bottom-left), else above, else left; never over the face ----
  var BW = 0, BH = 0, side = '', GAP = 6, TAIL = 11;
  function priceLeft() {
    var lim = innerWidth - 8, vh = innerHeight, ps = document.querySelectorAll('.view.active .amts, .view.active .amt, .view.active .qe-pf');
    for (var i = 0; i < ps.length; i++) { var r = ps[i].getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < vh) lim = Math.min(lim, r.left - 4); }
    return lim;
  }
  function measureBub() { bub.style.transform = 'none'; var r = bub.getBoundingClientRect(); BW = Math.ceil(r.width); BH = Math.ceil(r.height); }
  function placeBub() {
    if (bub.hidden) return; var g = geo(); if (!g) return; var vw = innerWidth, vh = innerHeight, order = ['r', 't', 'l'], pick = null;
    for (var i = 0; i < order.length && !pick; i++) {
      var s = order[i], bx, by, tv;
      if (s === 't') { by = g.face.t - GAP - TAIL - BH; bx = Math.max(8, Math.min(vw - 8 - BW, g.mouth.x - BW / 2)); tv = Math.max(14, Math.min(BW - 14, g.mouth.x - bx)); }
      else { bx = s === 'r' ? g.face.r + GAP + TAIL : g.face.l - GAP - TAIL - BW; by = Math.max(8, Math.min(vh - 8 - BH, g.mouth.y - BH * .62)); tv = Math.max(12, Math.min(BH - 12, g.mouth.y - by)); }
      var box = { l: bx - (s === 'r' ? TAIL : 0), r: bx + BW + (s === 'l' ? TAIL : 0), t: by, b: by + BH + (s === 't' ? TAIL : 0) };
      if (box.l < 7.5 || box.r > vw - 7.5 || by < 7.5 || hit(box, g.face)) continue;
      pick = [s, bx, by, tv];
    }
    if (!pick) { var bx0 = Math.max(8, Math.min(vw - 8 - BW, g.mouth.x - BW / 2)); pick = ['t', bx0, Math.max(8, g.face.t - GAP - TAIL - BH), Math.max(14, Math.min(BW - 14, g.mouth.x - bx0))]; }
    side = pick[0]; bub.className = 'cm-bub s-' + side + (RM ? '' : ' cd-pop');
    bub.style.setProperty('--tv', pick[3].toFixed(1) + 'px');
    bub.style.transform = 'translate3d(' + pick[1].toFixed(1) + 'px,' + pick[2].toFixed(1) + 'px,0)';
  }
  function say(txt, ms) {
    bt.textContent = txt; bub.hidden = false; side = ''; bub.className = 'cm-bub';
    var g = geo(), vw = innerWidth;
    // keep the bubble out of the price column: its right edge stays left of every price on screen (Rates column, Quest PF / Anes)
    if (g) { var room = priceLeft() - (g.face.r + GAP + TAIL); bub.style.setProperty('--mw', (room >= 130 ? Math.min(240, room) : Math.min(240, vw - 16)) + 'px'); }
    measureBub(); placeBub(); FIG.classList.add('talking');
    clearTimeout(say.t); say.t = setTimeout(hideBub, ms || BUBMS);
  }
  function hideBub() { bub.hidden = true; FIG.classList.remove('talking'); }
  // ---- floating emoji: starts just above the head and drifts up (CSS transform + opacity only); removed when its float ends ----
  function emoji(ch) {
    var g = geo(); if (!g) return null;
    var e = document.createElement('span'); e.className = 'cd-emo' + (RM ? ' rm' : ''); e.setAttribute('aria-hidden', 'true'); var i = document.createElement('i'); i.textContent = ch; e.appendChild(i);
    var x = (g.face.l + g.face.r) / 2 + 10, y = g.face.t - 34;
    e.style.transform = 'translate3d(' + (x - 15).toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; dock.appendChild(e);
    var done = function () { e.remove(); }; i.addEventListener('animationend', done); i.addEventListener('animationcancel', done);
    var all = dock.querySelectorAll('.cd-emo'); if (all.length > 3) all[0].remove(); return e;
  }
  // ---- the 7-second talk cycle: line, emoji, line, emoji ... ----
  var n = 0, cycT = 0, lastEv = null;
  function tick(ms) {
    if (!on || document.hidden || away() || document.body.classList.contains('pk-welcome')) return null;
    var ev = { who: id(), kind: n % 2 === 0 ? 'line' : 'emoji' }; n++;
    if (ev.kind === 'line') { ev.text = pickLine(); say(ev.text, ms || BUBMS); } else { ev.text = pickEmoji(); emoji(ev.text); }
    ev.at = Date.now(); lastEv = ev; return ev;
  }
  function cycle() { clearTimeout(cycT); cycT = setTimeout(function () { tick(); cycle(); }, EVERY); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(cycT); else cycle(); });
  if (RMq.addEventListener) RMq.addEventListener('change', function (e) { RM = e.matches; });

  // ---- tap the doctor: a line, then open Quest (month view, today selected) ----
  var navT = null;
  function tapGo() {
    say(pickLine(), BUBMS); cycle();
    var onBoard = /^#\/quest(\/day\/[\d-]+)?$/.test(location.hash || '');
    clearTimeout(navT); navT = setTimeout(function () { if (window.PK_QUEST && PK_QUEST.goToday) PK_QUEST.goToday(); else location.hash = '#/quest'; }, onBoard ? 150 : 900);
  }
  FIG.addEventListener('click', tapGo);
  dock.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  // ---- stay clear of forms; the picker shows the cards instead ----
  function formOpen() { var h = location.hash || ''; return /^#\/(quest\/(new|edit)|places|crew)/.test(h) || document.body.classList.contains('pk-sheet') || document.body.classList.contains('pk-locked') || !!document.getElementById('pin1') || (document.activeElement && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement.type !== 'checkbox'); }
  function away() { var a = formOpen(); dock.classList.toggle('away', a); if (a) hideBub(); return a; }
  window.addEventListener('hashchange', function () { setTimeout(away, 0); firstRun(); });
  document.addEventListener('focusin', away); document.addEventListener('focusout', function () { setTimeout(away, 0); });
  document.addEventListener('click', function () { setTimeout(away, 0); });
  addEventListener('resize', function () { if (!bub.hidden) { measureBub(); placeBub(); } });

  // ---- first run: ask once who the user is (male -> Doktor, female -> Doktora) ----
  function firstRun() {
    if (chosen || ls('pk_crew_asked') === '1') return;
    var h = location.hash || ''; if (h !== '' && h !== '#/' && h !== '#') return;
    if (document.body.classList.contains('pk-welcome') || document.body.classList.contains('pk-locked')) return;
    ls('pk_crew_asked', '1'); location.hash = '#/crew';
  }
  // ---- picker / header / about ----
  function renderPicker() {
    var first = !chosen, h = '<p class="hint" style="margin-top:0">' + (first ? '<b>Welcome! Who are you?</b> Pick the doctor that matches you. ' : '') +
      'Only the doctor you pick appears on screen; it stands in the bottom-left corner and talks now and then. Tap it to open the Quest calendar. You can change this any time in About.</p>' +
      '<div class="crewgrid" role="radiogroup" aria-label="Your doctor">';
    CREW.forEach(function (c, i) { var sel = chosen && i === cur; h += '<button class="crewcard' + (sel ? ' on' : '') + '" role="radio" aria-checked="' + sel + '" data-crew="' + i + '"><span class="cc-frame">' + svg(i, 112, 'k') + '</span><span class="cc-n">' + c[1] + '</span><span class="cc-s">' + (c[2] === 'male' ? 'Male' : 'Female') + (sel ? ' \u00B7 \u2726 You' : '') + '</span></button>'; });
    h += '</div><label class="mset"><input type="checkbox" id="crewToggle"' + (on ? ' checked' : '') + '> Show my doctor on screen</label>';
    document.getElementById('crewBody').innerHTML = h;
  }
  function hdr() { var f = document.querySelector('.crewface'); if (f) f.innerHTML = svg(cur, 34, 'h'); }
  function pick(i) {
    var was = chosen; cur = i; chosen = true; n = 0; ls(KEY, CREW[i][0]); ls('pk_crew_asked', '1'); mount(); renderPicker(); hdr();
    if (window.EENT_CORE) EENT_CORE.toast(CREW[i][1] + ' is on duty!');
    if (!was) setTimeout(function () { location.hash = '#/'; setTimeout(function () { say(pickLine(), BUBMS); }, 450); }, 500); else cycle();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-crew]'); if (b) pick(+b.dataset.crew);
    if (e.target.closest && e.target.closest('#crewBtn')) location.hash = '#/crew';
    if (e.target.closest && e.target.closest('#themeBtn')) { var d = document.documentElement, th = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; d.setAttribute('data-theme', th); ls('pk_theme', th); themeIco(); }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'crewToggle') { on = e.target.checked; ls(EKEY, on ? '1' : '0'); dock.style.display = on ? '' : 'none'; document.documentElement.classList.toggle('crew-off', !on); if (!on) hideBub(); else cycle(); } });
  function themeIco() { var dk = document.documentElement.getAttribute('data-theme') === 'dark', b = document.getElementById('themeBtn'); if (b) b.innerHTML = dk ? '&#9790;' : '&#9728;';
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', dk ? '#000000' : '#3aa9e6'); var cs = document.querySelector('meta[name=color-scheme]'); if (cs) cs.setAttribute('content', dk ? 'dark' : 'light'); }
  var ls0 = document.querySelector('.logo-slot[data-ico]'); if (ls0 && window.pix) ls0.innerHTML = pix(ls0.dataset.ico, 32);
  dock.style.display = on ? '' : 'none'; document.documentElement.classList.toggle('crew-off', !on);
  mount(); hdr(); themeIco(); cycle(); setTimeout(firstRun, 0);
  window.PK_CREW = { renderPicker: renderPicker, name: function () { return CREW[cur][1]; }, react: function () { if (on && !away()) say(pickLine(), BUBMS); },
    aboutHTML: function () { return '<div class="mset crewrow"><span class="crewmini">' + svg(cur, 40, 'a') + '</span> Your doctor: <b>' + CREW[cur][1] + '</b> (' + CREW[cur][2] + ') <a class="rbtn sm" href="#/crew">Change</a></div>'; },
    CREW: CREW, LINES: LINES, EMOJI: EMOJI, EVERY: EVERY, cur: id, chosen: function () { return chosen; }, remount: function () { mount(); hdr(); if (location.hash === '#/crew') renderPicker(); },
    // test / recording hooks
    _say: function (t, ms) { say(t, ms); }, _emoji: emoji, _pickLine: pickLine, _pickEmoji: pickEmoji, _tap: tapGo, _away: away, _tick: tick, _cycle: cycle, _stop: function () { clearTimeout(cycT); },
    _reset: function () { n = 0; lastLine = -1; lastEmo = -1; }, _last: function () { return lastEv; }, _pick: pick,
    _geo: geo, _ready: function () { return ready; }, _hide: hideBub,
    _state: function () { return { who: id(), side: side, bubble: !bub.hidden, n: n, on: on, cur: id(), chosen: chosen }; } };
})();
