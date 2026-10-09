/* PHILHEALTH KING (Ghibli-inspired preview): soft hand-drawn icons replacing the 12x12 pixel set. Original art; 24x24 viewBox,
   warm-brown outline + watercolor-like fills. Same API as icons.js: pix(name, size) -> cached <img>. Unknown names fall back to a leaf. */
(function () {
  var O = '#5a3f30';
  function p(d, f, w) { return '<path d="' + d + '" fill="' + (f || 'none') + '" stroke="' + O + '" stroke-width="' + (w || 1.3) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function c(x, y, r, f, w) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (f || 'none') + '" stroke="' + O + '" stroke-width="' + (w == null ? 1.3 : w) + '"/>'; }
  function d(x, y, r, f, op) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (op ? ' opacity="' + op + '"' : '') + '/>'; }
  function wash(f) { return '<ellipse cx="12" cy="13" rx="10.5" ry="9.5" fill="' + f + '" opacity=".38"/>'; }
  var SAGE = '#9cc79a', SKY = '#a9d6ee', CREAM = '#fbf3e0', PEACH = '#f6c4a0', TEAL = '#7cc2b6', GOLD = '#f2c75c', ROSE = '#f4a9b6', LAV = '#c8b6ff', SKIN = '#fbd7b8';
  var I = {
    ear: wash(PEACH) + p('M9 20c-2 0-3-2-2-4 1-2 0-3 0-6a5.5 5.5 0 0 1 11 0c0 3-2 4-3 5-1 1-1 4-3 5', SKIN) + p('M10 10a2.5 2.5 0 0 1 5 0c0 1.6-1.6 2-1.6 3.5'),
    nose: wash(SKY) + p('M12 3c0 5-4 9-4 12 0 2 2 3 4 3s4-1 4-3c0-3-4-7-4-12z', SKIN) + p('M10 16.5c.6.6 1.2.6 1.6 0M12.4 16.5c.6.6 1.2.6 1.6 0'),
    mouth: wash(ROSE) + p('M3.5 12c3-3 5-3 8.5-1.5C15.5 9 17.5 9 20.5 12c-3 5-14 5-17 0z', '#f08f9c') + p('M5 12h14'),
    throat: wash(TEAL) + p('M8 3v6c0 3-2 5-2 8v4h12v-4c0-3-2-5-2-8V3', SKIN) + d(12, 15, 2.6, '#fff3b0', '.9') + p('M10 14c1 1.4 3 1.4 4 0'),
    drop: wash(SKY) + p('M12 3c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z', '#bfe6f5') + p('M9.5 15a2.5 2.5 0 0 0 2.5 2.5'),
    larynx: wash(TEAL) + p('M7 4h10l-1 6H8z', '#d6efe6') + p('M8 10v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9', '#eaf5ef') + p('M12 11v8M9.5 13l2.5 2 2.5-2'),
    trachea: wash(TEAL) + p('M9 3h6v18H9z', '#eaf5ef') + p('M9 7h6M9 11h6M9 15h6M9 19h6'),
    thyroid: wash(ROSE) + p('M12 9c-3-5-9-3-8 3 1 5 6 6 8 2 2 4 7 3 8-2 1-6-5-8-8-3z', '#f3b5bf') + p('M12 9v6'),
    neck: wash(SAGE) + p('M8 3c0 5-1 7-4 10v8h16v-8c-3-3-4-5-4-10', SKIN) + p('M9 15c2 1 4 1 6 0'),
    skull: wash(LAV) + p('M5 11a7 7 0 1 1 14 0c0 3-2 4-2 6H7c0-2-2-3-2-6z', CREAM) + c(9.3, 11, 1.7, '#7a6a8a', 0) + c(14.7, 11, 1.7, '#7a6a8a', 0) + p('M10 19v2M14 19v2M12 13.5l-1 2h2z'),
    scalpel: wash(SKY) + p('M4 20 14 10l2 2L6 22z', '#c9b08a') + p('M14 10 19 3c1.5 2 1 5-1 7l-2 2z', '#e6eef4') + d(19, 5, 1, '#fff'),
    eye: wash(SKY) + p('M2.5 12C6 6 18 6 21.5 12 18 18 6 18 2.5 12z', '#fffaf0') + c(12, 12, 3.6, '#6fb3c8') + d(12, 12, 1.6, '#2a3a4a') + d(13.2, 10.8, .8, '#fff'),
    fire: wash(PEACH) + p('M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 0 2 1 3 2 3 0-3 1-5 1-8z', '#f7a86a') + p('M12 13c1 1 2 2 2 3.5a2 2 0 0 1-4 0c0-1 1-2 2-3.5z', '#ffe08a'),
    band: wash(PEACH) + '<g transform="rotate(-35 12 12)">' + p('M3 9h18v6H3z', '#f3dcc0') + p('M9 9v6M15 9v6') + d(11, 11, .6, '#b08a64') + d(13, 13, .6, '#b08a64') + d(13, 11, .6, '#b08a64') + d(11, 13, .6, '#b08a64') + '</g>',
    bolt: wash(GOLD) + p('M13 2 5 13h6l-2 9 9-12h-6z', '#ffd86a'),
    chest: wash(PEACH) + p('M4 9h16v11H4z', '#c98a5a') + p('M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3') + p('M10.5 12h3v2h2v3h-2v2h-3v-2h-2v-3h2z', '#fffaf0', 1),
    glasses: wash(SKY) + c(7, 13, 3.6, '#e8f6ff') + c(17, 13, 3.6, '#e8f6ff') + p('M10.6 12.5c1-1 1.8-1 2.8 0M3.4 12 2 9M20.6 12 22 9'),
    crab: wash(LAV) + p('M5 13a7 5 0 0 0 14 0z', '#c8b6ff') + p('M12 4v6M9 6l3 3 3-3') + d(12, 4, 1.4, GOLD),
    scroll: wash(SAGE) + p('M6 4h11a2 2 0 0 1 0 4H8v12H6a2 2 0 0 1 0-4V4z', CREAM) + p('M9 11h6M9 14h6M9 17h4'),
    coins: wash(GOLD) + p('M5 4h14v16H5z', '#fffaf0') + p('M7.5 6.5h9v3h-9z', '#d6efe6') + d(8.5, 13, 1.1, '#5a3f30') + d(12, 13, 1.1, '#5a3f30') + d(15.5, 13, 1.1, '#5a3f30') + d(8.5, 16.5, 1.1, '#5a3f30') + d(12, 16.5, 1.1, '#5a3f30') + p('M14.5 16.5h2.2', '#5a3f30'),
    npc: wash(SAGE) + c(12, 8, 3.6, SKIN) + p('M5 21c0-4 3-7 7-7s7 3 7 7z', '#fbf8f1') + p('M10 14l2 3 2-3'),
    person: wash(ROSE) + c(12, 8, 3.6, SKIN) + p('M5 21c0-4 3-7 7-7s7 3 7 7z', '#a9d6c8'),
    helm: wash(TEAL) + c(12, 12, 7, '#fbf3e0') + c(12, 12, 2.4, '#7cc2b6') + p('M12 3v4M12 17v4M3 12h4M17 12h4'),
    star: wash(GOLD) + p('M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z', '#ffe08a'),
    strawhat: wash(SKY) + p('M3 20 21 20 19 16H5z', '#f2c75c') + p('M5 16 6.5 8l3.5 4L12 6l2 6 3.5-4L19 16z', '#ffd86a') + p('M10.5 13.5h3v3h-3z', '#7cc2b6', 1) + d(12, 5.2, 1.2, '#f4a9b6'),
    jolly: wash(TEAL) + p('M8 3v7a4 4 0 0 0 8 0V3') + p('M12 14v2a4 4 0 0 0 8 0v-2', null) + c(20, 12, 2.2, '#d7dde4') + c(8, 3, 1, '#5a3f30', 0) + c(16, 3, 1, '#5a3f30', 0) + d(13.5, 19.5, 2.6, '#fff3b0', '.5'),
    logpose: wash(SAGE) + p('M6 5h12v16H6z', '#fffaf0') + p('M9 3h6v4H9z', '#d7dde4') + p('M8.5 11h7M8.5 14h7M8.5 17h4.5') + p('M15 16.5l1.2 1.2 2.3-2.6', null, 1.5),
    wheel: wash(TEAL) + c(12, 12, 7.5, '#d6efe6') + c(12, 12, 2, '#fffaf0') + p('M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M18.7 5.3l-2.8 2.8M8.1 15.9l-2.8 2.8'),
    hosp: wash(SKY) + p('M4 21V8l8-5 8 5v13z', '#fbf3e0') + p('M10.5 9h3v2.5H16v3h-2.5V17h-3v-2.5H8v-3h2.5z', '#7cc2b6', 1) + p('M3 21h18'),
    clinic: wash(SAGE) + p('M4 21V10h16v11z', '#fbf3e0') + p('M3 10l9-6 9 6') + p('M10 21v-5h4v5', '#a9d6ee') + p('M11 11h2v1.5h1.5v2H13V16h-2v-1.5H9.5v-2H11z', '#f08f9c', .9),
    center: wash(PEACH) + p('M3 21V11h18v10z', '#fbf3e0') + p('M7 11V7h10v4', '#f6e3c8') + p('M6 14h2v2H6zM11 14h2v2h-2zM16 14h2v2h-2z', '#a9d6ee', 1) + p('M12 3v4M10 5h4'),
    qmap: wash(PEACH) + p('M4 6h16v15H4z', '#fffaf0') + p('M4 6h16v4H4z', '#9cc79a') + p('M8 3v5M16 3v5') + d(9, 14, 1.2, '#f08f9c') + d(13, 14, 1.2, '#7cc2b6') + d(9, 17.5, 1.2, '#7cc2b6') + '<path d="M15 16q2-3 4-1-2 3-4 1z" fill="#6fae74"/>',
    lock: wash(LAV) + p('M7 11V8a5 5 0 0 1 10 0v3') + p('M5 11h14v10H5z', '#f2c75c') + d(12, 15, 1.4, '#5a3f30') + p('M12 16v2.5'),
    anchor: wash(TEAL) + p('M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z', '#d6efe6') + p('M12 8v9M9.5 13h5'),
    g: wash(SAGE) + '<path d="M6 18C6 10 11 5 19 5c0 8-5 13-13 13z" fill="#9cc79a" stroke="' + O + '" stroke-width="1.3"/>' + p('M6 18 15 9'),
    leaf: wash(SAGE) + '<path d="M6 18C6 10 11 5 19 5c0 8-5 13-13 13z" fill="#9cc79a" stroke="' + O + '" stroke-width="1.3"/>' + p('M6 18 15 9'),
    shop: wash(PEACH) + p('M4 9h16l-1 12H5z', '#f6e3c8') + p('M8 9a4 4 0 0 1 8 0') + p('M10 14.5c0-1.3 2-2 2 0 0-2 2-1.3 2 0 0 1.5-2 3-2 3s-2-1.5-2-3z', '#f4a9b6', 1),
    cloud: wash(SKY) + p('M6 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1.5A4 4 0 1 1 18 18z', '#ffffff'),
    sync: wash(SKY) + p('M5 12a7 7 0 0 1 12-5l2 2M19 12a7 7 0 0 1-12 5l-2-2') + p('M19 4v5h-5M5 20v-5h5')
  };
  var cache = {};
  window.pix = function (name, size) {
    size = size || 24; var key = name + '@' + size; if (cache[key]) return cache[key];
    var body = I[name] || I.leaf;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' + body + '</svg>';
    return (cache[key] = '<img class="pix gpix" width="' + size + '" height="' + size + '" alt="" aria-hidden="true" draggable="false" src="data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27') + '">');
  };
  window.GPIX = I;
})();
