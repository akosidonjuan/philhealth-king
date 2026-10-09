/* Original 12x12 pixel-art icons (drawn for this app), rendered as crisp inline SVG. */
(function () {
  var PAL = { k: '#2a2f4a', s: '#f3c9a0', S: '#d58f68', r: '#c9413a', p: '#ee97a4', w: '#ffffff', b: '#2f6fc4', B: '#9dd0f5',
    g: '#b3bccb', G: '#6b7489', y: '#efe5c4', Y: '#c9b98a', t: '#1f9e8f', T: '#7fd9cc', o: '#c24e70', O: '#e98aa8', n: '#8a5a2b', d: '#f2c14e', D: '#b7842a' };
  var M = {
    ear: ['....kkkk....', '...kssssk...', '..ksSSSssk..', '..ksS..Ssk..', '..ksS.kSsk..', '..kss.kSsk..', '...ks.kssk..', '...kssSssk..', '....kssSk...', '....ksssk...', '.....kssk...', '......kk....'],
    nose: ['....kk......', '....ksk.....', '....kssk....', '....ksssk...', '....kssssk..', '....ksssssk.', '....ksssssk.', '...kssSSssk.', '..kssk.kSk..', '..kkk...kk..', '............', '............'],
    mouth: ['............', '............', '..kkkkkkkk..', '.krrpkkprrk.', 'krrrrrrrrrrk', 'kkwwwwwwwwkk', 'kkkkkkkkkkkk', 'krrwwwwwwrrk', '.krrrrrrrrk.', '..kkkkkkkk..', '............', '............'],
    throat: ['.kkkkkkkkkk.', 'kppppppppppk', 'kpprrkkrrppk', 'kprrrkkrrrpk', 'kprrkrrkrrpk', 'kpOkrrrrkOpk', 'kpOOkrrkOOpk', 'kpOOkrrkOOpk', 'kpOkrrrrkOpk', 'kpprrrrrrppk', 'kppppppppppk', '.kkkkkkkkkk.'],
    drop: ['.....kk.....', '.....kBk....', '....kBBk....', '....kBbBk...', '...kBBbbBk..', '...kBbbbbk..', '..kBwbbbbbk.', '..kBwbbbbbk.', '..kBBbbbbbk.', '...kBbbbbk..', '....kkkkk...', '............'],
    larynx: ['..kkkkkkkk..', '.kggggggggk.', '.kgkkkkkkgk.', '.kgkwrrwkgk.', '.kgkwrrwkgk.', '.kgkwrrwkgk.', '.kgkkwwkkgk.', '..kgkwwkgk..', '..kggkkggk..', '...kggggk...', '...kgGGgk...', '....kkkk....'],
    trachea: ['....kkkk....', '...kBBBBk...', '..kkkkkkkk..', '.kggggggggk.', '.kgGGGGGGgk.', '..kkBBBBkk..', '....kBBk....', '....kBBk....', '....kBBk....', '....kBBk....', '....kBBk....', '....kkkk....'],
    thyroid: ['............', '.kk......kk.', 'kOok....kOok', 'kOook..kOook', 'kOoookkoooOk', 'kOooooooooOk', 'kOoooooooook', 'kooook.kooook'.slice(0, 12), '.koook.kook.', '..kkk...kk..', '............', '............'],
    neck: ['...kkkkk....', '..ksssssk...', '.ksssssssk..', '.kssssssssk.', '.ksssssssk..', '..kssssssk..', '...kssssk...', '...kssSk....', '...kssSk....', '..kssssSsk..', '.ksssssssssk', 'kkkkkkkkkkkk'],
    skull: ['...kkkkkk...', '..kyyyyyyk..', '.kyyyyyyyyk.', '.kyyyyyyyyk.', '.kykkyykkyk.', '.kykkyykkyk.', '.kyyyykyyyk.', '..kyykkyyk..', '..kykykykk..', '...kyyyyk...', '....kkkk....', '............'],
    scalpel: ['..........kk', '.........kgk', '........kgk.', '.......kgwk.', '......kgwk..', '.....kgwk...', '....kGGk....', '...kGGk.....', '..kGGk......', '.kGGk.......', 'kGGk........', 'kkk.........'],
    eye: ['............', '............', '...kkkkkk...', '..kwwwwwwk..', '.kwwbbbbwwk.', 'kwwbBkkBbwwk', 'kwwbkkkkbwwk', 'kwwbBkkbbwwk', '.kwwbbbbwwk.', '..kwwwwwwk..', '...kkkkkk...', '............'],
    fire: ['.....k......', '....kdk.....', '....kdk..k..', '...kdddk.kdk', '..kdrddk.kdk', '..kdrrddkddk', '.kdrrrrdddk.', '.kdrryrrddk.', '.kdrryyrrdk.', '..kdrrrrdk..', '...kkkkkk...', '............'],
    band: ['............', '.........kk.', '........kppk', '.......kpwpk', '......kpwwk.', '.....kpwgwk.', '....kwgwpk..', '...kpwwpk...', '..kpwwpk....', '.kppwpk.....', 'kppkkk......', '.kk.........'],
    bolt: ['.......kkkk.', '......kddk..', '.....kddk...', '....kddk....', '...kddkkkk..', '..kddddddk..', '..kkkkddk...', '.....kddk...', '....kddk....', '...kddk.....', '..kddk......', '..kkk.......'],
    chest: ['............', '..kkkkkkkk..', '.knnnnnnnnk.', 'knDnnnnnnDnk'.slice(0, 12), 'kkkkkkkkkkkk', 'knnnkddknnnk', 'knnnkdDknnnk', 'knnnnkknnnnk', 'knnnnnnnnnnk', 'kDnnnnnnnnDk', 'kkkkkkkkkkkk', '............'],
    glasses: ['............', '............', '............', 'k..........k', 'k..........k', 'kkkkk..kkkkk', 'kBBwk..kBBwk', 'kBBBkkkkBBBk', 'kBBBk..kBBBk', '.kkk....kkk.', '............', '............'],
    crab: ['............', '.kk......kk.', 'kook....kook', '.kok....kok.', '..kokkkkok..', '..kooooook..', '.kooOooOook.', 'kkoooooooookk'.slice(0, 12), '.kooooooook.', 'k.kkkkkkkk.k', '.k.k....k.k.', '............'],
    // nav / UI
    scroll: ['..kkkkkkkk..', '.kyyyyyyyyk.', '.kkyyyyyykk.', '..kyGGGGyk..', '..kyyyyyyk..', '..kyGGGGyk..', '..kyyyyyyk..', '..kyGGGyyk..', '..kyyyyyyk..', '.kkyyyyyykk.', '.kyyyyyyyyk.', '..kkkkkkkk..'],
    coins: ['............', '....kkkk....', '...kddddk...', '..kdDddDdk..', '..kddddddk..', '..kdDddDdk..', '.kkkddddkkk.', 'kddkkkkkddk.', 'kdDddkkdDdk.', 'kddddkkdddk.', '.kkkk..kkkk.', '............'],
    npc: ['..kkkkkkk...', '.kwwwwwwwk..', 'kwwwwwwwwwk.', 'kwbwwbwwbwk.', 'kwwwwwwwwwk.', '.kwwwwwwwk..', '..kkwwkkk...', '....kwk.....', '....kk......', '............', '............', '............'],
    helm: ['....kkkk....', '...kwwggk...', '..kwgGGggk..', '..kgGkkGgk..', '..kgGkkGgk..', '...kggggk...', '....kkkk....', 'kkkkkkkkkkkk', 'kbbbbbbbbbbk', 'kBBBBBBBBBBk', 'kkkkkkkkkkkk', '............'],
    person: ['....kkkk....', '...knnnnk...', '..knssssnk..', '..ksksksk...'.slice(0, 12), '..kssssssk..', '...kssssk...', '....kkkk....', '..kkbbbbkk..', '.kbbbbbbbbk.', '.kbbBbbBbbk.', '.kbbbbbbbbk.', '.kkkkkkkkkk.'],
    star: ['.....kk.....', '.....kdk....', '....kddk....', 'kkkkkddkkkk.', 'kdddddddddk.', '.kdddddddk..', '..kddddddk..', '..kddkkddk..', '.kddk..kddk.', '.kkk....kkk.', '............', '............'],
    // PHILHEALTH KING (original pirate-theme pixel icons)
    strawhat: ['............', '............', '....kkkk....', '...kddddk...', '..kdyddddk..', '..kddddddk..', '..krrrrrrk..', '.kkrrrrrrkk.', 'kddddddddddk', 'kDddddddddDk', '.kkDDDDDDkk.', '...kkkkkk...'],
    jolly: ['G..........G', 'GG.kkkkkk.GG', '.GkyyyyyykG.', '..kyyyyyyk..', '.kykkyykkyk.', '.kykkyykkyk.', '.kyyykkyyyk.', '..kyyyyyyk..', '..kykykyyk..', '.G.kkkkkk.G.', 'GG........GG', 'G..........G'],
    logpose: ['....kkkk....', '...kBBBBk...', '..kBwBBBBk..', '..kBBrBBBk..', '..kBBrBBBk..', '..kBBwBBBk..', '...kBBBBk...', '..kkBBBBkk..', '.kbbbbbbbbk.', '.kbBbbbbBbk.', '.kbbbbbbbbk.', '..kkkkkkkk..'],
    wheel: ['.....tt.....', '.t...tt...t.', '..tkkkkkkt..', '..kt....tk..', '..k.t..t.k..', 'ttk..dd..ktt', 'ttk..dd..ktt', '..k.t..t.k..', '..kt....tk..', '..tkkkkkkt..', '.t...tt...t.', '.....tt.....'],
    hosp: ['...kkkkkk...', '...kwrrwk...', '...krrrrk...', '...kwrrwk...', 'kkkkkkkkkkkk', 'kyyyyyyyyyyk', 'kyBByBByBByk', 'kyyyyyyyyyyk', 'kyBByBByBByk', 'kyyyyyyyyyyk', 'kyyyknnkyyyk', 'kkkkkkkkkkkk'],
    clinic: ['.....kk.....', '....kppk....', '...kppppk...', '..kppppppk..', '.kppppppppk.', 'kkkkkkkkkkkk', '.kyyryyyyyk.', '.kyrrryBByk.', '.kyyryyBByk.', '.kyyyyyyyyk.', '.kyyyknkyyk.', '.kkkkkkkkkk.'],
    center: ['....krrr....', '....krr.....', '....k.......', '.kkkkkkkkkk.', '.kTTTTTTTTk.', '.kTBBTTBBTk.', '.kTTTTTTTTk.', 'kkkkkkkkkkkk', 'ktBtBtBtBtBk', 'ktBtBtBtBtBk', 'ktttkkkktttk', 'kkkkkkkkkkkk'],
    qmap: ['.kkkkkkkkkk.', 'kyyyyyyyyyyk', 'kyyyyyyryryk', 'kyGyyyyyryyk', 'kyyGyyyryryk', 'kyyyGyyyyyyk', 'kyyyyGGyyyyk', 'kyyyyyyGyyyk', 'kyYyyyyyGyyk', 'kyyyyyyyyyyk', 'kyyyyyyyyyyk', '.kkkkkkkkkk.'],
    lock: ['....kkkk....', '...kggggk...', '..kgk..kgk..', '..kgk..kgk..', '.kkkkkkkkkk.', '.kddddddddk.', '.kdDDkkDDdk.', '.kddkkkkddk.', '.kdddkkdddk.', '.kdDDkkDDdk.', '.kddddddddk.', '.kkkkkkkkkk.'],
    anchor: ['....kkkk....', '....k..k....', '....kkkk....', '..kkkbbkkk..', '.....bb.....', '.....bb.....', '.k...bb...k.', 'kbk..bb..kbk', '.kbk.bb.kbk.', '..kbbbbbbk..', '...kkbbkk...', '.....kk.....'],
  };
  // fix rows to exactly 12 wide
  Object.keys(M).forEach(function (k) { M[k] = M[k].map(function (r) { return (r + '............').slice(0, 12); }); });
  var cache = {};
  window.pix = function (name, size) {
    size = size || 24;
    var key = name + '@' + size; if (cache[key]) return cache[key];
    var m = M[name]; if (!m) return '';
    var rects = '';
    for (var y = 0; y < 12; y++) for (var x = 0; x < 12; x++) { var c = m[y][x]; if (c !== '.' && PAL[c]) rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + PAL[c] + '"/>'; }
    // one <img> per icon (browser rasterises the SVG once and reuses it) instead of up to 144 live <rect> nodes per icon: far less DOM, style and layer work
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" shape-rendering="crispEdges">' + rects + '</svg>';
    return (cache[key] = '<img class="pix" width="' + size + '" height="' + size + '" alt="" aria-hidden="true" draggable="false" src="data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27') + '">');
  };
  window.PIX_MAPS = M;
})();
