/* =====================================================================
   Castle Quest — Royal Garden (letters & early reading)
   Gus the Gardener asks the child to plant seeds / pictures / letters
   in labelled flower pots. Correct answers sprout into big flowers.
     difficulty 1: match a letter seed-packet to the same letter pot
     difficulty 2: put a picture in the pot with its first letter
     difficulty 3: spell a 3-letter word with letter tiles
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#3a2a1a';
  const st = (w) => `stroke="${INK}" stroke-width="${w || 5}" stroke-linejoin="round" stroke-linecap="round"`;
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

  /* Letter names spelled so speech engines say them clearly */
  const NAMES = {
    A: 'Ay', B: 'Bee', C: 'See', D: 'Dee', E: 'Ee', F: 'Eff', G: 'Gee', H: 'Aitch', I: 'Eye',
    J: 'Jay', K: 'Kay', L: 'Ell', M: 'Em', N: 'En', O: 'Oh', P: 'Pee', Q: 'Cue', R: 'Are',
    S: 'Ess', T: 'Tee', U: 'You', V: 'Vee', W: 'Double you', X: 'Ex', Y: 'Why', Z: 'Zee',
  };
  /* nameOf() embeds a token; sayGus() speaks the spelled name but captions the plain letter */
  const nameOf = (ch) => '‹' + ch.toUpperCase() + '›';
  const spoken = (t) => t.replace(/‹(.)›/g, (_, c) => NAMES[c] || c);
  const captioned = (t) => t.replace(/‹(.)›/g, '$1');
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  /* Pictures used at difficulty 2 (first letters must be unambiguous) */
  const D2_POOL = ['apple', 'ball', 'bee', 'bus', 'cat', 'dog', 'egg', 'fish', 'fox', 'hat', 'moon', 'pig', 'sun'];
  /* CVC words for difficulty 3 (each has three different letters) */
  const D3_WORDS = ['cat', 'dog', 'sun', 'hat', 'pig', 'bug', 'fox', 'bed', 'cup', 'hen', 'map', 'bus'];
  const D3_DISTRACT = 'abdefghkmnoprstuw'.split('');

  const PLAQUE_COLORS = ['#fff3a8', '#ffd1e3', '#cfe9ff', '#d4f5c4'];
  const PACKET_COLORS = ['#e8423f', '#2f7fe0', '#9b5de5', '#ff8c2b', '#23a347', '#ff5fa2'];
  const PETALS = [
    ['#ff6fae', '#ffb3d4'], ['#e8423f', '#ff8f8d'], ['#9b5de5', '#d6b3ff'],
    ['#ff8c2b', '#ffc48f'], ['#2f7fe0', '#9cc0ff'], ['#ffffff', '#fff6c8'],
  ];

  /* ------------------------------------------------------------------
     Picture art (viewBox 0 0 100 100)
     ------------------------------------------------------------------ */
  function sunPic() {
    let rays = '';
    for (let i = 0; i < 8; i++) rays += `<path d="M50 6 L58 30 L42 30Z" fill="#ff9f1c" ${st(3.5)} transform="rotate(${i * 45} 50 50)"/>`;
    return rays + `<circle cx="50" cy="50" r="26" fill="#ffd93b" ${st(5)}/>
      <circle cx="41" cy="46" r="3.6" fill="${INK}"/><circle cx="59" cy="46" r="3.6" fill="${INK}"/>
      <path d="M40 56 Q50 65 60 56" fill="none" ${st(3.5)}/>
      <ellipse cx="35" cy="56" rx="4.5" ry="3" fill="#ff8f6b" opacity=".7"/><ellipse cx="65" cy="56" rx="4.5" ry="3" fill="#ff8f6b" opacity=".7"/>`;
  }
  const PICS = {
    apple: `<path d="M50 30 C34 18 12 26 14 52 C16 80 34 96 50 86 C66 96 84 80 86 52 C88 26 66 18 50 30Z" fill="#e8423f" ${st(5)}/>
      <path d="M50 30 C50 22 51 15 55 9" fill="none" ${st(5)}/>
      <path d="M54 22 C60 10 76 8 82 12 C76 24 64 28 54 22Z" fill="#3fb950" ${st(4)}/>
      <ellipse cx="32" cy="46" rx="6" ry="11" fill="#fff" opacity=".55" transform="rotate(20 32 46)"/>`,
    ball: `<circle cx="50" cy="52" r="38" fill="#e8423f"/>
      <path d="M13 46 Q50 66 87 46 L88 58 Q50 80 12 58 Z" fill="#ffc928"/>
      <path d="M13 46 Q50 66 87 46 M12 58 Q50 80 88 58" fill="none" ${st(3)}/>
      <circle cx="50" cy="52" r="38" fill="none" ${st(5)}/>
      <ellipse cx="34" cy="32" rx="10" ry="6" fill="#fff" opacity=".7" transform="rotate(-30 34 32)"/>`,
    bee: `<ellipse cx="42" cy="30" rx="12" ry="17" fill="#d4f0ff" ${st(4)} transform="rotate(-25 42 30)"/>
      <ellipse cx="60" cy="28" rx="12" ry="17" fill="#d4f0ff" ${st(4)} transform="rotate(20 60 28)"/>
      <path d="M80 52 L96 58 L80 64Z" fill="${INK}"/>
      <ellipse cx="54" cy="58" rx="30" ry="22" fill="#ffc928"/>
      <path d="M50 37 V79 M66 38.5 V77.5" stroke="${INK}" stroke-width="8"/>
      <ellipse cx="54" cy="58" rx="30" ry="22" fill="none" ${st(5)}/>
      <path d="M20 43 Q14 30 8 28 M28 42 Q30 30 36 25" fill="none" ${st(3.5)}/>
      <circle cx="8" cy="28" r="3.5" fill="${INK}"/><circle cx="36" cy="25" r="3.5" fill="${INK}"/>
      <circle cx="24" cy="56" r="15" fill="#ffc928" ${st(5)}/>
      <circle cx="19" cy="54" r="3.4" fill="${INK}"/><circle cx="29" cy="54" r="3.4" fill="${INK}"/>
      <path d="M18 62 Q24 67 30 62" fill="none" ${st(3)}/>`,
    bus: `<rect x="6" y="24" width="88" height="52" rx="10" fill="#ffc928" ${st(5)}/>
      <rect x="14" y="32" width="16" height="17" rx="3" fill="#bfe6ff" ${st(3.5)}/>
      <rect x="36" y="32" width="16" height="17" rx="3" fill="#bfe6ff" ${st(3.5)}/>
      <rect x="58" y="32" width="16" height="17" rx="3" fill="#bfe6ff" ${st(3.5)}/>
      <rect x="79" y="32" width="9" height="24" rx="3" fill="#bfe6ff" ${st(3.5)}/>
      <path d="M6 60 H94" ${st(4)}/>
      <circle cx="88" cy="67" r="3.5" fill="#fff" ${st(2.5)}/>
      <circle cx="28" cy="77" r="11" fill="${INK}"/><circle cx="28" cy="77" r="4.5" fill="#d9d9d9"/>
      <circle cx="72" cy="77" r="11" fill="${INK}"/><circle cx="72" cy="77" r="4.5" fill="#d9d9d9"/>`,
    cat: `<path d="M24 38 L22 10 L44 26 Z" fill="#ff9a3c" ${st(5)}/><path d="M76 38 L78 10 L56 26 Z" fill="#ff9a3c" ${st(5)}/>
      <path d="M27 30 L26 17 L37 26Z M73 30 L74 17 L63 26Z" fill="#ffb3c7"/>
      <ellipse cx="50" cy="54" rx="34" ry="30" fill="#ff9a3c" ${st(5)}/>
      <path d="M44 26 L46 34 M50 25 V34 M56 26 L54 34" fill="none" ${st(3.5)}/>
      <ellipse cx="38" cy="50" rx="6" ry="8" fill="${INK}"/><ellipse cx="62" cy="50" rx="6" ry="8" fill="${INK}"/>
      <circle cx="40" cy="47" r="2.2" fill="#fff"/><circle cx="64" cy="47" r="2.2" fill="#fff"/>
      <path d="M45 60 L55 60 L50 66 Z" fill="#ff6fae" ${st(3)}/>
      <path d="M50 66 Q50 72 43 71 M50 66 Q50 72 57 71" fill="none" ${st(3)}/>
      <path d="M30 62 L8 58 M30 67 L8 71 M70 62 L92 58 M70 67 L92 71" ${st(2.5)}/>`,
    dog: `<ellipse cx="50" cy="52" rx="30" ry="30" fill="#d39b5e" ${st(5)}/>
      <ellipse cx="38" cy="44" rx="10" ry="11" fill="#a86d36"/>
      <ellipse cx="20" cy="54" rx="11" ry="24" fill="#8a5427" ${st(5)} transform="rotate(18 20 54)"/>
      <ellipse cx="80" cy="54" rx="11" ry="24" fill="#8a5427" ${st(5)} transform="rotate(-18 80 54)"/>
      <ellipse cx="50" cy="66" rx="17" ry="13" fill="#f6dfbf" ${st(4)}/>
      <circle cx="39" cy="45" r="4.5" fill="${INK}"/><circle cx="61" cy="45" r="4.5" fill="${INK}"/>
      <circle cx="40.5" cy="43.5" r="1.6" fill="#fff"/><circle cx="62.5" cy="43.5" r="1.6" fill="#fff"/>
      <path d="M46 73 Q50 85 54 73Z" fill="#ff6f8a" ${st(3)}/>
      <ellipse cx="50" cy="59" rx="7" ry="5" fill="${INK}"/>
      <path d="M50 64 V69 M42 70 Q50 76 58 70" fill="none" ${st(3)}/>`,
    egg: `<path d="M20 50 C14 30 36 16 54 22 C72 14 92 30 86 50 C92 68 78 86 58 82 C42 92 18 80 20 64 C10 60 12 54 20 50Z" fill="#fff" ${st(5)}/>
      <circle cx="52" cy="52" r="19" fill="#ffb81c" ${st(4)}/>
      <ellipse cx="45" cy="44" rx="5" ry="3.5" fill="#fff" opacity=".8"/>
      <circle cx="46" cy="54" r="2.5" fill="${INK}"/><circle cx="58" cy="54" r="2.5" fill="${INK}"/>
      <path d="M47 60 Q52 64 57 60" fill="none" ${st(2.5)}/>`,
    fish: `<circle cx="14" cy="24" r="4" fill="#bfe6ff" ${st(2.5)}/><circle cx="22" cy="12" r="3" fill="#bfe6ff" ${st(2.5)}/>
      <path d="M70 50 L94 30 L90 50 L94 70 Z" fill="#ff8c2b" ${st(5)}/>
      <path d="M38 34 Q52 16 64 34Z" fill="#ff8c2b" ${st(4)}/>
      <ellipse cx="46" cy="52" rx="32" ry="22" fill="#ffa53c" ${st(5)}/>
      <path d="M50 40 Q56 52 50 64 M60 42 Q66 52 60 62" fill="none" stroke="#d9661a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="28" cy="48" r="7" fill="#fff" ${st(3)}/><circle cx="27" cy="48" r="3.5" fill="${INK}"/>
      <path d="M17 59 Q22 63 27 60" fill="none" ${st(3)}/>`,
    fox: `<path d="M50 88 L14 46 L18 10 L40 28 L60 28 L82 10 L86 46 Z" fill="#f47a23" ${st(5)}/>
      <path d="M22 20 L24 34 L33 28Z M78 20 L76 34 L67 28Z" fill="${INK}" opacity=".75"/>
      <path d="M50 88 L18 50 Q34 58 50 62 Q66 58 82 50 Z" fill="#fff" ${st(4)}/>
      <ellipse cx="37" cy="44" rx="4.5" ry="6" fill="${INK}"/><ellipse cx="63" cy="44" rx="4.5" ry="6" fill="${INK}"/>
      <circle cx="38.5" cy="42" r="1.5" fill="#fff"/><circle cx="64.5" cy="42" r="1.5" fill="#fff"/>
      <circle cx="50" cy="81" r="6" fill="${INK}"/>`,
    hat: `<ellipse cx="50" cy="74" rx="44" ry="12" fill="#2f7fe0" ${st(5)}/>
      <path d="M24 74 C22 44 30 26 50 26 C70 26 78 44 76 74 Q50 82 24 74Z" fill="#4b93ec" ${st(5)}/>
      <path d="M24 64 Q50 72 76 64 L76.5 55 Q50 63 23.5 55Z" fill="#e8423f" ${st(3.5)}/>
      <ellipse cx="37" cy="40" rx="5" ry="9" fill="#fff" opacity=".4"/>`,
    moon: `<circle cx="50" cy="50" r="44" fill="#2a3f7f" ${st(5)}/>
      <circle cx="46" cy="52" r="28" fill="#ffd93b" ${st(4)}/>
      <circle cx="60" cy="42" r="24" fill="#2a3f7f"/>
      <path d="M26 52 Q29 55 32 52" fill="none" ${st(2.5)}/>
      <path d="M30 63 Q35 67 40 63" fill="none" ${st(2.5)}/>
      <circle cx="75" cy="73" r="3" fill="#fff"/><circle cx="80" cy="30" r="2.5" fill="#fff"/><circle cx="25" cy="26" r="2" fill="#fff"/>`,
    pig: `<path d="M24 32 L22 12 L42 24Z M76 32 L78 12 L58 24Z" fill="#ff8fb5" ${st(4.5)}/>
      <circle cx="50" cy="54" r="32" fill="#ffb0cb" ${st(5)}/>
      <ellipse cx="50" cy="64" rx="15" ry="11" fill="#ff8fb5" ${st(4)}/>
      <ellipse cx="45" cy="64" rx="2.8" ry="4" fill="${INK}"/><ellipse cx="55" cy="64" rx="2.8" ry="4" fill="${INK}"/>
      <circle cx="38" cy="46" r="4.5" fill="${INK}"/><circle cx="62" cy="46" r="4.5" fill="${INK}"/>
      <circle cx="39.5" cy="44.5" r="1.5" fill="#fff"/><circle cx="63.5" cy="44.5" r="1.5" fill="#fff"/>
      <ellipse cx="28" cy="62" rx="5" ry="3.5" fill="#ff6f9c" opacity=".7"/><ellipse cx="72" cy="62" rx="5" ry="3.5" fill="#ff6f9c" opacity=".7"/>
      <path d="M44 80 Q50 84 56 80" fill="none" ${st(3)}/>`,
    sun: sunPic(),
    bug: `<path d="M44 14 Q38 4 28 4 M56 14 Q62 4 72 4" fill="none" ${st(3.5)}/>
      <circle cx="28" cy="4" r="3.2" fill="${INK}"/><circle cx="72" cy="4" r="3.2" fill="${INK}"/>
      <circle cx="50" cy="25" r="15" fill="${INK}"/>
      <circle cx="44" cy="19" r="3.6" fill="#fff"/><circle cx="56" cy="19" r="3.6" fill="#fff"/>
      <circle cx="44.5" cy="19.5" r="1.6" fill="${INK}"/><circle cx="56.5" cy="19.5" r="1.6" fill="${INK}"/>
      <circle cx="50" cy="60" r="32" fill="#e8423f" ${st(5)}/>
      <path d="M50 30 V92" ${st(4)}/>
      <circle cx="36" cy="48" r="6" fill="${INK}"/><circle cx="64" cy="48" r="6" fill="${INK}"/>
      <circle cx="33" cy="70" r="5.5" fill="${INK}"/><circle cx="67" cy="70" r="5.5" fill="${INK}"/>
      <circle cx="42" cy="84" r="3.5" fill="${INK}"/><circle cx="58" cy="84" r="3.5" fill="${INK}"/>
      <ellipse cx="34" cy="38" rx="6" ry="3.5" fill="#fff" opacity=".6" transform="rotate(-30 34 38)"/>`,
    bed: `<rect x="8" y="28" width="15" height="60" rx="4" fill="#b5763c" ${st(4)}/>
      <rect x="14" y="58" width="72" height="17" rx="4" fill="#fff" ${st(4)}/>
      <path d="M40 50 H82 Q88 50 88 56 V75 H40Z" fill="#2f7fe0" ${st(4)}/>
      <path d="M48 60 H82" stroke="#9cc0ff" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="32" cy="52" rx="13" ry="8" fill="#fff" ${st(4)}/>
      <rect x="82" y="48" width="12" height="40" rx="4" fill="#b5763c" ${st(4)}/>`,
    cup: `<ellipse cx="50" cy="82" rx="40" ry="9" fill="#cfe9ff" ${st(4)}/>
      <path d="M74 46 C90 44 90 66 72 66" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M74 46 C90 44 90 66 72 66" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M20 38 H80 Q80 78 50 78 Q20 78 20 38Z" fill="#fff" ${st(5)}/>
      <path d="M23 50 H77" stroke="#e8423f" stroke-width="6"/>
      <path d="M38 30 Q34 22 40 14 M52 30 Q48 22 54 14 M66 30 Q62 22 68 14" fill="none" stroke="#9fb3c8" stroke-width="3.5" stroke-linecap="round"/>`,
    hen: `<path d="M70 50 Q92 30 90 56 Q96 66 80 72Z" fill="#fff" ${st(4)}/>
      <path d="M44 84 V95 M38 95 H50 M62 84 V95 M56 95 H68" stroke="#ff8c2b" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="54" cy="62" rx="30" ry="25" fill="#fff" ${st(5)}/>
      <path d="M44 62 Q56 76 68 60" fill="none" ${st(3.5)}/>
      <path d="M24 26 Q24 12 31 18 Q35 8 40 18 Q47 14 44 28Z" fill="#e8423f" ${st(3.5)}/>
      <circle cx="32" cy="38" r="15" fill="#fff" ${st(5)}/>
      <path d="M18 36 L7 41 L18 46Z" fill="#ffc928" ${st(3)}/>
      <path d="M21 48 Q16 59 25 55Z" fill="#e8423f" ${st(2.5)}/>
      <circle cx="29" cy="35" r="3" fill="${INK}"/>`,
    map: `<path d="M10 22 L36 14 L64 22 L90 14 L90 80 L64 88 L36 80 L10 88 Z" fill="#f6e2b3" ${st(5)}/>
      <path d="M36 14 V80 M64 22 V88" stroke="${INK}" stroke-width="2.5" opacity=".35"/>
      <path d="M18 74 Q30 50 46 60 T70 38" fill="none" stroke="#e8423f" stroke-width="4" stroke-dasharray="1 7" stroke-linecap="round"/>
      <path d="M68 28 L80 40 M80 28 L68 40" stroke="#e8423f" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M16 42 L24 28 L32 42Z" fill="#3fb950" ${st(2.5)}/>
      <path d="M50 76 Q56 68 62 76" fill="#8fd3ff" ${st(2.5)}/>`,
  };
  function picSVG(word, size) {
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="gd-pic">${PICS[word] || ''}</svg>`;
  }

  /* ------------------------------------------------------------------
     Flower (grows out of a pot) — viewBox 0 0 140 170
     ------------------------------------------------------------------ */
  function flowerSVG(colors, style) {
    let petals = '';
    if (style === 0) {
      for (let i = 0; i < 8; i++) petals += `<ellipse cx="70" cy="25" rx="14" ry="21" fill="${colors[0]}" ${st(4)} transform="rotate(${i * 45} 70 54)"/>`;
    } else {
      for (let i = 0; i < 12; i++) petals += `<ellipse cx="70" cy="22" rx="9" ry="22" fill="${colors[0]}" ${st(3.5)} transform="rotate(${i * 30} 70 54)"/>`;
      for (let i = 0; i < 12; i++) petals += `<ellipse cx="70" cy="30" rx="5" ry="12" fill="${colors[1]}" opacity=".9" transform="rotate(${i * 30 + 15} 70 54)"/>`;
    }
    return `<svg viewBox="0 0 140 170" width="140" height="170">
      <g class="gd-sproutg">
        <path d="M70 168 V150" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
        <path d="M70 168 V150" fill="none" stroke="#3fb950" stroke-width="5" stroke-linecap="round"/>
        <path d="M70 152 Q52 146 48 132 Q64 132 70 152Z" fill="#6fdc5a" ${st(3.5)}/>
        <path d="M70 152 Q88 146 92 132 Q76 132 70 152Z" fill="#6fdc5a" ${st(3.5)}/>
      </g>
      <g class="gd-stem">
        <path d="M70 170 C65 135 75 100 70 60" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
        <path d="M70 170 C65 135 75 100 70 60" fill="none" stroke="#3fb950" stroke-width="7" stroke-linecap="round"/>
        <path class="gd-leaf" d="M68 132 Q40 130 32 108 Q58 106 68 132Z" fill="#6fdc5a" ${st(4)}/>
        <path class="gd-leaf" d="M72 112 Q100 108 108 86 Q82 86 72 112Z" fill="#6fdc5a" ${st(4)}/>
      </g>
      <g class="gd-head">
        ${petals}
        <circle cx="70" cy="54" r="22" fill="#ffd23f" ${st(5)}/>
        <circle cx="63" cy="50" r="3.6" fill="${INK}"/><circle cx="77" cy="50" r="3.6" fill="${INK}"/>
        <circle cx="64" cy="48.6" r="1.3" fill="#fff"/><circle cx="78" cy="48.6" r="1.3" fill="#fff"/>
        <path d="M62 59 Q70 67 78 59" fill="none" ${st(3.5)}/>
        <ellipse cx="57" cy="59" rx="4" ry="2.6" fill="#ff8f6b" opacity=".75"/><ellipse cx="83" cy="59" rx="4" ry="2.6" fill="#ff8f6b" opacity=".75"/>
      </g>
    </svg>`;
  }

  /* Terracotta pot — viewBox 0 0 180 165 */
  const POT_SVG = `<svg viewBox="0 0 180 165" width="180" height="165" class="gd-pot-svg">
    <ellipse cx="90" cy="158" rx="72" ry="8" fill="#000" opacity=".16"/>
    <ellipse cx="90" cy="17" rx="72" ry="10" fill="#6b4226" ${st(4)}/>
    <path d="M18 44 L162 44 L148 150 Q147 158 138 158 L42 158 Q33 158 32 150 Z" fill="#d9733b" ${st(5)}/>
    <path d="M150 48 L138 152 Q137 156 132 156 L122 156 L134 48Z" fill="#b5532a" opacity=".45"/>
    <path d="M30 52 L38 140" stroke="#f3a679" stroke-width="6" stroke-linecap="round" opacity=".7"/>
    <rect x="8" y="16" width="164" height="32" rx="10" fill="#e8874d" ${st(5)}/>
    <path d="M18 24 H120" stroke="#ffb98a" stroke-width="5" stroke-linecap="round" opacity=".8"/>
  </svg>`;

  /* Seed packet — viewBox 0 0 120 150 */
  function packetSVG(color, petal) {
    let zig = 'M8 24';
    for (let x = 8, up = true; x < 112; x += 13, up = !up) zig += ` L${Math.min(112, x + 13)} ${up ? 12 : 24}`;
    return `<svg viewBox="0 0 120 150" width="120" height="150">
      <path d="${zig} L112 140 Q112 146 106 146 L14 146 Q8 146 8 140 Z" fill="${color}" ${st(5)}/>
      <path d="M8 34 H112" stroke="#fff" stroke-width="4" opacity=".55"/>
      <circle cx="60" cy="68" r="36" fill="#fff" ${st(4.5)}/>
      <rect x="16" y="108" width="88" height="30" rx="8" fill="#fffaf0" ${st(3.5)}/>
      <path d="M40 136 V122" stroke="#3fb950" stroke-width="4" stroke-linecap="round"/>
      <circle cx="34" cy="119" r="5" fill="${petal}" ${st(2.5)}/><circle cx="46" cy="119" r="5" fill="${petal}" ${st(2.5)}/>
      <circle cx="40" cy="113" r="5" fill="${petal}" ${st(2.5)}/><circle cx="40" cy="120" r="3.5" fill="#ffd23f"/>
      <ellipse cx="66" cy="125" rx="3" ry="4" fill="#7d4a1f"/><ellipse cx="78" cy="120" rx="3" ry="4" fill="#7d4a1f"/>
      <ellipse cx="88" cy="128" rx="3" ry="4" fill="#7d4a1f"/><ellipse cx="74" cy="131" rx="3" ry="4" fill="#7d4a1f"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------
     Background art (1280 x 720)
     ------------------------------------------------------------------ */
  function prng(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

  function cloud(x, y, sc, cls) {
    return `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${sc})">
      <path d="M0 30 Q0 10 20 12 Q28 -6 50 4 Q66 -8 80 10 Q100 8 100 28 Q100 42 84 42 L14 42 Q0 42 0 30Z" fill="#fff" ${st(4 / sc)}/>
      <path d="M14 34 H70" stroke="#d4ecfb" stroke-width="${5 / sc}" stroke-linecap="round"/>
    </g></g>`;
  }
  function daisy(x, y, c) {
    let s = `<g transform="translate(${x} ${y})">`;
    for (let i = 0; i < 5; i++) {
      const a = (i * 72) * Math.PI / 180;
      s += `<circle cx="${(Math.cos(a) * 6).toFixed(1)}" cy="${(Math.sin(a) * 6).toFixed(1)}" r="5" fill="${c}" stroke="${INK}" stroke-width="1.5"/>`;
    }
    return s + `<circle r="4" fill="#ffd23f" stroke="${INK}" stroke-width="1.5"/></g>`;
  }
  function tulip(x, y, c) {
    return `<g transform="translate(${x} ${y})">
      <path d="M0 0 V-34" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M0 0 V-34" stroke="#3fb950" stroke-width="4" stroke-linecap="round"/>
      <path d="M0 -8 Q-14 -14 -14 -28 Q-2 -22 0 -8Z" fill="#6fdc5a" ${st(2.5)}/>
      <path d="M-11 -50 L-11 -36 Q-11 -28 0 -28 Q11 -28 11 -36 L11 -50 L5.5 -44 L0 -52 L-5.5 -44Z" fill="${c}" ${st(3)}/>
    </g>`;
  }

  function bgSVG() {
    const r = prng(11);
    let s = `<svg class="gd-bg" viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5dbdf8"/><stop offset="1" stop-color="#d6f2ff"/></linearGradient>
      <linearGradient id="gdLawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93e267"/><stop offset="1" stop-color="#5cbd3e"/></linearGradient>
      <linearGradient id="gdWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86dafc"/><stop offset="1" stop-color="#3aa2e4"/></linearGradient>
      <pattern id="gdMow" width="150" height="150" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="75" height="150" fill="#fff" opacity=".1"/></pattern>
    </defs>
    <rect width="1280" height="330" fill="url(#gdSky)"/>`;

    // Sun
    let rays = '';
    for (let i = 0; i < 12; i++) rays += `<path d="M-7 -40 L7 -40 L0 -58 Z" fill="#ffb81c" ${st(3.5)} transform="rotate(${i * 30})"/>`;
    s += `<g transform="translate(590 62)"><g class="gd-sunrays">${rays}</g>
      <circle r="35" fill="#ffd93b" ${st(5)}/>
      <circle cx="-11" cy="-5" r="4" fill="${INK}"/><circle cx="11" cy="-5" r="4" fill="${INK}"/>
      <path d="M-13 8 Q0 20 13 8" fill="none" ${st(4)}/>
      <ellipse cx="-20" cy="7" rx="6" ry="4" fill="#ff9f6b" opacity=".7"/><ellipse cx="20" cy="7" rx="6" ry="4" fill="#ff9f6b" opacity=".7"/>
    </g>`;
    // Clouds
    s += cloud(300, 40, 0.9, 'gd-cloud gd-cloud1') + cloud(760, 100, 0.7, 'gd-cloud gd-cloud2') + cloud(60, 140, 0.6, 'gd-cloud gd-cloud3');

    // Distant hills + trees
    s += `<path d="M-10 200 Q150 128 330 178 Q520 118 720 172 Q880 126 1040 160 Q1170 120 1290 150 L1290 260 L-10 260Z" fill="#a9e27c" ${st(4)}/>`;
    [[120, 170], [300, 168], [470, 150], [640, 160], [880, 150]].forEach(([x, y]) => {
      s += `<path d="M${x} ${y + 26} V${y + 8}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
        <path d="M${x} ${y + 26} V${y + 8}" stroke="#8a5427" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${x}" cy="${y}" r="15" fill="#4fbf4a" ${st(3.5)}/>`;
    });

    // Castle on the far hill (kept below the HUD buttons)
    s += `<path d="M960 190 Q1090 120 1290 150 L1290 200 L960 200Z" fill="#96d86a" ${st(4)}/>
      <rect x="1066" y="140" width="110" height="60" fill="#e0cfae" ${st(4)}/>
      ${[1068, 1088, 1146, 1162].map(x => `<rect x="${x}" y="130" width="12" height="13" fill="#e0cfae" ${st(3.5)}/>`).join('')}
      <rect x="1100" y="112" width="42" height="40" fill="#e9dabd" ${st(4)}/>
      <path d="M1092 114 L1121 84 L1150 114Z" fill="#e8423f" ${st(4)}/>
      <rect x="1024" y="126" width="42" height="74" fill="#e9dabd" ${st(4)}/>
      <path d="M1016 128 L1045 96 L1074 128Z" fill="#2f7fe0" ${st(4)}/>
      <path d="M1045 96 V84" ${st(3)}/><path class="gd-flag" d="M1045 84 L1062 88 L1045 93Z" fill="#ffc928" ${st(2.5)}/>
      <rect x="1176" y="126" width="42" height="74" fill="#e9dabd" ${st(4)}/>
      <path d="M1168 128 L1197 96 L1226 128Z" fill="#2f7fe0" ${st(4)}/>
      <path d="M1197 96 V84" ${st(3)}/><path class="gd-flag" d="M1197 84 L1214 88 L1197 93Z" fill="#e8423f" ${st(2.5)}/>
      <path d="M1039 162 V152 Q1045 143 1051 152 V162Z M1191 162 V152 Q1197 143 1203 152 V162Z M1115 140 V132 Q1121 124 1127 132 V140Z" fill="${INK}"/>
      <path d="M1108 200 V178 Q1121 164 1134 178 V200Z" fill="#7d4a1f" ${st(3.5)}/>`;

    // Garden wall
    s += `<rect x="-10" y="172" width="1300" height="110" fill="#d6c19a" ${st(5)}/>`;
    let bricks = '';
    for (let x = -10; x < 1290; x += 70) bricks += `M${x + 35} 178 V198 M${x} 198 V222 `;
    s += `<path d="M-10 198 H1290 M-10 222 H1290 ${bricks}" stroke="${INK}" stroke-width="2.5" opacity=".3"/>`;
    s += `<rect x="-10" y="162" width="1300" height="16" rx="6" fill="#eadbb9" ${st(5)}/>`;
    // Ivy on the wall
    [[150, 180], [520, 176], [930, 182]].forEach(([x, y]) => {
      s += `<path d="M${x} ${y} q12 14 2 30 q-10 14 4 28" fill="none" stroke="#2e8a3a" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="${x + 8}" cy="${y + 10}" rx="7" ry="4.5" fill="#4fbf4a" ${st(2)}/>
        <ellipse cx="${x - 4}" cy="${y + 26}" rx="7" ry="4.5" fill="#4fbf4a" ${st(2)}/>`;
    });

    // Hedge row
    let hedge = '', hl = '';
    for (let i = 0, x = -10; x < 1320; i++, x += 58) {
      const cy = i % 2 ? 248 : 240, rr = 42 + (i % 3) * 4;
      hedge += `<circle cx="${x}" cy="${cy}" r="${rr}" fill="#2e9e3e" ${st(5)}/>`;
      hl += `<ellipse cx="${x - 12}" cy="${cy - rr + 16}" rx="13" ry="7" fill="#55c463" opacity=".8"/>`;
    }
    s += hedge + `<rect x="-10" y="244" width="1300" height="60" fill="#2e9e3e"/>` + hl;
    for (let i = 0; i < 34; i++) {
      const x = r() * 1280, y = 212 + r() * 70, c = ['#ff6fae', '#e8423f', '#fff', '#ffd23f'][i % 4];
      s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5.5" fill="${c}" stroke="${INK}" stroke-width="2"/>`;
    }

    // Lawn
    const lawn = 'M-10 298 Q640 284 1290 298 L1290 730 L-10 730Z';
    s += `<path d="${lawn}" fill="url(#gdLawn)" ${st(5)}/><path d="${lawn}" fill="url(#gdMow)"/>`;
    for (let i = 0; i < 40; i++) {
      const x = r() * 1280, y = 320 + r() * 380;
      s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l4 -9 l3 9 l4 -7" fill="none" stroke="#3f9f2c" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;
    }

    // Potting bench (the seed shelf)
    s += `<rect x="250" y="282" width="12" height="20" fill="#9a5d2a" ${st(3.5)}/><rect x="962" y="282" width="12" height="20" fill="#9a5d2a" ${st(3.5)}/>
      <rect x="222" y="266" width="780" height="18" rx="7" fill="#c98a4b" ${st(4)}/>
      <path d="M236 272 H990" stroke="#e8b27a" stroke-width="3" stroke-linecap="round"/>`;

    // Stone ledge the pots stand on
    let flags = '';
    for (let x = 286; x < 1000; x += 90) flags += `M${x} 566 V588 `;
    s += `<rect x="196" y="560" width="808" height="32" rx="14" fill="#d3c2a2" ${st(5)}/>
      <path d="${flags}" stroke="${INK}" stroke-width="2.5" opacity=".3"/>
      <path d="M212 568 H988" stroke="#efe3c8" stroke-width="4" stroke-linecap="round"/>`;

    // Stream with a little bridge
    s += `<path d="M590 590 C580 630 620 652 604 690 C598 704 594 716 592 726 L706 726 C702 704 716 682 706 656 C696 630 680 612 682 590 Z" fill="url(#gdWater)" ${st(5)}/>
      <path class="gd-ripple" d="M616 612 q8 -5 16 0 M630 640 q8 -5 16 0 M626 700 q8 -5 16 0 M660 668 q8 -5 16 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
    let posts = '';
    for (let x = 560; x <= 720; x += 40) {
      const t1 = (x - 552) / 176, t2 = (x - 545) / 190;
      const ry = 650 - 100 * t1 * (1 - t1), dy = 668 - 100 * t2 * (1 - t2);
      posts += `<path d="M${x} ${ry.toFixed(1)} V${dy.toFixed(1)}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
        <path d="M${x} ${ry.toFixed(1)} V${dy.toFixed(1)}" stroke="#d99a5a" stroke-width="4" stroke-linecap="round"/>`;
    }
    s += `<path d="M545 668 Q640 618 735 668 L735 686 Q640 636 545 686 Z" fill="#b5763c" ${st(5)}/>
      ${posts}
      <path d="M552 650 Q640 600 728 650" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M552 650 Q640 600 728 650" fill="none" stroke="#e0a565" stroke-width="5" stroke-linecap="round"/>`;

    // Pond (the frog lives here)
    s += `<path d="M880 726 C872 664 930 618 1050 612 C1170 606 1290 620 1290 642 L1290 726Z" fill="url(#gdWater)" ${st(5)}/>
      <ellipse class="gd-ripple2" cx="1130" cy="700" rx="30" ry="7" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
      <ellipse cx="1196" cy="666" rx="34" ry="10" fill="#4fbf4a" ${st(3.5)}/>
      <path d="M1196 666 L1230 662 L1228 671Z" fill="#5fc0ef"/>
      <circle cx="1188" cy="662" r="6" fill="#ff8fc0" stroke="${INK}" stroke-width="2"/><circle cx="1188" cy="662" r="2.5" fill="#ffd23f"/>
      <ellipse cx="1240" cy="704" rx="26" ry="8" fill="#4fbf4a" ${st(3)}/>
      <path d="M1262 646 V600 M1272 650 V612 M1252 650 V618" stroke="#2e8a3a" stroke-width="4" stroke-linecap="round"/>
      <rect x="1257" y="596" width="9" height="22" rx="4.5" fill="#8a5427" ${st(2.5)}/>
      <rect x="1267" y="608" width="9" height="20" rx="4.5" fill="#8a5427" ${st(2.5)}/>`;

    // Flowers in the lawn
    [[214, 616, '#fff'], [250, 654, '#ff8fc0'], [470, 628, '#fff'], [516, 700, '#ffd23f'], [762, 640, '#fff'],
     [812, 700, '#ff8fc0'], [858, 620, '#fff'], [1000, 330, '#fff'], [990, 450, '#ff8fc0'], [212, 330, '#fff'],
     [40, 560, '#fff'], [130, 590, '#ff8fc0']].forEach(([x, y, c]) => { s += daisy(x, y, c); });
    ['#e8423f', '#ff6fae', '#ffc928', '#9b5de5', '#ff8c2b', '#e8423f', '#ff6fae', '#ffc928'].forEach((c, i) => { s += tulip(206 + i * 44, 722, c); });
    ['#9b5de5', '#e8423f', '#ffc928'].forEach((c, i) => { s += tulip(768 + i * 42, 724, c); });

    return s + '</svg>';
  }

  /* ------------------------------------------------------------------
     Characters & extras
     ------------------------------------------------------------------ */
  const GUS_SVG = `<svg viewBox="0 0 250 330" width="250" height="330" class="gd-gus-svg">
    <ellipse cx="128" cy="320" rx="82" ry="10" fill="#000" opacity=".18"/>
    <g class="gd-gus-body">
      <ellipse cx="100" cy="310" rx="27" ry="14" fill="#7d4a1f" ${st(5)}/>
      <ellipse cx="158" cy="310" rx="27" ry="14" fill="#7d4a1f" ${st(5)}/>
      <path d="M84 248 L86 304 L120 304 L123 262 L135 262 L138 304 L172 304 L174 248 Z" fill="#2f7fe0" ${st(5)}/>
      <path d="M62 252 C56 198 82 168 128 168 C174 168 200 198 194 252 Z" fill="#e8423f" ${st(5)}/>
      <path d="M78 190 L72 250 M184 190 L188 250 M64 222 H192" stroke="#ff8f8d" stroke-width="5" opacity=".8"/>
      <path d="M92 196 L164 196 L168 258 L88 258 Z" fill="#2f7fe0" ${st(5)}/>
      <path d="M96 200 L84 172 M160 200 L172 172" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M96 200 L84 172 M160 200 L172 172" stroke="#2f7fe0" stroke-width="7" stroke-linecap="round"/>
      <circle cx="98" cy="204" r="5" fill="#ffc928" ${st(3)}/><circle cx="158" cy="204" r="5" fill="#ffc928" ${st(3)}/>
      <rect x="110" y="214" width="36" height="26" rx="5" fill="#4b93ec" ${st(3.5)}/>
      <path d="M134 214 L140 196" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path d="M134 214 L140 196" stroke="#b5763c" stroke-width="4" stroke-linecap="round"/>
      <path d="M190 206 C214 220 220 246 206 262" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
      <path d="M190 206 C214 220 220 246 206 262" fill="none" stroke="#e8423f" stroke-width="16" stroke-linecap="round"/>
      <circle cx="204" cy="266" r="13" fill="#ffcf9e" ${st(4)}/>
      <path d="M68 206 C52 214 46 228 50 238" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
      <path d="M68 206 C52 214 46 228 50 238" fill="none" stroke="#e8423f" stroke-width="16" stroke-linecap="round"/>
      <g class="gd-can">
        <path d="M30 252 L4 226" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
        <path d="M30 252 L4 226" stroke="#3fb950" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="4" cy="226" rx="6" ry="10" fill="#3fb950" ${st(3.5)} transform="rotate(45 4 226)"/>
        <path d="M30 246 Q50 222 72 246" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
        <path d="M30 246 Q50 222 72 246" fill="none" stroke="#3fb950" stroke-width="4" stroke-linecap="round"/>
        <path d="M24 246 L78 246 L74 298 Q74 302 70 302 L32 302 Q28 302 28 298 Z" fill="#3fb950" ${st(5)}/>
        <path d="M30 262 H74" stroke="#7fe08a" stroke-width="5" stroke-linecap="round"/>
        <g class="gd-drops">
          <path d="M-2 238 q-4 7 0 9 q4 -2 0 -9Z M6 246 q-4 7 0 9 q4 -2 0 -9Z M-4 252 q-4 7 0 9 q4 -2 0 -9Z" fill="#5ec8f5" stroke="${INK}" stroke-width="1.5"/>
        </g>
      </g>
      <circle cx="50" cy="240" r="13" fill="#ffcf9e" ${st(4)}/>
      <g class="gd-gus-head">
        <circle cx="76" cy="124" r="12" fill="#ffcf9e" ${st(4)}/><circle cx="180" cy="124" r="12" fill="#ffcf9e" ${st(4)}/>
        <circle cx="128" cy="122" r="52" fill="#ffcf9e" ${st(5)}/>
        <ellipse cx="96" cy="140" rx="11" ry="7" fill="#ff9f9f" opacity=".75"/><ellipse cx="160" cy="140" rx="11" ry="7" fill="#ff9f9f" opacity=".75"/>
        <path d="M98 104 Q108 98 118 104 M138 104 Q148 98 158 104" fill="none" stroke="#9a9a9a" stroke-width="6" stroke-linecap="round"/>
        <g class="gd-gus-eyes">
          <ellipse cx="108" cy="117" rx="7" ry="9" fill="${INK}"/><ellipse cx="148" cy="117" rx="7" ry="9" fill="${INK}"/>
          <circle cx="110" cy="113" r="2.6" fill="#fff"/><circle cx="150" cy="113" r="2.6" fill="#fff"/>
        </g>
        <path class="gd-gus-mouth" d="M114 154 Q128 174 142 154 Z" fill="#7a1f2b" ${st(4)}/>
        <path d="M128 144 C116 136 96 138 90 152 C104 150 114 156 128 150 C142 156 152 150 166 152 C160 138 140 136 128 144Z" fill="#fff" ${st(4)}/>
        <ellipse cx="128" cy="134" rx="14" ry="11" fill="#f39a74" ${st(4)}/>
        <ellipse cx="124" cy="130" rx="4" ry="2.6" fill="#fff" opacity=".6"/>
        <ellipse cx="128" cy="84" rx="94" ry="20" fill="#f4cf62" ${st(5)}/>
        <path d="M50 86 Q128 104 206 86 M64 78 Q128 92 192 78" fill="none" stroke="#c9a23a" stroke-width="2.5" opacity=".8"/>
        <path d="M80 84 C80 42 96 28 128 28 C160 28 176 42 176 84 Q128 92 80 84Z" fill="#f7d873" ${st(5)}/>
        <path d="M92 50 Q128 42 164 50 M86 64 Q128 56 170 64" fill="none" stroke="#c9a23a" stroke-width="2.5" opacity=".8"/>
        <path d="M80 74 Q128 84 176 74 L176 62 Q128 72 80 62 Z" fill="#e8423f" ${st(4)}/>
        <g transform="translate(160 70)">
          <circle cx="0" cy="-7" r="6" fill="#fff" ${st(2.5)}/><circle cx="7" cy="0" r="6" fill="#fff" ${st(2.5)}/>
          <circle cx="0" cy="7" r="6" fill="#fff" ${st(2.5)}/><circle cx="-7" cy="0" r="6" fill="#fff" ${st(2.5)}/>
          <circle r="4.5" fill="#ffd23f" ${st(2.5)}/>
        </g>
      </g>
    </g>
  </svg>`;

  const BUNNY_SVG = `<svg viewBox="0 0 80 105" width="80" height="105" class="gd-bunny">
    <g class="gd-bun-ears">
      <ellipse cx="27" cy="26" rx="9" ry="24" fill="#fff" ${st(4)} transform="rotate(-10 27 26)"/>
      <ellipse cx="53" cy="26" rx="9" ry="24" fill="#fff" ${st(4)} transform="rotate(10 53 26)"/>
      <ellipse cx="27" cy="28" rx="4" ry="15" fill="#ffb3c7" transform="rotate(-10 27 28)"/>
      <ellipse cx="53" cy="28" rx="4" ry="15" fill="#ffb3c7" transform="rotate(10 53 28)"/>
    </g>
    <ellipse cx="40" cy="96" rx="27" ry="20" fill="#fff" ${st(4)}/>
    <circle cx="40" cy="64" r="24" fill="#fff" ${st(4)}/>
    <circle cx="31" cy="60" r="4" fill="${INK}"/><circle cx="49" cy="60" r="4" fill="${INK}"/>
    <circle cx="32.3" cy="58.5" r="1.4" fill="#fff"/><circle cx="50.3" cy="58.5" r="1.4" fill="#fff"/>
    <ellipse cx="40" cy="69" rx="4" ry="3" fill="#ff6fae" ${st(2)}/>
    <path d="M40 72 V76 M34 77 Q40 81 46 77" fill="none" ${st(2.5)}/>
    <ellipse cx="26" cy="70" rx="4.5" ry="3" fill="#ffb3c7"/><ellipse cx="54" cy="70" rx="4.5" ry="3" fill="#ffb3c7"/>
  </svg>`;

  const BUSH_SVG = `<svg viewBox="0 0 116 90" width="116" height="90" class="gd-bush">
    <circle cx="28" cy="58" r="28" fill="#3aae47" ${st(5)}/>
    <circle cx="88" cy="58" r="27" fill="#3aae47" ${st(5)}/>
    <circle cx="58" cy="42" r="36" fill="#3aae47" ${st(5)}/>
    <rect x="6" y="56" width="104" height="34" fill="#3aae47"/>
    <path d="M4 88 H112" ${st(5)}/>
    <ellipse cx="46" cy="24" rx="12" ry="6" fill="#62cf6c"/><ellipse cx="20" cy="46" rx="8" ry="5" fill="#62cf6c"/>
    <circle cx="36" cy="64" r="5" fill="#e8423f" ${st(2)}/><circle cx="74" cy="48" r="5" fill="#e8423f" ${st(2)}/><circle cx="90" cy="70" r="5" fill="#e8423f" ${st(2)}/>
  </svg>`;

  function sunflowerSVG() {
    let petals = '';
    for (let i = 0; i < 14; i++) petals += `<ellipse cx="55" cy="26" rx="9" ry="20" fill="#ffc928" ${st(3.5)} transform="rotate(${(i * 360 / 14).toFixed(1)} 55 60)"/>`;
    return `<svg viewBox="0 0 110 230" width="110" height="230">
      <path d="M55 230 C50 180 62 130 55 70" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M55 230 C50 180 62 130 55 70" fill="none" stroke="#3fb950" stroke-width="7" stroke-linecap="round"/>
      <path d="M54 170 Q24 168 14 144 Q44 142 54 170Z" fill="#6fdc5a" ${st(4)}/>
      <path d="M57 140 Q88 136 98 112 Q68 112 57 140Z" fill="#6fdc5a" ${st(4)}/>
      <g class="gd-sf-head">
        ${petals}
        <circle cx="55" cy="60" r="24" fill="#8a5427" ${st(5)}/>
        <circle cx="47" cy="54" r="2" fill="#5a3415"/><circle cx="63" cy="66" r="2" fill="#5a3415"/><circle cx="55" cy="72" r="2" fill="#5a3415"/><circle cx="42" cy="66" r="2" fill="#5a3415"/>
        <g class="gd-sf-back"><circle cx="55" cy="60" r="25" fill="#4fbf4a" ${st(5)}/><path d="M55 60 L70 46 M55 60 L40 46 M55 60 V82" stroke="#2e8a3a" stroke-width="4" stroke-linecap="round"/></g>
        <g class="gd-sf-face">
          <circle cx="46" cy="56" r="4.5" fill="#fff"/><circle cx="64" cy="56" r="4.5" fill="#fff"/>
          <circle cx="47" cy="57" r="2.4" fill="${INK}"/><circle cx="65" cy="57" r="2.4" fill="${INK}"/>
          <path d="M44 66 Q55 78 66 66" fill="#7a1f2b" ${st(3)}/>
          <ellipse cx="38" cy="66" rx="4" ry="2.6" fill="#ff8f6b" opacity=".8"/><ellipse cx="72" cy="66" rx="4" ry="2.6" fill="#ff8f6b" opacity=".8"/>
        </g>
      </g>
    </svg>`;
  }

  const FOUNTAIN_SVG = `<svg viewBox="0 0 190 210" width="190" height="210">
    <ellipse cx="95" cy="200" rx="88" ry="9" fill="#000" opacity=".15"/>
    <g class="gd-jets">
      <path d="M95 64 C95 22 64 30 52 92 M95 64 C95 22 126 30 138 92 M95 66 V18" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path class="gd-water" d="M95 64 C95 22 64 30 52 92 M95 64 C95 22 126 30 138 92 M95 66 V18" fill="none" stroke="#9fe3ff" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 8"/>
    </g>
    <path d="M50 102 Q38 124 32 146 M140 102 Q152 124 158 146" fill="none" stroke="#9fe3ff" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 7" class="gd-water"/>
    <path d="M8 146 Q8 196 95 198 Q182 196 182 146 Z" fill="#d6cfc2" ${st(5)}/>
    <path d="M24 170 Q95 186 166 170" fill="none" stroke="#b9ae9c" stroke-width="4"/>
    <ellipse cx="95" cy="146" rx="87" ry="16" fill="#6cc8f2" ${st(5)}/>
    <ellipse class="gd-ripple2" cx="95" cy="148" rx="50" ry="7" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
    <rect x="82" y="96" width="26" height="54" rx="6" fill="#d6cfc2" ${st(5)}/>
    <path d="M42 94 Q95 128 148 94 Z" fill="#d6cfc2" ${st(5)}/>
    <ellipse cx="95" cy="94" rx="53" ry="10" fill="#6cc8f2" ${st(4.5)}/>
    <circle cx="95" cy="70" r="9" fill="#d6cfc2" ${st(4)}/>
  </svg>`;

  const FROG_SVG = `<svg viewBox="0 0 140 110" width="140" height="110">
    <ellipse cx="70" cy="90" rx="64" ry="17" fill="#4fbf4a" ${st(4)}/>
    <path d="M70 90 L130 84 L132 96Z" fill="#5fc0ef"/>
    <path d="M86 98 Q100 92 118 96" fill="none" stroke="#2e8a3a" stroke-width="2.5"/>
    <g class="gd-frog">
      <ellipse cx="40" cy="86" rx="13" ry="6" fill="#5ccf3a" ${st(3.5)}/>
      <ellipse cx="100" cy="86" rx="13" ry="6" fill="#5ccf3a" ${st(3.5)}/>
      <ellipse cx="70" cy="66" rx="35" ry="24" fill="#5ccf3a" ${st(5)}/>
      <ellipse cx="70" cy="75" rx="20" ry="12" fill="#c9f7a8"/>
      <circle cx="52" cy="42" r="13" fill="#5ccf3a" ${st(4.5)}/><circle cx="88" cy="42" r="13" fill="#5ccf3a" ${st(4.5)}/>
      <circle cx="52" cy="42" r="8" fill="#fff" ${st(2.5)}/><circle cx="88" cy="42" r="8" fill="#fff" ${st(2.5)}/>
      <circle cx="53" cy="43" r="4.5" fill="${INK}"/><circle cx="89" cy="43" r="4.5" fill="${INK}"/>
      <path d="M50 60 Q70 72 90 60" fill="none" ${st(3.5)}/>
      <ellipse cx="44" cy="62" rx="5" ry="3" fill="#ff9f9f" opacity=".7"/><ellipse cx="96" cy="62" rx="5" ry="3" fill="#ff9f9f" opacity=".7"/>
      <ellipse class="gd-sac" cx="70" cy="78" rx="14" ry="9" fill="#eaffd6" ${st(3)}/>
    </g>
  </svg>`;

  function butterflySVG(c1, c2) {
    return `<svg viewBox="0 0 54 46" width="54" height="46">
      <g class="gd-wings">
        <ellipse cx="15" cy="15" rx="13" ry="11" fill="${c1}" ${st(3)}/>
        <ellipse cx="39" cy="15" rx="13" ry="11" fill="${c1}" ${st(3)}/>
        <ellipse cx="17" cy="32" rx="9" ry="8" fill="${c2}" ${st(3)}/>
        <ellipse cx="37" cy="32" rx="9" ry="8" fill="${c2}" ${st(3)}/>
        <circle cx="14" cy="14" r="4" fill="#fff" opacity=".8"/><circle cx="40" cy="14" r="4" fill="#fff" opacity=".8"/>
      </g>
      <ellipse cx="27" cy="24" rx="4" ry="14" fill="${INK}"/>
      <path d="M25 11 Q21 3 17 2 M29 11 Q33 3 37 2" fill="none" ${st(2)}/>
    </svg>`;
  }

  /* ------------------------------------------------------------------
     Room styles
     ------------------------------------------------------------------ */
  const CSS = `
  .scene-garden { font-family: var(--font); background: #8fe065; }
  .scene-garden .gd-bg { position: absolute; left: 0; top: 0; }
  .scene-garden .gd-sunrays { transform-box: fill-box; transform-origin: center; animation: gd-spin 40s linear infinite; }
  @keyframes gd-spin { to { transform: rotate(360deg); } }
  .scene-garden .gd-cloud { animation: gd-drift 90s linear infinite; }
  .scene-garden .gd-cloud2 { animation-duration: 120s; animation-delay: -50s; }
  .scene-garden .gd-cloud3 { animation-duration: 100s; animation-delay: -20s; }
  @keyframes gd-drift { 0% { transform: translateX(-600px); } 100% { transform: translateX(1500px); } }
  .scene-garden .gd-flag { transform-box: fill-box; transform-origin: 0% 50%; animation: gd-flag 1.4s ease-in-out infinite alternate; }
  @keyframes gd-flag { to { transform: scaleX(.75) skewY(8deg); } }
  .scene-garden .gd-ripple { animation: gd-flow 1.6s ease-in-out infinite alternate; }
  @keyframes gd-flow { to { transform: translateY(6px); opacity: .5; } }
  .scene-garden .gd-ripple2 { transform-box: fill-box; transform-origin: center; animation: gd-ring 2.6s ease-out infinite; }
  @keyframes gd-ring { from { transform: scale(.4); opacity: .9; } to { transform: scale(1.3); opacity: 0; } }

  .scene-garden .gd-layer { position: absolute; inset: 0; pointer-events: none; }
  .scene-garden .gd-layer > * { pointer-events: auto; }

  /* Pots */
  .scene-garden .gd-pot { position: absolute; width: 180px; height: 290px; cursor: pointer; animation: gd-rise .6s cubic-bezier(.3,1.5,.5,1) backwards; }
  @keyframes gd-rise { from { transform: translateY(90px) scale(.5); opacity: 0; } }
  .scene-garden .gd-potbody { position: absolute; left: 0; top: 125px; width: 180px; height: 165px; transform-origin: 50% 100%; }
  .scene-garden .gd-potbody svg { position: absolute; left: 0; top: 0; }
  .scene-garden .gd-plaque {
    position: absolute; left: 35px; top: 50px; width: 110px; height: 84px;
    border: 5px solid var(--ink); border-radius: 22px; color: var(--ink);
    display: flex; align-items: center; justify-content: center; gap: 2px;
    font-weight: 800; line-height: 1; box-shadow: inset 0 -6px 0 rgba(0,0,0,.08);
  }
  .scene-garden .gd-plaque .gd-L { font-size: 76px; }
  .scene-garden .gd-plaque .gd-l { font-size: 52px; margin-top: 12px; color: #6a35ad; }
  .scene-garden .gd-plaque.gd-two .gd-L { font-size: 66px; }
  .scene-garden .gd-plaque.gd-slot { left: 38px; top: 45px; width: 104px; height: 96px; background: rgba(255,250,240,.6); border-style: dashed; border-radius: 24px; }
  .scene-garden .gd-plaque.gd-slot.full { border-style: solid; }
  .scene-garden .gd-soil { position: absolute; left: 40px; top: 112px; width: 100px; height: 40px; }
  .scene-garden .gd-pot.gd-out { animation: gd-out .45s ease-in forwards; }

  /* Flowers */
  .scene-garden .gd-flower { position: absolute; left: 20px; top: -22px; width: 140px; height: 170px; pointer-events: none; transform-origin: 50% 100%; }
  .scene-garden .gd-flower svg { overflow: visible; }
  .scene-garden .gd-flower.bloom { animation: gd-sway 3.2s ease-in-out 1.2s infinite; }
  .scene-garden .gd-flower.gd-dance { animation: gd-dance .45s ease-in-out infinite alternate; }
  @keyframes gd-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  @keyframes gd-dance { from { transform: rotate(-9deg) scale(1.02); } to { transform: rotate(9deg) scale(1.08); } }
  .scene-garden .gd-sproutg { transform-box: fill-box; transform-origin: 50% 100%; transform: scale(0); transition: transform .45s cubic-bezier(.3,1.6,.5,1), opacity .3s; }
  .scene-garden .gd-flower.sprout .gd-sproutg { transform: scale(1); }
  .scene-garden .gd-flower.bloom .gd-sproutg { opacity: 0; }
  .scene-garden .gd-stem { transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0); transition: transform .55s cubic-bezier(.3,1.3,.5,1); }
  .scene-garden .gd-flower.bloom .gd-stem { transform: scaleY(1); }
  .scene-garden .gd-leaf { transform-box: fill-box; transform-origin: 50% 100%; transform: scale(0); transition: transform .4s cubic-bezier(.3,1.6,.5,1) .3s; }
  .scene-garden .gd-flower.bloom .gd-leaf { transform: scale(1); }
  .scene-garden .gd-head { transform-box: fill-box; transform-origin: center; transform: scale(0); }
  .scene-garden .gd-flower.bloom .gd-head { animation: gd-headpop .65s cubic-bezier(.3,1.6,.5,1) .45s both; }
  @keyframes gd-headpop { from { transform: scale(0) rotate(-120deg); } to { transform: scale(1) rotate(0deg); } }

  /* Draggable things */
  .scene-garden .gd-item { position: absolute; }
  .scene-garden .gd-inner { position: relative; width: 100%; height: 100%; transition: transform .18s, filter .18s; }
  .scene-garden .gd-in { animation: gd-dropin .65s cubic-bezier(.3,1.5,.5,1) backwards; }
  @keyframes gd-dropin { from { transform: translateY(-150px) scale(.4); opacity: 0; } }
  .scene-garden .gd-sel { transform: translateY(-10px) scale(1.1); filter: drop-shadow(0 0 8px #fff59a) drop-shadow(0 0 18px #ffd23f); }
  .scene-garden .gd-wig { animation: gd-wig .5s; }
  @keyframes gd-wig { 20% { transform: rotate(-9deg); } 40% { transform: rotate(9deg); } 60% { transform: rotate(-5deg); } 80% { transform: rotate(4deg); } }
  .scene-garden .gd-hop { animation: gd-hop .55s; }
  @keyframes gd-hop { 35% { transform: translateY(-26px) scale(1.12); } 65% { transform: translateY(0) scale(.95); } }
  .scene-garden .gd-sink { animation: gd-sink .42s ease-in forwards; }
  @keyframes gd-sink { to { transform: translateY(34px) scale(.1); opacity: 0; } }
  .scene-garden .gd-out { animation: gd-out .45s ease-in forwards; }
  @keyframes gd-out { to { transform: translateY(40px) scale(.3); opacity: 0; } }
  .scene-garden .gd-bob { width: 100%; height: 100%; animation: gd-bob 2.8s ease-in-out infinite; }
  @keyframes gd-bob { 50% { transform: translateY(-5px) rotate(1.5deg); } }

  .scene-garden .gd-packet { position: relative; width: 120px; height: 150px; }
  .scene-garden .gd-packet svg { position: absolute; left: 0; top: 0; filter: drop-shadow(0 5px 0 rgba(58,42,26,.35)); }
  .scene-garden .gd-packet-letter { position: absolute; left: 24px; top: 32px; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; font-size: 64px; font-weight: 800; line-height: 1; color: var(--ink); }
  .scene-garden .gd-card { width: 140px; height: 140px; background: #fffdf4; border: 5px solid var(--ink); border-radius: 26px; box-shadow: 0 7px 0 rgba(58,42,26,.55); display: flex; align-items: center; justify-content: center; }
  .scene-garden .gd-card.green { background: #eaffdf; }
  .scene-garden .gd-tile {
    width: 90px; height: 90px; border: 5px solid var(--ink); border-radius: 20px;
    background: linear-gradient(#fff1c4, #f4c46a); box-shadow: 0 6px 0 var(--ink), inset 0 -6px 0 rgba(181,118,60,.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 66px; font-weight: 800; line-height: 1; color: var(--ink); padding-bottom: 6px;
  }

  /* Word sign (difficulty 3) */
  .scene-garden .gd-sign { position: absolute; width: 176px; height: 196px; cursor: pointer; animation: gd-dropin .6s cubic-bezier(.3,1.5,.5,1) backwards; }
  .scene-garden .gd-sign-post { position: absolute; left: 76px; bottom: 0; width: 24px; height: 50px; background: #9a5d2a; border: 5px solid var(--ink); border-radius: 6px; }
  .scene-garden .gd-sign-board { position: absolute; left: 0; top: 0; width: 176px; height: 156px; background: #c98a4b; border: 5px solid var(--ink); border-radius: 22px; box-shadow: 0 6px 0 rgba(58,42,26,.4); display: flex; align-items: center; justify-content: center; }
  .scene-garden .gd-sign-board .gd-card { width: 136px; height: 128px; box-shadow: none; border-width: 4px; }

  /* Gus */
  .scene-garden .gd-gus { position: absolute; left: 1006px; top: 262px; width: 250px; height: 330px; cursor: pointer; }
  .scene-garden .gd-gus svg { overflow: visible; }
  .scene-garden .gd-gus-body { transform-box: fill-box; transform-origin: 50% 100%; animation: gd-breathe 3.2s ease-in-out infinite; }
  @keyframes gd-breathe { 50% { transform: scale(1.02, .985); } }
  .scene-garden .gd-gus-eyes { transform-box: fill-box; transform-origin: center; animation: gd-blink 4.6s infinite; }
  @keyframes gd-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
  .scene-garden .gd-gus-mouth { transform-box: fill-box; transform-origin: 50% 0%; }
  .scene-garden .gd-gus.talking .gd-gus-mouth { animation: gd-talk .2s infinite alternate; }
  @keyframes gd-talk { from { transform: scaleY(.35); } to { transform: scaleY(1.2); } }
  .scene-garden .gd-gus-head { transform-box: fill-box; transform-origin: 50% 100%; }
  .scene-garden .gd-gus.talking .gd-gus-head { animation: gd-nod .45s ease-in-out infinite alternate; }
  @keyframes gd-nod { from { transform: rotate(-2deg); } to { transform: rotate(2.5deg); } }
  .scene-garden .gd-can { transform-box: fill-box; transform-origin: 85% 10%; transition: transform .35s cubic-bezier(.3,1.4,.5,1); }
  .scene-garden .gd-gus.water .gd-can { transform: rotate(-24deg); }
  .scene-garden .gd-drops { opacity: 0; }
  .scene-garden .gd-gus.water .gd-drops { opacity: 1; animation: gd-drip .45s linear infinite; }
  @keyframes gd-drip { from { transform: translate(0, -4px); } to { transform: translate(-4px, 10px); } }

  /* Extras */
  .scene-garden .gd-sunflower { position: absolute; left: 14px; top: 110px; width: 110px; height: 230px; cursor: pointer; }
  .scene-garden .gd-sunflower > svg { transform-origin: 50% 100%; animation: gd-sway 4s ease-in-out infinite; }
  .scene-garden .gd-sf-head { transform-box: fill-box; transform-origin: center; transform: scaleX(.4) rotate(-10deg); transition: transform .6s cubic-bezier(.3,1.5,.5,1); }
  .scene-garden .gd-sunflower.facing .gd-sf-head { transform: none; }
  .scene-garden .gd-sf-back { transition: opacity .25s .1s; }
  .scene-garden .gd-sunflower.facing .gd-sf-back { opacity: 0; }
  .scene-garden .gd-sf-face { opacity: 0; transition: opacity .25s .2s; }
  .scene-garden .gd-sunflower.facing .gd-sf-face { opacity: 1; }

  .scene-garden .gd-bunbox { position: absolute; left: 110px; top: 150px; width: 116px; height: 150px; overflow: hidden; cursor: pointer; }
  .scene-garden .gd-bunny { position: absolute; left: 18px; bottom: 10px; transform: translateY(80px); transition: transform .45s cubic-bezier(.3,1.6,.5,1); }
  .scene-garden .gd-bunbox.peek .gd-bunny { transform: translateY(20px); }
  .scene-garden .gd-bunbox.up .gd-bunny { transform: translateY(0); }
  .scene-garden .gd-bun-ears { transform-box: fill-box; transform-origin: 50% 100%; }
  .scene-garden .gd-bunbox.up .gd-bun-ears { animation: gd-ears .3s ease-in-out 4 alternate; }
  @keyframes gd-ears { to { transform: rotate(8deg) scaleY(.9); } }
  .scene-garden .gd-bush { position: absolute; left: 0; bottom: 0; }

  .scene-garden .gd-fountain { position: absolute; left: 16px; top: 330px; width: 190px; height: 210px; cursor: pointer; }
  .scene-garden .gd-water { animation: gd-dash .6s linear infinite; }
  @keyframes gd-dash { to { stroke-dashoffset: -18; } }
  .scene-garden .gd-jets { transform-box: fill-box; transform-origin: 50% 100%; transition: transform .3s cubic-bezier(.3,1.6,.5,1); }
  .scene-garden .gd-fountain.splash .gd-jets { transform: scaleY(1.45) scaleX(1.12); }
  .scene-garden .gd-droplet { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #9fe3ff; border: 2.5px solid var(--ink); pointer-events: none; }

  .scene-garden .gd-frogbox { position: absolute; left: 930px; top: 600px; width: 140px; height: 110px; cursor: pointer; }
  .scene-garden .gd-frog { transform-box: fill-box; transform-origin: 50% 100%; }
  .scene-garden .gd-frogbox.croak .gd-frog { animation: gd-froghop .6s ease-out; }
  @keyframes gd-froghop { 30% { transform: translateY(-26px) scale(1.05, .95); } 60% { transform: translateY(0) scale(1.08, .9); } }
  .scene-garden .gd-sac { transform-box: fill-box; transform-origin: 50% 30%; transform: scale(.3); }
  .scene-garden .gd-frogbox.croak .gd-sac { animation: gd-sac .3s ease-in-out 2 alternate; }
  @keyframes gd-sac { to { transform: scale(1.6); } }
  .scene-garden .gd-ribbit {
    position: absolute; left: 70px; top: -28px; padding: 2px 14px; background: #fff; border: 4px solid var(--ink);
    border-radius: 18px; font-size: 24px; font-weight: 800; white-space: nowrap; pointer-events: none;
    transform: scale(0); transition: transform .25s cubic-bezier(.3,1.6,.5,1);
  }
  .scene-garden .gd-frogbox.croak .gd-ribbit { transform: scale(1) rotate(-6deg); }

  .scene-garden .gd-bfly { position: absolute; width: 54px; height: 46px; cursor: pointer; }
  .scene-garden .gd-bfly-a { left: 34px; top: 128px; animation: gd-fly-a 13s ease-in-out infinite; }
  .scene-garden .gd-bfly-b { left: 1030px; top: 104px; animation: gd-fly-b 11s ease-in-out infinite; }
  @keyframes gd-fly-a { 0%, 100% { transform: translate(0, 0) rotate(-6deg); } 25% { transform: translate(120px, 40px) rotate(10deg); } 50% { transform: translate(70px, 130px) rotate(-8deg); } 75% { transform: translate(-6px, 70px) rotate(6deg); } }
  @keyframes gd-fly-b { 0%, 100% { transform: translate(0, 0) rotate(6deg); } 30% { transform: translate(150px, 30px) rotate(-8deg); } 60% { transform: translate(80px, 100px) rotate(8deg); } 80% { transform: translate(20px, 50px) rotate(-4deg); } }
  .scene-garden .gd-bfly-in { width: 100%; height: 100%; }
  .scene-garden .gd-wings { transform-box: fill-box; transform-origin: center; animation: gd-flap .22s ease-in-out infinite alternate; }
  @keyframes gd-flap { to { transform: scaleX(.3); } }
  .scene-garden .gd-bfly-in.flee { animation: gd-flee 1.3s ease-in forwards; }
  .scene-garden .gd-bfly-b .gd-bfly-in.flee { animation-name: gd-flee-b; }
  @keyframes gd-flee { 30% { transform: translate(-16px, -24px) rotate(-14deg); } 100% { transform: translate(200px, -340px) rotate(20deg) scale(.6); opacity: 0; } }
  @keyframes gd-flee-b { 30% { transform: translate(16px, -24px) rotate(14deg); } 100% { transform: translate(-260px, -260px) rotate(-20deg) scale(.6); opacity: 0; } }
  .scene-garden .gd-bfly-in.back { animation: gd-bback .9s ease-out; }
  @keyframes gd-bback { from { transform: translateY(-140px) scale(.2); opacity: 0; } }
  `;

  /* ------------------------------------------------------------------
     The room
     ------------------------------------------------------------------ */
  Castle.registerRoom({
    id: 'garden',
    title: 'Royal Garden',
    jewel: 'diamond',

    enter(root, api) {
      const diff = Math.max(1, Math.min(3, api.difficulty || 1));
      const el = api.el;

      root.appendChild(el('style', { text: CSS }));
      root.appendChild(api.svg(bgSVG()));
      root.appendChild(el('div', { class: 'room-title', text: 'Royal Garden' }));
      const dotsEl = el('div', { class: 'round-dots' }, [el('span'), el('span'), el('span')]);
      root.appendChild(dotsEl);
      const dots = Array.from(dotsEl.children);

      /* ---------- Gus & speech ---------- */
      const gus = el('div', { class: 'gd-gus tap', html: GUS_SVG });
      let talkTok = 0;
      function sayGus(text) {
        const tok = ++talkTok;
        gus.classList.add('talking');
        return api.say(spoken(text), { who: 'Gus', pitch: 1.1, rate: 0.92, caption: captioned(text) }).then(() => {
          if (tok === talkTok) gus.classList.remove('talking');
        });
      }
      /* Speak several lines in a row, but stop if anything else is said meanwhile */
      async function sayChain(lines) {
        for (const line of lines) {
          const tok = talkTok + 1;
          await sayGus(line);
          if (talkTok !== tok) return;
        }
      }
      function anim(node, cls, ms) {
        node.classList.remove('gd-in', cls);
        void node.offsetWidth;
        node.classList.add(cls);
        api.setTimeout(() => node.classList.remove(cls), ms || 600);
      }

      /* ---------- Extras (tappable surprises) ---------- */
      // Sunflower that turns to face you
      const sunflower = el('div', { class: 'gd-sunflower', html: sunflowerSVG() });
      let sfTok = 0;
      api.on(sunflower, 'click', () => {
        const tok = ++sfTok;
        sunflower.classList.add('facing');
        api.sfx('chime');
        api.setTimeout(() => api.note('G5', 0.3, 'bell'), 180);
        api.setTimeout(() => { if (tok === sfTok) sunflower.classList.remove('facing'); }, 3600);
      });

      // Bunny hiding in the hedge
      const bunbox = el('div', { class: 'gd-bunbox tap', html: BUNNY_SVG + BUSH_SVG });
      let bunnyUp = false;
      api.on(bunbox, 'click', () => {
        if (bunnyUp) return;
        bunnyUp = true;
        bunbox.classList.remove('peek');
        bunbox.classList.add('up');
        api.sfx('boing');
        api.setTimeout(() => api.sfx('giggle'), 350);
        api.setTimeout(() => { bunbox.classList.remove('up'); }, 2200);
        api.setTimeout(() => { bunnyUp = false; }, 2700);
      });
      api.setInterval(() => {
        if (bunnyUp) return;
        bunbox.classList.add('peek');
        api.setTimeout(() => bunbox.classList.remove('peek'), 1300);
      }, 7500);

      // Fountain that splashes
      const fountain = el('div', { class: 'gd-fountain tap', html: FOUNTAIN_SVG });
      let fountainBusy = false;
      api.on(fountain, 'click', () => {
        if (fountainBusy) return;
        fountainBusy = true;
        fountain.classList.add('splash');
        api.sfx('splash');
        api.setTimeout(() => api.sfx('plop'), 250);
        for (let i = 0; i < 12; i++) {
          const d = el('div', { class: 'gd-droplet', style: { left: (89 + api.rand(12)) + 'px', top: '20px' } });
          fountain.appendChild(d);
          const dx = (Math.random() - 0.5) * 220, up = 40 + Math.random() * 70;
          const a = d.animate ? d.animate([
            { transform: 'translate(0,0) scale(1)' },
            { transform: `translate(${dx * 0.5}px, ${-up}px) scale(1.1)`, offset: 0.4 },
            { transform: `translate(${dx}px, ${110 + Math.random() * 30}px) scale(.6)`, opacity: 0.2 },
          ], { duration: 900 + Math.random() * 300, easing: 'ease-out' }) : null;
          if (a) a.onfinish = () => d.remove(); else api.setTimeout(() => d.remove(), 900);
        }
        api.setTimeout(() => { fountain.classList.remove('splash'); fountainBusy = false; }, 1000);
      });

      // Butterflies
      function makeButterfly(cls, c1, c2) {
        const inner = el('div', { class: 'gd-bfly-in', html: butterflySVG(c1, c2) });
        const b = el('div', { class: 'gd-bfly ' + cls }, inner);
        let busy = false;
        api.on(b, 'click', () => {
          if (busy) return;
          busy = true;
          api.sfx('sparkle');
          inner.classList.add('flee');
          api.setTimeout(() => {
            inner.classList.remove('flee');
            inner.classList.add('back');
            api.setTimeout(() => { inner.classList.remove('back'); busy = false; }, 950);
          }, 3800);
        });
        return b;
      }
      const bfA = makeButterfly('gd-bfly-a', '#ff6fae', '#ffc928');
      const bfB = makeButterfly('gd-bfly-b', '#9b5de5', '#8fd3ff');

      // Frog on a lily pad
      const frog = el('div', { class: 'gd-frogbox tap', html: FROG_SVG });
      frog.appendChild(el('div', { class: 'gd-ribbit', text: 'Ribbit!' }));
      let frogBusy = false;
      api.on(frog, 'click', () => {
        if (frogBusy) return;
        frogBusy = true;
        frog.classList.add('croak');
        api.note('D3', 0.14, 'sawtooth');
        api.setTimeout(() => api.note('A2', 0.2, 'sawtooth'), 170);
        api.setTimeout(() => api.sfx('plop'), 420);
        api.setTimeout(() => { frog.classList.remove('croak'); frogBusy = false; }, 1000);
      });

      // Gus himself
      const GUS_LINES = ['Hello there, little gardener!', 'Flowers love sunshine and water!', 'Ho ho! I love my garden!', 'Splish, splash! Time to water!'];
      let gusBusy = false;
      api.on(gus, 'click', () => {
        if (gusBusy) return;
        gusBusy = true;
        gus.classList.add('water');
        api.sfx('splash');
        sayGus(api.pick(GUS_LINES));
        api.setTimeout(() => { gus.classList.remove('water'); gusBusy = false; }, 1500);
      });

      root.append(sunflower, bunbox, fountain, frog, gus);

      /* ---------- Play layer ---------- */
      const layer = el('div', { class: 'gd-layer' });
      root.appendChild(layer);
      root.append(bfA, bfB);

      let cur = null;        // current round state
      let selected = null;   // tapped item waiting for a pot

      function deselect() {
        if (selected) { selected.inner.classList.remove('gd-sel'); selected = null; }
      }
      function clearHints(R) {
        R.pots.forEach(p => p.el.classList.remove('glow'));
        R.items.forEach(it => it.inner.classList.remove('glow'));
      }

      /* Pot: diff 1/2 show a letter, diff 3 has an empty slot */
      function makePot(R, letter, cx, idx) {
        const pot = { letter, filled: false, R };
        const colors = PETALS[api.rand(PETALS.length)];
        pot.flower = el('div', { class: 'gd-flower', html: flowerSVG(colors, api.rand(2)) });
        pot.head = pot.flower.querySelector('.gd-head');
        pot.body = el('div', { class: 'gd-potbody', html: POT_SVG });
        if (diff === 3) {
          pot.plaque = el('div', { class: 'gd-plaque gd-slot' });
        } else if (diff === 2) {
          pot.plaque = el('div', { class: 'gd-plaque gd-two', style: { background: PLAQUE_COLORS[idx % 4] } }, [
            el('span', { class: 'gd-L', text: letter }), el('span', { class: 'gd-l', text: letter.toLowerCase() }),
          ]);
        } else {
          pot.plaque = el('div', { class: 'gd-plaque', style: { background: PLAQUE_COLORS[idx % 4] } }, [
            el('span', { class: 'gd-L', text: letter }),
          ]);
        }
        pot.body.appendChild(pot.plaque);
        pot.soil = el('div', { class: 'gd-soil' });
        pot.el = el('div', { class: 'gd-pot', style: { left: (cx - 90) + 'px', top: '290px', animationDelay: (idx * 0.1) + 's' } },
          [pot.flower, pot.body, pot.soil]);
        api.on(pot.el, 'click', () => onPotTap(pot));
        layer.appendChild(pot.el);
        R.pots.push(pot);
        return pot;
      }

      /* Draggable item: packet (d1), picture card (d2) or letter tile (d3) */
      function makeItem(R, data, cx, idx) {
        const item = Object.assign({ R, placed: false, miss: 0, ctrl: null, startPt: null }, data);
        let w, h, top, art;
        if (diff === 1) {
          w = 120; h = 150; top = 114;
          art = el('div', { class: 'gd-packet' });
          art.innerHTML = packetSVG(PACKET_COLORS[(idx + R.r * 2) % PACKET_COLORS.length], api.pick(['#ff6fae', '#ffc928', '#9b5de5', '#e8423f']));
          art.appendChild(el('div', { class: 'gd-packet-letter', text: data.letter }));
        } else if (diff === 2) {
          w = 140; h = 140; top = 118;
          art = el('div', { class: 'gd-card', html: picSVG(data.word, 112) });
        } else {
          w = 90; h = 90; top = 158;
          art = el('div', { class: 'gd-tile', text: data.letter });
        }
        const bob = el('div', { class: 'gd-bob', style: { animationDelay: (-Math.random() * 2.8) + 's' } }, art);
        item.inner = el('div', { class: 'gd-inner gd-in', style: { animationDelay: (0.15 + idx * 0.12) + 's' } }, bob);
        item.el = el('div', { class: 'gd-item', style: { left: (cx - w / 2) + 'px', top: top + 'px', width: w + 'px', height: h + 'px' } }, item.inner);
        layer.appendChild(item.el);
        item.handle = api.draggable(item.el, {
          onStart: () => onPick(item),
          onDrop: (d) => onDrop(item, d),
        });
        api.on(item.el, 'pointerdown', (e) => { item.startPt = api.toStage(e.clientX, e.clientY); });
        R.items.push(item);
        return item;
      }

      function onPick(item) {
        if (selected && selected !== item) deselect();
        if (diff === 2) sayGus(cap(item.word) + '!');
        else sayGus(nameOf(item.letter) + '!');
      }

      function onDrop(item, d) {
        item.ctrl = d;
        const R = item.R;
        const sp = item.startPt || { x: d.x, y: d.y };
        if (Math.hypot(d.x - sp.x, d.y - sp.y) < 14) {   // a tap, not a drag
          d.back();
          if (R !== cur || R.over || item.placed) return;
          if (selected === item) deselect();
          else { deselect(); selected = item; item.inner.classList.remove('gd-in'); item.inner.classList.add('gd-sel'); }
          return;
        }
        deselect();
        if (R !== cur || R.over) { d.back(); return; }
        let best = null, bestD = Infinity;
        R.pots.forEach(p => {
          if (p.filled || !api.hitTest(d.x, d.y, p.el, 10)) return;
          const rc = api.stageRect(p.el), dist = Math.hypot(d.x - rc.cx, d.y - rc.cy);
          if (dist < bestD) { bestD = dist; best = p; }
        });
        if (!best) { d.back(); api.sfx('drop'); return; }
        attempt(item, best);
      }

      function onPotTap(pot) {
        const R = pot.R;
        if (R !== cur) return;
        if (selected && !R.over && !pot.filled && selected.R === R) {
          const it = selected;
          deselect();
          attempt(it, pot);
          return;
        }
        if (pot.flower.classList.contains('bloom')) {
          anim(pot.body, 'gd-hop', 560);
          api.note(api.pick(['C5', 'E5', 'G5', 'A5']), 0.3, 'bell');
          return;
        }
        if (diff === 3) {
          if (!pot.filled) { anim(pot.body, 'gd-wig', 520); sayGus(cap(R.word) + '!'); }
          return;
        }
        api.sfx('click');
        anim(pot.body, 'gd-hop', 560);
        sayGus(nameOf(pot.letter) + '!');
      }

      function attempt(item, pot) {
        const R = item.R;
        if (R.over || item.placed || pot.filled) { if (item.ctrl) item.ctrl.back(); return; }
        if (item.letter === pot.letter) place(item, pot);
        else wrong(item, pot);
      }

      function place(item, pot) {
        const R = item.R;
        item.placed = true;
        pot.filled = true;
        pot.item = item;
        clearHints(R);
        R.misses = 0;
        item.inner.classList.remove('gd-sel', 'gd-in');
        item.ctrl.snapTo(diff === 3 ? pot.plaque : pot.soil);
        item.ctrl.lock();
        R.placed++;
        if (diff === 3) placeLetter(item, pot);
        else plantItem(item, pot);
      }

      function wrong(item, pot) {
        const R = item.R;
        if (item.ctrl) item.ctrl.back();
        api.sfx('boing');
        anim(pot.body, 'gd-wig', 520);
        anim(item.inner, 'gd-wig', 520);
        item.miss++;
        R.misses++;
        if (diff === 3) {
          if (R.misses >= 2) {
            const slot = R.pots.find(p => !p.filled);
            const tile = slot && R.items.find(t => !t.placed && t.letter === slot.letter);
            if (slot && tile) {
              slot.el.classList.add('glow');
              tile.inner.classList.add('glow');
              sayGus(`Let me help! Find ${nameOf(slot.letter)}.`);
              return;
            }
          }
          if (!R.word.includes(item.letter)) sayGus(`Hmm, ${nameOf(item.letter)} is not in ${R.word}. Try another!`);
          else sayGus(api.pick(['Oops! Not that spot.', 'Almost! Try another pot.']));
          return;
        }
        const correct = R.pots.find(p => p.letter === item.letter);
        if (item.miss >= 2 && correct) {
          correct.el.classList.add('glow');
          if (diff === 2) sayGus(`${cap(item.word)} starts with ${nameOf(item.letter)}. Find ${nameOf(item.letter)}!`);
          else sayGus(`Look for ${nameOf(item.letter)}! It's shining!`);
          return;
        }
        if (diff === 2) sayGus(`Hmm, ${item.word} doesn't start with ${nameOf(pot.letter)}. Try again!`);
        else sayGus(`Oops! That pot says ${nameOf(pot.letter)}. Try again!`);
      }

      /* Grow a flower out of a pot */
      function bloom(pot) {
        pot.flower.classList.add('bloom');
        api.note('C5', 0.2, 'pluck');
        api.setTimeout(() => api.note('E5', 0.2, 'pluck'), 110);
        api.setTimeout(() => api.note('G5', 0.3, 'pluck'), 220);
        api.setTimeout(() => {
          api.sfx('pop');
          const rc = api.stageRect(pot.el);
          api.sparkle(rc.cx, rc.y + 40, 18);
        }, 700);
      }

      /* Difficulty 1/2: the seed / picture sinks into the soil and blooms */
      async function plantItem(item, pot) {
        const R = item.R;
        const N = nameOf(item.letter);
        const line = diff === 2 ? `${cap(item.word)} starts with ${N}!` : api.pick([`${N}! Well done!`, `Yes! ${N}!`, `${N}! You found it!`]);
        const spoken = sayGus(line);
        api.sfx('correct');
        await api.wait(280);
        item.inner.classList.add('gd-sink');
        api.sfx('plop');
        await api.wait(400);
        item.el.style.visibility = 'hidden';
        bloom(pot);
        if (R.placed === R.total && !R.over) {
          R.over = true;
          deselect();
          await Promise.all([spoken, api.wait(1300)]);
          await finishRound(R, api.pick(['Beautiful flowers!', 'What a lovely garden!', 'Hooray! Look at them bloom!', 'Wonderful gardening!']));
        }
      }

      /* Difficulty 3: a letter lands in its pot, then the word is sounded out */
      async function placeLetter(item, pot) {
        const R = item.R;
        api.sfx('pop');
        pot.plaque.classList.add('full');
        pot.flower.classList.add('sprout');
        api.setTimeout(() => api.sparkleAt(pot.plaque), 200);
        if (R.placed < R.total) { sayGus(nameOf(item.letter) + '!'); return; }
        R.over = true;
        deselect();
        R.items.forEach(t => { if (!t.placed) t.inner.classList.add('gd-out'); });
        api.sfx('correct');
        await sayGus(nameOf(item.letter) + '!');
        await api.wait(350);
        const notes = ['C5', 'E5', 'G5'];
        for (let i = 0; i < R.pots.length; i++) {
          const p = R.pots[i];
          anim(p.item.inner, 'gd-hop', 600);
          bloom(p);
          api.note(notes[i], 0.4, 'bell');
          await sayGus(nameOf(p.letter) + '.');
          await api.wait(120);
        }
        R.pots.forEach(p => anim(p.item.inner, 'gd-hop', 600));
        if (R.sign) anim(R.sign, 'gd-hop', 600);
        api.note('C6', 0.6, 'bell');
        await sayGus(cap(R.word) + '!');
        await finishRound(R, api.pick([`You spelled ${R.word}!`, `Great spelling! ${cap(R.word)}!`, `Yes! That spells ${R.word}!`]));
      }

      /* Round celebration + clean up */
      async function finishRound(R, line) {
        R.pots.forEach(p => { if (p.flower.classList.contains('bloom')) p.flower.classList.add('gd-dance'); });
        api.sfx('correct');
        api.celebrate(610, 330, 70);
        dots[R.r].classList.add('done');
        await sayGus(line);
        await api.wait(500);
        R.pots.forEach(p => p.el.classList.add('gd-out'));
        R.items.forEach(it => it.inner.classList.add('gd-out'));
        if (R.sign) R.sign.classList.add('gd-out');
        await api.wait(480);
        R.pots.forEach(p => p.el.remove());
        R.items.forEach(it => it.el.remove());
        if (R.sign) R.sign.remove();
        R.done();
      }

      /* ---------- Round content ---------- */
      const d1Letters = api.shuffle(ALPHA).slice(0, 9);
      function d2Rounds() {
        let pool = api.shuffle(D2_POOL);
        const rounds = [];
        for (let r = 0; r < 3; r++) {
          const chosen = [], used = new Set();
          for (const w of pool) {
            if (chosen.length === 3) break;
            if (!used.has(w[0])) { used.add(w[0]); chosen.push(w); }
          }
          if (chosen.length < 3) {
            for (const w of api.shuffle(D2_POOL)) {
              if (chosen.length === 3) break;
              if (!used.has(w[0])) { used.add(w[0]); chosen.push(w); }
            }
          }
          pool = pool.filter(w => chosen.indexOf(w) < 0);
          rounds.push(chosen);
        }
        return rounds;
      }
      const d2Sets = diff === 2 ? d2Rounds() : null;
      const d3Words = api.shuffle(D3_WORDS).slice(0, 3);

      function playRound(r, pre) {
        return new Promise(resolve => {
          const R = { r, over: false, placed: 0, total: 3, misses: 0, items: [], pots: [], done: resolve };
          cur = R;
          selected = null;
          let lines;
          if (diff === 1) {
            const letters = d1Letters.slice(r * 3, r * 3 + 3);
            api.shuffle(letters).forEach((L, i) => makePot(R, L, [350, 610, 870][i], i));
            api.shuffle(letters).forEach((L, i) => makeItem(R, { letter: L }, [400, 610, 820][i], i));
            lines = r === 0 ? ['Put each seed in the pot with the same letter!']
              : [api.pick(['More seeds! Match the letters.', 'Here come more seeds!'])];
          } else if (diff === 2) {
            const words = d2Sets[r];
            const letters = words.map(w => w[0].toUpperCase());
            const decoys = 'ABCDEFGHJKLMNPRSTW'.split('').filter(L => letters.indexOf(L) < 0);
            const potLetters = api.shuffle(letters.concat([api.pick(decoys)]));
            potLetters.forEach((L, i) => makePot(R, L, [300, 500, 700, 900][i], i));
            api.shuffle(words).forEach((w, i) => makeItem(R, { word: w, letter: w[0].toUpperCase() }, [400, 610, 820][i], i));
            lines = r === 0 ? ['Put each picture in the pot with its first letter!', 'Tap a picture to hear its name.']
              : [api.pick(['What letter does each one start with?', 'More pictures to plant!'])];
          } else {
            const word = d3Words[r];
            R.word = word;
            const letters = word.split('');
            letters.forEach((L, i) => makePot(R, L, [490, 690, 890][i], i));
            const extras = api.shuffle(D3_DISTRACT.filter(L => letters.indexOf(L) < 0)).slice(0, 2);
            api.shuffle(letters.concat(extras)).forEach((L, i) => makeItem(R, { letter: L }, [470, 590, 710, 830, 950][i], i));
            // Picture sign
            const sign = el('div', { class: 'gd-sign tap', style: { left: '224px', top: '98px' } }, [
              el('div', { class: 'gd-sign-post' }),
              el('div', { class: 'gd-sign-board' }, el('div', { class: 'gd-card', html: picSVG(word, 112) })),
            ]);
            api.on(sign, 'click', () => { anim(sign, 'gd-hop', 600); sayGus(cap(word) + '!'); });
            layer.appendChild(sign);
            R.sign = sign;
            lines = r === 0 ? [`Let's spell ${word}!`, 'Put the letters in the pots, in order.']
              : [api.pick([`Can you spell ${word}?`, `Now let's spell ${word}!`])];
          }
          R.total = diff === 3 ? R.pots.length : R.items.length;
          sayChain((pre || []).concat(lines));
        });
      }

      /* ---------- Main flow ---------- */
      (async function run() {
        await api.wait(350);
        const intro = diff === 3 ? "Hello! I'm Gus the gardener. Spell words to make flowers grow!"
          : diff === 2 ? "Hello! I'm Gus the gardener. Let's plant pictures and grow flowers!"
          : "Hello! I'm Gus the gardener. Let's plant some flower seeds!";
        for (let r = 0; r < 3; r++) await playRound(r, r === 0 ? [intro] : null);
        await sayGus('Look at all the flowers! Thank you for helping me!');
        api.complete();
      })();
    },

    exit() {},
  });
})();
