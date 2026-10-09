/* PHILHEALTH KING "Places" manager: editable location types (add / rename / icon / reorder / delete with reassign-or-keep)
   and saved places (add / rename across entries with count confirm / change type / default / hide from quick picks / delete).
   Route #/places (from New Quest "Edit places" and About). Edit dialogs use the #pksheet bottom sheet. */
(function () {
  function S() { return window.PK_STORE; } function C() { return window.EENT_CORE; } function esc(s) { return C().esc(s); }
  var sheet = null, dlg = null;   // dlg = {kind:'type'|'place', ...state}
  function body() { return document.getElementById('placesBody'); }
  function render() {
    var st = S(), T = st.types(), act = T.filter(function (t) { return !t.hidden; }), old = T.filter(function (t) { return t.hidden; }), P = st.places(), by = st.LOCBY;
    var h = '<div class="win"><div class="tb"><span class="tb-t">Ward Map : Places</span><span class="tb-btns"><button class="tbx" data-pl="done" aria-label="Close">x</button></span></div><div class="wbody">';
    h += '<div class="sec" style="margin-top:0">Location types</div><ul class="plist">';
    act.forEach(function (t, i) {
      h += '<li class="prow"><span class="pico">' + pix(t.icon, 24) + '</span><div class="pm"><b>' + esc(t.name) + '</b><span>' + t.uses + ' entr' + (t.uses === 1 ? 'y' : 'ies') + '</span></div>' +
        '<button class="rbtn sm pmv" data-plmv="' + t.id + '" data-d="-1" aria-label="Move ' + esc(t.name) + ' up"' + (i ? '' : ' disabled') + '>\u25B2</button>' +
        '<button class="rbtn sm pmv" data-plmv="' + t.id + '" data-d="1" aria-label="Move ' + esc(t.name) + ' down"' + (i < act.length - 1 ? '' : ' disabled') + '>\u25BC</button>' +
        '<button class="rbtn sm" data-pltype="' + t.id + '">Edit</button></li>';
    });
    h += '</ul>' + (old.length ? '<p class="hint">Retired types kept on old entries: ' + old.map(function (t) { return esc(t.name) + ' (' + t.uses + ')'; }).join(', ') + '</p>' : '');
    h += '<div class="btnrow left"><button class="rbtn" data-pltype="new">+ Add type</button></div>';
    h += '<div class="sec">Saved places</div><p class="hint" style="margin-top:0">\u2605 = default place pre-filled on new quests. Hidden places stay on old entries but not in quick picks.</p><ul class="plist">';
    if (!P.length) h += '<li class="prow"><div class="pm"><span>No saved places yet.</span></div></li>';
    P.slice().sort(function (a, b) { return (b.fav - a.fav) || (a.hidden - b.hidden) || a.name.localeCompare(b.name); }).forEach(function (p) {
      var L = by[p.loc] || by.none;
      h += '<li class="prow' + (p.hidden ? ' hid' : '') + '"><span class="pico">' + pix(L[2], 20) + '</span><div class="pm"><b>' + (p.fav ? '<span class="pfav" aria-label="Default">\u2605</span> ' : '') + esc(p.name) + '</b><span>' + esc(L[1]) + ' \u00B7 ' + p.uses + ' entr' + (p.uses === 1 ? 'y' : 'ies') + (p.hidden ? ' \u00B7 hidden' : '') + '</span></div>' +
        '<button class="rbtn sm" data-plplace="' + esc(p.name) + '">Edit</button></li>';
    });
    h += '</ul><div class="btnrow left"><button class="rbtn" data-plplace="">+ Add place</button></div>';
    h += '<p class="disc">Renaming a place updates every entry that uses it. Places and types are included in Backup JSON.</p></div></div>';
    body().innerHTML = h;
  }
  // ---------- bottom sheet ----------
  function openSheet() { if (!sheet) { sheet = document.createElement('div'); sheet.id = 'pksheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); document.body.appendChild(sheet); } sheet.classList.add('show'); document.body.classList.add('pk-sheet'); drawSheet(); }
  function closeSheet() { dlg = null; if (sheet) sheet.classList.remove('show'); document.body.classList.remove('pk-sheet'); render(); }
  function drawSheet() {
    var st = S(), h = '';
    if (dlg.kind === 'type') {
      var t = dlg.id ? st.types().filter(function (x) { return x.id === dlg.id; })[0] : null;
      sheet.setAttribute('aria-label', t ? 'Edit location type' : 'Add location type');
      h = '<div class="win sheetwin"><div class="tb"><span class="tb-t">' + (t ? 'Edit type' : 'New location type') + '</span><span class="tb-btns"><button class="tbx" data-pls="cancel" aria-label="Close">x</button></span></div><div class="wbody">';
      if (dlg.confirmDel) {
        var others = st.LOCS.filter(function (l) { return l[0] !== dlg.id; });
        h += '<p><b>Delete \u201C' + esc(t.name) + '\u201D?</b> It is used by <b>' + t.uses + '</b> entr' + (t.uses === 1 ? 'y' : 'ies') + '.</p>' +
          '<label class="mset"><input type="radio" name="pldm" value="reassign"' + (dlg.mode !== 'keep' ? ' checked' : '') + '> Move them to <select id="pl_to" class="qsel">' + others.map(function (l) { return '<option value="' + l[0] + '">' + esc(l[1]) + '</option>'; }).join('') + '</select></label>' +
          '<label class="mset"><input type="radio" name="pldm" value="keep"' + (dlg.mode === 'keep' ? ' checked' : '') + '> Keep as-is (entries keep \u201C' + esc(t.name) + '\u201D; type hidden from pickers)</label>' +
          (dlg.err ? '<div class="warnbox">' + esc(dlg.err) + '</div>' : '') +
          '<div class="btnrow left"><button class="rbtn danger" data-pls="delgo">Delete type</button><button class="rbtn" data-pls="delno">Back</button></div></div></div>';
        sheet.innerHTML = h; return;
      }
      h += '<div class="pfrow"><label for="pl_name">Name</label><input id="pl_name" type="text" maxlength="24" placeholder="e.g. ASC, Mission" value="' + esc(dlg.name) + '"></div>' +
        '<div class="plico"><span class="lbl">Icon</span><div class="icogrid" role="radiogroup" aria-label="Icon">' + st.TYPE_ICONS.map(function (ic) { return '<button class="icoopt' + (dlg.icon === ic ? ' on' : '') + '" role="radio" aria-checked="' + (dlg.icon === ic) + '" aria-label="' + ic + '" data-plico="' + ic + '">' + pix(ic, 28) + '</button>'; }).join('') + '</div></div>' +
        '<div class="pprev">Preview: <span class="locb">' + pix(dlg.icon, 12) + esc(dlg.name || 'Type') + '</span></div>' +
        (dlg.err ? '<div class="warnbox">' + esc(dlg.err) + '</div>' : '') +
        '<div class="btnrow left"><button class="rbtn" data-pls="save">Save</button><button class="rbtn" data-pls="cancel">Cancel</button>' + (t ? '<button class="rbtn danger" data-pls="del">Delete\u2026</button>' : '') + '</div></div></div>';
    } else {
      var p = dlg.old ? st.places().filter(function (x) { return x.name === dlg.old; })[0] : null, n = p ? p.uses : 0;
      sheet.setAttribute('aria-label', p ? 'Edit place' : 'Add place');
      h = '<div class="win sheetwin"><div class="tb"><span class="tb-t">' + (p ? 'Edit place' : 'New place') + '</span><span class="tb-btns"><button class="tbx" data-pls="cancel" aria-label="Close">x</button></span></div><div class="wbody">';
      if (dlg.confirm) {
        h += '<p>' + dlg.confirm + '</p><div class="btnrow left"><button class="rbtn" data-pls="' + dlg.confirmAct + '">' + dlg.confirmBtn + '</button><button class="rbtn" data-pls="back">Back</button></div></div></div>';
        sheet.innerHTML = h; return;
      }
      h += '<div class="pfrow"><label for="pl_name">Name</label><input id="pl_name" type="text" maxlength="80" placeholder="e.g. Cardinal Santos Medical Center" value="' + esc(dlg.name) + '"></div>' +
        '<div class="pfrow"><span class="lbl">Type</span><div class="locseg" role="radiogroup">' + st.LOCS.map(function (l) { return '<button class="locopt' + (dlg.loc === l[0] ? ' on' : '') + '" role="radio" aria-checked="' + (dlg.loc === l[0]) + '" data-plloc="' + l[0] + '">' + pix(l[2], 22) + '<span>' + esc(l[1]) + '</span></button>'; }).join('') + '</div></div>' +
        (p && n && p.loc !== dlg.loc ? '<label class="mset"><input type="checkbox" id="pl_apply"' + (dlg.apply ? ' checked' : '') + '> Also change type on its ' + n + ' existing entr' + (n === 1 ? 'y' : 'ies') + '</label>' : '') +
        '<label class="mset"><input type="checkbox" id="pl_fav"' + (dlg.fav ? ' checked' : '') + '> \u2605 Default place for new quests</label>' +
        '<label class="mset"><input type="checkbox" id="pl_show"' + (!dlg.hidden ? ' checked' : '') + '> Show in quick picks</label>' +
        (dlg.err ? '<div class="warnbox">' + esc(dlg.err) + '</div>' : '') +
        '<div class="btnrow left"><button class="rbtn" data-pls="save">Save</button><button class="rbtn" data-pls="cancel">Cancel</button>' + (p ? '<button class="rbtn danger" data-pls="del">Delete</button>' : '') + '</div>' +
        (p ? '<p class="hint">' + n + ' entr' + (n === 1 ? 'y uses' : 'ies use') + ' this place.</p>' : '') + '</div></div>';
    }
    sheet.innerHTML = h;
  }
  function readDlg() { var g = function (id) { return document.getElementById(id); }; if (!dlg) return; if (g('pl_name')) dlg.name = g('pl_name').value; if (g('pl_fav')) dlg.fav = g('pl_fav').checked; if (g('pl_show')) dlg.hidden = !g('pl_show').checked; if (g('pl_apply')) dlg.apply = g('pl_apply').checked;
    var r = document.querySelector('input[name=pldm]:checked'); if (r) dlg.mode = r.value; if (g('pl_to')) dlg.to = g('pl_to').value; }
  function toast(t) { C().toast(t); }
  function savePlace(force) {
    var st = S(), name = dlg.name.trim();
    if (!dlg.old) { var r = st.addPlace(name, dlg.loc, { fav: dlg.fav, hidden: dlg.hidden }); if (r.error) { dlg.err = r.error; return drawSheet(); } toast('Place added'); return closeSheet(); }
    var n = st.placeUse(dlg.old);
    if (!force && name && name !== dlg.old && n) { dlg.confirm = 'Rename \u201C' + esc(dlg.old) + '\u201D to \u201C' + esc(name) + '\u201D? This updates <b>' + n + '</b> existing entr' + (n === 1 ? 'y' : 'ies') + '.'; dlg.confirmAct = 'renamego'; dlg.confirmBtn = 'Rename ' + n + ' entr' + (n === 1 ? 'y' : 'ies'); return drawSheet(); }
    var res = st.updatePlace(dlg.old, { name: name, loc: dlg.loc, fav: dlg.fav, hidden: dlg.hidden }, { applyType: dlg.apply });
    if (res.error) { dlg.err = res.error; dlg.confirm = null; return drawSheet(); }
    toast('Saved' + (res.renamed ? ' \u00B7 renamed in ' + res.renamed + ' entr' + (res.renamed === 1 ? 'y' : 'ies') : '') + (res.retyped ? ' \u00B7 type changed on ' + res.retyped : '')); closeSheet();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return; var b;
    if ((b = t.closest('[data-editplaces]'))) { e.preventDefault(); if (window.PK_QUEST && PK_QUEST._keepForm) PK_QUEST._keepForm(); location.hash = '#/places'; return; }
    if (t.closest('#places')) {
      if ((b = t.closest('[data-pl="done"]'))) { if (history.length > 1) history.back(); else location.hash = '#/about'; return; }
      if ((b = t.closest('[data-plmv]'))) { S().moveType(b.dataset.plmv, +b.dataset.d); render(); return; }
      if ((b = t.closest('[data-pltype]'))) { var id = b.dataset.pltype, ty = id !== 'new' && S().types().filter(function (x) { return x.id === id; })[0]; dlg = { kind: 'type', id: ty ? id : null, name: ty ? ty.name : '', icon: ty ? ty.icon : 'anchor' }; openSheet(); setTimeout(function () { var i = document.getElementById('pl_name'); if (i && !ty) i.focus(); }, 30); return; }
      if ((b = t.closest('[data-plplace]'))) { var nm = b.dataset.plplace, p = nm && S().places().filter(function (x) { return x.name === nm; })[0]; dlg = p ? { kind: 'place', old: p.name, name: p.name, loc: p.loc, fav: p.fav, hidden: p.hidden, apply: false } : { kind: 'place', old: null, name: '', loc: S().LOCS[0][0], fav: false, hidden: false }; openSheet(); return; }
    }
    if (!sheet || !t.closest('#pksheet') || !dlg) return;
    readDlg();
    if ((b = t.closest('[data-plico]'))) { dlg.icon = b.dataset.plico; drawSheet(); return; }
    if ((b = t.closest('[data-plloc]'))) { dlg.loc = b.dataset.plloc; drawSheet(); return; }
    if (!(b = t.closest('[data-pls]'))) return;
    var a = b.dataset.pls, st = S(); dlg.err = null;
    if (a === 'cancel') return closeSheet();
    if (dlg.kind === 'type') {
      if (a === 'save') { if (!dlg.name.trim()) { dlg.err = 'Enter a name.'; return drawSheet(); } if (dlg.id) st.updateType(dlg.id, { name: dlg.name, icon: dlg.icon }); else st.addType(dlg.name, dlg.icon); toast('Type saved'); return closeSheet(); }
      if (a === 'del') { var ty2 = st.types().filter(function (x) { return x.id === dlg.id; })[0]; if (st.LOCS.length <= 1) { dlg.err = 'Keep at least one location type.'; return drawSheet(); }
        if (!ty2.uses) { st.deleteType(dlg.id, 'reassign', null); toast('Type deleted'); return closeSheet(); } dlg.confirmDel = true; return drawSheet(); }
      if (a === 'delno') { dlg.confirmDel = false; return drawSheet(); }
      if (a === 'delgo') { var r = st.deleteType(dlg.id, dlg.mode || 'reassign', dlg.to); if (r.error) { dlg.err = r.error; return drawSheet(); } toast(r.moved ? 'Moved ' + r.moved + ' entries' : 'Type retired; ' + r.kept + ' entries kept as-is'); return closeSheet(); }
    } else {
      if (a === 'save') return savePlace(false);
      if (a === 'renamego') return savePlace(true);
      if (a === 'back') { dlg.confirm = null; return drawSheet(); }
      if (a === 'del') { var n = st.placeUse(dlg.old); dlg.confirm = 'Remove \u201C' + esc(dlg.old) + '\u201D from saved places and quick picks?' + (n ? ' Its ' + n + ' existing entr' + (n === 1 ? 'y keeps' : 'ies keep') + ' the name.' : ''); dlg.confirmAct = 'delgo'; dlg.confirmBtn = 'Remove place'; return drawSheet(); }
      if (a === 'delgo') { st.deletePlace(dlg.old); toast('Place removed'); return closeSheet(); }
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet && sheet.classList.contains('show')) closeSheet(); });
  window.addEventListener('hashchange', function () { if (sheet && sheet.classList.contains('show') && location.hash !== '#/places') closeSheet(); });
  window.PK_PLACES = { render: render, _dlg: function () { return dlg; }, _close: closeSheet };
})();
