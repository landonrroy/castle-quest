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

  /* ------------------------------------------------------------------
     Pixel art (assets/kitchen/*.png, made with tools/pixelize.py)
     ------------------------------------------------------------------ */
  const IMG = 'assets/kitchen/';
  // ingredients.png: one 48x48 cell per ingredient, in KINDS order.
  function ingEl(kind, px, cls) {
    return Castle.sprite(IMG + 'ingredients.png', { frame: [48, 48], cols: KINDS.length, scale: px / 48, class: cls })
      .frame(KINDS.indexOf(kind)).el;
  }
  // basket.png: frame 0 = whole basket (behind the food), 1 = front wall (in front).
  function basketEl(f) {
    return Castle.sprite(IMG + 'basket.png', { frame: [60, 36], cols: 2, class: 'k-bk' }).frame(f).el;
  }
  // Mixed soup colors are snapped to the game palette so they sit in the art.
  function toPalette(hex) {
    const pal = Castle.PALETTE || [];
    if (!pal.length) return hex;
    const c = hexRgb(hex);
    let best = pal[0], bd = Infinity;
    pal.forEach(p => {
      const q = hexRgb(p), d = (q[0] - c[0]) ** 2 + (q[1] - c[1]) ** 2 + (q[2] - c[2]) ** 2;
      if (d < bd) { bd = d; best = p; }
    });
    return best;
  }

  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) {
    const A = hexRgb(a), B = hexRgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  /* ------------------------------------------------------------------
     Small code-drawn accents (card icon, hearts)
     ------------------------------------------------------------------ */
  const BOWL_ICON = `<svg viewBox="0 0 40 34" width="40" height="34">
    <path d="M14 10 Q10 5 14 1 M22 10 Q18 5 22 1" stroke="#9a8467" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M3 14 H37 Q36 32 20 32 Q4 32 3 14Z" fill="#2f7fe0" ${K} stroke-width="3"/>
    <ellipse cx="20" cy="14" rx="17" ry="4" fill="${BROTH}" ${K} stroke-width="3"/></svg>`;

  const HEART = `<svg viewBox="0 0 24 24" width="34" height="34"><path d="M12 21 C-4 10 3 -2 12 6 C21 -2 28 10 12 21Z" fill="#ff6fae" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></svg>`;

  /* ------------------------------------------------------------------
     Room CSS
     ------------------------------------------------------------------ */
  const CSS = `
.scene-kitchen { background:#c9b79c; }
.scene-kitchen .k-bg { position:absolute; left:0; top:0; pointer-events:none; }

.scene-kitchen .k-pan { position:absolute; top:24px; cursor:pointer; transform-origin:50% 0; }
.scene-kitchen .k-pan::before { content:''; position:absolute; inset:0 -10px; }
.scene-kitchen .k-pan:hover { filter:brightness(1.12); }
.scene-kitchen .k-pan.kit-swing { animation:kit-swing 1s steps(1,end); }
@keyframes kit-swing { 12% { transform:rotate(20deg); } 32% { transform:rotate(-15deg); } 52% { transform:rotate(9deg); } 72% { transform:rotate(-5deg); } 88% { transform:rotate(2deg); } }

.scene-kitchen .k-bird { position:absolute; left:934px; top:184px; cursor:pointer; }
.scene-kitchen .k-bird::before { content:''; position:absolute; inset:-16px; }
.scene-kitchen .k-bird.kit-hop { animation:kit-hop .6s steps(1,end); }
@keyframes kit-hop { 25% { transform:translateY(-16px); } 50% { transform:translateY(-24px); } 75% { transform:translateY(-8px); } }

.scene-kitchen .k-fire { position:absolute; left:440px; top:442px; cursor:pointer; }

.scene-kitchen .k-pot { position:absolute; left:430px; top:280px; width:320px; height:280px; cursor:pointer; transition:filter .2s; }
.scene-kitchen .k-pot .k-soup { position:absolute; border-radius:50%; transition:background .5s; }
.scene-kitchen .k-pot .k-potart { position:absolute; left:0; top:0; }
.scene-kitchen .k-pot .k-bub { position:absolute; pointer-events:none; }
.scene-kitchen .k-pot.plop { animation:kit-squish .45s steps(1,end); }
@keyframes kit-squish { 30% { transform:translateY(4px); } 65% { transform:translateY(-2px); } }
.scene-kitchen .k-pot.burp { animation:kit-burp .65s steps(1,end); }
@keyframes kit-burp { 20% { transform:translateY(-10px); } 50% { transform:translateY(4px); } 75% { transform:translateY(-2px); } }
.scene-kitchen .k-pot.hover { filter:drop-shadow(0 0 10px #fff59a) drop-shadow(0 0 24px #ffd23f); }
.scene-kitchen .k-pot.golden { filter:drop-shadow(0 0 14px #ffe066) drop-shadow(0 0 34px #ffb020); }

.scene-kitchen .k-steam { position:absolute; left:505px; top:240px; width:170px; height:120px; pointer-events:none; }
.scene-kitchen .k-puff { position:absolute; bottom:0; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.8); opacity:0; animation:kit-puff 3.4s ease-out infinite; }
@keyframes kit-puff { 0% { transform:translateY(0) scale(.35); opacity:0; } 20% { opacity:.85; } 100% { transform:translateY(-120px) scale(1.6); opacity:0; } }

.scene-kitchen .k-cat { position:absolute; left:236px; top:482px; cursor:pointer; transform-origin:50% 100%; }
.scene-kitchen .k-cc { position:absolute; left:780px; top:258px; cursor:pointer; transform-origin:50% 100%; }
.scene-kitchen .k-cc.nod { animation:kit-nod .55s steps(1,end); }
@keyframes kit-nod { 35% { transform:translateY(-12px); } 70% { transform:translateY(0); } }

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
.scene-kitchen .k-op { font-size:42px; font-weight:800; color:#2f7fe0; -webkit-text-stroke:2px ${INK}; paint-order:stroke fill; line-height:1; }

.scene-kitchen .k-slots { position:absolute; left:0; top:0; width:1280px; height:720px; pointer-events:none; }
.scene-kitchen .k-slot { position:absolute; width:120px; height:120px; pointer-events:none; }
.scene-kitchen .k-slot .k-bk { position:absolute; left:0; top:48px; pointer-events:none; }
.scene-kitchen .k-item { position:absolute; left:12px; top:0; width:96px; height:96px; pointer-events:auto; }
.scene-kitchen .k-iart { transform-origin:50% 85%; }
.scene-kitchen .k-item:hover .k-iart { transform:translateY(-4px); }
.scene-kitchen .k-iart.k-pop { animation:kit-pop .5s steps(4,end) both; }
@keyframes kit-pop { 0% { transform:translateY(40px) scale(.3); } 100% { transform:none; } }
.scene-kitchen .k-item.glow .k-iart { animation:kit-hintbob .9s steps(2,end) infinite; }
@keyframes kit-hintbob { 50% { transform:translateY(-10px); } }

.scene-kitchen .k-fly { position:absolute; width:96px; height:96px; z-index:30; pointer-events:none; }
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
      // Soup hole in pot.png, in stage px relative to the pot box (art px x 2,
      // from "pixelize ... --hole").
      const SOUP_BOX = { x: 64, y: 58, w: 192, h: 74 };
      const SOUP = { x: 430 + SOUP_BOX.x + SOUP_BOX.w / 2, y: 280 + SOUP_BOX.y + SOUP_BOX.h / 2 };
      const CC_HEAD = { x: 900, y: 400 };

      let rounds = [], roundIdx = 0, cur = null;
      let accepting = false, introCut = false, talkTok = 0;
      let slots = [], soupMix = BROTH, soupColor = toPalette(BROTH);

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
        if (ccS.anim !== 'taste' && ccS.anim !== 'yum') ccS.play('talk');
        return api.say(text, VOICE).then(() => { if (my === talkTok && ccS.anim === 'talk') ccS.play('idle'); });
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
      root.appendChild(api.img(IMG + 'bg.png', { w: 640, h: 360, x: 0, y: 0, class: 'k-bg' }));

      // hanging pans that clang (pans.png: one frame per pan)
      [{ x: 525, note: 'E5' }, { x: 590, note: 'G5' }, { x: 655, note: 'C6' }].forEach((p, i) => {
        const pan = Castle.sprite(IMG + 'pans.png', { frame: [36, 46], cols: 3, class: 'k-pan pixel' }).frame(i).el;
        pan.style.left = (p.x - 36) + 'px';
        api.on(pan, 'click', () => {
          api.note(p.note, 1.1, 'bell');
          api.note(p.note, 0.25, 'pluck');
          retrigger(pan, 'kit-swing', 1000);
        });
        root.appendChild(pan);
      });

      // bluebird on the window sill
      const birdS = api.sprite(IMG + 'bird.png', {
        frame: [40, 34], class: 'k-bird pixel',
        anims: { idle: { frames: [0, 0, 0, 0, 0, 0, 0, 1], fps: 4 }, hop: { frames: [2, 3, 4], fps: 8 } },
      });
      const bird = birdS.el;
      api.on(bird, 'click', () => {
        ['A6', 'C7', 'A6', 'E7'].forEach((n, i) => api.setTimeout(() => api.note(n, 0.12, 'flute'), i * 110));
        retrigger(bird, 'kit-hop', 600);
        birdS.play('hop', { once: true, then: 'idle' });
      });
      root.appendChild(bird);

      // fire (behind the pot)
      const fireS = api.sprite(IMG + 'fire.png', { frame: [150, 75], class: 'k-fire', anims: { idle: { frames: [0, 1, 2, 3], fps: 8 } } });
      const fire = fireS.el;
      root.appendChild(fire);

      // cauldron: a palette-colored soup ellipse shows through the hole in pot.png
      const pot = api.el('div', { class: 'k-pot pixel' });
      const soupEl = api.el('div', { class: 'k-soup', style: {
        left: SOUP_BOX.x + 'px', top: SOUP_BOX.y + 'px', width: SOUP_BOX.w + 'px', height: SOUP_BOX.h + 'px', background: soupColor,
      } });
      const potS = api.sprite(IMG + 'pot.png', { frame: [160, 140], class: 'k-potart', anims: { idle: [0], burp: { frames: [1, 1, 1, 1], fps: 6 } } });
      pot.append(soupEl, potS.el);
      [0.3, 0.55, 0.75].forEach((fx, i) => {
        const b = api.sprite(IMG + 'bubble.png', { frame: [16, 16], class: 'k-bub', anims: { pop: { frames: [0, 1, 2], fps: 4 } } });
        b.el.style.left = 2 * Math.round((SOUP_BOX.x + SOUP_BOX.w * fx - 16) / 2) + 'px';
        b.el.style.top = 2 * Math.round((SOUP_BOX.y + SOUP_BOX.h / 2 - 24) / 2) + 'px';
        b.el.style.visibility = 'hidden';
        pot.appendChild(b.el);
        const loop = () => {
          b.el.style.visibility = 'visible';
          b.play('pop', { once: true }).then(() => {
            b.el.style.visibility = 'hidden';
            api.setTimeout(loop, 400 + i * 300 + api.rand(900));
          });
        };
        api.setTimeout(loop, i * 600);
      });
      root.appendChild(pot);

      // steam
      const steam = api.el('div', { class: 'k-steam' });
      [[18, 0], [62, -0.85], [104, -1.7], [130, -2.55]].forEach(([x, d]) => {
        steam.appendChild(api.el('span', { class: 'k-puff', style: { left: x + 'px', animationDelay: d + 's' } }));
      });
      root.appendChild(steam);

      // cat by the fire
      const catS = api.sprite(IMG + 'cat.png', {
        frame: [64, 56], class: 'k-cat pixel',
        anims: { idle: { frames: [0, 1], fps: 2 }, react: { frames: [2, 3, 4], fps: 6 } },
      });
      const cat = catS.el;
      root.appendChild(cat);

      // Cook Clementine
      const ccS = api.sprite(IMG + 'clementine.png', {
        frame: [120, 200], class: 'k-cc pixel', blink: 'blink',
        anims: {
          idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 }, talk: { frames: [3, 0], fps: 7 },
          wave: { frames: [4, 5, 4, 5], fps: 5 }, taste: [6], yum: [7],
        },
      });
      const cc = ccS.el;
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
        fireS.play('idle', { fps: 18 });
        api.setTimeout(() => fireS.play('idle', { fps: 8 }), 850);
        api.sparkle(590, 500, 16);
        api.setTimeout(() => retrigger(cat, 'bounce', 650), 120);
      });
      api.on(cat, 'click', () => {
        meow();
        catS.play('react', { once: true, then: 'idle' });
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
        else if (ccS.anim === 'idle') ccS.play('wave', { once: true, then: 'idle' });
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
              for (let i = 0; i < n; i++) g.appendChild(ingEl(l.kind, 34));
              return g;
            };
            row.append(grp(l.add[0]), api.el('div', { class: 'k-op', text: '+' }), grp(l.add[1]), api.el('div', { class: 'k-op', text: '=' }));
            l.tally = api.el('div', { class: 'k-tally', text: '?' });
            row.appendChild(l.tally);
          } else {
            row.appendChild(api.el('div', { class: 'k-ico' }, ingEl(l.kind, 72)));
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
        const item = api.el('div', { class: 'k-item pixel', 'aria-label': ING[kind].one }, ingEl(kind, 96, 'k-iart pixel'));
        slot.append(basketEl(0), item, basketEl(1));
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
        const f = api.el('div', { class: 'k-fly', style: { left: (from.x - 48) + 'px', top: (from.y - 48) + 'px' } }, ingEl(kind, 96));
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
        soupMix = mix(soupMix, ING[line.kind].soup, 0.35);   // mix unsnapped so colors keep drifting
        soupColor = toPalette(soupMix);
        soupEl.style.background = soupColor;
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
          potS.play('burp', { once: true, then: 'idle' });
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
        soupMix = BROTH;
        soupColor = toPalette(BROTH);
        soupEl.style.background = soupColor;
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
        soupEl.style.background = toPalette(GOLD);
        api.sfx('sparkle');
        api.sparkle(SOUP.x, SOUP.y - 10, 28);
        await api.wait(700);
        ccS.play('taste');
        await api.wait(600);
        ccS.play('yum');
        api.note('G5', 0.12, 'sine');
        api.setTimeout(() => api.note('C6', 0.25, 'sine'), 130);
        heart(CC_HEAD.x - 30, CC_HEAD.y - 40);
        api.setTimeout(() => heart(CC_HEAD.x + 30, CC_HEAD.y - 70), 250);
        api.sfx('correct');
        await cSay(api.pick(['Mmm... Yum!', 'Yum, yum, yum!', 'Mmm! So yummy!']));
        api.celebrate(SOUP.x, SOUP.y - 60, 70);
        dots[roundIdx].classList.add('done');
        await api.wait(900);
        ccS.play('idle');
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
