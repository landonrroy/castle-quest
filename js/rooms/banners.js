/* =====================================================================
   Castle Quest — Banner Hall (emerald)
   Lady Lark the banner-maker is decorating the great hall for the King's
   party. Each round a garland of pennants shows a repeating pattern with
   one empty "?" spot; the child drags (or taps) the right flag into it.
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#3a2a1a';
  const FONT = "'Baloo 2','Comic Sans MS','Chalkboard SE','Trebuchet MS',sans-serif";

  const COLORS = [
    { name: 'red',    fill: '#e8423f', dark: '#b32421' },
    { name: 'blue',   fill: '#2f7fe0', dark: '#1d56a3' },
    { name: 'yellow', fill: '#ffc928', dark: '#d99a00' },
    { name: 'green',  fill: '#3fb950', dark: '#23812f' },
    { name: 'purple', fill: '#9b5de5', dark: '#6a35ad' },
    { name: 'orange', fill: '#ff8c2b', dark: '#c25e0c' },
    { name: 'pink',   fill: '#ff6fae', dark: '#c93c7e' },
  ];
  const COLOR_IDX = COLORS.map((_, i) => i);
  const SYMBOLS = ['star', 'heart', 'moon', 'circle', 'crown', 'diamond'];
  const PLURAL = { star: 'stars', heart: 'hearts', moon: 'moons', circle: 'circles', crown: 'crowns', diamond: 'diamonds' };
  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
  const SCALE = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6'];
  const LENS = { AB: [5, 6], ABC: [6, 7], AAB: [6, 7], ABB: [6, 7], AABB: [8], ABCD: [8] };

  /* Garland geometry: rope hangs from (170,150) to (1110,150), sagging to y=190 */
  const ROPE_X0 = 170, ROPE_X1 = 1110, ROPE_Y = 150, FLAG_GAP = 115;
  const ropeY = x => { const t = (x - ROPE_X0) / (ROPE_X1 - ROPE_X0); return ROPE_Y + 160 * t * (1 - t); };

  /* ------------------------------------------------------------------
     Flag + symbol art
     ------------------------------------------------------------------ */
  function starPoints(R, r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r : R, a = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push((Math.cos(a) * rr).toFixed(1) + ',' + (Math.sin(a) * rr + 1).toFixed(1));
    }
    return pts.join(' ');
  }
  const STAR_PTS = starPoints(21, 9);

  function symbolShape(sym) {
    switch (sym) {
      case 'star': return `<polygon points="${STAR_PTS}"/>`;
      case 'heart': return '<path d="M0 17 C-24 2 -20 -17 -9 -17 C-4 -17 -1 -13 0 -9 C1 -13 4 -17 9 -17 C20 -17 24 2 0 17 Z"/>';
      case 'moon': return '<path d="M10 -15 A18 18 0 1 0 10 15 A15 15 0 0 1 10 -15 Z"/>';
      case 'circle': return '<circle r="16"/>';
      case 'crown': return '<path d="M-19 13 L-19 -11 L-9 -1 L0 -17 L9 -1 L19 -11 L19 13 Z"/>';
      case 'diamond': return '<polygon points="0,-20 15,0 0,20 -15,0"/>';
    }
    return '';
  }
  const LAYOUT = {
    1: { s: 50, pts: [[50, 60]] },
    2: { s: 36, pts: [[50, 40], [50, 82]] },
    3: { s: 32, pts: [[31, 42], [69, 42], [50, 82]] },
    4: { s: 30, pts: [[31, 40], [69, 40], [31, 80], [69, 80]] },
    5: { s: 27, pts: [[30, 36], [70, 36], [50, 62], [30, 88], [70, 88]] },
    6: { s: 24, pts: [[31, 34], [69, 34], [31, 62], [69, 62], [31, 90], [69, 90]] },
  };
  function symbolsSVG(sym, n) {
    const L = LAYOUT[n] || LAYOUT[1];
    const k = L.s / 40, sw = (3.4 / k).toFixed(2), shape = symbolShape(sym);
    return L.pts.map(([x, y]) =>
      `<g transform="translate(${x} ${y}) scale(${k.toFixed(3)})" fill="#fff" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round">${shape}</g>`
    ).join('');
  }
  const FLAG_PATH = 'M8 10 H92 V98 L50 134 L8 98 Z';
  function flagSVG(item) {
    const col = COLORS[item.c];
    return `<svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet">
      <path d="${FLAG_PATH}" fill="${col.fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M70 14 H88 V96 L70 112 Z" fill="${col.dark}" opacity=".35"/>
      <path d="M14 16 H26 V100 L14 94 Z" fill="#fff" opacity=".22"/>
      <path d="M16 20 H84 V94 L50 123 L16 94 Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round" opacity=".7"/>
      ${item.s ? symbolsSVG(item.s, item.n || 1) : ''}
      <rect x="2" y="3" width="96" height="14" rx="7" fill="#ffd25a" stroke="${INK}" stroke-width="4"/>
      <circle cx="50" cy="134" r="6" fill="#ffd25a" stroke="${INK}" stroke-width="3"/>
    </svg>`;
  }
  function slotSVG() {
    return `<svg viewBox="0 0 100 140">
      <path d="${FLAG_PATH}" fill="rgba(255,255,255,.45)" stroke="${INK}" stroke-width="4" stroke-dasharray="10 7" stroke-linejoin="round"/>
      <text x="50" y="84" text-anchor="middle" font-size="64" font-weight="800" font-family="${FONT}" fill="#fff" stroke="${INK}" stroke-width="4" paint-order="stroke">?</text>
      <rect x="2" y="3" width="96" height="14" rx="7" fill="#ffd25a" stroke="${INK}" stroke-width="4"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------
     Scene art
     ------------------------------------------------------------------ */
  function windowSVG(x, id) {
    const y = 108, w = 110, h = 292, r = 55;
    const glass = `M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z`;
    const fx = x - 14, fr = r + 14;
    const frame = `M${fx} ${y + h + 10} V${y + r} A${fr} ${fr} 0 0 1 ${fx + w + 28} ${y + r} V${y + h + 10} Z`;
    return `
      <path d="${frame}" fill="#e6d7b8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <clipPath id="${id}"><path d="${glass}"/></clipPath>
      <g clip-path="url(#${id})">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#bhSky)"/>
        <g fill="#fff"><circle cx="${x + 28}" cy="${y + 92}" r="13"/><circle cx="${x + 46}" cy="${y + 84}" r="17"/><circle cx="${x + 66}" cy="${y + 93}" r="12"/></g>
        <path d="M${x + 60} ${y + 210} V${y + 170} h8 v-8 h8 v8 h8 v-8 h8 v8 h8 V${y + 210} Z" fill="#9ab0d6" stroke="${INK}" stroke-width="2.5" opacity=".85"/>
        <path d="M${x - 10} ${y + 232} Q${x + 40} ${y + 190} ${x + 80} ${y + 220} T${x + 130} ${y + 214} V${y + h} H${x - 10} Z" fill="#7fd36a" stroke="${INK}" stroke-width="3"/>
        <path d="M${x - 10} ${y + 262} Q${x + 50} ${y + 236} ${x + 130} ${y + 258} V${y + h} H${x - 10} Z" fill="#5bbd52" stroke="${INK}" stroke-width="3"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#bhLead)"/>
        <path d="M${x + 14} ${y + 120} L${x + 44} ${y + 60} M${x + 22} ${y + 150} L${x + 62} ${y + 70}" stroke="#fff" stroke-width="7" opacity=".35" stroke-linecap="round"/>
      </g>
      <path d="${glass}" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M${x + r} ${y} V${y + h} M${x} ${y + 150} H${x + w}" stroke="${INK}" stroke-width="5"/>
      <rect x="${x - 24}" y="${y + h + 6}" width="${w + 48}" height="16" rx="6" fill="#d9c7a3" stroke="${INK}" stroke-width="4"/>`;
  }

  function backgroundSVG() {
    const wall = `
      <rect x="0" y="0" width="1280" height="548" fill="url(#bhStone)"/>
      <rect x="0" y="0" width="1280" height="548" fill="url(#bhWallShade)"/>
      <rect x="0" y="0" width="1280" height="24" fill="#7d4a1f"/>
      <path d="M0 24 H1280" stroke="${INK}" stroke-width="5"/>
      ${[80, 400, 880, 1200].map(x => `<path d="M${x - 22} 24 h44 l-10 22 h-24 z" fill="#9b6531" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`).join('')}`;
    const windows = windowSVG(205, 'bhWin1') + windowSVG(965, 'bhWin2');
    const beams = `
      <polygon class="bh-beam" points="212,170 315,150 640,720 380,720" fill="url(#bhBeam)"/>
      <polygon class="bh-beam b2" points="972,170 1075,150 1400,720 1140,720" fill="url(#bhBeam)"/>`;
    /* crossed swords + shield above the armor */
    const shield = `
      <g stroke-linecap="round">
        <path d="M42 120 L148 236 M148 120 L42 236" stroke="${INK}" stroke-width="12"/>
        <path d="M42 120 L148 236 M148 120 L42 236" stroke="#e6eef5" stroke-width="6"/>
        <path d="M50 214 L66 230 M140 214 L124 230" stroke="${INK}" stroke-width="14"/>
        <path d="M50 214 L66 230 M140 214 L124 230" stroke="#ffc928" stroke-width="8"/>
      </g>
      <path d="M60 136 H130 V172 C130 204 110 222 95 230 C80 222 60 204 60 172 Z" fill="#2f7fe0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M60 172 L95 196 L130 172" fill="none" stroke="#ffc928" stroke-width="9"/>
      <path d="M60 172 L95 196 L130 172" fill="none" stroke="${INK}" stroke-width="2" opacity=".4"/>
      <circle cx="95" cy="158" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    /* royal tapestry behind Lady Lark */
    const tapestry = `
      <rect x="1118" y="102" width="144" height="12" rx="6" fill="#b5763c" stroke="${INK}" stroke-width="4"/>
      <circle cx="1116" cy="108" r="9" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
      <circle cx="1264" cy="108" r="9" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
      <path d="M1134 114 H1246 V302 L1218 320 L1190 302 L1162 320 L1134 302 Z" fill="#9b5de5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M1146 126 H1234 V292 L1218 302 L1190 288 L1162 302 L1146 292 Z" fill="none" stroke="#ffc928" stroke-width="4" stroke-dasharray="8 5"/>
      <path d="M1160 226 L1160 184 L1176 202 L1190 172 L1204 202 L1220 184 L1220 226 Z" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="1190" cy="214" r="5" fill="#e8423f" stroke="${INK}" stroke-width="2"/>`;
    const floor = `
      <rect x="0" y="548" width="1280" height="172" fill="url(#bhFloor)"/>
      <rect x="0" y="548" width="1280" height="172" fill="url(#bhFloorShade)"/>
      <rect x="0" y="528" width="1280" height="22" fill="#9a8467"/>
      <path d="M0 528 H1280 M0 550 H1280" stroke="${INK}" stroke-width="4"/>
      <path d="M176 548 V516 A36 34 0 0 1 248 516 V548 Z" fill="#2a1d14" stroke="${INK}" stroke-width="4"/>`;
    /* feast table (foreground) with food */
    let scallops = '';
    for (let x = 204; x < 1036; x += 42) scallops += `<path d="M${x} 652 q21 18 42 0" fill="#ffc928" stroke="${INK}" stroke-width="3.5"/>`;
    const table = `
      <ellipse cx="620" cy="712" rx="470" ry="16" fill="rgba(40,20,0,.22)"/>
      <rect x="222" y="640" width="24" height="80" fill="#9b6531" stroke="${INK}" stroke-width="4"/>
      <rect x="1012" y="640" width="24" height="80" fill="#9b6531" stroke="${INK}" stroke-width="4"/>
      <path d="M210 600 H1030 L1040 614 H200 Z" fill="#c68a4c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="200" y="612" width="840" height="42" fill="#c23a36" stroke="${INK}" stroke-width="5"/>
      ${scallops}
      <path d="M200 624 H1040" stroke="#ffc928" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
      <!-- roast chicken -->
      <ellipse cx="266" cy="604" rx="44" ry="9" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="266" cy="590" rx="30" ry="17" fill="#c8742f" stroke="${INK}" stroke-width="4"/>
      <path d="M250 582 C256 576 268 574 276 578" stroke="#f0b070" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M292 584 L306 574 M240 586 L226 576" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path d="M292 584 L306 574 M240 586 L226 576" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <!-- fruit bowl -->
      <circle cx="338" cy="584" r="10" fill="#e8423f" stroke="${INK}" stroke-width="3"/>
      <circle cx="356" cy="580" r="10" fill="#3fb950" stroke="${INK}" stroke-width="3"/>
      <g fill="#9b5de5" stroke="${INK}" stroke-width="2.5"><circle cx="372" cy="586" r="6"/><circle cx="380" cy="590" r="6"/><circle cx="374" cy="594" r="6"/></g>
      <path d="M320 590 H392 C390 606 372 610 356 610 C340 610 322 606 320 590 Z" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <!-- goblets -->
      ${[442, 848].map(x => `<path d="M${x - 11} 572 H${x + 11} C${x + 11} 588 ${x + 4} 592 ${x} 592 C${x - 4} 592 ${x - 11} 588 ${x - 11} 572 Z M${x} 592 V604 M${x - 9} 606 H${x + 9}" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}
      <!-- pie -->
      <ellipse cx="640" cy="598" rx="40" ry="11" fill="#e0a050" stroke="${INK}" stroke-width="4"/>
      <path d="M612 596 L626 604 M630 592 L652 606 M650 591 L668 600 M620 602 L650 590" stroke="#a8692a" stroke-width="3" stroke-linecap="round"/>
      <!-- bread -->
      <ellipse cx="752" cy="597" rx="28" ry="12" fill="#d9954a" stroke="${INK}" stroke-width="4"/>
      <path d="M738 592 l6 -6 M750 590 l6 -6 M762 592 l6 -6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <!-- party cake -->
      <ellipse cx="968" cy="604" rx="44" ry="8" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <rect x="936" y="574" width="64" height="28" rx="6" fill="#ff9ec9" stroke="${INK}" stroke-width="4"/>
      <rect x="948" y="552" width="40" height="24" rx="6" fill="#fff6e0" stroke="${INK}" stroke-width="4"/>
      <path d="M938 584 q8 8 16 0 q8 8 16 0 q8 8 16 0 q7 7 14 0" fill="none" stroke="#fff" stroke-width="3.5"/>
      <circle cx="968" cy="546" r="7" fill="#e8423f" stroke="${INK}" stroke-width="3"/>`;
    return `<svg class="bh-bg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <pattern id="bhStone" width="120" height="64" patternUnits="userSpaceOnUse">
          <rect width="120" height="64" fill="#cdb796"/>
          <rect x="64" y="6" width="50" height="22" rx="5" fill="#d8c4a2"/>
          <rect x="34" y="38" width="50" height="22" rx="5" fill="#c3ac89"/>
          <g fill="none" stroke="#a48d6a" stroke-width="3">
            <rect x="2" y="2" width="56" height="28" rx="6"/><rect x="62" y="2" width="56" height="28" rx="6"/>
            <rect x="-28" y="34" width="56" height="28" rx="6"/><rect x="32" y="34" width="56" height="28" rx="6"/><rect x="92" y="34" width="56" height="28" rx="6"/>
          </g>
        </pattern>
        <pattern id="bhFloor" width="96" height="48" patternUnits="userSpaceOnUse">
          <rect width="96" height="48" fill="#a8673a"/>
          <rect width="48" height="24" fill="#bb7a47"/><rect x="48" y="24" width="48" height="24" fill="#bb7a47"/>
          <path d="M0 0 H96 M0 24 H96 M0 0 V48 M48 0 V48" stroke="#8a5028" stroke-width="2.5"/>
        </pattern>
        <pattern id="bhLead" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 11 L11 0 L22 11 L11 22 Z" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".3"/>
        </pattern>
        <linearGradient id="bhWallShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a2a1a" stop-opacity=".38"/>
          <stop offset=".45" stop-color="#3a2a1a" stop-opacity="0"/>
          <stop offset="1" stop-color="#3a2a1a" stop-opacity=".16"/>
        </linearGradient>
        <linearGradient id="bhFloorShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a2a1a" stop-opacity=".28"/>
          <stop offset="1" stop-color="#3a2a1a" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="bhSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#6fc2ff"/><stop offset="1" stop-color="#d4f0ff"/>
        </linearGradient>
        <linearGradient id="bhBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff7c8" stop-opacity=".55"/>
          <stop offset="1" stop-color="#fff7c8" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${wall}${windows}${shield}${tapestry}${floor}${beams}${table}
    </svg>`;
  }

  function chandelierSVG() {
    const xs = [30, 66, 174, 210];
    const candles = xs.map((x, i) => {
      const cy = (x === 30 || x === 210) ? 132 : 136;
      return `
        <circle class="glowc" cx="${x}" cy="${cy - 38}" r="24" fill="url(#bhGlow)"/>
        <rect x="${x - 6}" y="${cy - 28}" width="12" height="26" rx="3" fill="#fff6e0" stroke="${INK}" stroke-width="3"/>
        <path d="M${x - 6} ${cy - 22} q3 6 5 0" fill="none" stroke="#e8dcc0" stroke-width="2"/>
        <ellipse cx="${x}" cy="${cy}" rx="11" ry="5" fill="#ffc928" stroke="${INK}" stroke-width="3.5"/>
        <g class="flame" style="animation-delay:${(-i * 0.13).toFixed(2)}s">
          <path d="M${x} ${cy - 52} C${x + 9} ${cy - 42} ${x + 8} ${cy - 31} ${x} ${cy - 30} C${x - 8} ${cy - 31} ${x - 9} ${cy - 42} ${x} ${cy - 52} Z" fill="#ff9d2b" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M${x} ${cy - 44} C${x + 4} ${cy - 38} ${x + 4} ${cy - 33} ${x} ${cy - 33} C${x - 4} ${cy - 33} ${x - 4} ${cy - 38} ${x} ${cy - 44} Z" fill="#fff3a0"/>
        </g>`;
    }).join('');
    const arms = 'M120 106 C100 130 60 128 30 132 M120 106 C108 130 86 136 66 136 M120 106 C132 130 154 136 174 136 M120 106 C140 130 180 128 210 132';
    return `<svg viewBox="0 0 240 170" width="240" height="170">
      <defs><radialGradient id="bhGlow"><stop offset="0" stop-color="#fff3a0" stop-opacity=".95"/><stop offset="1" stop-color="#ffc928" stop-opacity="0"/></radialGradient></defs>
      <g class="ch-all">
        <path d="M120 0 V104" stroke="${INK}" stroke-width="7"/>
        <path d="M120 0 V104" stroke="#ffc928" stroke-width="3" stroke-dasharray="6 4"/>
        <path d="${arms}" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="${arms}" stroke="#ffc928" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="120" cy="143" rx="104" ry="13" fill="none" stroke="${INK}" stroke-width="9"/>
        <ellipse cx="120" cy="143" rx="104" ry="13" fill="none" stroke="#ffc928" stroke-width="4.5"/>
        <path d="M120 117 L131 140 L120 163 L109 140 Z" fill="#22b26b" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M116 128 L113 140" stroke="#8af0bd" stroke-width="3" stroke-linecap="round"/>
        <circle cx="120" cy="106" r="11" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
        ${candles}
      </g>
    </svg>`;
  }

  function armorSVG() {
    return `<svg viewBox="0 0 140 300" width="140" height="300">
      <g class="arm-in">
        <rect x="118" y="30" width="8" height="262" rx="3" fill="#b5763c" stroke="${INK}" stroke-width="3"/>
        <path d="M122 32 L122 6 L131 32 Z" fill="#dfe6ec" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M126 42 C144 44 144 78 126 82 Z" fill="#dfe6ec" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M66 48 C58 20 76 2 98 10 C84 14 80 26 86 40 C78 34 72 38 72 50 Z" fill="#e8423f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M38 86 C38 42 98 42 98 86 L98 116 L38 116 Z" fill="#c9d3dc" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <rect x="44" y="72" width="48" height="34" rx="8" fill="#2a2438"/>
        <g class="peek-eyes">
          <circle cx="58" cy="88" r="6.5" fill="#fff"/><circle cx="78" cy="88" r="6.5" fill="#fff"/>
          <circle cx="59.5" cy="89" r="3.2" fill="${INK}"/><circle cx="79.5" cy="89" r="3.2" fill="${INK}"/>
        </g>
        <g class="visor">
          <rect x="41" y="69" width="54" height="40" rx="9" fill="#aeb9c4" stroke="${INK}" stroke-width="4"/>
          <path d="M49 84 H87 M49 95 H87" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="45" cy="89" r="3" fill="#fff" stroke="${INK}" stroke-width="1.5"/><circle cx="91" cy="89" r="3" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
        </g>
        <path d="M48 64 C52 56 60 52 68 52" stroke="#fff" stroke-width="4" opacity=".75" stroke-linecap="round" fill="none"/>
        <rect x="46" y="114" width="44" height="12" rx="4" fill="#aeb9c4" stroke="${INK}" stroke-width="4"/>
        <rect x="20" y="134" width="16" height="64" rx="7" fill="#c9d3dc" stroke="${INK}" stroke-width="4"/>
        <rect x="100" y="134" width="16" height="56" rx="7" fill="#c9d3dc" stroke="${INK}" stroke-width="4"/>
        <path d="M36 122 L100 122 L96 194 C80 204 56 204 40 194 Z" fill="#c9d3dc" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M68 126 V196" stroke="#9aa6b2" stroke-width="3"/>
        <path d="M46 132 C44 150 46 168 50 180" stroke="#fff" stroke-width="5" opacity=".7" stroke-linecap="round" fill="none"/>
        <ellipse cx="32" cy="132" rx="17" ry="12" fill="#aeb9c4" stroke="${INK}" stroke-width="4"/>
        <ellipse cx="104" cy="132" rx="17" ry="12" fill="#aeb9c4" stroke="${INK}" stroke-width="4"/>
        <circle cx="28" cy="203" r="10" fill="#aeb9c4" stroke="${INK}" stroke-width="4"/>
        <circle cx="117" cy="192" r="10" fill="#aeb9c4" stroke="${INK}" stroke-width="4"/>
        <rect x="38" y="190" width="60" height="12" rx="5" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
        <path d="M40 202 L96 202 L100 226 L36 226 Z" fill="#aeb9c4" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="44" y="224" width="18" height="58" rx="7" fill="#c9d3dc" stroke="${INK}" stroke-width="4"/>
        <rect x="74" y="224" width="18" height="58" rx="7" fill="#c9d3dc" stroke="${INK}" stroke-width="4"/>
        <circle cx="53" cy="250" r="8" fill="#aeb9c4" stroke="${INK}" stroke-width="3.5"/>
        <circle cx="83" cy="250" r="8" fill="#aeb9c4" stroke="${INK}" stroke-width="3.5"/>
        <path d="M40 280 H64 C72 280 72 292 64 292 H40 Z M70 280 H94 C102 280 102 292 94 292 H70 Z" fill="#aeb9c4" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="24" y="290" width="92" height="9" rx="4" fill="#7d4a1f" stroke="${INK}" stroke-width="3"/>
      </g>
    </svg>`;
  }

  function dogSVG() {
    return `<svg viewBox="0 0 150 80" width="150" height="80">
      <g class="tail">
        <path d="M30 54 C18 48 10 36 8 22" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M30 54 C18 48 10 36 8 22" stroke="#d08b4b" stroke-width="6" fill="none" stroke-linecap="round"/>
      </g>
      <ellipse cx="64" cy="58" rx="40" ry="18" fill="#d08b4b" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="52" cy="52" rx="13" ry="8" fill="#8a5222" opacity=".8"/>
      <ellipse cx="40" cy="72" rx="13" ry="6" fill="#fff2dc" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="94" cy="72" rx="12" ry="6" fill="#fff2dc" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="117" cy="72" rx="12" ry="6" fill="#fff2dc" stroke="${INK}" stroke-width="3"/>
      <g class="head">
        <circle cx="114" cy="36" r="22" fill="#d08b4b" stroke="${INK}" stroke-width="4"/>
        <ellipse cx="94" cy="40" rx="9" ry="17" fill="#8a5222" stroke="${INK}" stroke-width="4" transform="rotate(16 94 40)"/>
        <ellipse cx="134" cy="40" rx="8" ry="16" fill="#8a5222" stroke="${INK}" stroke-width="4" transform="rotate(-16 134 40)"/>
        <path d="M98 54 Q108 62 122 58" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M98 54 Q108 62 122 58" stroke="#e8423f" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="110" cy="62" r="4" fill="#ffc928" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="118" cy="46" rx="13" ry="9" fill="#fff2dc" stroke="${INK}" stroke-width="3"/>
        <path class="tongue" d="M117 51 C117 63 126 63 126 51 Z" fill="#ff6f8f" stroke="${INK}" stroke-width="2.5"/>
        <path d="M114 50 Q120 54 126 50" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="123" cy="40" rx="5" ry="4" fill="${INK}"/>
        <circle cx="105" cy="30" r="3.8" fill="${INK}"/><circle cx="121" cy="28" r="3.8" fill="${INK}"/>
        <circle cx="106" cy="29" r="1.3" fill="#fff"/><circle cx="122" cy="27" r="1.3" fill="#fff"/>
      </g>
    </svg>`;
  }

  function mouseSVG() {
    return `<svg viewBox="0 0 72 62" width="72" height="62">
      <circle cx="18" cy="18" r="12" fill="#b9b9c8" stroke="${INK}" stroke-width="3.5"/><circle cx="18" cy="18" r="6" fill="#ffb3c7"/>
      <circle cx="54" cy="18" r="12" fill="#b9b9c8" stroke="${INK}" stroke-width="3.5"/><circle cx="54" cy="18" r="6" fill="#ffb3c7"/>
      <ellipse cx="36" cy="38" rx="22" ry="19" fill="#b9b9c8" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="28" cy="34" r="3.6" fill="${INK}"/><circle cx="44" cy="34" r="3.6" fill="${INK}"/>
      <circle cx="29" cy="33" r="1.2" fill="#fff"/><circle cx="45" cy="33" r="1.2" fill="#fff"/>
      <path d="M30 46 L12 42 M30 48 L12 51 M42 46 L60 42 M42 48 L60 51" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="36" cy="44" r="4" fill="#ff8fb0" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="26" cy="57" rx="6" ry="4" fill="#ffd1e0" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="46" cy="57" rx="6" ry="4" fill="#ffd1e0" stroke="${INK}" stroke-width="2"/>
    </svg>`;
  }

  function basketSVG() {
    return `<svg viewBox="0 0 120 80" width="120" height="80">
      <g class="yarn y1"><circle cx="36" cy="30" r="16" fill="#e8423f" stroke="${INK}" stroke-width="3.5"/><path d="M24 22 C32 30 34 38 30 44 M30 16 C40 24 46 34 44 44" stroke="#b32421" stroke-width="2.5" fill="none"/></g>
      <g class="yarn y2"><circle cx="66" cy="24" r="15" fill="#2f7fe0" stroke="${INK}" stroke-width="3.5"/><path d="M54 18 C64 24 68 32 66 38 M60 12 C70 18 76 26 76 34" stroke="#1d56a3" stroke-width="2.5" fill="none"/></g>
      <g class="yarn y3"><circle cx="93" cy="32" r="12" fill="#ffc928" stroke="${INK}" stroke-width="3.5"/><path d="M85 28 C91 32 93 38 91 42" stroke="#d99a00" stroke-width="2.5" fill="none"/></g>
      <path d="M40 18 L58 2" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M40 18 L58 2" stroke="#e6eef5" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M8 38 L112 38 L102 76 L18 76 Z" fill="#c98a3f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M14 52 H106 M16 64 H104" stroke="#8f5a22" stroke-width="3"/>
      <path d="M30 40 L32 74 M50 40 L50 74 M70 40 L70 74 M90 40 L88 74" stroke="#8f5a22" stroke-width="3"/>
      <rect x="4" y="32" width="112" height="10" rx="5" fill="#e0a85a" stroke="${INK}" stroke-width="4"/>
      <path d="M30 42 C24 58 10 62 6 78" stroke="#e8423f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function larkSVG() {
    return `<svg viewBox="0 0 200 400" width="200" height="400">
      <g class="lk-body">
        <path class="lk-veil" d="M126 12 C160 50 176 120 166 196 C160 226 182 246 172 268 C152 240 142 200 142 158 C140 110 132 60 122 22 Z" fill="#fff" opacity=".85" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M56 120 C52 76 148 76 144 120 C150 160 146 190 136 196 L64 196 C54 190 50 160 56 120 Z" fill="#b5532a" stroke="${INK}" stroke-width="4"/>
        <path d="M58 196 C44 270 22 340 14 394 L186 394 C178 340 156 270 142 196 Z" fill="#22b26b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M70 232 C62 290 50 340 44 372 M130 232 C138 290 150 340 156 372" stroke="#0f6b3d" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
        <path d="M18 372 L182 372 L186 394 L14 394 Z" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        ${[40, 70, 100, 130, 160].map(x => `<circle cx="${x}" cy="383" r="4" fill="#22b26b" stroke="${INK}" stroke-width="2"/>`).join('')}
        <path d="M78 206 C72 270 68 320 72 362 L128 362 C132 320 128 270 122 206 Z" fill="#fffaf0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <g fill="none" stroke="${INK}" stroke-width="2.5"><circle cx="94" cy="290" r="5"/><circle cx="106" cy="290" r="5"/></g>
        <rect x="84" y="294" width="32" height="26" rx="6" fill="#ffe3ef" stroke="${INK}" stroke-width="3"/>
        <path d="M62 158 C58 176 58 192 56 206 L144 206 C142 192 142 176 138 158 C118 150 82 150 62 158 Z" fill="#22b26b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M92 168 L108 178 M108 168 L92 178 M92 182 L108 192 M108 182 L92 192" stroke="#ffc928" stroke-width="3" stroke-linecap="round"/>
        <rect x="54" y="200" width="92" height="12" rx="6" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
        <path d="M64 162 C42 176 30 214 24 252 L58 258 C60 228 66 204 76 186 Z" fill="#3fd28a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M28 264 L62 264 L62 298 L45 312 L28 298 Z" fill="#ff6fae" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M45 276 C40 270 34 276 45 288 C56 276 50 270 45 276 Z" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <circle cx="42" cy="262" r="11" fill="#ffdcbf" stroke="${INK}" stroke-width="4"/>
        <rect x="88" y="144" width="24" height="20" rx="6" fill="#ffdcbf" stroke="${INK}" stroke-width="4"/>
        <g fill="none" stroke-linecap="round">
          <path d="M70 160 C80 176 120 176 130 160 M74 166 C72 190 76 210 70 232 M126 166 C130 186 124 206 130 222" stroke="${INK}" stroke-width="11"/>
          <path d="M70 160 C80 176 120 176 130 160 M74 166 C72 190 76 210 70 232 M126 166 C130 186 124 206 130 222" stroke="#ffd84a" stroke-width="6"/>
          <path d="M74 170 C72 190 76 210 70 230 M126 170 C130 186 124 206 130 220" stroke="${INK}" stroke-width="2" stroke-dasharray="1.5 6"/>
        </g>
        <ellipse cx="60" cy="150" rx="10" ry="22" fill="#b5532a" stroke="${INK}" stroke-width="4"/>
        <ellipse cx="140" cy="150" rx="10" ry="22" fill="#b5532a" stroke="${INK}" stroke-width="4"/>
        <circle cx="60" cy="172" r="5" fill="#ff6fae" stroke="${INK}" stroke-width="2.5"/>
        <circle cx="140" cy="172" r="5" fill="#ff6fae" stroke="${INK}" stroke-width="2.5"/>
        <circle cx="100" cy="120" r="36" fill="#ffdcbf" stroke="${INK}" stroke-width="4"/>
        <path d="M66 120 C68 104 86 100 100 106 C114 100 132 104 134 120 C124 112 112 110 100 114 C88 110 76 112 66 120 Z" fill="#b5532a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M66 98 C84 66 106 30 126 6 C126 40 132 72 136 96 Z" fill="#ff6fae" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M104 46 L127 40 M90 66 L130 60 M80 84 L133 80" stroke="#ffd1e6" stroke-width="5" stroke-linecap="round" opacity=".85"/>
        <path d="M62 96 C84 86 116 86 138 96 L136 108 C116 100 84 100 64 108 Z" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <polygon points="100,90 106,97 100,105 94,97" fill="#22b26b" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <g class="lk-eyes">
          <ellipse cx="86" cy="126" rx="8.5" ry="10.5" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
          <ellipse cx="114" cy="126" rx="8.5" ry="10.5" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
          <circle cx="88" cy="128" r="5" fill="${INK}"/><circle cx="116" cy="128" r="5" fill="${INK}"/>
          <circle cx="90" cy="125" r="1.8" fill="#fff"/><circle cx="118" cy="125" r="1.8" fill="#fff"/>
        </g>
        <path d="M77 117 L73 112 M123 117 L127 112" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="74" cy="140" rx="7" ry="4.5" fill="#ff8fb0" opacity=".75"/>
        <ellipse cx="126" cy="140" rx="7" ry="4.5" fill="#ff8fb0" opacity=".75"/>
        <path d="M99 132 Q103 137 98 139" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path class="lk-mouth-smile" d="M90 145 Q100 156 110 145 Q100 150 90 145 Z" fill="#c0392b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <ellipse class="lk-mouth-talk" cx="100" cy="148" rx="7" ry="6" fill="#7a1f2b" stroke="${INK}" stroke-width="3"/>
        <g class="lk-arm">
          <path d="M191 92 C206 150 140 220 62 268" stroke="#e8423f" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M136 162 C156 168 168 156 172 134 L190 140 C186 172 164 192 134 190 Z" fill="#3fd28a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
          <path d="M181 128 L192 86" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
          <path d="M181 128 L192 86" stroke="#e6eef5" stroke-width="3" stroke-linecap="round"/>
          <circle cx="181" cy="132" r="11" fill="#ffdcbf" stroke="${INK}" stroke-width="4"/>
        </g>
      </g>
    </svg>`;
  }

  function needleSVG() {
    return `<svg viewBox="0 0 70 30" width="70" height="30">
      <path d="M58 7 C66 2 70 12 64 20 C60 26 52 24 50 28" stroke="#e8423f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M4 26 L60 6" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M4 26 L60 6" stroke="#e6eef5" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  const CSS = `
  .scene-banners { background: #cdb796; }
  .scene-banners .bh-bg { position: absolute; left: 0; top: 0; }
  .scene-banners .bh-beam { animation: bh-beam 5s ease-in-out infinite alternate; }
  .scene-banners .bh-beam.b2 { animation-delay: -2.5s; }
  @keyframes bh-beam { from { opacity: .5; } to { opacity: 1; } }

  .scene-banners .bh-x { position: absolute; cursor: pointer; }
  .scene-banners .bh-x svg { display: block; overflow: visible; }

  /* chandelier */
  .scene-banners .bh-chand { left: 520px; top: 0; width: 240px; height: 170px; pointer-events: none; }
  .scene-banners .bh-chand .ch-all { pointer-events: visiblePainted; cursor: pointer; transform-origin: 120px 0; animation: bh-chsway 4s ease-in-out infinite alternate; }
  @keyframes bh-chsway { from { transform: rotate(-1.5deg); } to { transform: rotate(1.5deg); } }
  .scene-banners .bh-chand .flame { transform-box: fill-box; transform-origin: 50% 100%; animation: bh-flick .35s ease-in-out infinite alternate; }
  @keyframes bh-flick { from { transform: scale(1, 1) rotate(-3deg); } to { transform: scale(.88, 1.12) rotate(3deg); } }
  .scene-banners .bh-chand .glowc { opacity: .4; transition: opacity .3s, transform .3s; transform-box: fill-box; transform-origin: 50% 50%; }
  .scene-banners .bh-chand.flare .flame { animation: bh-flare .22s ease-in-out infinite alternate; }
  @keyframes bh-flare { from { transform: scale(1.5, 1.7); } to { transform: scale(1.8, 2.2) rotate(4deg); } }
  .scene-banners .bh-chand.flare .glowc { opacity: 1; transform: scale(1.8); }

  /* armor */
  .scene-banners .bh-armor { left: 28px; top: 252px; width: 140px; height: 300px; }
  .scene-banners .bh-armor .visor { transform-box: fill-box; transform-origin: 50% 0%; transition: transform .35s cubic-bezier(.3,1.8,.5,1); }
  .scene-banners .bh-armor.open .visor { transform: translateY(-16px) scaleY(.32); }
  .scene-banners .bh-armor .peek-eyes { opacity: 0; transition: opacity .2s .1s; }
  .scene-banners .bh-armor.open .peek-eyes { opacity: 1; }
  .scene-banners .bh-armor .arm-in { transform-origin: 70px 296px; }
  .scene-banners .bh-armor .arm-in.wob { animation: bh-wob .6s ease-in-out; }
  @keyframes bh-wob { 25% { transform: rotate(-4deg); } 50% { transform: rotate(3deg); } 75% { transform: rotate(-2deg); } }

  /* dog */
  .scene-banners .bh-dog { left: 900px; top: 640px; width: 150px; height: 80px; }
  .scene-banners .bh-dog .tail { transform-origin: 30px 54px; animation: bh-wag .7s ease-in-out infinite alternate; }
  @keyframes bh-wag { from { transform: rotate(-14deg); } to { transform: rotate(18deg); } }
  .scene-banners .bh-dog.happy .tail { animation-duration: .11s; }
  .scene-banners .bh-dog .head { transform-origin: 112px 60px; }
  .scene-banners .bh-dog.happy .head { animation: bh-bob .28s ease-in-out 4 alternate; }
  @keyframes bh-bob { to { transform: translateY(-7px) rotate(-6deg); } }
  .scene-banners .bh-dog .tongue { display: none; }
  .scene-banners .bh-dog.happy .tongue { display: inline; }
  .scene-banners .bh-woof { position: absolute; z-index: 6; pointer-events: none; font: 800 32px ${FONT}; color: #fff;
    -webkit-text-stroke: 2px ${INK}; paint-order: stroke fill; text-shadow: 0 3px 0 ${INK}; animation: bh-woof 1.1s ease-out forwards; }
  @keyframes bh-woof { from { transform: translateY(10px) scale(.4); opacity: 0; } 25% { transform: translateY(-8px) scale(1.15); opacity: 1; } 75% { opacity: 1; } to { transform: translateY(-40px) scale(1); opacity: 0; } }

  /* mouse */
  .scene-banners .bh-mouse { left: 166px; top: 452px; width: 92px; height: 96px; }
  .scene-banners .bh-mhole { position: absolute; left: 10px; top: 34px; width: 72px; height: 62px; overflow: hidden; border-radius: 36px 36px 0 0; }
  .scene-banners .bh-mhole svg { position: absolute; left: 0; top: 0; transform: translateY(66px); transition: transform .3s cubic-bezier(.3,1.5,.5,1); }
  .scene-banners .bh-mouse.out .bh-mhole svg { transform: translateY(4px); }

  /* basket */
  .scene-banners .bh-basket { left: 1150px; top: 640px; width: 120px; height: 80px; }
  .scene-banners .bh-basket .yarn { transform-box: fill-box; transform-origin: 50% 100%; }
  .scene-banners .bh-basket .yarn.hop { animation: bh-yhop .55s cubic-bezier(.3,1.5,.5,1); }
  @keyframes bh-yhop { 40% { transform: translateY(-26px) rotate(160deg); } }

  /* Lady Lark */
  .scene-banners .bh-lark { left: 1068px; top: 318px; width: 200px; height: 400px; }
  .scene-banners .bh-lark.hop { animation: bh-hop .5s; }
  @keyframes bh-hop { 40% { transform: translateY(-18px); } }
  .scene-banners .bh-lark .lk-body { transform-origin: 100px 400px; animation: bh-breathe 3.4s ease-in-out infinite; }
  @keyframes bh-breathe { 50% { transform: scale(1.015, .985); } }
  .scene-banners .bh-lark .lk-veil { transform-origin: 124px 14px; animation: bh-veil 3s ease-in-out infinite alternate; }
  @keyframes bh-veil { from { transform: rotate(-2deg); } to { transform: rotate(4deg); } }
  .scene-banners .bh-lark .lk-eyes { transform-origin: 100px 126px; animation: bh-blink 4.2s infinite; }
  @keyframes bh-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
  .scene-banners .bh-lark .lk-arm { transform-origin: 136px 172px; animation: bh-sewarm .8s ease-in-out infinite alternate; }
  @keyframes bh-sewarm { from { transform: rotate(2deg); } to { transform: rotate(-7deg); } }
  .scene-banners .bh-lark .lk-mouth-talk { display: none; transform-origin: 100px 148px; }
  .scene-banners .bh-lark.talking .lk-mouth-talk { display: inline; animation: bh-talk .2s infinite alternate; }
  .scene-banners .bh-lark.talking .lk-mouth-smile { display: none; }
  @keyframes bh-talk { from { transform: scaleY(.4); } to { transform: scaleY(1.1); } }

  /* garlands */
  .scene-banners .bh-garland { position: absolute; left: 0; top: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 2; transform-origin: 640px 150px; }
  .scene-banners .bh-rope { position: absolute; left: 0; top: 0; }
  .scene-banners .bh-flag { position: absolute; width: 100px; height: 140px; pointer-events: auto; cursor: pointer; }
  .scene-banners .bh-flag.drop { animation: bh-drop .7s cubic-bezier(.3,1.4,.5,1) both; }
  @keyframes bh-drop { from { transform: translateY(-260px); opacity: 0; } 40% { opacity: 1; } }
  .scene-banners .bh-fin { width: 100%; height: 100%; transform-origin: 50% 7%; animation: bh-sway 2.6s ease-in-out infinite alternate; }
  .scene-banners .bh-fin svg, .scene-banners .bh-cin svg { width: 100%; height: 100%; display: block; overflow: visible; }
  @keyframes bh-sway { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
  .scene-banners .bh-fin.cheer { animation: bh-cheer .75s ease-out; }
  @keyframes bh-cheer { 30% { transform: translateY(-30px) rotate(-10deg) scale(1.12); } 60% { transform: translateY(0) rotate(6deg); } 80% { transform: rotate(-3deg); } }
  .scene-banners .bh-slot .bh-fin { animation: bh-slotpulse 1.2s ease-in-out infinite; }
  @keyframes bh-slotpulse { 50% { transform: scale(1.07); } }
  .scene-banners .bh-slot.hover .bh-fin { animation: none; transform: scale(1.15); filter: drop-shadow(0 0 10px #fff59a) drop-shadow(0 0 20px #ffd23f); }
  .scene-banners .bh-flag.sewn .bh-fin { animation: bh-sewn .6s cubic-bezier(.3,1.6,.5,1); }
  @keyframes bh-sewn { from { transform: scale(.4) rotate(-20deg); } }
  .scene-banners .bh-needle { position: absolute; z-index: 6; pointer-events: none; animation: bh-sew 1s ease-in-out forwards; }
  @keyframes bh-sew { 0% { transform: translate(-40px,-20px) rotate(-20deg); opacity: 0; } 12% { opacity: 1; }
    30% { transform: translate(0,24px) rotate(10deg); } 50% { transform: translate(30px,-18px) rotate(-15deg); }
    70% { transform: translate(55px,26px) rotate(10deg); } 88% { opacity: 1; } 100% { transform: translate(95px,-34px) rotate(-25deg); opacity: 0; } }

  /* choices */
  .scene-banners .bh-rod { position: absolute; left: 0; top: 0; pointer-events: none; z-index: 1; }
  .scene-banners .bh-pins { position: absolute; left: 0; top: 0; pointer-events: none; z-index: 4; }
  .scene-banners .bh-choice { position: absolute; width: 120px; height: 168px; z-index: 3; transition: opacity .3s; }
  .scene-banners .bh-choice.gone { opacity: 0; pointer-events: none; }
  .scene-banners .bh-cpop { width: 100%; height: 100%; animation: bh-cpop .5s cubic-bezier(.3,1.6,.5,1) backwards; }
  @keyframes bh-cpop { from { transform: scale(0) rotate(-30deg); } }
  .scene-banners .bh-cin { width: 100%; height: 100%; transform-origin: 50% 7%; animation: bh-sway 2.2s ease-in-out infinite alternate; transition: opacity .3s, filter .3s; }
  .scene-banners .bh-choice:hover .bh-cin { filter: brightness(1.08) drop-shadow(0 6px 4px rgba(0,0,0,.25)); }
  .scene-banners .bh-cin.flutter { animation: bh-flutter .65s ease-in-out; }
  @keyframes bh-flutter { 15% { transform: rotate(-16deg); } 35% { transform: rotate(13deg); } 55% { transform: rotate(-8deg); } 75% { transform: rotate(5deg); } }
  .scene-banners .bh-choice.tried .bh-cin { opacity: .62; }
  .scene-banners .bh-choice.hint .bh-cin { opacity: 1; filter: drop-shadow(0 0 10px #fff59a) drop-shadow(0 0 22px #ffd23f); animation: bh-hint 1s ease-in-out infinite; }
  @keyframes bh-hint { 50% { transform: scale(1.08) rotate(2deg); } }
  `;

  /* ------------------------------------------------------------------
     The room
     ------------------------------------------------------------------ */
  Castle.registerRoom({
    id: 'banners',
    title: 'Banner Hall',
    jewel: 'emerald',

    enter(root, api) {
      const D = Math.max(1, Math.min(3, Number(api.difficulty) || 1));
      const key = it => it.c + '|' + it.s + '|' + (it.n || 1);
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

      root.appendChild(api.el('style', { text: CSS }));
      root.appendChild(api.svg(backgroundSVG()));

      /* ---------- Lady Lark + speech ---------- */
      const lark = api.el('div', { class: 'bh-x bh-lark', html: larkSVG() });
      let talkTok = 0;
      function larkSay(text) {
        const tok = ++talkTok;
        lark.classList.add('talking');
        return api.say(text, { who: 'Lady Lark', pitch: 1.4, rate: 0.95 }).then(() => {
          if (tok === talkTok) lark.classList.remove('talking');
        });
      }
      function retrigger(node, cls, ms) {
        node.classList.remove(cls);
        void node.getBoundingClientRect();
        node.classList.add(cls);
        if (ms) api.setTimeout(() => node.classList.remove(cls), ms);
      }
      function tone(f, d, o) {
        try { if (api.alive && window.Castle && Castle.tone) Castle.tone(f, d, o); } catch (e) { /* no audio */ }
      }

      /* ---------- Tappable extras ---------- */
      const chand = api.el('div', { class: 'bh-x bh-chand', html: chandelierSVG() });
      const armor = api.el('div', { class: 'bh-x bh-armor', html: armorSVG() });
      const mouse = api.el('div', { class: 'bh-x bh-mouse' }, api.el('div', { class: 'bh-mhole', html: mouseSVG() }));
      const dog = api.el('div', { class: 'bh-x bh-dog', html: dogSVG() });
      const basket = api.el('div', { class: 'bh-x bh-basket', html: basketSVG() });
      root.append(chand, armor, mouse, dog, lark, basket);

      let flareT = null;
      api.on(chand, 'click', () => {
        api.sfx('sparkle'); api.note('E6', 0.7, 'bell');
        chand.classList.add('flare');
        if (flareT) clearTimeout(flareT);
        flareT = api.setTimeout(() => chand.classList.remove('flare'), 1800);
      });

      let visorT = null;
      api.on(armor, 'click', () => {
        api.sfx('boing');
        retrigger(armor.querySelector('.arm-in'), 'wob', 650);
        armor.classList.add('open');
        api.setTimeout(() => { if (armor.classList.contains('open')) api.sfx('giggle'); }, 450);
        if (visorT) clearTimeout(visorT);
        visorT = api.setTimeout(() => { armor.classList.remove('open'); api.sfx('click'); }, 2200);
      });

      let mouseT = null;
      function peek(squeak) {
        mouse.classList.add('out');
        if (squeak) {
          tone(1900, 0.1, { type: 'sine', slide: 2600, vol: 0.09 });
          tone(2100, 0.12, { type: 'sine', slide: 2900, vol: 0.09, delay: 0.16 });
        }
        if (mouseT) clearTimeout(mouseT);
        mouseT = api.setTimeout(() => mouse.classList.remove('out'), squeak ? 2200 : 1500);
      }
      api.on(mouse, 'click', () => peek(true));
      api.setInterval(() => { if (Math.random() < 0.45 && !mouse.classList.contains('out')) peek(false); }, 4200);

      let dogT = null;
      api.on(dog, 'click', () => {
        tone(620, 0.13, { type: 'sawtooth', slide: 300, vol: 0.13, lowpass: 1300 });
        tone(580, 0.15, { type: 'sawtooth', slide: 270, vol: 0.13, lowpass: 1300, delay: 0.22 });
        dog.classList.remove('happy'); void dog.getBoundingClientRect(); dog.classList.add('happy');
        if (dogT) clearTimeout(dogT);
        dogT = api.setTimeout(() => dog.classList.remove('happy'), 1600);
        const woof = api.el('div', { class: 'bh-woof', text: 'Woof!', style: { left: '990px', top: '596px' } });
        root.appendChild(woof);
        api.setTimeout(() => woof.remove(), 1150);
      });

      api.on(basket, 'click', () => {
        api.sfx('pop');
        basket.querySelectorAll('.yarn').forEach((y, i) => api.setTimeout(() => {
          retrigger(y, 'hop', 600); api.note(['G5', 'B5', 'D6'][i], 0.25, 'pluck');
        }, i * 110));
      });

      let celebrating = false;
      const LARK_FUN = ['I love sewing flags!', 'Snip, snip! Stitch, stitch!', 'The King loves bright colors!', 'Tee-hee! That tickles!'];
      api.on(lark, 'click', () => {
        retrigger(lark, 'hop', 520);
        if (!celebrating) larkSay(api.pick(LARK_FUN));
      });

      /* ---------- HUD bits ---------- */
      root.appendChild(api.el('div', { class: 'room-title', text: 'Banner Hall' }));
      const dots = [0, 1, 2].map(() => api.el('span'));
      root.appendChild(api.el('div', { class: 'round-dots' }, dots));

      /* ---------- Puzzle generation ---------- */
      function orderedFirst(list, preferred) {
        const a = api.shuffle(list.filter(x => preferred.includes(x)));
        const b = api.shuffle(list.filter(x => !preferred.includes(x)));
        return a.concat(b);
      }
      function makeChoices(answer, unit, n, withSym) {
        const ak = key(answer);
        const others = api.shuffle(unit.filter(u => key(u) !== ak));
        const muts = [];
        if (withSym) {
          const unitSyms = unit.map(u => u.s), unitCols = unit.map(u => u.c);
          const s2 = orderedFirst(SYMBOLS.filter(s => s !== answer.s), unitSyms);
          const c2 = orderedFirst(COLOR_IDX.filter(c => c !== answer.c), unitCols);
          const a = [{ c: answer.c, s: s2[0], n: 1 }, { c: c2[0], s: answer.s, n: 1 }];
          api.shuffle(a).forEach(m => muts.push(m));
          muts.push({ c: answer.c, s: s2[1], n: 1 }, { c: c2[1], s: answer.s, n: 1 });
        } else {
          const unitCols = unit.map(u => u.c);
          api.shuffle(COLOR_IDX.filter(c => !unitCols.includes(c))).forEach(c => muts.push({ c, s: null, n: 1 }));
        }
        const picked = [], seen = new Set([ak]);
        const add = it => { const k = key(it); if (!seen.has(k) && picked.length < n - 1) { seen.add(k); picked.push(it); } };
        others.slice(0, Math.max(1, n - 2)).forEach(add);
        muts.forEach(add);
        others.forEach(add);
        return api.shuffle(picked.concat([answer])).map(it => ({ item: it, correct: key(it) === ak }));
      }
      function makeRepeat(tpl, o) {
        const letters = [];
        for (const ch of tpl) if (!letters.includes(ch)) letters.push(ch);
        const cols = api.shuffle(COLOR_IDX).slice(0, letters.length);
        const syms = api.shuffle(SYMBOLS).slice(0, letters.length);
        const unit = letters.map((L, i) => ({ c: cols[i], s: o.sym ? syms[i] : null, n: 1 }));
        const byL = {};
        letters.forEach((L, i) => { byL[L] = unit[i]; });
        const len = api.pick(LENS[tpl]);
        const U = tpl.length;
        const seq = [];
        for (let i = 0; i < len; i++) seq.push(byL[tpl[i % U]]);
        const missing = o.middle ? U + api.rand(len - 1 - U) : len - 1;
        const answer = seq[missing];
        return {
          kind: 'repeat', tpl, seq, missing, answer, sym: o.sym, middle: missing !== len - 1,
          choices: makeChoices(answer, unit, o.n, o.sym), colorsKey: cols.slice().sort().join(','),
        };
      }
      function makeGrow(middle) {
        const c = api.rand(COLORS.length), s = api.pick(SYMBOLS);
        const len = middle ? 5 : api.pick([4, 5]);
        const seq = [];
        for (let i = 0; i < len; i++) seq.push({ c, s, n: i + 1 });
        const missing = middle ? 1 + api.rand(len - 2) : len - 1;
        const a = missing + 1;
        const answer = seq[missing];
        const counts = api.shuffle([a - 1, a + 1].filter(k => k >= 1 && k <= 6));
        if (counts.length < 2 && a + 2 <= 6) counts.push(a + 2);
        const pool = counts.map(k => ({ c, s, n: k }));
        pool.push({ c, s: api.pick(SYMBOLS.filter(x => x !== s)), n: a });
        pool.push({ c: api.pick(COLOR_IDX.filter(x => x !== c)), s, n: a });
        const picked = [], seen = new Set([key(answer)]);
        pool.forEach(it => { const k = key(it); if (!seen.has(k) && picked.length < 3) { seen.add(k); picked.push(it); } });
        return {
          kind: 'grow', seq, missing, answer, sym: true, s, middle: missing !== len - 1,
          choices: api.shuffle(picked.concat([answer])).map(it => ({ item: it, correct: key(it) === key(answer) })),
        };
      }
      function makePlan() {
        const byOrder = order => (x, y) => order.indexOf(x) - order.indexOf(y);
        if (D === 1) {
          const out = [];
          for (let r = 0; r < 3; r++) {
            let p, tries = 0;
            do { p = makeRepeat('AB', { sym: false, n: 3, middle: false }); }
            while (r > 0 && p.colorsKey === out[r - 1].colorsKey && ++tries < 8);
            out.push(p);
          }
          return out;
        }
        if (D === 2) {
          const order = ['AB', 'AAB', 'ABB', 'ABC'];
          return api.shuffle(order).slice(0, 3).sort(byOrder(order))
            .map((t, r) => makeRepeat(t, { sym: true, n: r === 0 ? 3 : 4, middle: false }));
        }
        const order = ['ABC', 'AABB', 'GROW', 'ABCD'];
        const m = 1 + api.rand(2);
        return api.shuffle(order).slice(0, 3).sort(byOrder(order)).map((t, r) => {
          const middle = r === m || (r > 0 && Math.random() < 0.35);
          return t === 'GROW' ? makeGrow(middle) : makeRepeat(t, { sym: true, n: 4, middle });
        });
      }

      function word(it, P) {
        if (P.kind === 'grow') return NUM[it.n] + ' ' + (it.n === 1 ? it.s : PLURAL[it.s]);
        return COLORS[it.c].name + (it.s ? ' ' + it.s : '');
      }
      function patternText(P) { return cap(P.seq.map(it => word(it, P)).join(', ')) + '!'; }
      function instruction(P, r) {
        let t;
        if (P.kind === 'grow') {
          t = P.middle ? `The ${PLURAL[P.s]} grow and grow. One flag is missing! Which one fits?`
                       : `Look! The ${PLURAL[P.s]} keep growing. What comes next?`;
        } else if (!P.sym) t = 'What color comes next?';
        else if (P.middle) t = 'Oh no, a flag fell off! Which one goes in the gap?';
        else t = 'Which flag comes next?';
        const pre = ['', 'Another garland! ', 'Last one! '][r];
        return pre + t + (r === 0 ? ' Drag it to the empty spot!' : '');
      }

      /* ---------- Garland ---------- */
      function buildGarland(P) {
        const N = P.seq.length;
        const gEl = api.el('div', { class: 'bh-garland' });
        gEl.appendChild(api.svg(`<svg class="bh-rope" viewBox="0 0 1280 720" width="1280" height="720">
          <path d="M${ROPE_X0} ${ROPE_Y} Q640 230 ${ROPE_X1} ${ROPE_Y}" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>
          <path d="M${ROPE_X0} ${ROPE_Y} Q640 230 ${ROPE_X1} ${ROPE_Y}" stroke="#d9b178" stroke-width="4.5" fill="none" stroke-dasharray="7 5"/>
          <circle cx="${ROPE_X0}" cy="${ROPE_Y}" r="10" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
          <circle cx="${ROPE_X1}" cy="${ROPE_Y}" r="10" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
        </svg>`));
        const g = { el: gEl, fins: [], slot: null, P };
        for (let i = 0; i < N; i++) {
          const cx = 640 + (i - (N - 1) / 2) * FLAG_GAP;
          const isSlot = i === P.missing;
          const fin = api.el('div', {
            class: 'bh-fin', html: isSlot ? slotSVG() : flagSVG(P.seq[i]),
            style: { animationDelay: (-Math.random() * 2.6).toFixed(2) + 's', animationDuration: (2.3 + Math.random() * 0.7).toFixed(2) + 's' },
          });
          const flag = api.el('div', {
            class: 'bh-flag drop' + (isSlot ? ' bh-slot' : ''),
            style: { left: (cx - 50) + 'px', top: (ropeY(cx) - 10) + 'px', animationDelay: (i * 70) + 'ms' },
          }, fin);
          gEl.appendChild(flag);
          g.fins.push(fin);
          if (isSlot) g.slot = flag;
          api.setTimeout(() => api.note(SCALE[i], 0.22, 'pluck'), 120 + i * 70);
          api.on(flag, 'click', () => {
            if (flag.classList.contains('bh-slot')) {
              if (cur && !cur.solved && cur.g === g) larkSay(instruction(P, cur.r).replace(/^(Another garland! |Last one! )/, ''));
              return;
            }
            retrigger(fin, 'cheer', 760);
            api.note(SCALE[i], 0.3, 'pluck');
          });
        }
        root.appendChild(gEl);
        return g;
      }
      function cheerWave(g, delay) {
        g.fins.forEach((fin, i) => api.setTimeout(() => {
          retrigger(fin, 'cheer', 760);
          api.note(SCALE[i], 0.25, 'pluck');
        }, (delay || 0) + i * 100));
      }

      /* ---------- Choices ---------- */
      function buildChoices(P, g) {
        const n = P.choices.length;
        const centers = n === 3 ? [480, 640, 800] : [400, 560, 720, 880];
        const x0 = centers[0] - 100, x1 = centers[n - 1] + 100;
        const els = [];
        const post = x => `<rect x="${x - 7}" y="386" width="14" height="174" rx="5" fill="#b5763c" stroke="${INK}" stroke-width="4"/>
          <rect x="${x - 22}" y="554" width="44" height="12" rx="5" fill="#7d4a1f" stroke="${INK}" stroke-width="4"/>`;
        const rod = api.svg(`<svg class="bh-rod" viewBox="0 0 1280 720" width="1280" height="720">
          ${post(x0)}${post(x1)}
          <rect x="${x0 - 16}" y="386" width="${x1 - x0 + 32}" height="12" rx="6" fill="#b5763c" stroke="${INK}" stroke-width="4"/>
          <circle cx="${x0 - 16}" cy="392" r="9" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
          <circle cx="${x1 + 16}" cy="392" r="9" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
        </svg>`);
        const pins = api.svg(`<svg class="bh-pins" viewBox="0 0 1280 720" width="1280" height="720">
          ${centers.slice(0, n).map(cx => `<rect x="${cx - 7}" y="378" width="14" height="32" rx="4" fill="#f0c48a" stroke="${INK}" stroke-width="3"/>
            <path d="M${cx} 382 V406" stroke="${INK}" stroke-width="2"/><circle cx="${cx}" cy="393" r="3" fill="#ccc" stroke="${INK}" stroke-width="1.5"/>`).join('')}
        </svg>`);
        root.append(rod, pins);
        els.push(rod, pins);

        const choices = P.choices.map((ch, i) => {
          const cin = api.el('div', { class: 'bh-cin', html: flagSVG(ch.item), style: { animationDelay: (-Math.random() * 2).toFixed(2) + 's' } });
          const pop = api.el('div', { class: 'bh-cpop', style: { animationDelay: (P.seq.length * 70 + 250 + i * 120) + 'ms' } }, cin);
          const node = api.el('div', { class: 'bh-choice', style: { left: (centers[i] - 60) + 'px', top: '394px' } }, pop);
          root.appendChild(node);
          els.push(node);
          const c = { node, cin, correct: ch.correct, item: ch.item, busy: false, downX: 0, downY: 0 };
          api.on(node, 'pointerdown', e => { const p = api.toStage(e.clientX, e.clientY); c.downX = p.x; c.downY = p.y; });
          c.handle = api.draggable(node, {
            enabled: () => !!cur && !cur.solved && !c.busy,
            onMove: m => { if (g.slot) g.slot.classList.toggle('hover', api.hitTest(m.x, m.y, g.slot, 40)); },
            onDrop: d => handleDrop(c, d, g),
          });
          return c;
        });
        api.setTimeout(() => {
          choices.forEach((c, i) => api.setTimeout(() => api.sfx('pop'), i * 120));
        }, P.seq.length * 70 + 250);
        return { els, choices };
      }

      /* ---------- Round state + answers ---------- */
      let cur = null;
      const garlands = [];
      const WRONG = D === 1
        ? ['Hmm, look at the colors. Try again!', 'Oops! Not that one. Look again!', 'So close! Try another flag.']
        : ['Hmm, not that one. Look again!', 'Oops! That flag goes somewhere else.', 'So close! Try another flag.', "Let's look at the pattern again."];
      const PRAISE = ['Beautiful!', 'Perfect stitches!', 'Lovely!', 'You did it!', 'Wonderful!'];

      function handleDrop(c, d, g) {
        g.slot.classList.remove('hover');
        if (!cur || cur.solved || cur.g !== g) { d.back(); return; }
        const tap = Math.hypot(d.x - c.downX, d.y - c.downY) < 14;
        const onSlot = api.hitTest(d.x, d.y, g.slot, 40);
        if (!tap && !onSlot) { d.back(); api.sfx('drop'); return; }
        cur.interacted = true;
        if (c.correct) { onCorrect(c, d, g); return; }
        c.busy = true;
        if (tap) {
          d.snapTo(g.slot);
          api.setTimeout(() => { d.back(); onWrong(c); }, 330);
        } else {
          d.back(); onWrong(c);
        }
        api.setTimeout(() => { c.busy = false; }, tap ? 800 : 450);
      }

      function onWrong(c) {
        if (!cur || cur.solved) return;
        api.sfx('wrong');
        retrigger(c.cin, 'flutter', 680);
        c.node.classList.add('tried');
        cur.misses++;
        if (cur.misses >= 2 && !cur.hinted) {
          cur.hinted = true;
          const right = cur.choices.find(x => x.correct);
          if (right) right.node.classList.add('hint');
          larkSay('Psst! Try the sparkly one!');
        } else {
          larkSay(api.pick(WRONG));
        }
      }

      async function onCorrect(c, d, g) {
        const R = cur;
        R.solved = true;
        celebrating = true;
        R.choices.forEach(x => { if (x !== c) x.node.classList.add('gone'); });
        d.snapTo(g.slot);
        d.lock();
        api.sfx('drop');
        await api.wait(260);
        // stitch the flag into the garland
        c.node.style.opacity = '0';
        const slotFin = g.slot.querySelector('.bh-fin');
        slotFin.innerHTML = flagSVG(R.P.answer);
        g.slot.classList.remove('bh-slot', 'hover');
        retrigger(g.slot, 'sewn', 650);
        const r = api.stageRect(g.slot);
        const needle = api.el('div', { class: 'bh-needle', html: needleSVG(), style: { left: (r.x - 10) + 'px', top: (r.y + 50) + 'px' } });
        root.appendChild(needle);
        api.setTimeout(() => needle.remove(), 1050);
        for (let i = 0; i < 6; i++) api.setTimeout(() => api.sfx('click'), 80 + i * 130);
        await api.wait(850);
        api.sfx('correct');
        api.sparkleAt(g.slot);
        cheerWave(g, 150);
        api.celebrate(r.cx, r.cy, 50);
        await larkSay(api.pick(PRAISE) + ' ' + patternText(R.P));
        dots[R.r].classList.add('done');
        api.sfx('chime');
        await api.wait(600);
        celebrating = false;
        R.resolve();
      }

      async function playRound(r, P) {
        const g = buildGarland(P);
        garlands.push(g);
        const area = buildChoices(P, g);
        const R = { r, P, g, solved: false, misses: 0, hinted: false, interacted: false, choices: area.choices };
        cur = R;
        const done = new Promise(res => { R.resolve = res; });
        (async () => {
          await api.wait(P.seq.length * 70 + 500);
          if (cur !== R || R.solved) return;
          if (r === 0) {
            await larkSay("Hello! I'm Lady Lark. Help me sew flags for the King's party!");
            if (cur !== R || R.solved || R.interacted) return;
          }
          larkSay(instruction(P, r));
        })();
        await done;
        // tidy away the choices
        area.els.forEach(n => { n.style.transition = 'opacity .4s'; n.style.opacity = '0'; });
        api.setTimeout(() => area.els.forEach(n => n.remove()), 450);
        if (r < 2) {
          await api.wait(200);
          api.sfx('whoosh');
          g.el.style.transition = 'transform .9s cubic-bezier(.5,-0.3,.7,.4)';
          g.el.style.transform = 'translateY(-560px)';
          await api.wait(950);
        }
      }

      async function finale() {
        celebrating = true;
        cur = null;
        const rows = [165, 300, 435], s = 0.72;
        garlands.forEach((g, i) => api.setTimeout(() => {
          g.el.style.transition = 'transform 1.1s cubic-bezier(.3,1.25,.5,1)';
          g.el.style.transform = `translateY(${rows[i] - ROPE_Y}px) scale(${s})`;
          api.sfx('whoosh');
        }, 300 + i * 450));
        await api.wait(2000);
        garlands.forEach((g, i) => cheerWave(g, i * 350));
        api.celebrate(400, 260, 60);
        api.setTimeout(() => api.celebrate(880, 260, 60), 350);
        api.setTimeout(() => api.celebrate(640, 380, 70), 700);
        api.sfx('sparkle');
        await larkSay("Look at the great hall! It's ready for the King's party. Thank you!");
        await api.wait(500);
        api.complete();
      }

      (async () => {
        const plan = makePlan();
        await api.wait(350);
        for (let r = 0; r < 3; r++) await playRound(r, plan[r]);
        await finale();
      })();
    },

    exit() {},
  });
})();
