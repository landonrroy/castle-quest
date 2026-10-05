/* =====================================================================
   Castle Quest — Music Tower (bells)
   Bram the Bellringer (a cheerful old owl with a beard) plays a tune on
   the tower bells; the child echoes it back. Simon-style melody memory.
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#3a2a1a';

  /* Which notes the bells play at each size of bell set (low -> high). */
  const BELL_SETS = {
    3: ['C', 'E', 'G'],
    4: ['C', 'E', 'G', 'A'],
    5: ['C', 'D', 'E', 'G', 'A'],
  };
  const NOTE_INFO = {
    C: { pitch: 'C5', main: '#e8423f', dark: '#b32421', light: '#ffa197' },
    D: { pitch: 'D5', main: '#ff8c2b', dark: '#c85d0a', light: '#ffc58f' },
    E: { pitch: 'E5', main: '#ffc928', dark: '#d99a00', light: '#fff0a0' },
    G: { pitch: 'G5', main: '#3fb950', dark: '#23812f', light: '#a8efb1' },
    A: { pitch: 'A5', main: '#2f7fe0', dark: '#1d56a3', light: '#a6ccff' },
  };

  /* Difficulty: number of bells, tune length per round, gap between demo notes. */
  const LEVELS = {
    1: { n: 3, lens: [2, 3, 3], gap: 720, w: 170 },
    2: { n: 4, lens: [3, 4, 5], gap: 620, w: 160 },
    3: { n: 5, lens: [4, 5, 6], gap: 540, w: 150 },
  };
  const SLOW_GAP = 1050;

  /* Familiar melody snippets (pentatonic C D E G A) for level 3. */
  const SONGS = [
    { len: 4, name: 'Twinkle Twinkle Little Star', notes: 'C C G G' },
    { len: 4, name: 'Mary Had a Little Lamb', notes: 'E D C D' },
    { len: 4, name: 'Ring Around the Rosie', notes: 'G G E A' },
    { len: 5, name: 'Rain Rain Go Away', notes: 'G E G G E' },
    { len: 5, name: 'Mary Had a Little Lamb', notes: 'E D C D E' },
    { len: 5, name: 'Twinkle Twinkle Little Star', notes: 'C C G G A' },
    { len: 6, name: 'Hot Cross Buns', notes: 'E D C E D C' },
    { len: 6, name: 'Twinkle Twinkle Little Star', notes: 'C C G G A A' },
    { len: 6, name: 'Ring Around the Rosie', notes: 'G G E A G E' },
    { len: 6, name: 'Mary Had a Little Lamb', notes: 'E D C D E E' },
  ];

  /* Layout (stage px) */
  const BEAM_TOP = 172, BEAM_BOTTOM = 214;
  const SPAN_L = 190, SPAN_R = 1060;
  const ROPE = 34;

  /* ------------------------------------------------------------------ */
  const CSS = `
  .scene-bells { background: #8fd3ff; }
  .scene-bells .room-title, .scene-bells .round-dots { left: 470px; }
  .scene-bells .bl-layer { position: absolute; left: 0; top: 0; width: 1280px; height: 720px; }
  .scene-bells .bl-front { pointer-events: none; z-index: 6; }
  .scene-bells .bl-sun-rays { transform-origin: 250px 74px; animation: bells-spin 40s linear infinite; }
  @keyframes bells-spin { to { transform: rotate(360deg); } }
  .scene-bells .bells-flag { animation: bells-flag 1.4s ease-in-out infinite alternate; }
  @keyframes bells-flag { from { transform: scaleX(1) skewY(0deg); } to { transform: scaleX(.78) skewY(6deg); } }

  /* drifting cloud */
  .scene-bells .bl-cloud { position: absolute; left: 0; top: 112px; width: 200px; height: 82px; z-index: 3;
    cursor: pointer; animation: bells-drift 90s linear infinite; animation-delay: -38s; }
  @keyframes bells-drift { from { transform: translateX(-240px); } to { transform: translateX(1320px); } }
  .scene-bells .bl-cloud svg { width: 100%; height: 100%; overflow: visible; transform-origin: 50% 80%; }
  .scene-bells .bl-cloud.puff svg { animation: bells-puff .6s cubic-bezier(.3,1.6,.5,1); }
  @keyframes bells-puff { 30% { transform: scale(1.25, .8); } 60% { transform: scale(.9, 1.15); } }

  /* weather vane */
  .scene-bells .bl-vane { position: absolute; left: 115px; top: 28px; width: 100px; height: 124px; z-index: 8; cursor: pointer; }
  .scene-bells .bl-vane-spin { position: absolute; left: 0; top: 0; width: 100px; height: 62px;
    animation: bells-vane-idle 5s ease-in-out infinite; }
  .scene-bells .bl-vane-spin.spin { animation: bells-vane-spin 1.6s cubic-bezier(.2,.7,.3,1); }
  @keyframes bells-vane-idle { 0%, 100% { transform: perspective(300px) rotateY(-28deg); } 50% { transform: perspective(300px) rotateY(28deg); } }
  @keyframes bells-vane-spin { from { transform: perspective(300px) rotateY(0deg); } to { transform: perspective(300px) rotateY(1440deg); } }

  /* pigeons */
  .scene-bells .bl-pigeon { position: absolute; width: 92px; height: 80px; z-index: 9; cursor: pointer; }
  .scene-bells .bl-pigeon.flying { pointer-events: none; }
  .scene-bells .bl-pigeon svg { width: 100%; height: 100%; overflow: visible; }
  .scene-bells .bl-pigeon .pg-head { transform-origin: 62px 40px; animation: bells-peck 4.2s ease-in-out infinite; }
  .scene-bells .bl-pigeon.p2 .pg-head { animation-delay: -2.1s; }
  @keyframes bells-peck { 0%, 70%, 100% { transform: none; } 76% { transform: translate(5px, 7px) rotate(18deg); } 82% { transform: none; } 88% { transform: translate(5px, 7px) rotate(18deg); } }
  .scene-bells .bl-pigeon .pg-wing { transform-origin: 40px 44px; }
  .scene-bells .bl-pigeon.flying .pg-wing { animation: bells-flap .14s ease-in-out infinite alternate; }
  .scene-bells .bl-pigeon.flying .pg-head { animation: none; }
  @keyframes bells-flap { from { transform: rotate(10deg); } to { transform: rotate(-70deg) scaleY(1.2); } }
  .scene-bells .bl-pigeon.coo svg { animation: bells-coo .5s ease-in-out; }
  @keyframes bells-coo { 30% { transform: scale(1.08, .92); } 60% { transform: scale(.96, 1.06); } }

  /* bells */
  .scene-bells .bell-wrap { position: absolute; transform-origin: 50% 0; z-index: 10; cursor: pointer;
    touch-action: manipulation; animation: bells-idle 4.5s ease-in-out infinite; }
  @keyframes bells-idle { 0%, 100% { transform: rotate(-1.2deg); } 50% { transform: rotate(1.2deg); } }
  .scene-bells .bell-wrap.ring { z-index: 12; }
  .scene-bells .bell-swing { position: absolute; inset: 0; transform-origin: 50% 0; }
  .scene-bells .ring > .bell-swing { animation: bells-swing .75s ease-out; }
  @keyframes bells-swing { 0% { transform: rotate(0); } 14% { transform: rotate(11deg); } 38% { transform: rotate(-9deg); }
    62% { transform: rotate(5deg); } 84% { transform: rotate(-2deg); } 100% { transform: rotate(0); } }
  .scene-bells .bell-rope { position: absolute; left: 50%; top: -4px; width: 12px; margin-left: -6px;
    border: 3px solid ${INK}; border-radius: 5px;
    background: repeating-linear-gradient(-45deg, #e9c98a 0 5px, #b98a45 5px 9px); }
  .scene-bells .bell-box { position: absolute; left: 0; bottom: 0; width: 100%; transform-origin: 50% 0; transition: transform .1s; }
  .scene-bells .bell-wrap:active .bell-box { transform: scale(.96); }
  .scene-bells .bell-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: filter .15s; }
  .scene-bells .ring .bell-svg { filter: brightness(1.12) drop-shadow(0 0 10px #fff59a) drop-shadow(0 0 22px #ffd23f); }
  .scene-bells .bell-halo { position: absolute; left: -30%; top: -20%; width: 160%; height: 135%; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,252,200,.95) 0%, rgba(255,226,90,.6) 38%, rgba(255,226,90,0) 68%);
    opacity: 0; pointer-events: none; }
  .scene-bells .ring .bell-halo { animation: bells-halo .75s ease-out; }
  @keyframes bells-halo { 0% { opacity: 0; transform: scale(.6); } 20% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0; transform: scale(1.25); } }
  .scene-bells .hint .bell-svg { animation: bells-hint 1s ease-in-out infinite; }
  .scene-bells .hint .bell-halo { animation: bells-hint-halo 1s ease-in-out infinite; }
  @keyframes bells-hint { 0%, 100% { filter: drop-shadow(0 0 6px #fff59a) drop-shadow(0 0 12px #ffd23f); }
    50% { filter: brightness(1.12) drop-shadow(0 0 14px #fff59a) drop-shadow(0 0 30px #ffd23f); } }
  @keyframes bells-hint-halo { 0%, 100% { opacity: .25; } 50% { opacity: .75; } }
  .scene-bells .oops .bell-box { animation: bells-oops .5s ease-in-out; }
  @keyframes bells-oops { 20% { transform: translateX(-9px) rotate(-3deg); } 40% { transform: translateX(9px) rotate(3deg); }
    60% { transform: translateX(-5px); } 80% { transform: translateX(4px); } }
  .scene-bells .clapper { transform-origin: 60px 104px; }
  .scene-bells .ring .clapper { animation: bells-clap .75s ease-out; }
  @keyframes bells-clap { 14% { transform: rotate(-24deg); } 38% { transform: rotate(20deg); } 62% { transform: rotate(-10deg); } 84% { transform: rotate(4deg); } }
  .scene-bells .eyes-happy, .scene-bells .mouth-sing { display: none; }
  .scene-bells .ring .eyes-happy, .scene-bells .ring .mouth-sing { display: inline; }
  .scene-bells .ring .eyes-open, .scene-bells .ring .mouth-smile { display: none; }
  .scene-bells .mouth-sing { transform-origin: 60px 84px; }
  .scene-bells .ring .mouth-sing { animation: bells-sing .16s ease-in-out infinite alternate; }
  @keyframes bells-sing { from { transform: scale(.85, .7); } to { transform: scale(1.1, 1.2); } }
  .scene-bells .bell-blink { transform-origin: 60px 62px; animation: bells-blink 5s infinite; }
  @keyframes bells-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }

  /* Bram the owl */
  .scene-bells .bl-bram { position: absolute; left: 1078px; top: 335px; width: 184px; height: 244px; z-index: 14; cursor: pointer; }
  .scene-bells .bl-bram svg { width: 100%; height: 100%; overflow: visible; }
  .scene-bells .bl-bram .owl-all { transform-origin: 92px 240px; animation: bells-breathe 3.2s ease-in-out infinite; }
  @keyframes bells-breathe { 50% { transform: scale(1.025, .975); } }
  .scene-bells .bl-bram .owl-eyes { transform-origin: 92px 84px; animation: bells-blink 4.4s infinite; }
  .scene-bells .bl-bram .owl-beak-low { transition: transform .1s; }
  .scene-bells .bl-bram.talking .owl-beak-low { animation: bells-beak .2s ease-in-out infinite alternate; }
  @keyframes bells-beak { to { transform: translateY(7px); } }
  .scene-bells .bl-bram.talking .owl-head { animation: bells-nod .5s ease-in-out infinite alternate; transform-origin: 92px 130px; }
  @keyframes bells-nod { from { transform: rotate(-2deg); } to { transform: rotate(3deg); } }
  .scene-bells .bl-bram .owl-wing-r { transform-origin: 146px 136px; transition: transform .3s; }
  .scene-bells .bl-bram.conduct .owl-wing-r { animation: bells-conduct .45s ease-in-out infinite alternate; }
  @keyframes bells-conduct { from { transform: rotate(-10deg); } to { transform: rotate(-48deg); } }
  .scene-bells .bl-bram .owl-hatbell { transform-origin: 160px 30px; animation: bells-hatbell 2.6s ease-in-out infinite; }
  @keyframes bells-hatbell { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(8deg); } }
  .scene-bells .bl-bram.bounce .owl-hatbell { animation: bells-hatjingle .25s ease-in-out 3; }
  @keyframes bells-hatjingle { 50% { transform: rotate(25deg); } }

  /* listen / your turn badge */
  .scene-bells .bl-ind { position: absolute; left: 592px; top: 470px; width: 96px; height: 96px; border-radius: 50%;
    background: #fff; border: 5px solid ${INK}; box-shadow: 0 6px 0 rgba(58,42,26,.35);
    display: grid; place-items: center; z-index: 20; pointer-events: none;
    transform: scale(0); transition: transform .35s cubic-bezier(.3,1.6,.5,1); }
  .scene-bells .bl-ind.show { transform: scale(1); }
  .scene-bells .bl-ind.ear { background: #fff4b8; }
  .scene-bells .bl-ind.hand { background: #c9f7d0; }
  .scene-bells .bl-ind svg { overflow: visible; }
  .scene-bells .bl-ind.nudge svg { animation: wiggle .5s; }
  .scene-bells .bl-ind .w1 { animation: bells-wave 1.1s ease-in-out infinite; }
  .scene-bells .bl-ind .w2 { animation: bells-wave 1.1s ease-in-out infinite; animation-delay: .25s; }
  @keyframes bells-wave { 0%, 100% { opacity: .15; } 50% { opacity: 1; } }
  .scene-bells .bl-ind .tapf { animation: bells-tapf .9s ease-in-out infinite; }
  @keyframes bells-tapf { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
  .scene-bells .bl-ind .taplines { animation: bells-wave .9s ease-in-out infinite; }
  `;

  /* ------------------------------------------------------------------
     Art
     ------------------------------------------------------------------ */
  function cloudPath(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 40 C-8 22 16 8 32 18 C40 -2 76 -2 84 18 C100 8 124 22 114 40 Z" fill="#fff" stroke="${INK}" stroke-width="4" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      <path d="M8 38 C30 30 80 30 108 38 Z" fill="#dff1ff"/>
    </g>`;
  }

  function tower(x, top, w, roof, flag) {
    const h = 660 - top;
    const rh = Math.round(w * 1.05);
    const tip = top - rh;
    return `<g>
      <rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" fill="#e3d8f0" stroke="${INK}" stroke-width="3.5"/>
      <rect x="${x - w / 2 + 6}" y="${top}" width="${Math.round(w * 0.22)}" height="${h}" fill="#fff" opacity=".35"/>
      <path d="M${x - 9} ${top + 44} v-14 a9 9 0 0 1 18 0 v14 z" fill="#5b4a7a" stroke="${INK}" stroke-width="3"/>
      <path d="M${x - w / 2 - 8} ${top + 2} L${x} ${tip} L${x + w / 2 + 8} ${top + 2} Z" fill="${roof}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M${x - w / 2 - 4} ${top} L${x} ${tip + 6} L${x - w * 0.18} ${top} Z" fill="#fff" opacity=".28"/>
      <line x1="${x}" y1="${tip}" x2="${x}" y2="${tip - 28}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path class="bells-flag" style="transform-origin:${x}px ${tip - 22}px" d="M${x} ${tip - 28} l24 6 l-24 8 z" fill="${flag}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    </g>`;
  }

  function backSVG() {
    let towers = '';
    towers += tower(300, 470, 68, '#ff8a80', '#ffc928');
    towers += tower(478, 438, 88, '#7fb2ff', '#e8423f');
    towers += tower(690, 478, 76, '#ffb36b', '#3fb950');
    towers += tower(880, 430, 84, '#c69bff', '#ff8c2b');
    towers += tower(1030, 472, 62, '#ff8a80', '#2f7fe0');
    // distant castle wall with crenels
    let crenels = '';
    for (let x = 0; x < 1280; x += 44) crenels += `<rect x="${x}" y="496" width="26" height="16" fill="#d9cdea" stroke="${INK}" stroke-width="3"/>`;
    return `<svg class="bl-layer" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
      <defs>
        <linearGradient id="bells-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5fbcff"/><stop offset=".65" stop-color="#a9e0ff"/><stop offset="1" stop-color="#e3f6ff"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bells-sky)"/>
      <g class="bl-sun-rays" stroke="#ffd23f" stroke-width="7" stroke-linecap="round" opacity=".9">
        <line x1="250" y1="14" x2="250" y2="0"/><line x1="250" y1="134" x2="250" y2="148"/>
        <line x1="190" y1="74" x2="176" y2="74"/><line x1="310" y1="74" x2="324" y2="74"/>
        <line x1="208" y1="32" x2="198" y2="22"/><line x1="292" y1="116" x2="302" y2="126"/>
        <line x1="292" y1="32" x2="302" y2="22"/><line x1="208" y1="116" x2="198" y2="126"/>
      </g>
      <circle cx="250" cy="74" r="44" fill="#ffe14d" stroke="${INK}" stroke-width="5"/>
      <circle cx="236" cy="62" r="12" fill="#fff6b0" opacity=".8"/>
      <path d="M232 80 Q250 94 268 80" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="236" cy="70" r="4" fill="${INK}"/><circle cx="264" cy="70" r="4" fill="${INK}"/>
      ${cloudPath(960, 120, 1.3)}
      ${cloudPath(560, 300, 0.8)}
      ${cloudPath(1080, 330, 0.9)}
      ${cloudPath(340, 380, 0.7)}
      <path d="M0 470 C160 420 300 455 460 440 C640 420 760 470 940 445 C1080 428 1180 450 1280 440 L1280 720 L0 720 Z" fill="#a6e38c" stroke="${INK}" stroke-width="4"/>
      <path d="M0 500 C200 470 380 500 600 486 C820 472 1000 500 1280 482 L1280 720 L0 720 Z" fill="#7fd06b" stroke="${INK}" stroke-width="4"/>
      ${towers}
      <rect x="-10" y="510" width="1300" height="200" fill="#d9cdea" stroke="${INK}" stroke-width="3.5"/>
      ${crenels}
    </svg>`;
  }

  function frontSVG() {
    // wooden bell frame + stone parapet
    const wood = '#b5763c', woodDark = '#7d4a1f', stone = '#c9b79c', stoneDark = '#9a8467';
    let notes = '';
    [330, 520, 760, 950].forEach((x, i) => {
      const y = 194 + (i % 2 ? 2 : -2);
      notes += `<g fill="#ffc928" stroke="${INK}" stroke-width="2.5">
        <ellipse cx="${x}" cy="${y + 8}" rx="7" ry="5" transform="rotate(-20 ${x} ${y + 8})"/>
        <path d="M${x + 6} ${y + 6} V${y - 12} q6 4 10 10" fill="none" stroke-linecap="round"/>
      </g>`;
    });
    const merlonXs = [-40, 150, 340, 530, 720, 910, 1100];
    let merlons = '';
    merlonXs.forEach(x => {
      merlons += `<rect x="${x}" y="532" width="120" height="60" rx="6" fill="${stone}" stroke="${INK}" stroke-width="5"/>
        <rect x="${x + 8}" y="540" width="40" height="10" rx="5" fill="#fff" opacity=".35"/>
        <path d="M${x + 60} 532 V562 M${x} 562 H${x + 120}" stroke="${stoneDark}" stroke-width="3"/>`;
    });
    let bricks = '';
    [622, 664, 706].forEach((y, r) => {
      bricks += `<path d="M0 ${y} H1280" stroke="${stoneDark}" stroke-width="3"/>`;
      for (let x = (r % 2 ? 40 : 110); x < 1280; x += 150) {
        bricks += `<path d="M${x} ${y - 42} V${y}" stroke="${stoneDark}" stroke-width="3"/>`;
      }
    });
    return `<svg class="bl-layer bl-front" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
      <!-- braces -->
      <path d="M190 312 L262 214" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
      <path d="M190 312 L262 214" stroke="${wood}" stroke-width="15" stroke-linecap="round"/>
      <path d="M1095 312 L1023 214" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
      <path d="M1095 312 L1023 214" stroke="${wood}" stroke-width="15" stroke-linecap="round"/>
      <!-- posts -->
      <rect x="140" y="140" width="50" height="460" fill="${wood}" stroke="${INK}" stroke-width="5"/>
      <path d="M152 160 V560 M176 230 V420" stroke="${woodDark}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <rect x="1095" y="140" width="50" height="460" fill="${wood}" stroke="${INK}" stroke-width="5"/>
      <path d="M1108 170 V540 M1132 260 V460" stroke="${woodDark}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <rect x="130" y="126" width="70" height="18" rx="6" fill="${woodDark}" stroke="${INK}" stroke-width="5"/>
      <rect x="1085" y="126" width="70" height="18" rx="6" fill="${woodDark}" stroke="${INK}" stroke-width="5"/>
      <circle cx="1120" cy="112" r="14" fill="#ffc928" stroke="${INK}" stroke-width="5"/>
      <circle cx="1115" cy="107" r="4" fill="#fff" opacity=".8"/>
      <!-- beam -->
      <rect x="108" y="${BEAM_TOP}" width="1064" height="${BEAM_BOTTOM - BEAM_TOP}" rx="9" fill="${wood}" stroke="${INK}" stroke-width="5"/>
      <rect x="118" y="${BEAM_TOP + 6}" width="1044" height="8" rx="4" fill="#d9a066"/>
      <path d="M220 ${BEAM_TOP + 26} H420 M600 ${BEAM_TOP + 24} H700 M820 ${BEAM_TOP + 28} H1040" stroke="${woodDark}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <circle cx="165" cy="${BEAM_TOP + 21}" r="6" fill="#8a8a9a" stroke="${INK}" stroke-width="3"/>
      <circle cx="1120" cy="${BEAM_TOP + 21}" r="6" fill="#8a8a9a" stroke="${INK}" stroke-width="3"/>
      ${notes}
      <!-- parapet -->
      ${merlons}
      <rect x="-10" y="580" width="1300" height="150" fill="${stone}" stroke="${INK}" stroke-width="5"/>
      <rect x="-10" y="580" width="1300" height="12" fill="#e2d3ba"/>
      ${bricks}
      <path d="M380 716 q10 -16 22 -4 q8 -14 20 0 q8 -10 16 4 Z" fill="#5cbf4a" stroke="${INK}" stroke-width="3"/>
      <path d="M960 716 q10 -14 20 -2 q10 -12 18 2 Z" fill="#5cbf4a" stroke="${INK}" stroke-width="3"/>
    </svg>`;
  }

  function bellSVG(c) {
    return `<svg class="bell-svg" viewBox="0 0 120 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g class="clapper">
        <path d="M60 100 L60 124" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="60" cy="127" r="9" fill="${c.dark}" stroke="${INK}" stroke-width="5"/>
      </g>
      <path d="M45 18 C45 1 75 1 75 18" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
      <path d="M45 18 C45 1 75 1 75 18" fill="none" stroke="#e0b450" stroke-width="5" stroke-linecap="round"/>
      <path d="M60 14 C34 14 28 34 28 58 C28 84 22 98 10 108 L110 108 C98 98 92 84 92 58 C92 34 86 14 60 14 Z" fill="${c.main}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M76 19 C86 30 89 44 89 60 C89 84 95 98 105 106 L88 106 C81 94 78 80 78 62 C78 44 78 30 72 18 Z" fill="${c.dark}" opacity=".32"/>
      <path d="M35 34 Q60 26 85 34" fill="none" stroke="${c.light}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="39" cy="50" rx="5" ry="13" fill="#fff" opacity=".7" transform="rotate(12 39 50)"/>
      <rect x="5" y="103" width="110" height="17" rx="8.5" fill="${c.dark}" stroke="${INK}" stroke-width="5"/>
      <path d="M15 109 L42 109" stroke="${c.light}" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>
      <g class="eyes-open"><g class="bell-blink">
        <ellipse cx="47" cy="62" rx="8" ry="9.5" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="73" cy="62" rx="8" ry="9.5" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
        <circle cx="48.5" cy="64" r="4.6" fill="${INK}"/><circle cx="74.5" cy="64" r="4.6" fill="${INK}"/>
        <circle cx="50" cy="61.6" r="1.7" fill="#fff"/><circle cx="76" cy="61.6" r="1.7" fill="#fff"/>
      </g></g>
      <g class="eyes-happy" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round">
        <path d="M40 65 Q47 55 54 65"/><path d="M66 65 Q73 55 80 65"/>
      </g>
      <ellipse cx="37" cy="78" rx="6.5" ry="4" fill="#ff6f91" opacity=".55"/>
      <ellipse cx="83" cy="78" rx="6.5" ry="4" fill="#ff6f91" opacity=".55"/>
      <path class="mouth-smile" d="M52 79 Q60 88 68 79" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <g class="mouth-sing">
        <ellipse cx="60" cy="84" rx="8" ry="10" fill="#7a1f2b" stroke="${INK}" stroke-width="3.5"/>
        <ellipse cx="60" cy="89" rx="5" ry="3.5" fill="#ff7a8a"/>
      </g>
    </svg>`;
  }

  const BRAM_SVG = `<svg viewBox="0 0 184 244" aria-hidden="true"><g class="owl-all">
    <path d="M70 222 L58 240 L80 232 L92 244 L104 232 L126 240 L114 222 Z" fill="#8a5326" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="92" cy="158" rx="66" ry="74" fill="#b9773f" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="92" cy="176" rx="44" ry="50" fill="#f4e2bf" stroke="${INK}" stroke-width="4"/>
    <g fill="none" stroke="#c9a674" stroke-width="3.5" stroke-linecap="round">
      <path d="M70 170 l6 6 l6 -6"/><path d="M102 170 l6 6 l6 -6"/><path d="M84 188 l8 7 l8 -7"/><path d="M70 204 l6 6 l6 -6"/><path d="M102 204 l6 6 l6 -6"/>
    </g>
    <path d="M30 128 C10 160 16 206 46 222 C40 190 40 160 52 134 Z" fill="#94592a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <g class="owl-wing-r">
      <path d="M154 128 C174 160 168 206 138 222 C144 190 144 160 132 134 Z" fill="#94592a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M146 214 L160 226" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M156 222 C152 228 158 240 168 238 C176 238 180 228 176 222 C172 216 160 216 156 222 Z" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="170" cy="240" r="3.5" fill="${INK}"/>
    </g>
    <path d="M66 238 v-8 M76 238 v-8 M108 238 v-8 M118 238 v-8" stroke="#ff9f1c" stroke-width="7" stroke-linecap="round"/>
    <g class="owl-head">
      <ellipse cx="92" cy="84" rx="70" ry="58" fill="#c98a4f" stroke="${INK}" stroke-width="5"/>
      <circle cx="62" cy="86" r="31" fill="#f6e7c8" stroke="${INK}" stroke-width="3"/>
      <circle cx="122" cy="86" r="31" fill="#f6e7c8" stroke="${INK}" stroke-width="3"/>
      <g class="owl-eyes">
        <circle cx="64" cy="86" r="19" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <circle cx="120" cy="86" r="19" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <circle cx="67" cy="88" r="9.5" fill="${INK}"/><circle cx="117" cy="88" r="9.5" fill="${INK}"/>
        <circle cx="70" cy="84" r="3.5" fill="#fff"/><circle cx="120" cy="84" r="3.5" fill="#fff"/>
      </g>
      <circle cx="64" cy="86" r="24" fill="#fff" fill-opacity=".12" stroke="#5a4a3a" stroke-width="3.5"/>
      <circle cx="120" cy="86" r="24" fill="#fff" fill-opacity=".12" stroke="#5a4a3a" stroke-width="3.5"/>
      <path d="M88 84 Q92 78 96 84" fill="none" stroke="#5a4a3a" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M34 62 C38 46 62 42 84 56 C68 54 52 56 34 62 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M150 62 C146 46 122 42 100 56 C116 54 132 56 150 62 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="34" cy="114" rx="9" ry="5.5" fill="#ff8fb0" opacity=".7"/>
      <ellipse cx="150" cy="114" rx="9" ry="5.5" fill="#ff8fb0" opacity=".7"/>
      <path d="M60 110 C56 132 68 154 92 168 C116 154 128 132 124 110 C114 120 104 114 92 120 C80 114 70 120 60 110 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M76 136 q5 6 10 0 M98 136 q5 6 10 0 M86 152 q6 6 12 0" fill="none" stroke="#c9c2b8" stroke-width="3" stroke-linecap="round"/>
      <path class="owl-beak-low" d="M84 108 L100 108 L92 122 Z" fill="#e08a00" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M80 98 L104 98 L92 116 Z" fill="#ffb020" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M40 42 C48 6 112 -6 150 16 C162 22 166 28 166 34 C156 30 144 28 138 34 C142 38 144 42 144 44 Z" fill="#2f7fe0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M58 22 C74 12 96 10 112 12" fill="none" stroke="#8fc0ff" stroke-width="5" stroke-linecap="round"/>
      <path d="M34 46 Q92 26 150 46 L150 58 Q92 40 34 58 Z" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <g class="owl-hatbell">
        <path d="M152 34 C150 40 154 50 162 50 C170 50 174 40 170 34 C166 28 156 28 152 34 Z" fill="#ffc928" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="161" cy="51" r="3" fill="${INK}"/>
      </g>
    </g>
  </g></svg>`;

  const PIGEON_SVG = `<svg viewBox="0 0 92 80" aria-hidden="true"><g class="pg-flip">
    <path d="M18 50 L0 40 L4 60 Z" fill="#7d87a0" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M38 68 V76 M48 68 V76 M34 76 H42 M44 76 H52" stroke="#ff8c2b" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="40" cy="52" rx="30" ry="19" fill="#aab4c9" stroke="${INK}" stroke-width="4"/>
    <g class="pg-head">
      <path d="M52 44 C52 30 58 20 66 20 C76 20 80 28 78 36 C76 44 66 50 58 52 Z" fill="#aab4c9" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M56 42 Q66 48 76 38" fill="none" stroke="#56c48f" stroke-width="6" stroke-linecap="round"/>
      <path d="M58 46 Q66 52 74 44" fill="none" stroke="#b07ad8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="70" cy="28" r="5" fill="#ffb020" stroke="${INK}" stroke-width="2"/>
      <circle cx="71" cy="28" r="2.6" fill="${INK}"/>
      <path d="M78 29 L89 33 L78 36 Z" fill="#ffb020" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
    <path class="pg-wing" d="M20 44 Q40 30 60 48 Q44 62 20 54 Z" fill="#8892ad" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  </g></svg>`;

  const VANE_POLE_SVG = `<svg viewBox="0 0 100 124" width="100" height="124" style="position:absolute;left:0;top:0" aria-hidden="true">
    <line x1="50" y1="44" x2="50" y2="124" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <line x1="50" y1="44" x2="50" y2="124" stroke="#6b6b7d" stroke-width="4" stroke-linecap="round"/>
    <line x1="24" y1="92" x2="76" y2="92" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <line x1="24" y1="92" x2="76" y2="92" stroke="#6b6b7d" stroke-width="3" stroke-linecap="round"/>
    <circle cx="22" cy="92" r="6" fill="#ffc928" stroke="${INK}" stroke-width="3"/>
    <circle cx="78" cy="92" r="6" fill="#ffc928" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="66" r="8" fill="#ffc928" stroke="${INK}" stroke-width="3.5"/>
  </svg>`;
  const VANE_TOP_SVG = `<svg viewBox="0 0 100 62" width="100" height="62" style="overflow:visible" aria-hidden="true">
    <path d="M6 50 H88" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M6 50 H88" stroke="#ffc928" stroke-width="3" stroke-linecap="round"/>
    <path d="M84 42 L98 50 L84 58 Z" fill="#ffc928" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M4 40 L16 50 L4 60 L12 50 Z" fill="#ffc928" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M36 46 C30 30 34 18 46 16 C50 8 60 8 62 16 C70 18 72 26 68 32 L74 28 L72 38 C68 44 60 48 50 48 Z" fill="#ffc928" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M36 44 C24 36 22 22 30 14 C34 24 38 30 42 36 Z" fill="#e8423f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M52 10 q3 -8 7 -2 q3 -7 6 1 Z" fill="#e8423f" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="58" cy="17" r="2.2" fill="${INK}"/>
    <path d="M64 18 L72 20 L64 23 Z" fill="#ff8c2b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;

  const CLOUD_SVG = `<svg viewBox="0 0 200 82" aria-hidden="true">
    <path d="M18 70 C0 70 -2 46 18 42 C14 20 42 10 58 24 C68 2 108 0 120 22 C136 8 166 14 166 36 C188 34 200 58 184 70 Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M20 66 C60 58 140 58 180 66 Z" fill="#dff1ff"/>
    <path d="M78 44 q6 -6 12 0 M110 44 q6 -6 12 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M92 54 q8 7 16 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="76" cy="54" rx="6" ry="3.5" fill="#ff9fc0" opacity=".7"/><ellipse cx="124" cy="54" rx="6" ry="3.5" fill="#ff9fc0" opacity=".7"/>
  </svg>`;

  const EAR_SVG = `<svg viewBox="0 0 100 100" width="76" height="76" aria-hidden="true">
    <path class="w1" d="M26 38 Q18 50 26 62" fill="none" stroke="#2f7fe0" stroke-width="6" stroke-linecap="round"/>
    <path class="w2" d="M14 28 Q0 50 14 72" fill="none" stroke="#2f7fe0" stroke-width="6" stroke-linecap="round"/>
    <path d="M48 12 C72 8 88 28 84 50 C82 62 72 66 68 76 C64 90 48 94 42 84 C38 76 46 72 46 64 C46 56 38 52 36 40 C34 24 38 14 48 12 Z" fill="#ffc9a0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 28 C64 26 72 38 68 50 C65 58 58 56 56 66" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
  const HAND_SVG = `<svg viewBox="0 0 100 100" width="76" height="76" aria-hidden="true">
    <g class="taplines" stroke="#23812f" stroke-width="5" stroke-linecap="round">
      <path d="M30 14 L20 6"/><path d="M68 14 L78 6"/><path d="M26 30 L14 30"/>
    </g>
    <g class="tapf">
      <rect x="30" y="50" width="48" height="44" rx="16" fill="#ffc9a0" stroke="${INK}" stroke-width="5"/>
      <circle cx="62" cy="52" r="8" fill="#ffc9a0" stroke="${INK}" stroke-width="4"/>
      <circle cx="73" cy="56" r="7" fill="#ffc9a0" stroke="${INK}" stroke-width="4"/>
      <rect x="40" y="12" width="17" height="52" rx="8.5" fill="#ffc9a0" stroke="${INK}" stroke-width="5"/>
      <rect x="43" y="52" width="11" height="14" fill="#ffc9a0"/>
      <path d="M32 66 C22 60 20 72 30 80" fill="#ffc9a0" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    </g>
  </svg>`;

  /* ------------------------------------------------------------------
     Room
     ------------------------------------------------------------------ */
  Castle.registerRoom({
    id: 'bells',
    title: 'Music Tower',
    jewel: 'sapphire',

    enter(root, api) {
      const level = LEVELS[api.difficulty] ? api.difficulty : 1;
      const cfg = LEVELS[level];
      const set = BELL_SETS[cfg.n];

      root.appendChild(api.el('style', { text: CSS }));
      root.appendChild(api.svg(backSVG()));

      /* ---------- drifting cloud ---------- */
      const cloud = api.el('div', { class: 'bl-cloud', html: CLOUD_SVG });
      root.appendChild(cloud);
      api.on(cloud, 'pointerdown', () => {
        if (phase !== 'demo') api.sfx('pop');
        restartClass(cloud, 'puff', 650);
      });

      root.appendChild(api.svg(frontSVG()));

      /* ---------- weather vane ---------- */
      const vane = api.el('div', { class: 'bl-vane', html: VANE_POLE_SVG });
      const vaneSpin = api.el('div', { class: 'bl-vane-spin', html: VANE_TOP_SVG });
      vane.appendChild(vaneSpin);
      root.appendChild(vane);
      let vaneBusy = false;
      api.on(vane, 'pointerdown', () => {
        if (vaneBusy) return;
        vaneBusy = true;
        if (phase !== 'demo') {
          api.sfx('whoosh');
          api.setTimeout(() => api.note('E4', 0.25, 'triangle'), 1200);
        }
        vaneSpin.classList.add('spin');
        api.setTimeout(() => { vaneSpin.classList.remove('spin'); vaneBusy = false; }, 1650);
      });

      /* ---------- pigeons ---------- */
      const pigeons = [
        { x: 300, dir: 1 },
        { x: 862, dir: -1 },
      ].map((p, k) => {
        const node = api.el('div', { class: 'bl-pigeon p' + (k + 1), html: PIGEON_SVG,
          style: { left: p.x + 'px', top: (BEAM_TOP - 74) + 'px' } });
        if (p.dir < 0) node.querySelector('.pg-flip').setAttribute('transform', 'translate(92 0) scale(-1 1)');
        root.appendChild(node);
        const pg = { el: node, dir: p.dir, busy: false };
        api.on(node, 'pointerdown', () => flyPigeon(pg, false));
        return pg;
      });
      function coo() {
        api.note('B3', 0.3, 'flute');
        api.setTimeout(() => api.note('G3', 0.45, 'flute'), 230);
      }
      function flyPigeon(pg, quiet) {
        if (pg.busy) return;
        pg.busy = true;
        const loud = !quiet && phase !== 'demo';
        if (loud) { coo(); api.sfx('whoosh'); }
        const node = pg.el;
        node.classList.add('flying');
        node.style.transition = 'transform 1.2s cubic-bezier(.5,0,.8,.6)';
        node.style.transform = `translate(${pg.dir * 420}px, -360px)`;
        api.setTimeout(() => {
          node.style.transition = 'none';
          node.style.transform = `translate(${-pg.dir * 620}px, -300px)`;
          void node.offsetWidth;
          api.setTimeout(() => {
            node.style.transition = 'transform 1.7s cubic-bezier(.2,.6,.35,1)';
            node.style.transform = 'translate(0px, 0px)';
            api.setTimeout(() => {
              node.classList.remove('flying');
              node.style.transition = '';
              node.style.transform = '';
              pg.busy = false;
              if (phase !== 'demo') coo();
              restartClass(node, 'coo', 520);
            }, 1750);
          }, 2200);
        }, 1250);
      }

      /* ---------- bells ---------- */
      const w = cfg.w;
      const h = Math.round(w * 140 / 120);
      const slot = (SPAN_R - SPAN_L) / cfg.n;
      const bells = set.map((letter, i) => {
        const info = NOTE_INFO[letter];
        const cx = SPAN_L + slot * (i + 0.5);
        const wrap = api.el('div', { class: 'bell-wrap', style: {
          left: Math.round(cx - w / 2) + 'px', top: BEAM_BOTTOM + 'px',
          width: w + 'px', height: (ROPE + h) + 'px', animationDelay: (-i * 0.9) + 's',
        } });
        const swing = api.el('div', { class: 'bell-swing' });
        const rope = api.el('div', { class: 'bell-rope', style: { height: (ROPE + 16) + 'px' } });
        const box = api.el('div', { class: 'bell-box', style: { height: h + 'px' } });
        box.appendChild(api.el('div', { class: 'bell-halo' }));
        box.appendChild(api.svg(bellSVG(info)));
        swing.append(rope, box);
        wrap.appendChild(swing);
        wrap.querySelector('.bell-blink').style.animationDelay = (-i * 1.3) + 's';
        root.appendChild(wrap);
        const b = { el: wrap, box, note: info.pitch, letter, t: 0, ot: 0 };
        api.on(wrap, 'pointerdown', e => { e.preventDefault(); onBellTap(i); });
        return b;
      });

      function ring(i, sound) {
        const b = bells[i];
        if (sound) api.note(b.note, 0.8, 'bell');
        b.el.classList.remove('ring');
        void b.el.offsetWidth;
        b.el.classList.add('ring');
        clearTimeout(b.t);
        b.t = api.setTimeout(() => b.el.classList.remove('ring'), 760);
      }
      function oops(i) {
        const b = bells[i];
        b.el.classList.remove('oops');
        void b.el.offsetWidth;
        b.el.classList.add('oops');
        clearTimeout(b.ot);
        b.ot = api.setTimeout(() => b.el.classList.remove('oops'), 520);
      }
      function bellCenter(i) { return api.stageRect(bells[i].box); }

      /* ---------- Bram ---------- */
      const bram = api.el('div', { class: 'bl-bram', html: BRAM_SVG, title: 'Bram the Bellringer' });
      root.appendChild(bram);
      api.on(bram, 'pointerdown', () => {
        if (phase !== 'demo') {
          api.note('A4', 0.28, 'flute');
          api.setTimeout(() => api.note('F4', 0.5, 'flute'), 300);
          api.setTimeout(() => api.note('E6', 0.25, 'bell'), 120);
        }
        restartClass(bram, 'bounce', 620);
      });
      let talkN = 0;
      function bramSay(text) {
        const my = ++talkN;
        bram.classList.add('talking');
        return api.say(text, { who: 'Bram', pitch: 0.8, rate: 0.92 }).then(() => {
          if (my === talkN) bram.classList.remove('talking');
        });
      }

      /* ---------- HUD bits ---------- */
      root.appendChild(api.el('div', { class: 'room-title', text: 'Music Tower' }));
      const dots = [0, 1, 2].map(() => api.el('span'));
      root.appendChild(api.el('div', { class: 'round-dots' }, dots));
      const ind = api.el('div', { class: 'bl-ind' });
      root.appendChild(ind);
      let indKind = null;
      function setIndicator(kind) {
        if (kind === indKind) return;
        indKind = kind;
        if (!kind) { ind.classList.remove('show'); return; }
        ind.className = 'bl-ind ' + kind;
        ind.innerHTML = kind === 'ear' ? EAR_SVG : HAND_SVG;
        void ind.offsetWidth;
        ind.classList.add('show');
      }

      function restartClass(node, cls, ms) {
        node.classList.remove(cls);
        void node.offsetWidth;
        node.classList.add(cls);
        api.setTimeout(() => node.classList.remove(cls), ms);
      }

      /* ---------- tunes ---------- */
      function randomSeq(len) {
        const s = [];
        for (let k = 0; k < len; k++) {
          let v;
          do { v = api.rand(cfg.n); } while (s.length && v === s[s.length - 1]);
          s.push(v);
        }
        return s;
      }
      function makeTunes() {
        const used = {};
        return cfg.lens.map(len => {
          if (level === 3) {
            const opts = SONGS.filter(s => s.len === len && !used[s.name]);
            if (opts.length) {
              const song = api.pick(opts);
              const seq = song.notes.split(' ').map(l => set.indexOf(l));
              if (seq.every(v => v >= 0)) {
                used[song.name] = true;
                return { seq, name: song.name };
              }
            }
          }
          return { seq: randomSeq(len), name: null };
        });
      }
      const tunes = makeTunes();

      /* ---------- game state ---------- */
      // phase: 'free' (taps just play), 'demo' (taps ignored), 'input' (echo), 'busy' (taps ignored)
      let phase = 'free';
      let round = 0, idx = 0, misses = 0, hintMode = false;

      function clearHints() { bells.forEach(b => b.el.classList.remove('hint')); }
      function updateHint() {
        clearHints();
        if (hintMode && phase === 'input') {
          const seq = tunes[round].seq;
          if (idx < seq.length) bells[seq[idx]].el.classList.add('hint');
        }
      }

      function onBellTap(i) {
        if (phase === 'demo') { restartClass(ind, 'nudge', 520); return; }
        if (phase === 'busy') return;
        if (phase === 'free') {
          ring(i, true);
          const r = bellCenter(i);
          api.sparkle(r.cx, r.cy, 5);
          return;
        }
        // phase === 'input'
        const seq = tunes[round].seq;
        if (seq[idx] === i) {
          ring(i, true);
          const r = bellCenter(i);
          api.sparkle(r.cx, r.cy, 8);
          idx++;
          if (idx >= seq.length) {
            phase = 'busy';
            clearHints();
            setIndicator(null);
            roundWon();
          } else {
            updateHint();
          }
        } else {
          phase = 'busy';
          onMiss(i);
        }
      }

      async function playDemo(seq, slow) {
        phase = 'demo';
        clearHints();
        setIndicator('ear');
        bram.classList.add('conduct');
        await api.wait(350);
        const gap = slow ? SLOW_GAP : cfg.gap;
        for (let k = 0; k < seq.length; k++) {
          ring(seq[k], true);
          await api.wait(gap);
        }
        bram.classList.remove('conduct');
        await api.wait(150);
      }

      function beginInput() {
        idx = 0;
        phase = 'input';
        setIndicator('hand');
        updateHint();
        bramSay(hintMode ? 'Your turn! Follow the shiny bell.' : api.pick(['Your turn!', 'Now you ring it!', 'Your turn! Ring the bells!']));
      }

      async function startRound() {
        misses = 0;
        hintMode = false;
        phase = 'demo';
        clearHints();
        setIndicator('ear');
        await bramSay(round === 0 ? 'Listen!' : api.pick(['A new tune! Listen!', 'Listen to this one!', 'Here comes a new tune. Listen!']));
        await playDemo(tunes[round].seq, false);
        beginInput();
      }

      async function onMiss(i) {
        misses++;
        clearHints();
        setIndicator(null);
        api.sfx('boing');
        oops(i);
        await api.wait(650);
        if (misses >= 2) {
          hintMode = true;
          await bramSay("Let's listen again! Nice and slow.");
        } else {
          await bramSay("Let's listen again!");
        }
        await playDemo(tunes[round].seq, hintMode);
        beginInput();
      }

      function jingle() {
        api.sfx('sparkle');
        bells.forEach((b, i) => {
          api.setTimeout(() => { ring(i, true); api.sparkleAt(b.box); }, i * 110);
        });
      }

      async function roundWon() {
        const t = tunes[round];
        await api.wait(450);
        jingle();
        dots[round].classList.add('done');
        restartClass(bram, 'bounce', 620);
        await api.wait(bells.length * 110 + 400);
        if (t.name) await bramSay('Yes! That was ' + t.name + '!');
        else await bramSay(api.pick(['Ding dong! Perfect!', 'Beautiful ringing!', 'Hoo hoo! Just right!', 'Wonderful! You rang it!']));
        round++;
        if (round >= tunes.length) { finale(); return; }
        phase = 'free';
        await api.wait(900);
        startRound();
      }

      async function finale() {
        phase = 'busy';
        setIndicator(null);
        await api.wait(250);
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < bells.length; i++) { ring(i, true); await api.wait(120); }
        }
        bells.forEach((b, i) => { ring(i, false); api.sparkleAt(b.box); });
        api.note('C6', 1.2, 'bell');
        api.note('G5', 1.2, 'bell');
        api.note('C5', 1.2, 'bell');
        pigeons.forEach(p => flyPigeon(p, true));
        api.celebrate(640, 300, 90);
        restartClass(bram, 'bounce', 620);
        await bramSay('Ding dong! You are a super bellringer!');
        await api.wait(300);
        phase = 'free';
        api.complete();
      }

      /* ---------- intro ---------- */
      async function intro() {
        phase = 'free';
        api.setTimeout(() => {
          bells.forEach((b, i) => api.setTimeout(() => { if (phase === 'free') ring(i, true); }, i * 170));
        }, 500);
        await bramSay("Hoo hoo! I'm Bram the bellringer!");
        await bramSay('Listen to my bells. Then ring them just like me!');
        await api.wait(300);
        startRound();
      }
      intro();
    },
  });
})();
