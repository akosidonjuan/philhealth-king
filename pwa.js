/* PHILHEALTH KING PWA glue: service worker (offline), persistent storage request, one-time iOS install hint.
   Everything is feature-detected and fails silently (e.g. file://, private mode, old browsers).
   iOS-delay preview: check for updates when the app is shown, and reload once when a new worker takes control
   (standalone home-screen PWAs on iOS otherwise keep the old page until the user force-closes them). */
(function () {
  'use strict';
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  document.documentElement.classList.toggle('standalone', !!standalone);
  window.PWA_STATUS = { sw: 'unsupported', persisted: null, standalone: !!standalone };
  var wantReload = false;
  var reloading = false;
  function toast(msg) { var t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.style.opacity = 1; setTimeout(function () { t.style.opacity = 0; }, 3500); }
  function checkUpdate(reg) { if (reg && reg.update) reg.update().catch(function () {}); }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
        window.PWA_STATUS.sw = 'registered';
        checkUpdate(reg);
        reg.addEventListener('updatefound', function () {
          var w = reg.installing; if (!w) return;
          w.addEventListener('statechange', function () {
            if (w.state === 'installed' && navigator.serviceWorker.controller) {
              wantReload = true;
              toast('Update downloaded. Reloading…');
            }
          });
        });
        document.addEventListener('visibilitychange', function () { if (!document.hidden) checkUpdate(reg); });
        window.addEventListener('pageshow', function () { checkUpdate(reg); });
        window.addEventListener('focus', function () { checkUpdate(reg); });
      }).catch(function (e) { window.PWA_STATUS.sw = 'error: ' + e.message; });
    });
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!wantReload || reloading) return;
      reloading = true;
      try { if (sessionStorage.getItem('pk_sw_reloaded') === '1') return; sessionStorage.setItem('pk_sw_reloaded', '1'); } catch (e) {}
      location.reload();
    });
  }
  // Ask the browser not to evict our storage (procedure log + offline cache). Best effort.
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(function (p) { window.PWA_STATUS.persisted = p; }, function () {}); } catch (e) {}
  // One-time hint on iPhone/iPad Safari when not yet installed.
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var seen = false; try { seen = localStorage.getItem('pk_ios_hint') === '1'; } catch (e) {}
  if (isIOS && !standalone && !seen) {
    window.addEventListener('load', function () {
      var d = document.createElement('div'); d.className = 'iosHint'; d.setAttribute('role', 'note');
      d.innerHTML = '<b>Install:</b> tap Share <span aria-hidden="true">&#x2191;&#xFE0E;</span> then <b>Add to Home Screen</b>. Works offline after the first load.<button class="rbtn sm" aria-label="Dismiss">x</button>';
      d.querySelector('button').onclick = function () { d.remove(); try { localStorage.setItem('pk_ios_hint', '1'); } catch (e) {} };
      document.body.appendChild(d);
    });
  }
})();
