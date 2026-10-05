/* =====================================================================
   Castle Quest — Wizard's Tower (memory matching)
   Wizard Wendell's spell cards got mixed up. Flip two cards; matching
   pairs float up, puff into magic and fill his potion flask.
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#3a2a1a';
  const sw = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  function starPts(cx, cy, R, r, n) {
    n = n || 5;
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? r : R;
      const a = (Math.PI * i) / n - Math.PI / 2;
      pts.push((cx + Math.cos(a) * rad).toFixed(1) + ',' + (cy + Math.sin(a) * rad).toFixed(1));
    }
    return pts.join(' ');
  }
  function spark4(x, y, s) {
    const k = s * 0.28;
    return `M${x} ${y - s} L${x + k} ${y - k} L${x + s} ${y} L${x + k} ${y + k} L${x} ${y + s} L${x - k} ${y + k} L${x - s} ${y} L${x - k} ${y - k} Z`;
  }

  /* ------------------------------------------------------------------
     Card pictures (viewBox 0 0 100 100)
     ------------------------------------------------------------------ */
  const ITEMS = [
    { key: 'owl', name: 'Owl', plural: 'owls', word: 'OWL', tint: '#ffe3c2', art: `
      <path d="M26 40 L20 14 L40 30 Z M74 40 L80 14 L60 30 Z" fill="#8b5a2b" ${sw(4)}/>
      <ellipse cx="50" cy="60" rx="29" ry="32" fill="#8b5a2b" ${sw(4)}/>
      <path d="M26 50 Q10 72 28 92 Q34 76 32 56 Z" fill="#6b4220" ${sw(4)}/>
      <path d="M74 50 Q90 72 72 92 Q66 76 68 56 Z" fill="#6b4220" ${sw(4)}/>
      <ellipse cx="50" cy="73" rx="16" ry="16" fill="#f3d9a8"/>
      <path d="M42 68 l3 3 l3 -3 M52 68 l3 3 l3 -3 M47 77 l3 3 l3 -3" fill="none" stroke="#c49a5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="38" cy="46" r="13" fill="#e8c48e"/><circle cx="62" cy="46" r="13" fill="#e8c48e"/>
      <circle cx="38" cy="46" r="10" fill="#fff" ${sw(3.5)}/><circle cx="62" cy="46" r="10" fill="#fff" ${sw(3.5)}/>
      <circle cx="39" cy="47" r="5.5" fill="${INK}"/><circle cx="61" cy="47" r="5.5" fill="${INK}"/>
      <circle cx="41" cy="45" r="2" fill="#fff"/><circle cx="63" cy="45" r="2" fill="#fff"/>
      <path d="M45 56 L55 56 L50 65 Z" fill="#ffb020" ${sw(3)}/>
      <path d="M42 92 v5 M47 92 v5 M53 92 v5 M58 92 v5" stroke="#ff8c2b" stroke-width="4" stroke-linecap="round"/>` },
    { key: 'frog', name: 'Frog', plural: 'frogs', word: 'FROG', tint: '#d7f5c4', art: `
      <ellipse cx="24" cy="86" rx="13" ry="7" fill="#3fa94a" ${sw(4)}/>
      <ellipse cx="76" cy="86" rx="13" ry="7" fill="#3fa94a" ${sw(4)}/>
      <circle cx="31" cy="38" r="14" fill="#5cc950" ${sw(4)}/>
      <circle cx="69" cy="38" r="14" fill="#5cc950" ${sw(4)}/>
      <ellipse cx="50" cy="63" rx="38" ry="27" fill="#5cc950" ${sw(4)}/>
      <circle cx="31" cy="36" r="9" fill="#fff" ${sw(3)}/><circle cx="69" cy="36" r="9" fill="#fff" ${sw(3)}/>
      <circle cx="32" cy="37" r="4.5" fill="${INK}"/><circle cx="68" cy="37" r="4.5" fill="${INK}"/>
      <circle cx="33.5" cy="35" r="1.6" fill="#fff"/><circle cx="69.5" cy="35" r="1.6" fill="#fff"/>
      <ellipse cx="50" cy="79" rx="20" ry="8" fill="#c7f0a0"/>
      <path d="M30 60 Q50 76 70 60" fill="none" ${sw(4)}/>
      <ellipse cx="22" cy="62" rx="6" ry="4" fill="#ff8fb0"/><ellipse cx="78" cy="62" rx="6" ry="4" fill="#ff8fb0"/>` },
    { key: 'crown', name: 'Crown', plural: 'crowns', word: 'CROWN', tint: '#fff0b3', art: `
      <path d="M14 78 L10 34 L31 54 L50 22 L69 54 L90 34 L86 78 Z" fill="#ffc928" ${sw(4)}/>
      <path d="M24 62 L22 48" stroke="#fff6b0" stroke-width="4" stroke-linecap="round"/>
      <rect x="12" y="68" width="76" height="18" rx="5" fill="#ffb020" ${sw(4)}/>
      <circle cx="50" cy="77" r="6" fill="#e8423f" ${sw(3)}/>
      <circle cx="29" cy="77" r="4.5" fill="#2f7fe0" ${sw(3)}/>
      <circle cx="71" cy="77" r="4.5" fill="#3fb950" ${sw(3)}/>
      <circle cx="10" cy="32" r="5.5" fill="#ff6fae" ${sw(3)}/>
      <circle cx="50" cy="20" r="6" fill="#9b5de5" ${sw(3)}/>
      <circle cx="90" cy="32" r="5.5" fill="#2f7fe0" ${sw(3)}/>` },
    { key: 'moon', name: 'Moon', plural: 'moons', word: 'MOON', tint: '#d9d4ff', art: `
      <path d="M60 12 A40 40 0 1 0 60 90 A44 44 0 0 1 60 12 Z" fill="#ffe14d" ${sw(4)}/>
      <path d="M21 44 Q26 48 31 44" fill="none" ${sw(3.5)}/>
      <ellipse cx="24" cy="56" rx="5" ry="3.5" fill="#ff8fb0"/>
      <path d="M20 65 Q26 71 32 65" fill="none" ${sw(3.5)}/>
      <path d="${spark4(80, 26, 8)}" fill="#fff59a" ${sw(3)}/>
      <path d="${spark4(84, 62, 6)}" fill="#fff59a" ${sw(2.5)}/>
      <path d="${spark4(68, 84, 5)}" fill="#fff59a" ${sw(2.5)}/>` },
    { key: 'star', name: 'Star', plural: 'stars', word: 'STAR', tint: '#ffe0f0', art: `
      <polygon points="${starPts(50, 54, 44, 20)}" fill="#ffc928" ${sw(4)}/>
      <circle cx="42" cy="52" r="4" fill="${INK}"/><circle cx="58" cy="52" r="4" fill="${INK}"/>
      <circle cx="43.3" cy="50.6" r="1.4" fill="#fff"/><circle cx="59.3" cy="50.6" r="1.4" fill="#fff"/>
      <path d="M43 61 Q50 67 57 61" fill="none" ${sw(3.5)}/>
      <ellipse cx="36" cy="60" rx="4" ry="3" fill="#ff8fb0"/><ellipse cx="64" cy="60" rx="4" ry="3" fill="#ff8fb0"/>` },
    { key: 'potion', name: 'Potion', plural: 'potions', word: 'POTION', tint: '#dff3ff', art: `
      <rect x="38" y="6" width="24" height="14" rx="4" fill="#b5763c" ${sw(4)}/>
      <path d="M41 20 L41 38 Q16 50 16 70 Q16 94 50 94 Q84 94 84 70 Q84 50 59 38 L59 20 Z" fill="#eef9ff"/>
      <path d="M19.5 66 Q35 58 50 66 Q65 74 80.5 66 Q82 91 50 91 Q18 91 19.5 66 Z" fill="#ff6fae"/>
      <circle cx="40" cy="77" r="4" fill="#fff" opacity=".85"/><circle cx="58" cy="83" r="3" fill="#fff" opacity=".85"/><circle cx="63" cy="72" r="2.5" fill="#fff" opacity=".85"/>
      <path d="M26 58 Q22 70 28 80" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M41 20 L41 38 Q16 50 16 70 Q16 94 50 94 Q84 94 84 70 Q84 50 59 38 L59 20 Z" fill="none" ${sw(4)}/>
      <path d="${spark4(80, 24, 7)}" fill="#fff59a" ${sw(2.5)}/>` },
    { key: 'cat', name: 'Cat', plural: 'cats', word: 'CAT', tint: '#ffe0c7', art: `
      <path d="M18 46 L20 10 L46 30 Z" fill="#ff9a3c" ${sw(4)}/>
      <path d="M82 46 L80 10 L54 30 Z" fill="#ff9a3c" ${sw(4)}/>
      <path d="M24 36 L25 20 L37 30 Z" fill="#ff8fb0"/>
      <path d="M76 36 L75 20 L63 30 Z" fill="#ff8fb0"/>
      <ellipse cx="50" cy="58" rx="38" ry="32" fill="#ff9a3c" ${sw(4)}/>
      <path d="M44 30 v8 M50 28 v10 M56 30 v8" stroke="#d96a12" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="36" cy="54" rx="9" ry="10" fill="#fff" ${sw(3)}/><ellipse cx="64" cy="54" rx="9" ry="10" fill="#fff" ${sw(3)}/>
      <ellipse cx="37" cy="55" rx="5" ry="7" fill="#7ad14a"/><ellipse cx="63" cy="55" rx="5" ry="7" fill="#7ad14a"/>
      <ellipse cx="37" cy="55" rx="2" ry="5" fill="${INK}"/><ellipse cx="63" cy="55" rx="2" ry="5" fill="${INK}"/>
      <circle cx="39" cy="51" r="1.6" fill="#fff"/><circle cx="65" cy="51" r="1.6" fill="#fff"/>
      <path d="M45 66 L55 66 L50 71 Z" fill="#ff6fae" ${sw(2.5)}/>
      <path d="M50 71 Q46 78 40 74 M50 71 Q54 78 60 74" fill="none" ${sw(3)}/>
      <path d="M28 66 L8 62 M28 71 L9 74 M72 66 L92 62 M72 71 L91 74" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` },
    { key: 'egg', name: 'Dragon egg', plural: 'dragon eggs', word: 'DRAGON EGG', tint: '#e6ffd6', art: `
      <path d="M50 8 C74 8 88 46 88 64 C88 84 72 94 50 94 C28 94 12 84 12 64 C12 46 26 8 50 8 Z" fill="#7fd36b" ${sw(4)}/>
      <circle cx="36" cy="36" r="7" fill="#ffd23f"/><circle cx="62" cy="28" r="5" fill="#ffd23f"/>
      <circle cx="68" cy="70" r="8" fill="#ffd23f"/><circle cx="32" cy="76" r="6" fill="#ffd23f"/><circle cx="52" cy="84" r="4" fill="#ffd23f"/>
      <path d="M14 58 L26 50 L36 60 L48 50 L58 60 L70 50 L86 58" fill="none" ${sw(4)}/>
      <path d="M28 26 Q22 36 22 46" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>` },
    { key: 'book', name: 'Spell book', plural: 'spell books', word: 'SPELL BOOK', tint: '#efe3ff', art: `
      <rect x="20" y="14" width="68" height="76" rx="6" fill="#fffaf0" ${sw(4)}/>
      <path d="M82 22 V82 M86 24 V80" stroke="#d8c9a8" stroke-width="2.5"/>
      <rect x="12" y="10" width="66" height="76" rx="6" fill="#9b5de5" ${sw(4)}/>
      <rect x="12" y="10" width="14" height="76" rx="5" fill="#6a35ad" ${sw(4)}/>
      <circle cx="52" cy="47" r="23" fill="none" stroke="#ffd86b" stroke-width="2.5" stroke-dasharray="3 5"/>
      <polygon points="${starPts(52, 48, 17, 7.5)}" fill="#ffc928" ${sw(3)}/>
      <rect x="70" y="38" width="16" height="18" rx="4" fill="#ffc928" ${sw(3)}/>` },
    { key: 'mushroom', name: 'Mushroom', plural: 'mushrooms', word: 'MUSHROOM', tint: '#ffe0e0', art: `
      <path d="M36 54 Q34 82 28 90 L72 90 Q66 82 64 54 Z" fill="#fff6e0" ${sw(4)}/>
      <path d="M8 56 C8 18 92 18 92 56 Q50 66 8 56 Z" fill="#e8423f" ${sw(4)}/>
      <circle cx="28" cy="41" r="6" fill="#fff"/><circle cx="52" cy="36" r="7" fill="#fff"/>
      <circle cx="74" cy="43" r="5.5" fill="#fff"/><circle cx="42" cy="51" r="3.5" fill="#fff"/>
      <circle cx="44" cy="72" r="3.2" fill="${INK}"/><circle cx="56" cy="72" r="3.2" fill="${INK}"/>
      <path d="M45 79 Q50 83 55 79" fill="none" ${sw(3)}/>
      <ellipse cx="39" cy="78" rx="3.5" ry="2.5" fill="#ff8fb0"/><ellipse cx="61" cy="78" rx="3.5" ry="2.5" fill="#ff8fb0"/>` },
    { key: 'castle', name: 'Castle', plural: 'castles', word: 'CASTLE', tint: '#dcefff', art: `
      <rect x="8" y="34" width="22" height="56" fill="#d8c8ae" ${sw(4)}/>
      <rect x="70" y="34" width="22" height="56" fill="#d8c8ae" ${sw(4)}/>
      <path d="M24 90 V40 H34 V47 H44 V40 H56 V47 H66 V40 H76 V90 Z" fill="#c9b79c" ${sw(4)}/>
      <path d="M5 36 L19 8 L33 36 Z" fill="#e8423f" ${sw(4)}/>
      <path d="M67 36 L81 8 L95 36 Z" fill="#2f7fe0" ${sw(4)}/>
      <path d="M50 40 V14" fill="none" ${sw(3)}/>
      <path d="M50 14 L64 19 L50 24 Z" fill="#ffc928" ${sw(3)}/>
      <path d="M40 90 V76 A10 10 0 0 1 60 76 V90 Z" fill="#7d4a1f" ${sw(4)}/>
      <rect x="15" y="50" width="8" height="13" rx="4" fill="${INK}"/><rect x="77" y="50" width="8" height="13" rx="4" fill="${INK}"/>
      <rect x="46" y="54" width="8" height="11" rx="4" fill="${INK}"/>` },
    { key: 'wand', name: 'Wand', plural: 'wands', word: 'WAND', tint: '#f3e6ff', art: `
      <line x1="22" y1="88" x2="64" y2="36" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
      <line x1="22" y1="88" x2="64" y2="36" stroke="#5b3a8a" stroke-width="6" stroke-linecap="round"/>
      <line x1="56" y1="46" x2="63" y2="37" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <polygon points="${starPts(70, 28, 22, 10)}" fill="#ffc928" ${sw(4)}/>
      <path d="${spark4(26, 48, 6)}" fill="#fff59a" ${sw(2.5)}/>
      <path d="${spark4(86, 66, 6)}" fill="#fff59a" ${sw(2.5)}/>
      <path d="${spark4(70, 82, 4.5)}" fill="#fff59a" ${sw(2)}/>` },
  ];
  const picSVG = it => `<svg class="wz-pic" viewBox="0 0 100 100">${it.art}</svg>`;

  const RUNE = `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="41" fill="none" stroke="#ffd86b" stroke-width="3" stroke-dasharray="4 7" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="31" fill="#3b1f7a" stroke="#ffd86b" stroke-width="4"/>
    <polygon points="${starPts(50, 52, 24, 10)}" fill="#ffc928" ${sw(3.5)}/>
    <circle cx="50" cy="3" r="3.5" fill="#ffd86b"/><circle cx="97" cy="50" r="3.5" fill="#ffd86b"/>
    <circle cx="50" cy="97" r="3.5" fill="#ffd86b"/><circle cx="3" cy="50" r="3.5" fill="#ffd86b"/>
    <path d="${spark4(14, 14, 7)}" fill="#fff59a"/><path d="${spark4(86, 14, 7)}" fill="#fff59a"/>
    <path d="${spark4(14, 86, 7)}" fill="#fff59a"/><path d="${spark4(86, 86, 7)}" fill="#fff59a"/>
  </svg>`;

  /* ------------------------------------------------------------------
     Scenery
     ------------------------------------------------------------------ */
  function bgSVG() {
    let rim = '';
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const x = 640 + Math.cos(a) * 487, y = 345 + Math.sin(a) * 275;
      rim += i % 2
        ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#ffd86b"/>`
        : `<path d="${spark4(+x.toFixed(1), +y.toFixed(1), 10)}" fill="#ffd86b" stroke="${INK}" stroke-width="2"/>`;
    }
    let books = '';
    const bookColors = ['#e8423f', '#2f7fe0', '#ffc928', '#3fb950', '#ff6fae', '#9b5de5', '#ff8c2b'];
    [196, 280, 364, 448].forEach((shelfY, s) => {
      let x = 14;
      let k = s * 2;
      while (x < 112) {
        const bw = 12 + ((k * 7) % 9), bh = 52 + ((k * 13) % 22);
        books += `<rect x="${x}" y="${shelfY - bh}" width="${bw}" height="${bh}" rx="3" fill="${bookColors[k % bookColors.length]}" stroke="${INK}" stroke-width="3"/>`;
        x += bw + 2; k++;
      }
    });
    let planks = '';
    for (let y = 520; y < 720; y += 52) planks += `<path d="M0 ${y} H1280" stroke="#6e4220" stroke-width="3"/>`;
    for (let i = 0; i < 14; i++) {
      const y = 470 + (i % 4) * 52, x = (i * 173) % 1280;
      planks += `<path d="M${x} ${y} V${y + 52}" stroke="#6e4220" stroke-width="3"/>`;
    }
    let folds = '';
    [260, 400, 540, 740, 880, 1020].forEach(x => {
      folds += `<path d="M${x} 560 Q${x + 8} 620 ${x - 4} 690" fill="none" stroke="#1f1548" stroke-width="5" stroke-linecap="round"/>`;
    });
    return `<svg class="wz-bg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <pattern id="wz-stones" width="120" height="64" patternUnits="userSpaceOnUse">
          <rect width="120" height="64" fill="#46397a"/>
          <rect x="3" y="3" width="54" height="26" rx="7" fill="#6a5a9e"/>
          <rect x="63" y="3" width="54" height="26" rx="7" fill="#635595"/>
          <rect x="-27" y="35" width="54" height="26" rx="7" fill="#655697"/>
          <rect x="33" y="35" width="54" height="26" rx="7" fill="#6a5a9e"/>
          <rect x="93" y="35" width="54" height="26" rx="7" fill="#635595"/>
        </pattern>
        <radialGradient id="wz-cloth" cx="50%" cy="45%" r="60%">
          <stop offset="0" stop-color="#6a52c8"/><stop offset=".6" stop-color="#43308f"/><stop offset="1" stop-color="#2c1f66"/>
        </radialGradient>
        <linearGradient id="wz-wallshade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#140a30" stop-opacity=".6"/><stop offset="1" stop-color="#140a30" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="wz-floorg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7a4a26"/><stop offset="1" stop-color="#a06a3c"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="480" fill="url(#wz-stones)"/>
      <rect width="1280" height="480" fill="url(#wz-wallshade)"/>
      <rect y="470" width="1280" height="250" fill="url(#wz-floorg)"/>
      ${planks}
      <rect x="-5" y="462" width="1290" height="16" fill="#3b2f66" stroke="${INK}" stroke-width="4"/>
      <rect x="4" y="112" width="124" height="352" rx="6" fill="#7d4a1f" stroke="${INK}" stroke-width="5"/>
      <rect x="12" y="120" width="108" height="336" fill="#4a2a10"/>
      ${books}
      <rect x="8" y="194" width="116" height="10" fill="#9a6338" stroke="${INK}" stroke-width="3"/>
      <rect x="8" y="278" width="116" height="10" fill="#9a6338" stroke="${INK}" stroke-width="3"/>
      <rect x="8" y="362" width="116" height="10" fill="#9a6338" stroke="${INK}" stroke-width="3"/>
      <rect x="8" y="446" width="116" height="10" fill="#9a6338" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="640" cy="684" rx="610" ry="58" fill="#b8334f" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="640" cy="684" rx="578" ry="45" fill="none" stroke="#ffc928" stroke-width="4" stroke-dasharray="14 10"/>
      <ellipse cx="640" cy="676" rx="500" ry="30" fill="rgba(0,0,0,.3)"/>
      <path d="M135 345 C140 450 150 560 170 652 Q405 712 640 712 Q875 712 1110 652 C1130 560 1140 450 1145 345 Z" fill="#2b1f5c" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      ${folds}
      <path d="M166 636 Q405 698 640 698 Q875 698 1114 636" fill="none" stroke="#ffc928" stroke-width="8" stroke-linecap="round"/>
      <path d="M166 636 Q405 698 640 698 Q875 698 1114 636" fill="none" stroke="#d99a00" stroke-width="3" stroke-dasharray="2 16" stroke-linecap="round"/>
      <ellipse cx="640" cy="345" rx="505" ry="290" fill="url(#wz-cloth)" stroke="${INK}" stroke-width="6"/>
      <ellipse cx="640" cy="345" rx="468" ry="258" fill="none" stroke="#ffc928" stroke-width="5"/>
      <ellipse cx="640" cy="345" rx="455" ry="247" fill="none" stroke="#ffd86b" stroke-width="2" opacity=".6"/>
      ${rim}
      <ellipse cx="640" cy="345" rx="330" ry="190" fill="none" stroke="#ffd86b" stroke-width="4" opacity=".25"/>
      <ellipse cx="640" cy="345" rx="300" ry="168" fill="none" stroke="#ffd86b" stroke-width="3" stroke-dasharray="6 12" opacity=".25"/>
      <polygon points="${starPts(640, 345, 230, 95)}" fill="none" stroke="#ffd86b" stroke-width="3" opacity=".18"/>
    </svg>`;
  }

  // Round tower window (porthole) with a starry night sky.
  const WINDOW_SVG = (() => {
    const stars = [[34, 42, 5], [52, 26, 4], [28, 64, 6], [80, 72, 5], [60, 50, 4], [46, 80, 5], [86, 50, 4], [64, 86, 4]];
    const st = stars.map((s, i) =>
      `<path class="wz-twinkle" d="${spark4(s[0], s[1], s[2])}" fill="#fff7b0" style="animation-delay:${(-i * 0.37).toFixed(2)}s"/>`).join('');
    return `<svg viewBox="0 0 110 110">
      <defs>
        <linearGradient id="wz-skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140c3d"/><stop offset="1" stop-color="#3d2a8f"/></linearGradient>
        <clipPath id="wz-skyclip"><circle cx="55" cy="55" r="40"/></clipPath>
      </defs>
      <circle cx="55" cy="55" r="53" fill="#8a7bb8" ${sw(5)}/>
      <path d="M55 2 V15 M55 95 V108 M2 55 H15 M95 55 H108 M18 18 L27 27 M92 18 L83 27 M18 92 L27 83 M92 92 L83 83" stroke="${INK}" stroke-width="3" opacity=".55"/>
      <circle cx="55" cy="55" r="40" fill="url(#wz-skyg)"/>
      <g clip-path="url(#wz-skyclip)">
        <circle cx="72" cy="34" r="11" fill="#fff3b0" ${sw(3)}/>
        <circle cx="69" cy="31" r="2.5" fill="#f0dc8a"/><circle cx="76" cy="38" r="2" fill="#f0dc8a"/>
        ${st}
        <g class="wz-shoot">
          <path d="M18 30 L-18 12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
          <path d="${spark4(18, 30, 7)}" fill="#fff59a"/>
        </g>
        <path d="M10 100 Q30 78 50 88 Q72 70 100 84 V110 H10 Z" fill="#2a1f5c"/>
      </g>
      <circle cx="55" cy="55" r="40" fill="none" ${sw(4)}/>
      <path d="M55 15 V95 M15 55 H95" stroke="${INK}" stroke-width="4" opacity=".5"/>
    </svg>`;
  })();

  // Brass telescope on a tripod, aimed up-right at the window.
  const SCOPE_SVG = `<svg viewBox="0 0 100 112">
    <rect x="0" y="0" width="100" height="108" fill="transparent"/>
    <path d="M40 64 L12 108 M40 64 L68 108 M40 64 L40 108" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M40 64 L12 108 M40 64 L68 108 M40 64 L40 108" stroke="#b5763c" stroke-width="4.5" stroke-linecap="round"/>
    <g transform="rotate(142 40 62)"><g class="wz-scopetube">
      <rect x="-10" y="53" width="56" height="18" rx="5" fill="#ffb020" ${sw(4)}/>
      <rect x="-18" y="49" width="16" height="26" rx="5" fill="#d99a00" ${sw(4)}/>
      <rect x="44" y="57" width="18" height="10" rx="3" fill="#7d4a1f" ${sw(3.5)}/>
      <path d="M12 54 V70 M28 54 V70" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="-16" cy="62" rx="2.5" ry="9" fill="#bfe8ff"/>
    </g></g>
    <circle cx="40" cy="62" r="6" fill="#ffc928" ${sw(3)}/>
  </svg>`;

  function bookSVG(color) {
    return `<svg viewBox="0 0 84 66">
      <rect x="0" y="0" width="84" height="66" fill="transparent"/>
      <g class="wz-bookL">
        <path d="M42 54 L6 42 L6 10 L42 22 Z" fill="${color}" ${sw(4)}/>
        <path d="M42 49 L12 39 L12 15 L42 25 Z" fill="#fffaf0" ${sw(2.5)}/>
        <path d="M18 23 L36 29 M18 29 L36 35 M18 35 L30 39" stroke="#b9a7d8" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <g class="wz-bookR">
        <path d="M42 54 L78 42 L78 10 L42 22 Z" fill="${color}" ${sw(4)}/>
        <path d="M42 49 L72 39 L72 15 L42 25 Z" fill="#fffaf0" ${sw(2.5)}/>
        <path d="M66 23 L48 29 M66 29 L48 35 M66 35 L54 39" stroke="#b9a7d8" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <path d="M42 22 V54" fill="none" ${sw(4)}/>
    </svg>`;
  }

  const BALL_SVG = `<svg viewBox="0 0 110 122">
    <defs>
      <radialGradient id="wz-ballg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f6ecff"/><stop offset=".45" stop-color="#b98cff"/><stop offset="1" stop-color="#5b2a9a"/></radialGradient>
      <clipPath id="wz-ballclip"><circle cx="55" cy="52" r="40"/></clipPath>
    </defs>
    <circle class="wz-ballglow" cx="55" cy="52" r="52" fill="#d6b3ff" opacity=".35"/>
    <path d="M28 116 Q32 96 42 90 L68 90 Q78 96 82 116 Z" fill="#ffc928" ${sw(4)}/>
    <rect x="18" y="110" width="74" height="11" rx="5" fill="#d99a00" ${sw(4)}/>
    <circle cx="55" cy="52" r="42" fill="url(#wz-ballg)" ${sw(5)}/>
    <g clip-path="url(#wz-ballclip)"><g class="wz-swirl">
      <path d="M20 52 Q37 28 55 52 T90 52" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <path d="M30 72 Q50 58 72 74" fill="none" stroke="#ff9be0" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <path d="M34 34 Q55 22 76 36" fill="none" stroke="#9cf0ff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <circle cx="70" cy="44" r="3" fill="#fff"/><circle cx="40" cy="62" r="2.5" fill="#fff"/><circle cx="58" cy="80" r="2" fill="#fff"/>
    </g></g>
    <ellipse cx="39" cy="33" rx="10" ry="6" fill="#fff" opacity=".85" transform="rotate(-35 39 33)"/>
  </svg>`;

  const OWL_SVG = `<svg viewBox="0 0 120 152">
    <rect x="55" y="112" width="12" height="40" fill="#7d4a1f" ${sw(4)}/>
    <rect x="6" y="106" width="108" height="12" rx="6" fill="#9a6338" ${sw(4)}/>
    <g class="wz-owlbody">
      <path class="wz-wingL" d="M34 58 Q14 80 26 104 Q40 96 40 66 Z" fill="#6b4220" ${sw(4)}/>
      <path class="wz-wingR" d="M86 58 Q106 80 94 104 Q80 96 80 66 Z" fill="#6b4220" ${sw(4)}/>
      <ellipse cx="60" cy="72" rx="30" ry="36" fill="#8b5a2b" ${sw(4.5)}/>
      <ellipse cx="60" cy="87" rx="18" ry="18" fill="#f3d9a8"/>
      <path d="M52 81 l3 3 l3 -3 M62 81 l3 3 l3 -3 M57 91 l3 3 l3 -3" fill="none" stroke="#c49a5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="47" cy="62" r="14" fill="#e8c48e"/><circle cx="73" cy="62" r="14" fill="#e8c48e"/>
      <g class="wz-blink" style="animation-delay:-2.2s">
        <circle cx="47" cy="62" r="10.5" fill="#fff" ${sw(3.5)}/><circle cx="73" cy="62" r="10.5" fill="#fff" ${sw(3.5)}/>
        <circle cx="48" cy="63" r="5.5" fill="${INK}"/><circle cx="72" cy="63" r="5.5" fill="${INK}"/>
        <circle cx="50" cy="60.5" r="2" fill="#fff"/><circle cx="74" cy="60.5" r="2" fill="#fff"/>
      </g>
      <path d="M55 72 L65 72 L60 82 Z" fill="#ffb020" ${sw(3)}/>
      <path d="M50 106 v6 M55 106 v6 M65 106 v6 M70 106 v6" stroke="#ff8c2b" stroke-width="4" stroke-linecap="round"/>
      <path d="M42 42 L66 4 L80 40 Z" fill="#6a3fc0" ${sw(4)}/>
      <ellipse cx="61" cy="41" rx="25" ry="6" fill="#7b4bd1" ${sw(3.5)}/>
      <polygon points="${starPts(64, 27, 5.5, 2.4)}" fill="#ffe14d"/>
    </g>
  </svg>`;

  const CAULDRON_SVG = `<svg viewBox="0 0 230 165">
    <g class="wz-fire">
      <path d="M66 162 Q56 132 78 118 Q76 136 90 142 Q88 120 110 106 Q108 130 122 136 Q126 116 142 114 Q136 136 152 132 Q166 146 162 162 Z" fill="#ff8c2b" ${sw(4)}/>
      <path d="M90 162 Q86 144 100 136 Q102 150 114 152 Q118 138 130 136 Q130 150 140 162 Z" fill="#ffd23f"/>
    </g>
    <path d="M60 104 L48 142 M170 104 L182 142" fill="none" ${sw(9)}/>
    <rect x="54" y="150" width="122" height="13" rx="6" fill="#7d4a1f" ${sw(4)}/>
    <path d="M28 40 Q18 112 115 120 Q212 112 202 40 Z" fill="#4b4366" ${sw(5)}/>
    <path d="M44 62 Q44 92 68 106" fill="none" stroke="#6d6491" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="115" cy="40" rx="95" ry="20" fill="#5d5480" ${sw(5)}/>
    <ellipse class="wz-brew" cx="115" cy="40" rx="81" ry="13" ${sw(3)}/>
    <ellipse cx="90" cy="36" rx="20" ry="4" fill="#fff" opacity=".35"/>
    <circle class="wz-cbub" cx="78" cy="36" r="8" ${sw(3)}/>
    <circle class="wz-cbub" cx="120" cy="32" r="10" ${sw(3)} style="animation-delay:-.6s"/>
    <circle class="wz-cbub" cx="152" cy="38" r="7" ${sw(3)} style="animation-delay:-1.1s"/>
    <circle class="wz-cbub" cx="100" cy="42" r="6" ${sw(3)} style="animation-delay:-1.5s"/>
  </svg>`;

  const FLASK_PATH = 'M74 24 L74 116 A86 86 0 1 0 116 116 L116 24 Z';
  const FLASK_EMPTY = 292, FLASK_FULL = 104;
  const FLASK_SVG = (() => {
    let wave = 'M-100 6';
    for (let x = -100, i = 0; x < 300; x += 40, i++) wave += ` Q${x + 20} ${i % 2 ? 15 : -3} ${x + 40} 6`;
    wave += ' V340 H-100 Z';
    const bubbles = [[70, 170, 6, 0], [100, 175, 5, -0.7], [122, 168, 7, -1.4], [86, 172, 4, -1.9], [110, 178, 5, -2.3]]
      .map(b => `<circle class="wz-fb" cx="${b[0]}" cy="${b[1]}" r="${b[2]}" style="animation-delay:${b[3]}s"/>`).join('');
    return `<svg viewBox="0 0 190 300">
      <defs><clipPath id="wz-flaskclip"><path d="${FLASK_PATH}"/></clipPath></defs>
      <ellipse cx="95" cy="292" rx="72" ry="8" fill="rgba(0,0,0,.3)"/>
      <path d="${FLASK_PATH}" fill="rgba(214,240,255,.5)"/>
      <g clip-path="url(#wz-flaskclip)">
        <g class="wz-liquidg">
          <g class="wz-wave"><path class="wz-liquid" d="${wave}"/></g>
          ${bubbles}
        </g>
      </g>
      <path d="M50 160 Q40 205 62 250" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>
      <path d="M84 36 V100" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
      <path d="M150 168 h12 M154 198 h10 M150 228 h12" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
      <path d="${FLASK_PATH}" fill="none" ${sw(6)}/>
      <rect x="62" y="12" width="66" height="16" rx="8" fill="#e6f6ff" ${sw(5)}/>
      <circle class="wz-froth" cx="80" cy="8" r="9" ${sw(3)}/>
      <circle class="wz-froth" cx="100" cy="2" r="11" ${sw(3)} style="animation-delay:-.5s"/>
      <circle class="wz-froth" cx="116" cy="9" r="8" ${sw(3)} style="animation-delay:-1s"/>
    </svg>`;
  })();

  const WENDELL_SVG = `<svg viewBox="0 0 240 372">
    <ellipse cx="120" cy="362" rx="96" ry="9" fill="rgba(0,0,0,.28)"/>
    <ellipse cx="90" cy="358" rx="28" ry="10" fill="#e8423f" ${sw(4)}/>
    <ellipse cx="152" cy="358" rx="28" ry="10" fill="#e8423f" ${sw(4)}/>
    <path d="M84 184 Q58 262 24 350 Q120 372 216 350 Q182 262 156 184 Z" fill="#6a3fc0" ${sw(5)}/>
    <path d="M30 340 Q120 360 210 340" fill="none" stroke="#ffc928" stroke-width="7" stroke-linecap="round"/>
    <polygon points="${starPts(64, 300, 9, 4)}" fill="#ffc928" ${sw(2.5)}/>
    <polygon points="${starPts(172, 308, 8, 3.5)}" fill="#ffc928" ${sw(2.5)}/>
    <polygon points="${starPts(152, 260, 6, 2.6)}" fill="#ffe14d" ${sw(2)}/>
    <polygon points="${starPts(84, 250, 6, 2.6)}" fill="#ffe14d" ${sw(2)}/>
    <circle cx="116" cy="326" r="7" fill="#fff3b0" ${sw(2.5)}/>
    <path d="M92 194 Q56 204 50 250 L80 258 Q84 228 106 210 Z" fill="#7b4bd1" ${sw(5)}/>
    <g class="wz-wand">
      <line x1="212" y1="168" x2="226" y2="104" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <line x1="212" y1="168" x2="226" y2="104" stroke="#8b5a2b" stroke-width="4.5" stroke-linecap="round"/>
      <polygon class="wz-wandstar" points="${starPts(227, 96, 14, 6)}" fill="#ffe14d" ${sw(3)}/>
    </g>
    <path d="M148 196 Q186 198 204 162 L226 178 Q206 224 158 236 Z" fill="#7b4bd1" ${sw(5)}/>
    <circle cx="214" cy="164" r="13" fill="#ffd9b0" ${sw(4)}/>
    <circle cx="80" cy="134" r="10" fill="#ffd9b0" ${sw(4)}/>
    <circle cx="160" cy="134" r="10" fill="#ffd9b0" ${sw(4)}/>
    <circle cx="120" cy="130" r="42" fill="#ffd9b0" ${sw(5)}/>
    <g class="wz-beard">
      <path d="M78 140 Q70 222 120 306 Q170 222 162 140 Q150 172 120 174 Q90 172 78 140 Z" fill="#fff" ${sw(5)}/>
      <path d="M100 196 Q104 228 114 260 M140 196 Q136 230 126 262 M120 200 V280" fill="none" stroke="#d6d6ea" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <circle cx="66" cy="254" r="12" fill="#ffd9b0" ${sw(4)}/>
    <ellipse class="wz-mouth" cx="120" cy="176" rx="8" ry="4.5" fill="#7a1f2b" ${sw(3)}/>
    <path d="M120 156 Q102 146 84 162 Q100 172 120 162 Q140 172 156 162 Q138 146 120 156 Z" fill="#fff" ${sw(4)}/>
    <ellipse cx="120" cy="147" rx="11" ry="10" fill="#ffb08a" ${sw(4)}/>
    <ellipse cx="91" cy="150" rx="8" ry="5" fill="#ff8fb0" opacity=".75"/>
    <ellipse cx="149" cy="150" rx="8" ry="5" fill="#ff8fb0" opacity=".75"/>
    <circle cx="100" cy="128" r="15" fill="#eaf6ff" ${sw(4)}/>
    <circle cx="140" cy="128" r="15" fill="#eaf6ff" ${sw(4)}/>
    <path d="M115 127 Q120 122 125 127" fill="none" ${sw(4)}/>
    <g class="wz-blink">
      <circle cx="102" cy="130" r="6" fill="${INK}"/><circle cx="142" cy="130" r="6" fill="${INK}"/>
      <circle cx="104" cy="127.5" r="2.2" fill="#fff"/><circle cx="144" cy="127.5" r="2.2" fill="#fff"/>
    </g>
    <path d="M91 121 Q95 117 99 119" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="98" cy="113" rx="15" ry="6" fill="#fff" ${sw(3.5)} transform="rotate(-8 98 113)"/>
    <ellipse cx="142" cy="113" rx="15" ry="6" fill="#fff" ${sw(3.5)} transform="rotate(8 142 113)"/>
    <path d="M72 92 C88 68 98 42 112 20 C122 6 150 6 168 24 C152 20 140 26 140 42 C146 60 158 78 168 92 Z" fill="#6a3fc0" ${sw(5)}/>
    <polygon points="${starPts(106, 56, 8, 3.5)}" fill="#ffe14d" ${sw(2.5)}/>
    <polygon points="${starPts(124, 34, 6, 2.6)}" fill="#ffe14d" ${sw(2)}/>
    <circle cx="133" cy="58" r="5" fill="#fff3b0" ${sw(2.5)}/>
    <path d="M84 72 Q120 82 156 72 L160 84 Q120 94 80 84 Z" fill="#ffc928" ${sw(3.5)}/>
    <ellipse cx="120" cy="96" rx="76" ry="14" fill="#7b4bd1" ${sw(5)}/>
    <polygon class="wz-hattip" points="${starPts(170, 26, 11, 5)}" fill="#ffe14d" ${sw(3)}/>
  </svg>`;

  /* ------------------------------------------------------------------
     Room CSS
     ------------------------------------------------------------------ */
  const CSS = `
  .scene-wizard { background: #2e2160; }
  .scene-wizard .wz-bg { position: absolute; left: 0; top: 0; pointer-events: none; }
  .scene-wizard .wz-abs { position: absolute; }
  .scene-wizard .wz-abs > svg { display: block; width: 100%; height: 100%; overflow: visible; }
  .scene-wizard .wz-tap { pointer-events: none; cursor: pointer; }
  .scene-wizard .wz-tap svg * { pointer-events: visiblePainted; }
  .scene-wizard .wz-tap:hover > svg { filter: brightness(1.08) drop-shadow(0 0 8px rgba(255,240,160,.75)); }
  .scene-wizard .wz-window, .scene-wizard .wz-scope, .scene-wizard .wz-book,
  .scene-wizard .wz-ball, .scene-wizard .wz-owl { z-index: 4; }
  .scene-wizard .wz-wendell, .scene-wizard .wz-flask, .scene-wizard .wz-cauldron { z-index: 6; }

  /* window + shooting star */
  .scene-wizard .wz-twinkle { transform-box: fill-box; transform-origin: center; animation: wz-tw 2.6s ease-in-out infinite; }
  @keyframes wz-tw { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.55); } }
  .scene-wizard .wz-window.zap .wz-twinkle { animation: wz-flare .5s ease-in-out 3; }
  @keyframes wz-flare { 50% { opacity: 1; transform: scale(1.9); } }
  .scene-wizard .wz-shoot { opacity: 0; }
  .scene-wizard .wz-shoot.go { animation: wz-shoot 1s ease-in forwards; }
  @keyframes wz-shoot { 0% { opacity: 0; transform: translate(0, 0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(90px, 50px); } }

  /* telescope */
  .scene-wizard .wz-scopetube { transform-origin: 40px 62px; }
  .scene-wizard .wz-scope.zap .wz-scopetube { animation: wz-scope 1s ease-in-out; }
  @keyframes wz-scope { 35% { transform: rotate(14deg); } 70% { transform: rotate(-6deg); } }

  /* floating books */
  .scene-wizard .wz-book > svg { animation: wz-bob 3.2s ease-in-out infinite; }
  @keyframes wz-bob { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-10px) rotate(4deg); } }
  .scene-wizard .wz-bookL, .scene-wizard .wz-bookR { transform-origin: 42px 40px; }
  .scene-wizard .wz-bookL { animation: wz-pageL 1.6s ease-in-out infinite; }
  .scene-wizard .wz-bookR { animation: wz-pageR 1.6s ease-in-out infinite; }
  @keyframes wz-pageL { 50% { transform: rotate(-12deg); } }
  @keyframes wz-pageR { 50% { transform: rotate(12deg); } }
  .scene-wizard .wz-book.zap > svg { animation: wz-bookzap .9s ease-in-out; }
  @keyframes wz-bookzap { 45% { transform: translateY(-18px) rotate(200deg) scale(1.15); } 100% { transform: rotate(360deg); } }
  .scene-wizard .wz-book.zap .wz-bookL, .scene-wizard .wz-book.zap .wz-bookR { animation-duration: .25s; }

  /* crystal ball */
  .scene-wizard .wz-swirl { transform-origin: 55px 52px; animation: wz-spin 5s linear infinite; }
  @keyframes wz-spin { to { transform: rotate(360deg); } }
  .scene-wizard .wz-ballglow { transform-box: fill-box; transform-origin: center; animation: wz-glowpulse 2.4s ease-in-out infinite; }
  @keyframes wz-glowpulse { 50% { opacity: .6; transform: scale(1.08); } }
  .scene-wizard .wz-ball.zap .wz-swirl { animation-duration: .6s; }
  .scene-wizard .wz-ball.zap > svg { animation: wz-hue 1.5s linear; }
  @keyframes wz-hue { 50% { filter: hue-rotate(180deg) brightness(1.2) drop-shadow(0 0 18px #d6b3ff); transform: scale(1.06); } }

  /* owl */
  .scene-wizard .wz-owlbody { transform-origin: 60px 108px; animation: wz-owlidle 5s ease-in-out infinite; }
  @keyframes wz-owlidle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  .scene-wizard .wz-wingL { transform-origin: 34px 62px; }
  .scene-wizard .wz-wingR { transform-origin: 86px 62px; }
  .scene-wizard .wz-owl.hoot .wz-owlbody { animation: wz-hoot .8s ease-in-out; }
  @keyframes wz-hoot { 20% { transform: scale(1.1, .9); } 45% { transform: scale(.94, 1.1) translateY(-4px); } 70% { transform: scale(1.06, .95); } }
  .scene-wizard .wz-owl.hoot .wz-wingL { animation: wz-flapL .25s ease-in-out 3; }
  .scene-wizard .wz-owl.hoot .wz-wingR { animation: wz-flapR .25s ease-in-out 3; }
  @keyframes wz-flapL { 50% { transform: rotate(38deg); } }
  @keyframes wz-flapR { 50% { transform: rotate(-38deg); } }

  /* blinking (Wendell + owl) */
  .scene-wizard .wz-blink { transform-box: fill-box; transform-origin: center; animation: wz-blink 4.6s infinite; }
  @keyframes wz-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }

  /* Wizard Wendell */
  .scene-wizard .wz-wendell > svg { transform-origin: 50% 100%; animation: wz-breathe 3.4s ease-in-out infinite; }
  @keyframes wz-breathe { 50% { transform: scale(1.012, .99); } }
  .scene-wizard .wz-wendell.hop > svg { animation: wz-hop .6s ease-out; }
  @keyframes wz-hop { 35% { transform: translateY(-18px) rotate(-3deg); } 70% { transform: translateY(0) scale(1.03, .97); } }
  .scene-wizard .wz-beard { transform-origin: 120px 150px; animation: wz-sway 3s ease-in-out infinite; }
  @keyframes wz-sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
  .scene-wizard .wz-wendell.talking .wz-mouth { transform-box: fill-box; transform-origin: center; animation: wz-talk .2s ease-in-out infinite alternate; }
  @keyframes wz-talk { from { transform: scaleY(.6); } to { transform: scaleY(2.2); } }
  .scene-wizard .wz-wand { transform-origin: 214px 164px; animation: wz-wandidle 4s ease-in-out infinite; }
  @keyframes wz-wandidle { 50% { transform: rotate(-6deg); } }
  .scene-wizard .wz-wendell.cast .wz-wand { animation: wz-cast .9s ease-in-out; }
  @keyframes wz-cast { 25% { transform: rotate(-30deg); } 55% { transform: rotate(25deg); } 80% { transform: rotate(-8deg); } }
  .scene-wizard .wz-wandstar, .scene-wizard .wz-hattip { transform-box: fill-box; transform-origin: center; animation: wz-spin 6s linear infinite; }
  .scene-wizard .wz-wendell.cast .wz-wandstar { animation: wz-starpop .9s ease-out; }
  @keyframes wz-starpop { 40% { transform: scale(1.8) rotate(90deg); filter: drop-shadow(0 0 8px #fff59a); } }

  /* cauldron */
  .scene-wizard .wz-cauldron { --brew: #7ee05a; }
  .scene-wizard .wz-cauldron > svg { transform-origin: 50% 100%; }
  .scene-wizard .wz-fire { transform-origin: 115px 162px; animation: wz-flick .35s ease-in-out infinite alternate; }
  @keyframes wz-flick { from { transform: scale(1, .9); } to { transform: scale(.94, 1.08); } }
  .scene-wizard .wz-brew { fill: var(--brew); transition: fill .5s; }
  .scene-wizard .wz-cbub { fill: var(--brew); transition: fill .5s; transform-box: fill-box; transform-origin: center; animation: wz-cbub 1.8s ease-in infinite; }
  @keyframes wz-cbub { 0% { transform: translateY(6px) scale(.3); opacity: 0; } 20% { opacity: 1; } 85% { transform: translateY(-26px) scale(1.1); opacity: 1; } 100% { transform: translateY(-30px) scale(1.4); opacity: 0; } }
  .scene-wizard .wz-cauldron.zap > svg { animation: wz-slosh .6s ease-in-out; }
  @keyframes wz-slosh { 25% { transform: rotate(-3deg) scale(1.04); } 60% { transform: rotate(3deg); } }
  .scene-wizard .wz-cauldron.zap .wz-cbub { animation-duration: .5s; }

  /* potion flask (progress) */
  .scene-wizard .wz-flask { --potion: #ff6fae; }
  .scene-wizard .wz-flask > svg { transform-origin: 50% 100%; transition: filter .6s; }
  .scene-wizard .wz-liquidg { transition: transform 1.1s cubic-bezier(.3,1.25,.5,1); }
  .scene-wizard .wz-liquid { fill: var(--potion); transition: fill .9s; }
  .scene-wizard .wz-wave { animation: wz-wave 2.2s linear infinite; }
  @keyframes wz-wave { to { transform: translateX(-80px); } }
  .scene-wizard .wz-fb { fill: rgba(255,255,255,.6); transform-box: fill-box; transform-origin: center; animation: wz-fb 2.6s ease-in infinite; }
  @keyframes wz-fb { 0% { transform: translateY(0) scale(.5); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-170px) scale(1.2); opacity: 0; } }
  .scene-wizard .wz-froth { fill: var(--potion); opacity: 0; transform-box: fill-box; transform-origin: 50% 100%; }
  .scene-wizard .wz-flask.full .wz-froth { animation: wz-froth 1.6s ease-in-out infinite; }
  @keyframes wz-froth { 0% { opacity: 0; transform: translateY(10px) scale(.3); } 30% { opacity: 1; transform: translateY(-6px) scale(1.1); } 100% { opacity: 0; transform: translateY(-28px) scale(1.3); } }
  .scene-wizard .wz-flask.full > svg { filter: drop-shadow(0 0 16px var(--potion)); }
  .scene-wizard .wz-flask.glug > svg { animation: wz-glug .5s ease-in-out; }
  @keyframes wz-glug { 30% { transform: scale(1.06, .94); } 65% { transform: scale(.97, 1.04); } }

  /* cards */
  .scene-wizard .wz-card { position: absolute; z-index: 10; perspective: 900px; cursor: pointer; }
  .scene-wizard .wz-lift { position: relative; width: 100%; height: 100%; border-radius: 18px;
    transform: rotate(var(--tilt, 0deg)); transition: transform .18s ease-out; }
  .scene-wizard .wz-card:not(.up):not(.matched):hover .wz-lift { transform: rotate(var(--tilt, 0deg)) translateY(-5px) scale(1.04); }
  .scene-wizard .wz-card:not(.up):not(.matched):active .wz-lift { transform: rotate(var(--tilt, 0deg)) scale(.96); }
  .scene-wizard .wz-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d;
    transition: transform .5s cubic-bezier(.35,1.45,.55,1); }
  .scene-wizard .wz-card.up .wz-inner { transform: rotateY(180deg); }
  .scene-wizard .wz-face { position: absolute; inset: 0; border: 5px solid ${INK}; border-radius: 18px;
    -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; align-items: center; justify-content: center;
    overflow: hidden; box-shadow: 0 7px 0 rgba(20,10,50,.55); }
  .scene-wizard .wz-back { background: radial-gradient(circle at 50% 38%, #9c6cf0 0%, #6a3fc0 55%, #4a2690 100%); }
  .scene-wizard .wz-back::before { content: ''; position: absolute; inset: 7px; border: 3px dashed rgba(255,216,107,.75); border-radius: 11px; }
  .scene-wizard .wz-back svg { width: 74%; height: auto; }
  .scene-wizard .wz-front { transform: rotateY(180deg); background: radial-gradient(circle at 50% 50%, var(--tint, #fff0b3) 0 46%, #fffaf0 47%); }
  .scene-wizard .wz-front .wz-pic { width: 86%; height: auto; overflow: visible; }
  .scene-wizard .wz-front.word { background: #fffaf0 repeating-linear-gradient(transparent 0 22px, rgba(155,93,229,.16) 22px 24px); }
  .scene-wizard .wz-word { font-weight: 800; color: #7b3fd0; text-align: center; line-height: 1.05; letter-spacing: .04em;
    -webkit-text-stroke: 1.2px ${INK}; paint-order: stroke fill; }
  .scene-wizard .wz-card.matched .wz-front { box-shadow: 0 0 0 5px #fff59a, 0 0 28px 12px #ffd23f; }
  .scene-wizard .wz-card.hint .wz-lift { animation: wz-hint 1.1s ease-in-out infinite; }
  @keyframes wz-hint { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,245,154,0); }
    50% { box-shadow: 0 0 0 7px #fff59a, 0 0 34px 14px #ffd23f; transform: rotate(var(--tilt, 0deg)) scale(1.05); } }
  .scene-wizard .wz-card.nope .wz-lift { animation: wz-nope .45s ease-in-out; }
  @keyframes wz-nope { 20% { transform: rotate(var(--tilt, 0deg)) translateX(-7px); } 40% { transform: rotate(var(--tilt, 0deg)) translateX(7px); }
    60% { transform: rotate(var(--tilt, 0deg)) translateX(-5px); } 80% { transform: rotate(var(--tilt, 0deg)) translateX(4px); } }

  /* magic puffs + floating dust */
  .scene-wizard .wz-puff { position: absolute; z-index: 12; pointer-events: none; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,.95) 0 20%, rgba(214,179,255,.85) 45%, rgba(155,93,229,0) 70%);
    animation: wz-puff .9s ease-out both; }
  @keyframes wz-puff { from { transform: scale(.2); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
  .scene-wizard .wz-mote { position: absolute; z-index: 3; width: 7px; height: 7px; border-radius: 50%; pointer-events: none;
    background: #fff6b0; box-shadow: 0 0 10px 3px rgba(255,225,77,.7); opacity: 0; animation: wz-mote 8s linear infinite; }
  @keyframes wz-mote { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: .9; } 80% { opacity: .7; } 100% { opacity: 0; transform: translate(30px, -140px); } }
  `;

  /* ------------------------------------------------------------------
     Words + tuning
     ------------------------------------------------------------------ */
  const PAIRS = { 1: [3, 3, 3], 2: [4, 5, 6], 3: [6, 8, 7] };
  const POTION_CHOICES = [
    { color: '#ff6fae', name: 'pink' }, { color: '#3fd0e0', name: 'sparkly blue' },
    { color: '#7ee05a', name: 'bubbly green' }, { color: '#ffc928', name: 'golden' },
    { color: '#ff8c2b', name: 'orange' }, { color: '#c084ff', name: 'purple' },
  ];
  const BREWS = ['#7ee05a', '#ff6fae', '#3fd0e0', '#ffc928', '#c084ff', '#ff8c2b'];
  const FLIP_NOTES = ['C6', 'D6', 'E6', 'G6', 'A6'];
  const DEAL_NOTES = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'A5', 'G5'];
  const WENDELL_LINES = [
    'Now where did I put my glasses? Oh! On my nose!',
    'Hee hee! My beard is very tickly!',
    'Abracadabra! Oops, wrong spell!',
    'I once turned my hat into a frog!',
    'Hello, little wizard!',
  ];
  const BALL_LINES = ['Ooh! I see... a clever wizard!', 'I see... lots of matching pairs!', 'The crystal ball says... you are super!'];
  const MISS_LINES = ['Hmm, not a match. Keep trying!', 'Oopsy! Those are different.', 'So close! Remember where they are.'];

  const AREA = { x: 262, y: 112, w: 756, h: 466 };   // card zone: clear of Wendell, flask, title and Pip's bubble
  const GAP = 14, RATIO = 1.1, MAXW = 150;
  const MOUTH = { x: 1066 + 95, y: 238 + 16 };        // flask opening in stage px
  const WAND = { x: 8 + 227, y: 176 + 96 };            // Wendell's wand tip in stage px

  function layoutGrid(n) {
    let best = null;
    for (let cols = 2; cols <= 8; cols++) {
      const rows = Math.ceil(n / cols);
      if (rows * cols - n >= cols) continue;
      const w = Math.min((AREA.w - (cols - 1) * GAP) / cols, (AREA.h - (rows - 1) * GAP) / rows / RATIO, MAXW);
      if (!best || w > best.w + 0.5) best = { cols, rows, w };
    }
    const w = Math.floor(best.w), h = Math.floor(best.w * RATIO);
    const totalH = best.rows * h + (best.rows - 1) * GAP;
    const top = AREA.y + (AREA.h - totalH) / 2;
    const pos = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / best.cols), c = i % best.cols;
      const inRow = r < best.rows - 1 ? best.cols : n - best.cols * (best.rows - 1);
      const rowW = inRow * w + (inRow - 1) * GAP;
      const left = AREA.x + (AREA.w - rowW) / 2;
      pos.push({ x: Math.round(left + c * (w + GAP)), y: Math.round(top + r * (h + GAP)) });
    }
    return { w, h, pos };
  }

  function wordSize(word, w) {
    const maxLen = Math.max.apply(null, word.split(' ').map(s => s.length));
    return Math.floor(Math.min(w * 0.36, (w * 0.8) / (maxLen * 0.7)));
  }

  /* ------------------------------------------------------------------
     The room
     ------------------------------------------------------------------ */
  Castle.registerRoom({
    id: 'wizard',
    title: "Wizard's Tower",
    jewel: 'amethyst',

    enter(root, api) {
      const D = Math.max(1, Math.min(3, Math.round(api.difficulty) || 1));
      const HINT_AFTER = D === 1 ? 2 : 3;
      const WHO = { who: 'Wizard Wendell', pitch: 0.9, rate: 0.95 };
      const POTIONS = api.shuffle(POTION_CHOICES).slice(0, 3);

      root.appendChild(api.el('style', { text: CSS }));
      root.appendChild(api.svg(bgSVG()));

      for (let i = 0; i < 12; i++) {
        root.appendChild(api.el('div', { class: 'wz-mote', style: {
          left: (270 + Math.random() * 740) + 'px', top: (160 + Math.random() * 420) + 'px',
          animationDelay: (-Math.random() * 8).toFixed(2) + 's', animationDuration: (7 + Math.random() * 4).toFixed(2) + 's',
        } }));
      }

      function prop(cls, x, y, w, h, html) {
        const d = api.el('div', { class: 'wz-abs wz-tap ' + cls, style: { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }, html });
        root.appendChild(d);
        return d;
      }
      // Top band between the title (x 118–420) and the HUD tray (x > 740); everything ends above y 112.
      const scopeEl = prop('wz-scope', 428, -4, 100, 112, SCOPE_SVG);
      const winEl = prop('wz-window', 530, 0, 108, 108, WINDOW_SVG);
      const book1 = prop('wz-book', 644, 16, 78, 62, bookSVG('#e8423f'));
      // Second book floats below the back button, above Wendell's hat.
      const book2 = prop('wz-book', 14, 114, 84, 66, bookSVG('#2f7fe0'));
      book2.firstElementChild.style.animationDelay = '-1.5s';
      const ballEl = prop('wz-ball', 1028, 100, 110, 122, BALL_SVG);
      const owlEl = prop('wz-owl', 1150, 94, 120, 152, OWL_SVG);
      const flaskEl = prop('wz-flask', 1066, 238, 190, 300, FLASK_SVG);
      const cauldEl = prop('wz-cauldron', 1012, 552, 230, 165, CAULDRON_SVG);
      const wendell = prop('wz-wendell', 8, 176, 240, 372, WENDELL_SVG);
      const liquidG = flaskEl.querySelector('.wz-liquidg');
      const shootEl = winEl.querySelector('.wz-shoot');

      root.appendChild(api.el('div', { class: 'room-title', text: "Wizard's Tower" }));
      const dots = [0, 1, 2].map(() => api.el('span'));
      root.appendChild(api.el('div', { class: 'round-dots' }, dots));

      /* ---------- helpers ---------- */
      function retrigger(node, cls, ms) {
        node.classList.remove(cls);
        void node.getBoundingClientRect();
        node.classList.add(cls);
        const key = '_wz_' + cls;
        const tok = (node[key] = (node[key] || 0) + 1);
        api.setTimeout(() => { if (node[key] === tok) node.classList.remove(cls); }, ms);
      }

      let talkTok = 0, chainTok = 0;
      function wsay(text, o) {
        const t = ++talkTok;
        wendell.classList.add('talking');
        const p = api.say(text, Object.assign({}, WHO, o || {}));
        p.then(() => { if (t === talkTok) wendell.classList.remove('talking'); });
        return p;
      }
      // A single line: cancels any running multi-line chain.
      function speak(text, o) { chainTok++; return wsay(text, o); }
      // Several lines in a row; stops as soon as anything else speaks.
      async function speakLines(lines) {
        const my = ++chainTok;
        for (const line of lines) {
          if (my !== chainTok) return;
          await wsay(line);
          if (my !== chainTok) return;
          await api.wait(150);
        }
      }

      function setPotion(color) { flaskEl.style.setProperty('--potion', color); }
      function setLevel(f) { liquidG.style.transform = `translateY(${FLASK_EMPTY - f * (FLASK_EMPTY - FLASK_FULL)}px)`; }
      setPotion(POTIONS[0].color);
      setLevel(0);

      function puff(cx, cy, size) {
        for (let i = 0; i < 4; i++) {
          const s = size * (0.6 + Math.random() * 0.5);
          const p = api.el('div', { class: 'wz-puff', style: {
            left: (cx - s / 2 + (Math.random() - 0.5) * size * 0.5) + 'px',
            top: (cy - s / 2 + (Math.random() - 0.5) * size * 0.5) + 'px',
            width: s + 'px', height: s + 'px', animationDelay: (i * 70) + 'ms',
          } });
          root.appendChild(p);
          api.setTimeout(() => p.remove(), 1300);
        }
      }

      /* ---------- game state ---------- */
      let round = 0, cards = [], open = [], matches = 0, pairs = 0;
      let inputOn = false, roundOver = false, finishing = false, finished = false;
      let missStreak = 0, isWordRound = false, askedRead = false;
      let recent = [];

      function chooseItems(n, wordMode) {
        let pool = wordMode ? ITEMS.filter(it => it.word.split(' ').every(p => p.length <= 6)) : ITEMS.slice();
        pool = api.shuffle(pool);
        pool.sort((a, b) => (recent.indexOf(a.key) >= 0 ? 1 : 0) - (recent.indexOf(b.key) >= 0 ? 1 : 0));
        const chosen = pool.slice(0, n);
        recent = chosen.map(it => it.key);
        return chosen;
      }

      function makeCard(item, kind, x, y, w, h) {
        const front = kind === 'word'
          ? `<div class="wz-face wz-front word"><div class="wz-word" style="font-size:${wordSize(item.word, w)}px">${item.word.split(' ').join('<br>')}</div></div>`
          : `<div class="wz-face wz-front" style="--tint:${item.tint}">${picSVG(item)}</div>`;
        const node = api.el('div', {
          class: 'wz-card',
          'data-key': item.key,
          style: { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' },
          html: `<div class="wz-lift" style="--tilt:${(Math.random() * 5 - 2.5).toFixed(1)}deg"><div class="wz-inner"><div class="wz-face wz-back">${RUNE}</div>${front}</div></div>`,
        });
        const card = { item, key: item.key, kind, el: node, state: 'down', seen: false, x, y, w, h };
        api.on(node, 'click', () => onTap(card));
        return card;
      }

      function deal(list) {
        list.forEach((c, i) => {
          const n = c.el;
          n.style.transition = 'none';
          n.style.opacity = '0';
          n.style.transform = `translate(${WAND.x - (c.x + c.w / 2)}px, ${WAND.y - (c.y + c.h / 2)}px) scale(.15) rotate(-60deg)`;
          root.appendChild(n);
          api.setTimeout(() => {
            n.style.transition = 'transform .6s cubic-bezier(.3,1.25,.5,1), opacity .25s';
            n.style.transform = '';
            n.style.opacity = '1';
            api.note(DEAL_NOTES[i % DEAL_NOTES.length], 0.18, 'pluck');
          }, 140 + i * 85);
        });
        return 140 + list.length * 85 + 650;
      }

      function clearHints() { cards.forEach(c => c.el.classList.remove('hint')); }

      function onTap(card) {
        if (!inputOn || roundOver || card.state !== 'down' || open.length >= 2) return;
        clearHints();
        card.state = 'up';
        card.seen = true;
        card.el.classList.add('up');
        open.push(card);
        api.note(api.pick(FLIP_NOTES), 0.35, 'bell');
        if (card.kind === 'pic') speak(card.item.name + '!', { rate: 1 });
        else if (!askedRead) { askedRead = true; speak('A word! Can you read it?'); }

        if (open.length === 1) {
          if (missStreak >= HINT_AFTER) {
            const partner = cards.find(c => c !== card && c.key === card.key);
            if (partner && partner.seen && partner.state === 'down') partner.el.classList.add('hint');
          }
          return;
        }
        const a = open[0], b = open[1];
        if (a.key === b.key) api.setTimeout(() => onMatch(a, b), 700);
        else api.setTimeout(() => onMiss(a, b), 1150);
      }

      function matchLine(item) {
        if (isWordRound) return `Yes! That word says ${item.name.toLowerCase()}!`;
        return api.pick([`Two ${item.plural}! A match!`, `Two ${item.plural}! Poof!`, `Yes! Two ${item.plural}!`]);
      }

      function onMatch(a, b) {
        if (a.state !== 'up' || b.state !== 'up') return;
        a.state = b.state = 'matched';
        open = [];
        missStreak = 0;
        matches++;
        const level = matches / pairs;
        const last = matches === pairs;
        if (last) { roundOver = true; inputOn = false; }
        api.sfx('correct');
        speak(matchLine(a.item));
        [a, b].forEach((c, i) => {
          c.el.classList.add('matched');
          c.el.style.zIndex = '30';
          c.el.style.transition = 'transform .45s cubic-bezier(.3,1.5,.5,1)';
          c.el.style.transform = `translateY(-26px) scale(1.12) rotate(${i ? 4 : -4}deg)`;
          api.sparkle(c.x + c.w / 2, c.y + c.h / 2, 16);
        });
        api.setTimeout(() => {
          api.sfx('whoosh');
          [a, b].forEach((c, i) => {
            puff(c.x + c.w / 2, c.y + c.h / 2, Math.max(c.w, c.h));
            const dx = MOUTH.x - (c.x + c.w / 2), dy = MOUTH.y - (c.y + c.h / 2);
            c.el.style.transition = 'transform .75s cubic-bezier(.55,-0.25,.7,1), opacity .75s ease-in';
            c.el.style.transform = `translate(${dx}px, ${dy}px) scale(.12) rotate(${i ? 220 : -220}deg)`;
            c.el.style.opacity = '0.25';
          });
        }, 700);
        api.setTimeout(() => {
          a.el.style.display = 'none';
          b.el.style.display = 'none';
          api.sfx('plop');
          api.sparkle(MOUTH.x, MOUTH.y + 10, 16);
          setLevel(level);
          retrigger(flaskEl, 'glug', 520);
          retrigger(wendell, 'cast', 950);
          if (last) api.setTimeout(finishRound, 800);
        }, 700 + 760);
      }

      function onMiss(a, b) {
        if (a.state !== 'up' || b.state !== 'up') return;
        open = [];
        [a, b].forEach(c => {
          c.state = 'down';
          c.el.classList.remove('up');
          retrigger(c.el, 'nope', 500);
        });
        missStreak++;
        api.sfx('boing');
        if (missStreak === 3 || missStreak === 6) speak(api.pick(MISS_LINES));
      }

      function roundLines() {
        if (round === 0) {
          return ["Hello! I'm Wizard Wendell.", 'Oh dear! My magic cards got all mixed up!',
            D === 1 ? 'Remember the pictures. Then find two that match!' : 'Tap two cards. Find the ones that match!'];
        }
        if (isWordRound) return ['Now match each word to its picture!'];
        if (D === 1) return ['New cards! Look closely!'];
        return round === 1 ? ['More magic cards! Find the pairs!'] : ['Last round! Lots of cards. You can do it!'];
      }

      async function startRound() {
        roundOver = false; finishing = false; inputOn = false;
        matches = 0; open = []; missStreak = 0; askedRead = false;
        cards.forEach(c => c.el.remove());
        cards = [];
        pairs = PAIRS[D][round];
        isWordRound = D === 3 && round === 2;

        const items = chooseItems(pairs, isWordRound);
        const list = [];
        items.forEach(it => {
          list.push({ item: it, kind: 'pic' });
          list.push({ item: it, kind: isWordRound ? 'word' : 'pic' });
        });
        const order = api.shuffle(list);
        const L = layoutGrid(order.length);
        cards = order.map((o, i) => makeCard(o.item, o.kind, L.pos[i].x, L.pos[i].y, L.w, L.h));

        flaskEl.classList.remove('full');
        setPotion(POTIONS[round].color);
        setLevel(0);
        speakLines(roundLines());
        retrigger(wendell, 'cast', 950);
        api.sfx('sparkle');

        await api.wait(deal(cards));
        if (D === 1) {
          // Little ones get a peek at every card first.
          cards.forEach((c, i) => api.setTimeout(() => { c.el.classList.add('up'); c.seen = true; api.note(FLIP_NOTES[i % FLIP_NOTES.length], 0.2, 'bell'); }, i * 70));
          await api.wait(cards.length * 70 + 2000);
          cards.forEach(c => c.el.classList.remove('up'));
          api.sfx('whoosh');
          await api.wait(500);
        }
        inputOn = true;
      }

      async function finishRound() {
        if (finishing || finished) return;
        finishing = true;
        const pot = POTIONS[round];
        dots[round].classList.add('done');
        flaskEl.classList.add('full');
        retrigger(wendell, 'cast', 950);
        api.sfx('chime');
        api.sfx('sparkle');
        api.celebrate(MOUTH.x - 60, MOUTH.y + 60, 60);
        api.sparkle(WAND.x, WAND.y, 22);
        await api.wait(400);
        await speak(`Hooray! A ${pot.name} potion!`);
        if (round < 2) {
          await api.wait(500);
          round++;
          startRound();
        } else {
          finished = true;
          await speak('You fixed all my spells! Thank you!');
          await api.wait(300);
          api.complete();
        }
      }

      /* ---------- tappable surprises ---------- */
      function shootStar() { retrigger(shootEl, 'go', 1050); }

      api.on(wendell, 'click', () => {
        retrigger(wendell, 'hop', 650);
        retrigger(wendell, 'cast', 950);
        api.sfx('sparkle');
        api.sparkle(WAND.x, WAND.y, 12);
        speak(api.pick(WENDELL_LINES));
      });
      api.on(owlEl, 'click', () => {
        retrigger(owlEl, 'hoot', 850);
        api.note('G4', 0.3, 'flute');
        api.setTimeout(() => api.note('E4', 0.55, 'flute'), 330);
      });
      api.on(winEl, 'click', () => {
        retrigger(winEl, 'zap', 1600);
        shootStar();
        ['C6', 'E6', 'G6', 'C7'].forEach((n, i) => api.setTimeout(() => api.note(n, 0.5, 'bell'), i * 110));
      });
      api.on(scopeEl, 'click', () => {
        retrigger(scopeEl, 'zap', 1050);
        api.sfx('whoosh');
        api.setTimeout(() => { shootStar(); api.sfx('sparkle'); }, 300);
      });
      [book1, book2].forEach(b => api.on(b, 'click', () => {
        retrigger(b, 'zap', 950);
        ['C5', 'E5', 'G5', 'B5', 'D6'].forEach((n, i) => api.setTimeout(() => api.note(n, 0.2, 'pluck'), i * 70));
      }));
      api.on(ballEl, 'click', () => {
        retrigger(ballEl, 'zap', 1550);
        ['E5', 'G#5', 'B5', 'E6'].forEach((n, i) => api.setTimeout(() => api.note(n, 0.6, 'bell'), i * 140));
        api.sparkleAt(ballEl);
        speak(api.pick(BALL_LINES));
      });
      let brewIdx = 0;
      api.on(cauldEl, 'click', () => {
        brewIdx = (brewIdx + 1) % BREWS.length;
        cauldEl.style.setProperty('--brew', BREWS[brewIdx]);
        retrigger(cauldEl, 'zap', 650);
        api.sfx('splash');
        api.setTimeout(() => api.sfx('pop'), 220);
        api.sparkle(1012 + 115, 552 + 30, 12);
      });
      api.on(flaskEl, 'click', () => {
        retrigger(flaskEl, 'glug', 520);
        api.sfx('plop');
      });

      startRound();
    },

    exit() {},
  });
})();
