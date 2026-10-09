/* PHILHEALTH KING: original vector chibis (preview: two Ghibli-inspired doctors; legacy crew kept unused) (hand-written SVG paths; no traced or copied artwork).
   viewBox 0 0 200 240, ground y=226. Layered parts so crew.js can animate with transforms:
   .p-legL .p-legR (hip pivots 88,186 / 112,186), .p-up (body+arms+head, bob), .p-armL .p-armR (shoulders 80,146 / 120,146),
   .p-head (neck pivot 100,140), .p-eyes (blink, center y 100), .p-sig (signature-only extras), .p-nosig (hidden in signature). */
(function () {
  var OL = '#5a3f30', SW = 3.6, uid = 0, PFX = 'a';
  function ell(cx, cy, rx, ry) { return 'M' + (cx - rx) + ' ' + cy + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2 * rx + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + -2 * rx + ' 0Z'; }
  function nid() { return PFX + '-' + (++uid); }
  // cel-shaded filled shape: shade colour shows as a crescent on the lower-right (offset main fill), clean outline on top
  function S(d, fill, shade, ox, oy, sw) {
    if (!shade) return '<path d="' + d + '" fill="' + fill + '" stroke="' + OL + '" stroke-width="' + (sw || SW) + '" stroke-linejoin="round"/>';
    var id = nid(); ox = ox == null ? -5 : ox; oy = oy == null ? -4 : oy;
    return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')"><path d="' + d + '" fill="' + shade + '"/><path d="' + d + '" fill="' + fill + '" transform="translate(' + ox + ' ' + oy + ')"/></g>' +
      '<path d="' + d + '" fill="none" stroke="' + OL + '" stroke-width="' + (sw || SW) + '" stroke-linejoin="round"/>';
  }
  function F(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op ? ' opacity="' + op + '"' : '') + '/>'; }            // flat, no outline
  function Ln(d, w, col, cap) { return '<path d="' + d + '" fill="none" stroke="' + (col || OL) + '" stroke-width="' + (w || 3) + '" stroke-linecap="' + (cap || 'round') + '" stroke-linejoin="round"/>'; }
  function Tube(d, w, col) { return Ln(d, w + SW * 2, OL) + Ln(d, w, col); }                                                        // outlined stroke (antlers, staffs)
  function Blob(circles, fill, shade) {                                                                                              // union of circles, single outline
    var o = '', f = '', s = '';
    circles.forEach(function (c) { o += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (c[2] + SW / 2) + '" fill="' + OL + '"/>'; f += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + fill + '"/>';
      if (shade) s += '<circle cx="' + (c[0] - 3) + '" cy="' + (c[1] - 3) + '" r="' + c[2] * 0.72 + '" fill="' + shade + '"/>'; });
    return o + f + s;
  }
  function mir(s) { return '<g transform="matrix(-1 0 0 1 200 0)">' + s + '</g>'; }
  function G(cls, s, extra) { return '<g class="' + cls + '"' + (extra || '') + '>' + s + '</g>'; }

  // ---- shared anatomy ----
  var HEAD = ell(100, 92, 58, 52), EARL = ell(44, 102, 9, 11), EARR = ell(156, 102, 9, 11);
  var TORSO = 'M76 138 C72 156 70 172 70 190 Q100 197 130 190 C130 172 128 156 124 138 Q100 132 76 138 Z';
  var LEGL = 'M79 182 L79 214 Q79 220 88 220 Q97 220 97 214 L97 182 Z', LEGR = 'M121 182 L121 214 Q121 220 112 220 Q103 220 103 214 L103 182 Z';
  var SHOEL = ell(87, 223, 12, 7), SHOER = ell(113, 223, 12, 7);
  var ARM = 'M80 144 C68 150 60 162 58 178 Q58 184 64 185 Q70 185 71 179 C72 168 78 160 86 156 Z', HAND = ell(64, 184, 8.5, 8.5);
  function eyes(o) {
    o = o || {}; var y = o.y || 100, xs = o.xs || [80, 120], col = o.col || '#2a1a12', rx = o.rx || 5.5, ry = o.ry || 7.5, h = '';
    xs.forEach(function (x, i) {
      if (o.closed && o.closed[i]) { h += Ln('M' + (x - 7) + ' ' + y + ' Q' + x + ' ' + (y + 3) + ' ' + (x + 7) + ' ' + y, 3.2); return; }
      h += F(ell(x, y, rx, ry), col) + F(ell(x + 1.8, y - 3, 2, 2.3), '#fff');
    });
    return h;
  }
  function blush(y, op) { y = y || 114; return F(ell(68, y, 8.5, 4.8), '#f5908f', op || 0.65) + F(ell(132, y, 8.5, 4.8), '#f5908f', op || 0.65); }
  var M = {
    grin: S('M83 115 Q100 119 117 115 Q115 136 100 137 Q85 136 83 115 Z', '#8a2a24', null, 0, 0, 3.5) + F('M86 117 Q100 120 114 117 L113 122 Q100 124 87 122 Z', '#fff') + F(ell(100, 131, 7, 4), '#f07a7a'),
    smile: Ln('M91 118 Q100 126 109 118', 3.4),
    open: S('M92 117 Q100 118 108 117 Q106 128 100 128 Q94 128 92 117 Z', '#8a2a24', null, 0, 0, 3) + F(ell(100, 125, 4, 2.2), '#f07a7a'),
    frown: Ln('M92 124 Q100 119 108 124', 3.4),
    smirk: Ln('M90 121 Q102 126 111 117', 3.4)
  };
  function base(c, o) {   // o: {torso, legs, shoes, arms(sleeve colour), hands, head, headShade}
    return o;
  }

  // =================== characters ===================
  var SK = '#fcd9b8', SKS = '#efb48f';
  var C = {};

  C.luffy = function () {
    var hair = '#211b20';
    var legs = function (L) {
      var d = L ? LEGL : LEGR, x = L ? 0 : 24;
      return S(d, SK, SKS) + S(L ? 'M76 180 L100 180 L100 202 Q88 205 75 202 Z' : 'M124 180 L100 180 L100 202 Q112 205 125 202 Z', '#3f72c8', '#2d58a4') +
        Ln(L ? 'M77 198 L99 198' : 'M123 198 L101 198', 2.2, '#dfe8ff') + S(L ? SHOEL : SHOER, SK, SKS) + Ln(L ? 'M79 221 Q87 216 95 221' : 'M105 221 Q113 216 121 221', 3, '#8a5530');
    };
    var body = S(TORSO, SK, SKS) +
      S('M76 138 C72 156 70 172 70 190 L94 192 Q90 160 94 140 Z', '#dd3a33', '#b52a24') + S('M124 138 C128 156 130 172 130 190 L106 192 Q110 160 106 140 Z', '#dd3a33', '#b52a24') +
      F(ell(88, 160, 2.2, 2.2), '#f6d9a0') + F(ell(88, 172, 2.2, 2.2), '#f6d9a0') + Ln('M96 150 L104 158 M104 150 L96 158', 2.2, '#c9765a') +
      S('M69 182 Q100 190 131 182 L131 192 Q100 199 69 192 Z', '#f3d77a', '#d9b44e');
    var arm = S(ARM, SK, SKS) + S(HAND, SK, SKS);
    var head = S(EARL, SK, SKS) + S(EARR, SK, SKS) + S(HEAD, SK, SKS, -6, -5) +
      S('M44 100 Q40 58 100 52 Q160 58 156 100 L148 90 L144 106 L134 86 L128 102 L116 84 L108 98 L100 82 L92 98 L84 84 L72 102 L66 86 L56 106 L52 90 Z', hair, '#3a3038', 0, -4) +
      G('p-eyes', eyes()) + blush() + M.grin + Ln('M113 112 L128 110', 2.4, '#8a3a2a') + Ln('M117 108 L116 114 M123 107 L122 113', 2, '#8a3a2a');
    var hat = S(ell(100, 70, 80, 17), '#f4cf5c', '#d9ab3b', 0, -5) + S('M58 68 Q56 22 100 20 Q144 22 142 68 Q100 76 58 68 Z', '#f4cf5c', '#dcad3e') +
      S('M58 55 Q100 48 142 55 L142 67 Q100 75 58 67 Z', '#dd3a33', '#b52a24', 0, -3) + Ln('M70 34 Q84 26 98 25', 2.2, '#fff3b8');
    var sig = G('p-sig', Tube('M134 180 L166 256', 12, SK) + S(ell(168, 262, 13, 13), SK, SKS) + Ln('M161 262 L175 256 M163 268 L177 262', 2) + Ln('M150 196 l-8 4 M156 212 l-8 4 M162 228 l-8 4', 2, '#e8a07a'));
    return { legL: legs(1), legR: legs(0), body: body, armL: arm, armR: G('p-nosig', ''), armRIn: arm, head: head + hat, sigR: sig,
      pose: { armR: -68, armL: 20, head: -4, lean: 0 } };
  };

  C.zoro = function () {
    var hair = '#62b24c', hs = '#44903a';
    var legs = function (L) { return S(L ? LEGL : LEGR, '#2c2a33', '#1c1a22') + S(L ? SHOEL : SHOER, '#1f1d24', '#121116'); };
    var robe = 'M76 138 C72 160 68 180 64 206 Q100 214 136 206 C132 180 128 160 124 138 Q100 132 76 138 Z';
    var swords = Tube('M78 182 L30 150', 5, '#f4f4f4') + Tube('M78 184 L24 178', 5, '#46445a') + Tube('M78 186 L32 208', 5, '#bf343a') +
      Ln('M60 164 L54 176 M58 176 L58 190 M58 190 L62 200', 0.1) + S(ell(62, 170, 3.5, 5.5), '#e8b73a', null, 0, 0, 2.5) + S(ell(60, 181, 3.5, 5.5), '#e8b73a', null, 0, 0, 2.5) + S(ell(62, 195, 3.5, 5.5), '#e8b73a', null, 0, 0, 2.5);
    var body = S(robe, '#4f8e3c', '#3b7030') + S('M91 138 L100 162 L109 138 Q100 135 91 138 Z', SK, SKS, 0, -3) + Ln('M91 139 L100 162 L109 139', 3) +
      S('M69 170 Q100 177 131 170 L132 182 Q100 189 68 182 Z', '#a83434', '#862424') + swords;
    var arm = S(ARM, '#4f8e3c', '#3b7030') + S(HAND, SK, SKS);
    var head = S(EARL, SK, SKS) + S(EARR, SK, SKS) + F(ell(156, 116, 2.2, 4), '#f0c040') + F(ell(160, 115, 2.2, 4), '#f0c040') + F(ell(164, 113, 2.2, 4), '#f0c040') +
      Ln('M156 111 L156 113 M160 110 L160 112 M164 108 L164 110', 1.5) +
      S(HEAD, SK, SKS, -6, -5) +
      S('M44 96 Q36 40 100 36 Q164 40 156 96 Q152 80 142 76 L136 84 L128 70 L118 80 L108 66 L98 78 L88 66 L80 80 L70 70 L64 84 Q52 80 44 96 Z', hair, hs, 0, -5) +
      G('p-eyes', eyes({ closed: [0, 1] })) + Ln('M68 88 L91 94', 4.2) + Ln('M109 94 L132 88', 4.2) + Ln('M121 82 L119 118', 2.6, '#9a4434') + M.frown;
    var sig = G('p-sig', Ln('M52 121 L148 121', 5, '#dfe6ee') + Ln('M52 121 L72 121', 6, '#f4f4f4') + Ln('M72 121 L80 121', 7, '#e8b73a'));
    var bladeL = G('p-sig', Tube('M64 184 L40 120', 4, '#e6edf5') + Ln('M60 176 L70 172', 5, '#e8b73a'));
    var bladeR = G('p-sig', Tube('M136 184 L160 120', 4, '#e6edf5') + Ln('M140 176 L130 172', 5, '#e8b73a'));
    return { legL: legs(1), legR: legs(0), body: body, armL: arm + bladeL, armRIn: arm, sigR: bladeR, head: head + sig, pose: { armL: 35, armR: -35, head: 0 } };
  };

  C.sanji = function () {
    var hair = '#f6d64c', hs = '#d8af2c', suit = '#2d2f3b', suits = '#1d1f28';
    var legs = function (L) { return S(L ? LEGL : LEGR, suit, suits) + S(L ? SHOEL : SHOER, '#16161c', '#0c0c10'); };
    var body = S(TORSO, suit, suits) + S('M89 138 L100 170 L111 138 Q100 134 89 138 Z', '#6ea4e4', '#4f86c8', 0, -3) + Ln('M89 139 L100 170 L111 139', 3) +
      S('M98 146 L102 146 L104 166 L100 171 L96 166 Z', '#1a1a22') + Ln('M84 176 L90 176', 2, '#f2f2f2');
    var arm = S(ARM, suit, suits) + S(HAND, SK, SKS);
    var cake = S('M116 176 Q140 184 166 176 Q162 170 141 169 Q120 170 116 176 Z', '#ffffff', '#d8dde8', 0, -2, 3.5) +
      S('M128 172 L154 172 L152 156 L130 160 Z', '#fff2d6', '#ecd3a8', 0, 0, 3.5) + S('M129 160 L153 156 L152 162 Q141 166 129 165 Z', '#f58aaa', null, 0, 0, 3) + S(ell(142, 152, 5, 5), '#e53e44', null, 0, 0, 3) + F(ell(140.5, 150.5, 1.5, 1.5), '#fff');
    var head = S(EARL, SK, SKS) + S(EARR, SK, SKS) + S(HEAD, SK, SKS, -6, -5) +
      G('p-eyes', eyes({ xs: [120] })) + Ln('M110 86 Q120 80 129 85 Q134 90 129 93 Q125 94 125 90', 3.2) + blush(114, 0.4) + '<g transform="translate(8 0)">' + M.smile + '</g>' + S(ell(107, 136, 4, 3), hair, null, 0, 0, 2.5) +
      S('M42 104 Q34 42 100 36 Q162 38 158 98 Q154 78 140 70 Q122 64 108 72 Q100 88 97 106 Q94 124 76 134 Q80 124 72 124 Q50 122 42 104 Z', hair, hs, 3, -5) + Ln('M106 74 Q98 94 94 112', 2.2, '#c9971e') + Ln('M84 64 Q72 90 70 110', 2, '#c9971e') + S('M150 80 Q160 92 156 110 Q150 100 146 92 Z', hair, null, 0, 0, 3) + Ln('M130 46 Q146 54 152 70', 2.2, '#fff4a8');
    var flame = G('p-sig', S('M106 206 Q96 196 104 188 Q104 198 112 196 Q108 186 118 180 Q116 192 124 194 Q126 186 132 186 Q134 200 124 210 Q114 216 106 206 Z', '#ff8a2a', '#e45a16', 0, 0, 3.5) + F('M112 204 Q108 198 112 194 Q116 200 120 198 Q124 204 118 208 Z', '#ffe14a'));
    return { legL: legs(1), legR: legs(0) + flame, body: body, armL: arm, armRIn: arm, armRItem: cake, head: head, pose: { legR: -70, armL: 25, head: 6 } };
  };

  C.nami = function () {
    var hair = '#f68c30', hs = '#d86a1a';
    var back = S('M42 88 Q28 140 40 188 Q50 200 62 192 Q56 176 60 160 Q66 150 76 148 L124 148 Q134 150 140 160 Q144 176 138 192 Q150 200 160 188 Q172 140 158 88 Z', hair, hs, 4, -4);
    var legs = function (L) { return S(L ? 'M78 180 L78 214 Q78 220 88 220 Q98 220 98 214 L100 180 Z' : 'M122 180 L122 214 Q122 220 112 220 Q102 220 102 214 L100 180 Z', '#4a70ba', '#34569a') + S(L ? SHOEL : SHOER, '#8a5a34', '#6a4224'); };
    var top = 'M76 142 Q100 138 124 142 L126 164 Q100 168 74 164 Z';
    var body = S(TORSO, SK, SKS) + S(top, '#f4f8f0', '#d8e4d0') + F('M75 148 L125 148 L125 152 L75 152 Z M74 157 L126 157 L126 161 L74 161 Z', '#56a860') + S(top, 'none', null) +
      S('M70 176 Q100 182 130 176 L131 192 Q100 198 69 192 Z', '#4a70ba', '#34569a') + Ln('M100 180 L100 196', 2);
    var arm = S(ARM, SK, SKS) + S(HAND, SK, SKS);
    var tang = S(ell(62, 176, 10, 9.5), '#ff9a26', '#e67a12', -3, -3, 3.5) + S('M62 167 Q68 160 74 164 Q68 168 62 167 Z', '#58b04a', null, 0, 0, 2.5);
    var tattoo = Ln('M131 160 Q135 156 138 160 Q135 164 131 160', 2, '#3b6fd0');
    var head = S(EARL, SK, SKS) + S(EARR, SK, SKS) + S(HEAD, SK, SKS, -6, -5) + G('p-eyes', eyes({ col: '#4a2a18' })) + blush() + M.open +
      S('M42 100 Q36 40 100 36 Q164 40 158 100 Q152 80 138 72 Q126 84 106 82 Q88 80 80 68 Q58 78 42 100 Z', hair, hs, 3, -5) +
      S('M44 92 Q34 128 50 152 Q60 146 58 128 Q54 110 58 94 Z', hair, hs, 2, -3) + S('M156 92 Q166 128 150 152 Q140 146 142 128 Q146 110 142 94 Z', hair, hs, 2, -3) + Ln('M92 44 Q110 42 124 50', 2.2, '#ffc27a');
    var staff = G('p-sig', Tube('M136 190 L136 40', 5, '#6ab8f0') + S('M118 40 Q116 26 130 26 Q134 14 148 18 Q160 14 164 26 Q176 28 172 40 Z', '#dbe8f4', '#b8cce0', 0, 0, 3.5) + S('M146 42 L138 58 L146 58 L140 74 L156 52 L148 52 L154 42 Z', '#ffe14a', null, 0, 0, 3));
    return { back: back, legL: legs(1), legR: legs(0), body: body, armL: arm, armLItem: tang, armRIn: arm + tattoo, sigR: staff, head: head, pose: { armR: -8, head: -4 } };
  };

  C.chopper = function () {
    var fur = '#9c6236', furs = '#7a4624', face = '#e9b27e', faces = '#cf9460';
    var legs = function (L) { return S(L ? 'M81 190 L81 212 Q81 218 89 218 Q97 218 97 212 L97 190 Z' : 'M119 190 L119 212 Q119 218 111 218 Q103 218 103 212 L103 190 Z', fur, furs) + S(L ? ell(88, 221, 10, 6) : ell(112, 221, 10, 6), '#4a2c18', '#321c0e'); };
    var body = S('M78 150 C74 168 74 184 76 196 Q100 202 124 196 C126 184 126 168 122 150 Q100 144 78 150 Z', fur, furs) + S('M75 184 Q100 190 125 184 L126 198 Q100 205 74 198 Z', '#f2a24a', '#d8842c');
    var arm = S('M82 156 C72 162 66 172 65 184 Q66 189 71 189 Q76 188 76 183 C77 175 82 168 88 165 Z', fur, furs) + S(ell(70, 188, 7.5, 7), '#4a2c18', '#321c0e');
    var candy = Tube('M70 188 L44 150', 2.5, '#f4efe0') + Blob([[40, 142, 12], [30, 134, 9], [50, 132, 9], [36, 124, 9], [48, 122, 8]], '#ffb3cf', '#f590b8');
    var ant = function (L) { var d = L ? 'M60 52 Q46 34 40 12 M47 32 Q34 30 26 36 M52 44 Q62 26 64 14' : 'M140 52 Q154 34 160 12 M153 32 Q166 30 174 36 M148 44 Q138 26 136 14'; return Tube(d, 6, '#c58a4e'); };
    var head = ant(1) + ant(0) + S('M40 112 Q18 104 12 112 Q18 124 42 120 Z', fur, furs, 0, -3) + S('M160 112 Q182 104 188 112 Q182 124 158 120 Z', fur, furs, 0, -3) +
      S(ell(100, 106, 54, 44), face, faces, -6, -5) + S(ell(100, 124, 22, 14), '#f6d2a8', null, 0, 0, 0.01) +
      G('p-eyes', eyes({ y: 108, xs: [78, 122], rx: 6, ry: 8 })) + blush(122) + S(ell(100, 118, 8, 6), '#3a78d8', null, 0, 0, 3.5) + F(ell(97, 116, 2.4, 1.6), '#bfe0ff') +
      S('M92 128 Q100 131 108 128 Q107 138 100 139 Q93 138 92 128 Z', '#8a2a24', null, 0, 0, 3) + F(ell(100, 135, 4, 3), '#f07a7a');
    var hat = S('M38 96 Q30 26 100 22 Q170 26 162 96 Q100 84 38 96 Z', '#f58db3', '#dc6d96') + S('M36 86 Q100 74 164 86 L165 100 Q100 88 35 100 Z', '#e47aa2', '#c85c86', 0, -3) +
      Ln('M88 40 L112 64 M112 40 L88 64', 13) + Ln('M88 40 L112 64 M112 40 L88 64', 7, '#ffffff', 'butt');
    var hearts = G('p-sig', S('M150 60 q-6 -8 -12 -2 q-6 8 12 18 q18 -10 12 -18 q-6 -6 -12 2z', '#ff6f9c', null, 0, 0, 3) + S('M44 54 q-4 -6 -9 -1 q-4 6 9 13 q13 -7 9 -13 q-5 -5 -9 1z', '#ff6f9c', null, 0, 0, 3));
    return { scale: 0.9, legL: legs(1), legR: legs(0), body: body, armL: arm, armLItem: candy, armRIn: arm, head: head + hat + hearts, pose: { armL: 60, armR: -60, head: 0 } };
  };

  C.usopp = function () {
    var sk = '#c98a5e', sks = '#a86b42';
    var curls = Blob([[40, 112, 12], [46, 132, 11], [160, 112, 12], [154, 132, 11], [52, 92, 12], [148, 92, 12]], '#211b20', '#3a3038');
    var legs = function (L) { return S(L ? 'M77 180 L78 214 Q78 220 88 220 Q98 220 98 214 L100 180 Z' : 'M123 180 L122 214 Q122 220 112 220 Q102 220 102 214 L100 180 Z', '#d9c498', '#bca676') + S(L ? SHOEL : SHOER, '#6a4424', '#4a2c14'); };
    var body = S(TORSO, sk, sks) + Ln('M84 138 L80 186 M116 138 L120 186', 5, '#7a4a26') + S('M69 178 Q100 186 131 178 L131 192 Q100 199 69 192 Z', '#d9c498', '#bca676') +
      Ln('M120 140 L78 186', 4, '#7a4a26') + S('M60 178 Q58 196 74 198 Q88 198 88 184 Q86 174 74 174 Q62 174 60 178 Z', '#b8702e', '#94561c', -3, -3, 3.5) + Ln('M62 182 Q74 186 87 182', 2);
    var arm = S(ARM, sk, sks) + S(HAND, sk, sks);
    var staff = Tube('M138 208 L138 150', 5, '#5fb048') + Tube('M138 152 Q126 140 128 126 M138 152 Q150 140 148 126', 5, '#5fb048') + S(ell(138, 152, 5, 5), '#f3d77a', null, 0, 0, 3);
    var head = curls + S(EARL, sk, sks) + S(EARR, sk, sks) + S(HEAD, sk, sks, -6, -5) + G('p-eyes', eyes({ y: 97 })) + '<g transform="translate(0 5)">' + M.grin + '</g>' +
      S('M98 105 Q122 104 144 101 Q156 100 157 106 Q157 112 146 112 Q122 114 98 115 Z', sk, sks, 0, -3) + S(ell(151, 106, 7, 6.5), sk, sks, -2, -2, 4) + F(ell(152, 103.5, 2.2, 1.6), '#ecc09c');
    var hat = S(ell(100, 70, 74, 18), '#efe7c6', '#d6c99c', 0, -5) + S('M52 70 Q50 20 100 18 Q150 20 148 70 Q100 80 52 70 Z', '#efe7c6', '#d8cb9e') +
      S(ell(82, 52, 11, 10), '#f0a030', '#d27f14', -2, -2, 4) + S(ell(118, 52, 11, 10), '#f0a030', '#d27f14', -2, -2, 4) + Ln('M93 52 L107 52', 4) + F(ell(79, 49, 3, 2.5), '#fff0c8') + F(ell(115, 49, 3, 2.5), '#fff0c8');
    var shot = G('p-sig', S(ell(176, 118, 8, 8), '#e5403a', null, 0, 0, 3) + S('M176 96 L180 110 L194 108 L184 118 L192 130 L178 124 L170 136 L170 122 L156 120 L168 114 Z', '#ffe14a', '#f5a524', 0, 0, 3));
    return { legL: legs(1), legR: legs(0), body: body, armL: arm, armRIn: arm, armRItem: staff, head: head + hat, sigR: shot, pose: { armR: -40, head: -4 } };
  };

  C.jinbe = function () {
    var sk = '#5f9fe2', sks = '#437fc6';
    var legs = function (L) { return S(L ? 'M76 184 L76 214 Q76 220 88 220 Q99 220 99 214 L100 184 Z' : 'M124 184 L124 214 Q124 220 112 220 Q101 220 101 214 L100 184 Z', '#27366a', '#1a2550') + S(L ? SHOEL : SHOER, '#7a5634', '#5a3c20'); };
    var torso = 'M72 136 C66 156 64 176 66 196 Q100 204 134 196 C136 176 134 156 128 136 Q100 128 72 136 Z';
    var body = S(torso, '#f28a2a', '#d46c16') + S('M88 136 L100 160 L112 136 Q100 132 88 136 Z', sk, sks, 0, -3) + Ln('M86 136 L100 164 L114 136', 5, '#fbe7c4') + Ln('M86 136 L100 164 L114 136', 1.5) +
      S('M66 172 Q100 179 134 172 L134 186 Q100 193 66 186 Z', '#233466', '#172450') + S('M96 174 L104 174 L106 186 L94 186 Z', '#233466', null, 0, 0, 3) + F(ell(80, 152, 3, 3), '#ffd070') + F(ell(122, 158, 3, 3), '#ffd070');
    var arm = S('M78 142 C62 148 52 162 52 180 Q54 188 64 188 Q74 188 74 180 C76 170 80 162 88 158 Z', '#f28a2a', '#d46c16') + S(ell(64, 186, 9, 9), sk, sks);
    var head = S(ell(100, 94, 60, 52), sk, sks, -6, -5) + F(ell(100, 76, 44, 12), sks, 0.35) +
      S('M46 84 Q48 40 100 38 Q152 40 154 84 Q132 62 100 62 Q68 62 46 84 Z', '#1d1a22', '#35303c', 0, -4) + S(ell(100, 30, 14, 11), '#1d1a22', '#35303c', 0, -3) + S('M110 26 Q126 16 132 24 Q124 28 112 34 Z', '#1d1a22', null, 0, 0, 3.5) +
      Ln('M66 86 L90 90', 6) + Ln('M110 90 L134 86', 6) + G('p-eyes', eyes({ rx: 5, ry: 6.5, y: 101 })) + F(ell(100, 110, 7, 3), sks) +
      Ln('M78 124 Q100 132 122 124', 3.6) + S('M82 125 L84 110 L90 127 Z', '#fffdf4', null, 0, 0, 2.5) + S('M118 125 L116 110 L110 127 Z', '#fffdf4', null, 0, 0, 2.5) + S('M86 138 Q100 150 114 138 Q100 142 86 138 Z', '#1d1a22', null, 0, 0, 2.5);
    var wave = G('p-sig', S('M150 150 Q176 130 190 150 Q176 142 166 152 Q182 150 186 168 Q170 156 150 170 Z', '#8fd0ff', '#5fb0f0', 0, 0, 3.5));
    return { legL: legs(1), legR: legs(0), body: body, armL: arm, armRIn: arm, sigR: wave, head: head, pose: { armR: -80, armL: 10, head: 0 } };
  };

  C.franky = function () {
    var sk = '#f3bb8c', sks = '#d6946a', hair = '#39b9f0', hs = '#1f8cc6';
    var legs = function (L) { return S(L ? LEGL : LEGR, sk, sks) + S(L ? SHOEL : SHOER, '#2a2c36', '#16171e'); };
    var body = S(TORSO, sk, sks) + Ln('M100 150 L100 180 M90 160 L110 160 M91 170 L109 170', 2, '#b8784e') +
      S('M76 138 C72 156 70 172 70 190 L88 191 Q84 160 92 140 Z', '#e0463c', '#b8302a') + S('M124 138 C128 156 130 172 130 190 L112 191 Q116 160 108 140 Z', '#e0463c', '#b8302a') +
      F(ell(80, 156, 3.5, 3.5), '#ffd84a') + F(ell(120, 170, 3.5, 3.5), '#fff') + F(ell(78, 176, 3, 3), '#fff') + F(ell(122, 150, 3, 3), '#ffd84a') +
      S('M76 184 Q100 190 124 184 L122 198 Q100 203 78 198 Z', '#2f64c8', '#214c9e');
    var star = function (x, y) { return S('M' + x + ' ' + (y - 7) + ' L' + (x + 2) + ' ' + (y - 2) + ' L' + (x + 7) + ' ' + (y - 2) + ' L' + (x + 3) + ' ' + (y + 1) + ' L' + (x + 5) + ' ' + (y + 7) + ' L' + x + ' ' + (y + 3) + ' L' + (x - 5) + ' ' + (y + 7) + ' L' + (x - 3) + ' ' + (y + 1) + ' L' + (x - 7) + ' ' + (y - 2) + ' L' + (x - 2) + ' ' + (y - 2) + ' Z', '#2f64c8', null, 0, 0, 1.5); };
    var arm = S('M80 144 C70 150 64 158 62 164 L48 172 Q40 190 54 196 Q70 200 76 186 L78 170 C80 164 84 160 88 157 Z', sk, sks) + star(60, 180) + S(ell(62, 198, 10, 8), sk, sks);
    var head = S(EARL, sk, sks) + S(EARR, sk, sks) + S('M42 92 Q42 40 100 40 Q158 40 158 92 Q158 132 130 142 Q100 150 70 142 Q42 132 42 92 Z', sk, sks, -6, -5) +
      S('M46 88 Q40 20 108 14 Q170 16 164 58 Q158 70 150 66 Q150 46 118 46 Q84 46 76 66 Q60 64 46 88 Z', hair, hs, 0, -6) + Ln('M70 36 Q100 20 142 26', 2.5, '#a8e6ff') +
      S('M60 94 Q60 86 70 86 L94 86 Q98 86 98 94 L96 106 Q94 112 86 112 L70 112 Q62 112 60 104 Z', '#2b2f3a', '#1b1e26', -2, -2, 3.5) +
      S('M140 94 Q140 86 130 86 L106 86 Q102 86 102 94 L104 106 Q106 112 114 112 L130 112 Q138 112 140 104 Z', '#2b2f3a', '#1b1e26', -2, -2, 3.5) + Ln('M98 92 L102 92', 4) + Ln('M66 92 L74 90 M108 92 L116 90', 2.2, '#8fd8ff') +
      S('M96 114 L104 114 L103 121 L97 121 Z', '#b8c2cf', null, 0, 0, 2.5) + S('M84 126 Q100 130 116 126 Q113 138 100 139 Q87 138 84 126 Z', '#fff', null, 0, 0, 3) + Ln('M88 132 L112 132', 1.8);
    var stars = G('p-sig', S('M100 -4 L106 10 L121 10 L109 19 L114 34 L100 25 L86 34 L91 19 L79 10 L94 10 Z', '#ffd84a', '#f5a524', 0, 0, 3.5));
    return { legL: legs(1), legR: legs(0), body: body, armL: arm, armRIn: arm, head: head + stars, pose: { armL: 105, armR: -105, head: 0 } };
  };

  C.robin = function () {
    var sk = '#f6d0aa', sks = '#e2ad86', hair = '#2a2636', hs = '#3e3a4e';
    var back = S('M44 88 Q34 150 44 196 Q54 204 66 198 Q72 190 74 150 L126 150 Q128 190 134 198 Q146 204 156 196 Q166 150 156 88 Z', hair, hs, 4, -4);
    var legs = function (L) { return S(L ? SHOEL : SHOER, '#7a4a8a', '#5a3068'); };
    var body = S(TORSO, sk, sks) + S('M76 142 Q100 138 124 142 L126 164 Q100 170 74 164 Z', '#5a6fd4', '#4254b0') + Ln('M100 142 L100 166', 2) +
      S('M70 176 Q100 182 130 176 L140 220 Q100 228 60 220 Z', '#b25aa8', '#8e4086');
    var arm = S(ARM, sk, sks) + S(HAND, sk, sks);
    var head = S(HEAD, sk, sks, -6, -5) + G('p-eyes', eyes({ col: '#23305e' })) + blush(114, 0.45) + M.smile +
      S('M42 104 Q36 36 100 34 Q164 36 158 104 L152 104 L150 84 Q100 78 50 84 L48 104 Z', hair, hs, 0, -5) +
      S('M44 90 Q42 130 48 162 Q56 166 62 160 Q58 126 58 92 Z', hair, hs, 2, -3) + S('M156 90 Q158 130 152 162 Q144 166 138 160 Q142 126 142 92 Z', hair, hs, 2, -3) + Ln('M66 46 Q96 36 128 42', 2.8, '#6a6684') + Ln('M60 86 L60 100 M140 86 L140 100', 1.5, '#4a4660') +
      S('M58 58 Q60 46 76 48 Q90 50 88 60 Q86 68 74 68 Q60 68 58 58 Z', '#e8506a', '#b8304a', 0, 0, 3.5) + S('M142 58 Q140 46 124 48 Q110 50 112 60 Q114 68 126 68 Q140 68 142 58 Z', '#e8506a', '#b8304a', 0, 0, 3.5) + Ln('M88 56 Q100 50 112 56', 3.5);
    var hand = function (x, y, r) { return '<g transform="rotate(' + r + ' ' + x + ' ' + y + ')">' + S('M' + (x - 5) + ' ' + (y + 16) + ' L' + (x - 5) + ' ' + y + ' Q' + x + ' ' + (y - 10) + ' ' + (x + 5) + ' ' + y + ' L' + (x + 5) + ' ' + (y + 16) + ' Z', sk, sks, 0, 0, 3.5) + '</g>'; };
    var petals = function (x, y) { return F('M' + x + ' ' + y + ' q4 -6 8 0 q-4 6 -8 0z', '#ff9cc8'); };
    var sig = G('p-sig', hand(22, 150, -30) + hand(178, 146, 30) + hand(30, 196, -60) + hand(172, 194, 60) + petals(20, 120) + petals(170, 118) + petals(40, 90) + petals(156, 84));
    return { back: back, legL: legs(1), legR: legs(0), body: body, armL: arm, armRIn: arm, head: head, front: sig, pose: { armL: -30, armR: 30, head: 0 } };
  };

  C.brook = function () {
    var bone = '#f7f2e3', bs = '#d9cfb4', suit = '#25232d', suits = '#16151c';
    var afro = Blob([[100, 56, 44], [58, 78, 30], [142, 78, 30], [64, 44, 26], [136, 44, 26], [100, 24, 30], [46, 108, 20], [154, 108, 20]], '#211c22', '#34303a');
    var legs = function (L) { return S(L ? 'M84 184 L84 214 Q84 219 90 219 Q96 219 96 214 L96 184 Z' : 'M116 184 L116 214 Q116 219 110 219 Q104 219 104 214 L104 184 Z', suit, suits) + S(L ? 'M74 222 Q76 214 90 215 Q98 216 97 222 Q86 227 74 222 Z' : 'M126 222 Q124 214 110 215 Q102 216 103 222 Q114 227 126 222 Z', '#121116'); };
    var body = S('M80 140 C76 158 76 174 76 192 Q100 198 124 192 C124 174 124 158 120 140 Q100 134 80 140 Z', suit, suits) + S('M92 140 L100 150 L108 140 Q100 137 92 140 Z', '#fff', null, 0, 0, 3) +
      S('M94 146 Q100 142 106 146 Q110 156 104 166 Q100 160 96 166 Q90 156 94 146 Z', '#f2a42a', '#d4841a', 0, -2, 3);
    var arm = S('M82 146 C74 154 70 164 69 180 L75 180 C76 166 80 158 88 154 Z', suit, suits) + S(ell(72, 184, 6, 6), bone, bs, 0, 0, 3.5);
    var cane = Tube('M128 186 L128 226', 3.5, '#1a1920') + Tube('M124 184 Q128 178 134 182', 4, '#e8b73a');
    var head = afro + S('M52 96 Q52 50 100 50 Q148 50 148 96 Q148 126 124 138 L76 138 Q52 126 52 96 Z', bone, bs, -5, -4) +
      S(ell(80, 98, 11, 13), '#15131a', null, 0, 0, 3) + S(ell(120, 98, 11, 13), '#15131a', null, 0, 0, 3) + F(ell(83, 94, 2, 2.5), '#6a6a80') + F(ell(123, 94, 2, 2.5), '#6a6a80') +
      S('M100 110 L95 118 L105 118 Z', '#15131a', null, 0, 0, 2) +
      S('M78 124 Q100 128 122 124 Q120 146 100 147 Q80 146 78 124 Z', '#3a1c1c', null, 0, 0, 3.5) + F('M80 125 Q100 129 120 125 L119 131 Q100 134 81 131 Z', bone) + Ln('M88 126 L88 131 M96 127 L96 132 M104 127 L104 132 M112 126 L112 131', 1.6) +
      S('M66 70 Q64 60 76 60 Q88 60 94 68 Q100 64 106 68 Q112 60 124 60 Q136 60 134 70 Q132 80 120 80 Q108 80 104 72 L96 72 Q92 80 80 80 Q68 80 66 70 Z', '#ff8ab0', '#e0628e', 0, 0, 3.5);
    var crown = S('M64 22 L72 -2 L84 16 L100 -8 L116 16 L128 -2 L136 22 Q100 30 64 22 Z', '#f5c630', '#d8a414', 0, -3, 4) + S(ell(100, 12, 4, 4), '#e53e5a', null, 0, 0, 2.5) + S(ell(78, 16, 3, 3), '#4ab0e6', null, 0, 0, 2) + S(ell(122, 16, 3, 3), '#4ab0e6', null, 0, 0, 2);
    var note = function (x, y, c) { return S(ell(x, y, 6, 5), c, null, 0, 0, 2.5) + Tube('M' + (x + 5) + ' ' + y + ' L' + (x + 5) + ' ' + (y - 20) + ' Q' + (x + 12) + ' ' + (y - 16) + ' ' + (x + 14) + ' ' + (y - 10), 2.5, c); };
    var notes = G('p-sig', note(22, 70, '#5aa8f0') + note(170, 56, '#f5c630') + note(178, 110, '#8ad060'));
    return { scale: 0.92, legL: legs(1), legR: legs(0), body: body, armL: arm, armRIn: arm, armRItem: cane, head: head + crown, front: notes, pose: { head: -10, armL: 40, armR: -10 } };
  };

  // ---- Ghibli-inspired preview: two ORIGINAL chibi doctors (soft warm-brown outline, gouache-like flat shading) ----
  // Shop cosmetics: EQ = {outfit, hair, head, neck, hand, float, aura} for the doctor being built (pets are separate SVGs: PK_ART.pet)
  var EQ = {};
  var COAT = '#fbf8f1', COATS = '#e3dccd';
  var SCRUB = { 'scrub-lav': ['#b9a8e8', '#9b88d0'], 'scrub-sky': ['#9ccbef', '#79aedb'], 'scrub-rose': ['#f3a9ba', '#dc8a9e'], embscrubs: ['#2f6f6a', '#245854'] };
  function spark(x, y, r, c) { return F('M' + x + ' ' + (y - r) + ' Q' + (x + r * 0.18) + ' ' + (y - r * 0.18) + ' ' + (x + r) + ' ' + y + ' Q' + (x + r * 0.18) + ' ' + (y + r * 0.18) + ' ' + x + ' ' + (y + r) + ' Q' + (x - r * 0.18) + ' ' + (y + r * 0.18) + ' ' + (x - r) + ' ' + y + ' Q' + (x - r * 0.18) + ' ' + (y - r * 0.18) + ' ' + x + ' ' + (y - r) + 'Z', c || '#fff6c2'); }
  function flower(x, y, c) { return F(ell(x - 3, y, 3, 3), c) + F(ell(x + 3, y, 3, 3), c) + F(ell(x, y - 3, 3, 3), c) + F(ell(x, y + 3, 3, 3), c) + F(ell(x, y, 2, 2), '#ffe28a'); }
  function leaf(x, y, r, c) { return '<path d="M' + x + ' ' + y + ' q5 -7 11 -2 q-5 7 -11 2z" fill="' + (c || '#6fae74') + '" transform="rotate(' + (r || 0) + ' ' + x + ' ' + y + ')"/>'; }
  function docBody(isF) {
    var o = EQ.outfit || '', sc = SCRUB[o] || (isF ? ['#8fd6c0', '#6dbaa2'] : ['#2f4c80', '#233b66']), steth = EQ.neck === 'goldsteth' ? '#d9a521' : isF ? '#e58ea0' : '#46505e';
    var r = { legs: function (L) { return S(L ? LEGL : LEGR, sc[0], sc[1]) + (isF ? S(L ? SHOEL : SHOER, '#f7f6f1', '#d8d6cc') + Ln(L ? 'M77 225 L97 225' : 'M103 225 L123 225', 2, '#b9b4a6') : S(L ? SHOEL : SHOER, '#5a4030', '#3e2a1e')); } };
    var cl = 'M74 138 C68 158 65 180 64 204 Q82 209 98 206 L98 152 Z', cr = 'M126 138 C132 158 135 180 136 204 Q118 209 102 206 L102 152 Z';
    var stethD = Ln('M84 141 Q78 164 90 174', 3, steth) + Ln('M116 141 Q122 162 112 168 Q105 172 105 181', 3, steth) + S(ell(105, 185, 5.5, 5.5), EQ.neck === 'goldsteth' ? '#ffe08a' : '#d7dde4', EQ.neck === 'goldsteth' ? '#e0b030' : '#b9c2cc', -1, -1, 2.4) + (EQ.neck === 'goldsteth' ? spark(112, 178, 4, '#fff3b0') : '');
    if (o === 'yukata') {
      var robe = '#3d5a8a', robeS = '#2e4670';
      r.body = S('M72 138 C64 160 62 186 62 214 Q100 222 138 214 C138 186 136 160 128 138 Q100 132 72 138 Z', robe, robeS) + F('M92 139 L100 156 L108 139 Z', SK) + Ln('M88 139 L104 176 M112 139 L100 162', 3, '#f4ead2') +
        F(ell(80, 160, 3, 3), '#f4ead2', 0.7) + F(ell(120, 192, 3, 3), '#f4ead2', 0.7) + F(ell(84, 200, 2.5, 2.5), '#f4ead2', 0.7) + F(ell(118, 160, 2.5, 2.5), '#f4ead2', 0.7) +
        S('M66 172 Q100 178 134 172 L134 186 Q100 192 66 186 Z', '#e8a07a', '#cf855f') + S('M98 178 L116 176 L114 196 L104 186 Z', '#e8a07a', null, 0, 0, 2);
      r.legs = function (L) { return S(L ? SHOEL : SHOER, '#7a5634', '#5a3c20') + Ln(L ? 'M80 220 L94 220' : 'M106 220 L120 220', 2.4, '#d24a3a'); };
      r.sleeve = S('M80 144 C62 150 52 168 50 190 L74 192 C74 174 80 162 88 156 Z', robe, robeS) + S(ell(66, 186, 7.5, 7.5), SK, SKS);
      return r;
    }
    if (o === 'barong') {
      if (!isF) {
        r.body = S('M74 138 C68 160 66 182 66 204 Q100 210 134 204 C134 182 132 160 126 138 Q100 132 74 138 Z', '#f6eedb', '#e4d8bb') + Ln('M100 142 L100 196', 1.8, '#c9b48a') +
          Ln('M90 146 q4 6 0 12 q-4 6 0 12 M110 146 q-4 6 0 12 q4 6 0 12', 1.6, '#b89a64') + F(ell(100, 152, 2, 2), '#c9b48a') + F(ell(100, 166, 2, 2), '#c9b48a') + Ln('M80 194 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0', 1.4, '#c9b48a');
        r.legs = function (L) { return S(L ? LEGL : LEGR, '#2b2b33', '#1b1b22') + S(L ? SHOEL : SHOER, '#1e1a18', '#000'); };
        r.sleeve = S(ARM, '#f6eedb', '#e4d8bb', -3, -3) + Ln('M60 172 q5 2 10 0', 1.4, '#b89a64') + S(HAND, SK, SKS);
      } else {
        r.body = S('M76 138 C72 156 70 172 70 186 L60 222 Q100 230 140 222 L130 186 C130 172 128 156 124 138 Q100 132 76 138 Z', '#f7e3e6', '#e7c6cc') + Ln('M100 142 L100 220', 1.4, '#d4a2ac') +
          Ln('M78 200 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0', 1.4, '#c98a97') + F(ell(100, 150, 2, 2), '#c98a97') + S('M72 176 Q100 182 128 176 L128 186 Q100 192 72 186 Z', '#d9a521', '#b8871a', 0, -2, 2) +
          S('M76 140 Q60 120 70 112 Q82 126 90 138 Z', '#fbeff1', '#ead0d6', 0, 0, 2.6) + S('M124 140 Q140 120 130 112 Q118 126 110 138 Z', '#fbeff1', '#ead0d6', 0, 0, 2.6);
        r.legs = function (L) { return S(L ? 'M80 218 L96 218 L96 222 Q88 228 80 222 Z' : 'M104 218 L120 218 L120 222 Q112 228 104 222 Z', '#d9c9a8', '#bfa984', 0, 0, 2); };
        r.sleeve = S(ARM, SK, SKS) + S(HAND, SK, SKS);
      }
      return r;
    }
    var coatC = COAT, coatS = COATS, trim = o === 'goldcoat' ? Ln('M74 138 C68 158 65 180 64 204 M126 138 C132 158 135 180 136 204 M98 152 L98 206 M102 152 L102 206', 2.4, '#d9a521') + F(ell(94, 170, 2.4, 2.4), '#e8b83a') + F(ell(94, 186, 2.4, 2.4), '#e8b83a') : '';
    r.body = S(TORSO, sc[0], sc[1]) + F('M91 139 L100 152 L109 139 Z', SK) + Ln('M90 139 L100 154 L110 139', 2.2, sc[1]) +
      (o === 'embscrubs' ? flower(96, 162, '#f6d6e8') + flower(104, 176, '#f6d6e8') : '') +
      S(cl, coatC, coatS, 3, -3) + S(cr, coatC, coatS, -3, -3) + Ln('M86 141 L95 166', 2.2, '#cfc6b4') + Ln('M114 141 L105 166', 2.2, '#cfc6b4') + trim +
      Ln('M71 178 L87 178', 2, '#cfc6b4') + Ln('M83 171 L83 180', 2.6, '#4f86d6') + S('M108 166 L122 165 L122 179 L108 180 Z', '#cfe9f7', null, 0, 0, 2) + Ln('M111 171 L119 171 M111 175 L117 175', 1.6, '#6c90a8') +
      (o === 'herbcoat' || o === 'goldcoat' ? Ln('M78 168 q4 -10 8 -16', 1.6, '#4f8a5c') + leaf(80, 164, -40, '#6fae74') + leaf(82, 158, -80, '#8cc48a') + leaf(85, 153, -20, '#6fae74') : '') + stethD;
    r.sleeve = S(ARM, coatC, coatS, -3, -3) + Ln('M58 176 Q64 179 71 177', 2, o === 'goldcoat' ? '#d9a521' : '#cfc6b4') + S(HAND, SK, SKS);
    if (o === 'cloak') {
      r.back = S('M64 136 Q40 180 44 218 Q100 230 156 218 Q160 180 136 136 Q100 126 64 136 Z', '#5f8a6a', '#4b7255', 3, -3) + Ln('M56 200 q10 -4 20 0 M124 200 q10 -4 20 0', 1.6, '#c9b06a');
      r.body += S('M70 136 Q100 154 130 136 Q128 148 100 158 Q72 148 70 136 Z', '#6f9a78', '#5a8463', 0, -2, 2.6) + S(ell(100, 152, 5, 5), '#e8b83a', '#c89a28', 0, 0, 2);
    }
    return r;
  }
  function docHair(isF, hair, hs) {
    var h = EQ.hair || '', hl = isF ? '#b07a52' : '#5d5049';
    if (!isF) {
      if (h === 'h-undercut') return { front: S('M48 96 Q46 62 58 56 L58 92 Z M152 96 Q154 62 142 56 L142 92 Z', hs, null, 0, 0, 2.2) + S('M54 82 Q44 34 104 30 Q150 30 150 70 Q138 56 120 62 Q130 50 112 50 Q92 64 72 58 Q62 66 56 82 Z', hair, hs, 0, -4) + Ln('M76 42 Q98 32 126 38', 2.2, hl) + Ln('M118 50 q10 4 14 14', 2, hl) };
      if (h === 'h-topknot') return { front: S('M44 102 Q36 46 100 40 Q164 46 156 102 L151 92 Q148 80 136 76 Q118 82 100 76 Q82 82 64 76 Q52 82 49 92 Z', hair, hs, 0, -4) + S(ell(100, 30, 15, 12), hair, hs, -2, -2) + Ln('M86 38 Q100 44 114 38', 3, '#c94a3a') + Ln('M70 56 Q90 46 112 48', 2.2, hl) };
      return { front: S('M44 102 Q36 44 100 38 Q164 44 156 102 L151 92 Q148 79 136 74 Q124 83 106 76 Q90 85 72 78 Q58 82 52 93 Z', hair, hs, 0, -4) + Ln('M96 40 Q102 28 113 32', 3, hair) + Ln('M66 54 Q86 44 110 46', 2.2, hl) };
    }
    var bangs = 'M44 112 Q34 40 100 35 Q166 40 156 112 Q152 96 146 84 Q138 88 128 86 Q120 84 116 74 Q110 86 97 87 Q85 87 82 76 Q76 87 63 87 Q57 87 54 84 Q48 96 44 112 Z';
    if (h === 'h-braids') return { back: Tube('M46 120 Q36 160 48 196', 12, hair) + Tube('M154 120 Q164 160 152 196', 12, hair) + Ln('M41 140 l10 4 M40 156 l10 4 M42 172 l10 4 M149 140 l10 -4 M150 156 l10 -4 M148 172 l10 -4', 1.6, hs) + flower(48, 200, '#ffb3c6') + flower(152, 200, '#ffb3c6'), front: S(bangs, hair, hs, 0, -4) + Ln('M68 50 Q92 40 120 44', 2.4, hl) };
    if (h === 'h-bun') return { back: '', front: Blob([[100, 26, 17], [86, 32, 8], [116, 32, 8], [92, 18, 6], [110, 16, 6]], hair, hs) + S(bangs, hair, hs, 0, -4) + Ln('M70 40 q-8 -6 -4 -14 M132 40 q8 -6 4 -14', 2.2, hair) + Ln('M68 50 Q92 40 120 44', 2.4, hl) + Ln('M90 22 L114 12', 2.6, '#6fae74') };
    if (h === 'h-curlybob') return { back: Blob([[48, 110, 15], [46, 132, 14], [56, 148, 12], [152, 110, 15], [154, 132, 14], [144, 148, 12], [62, 60, 18], [138, 60, 18], [100, 44, 26]], hair, hs), front: Blob([[64, 72, 14], [84, 66, 14], [104, 64, 15], [124, 68, 14], [140, 78, 12], [56, 86, 11]], hair, hs) + Ln('M76 56 q8 -6 16 -2 M108 52 q8 -4 14 2', 2, hl) };
    return { back: S('M38 98 Q32 140 46 152 Q60 156 72 146 L128 146 Q140 156 154 152 Q168 140 162 98 Z', hair, hs, 3, -3),
      front: S(bangs, hair, hs, 0, -4) + S('M44 94 Q38 130 50 148 Q61 148 62 134 Q58 114 58 96 Z', hair, hs, 2, -3) + S('M156 94 Q162 130 150 148 Q139 148 138 134 Q142 114 142 96 Z', hair, hs, 2, -3) + Ln('M68 50 Q92 40 120 44', 2.4, hl) };
  }
  function headItem() {
    var h = EQ.head;
    if (h === 'capsurg') return S('M44 84 Q40 30 100 28 Q160 30 156 84 Q100 70 44 84 Z', '#9fd0b4', '#82b99c', 0, -3) + leaf(70, 50, -20, '#4f8a5c') + leaf(100, 42, 10, '#4f8a5c') + leaf(128, 54, 30, '#4f8a5c') + flower(86, 60, '#fff') + flower(116, 56, '#fff') + Ln('M150 80 q12 4 14 16 M150 80 q14 -2 20 6', 3, '#82b99c');
    if (h === 'headmirror') return Ln('M46 76 Q100 58 154 76', 5, '#3a3f4a') + F(ell(84, 52, 22, 22), '#fff6c8', 0.45) + S(ell(84, 54, 13, 13), '#e8f2fb', '#c8d6e4', 0, 0, 2.6) + F(ell(84, 54, 4, 4), '#3a3f4a') + spark(70, 40, 4) + spark(100, 42, 3);
    if (h === 'flowercrown') return Ln('M48 66 Q100 44 152 66', 3, '#6fae74') + flower(52, 66, '#ffb3c6') + flower(68, 57, '#fff1a8') + flower(86, 51, '#c8b6ff') + flower(104, 50, '#ffb3c6') + flower(122, 53, '#fff1a8') + flower(138, 59, '#c8b6ff') + flower(152, 67, '#ffb3c6') + leaf(60, 62, -30) + leaf(130, 56, 20);
    return '';
  }
  function auraBack() {
    var a = EQ.aura;
    if (a === 'sparkle') return '<g class="g-aura">' + F(ell(100, 140, 92, 96), '#fff3b0', 0.14) + spark(26, 90, 7) + spark(176, 70, 6) + spark(30, 180, 5) + spark(172, 170, 7) + spark(100, -2, 5) + '</g>';
    if (a === 'aura-petal') return '<g class="g-aura g-aura-p">' + F(ell(100, 140, 96, 100), '#ffd6e0', 0.16) + ['M22 80', 'M178 100', 'M30 170', 'M168 190', 'M60 20', 'M150 30'].map(function (m, i) { return '<path d="' + m + ' q6 -8 12 0 q-6 8 -12 0z" fill="' + (i % 2 ? '#ffb3c6' : '#ffd9a8') + '"/>'; }).join('') + '</g>';
    if (a === 'aura-aurora') return '<g class="g-aura g-aura-a"><defs><linearGradient id="' + nid() + 'au" x1="0" x2="1"><stop offset="0" stop-color="#8fe6d2"/><stop offset=".5" stop-color="#c8b6ff"/><stop offset="1" stop-color="#ffd6a8"/></linearGradient></defs>' +
      F(ell(100, 120, 98, 110), '#c8f0ff', 0.12) + '<ellipse cx="100" cy="18" rx="40" ry="9" fill="none" stroke="url(#' + PFX + '-' + uid + 'au)" stroke-width="5" opacity=".9"/>' + spark(60, 12, 4) + spark(142, 16, 4) + '</g>';
    return '';
  }
  function floatItem() {
    if (EQ.float === 'lantern') return '<g class="g-float">' + F(ell(176, 60, 20, 20), '#ffd27a', 0.3) + Ln('M176 30 L176 44', 1.6, '#8a6a4a') + S('M166 46 h20 l2 6 q2 12 -2 20 h-20 q-4 -8 -2 -20 z', '#ffc46b', '#f0a84a', 0, 0, 2.2) + Ln('M176 50 v20', 1.2, '#e08a30') + F(ell(176, 60, 4, 6), '#fff3c4') + '</g>';
    return '';
  }
  function handItem(isF) {
    if (EQ.hand === 'crystalscope') return '<g>' + F(ell(58, 168, 12, 12), '#bfe9ff', 0.35) + S('M60 186 L60 170', '#7a8696', null, 0, 0, 5) + S(ell(60, 164, 7, 8), '#c8ecff', '#9fd8f5', -1, -1, 2.2) + F(ell(58, 161, 2, 2.5), '#ffffff') + spark(48, 156, 3.5, '#e8f8ff') + S(ell(66, 186, 7.5, 7.5), SK, SKS) + '</g>';
    if (isF) return S('M42 164 L72 160 L77 202 L47 206 Z', '#b9834f', '#9a683a', 0, 0, 3) + F('M47 171 L69 168 L73 198 L51 201 Z', '#fffdf6') + Ln('M51 177 L67 175 M52 183 L68 181 M53 189 L66 187', 1.6, '#9fc7bb') +
      S('M53 163 L64 162 L64 168 L53 169 Z', '#d7dde4', null, 0, 0, 2) + S(ell(66, 186, 7.5, 7.5), SK, SKS);
    return '';
  }
  function doc(isF) {
    var hair = isF ? '#7a4a2e' : '#2a2420', hs = isF ? '#94603d' : '#40362f', b = docBody(isF), hr = docHair(isF, hair, hs);
    var face = isF ? G('p-eyes', eyes({ y: 102, col: '#4a2a18' }) + Ln('M73 97 L70 94 M127 97 L130 94', 1.8, '#4a2a18')) + blush(116, 0.55) + M.smile
      : G('p-eyes', eyes({ y: 101, rx: 4.8, ry: 6.4, col: '#2a1a12' })) + blush(116, 0.4) + M.smile;
    var glasses = isF ? '' : Ln('M71 86 Q79 83 87 86', 2.4, hair) + Ln('M113 86 Q121 83 129 86', 2.4, hair) +
      '<circle cx="80" cy="101" r="13" fill="rgba(214,236,255,.22)" stroke="#3a2a22" stroke-width="2.8"/><circle cx="120" cy="101" r="13" fill="rgba(214,236,255,.22)" stroke="#3a2a22" stroke-width="2.8"/>' +
      Ln('M93 99 Q100 95 107 99', 2.6, '#3a2a22') + Ln('M67 99 L47 96 M133 99 L153 96', 2.4, '#3a2a22') + Ln('M73 95 L77 92 M113 95 L117 92', 1.6, '#ffffff');
    var head = (isF ? '' : S(EARL, SK, SKS) + S(EARR, SK, SKS)) + S(HEAD, SK, SKS, -6, -5) + face + hr.front + glasses + headItem();
    var sig = isF ? G('p-sig', F(ell(140, 202, 19, 19), '#ffd6e0', 0.4) + S('M140 212 Q124 200 128 192 Q133 184 140 192 Q147 184 152 192 Q156 200 140 212 Z', '#ff9db2', '#f07f98', 0, 0, 2.4) + spark(160, 184, 6) + spark(122, 186, 4.5) + spark(158, 222, 4.5))
      : G('p-sig', F(ell(141, 202, 19, 19), '#fff3b0', 0.38) + S(ell(141, 202, 9, 9), '#ffe58a', null, 0, 0, 2.4) + F('M139 196 L143 196 L143 200 L147 200 L147 204 L143 204 L143 208 L139 208 L139 204 L135 204 L135 200 L139 200 Z', '#5aa98a') + spark(162, 186, 6) + spark(124, 220, 5) + spark(160, 222, 4));
    return { back: auraBack() + (b.back || '') + (hr.back || ''), legL: b.legs(1), legR: b.legs(0), body: b.body, armL: b.sleeve, armLItem: handItem(isF), armRIn: b.sleeve, sigR: sig, head: head, front: floatItem(),
      pose: isF ? { armR: -118, armL: 8, head: 6 } : { armR: -112, armL: 14, head: -5 } };
  }
  C.mdoc = function () { return doc(false); };
  C.fdoc = function () { return doc(true); };
  // ---- original pets (separate small SVGs, drawn beside the doctor) ----
  var PETS = {
    cloudpup: function () { return Blob([[50, 62, 22], [32, 66, 15], [68, 66, 15], [40, 50, 14], [62, 48, 14]], '#ffffff', '#e6eef8') + S(ell(28, 52, 7, 11), '#e6eef8', null, 0, 0, 2.6) + S(ell(72, 52, 7, 11), '#e6eef8', null, 0, 0, 2.6) +
      F(ell(43, 60, 3, 3.6), '#3a2a22') + F(ell(57, 60, 3, 3.6), '#3a2a22') + F(ell(50, 67, 3, 2.2), '#3a2a22') + F(ell(36, 68, 4, 2.4), '#ffb3c6', 0.7) + F(ell(64, 68, 4, 2.4), '#ffb3c6', 0.7) + spark(84, 34, 4, '#cfe9ff'); },
    mossturtle: function () { return S(ell(70, 74, 10, 8), '#c9b27a', '#b09658', 0, 0, 2.6) + S('M18 80 Q20 46 50 44 Q80 46 82 80 Z', '#6f9a5a', '#5a8248') + Ln('M30 64 q8 -8 16 0 M52 58 q8 -8 16 0', 2, '#4a6e3c') + flower(46, 48, '#fff1a8') + leaf(56, 46, -40, '#8cc48a') +
      S(ell(28, 84, 6, 4), '#c9b27a', null, 0, 0, 2.2) + S(ell(70, 84, 6, 4), '#c9b27a', null, 0, 0, 2.2) + F(ell(74, 72, 1.8, 2.2), '#3a2a22'); },
    lanternowl: function () { return F(ell(50, 30, 16, 16), '#ffd27a', 0.35) + S(ell(50, 60, 22, 24), '#b98a5a', '#9a6e44') + S(ell(50, 66, 13, 15), '#f3e3c4', null, 0, 0, 2) + S('M30 42 L34 30 L42 40 Z M70 42 L66 30 L58 40 Z', '#b98a5a', null, 0, 0, 2.4) +
      S(ell(41, 52, 7, 7), '#fff', null, 0, 0, 2) + S(ell(59, 52, 7, 7), '#fff', null, 0, 0, 2) + F(ell(41, 52, 3, 3), '#3a2a22') + F(ell(59, 52, 3, 3), '#3a2a22') + S('M47 58 L53 58 L50 63 Z', '#e8a040', null, 0, 0, 1.6) +
      Ln('M74 70 L84 62', 2, '#8a6a4a') + S('M80 54 h10 l1 4 q1 6 -1 10 h-10 q-2 -4 -1 -10z', '#ffc46b', null, 0, 0, 2) + F(ell(85, 61, 2, 3), '#fff3c4'); },
    bandbunny: function () { return S(ell(40, 26, 6, 18), '#fbf6ee', '#e8dfd0', 0, 0, 2.6) + S(ell(60, 26, 6, 18), '#fbf6ee', '#e8dfd0', 0, 0, 2.6) + Ln('M35 22 l10 4 M55 26 l10 -4', 1.6, '#d9c9a8') + S(ell(50, 64, 22, 20), '#fbf6ee', '#e8dfd0') +
      Ln('M30 58 L70 66', 6, '#f0e2c4') + Ln('M30 58 L70 66', 1, '#d9c9a8') + F(ell(42, 58, 2.6, 3), '#3a2a22') + F(ell(58, 60, 2.6, 3), '#3a2a22') + F(ell(50, 66, 2.4, 1.8), '#ff9db2') + S('M42 70 h8 v6 h-8z', '#ff9db2', null, 0, 0, 1.4); },
    starkoi: function () { return F(ell(50, 56, 34, 26), '#c8e6ff', 0.25) + S('M18 56 Q34 34 58 42 Q76 48 80 56 Q76 64 58 70 Q34 78 18 56 Z', '#fff8ec', '#f3e3cc') + F(ell(46, 50, 7, 5), '#ff9a6a') + F(ell(60, 62, 6, 4), '#ff9a6a') +
      S('M80 56 L94 44 Q90 56 94 68 Z', '#ffd6b8', null, 0, 0, 2.2) + F(ell(30, 52, 2.6, 2.6), '#2a3a5a') + spark(70, 30, 4) + spark(24, 80, 3.5) + spark(88, 82, 3, '#cfe9ff'); }
  };
  function pet(id, w) { if (!PETS[id]) return ''; uid = 0; PFX = 'pet' + id; return '<svg class="petsvg pet-' + id + '" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="' + (w || 40) + '" height="' + (w || 40) + '" overflow="visible"><ellipse cx="50" cy="92" rx="26" ry="5" fill="rgba(0,0,0,.18)"/><g class="pet-b">' + PETS[id]() + '</g></svg>'; }

  var ORDER = ['fdoc', 'mdoc'];
  function build(id, prefix, opts) {
    PFX = (prefix || 'c') + id; uid = 0; opts = opts || {}; EQ = opts.eq || (window.PK_EQ ? PK_EQ(id) : {}) || {};
    var c = C[id](), sc = c.scale || 1;
    var armR = G('p-armR', mir(c.armRIn || '') + (c.armRItem || '') + (c.sigR || ''));
    var armL = G('p-armL', (c.armL || '') + (c.armLItem || ''));
    var up = G('p-up', (c.body || '') + armL + armR + G('p-head', (c.head || '')) + (c.front || ''));
    var inner = (c.back ? G('p-back', c.back) : '') + G('p-legL', c.legL || '') + G('p-legR', c.legR || '') + up;
    var t = sc !== 1 ? ' transform="translate(' + (100 - 100 * sc) + ' ' + (226 - 226 * sc) + ') scale(' + sc + ')"' : '';
    return '<svg class="chibi ch-' + id + '" viewBox="-10 -14 220 248" xmlns="http://www.w3.org/2000/svg"' + (opts.w ? ' width="' + opts.w + '" height="' + Math.round(opts.w * 248 / 220) + '"' : '') + ' overflow="visible">' +
      '<ellipse class="p-shadow" cx="100" cy="226" rx="44" ry="7" fill="rgba(0,0,0,.22)"/><g class="p-root"><g class="p-all"' + t + '>' + inner + '</g></g></svg>';
  }
  function pose(id) { return C[id]().pose || {}; }
  window.PK_ART = { build: build, pose: pose, ORDER: ORDER, pet: pet, PETS: Object.keys(PETS) };
})();
