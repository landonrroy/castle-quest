/* =====================================================================
   Castle Quest — Dragon's Cave (jewel: topaz)
   Mama Ember's three baby dragons are lost in the twisty tunnels.
   Guide the lantern knight through a randomly generated maze to each
   baby. Tap a tunnel spot, drag the knight, or use the arrow keys.
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#3a2a1a';
  const st = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  /* ---------------- Maze logic (pure, testable) ---------------- */
  /* MAZE-START */
  // Open-wall bitmask per cell: N=1 E=2 S=4 W=8
  const DIRS = [
    { b: 1, dc: 0, dr: -1, o: 4, rot: 0 },    // N
    { b: 2, dc: 1, dr: 0, o: 8, rot: 90 },    // E
    { b: 4, dc: 0, dr: 1, o: 1, rot: 180 },   // S
    { b: 8, dc: -1, dr: 0, o: 2, rot: 270 },  // W
  ];

  // Recursive backtracker (iterative) -> perfect maze (every cell reachable, exactly one path)
  function genMaze(w, h, rand) {
    const n = w * h;
    const open = new Array(n).fill(0);
    const seen = new Array(n).fill(false);
    const s0 = rand(n);
    const stack = [s0];
    seen[s0] = true;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const c = cur % w, r = (cur - c) / w;
      const opts = [];
      for (const d of DIRS) {
        const nc = c + d.dc, nr = r + d.dr;
        if (nc < 0 || nr < 0 || nc >= w || nr >= h) continue;
        const ni = nr * w + nc;
        if (!seen[ni]) opts.push([d, ni]);
      }
      if (!opts.length) { stack.pop(); continue; }
      const [d, ni] = opts[rand(opts.length)];
      open[cur] |= d.b;
      open[ni] |= d.o;
      seen[ni] = true;
      stack.push(ni);
    }
    return open;
  }

  function bfs(open, w, h, from) {
    const n = w * h;
    const dist = new Array(n).fill(-1);
    const prev = new Array(n).fill(-1);
    dist[from] = 0;
    const q = [from];
    for (let qi = 0; qi < q.length; qi++) {
      const cur = q[qi];
      const c = cur % w, r = (cur - c) / w;
      for (const d of DIRS) {
        if (!(open[cur] & d.b)) continue;
        const ni = (r + d.dr) * w + (c + d.dc);
        if (dist[ni] < 0) { dist[ni] = dist[cur] + 1; prev[ni] = cur; q.push(ni); }
      }
    }
    return { dist, prev };
  }

  // Cells walked from `from` (exclusive) to `to` (inclusive); null if unreachable
  function pathTo(prev, from, to) {
    const out = [];
    let x = to;
    while (x !== from && x !== -1) { out.push(x); x = prev[x]; }
    if (x === -1) return null;
    return out.reverse();
  }

  // Build a round's maze: start on the left edge, goal on the right edge (far away)
  function buildMaze(w, h, rand) {
    let best = null;
    for (let tries = 0; tries < 25; tries++) {
      const open = genMaze(w, h, rand);
      const start = rand(h) * w;
      const { dist } = bfs(open, w, h, start);
      let goal = -1, far = -1;
      const right = [];
      for (let r = 0; r < h; r++) right.push(r * w + (w - 1));
      for (const i of right) {
        if (dist[i] > far || (dist[i] === far && rand(2))) { far = dist[i]; goal = i; }
      }
      const cand = { open, start, goal, len: far };
      if (!best || far > best.len) best = cand;
      if (far >= (w - 1) + Math.max(2, Math.floor(h / 2))) return cand;
    }
    return best;
  }
  /* MAZE-END */

  /* ---------------- Art ---------------- */
  const GEMS = [
    { col: '#5fd8ff', light: '#d9f7ff', glow: 'cvGC' },
    { col: '#ff7fd1', light: '#ffd6f1', glow: 'cvGP' },
    { col: '#b383ff', light: '#ebdcff', glow: 'cvGV' },
  ];

  function cluster(x, y, s, g, rot) {
    return `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s})">
      <ellipse class="cv-halo" cx="0" cy="-40" rx="80" ry="70" fill="url(#${g.glow})"/>
      <polygon points="-34,0 -46,-38 -30,-62 -18,-34 -14,0" fill="${g.col}" ${st(4)}/>
      <polygon points="-30,-62 -18,-34 -14,0 -34,0" fill="${g.light}" opacity=".55"/>
      <polygon points="14,0 18,-40 36,-60 44,-30 34,0" fill="${g.col}" ${st(4)}/>
      <polygon points="36,-60 44,-30 34,0 26,0" fill="#000" opacity=".12"/>
      <polygon points="-14,0 -16,-58 0,-96 16,-58 14,0" fill="${g.col}" ${st(4)}/>
      <polygon points="0,-96 0,0 -14,0 -16,-58" fill="${g.light}" opacity=".6"/>
      <circle cx="-6" cy="-62" r="4" fill="#fff"/>
    </g>`;
  }

  function stalactites() {
    let s = '';
    for (let x = 120; x < 1290; x += 46 + Math.random() * 30) {
      const len = 55 + Math.random() * 60, w = 12 + Math.random() * 12, y0 = 100;
      s += `<path d="M${x - w} ${y0} Q${x - w * 0.3} ${y0 + len * 0.6} ${x} ${y0 + len} Q${x + w * 0.3} ${y0 + len * 0.6} ${x + w} ${y0} Z" fill="#3c3088" ${st(4)}/>
        <path d="M${x - w * 0.45} ${y0 + 4} Q${x - w * 0.2} ${y0 + len * 0.5} ${x - 1} ${y0 + len * 0.8}" stroke="#5d4fb8" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  }

  function stalagmite(x, y, h, w) {
    return `<path d="M${x - w} ${y} Q${x - w * 0.3} ${y - h * 0.6} ${x} ${y - h} Q${x + w * 0.3} ${y - h * 0.6} ${x + w} ${y} Z" fill="#3c3088" ${st(4)}/>
      <path d="M${x - w * 0.4} ${y - 4} Q${x - w * 0.2} ${y - h * 0.5} ${x - 1} ${y - h * 0.8}" stroke="#5d4fb8" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  function bgSVG() {
    return `<svg class="cv-bg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <linearGradient id="cvBgG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1b1446"/><stop offset=".45" stop-color="#2c2370"/>
          <stop offset=".75" stop-color="#3a2c80"/><stop offset="1" stop-color="#221a52"/>
        </linearGradient>
        <radialGradient id="cvAmb" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#6a5ad0" stop-opacity=".55"/><stop offset="1" stop-color="#6a5ad0" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="cvGC"><stop offset="0" stop-color="#7fe8ff" stop-opacity=".7"/><stop offset="1" stop-color="#7fe8ff" stop-opacity="0"/></radialGradient>
        <radialGradient id="cvGP"><stop offset="0" stop-color="#ff9be8" stop-opacity=".65"/><stop offset="1" stop-color="#ff9be8" stop-opacity="0"/></radialGradient>
        <radialGradient id="cvGV"><stop offset="0" stop-color="#c9a6ff" stop-opacity=".7"/><stop offset="1" stop-color="#c9a6ff" stop-opacity="0"/></radialGradient>
        <radialGradient id="cvGW"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#cvBgG)"/>
      <ellipse cx="700" cy="350" rx="640" ry="330" fill="url(#cvAmb)"/>
      <ellipse cx="120" cy="420" rx="200" ry="220" fill="url(#cvGW)"/>

      <!-- back rock layers -->
      <path d="M0 150 C70 210 40 320 80 420 C110 500 50 600 0 650 Z" fill="#251c5c" ${st(5)}/>
      <path d="M1280 130 C1215 210 1250 330 1196 430 C1166 500 1226 556 1280 600 Z" fill="#251c5c" ${st(5)}/>
      <path d="M210 200 C260 170 300 220 280 270 C262 312 222 300 206 268 Z" fill="#2f2570" opacity=".7"/>
      <path d="M1150 300 C1180 280 1200 320 1185 350 C1170 380 1140 360 1150 300 Z" fill="#2f2570" opacity=".7"/>
      <g stroke="#1a1240" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55">
        <path d="M24 260 q14 10 6 26"/><path d="M40 470 q-12 14 -2 30"/><path d="M1250 260 q-14 12 -4 28"/>
        <path d="M1232 470 q12 10 4 24"/><path d="M640 640 q20 -6 34 4"/><path d="M380 668 q16 -8 30 0"/>
      </g>

      ${stalactites()}
      <!-- ceiling -->
      <path d="M0 0 H1280 V116 C1200 138 1130 106 1040 126 C950 146 880 110 790 124 C700 138 630 104 540 122 C450 140 380 108 290 126 C210 142 130 110 0 130 Z" fill="#221a55" ${st(5)}/>
      <path d="M40 112 C120 96 200 120 280 108 M600 100 C680 112 760 96 840 108" stroke="#3a2f86" stroke-width="5" fill="none" stroke-linecap="round"/>

      <!-- floor -->
      <path d="M0 612 C120 584 260 604 400 592 C560 580 700 602 860 590 C1000 580 1140 598 1280 586 V720 H0 Z" fill="#30246c" ${st(5)}/>
      <path d="M30 650 C200 636 360 660 520 648 M700 660 C860 646 1020 668 1200 652" stroke="#3f3290" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="560" cy="690" rx="46" ry="16" fill="#3d2f85" ${st(4)}/>
      <ellipse cx="760" cy="700" rx="34" ry="12" fill="#3d2f85" ${st(4)}/>
      <ellipse cx="1080" cy="704" rx="40" ry="13" fill="#3d2f85" ${st(4)}/>
      ${stalagmite(470, 606, 54, 18)}${stalagmite(500, 604, 30, 12)}${stalagmite(690, 610, 44, 15)}${stalagmite(1120, 598, 40, 14)}

      <!-- glowing crystal clusters -->
      ${cluster(46, 612, 0.9, GEMS[0])}
      ${cluster(236, 624, 0.62, GEMS[1])}
      ${cluster(868, 612, 0.5, GEMS[2])}
      ${cluster(1110, 120, 0.48, GEMS[0], 180)}
      ${cluster(640, 116, 0.38, GEMS[2], 180)}
      ${cluster(300, 124, 0.36, GEMS[1], 180)}

      <!-- pool under the waterfall -->
      <ellipse cx="1222" cy="584" rx="62" ry="17" fill="#6fd0f5" ${st(4)}/>
      <ellipse cx="1214" cy="580" rx="36" ry="7" fill="#c9f2ff" opacity=".7"/>
      <ellipse class="cv-ripple" cx="1240" cy="584" rx="34" ry="8" fill="none" stroke="#e8fbff" stroke-width="3"/>
      <ellipse class="cv-ripple" style="animation-delay:1.1s" cx="1240" cy="584" rx="34" ry="8" fill="none" stroke="#e8fbff" stroke-width="3"/>
    </svg>`;
  }

  const EMBER_SVG = `<svg viewBox="0 0 230 420" width="230" height="420">
    <g class="cv-em-breathe">
      <path d="M150 330 C198 336 228 300 214 256 C208 238 192 236 188 250 C200 266 196 292 166 300 Z" fill="#ff8c2b" ${st(5)}/>
      <path d="M200 248 L214 222 L186 236 Z" fill="#ffd23f" ${st(4)}/>
      <g class="cv-em-wing">
        <path d="M72 206 C44 160 22 118 20 74 C36 92 50 94 60 88 C58 106 68 118 84 120 C82 140 92 152 108 158 Z" fill="#e8553a" ${st(5)}/>
        <path d="M70 196 C56 160 42 120 30 92 M78 186 C70 160 64 134 62 104 M90 176 C88 158 88 140 92 124" stroke="#ffb36b" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>
      <path d="M40 222 L18 226 L36 242 Z M32 262 L10 268 L30 282 Z M34 304 L12 312 L34 324 Z" fill="#ffd23f" ${st(4)}/>
      <path d="M84 214 C74 166 90 126 112 104 L162 118 C150 148 152 180 164 214 Z" fill="#ff8c2b" ${st(6)}/>
      <path d="M144 120 C136 150 138 182 150 212 L160 212 C150 180 150 148 160 122 Z" fill="#ffe2a6"/>
      <path d="M86 156 L68 150 L82 168 Z M98 126 L84 114 L90 136 Z" fill="#ffd23f" ${st(4)}/>
      <ellipse cx="115" cy="374" rx="110" ry="30" fill="#9c6a16" ${st(5)}/>
      <ellipse cx="115" cy="370" rx="94" ry="20" fill="#7d520f"/>
      <ellipse cx="112" cy="272" rx="82" ry="94" fill="#ff8c2b" ${st(6)}/>
      <path d="M46 296 C54 338 88 360 120 362" stroke="#e86f12" stroke-width="10" fill="none" stroke-linecap="round" opacity=".55"/>
      <ellipse cx="128" cy="286" rx="52" ry="68" fill="#ffe2a6" ${st(4)}/>
      <path d="M90 250 Q128 262 166 250 M84 284 Q128 298 172 284 M90 318 Q128 332 166 318" stroke="#f2bf6b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="86" cy="300" rx="13" ry="24" transform="rotate(28 86 300)" fill="#ff8c2b" ${st(4)}/>
      <ellipse cx="168" cy="296" rx="13" ry="24" transform="rotate(-28 168 296)" fill="#ff8c2b" ${st(4)}/>
      <g class="cv-em-head">
        <path d="M100 54 C90 32 94 14 106 6 C108 22 114 36 122 46 Z" fill="#fff1c9" ${st(4)}/>
        <path d="M136 44 C138 22 148 8 164 4 C158 20 158 34 156 48 Z" fill="#fff1c9" ${st(4)}/>
        <path d="M82 66 L62 58 L76 84 Z M84 96 L64 98 L82 112 Z" fill="#ffd23f" ${st(4)}/>
        <ellipse cx="126" cy="78" rx="50" ry="42" fill="#ff8c2b" ${st(6)}/>
        <ellipse cx="170" cy="96" rx="40" ry="28" fill="#ffa24d" ${st(5)}/>
        <ellipse cx="108" cy="54" rx="13" ry="7" fill="#ffb066" opacity=".85"/>
        <ellipse cx="190" cy="86" rx="4" ry="3" fill="${INK}"/>
        <ellipse cx="202" cy="92" rx="4" ry="3" fill="${INK}"/>
        <g class="cv-em-eye">
          <ellipse cx="132" cy="70" rx="17" ry="19" fill="#fff" ${st(4)}/>
          <circle cx="137" cy="72" r="10" fill="#3fb950"/>
          <circle cx="138" cy="73" r="6" fill="${INK}"/>
          <circle cx="141" cy="68" r="3.5" fill="#fff"/>
          <circle cx="134" cy="77" r="1.8" fill="#fff"/>
        </g>
        <path d="M118 56 L110 48 M126 52 L122 42 M136 51 L136 41" ${st(4)} fill="none"/>
        <ellipse cx="116" cy="100" rx="11" ry="6" fill="#ff5f6f" opacity=".5"/>
        <path d="M152 110 Q176 124 200 108" fill="none" ${st(4)}/>
        <path class="cv-em-mopen" d="M152 110 Q176 138 200 108 Q176 120 152 110 Z" fill="#7a1f2b" ${st(4)}/>
        <path d="M182 115 l3 7 l4 -8 Z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      </g>
    </g>
  </svg>`;

  const NEST_FRONT_SVG = `<svg viewBox="0 0 242 84" width="242" height="84">
    <path d="M30 30 l-6 -14 M60 36 l-2 -14 M90 40 l2 -16 M150 40 l4 -14 M184 36 l6 -14 M214 30 l8 -12" stroke="#d99a00" stroke-width="5" stroke-linecap="round"/>
    <path d="M4 22 Q121 56 238 22 L230 50 Q121 98 12 50 Z" fill="#e8b23a" ${st(5)}/>
    <path d="M20 36 l18 -6 M46 46 l20 -6 M76 52 l18 -8 M106 56 l22 -4 M142 54 l18 -8 M172 48 l20 -8 M200 40 l18 -8 M30 48 l14 6 M60 58 l16 4 M118 64 l18 0 M156 62 l16 -2 M190 54 l14 -4" stroke="#ffd86b" stroke-width="4" stroke-linecap="round"/>
    <path d="M36 40 l12 6 M88 56 l14 -2 M132 60 l14 -4 M178 52 l14 -6 M210 42 l10 -4" stroke="#b07a12" stroke-width="3" stroke-linecap="round"/>
  </svg>`;

  function babySVG(b) {
    return `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M70 80 C86 84 94 74 92 62 L99 56 L86 54 C88 66 82 72 70 72 Z" fill="${b.body}" ${st(4)}/>
      <path class="cv-bw-l" d="M32 58 C20 52 8 40 6 28 C14 33 20 33 24 28 C24 37 28 43 36 46 Z" fill="${b.wing}" ${st(4)}/>
      <path class="cv-bw-r" d="M68 58 C80 52 92 40 94 28 C86 33 80 33 76 28 C76 37 72 43 64 46 Z" fill="${b.wing}" ${st(4)}/>
      <ellipse cx="38" cy="91" rx="9" ry="5" fill="${b.body}" ${st(4)}/>
      <ellipse cx="62" cy="91" rx="9" ry="5" fill="${b.body}" ${st(4)}/>
      <ellipse cx="50" cy="72" rx="24" ry="20" fill="${b.body}" ${st(4.5)}/>
      <ellipse cx="50" cy="76" rx="13" ry="12" fill="${b.light}" ${st(3)}/>
      <path d="M36 26 L31 9 L45 21 Z M64 26 L69 9 L55 21 Z" fill="#fff1c9" ${st(3.5)}/>
      <ellipse cx="50" cy="42" rx="26" ry="22" fill="${b.body}" ${st(4.5)}/>
      <ellipse cx="50" cy="53" rx="13" ry="8" fill="${b.light}" opacity=".9"/>
      <circle cx="46" cy="51" r="1.8" fill="${INK}"/><circle cx="54" cy="51" r="1.8" fill="${INK}"/>
      <g class="cv-b-eyes">
        <ellipse cx="39" cy="38" rx="7.5" ry="8.5" fill="#fff" ${st(3)}/>
        <ellipse cx="61" cy="38" rx="7.5" ry="8.5" fill="#fff" ${st(3)}/>
        <circle cx="40" cy="39" r="4.3" fill="${INK}"/><circle cx="60" cy="39" r="4.3" fill="${INK}"/>
        <circle cx="41.6" cy="37" r="1.7" fill="#fff"/><circle cx="61.6" cy="37" r="1.7" fill="#fff"/>
      </g>
      <ellipse cx="29" cy="48" rx="5" ry="3" fill="#ff5f7f" opacity=".55"/>
      <ellipse cx="71" cy="48" rx="5" ry="3" fill="#ff5f7f" opacity=".55"/>
      <path d="M45 57 Q50 61 55 57" fill="none" ${st(3)}/>
    </svg>`;
  }

  const KNIGHT_SVG = `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle class="cv-lglow" cx="80" cy="60" r="22" fill="#fff3a0" opacity=".5"/>
    <path d="M36 50 C24 62 22 78 28 88 L48 84 Z" fill="#e8423f" ${st(4)}/>
    <rect x="38" y="76" width="10" height="14" rx="3" fill="#5a5f9e" ${st(3.5)}/>
    <rect x="52" y="76" width="10" height="14" rx="3" fill="#5a5f9e" ${st(3.5)}/>
    <ellipse cx="44" cy="91" rx="8" ry="4.5" fill="#7d4a1f" ${st(3.5)}/>
    <ellipse cx="59" cy="91" rx="8" ry="4.5" fill="#7d4a1f" ${st(3.5)}/>
    <rect x="32" y="50" width="36" height="32" rx="12" fill="#2f7fe0" ${st(4)}/>
    <path d="M50 57 l5 6 -5 8 -5 -8 Z" fill="#ffc928" ${st(2.5)}/>
    <path d="M62 62 L76 58" ${st(9)}/>
    <path d="M62 62 L76 58" stroke="#2f7fe0" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M80 45 v7" ${st(3)}/>
    <rect x="73" y="51" width="14" height="19" rx="4" fill="#ffc928" ${st(3.5)}/>
    <rect x="77" y="55" width="6" height="11" rx="3" fill="#fffbe0"/>
    <circle cx="50" cy="35" r="19" fill="#ffd7b0" ${st(4)}/>
    <path d="M31 33 C31 18 41 11 51 11 C62 11 70 18 70 30 L66 31 C60 26 44 25 36 32 Z" fill="#d8dde8" ${st(4)}/>
    <path d="M48 13 C44 2 56 -1 61 6 C56 7 54 9 54 13 Z" fill="#e8423f" ${st(3)}/>
    <circle cx="54" cy="37" r="3" fill="${INK}"/><circle cx="64" cy="36" r="3" fill="${INK}"/>
    <circle cx="55" cy="36" r="1" fill="#fff"/><circle cx="65" cy="35" r="1" fill="#fff"/>
    <ellipse cx="46" cy="43" rx="4.5" ry="2.6" fill="#ff8fb0"/>
    <path d="M55 44 Q60 48 65 43" fill="none" ${st(3)}/>
  </svg>`;

  function gemSVG(g) {
    return `<svg viewBox="0 0 60 70" width="100%" height="100%">
      <polygon points="12,62 6,40 14,30 20,62" fill="${g.col}" ${st(3)}/>
      <polygon points="30,4 46,22 40,62 20,62 14,22" fill="${g.col}" ${st(4)}/>
      <polygon points="30,4 30,30 14,22" fill="${g.light}" opacity=".85"/>
      <polygon points="30,30 30,62 20,62 14,22" fill="${g.light}" opacity=".45"/>
      <polygon points="46,22 40,62 30,62 30,30" fill="#000" opacity=".12"/>
      <polyline points="14,22 30,30 46,22" fill="none" ${st(2.5)}/>
      <path d="M30 30 V62" ${st(2.5)}/>
      <circle cx="22" cy="19" r="3" fill="#fff"/>
    </svg>`;
  }

  const FIREFLY_SVG = `<svg viewBox="0 0 40 40" width="100%" height="100%">
    <circle cx="20" cy="26" r="17" fill="#f4ff7a" opacity=".35"/>
    <ellipse cx="13" cy="15" rx="7" ry="5" fill="#fff" opacity=".85" stroke="${INK}" stroke-width="2" transform="rotate(-30 13 15)"/>
    <ellipse cx="27" cy="15" rx="7" ry="5" fill="#fff" opacity=".85" stroke="${INK}" stroke-width="2" transform="rotate(30 27 15)"/>
    <ellipse class="cv-ff-tail" cx="20" cy="28" rx="7" ry="8" fill="#eaff5a" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="20" cy="17" r="6" fill="#4a3a7a" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="18" cy="16" r="1.5" fill="#fff"/><circle cx="22.5" cy="16" r="1.5" fill="#fff"/>
  </svg>`;

  const BAT_SVG = `<svg viewBox="0 0 120 80" width="100%" height="100%">
    <path class="cv-wl" d="M58 40 C46 22 26 14 6 22 C14 30 12 38 18 46 C26 40 32 46 34 56 C42 48 50 50 58 50 Z" fill="#4a2f86" ${st(4)}/>
    <path class="cv-wr" d="M62 40 C74 22 94 14 114 22 C106 30 108 38 102 46 C94 40 88 46 86 56 C78 48 70 50 62 50 Z" fill="#4a2f86" ${st(4)}/>
    <path d="M48 32 L46 14 L56 26 Z M72 32 L74 14 L64 26 Z" fill="#6a4bb0" ${st(3.5)}/>
    <ellipse cx="60" cy="44" rx="16" ry="18" fill="#6a4bb0" ${st(4)}/>
    <ellipse cx="60" cy="50" rx="9" ry="9" fill="#9b7fe0" opacity=".7"/>
    <circle cx="53" cy="39" r="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="67" cy="39" r="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="54" cy="40" r="3" fill="${INK}"/><circle cx="66" cy="40" r="3" fill="${INK}"/>
    <path d="M55 50 Q60 54 65 50" fill="none" ${st(2.5)}/>
    <path d="M56 51 l1.5 4 l1.5 -3.4 Z M61 51 l1.5 4 l1.5 -3.4 Z" fill="#fff"/>
    <ellipse cx="48" cy="47" rx="3.5" ry="2" fill="#ff8fb0" opacity=".7"/>
    <ellipse cx="72" cy="47" rx="3.5" ry="2" fill="#ff8fb0" opacity=".7"/>
  </svg>`;

  const CHIME_SVG = `<svg viewBox="0 0 104 136" width="104" height="136">
    <ellipse class="cv-halo" cx="52" cy="78" rx="52" ry="58" fill="url(#cvGC)"/>
    <ellipse cx="52" cy="128" rx="46" ry="8" fill="#241a52" ${st(4)}/>
    <polygon points="14,128 6,86 20,64 30,92 32,128" fill="#b383ff" ${st(4)}/>
    <polygon points="20,64 30,92 32,128 14,128" fill="#ebdcff" opacity=".5"/>
    <polygon points="70,128 74,82 90,60 98,94 88,128" fill="#ff7fd1" ${st(4)}/>
    <polygon points="90,60 98,94 88,128 80,128" fill="#000" opacity=".12"/>
    <polygon points="34,128 30,48 52,8 72,48 70,128" fill="#5fd8ff" ${st(5)}/>
    <polygon points="52,8 52,128 34,128 30,48" fill="#d9f7ff" opacity=".6"/>
    <polyline points="30,48 52,60 72,48" fill="none" ${st(3)}/>
    <path d="M52 60 V128" ${st(3)}/>
    <circle cx="42" cy="38" r="5" fill="#fff"/>
  </svg>`;

  const MUSH_SVG = `<svg viewBox="0 0 96 90" width="96" height="90">
    <ellipse class="cv-halo" cx="40" cy="40" rx="48" ry="40" fill="url(#cvGC)"/>
    <path d="M30 84 C30 66 34 52 38 44 L50 44 C52 56 54 70 54 84 Z" fill="#fff1d6" ${st(4)}/>
    <path d="M8 46 C8 20 26 8 44 8 C64 8 80 22 80 44 C64 52 24 52 8 46 Z" fill="#3fd0c9" ${st(4)}/>
    <ellipse cx="30" cy="26" rx="7" ry="5" fill="#d6fffb"/><ellipse cx="54" cy="20" rx="6" ry="4" fill="#d6fffb"/>
    <ellipse cx="64" cy="36" rx="5" ry="4" fill="#d6fffb"/>
    <path d="M70 86 C70 78 72 72 74 68 L80 68 C81 74 82 80 82 86 Z" fill="#fff1d6" ${st(3)}/>
    <path d="M62 70 C62 58 70 52 77 52 C85 52 92 58 92 68 C84 72 70 72 62 70 Z" fill="#ff7fd1" ${st(3.5)}/>
    <circle cx="72" cy="60" r="2.5" fill="#ffe0f4"/><circle cx="82" cy="58" r="2" fill="#ffe0f4"/>
  </svg>`;

  const HEART_SVG = `<svg viewBox="0 0 40 40" width="100%" height="100%"><path d="M20 34 C6 24 2 16 6 10 C10 4 18 5 20 11 C22 5 30 4 34 10 C38 16 34 24 20 34 Z" fill="#ff6fae" ${st(3)}/></svg>`;

  const PRINT_SVG = `<svg viewBox="0 0 40 40" width="100%" height="100%">
    <g fill="#fff3a0" opacity=".45"><ellipse cx="13" cy="24" rx="8" ry="11"/><ellipse cx="27" cy="16" rx="8" ry="11"/></g>
    <g fill="#ffd84a"><ellipse cx="13" cy="22" rx="4.5" ry="6"/><ellipse cx="13" cy="32" rx="3.5" ry="3"/>
    <ellipse cx="27" cy="14" rx="4.5" ry="6"/><ellipse cx="27" cy="24" rx="3.5" ry="3"/></g>
  </svg>`;

  const CSS = `
  .scene-cave { background: #221a52; }
  .scene-cave .cv-abs { position: absolute; }
  .scene-cave .cv-bg { position: absolute; left: 0; top: 0; pointer-events: none; }
  .scene-cave .cv-halo { animation: cv-halo 3.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes cv-halo { 50% { opacity: .4; transform: scale(.88); } }
  .scene-cave .cv-ripple { animation: cv-ripple 2.2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes cv-ripple { from { transform: scale(.3); opacity: .95; } to { transform: scale(1.4); opacity: 0; } }
  .scene-cave .cv-flow { animation: cv-flow .55s linear infinite; }
  @keyframes cv-flow { to { stroke-dashoffset: -36; } }
  .scene-cave .cv-mote { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #e2f8ff;
    box-shadow: 0 0 8px 3px rgba(150,230,255,.7); pointer-events: none; opacity: 0; animation: cv-mote 9s ease-in-out infinite; z-index: 3; }
  @keyframes cv-mote { 0% { opacity: 0; transform: translate(0,0); } 20% { opacity: .9; } 80% { opacity: .6; } 100% { opacity: 0; transform: translate(34px,-130px); } }

  /* tappable extras */
  .scene-cave .cv-poke { cursor: pointer; }
  .scene-cave .cv-bat { z-index: 6; }
  .scene-cave .cv-bat-hover { width: 100%; height: 100%; animation: cv-hover 2.8s ease-in-out infinite; }
  @keyframes cv-hover { 50% { transform: translateY(8px); } }
  .scene-cave .cv-bat-fly { width: 100%; height: 100%; }
  .scene-cave .cv-bat.flying .cv-bat-fly { animation: cv-batloop 1.6s ease-in-out; }
  @keyframes cv-batloop { 25% { transform: translate(-50px, 50px) rotate(-20deg); } 50% { transform: translate(0, 95px) rotate(0); }
    75% { transform: translate(50px, 50px) rotate(20deg); } }
  .scene-cave .cv-wl { transform-box: fill-box; transform-origin: 100% 60%; animation: cv-flapl 1.6s ease-in-out infinite; }
  .scene-cave .cv-wr { transform-box: fill-box; transform-origin: 0% 60%; animation: cv-flapr 1.6s ease-in-out infinite; }
  .scene-cave .cv-bat.flying .cv-wl, .scene-cave .cv-bat.flying .cv-wr { animation-duration: .16s; }
  @keyframes cv-flapl { 50% { transform: rotate(18deg) scaleY(.85); } }
  @keyframes cv-flapr { 50% { transform: rotate(-18deg) scaleY(.85); } }

  .scene-cave .cv-chime { z-index: 6; }
  .scene-cave .cv-chime.ring svg { animation: cv-ring .6s ease-out; filter: drop-shadow(0 0 14px #bff4ff) drop-shadow(0 0 26px #7fe8ff); }
  @keyframes cv-ring { 30% { transform: scale(1.1, .94); } 60% { transform: scale(.96, 1.05); } }
  .scene-cave .cv-chime svg { transform-origin: 50% 100%; }

  .scene-cave .cv-water { z-index: 3; }
  .scene-cave .cv-drip { z-index: 6; }
  .scene-cave .cv-drip svg { transform-origin: 50% 0; }
  .scene-cave .cv-drip.shake svg { animation: cv-sway .5s; }
  @keyframes cv-sway { 25% { transform: rotate(4deg); } 75% { transform: rotate(-4deg); } }
  .scene-cave .cv-drop { position: absolute; width: 12px; height: 16px; left: 1191px; top: 186px; pointer-events: none; z-index: 5;
    background: #9fe6ff; border: 2.5px solid ${INK}; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%; }
  .scene-cave .cv-drop.idle { animation: cv-drip 5.2s ease-in infinite; }
  @keyframes cv-drip { 0% { transform: translateY(0) scale(.2); opacity: 0; } 10% { opacity: 1; } 60% { transform: translateY(0) scale(1); }
    78% { transform: translateY(388px) scale(1); opacity: 1; } 79%, 100% { transform: translateY(388px) scale(1); opacity: 0; } }
  .scene-cave .cv-drop.fast { animation: cv-dripfast .6s ease-in forwards; }
  @keyframes cv-dripfast { 0% { transform: translateY(0) scale(.6); } 95% { transform: translateY(388px) scale(1); opacity: 1; } 100% { transform: translateY(392px); opacity: 0; } }
  .scene-cave .cv-ring { position: absolute; width: 70px; height: 20px; margin: -10px 0 0 -35px; border: 3px solid #fff;
    border-radius: 50%; pointer-events: none; z-index: 5; animation: cv-ringout .8s ease-out forwards; }
  @keyframes cv-ringout { from { transform: scale(.2); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }

  .scene-cave .cv-mush { z-index: 3; }
  .scene-cave .cv-mush svg { transform-origin: 50% 100%; }
  .scene-cave .cv-mush.squish svg { animation: cv-squish .5s; }
  @keyframes cv-squish { 30% { transform: scale(1.18, .78); } 60% { transform: scale(.9, 1.12); } }

  /* Mama Ember */
  .scene-cave .cv-ember { left: 0; top: 118px; width: 230px; height: 420px; z-index: 7; }
  .scene-cave .cv-em-in { width: 100%; height: 100%; transform-origin: 50% 100%; }
  .scene-cave .cv-em-breathe { animation: cv-breathe 3.6s ease-in-out infinite; transform-origin: 112px 370px; }
  @keyframes cv-breathe { 50% { transform: scale(1.015, .985); } }
  .scene-cave .cv-em-head { animation: cv-emhead 4.5s ease-in-out infinite; transform-origin: 120px 130px; }
  @keyframes cv-emhead { 50% { transform: rotate(-3deg); } }
  .scene-cave .cv-ember.talking .cv-em-head { animation: cv-emnod .5s ease-in-out infinite alternate; }
  @keyframes cv-emnod { to { transform: rotate(-4deg) translateY(2px); } }
  .scene-cave .cv-em-eye { animation: cv-blink 4.6s infinite; transform-origin: 132px 70px; }
  @keyframes cv-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
  .scene-cave .cv-em-wing { animation: cv-emwing 3s ease-in-out infinite; transform-origin: 96px 160px; }
  @keyframes cv-emwing { 50% { transform: rotate(-7deg); } }
  .scene-cave .cv-em-mopen { opacity: 0; }
  .scene-cave .cv-ember.talking .cv-em-mopen { animation: cv-mouth .22s infinite alternate; }
  @keyframes cv-mouth { from { opacity: 0; } to { opacity: 1; } }
  .scene-cave .cv-nestfront { left: -6px; top: 470px; width: 242px; height: 84px; z-index: 9; pointer-events: none; }
  .scene-cave .cv-smoke { position: absolute; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #fff, #d9cff5); border: 3px solid rgba(58,42,26,.35);
    pointer-events: none; z-index: 11; animation: cv-smoke 1.5s ease-out forwards; }
  @keyframes cv-smoke { from { transform: translate(0,0) scale(.4); opacity: .95; } to { transform: translate(36px,-80px) scale(2.1); opacity: 0; } }

  /* babies */
  .scene-cave .cv-b-in { width: 100%; height: 100%; animation: cv-bob 1.9s ease-in-out infinite; }
  @keyframes cv-bob { 50% { transform: translateY(-5%); } }
  .scene-cave .cv-bw-l { transform-box: fill-box; transform-origin: 100% 100%; animation: cv-bwl .9s ease-in-out infinite; }
  .scene-cave .cv-bw-r { transform-box: fill-box; transform-origin: 0% 100%; animation: cv-bwr .9s ease-in-out infinite; }
  .scene-cave .cv-flyer .cv-bw-l, .scene-cave .cv-flyer .cv-bw-r { animation-duration: .16s; }
  @keyframes cv-bwl { 50% { transform: rotate(-16deg); } }
  @keyframes cv-bwr { 50% { transform: rotate(16deg); } }
  .scene-cave .cv-b-eyes { transform-box: fill-box; transform-origin: center; animation: cv-bblink 3.8s infinite; }
  @keyframes cv-bblink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
  .scene-cave .cv-lost .cv-b-in { animation: cv-bob 1.2s ease-in-out infinite; }
  .scene-cave .cv-b-in.bounce, .scene-cave .cv-lost .cv-b-in.bounce { animation: bounce .6s; }
  .scene-cave .cv-nb { width: 72px; height: 72px; z-index: 8; transform: scale(0); transition: transform .45s cubic-bezier(.3,1.6,.5,1); }
  .scene-cave .cv-nb.show { transform: scale(1); cursor: pointer; }
  .scene-cave .cv-flyer { position: absolute; left: 0; top: 0; width: 72px; height: 72px; z-index: 20; pointer-events: none; }
  .scene-cave .cv-heart { position: absolute; width: 36px; height: 36px; margin: -18px 0 0 -18px; pointer-events: none; z-index: 21;
    animation: cv-heart 1.4s ease-out forwards; }
  @keyframes cv-heart { from { transform: translate(0,0) scale(.3); opacity: 1; } 30% { transform: translate(var(--hx), -30px) scale(1.15); }
    to { transform: translate(var(--hx), -100px) scale(.9); opacity: 0; } }

  /* maze */
  .scene-cave .cv-maze { position: absolute; touch-action: none; cursor: pointer; z-index: 4;
    transition: opacity .35s, transform .35s; }
  .scene-cave .cv-maze * { pointer-events: none; }
  .scene-cave .cv-maze.out { opacity: 0; transform: scale(.94); }
  .scene-cave .cv-maze.in { animation: cv-mazein .5s cubic-bezier(.3,1.4,.5,1); }
  @keyframes cv-mazein { from { opacity: 0; transform: scale(.9); } }
  .scene-cave .cv-step { position: absolute; border-radius: 50%; border: 4px dashed #fff6c2; background: rgba(255,226,110,.28);
    box-shadow: 0 0 14px 2px rgba(255,226,110,.7); animation: cv-step 1.3s ease-in-out infinite; z-index: 2; }
  .scene-cave .cv-step.dim { opacity: .55; }
  .scene-cave .cv-step.flash { animation: cv-stepflash .35s ease-in-out 3; opacity: 1; }
  @keyframes cv-step { 50% { transform: scale(1.15); } }
  @keyframes cv-stepflash { 50% { transform: scale(1.4); background: rgba(255,240,150,.8); } }
  .scene-cave .cv-print { position: absolute; z-index: 1; animation: cv-printin .5s ease-out; }
  @keyframes cv-printin { from { opacity: 0; } }
  .scene-cave .cv-crys { position: absolute; z-index: 3; }
  .scene-cave .cv-crys-in { width: 100%; height: 100%; animation: cv-twinkle 2.2s ease-in-out infinite;
    filter: drop-shadow(0 0 8px rgba(190,240,255,.9)); }
  @keyframes cv-twinkle { 50% { transform: translateY(-6%) rotate(5deg) scale(1.06); } }
  .scene-cave .cv-lost { position: absolute; z-index: 4; }
  .scene-cave .cv-token { position: absolute; left: 0; top: 0; z-index: 6;
    filter: drop-shadow(0 0 10px rgba(255,220,120,.9)) drop-shadow(0 4px 2px rgba(0,0,0,.35)); }
  .scene-cave .cv-tk-in { width: 100%; height: 100%; }
  .scene-cave .cv-tk-face { width: 100%; height: 100%; transition: transform .15s; }
  .scene-cave .cv-tk-face.flip { transform: scaleX(-1); }
  .scene-cave .cv-lglow { animation: cv-lantern 1.1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
  @keyframes cv-lantern { to { opacity: .25; transform: scale(.85); } }
  .scene-cave .cv-fly { position: absolute; left: 0; top: 0; z-index: 9; transition: transform .3s ease-in-out, opacity .6s; }
  .scene-cave .cv-fly-in { width: 100%; height: 100%; animation: cv-flicker .5s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 8px #f4ff7a) drop-shadow(0 0 16px #eaff5a); }
  @keyframes cv-flicker { to { transform: translateY(-4px) scale(.92); filter: drop-shadow(0 0 4px #f4ff7a); } }
  .scene-cave .cv-hdot { position: absolute; border-radius: 50%; z-index: 2; background: radial-gradient(circle, #fbffb0, rgba(234,255,90,0) 70%);
    animation: cv-hdot 3.4s ease-out forwards; }
  @keyframes cv-hdot { 0% { opacity: 0; transform: scale(.3); } 15% { opacity: 1; transform: scale(1); } 70% { opacity: .9; } 100% { opacity: 0; } }

  /* HUD bits */
  .scene-cave .cv-hint { left: 1146px; top: 596px; width: 112px; height: 112px; border-radius: 50%; z-index: 12;
    border: 5px solid ${INK}; background: radial-gradient(circle at 50% 42%, #3f55c4, #1a1f5e);
    box-shadow: 0 6px 0 ${INK}, inset 0 0 22px rgba(240,255,140,.4); display: grid; place-items: center; }
  .scene-cave .cv-hint-ff { width: 84px; height: 84px; animation: cv-hover 1.8s ease-in-out infinite;
    filter: drop-shadow(0 0 10px #f4ff7a) drop-shadow(0 0 20px #eaff5a); }
  .scene-cave .cv-count { left: 1008px; top: 620px; width: 128px; height: 72px; z-index: 12; border-radius: 40px;
    background: rgba(255,246,224,.95); border: 5px solid ${INK}; box-shadow: 0 5px 0 ${INK};
    display: flex; align-items: center; justify-content: center; gap: 6px; pointer-events: none; }
  .scene-cave .cv-count-gem { width: 40px; height: 48px; }
  .scene-cave .cv-count-num { font-size: 42px; font-weight: 800; line-height: 1; color: ${INK}; min-width: 30px; text-align: center; }
  .scene-cave .cv-count.bump .cv-count-num { animation: bounce .5s; }
  .scene-cave .cv-gemfly { position: absolute; left: 0; top: 0; z-index: 22; pointer-events: none; filter: drop-shadow(0 0 10px #bff4ff); }
  `;

  /* ---------------- The room ---------------- */
  Castle.registerRoom({
    id: 'cave',
    title: "Dragon's Cave",
    jewel: 'topaz',

    enter(root, api) {
      const diff = Math.max(1, Math.min(3, (api.difficulty | 0) || 1));
      const SIZES = { 1: [[4, 3], [5, 4], [5, 4]], 2: [[6, 4], [7, 5], [7, 5]], 3: [[9, 6], [10, 6], [10, 6]] }[diff];
      const CAP = { 1: 130, 2: 112, 3: 96 }[diff];
      const N_GEMS = { 1: 2, 2: 3, 3: 4 }[diff];
      const HINT_STEPS = { 1: 6, 2: 5, 3: 4 }[diff];
      const AREA = { x: 240, y: 108, w: 935, h: 474 };
      const PAD = 16;
      const SLOTS = [{ x: 54, y: 466 }, { x: 116, y: 472 }, { x: 178, y: 466 }];
      const COUNTER_AT = { x: 1008 + 40, y: 620 + 36 };
      const BABIES = api.shuffle([
        { name: 'Puff', body: '#ff6fae', light: '#ffd0e6', wing: '#ffc928' },
        { name: 'Ziggy', body: '#2fb5e0', light: '#c9f1ff', wing: '#9b5de5' },
        { name: 'Bitsy', body: '#9b5de5', light: '#e3d2ff', wing: '#3fb950' },
      ]);

      // ---------- state ----------
      let G = null;            // current maze
      let cur = 0;             // knight cell
      let round = 0;
      let locked = true, moving = false;
      let dragging = false, dragId = null, downCell = null, leftDown = false, pendingCell = null;
      let misses = 0, gemsTotal = 0, hintTok = 0, stepAlt = false;
      let gemEls = new Map();
      let printed = new Set();
      let tokenEl = null, tokenFace = null, tokenIn = null, lostEl = null;
      let stepsBox, printsBox, gemsBox, fliesBox;

      // ---------- helpers ----------
      const add = (node, parent) => { (parent || root).appendChild(node); return node; };
      function restartClass(node, cls, ms) {
        if (!node) return;
        node.classList.remove(cls);
        void node.offsetWidth;
        node.classList.add(cls);
        api.setTimeout(() => node.classList.remove(cls), ms || 600);
      }
      function animateTo(node, frames, dur) {
        if (typeof node.animate === 'function') {
          node.animate(frames, { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
        } else {
          node.style.transform = frames[frames.length - 1].transform;
        }
      }

      // ---------- speech ----------
      let seq = 0, emTok = 0;
      function emberSay(text) {
        const t = ++emTok;
        emberEl.classList.add('talking');
        return api.say(text, { who: 'Mama Ember', pitch: 0.7, rate: 0.9 })
          .then(() => { if (t === emTok) emberEl.classList.remove('talking'); });
      }
      function pipSay(text) {
        emTok++;
        emberEl.classList.remove('talking');
        return api.say(text);
      }
      async function script(lines) {
        const my = ++seq;
        for (const [who, text] of lines) {
          if (my !== seq || !api.alive) return;
          await (who === 'ember' ? emberSay(text) : pipSay(text));
        }
      }

      // ---------- build scene ----------
      root.appendChild(api.el('style', { text: CSS }));
      root.appendChild(api.svg(bgSVG()));

      for (let i = 0; i < 14; i++) {
        add(api.el('div', { class: 'cv-mote', style: {
          left: (240 + Math.random() * 940) + 'px', top: (160 + Math.random() * 400) + 'px',
          animationDelay: (-Math.random() * 9).toFixed(2) + 's', animationDuration: (7 + Math.random() * 5).toFixed(2) + 's',
        } }));
      }

      add(api.el('div', { class: 'room-title', text: "Dragon's Cave" }));
      const dotsEl = add(api.el('div', { class: 'round-dots' }, [api.el('span'), api.el('span'), api.el('span')]));
      const dots = Array.from(dotsEl.children);

      // Waterfall
      const water = add(api.el('div', { class: 'cv-abs cv-water cv-poke', style: { left: '1232px', top: '186px', width: '48px', height: '400px' },
        html: `<svg viewBox="0 0 48 400" width="48" height="400">
          <defs><linearGradient id="cvWaterG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#7fd0f5"/><stop offset=".5" stop-color="#e8fbff"/><stop offset="1" stop-color="#6fc2ec"/></linearGradient></defs>
          <rect x="12" y="16" width="24" height="380" rx="10" fill="url(#cvWaterG)" ${st(4)}/>
          <path class="cv-flow" d="M19 24 V390" stroke="#fff" stroke-width="3" stroke-dasharray="12 24" opacity=".85"/>
          <path class="cv-flow" style="animation-duration:.8s" d="M29 30 V390" stroke="#ffffff" stroke-width="3" stroke-dasharray="18 18" opacity=".6"/>
          <path d="M2 10 C14 0 34 0 46 10 L40 26 C30 18 18 18 8 26 Z" fill="#221a55" ${st(4)}/>
        </svg>` }));
      api.on(water, 'pointerdown', (e) => {
        api.sfx('splash');
        const p = api.toStage(e.clientX, e.clientY);
        api.sparkle(p.x, p.y, 10);
      });

      // Dripping stalactite
      const drip = add(api.el('div', { class: 'cv-abs cv-drip cv-poke', style: { left: '1168px', top: '92px', width: '60px', height: '110px' },
        html: `<svg viewBox="0 0 60 110" width="60" height="110">
          <path d="M2 4 Q30 -2 58 4 Q42 40 32 100 Q29 106 26 100 Q18 40 2 4 Z" fill="#3c3088" ${st(4)}/>
          <path d="M14 10 Q22 40 27 84" stroke="#5d4fb8" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>` }));
      add(api.el('div', { class: 'cv-drop idle' }));
      api.on(drip, 'pointerdown', () => {
        restartClass(drip, 'shake', 500);
        const d = add(api.el('div', { class: 'cv-drop fast' }));
        api.setTimeout(() => {
          d.remove();
          api.sfx('plop');
          const ring = add(api.el('div', { class: 'cv-ring', style: { left: '1197px', top: '584px' } }));
          api.setTimeout(() => ring.remove(), 820);
        }, 580);
      });

      // Bats
      [{ x: 420, y: 8, s: 92 }, { x: 600, y: 2, s: 78 }].forEach((b, i) => {
        const bat = add(api.el('div', { class: 'cv-abs cv-bat cv-poke', style: { left: b.x + 'px', top: b.y + 'px', width: b.s + 'px', height: (b.s * 0.67) + 'px' } }));
        const fly = api.el('div', { class: 'cv-bat-fly' });
        const hov = api.el('div', { class: 'cv-bat-hover', html: BAT_SVG, style: { animationDelay: (-i * 1.3) + 's' } });
        fly.appendChild(hov); bat.appendChild(fly);
        api.on(bat, 'pointerdown', () => {
          if (bat.classList.contains('flying')) return;
          restartClass(bat, 'flying', 1600);
          api.sfx('whoosh');
          api.note('E7', 0.08, 'triangle');
          api.setTimeout(() => api.note('A7', 0.08, 'triangle'), 110);
          api.setTimeout(() => api.note('E7', 0.07, 'triangle'), 800);
        });
      });

      // Mushrooms
      [{ x: 262, y: 606 }, { x: 788, y: 612 }].forEach((m, i) => {
        const mush = add(api.el('div', { class: 'cv-abs cv-mush cv-poke', style: { left: m.x + 'px', top: m.y + 'px', width: '96px', height: '90px' }, html: MUSH_SVG }));
        api.on(mush, 'pointerdown', () => {
          restartClass(mush, 'squish', 500);
          api.sfx('boing');
          const r = api.stageRect(mush);
          api.sparkle(r.cx - 6, r.y + 20, 8);
          void i;
        });
      });

      // Chiming crystal
      const CHIME_NOTES = ['C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'A6', 'G6', 'E6', 'D6'];
      let chimeIdx = 0;
      const chime = add(api.el('div', { class: 'cv-abs cv-chime cv-poke', style: { left: '904px', top: '572px', width: '104px', height: '136px' }, html: CHIME_SVG }));
      api.on(chime, 'pointerdown', () => {
        restartClass(chime, 'ring', 600);
        api.note(CHIME_NOTES[chimeIdx++ % CHIME_NOTES.length], 1.0, 'bell');
        api.sparkle(956, 600, 12);
      });

      // Mama Ember + nest
      const emberEl = add(api.el('div', { class: 'cv-abs cv-ember cv-poke' }));
      const emberIn = api.el('div', { class: 'cv-em-in', html: EMBER_SVG });
      emberEl.appendChild(emberIn);
      const nestBabies = SLOTS.map((s, i) => {
        const nb = add(api.el('div', { class: 'cv-abs cv-nb', style: { left: (s.x - 36) + 'px', top: (s.y - 36) + 'px' } }));
        const inner = api.el('div', { class: 'cv-b-in', html: babySVG(BABIES[i]), style: { animationDelay: (-i * 0.6) + 's' } });
        nb.appendChild(inner);
        api.on(nb, 'pointerdown', (e) => {
          if (!nb.classList.contains('show')) return;
          e.stopPropagation();
          restartClass(inner, 'bounce', 600);
          api.note(['A6', 'C7', 'E7'][i], 0.12, 'sine');
          api.setTimeout(() => api.note(['E7', 'G7', 'A7'][i], 0.12, 'sine'), 120);
        });
        return { el: nb, inner };
      });
      add(api.el('div', { class: 'cv-abs cv-nestfront', html: NEST_FRONT_SVG }));

      let emberTaps = 0;
      function puffSmoke(n) {
        for (let k = 0; k < n; k++) {
          api.setTimeout(() => {
            const s = add(api.el('div', { class: 'cv-smoke', style: { left: (200 + k * 6) + 'px', top: (206 - k * 4) + 'px' } }));
            api.setTimeout(() => s.remove(), 1550);
          }, k * 140);
        }
      }
      function hearts(x, y, n) {
        for (let k = 0; k < n; k++) {
          api.setTimeout(() => {
            const h = add(api.el('div', { class: 'cv-heart', html: HEART_SVG, style: { left: x + 'px', top: y + 'px' } }));
            h.style.setProperty('--hx', ((k - (n - 1) / 2) * 30) + 'px');
            api.setTimeout(() => h.remove(), 1450);
          }, k * 160);
        }
      }
      api.on(emberEl, 'pointerdown', () => {
        emberTaps++;
        if (emberTaps % 3 === 0) {
          restartClass(emberIn, 'wiggle', 550);
          api.sfx('roar');
          puffSmoke(4);
        } else {
          restartClass(emberIn, 'bounce', 650);
          api.sfx('giggle');
          puffSmoke(1);
          hearts(150, 150, 1);
        }
      });

      // Hint firefly button + crystal counter
      const hintBtn = add(api.el('div', { class: 'cv-abs cv-hint tap', title: 'Firefly helper', 'aria-label': 'Hint' },
        [api.el('div', { class: 'cv-hint-ff', html: FIREFLY_SVG })]));
      api.on(hintBtn, 'pointerdown', (e) => { e.stopPropagation(); hint(); });

      const countNum = api.el('div', { class: 'cv-count-num', text: '0' });
      const countEl = add(api.el('div', { class: 'cv-abs cv-count' }, [
        api.el('div', { class: 'cv-count-gem', html: gemSVG(GEMS[0]) }), countNum,
      ]));

      // Maze layer (rebuilt every round; listeners attached once)
      const mazeEl = add(api.el('div', { class: 'cv-maze' }));

      // ---------- geometry ----------
      const lx = (i) => PAD + (i % G.w + 0.5) * G.cell;
      const ly = (i) => PAD + (Math.floor(i / G.w) + 0.5) * G.cell;
      const sx = (i) => G.left + lx(i);
      const sy = (i) => G.top + ly(i);

      function dirBetween(a, b) {
        const d = b - a;
        if (d === 1) return DIRS[1];
        if (d === -1) return DIRS[3];
        if (d === G.w) return DIRS[2];
        return DIRS[0];
      }

      function straightPath(a, b) {
        const ac = a % G.w, ar = Math.floor(a / G.w), bc = b % G.w, br = Math.floor(b / G.w);
        if (ac !== bc && ar !== br) return null;
        let d;
        if (ar === br) d = bc > ac ? DIRS[1] : DIRS[3];
        else d = br > ar ? DIRS[2] : DIRS[0];
        const step = d.dc + d.dr * G.w;
        const out = [];
        let c = a;
        while (c !== b) {
          if (!(G.open[c] & d.b)) return null;
          c += step;
          out.push(c);
        }
        return out;
      }

      function shortPath(a, b) {
        const { prev } = bfs(G.open, G.w, G.h, a);
        return pathTo(prev, a, b);
      }

      function slidePath(a, d) {
        const out = [];
        const step = d.dc + d.dr * G.w;
        let c = a;
        while (G.open[c] & d.b) {
          c += step;
          out.push(c);
          if (c === G.goal || gemEls.has(c)) break;
          if (G.open[c] !== (d.b | d.o)) break; // stop at junctions, turns and dead ends
        }
        return out;
      }

      // ---------- round setup ----------
      function startRound() {
        const [w, h] = SIZES[round];
        const m = buildMaze(w, h, api.rand);
        const cell = Math.floor(Math.min((AREA.w - PAD * 2) / w, (AREA.h - PAD * 2) / h, CAP));
        const W2 = w * cell + PAD * 2, H2 = h * cell + PAD * 2;
        G = {
          w, h, cell, open: m.open, start: m.start, goal: m.goal,
          left: Math.round(AREA.x + (AREA.w - W2) / 2), top: Math.round(AREA.y + (AREA.h - H2) / 2), W2, H2,
        };
        cur = G.start;
        gemEls = new Map();
        printed = new Set();
        misses = 0;
        hintTok++;
        hintBtn.classList.remove('glow', 'pulse');

        mazeEl.innerHTML = '';
        Object.assign(mazeEl.style, { left: G.left + 'px', top: G.top + 'px', width: W2 + 'px', height: H2 + 'px' });
        mazeEl.appendChild(api.svg(mazeSVG()));
        printsBox = mazeEl.appendChild(api.el('div', { class: 'cv-abs', style: { left: 0, top: 0 } }));
        stepsBox = mazeEl.appendChild(api.el('div', { class: 'cv-abs', style: { left: 0, top: 0 } }));
        gemsBox = mazeEl.appendChild(api.el('div', { class: 'cv-abs', style: { left: 0, top: 0 } }));

        // the lost baby
        const B = Math.round(cell * 0.84);
        lostEl = api.el('div', { class: 'cv-lost', style: { left: (lx(G.goal) - B / 2) + 'px', top: (ly(G.goal) - B / 2 - cell * 0.03) + 'px', width: B + 'px', height: B + 'px' } });
        lostEl.appendChild(api.el('div', { class: 'cv-b-in', html: babySVG(BABIES[round]) }));
        mazeEl.appendChild(lostEl);

        // crystals: one on the true path, the rest tucked in dead ends
        const sol = shortPath(G.start, G.goal) || [];
        const onPath = sol.slice(0, -1);
        const chosen = [];
        if (onPath.length) chosen.push(onPath[Math.floor(onPath.length / 2)]);
        const solSet = new Set(sol);
        const ok = (i) => i !== G.start && i !== G.goal && chosen.indexOf(i) < 0;
        const popc = (v) => (v & 1) + ((v >> 1) & 1) + ((v >> 2) & 1) + ((v >> 3) & 1);
        const all = [];
        for (let i = 0; i < w * h; i++) all.push(i);
        const deadEnds = api.shuffle(all.filter(i => popc(G.open[i]) === 1 && !solSet.has(i)));
        const offPath = api.shuffle(all.filter(i => !solSet.has(i)));
        const rest = api.shuffle(all);
        for (const list of [deadEnds, offPath, rest]) {
          for (const i of list) { if (chosen.length >= N_GEMS) break; if (ok(i)) chosen.push(i); }
        }
        const GS = Math.round(cell * 0.46);
        chosen.forEach((i) => {
          const g = api.pick(GEMS);
          const ge = api.el('div', { class: 'cv-crys', style: { left: (lx(i) - GS / 2) + 'px', top: (ly(i) - GS * 0.6) + 'px', width: GS + 'px', height: Math.round(GS * 1.17) + 'px' } });
          ge.appendChild(api.el('div', { class: 'cv-crys-in', html: gemSVG(g), style: { animationDelay: (-Math.random() * 2) + 's' } }));
          ge._gem = g;
          gemsBox.appendChild(ge);
          gemEls.set(i, ge);
        });

        // the knight
        const S = Math.round(cell * 0.9);
        tokenEl = api.el('div', { class: 'cv-token', style: { width: S + 'px', height: S + 'px' } });
        tokenIn = api.el('div', { class: 'cv-tk-in' });
        tokenFace = api.el('div', { class: 'cv-tk-face', html: KNIGHT_SVG });
        tokenIn.appendChild(tokenFace);
        tokenEl.appendChild(tokenIn);
        mazeEl.appendChild(tokenEl);
        fliesBox = mazeEl.appendChild(api.el('div', { class: 'cv-abs', style: { left: 0, top: 0 } }));
        placeToken(0);

        mazeEl.classList.remove('out');
        restartClass(mazeEl, 'in', 520);
        locked = false;
        moving = false;
        updateSteps();
      }

      function mazeSVG() {
        const { w, h, cell, open, W2, H2 } = G;
        const T = Math.round(cell * 0.7);
        let segs = '';
        for (let i = 0; i < w * h; i++) {
          if (open[i] & 2) segs += `M${lx(i)} ${ly(i)}L${lx(i + 1)} ${ly(i)}`;
          if (open[i] & 4) segs += `M${lx(i)} ${ly(i)}L${lx(i)} ${ly(i + w)}`;
        }
        segs += `M${lx(G.start)} ${ly(G.start)}L6 ${ly(G.start)}`; // cave mouth on the left wall
        let bumps = '';
        for (let gy = 0; gy <= h; gy++) {
          for (let gx = 0; gx <= w; gx++) {
            const x = PAD + gx * cell, y = PAD + gy * cell;
            const r = cell * (0.1 + Math.random() * 0.08);
            bumps += `<ellipse cx="${x + (Math.random() - 0.5) * 6}" cy="${y + (Math.random() - 0.5) * 6}" rx="${r * 1.3}" ry="${r}" fill="#2e2468"/>`;
            bumps += `<ellipse cx="${x - r * 0.3}" cy="${y - r * 0.35}" rx="${r * 0.5}" ry="${r * 0.3}" fill="#6a5bc4" opacity=".5"/>`;
          }
        }
        let shards = '';
        for (let gy = 1; gy < h; gy++) {
          for (let gx = 1; gx < w; gx++) {
            if (Math.random() > 0.3) continue;
            const x = PAD + gx * cell, y = PAD + gy * cell, s = cell * 0.13;
            const g = GEMS[(gx + gy) % 3];
            shards += `<polygon points="${x - s * 0.6},${y + s * 0.5} ${x - s * 0.4},${y - s * 0.6} ${x},${y - s * 1.2} ${x + s * 0.4},${y - s * 0.6} ${x + s * 0.6},${y + s * 0.5}" fill="${g.col}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
          }
        }
        return `<svg width="${W2}" height="${H2}" viewBox="0 0 ${W2} ${H2}" style="position:absolute;left:0;top:0;overflow:visible">
          <defs>
            <linearGradient id="cvSlab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3c9c"/><stop offset="1" stop-color="#2f2570"/></linearGradient>
            <radialGradient id="cvGoalG"><stop offset="0" stop-color="#fff3a0" stop-opacity=".95"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>
          </defs>
          <rect x="3" y="3" width="${W2 - 6}" height="${H2 - 6}" rx="26" fill="url(#cvSlab)" ${st(6)}/>
          ${bumps}
          <path d="${segs}" fill="none" stroke="${INK}" stroke-width="${T + 10}" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${segs}" fill="none" stroke="#b9abee" stroke-width="${T}" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${segs}" fill="none" stroke="#d6ccf8" stroke-width="${Math.round(T * 0.42)}" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
          ${shards}
          <circle class="cv-halo" cx="${lx(G.goal)}" cy="${ly(G.goal)}" r="${cell * 0.46}" fill="url(#cvGoalG)"/>
        </svg>`;
      }

      // ---------- knight movement ----------
      function placeToken(ms, d) {
        const S = parseFloat(tokenEl.style.width);
        tokenEl.style.transition = ms ? `transform ${ms}ms linear` : 'none';
        tokenEl.style.transform = `translate(${lx(cur) - S / 2}px, ${ly(cur) - S / 2 - G.cell * 0.05}px)`;
        if (d === DIRS[3]) tokenFace.classList.add('flip');
        else if (d === DIRS[1]) tokenFace.classList.remove('flip');
      }

      function addPrint(a, b) {
        const key = Math.min(a, b) + '-' + Math.max(a, b);
        if (printed.has(key)) return;
        printed.add(key);
        const d = dirBetween(a, b);
        const P = Math.round(G.cell * 0.36);
        const x = (lx(a) + lx(b)) / 2, y = (ly(a) + ly(b)) / 2;
        const p = api.el('div', { class: 'cv-print', html: PRINT_SVG,
          style: { left: (x - P / 2) + 'px', top: (y - P / 2) + 'px', width: P + 'px', height: P + 'px' } });
        p.firstElementChild.style.transform = `rotate(${d.rot}deg)`;
        printsBox.appendChild(p);
      }

      function updateSteps(flash) {
        stepsBox.innerHTML = '';
        if (locked || moving) return;
        const M = Math.round(G.cell * 0.36);
        for (const d of DIRS) {
          if (!(G.open[cur] & d.b)) continue;
          const ni = cur + d.dc + d.dr * G.w;
          stepsBox.appendChild(api.el('div', { class: 'cv-step' + (diff === 3 ? ' dim' : '') + (flash ? ' flash' : ''),
            style: { left: (lx(ni) - M / 2) + 'px', top: (ly(ni) - M / 2) + 'px', width: M + 'px', height: M + 'px' } }));
        }
      }

      function walk(path, stepMs) {
        if (!path || !path.length || locked) return;
        moving = true;
        misses = 0;
        stepsBox.innerHTML = '';
        let k = 0;
        const step = () => {
          const from = cur;
          const next = path[k++];
          cur = next;
          addPrint(from, next);
          placeToken(stepMs, dirBetween(from, next));
          stepAlt = !stepAlt;
          api.note(stepAlt ? 'G4' : 'C5', 0.06, 'sine');
          api.setTimeout(() => {
            collectAt(next);
            if (next === G.goal) { moving = false; win(); return; }
            if (k < path.length) step();
            else { moving = false; afterWalk(); }
          }, stepMs);
        };
        step();
      }

      function afterWalk() {
        updateSteps();
        if (dragging && pendingCell != null && pendingCell !== cur) {
          const p = pendingCell;
          pendingCell = null;
          tryDragTo(p);
        }
      }

      function collectAt(i) {
        const ge = gemEls.get(i);
        if (!ge) return;
        gemEls.delete(i);
        api.sfx('coin');
        api.sparkle(sx(i), sy(i), 16);
        const GS = parseFloat(ge.style.width);
        const fly = add(api.el('div', { class: 'cv-gemfly', html: gemSVG(ge._gem), style: { width: GS + 'px', height: (GS * 1.17) + 'px' } }));
        ge.remove();
        const x0 = sx(i) - GS / 2, y0 = sy(i) - GS * 0.6;
        const x1 = COUNTER_AT.x - GS / 2, y1 = COUNTER_AT.y - GS * 0.6;
        fly.style.transform = `translate(${x0}px, ${y0}px)`;
        animateTo(fly, [
          { transform: `translate(${x0}px, ${y0}px) scale(1)` },
          { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 120}px) scale(1.4) rotate(20deg)`, offset: 0.45 },
          { transform: `translate(${x1}px, ${y1}px) scale(.8)` },
        ], 900);
        api.setTimeout(() => {
          fly.remove();
          gemsTotal++;
          countNum.textContent = String(gemsTotal);
          restartClass(countEl, 'bump', 520);
          api.sfx('sparkle');
          api.sparkle(COUNTER_AT.x, COUNTER_AT.y, 10);
        }, 900);
      }

      function bump() {
        api.sfx('boing');
        restartClass(tokenIn, 'wiggle', 520);
      }

      function babyPeep() {
        restartClass(lostEl.firstElementChild, 'bounce', 620);
        api.note('A6', 0.12, 'sine');
        api.setTimeout(() => api.note('E7', 0.14, 'sine'), 130);
      }

      function miss() {
        api.sfx('boing');
        restartClass(tokenIn, 'wiggle', 520);
        updateSteps(true);
        misses++;
        if (misses === 3) {
          hintBtn.classList.add('glow', 'pulse');
          script([['pip', 'Walk to a glowing spot next to you!']]);
        } else if (misses >= 6) {
          misses = 3;
          hintBtn.classList.add('glow', 'pulse');
          script([['pip', 'Tap the firefly for help!']]);
        }
      }

      function tryTap(i) {
        if (locked || moving) return;
        let path = straightPath(cur, i);
        if (!path) {
          const p = shortPath(cur, i);
          if (p && p.length <= 2) path = p; // just around a corner: be kind
        }
        if (path) { walk(path, 150); return; }
        if (i === G.goal) { babyPeep(); return; }
        miss();
      }

      function tryDragTo(i) {
        if (locked) return;
        if (moving) { pendingCell = i; return; }
        pendingCell = null;
        if (i === cur) return;
        let path = straightPath(cur, i);
        if (!path) {
          const p = shortPath(cur, i);
          if (p && p.length <= 3) path = p;
        }
        if (path) walk(path, 85);
      }

      function cellAt(clientX, clientY) {
        if (!G) return null;
        const p = api.toStage(clientX, clientY);
        const x = p.x - G.left - PAD, y = p.y - G.top - PAD;
        const c = Math.floor(x / G.cell), r = Math.floor(y / G.cell);
        if (c < 0 || r < 0 || c >= G.w || r >= G.h) return null;
        return r * G.w + c;
      }

      api.on(mazeEl, 'pointerdown', (e) => {
        if (!G || dragging) return;
        e.preventDefault();
        const i = cellAt(e.clientX, e.clientY);
        dragging = true;
        dragId = e.pointerId;
        downCell = i;
        leftDown = false;
        pendingCell = null;
        try { mazeEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        if (i == null || locked) return;
        if (i === cur) {
          if (!moving) { api.sfx('pickup'); restartClass(tokenIn, 'bounce', 600); }
          return;
        }
        tryTap(i);
      });
      api.on(mazeEl, 'pointermove', (e) => {
        if (!dragging || e.pointerId !== dragId) return;
        const i = cellAt(e.clientX, e.clientY);
        if (i == null) return;
        if (!leftDown) {
          if (i === downCell) return;
          leftDown = true;
        }
        if (i === cur) { pendingCell = null; return; }
        tryDragTo(i);
      });
      const endDrag = (e) => {
        if (e.pointerId !== dragId) return;
        dragging = false;
        dragId = null;
        pendingCell = null;
      };
      api.on(mazeEl, 'pointerup', endDrag);
      api.on(mazeEl, 'pointercancel', endDrag);
      api.on(mazeEl, 'lostpointercapture', endDrag);

      const KEYS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3 };
      api.on(window, 'keydown', (e) => {
        if (!Object.prototype.hasOwnProperty.call(KEYS, e.key)) return;
        e.preventDefault();
        if (!G || locked || moving) return;
        const p = slidePath(cur, DIRS[KEYS[e.key]]);
        if (p.length) walk(p, 110);
        else bump();
      });

      // ---------- firefly hint ----------
      function clearHint() {
        hintTok++;
        if (fliesBox) fliesBox.innerHTML = '';
      }
      function hint() {
        if (!G || locked) { api.sfx('click'); return; }
        hintBtn.classList.remove('glow', 'pulse');
        misses = 0;
        clearHint();
        const tok = hintTok;
        const path = (shortPath(cur, G.goal) || []).slice(0, HINT_STEPS);
        if (!path.length) return;
        api.sfx('sparkle');
        script([['pip', api.pick(['Follow the fireflies!', 'The fireflies know the way!', 'Look! Fireflies will help!'])]]);
        const F = Math.round(Math.max(30, G.cell * 0.36));
        const pts = [cur].concat(path).map(i => ({ x: lx(i) - F / 2, y: ly(i) - F / 2 }));
        const jit = [[-6, -8], [8, 2], [-2, 10]];
        const STEP = 330;
        path.forEach((i, k) => {
          api.setTimeout(() => {
            if (tok !== hintTok) return;
            const D = Math.round(G.cell * 0.5);
            const dot = api.el('div', { class: 'cv-hdot', style: { left: (lx(i) - D / 2) + 'px', top: (ly(i) - D / 2) + 'px', width: D + 'px', height: D + 'px' } });
            fliesBox.appendChild(dot);
          }, 200 + (k + 1) * STEP);
        });
        for (let j = 0; j < 3; j++) {
          const f = api.el('div', { class: 'cv-fly', html: '', style: { width: F + 'px', height: F + 'px', opacity: '0' } });
          f.appendChild(api.el('div', { class: 'cv-fly-in', html: FIREFLY_SVG, style: { animationDelay: (-j * 0.17) + 's' } }));
          f.style.transition = 'none';
          f.style.transform = `translate(${pts[0].x + jit[j][0]}px, ${pts[0].y + jit[j][1]}px)`;
          fliesBox.appendChild(f);
          void f.offsetWidth;
          f.style.transition = '';
          api.setTimeout(() => { if (tok === hintTok) f.style.opacity = '1'; }, 30 + j * 180);
          for (let k = 1; k < pts.length; k++) {
            api.setTimeout(() => {
              if (tok !== hintTok) return;
              f.style.transform = `translate(${pts[k].x + jit[j][0]}px, ${pts[k].y + jit[j][1]}px)`;
            }, 200 + j * 170 + k * STEP);
          }
          const endT = 200 + j * 170 + pts.length * STEP + 900;
          api.setTimeout(() => { if (tok === hintTok) f.style.opacity = '0'; }, endT);
          api.setTimeout(() => { if (tok === hintTok) f.remove(); }, endT + 700);
        }
      }

      // ---------- winning a round ----------
      async function win() {
        locked = true;
        moving = false;
        stepsBox.innerHTML = '';
        clearHint();
        const b = BABIES[round];
        const gx = sx(G.goal), gy = sy(G.goal);
        restartClass(tokenIn, 'bounce', 650);
        restartClass(lostEl.firstElementChild, 'bounce', 650);
        hearts(gx, gy - G.cell * 0.35, 3);
        api.sfx('giggle');
        api.setTimeout(() => api.sfx('correct'), 260);
        api.celebrate(gx, gy, 40);
        const p1 = script([['ember', api.pick([`${b.name}! My sweet baby!`, `You found ${b.name}! Hooray!`, `Oh, ${b.name}! There you are!`])]]);
        await api.wait(1200);

        // baby flies home to the nest
        const slot = SLOTS[round];
        const B = parseFloat(lostEl.style.width);
        lostEl.style.visibility = 'hidden';
        const flyer = add(api.el('div', { class: 'cv-flyer', html: babySVG(b) }));
        const sc = B / 72;
        flyer.style.transform = `translate(${gx - 36}px, ${gy - 36}px) scale(${sc})`;
        animateTo(flyer, [
          { transform: `translate(${gx - 36}px, ${gy - 36}px) scale(${sc})` },
          { transform: `translate(${(gx + slot.x) / 2 - 36}px, ${Math.min(gy, slot.y) - 200}px) scale(1.25) rotate(-10deg)`, offset: 0.5 },
          { transform: `translate(${slot.x - 36}px, ${slot.y - 36}px) scale(1)` },
        ], 1400);
        api.sfx('whoosh');
        await api.wait(1400);
        flyer.remove();
        nestBabies[round].el.classList.add('show');
        const homeBaby = nestBabies[round];
        api.setTimeout(() => restartClass(homeBaby.inner, 'bounce', 620), 300);
        api.sfx('pop');
        api.sparkle(slot.x, slot.y, 22);
        dots[round].classList.add('done');
        restartClass(emberIn, 'bounce', 650);
        hearts(160, 170, 2);
        round++;
        await Promise.race([p1, api.wait(2600)]);

        if (round < 3) {
          mazeEl.classList.add('out');
          await api.wait(420);
          startRound();
          const n = BABIES[round].name;
          script([['ember', api.pick([`Now please find ${n}!`, `Can you find ${n} too?`, `Where is little ${n}?`])]]);
        } else {
          finale();
        }
      }

      async function finale() {
        nestBabies.forEach((nb, i) => api.setTimeout(() => {
          restartClass(nb.inner, 'bounce', 620);
          api.note(['C5', 'E5', 'G5'][i], 0.4, 'bell');
        }, i * 260));
        api.setTimeout(() => { restartClass(emberIn, 'bounce', 650); puffSmoke(3); api.sfx('giggle'); }, 800);
        api.celebrate(116, 440, 70);
        hearts(116, 400, 4);
        await Promise.race([
          script([['ember', 'All my babies are home!'], ['ember', 'Thank you, brave knight!']]),
          api.wait(7000),
        ]);
        api.complete();
      }

      // ---------- go! ----------
      startRound();
      const first = BABIES[0].name;
      const intro = [
        ['ember', 'Hello, brave knight! Hello, little one!'],
        ['ember', 'My three babies got lost in the tunnels!'],
        ['ember', `Please help me find ${first}!`],
      ];
      intro.push(['pip', diff === 1 ? 'Tap a glowing spot to walk!' : 'Tap the tunnel or drag the knight!']);
      script(intro);
    },
  });
})();
