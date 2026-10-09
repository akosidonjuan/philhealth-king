/* PHILHEALTH KING preview v5: original Ghibli-STYLE scene elements (painted clouds, wind, sunbeams + dust, tea steam, a sleepy
   ward cat, a distant train, laundry, night fireflies / wisps / paper lanterns, paper grain, hand-lettered headers, tab gust).
   All art is drawn here (inline SVG, original); no characters from any film. Motion = CSS transform/opacity only (compositor),
   paused while the app is idle/hidden (html.m-idle) or a transition runs (html.m-busy); prefers-reduced-motion = static. */
(function () {
  var html = document.documentElement, RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  function night() { return html.getAttribute('data-theme') !== 'light'; }
  function U(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
  function SV(w, h, body, defs) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w * 3 + '" height="' + h * 3 + '">' + (defs ? '<defs>' + defs + '</defs>' : '') + body + '</svg>'; }
  function img(src, cls, st) { return '<img class="' + cls + '" alt="" draggable="false" src="' + src + '"' + (st ? ' style="' + st + '"' : '') + '>'; }
  function rnd(seed) { var s = seed * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  // ---------- watercolour kit ----------
  // Every piece is drawn once per theme as an SVG with the paint filters below, then BAKED: SVG -> canvas -> PNG blob URL
  // (see bake()). Only those finished bitmaps are animated (transform/opacity), so the filters never run per frame.
  function WASH(id, seed, o) {          // wet wash: uneven fading edge, mottled pigment, pigment pooled at the rim, paper tooth
    o = o || {}; var f = o.f || .045, d = o.d == null ? 4 : o.d, s = o.s == null ? .8 : o.s, rim = o.rim == null ? .5 : o.rim, rw = o.rw || 1.4,
      mot = o.mot == null ? .18 : o.mot, gr = o.gr == null ? .12 : o.gr, gf = o.gf || .9;
    function grey(a, b) { return a + ' 0 0 0 ' + b; }
    return '<filter id="' + id + '" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + f + '" numOctaves="3" seed="' + seed + '" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="' + d + '" xChannelSelector="R" yChannelSelector="G" result="dp"/>' +
      '<feGaussianBlur in="dp" stdDeviation="' + s + '" result="sb"/>' +
      '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 1.7 0 -.4" result="na"/>' +
      '<feComposite in="sb" in2="na" operator="arithmetic" k1="0" k2="1.6" k3=".85" k4="-.85" result="m"/>' +
      '<feComposite in="sb" in2="m" operator="in" result="e"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + (f * 1.9).toFixed(3) + '" numOctaves="2" seed="' + (seed + 11) + '" result="n3"/>' +
      '<feColorMatrix in="n3" type="matrix" values="' + [grey(mot * 2, 1 - mot), grey(mot * 2, 1 - mot), grey(mot * 2, 1 - mot)].join('  ') + '  0 0 0 0 1" result="mg"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + gf + '" numOctaves="1" seed="' + (seed + 23) + '" result="n4"/>' +
      '<feColorMatrix in="n4" type="matrix" values="' + [grey(gr * 2, 1 - gr), grey(gr * 2, 1 - gr), grey(gr * 2, 1 - gr)].join('  ') + '  0 0 0 0 1" result="pg"/>' +
      '<feBlend in="mg" in2="pg" mode="multiply" result="G"/>' +
      '<feBlend in="e" in2="G" mode="multiply" result="eg"/><feComposite in="eg" in2="e" operator="in" result="body"/>' +
      '<feGaussianBlur in="e" stdDeviation="' + rw + '" result="eb"/><feComposite in="e" in2="eb" operator="out" result="ra"/>' +
      '<feColorMatrix in="ra" type="matrix" values=".6 0 0 0 0  0 .56 0 0 0  0 0 .62 0 0  0 0 0 ' + (rim * 2.4).toFixed(2) + ' 0" result="rd"/>' +
      '<feComposite in="rd" in2="e" operator="in" result="rim"/>' +
      '<feMerge><feMergeNode in="body"/><feMergeNode in="rim"/></feMerge></filter>';
  }
  function PEN(id, seed, o) {           // pencil: slight wobble, graphite tooth, and BREAKS where the noise dips
    o = o || {}; var w = o.w == null ? .7 : o.w, bf = o.bf || .11, br = o.br == null ? 1 : o.br;
    return '<filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".35" numOctaves="2" seed="' + seed + '" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="' + w + '" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + bf + '" numOctaves="1" seed="' + (seed + 5) + '" result="b"/>' +
      '<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ' + (7 * br).toFixed(1) + ' 0 0 0 ' + (-(7 * br) * .36 + .02).toFixed(2) + '" result="ba"/>' +
      '<feComposite in="d" in2="ba" operator="in" result="br"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="' + (seed + 9) + '" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 1.5 0 .1" result="ga"/>' +
      '<feComposite in="br" in2="ga" operator="in"/></filter>';
  }
  // a stroked outline drawn as pencil: a thin full line + a heavier broken pass -> width varies, line breaks in places
  function pencil(d, col, w, id1, id2, extra) {
    return '<path d="' + d + '" stroke="' + col + '" stroke-width="' + (w * .55).toFixed(2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".75" filter="url(#' + id1 + ')"' + (extra || '') + '/>' +
      '<path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#' + id2 + ')"' + (extra || '') + '/>';
  }
  var MUL = ' style="mix-blend-mode:multiply"';

  // ---------- art (all original, procedural) ----------
  var ART = {};
  function cloud(seed, nt) {           // 3 washes: body, belly shadow, lit top (sun upper-left by day; the moon upper-right at night)
    var r = rnd(seed), n = 6 + Math.floor(r() * 3), c = '', ck = '', hl = '', W = 120, H = 60;
    var body = nt ? '#4f56a8' : '#fffaf0', sh = nt ? '#262668' : '#bcc4ea', lt = nt ? '#b4c2ff' : '#ffdcae', lt2 = nt ? '#eef0ff' : '#fff3dc';
    var lx = nt ? .42 : -.38;   // light comes from the right at night (moon), the left by day
    for (var i = 0; i < n; i++) { var x = 16 + (i / (n - 1)) * 88 + (r() - .5) * 8, rr = 12 + r() * 12 * (1 - Math.abs(i / (n - 1) - .5)) + 4, y = 42 - rr * .7 - r() * 4;
      c += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rr.toFixed(1) + '"/>'; ck += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (rr - 1.6).toFixed(1) + '"/>';
      hl += '<ellipse cx="' + (x + rr * lx).toFixed(1) + '" cy="' + (y - rr * .42).toFixed(1) + '" rx="' + (rr * .9).toFixed(1) + '" ry="' + (rr * .62).toFixed(1) + '"/>'; }
    var defs = '<clipPath id="k">' + ck + '<rect x="9" y="40" width="102" height="6.5" rx="3"/></clipPath>' +
      WASH('a', seed, { f: .04, d: 7, s: 1.6, rim: .26, rw: 2.4, mot: .12 }) + WASH('b', seed + 3, { f: .05, d: 5, rim: .3, mot: .18, s: 2.2, rw: 2 }) +
      WASH('c', seed + 7, { f: .05, d: 5, rim: .18, mot: .2, s: 2.4, rw: 2 }) + WASH('e', seed + 9, { f: .07, d: 3, rim: .1, mot: .1, s: 1.4, gr: .06 });
    return U(SV(W, H, '<g filter="url(#a)" opacity="' + (nt ? .96 : .95) + '"><g fill="' + body + '">' + c + '</g><rect x="8" y="40" width="104" height="8" rx="4" fill="' + body + '"/></g>' +
      '<g clip-path="url(#k)"><g filter="url(#b)"' + MUL + ' opacity="' + (nt ? .8 : .6) + '"><path d="M6 46 Q30 34 60 38 Q92 34 114 46 Q100 56 60 56 Q20 56 6 46Z" fill="' + sh + '"/></g>' +
      '<g filter="url(#c)" opacity="' + (nt ? .78 : .72) + '" fill="' + lt + '">' + hl + '</g>' +
      '<g filter="url(#e)" opacity="' + (nt ? .55 : .6) + '" fill="' + lt2 + '" transform="translate(' + (nt ? 1.5 : -1.5) + ' -1.2)">' + hl.replace(/rx="([\d.]+)" ry="([\d.]+)"/g, function (m, a, b) { return 'rx="' + (a * .55).toFixed(1) + '" ry="' + (b * .45).toFixed(1) + '"'; }) + '</g></g>', defs));
  }
  function train(nt) {                 // small distant two-car local train (cream + green band), lit windows at night
    var win = nt ? '#ffd98a' : '#a8cbd8', car = function (x) { return '<rect x="' + x + '" y="4" width="26" height="8" rx="2.2" fill="' + (nt ? '#7d7a8c' : '#f1e6c6') + '"/>' +
      '<rect x="' + x + '" y="9" width="26" height="1.6" fill="' + (nt ? '#3f5a68' : '#5e9474') + '"/>'; };
    var wins = function (x) { return [3, 8, 13, 18].map(function (d) { return '<rect x="' + (x + d) + '" y="5.6" width="3.2" height="2.4" rx=".5" fill="' + win + '"/>'; }).join(''); };
    var ol = function (x) { return 'M' + (x + 2.2) + ' 4 H' + (x + 23.8) + ' Q' + (x + 26) + ' 4 ' + (x + 26) + ' 6.2 V9.8 Q' + (x + 26) + ' 12 ' + (x + 23.8) + ' 12 H' + (x + 2.2) + ' Q' + x + ' 12 ' + x + ' 9.8 V6.2 Q' + x + ' 4 ' + (x + 2.2) + ' 4Z'; };
    return U(SV(58, 14, '<g filter="url(#w)">' + car(2) + car(30) + '</g><g filter="url(#w2)"' + MUL + '>' + wins(2) + wins(30) + '</g>' +
      pencil(ol(2) + ' ' + ol(30) + ' M8 4 L11 1 L14 4 M36 4 L39 1 L42 4 M28 8.5 H30', '#4a3f33', .7, 'p1', 'p2') +
      '<circle cx="7" cy="12.4" r="1" fill="#3a332b"/><circle cx="23" cy="12.4" r="1" fill="#3a332b"/><circle cx="35" cy="12.4" r="1" fill="#3a332b"/><circle cx="51" cy="12.4" r="1" fill="#3a332b"/>' +
      (nt ? '<circle cx="2.5" cy="9" r="1.6" fill="#fff2b0" opacity=".9"/>' : ''),
      WASH('w', 4, { f: .12, d: 1.2, s: .35, rim: .5, rw: .6, gf: 1.6 }) + WASH('w2', 6, { f: .2, d: .8, s: .25, rim: .3, rw: .4, gf: 1.6 }) + PEN('p1', 2, { w: .35, bf: .25 }) + PEN('p2', 8, { w: .35, bf: .25, br: 1.2 })));
  }
  function grass(seed, nt) {
    var r = rnd(seed), p = '', a = nt ? '#2f4c3c' : '#5e9a52', b = nt ? '#4f7560' : '#a6cf78';
    for (var i = 0; i < 9; i++) { var x = 4 + i * 4.6 + (r() - .5) * 3, h = 12 + r() * 14, lean = (r() - .4) * 10;
      p += '<path d="M' + (x - 1.4).toFixed(1) + ' 30 Q' + (x + lean * .3).toFixed(1) + ' ' + (30 - h * .6).toFixed(1) + ' ' + (x + lean).toFixed(1) + ' ' + (30 - h).toFixed(1) + ' Q' + (x + lean * .2 + 1).toFixed(1) + ' ' + (30 - h * .5).toFixed(1) + ' ' + (x + 1.6).toFixed(1) + ' 30Z" fill="url(#g)"/>'; }
    return U(SV(48, 30, '<g filter="url(#gw)">' + p + '</g>', '<linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>' + WASH('gw', seed, { f: .14, d: 1.2, s: .3, rim: .45, rw: .5, gf: 1.5 })));
  }
  function curtain(nt, flip) {         // sheer linen curtain: two thin washes, fold shadows pooled, pencil hem
    var c = nt ? '#5b64a8' : '#fbf1d9', f = nt ? '#3c437f' : '#e2cfa6', sh = 'M0 0 H20 Q17 30 19 52 Q21 70 16 80 Q9 76 4 79 Q1 60 0 40Z';
    return U(SV(22, 80, '<g' + (flip ? ' transform="translate(22 0) scale(-1 1)"' : '') + '><g filter="url(#c1)" opacity="' + (nt ? .88 : .9) + '"><path d="' + sh + '" fill="' + c + '"/></g>' +
      '<g filter="url(#c2)"' + MUL + ' opacity=".85"><path d="M5 2 Q3 40 5.5 78 L7.5 78 Q5.5 40 7.5 2Z M11 2 Q10 40 11 79 L13.5 79 Q12.5 40 13.5 2Z M17 2 Q15 30 17 52 L19 52 Q17 30 19 2Z" fill="' + f + '"/></g>' +
      pencil('M20 3 Q17 30 19 52 Q21 70 16 80 Q9 76 4 79', nt ? '#2b2f5a' : '#8a6e50', .6, 'p1', 'p2') +
      '<rect x="0" y="0" width="21" height="3" rx="1.4" fill="' + (nt ? '#2f3a55' : '#9a7a5a') + '"/></g>',
      WASH('c1', 3, { f: .07, d: 2, s: .5, rim: .5, rw: .8, mot: .14, gf: 1.3 }) + WASH('c2', 5, { f: .09, d: 1.6, s: .6, rim: .35, rw: .6, gf: 1.3 }) + PEN('p1', 4, { w: .5, bf: .16 }) + PEN('p2', 12, { w: .5, bf: .16, br: 1.3 })));
  }
  function mug(nt) {
    return U(SV(30, 24, '<ellipse cx="13" cy="21.5" rx="12" ry="2.2" fill="' + (nt ? '#2a3442' : '#d9c7a4') + '" opacity=".8" filter="url(#m3)"/>' +
      '<g filter="url(#m1)"><path d="M4 5 H22 V17 Q22 21 17 21 H9 Q4 21 4 17Z" fill="' + (nt ? '#d6cbbb' : '#f6eedd') + '"/></g>' +
      '<g filter="url(#m2)"' + MUL + ' opacity=".7"><path d="M15 6 H22 V17 Q22 21 17 21 H15Z" fill="' + (nt ? '#9b97b8' : '#e3cfae') + '"/></g>' +
      '<g filter="url(#m3)"><ellipse cx="13" cy="5.6" rx="8.4" ry="1.6" fill="#a8743a"/><path d="M9 12 q3 -4 6 0 q-3 3 -6 0Z" fill="#6fae74"/></g>' +
      pencil('M4 5 H22 V17 Q22 21 17 21 H9 Q4 21 4 17Z M21 8 q6 0 6 5 q0 5 -6 5 M12 12 l3 0', '#6b5440', 1, 'p1', 'p2'),
      WASH('m1', 2, { f: .12, d: 1.2, s: .35, rim: .55, rw: .7, gf: 1.5 }) + WASH('m2', 7, { f: .14, d: 1, s: .4, rim: .3, rw: .5, gf: 1.5 }) + WASH('m3', 9, { f: .18, d: .8, s: .3, rim: .4, rw: .4, gf: 1.5 }) +
      PEN('p1', 3, { w: .45, bf: .2 }) + PEN('p2', 13, { w: .45, bf: .2, br: 1.2 })));
  }
  function steam() { return U(SV(10, 26, '<path d="M5 25 C1 20 9 16 5 11 C2 7 8 4 5 1" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none" filter="url(#b)"/>', '<filter id="b"><feGaussianBlur stdDeviation=".7"/></filter>')); }
  // the ward cat: an original chubby calico loaf (cream, ginger + slate patches, teal collar with a leaf tag). Parts: body, head, tail.
  // Painted like the doctors: broken pencil outline of varying weight, colour patches laid as washes that slightly overrun the line.
  var CATP = PEN('p1', 21, { w: .45, bf: .13 }) + PEN('p2', 31, { w: .45, bf: .13, br: 1.25 });
  function catW(s) { return WASH('k1', s, { f: .1, d: 1.2, s: .35, rim: .5, rw: .7, mot: .16, gf: 1.4 }) + WASH('k2', s + 4, { f: .12, d: 1.6, s: .4, rim: .6, rw: .6, mot: .2, gf: 1.4 }) + WASH('k3', s + 8, { f: .16, d: 1, s: .3, rim: .4, rw: .5, mot: .14, gf: 1.4 }); }
  function catBody() {
    var o = 'M6 30 Q2 14 20 10 Q36 6 50 14 Q58 20 54 30Z';
    return U(SV(60, 34, '<defs><clipPath id="c"><path d="M5.2 30.6 Q1 14 20 9.2 Q36 5 51 13.4 Q59.4 20 55 30.6Z"/></clipPath></defs>' +
      '<ellipse cx="30" cy="31" rx="26" ry="2.6" fill="#3a2a40" opacity=".18" filter="url(#k3)"/>' +
      '<g filter="url(#k1)"><path d="' + o + '" fill="#fbf3e2"/></g>' +
      '<g filter="url(#k3)"' + MUL + ' opacity=".55"><path d="M8 28 Q12 22 24 24 Q40 27 52 24 Q55 27 54 30 H7Z" fill="#d8c8de"/></g>' +
      pencil(o + ' M12 30 q3 -3 7 0 M44 30 q3 -3 7 0', '#4e3a2c', 1.25, 'p1', 'p2') +
      '<g clip-path="url(#c)"><g filter="url(#k2)"' + MUL + ' opacity=".92"><path d="M21.4 5.4 Q34.6 3.4 40.8 16.2 Q33.4 22.8 23.6 18.6 Q17.2 12 21.4 5.4Z" fill="#e9a35a"/><path d="M9.4 21.6 Q14.2 17.4 18.6 24 Q14.2 28.6 9.6 26.4Z" fill="#e9a35a"/></g>' +
      '<g filter="url(#k3)"' + MUL + ' opacity=".9"><path d="M41.4 11.4 Q56.8 13.6 56.6 26.6 Q47.6 24.6 43.4 18.4Z" fill="#6b6878"/></g></g>', CATP + catW(40)));
  }
  function catHead() {
    var o = 'M4 8 L5 1 L10 5 Q13 4 16 5 L21 1 L22 8 Q25 13 21 19 Q13 24 5 19 Q1 13 4 8Z';
    return U(SV(26, 24, '<g filter="url(#k1)"><path d="' + o + '" fill="#fbf3e2"/></g>' +
      '<g filter="url(#k3)"' + MUL + ' opacity=".85"><path d="M5.5 3.4 L9 5.6 L6 7Z M20.5 3.4 L17 5.6 L20 7Z" fill="#f0aeb0"/><circle cx="7" cy="15.5" r="1.7" fill="#f2a9ac" opacity=".6"/><circle cx="19" cy="15.5" r="1.7" fill="#f2a9ac" opacity=".6"/></g>' +
      pencil(o, '#4e3a2c', 1.2, 'p1', 'p2') +
      '<g filter="url(#k2)"' + MUL + ' opacity=".92"><path d="M13.6 4 Q20.6 3.2 22.4 9.2 Q18.2 10.6 14.6 8.2Z" fill="#e9a35a"/></g>' +
      '<path d="M7.5 12.5 q2 1.6 4 0 M14.5 12.5 q2 1.6 4 0" stroke="#3b2e25" stroke-width="1" fill="none" stroke-linecap="round" filter="url(#p1)"/>' +
      '<path d="M12.2 15 h1.6 l-.8 1Z" fill="#d98a8a"/><path d="M13 16 q-1 1.4 -2.2 .8 M13 16 q1 1.4 2.2 .8" stroke="#3b2e25" stroke-width=".6" fill="none"/>' +
      '<path d="M2 14 h5 M2 16.4 l5 -.6 M24 14 h-5 M24 16.4 l-5 -.6" stroke="#8a7462" stroke-width=".4" filter="url(#p1)"/>' +
      '<g filter="url(#k3)"><path d="M6 19.5 Q13 23 20 19.5" stroke="#4f9a95" stroke-width="1.8" fill="none"/><path d="M13 21 q-2 2.4 0 4 q2 -1.6 0 -4Z" fill="#7cc08a"/></g>' +
      '<path d="M13 21 q-2 2.4 0 4 q2 -1.6 0 -4Z" stroke="#3f6f4c" stroke-width=".45" fill="none" filter="url(#p1)"/>', CATP + catW(50)));
  }
  function catTail() {
    var d = 'M2 12 Q14 16 22 10 Q27 6 25 3';
    return U(SV(30, 16, '<path d="' + d + '" stroke="#4e3a2c" stroke-width="5.2" fill="none" stroke-linecap="round" filter="url(#p2)"/>' +
      '<g filter="url(#k1)"><path d="' + d + '" stroke="#fbf3e2" stroke-width="3.6" fill="none" stroke-linecap="round"/></g>' +
      '<g filter="url(#k3)"' + MUL + '><path d="M15.6 13.6 Q20 12.2 22.4 9.6" stroke="#6b6878" stroke-width="3.8" fill="none" stroke-linecap="round"/></g>', CATP + catW(60)));
  }
  function laundry(kind, nt) {
    var d = { towel: ['M0 0 H16 V22 Q8 24 0 22Z', '#fbfaf2', '<path d="M-.4 15.4 H16.4 V17.2 H-.4Z M-.4 18.2 H16.4 V19.6 H-.4Z" fill="#79acd2"/>', '#7d6a55'],
      scrub: ['M3 0 H17 L21 6 L17 8 V24 H3 V8 L-1 6Z', '#8dcbbd', '<path d="M3 13 H17 V24 H3Z" fill="#6fb3a4"/>', '#3f6f63'],
      cloth: ['M0 0 H14 V16 Q7 19 0 16Z', '#f6c3cc', '<circle cx="7" cy="8" r="2.2" fill="#fbe0e6"/>', '#9a6870'] }[kind];
    return U(SV(22, 26, '<g transform="translate(1 1)"' + (nt ? ' opacity=".7"' : '') + '><g filter="url(#l1)"><path d="' + d[0] + '" fill="' + d[1] + '"/></g><g filter="url(#l2)"' + MUL + ' opacity=".8">' + d[2] + '</g>' +
      pencil(d[0] + (kind === 'scrub' ? ' M8 0 L10 5 L12 0' : ''), d[3], .7, 'p1', 'p2') +
      '<rect x="2" y="-1" width="2" height="3" fill="#b88a5a"/><rect x="' + (kind === 'cloth' ? 10 : 13) + '" y="-1" width="2" height="3" fill="#b88a5a"/></g>',
      WASH('l1', kind.length * 3, { f: .12, d: 1.4, s: .35, rim: .55, rw: .7, mot: .16, gf: 1.4 }) + WASH('l2', kind.length * 5, { f: .15, d: 1, s: .3, rim: .45, rw: .5, gf: 1.4 }) +
      PEN('p1', kind.length, { w: .45, bf: .18 }) + PEN('p2', kind.length + 7, { w: .45, bf: .18, br: 1.2 })));
  }
  function lantern() {                 // paper lantern: warm glow wash, darker pooled rims, ribs in pencil
    return U(SV(18, 30, '<path d="M9 0 V5" stroke="#3a2e26" stroke-width=".8"/><rect x="5.5" y="4.5" width="7" height="2.2" rx=".6" fill="#3a2e26"/>' +
      '<g filter="url(#n1)"><ellipse cx="9" cy="15" rx="7.5" ry="8.6" fill="url(#l)"/></g>' +
      '<g filter="url(#n2)"' + MUL + ' opacity=".55"><path d="M2.5 15 Q2.5 8 9 6.6 Q5 10 5 15 Q5 20 9 23.4 Q2.5 22 2.5 15Z M15.5 15 Q15.5 8 9 6.6 Q13 10 13 15 Q13 20 9 23.4 Q15.5 22 15.5 15Z" fill="#e0703f"/></g>' +
      pencil('M9 6.4 Q16.6 7 16.5 15 Q16.4 23 9 23.6 Q1.6 23 1.5 15 Q1.6 7 9 6.4Z M3 11 Q9 13 15 11 M2 15 Q9 17 16 15 M3 19 Q9 21 15 19', '#9a3a26', .7, 'p1', 'p2') +
      '<rect x="5.5" y="23" width="7" height="2" rx=".6" fill="#3a2e26"/><path d="M9 25 V29 M8 26 V29.5 M10 26 V29.5" stroke="#e0a040" stroke-width=".6"/>',
      '<radialGradient id="l" cx=".45" cy=".42" r=".62"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#ffbb62"/><stop offset="1" stop-color="#ec6f3e"/></radialGradient>' +
      WASH('n1', 5, { f: .13, d: 1.3, s: .35, rim: .6, rw: .8, mot: .2, gf: 1.4 }) + WASH('n2', 9, { f: .16, d: 1, s: .4, rim: .3, rw: .5, gf: 1.4 }) + PEN('p1', 6, { w: .4, bf: .2 }) + PEN('p2', 16, { w: .4, bf: .2, br: 1.3 })));
  }
  function hills(nt) {
    return U(SV(200, 40, '<g filter="url(#h1)"><path d="M0 22 Q30 8 60 18 Q90 26 120 14 Q160 4 200 18 V40 H0Z" fill="' + (nt ? '#28386a' : '#9cc3b4') + '"/></g><g filter="url(#h2)"><path d="M0 30 Q40 20 90 28 Q140 34 200 24 V40 H0Z" fill="' + (nt ? '#1d2c4c' : '#7fb08a') + '"/>' +
      [20, 64, 110, 152, 186].map(function (x) { return '<circle cx="' + x + '" cy="' + (27 + (x % 3)) + '" r="3" fill="' + (nt ? '#16233e' : '#5f9a6e') + '"/>'; }).join('') + '</g>' +
      '<path d="M0 33.2 H200" stroke="' + (nt ? '#55617a' : '#7a6a58') + '" stroke-width=".6" filter="url(#p1)"/>',
      WASH('h1', 2, { f: .05, d: 2, s: .5, rim: .4, rw: 1, mot: .16, gf: 1 }) + WASH('h2', 5, { f: .06, d: 1.6, s: .5, rim: .45, rw: 1, mot: .18, gf: 1 }) + PEN('p1', 3, { w: .4, bf: .08 })));
  }
  function brush(nt) { return U(SV(120, 10, '<path d="M2 6 Q30 2 60 5 T118 4" stroke="' + (nt ? '#e9c27a' : '#c98a4a') + '" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".85" filter="url(#wc)"/>', WASH('wc', 9, { f: .08, d: 1.6, s: .4, rim: .55, rw: .6, gf: 1.2 }))); }
  function leaf(c, v) { return U(SV(20, 12, '<path d="M1 6 Q8 -2 19 6 Q8 14 1 6Z" fill="' + c + '" stroke="' + v + '" stroke-width=".6"/><path d="M2 6 Q10 5.4 18 6 M7 6 l3 -2.6 M11 6 l3 -2.4 M7 6 l3 2.6 M11 6 l3 2.4" stroke="' + v + '" stroke-width=".5" fill="none"/>')); }
  // ---- bake: SVG (filters run here, once) -> canvas -> PNG blob URL; the DOM then only ever holds finished bitmaps ----
  var BK = {}, BKP = {};
  function bakeOne(u) {
    if (BK[u]) return Promise.resolve(BK[u]); if (BKP[u]) return BKP[u];
    return (BKP[u] = new Promise(function (res) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { try { var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0);
        c.toBlob(function (b) { BK[u] = b ? URL.createObjectURL(b) : u; res(BK[u]); }, 'image/png'); } catch (e) { BK[u] = u; res(u); } };
      im.onerror = function () { BK[u] = u; res(u); }; im.src = u; }));
  }
  function each(o, fn) { Object.keys(o).forEach(function (k) { var v = o[k]; if (typeof v === 'string') fn(o, k, v); else if (v && typeof v === 'object') each(v, fn); }); }
  // stage 1 = the theme on screen + shared pieces (cat, lantern, leaves, steam); stage 2 = the other theme, when the page is idle
  function bake(stage) {
    var cur = night() ? 'n' : 'd', todo = [];
    function add(o, k, v) { if (v.indexOf('data:image/svg') === 0) { if (BK[v]) o[k] = BK[v]; else todo.push([o, k, v]); } }
    if (stage !== 2) { Object.keys(ART).forEach(function (k) { if (k === 'd' || k === 'n') return; var v = ART[k]; if (typeof v === 'string') add(ART, k, v); else each(v, add); }); each(ART[cur], add); }
    else each(ART[cur === 'n' ? 'd' : 'n'], add);
    if (!todo.length) { if (stage !== 2) { html.setAttribute('data-sc-baked', '1'); soon(); } return Promise.resolve(); }
    var t0 = performance.now();
    return Promise.all(todo.map(function (t) { return bakeOne(t[2]); })).then(function () {
      var map = {}; todo.forEach(function (t) { map[t[2]] = BK[t[2]]; if (t[0][t[1]] === t[2]) t[0][t[1]] = BK[t[2]]; });
      document.querySelectorAll('img[src^="data:image/svg"]').forEach(function (i) { var n = map[i.getAttribute('src')]; if (n) i.src = n; });
      var ms = Math.round(performance.now() - t0) + '/' + todo.length;
      if (stage !== 2) { html.setAttribute('data-sc-baked', '1'); html.setAttribute('data-sc-bake-ms', ms); soon();
        var later = window.requestIdleCallback || function (f) { setTimeout(f, 1500); }; later(function () { bake(2).then(function () { html.setAttribute('data-sc-bake2-ms', ms2); }); }, { timeout: 4000 }); }
      else ms2 = ms;
    });
  }
  var ms2 = '';
  function svgArt() {                  // the painted SVG sources (used by tools/prebake_scene.py at BUILD time, and as a fallback)
    var o = {};
    [0, 1].forEach(function (nt) { var k = nt ? 'n' : 'd'; o[k] = { cl: [cloud(3, nt), cloud(11, nt), cloud(27, nt)], train: train(nt), grass: [grass(5, nt), grass(8, nt), grass(13, nt)], curL: curtain(nt, 0), curR: curtain(nt, 1), mug: mug(nt), hills: hills(nt), brush: brush(nt),
      towel: laundry('towel', nt), scrub: laundry('scrub', nt), cloth: laundry('cloth', nt) }; });
    o.leaves = [leaf('#8cc48a', '#4f8a56'), leaf('#b9dca0', '#6f9a5a'), leaf('#f2c46a', '#b8862f'), leaf('#f7b9c8', '#c77f92')]; o.steam = steam(); o.cb = catBody(); o.ch = catHead(); o.ct = catTail(); o.lan = lantern();
    return o;
  }
  function flat(o, pre, out) { Object.keys(o).forEach(function (k) { var v = o[k], p = pre ? pre + '.' + k : k; if (typeof v === 'string') out[p] = v; else flat(v, p, out); }); return out; }
  function build() {
    // v2.0.0: the painted pieces are PRE-RENDERED at build time (img/scene/*.png, listed in scene-baked.js), so there is
    // no paint/bake step at load. Missing files (dev builds) fall back to the live SVG -> PNG bake below.
    var PB = window.PK_SCENE_BAKED, src = svgShape();
    var keys = Object.keys(flat(src, '', {})), all = PB && keys.every(function (k) { return PB[k]; });
    if (all && !/[?&]bake=live/.test(location.search)) {
      keys.forEach(function (k) { var ks = k.split('.'), o = ART; for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]] || (o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}); o[ks[ks.length - 1]] = PB[k]; });
      html.setAttribute('data-sc-baked', '1'); html.setAttribute('data-sc-prebaked', String(keys.length)); html.setAttribute('data-sc-bake-ms', '0/0');
      return;
    }
    var a = svgArt(); Object.keys(a).forEach(function (k) { ART[k] = a[k]; });
    bake();
  }
  // the shape of ART (key paths only), without running any painter
  function svgShape() { var t = { leaves: [0, 0, 0, 0], steam: 0, cb: 0, ch: 0, ct: 0, lan: 0 };
    ['d', 'n'].forEach(function (k) { t[k] = { cl: [0, 0, 0], train: 0, grass: [0, 0, 0], curL: 0, curR: 0, mug: 0, hills: 0, brush: 0, towel: 0, scrub: 0, cloth: 0 }; });
    (function z(o) { Object.keys(o).forEach(function (k) { if (o[k] === 0) o[k] = ''; else z(o[k]); }); })(t); return t; }
  build();
  function A() { return ART[night() ? 'n' : 'd']; }

  // ---------- pieces ----------
  function cat(st) { return '<span class="sc-cat" style="' + st + '"><span class="sc-catin"><i class="sc-ct">' + img(ART.ct, '') + '</i><i class="sc-cb">' + img(ART.cb, '') + '</i><i class="sc-ch">' + img(ART.ch, '') + '</i><b class="sc-z">z</b><b class="sc-z z2">z</b></span></span>'; }
  function mugSteam(st) { return '<span class="sc-mug" style="' + st + '">' + img(A().mug, 'sc-mugi') + img(ART.steam, 'sc-st') + img(ART.steam, 'sc-st s2') + img(ART.steam, 'sc-st s3') + '</span>'; }
  function motes(n, box) { var h = '', r = rnd(7); for (var i = 0; i < n; i++) h += '<i class="sc-mote" style="left:' + (box[0] + r() * box[2]).toFixed(0) + 'px;top:' + (box[1] + r() * box[3]).toFixed(0) + 'px;animation-delay:' + (-r() * 9).toFixed(1) + 's;animation-duration:' + (7 + r() * 5).toFixed(1) + 's"></i>'; return h; }
  function flies(n, box, seed) { var h = '', r = rnd(seed || 4); for (var i = 0; i < n; i++) h += '<i class="sc-ff" style="left:' + (box[0] + r() * box[2]).toFixed(0) + 'px;top:' + (box[1] + r() * box[3]).toFixed(0) + 'px;animation-delay:' + (-r() * 8).toFixed(1) + 's;animation-duration:' + (5 + r() * 4).toFixed(1) + 's"></i>'; return h; }
  function wisp(st, d) { return '<i class="sc-wisp" style="' + st + ';animation-delay:' + d + 's"><b></b></i>'; }
  function grassRow(w, y, n, seed) { var h = '', r = rnd(seed); for (var i = 0; i < n; i++) h += '<i class="sc-gw sc-grass" style="left:' + (i * w / n + r() * 8 - 6).toFixed(0) + 'px;top:' + y + 'px;animation-delay:' + (-r() * 4).toFixed(1) + 's">' + img(A().grass[i % 3], '', 'animation-delay:' + (-r() * 4).toFixed(1) + 's') + '</i>'; return h; }
  function lanterns(xs, y) { return xs.map(function (x, i) { return '<i class="sc-gw sc-lan" style="left:' + x + 'px;top:' + y + 'px"><span style="animation-delay:' + (-i * 1.3) + 's"><b class="sc-glow"></b>' + img(ART.lan, '') + '</span></i>'; }).join(''); }

  // ---------- Rates header: the painted window comes alive ----------
  var PANES = 'M128 112 V64.5 H198.4 V112Z M201.6 112 V64.5 H272 V112Z M128 61 V44 Q128 14 198.4 12.2 V61Z M201.6 61 V12.2 Q272 14 272 44 V61Z';
  function hdrScene() {
    var hb = document.querySelector('.hdr .hdr-body'); if (!hb) return;
    var old = hb.querySelector('.sc-hdr'); if (old) old.remove();
    var nt = night(), a = A(), s = document.createElement('span'); s.className = 'sc sc-hdr'; s.setAttribute('aria-hidden', 'true');
    var h = '<span class="sc-vb"><span class="sc-winv" style="clip-path:path(\'' + PANES + '\')">' +
      '<i class="sc-cl" style="top:' + (nt ? 14 : 10) + 'px;width:62px;animation-duration:70s;animation-delay:-20s">' + img(a.cl[0], '') + '</i>' +
      '<i class="sc-cl" style="top:' + (nt ? 34 : 28) + 'px;width:44px;animation-duration:96s;animation-delay:-70s">' + img(a.cl[1], '') + '</i>' +
      '<i class="sc-cl" style="top:46px;width:34px;animation-duration:120s;animation-delay:-5s;opacity:.85">' + img(a.cl[2], '') + '</i>' +
      '<i class="sc-train" style="top:' + (nt ? 90 : 75.5) + 'px">' + img(a.train, '') + '</i>' +
      (nt ? flies(5, [136, 70, 128, 34], 2) : '') + '</span>' +
      '<i class="sc-gw sc-cur l" style="left:127px;top:30px"><span>' + img(a.curL, '') + '</span></i><i class="sc-gw sc-cur r" style="left:255px;top:30px"><span>' + img(a.curR, '') + '</span></i>' +
      (nt ? '<b class="sc-lglow" style="left:77px;top:17px"></b><b class="sc-lglow" style="left:282px;top:17px;animation-delay:-1.3s"></b>' + wisp('left:52px;top:66px', -2) + wisp('left:352px;top:58px', -6) + flies(8, [10, 30, 380, 80], 9)
        : '<span class="sc-beams"><b style="left:0"></b><b style="left:22px;animation-delay:-3s"></b><b style="left:46px;animation-delay:-5s"></b></span>' + motes(12, [150, 40, 150, 80])) +
      '</span>';
    s.innerHTML = h; hb.insertBefore(s, hb.firstChild); fit(s);
    var tx = hb.querySelector('.hdr-txt'); if (tx && !tx.querySelector('.sc-perch')) { var p = document.createElement('span'); p.className = 'sc sc-perch'; p.setAttribute('aria-hidden', 'true');
      p.innerHTML = mugSteam('left:10px;top:4px') + cat('right:14px;top:0'); tx.appendChild(p); }
    var pm = hb.querySelector('.sc-perch .sc-mugi'); if (pm) pm.src = A().mug;
  }
  function fit(s) {   // map the 400x140 artwork space onto the header exactly like its background (cover, center 30%)
    var hb = s.parentNode, W = hb.clientWidth, H = hb.clientHeight; if (!W) return;
    var k = Math.max(W / 400, H / 140), vb = s.querySelector('.sc-vb');
    vb.style.transform = 'translate3d(' + ((W - 400 * k) * .5).toFixed(1) + 'px,' + ((H - 140 * k) * .3).toFixed(1) + 'px,0) scale(' + k.toFixed(4) + ')';
  }

  // ---------- view bands: hand-lettered title over a small painted scene ----------
  var BANDS = { crew: ['Your Doctor', 'curtain'], quest: ['Quest Board', 'window'], log: ['Log Pose', 'station'] };
  function letters(t) { var r = rnd(t.length * 7); return t.split('').map(function (c) { return c === ' ' ? '<span class="sp"> </span>' : '<span style="transform:translateY(' + ((r() - .5) * 2.4).toFixed(1) + 'px) rotate(' + ((r() - .5) * 7).toFixed(1) + 'deg)">' + c + '</span>'; }).join(''); }
  function bandHTML(id) {
    var b = BANDS[id], nt = night(), a = A(), W = 360, h = '<div class="sc sc-band sc-' + b[1] + '" aria-hidden="true"><span class="sc-sky"></span>';
    h += '<i class="sc-cl" style="top:4px;width:70px;animation-duration:80s;animation-delay:-30s">' + img(a.cl[0], '') + '</i><i class="sc-cl" style="top:16px;width:46px;animation-duration:110s;animation-delay:-85s">' + img(a.cl[2], '') + '</i>';
    h += '<span class="sc-hills">' + img(a.hills, '') + '</span><i class="sc-train band" style="top:33px">' + img(a.train, '') + '</i>';
    if (b[1] === 'window') h += '<i class="sc-gw sc-cur l" style="left:-2px;top:-2px"><span>' + img(a.curL, '') + '</span></i><i class="sc-gw sc-cur r" style="right:-2px;top:-2px"><span>' + img(a.curR, '') + '</span></i>';
    if (b[1] === 'station') h += '<span class="sc-desk"></span>' + cat('right:64px;top:19px') + mugSteam('right:30px;top:23px');
    if (b[1] === 'laundry') h += nt ? '<span class="sc-rope"></span>' + lanterns([150, 200, 250, 300], 0) : '<span class="sc-rope"></span>' + ['towel', 'scrub', 'cloth', 'towel'].map(function (k, i) { return '<i class="sc-gw sc-ln" style="left:' + (160 + i * 44) + 'px;top:9px"><span style="animation-delay:' + (-i * .7) + 's">' + img(a[k], '') + '</span></i>'; }).join('');
    if (b[1] === 'curtain') h += '<i class="sc-gw sc-cur l" style="left:-2px;top:-2px"><span>' + img(a.curL, '') + '</span></i>' + (nt ? lanterns([230, 290], 0) : '<span class="sc-rope"></span>' + ['scrub', 'cloth'].map(function (k, i) { return '<i class="sc-gw sc-ln" style="left:' + (220 + i * 50) + 'px;top:9px"><span style="animation-delay:' + (-i * .9) + 's">' + img(a[k], '') + '</span></i>'; }).join(''));
    h += grassRow(W, 40, 10, id.length);
    h += nt ? flies(7, [20, 10, 320, 40], id.length) + (b[1] === 'window' || b[1] === 'station' ? wisp('left:120px;top:18px', -3) : '') + (b[1] === 'window' ? lanterns([70, 270], 0) : '')
      : '<span class="sc-beams band"><b style="left:0"></b><b style="left:26px;animation-delay:-4s"></b></span>' + motes(8, [40, 6, 160, 40]);
    h += '<span class="sc-title">' + letters(b[0]) + img(a.brush, 'sc-brush') + '</span></div>';
    return h;
  }
  function band(v) {
    if (!v || !BANDS[v.id]) return; var host = v.querySelector(':scope > div:not(.sc)'); if (!host) return;
    var cur = v.querySelector('.sc-band'); if (cur && cur.dataset.th === html.getAttribute('data-theme') && cur.parentNode === host.parentNode && cur.nextSibling === host) return;
    if (cur) cur.remove(); var t = document.createElement('div'); t.innerHTML = bandHTML(v.id); var el = t.firstChild; el.dataset.th = html.getAttribute('data-theme'); v.insertBefore(el, host);
  }
  // Shop / Wardrobe backdrop: a faint meadow with drifting clouds + grass behind the content
  function backdrop(v) {
    if (!v) return;
    v.querySelectorAll('.wd-room, .sh-stage').forEach(function (room) {
      var cur = room.querySelector(':scope > .sc-bd'); if (cur && cur.dataset.th === html.getAttribute('data-theme')) return; if (cur) cur.remove();
      var a = A(), d = document.createElement('span'); d.className = 'sc sc-bd'; d.setAttribute('aria-hidden', 'true'); d.dataset.th = html.getAttribute('data-theme');
      d.innerHTML = '<i class="sc-cl" style="top:8%;width:110px;animation-duration:70s;animation-delay:-30s">' + img(a.cl[1], '') + '</i><i class="sc-cl" style="top:30%;width:76px;animation-duration:100s;animation-delay:-60s">' + img(a.cl[0], '') + '</i>' +
        '<span class="sc-hills big">' + img(a.hills, '') + '</span>' + grassRow(room.clientWidth || 340, (room.clientHeight || 220) - 30, 8, 3) + (night() ? flies(9, [10, 20, 320, 160], 21) + wisp('left:78%;top:30%', -4) : motes(8, [180, 10, 140, 120]));
      room.insertBefore(d, room.firstChild);
    });
  }
  // empty states: the cat asleep next to a cup of tea
  function empties(root) {
    (root || document).querySelectorAll('.empty:not(.sc-done), li.srchead:not(.sc-done)').forEach(function (e) { if (e.classList.contains('qd') || (e.classList.contains('srchead') && !/No matching/.test(e.textContent))) return; e.classList.add('sc-done');
      var s = document.createElement('span'); s.className = 'sc sc-nap'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = cat('left:6px;top:4px') + mugSteam('left:76px;top:14px'); e.insertBefore(s, e.firstChild); });
  }

  // ---------- paper grain over the whole UI (made once, static) ----------
  function grain() {
    if (document.getElementById('sc-grain')) return; var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'), d = g.createImageData(256, 256), r = rnd(5);
    for (var i = 0; i < d.data.length; i += 4) { var v = r(); d.data[i] = d.data[i + 1] = d.data[i + 2] = v > .5 ? 255 : 40; d.data[i + 3] = Math.floor(Math.abs(v - .5) * 2 * 60); }
    g.putImageData(d, 0, 0); g.globalAlpha = .18; g.strokeStyle = '#806040'; g.lineWidth = .6;
    for (var k = 0; k < 70; k++) { var x = r() * 256, y = r() * 256, a = r() * 6.3, l = 3 + r() * 9; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 2, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    var o = document.createElement('div'); o.id = 'sc-grain'; o.setAttribute('aria-hidden', 'true'); o.style.backgroundImage = 'url(' + c.toDataURL() + ')'; document.body.appendChild(o);
  }

  // ---------- moments: save (breeze of leaves around the toast) + paid (paper lanterns rise) ----------
  var mfx;
  function layer() { if (!mfx) { mfx = document.createElement('div'); mfx.id = 'sc-fx'; mfx.setAttribute('aria-hidden', 'true'); document.body.appendChild(mfx); } return mfx; }
  function kill(e, ms) { e.addEventListener('animationend', function (ev) { if (ev.target === e) e.remove(); }); setTimeout(function () { e.remove(); }, ms * 4); }   // removed when its own flight ends
  function breeze(x, y) {
    if (RM && RM.matches) return; var L = layer(), cols = ['#8cc48a', '#6fae74', '#f7b9c8', '#ffd9a8'];
    for (var i = 0; i < 10; i++) { var e = document.createElement('i'), an = i / 10 * 6.283; e.className = 'sc-leaf';
      e.style.cssText = 'left:' + x + 'px;top:' + y + 'px;background:' + cols[i % 4] + ';--tx:' + Math.round(Math.cos(an) * 90) + 'px;--ty:' + Math.round(Math.sin(an) * 40 - 50) + 'px;--r:' + (200 + i * 40) + 'deg;animation-delay:' + i * 30 + 'ms'; L.appendChild(e); kill(e, 1700); }
  }
  function lanternsRise() {
    if (RM && RM.matches) return; var L = layer(), W = innerWidth;
    for (var i = 0; i < 4; i++) { var e = document.createElement('i'); e.className = 'sc-rise'; e.innerHTML = '<b class="sc-glow" style="animation-delay:' + i * 160 + 'ms"></b>' + img(ART.lan, '');   // glow starts with the rise (GPU-composited)
      e.style.cssText = 'left:' + Math.round(W * (.18 + i * .2)) + 'px;animation-delay:' + i * 160 + 'ms'; L.appendChild(e); kill(e, 3400); }
    breeze(W / 2, innerHeight - 140);
  }
  var tst = document.getElementById('toast');
  if (tst) new MutationObserver(function () { if (!tst.classList.contains('show')) return; var t = tst.textContent || '';
    if (/^(Quest logged|Updated|Backup saved|Imported|Restored)/.test(t)) { var r = tst.getBoundingClientRect(); breeze(r.left + r.width / 2, r.top); } }).observe(tst, { attributes: true, attributeFilter: ['class'], childList: true });
  var paidN = -1;
  function paidCount() { try { return PK_STORE.all().filter(function (e) { return e.pay === 'paid'; }).length; } catch (e) { return -1; } }
  if (window.PK_STORE && PK_STORE.onChange) PK_STORE.onChange(function () { var n = paidCount(); if (paidN >= 0 && n === paidN + 1) lanternsRise(); paidN = n; });

  // ---------- tab gust: when the leaves blow (ghibli.js #gfx), every swaying thing bends with them ----------
  var gT;
  function gustLeaves(dir) {
    var L = layer(), W = innerWidth, H = innerHeight, r = Math.random;
    for (var i = 0; i < 12; i++) { var o = document.createElement('i'), y0 = H * (.1 + r() * .65), sz = 13 + r() * 10; o.className = 'sc-gl';
      o.style.cssText = 'width:' + sz.toFixed(0) + 'px;--x0:' + (dir > 0 ? -40 : W + 40) + 'px;--y0:' + y0.toFixed(0) + 'px;--xm:' + (W * (.35 + r() * .3)).toFixed(0) + 'px;--ym:' + (y0 - 40 - r() * 90).toFixed(0) + 'px;--x1:' + (dir > 0 ? W + 50 : -50) + 'px;--y1:' + (y0 + 20 + r() * 80).toFixed(0) + 'px;animation-delay:' + (i * 45) + 'ms;animation-duration:' + (1.2 + r() * .5).toFixed(2) + 's';
      o.innerHTML = img(ART.leaves[i % 4], '', 'animation-delay:' + (i * 45) + 'ms' + (r() < .5 ? ';animation-direction:alternate-reverse' : '')); L.appendChild(o); kill(o, 2600); }   // flutter starts with its flight (a child loop running while its parent is still in its delay is not GPU-composited)
  }
  function gust(dir) { if (RM && RM.matches) return; html.classList.toggle('sc-gdl', dir < 0); gustLeaves(dir); html.classList.remove('sc-gust'); void html.offsetWidth; html.classList.add('sc-gust'); clearTimeout(gT); gT = setTimeout(function () { html.classList.remove('sc-gust'); }, 6000); }
  html.addEventListener('animationend', function (e) { if (e.animationName === 'sc-gustb' || e.animationName === 'sc-gustc') { clearTimeout(gT); gT = setTimeout(function () { html.classList.remove('sc-gust'); }, 0); } });
  function watchGfx() { var g = document.getElementById('gfx');
    if (!g) { var mo = new MutationObserver(function (m) { for (var i = 0; i < m.length; i++) for (var j = 0; j < m[i].addedNodes.length; j++) if (m[i].addedNodes[j].id === 'gfx') { mo.disconnect(); var gg = m[i].addedNodes[j]; watchGfx(); var e = gg.firstChild; gust(e && parseFloat(e.style.getPropertyValue('--x0')) < 0 ? 1 : -1); return; } }); mo.observe(document.body, { childList: true }); return; }
    new MutationObserver(function (m) { for (var i = 0; i < m.length; i++) if (m[i].addedNodes.length) { var e = m[i].addedNodes[0]; var x0 = parseFloat((e.style && e.style.getPropertyValue('--x0')) || '0'); gust(x0 < 0 ? 1 : -1); return; } }).observe(g, { childList: true }); }

  // ---------- mount / refresh ----------
  function refresh() {
    if (!html.hasAttribute('data-sc-baked')) return;   // nothing painted is shown until it is baked (no live SVG filters on screen)
    var v = document.querySelector('.view.active'); if (v) { band(v); backdrop(v); } empties(); grain();
    var hb = document.querySelector('.hdr .hdr-body .sc-hdr'); if (!hb || hb.dataset.th !== html.getAttribute('data-theme')) { hdrScene(); var n = document.querySelector('.sc-hdr'); if (n) n.dataset.th = html.getAttribute('data-theme'); }
  }
  var rq = 0; function soon() { if (rq) return; rq = requestAnimationFrame(function () { rq = 0; refresh(); }); }
  new MutationObserver(soon).observe(document.getElementById('app'), { childList: true, subtree: true });
  new MutationObserver(function () { build(); document.querySelectorAll('.sc-band,.sc-bd').forEach(function (e) { e.remove(); }); document.querySelectorAll('.sc-nap').forEach(function (e) { e.parentNode.classList.remove('sc-done'); e.remove(); }); soon(); }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('hashchange', soon); window.addEventListener('resize', function () { var s = document.querySelector('.sc-hdr'); if (s) fit(s); });
  refresh(); watchGfx(); paidN = paidCount();
  window.PK_SCENE = { _svgArt: function () { return flat(svgArt(), '', {}); }, letters: letters, refresh: refresh, gust: gust, breeze: breeze, lanternsRise: lanternsRise, ART: ART, _bandHTML: bandHTML, cat: cat, mugSteam: mugSteam, lanterns: lanterns, wisp: wisp, flies: flies, motes: motes, grassRow: grassRow, A: A };
})();
