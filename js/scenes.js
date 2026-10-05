/* =====================================================================
   Castle Quest — title screen, castle map and throne room (finale)
   ===================================================================== */
(function () {
  'use strict';
  const { el, svg, pick } = Castle.util;
  const INK = '#3a2a1a';

  const LEVELS = [
    { n: 1, name: 'Little Squire', ages: 'Ages 3–5', color: 'green' },
    { n: 2, name: 'Brave Knight', ages: 'Ages 5–7', color: 'blue' },
    { n: 3, name: 'Royal Wizard', ages: 'Ages 7–9', color: 'purple' },
  ];

  const SPOTS = {
    kitchen: { label: 'Royal Kitchen', badge: [145, 268], jewel: 'ruby' },
    bells:   { label: 'Music Tower', badge: [335, 352], jewel: 'sapphire' },
    banners: { label: 'Banner Hall', badge: [465, 300], jewel: 'emerald' },
    throne:  { label: 'Throne Room', badge: [650, 160] },
    wizard:  { label: "Wizard's Tower", badge: [950, 352], jewel: 'amethyst' },
    cave:    { label: "Dragon's Cave", badge: [1165, 300], jewel: 'topaz' },
    garden:  { label: 'Royal Garden', badge: [1150, 528], jewel: 'diamond' },
  };

  /* ------------------------------------------------------------------
     Shared scene CSS (injected once)
     ------------------------------------------------------------------ */
  document.head.appendChild(el('style', { html: `
    .map-svg, .title-svg, .throne-svg { position: absolute; inset: 0; }
    .hot { cursor: pointer; transition: filter .2s, transform .25s cubic-bezier(.3,1.6,.5,1); transform-box: fill-box; transform-origin: 50% 100%; }
    .hot:hover, .hot.focus { filter: brightness(1.12) drop-shadow(0 0 10px #fff59a); transform: scale(1.035); }
    .fun { cursor: pointer; transform-box: fill-box; transform-origin: center; }
    .cloud { animation: drift 60s linear infinite; }
    .cloud.c2 { animation-duration: 85s; animation-delay: -30s; }
    .cloud.c3 { animation-duration: 70s; animation-delay: -55s; }
    @keyframes drift { from { transform: translateX(-300px); } to { transform: translateX(1500px); } }
    .sun-rays { animation: spin 30s linear infinite; transform-box: fill-box; transform-origin: center; }
    .sun.whirl .sun-rays { animation-duration: 1s; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .flag-wave { animation: flag 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 0 50%; }
    @keyframes flag { 50% { transform: skewY(6deg) scaleX(.92); } }
    .smoke circle { animation: smoke 3.5s ease-out infinite; transform-box: fill-box; transform-origin: center; opacity: 0; }
    .smoke circle:nth-child(2) { animation-delay: 1.15s; } .smoke circle:nth-child(3) { animation-delay: 2.3s; }
    @keyframes smoke { 0% { opacity: .9; transform: translate(0,0) scale(.5); } 100% { opacity: 0; transform: translate(30px,-90px) scale(1.8); } }
    .bird { animation: fly 26s linear infinite; }
    .bird.b2 { animation-delay: -13s; animation-duration: 32s; }
    @keyframes fly { from { transform: translate(-100px, 0); } 50% { transform: translate(700px, -40px); } to { transform: translate(1500px, 10px); } }
    .wing-flap { animation: flap .4s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
    @keyframes flap { to { transform: scaleY(-.6); } }
    .fish { transform-box: fill-box; transform-origin: center; }
    .fish.jump { animation: fish-jump 1s ease-in-out; }
    @keyframes fish-jump { 0% { transform: translateY(0); } 40% { transform: translate(30px,-90px) rotate(-30deg); } 70% { transform: translate(60px,-40px) rotate(40deg); } 100% { transform: translate(70px,0) rotate(60deg); opacity: 0; } }
    .water-shine { animation: shine 3s ease-in-out infinite; }
    @keyframes shine { 50% { transform: translateX(20px); opacity: .4; } }
    .cave-eyes { animation: blink 5s infinite; transform-box: fill-box; transform-origin: center; }
    .twinkle { animation: twinkle 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .twinkle.t2 { animation-delay: .6s; } .twinkle.t3 { animation-delay: 1.2s; }
    @keyframes twinkle { 50% { opacity: .3; transform: scale(.6); } }
    .fountain-spray { animation: spray 1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
    @keyframes spray { to { transform: scaleY(.85); } }

    .map-label {
      position: absolute; transform: translate(-50%, -100%); white-space: nowrap;
      background: var(--wood); color: #fff; font-size: 28px; font-weight: 800; padding: 4px 18px 2px;
      border: 4px solid var(--ink); border-radius: 14px; box-shadow: 0 4px 0 var(--ink);
      -webkit-text-stroke: 1px var(--ink); paint-order: stroke fill;
      pointer-events: none; opacity: 0; transition: opacity .15s, transform .2s; z-index: 10;
    }
    .map-label.show { opacity: 1; transform: translate(-50%, -112%); }
    .badge {
      position: absolute; width: 56px; height: 56px; margin: -28px 0 0 -28px; border-radius: 50%;
      display: grid; place-items: center; pointer-events: none; z-index: 8;
      background: rgba(255,255,255,.85); border: 4px solid var(--ink); box-shadow: 0 4px 0 var(--ink);
      font-size: 34px; font-weight: 800; color: var(--purple);
    }
    .badge.missing { animation: bob 2s ease-in-out infinite; }
    .badge.found { background: #fffbe0; animation: jewel-glow 2.4s ease-in-out infinite; }
    .badge.crown { width: 70px; height: 70px; margin: -35px 0 0 -35px; font-size: 40px; background: #fff3b0; }
    .badge.crown.ready { animation: pulse 1s ease-in-out infinite; background: #ffe066; }
    @keyframes bob { 50% { transform: translateY(-8px); } }
    .level-pill {
      position: absolute; left: 16px; top: 16px; z-index: 41; cursor: pointer;
      font-family: inherit; font-size: 24px; font-weight: 800; color: var(--ink);
      background: var(--cream); border: 4px solid var(--ink); border-radius: 22px; box-shadow: 0 4px 0 var(--ink);
      padding: 6px 16px 4px; display: flex; gap: 8px; align-items: center;
    }
    .level-pill .st { color: var(--yellow); -webkit-text-stroke: 1.5px var(--ink); font-size: 28px; letter-spacing: 2px; }
    .level-pill .st i { font-style: normal; color: #e7dcc4; }
    .level-pill:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--ink); }

    /* Title */
    .logo {
      position: absolute; left: 0; right: 0; top: 40px; text-align: center; pointer-events: none;
      font-size: 128px; font-weight: 800; line-height: .9; letter-spacing: 2px;
      color: var(--yellow); -webkit-text-stroke: 6px var(--ink); paint-order: stroke fill;
      text-shadow: 0 10px 0 var(--ink);
      animation: logo-in 1s cubic-bezier(.3,1.6,.5,1) both;
    }
    .logo span { display: inline-block; animation: logo-bob 3s ease-in-out infinite; }
    @keyframes logo-in { from { transform: translateY(-200px) scale(.5); opacity: 0; } }
    @keyframes logo-bob { 50% { transform: translateY(-8px) rotate(-2deg); } }
    .ribbon {
      position: absolute; left: 50%; top: 178px; transform: translateX(-50%);
      background: var(--red); color: #fff; font-size: 34px; font-weight: 800;
      padding: 4px 48px 0; border: 5px solid var(--ink); border-radius: 8px; white-space: nowrap;
      -webkit-text-stroke: 1.5px var(--ink); paint-order: stroke fill; box-shadow: 0 6px 0 var(--ink);
    }
    .play-btn { position: absolute; left: 50%; top: 262px; transform: translateX(-50%); font-size: 64px; min-width: 340px; min-height: 120px; border-radius: 40px; }
    .play-btn:hover { transform: translateX(-50%) translateY(-3px) scale(1.04); }
    .play-btn:active { transform: translateX(-50%) translateY(6px); }
    .levels { position: absolute; left: 50%; top: 420px; transform: translateX(-50%); display: flex; gap: 22px; }
    .level-card {
      width: 220px; padding: 10px 8px 8px; text-align: center; cursor: pointer; font-family: inherit;
      background: var(--cream); border: 5px solid var(--ink); border-radius: 26px; box-shadow: 0 6px 0 var(--ink);
      transition: transform .15s; color: var(--ink);
    }
    .level-card:hover { transform: translateY(-4px); }
    .level-card.sel { background: #fff3b0; outline: 6px solid var(--yellow); transform: translateY(-6px) scale(1.04); }
    .level-card .st { font-size: 40px; color: var(--yellow); -webkit-text-stroke: 2px var(--ink); line-height: 1; }
    .level-card .st i { font-style: normal; color: #e7dcc4; }
    .level-card .nm { font-size: 30px; font-weight: 800; line-height: 1.05; }
    .level-card .ag { font-size: 20px; font-weight: 700; opacity: .7; }
    .grownups {
      position: absolute; right: 18px; bottom: 16px; font-family: inherit; font-size: 20px; font-weight: 700; cursor: pointer;
      background: rgba(255,246,224,.85); border: 3px solid var(--ink); border-radius: 14px; padding: 4px 14px; color: var(--ink);
    }
    .gu-card { text-align: left; font-size: 22px; max-width: 760px; }
    .gu-card h2 { text-align: center; font-size: 44px; }
    .gu-card p { margin: 8px 0; line-height: 1.3; }

    /* Throne room */
    .king { position: absolute; left: 490px; top: 150px; width: 300px; height: 380px; cursor: pointer; }
    .king .k-eyes { animation: blink 4.5s infinite; transform-box: fill-box; transform-origin: center; }
    .king.talking .k-mouth { animation: talk .2s infinite alternate; transform-box: fill-box; transform-origin: 50% 0; }
    .king.dance { animation: king-dance .6s ease-in-out infinite alternate; transform-origin: 50% 100%; }
    @keyframes king-dance { from { transform: rotate(-4deg); } to { transform: rotate(4deg) translateY(-10px); } }
    .crown-box {
      position: absolute; left: 870px; top: 248px; width: 240px; height: 170px; z-index: 6;
      transition: left 1.4s cubic-bezier(.5,0,.3,1), top 1.4s cubic-bezier(.5,-0.6,.3,1), width 1.4s, height 1.4s;
    }
    .crown-box svg { width: 100%; height: 100%; overflow: visible; }
    .crown-box.float { animation: crown-float 2s ease-in-out infinite; }
    @keyframes crown-float { 50% { transform: translateY(-10px); } }
    .tray {
      position: absolute; left: 228px; top: 128px; width: 120px; padding: 10px 0; z-index: 7;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      background: var(--cream); border: 5px solid var(--ink); border-radius: 30px; box-shadow: 0 6px 0 var(--ink);
    }
    .tray-jewel { width: 74px; height: 70px; display: grid; place-items: center; cursor: pointer; }
    .tray-jewel.flying { position: absolute; z-index: 20; transition: left .8s cubic-bezier(.5,0,.3,1), top .8s cubic-bezier(.5,-0.8,.3,1), transform .8s; pointer-events: none; }
    .tray-jewel.waiting { animation: bob 1.4s ease-in-out infinite; }
    .tray-jewel.waiting:nth-child(2) { animation-delay: .2s; } .tray-jewel.waiting:nth-child(3) { animation-delay: .4s; }
    .tray-jewel.waiting:nth-child(4) { animation-delay: .6s; } .tray-jewel.waiting:nth-child(5) { animation-delay: .8s; }
    .tray-jewel.waiting:nth-child(6) { animation-delay: 1s; }
    .tray-jewel.empty { opacity: .25; cursor: default; filter: grayscale(1); }
    .party-banners { position: absolute; left: 0; right: 0; top: -260px; height: 220px; transition: top 1s cubic-bezier(.3,1.4,.5,1); pointer-events: none; z-index: 3; }
    .party .party-banners { top: 0; }
    .certificate {
      width: 820px; padding: 30px 50px 34px; text-align: center; position: relative;
      background: #fff6d8 radial-gradient(circle at 50% 40%, #fffdf2, #f6e3b0);
      border: 6px solid var(--ink); border-radius: 18px; box-shadow: 0 12px 0 var(--ink), inset 0 0 0 10px #e7c46a;
    }
    .certificate h1 { font-size: 66px; margin: 0; color: var(--red); -webkit-text-stroke: 2px var(--ink); paint-order: stroke fill; line-height: 1; }
    .certificate p { font-size: 28px; font-weight: 700; margin: 10px 0 14px; }
    .certificate .jrow { display: flex; justify-content: center; gap: 8px; margin-bottom: 18px; }
    .seal { position: absolute; right: -34px; top: -34px; width: 110px; height: 110px; border-radius: 50%; background: var(--red);
      border: 5px solid var(--ink); display: grid; place-items: center; color: #fff3b0; font-size: 54px; transform: rotate(-12deg); }
  ` }));

  function stars(n) {
    return '<span class="st">' + '★'.repeat(n) + '<i>' + '★'.repeat(3 - n) + '</i></span>';
  }

  /* ------------------------------------------------------------------
     Shared landscape pieces
     ------------------------------------------------------------------ */
  const SKY_DEFS = `
    <linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbfff"/><stop offset=".75" stop-color="#cdeeff"/></linearGradient>
    <linearGradient id="gwater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb3f5"/><stop offset="1" stop-color="#2a7fd0"/></linearGradient>
    <linearGradient id="ggrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8be05e"/><stop offset="1" stop-color="#4fb53d"/></linearGradient>
    <pattern id="bricks" width="44" height="26" patternUnits="userSpaceOnUse">
      <rect width="44" height="26" fill="#e3d0ac"/>
      <path d="M0 13h44M0 26h44M22 0v13M0 13v13M44 13v13" stroke="#bfa67c" stroke-width="2.5"/>
    </pattern>
    <pattern id="bricks2" width="44" height="26" patternUnits="userSpaceOnUse">
      <rect width="44" height="26" fill="#d4bf98"/>
      <path d="M0 13h44M0 26h44M22 0v13M0 13v13M44 13v13" stroke="#ad946a" stroke-width="2.5"/>
    </pattern>`;

  function cloud(x, y, s, cls) {
    return `<g class="cloud ${cls} fun" data-fun="cloud"><g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 40 a30 30 0 0 1 40-36 a40 40 0 0 1 70 0 a28 28 0 0 1 40 36 z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    </g></g>`;
  }
  function sun(x, y) {
    let rays = '';
    for (let i = 0; i < 12; i++) rays += `<path d="M0 -62 L9 -84 L-9 -84 Z" transform="rotate(${i * 30})" fill="#ffd23f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    return `<g class="sun fun" data-fun="sun" transform="translate(${x} ${y})">
      <g class="sun-rays">${rays}</g>
      <circle r="52" fill="#ffe14d" stroke="${INK}" stroke-width="5"/>
      <circle cx="-17" cy="-8" r="5" fill="${INK}"/><circle cx="17" cy="-8" r="5" fill="${INK}"/>
      <ellipse cx="-30" cy="10" rx="8" ry="5" fill="#ff9a6b" opacity=".7"/><ellipse cx="30" cy="10" rx="8" ry="5" fill="#ff9a6b" opacity=".7"/>
      <path d="M-18 12 Q0 30 18 12" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    </g>`;
  }
  function merlons(x0, x1, y, w, gap) {
    let s = '';
    for (let x = x0; x + w <= x1 + 0.1; x += w + gap) s += `<rect x="${x}" y="${y}" width="${w}" height="26" fill="url(#bricks)" stroke="${INK}" stroke-width="4"/>`;
    return s;
  }

  /* ------------------------------------------------------------------
     The castle map
     ------------------------------------------------------------------ */
  function mapSVG() {
    return `<svg class="map-svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>${SKY_DEFS}</defs>
    <rect width="1280" height="720" fill="url(#gsky)"/>
    ${sun(240, 104)}
    ${cloud(0, 60, 1, 'c1')}${cloud(0, 150, .7, 'c2')}${cloud(0, 30, .8, 'c3')}
    <g class="bird"><g transform="translate(0 150)"><path class="wing-flap" d="M0 0 q12 -12 22 0 q10 -12 22 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g></g>
    <g class="bird b2"><g transform="translate(0 210) scale(.8)"><path class="wing-flap" d="M0 0 q12 -12 22 0 q10 -12 22 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g></g>

    <!-- far hills -->
    <path d="M0 470 Q160 380 330 450 T 700 430 T 1050 440 T 1280 420 V720 H0Z" fill="#a8e48a" stroke="${INK}" stroke-width="4"/>

    <!-- DRAGON'S CAVE (mountain) -->
    <g class="hot" data-room="cave">
      <path d="M1000 540 L1060 360 L1105 390 L1185 228 L1240 300 L1280 280 V540 Z" fill="#9b8fc4" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M1185 228 L1160 290 L1185 280 L1200 300 L1215 265 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M1060 360 L1048 400 L1068 392 L1080 372Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1040 470 l30 -20 M1230 380 l25 -12 M1120 420 l20 10" stroke="#6f62a0" stroke-width="5" stroke-linecap="round"/>
      <path d="M1105 540 V478 A58 58 0 0 1 1221 478 V540 Z" fill="#2a1d4f" stroke="${INK}" stroke-width="5"/>
      <polygon class="twinkle" points="1125,540 1133,505 1142,540" fill="#7ff0ff" stroke="${INK}" stroke-width="3"/>
      <polygon class="twinkle t2" points="1196,540 1205,500 1214,540" fill="#ff8ff0" stroke="${INK}" stroke-width="3"/>
      <polygon class="twinkle t3" points="1180,540 1186,518 1192,540" fill="#ffe14d" stroke="${INK}" stroke-width="3"/>
      <g class="cave-eyes"><ellipse cx="1150" cy="500" rx="8" ry="10" fill="#ffe14d"/><ellipse cx="1176" cy="500" rx="8" ry="10" fill="#ffe14d"/>
        <circle cx="1152" cy="502" r="4" fill="${INK}"/><circle cx="1178" cy="502" r="4" fill="${INK}"/></g>
    </g>

    <!-- ground -->
    <path d="M0 560 Q320 520 640 575 T 1280 545 V720 H0Z" fill="url(#ggrass)" stroke="${INK}" stroke-width="5"/>
    <path d="M60 640 q10 -14 20 0 M220 690 q10 -14 20 0 M880 690 q10 -14 20 0 M980 640 q10 -14 20 0 M400 700 q10 -14 20 0" fill="none" stroke="#3c9a2e" stroke-width="4" stroke-linecap="round"/>

    <!-- ROYAL KITCHEN cottage -->
    <g class="hot" data-room="kitchen">
      <rect x="190" y="300" width="34" height="70" fill="url(#bricks2)" stroke="${INK}" stroke-width="4"/>
      <g class="smoke"><circle cx="207" cy="290" r="14" fill="#f2f2f2" stroke="${INK}" stroke-width="3"/><circle cx="207" cy="290" r="14" fill="#f2f2f2" stroke="${INK}" stroke-width="3"/><circle cx="207" cy="290" r="14" fill="#f2f2f2" stroke="${INK}" stroke-width="3"/></g>
      <rect x="52" y="392" width="190" height="160" fill="#fff1cf" stroke="${INK}" stroke-width="5"/>
      <path d="M58 430 h40 M150 470 h50 M70 520 h30" stroke="#e6cf9e" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 398 L147 300 L264 398 Z" fill="#e8423f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M70 380 l20 -16 M110 380 l20 -16 M150 380 l20 -16 M190 380 l20 -16 M100 352 l20 -16 M140 352 l20 -16 M180 352 l14 -11" stroke="#b32421" stroke-width="4" stroke-linecap="round"/>
      <path d="M130 552 V490 a20 20 0 0 1 40 0 V552 Z" fill="#b5763c" stroke="${INK}" stroke-width="4"/>
      <circle cx="162" cy="522" r="3.5" fill="${INK}"/>
      <rect x="70" y="425" width="46" height="42" rx="6" fill="#ffe9a8" stroke="${INK}" stroke-width="4"/>
      <path d="M93 425 v42 M70 446 h46" stroke="${INK}" stroke-width="3"/>
      <path d="M66 470 h54" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 468 a14 9 0 0 1 28 0 z" fill="#e8a94c" stroke="${INK}" stroke-width="3"/>
      <rect x="186" y="425" width="40" height="40" rx="6" fill="#ffe9a8" stroke="${INK}" stroke-width="4"/>
      <path d="M206 425 v40 M186 445 h40" stroke="${INK}" stroke-width="3"/>
    </g>

    <!-- CASTLE -->
    <!-- right wall -->
    <g>
      ${merlons(762, 900, 306, 24, 14)}
      <rect x="760" y="330" width="142" height="270" fill="url(#bricks)" stroke="${INK}" stroke-width="5"/>
      <path d="M805 400 v-14 a12 12 0 0 1 24 0 v14 z M845 470 v-14 a12 12 0 0 1 24 0 v14 z" fill="${INK}"/>
    </g>
    <!-- BANNER HALL (left wall) -->
    <g class="hot" data-room="banners">
      ${merlons(392, 540, 306, 24, 13)}
      <rect x="388" y="330" width="154" height="270" fill="url(#bricks)" stroke="${INK}" stroke-width="5"/>
      <g class="flag-wave"><path d="M408 345 h40 v100 l-20 -16 l-20 16 z" fill="#3fb950" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="428" cy="380" r="10" fill="#ffe14d" stroke="${INK}" stroke-width="3"/></g>
      <g class="flag-wave" style="animation-delay:-.7s"><path d="M482 345 h40 v100 l-20 -16 l-20 16 z" fill="#e8423f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M502 366 l5 10 l11 1 l-8 7 l3 11 l-11 -6 l-11 6 l3 -11 l-8 -7 l11 -1 z" fill="#ffe14d" stroke="${INK}" stroke-width="2.5"/></g>
      <path d="M440 600 V520 a25 25 0 0 1 50 0 V600 Z" fill="#7d4a1f" stroke="${INK}" stroke-width="4"/>
    </g>
    <!-- MUSIC TOWER (left) -->
    <g class="hot" data-room="bells">
      <rect x="280" y="208" width="112" height="392" fill="url(#bricks2)" stroke="${INK}" stroke-width="5"/>
      <path d="M262 212 L336 100 L410 212 Z" fill="#2f7fe0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M300 180 L336 125 M336 212 L336 140 M372 180 L336 125" stroke="#1d56a3" stroke-width="4"/>
      <path d="M336 100 v-34" stroke="${INK}" stroke-width="4"/>
      <path class="flag-wave" d="M336 66 l30 9 l-30 9 z" fill="#ffc928" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M306 318 V262 a30 30 0 0 1 60 0 V318 Z" fill="#3a2a5a" stroke="${INK}" stroke-width="5"/>
      <path d="M320 304 q0 -36 16 -36 q16 0 16 36 z" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
      <circle cx="336" cy="308" r="6" fill="#ffc928" stroke="${INK}" stroke-width="3"/>
      <path d="M328 420 v-16 a8 8 0 0 1 16 0 v16 z M328 500 v-16 a8 8 0 0 1 16 0 v16 z" fill="${INK}"/>
    </g>
    <!-- WIZARD'S TOWER (right) -->
    <g class="hot" data-room="wizard">
      <rect x="896" y="208" width="112" height="392" fill="url(#bricks2)" stroke="${INK}" stroke-width="5"/>
      <path d="M878 212 L952 100 L1026 212 Z" fill="#9b5de5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M930 180 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z M968 150 l3 6 l7 1 l-5 4 l2 7 l-7 -4 l-6 4 l2 -7 l-5 -4 l7 -1z" fill="#ffe14d" stroke="${INK}" stroke-width="2"/>
      <path d="M952 100 v-28" stroke="${INK}" stroke-width="4"/>
      <path d="M958 58 a14 14 0 1 0 0 22 a10 10 0 1 1 0 -22z" fill="#ffe14d" stroke="${INK}" stroke-width="3"/>
      <path d="M922 318 V262 a30 30 0 0 1 60 0 V318 Z" fill="#5b2a9a" stroke="${INK}" stroke-width="5"/>
      <circle class="twinkle" cx="952" cy="282" r="9" fill="#d6b3ff"/>
      <circle class="twinkle t2" cx="938" cy="300" r="5" fill="#fff"/>
      <circle class="twinkle t3" cx="966" cy="298" r="5" fill="#fff"/>
      <path d="M944 420 v-16 a8 8 0 0 1 16 0 v16 z M944 500 v-16 a8 8 0 0 1 16 0 v16 z" fill="${INK}"/>
    </g>
    <!-- THRONE ROOM (keep) -->
    <g class="hot" data-room="throne">
      <path d="M650 190 v-80" stroke="${INK}" stroke-width="5"/>
      <g class="flag-wave"><path d="M650 112 h62 l-14 20 l14 20 h-62 z" fill="#e8423f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M664 140 l4 -14 l7 8 l6 -10 l6 10 l7 -8 l4 14 z" fill="#ffe14d" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></g>
      ${merlons(540, 762, 190, 26, 13)}
      <rect x="538" y="214" width="226" height="386" fill="url(#bricks)" stroke="${INK}" stroke-width="5"/>
      <circle cx="651" cy="300" r="38" fill="#2f7fe0" stroke="${INK}" stroke-width="5"/>
      <path d="M651 262 v76 M613 300 h76" stroke="${INK}" stroke-width="3"/>
      <path d="M630 312 l4 -22 l9 10 l8 -16 l8 16 l9 -10 l4 22 z" fill="#ffe14d" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M598 600 V512 a53 53 0 0 1 106 0 V600 Z" fill="#b5763c" stroke="${INK}" stroke-width="5"/>
      <path d="M624 600 V470 M651 600 V460 M678 600 V470" stroke="#7d4a1f" stroke-width="4"/>
      <path d="M598 530 h106 M598 575 h106" stroke="${INK}" stroke-width="4"/>
      <circle cx="610" cy="530" r="4" fill="${INK}"/><circle cx="692" cy="530" r="4" fill="${INK}"/><circle cx="610" cy="575" r="4" fill="${INK}"/><circle cx="692" cy="575" r="4" fill="${INK}"/>
      <path d="M572 410 v-20 a10 10 0 0 1 20 0 v20 z M710 410 v-20 a10 10 0 0 1 20 0 v20 z" fill="${INK}"/>
    </g>

    <!-- moat + drawbridge -->
    <path d="M250 598 Q450 590 640 600 T 1030 598 L1040 650 Q840 662 640 652 T 240 650 Z" fill="url(#gwater)" stroke="${INK}" stroke-width="5"/>
    <path class="water-shine" d="M300 622 h40 M470 630 h30 M800 628 h50 M930 620 h30" stroke="#bfe8ff" stroke-width="5" stroke-linecap="round"/>
    <g class="fun" data-fun="fish"><g class="fish" transform="translate(440 628)">
      <path d="M0 0 q20 -16 40 0 q-20 16 -40 0 z M40 0 l14 -10 v20 z" fill="#ff8c2b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="12" cy="-2" r="3" fill="${INK}"/></g></g>
    <path d="M604 596 L698 596 L716 664 L586 664 Z" fill="#c98b4f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M600 614 h102 M596 632 h110 M592 648 h118" stroke="#7d4a1f" stroke-width="3"/>
    <path d="M590 664 L560 720 H742 L712 664 Z" fill="#e8c88a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>

    <!-- ROYAL GARDEN -->
    <g class="hot" data-room="garden">
      <path d="M1030 556 H1280 V720 H1030 Z" fill="#9be26f"/>
      <path d="M1030 556 q20 -26 40 0 q20 -26 40 0 q20 -26 40 0 M1190 556 q20 -26 40 0 q20 -26 40 0" fill="#3fa34a" stroke="${INK}" stroke-width="5"/>
      <rect x="1030" y="556" width="120" height="22" fill="#3fa34a" stroke="${INK}" stroke-width="5"/>
      <rect x="1190" y="556" width="90" height="22" fill="#3fa34a" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="1170" cy="660" rx="56" ry="16" fill="#8fd3ff" stroke="${INK}" stroke-width="5"/>
      <rect x="1162" y="618" width="16" height="40" fill="#c9b79c" stroke="${INK}" stroke-width="4"/>
      <path class="fountain-spray" d="M1170 618 q-30 -30 -42 20 M1170 618 q30 -30 42 20 M1170 618 v-34" fill="none" stroke="#5ab8f0" stroke-width="5" stroke-linecap="round"/>
      ${[[1060, 620, '#ff6fae'], [1085, 650, '#ffe14d'], [1055, 690, '#e8423f'], [1240, 620, '#9b5de5'], [1255, 670, '#ff8c2b'], [1225, 700, '#ff6fae'], [1110, 700, '#2f7fe0']]
        .map(([x, y, c]) => `<g transform="translate(${x} ${y})"><path d="M0 0 v18" stroke="#3c9a2e" stroke-width="4"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-9" r="7" fill="${c}" stroke="${INK}" stroke-width="2.5" transform="rotate(${a})"/>`).join('')}<circle r="6" fill="#ffe14d" stroke="${INK}" stroke-width="2.5"/></g>`).join('')}
    </g>
  </svg>`;
  }

  Castle.registerScene('map', function (root, api) {
    Castle.setHud({ back: false });
    Castle.guide.show();
    Castle.music.play();
    const st = Castle.state;
    root.style.background = '#5fbfff';
    root.appendChild(svg(mapSVG()));

    // Labels + badges
    const labels = {};
    for (const id in SPOTS) {
      const s = SPOTS[id];
      const lab = el('div', { class: 'map-label', text: s.label, style: { left: s.badge[0] + 'px', top: (s.badge[1] - 34) + 'px' } });
      labels[id] = lab;
      root.appendChild(lab);
      let b;
      if (id === 'throne') {
        const ready = Castle.jewelCount() === 6 && !st.finale;
        b = el('div', { class: 'badge crown' + (ready ? ' ready' : ''), html: st.finale ? '👑' : '♛' });
      } else if (st.jewels[s.jewel]) {
        b = el('div', { class: 'badge found', html: Castle.jewelSVG(s.jewel, 42) });
      } else {
        b = el('div', { class: 'badge missing', text: '?' });
      }
      b.style.left = s.badge[0] + 'px'; b.style.top = s.badge[1] + 'px';
      root.appendChild(b);
    }

    // Level pill (top-left; back button is hidden on the map)
    const lvl = LEVELS[st.difficulty - 1];
    const pill = el('button', { class: 'level-pill', html: stars(st.difficulty) + ' ' + lvl.name, 'aria-label': 'Change difficulty' });
    pill.onclick = () => {
      st.difficulty = st.difficulty % 3 + 1; Castle.save();
      const L = LEVELS[st.difficulty - 1];
      pill.innerHTML = stars(st.difficulty) + ' ' + L.name;
      api.sfx('coin');
      api.say(`${L.name} puzzles!`);
    };
    root.appendChild(pill);

    // Hotspots
    let lastHover = null;
    root.querySelectorAll('.hot').forEach(g => {
      const id = g.getAttribute('data-room');
      api.on(g, 'pointerenter', () => {
        labels[id].classList.add('show');
        if (lastHover !== id) { lastHover = id; api.sfx('click'); }
      });
      api.on(g, 'pointerleave', () => labels[id].classList.remove('show'));
      api.on(g, 'click', () => {
        if (id !== 'throne' && !Castle.rooms[id]) { api.say('That room is still being built!'); return; }
        api.sfx('pop');
        Castle.go(id);
      });
    });

    // Fun clickables
    root.querySelectorAll('.fun').forEach(f => {
      const kind = f.getAttribute('data-fun');
      api.on(f, 'click', e => {
        e.stopPropagation();
        const p = api.toStage(e.clientX, e.clientY);
        if (kind === 'sun') {
          f.classList.add('whirl'); api.sfx('giggle'); api.sparkle(p.x, p.y, 20);
          api.setTimeout(() => f.classList.remove('whirl'), 1600);
        } else if (kind === 'cloud') {
          api.sfx('pop'); api.sparkle(p.x, p.y, 10);
          for (let i = 0; i < 6; i++) api.setTimeout(() => api.note(pick(['C6', 'E6', 'G6']), 0.12, 'sine'), i * 60);
        } else if (kind === 'fish') {
          const fish = f.querySelector('.fish');
          if (fish.classList.contains('jump')) return;
          fish.classList.add('jump'); api.sfx('splash');
          api.setTimeout(() => { fish.classList.remove('jump'); api.sfx('plop'); }, 1100);
        }
      });
    });

    // Narration
    const count = Castle.jewelCount();
    let line;
    if (!st.introSeen) {
      st.introSeen = true; Castle.save();
      (async () => {
        await api.say("Oh no! A big gust of wind blew the six jewels right off the King's crown!");
        await api.say('Can you help me find them? Tap a room to explore the castle!');
      })();
      return;
    }
    if (count === 6 && !st.finale) line = "You found all six jewels! Let's take them to the King in the Throne Room!";
    else if (st.finale) line = pick(['Welcome back, Royal Hero! Where shall we play?', 'Let\'s play again! Pick a room!']);
    else if (count === 0) line = 'Tap a room to explore the castle!';
    else line = pick([`We have ${count} jewel${count > 1 ? 's' : ''}! Where shall we look next?`, 'Where should we go next?', `${6 - count} more jewel${6 - count > 1 ? 's' : ''} to find!`]);
    api.say(line);
  });

  /* ------------------------------------------------------------------
     Title screen
     ------------------------------------------------------------------ */
  Castle.registerScene('title', function (root, api) {
    Castle.setHud({ back: false, tray: false });
    Castle.guide.show();
    Castle.music.play();
    const st = Castle.state;
    root.appendChild(svg(`<svg class="title-svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>${SKY_DEFS}</defs>
      <rect width="1280" height="720" fill="url(#gsky)"/>
      ${sun(1150, 300)}
      ${cloud(0, 80, 1.1, 'c1')}${cloud(0, 300, .7, 'c2')}${cloud(0, 200, .9, 'c3')}
      <path d="M0 560 Q200 470 420 540 T 860 520 T 1280 500 V720 H0Z" fill="#a8e48a" stroke="${INK}" stroke-width="4"/>
      <g transform="translate(905 395) scale(.9)">
        <rect x="0" y="60" width="60" height="160" fill="url(#bricks2)" stroke="${INK}" stroke-width="5"/>
        <path d="M-10 64 L30 0 L70 64Z" fill="#2f7fe0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <rect x="200" y="60" width="60" height="160" fill="url(#bricks2)" stroke="${INK}" stroke-width="5"/>
        <path d="M190 64 L230 0 L270 64Z" fill="#9b5de5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        ${merlons(62, 198, 96, 22, 12)}
        <rect x="60" y="120" width="140" height="100" fill="url(#bricks)" stroke="${INK}" stroke-width="5"/>
        <path d="M108 220 v-40 a22 22 0 0 1 44 0 v40z" fill="#b5763c" stroke="${INK}" stroke-width="4"/>
        <path d="M130 120 v-50" stroke="${INK}" stroke-width="4"/><path class="flag-wave" d="M130 70 h36 l-8 10 l8 10 h-36z" fill="#e8423f" stroke="${INK}" stroke-width="3"/>
      </g>
      <path d="M0 620 Q320 580 640 620 T 1280 600 V720 H0Z" fill="url(#ggrass)" stroke="${INK}" stroke-width="5"/>
    </svg>`));

    const logo = el('div', { class: 'logo' });
    'Castle Quest'.split('').forEach((ch, i) => logo.appendChild(el('span', { text: ch === ' ' ? ' ' : ch, style: { animationDelay: (i * 0.12) + 's' } })));
    root.appendChild(logo);
    root.appendChild(el('div', { class: 'ribbon', text: "The King's Lost Jewels" }));

    const play = el('button', { class: 'big-btn green play-btn pulse', html: '▶ Play!' });
    play.onclick = () => { api.sfx('fanfare'); Castle.go('map'); };
    root.appendChild(play);

    const levels = el('div', { class: 'levels' });
    LEVELS.forEach(L => {
      const card = el('button', { class: 'level-card' + (st.difficulty === L.n ? ' sel' : ''),
        html: `<div class="st">${'★'.repeat(L.n)}<i>${'★'.repeat(3 - L.n)}</i></div><div class="nm">${L.name}</div><div class="ag">${L.ages}</div>` });
      card.onclick = () => {
        st.difficulty = L.n; Castle.save();
        levels.querySelectorAll('.level-card').forEach(c => c.classList.remove('sel'));
        card.classList.add('sel');
        api.sfx('coin');
        api.say(`${L.name}! ${['Easy peasy puzzles.', 'Trickier puzzles.', 'The hardest puzzles!'][L.n - 1]}`);
      };
      levels.appendChild(card);
    });
    root.appendChild(levels);

    const gu = el('button', { class: 'grownups', text: 'Grown-ups' });
    gu.onclick = () => {
      api.sfx('click');
      const card = el('div', { class: 'gu-card' }, [
        el('h2', { text: 'For Grown-ups' }),
        el('p', { html: '<b>Castle Quest</b> has six puzzle rooms. Finishing a room earns a crown jewel. Find all six, then visit the King in the Throne Room for the grand finale.' }),
        el('p', { html: '<b>Rooms:</b> Kitchen (counting & adding) · Music Tower (listening & memory) · Wizard\'s Tower (matching & sight words) · Banner Hall (patterns) · Dragon\'s Cave (mazes & planning) · Royal Garden (letters, phonics & spelling).' }),
        el('p', { html: '<b>Levels:</b> Little Squire (3–5), Brave Knight (5–7), Royal Wizard (7–9). Change any time from the star badge on the castle map. Everything is spoken aloud — tap Pip the dragon to repeat. Progress saves automatically on this device.' }),
        el('div', { class: 'btn-row', style: { marginTop: '18px' } }, [
          el('button', { class: 'big-btn red', text: 'Reset progress', onclick: () => {
            if (confirm('Erase all collected jewels and start a new quest?')) { Castle.resetProgress(); Castle.state.introSeen = false; Castle.save(); Castle.hideModal(); api.say('All fresh! A brand new quest!'); }
          } }),
          el('button', { class: 'big-btn green', text: 'Done', onclick: () => { api.sfx('click'); Castle.hideModal(); } }),
        ]),
      ]);
      Castle.showModal(card, { wide: true });
    };
    root.appendChild(gu);

    root.querySelectorAll('.fun').forEach(f => api.on(f, 'click', () => {
      if (f.dataset.fun === 'sun') { f.classList.add('whirl'); api.sfx('giggle'); api.setTimeout(() => f.classList.remove('whirl'), 1500); }
      else api.sfx('pop');
    }));

    api.say("Hi! I'm Pip, the little castle dragon! Pick a level, then tap Play!");
  });

  /* ------------------------------------------------------------------
     Throne room + finale
     ------------------------------------------------------------------ */
  const KING_SVG = `<svg viewBox="0 0 300 380" width="300" height="380">
    <!-- robe -->
    <path d="M40 380 C30 280 60 200 150 196 C240 200 270 280 260 380 Z" fill="#e8423f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M150 210 V380" stroke="#b32421" stroke-width="5"/>
    <path d="M128 230 h44 v150 h-44z" fill="#fff" stroke="${INK}" stroke-width="5"/>
    <path d="M138 260 l4 8 M158 290 l4 8 M138 320 l4 8 M158 350 l4 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <!-- arms -->
    <path d="M70 260 C40 300 60 340 96 330" fill="#e8423f" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M230 260 C260 300 240 340 204 330" fill="#e8423f" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="100" cy="330" r="16" fill="#ffd2b0" stroke="${INK}" stroke-width="5"/>
    <circle cx="200" cy="330" r="16" fill="#ffd2b0" stroke="${INK}" stroke-width="5"/>
    <!-- ermine collar -->
    <path d="M70 214 C110 250 190 250 230 214 C220 196 80 196 70 214 Z" fill="#fff" stroke="${INK}" stroke-width="5"/>
    <path d="M100 222 l3 7 M140 232 l3 7 M180 228 l3 7 M210 218 l3 7" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <!-- head -->
    <circle cx="150" cy="120" r="74" fill="#ffd2b0" stroke="${INK}" stroke-width="6"/>
    <ellipse cx="78" cy="124" rx="12" ry="18" fill="#ffc29a" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="222" cy="124" rx="12" ry="18" fill="#ffc29a" stroke="${INK}" stroke-width="5"/>
    <path d="M118 52 q8 -14 14 0 M146 48 q8 -16 14 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <!-- beard -->
    <path d="M82 140 C80 230 220 230 218 140 C200 170 100 170 82 140 Z" fill="#f4f1ea" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <ellipse class="k-mouth" cx="150" cy="168" rx="16" ry="7" fill="#8a2b2b" stroke="${INK}" stroke-width="4"/>
    <path d="M150 152 C130 140 108 150 104 162 C120 156 136 160 150 158 C164 160 180 156 196 162 C192 150 170 140 150 152 Z" fill="#f4f1ea" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <!-- face -->
    <ellipse cx="150" cy="134" rx="15" ry="13" fill="#ff9e85" stroke="${INK}" stroke-width="4"/>
    <g class="k-eyes"><ellipse cx="122" cy="108" rx="10" ry="12" fill="#fff" stroke="${INK}" stroke-width="4"/><ellipse cx="178" cy="108" rx="10" ry="12" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <circle cx="124" cy="110" r="5" fill="${INK}"/><circle cx="180" cy="110" r="5" fill="${INK}"/></g>
    <path d="M106 88 q16 -10 30 -2 M164 86 q16 -8 30 2" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="98" cy="140" rx="12" ry="8" fill="#ff8f8f" opacity=".6"/><ellipse cx="202" cy="140" rx="12" ry="8" fill="#ff8f8f" opacity=".6"/>
  </svg>`;

  // Crown art: socket positions in the 240x170 viewBox
  const SOCKETS = [[32, 136], [67, 136], [102, 136], [138, 136], [173, 136], [208, 136]];
  function crownSVG(filled) {
    return `<svg viewBox="0 0 240 170">
      <path d="M12 160 L12 50 L60 98 L120 18 L180 98 L228 50 L228 160 Z" fill="#ffd23f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M24 70 L24 110 L52 112 Z M120 40 L96 92 L144 92 Z M216 70 L216 110 L188 112 Z" fill="#fff3a6" opacity=".7"/>
      <rect x="12" y="112" width="216" height="48" fill="#ffb800" stroke="${INK}" stroke-width="6"/>
      <circle cx="12" cy="44" r="11" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="120" cy="12" r="11" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="228" cy="44" r="11" fill="#fff" stroke="${INK}" stroke-width="4"/>
      ${SOCKETS.map(([x, y], i) => {
        const k = Castle.JEWEL_ORDER[i];
        return filled[k]
          ? `<g transform="translate(${x - 17} ${y - 17})">${Castle.jewelSVG(k, 34)}</g>`
          : `<circle cx="${x}" cy="${y}" r="13" fill="#8a6a00" stroke="${INK}" stroke-width="4" stroke-dasharray="4 3"/>`;
      }).join('')}
    </svg>`;
  }

  Castle.registerScene('throne', function (root, api) {
    Castle.setHud({ back: true });
    Castle.guide.show();
    Castle.music.play();
    const st = Castle.state;
    const KING = { who: 'King Rollo', pitch: 0.75, rate: 0.9 };

    root.appendChild(svg(`<svg class="throne-svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>${SKY_DEFS}
        <linearGradient id="carpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c62c3a"/><stop offset="1" stop-color="#e8423f"/></linearGradient>
      </defs>
      <rect width="1280" height="560" fill="url(#bricks2)"/>
      <rect y="540" width="1280" height="180" fill="#c9a26b" stroke="${INK}" stroke-width="5"/>
      <path d="M0 600 H1280 M0 660 H1280 M160 540 v180 M400 540 v180 M880 540 v180 M1120 540 v180" stroke="#a87f4c" stroke-width="4"/>
      <!-- windows -->
      ${[120, 1020].map(x => `<g><path d="M${x} 430 V240 a70 70 0 0 1 140 0 V430 Z" fill="url(#gsky)" stroke="${INK}" stroke-width="6"/>
        <path d="M${x + 70} 170 V430 M${x} 330 H${x + 140}" stroke="${INK}" stroke-width="5"/>
        <path d="M${x - 12} 436 H${x + 152}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></g>`).join('')}
      <!-- banners on wall -->
      ${[[400, '#2f7fe0'], [820, '#3fb950']].map(([x, c]) => `<g class="flag-wave"><path d="M${x} 60 h70 v190 l-35 -26 l-35 26 z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M${x + 18} 120 l5 -22 l12 14 l12 -14 l5 22 z" fill="#ffe14d" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`).join('')}
      <!-- carpet -->
      <path d="M560 540 L720 540 L820 720 L460 720 Z" fill="url(#carpet)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M574 552 L706 552 L798 716 M482 716 L574 552" fill="none" stroke="#ffd23f" stroke-width="5"/>
      <!-- throne -->
      <path d="M500 520 V150 Q500 60 640 60 Q780 60 780 150 V520 Z" fill="#9b5de5" stroke="${INK}" stroke-width="6"/>
      <path d="M530 500 V160 Q530 92 640 92 Q750 92 750 160 V500 Z" fill="#b98af0" stroke="${INK}" stroke-width="4"/>
      <circle cx="640" cy="52" r="22" fill="#ffd23f" stroke="${INK}" stroke-width="5"/>
      <rect x="470" y="420" width="340" height="80" rx="16" fill="#ffd23f" stroke="${INK}" stroke-width="6"/>
      <rect x="480" y="496" width="40" height="50" fill="#d99a00" stroke="${INK}" stroke-width="5"/>
      <rect x="760" y="496" width="40" height="50" fill="#d99a00" stroke="${INK}" stroke-width="5"/>
      <!-- pedestal + cushion -->
      <rect x="930" y="430" width="120" height="140" fill="#e3d0ac" stroke="${INK}" stroke-width="5"/>
      <rect x="912" y="410" width="156" height="28" rx="6" fill="#c9b79c" stroke="${INK}" stroke-width="5"/>
      <path d="M884 412 Q990 370 1096 412 Q990 440 884 412 Z" fill="#2f7fe0" stroke="${INK}" stroke-width="5"/>
      <circle cx="884" cy="412" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><circle cx="1096" cy="412" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>
    </svg>`));

    const banners = el('div', { class: 'party-banners', html: `<svg viewBox="0 0 1280 220" width="1280" height="220">
      <path d="M0 30 Q320 140 640 40 Q960 140 1280 30" fill="none" stroke="${INK}" stroke-width="4"/>
      ${Array.from({ length: 20 }, (_, i) => {
        const x = 30 + i * 64, t = (x % 640) / 640, y = 30 + Math.sin(t * Math.PI) * 70 + 4;
        const c = ['#e8423f', '#ffc928', '#2f7fe0', '#3fb950', '#9b5de5'][i % 5];
        return `<path d="M${x - 20} ${y} h40 l-20 46 z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
      }).join('')}
    </svg>` });
    root.appendChild(banners);

    const king = el('div', { class: 'king', html: KING_SVG });
    root.appendChild(king);
    const crown = el('div', { class: 'crown-box float' });
    root.appendChild(crown);
    const placed = st.finale ? Object.assign({}, st.jewels) : {};
    const all = Castle.jewelCount() === 6;

    function placeOnHead(instant) {
      crown.classList.remove('float');
      if (instant) crown.style.transition = 'none';
      Object.assign(crown.style, { left: '565px', top: '108px', width: '150px', height: '106px' });
    }
    function drawCrown() { crown.innerHTML = crownSVG(placed); }

    async function kingSays(text) {
      king.classList.add('talking');
      await api.say(text, KING);
      king.classList.remove('talking');
    }

    if (!st.finale && !all) {
      // Show the jewels found so far sitting in the crown
      Object.assign(placed, st.jewels);
      drawCrown();
      const n = Castle.jewelCount();
      kingSays(n === 0
        ? "Welcome to my castle! Oh dear, my crown has lost all six of its jewels. Can you and Pip find them?"
        : `Hello, brave helper! You have found ${n} jewel${n > 1 ? 's' : ''}. Only ${6 - n} more to go!`);
    } else if (st.finale) {
      drawCrown(); placeOnHead(true);
      kingSays(pick(['Hello again, Royal Hero! My crown has never looked so shiny!', 'Welcome back! Would you like a party? Tap the party button!']));
      const partyBtn = el('button', { class: 'big-btn gold', html: '<span class="ico">🎉</span> Party!', style: { position: 'absolute', right: '40px', top: '600px' } });
      partyBtn.onclick = () => party(false);
      root.appendChild(partyBtn);
    } else {
      // Finale: put the jewels in the crown
      drawCrown();
      const tray = el('div', { class: 'tray' });
      let remaining = 6, step = 0;
      Castle.JEWEL_ORDER.forEach((k, i) => {
        const j = el('div', { class: 'tray-jewel waiting', html: Castle.jewelSVG(k, 60) });
        j.onclick = () => {
          if (j.classList.contains('empty') || j.dataset.used) return;
          j.dataset.used = '1';
          j.classList.remove('waiting');
          const from = api.stageRect(j);
          const fly = el('div', { class: 'tray-jewel flying', html: Castle.jewelSVG(k, 60), style: { left: from.x + 'px', top: from.y + 'px' } });
          root.appendChild(fly);
          j.classList.add('empty');
          api.sfx('whoosh');
          const c = api.stageRect(crown);
          const [sx, sy] = SOCKETS[i];
          const tx = c.x + sx / 240 * c.w - 37, ty = c.y + sy / 170 * c.h - 35;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            fly.style.left = tx + 'px'; fly.style.top = ty + 'px'; fly.style.transform = 'scale(.57)';
          }));
          api.setTimeout(() => {
            fly.remove(); placed[k] = true; drawCrown();
            api.note(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][step++], 0.8, 'bell');
            api.sparkle(tx + 37, ty + 35, 24);
            remaining--;
            if (remaining === 0) api.setTimeout(() => finale(tray), 700);
          }, 850);
        };
        tray.appendChild(j);
      });
      root.appendChild(tray);
      (async () => {
        await kingSays('My goodness! You found all six of my jewels!');
        await api.say('Tap each jewel to put it back in the crown!');
      })();
    }

    async function finale(tray) {
      tray.remove();
      api.sfx('chime');
      await kingSays('It looks wonderful! Now, let me put it on!');
      placeOnHead(false);
      api.sfx('whoosh');
      await api.wait(1500);
      st.finale = true; Castle.save();
      await party(true);
      showCertificate();
    }

    async function party(big) {
      root.classList.add('party');
      king.classList.add('dance');
      api.sfx('fanfare');
      const bursts = big ? 6 : 3;
      for (let i = 0; i < bursts; i++) api.setTimeout(() => { api.celebrate(200 + Math.random() * 880, 120 + Math.random() * 200, 90); api.sfx('pop'); }, i * 450);
      // A little victory tune
      const tune = ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'];
      tune.forEach((n, i) => api.setTimeout(() => api.note(n, 0.4, 'pluck'), 600 + i * 220));
      await kingSays(big ? 'Hooray! My crown is fixed! Thank you, brave helper! You are a true Royal Hero!' : 'Hooray! Let\'s party!');
      api.setTimeout(() => king.classList.remove('dance'), 2500);
    }

    function showCertificate() {
      const card = el('div', { class: 'certificate' }, [
        el('h1', { text: 'Royal Hero!' }),
        el('p', { text: 'By order of King Rollo, this brave helper found all six crown jewels and saved the day!' }),
        el('div', { class: 'jrow', html: Castle.JEWEL_ORDER.map(k => Castle.jewelSVG(k, 64)).join('') }),
        el('div', { class: 'seal', text: '♛' }),
        el('div', { class: 'btn-row' }, [
          el('button', { class: 'big-btn blue', html: '<span class="ico">🏰</span> Keep playing', onclick: () => { api.sfx('click'); Castle.go('map'); } }),
          st.difficulty < 3 ? el('button', { class: 'big-btn purple', html: '<span class="ico">★</span> Harder quest', onclick: () => {
            api.sfx('coin');
            st.difficulty++; st.jewels = {}; st.finale = false; Castle.save(); Castle.updateHud();
            Castle.go('map');
          } }) : null,
        ]),
      ]);
      Castle.showModal(card, { bare: true });
      api.say(st.difficulty < 3 ? 'You are a Royal Hero! Keep playing, or try a harder quest!' : 'You are a Royal Hero! Keep playing any room you like!');
    }

    api.on(king, 'click', () => {
      api.sfx('giggle');
      king.classList.add('wiggle'); api.setTimeout(() => king.classList.remove('wiggle'), 500);
      kingSays(pick(['Ho ho ho! That tickles!', 'Have you met Cook Clementine? Her soup is yummy!', 'Pip is the best little dragon in the land!', 'A king needs his crown, you know!']));
    });
    api.on(crown, 'click', () => { api.sfx('sparkle'); api.sparkleAt(crown); });
  });
})();
