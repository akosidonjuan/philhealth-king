/* PHILHEALTH KING crew (preview): Cici the Legendary PhilHealth Miner is the on-screen avatar.
   Doktor/Doktora are no longer shown. A stored pk_crew value is left untouched
   so older installs keep loading. Cici talks every 7 s (bubble + a rotation through the five uploaded loops);
   pauses when the tab is hidden, a form/sheet/PIN is open, welcome is up, or
   "Show Cici on screen" is off. Idle is the existing run sheet; the four new loops are CSS strips. CSS opacity/transform only (no JS per frame). */
(function () {
  var CREW = [['fdoc', 'Doktora', 'female'], ['mdoc', 'Doktor', 'male']];
  var LINES = [
    'I\u2019m Cici \u2014 here to help everyone see, hear, and live better.',
    'Check the RVS code before you file a claim.',
    'Verify amounts against the official PhilHealth circulars.',
    'Tap a day on the calendar to filter your procedures.',
    'Patient names stay private \u2014 initials only, unless you choose to show them.',
    'A careful claim today means fewer surprises later.'
  ];
  var EMOJI = ['\uD83D\uDCB8', '\u2705', '\uD83D\uDCCB', '\uD83D\uDC4D', '\uD83C\uDF89', '\u2764\uFE0F'];
  var EMOTE_FOR = { '\uD83C\uDF89': 'claims', '\u2764\uFE0F': 'claims', '\uD83D\uDC4D': 'claims', '\u2705': 'claims', '\uD83D\uDCB8': 'claims', '\uD83D\uDCCB': 'mining' };
  /* Visual actions. Aliases keep older play('wave') / play('happy') callers working. */
  var VISUAL = {
    idle: 'idle', run: 'idle', main: 'idle', offline: 'idle', error: 'idle',
    claims: 'claims', wave: 'claims', hello: 'claims', happy: 'claims',
    celebrate: 'claims', found: 'claims', legendary: 'claims', wink: 'claims',
    laugh: 'claims', heart: 'claims', salute: 'claims',
    mining: 'mining', think: 'mining', idea: 'mining', confused: 'mining', surprised: 'mining',
    stand: 'stand', determined: 'stand', teamwork: 'stand',
    eat: 'eat',
    sleepy: 'sleepy' /* resolved to stand/eat when played */
  };
  var SHEET = {
    claims: 'art/miner/anim/claims-sheet.webp',
    mining: 'art/miner/anim/mining-sheet.webp',
    stand: 'art/miner/anim/stand-sheet.webp',
    hotdog: 'art/miner/anim/hotdog-sheet.webp'
  };
  var SHEET_SM = {
    claims: 'art/miner/compact/claims-sheet.webp',
    mining: 'art/miner/compact/mining-sheet.webp',
    stand: 'art/miner/compact/stand-sheet.webp',
    hotdog: 'art/miner/compact/hotdog-sheet.webp'
  };
  var STILL = {
    idle: 'art/miner/hero/hero-still.webp',
    claims: 'art/miner/anim/claims-still.webp',
    mining: 'art/miner/anim/mining-still.webp',
    stand: 'art/miner/anim/stand-still.webp',
    eat: 'art/miner/anim/hotdog-still.webp',
    hotdog: 'art/miner/anim/hotdog-still.webp'
  };
  var TALK_ROTATE = ['claims', 'mining', 'stand', 'eat', 'run'];
  var TAP_CYCLE = ['claims', 'mining', 'stand', 'eat', 'run'];
  var EVERY = 7000, BUBMS = 4600, EMOTEMS = 2800;
  var FACE = { l: 0.22, t: 0.08, r: 0.82, b: 0.52 }, MOUTH = { x: 0.50, y: 0.38 };
  var lastLine = -1, lastEmo = -1;
  function pickLine() { var i; do { i = Math.floor(Math.random() * LINES.length); } while (i === lastLine && LINES.length > 1); lastLine = i; return LINES[i]; }
  function pickEmoji() { var i; do { i = Math.floor(Math.random() * EMOJI.length); } while (i === lastEmo); lastEmo = i; return EMOJI[i]; }
  var KEY = 'pk_crew', EKEY = 'pk_crew_on';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var cur = 0, on = ls(EKEY) !== '0';
  (function () { var id = ls(KEY); CREW.forEach(function (c, i) { if (c[0] === id) cur = i; }); })();
  var RMq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false }, RM = RMq.matches;

  var DOCK_INNER = '<button type="button" class="cd-doc" aria-label="Cici the Legendary PhilHealth Miner, open the procedure log"><span class="cd-shadow" aria-hidden="true"></span><span class="cd-stage" aria-hidden="true"><img class="cd-img is-front" alt="" draggable="false"><img class="cd-img is-back" alt="" draggable="false"></span></button>';
  var docks = [];
  function makeDock(kind) {
    var d = document.createElement('div');
    d.className = 'crewdock crewdock-' + kind + ' is-parked';
    d.setAttribute('data-crewdock', kind);
    d.innerHTML = DOCK_INNER;
    d.querySelector('.cd-doc').addEventListener('click', function () { tapGo(); });
    d.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    docks.push(d);
    return d;
  }
  function useCompactHome() {
    try {
      var ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return true;
      if (window.matchMedia && matchMedia('(max-width: 700px), (hover: none)').matches) return true;
    } catch (e) {}
    return false;
  }
  function homeKind() { return useCompactHome() ? 'compact' : 'home'; }
  var dock = makeDock(homeKind()); dock.id = 'crewdock'; dock.classList.add('is-live'); dock.classList.remove('is-parked');
  dock.insertAdjacentHTML('beforeend', '<div class="cm-bub" hidden role="status" aria-live="polite"><span class="cm-bt"></span><i class="cm-tail" aria-hidden="true"></i></div>');
  document.body.appendChild(dock);
  var FIG = dock.querySelector('.cd-doc'), STAGE = FIG.querySelector('.cd-stage');
  var IMGS = STAGE.querySelectorAll('.cd-img'), bub = dock.querySelector('.cm-bub'), bt = bub.querySelector('.cm-bt');
  var ready = false, showing = 'idle', front = 0, decoded = {}, talkRot = 0;
  var T0 = 0, RUN_MS = 16 * 10 / 120 * 1000, ANIM_MS = 12 * 12 / 120 * 1000;

  function visualOf(k) {
    if (k === 'sleepy') return snackVisual();
    return VISUAL[k] || 'idle';
  }
  var snackFlip = 0;
  function snackVisual() { return (snackFlip++ % 2 === 0) ? 'stand' : 'eat'; }

  var RUN_SHEET = 'art/miner/hero/run-sheet.webp';
  var RUN_STILL = 'art/miner/hero/hero-still.webp';
  var RUN_SHEET_SM = 'art/miner/compact/run-sheet.webp';
  var RUN_STILL_SM = 'art/miner/compact/hero-still.webp';
  var transT = 0;

  function preloadSheets() {
    var compactOnly = useCompactHome();
    var urls = compactOnly ? [RUN_SHEET_SM, RUN_STILL_SM] : [RUN_SHEET, RUN_STILL, RUN_SHEET_SM, RUN_STILL_SM];
    urls.push(STILL.claims, STILL.mining, STILL.stand, STILL.eat);
    var pack = compactOnly ? SHEET_SM : SHEET;
    Object.keys(pack).forEach(function (k) { urls.push(pack[k]); });
    if (!compactOnly) Object.keys(SHEET_SM).forEach(function (k) { if (SHEET_SM[k]) urls.push(SHEET_SM[k]); });
    return Promise.all(urls.map(function (url) {
      if (decoded[url]) return decoded[url];
      var im = new Image();
      im.src = url;
      decoded[url] = (im.decode ? im.decode() : new Promise(function (res) { im.onload = res; im.onerror = res; })).then(function () { return im; }).catch(function () { return im; });
      return decoded[url];
    }));
  }
  function allDocks() { return docks.slice(); }
  function bindLive(d) {
    if (!d) return;
    dock = d;
    FIG = dock.querySelector('.cd-doc');
    STAGE = FIG ? FIG.querySelector('.cd-stage') : null;
    IMGS = STAGE ? STAGE.querySelectorAll('.cd-img') : [];
  }
  function syncPhase(d) {
    if (!d || !T0) return;
    var now = performance.now(), runD = -((now - T0) % RUN_MS), animD = -((now - T0) % ANIM_MS);
    var rs = d.querySelector('.cd-run-strip'); if (rs) rs.style.animationDelay = runD + 'ms';
    var as = d.querySelectorAll('.cd-anim-strip');
    for (var i = 0; i < as.length; i++) as[i].style.animationDelay = animD + 'ms';
  }
  function ensureRig(fig) {
    fig = fig || FIG;
    if (!fig) return;
    var d = fig.closest('.crewdock') || fig.closest('#crewdock');
    var compact = !!(d && d.getAttribute('data-crewdock') === 'compact') || useCompactHome();
    var runSrc = compact ? RUN_SHEET_SM : RUN_SHEET;
    var runFb = compact ? RUN_STILL_SM : RUN_STILL;
    var sheets = compact ? SHEET_SM : SHEET;
    if (!fig.querySelector('.cd-ledge')) {
      var ledge = document.createElement('span');
      ledge.className = 'cd-ledge';
      ledge.setAttribute('aria-hidden', 'true');
      ledge.innerHTML = '<img class="cd-ledge-img cd-ledge-day" alt="" draggable="false" src="art/miner/ground/ledge.webp"><img class="cd-ledge-img cd-ledge-night" alt="" draggable="false" src="art/miner/ground/ledge-dark.webp"><span class="cd-ground-tex"></span>';
      fig.insertBefore(ledge, fig.firstChild);
    }
    if (!fig.querySelector('.cd-dust')) {
      var dust = document.createElement('span');
      dust.className = 'cd-dust';
      dust.setAttribute('aria-hidden', 'true');
      dust.innerHTML = '<i></i><i></i>';
      var sh = fig.querySelector('.cd-shadow');
      if (sh && sh.nextSibling) fig.insertBefore(dust, sh.nextSibling);
      else fig.appendChild(dust);
    }
    var rig = fig.querySelector('.cd-rig');
    if (!rig) {
      rig = document.createElement('span');
      rig.className = 'cd-rig';
      rig.setAttribute('aria-hidden', 'true');
      var stage = fig.querySelector('.cd-stage');
      if (stage) fig.insertBefore(rig, stage);
      else fig.appendChild(rig);
      if (stage && stage.parentNode !== rig) rig.appendChild(stage);
    }
    var looseRun = fig.querySelector(':scope > .cd-run');
    if (looseRun) rig.appendChild(looseRun);
    if (!rig.querySelector('.cd-run')) {
      var wrap = document.createElement('span');
      wrap.className = 'cd-run';
      wrap.setAttribute('aria-hidden', 'true');
      var rw = compact ? 2720 : 5440, rh = compact ? 160 : 320;
      wrap.innerHTML = '<span class="cd-run-vp"><span class="cd-run-strip"><img alt="" width="' + rw + '" height="' + rh + '" decoding="async" draggable="false"></span></span>';
      var img = wrap.querySelector('img');
      img.src = runSrc;
      img.onerror = function () { img.src = runFb; };
      rig.appendChild(wrap);
    }
    ['claims', 'mining', 'stand', 'hotdog'].forEach(function (name) {
      if (rig.querySelector('.cd-anim[data-anim="' + name + '"]')) return;
      var el = document.createElement('span');
      el.className = 'cd-anim';
      el.setAttribute('data-anim', name);
      el.setAttribute('aria-hidden', 'true');
      var aw = compact ? 2080 : 4160, ah = compact ? 160 : 320;
      el.innerHTML = '<span class="cd-anim-vp"><span class="cd-anim-strip"><img alt="" width="' + aw + '" height="' + ah + '" decoding="async" draggable="false"></span></span>';
      var im = el.querySelector('img');
      im.src = sheets[name] || SHEET[name];
      im.onerror = function () { if (STILL[name] || STILL.eat) im.src = STILL[name] || STILL.eat; };
      rig.appendChild(el);
    });
  }
  function ensureRunStrip() { allDocks().forEach(function (d) { ensureRig(d.querySelector('.cd-doc')); }); }
  function markReady() {
    if (!T0) T0 = performance.now();
    allDocks().forEach(function (d) { d.classList.add('is-ready'); syncPhase(d); });
  }
  function preloadRunSheet() {
    preloadSheets().then(markReady, markReady);
  }

  function applySrc(k) {
    k = visualOf(k || 'idle');
    showing = k;
    allDocks().forEach(function (d) {
      var fig = d.querySelector('.cd-doc');
      if (k === 'idle') { d.classList.remove('is-emote'); if (fig) fig.classList.remove('is-emote'); }
      else { d.classList.add('is-emote'); if (fig) fig.classList.add('is-emote'); }
    });
  }
  function setSrc(k) { applySrc(k); }

  function mount() {
    document.documentElement.style.setProperty('--crew-w', '100%');
    document.documentElement.style.setProperty('--crew-h', '100%');
    allDocks().forEach(function (d) {
      var fig = d.querySelector('.cd-doc');
      if (fig) { var im = fig.querySelector('.cd-img'); if (im) im.alt = 'Cici the Legendary PhilHealth Miner'; ensureRig(fig); }
    });
    setSrc('idle');
    ready = true;
    if (bub) bub.hidden = true;
    preloadRunSheet();
  }
  function geo() {
    var r = FIG.getBoundingClientRect(); if (!r.width) return null;
    return {
      face: { l: r.left + FACE.l * r.width - 3, r: r.left + FACE.r * r.width + 3, t: r.top + FACE.t * r.height - 3, b: r.top + FACE.b * r.height + 3 },
      mouth: { x: r.left + MOUTH.x * r.width, y: r.top + MOUTH.y * r.height },
      body: { l: r.left, r: r.right, t: r.top, b: r.bottom }
    };
  }
  function hit(a, f) { return !(a.r <= f.l || a.l >= f.r || a.b <= f.t || a.t >= f.b); }
  var BW = 0, BH = 0, side = '', GAP = 6, TAIL = 11;
  function priceLeft() {
    var lim = innerWidth - 8, vh = innerHeight, ps = document.querySelectorAll('.view.active .amts, .view.active .amt, .view.active .qe-pf, .view.active .lp-pf');
    for (var i = 0; i < ps.length; i++) { var r = ps[i].getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < vh) lim = Math.min(lim, r.left - 4); }
    return lim;
  }
  function measureBub() { bub.style.transform = 'none'; var r = bub.getBoundingClientRect(); BW = Math.ceil(r.width); BH = Math.ceil(r.height); }
  function inReserved() { return !!(bub.closest && (bub.closest('.cici-talkbar') || bub.closest('.cici-bub'))); }
  function placeBub() {
    if (bub.hidden) return;
    if (inReserved()) {
      bub.style.transform = 'none';
      bub.className = 'cm-bub s-r' + (RM ? '' : ' cd-pop');
      return;
    }
    var g = geo(); if (!g) return; var vw = innerWidth, vh = innerHeight, order = ['r', 't', 'l'], pick = null;
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
    bt.textContent = txt; bub.hidden = false; document.documentElement.classList.add('cici-talking'); side = ''; bub.className = 'cm-bub';
    var g = geo(), vw = innerWidth;
    if (g) { var room = priceLeft() - (g.face.r + GAP + TAIL); bub.style.setProperty('--mw', (room >= 130 ? Math.min(240, room) : Math.min(240, vw - 16)) + 'px'); }
    measureBub(); placeBub(); FIG.classList.add('talking');
    var actNow = dock.getAttribute('data-act');
    if (!actNow || actNow === 'idle' || actNow === 'talk') play('talk', { silent: true, duration: ms || BUBMS });
    clearTimeout(say.t); say.t = setTimeout(hideBub, ms || BUBMS);
  }
  function hideBub() { bub.hidden = true; FIG.classList.remove('talking'); document.documentElement.classList.remove('cici-talking'); }
  function clearEmote() { clearTimeout(clearEmote.t); if (showing !== 'idle') setSrc('idle'); }
  function showEmote(kind) {
    setSrc(kind || 'happy');
    clearTimeout(clearEmote.t);
    clearEmote.t = setTimeout(clearEmote, EMOTEMS);
  }
  function emoji(ch) {
    var kind = EMOTE_FOR[ch] || 'happy';
    play(kind === 'happy' ? 'happy' : kind);
    showEmote(kind);
    return null;
  }
  var n = 0, cycT = 0, lastEv = null;
  function tick(ms) {
    if (window.__pkFreezeCrew) return null;
    if (!on || document.hidden || away() || document.body.classList.contains('pk-welcome')) return null;
    var ev = { who: 'cici', kind: n % 2 === 0 ? 'line' : 'emoji' }; n++;
    if (ev.kind === 'line') { ev.text = pickLine(); say(ev.text, ms || BUBMS); } else { ev.text = pickEmoji(); emoji(ev.text); }
    ev.at = Date.now(); lastEv = ev; return ev;
  }
  function cycle() { if (window.__pkFreezeCrew) { clearTimeout(cycT); return; } clearTimeout(cycT); cycT = setTimeout(function () { tick(); cycle(); }, EVERY); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearTimeout(cycT); clearEmote(); } else cycle(); });
  if (RMq.addEventListener) RMq.addEventListener('change', function (e) { RM = e.matches; });

  var navT = null;
  function tapGo() {
    cycle();
    var pickA = TAP_CYCLE[tapRot++ % TAP_CYCLE.length];
    if (pickA === 'run') play('idle'); else play(pickA);
    var onBoard = /^#\/log(\/day\/[\d-]+)?$/.test(location.hash || '');
    var wait = onBoard ? 200 : 2400;
    clearTimeout(navT); navT = setTimeout(function () { if (window.PK_QUEST && PK_QUEST.goToday) PK_QUEST.goToday(); else location.hash = '#/log'; }, wait);
  }
  function formOpen() { var h = location.hash || ''; return /^#\/((quest|log)\/(new|edit|item)|places|crew)/.test(h) || document.body.classList.contains('pk-sheet') || document.body.classList.contains('pk-locked') || !!document.getElementById('pin1') || (document.activeElement && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement.type !== 'checkbox'); }
  function away() { var a = formOpen(); dock.classList.toggle('away', a); if (a) { hideBub(); clearEmote(); } return a; }
  window.addEventListener('hashchange', function () { hideBub(); away(); park(); });
  document.addEventListener('focusin', away); document.addEventListener('focusout', function () { setTimeout(away, 0); });
  document.addEventListener('click', function () { setTimeout(away, 0); });
  addEventListener('resize', function () { if (!bub.hidden) { measureBub(); placeBub(); } });

  function firstRun() { /* Cici needs no onboarding picker. */ }
  function renderPicker() { /* no doctor picker; send leftover #/crew links away */ if ((location.hash || '') === '#/crew') location.hash = '#/about'; }
  function hdr() { /* header doctor button removed */ }
  function pick(i) {
    /* Keep a stored gender if tests/callers still invoke pick(), but never overwrite blindly from first run. */
    if (i >= 0 && i < CREW.length) { cur = i; ls(KEY, CREW[i][0]); }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#themeBtn')) { var d = document.documentElement, th = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; d.setAttribute('data-theme', th); ls('pk_theme', th); themeIco(); }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'crewToggle') { on = e.target.checked; ls(EKEY, on ? '1' : '0'); allDocks().forEach(function (d) { d.style.display = on ? '' : 'none'; }); document.documentElement.classList.toggle('crew-off', !on); if (!on) { hideBub(); clearEmote(); } else cycle(); } });
  function themeIco() { var dk = document.documentElement.getAttribute('data-theme') === 'dark', b = document.getElementById('themeBtn'); if (b) b.innerHTML = dk ? '&#9790;' : '&#9728;';
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', dk ? '#000000' : '#3aa9e6'); var cs = document.querySelector('meta[name=color-scheme]'); if (cs) cs.setAttribute('content', dk ? 'dark' : 'light'); }
  var ls0 = document.querySelector('.logo-slot[data-ico]'); if (ls0 && window.pix) ls0.innerHTML = pix(ls0.dataset.ico, 32);

  /* ---- reserved slots + 2D actions (transform/opacity CSS) ---- */
  var lastInput = Date.now(), actT = 0, zzzEl = null, talkbar = null;
  var ACT_MS = { claims: 2400, mining: 2400, stand: 2400, eat: 2400, talk: 2800, wave: 2400, hello: 2400, happy: 2400, celebrate: 2400, found: 2400, legendary: 2400, wink: 2400, laugh: 2400, heart: 2400, salute: 2400, think: 2400, idea: 2400, confused: 2400, surprised: 2400, determined: 2400, teamwork: 2400 };
  function showZzz(onZ) {
    if (onZ) {
      if (!zzzEl) { zzzEl = document.createElement('span'); zzzEl.className = 'cici-zzz'; zzzEl.setAttribute('aria-hidden', 'true'); zzzEl.innerHTML = '<i>z</i><i>z</i><i>z</i>'; }
      if (!zzzEl.parentNode) dock.appendChild(zzzEl);
    } else if (zzzEl && zzzEl.parentNode) zzzEl.remove();
  }
  function ensureHomeSlot() {
    var hdr = document.querySelector('#home .win.hdr'); if (!hdr) return null;
    var body = hdr.querySelector('.hdr-body') || hdr;
    var logo = body.querySelector('.logo-slot');
    if (logo) logo.setAttribute('hidden', '');
    var slot = body.querySelector(':scope > .cici-slot') || hdr.querySelector('.cici-slot-home');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'cici-slot cici-slot-home';
    }
    if (slot.parentNode !== body) {
      var firstTxt = body.querySelector('.hdr-txt') || body.firstChild;
      body.insertBefore(slot, firstTxt);
    }
    var dockParent = document.querySelector('#home .topdock') || hdr.parentNode;
    talkbar = document.getElementById('cici-talkbar') || document.querySelector('#home .cici-talkbar');
    if (!talkbar && dockParent) {
      talkbar = document.createElement('div'); talkbar.className = 'cici-talkbar'; talkbar.id = 'cici-talkbar';
      if (hdr.nextSibling) dockParent.insertBefore(talkbar, hdr.nextSibling); else dockParent.appendChild(talkbar);
    }
    return slot;
  }
  function ensureCompactSlot(view) {
    if (!view) return null;
    var slot = view.querySelector(':scope > .cici-slot');
    if (!slot) {
      slot = document.createElement('div'); slot.className = 'cici-slot cici-slot-compact';
      var bubz = document.createElement('div'); bubz.className = 'cici-bub'; slot.appendChild(bubz);
      view.insertBefore(slot, view.firstChild);
    }
    if (view.id === 'log') {
      var band = view.querySelector('.sc-band');
      if (band) {
        var bar = view.querySelector('.cici-talkbar');
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'cici-talkbar cici-talkbar-compact';
          if (band.nextSibling) band.parentNode.insertBefore(bar, band.nextSibling);
          else band.parentNode.appendChild(bar);
        }
        slot._talkbar = bar;
      }
    } else {
      var tb = view.querySelector('.tb');
      if (tb) {
        var bar = view.querySelector('.cici-talkbar');
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'cici-talkbar cici-talkbar-compact';
          var host = tb.parentNode;
          if (tb.nextSibling) host.insertBefore(bar, tb.nextSibling); else host.appendChild(bar);
        }
        slot._talkbar = bar;
      }
    }
    return slot;
  }
  function activeView() { return document.querySelector('.view.active') || document.getElementById('home'); }
  function setLive(next) {
    allDocks().forEach(function (d) {
      var live = d === next;
      d.classList.toggle('is-live', live);
      d.classList.toggle('is-parked', !live);
      if (live) d.id = 'crewdock';
      else if (d.id === 'crewdock') d.removeAttribute('id');
      d.style.display = live && on ? '' : (live ? 'none' : '');
    });
    if (next) { bindLive(next); syncPhase(next); }
  }
  function dockForSlot(slot, kind) {
    if (!slot) return null;
    var existing = slot.querySelector('.crewdock');
    if (existing) return existing;
    kind = kind || 'compact';
    var free = null;
    allDocks().forEach(function (d) {
      if (!free && d.getAttribute('data-crewdock') === kind && (!d.parentNode || d.parentNode === document.body)) free = d;
    });
    var d = free || makeDock(kind);
    if (!free) {
      ensureRig(d.querySelector('.cd-doc'));
      if (showing === 'idle') { d.classList.remove('is-emote'); d.setAttribute('data-act', 'idle'); }
      else { d.classList.add('is-emote'); d.setAttribute('data-act', showing); var fig = d.querySelector('.cd-doc'); if (fig) fig.classList.add('is-emote'); }
      if (ready) d.classList.add('is-ready');
    }
    slot.appendChild(d);
    syncPhase(d);
    return d;
  }
  function park() {
    if (window.__pkSkipPark) return;
    var view = activeView(), id = view && view.id;
    if (id === 'welcome' || id === 'locked') {
      setLive(dock);
      if (dock) dock.style.display = 'none';
      return;
    }
    var next = null, slot, zone;
    if (id === 'home') {
      slot = ensureHomeSlot();
      next = dockForSlot(slot, homeKind());
      if (talkbar && bub && bub.parentNode !== talkbar) talkbar.appendChild(bub);
    } else {
      slot = ensureCompactSlot(view);
      next = dockForSlot(slot, 'compact');
      zone = (slot && slot._talkbar) || (slot && slot.querySelector('.cici-bub'));
      if (zone && bub && bub.parentNode !== zone) zone.appendChild(bub);
    }
    setLive(next || dock);
    if (dock) dock.style.display = on ? '' : 'none';
    allDocks().forEach(function (d) { if (!on) d.style.display = 'none'; });
    if (bub && !bub.hidden) placeBub();
  }
  var tapRot = 0;
  function commitAct(name) {
    var vis;
    if (name === 'talk') {
      vis = TALK_ROTATE[talkRot++ % TALK_ROTATE.length];
    } else {
      vis = visualOf(name);
    }
    if (vis === 'run') vis = 'idle';
    allDocks().forEach(function (d) { d.setAttribute('data-act', vis); });
    showZzz(false);
    applySrc(vis);
  }
  function play(name, opts) {
    opts = opts || {};
    lastInput = Date.now();
    name = name || 'idle';
    if (name === 'hello') name = 'wave';
    if (!on || away()) return name;
    clearTimeout(transT);
    commitAct(name); /* instant hard swap — no 16 ms / 360 ms crossfade */
    if (opts.say) say(opts.say, opts.bubbleMs || BUBMS);
    clearTimeout(actT);
    var vis = (name === 'talk') ? 'talk' : visualOf(name);
    var dur = opts.duration != null ? opts.duration : ACT_MS[name] || ACT_MS[vis];
    if (dur && name !== 'idle' && name !== 'sleepy' && vis !== 'idle') {
      actT = setTimeout(function () {
        play('idle', { instant: true });
      }, dur);
    }
    return name;
  }


  dock.style.display = on ? '' : 'none'; document.documentElement.classList.toggle('crew-off', !on);
  mount(); hdr(); themeIco(); cycle(); setTimeout(firstRun, 0);
  park();
  ['calc', 'about', 'log', 'rules', 'places', 'crew', 'detail', 'quest'].forEach(function (id) {
    var v = document.getElementById(id);
    if (v) dockForSlot(ensureCompactSlot(v), 'compact');
  });
  park();
  allDocks().forEach(function (d) { d.setAttribute('data-act', 'idle'); });
  setTimeout(function firstWave() {
    if (window.__pkFreezeCrew) return;
    if (document.body.classList.contains('pk-welcome') || (location.hash || '') === '#/welcome') { setTimeout(firstWave, 600); return; }
    if (!RM) play('claims');
  }, 700);
  setInterval(function () {
    if (window.__pkFreezeCrew) return;
    if (!on || document.hidden || away() || document.body.classList.contains('pk-welcome')) return;
    if (Date.now() - lastInput > 60000) {
      var act = dock.getAttribute('data-act');
      if (act !== 'stand' && act !== 'eat') play('sleepy');
    }
  }, 4000);
  document.addEventListener('pointerdown', function () { lastInput = Date.now(); var act = dock.getAttribute('data-act'); if (act === 'stand' || act === 'eat') play('idle'); }, { passive: true });
  if (document.getElementById('app')) new MutationObserver(function () {
    allDocks().forEach(function (d) { if (d && !document.body.contains(d) && d.parentNode == null) document.body.appendChild(d); });
    park();
  }).observe(document.getElementById('app'), { childList: true, subtree: true });
  new MutationObserver(function () { park(); }).observe(document.body, { attributes: true, attributeFilter: ['data-view', 'class'] });

  window.addEventListener('offline', function () { if (on && !away()) play('offline', { say: "We're offline \u2014 I'll keep your data safe on this phone." }); });
  var searchT = 0;
  document.addEventListener('input', function (e) {
    var el = e.target; if (!el) return;
    if (el.id === 'q' || el.id === 'pk_p' || el.id === 'pk_s' || el.getAttribute('data-which') || (el.classList && el.classList.contains('lp-q'))) {
      clearTimeout(searchT);
      if (on && !away()) play('mining');
    }
  }, { passive: true });
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && (e.target.closest('#list .row') || e.target.closest('[data-calcp]') || e.target.closest('[data-go]') || e.target.closest('[data-calcs]'));
    if (t && on && !away()) play('found');
  });
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('cici-paused', document.hidden);
  });

  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.target && e.target.classList) e.target.classList.toggle('is-offscreen', !e.isIntersecting);
      });
    }, { threshold: 0.01 });
    allDocks().forEach(function (d) { io.observe(d); });
    var _park = park;
    park = function () { _park(); allDocks().forEach(function (d) { try { io.observe(d); } catch (e) {} }); };
  }

  window.PK_CREW = {
    renderPicker: renderPicker,
    name: function () { return CREW[cur][1]; },
    mascot: function () { return 'Cici'; },
    avatar: function () { return 'Cici the Legendary PhilHealth Miner'; },
    react: function (msg) { if (on && !away()) play('celebrate', { say: typeof msg === 'string' && msg ? msg : 'Logged!', bubbleMs: 2800 }); },
    aboutHTML: function () {
      return '<div class="mset crewrow"><span class="crewmini"><img src="art/miner/anim/about-mini.webp" alt="Cici the Legendary PhilHealth Miner" width="48" height="48" onerror="this.onerror=null;this.src=\'art/miner/anim/about-mini.png\'"></span> Avatar: <b>Cici the Legendary PhilHealth Miner</b></div>' +
        '<label class="mset"><input type="checkbox" id="crewToggle"' + (on ? ' checked' : '') + '> Show Cici on screen</label>';
    },
    CREW: CREW, LINES: LINES, EMOJI: EMOJI, EVERY: EVERY, cur: function () { return 'cici'; },
    chosen: function () { return true; },
    remount: function () { mount(); hdr(); park(); },
    play: play,
    _say: function (t, ms) { say(t, ms); }, _emoji: emoji, _pickLine: pickLine, _pickEmoji: pickEmoji, _tap: tapGo, _away: away, _tick: tick, _cycle: cycle, _stop: function () { clearTimeout(cycT); },
    _reset: function () { n = 0; lastLine = -1; lastEmo = -1; clearEmote(); }, _last: function () { return lastEv; }, _pick: pick,
    _geo: geo, _ready: function () { return ready; }, _hide: hideBub, _emote: showEmote, _src: function () { return showing; },
    _state: function () { return { who: 'cici', side: side, bubble: !bub.hidden, n: n, on: on, cur: 'cici', chosen: true, emote: showing }; }
  };
})();
