/* =====================================================================
   Castle Quest — Royal Kitchen (counting puzzle)
   Cook Clementine is making the King's soup. Follow the picture recipe
   card: drag (or tap) the right number of each ingredient into the pot.
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#3a2a1a';
  const K = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const NUM = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  const BROTH = '#f2c46b';
  const GOLD = '#ffe066';

  /* ------------------------------------------------------------------
     Ingredients
     ------------------------------------------------------------------ */
  const ING = {
    carrot:   { one: 'carrot',   many: 'carrots',   soup: '#f59a3c' },
    tomato:   { one: 'tomato',   many: 'tomatoes',  soup: '#ef5a3c' },
    mushroom: { one: 'mushroom', many: 'mushrooms', soup: '#c99a6b' },
    onion:    { one: 'onion',    many: 'onions',    soup: '#c98bd6' },
    potato:   { one: 'potato',   many: 'potatoes',  soup: '#e6c38a' },
    peapod:   { one: 'pea pod',  many: 'pea pods',  soup: '#8ed05a' },
    apple:    { one: 'apple',    many: 'apples',    soup: '#c4dc5a' },
    cheese:   { one: 'cheese',   many: 'cheeses',   soup: '#ffd447' },
  };
  const KINDS = Object.keys(ING);
  const nm = (kind, n) => (n === 1 ? ING[kind].one : ING[kind].many);

  function face(cx, cy, w) {
    return `<circle cx="${cx - w}" cy="${cy}" r="4.2" fill="${INK}"/><circle cx="${cx + w}" cy="${cy}" r="4.2" fill="${INK}"/>
      <circle cx="${cx - w + 1.5}" cy="${cy - 1.6}" r="1.5" fill="#fff"/><circle cx="${cx + w + 1.5}" cy="${cy - 1.6}" r="1.5" fill="#fff"/>
      <ellipse cx="${cx - w - 5}" cy="${cy + 7}" rx="4.5" ry="3" fill="#ff7f9a" opacity=".65"/>
      <ellipse cx="${cx + w + 5}" cy="${cy + 7}" rx="4.5" ry="3" fill="#ff7f9a" opacity=".65"/>
      <path d="M${cx - 5} ${cy + 6} Q${cx} ${cy + 11} ${cx + 5} ${cy + 6}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  }

  const ART = {
    carrot: `<g transform="rotate(-18 50 52)">
      <ellipse cx="41" cy="18" rx="6" ry="14" transform="rotate(-28 41 18)" fill="#3fb950" ${K} stroke-width="4"/>
      <ellipse cx="59" cy="18" rx="6" ry="14" transform="rotate(28 59 18)" fill="#3fb950" ${K} stroke-width="4"/>
      <ellipse cx="50" cy="13" rx="6.5" ry="15" fill="#4fcf62" ${K} stroke-width="4"/>
      <path d="M28 34 Q50 24 72 34 Q70 62 53 93 Q50 97 47 93 Q30 62 28 34Z" fill="#ff8c2b" ${K} stroke-width="4.5"/>
      <path d="M34 40 Q34 52 40 62" stroke="#ffc07a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M58 66h8 M46 77h7 M61 54h6" stroke="#c85f10" stroke-width="3" stroke-linecap="round"/>
      ${face(50, 44, 8)}</g>`,
    tomato: `<ellipse cx="50" cy="57" rx="38" ry="33" fill="#f04a35" ${K} stroke-width="4.5"/>
      <path d="M26 46 Q30 34 44 31" stroke="#ff9b8a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M50 18 L55 28 L67 24 L60 33 L68 40 L54 37 L50 45 L46 37 L32 40 L40 33 L33 24 L45 28Z" fill="#3fb950" ${K} stroke-width="3.5"/>
      <path d="M50 21 Q52 12 58 9" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${face(50, 60, 11)}`,
    mushroom: `<path d="M36 54 Q34 80 38 88 Q50 95 62 88 Q66 80 64 54Z" fill="#fff1d6" ${K} stroke-width="4.5"/>
      <path d="M8 58 Q8 16 50 14 Q92 16 92 58 Q50 70 8 58Z" fill="#c8693a" ${K} stroke-width="4.5"/>
      <circle cx="32" cy="38" r="6" fill="#ffe6c4"/><circle cx="56" cy="26" r="5" fill="#ffe6c4"/>
      <circle cx="73" cy="44" r="6.5" fill="#ffe6c4"/><circle cx="47" cy="49" r="4" fill="#ffe6c4"/>
      <path d="M17 46 Q20 30 33 22" stroke="#e8946a" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${face(50, 71, 7)}`,
    onion: `<path d="M50 20 C76 32 90 58 76 80 Q50 96 24 80 C10 58 24 32 50 20Z" fill="#b86ad0" ${K} stroke-width="4.5"/>
      <path d="M50 25 Q30 50 36 86 M50 25 Q70 50 64 86" stroke="#8e3fa8" stroke-width="3" fill="none"/>
      <path d="M26 50 Q24 60 28 68" stroke="#e1b3ef" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M50 22 Q46 10 38 6 M50 22 Q54 8 62 4" stroke="#3fb950" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M44 90 l-2 6 M50 91 v6 M56 90 l2 6" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      ${face(50, 60, 9)}`,
    potato: `<path d="M16 54 C12 32 36 20 58 24 C82 28 92 46 86 64 C80 84 54 88 34 82 C20 78 18 66 16 54Z" fill="#d29b5e" ${K} stroke-width="4.5"/>
      <ellipse cx="29" cy="45" rx="3" ry="2.2" fill="#8a5a2b"/><ellipse cx="76" cy="44" rx="3" ry="2.2" fill="#8a5a2b"/>
      <ellipse cx="71" cy="74" rx="3" ry="2.2" fill="#8a5a2b"/><ellipse cx="32" cy="70" rx="2.6" ry="2" fill="#8a5a2b"/>
      <path d="M28 34 Q38 28 50 28" stroke="#ecc492" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${face(52, 54, 10)}`,
    peapod: `<path d="M94 40 Q100 30 95 21" stroke="#3a8a2a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M6 54 Q46 16 94 40 Q66 84 6 54Z" fill="#5cb83a" ${K} stroke-width="4.5"/>
      <path d="M13 52 Q50 32 88 42 Q62 70 13 52Z" fill="#b6e87e" ${K} stroke-width="3"/>
      <circle cx="30" cy="51" r="9" fill="#7fd04a" ${K} stroke-width="3"/>
      <circle cx="50" cy="49" r="10.5" fill="#7fd04a" ${K} stroke-width="3"/>
      <circle cx="70" cy="47" r="9" fill="#7fd04a" ${K} stroke-width="3"/>
      <circle cx="27" cy="50" r="1.8" fill="${INK}"/><circle cx="33" cy="50" r="1.8" fill="${INK}"/>
      <circle cx="67" cy="46" r="1.8" fill="${INK}"/><circle cx="73" cy="46" r="1.8" fill="${INK}"/>
      <circle cx="46" cy="47" r="2.3" fill="${INK}"/><circle cx="54" cy="47" r="2.3" fill="${INK}"/>
      <path d="M46 52 Q50 56 54 52" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M20 66 Q46 74 74 62" stroke="#3a8a2a" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    apple: `<path d="M50 32 C32 16 8 28 12 56 C16 82 36 94 50 86 C64 94 84 82 88 56 C92 28 68 16 50 32Z" fill="#8fd14f" ${K} stroke-width="4.5"/>
      <path d="M50 32 Q49 18 56 8" stroke="#7d4a1f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M56 18 Q70 6 81 14 Q70 26 56 18Z" fill="#3fb950" ${K} stroke-width="3.5"/>
      <path d="M22 48 Q22 37 31 32" stroke="#d6f5a8" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${face(50, 58, 11)}`,
    cheese: `<path d="M10 60 L74 30 L92 46 Z" fill="#ffe680" ${K} stroke-width="4.5"/>
      <path d="M10 60 L92 46 L92 78 L10 88Z" fill="#ffc928" ${K} stroke-width="4.5"/>
      <ellipse cx="24" cy="77" rx="5" ry="4" fill="#e0a300"/><ellipse cx="81" cy="59" rx="4" ry="5" fill="#e0a300"/>
      <ellipse cx="72" cy="79" rx="4" ry="3" fill="#e0a300"/><ellipse cx="62" cy="40" rx="5" ry="3" fill="#f2c94c"/>
      ${face(50, 65, 9)}`,
  };
  function ingSVG(kind, size, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 100 100" width="${size}" height="${size}">${ART[kind]}</svg>`;
  }

  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) {
    const A = hexRgb(a), B = hexRgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  /* ------------------------------------------------------------------
     Art: baskets, pots, characters
     ------------------------------------------------------------------ */
  const BASKET_BACK = `<svg class="k-bk" viewBox="0 0 120 54" width="120" height="54">
    <ellipse cx="60" cy="10" rx="56" ry="10" fill="#7a4a1e" ${K} stroke-width="4"/></svg>`;
  const BASKET_FRONT = `<svg class="k-bk" viewBox="0 0 120 54" width="120" height="54">
    <path d="M4 10 Q6 44 22 50 L98 50 Q114 44 116 10 Q60 26 4 10Z" fill="#d9a35b" ${K} stroke-width="4"/>
    <path d="M9 25 Q60 39 111 25 M14 38 Q60 51 106 38" stroke="#a8722f" stroke-width="3" fill="none"/>
    <path d="M30 19 L32 49 M50 22 L51 50 M70 22 L69 50 M90 19 L88 49" stroke="#a8722f" stroke-width="3"/>
    <path d="M4 10 Q60 26 116 10" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M4 10 Q60 26 116 10" stroke="#e8b874" stroke-width="3" fill="none" stroke-dasharray="7 5"/></svg>`;

  const PAN_SVGS = [
    `<svg viewBox="0 0 70 92" width="70" height="92">
      <path d="M35 0 V8" stroke="${INK}" stroke-width="3"/><circle cx="35" cy="12" r="5" fill="none" stroke="${INK}" stroke-width="3"/>
      <rect x="30" y="15" width="10" height="28" rx="4" fill="#7d4a1f" ${K} stroke-width="3.5"/>
      <circle cx="35" cy="64" r="26" fill="#d9823b" ${K} stroke-width="4.5"/>
      <circle cx="35" cy="64" r="18" fill="#b8642a"/>
      <path d="M21 58 Q24 48 34 45" stroke="#ffd0a0" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 70 92" width="70" height="92">
      <path d="M35 0 V12" stroke="${INK}" stroke-width="3"/>
      <path d="M16 32 Q35 2 54 32" stroke="${INK}" stroke-width="4" fill="none"/>
      <rect x="12" y="32" width="46" height="46" rx="11" fill="#e08a40" ${K} stroke-width="4.5"/>
      <rect x="7" y="29" width="56" height="11" rx="5" fill="#f0a35e" ${K} stroke-width="4"/>
      <path d="M21 49 V66" stroke="#ffd0a0" stroke-width="4" stroke-linecap="round"/>
      <path d="M12 60 H58" stroke="#b8642a" stroke-width="3"/></svg>`,
    `<svg viewBox="0 0 70 92" width="70" height="92">
      <path d="M35 0 V8" stroke="${INK}" stroke-width="3"/><circle cx="35" cy="12" r="5" fill="none" stroke="${INK}" stroke-width="3"/>
      <rect x="31" y="16" width="8" height="48" rx="4" fill="#c9c9d6" ${K} stroke-width="3.5"/>
      <path d="M17 62 Q35 96 53 62Z" fill="#c9c9d6" ${K} stroke-width="4"/>
      <path d="M24 68 Q30 78 38 80" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></svg>`,
  ];

  const BIRD_SVG = `<svg viewBox="0 0 60 50" width="60" height="50">
    <path d="M14 30 L2 22 L6 37Z" fill="#1d56a3" ${K} stroke-width="3"/>
    <ellipse cx="28" cy="31" rx="17" ry="13" fill="#2f7fe0" ${K} stroke-width="3.5"/>
    <ellipse cx="33" cy="35" rx="9" ry="7" fill="#ffd9a0"/>
    <circle cx="40" cy="18" r="10" fill="#2f7fe0" ${K} stroke-width="3.5"/>
    <path d="M48 16 L58 20 L48 23Z" fill="#ff8c2b" ${K} stroke-width="2.5"/>
    <circle cx="42" cy="16" r="2.7" fill="${INK}"/><circle cx="43" cy="15" r="1" fill="#fff"/>
    <ellipse cx="36" cy="23" rx="3" ry="2" fill="#ff8fb0" opacity=".8"/>
    <path d="M16 28 Q25 21 33 30 Q24 34 16 28Z" fill="#1d56a3" ${K} stroke-width="3"/>
    <path d="M25 43 V48 M33 43 V48" stroke="#ff8c2b" stroke-width="3" stroke-linecap="round"/></svg>`;

  const FIRE_SVG = `<svg viewBox="0 0 300 150" width="300" height="150">
    <ellipse class="k-ember" cx="150" cy="138" rx="140" ry="14" fill="#ff6a1a" opacity=".7"/>
    <g class="k-flames">
      <path class="k-fl" d="M8 136 C-4 108 10 82 30 60 C32 80 44 84 48 70 C62 96 66 118 58 136Z" fill="#ff8c2b" ${K} stroke-width="4"/>
      <path class="k-fl c" d="M22 134 C16 118 24 104 32 94 C34 106 42 108 44 100 C52 114 50 126 46 134Z" fill="#ffd23f"/>
      <path class="k-fl b" d="M240 136 C232 108 250 82 270 60 C270 80 282 86 288 72 C300 98 300 120 290 136Z" fill="#ff8c2b" ${K} stroke-width="4"/>
      <path class="k-fl" d="M254 134 C250 120 258 108 268 98 C270 110 278 112 280 104 C288 118 286 128 282 134Z" fill="#ffd23f"/>
      <path class="k-fl c" d="M70 138 C50 100 80 62 112 34 C114 62 132 70 140 50 C168 84 180 112 166 138Z" fill="#ff7a1a" ${K} stroke-width="4"/>
      <path class="k-fl b" d="M92 136 C82 112 98 92 114 76 C116 94 128 98 134 88 C148 108 150 124 142 136Z" fill="#ffd23f"/>
      <path class="k-fl" d="M146 138 C134 108 156 80 182 56 C182 78 196 86 204 72 C222 102 220 122 210 138Z" fill="#ff8c2b" ${K} stroke-width="4"/>
      <path class="k-fl c" d="M162 136 C156 118 168 104 180 94 C182 106 190 108 194 100 C202 114 200 128 196 136Z" fill="#ffe680"/>
    </g>
    <rect x="40" y="124" width="220" height="22" rx="11" fill="#8a5a2e" ${K} stroke-width="5" transform="rotate(-5 150 135)"/>
    <rect x="40" y="126" width="220" height="22" rx="11" fill="#a0683a" ${K} stroke-width="5" transform="rotate(5 150 137)"/>
    <ellipse cx="52" cy="128" rx="6" ry="9" fill="#e6b47a" ${K} stroke-width="3" transform="rotate(5 52 128)"/>
    <ellipse cx="250" cy="128" rx="6" ry="9" fill="#e6b47a" ${K} stroke-width="3" transform="rotate(-5 250 128)"/>
    <circle class="k-ember" cx="110" cy="134" r="3.5" fill="#ffd23f"/><circle class="k-ember" cx="180" cy="139" r="3" fill="#ffd23f"/>
    <circle class="k-ember" cx="146" cy="141" r="2.5" fill="#ffe680"/></svg>`;

  const POT_SVG = `<svg viewBox="0 0 320 280" width="320" height="280">
    <path d="M14 92 Q160 -40 306 92" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M14 92 Q160 -40 306 92" fill="none" stroke="#8a8aa0" stroke-width="4" stroke-linecap="round"/>
    <circle cx="14" cy="96" r="10" fill="#5d5d75" ${K} stroke-width="4"/>
    <circle cx="306" cy="96" r="10" fill="#5d5d75" ${K} stroke-width="4"/>
    <ellipse cx="160" cy="80" rx="142" ry="32" fill="#2a2a3a" ${K} stroke-width="6"/>
    <ellipse class="k-soup" cx="160" cy="86" rx="124" ry="22" fill="${BROTH}" ${K} stroke-width="3" style="fill:${BROTH}"/>
    <ellipse cx="124" cy="80" rx="42" ry="6" fill="#fff" opacity=".28"/>
    <circle cx="90" cy="92" r="5" fill="#ff8c2b" stroke="${INK}" stroke-width="2"/>
    <circle cx="232" cy="90" r="4.5" fill="#3fb950" stroke="${INK}" stroke-width="2"/>
    <circle cx="176" cy="96" r="4" fill="#ff8c2b" stroke="${INK}" stroke-width="2"/>
    <circle class="k-bub" cx="110" cy="88" r="8" fill="#fff" fill-opacity=".6" stroke="${INK}" stroke-width="2"/>
    <circle class="k-bub" cx="196" cy="84" r="6" fill="#fff" fill-opacity=".6" stroke="${INK}" stroke-width="2" style="animation-delay:-.7s"/>
    <circle class="k-bub" cx="150" cy="94" r="7" fill="#fff" fill-opacity=".6" stroke="${INK}" stroke-width="2" style="animation-delay:-1.3s"/>
    <circle class="k-bub" cx="70" cy="84" r="5" fill="#fff" fill-opacity=".6" stroke="${INK}" stroke-width="2" style="animation-delay:-.4s"/>
    <path d="M206 94 L264 8" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
    <path d="M206 94 L264 8" stroke="#c4874a" stroke-width="8" stroke-linecap="round"/>
    <path d="M20 80 C12 170 70 250 160 252 C250 250 308 170 300 80 A140 30 0 0 1 20 80 Z" fill="#4b4b63" ${K} stroke-width="6"/>
    <path d="M254 124 C268 172 240 218 186 238" stroke="#2c2c3c" stroke-width="16" fill="none" stroke-linecap="round" opacity=".55"/>
    <path d="M52 124 C52 168 78 206 112 224" stroke="#fff" stroke-opacity=".22" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M18 80 A142 32 0 0 0 302 80" fill="none" stroke="${INK}" stroke-width="21" stroke-linecap="round"/>
    <path d="M18 80 A142 32 0 0 0 302 80" fill="none" stroke="#6d6d88" stroke-width="11" stroke-linecap="round"/>
    <path d="M40 92 A130 26 0 0 0 120 108" fill="none" stroke="#a5a5c0" stroke-width="4" stroke-linecap="round"/>
    <g class="k-pot-eyes">
      <ellipse cx="118" cy="162" rx="13" ry="15" fill="#fff" ${K} stroke-width="4"/>
      <ellipse cx="202" cy="162" rx="13" ry="15" fill="#fff" ${K} stroke-width="4"/>
      <circle cx="121" cy="165" r="6.5" fill="${INK}"/><circle cx="205" cy="165" r="6.5" fill="${INK}"/>
      <circle cx="123" cy="162" r="2.3" fill="#fff"/><circle cx="207" cy="162" r="2.3" fill="#fff"/>
    </g>
    <ellipse cx="94" cy="188" rx="12" ry="7" fill="#ff7f9a" opacity=".5"/>
    <ellipse cx="226" cy="188" rx="12" ry="7" fill="#ff7f9a" opacity=".5"/>
    <path class="k-ms" d="M142 188 Q160 208 178 188 Q160 196 142 188Z" fill="#c0394f" ${K} stroke-width="4"/>
    <ellipse class="k-mo" cx="160" cy="197" rx="13" ry="16" fill="#5a1222" ${K} stroke-width="4"/></svg>`;

  const CAT_SVG = `<svg viewBox="0 0 130 110" width="130" height="110">
    <g class="k-cat-tail">
      <path d="M92 92 Q126 92 122 62 Q120 46 108 50" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M92 92 Q126 92 122 62 Q120 46 108 50" fill="none" stroke="#ff9f43" stroke-width="8" stroke-linecap="round"/>
      <path d="M117 74 l8 -2 M120 61 l7 2" stroke="#d9711a" stroke-width="3" stroke-linecap="round"/>
    </g>
    <ellipse cx="62" cy="80" rx="38" ry="25" fill="#ff9f43" ${K} stroke-width="5"/>
    <path d="M34 72 q6 -6 12 0 M80 68 q6 -6 12 0 M86 82 q5 -5 10 0" stroke="#d9711a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="62" cy="88" rx="17" ry="13" fill="#ffe0b8"/>
    <ellipse cx="46" cy="101" rx="11" ry="7" fill="#ffe0b8" ${K} stroke-width="4"/>
    <ellipse cx="78" cy="101" rx="11" ry="7" fill="#ffe0b8" ${K} stroke-width="4"/>
    <g class="k-cat-head">
      <path d="M34 30 L36 4 L56 20Z" fill="#ff9f43" ${K} stroke-width="4.5"/>
      <path d="M90 30 L88 4 L68 20Z" fill="#ff9f43" ${K} stroke-width="4.5"/>
      <path d="M39 22 L40 11 L49 19Z" fill="#ff9fb8"/><path d="M85 22 L84 11 L75 19Z" fill="#ff9fb8"/>
      <ellipse cx="62" cy="40" rx="32" ry="25" fill="#ff9f43" ${K} stroke-width="5"/>
      <path d="M55 17 L57 26 M62 16 V26 M69 17 L67 26" stroke="#d9711a" stroke-width="3" stroke-linecap="round"/>
      <g class="k-cat-eyes">
        <ellipse cx="50" cy="40" rx="5" ry="7" fill="${INK}"/><ellipse cx="74" cy="40" rx="5" ry="7" fill="${INK}"/>
        <circle cx="52" cy="37" r="2" fill="#fff"/><circle cx="76" cy="37" r="2" fill="#fff"/>
      </g>
      <ellipse cx="41" cy="50" rx="5" ry="3" fill="#ff7f9a" opacity=".6"/><ellipse cx="83" cy="50" rx="5" ry="3" fill="#ff7f9a" opacity=".6"/>
      <path d="M58 48 H66 L62 53Z" fill="#ff7f9a" ${K} stroke-width="2"/>
      <path d="M62 53 Q59 58 55 55 M62 53 Q65 58 69 55" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M40 50 L20 46 M40 54 L20 58 M84 50 L104 46 M84 54 L104 58" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    </g></svg>`;

  const CC_SVG = `<svg viewBox="0 0 180 400" width="180" height="400">
    <ellipse cx="90" cy="394" rx="82" ry="8" fill="${INK}" opacity=".18"/>
    <g class="k-cc-body">
      <ellipse cx="62" cy="386" rx="24" ry="11" fill="#6b3f22" ${K} stroke-width="5"/>
      <ellipse cx="118" cy="386" rx="24" ry="11" fill="#6b3f22" ${K} stroke-width="5"/>
      <path d="M90 194 C34 194 10 258 14 306 C18 356 48 380 90 380 C132 380 162 356 166 306 C170 258 146 194 90 194Z" fill="#5aa7e8" ${K} stroke-width="5"/>
      <path d="M124 216 C142 242 150 282 142 322" stroke="#3f88cc" stroke-width="9" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M56 238 L68 204 M124 238 L112 204" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
      <path d="M56 238 L68 204 M124 238 L112 204" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 236 Q90 226 128 236 L140 336 Q90 368 40 336Z" fill="#fff" ${K} stroke-width="4"/>
      <path d="M90 262 C80 250 68 262 90 278 C112 262 100 250 90 262Z" fill="#e8423f" ${K} stroke-width="3"/>
      <path d="M68 300 H112 V316 Q90 330 68 316Z" fill="#ffe1ea" ${K} stroke-width="3"/>
      <path d="M48 336 Q90 360 132 336" stroke="#ff8fb0" stroke-width="4" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>
      <g class="k-cc-arm2">
        <path d="M146 226 C170 242 176 272 164 292" stroke="${INK}" stroke-width="30" fill="none" stroke-linecap="round"/>
        <path d="M146 226 C170 242 176 272 164 292" stroke="#5aa7e8" stroke-width="21" fill="none" stroke-linecap="round"/>
        <circle cx="161" cy="300" r="13" fill="#ffd9b8" ${K} stroke-width="4"/>
      </g>
      <circle cx="48" cy="150" r="20" fill="#c0522d" ${K} stroke-width="4"/>
      <circle cx="132" cy="150" r="20" fill="#c0522d" ${K} stroke-width="4"/>
      <circle cx="44" cy="174" r="12" fill="#c0522d" ${K} stroke-width="4"/>
      <circle cx="136" cy="174" r="12" fill="#c0522d" ${K} stroke-width="4"/>
      <circle cx="90" cy="150" r="47" fill="#ffd9b8" ${K} stroke-width="5"/>
      <path d="M50 132 Q62 108 90 112 Q118 108 130 132 Q116 122 104 128 Q92 118 78 128 Q64 122 50 132Z" fill="#c0522d" ${K} stroke-width="3"/>
      <path d="M64 134 Q72 129 80 134 M100 134 Q108 129 116 134" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g class="k-cc-eyes">
        <ellipse cx="72" cy="148" rx="6.5" ry="8.5" fill="${INK}"/><ellipse cx="108" cy="148" rx="6.5" ry="8.5" fill="${INK}"/>
        <circle cx="74.5" cy="145" r="2.6" fill="#fff"/><circle cx="110.5" cy="145" r="2.6" fill="#fff"/>
      </g>
      <g class="k-cc-happy">
        <path d="M63 150 Q72 139 81 150 M99 150 Q108 139 117 150" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      </g>
      <ellipse cx="60" cy="168" rx="10" ry="6.5" fill="#ff8fa3" opacity=".75"/>
      <ellipse cx="120" cy="168" rx="10" ry="6.5" fill="#ff8fa3" opacity=".75"/>
      <ellipse cx="90" cy="161" rx="7" ry="5.5" fill="#ffb48f" ${K} stroke-width="3"/>
      <path class="k-cc-mouth" d="M76 174 Q90 190 104 174 Q90 180 76 174Z" fill="#a4313f" ${K} stroke-width="4"/>
      <path d="M70 196 H110 L90 215Z" fill="#e8423f" ${K} stroke-width="4"/>
      <path d="M50 118 L48 72 C28 66 26 34 52 32 C54 8 88 0 98 20 C112 4 146 14 138 42 C160 48 156 78 132 74 L130 118 Z" fill="#fff" ${K} stroke-width="5"/>
      <path d="M68 74 V104 M90 64 V104 M112 70 V104" stroke="#ddd6c6" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="46" y="102" width="88" height="20" rx="7" fill="#f6f1e6" ${K} stroke-width="4"/>
      <g class="k-cc-arm">
        <path d="M19 296 L27 176" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
        <path d="M19 296 L27 176" stroke="#c4874a" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="28" cy="160" rx="14" ry="18" fill="#c4874a" ${K} stroke-width="4"/>
        <ellipse cx="28" cy="158" rx="8" ry="11" fill="#a0683a"/>
        <ellipse class="k-cc-dab" cx="28" cy="158" rx="8" ry="10" fill="${GOLD}"/>
        <path d="M42 230 C30 246 22 270 20 292" stroke="${INK}" stroke-width="30" fill="none" stroke-linecap="round"/>
        <path d="M42 230 C30 246 22 270 20 292" stroke="#5aa7e8" stroke-width="21" fill="none" stroke-linecap="round"/>
        <circle cx="19" cy="298" r="13" fill="#ffd9b8" ${K} stroke-width="4"/>
      </g>
    </g></svg>`;

  const BOWL_ICON = `<svg viewBox="0 0 40 34" width="40" height="34">
    <path d="M14 10 Q10 5 14 1 M22 10 Q18 5 22 1" stroke="#9a8467" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M3 14 H37 Q36 32 20 32 Q4 32 3 14Z" fill="#2f7fe0" ${K} stroke-width="3"/>
    <ellipse cx="20" cy="14" rx="17" ry="4" fill="${BROTH}" ${K} stroke-width="3"/></svg>`;

  const HEART = `<svg viewBox="0 0 24 24" width="34" height="34"><path d="M12 21 C-4 10 3 -2 12 6 C21 -2 28 10 12 21Z" fill="#ff6fae" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></svg>`;

  /* ------------------------------------------------------------------
     Background (one big SVG)
     ------------------------------------------------------------------ */
  function floorTiles() {
    const vy = 380, rows = [592, 614, 642, 676, 720], out = [];
    const sx = (i, y) => (640 + i * 120 * (y - vy) / (720 - vy)).toFixed(1);
    for (let r = 0; r < rows.length - 1; r++) {
      const y0 = rows[r], y1 = rows[r + 1];
      for (let i = -11; i < 11; i++) {
        const c = (((i + r) % 2) + 2) % 2 ? '#d9634a' : '#f6e3bf';
        out.push(`<path d="M${sx(i, y0)} ${y0} L${sx(i + 1, y0)} ${y0} L${sx(i + 1, y1)} ${y1} L${sx(i, y1)} ${y1}Z" fill="${c}"/>`);
      }
    }
    return `<g stroke="${INK}" stroke-opacity=".28" stroke-width="2">${out.join('')}</g>`;
  }
  function garlic(x, y, delay) {
    let s = `<g class="k-sway" style="animation-delay:${delay}s"><path d="M${x} ${y} V${y + 86}" stroke="#c49a5a" stroke-width="5" stroke-linecap="round"/>`;
    [[-6, 26], [7, 44], [-5, 62], [5, 80]].forEach(([dx, dy]) => {
      const bx = x + dx, by = y + dy;
      s += `<path d="M${bx} ${by - 12} C${bx + 14} ${by - 6} ${bx + 13} ${by + 10} ${bx} ${by + 11} C${bx - 13} ${by + 10} ${bx - 14} ${by - 6} ${bx} ${by - 12}Z" fill="#fff6e8" ${K} stroke-width="3"/>`;
      s += `<path d="M${bx} ${by - 8} V${by + 9} M${bx - 6} ${by - 4} Q${bx - 8} ${by + 3} ${bx - 4} ${by + 8}" stroke="#d9b3e6" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    });
    return s + '</g>';
  }
  function plate(cx, cy) {
    return `<circle cx="${cx}" cy="${cy}" r="30" fill="#fffaf0" ${K} stroke-width="4"/>
      <circle cx="${cx}" cy="${cy}" r="21" fill="none" stroke="#2f7fe0" stroke-width="4"/>
      <circle cx="${cx}" cy="${cy}" r="9" fill="#9cc0ff"/>`;
  }
  function cloud(x, y) {
    return `<g fill="#fff"><ellipse cx="${x}" cy="${y}" rx="16" ry="8"/><ellipse cx="${x + 12}" cy="${y - 6}" rx="12" ry="10"/><ellipse cx="${x + 25}" cy="${y}" rx="14" ry="8"/></g>`;
  }
  function bgSVG() {
    const rowsY = [175, 315, 455];
    let plates = '';
    rowsY.forEach(y => { plates += `<path d="M1024 ${y + 6} H1266" stroke="#4a2a10" stroke-width="4"/>` + plate(1085, y - 22) + plate(1205, y - 22); });
    const heartP = (x, y) => `<path d="M${x} ${y + 12} C${x - 18} ${y} ${x - 8} ${y - 12} ${x} ${y - 3} C${x + 8} ${y - 12} ${x + 18} ${y} ${x} ${y + 12}Z" fill="#8a5a2e" ${K} stroke-width="2.5"/>`;
    return `<svg viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="kitStone" width="120" height="70" patternUnits="userSpaceOnUse">
        <rect width="120" height="70" fill="#a48c6a"/>
        <rect x="3" y="3" width="54" height="29" rx="8" fill="#cdb998"/>
        <rect x="63" y="3" width="54" height="29" rx="8" fill="#c3ad8a"/>
        <rect x="-27" y="38" width="54" height="29" rx="8" fill="#c8b491"/>
        <rect x="33" y="38" width="54" height="29" rx="8" fill="#d3c1a0"/>
        <rect x="93" y="38" width="54" height="29" rx="8" fill="#c8b491"/>
        <path d="M10 9h22M70 9h14M40 44h18M100 44h10" stroke="#e4d6bb" stroke-width="3" stroke-linecap="round"/>
        <path d="M50 28h-12M112 28h-10M80 63h-14" stroke="#ab9473" stroke-width="3" stroke-linecap="round"/>
      </pattern>
      <pattern id="kitHs" width="64" height="44" patternUnits="userSpaceOnUse">
        <rect width="64" height="44" fill="#6f665b"/>
        <rect x="2" y="2" width="60" height="19" rx="6" fill="#a39a8c"/>
        <rect x="-30" y="23" width="60" height="19" rx="6" fill="#978d7e"/>
        <rect x="34" y="23" width="60" height="19" rx="6" fill="#aca395"/>
        <path d="M8 7h16M40 28h12" stroke="#c2bab0" stroke-width="3" stroke-linecap="round"/>
      </pattern>
      <linearGradient id="kitFb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a110b"/><stop offset="1" stop-color="#4a2614"/></linearGradient>
      <radialGradient id="kitEmb"><stop offset="0" stop-color="#ffb347" stop-opacity=".9"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>
      <radialGradient id="kitWarm" cx="590" cy="470" r="560" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffc56b" stop-opacity=".38"/><stop offset=".6" stop-color="#ffc56b" stop-opacity=".1"/><stop offset="1" stop-color="#ffc56b" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="kitShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".4"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
      <linearGradient id="kitSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc4ff"/><stop offset="1" stop-color="#d4f0ff"/></linearGradient>
      <clipPath id="kitWinClip"><path d="M866 244 V152 Q866 116 930 116 Q994 116 994 152 V244 Z"/></clipPath>
    </defs>

    <!-- stone wall -->
    <rect width="1280" height="600" fill="url(#kitStone)"/>
    <rect width="1280" height="230" fill="url(#kitShade)"/>

    <!-- checkered floor -->
    <rect y="590" width="1280" height="130" fill="#f6e3bf"/>
    ${floorTiles()}
    <rect y="592" width="1280" height="44" fill="url(#kitShade)" opacity=".8"/>
    <rect x="-10" y="584" width="1300" height="12" fill="#8a6a48" stroke="${INK}" stroke-width="4"/>
    <rect width="1280" height="720" fill="url(#kitWarm)"/>

    <!-- rug -->
    <path d="M412 626 H768 L812 706 H368 Z" fill="#c8384a" ${K} stroke-width="4"/>
    <path d="M408 638 H772 M380 692 H800" stroke="#ffc928" stroke-width="6"/>
    <path d="M500 666 l20 -12 l20 12 l-20 12z M570 666 l20 -12 l20 12 l-20 12z M640 666 l20 -12 l20 12 l-20 12z" fill="#ffc928" ${K} stroke-width="2.5"/>
    <path d="M380 708 v8 M400 708 v8 M420 708 v8 M440 708 v8 M460 708 v8 M480 708 v8 M500 708 v8 M520 708 v8 M540 708 v8 M560 708 v8 M580 708 v8 M600 708 v8 M620 708 v8 M640 708 v8 M660 708 v8 M680 708 v8 M700 708 v8 M720 708 v8 M740 708 v8 M760 708 v8 M780 708 v8 M800 708 v8" stroke="#ffc928" stroke-width="3" stroke-linecap="round"/>

    <!-- chimney + hood -->
    <rect x="470" y="-8" width="240" height="112" fill="url(#kitHs)" stroke="${INK}" stroke-width="5"/>
    <rect x="470" y="-8" width="240" height="112" fill="${INK}" opacity=".15"/>
    <path d="M432 100 H748 L806 190 H374 Z" fill="url(#kitHs)" ${K} stroke-width="5"/>
    <path d="M432 100 H748 L760 118 H420 Z" fill="#c2bab0" ${K} stroke-width="4"/>

    <!-- fireplace frame -->
    <path d="M356 208 H824 V590 H768 V290 Q768 246 712 244 H468 Q412 246 412 290 V590 H356 Z" fill="url(#kitHs)" ${K} stroke-width="5"/>
    <path d="M412 590 V290 Q412 246 468 244 H712 Q768 246 768 290 V590 Z" fill="url(#kitFb)" ${K} stroke-width="5"/>
    <g stroke="#000" stroke-opacity=".28" stroke-width="3" fill="none">
      <path d="M414 330 H766 M414 410 H766 M414 490 H766"/>
      <path d="M500 250 V330 M620 248 V330 M700 250 V330 M460 330 V410 M560 330 V410 M680 330 V410 M520 410 V490 M640 410 V490 M740 410 V490"/>
    </g>
    <ellipse cx="590" cy="560" rx="200" ry="120" fill="url(#kitEmb)"/>
    <path d="M574 236 H606 L600 260 H580Z" fill="#b8ad9c" ${K} stroke-width="4"/>
    <g fill="none" stroke="${INK}" stroke-width="4">
      <ellipse cx="590" cy="268" rx="6" ry="10"/><path d="M590 278 V284"/><ellipse cx="590" cy="294" rx="6" ry="10"/><path d="M590 260 V250"/>
    </g>
    <rect x="334" y="582" width="512" height="22" rx="6" fill="#8f8577" ${K} stroke-width="4"/>

    <!-- mantel + things on it -->
    <rect x="350" y="186" width="480" height="24" rx="6" fill="#8a5a2e" ${K} stroke-width="5"/>
    <path d="M358 194 H822" stroke="#b5763c" stroke-width="4" stroke-linecap="round"/>
    <rect x="382" y="156" width="28" height="31" rx="6" fill="#8fd3ff" fill-opacity=".85" ${K} stroke-width="4"/>
    <circle cx="390" cy="176" r="4" fill="#e8423f"/><circle cx="401" cy="170" r="4" fill="#ffc928"/><circle cx="394" cy="166" r="3.5" fill="#3fb950"/>
    <rect x="378" y="148" width="36" height="10" rx="3" fill="#b5763c" ${K} stroke-width="3"/>
    <rect x="418" y="164" width="22" height="23" rx="5" fill="#fff6e0" ${K} stroke-width="3.5"/>
    <rect x="416" y="157" width="26" height="9" rx="3" fill="#e8423f" ${K} stroke-width="3"/>
    <circle cx="732" cy="164" r="22" fill="#fffaf0" ${K} stroke-width="4"/><circle cx="732" cy="164" r="14" fill="none" stroke="#e8423f" stroke-width="3.5"/>
    <ellipse cx="790" cy="185" rx="16" ry="5" fill="#ffc928" ${K} stroke-width="3"/>
    <rect x="784" y="152" width="12" height="32" rx="3" fill="#fff6e0" ${K} stroke-width="3"/>
    <path class="k-candle" d="M790 132 Q799 144 790 151 Q781 144 790 132Z" fill="#ffd23f" stroke="#ff8c2b" stroke-width="2.5"/>

    <!-- window -->
    <path d="M848 258 V150 Q848 96 930 96 Q1012 96 1012 150 V258 Z" fill="#d8c8ac" ${K} stroke-width="5"/>
    <path d="M858 150 H848 M1002 150 H1012 M884 108 L878 100 M976 108 L982 100 M930 96 V106" stroke="${INK}" stroke-width="3"/>
    <g clip-path="url(#kitWinClip)">
      <rect x="860" y="110" width="140" height="140" fill="url(#kitSky)"/>
      <circle cx="972" cy="140" r="13" fill="#ffe14d" stroke="#ffb020" stroke-width="3"/>
      <g class="k-cloud">${cloud(880, 150)}${cloud(940, 178)}</g>
      <rect x="898" y="196" width="14" height="26" fill="#c9b79c" stroke="${INK}" stroke-width="2"/>
      <path d="M896 196 L905 182 L914 196Z" fill="#e8423f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M860 250 V222 Q894 202 930 218 Q962 204 1000 216 V250Z" fill="#6cc644" stroke="${INK}" stroke-width="3"/>
    </g>
    <path d="M930 116 V244 M866 182 H994" stroke="#7d4a1f" stroke-width="7"/>
    <path d="M878 162 L898 142 M880 178 L910 148" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>
    <path d="M866 244 V152 Q866 116 930 116 Q994 116 994 152 V244 Z" fill="none" stroke="${INK}" stroke-width="5"/>
    <rect x="838" y="242" width="184" height="16" rx="5" fill="#b5763c" ${K} stroke-width="4"/>
    <path d="M870 214 V226 M882 208 V226" stroke="#3fb950" stroke-width="3"/>
    <circle cx="870" cy="212" r="6" fill="#ff6fae" ${K} stroke-width="2.5"/><circle cx="882" cy="205" r="6" fill="#ffc928" ${K} stroke-width="2.5"/>
    <path d="M862 242 L866 224 H888 L892 242Z" fill="#d9634a" ${K} stroke-width="3"/>

    <!-- hanging herbs by the window -->
    <g class="k-sway" style="animation-delay:-1.5s">
      <path d="M836 102 V120" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="830" cy="146" rx="7" ry="22" transform="rotate(-14 830 146)" fill="#5cae3a" ${K} stroke-width="3"/>
      <ellipse cx="842" cy="146" rx="7" ry="22" transform="rotate(14 842 146)" fill="#5cae3a" ${K} stroke-width="3"/>
      <ellipse cx="836" cy="152" rx="7" ry="24" fill="#6cc644" ${K} stroke-width="3"/>
      <rect x="828" y="116" width="16" height="9" rx="3" fill="#e8423f" ${K} stroke-width="3"/>
    </g>
    <circle cx="836" cy="101" r="3.5" fill="${INK}"/>

    <!-- pot rack beam + garlic -->
    <rect x="430" y="14" width="320" height="18" rx="6" fill="#8a5a2e" ${K} stroke-width="4"/>
    <path d="M438 22 H742" stroke="#b5763c" stroke-width="3" stroke-linecap="round"/>
    ${garlic(458, 32, 0)}${garlic(722, 32, -2)}

    <!-- dresser -->
    <rect x="1022" y="104" width="246" height="430" fill="#6b3d18" ${K} stroke-width="5"/>
    <path d="M1062 110 V528 M1102 110 V528 M1142 110 V528 M1182 110 V528 M1222 110 V528" stroke="#5a3212" stroke-width="3"/>
    ${plates}
    <rect x="1014" y="98" width="18" height="556" rx="4" fill="#b5763c" ${K} stroke-width="4"/>
    <rect x="1258" y="98" width="18" height="556" rx="4" fill="#b5763c" ${K} stroke-width="4"/>
    <rect x="1004" y="88" width="276" height="20" rx="5" fill="#9c5f2a" ${K} stroke-width="5"/>
    <rect x="1016" y="233" width="258" height="14" rx="4" fill="#c4874a" ${K} stroke-width="4"/>
    <rect x="1016" y="373" width="258" height="14" rx="4" fill="#c4874a" ${K} stroke-width="4"/>
    <rect x="1016" y="513" width="258" height="14" rx="4" fill="#c4874a" ${K} stroke-width="4"/>
    <rect x="1030" y="527" width="230" height="118" fill="#a8682f" ${K} stroke-width="4"/>
    <rect x="1040" y="537" width="102" height="98" rx="8" fill="#c4874a" ${K} stroke-width="4"/>
    <rect x="1148" y="537" width="102" height="98" rx="8" fill="#c4874a" ${K} stroke-width="4"/>
    ${heartP(1091, 584)}${heartP(1199, 584)}
    <circle cx="1132" cy="590" r="6" fill="#ffc928" ${K} stroke-width="3"/><circle cx="1158" cy="590" r="6" fill="#ffc928" ${K} stroke-width="3"/>
    <rect x="1018" y="650" width="22" height="12" rx="3" fill="#7d4a1f" ${K} stroke-width="3"/>
    <rect x="1250" y="650" width="22" height="12" rx="3" fill="#7d4a1f" ${K} stroke-width="3"/>

    <!-- cat cushion -->
    <ellipse cx="301" cy="588" rx="66" ry="16" fill="#9b5de5" ${K} stroke-width="4"/>
    <path d="M250 584 Q300 576 352 584" stroke="#c9a2f5" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="238" cy="594" r="5" fill="#ffc928" ${K} stroke-width="2.5"/><circle cx="364" cy="594" r="5" fill="#ffc928" ${K} stroke-width="2.5"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------
     Room CSS
     ------------------------------------------------------------------ */
  const CSS = `
.scene-kitchen { background:#c9b79c; }
.scene-kitchen .k-bg { position:absolute; left:0; top:0; pointer-events:none; }
.scene-kitchen .k-sway { transform-box:fill-box; transform-origin:50% 0; animation:kit-sway 4.5s ease-in-out infinite; }
@keyframes kit-sway { 0%,100% { transform:rotate(-3deg); } 50% { transform:rotate(3deg); } }
.scene-kitchen .k-cloud { animation:kit-cloud 22s ease-in-out infinite alternate; }
@keyframes kit-cloud { from { transform:translateX(-40px); } to { transform:translateX(60px); } }
.scene-kitchen .k-candle { transform-box:fill-box; transform-origin:50% 100%; animation:kit-flick .35s ease-in-out infinite alternate; }
@keyframes kit-flick { from { transform:scale(1,1) rotate(-3deg); } to { transform:scale(.85,1.15) rotate(4deg); } }

.scene-kitchen .k-pan { position:absolute; width:70px; height:92px; cursor:pointer; transform-origin:50% 0; }
.scene-kitchen .k-pan svg { display:block; }
.scene-kitchen .k-pan:hover { filter:brightness(1.12); }
.scene-kitchen .k-pan.kit-swing { animation:kit-swing 1s ease-out; }
@keyframes kit-swing { 12% { transform:rotate(20deg); } 32% { transform:rotate(-15deg); } 52% { transform:rotate(9deg); } 72% { transform:rotate(-5deg); } 88% { transform:rotate(2deg); } }

.scene-kitchen .k-bird { position:absolute; left:944px; top:198px; width:60px; height:50px; cursor:pointer; transform-origin:50% 100%; }
.scene-kitchen .k-bird::before { content:''; position:absolute; inset:-16px; }
.scene-kitchen .k-bird svg { display:block; transform-origin:50% 100%; animation:kit-peck 5s ease-in-out infinite; }
@keyframes kit-peck { 0%,84%,100% { transform:none; } 89% { transform:rotate(14deg); } 94% { transform:rotate(-4deg); } }
.scene-kitchen .k-bird.kit-hop { animation:kit-hop .6s ease-out; }
@keyframes kit-hop { 30% { transform:translateY(-24px) rotate(-8deg); } 60% { transform:translateY(0); } 80% { transform:translateY(-6px); } }

.scene-kitchen .k-fire { position:absolute; left:440px; top:442px; width:300px; height:150px; cursor:pointer; }
.scene-kitchen .k-fire svg { display:block; overflow:visible; }
.scene-kitchen .k-flames { transform-box:fill-box; transform-origin:50% 100%; }
.scene-kitchen .k-fire.flare .k-flames { animation:kit-flare .85s ease-out; }
@keyframes kit-flare { 25% { transform:scale(1.25,1.75); } 60% { transform:scale(1.1,1.3); } }
.scene-kitchen .k-fl { transform-box:fill-box; transform-origin:50% 100%; animation:kit-flame .55s ease-in-out infinite alternate; }
.scene-kitchen .k-fl.b { animation-duration:.42s; animation-delay:-.2s; }
.scene-kitchen .k-fl.c { animation-duration:.68s; animation-delay:-.35s; }
@keyframes kit-flame { 0% { transform:scale(1,1) skewX(0deg); } 50% { transform:scale(.94,1.1) skewX(4deg); } 100% { transform:scale(1.05,.9) skewX(-4deg); } }
.scene-kitchen .k-ember { animation:kit-ember 1.3s ease-in-out infinite alternate; }
@keyframes kit-ember { to { opacity:.3; } }

.scene-kitchen .k-pot { position:absolute; left:430px; top:280px; width:320px; height:280px; cursor:pointer; transition:filter .2s; }
.scene-kitchen .k-pot svg { display:block; overflow:visible; transform-origin:50% 60%; }
.scene-kitchen .k-pot.plop svg { animation:kit-squish .45s ease-out; }
@keyframes kit-squish { 30% { transform:scale(1.06,.92); } 65% { transform:scale(.97,1.04); } }
.scene-kitchen .k-pot.burp svg { animation:kit-burp .65s ease-out; }
@keyframes kit-burp { 20% { transform:scale(.92,1.12) translateY(-10px); } 50% { transform:scale(1.08,.92); } 75% { transform:scale(.98,1.03); } }
.scene-kitchen .k-pot.hover { filter:drop-shadow(0 0 10px #fff59a) drop-shadow(0 0 24px #ffd23f); }
.scene-kitchen .k-pot.golden { filter:drop-shadow(0 0 14px #ffe066) drop-shadow(0 0 34px #ffb020); }
.scene-kitchen .k-soup { transition:fill .5s; }
.scene-kitchen .k-pot .k-mo { opacity:0; }
.scene-kitchen .k-pot.burp .k-mo { opacity:1; }
.scene-kitchen .k-pot.burp .k-ms { opacity:0; }
.scene-kitchen .k-bub { transform-box:fill-box; transform-origin:50% 50%; animation:kit-bub 1.9s ease-in infinite; }
@keyframes kit-bub { 0% { transform:scale(0); opacity:1; } 80% { transform:scale(1); opacity:1; } 100% { transform:scale(1.4); opacity:0; } }
.scene-kitchen .k-pot.golden .k-bub { animation-duration:.8s; }
.scene-kitchen .k-pot-eyes { transform-box:view-box; transform-origin:160px 162px; animation:kit-blink 5s infinite; }
@keyframes kit-blink { 0%,92%,100% { transform:scaleY(1); } 95% { transform:scaleY(.1); } }

.scene-kitchen .k-steam { position:absolute; left:505px; top:240px; width:170px; height:120px; pointer-events:none; }
.scene-kitchen .k-puff { position:absolute; bottom:0; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.8); opacity:0; animation:kit-puff 3.4s ease-out infinite; }
@keyframes kit-puff { 0% { transform:translateY(0) scale(.35); opacity:0; } 20% { opacity:.85; } 100% { transform:translateY(-120px) scale(1.6); opacity:0; } }

.scene-kitchen .k-cat { position:absolute; left:236px; top:482px; width:130px; height:110px; cursor:pointer; transform-origin:50% 100%; }
.scene-kitchen .k-cat svg { display:block; overflow:visible; }
.scene-kitchen .k-cat-tail { transform-box:view-box; transform-origin:92px 92px; animation:kit-tail 2.6s ease-in-out infinite; }
@keyframes kit-tail { 50% { transform:rotate(-12deg); } }
.scene-kitchen .k-cat-eyes { transform-box:view-box; transform-origin:62px 40px; animation:kit-blink 4.2s infinite; }
.scene-kitchen .k-cat-head { transform-box:view-box; transform-origin:62px 64px; animation:kit-cathead 6s ease-in-out infinite; }
@keyframes kit-cathead { 0%,40%,100% { transform:rotate(0); } 50%,80% { transform:rotate(-7deg); } }

.scene-kitchen .k-cc { position:absolute; left:830px; top:258px; width:180px; height:400px; cursor:pointer; transform-origin:50% 100%; }
.scene-kitchen .k-cc svg { display:block; overflow:visible; }
.scene-kitchen .k-cc-body { transform-box:view-box; transform-origin:90px 392px; animation:kit-breathe 3.2s ease-in-out infinite; }
@keyframes kit-breathe { 50% { transform:scale(1.02,.98); } }
.scene-kitchen .k-cc-eyes { transform-box:view-box; transform-origin:90px 148px; animation:kit-blink 4.6s infinite; }
.scene-kitchen .k-cc-happy { opacity:0; }
.scene-kitchen .k-cc.yum .k-cc-eyes { opacity:0; }
.scene-kitchen .k-cc.yum .k-cc-happy { opacity:1; }
.scene-kitchen .k-cc-mouth { transform-box:view-box; transform-origin:90px 176px; }
.scene-kitchen .k-cc.talking .k-cc-mouth { animation:kit-talk .2s infinite alternate; }
@keyframes kit-talk { to { transform:scaleY(1.9); } }
.scene-kitchen .k-cc-arm { transform-box:view-box; transform-origin:42px 230px; transition:transform .55s cubic-bezier(.3,1.4,.5,1); }
.scene-kitchen .k-cc.taste .k-cc-arm { transform:rotate(55deg); }
.scene-kitchen .k-cc-dab { opacity:0; transition:opacity .3s; }
.scene-kitchen .k-cc.taste .k-cc-dab { opacity:1; }
.scene-kitchen .k-cc-arm2 { transform-box:view-box; transform-origin:146px 226px; }
.scene-kitchen .k-cc.talking .k-cc-arm2 { animation:kit-wave .6s ease-in-out infinite alternate; }
@keyframes kit-wave { to { transform:rotate(-14deg); } }
.scene-kitchen .k-cc.nod { animation:kit-nod .55s ease-out; }
@keyframes kit-nod { 35% { transform:translateY(-12px) scale(1.02,.98); } 70% { transform:translateY(0) scale(.99,1.01); } }

.scene-kitchen .k-card { position:absolute; left:24px; top:116px; width:318px; height:372px;
  background:#fffaf0 repeating-linear-gradient(transparent 0 33px, rgba(47,127,224,.12) 33px 35px);
  border:5px solid ${INK}; border-radius:22px; box-shadow:0 8px 0 rgba(58,42,26,.5);
  transform:rotate(-1.5deg); padding:50px 12px 12px; }
.scene-kitchen .k-card.k-card-in { animation:kit-cardin .7s cubic-bezier(.3,1.4,.5,1); }
@keyframes kit-cardin { 0% { transform:rotate(-12deg) translateY(-40px) scale(.7); opacity:0; } 100% { transform:rotate(-1.5deg); opacity:1; } }
.scene-kitchen .k-pin { position:absolute; left:50%; top:-14px; width:26px; height:26px; margin-left:-13px; border-radius:50%;
  background:radial-gradient(circle at 35% 35%, #ff9a8a, #e8423f 60%); border:4px solid ${INK}; }
.scene-kitchen .k-card-head { position:absolute; left:0; right:0; top:6px; display:flex; align-items:center; justify-content:center; gap:8px;
  font-size:30px; font-weight:800; color:#b32421; letter-spacing:1px; line-height:1; }
.scene-kitchen .k-rows { display:flex; flex-direction:column; justify-content:center; gap:8px; height:100%; }
.scene-kitchen .k-row { display:flex; align-items:center; gap:8px; height:92px; flex:0 0 92px; padding:0 8px; border-radius:18px;
  border:3px dashed rgba(58,42,26,.3); background:rgba(255,201,40,.14); transition:background .3s, border-color .3s; }
.scene-kitchen .k-row.done { background:rgba(63,185,80,.2); border:3px solid #3fb950; }
.scene-kitchen .k-row.k-hint { animation:kit-rowpulse 1s ease-in-out infinite; }
@keyframes kit-rowpulse { 50% { transform:scale(1.04); background:rgba(255,224,102,.55); } }
.scene-kitchen .k-ico svg { display:block; }
.scene-kitchen .k-num { font-size:60px; font-weight:800; line-height:1; color:#ff8c2b; -webkit-text-stroke:2.5px ${INK}; paint-order:stroke fill; min-width:40px; text-align:center; }
.scene-kitchen .k-dots { display:flex; gap:6px; margin-left:4px; }
.scene-kitchen .k-dots span { width:26px; height:26px; border-radius:50%; border:4px solid ${INK}; background:#fff; transition:background .2s, transform .25s cubic-bezier(.3,1.8,.5,1); }
.scene-kitchen .k-dots span.on { background:#ff8c2b; transform:scale(1.18); }
.scene-kitchen .k-tally { margin-left:auto; flex:0 0 60px; width:60px; height:60px; border-radius:50%; border:4px solid ${INK}; background:#fff;
  display:grid; place-items:center; font-size:36px; font-weight:800; line-height:1; color:${INK}; box-shadow:0 4px 0 rgba(58,42,26,.4); }
.scene-kitchen .k-tally.full { background:#3fb950; color:#fff; -webkit-text-stroke:1.5px ${INK}; paint-order:stroke fill; }
.scene-kitchen .k-tally.kit-tick { animation:kit-tick .35s ease-out; }
@keyframes kit-tick { 40% { transform:scale(1.3); } }
.scene-kitchen .k-addrow { gap:4px; padding:0 6px; }
.scene-kitchen .k-grp { display:grid; grid-template-columns:repeat(2, 34px); gap:2px; justify-content:center; width:72px; }
.scene-kitchen .k-grp svg { display:block; }
.scene-kitchen .k-op { font-size:42px; font-weight:800; color:#2f7fe0; -webkit-text-stroke:2px ${INK}; paint-order:stroke fill; line-height:1; }

.scene-kitchen .k-slots { position:absolute; left:0; top:0; width:1280px; height:720px; pointer-events:none; }
.scene-kitchen .k-slot { position:absolute; width:120px; height:120px; pointer-events:none; }
.scene-kitchen .k-slot .k-bk { position:absolute; left:0; top:66px; pointer-events:none; display:block; }
.scene-kitchen .k-item { position:absolute; left:10px; top:0; width:100px; height:100px; pointer-events:auto; }
.scene-kitchen .k-isvg { display:block; overflow:visible; transform-origin:50% 85%; transition:transform .15s; }
.scene-kitchen .k-item:hover .k-isvg { transform:scale(1.08) rotate(-5deg); }
.scene-kitchen .k-isvg.k-pop { animation:kit-pop .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes kit-pop { 0% { transform:translateY(40px) scale(.3); } 100% { transform:none; } }
.scene-kitchen .k-item.glow .k-isvg { animation:kit-hintbob .9s ease-in-out infinite; }
@keyframes kit-hintbob { 50% { transform:translateY(-10px) scale(1.06); } }

.scene-kitchen .k-fly { position:absolute; width:100px; height:100px; z-index:30; pointer-events:none; }
.scene-kitchen .k-fly svg { display:block; overflow:visible; }
.scene-kitchen .k-drop { position:absolute; width:14px; height:14px; border-radius:50%; border:3px solid ${INK}; z-index:29; pointer-events:none; }
.scene-kitchen .k-heart { position:absolute; z-index:31; pointer-events:none; animation:kit-heart 1.3s ease-out forwards; }
@keyframes kit-heart { 0% { transform:scale(.2); opacity:0; } 20% { transform:translateY(-10px) scale(1.15); opacity:1; } 100% { transform:translateY(-90px) scale(.9); opacity:0; } }
`;

  /* ------------------------------------------------------------------
     Shelf layouts (slot centers) by number of baskets
     ------------------------------------------------------------------ */
  const POS = {
    3: [[1145, 175], [1145, 315], [1145, 455]],
    5: [[1085, 175], [1205, 175], [1145, 315], [1085, 455], [1205, 455]],
    6: [[1085, 175], [1205, 175], [1085, 315], [1205, 315], [1085, 455], [1205, 455]],
  };

  Castle.registerRoom({
    id: 'kitchen',
    title: 'Royal Kitchen',
    jewel: 'ruby',

    enter(root, api) {
      const D = Math.max(1, Math.min(3, Number(api.difficulty) || 1));
      const VOICE = { who: 'Cook Clementine', pitch: 1.0, rate: 0.95 };
      const SOUP = { x: 590, y: 366 };      // soup surface centre (stage px)
      const CC_HEAD = { x: 920, y: 400 };

      let rounds = [], roundIdx = 0, cur = null;
      let accepting = false, introCut = false, talkTok = 0;
      let slots = [], soupColor = BROTH;

      /* ---------- helpers ---------- */
      const reTok = new WeakMap();
      function retrigger(node, cls, ms) {
        if (!node) return;
        node.classList.remove(cls);
        void node.getBoundingClientRect();
        node.classList.add(cls);
        if (ms) {
          const map = reTok.get(node) || {};
          const tok = (map[cls] || 0) + 1;
          map[cls] = tok; reTok.set(node, map);
          api.setTimeout(() => { if ((reTok.get(node) || {})[cls] === tok) node.classList.remove(cls); }, ms);
        }
      }
      function cSay(text) {
        const my = ++talkTok;
        cc.classList.add('talking');
        return api.say(text, VOICE).then(() => { if (my === talkTok) cc.classList.remove('talking'); });
      }
      function heart(x, y) {
        const h = api.el('div', { class: 'k-heart', html: HEART, style: { left: (x - 17) + 'px', top: (y - 17) + 'px' } });
        root.appendChild(h);
        api.setTimeout(() => h.remove(), 1350);
      }
      function meow() {
        const T = window.Castle && Castle.tone;
        if (T) {
          try {
            T(520, 0.2, { type: 'triangle', slide: 860, vol: 0.2, vibrato: 7 });
            T(860, 0.42, { type: 'triangle', slide: 430, vol: 0.2, delay: 0.18, vibrato: 7 });
            return;
          } catch (e) { /* fall through */ }
        }
        api.note('A5', 0.2, 'triangle');
        api.setTimeout(() => api.note('E5', 0.35, 'triangle'), 180);
      }

      /* ---------- build the scene ---------- */
      root.appendChild(api.el('style', { text: CSS }));
      const bg = api.svg(bgSVG());
      bg.classList.add('k-bg');
      root.appendChild(bg);

      // hanging pans that clang
      [{ x: 525, note: 'E5' }, { x: 590, note: 'G5' }, { x: 655, note: 'C6' }].forEach((p, i) => {
        const pan = api.el('div', { class: 'k-pan', html: PAN_SVGS[i], style: { left: (p.x - 35) + 'px', top: '24px' } });
        api.on(pan, 'click', () => {
          api.note(p.note, 1.1, 'bell');
          api.note(p.note, 0.25, 'pluck');
          retrigger(pan, 'kit-swing', 1000);
        });
        root.appendChild(pan);
      });

      // bluebird on the window sill
      const bird = api.el('div', { class: 'k-bird', html: BIRD_SVG });
      api.on(bird, 'click', () => {
        ['A6', 'C7', 'A6', 'E7'].forEach((n, i) => api.setTimeout(() => api.note(n, 0.12, 'flute'), i * 110));
        retrigger(bird, 'kit-hop', 600);
      });
      root.appendChild(bird);

      // fire (behind the pot)
      const fire = api.el('div', { class: 'k-fire', html: FIRE_SVG });
      root.appendChild(fire);

      // cauldron
      const pot = api.el('div', { class: 'k-pot', html: POT_SVG });
      const soupEl = pot.querySelector('.k-soup');
      root.appendChild(pot);

      // steam
      const steam = api.el('div', { class: 'k-steam' });
      [[18, 0], [62, -0.85], [104, -1.7], [130, -2.55]].forEach(([x, d]) => {
        steam.appendChild(api.el('span', { class: 'k-puff', style: { left: x + 'px', animationDelay: d + 's' } }));
      });
      root.appendChild(steam);

      // cat by the fire
      const cat = api.el('div', { class: 'k-cat', html: CAT_SVG });
      root.appendChild(cat);

      // Cook Clementine
      const cc = api.el('div', { class: 'k-cc', html: CC_SVG });
      root.appendChild(cc);

      // recipe card
      const card = api.el('div', { class: 'k-card' });
      card.appendChild(api.el('div', { class: 'k-pin' }));
      card.appendChild(api.el('div', { class: 'k-card-head', html: BOWL_ICON + '<span>Recipe</span>' }));
      const rowsEl = api.el('div', { class: 'k-rows' });
      card.appendChild(rowsEl);
      root.appendChild(card);

      // ingredient baskets
      const slotLayer = api.el('div', { class: 'k-slots' });
      root.appendChild(slotLayer);

      root.appendChild(api.el('div', { class: 'room-title', text: 'Royal Kitchen' }));
      const dotsEl = api.el('div', { class: 'round-dots' });
      const dots = [0, 1, 2].map(() => { const s = api.el('span'); dotsEl.appendChild(s); return s; });
      root.appendChild(dotsEl);

      /* ---------- fun extras ---------- */
      api.on(fire, 'click', () => {
        api.sfx('whoosh');
        retrigger(fire, 'flare', 850);
        api.sparkle(590, 500, 16);
        api.setTimeout(() => retrigger(cat, 'bounce', 650), 120);
      });
      api.on(cat, 'click', () => {
        meow();
        retrigger(cat, 'wiggle', 550);
        heart(300, 470);
      });
      api.on(pot, 'click', () => {
        api.sfx('plop');
        retrigger(pot, 'plop', 450);
        splash(4);
      });
      api.on(cc, 'click', () => {
        api.sfx('giggle');
        retrigger(cc, 'bounce', 650);
        if (accepting && cur) { introCut = true; cSay(instr(cur)); }
      });

      /* ---------- round generation ---------- */
      function makeRounds() {
        let pool = api.shuffle(KINDS), pi = 0;
        const take = (avoid) => {
          for (;;) {
            if (pi >= pool.length) { pool = api.shuffle(KINDS); pi = 0; }
            const k = pool[pi++];
            if (avoid.indexOf(k) < 0) return k;
          }
        };
        const line = (kind, need, add) => ({ kind, need, add: add || null, added: 0, landed: 0, row: null, dots: null, tally: null });
        const out = [];
        const counts1 = api.shuffle([1, 2, 3]);
        for (let r = 0; r < 3; r++) {
          const R = { lines: [], add: false, pending: 0, misses: 0, hinted: false, done: false };
          if (D === 1) {
            R.lines.push(line(take([]), counts1[r]));
          } else if (D === 2) {
            const k1 = take([]), k2 = take([k1]);
            let a, b;
            do { a = 1 + api.rand(5); b = 1 + api.rand(5); } while (a === b || a + b > 8);
            R.lines.push(line(k1, a), line(k2, b));
          } else if (r < 2) {
            const k1 = take([]), k2 = take([k1]), k3 = take([k1, k2]);
            let a, b, c;
            do { a = 1 + api.rand(6); b = 1 + api.rand(6); c = 1 + api.rand(6); }
            while (a + b + c > 12 || Math.max(a, b, c) < 4 || (a === b && b === c));
            R.lines.push(line(k1, a), line(k2, b), line(k3, c));
          } else {
            // addition card: "a + b" of one ingredient, plus one more ingredient
            const k1 = take([]), k2 = take([k1]);
            let a, b;
            do { a = 1 + api.rand(3); b = 1 + api.rand(3); } while (a + b < 3);
            R.add = true;
            R.lines.push(line(k1, a + b, [a, b]), line(k2, 1 + api.rand(3)));
          }
          out.push(R);
        }
        return out;
      }

      function instr(R) {
        if (R.add) {
          const a = R.lines[0], b = R.lines[1];
          return `Put in ${a.add[0]} ${nm(a.kind, a.add[0])}, plus ${a.add[1]} more! Then ${b.need} ${nm(b.kind, b.need)}.`;
        }
        const p = R.lines.map(l => `${l.need} ${nm(l.kind, l.need)}`);
        if (p.length === 1) return `Put ${p[0]} in the pot!`;
        if (p.length === 2) return `Put in ${p[0]} and ${p[1]}!`;
        return `Put in ${p[0]}, ${p[1]}, and ${p[2]}!`;
      }

      /* ---------- recipe card ---------- */
      function renderCard(R) {
        rowsEl.innerHTML = '';
        R.lines.forEach(l => {
          const row = api.el('div', { class: 'k-row' });
          if (l.add) {
            row.classList.add('k-addrow');
            const grp = n => {
              const g = api.el('div', { class: 'k-grp' });
              for (let i = 0; i < n; i++) g.appendChild(api.svg(ingSVG(l.kind, 34)));
              return g;
            };
            row.append(grp(l.add[0]), api.el('div', { class: 'k-op', text: '+' }), grp(l.add[1]), api.el('div', { class: 'k-op', text: '=' }));
            l.tally = api.el('div', { class: 'k-tally', text: '?' });
            row.appendChild(l.tally);
          } else {
            row.appendChild(api.el('div', { class: 'k-ico', html: ingSVG(l.kind, 72) }));
            row.appendChild(api.el('div', { class: 'k-num', text: String(l.need) }));
            if (D === 1) {
              const box = api.el('div', { class: 'k-dots' });
              l.dots = [];
              for (let i = 0; i < l.need; i++) { const s = api.el('span'); box.appendChild(s); l.dots.push(s); }
              row.appendChild(box);
            } else {
              l.tally = api.el('div', { class: 'k-tally', text: '0' });
              row.appendChild(l.tally);
            }
          }
          l.row = row;
          rowsEl.appendChild(row);
        });
        retrigger(card, 'k-card-in', 750);
      }

      function updateRow(l) {
        if (l.dots) { const d = l.dots[l.landed - 1]; if (d) d.classList.add('on'); }
        if (l.tally) { l.tally.textContent = String(l.landed); retrigger(l.tally, 'kit-tick', 400); }
        if (l.landed >= l.need) {
          l.row.classList.add('done');
          l.row.classList.remove('k-hint');
          if (l.tally) l.tally.classList.add('full');
          slots.forEach(s => { if (s.kind === l.kind) s.item.classList.remove('glow'); });
        }
      }

      /* ---------- shelf / baskets ---------- */
      function popIn(item, delayMs) {
        const sv = item.firstElementChild;
        if (!sv) return;
        sv.style.animationDelay = (delayMs || 120) + 'ms';
        retrigger(sv, 'k-pop', 520 + (delayMs || 120));
      }

      function makeSlot(kind, cx, cy, idx) {
        const slot = api.el('div', { class: 'k-slot', style: { left: (cx - 60) + 'px', top: (cy - 60) + 'px' } });
        const item = api.el('div', { class: 'k-item', html: ingSVG(kind, 100, 'k-isvg'), 'aria-label': ING[kind].one });
        slot.append(api.svg(BASKET_BACK), item, api.svg(BASKET_FRONT));
        slotLayer.appendChild(slot);
        const s = { kind, cx, cy, slot, item, handle: null, downPt: null };
        s.handle = api.draggable(item, {
          enabled: () => accepting,
          onMove: p => pot.classList.toggle('hover', api.hitTest(p.x, p.y, pot, 30)),
          onDrop: d => onItemDrop(s, d),
        });
        api.on(item, 'pointerdown', e => { s.downPt = api.toStage(e.clientX, e.clientY); });
        popIn(item, 80 + idx * 90);
        return s;
      }

      function buildShelf(R) {
        slots.forEach(s => { if (s.handle && s.handle.destroy) s.handle.destroy(); });
        slotLayer.innerHTML = '';
        slots = [];
        const need = R.lines.map(l => l.kind);
        const n = D === 1 ? 3 : D === 2 ? 5 : 6;
        const extra = api.shuffle(KINDS.filter(k => need.indexOf(k) < 0)).slice(0, Math.max(0, n - need.length));
        const kinds = api.shuffle(need.concat(extra));
        const pos = POS[kinds.length] || POS[6];
        kinds.forEach((k, i) => slots.push(makeSlot(k, pos[i][0], pos[i][1], i)));
      }

      function showHint(R) {
        R.hinted = true;
        slots.forEach(s => {
          const l = R.lines.find(x => x.kind === s.kind);
          if (l && l.added < l.need) s.item.classList.add('glow');
        });
        R.lines.forEach(l => { if (l.landed < l.need && l.row) l.row.classList.add('k-hint'); });
      }
      function clearHint() {
        slots.forEach(s => s.item.classList.remove('glow'));
        if (cur) cur.lines.forEach(l => { if (l.row) l.row.classList.remove('k-hint'); });
      }

      /* ---------- drag / tap ---------- */
      function onItemDrop(s, d) {
        pot.classList.remove('hover');
        const moved = s.downPt ? Math.hypot(d.x - s.downPt.x, d.y - s.downPt.y) : 999;
        s.downPt = null;
        if (!accepting) { d.back(); return; }
        if (moved < 14) {
          // a tap: the ingredient hops from its basket into the pot
          d.stay(); s.handle.reset();
          popIn(s.item, 260);
          addToPot(s, { x: s.cx, y: s.cy - 10 });
        } else if (api.hitTest(d.x, d.y, pot, 36)) {
          const r = api.stageRect(s.item);
          d.stay(); s.handle.reset();
          popIn(s.item, 200);
          addToPot(s, { x: r.cx, y: r.cy });
        } else {
          d.back();
        }
      }

      function flyArc(kind, from, to, o, done) {
        o = Object.assign({ dur: 520, lift: 110, s0: 1, s1: 0.45, o1: 0, rot: 0 }, o);
        const f = api.el('div', { class: 'k-fly', html: ingSVG(kind, 100), style: { left: (from.x - 50) + 'px', top: (from.y - 50) + 'px' } });
        root.appendChild(f);
        const dx = to.x - from.x, dy = to.y - from.y, cy = Math.min(0, dy) - o.lift;
        const frames = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          const x = dx * t, y = 2 * (1 - t) * t * cy + t * t * dy, sc = o.s0 + (o.s1 - o.s0) * t;
          const op = t < 0.75 ? 1 : 1 + (o.o1 - 1) * ((t - 0.75) / 0.25);
          frames.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)}) rotate(${(o.rot * t).toFixed(1)}deg)`, opacity: op });
        }
        if (typeof f.animate === 'function') f.animate(frames, { duration: o.dur, easing: 'linear', fill: 'forwards' });
        else f.style.display = 'none';
        api.setTimeout(() => { f.remove(); if (done) done(); }, o.dur);
      }

      function splash(n) {
        for (let i = 0; i < n; i++) {
          const d = api.el('div', { class: 'k-drop', style: { left: (SOUP.x - 7 + (Math.random() - 0.5) * 60) + 'px', top: (SOUP.y - 7) + 'px', background: soupColor } });
          root.appendChild(d);
          const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, sp = 50 + Math.random() * 50;
          const tx = Math.cos(ang) * sp * 1.3, ty = Math.sin(ang) * sp;
          if (typeof d.animate === 'function') {
            d.animate([
              { transform: 'translate(0,0) scale(.6)', opacity: 1 },
              { transform: `translate(${(tx * 0.7).toFixed(1)}px, ${ty.toFixed(1)}px) scale(1)`, opacity: 1, offset: 0.5 },
              { transform: `translate(${tx.toFixed(1)}px, ${(ty * 0.2 + 22).toFixed(1)}px) scale(.7)`, opacity: 0 },
            ], { duration: 600, easing: 'ease-out', fill: 'forwards' });
          }
          api.setTimeout(() => d.remove(), 620);
        }
      }

      function addToPot(s, from) {
        introCut = true;
        const R = cur;
        if (!R || R.done) return;
        const line = R.lines.find(l => l.kind === s.kind);
        if (line && line.added < line.need) {
          line.added++;
          R.pending++;
          if (R.lines.every(l => l.added >= l.need)) { accepting = false; clearHint(); }
          flyArc(s.kind, from, SOUP, {}, () => landed(R, line));
        } else {
          const why = line ? 'full' : 'wrong';
          flyArc(s.kind, from, SOUP, {}, () => burp(R, s, why));
        }
      }

      function landed(R, line) {
        if (R !== cur) return;
        R.pending--;
        line.landed++;
        api.sfx('plop');
        api.setTimeout(() => api.sfx('splash'), 80);
        retrigger(pot, 'plop', 450);
        splash(6);
        soupColor = mix(soupColor, ING[line.kind].soup, 0.35);
        soupEl.style.fill = soupColor;
        updateRow(line);
        retrigger(cc, 'nod', 600);

        if (R.lines.every(l => l.landed >= l.need)) {
          if (!R.done) finishRound(R, line);
          return;
        }
        const n = line.landed;
        if (n >= line.need) {
          api.setTimeout(() => api.note('C6', 0.5, 'bell'), 120);
          api.sparkleAt(line.row);
          let t;
          if (line.add) t = `${NUM[n]}! ${line.add[0]} plus ${line.add[1]} makes ${n}!`;
          else if (n === 1) t = `One ${ING[line.kind].one}! Good!`;
          else t = `${NUM[n]}! That's all the ${ING[line.kind].many}!`;
          cSay(t);
        } else {
          cSay(NUM[n] + '!');
        }
      }

      function burp(R, s, why) {
        api.sfx('plop');
        api.setTimeout(() => {
          retrigger(pot, 'burp', 650);
          api.sfx('boing');
          splash(3);
          flyArc(s.kind, SOUP, { x: s.cx, y: s.cy - 10 }, { dur: 800, lift: 150, s0: 0.5, s1: 0.9, o1: 0, rot: 360 }, () => {
            if (s.item.isConnected) retrigger(s.item.firstElementChild, 'wiggle', 550);
          });
        }, 280);
        if (R !== cur || R.done) return;
        R.misses++;
        const pl = ING[s.kind].many;
        let text = why === 'full'
          ? api.pick([`That's enough ${pl}!`, `We have all the ${pl} we need!`])
          : api.pick([`Oh! No ${pl} in this soup.`, `Hmm, not ${pl}. Look at my card!`, 'Oopsie! The pot says no, thank you!']);
        if (R.misses >= 2 && !R.hinted) { showHint(R); text += ' Look! The right food is glowing.'; }
        cSay(text);
      }

      /* ---------- round flow ---------- */
      function startRound(i, silent) {
        cur = rounds[i];
        soupColor = BROTH;
        soupEl.style.fill = BROTH;
        buildShelf(cur);
        renderCard(cur);
        accepting = true;
        if (!silent) {
          const lead = i === rounds.length - 1
            ? (cur.add ? 'Last soup! Look, a plus sign!' : 'Last soup for the King!')
            : 'Now a new soup!';
          cSay(lead + ' ' + instr(cur));
        }
      }

      async function finishRound(R, line) {
        R.done = true;
        accepting = false;
        clearHint();
        const n = line.landed;
        await cSay(line.add ? `${NUM[n]}! ${line.add[0]} plus ${line.add[1]} makes ${n}!` : `${NUM[n]}!`);
        pot.classList.add('golden');
        soupEl.style.fill = GOLD;
        api.sfx('sparkle');
        api.sparkle(SOUP.x, SOUP.y - 10, 28);
        await api.wait(700);
        cc.classList.add('taste');
        await api.wait(600);
        cc.classList.add('yum');
        api.note('G5', 0.12, 'sine');
        api.setTimeout(() => api.note('C6', 0.25, 'sine'), 130);
        heart(CC_HEAD.x - 30, CC_HEAD.y - 40);
        api.setTimeout(() => heart(CC_HEAD.x + 30, CC_HEAD.y - 70), 250);
        api.sfx('correct');
        await cSay(api.pick(['Mmm... Yum!', 'Yum, yum, yum!', 'Mmm! So yummy!']));
        api.celebrate(SOUP.x, SOUP.y - 60, 70);
        dots[roundIdx].classList.add('done');
        cc.classList.remove('taste');
        await api.wait(900);
        cc.classList.remove('yum');
        pot.classList.remove('golden');
        roundIdx++;
        if (roundIdx < rounds.length) {
          startRound(roundIdx, false);
        } else {
          retrigger(cc, 'bounce', 650);
          await cSay('The King will love it! Thank you, dear!');
          api.complete();
        }
      }

      async function intro() {
        retrigger(cc, 'bounce', 650);
        const lines = ["Hello, dear! I'm Cook Clementine.", "I'm making soup for the King!", 'Follow my recipe card. Put the food in the pot!'];
        for (const l of lines) {
          if (introCut) return;
          await cSay(l);
        }
        await api.wait(200);
        if (!introCut) cSay(instr(cur));
      }

      rounds = makeRounds();
      startRound(0, true);
      intro();
    },

    exit() {},
  });
})();
