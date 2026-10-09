/* PHILHEALTH KING v2.0.0 one-time migration of v1.0.0 data (same localStorage keys, same app origin, so an APK update keeps it):
   - Log entries that only have patient INITIALS get a name field made from them ("JDC" -> "J. D. C."), so the new name field is
     never blank and the initials stay exactly the same (they are re-derived from the name). Edit the name any time.
   - The v1 One Piece crew pick maps to a doctor: Nami / Robin -> Doktora (fdoc), every other crew member -> Doktor (mdoc).
   Runs before store.js / crew.js; leaves pk_migrated_v2 = {at, names, crew} so it runs once. */
(function () {
  try {
    if (localStorage.getItem('pk_migrated_v2')) return;
    var raw = JSON.parse(localStorage.getItem('pk_pflog_v1') || 'null'), n = 0;
    if (raw && Array.isArray(raw.entries)) raw.entries.forEach(function (e) {
      if (!e || String(e.name || '').trim()) return; var L = String(e.pt || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
      if (L) { e.name = L.split('').join('. ') + '.'; n++; } });
    if (n) localStorage.setItem('pk_pflog_v1', JSON.stringify(raw));
    var c = localStorage.getItem('pk_crew') || '', to = '';
    if (c && c !== 'fdoc' && c !== 'mdoc') { to = (c === 'nami' || c === 'robin') ? 'fdoc' : 'mdoc'; localStorage.setItem('pk_crew', to); }
    localStorage.setItem('pk_migrated_v2', JSON.stringify({ at: Date.now(), names: n, crew: c ? c + (to ? '->' + to : '') : '' }));
  } catch (e) {}
})();
window.PK_INI_NAME = function (pt) { var L = String(pt || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); return L ? L.split('').join('. ') + '.' : ''; };
