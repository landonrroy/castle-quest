/* =====================================================================
   Castle Quest — Wizard's Tower (memory matching)
   Wizard Wendell's spell cards got mixed up. Flip two cards; matching
   pairs float up, puff into magic and fill his potion flask.
   ===================================================================== */
(function () {
  'use strict';

  const INK = '#3a2a1a';

  /* Card pictures live in assets/wizard/items.png, in this order. */
  const ITEMS = [
    { key: 'owl', name: 'Owl', plural: 'owls', word: 'OWL', tint: '#ffe3c2' },
    { key: 'frog', name: 'Frog', plural: 'frogs', word: 'FROG', tint: '#d7f5c4' },
    { key: 'crown', name: 'Crown', plural: 'crowns', word: 'CROWN', tint: '#fff0b3' },
    { key: 'moon', name: 'Moon', plural: 'moons', word: 'MOON', tint: '#d9d4ff' },
    { key: 'star', name: 'Star', plural: 'stars', word: 'STAR', tint: '#ffe0f0' },
    { key: 'potion', name: 'Potion', plural: 'potions', word: 'POTION', tint: '#dff3ff' },
    { key: 'cat', name: 'Cat', plural: 'cats', word: 'CAT', tint: '#ffe0c7' },
    { key: 'egg', name: 'Dragon egg', plural: 'dragon eggs', word: 'DRAGON EGG', tint: '#e6ffd6' },
    { key: 'book', name: 'Spell book', plural: 'spell books', word: 'SPELL BOOK', tint: '#efe3ff' },
    { key: 'mushroom', name: 'Mushroom', plural: 'mushrooms', word: 'MUSHROOM', tint: '#ffe0e0' },
    { key: 'castle', name: 'Castle', plural: 'castles', word: 'CASTLE', tint: '#dcefff' },
    { key: 'wand', name: 'Wand', plural: 'wands', word: 'WAND', tint: '#f3e6ff' },
  ];

  const FLASK_EMPTY = 292, FLASK_FULL = 104;

  /* ------------------------------------------------------------------
     Room CSS
     ------------------------------------------------------------------ */
  const CSS = `
  .scene-wizard { background: #2e2160; }
  .scene-wizard .wz-bg { position: absolute; left: 0; top: 0; pointer-events: none; }
  .scene-wizard .wz-abs { position: absolute; }
  .scene-wizard .wz-tap { cursor: pointer; }
  .scene-wizard .wz-tap:hover { filter: brightness(1.08) drop-shadow(0 0 8px rgba(255,240,160,.75)); }
  .scene-wizard .wz-flask:hover { filter: none; }
  .scene-wizard .wz-flask:hover > .sprite { filter: brightness(1.08) drop-shadow(0 0 8px rgba(255,240,160,.75)); }
  .scene-wizard .wz-window, .scene-wizard .wz-scope, .scene-wizard .wz-book,
  .scene-wizard .wz-ball, .scene-wizard .wz-owl { z-index: 4; }
  .scene-wizard .wz-wendell, .scene-wizard .wz-flask, .scene-wizard .wz-cauldron { z-index: 6; }

  /* window + shooting star */
  .scene-wizard .wz-window { overflow: hidden; border-radius: 50%; }
  .scene-wizard .wz-window.zap { animation: wz-flash 1.6s steps(1, end); }
  @keyframes wz-flash { 0%, 30%, 60% { filter: brightness(1.5); } 15%, 45%, 75%, 100% { filter: none; } }
  .scene-wizard .wz-shoot { position: absolute; left: 30px; top: 36px; width: 8px; height: 8px; opacity: 0;
    background: #fff59a; box-shadow: -8px -4px 0 #fff, -16px -8px 0 rgba(255,255,255,.6); }
  .scene-wizard .wz-shoot.go { animation: wz-shoot 1s steps(8, end) forwards; }
  @keyframes wz-shoot { 0% { opacity: 0; transform: translate(0, 0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(40px, 22px); } }

  /* floating books */
  .scene-wizard .wz-book { animation: wz-bob 3.2s steps(4, end) infinite; }
  @keyframes wz-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .scene-wizard .wz-book.wiggle { animation: wiggle .5s steps(1, end); }

  /* crystal ball */
  .scene-wizard .wz-ball.zap { animation: wz-hue 1.5s steps(6, end); }
  @keyframes wz-hue { 50% { filter: hue-rotate(180deg) brightness(1.2) drop-shadow(0 0 18px #d6b3ff); } }

  /* Wizard Wendell */
  .scene-wizard .wz-wendell.hop { animation: bounce .6s steps(1, end); }

  /* cauldron */
  .scene-wizard .wz-cauldron { --brew: #7ee05a; width: 160px; height: 160px; }
  .scene-wizard .wz-cauldron > .sprite, .scene-wizard .wz-cauldron > .wz-brew { position: absolute; }
  .scene-wizard .wz-brew { left: 32px; top: 29px; width: 96px; height: 37px; border-radius: 50%; background: var(--brew); transition: background .5s; }

  /* potion flask (progress) */
  .scene-wizard .wz-flask { --potion: #ff6fae; width: 190px; height: 300px; }
  .scene-wizard .wz-flask > .sprite { position: absolute; left: 0; top: 0; transition: filter .6s; }
  .scene-wizard .wz-lqmask { position: absolute; inset: 0; overflow: hidden;
    -webkit-mask: url(assets/wizard/flask-mask.png) 0 0/190px 300px no-repeat; mask: url(assets/wizard/flask-mask.png) 0 0/190px 300px no-repeat; }
  .scene-wizard .wz-lq { position: absolute; left: 0; top: 0; width: 190px; height: 300px; background: var(--potion);
    transition: transform 1.1s cubic-bezier(.3,1.25,.5,1), background .9s; }
  .scene-wizard .wz-flask.full > .sprite { filter: drop-shadow(0 0 16px var(--potion)); }
  .scene-wizard .wz-flask.glug { animation: bounce .5s steps(1, end); }

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
  .scene-wizard .wz-back { background: url(assets/wizard/cardback.png) 0 0/100% 100% no-repeat; image-rendering: pixelated; }
  .scene-wizard .wz-front { transform: rotateY(180deg); background: radial-gradient(circle at 50% 50%, var(--tint, #fff0b3) 0 46%, #fffaf0 47%); }
  .scene-wizard .wz-front .wz-pic { display: block; flex: none; }
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
  const WAND = { x: 8 + 208, y: 176 + 104 };            // Wendell's wand tip in stage px

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
      root.appendChild(api.img('assets/wizard/bg.png', { w: 640, h: 360, x: 0, y: 0, class: 'wz-bg' }));

      for (let i = 0; i < 12; i++) {
        root.appendChild(api.el('div', { class: 'wz-mote', style: {
          left: (270 + Math.random() * 740) + 'px', top: (160 + Math.random() * 420) + 'px',
          animationDelay: (-Math.random() * 8).toFixed(2) + 's', animationDuration: (7 + Math.random() * 4).toFixed(2) + 's',
        } }));
      }

      // A tappable pixel prop: spr is a sprite (or a plain element) placed at x/y in stage px.
      function pprop(cls, x, y, spr) {
        const d = spr.el || spr;
        d.className += ' wz-abs wz-tap pixel ' + cls;
        d.style.left = x + 'px';
        d.style.top = y + 'px';
        root.appendChild(d);
        return d;
      }
      // Top band between the title (x 118–420) and the HUD tray (x > 740); everything ends above y 112.
      const scopeEl = pprop('wz-scope', 428, -4, Castle.sprite('assets/wizard/scope.png', { frame: [50, 56] }));
      const shootEl = api.el('div', { class: 'wz-shoot' });
      const winEl = pprop('wz-window', 530, 0, Castle.sprite('assets/wizard/window.png', { frame: [54, 54] }));
      winEl.appendChild(shootEl);
      const bookSpr = i => Castle.sprite('assets/wizard/books.png', { frame: [42, 34], cols: 2 }).frame(i);
      const book1 = pprop('wz-book', 644, 16, bookSpr(0));
      // Second book floats below the back button, above Wendell's hat.
      const book2 = pprop('wz-book', 14, 114, bookSpr(1));
      book2.style.animationDelay = '-1.5s';
      const ballEl = pprop('wz-ball', 1028, 100, Castle.sprite('assets/wizard/ball.png', { frame: [55, 61] }));
      const owlEl = pprop('wz-owl', 1150, 94, api.sprite('assets/wizard/owl.png', { frame: [60, 76], blink: 'blink',
        anims: { idle: [0], blink: { frames: [1], fps: 5 } } }));

      // Flask: potion liquid (masked to the glass shape) under the glass sprite.
      const lq = api.el('div', { class: 'wz-lq' });
      const flaskBox = api.el('div', {}, [api.el('div', { class: 'wz-lqmask' }, [lq])]);
      flaskBox.appendChild(Castle.sprite('assets/wizard/flask.png', { frame: [95, 150] }).el);
      const flaskEl = pprop('wz-flask', 1066, 238, flaskBox);

      // Cauldron: fire, brew colour, then the pot on top.
      const cauldEl = pprop('wz-cauldron', 1040, 548, api.el('div', {}));
      const fireS = api.sprite('assets/kitchen/fire.png', { frame: [150, 75], scale: 1, anims: { idle: { frames: [0, 1, 2, 3], fps: 8 } } });
      fireS.el.style.left = '5px'; fireS.el.style.top = '85px';
      const brewEl = api.el('div', { class: 'wz-brew' });
      const potS = api.sprite('assets/kitchen/pot.png', { frame: [160, 140], scale: 1, anims: { idle: [0], burp: { frames: [1, 1, 1], fps: 6 } } });
      potS.el.style.left = '0'; potS.el.style.top = '0';
      cauldEl.appendChild(fireS.el); cauldEl.appendChild(brewEl); cauldEl.appendChild(potS.el);

      const wS = api.sprite('assets/wizard/wendell.png', { frame: [120, 186], blink: 'blink', anims: {
        idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 },
        talk: { frames: [3, 0], fps: 7 }, cast: { frames: [4, 5, 4], fps: 4 } } });
      const wendell = pprop('wz-wendell', 8, 176, wS);

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

      let wTalking = false, wCasting = false, castTok = 0;
      function wendellPose() { wS.play(wCasting ? 'cast' : wTalking ? 'talk' : 'idle'); }
      function wcast() {
        const t = ++castTok;
        wCasting = true;
        wendellPose();
        api.setTimeout(() => { if (t === castTok) { wCasting = false; wendellPose(); } }, 950);
      }

      let talkTok = 0, chainTok = 0;
      function wsay(text, o) {
        const t = ++talkTok;
        wTalking = true;
        wendellPose();
        const p = api.say(text, Object.assign({}, WHO, o || {}));
        p.then(() => { if (t === talkTok) { wTalking = false; wendellPose(); } });
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
      function setLevel(f) { lq.style.transform = `translateY(${FLASK_EMPTY - f * (FLASK_EMPTY - FLASK_FULL)}px)`; }
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
        const front = api.el('div');
        if (kind === 'word') {
          front.className = 'wz-face wz-front word';
          front.innerHTML = `<div class="wz-word" style="font-size:${wordSize(item.word, w)}px">${item.word.split(' ').join('<br>')}</div>`;
        } else {
          front.className = 'wz-face wz-front';
          front.style.setProperty('--tint', item.tint);
          const idx = ITEMS.indexOf(item), px = Math.round(w * 0.86);
          front.appendChild(Castle.sprite('assets/wizard/items.png', { frame: [48, 48], cols: 12, scale: px / 48, class: 'wz-pic' }).frame(idx).el);
        }
        const node = api.el('div', {
          class: 'wz-card',
          'data-key': item.key,
          style: { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' },
          html: `<div class="wz-lift" style="--tilt:${(Math.random() * 5 - 2.5).toFixed(1)}deg"><div class="wz-inner"><div class="wz-face wz-back"></div></div></div>`,
        });
        node.querySelector('.wz-inner').appendChild(front);
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
          wcast();
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
        wcast();
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
        wcast();
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
        wcast();
        api.sfx('sparkle');
        api.sparkle(WAND.x, WAND.y, 12);
        speak(api.pick(WENDELL_LINES));
      });
      api.on(owlEl, 'click', () => {
        retrigger(owlEl, 'bounce', 650);
        api.note('G4', 0.3, 'flute');
        api.setTimeout(() => api.note('E4', 0.55, 'flute'), 330);
      });
      api.on(winEl, 'click', () => {
        retrigger(winEl, 'zap', 1600);
        shootStar();
        ['C6', 'E6', 'G6', 'C7'].forEach((n, i) => api.setTimeout(() => api.note(n, 0.5, 'bell'), i * 110));
      });
      api.on(scopeEl, 'click', () => {
        retrigger(scopeEl, 'wiggle', 550);
        api.sfx('whoosh');
        api.setTimeout(() => { shootStar(); api.sfx('sparkle'); }, 300);
      });
      [book1, book2].forEach(b => api.on(b, 'click', () => {
        retrigger(b, 'wiggle', 550);
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
        potS.play('burp', { once: true, then: 'idle' });
        api.sfx('splash');
        api.setTimeout(() => api.sfx('pop'), 220);
        api.sparkle(1040 + 80, 548 + 50, 12);
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
