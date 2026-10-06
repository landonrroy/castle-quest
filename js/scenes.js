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
    garden:  { label: 'Royal Garden', badge: [1080, 604], jewel: 'diamond' },
  };

  /* ------------------------------------------------------------------
     Shared scene CSS (injected once)
     ------------------------------------------------------------------ */
  document.head.appendChild(el('style', { html: `
    .map-bg, .map-spot, .map-hot { position: absolute; }
    .map-spot { pointer-events: none; transition: filter .15s; }
    .map-spot.lit { filter: brightness(1.12) drop-shadow(0 0 6px #fff59a); }
    .map-hot { left: 0; top: 0; width: 1280px; height: 720px; }
    .map-hot .hot { fill: transparent; pointer-events: all; cursor: pointer; }

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
    .king { position: absolute; left: 490px; top: 140px; width: 300px; height: 380px; cursor: pointer; }
    .king.dance { animation: king-dance .6s steps(4, end) infinite alternate; transform-origin: 50% 100%; }
    @keyframes king-dance { from { transform: rotate(-4deg); } to { transform: rotate(4deg) translateY(-10px); } }
    .crown-box {
      position: absolute; left: 870px; top: 232px; width: 240px; height: 170px; z-index: 6;
      transition: left 1.4s cubic-bezier(.5,0,.3,1), top 1.4s cubic-bezier(.5,-0.6,.3,1), width 1.4s, height 1.4s;
    }
    .crown-el { position: absolute; inset: 0; background: url(assets/castle/crown.png) 0 0/100% 100% no-repeat; image-rendering: pixelated; }
    .crown-el .jewel-px { position: absolute; transform: translate(-50%, -50%); }
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
  /* ------------------------------------------------------------------
     The castle map: pixel background + building cut-outs + hit polygons
     ------------------------------------------------------------------ */
  const SPOT_POLYS = {
    kitchen: '28,402 148,296 190,334 190,298 228,298 228,366 270,402 246,402 246,556 52,556 52,402',
    bells:   '262,214 336,98 336,56 378,70 346,84 410,214 394,214 394,600 280,600 280,214',
    banners: '394,304 540,304 540,600 394,600',
    throne:  '538,186 648,186 648,104 716,104 716,186 766,186 766,600 538,600',
    wizard:  '878,214 954,96 936,46 972,46 956,96 1028,214 1010,214 1010,600 896,600 896,214',
    cave:    '1012,545 1050,390 1080,380 1150,280 1190,226 1240,290 1280,280 1280,545',
    garden:  '960,720 990,590 1030,548 1280,548 1280,720',
  };
  // [stage x, stage y, art w, art h]
  const SPOT_BOX = {
    kitchen: [28, 296, 122, 131], bells: [262, 56, 75, 273], banners: [394, 304, 74, 149], throne: [538, 104, 115, 249],
    wizard: [878, 46, 76, 278], cave: [1012, 226, 134, 160], garden: [960, 548, 160, 86],
  };

  Castle.registerScene('map', function (root, api) {
    Castle.setHud({ back: false });
    Castle.guide.show();
    Castle.music.play();
    const st = Castle.state;
    root.style.background = '#5fbfff';
    root.appendChild(api.img('assets/castle/map-bg.png', { w: 640, h: 360, x: 0, y: 0, class: 'map-bg' }));
    const spotImgs = {};
    for (const id in SPOT_BOX) {
      const [bx, by, bw, bh] = SPOT_BOX[id];
      spotImgs[id] = api.img(`assets/castle/spot-${id}.png`, { w: bw, h: bh, x: bx, y: by, class: 'map-spot' });
      root.appendChild(spotImgs[id]);
    }
    root.appendChild(svg('<svg class="map-hot" viewBox="0 0 1280 720" width="1280" height="720">' +
      Object.keys(SPOT_POLYS).map(id => `<polygon class="hot" data-room="${id}" points="${SPOT_POLYS[id]}"/>`).join('') + '</svg>'));

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
        labels[id].classList.add('show'); spotImgs[id].classList.add('lit');
        if (lastHover !== id) { lastHover = id; api.sfx('click'); }
      });
      api.on(g, 'pointerleave', () => { labels[id].classList.remove('show'); spotImgs[id].classList.remove('lit'); });
      api.on(g, 'click', () => {
        if (id !== 'throne' && !Castle.rooms[id]) { api.say('That room is still being built!'); return; }
        api.sfx('pop');
        Castle.go(id);
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
    root.appendChild(api.img('assets/castle/title-bg.png', { w: 640, h: 360, x: 0, y: 0 }));

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

    api.say("Hi! I'm Pip, the little castle dragon! Pick a level, then tap Play!");
  });

  /* ------------------------------------------------------------------
     Throne room + finale
     ------------------------------------------------------------------ */
  // Socket centres in the 240x170 crown box
  const SOCKETS = [[42, 138], [74, 138], [106, 138], [140, 138], [172, 138], [204, 138]];
  function crownEl(filled) {
    const box = el('div', { class: 'crown-el' });
    SOCKETS.forEach(([x, y], i) => {
      const k = Castle.JEWEL_ORDER[i];
      if (!filled[k]) return;
      box.insertAdjacentHTML('beforeend', Castle.jewelSVG(k, 32).replace('style="', `style="left:${(x / 240 * 100).toFixed(2)}%;top:${(y / 170 * 100).toFixed(2)}%;`));
    });
    return box;
  }

  Castle.registerScene('throne', function (root, api) {
    Castle.setHud({ back: true });
    Castle.guide.show();
    Castle.music.play();
    const st = Castle.state;
    const KING = { who: 'King Rollo', pitch: 0.75, rate: 0.9 };

    root.appendChild(api.img('assets/castle/throne-bg.png', { w: 640, h: 360, x: 0, y: 0 }));

    const banners = el('div', { class: 'party-banners', html: `<svg viewBox="0 0 1280 220" width="1280" height="220">
      <path d="M0 30 Q320 140 640 40 Q960 140 1280 30" fill="none" stroke="${INK}" stroke-width="4"/>
      ${Array.from({ length: 20 }, (_, i) => {
        const x = 30 + i * 64, t = (x % 640) / 640, y = 30 + Math.sin(t * Math.PI) * 70 + 4;
        const c = ['#e8423f', '#ffc928', '#2f7fe0', '#3fb950', '#9b5de5'][i % 5];
        return `<path d="M${x - 20} ${y} h40 l-20 46 z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
      }).join('')}
    </svg>` });
    root.appendChild(banners);

    const king = el('div', { class: 'king pixel' });
    const kingS = api.sprite('assets/castle/king.png', { frame: [150, 190], blink: 'blink', anims: {
      idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 }, talk: { frames: [3, 0], fps: 7 } } });
    king.appendChild(kingS.el);
    root.appendChild(king);
    const crown = el('div', { class: 'crown-box float' });
    root.appendChild(crown);
    const placed = st.finale ? Object.assign({}, st.jewels) : {};
    const all = Castle.jewelCount() === 6;

    function placeOnHead(instant) {
      crown.classList.remove('float');
      if (instant) crown.style.transition = 'none';
      Object.assign(crown.style, { left: '565px', top: '92px', width: '150px', height: '106px' });
    }
    function drawCrown() { crown.replaceChildren(crownEl(placed)); }

    let talkTok = 0;
    async function kingSays(text) {
      const tok = ++talkTok;
      kingS.play('talk');
      await api.say(text, KING);
      if (tok === talkTok) kingS.play('idle');
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
