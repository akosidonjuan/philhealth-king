/* PHILHEALTH KING: keep Log Pose / .view gutters lined up with the tab bar.
   Does not touch data, sync, or APIs. Measures the menubar box against the
   in-flow #app column and sets --pk-gutter-left / --pk-gutter-right.

   Folded Duo Home Screen / standalone: the tab bar is often position:fixed
   against a 466pt screen (ends at the 84pt rail, x=382) while #app / the
   in-flow ICB is already 382 and env(safe-area-inset-right) is still 84.
   Using visualViewport or innerWidth (466) here would set
   --pk-gutter-right to 84 and shrink content to ~286, leaving the wide
   gap JC photographed. Always use #app's in-flow width and clamp the
   bar's right edge to that box. */
(function () {
  'use strict';
  var root = document.documentElement;
  var pending = 0;
  function px(n) { return Math.max(0, Math.round(n * 100) / 100) + 'px'; }
  function align() {
    var mb = document.querySelector('.menubar');
    if (!mb) return;
    var r = mb.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // Unfolded landscape uses a left side rail — don't treat it as a bottom bar.
    if (r.height > r.width * 1.2 || r.width < 120) {
      root.style.removeProperty('--pk-gutter-left');
      root.style.removeProperty('--pk-gutter-right');
      return;
    }
    var host = document.getElementById('app') || root;
    var box = host.getBoundingClientRect();
    var leftEdge = box.width ? box.left : 0;
    var layoutW = box.width || root.clientWidth || 0;
    if (!layoutW) return;
    var rightLimit = leftEdge + layoutW;
    var rightEdge = Math.min(r.right, rightLimit);
    var left = Math.max(0, r.left - leftEdge);
    var right = Math.max(0, rightLimit - rightEdge);
    root.style.setProperty('--pk-gutter-left', px(left));
    root.style.setProperty('--pk-gutter-right', px(right));
  }
  function schedule() {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = 0; align(); });
  }
  function start() {
    align();
    schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.addEventListener('pageshow', schedule);
    window.addEventListener('hashchange', function () { setTimeout(schedule, 50); });
    if (window.visualViewport) {
      visualViewport.addEventListener('resize', schedule);
      visualViewport.addEventListener('scroll', schedule);
    }
    if (typeof ResizeObserver !== 'undefined') {
      var mb = document.querySelector('.menubar');
      if (mb) new ResizeObserver(schedule).observe(mb);
      var app = document.getElementById('app');
      if (app) new ResizeObserver(schedule).observe(app);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* Hidden layout diagnostic: 5 taps on the About version line (.devsub)
   opens an overlay with viewport / safe-area / box measurements.
   Inert otherwise. Does not touch data, sync, or APIs. */
(function () {
  'use strict';
  var taps = 0, t0 = 0, open = false;
  function inset(side) {
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding-' + side + ':env(safe-area-inset-' + side + ', 0px)';
    document.documentElement.appendChild(el);
    var v = getComputedStyle(el)['padding' + side.charAt(0).toUpperCase() + side.slice(1)];
    el.parentNode.removeChild(el);
    return v || '0px';
  }
  function rectOf(sel) {
    var el = document.querySelector(sel);
    if (!el) return sel + ': (missing)';
    var r = el.getBoundingClientRect();
    var cs = getComputedStyle(el);
    return sel + ': x=' + r.left.toFixed(1) + ' y=' + r.top.toFixed(1) +
      ' w=' + r.width.toFixed(1) + ' h=' + r.height.toFixed(1) +
      ' pad=' + cs.paddingLeft + '/' + cs.paddingRight +
      (cs.left !== 'auto' || cs.right !== 'auto' ? ' left=' + cs.left + ' right=' + cs.right : '');
  }
  function modes() {
    var out = [];
    ['standalone', 'fullscreen', 'minimal-ui', 'browser'].forEach(function (m) {
      try { if (window.matchMedia && matchMedia('(display-mode: ' + m + ')').matches) out.push(m); } catch (e) {}
    });
    return out.join(', ') || '(none)';
  }
  function dump() {
    var vv = window.visualViewport;
    var rs = getComputedStyle(document.documentElement);
    var lines = [
      'PHILHEALTH KING layout debug',
      'version: ' + (window.APP_VERSION || '?'),
      'time: ' + new Date().toString(),
      '',
      'display-mode: ' + modes(),
      'navigator.standalone: ' + (window.navigator.standalone === true ? 'true' : window.navigator.standalone === false ? 'false' : 'unset'),
      'html.standalone: ' + document.documentElement.classList.contains('standalone'),
      '',
      'innerWidth x innerHeight: ' + window.innerWidth + ' x ' + window.innerHeight,
      'clientWidth x clientHeight: ' + document.documentElement.clientWidth + ' x ' + document.documentElement.clientHeight,
      'documentElement.scrollWidth: ' + document.documentElement.scrollWidth,
      'body.clientWidth / scrollWidth: ' + (document.body ? document.body.clientWidth + ' / ' + document.body.scrollWidth : '?'),
      'visualViewport: ' + (vv ? (vv.width + ' x ' + vv.height + ' offset=' + vv.offsetLeft + ',' + vv.offsetTop + ' scale=' + vv.scale) : '(none)'),
      'screen: ' + screen.width + ' x ' + screen.height + ' avail=' + screen.availWidth + ' x ' + screen.availHeight,
      'devicePixelRatio: ' + window.devicePixelRatio,
      '',
      'safe-area-inset-top: ' + inset('top'),
      'safe-area-inset-right: ' + inset('right'),
      'safe-area-inset-bottom: ' + inset('bottom'),
      'safe-area-inset-left: ' + inset('left'),
      '--pk-gutter-left: ' + (rs.getPropertyValue('--pk-gutter-left') || '(unset)'),
      '--pk-gutter-right: ' + (rs.getPropertyValue('--pk-gutter-right') || '(unset)'),
      '',
      rectOf('#app'),
      rectOf(document.querySelector('.view.active') ? '.view.active' : '.view'),
      rectOf('.menubar'),
      '',
      '@media (min-width: 450px) and (max-width: 500px): ' + (matchMedia('(min-width: 450px) and (max-width: 500px)').matches ? 'MATCH' : 'no'),
      '@media (display-mode: standalone): ' + (matchMedia('(display-mode: standalone)').matches ? 'MATCH' : 'no'),
      '',
      'UA: ' + navigator.userAgent
    ];
    return lines.join('\n');
  }
  function close() {
    var ov = document.getElementById('pk-layout-debug');
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    open = false;
  }
  function show() {
    close();
    open = true;
    var ov = document.createElement('div');
    ov.id = 'pk-layout-debug';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Layout debug');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:10px;box-sizing:border-box;';
    var card = document.createElement('div');
    card.style.cssText = 'width:100%;max-width:520px;max-height:94%;overflow:auto;-webkit-overflow-scrolling:touch;background:#111;color:#f3f3f0;border-radius:14px;padding:12px 12px 12px;box-sizing:border-box;box-shadow:0 8px 32px rgba(0,0,0,.45);';
    var pre = document.createElement('pre');
    pre.style.cssText = 'margin:0 0 10px;white-space:pre-wrap;word-break:break-word;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;';
    pre.textContent = dump();
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Close';
    btn.style.cssText = 'display:block;width:100%;min-height:44px;border:0;border-radius:10px;background:#e8c547;color:#1a1408;font:700 16px/1 system-ui,sans-serif;';
    btn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    card.appendChild(pre);
    card.appendChild(btn);
    card.addEventListener('click', function (e) { e.stopPropagation(); });
    ov.appendChild(card);
    ov.addEventListener('click', close);
    document.body.appendChild(ov);
  }
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('.devsub');
    if (!el) return;
    var now = Date.now();
    if (now - t0 > 2000) taps = 0;
    t0 = now;
    taps += 1;
    if (taps < 5) return;
    taps = 0;
    show();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (open && e.key === 'Escape') close();
  });
})();
