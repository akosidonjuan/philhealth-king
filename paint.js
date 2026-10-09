/* PHILHEALTH KING (Ghibli preview v3): painted doctors.
   Art = the two figures cut from JC's own reference illustration (AI-upscaled 4x, cleaned), plus outfit/hair/head/neck/hand
   layers painted to match (art/*.webp, built by art-src/paint_build.py). At runtime the equipped layers are composited once
   per (doctor, equipment) into a canvas; the roaming mascot gets a pre-rendered sprite sheet (idle, blink, walk, wave) so the
   per-frame cost is one compositor transform (the sheet is a GPU layer; frames are picked by translating it).
   v3: hairstyles = recolourable hair / accessory / behind-body / erase layers; hair colour = luminance-mapped recolour (each pixel keeps
   its own painted light and shade, mapped onto a 3-tone ramp; pencil lines are protected). New pose frames: 16-step walk, glance, talk nod.
   Static figures (picker, shop, wardrobe, header) are cached data URLs.
   v4: the 10 hairstyles are cut from JC's hairstyle sheet (art-src/hair4_*.py) and fitted to our heads; every look has a style
   (default = Bob with bangs / Textured part). Layers per style: hse erase old hair, hsk repainted skin, hsb behind-body, hs head hair,
   hl lower hair (rides with the head in poses), hp ponytail (swings about its tie), hsx accessory / glasses arm.
   v2.1 preview (JC, 4 Oct 2026): every figure is the ORIGINAL painted cut-out (m-default / f-default + her clipboard), static;
   the hair/costume layers are no longer used (Shop removed). */
(function () {
  var META = {"m": {"w": 448, "h": 1202, "ox": 34, "oy": 84, "hem": [[-6, 752], [320, 752], [326, 798], [454, 798]], "top": 111, "cx": 247, "foot": 1165, "legs": {"split": 233, "hip": 736, "top": 720, "L": [[114, 720], [233, 720], [233, 1186], [94, 1186]], "R": [[233, 720], [318, 720], [326, 790], [356, 798], [374, 1186], [233, 1186]]}, "face": [139, 114, 364, 374], "arm": {"poly": [[352, 402], [374, 412], [390, 446], [396, 714], [390, 788], [337, 788], [338, 724], [352, 684]], "pivot": [360, 426], "elbow": 584}, "hair": {"q": [0.2433, 0.2604, 0.2707, 0.2786, 0.2903, 0.2996, 0.3054, 0.3136, 0.3233, 0.3331, 0.3415, 0.3569, 0.3952, 0.4538, 0.495, 0.5397, 0.5736], "lo": 0.24691921903789044, "hi": 0.5736321801245213, "ink": 0.19372863080501557}, "head": {"poly": [[64, 74], [434, 74], [434, 322], [356, 336], [326, 362], [286, 380], [206, 380], [162, 360], [126, 338], [64, 330]], "pivot": [242, 376]}, "mouth": [246, 322], "styles": {"m-part": ["hse", "hsk", "hsx", "hs"], "m-slick": ["hse", "hsk", "hsx", "hs"], "m-undercut": ["hse", "hsk", "hsx", "hs"], "m-pomp": ["hse", "hsk", "hsx", "hs"], "m-spikes": ["hse", "hsk", "hsx", "hs"]}, "h4": {"m-part": {"bald": true, "parts": ["hse", "hsk", "hsx", "hs"], "hair": {"q": [0.2436, 0.2534, 0.2626, 0.2705, 0.2798, 0.2896, 0.299, 0.3089, 0.3187, 0.3296, 0.3618, 0.4091, 0.4567, 0.495, 0.5259, 0.5446, 0.5889], "lo": 0.24594711827516555, "hi": 0.5888981585938928, "ink": 0.1966531222760677}, "top": 109, "bbox": [91, 109, 368, 266], "pivot": null, "hb": [90, 109, 368, 271], "nat": null}, "m-slick": {"bald": true, "parts": ["hse", "hsk", "hsx", "hs"], "hair": {"q": [0.2859, 0.2977, 0.3106, 0.3261, 0.3429, 0.3602, 0.3817, 0.4064, 0.4326, 0.4616, 0.4911, 0.5232, 0.5598, 0.6222, 0.6842, 0.7461, 0.7906], "lo": 0.28792573353832956, "hi": 0.7906404763615132, "ink": 0.1958241005539894}, "top": 117, "bbox": [90, 117, 357, 277], "pivot": null, "hb": [90, 119, 363, 278], "nat": "slick"}, "m-undercut": {"bald": true, "parts": ["hse", "hsk", "hsx", "hs"], "hair": {"q": [0.2449, 0.2543, 0.2647, 0.2747, 0.2846, 0.2954, 0.3111, 0.3299, 0.3527, 0.3772, 0.4, 0.4256, 0.4512, 0.4863, 0.5315, 0.574, 0.6569], "lo": 0.24660789786863327, "hi": 0.6568825768437383, "ink": 0.1927035309970379}, "top": 93, "bbox": [81, 93, 372, 203], "pivot": null, "hb": [81, 93, 373, 271], "nat": null}, "m-pomp": {"bald": true, "parts": ["hse", "hsk", "hsx", "hs"], "hair": {"q": [0.2389, 0.2523, 0.2636, 0.2739, 0.2802, 0.2883, 0.2982, 0.3088, 0.3227, 0.338, 0.3556, 0.3746, 0.3924, 0.4174, 0.4819, 0.5241, 0.5593], "lo": 0.24123616825956104, "hi": 0.5592886415718793, "ink": 0.16427809441089627}, "top": 94, "bbox": [73, 94, 364, 269], "pivot": null, "hb": [73, 93, 365, 271], "nat": null}, "m-spikes": {"bald": true, "parts": ["hse", "hsk", "hsx", "hs"], "hair": {"q": [0.2545, 0.2627, 0.2695, 0.275, 0.2803, 0.2857, 0.291, 0.2981, 0.3073, 0.3164, 0.3273, 0.3358, 0.3615, 0.4035, 0.4613, 0.52, 0.5848], "lo": 0.2563249242015183, "hi": 0.5848027585089206, "ink": 0.17803451409339904}, "top": 89, "bbox": [65, 89, 354, 264], "pivot": null, "hb": [64, 89, 363, 271], "nat": null}}}, "f": {"w": 408, "h": 1082, "ox": 34, "oy": 84, "hem": [[-6, 656], [414, 656]], "top": 109, "cx": 199, "foot": 1045, "legs": {"split": 211, "hip": 644, "top": 632, "L": [[94, 632], [211, 632], [211, 1074], [84, 1074]], "R": [[211, 632], [334, 632], [334, 1074], [211, 1074]]}, "face": [89, 106, 324, 354], "clip": {"poly": [[50, 414], [94, 404], [180, 382], [196, 424], [212, 488], [262, 498], [268, 556], [216, 566], [114, 572], [94, 556], [60, 530], [58, 484]], "pivot": [162, 554]}, "hair": {"q": [0.2312, 0.2463, 0.2673, 0.2841, 0.2995, 0.318, 0.3325, 0.3432, 0.3507, 0.3597, 0.3687, 0.379, 0.3866, 0.4084, 0.4898, 0.5386, 0.5788], "lo": 0.23480392564237115, "hi": 0.5788057170710563, "ink": 0.14103922164291144}, "head": {"poly": [[24, 74], [384, 74], [384, 366], [284, 366], [260, 342], [162, 342], [142, 366], [24, 366]], "pivot": [199, 340]}, "mouth": [165, 297], "styles": {"f-bob": ["hse", "hsk", "hs", "hl"], "f-lowbun": ["hse", "hsk", "hs", "hl"], "f-pony": ["hse", "hsk", "hsx", "hp", "hs", "hl"], "f-waves": ["hse", "hsk", "hs", "hl"], "f-crown": ["hse", "hsk", "hsx", "hs", "hl"]}, "h4": {"f-bob": {"bald": true, "parts": ["hse", "hsk", "hs", "hl"], "hair": {"q": [0.2405, 0.2543, 0.2685, 0.2786, 0.289, 0.2987, 0.3076, 0.3169, 0.3278, 0.3429, 0.3634, 0.39, 0.4354, 0.5023, 0.5825, 0.6233, 0.6804], "lo": 0.242254283963263, "hi": 0.6804325310759544, "ink": 0.14256222799941898}, "top": 93, "bbox": [95, 93, 359, 350], "pivot": null, "hb": [94, 93, 359, 350], "nat": null}, "f-lowbun": {"bald": true, "parts": ["hse", "hsk", "hs", "hl"], "hair": {"q": [0.2399, 0.2511, 0.2613, 0.2697, 0.2757, 0.283, 0.2915, 0.3011, 0.3121, 0.3269, 0.3502, 0.3802, 0.4092, 0.4687, 0.5583, 0.6375, 0.802], "lo": 0.24224655089205502, "hi": 0.8019644734785558, "ink": 0.12321877926588058}, "top": 85, "bbox": [100, 85, 358, 324], "pivot": null, "hb": [100, 85, 358, 325], "nat": null}, "f-pony": {"bald": true, "parts": ["hse", "hsk", "hsx", "hp", "hs", "hl"], "hair": {"q": [0.2379, 0.2578, 0.2762, 0.293, 0.3026, 0.3129, 0.3218, 0.3335, 0.3443, 0.3546, 0.3673, 0.3867, 0.4176, 0.4685, 0.539, 0.5973, 0.6653], "lo": 0.24133971624100206, "hi": 0.6653386147665971, "ink": 0.1466013382077217}, "top": 93, "bbox": [98, 93, 407, 403], "pivot": [284, 124], "hb": [98, 93, 407, 353], "nat": null}, "f-waves": {"bald": true, "parts": ["hse", "hsk", "hs", "hl"], "hair": {"q": [0.2354, 0.2529, 0.2683, 0.2824, 0.3041, 0.3271, 0.3447, 0.3578, 0.3688, 0.3828, 0.399, 0.4111, 0.4237, 0.45, 0.5267, 0.624, 0.7008], "lo": 0.23819059210717677, "hi": 0.7007776468038558, "ink": 0.11897893718034028}, "top": 97, "bbox": [76, 97, 364, 413], "pivot": null, "hb": [75, 97, 364, 353], "nat": null}, "f-crown": {"bald": true, "parts": ["hse", "hsk", "hsx", "hs", "hl"], "hair": {"q": [0.2379, 0.2578, 0.2762, 0.293, 0.3026, 0.3129, 0.3218, 0.3335, 0.3443, 0.3546, 0.3673, 0.3867, 0.4176, 0.4685, 0.539, 0.5973, 0.6653], "lo": 0.24133971624100206, "hi": 0.6653386147665971, "ink": 0.1466013382077217}, "top": 110, "bbox": [98, 110, 407, 388], "pivot": null, "v6": {"rim": 66258, "ends_cols": 0, "collar_px": 796, "neck_px": 0, "split_px": 25}, "hb": [98, 110, 407, 353], "nat": null}}}};
  var DIR = 'art/', DOC = { mdoc: 'm', fdoc: 'f' }, MX = 60;
  var HAIR = { m: META.m.styles || {}, f: META.f.styles || {} }, H4 = { m: META.m.h4 || {}, f: META.f.h4 || {} }, DEFSTY = { m: 'm-part', f: 'f-bob' };
  function styOf(k, eq) { return eq && HAIR[k][eq.hair] ? eq.hair : DEFSTY[k]; }
  // hair colour ramps (shadow, mid, highlight); 'natural' = the painted original
  var HCOL = { 'hc-black': ['#1c1a1d', '#2f2c31', '#5d5862'], 'hc-darkbrown': ['#2a1a12', '#4a3022', '#7a5640'], 'hc-chestnut': ['#3e2010', '#6e3b1e', '#a8673a'],
    'hc-auburn': ['#3d150c', '#7a2e17', '#b8582e'], 'hc-ash': ['#2f2a26', '#5e5650', '#958c82'], 'hc-honey': ['#6b4a20', '#b88a44', '#ecc987'],
    'hc-burgundy': ['#2e0c16', '#5e1a2c', '#94374e'], 'hc-silver': ['#5c5f66', '#a3a7ae', '#e6e8ec'],
    'hc-lavender': ['#3a2d5c', '#7b68b0', '#c7b8ee'], 'hc-seaglass': ['#163f44', '#2f7a78', '#86cdbf'], 'hc-sakura': ['#6a2b40', '#c46a86', '#f4b8c8'] };
  var OUTF = ['scrub-lav', 'scrub-sky', 'scrub-rose', 'embscrubs', 'herbcoat', 'goldcoat', 'cloak', 'yukata', 'barong'];
  var HEAD = ['capsurg', 'headmirror', 'flowercrown'];
  var IMG = {}, COMP = {}, URL_ = {}, SHEET = {}, busy = 0, waiters = [];
  var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  function img(n) { if (!IMG[n]) IMG[n] = new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = DIR + n + '.webp'; }); return IMG[n]; }
  function eqKey(eq) { return ['orig', 'outfit', 'hair', 'hcol', 'head', 'neck', 'hand', 'float', 'aura'].map(function (s) { return eq[s] || ''; }).join(','); }
  function track(p) { busy++; return p.then(function (v) { if (--busy === 0) { var w = waiters; waiters = []; w.forEach(function (f) { f(); }); } return v; }, function (e) { if (--busy === 0) { var w = waiters; waiters = []; w.forEach(function (f) { f(); }); } throw e; }); }
  function cv(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

  // ---- auras and the floating lantern (painted on canvas, soft watercolour-ish)
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function star(x, cx, cy, r, col) { x.save(); x.translate(cx, cy); x.fillStyle = col; x.beginPath(); for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = i % 2 ? r * .28 : r; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.restore(); }
  function aura(x, id, m) {
    var W = m.w + 2 * MX, cx = W / 2, cy = m.h * .46, R = rnd(id.length * 977 + m.w);
    x.save();
    if (id === 'aura-aurora') {
      var g = x.createLinearGradient(0, m.h * .1, 0, m.h * .9); g.addColorStop(0, 'rgba(120,230,210,.0)'); g.addColorStop(.3, 'rgba(120,230,210,.42)'); g.addColorStop(.6, 'rgba(170,140,255,.36)'); g.addColorStop(1, 'rgba(170,140,255,0)');
      x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, W * .5, m.h * .44, 0, 0, 7); x.fill();
      x.lineWidth = 7; x.strokeStyle = 'rgba(255,214,120,.9)'; x.beginPath(); x.ellipse(m.cx + MX - m.ox, m.top - 22, 70, 16, 0, 0, 7); x.stroke();
      x.lineWidth = 2.5; x.strokeStyle = 'rgba(120,80,30,.6)'; x.stroke();
    } else {
      var warm = id === 'aura-petal' ? '255,184,204' : '255,226,150';
      var g2 = x.createRadialGradient(cx, cy, 10, cx, cy, m.h * .55); g2.addColorStop(0, 'rgba(' + warm + ',.55)'); g2.addColorStop(1, 'rgba(' + warm + ',0)');
      x.fillStyle = g2; x.beginPath(); x.ellipse(cx, cy, W * .55, m.h * .5, 0, 0, 7); x.fill();
      for (var i = 0; i < 16; i++) {
        var a = R() * 6.283, rx = W * (.34 + R() * .16), ry = m.h * (.3 + R() * .14), px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry;
        if (id === 'aura-petal') { x.save(); x.translate(px, py); x.rotate(R() * 6.28); x.fillStyle = ['#f6b3c6', '#fbd3dd', '#f29bb3'][i % 3]; x.beginPath(); x.ellipse(0, 0, 13, 7, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(150,70,90,.55)'; x.lineWidth = 1.6; x.stroke(); x.restore(); }
        else star(x, px, py, 9 + R() * 10, i % 2 ? '#fff4c8' : '#ffd36b');
      }
    }
    x.restore();
  }
  function lantern(x, m) {
    var lx = MX + m.w - 6, ly = m.top + 70;
    x.save(); var g = x.createRadialGradient(lx, ly, 4, lx, ly, 90); g.addColorStop(0, 'rgba(255,200,110,.55)'); g.addColorStop(1, 'rgba(255,200,110,0)'); x.fillStyle = g; x.beginPath(); x.arc(lx, ly, 90, 0, 7); x.fill();
    x.strokeStyle = '#3a2a22'; x.lineWidth = 3; x.beginPath(); x.moveTo(lx, ly - 70); x.lineTo(lx, ly - 34); x.stroke();
    var b = x.createLinearGradient(lx - 26, 0, lx + 26, 0); b.addColorStop(0, '#e9874a'); b.addColorStop(.5, '#ffd58a'); b.addColorStop(1, '#e07a3e');
    x.fillStyle = b; x.beginPath(); x.ellipse(lx, ly, 26, 34, 0, 0, 7); x.fill(); x.lineWidth = 3; x.stroke();
    x.lineWidth = 1.6; x.strokeStyle = 'rgba(120,60,30,.6)'; [-12, 0, 12].forEach(function (d) { x.beginPath(); x.ellipse(lx + d * .2, ly, Math.abs(d) + 4, 33, 0, 0, 7); x.stroke(); });
    x.fillStyle = '#5a3f30'; x.fillRect(lx - 14, ly - 38, 28, 7); x.fillRect(lx - 14, ly + 31, 28, 7); x.restore();
  }

  // ---- hair recolour: gradient-map on luminance, line-protected; runs once per (doctor, equipment)
  function hexRGB(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function recolor(c, k, col, mask, st) {
    var R = HCOL[col]; if (!R) return; R = R.map(hexRGB);
    var K0 = R[0].map(function (v) { return v * .62; }); st = st || META[k].hair; var lo = st.lo * 255, hi = st.hi * 255, ink = st.ink * 255, inv = 1 / (hi - lo), kinv = 1 / Math.max(1, lo - ink), LUT = lut(st);
    var h = mask ? Math.min(c.height, mask.h) : c.height, x = c.getContext('2d', { willReadFrequently: true }), id = x.getImageData(0, 0, c.width, h), d = id.data, md = mask ? mask.d : null;
    for (var i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue; var m = md ? md[i + 3] / 255 : 1; if (m <= 0) continue;
      var Y = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2], t = (Y - lo) * inv, kp = (Y - ink) * kinv, w, u, A, B;
      t = t < 0 ? 0 : t > 1 ? 1 : t; t = 0.3 * t + 0.7 * LUT[Y | 0]; kp = kp < 0 ? 0 : kp > 1 ? 1 : kp; w = m * kp;
      if (t < .5) { u = t * 2; A = R[0]; B = R[1]; } else { u = t * 2 - 1; A = R[1]; B = R[2]; }
      // pencil lines stay lines: the protected (ink) part is pulled just below the ramp's shadow, so dark colours never leave lighter outlines
      var r0 = Math.min(d[i], K0[0]), g0 = Math.min(d[i + 1], K0[1]), b0 = Math.min(d[i + 2], K0[2]); if (m < 1) { r0 = d[i] + (r0 - d[i]) * m; g0 = d[i + 1] + (g0 - d[i + 1]) * m; b0 = d[i + 2] + (b0 - d[i + 2]) * m; }
      d[i] = r0 + (A[0] + (B[0] - A[0]) * u - r0) * w; d[i + 1] = g0 + (A[1] + (B[1] - A[1]) * u - g0) * w; d[i + 2] = b0 + (A[2] + (B[2] - A[2]) * u - b0) * w;
    }
    x.putImageData(id, 0, 0);
  }
  // luminance -> ramp position via the hair's own quantiles (so dark and light originals both use the whole ramp; order is preserved)
  function lut(st) { if (st._L) return st._L; var q = st.q.map(function (v) { return v * 255; }), L = new Float32Array(256), n = q.length - 1;
    for (var y = 0; y < 256; y++) { var t; if (y <= q[0]) t = 0; else if (y >= q[n]) t = 1; else { var j = 0; while (q[j + 1] < y) j++; t = (j + (y - q[j]) / Math.max(1e-3, q[j + 1] - q[j])) / n; } L[y] = t; }
    Object.defineProperty(st, '_L', { value: L }); return L; }
  var MASK = {};
  function maskData(k, im) { if (MASK[k]) return MASK[k]; var h = Math.min(im.height, 420), c = cv(im.width + 2 * MX, h), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, MX, 0);
    MASK[k] = { d: x.getImageData(0, 0, c.width, h).data, h: h }; return MASK[k]; }
  // ---- composite: T = torso layers (+aura/float), K = clipboard piece (female), TB = T with eyes closed
  function layers(k, eq) {
    var o = OUTF.indexOf(eq.outfit) >= 0 ? eq.outfit : 'default', T = [], K = [], sty = styOf(k, eq), S = {};
    if (eq.orig) return { base: k + '-default', S: S, T: T, K: k === 'f' ? ['f-default-clip'] : [], col: '', sty: sty, st: H4[k][sty], orig: 1 };   // v2.1: JC's original painted sprite, untouched
    HAIR[k][sty].forEach(function (p) { S[{ hse: 'erase', hsk: 'skin', hsb: 'back', hs: 'hair', hl: 'low', hp: 'pony', hsx: 'acc' }[p]] = k + '-' + p + '-' + sty; });
    if (eq.head && HEAD.indexOf(eq.head) >= 0) T.push(k + '-ov-' + eq.head);
    if (eq.neck === 'goldsteth') T.push(k + '-ov-goldsteth');
    if (k === 'f') K.push('f-' + o + '-clip');
    if (eq.hand === 'crystalscope') (k === 'f' ? K : T).push(k + '-ov-crystalscope');
    return { base: k + '-' + o, S: S, T: T, K: K, col: HCOL[eq.hcol] ? eq.hcol : '', sty: sty, st: H4[k][sty] };
  }
  function composite(id, eq) {
    var k = DOC[id], key = id + '|' + eqKey(eq); if (COMP[key]) return COMP[key];
    var m = META[k], L = layers(k, eq), sl = Object.keys(L.S).map(function (p) { return L.S[p]; });
    var names = [L.base].concat(sl, L.T, L.K, [k + '-blink'], L.col ? [k + '-hairmask'] : []);
    COMP[key] = track(Promise.all(names.map(img)).then(function (ims) {
      var by = {}; names.forEach(function (n, i) { by[n] = ims[i]; });
      var W = m.w + 2 * MX, B = cv(W, m.h), bx = B.getContext('2d');
      // each hair piece is recoloured with the style's own luminance stats (sheet hair) / the base stats (kept sideburns)
      function hairPiece(n) { if (!n || !by[n]) return null; var c = cv(W, m.h); c.getContext('2d').drawImage(by[n], MX, 0); if (L.col) recolor(c, k, L.col, null, L.st.hair); return c; }
      if (by[L.base]) bx.drawImage(by[L.base], MX, 0);
      if (L.S.erase && by[L.S.erase]) { bx.globalCompositeOperation = 'destination-out'; bx.drawImage(by[L.S.erase], MX, 0); bx.globalCompositeOperation = 'source-over'; }
      var rcol = L.orig || L.st.bald ? '' : (L.col || (L.st.nat === 'slick' ? 'hc-black' : ''));   // v5: bald base, no old hair left to recolour   // the bit of old sideburn that stays gets the new hair's colour
      if (rcol && by[k + '-hairmask']) recolor(B, k, rcol, maskData(k, by[k + '-hairmask']));
      var back = hairPiece(L.S.back); if (back) { bx.globalCompositeOperation = 'destination-over'; bx.drawImage(back, 0, 0); bx.globalCompositeOperation = 'source-over'; }
      if (L.S.skin && by[L.S.skin]) bx.drawImage(by[L.S.skin], MX, 0);
      var P = hairPiece(L.S.pony), Hh = hairPiece(L.S.hair), Lo = hairPiece(L.S.low), A = null;
      if (L.S.acc && by[L.S.acc]) { A = cv(W, m.h); A.getContext('2d').drawImage(by[L.S.acc], MX, 0); }
      // B0 = body + head hair (poses add pony / lower hair / accessory with the head or walk transform); B = full still
      var B0 = cv(W, m.h), b0 = B0.getContext('2d'); b0.drawImage(B, 0, 0); if (Hh) b0.drawImage(Hh, 0, 0);
      if (P) bx.drawImage(P, 0, 0); if (Hh) bx.drawImage(Hh, 0, 0); if (Lo) bx.drawImage(Lo, 0, 0); if (A) bx.drawImage(A, 0, 0);
      L.T.forEach(function (n) { if (by[n]) { bx.drawImage(by[n], MX, 0); b0.drawImage(by[n], MX, 0); } });
      function wrap(src) { var T = cv(W, m.h), tx = T.getContext('2d'); if (eq.aura) aura(tx, eq.aura, m); tx.drawImage(src, 0, 0); if (eq.float === 'lantern') lantern(tx, m);
        var TB = cv(W, m.h), tb = TB.getContext('2d'); tb.drawImage(T, 0, 0); if (by[k + '-blink']) tb.drawImage(by[k + '-blink'], MX, 0); return [T, TB]; }
      var full = wrap(B), pose = wrap(B0);
      var K = null; if (L.K.length) { K = cv(W, m.h); var kx = K.getContext('2d'); L.K.forEach(function (n) { if (by[n]) kx.drawImage(by[n], MX, 0); }); }
      var piv = L.st.pivot ? [L.st.pivot[0], L.st.pivot[1]] : null;
      return { m: m, k: k, T: full[0], TB: full[1], T0: pose[0], TB0: pose[1], P: P, Lo: Lo, A: A, piv: piv, K: K, sty: L.S, style: L.sty, eq: eq };
    }));
    return COMP[key];
  }
  // ---- puppet drawing helpers (art px; legs/arm/clipboard pieces are clipped from the composite)
  function path(x, pts, dx) { x.moveTo(pts[0][0] + dx, pts[0][1]); for (var i = 1; i < pts.length; i++) x.lineTo(pts[i][0] + dx, pts[i][1]); x.closePath(); }
  function piece(x, src, pts, tf) { x.save(); if (tf) tf(x); x.beginPath(); path(x, pts, MX); x.clip(); x.drawImage(src, 0, 0); x.restore(); }
  function rotAbout(px, py, deg, dy) { return function (x) { x.translate(px + MX, py + (dy || 0)); x.rotate(deg * Math.PI / 180); x.translate(-px - MX, -py); }; }
  function upperPoly(m) { var hem = m.hem; return [[-MX, -10]].concat([[m.w + MX, -10]], hem.slice().reverse().map(function (p) { return [Math.min(Math.max(p[0], -MX), m.w + MX), p[1]]; })); }
  function headPoly(m, ext) { return m.head.poly.map(function (p) { return [p[0], p[1] > m.head.pivot[1] - 50 ? p[1] + (ext || 0) : p[1]]; }); }
  // head tilt (glance / talk nod): body drawn with a hole where the head is, head piece rotated about the neck; eyelids half-lowered
  // pony / lower hair / accessory over a pose frame (tf = head or body transform already applied by the caller); ang = ponytail swing (deg, + = towards her back)
  function extras(x, C, ang) {
    if (C.P) { x.save(); rotAbout(C.piv[0], C.piv[1], ang || 0)(x); x.drawImage(C.P, 0, 0); x.restore(); }
    if (C.Lo) x.drawImage(C.Lo, 0, 0); if (C.A) x.drawImage(C.A, 0, 0);
  }
  function drawHead(x, C, deg, dy, lid, ang) {
    var m = C.m, W = m.w + 2 * MX, pv = m.head.pivot, hp = headPoly(m, 0), he = headPoly(m, 12);
    x.save(); x.beginPath(); x.rect(0, 0, W, m.h); path(x, hp.slice().reverse(), MX); x.clip('evenodd'); x.drawImage(C.T0, 0, 0); x.restore();
    x.save(); rotAbout(pv[0], pv[1], deg, dy)(x); x.save(); x.beginPath(); path(x, he, MX); x.clip(); x.drawImage(C.T0, 0, 0);
    if (lid > 0) { x.globalAlpha = lid; x.drawImage(C.TB0, 0, 0); } x.restore(); extras(x, C, ang); x.restore();
  }
  function drawPose(x, C, mode, i, n) {
    var m = C.m, T = mode === 'blink' ? C.TB : C.T, W = m.w + 2 * MX, legs = m.legs, arm = m.arm, cl = m.clip, isF = C.k === 'f';
    function upperWithHole(x, hole) { x.save(); x.beginPath(); path(x, upperPoly(m), MX); if (hole) path(x, hole.slice().reverse(), MX); x.clip('evenodd'); x.drawImage(T, 0, 0); x.restore(); }
    function wholeWithHole(x, hole) { x.save(); x.beginPath(); x.rect(0, 0, W, m.h); path(x, hole.slice().reverse(), MX); x.clip('evenodd'); x.drawImage(T, 0, 0); x.restore(); }
    if (mode === 'idle' || mode === 'blink') { x.drawImage(T, 0, 0); if (C.K) x.drawImage(C.K, 0, 0); return; }
    T = C.T0;
    if (mode === 'swing') { x.drawImage(T, 0, 0); extras(x, C, SWING[i]); if (C.K) x.drawImage(C.K, 0, 0); return; }   // hop: the ponytail lags, overshoots, settles
    if (mode === 'glance') {   // look down at the clipboard (Doktora, lifts it a little) / at the stethoscope (Doktor)
      var a = i / (n - 1), e = a * a * (3 - 2 * a);
      drawHead(x, C, (isF ? -7 : 6) * e, 5 * e, (isF ? .35 : .22) * e, 3.2 * e);
      if (C.K) { x.save(); rotAbout(cl.pivot[0], cl.pivot[1], -4 * e, -14 * e)(x); x.drawImage(C.K, 0, 0); x.restore(); }
      return;
    }
    if (mode === 'talk') { var tk = [[0, 0], [2.2, 2], [0, 1], [-1.8, 2]][i]; drawHead(x, C, tk[0], tk[1], 0, -tk[0] * .6); if (C.K) x.drawImage(C.K, 0, 0); return; }
    if (mode === 'walk') {
      var p = i / n * 6.283, s = Math.sin(p), c = Math.cos(p), bob = -Math.abs(c) * 10 + 5, lift = 17, sway = s * 1.4;
      x.save(); x.translate(W / 2, m.foot); x.rotate(sway * Math.PI / 180); x.translate(-W / 2, -m.foot + bob);
      piece(x, T, legs.L, rotAbout(legs.split - 50, legs.hip, s * 3.2, -Math.max(0, s) * lift));
      piece(x, T, legs.R, rotAbout(legs.split + 50, legs.hip, s * 3.2, -Math.max(0, -s) * lift));
      if (arm) { upperWithHole(x, arm.poly); piece(x, T, arm.poly, rotAbout(arm.pivot[0], arm.pivot[1], -s * 7)); }
      else upperWithHole(x, null);
      extras(x, C, 1.2 + 2.6 * Math.sin(p - 0.9));   // ponytail swings a beat behind the step
      if (C.K) { x.save(); x.translate(0, c * 2.5); x.drawImage(C.K, 0, 0); x.restore(); }
      x.restore(); return;
    }
    if (mode === 'wave') {
      x.save(); x.translate(W / 2, m.foot); x.rotate(-.8 * Math.PI / 180 * Math.min(1, i)); x.translate(-W / 2, -m.foot);
      if (arm) {
        // two-segment arm: upper arm swings out from the shoulder, forearm folds up at the elbow and waves
        var a1 = [-6, -18, -28, -32, -32, -32, -32, -32][i], a2 = [-20, -80, -135, -160, -142, -168, -142, -160][i], ey = arm.elbow, ex = arm.pivot[0] + 6;
        wholeWithHole(x, arm.poly); extras(x, C, 0);
        function seg(lo, hi, tf) { x.save(); tf(x); x.beginPath(); path(x, arm.poly, MX); x.clip(); x.beginPath(); x.rect(0, lo, m.w + 2 * MX, hi - lo); x.clip(); x.drawImage(T, 0, 0); x.restore(); }
        seg(0, ey + 14, rotAbout(arm.pivot[0], arm.pivot[1], a1));
        seg(ey - 10, m.h, function (x) { rotAbout(arm.pivot[0], arm.pivot[1], a1)(x); rotAbout(ex, ey, a2)(x); });
      }
      else { var dy = [0, -12, -24, -34, -28, -34, -28, -14][i], r = [0, -3, -6, -8, -6, -8, -6, -3][i]; x.drawImage(T, 0, 0); extras(x, C, [0, .8, 1.8, 2.4, 1.2, 2.4, 1.2, .4][i]); x.save(); rotAbout(cl.pivot[0], cl.pivot[1], r, dy)(x); x.drawImage(C.K, 0, 0); x.restore(); }
      x.restore();
    }
  }
  // sprite sheet (grid of 12 columns): idle, blink, walk x16, wave x8, glance x8, talk x4 at a given scale (css px per art px) * dpr
  var WALKN = 16, COLS = 12, SWING = [0, 1.8, 3.6, 3.2, 0.8, -1.3, -0.8, 0.6];
  function sheet(id, eq, unit) {
    var dpr = Math.min(3, window.devicePixelRatio || 1), key = id + '|' + eqKey(eq) + '|' + unit + '|' + dpr; if (SHEET[key]) return SHEET[key];
    SHEET[key] = composite(id, eq).then(function (C) {
      var m = C.m, s = unit * dpr, fw = Math.ceil((m.w + 2 * MX) * s), fh = Math.ceil(m.h * s), list = [], idx = {}, i;
      function add(name, mode, j, n) { (idx[name] = idx[name] || []).push(list.length); list.push([mode, j, n]); }
      add('idle', 'idle', 0); add('blink', 'blink', 0);
      for (i = 0; i < WALKN; i++) add('walk', 'walk', i, WALKN);
      for (i = 0; i < 8; i++) add('wave', 'wave', i, 8);
      for (i = 0; i < 8; i++) add('glance', 'glance', i, 8);
      for (i = 0; i < 4; i++) add('talk', 'talk', i, 4);
      if (C.P) for (i = 0; i < SWING.length; i++) add('swing', 'swing', i, SWING.length);
      var cols = Math.min(COLS, list.length), rows = Math.ceil(list.length / cols), c = cv(fw * cols, fh * rows), x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      list.forEach(function (f, j) { var cx = (j % cols) * fw, cy = Math.floor(j / cols) * fh; x.save(); x.beginPath(); x.rect(cx, cy, fw, fh); x.clip(); x.translate(cx, cy); x.scale(s, s); drawPose(x, C, f[0], f[1], f[2]); x.restore(); });
      return { cv: c, fw: fw, fh: fh, cols: cols, rows: rows, n: list.length, dpr: dpr, unit: unit, cssW: fw / dpr, cssH: fh / dpr, m: m, sty: C.sty, eq: C.eq,
        idle: idx.idle[0], blink: idx.blink[0], walk: idx.walk, wave: idx.wave, glance: idx.glance, talk: idx.talk, swing: idx.swing || null, style: C.style };
    });
    return SHEET[key];
  }
  // static figure (or face crop) as a data URL, cached
  function still(id, eq, h, face) {
    var dpr = Math.min(3, window.devicePixelRatio || 1), key = id + '|' + eqKey(eq) + '|' + h + '|' + (face === 'bust' ? 'u' : face ? 'f' : 'b') + '|' + dpr;
    if (URL_[key] && typeof URL_[key] === 'string') return { key: key, url: URL_[key] };
    if (!URL_[key]) URL_[key] = composite(id, eq).then(function (C) {
      var m = C.m, c, x;
      if (face === 'bust') { var bw = (m.face[2] - m.face[0]) * 1.75, bx0 = (m.face[0] + m.face[2]) / 2 + MX - bw / 2, by0 = Math.max(0, m.top - 90), bh = bw * 1.1; c = cv(h * dpr * bw / bh, h * dpr); x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
        x.drawImage(C.T, bx0, by0, bw, bh, 0, 0, c.width, c.height); if (C.K) x.drawImage(C.K, bx0, by0, bw, bh, 0, 0, c.width, c.height); }
      else if (face) { var fb = m.face, fw = fb[2] - fb[0], fh2 = fb[3] - fb[1], sz = Math.max(fw, fh2); c = cv(h * dpr, h * dpr); x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
        x.drawImage(C.T, fb[0] + MX - (sz - fw) / 2, fb[1], sz, sz, 0, 0, c.width, c.height); if (C.K) x.drawImage(C.K, fb[0] + MX - (sz - fw) / 2, fb[1], sz, sz, 0, 0, c.width, c.height); }
      else { var s = h * dpr / m.h; c = cv((m.w + 2 * MX) * s, h * dpr); x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(C.T, 0, 0, c.width, c.height); if (C.K) x.drawImage(C.K, 0, 0, c.width, c.height); }
      var u = c.toDataURL('image/png'); URL_[key] = u;
      document.querySelectorAll('img[data-pk="' + key + '"]').forEach(function (im) { im.src = u; }); return u;
    });
    track(Promise.resolve(URL_[key]));
    return { key: key, url: null };
  }
  // ---- PK_ART.build replacement: same call signature as the old vector chibis
  var ORIG = { orig: 1 }, HREF = META.m.h;   // common scale: Doktor's frame height; Doktora keeps her relative height
  function build(id, prefix, opts) {
    opts = opts || {}; var k = DOC[id] || 'm', m = META[k], eq = ORIG, w = opts.w || 100;   // v2.1: always the original painted sprite (no costumes / hairstyles)
    var bust = opts.bust, face = !bust && (opts.face || w <= 44), h = bust ? Math.round(w * 1.1 / 1.75 * 1.75) : face ? w : Math.round(w * 1.75 * m.h / HREF), cw = bust ? w : face ? w : Math.round(h * (m.w + 2 * MX) / m.h);
    if (bust) h = Math.round(w * 1.1);
    var r = still(id, eq, h, bust ? 'bust' : face);
    return '<img class="pfig' + (bust ? ' pbust' : face ? ' pface' : '') + ' pf-' + k + '" data-pk="' + r.key + '" alt="" draggable="false" width="' + cw + '" height="' + h + '" src="' + (r.url || BLANK) + '">';
  }
  var old = window.PK_ART || {};
  window.PK_ART = { build: build, pose: function () { return {}; }, pet: old.pet, PETS: old.PETS, ORDER: old.ORDER };
  window.PK_PAINT = { ORIG: ORIG, META: META, MX: MX, HCOL: HCOL, HAIR: HAIR, H4: H4, DEFSTY: DEFSTY, styOf: styOf, sheet: sheet, composite: composite, still: still, unit: function (cssH) { return cssH / HREF; },
    idle: function () { return busy ? new Promise(function (r) { waiters.push(r); }) : Promise.resolve(); }, _drawPose: drawPose };
})();
