/* PHILHEALTH KING motion layer: press ripples, ambient header sky with idle/background pause.
   Simple-pass: view/tab changes are instant; no particles, springs, or save splash. Honours prefers-reduced-motion. */
(function () {
  'use strict';
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reduced() { return RM.matches; }
  var html = document.documentElement;

  // ---------- ripple on press ----------
  var RIP = '.rbtn, .tab, .chipbtn, .menubar a, .paypill, .qd, .row, .prow, .qe, .icoopt';
  document.addEventListener('pointerdown', function (e) {
    if (reduced()) return;
    var t = e.target.closest && e.target.closest(RIP); if (!t || t.disabled) return;
    t.classList.add('m-rh');
    var r = t.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, d = document.createElement('span');
    d.className = 'm-rip'; d.style.width = d.style.height = s + 'px'; d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px';
    t.appendChild(d); setTimeout(function () { d.remove(); }, 520);
  }, { passive: true, capture: true });

  // hooks kept so quest.js / callers do not throw; effects are no-ops
  window.PK_FX = {
    saved: function () {},
    coinBurst: function () {},
    splash: function () {},
    roll: function () {},
    reduced: reduced
  };

  // ---------- ambient header sky ----------
  function sky() {
    var hb = document.querySelector('.hdr .hdr-body'); if (!hb || hb.querySelector('.m-sky')) return;
    var s = document.createElement('span'); s.className = 'm-sky'; s.setAttribute('aria-hidden', 'true');
    var h = '', st = [[8, 20], [22, 60], [36, 14], [49, 44], [63, 22], [74, 62], [86, 30], [95, 12]];
    st.forEach(function (p, i) { h += '<i class="st" style="left:' + p[0] + '%;top:' + p[1] + '%;animation-delay:' + (-i * 0.73).toFixed(2) + 's;animation-duration:' + (2 + (i % 3) * 0.7) + 's"></i>'; });
    h += '<i class="sun"></i><i class="cl" style="top:8px;animation-delay:-4s"></i><i class="cl" style="top:26px;animation-delay:-17s;animation-duration:34s;transform:scale(.7)"></i>';
    s.innerHTML = h; hb.insertBefore(s, hb.firstChild);
  }
  // idle / background: pause ambient loops after 12 s without input or when hidden
  var idleT = 0;
  function wake() { html.classList.remove('m-idle'); clearTimeout(idleT); idleT = setTimeout(function () { html.classList.add('m-idle'); }, 12000); }
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, wake, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) html.classList.add('m-idle'); else wake(); });

  function init() { sky(); wake(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
