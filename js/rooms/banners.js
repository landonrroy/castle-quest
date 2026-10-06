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

  const LAYOUT = {
    1: { s: 50, pts: [[50, 60]] },
    2: { s: 36, pts: [[50, 40], [50, 82]] },
    3: { s: 32, pts: [[31, 42], [69, 42], [50, 82]] },
    4: { s: 30, pts: [[31, 40], [69, 40], [31, 80], [69, 80]] },
    5: { s: 27, pts: [[30, 36], [70, 36], [50, 62], [30, 88], [70, 88]] },
    6: { s: 24, pts: [[31, 34], [69, 34], [31, 62], [69, 62], [31, 90], [69, 90]] },
  };
  function needleSVG() {
    return `<svg viewBox="0 0 70 30" width="70" height="30">
      <path d="M58 7 C66 2 70 12 64 20 C60 26 52 24 50 28" stroke="#e8423f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M4 26 L60 6" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M4 26 L60 6" stroke="#e6eef5" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  function flagEl(item) { return pennant(item.c, item); }
  function slotEl() { return pennant(7, null); }
  function pennant(frame, item) {
    const box = document.createElement('div');
    box.className = 'bh-flagart';
    const pen = Castle.sprite('assets/banners/pennants.png', { frame: [50, 70], cols: 8, class: 'bh-pen' }).frame(frame).el;
    pen.style.backgroundPosition = (frame / 7 * 100) + '% 0';
    box.appendChild(pen);
    if (item && item.s) {
      const n = item.n || 1, L = LAYOUT[n] || LAYOUT[1], cell = (n - 1) * 6 + SYMBOLS.indexOf(item.s);
      L.pts.forEach(([x, y]) => {
        const sym = Castle.sprite('assets/banners/symbols.png', { frame: [25, 25], cols: 36, class: 'bh-sym' }).frame(cell).el;
        sym.style.backgroundPosition = (cell / 35 * 100) + '% 0';
        sym.style.left = x + '%';
        sym.style.top = (y / 140 * 100) + '%';
        box.appendChild(sym);
      });
    }
    return box;
  }

  const CSS = `
  .scene-banners { background: #cdb796; }
  .scene-banners .bh-bg { position: absolute; left: 0; top: 0; pointer-events: none; }

  .scene-banners .bh-x { position: absolute; cursor: pointer; }
  .scene-banners .bh-x > .sprite { position: absolute; left: 0; top: 0; }

  /* flag art */
  .scene-banners .bh-flagart { position: relative; width: 100%; height: 100%; }
  .scene-banners .bh-pen { position: absolute; left: 0; top: 0; width: 100% !important; height: 100% !important; background-size: 800% 100% !important; }
  .scene-banners .bh-sym { position: absolute; width: 50% !important; height: 35.714% !important; background-size: 3600% 100% !important; transform: translate(-50%, -50%); }

  /* chandelier */
  .scene-banners .bh-chand { left: 520px; top: 0; width: 240px; height: 170px; }
  .scene-banners .bh-chand.flare > .sprite { animation: bh-flare .5s steps(1, end) infinite; }
  @keyframes bh-flare { 0% { filter: brightness(1.35) drop-shadow(0 0 10px #fff3a0); } 50% { filter: brightness(1.7) drop-shadow(0 0 20px #ffc928); } }

  /* armor */
  .scene-banners .bh-armor { left: 28px; top: 252px; width: 140px; height: 300px; transform-origin: 50% 100%; }
  .scene-banners .bh-armor.wiggle { animation: wiggle .55s steps(1, end); }

  /* dog */
  .scene-banners .bh-dog { left: 900px; top: 640px; width: 150px; height: 80px; }
  .scene-banners .bh-woof { position: absolute; z-index: 6; pointer-events: none; font: 800 32px ${FONT}; color: #fff;
    -webkit-text-stroke: 2px ${INK}; paint-order: stroke fill; text-shadow: 0 3px 0 ${INK}; animation: bh-woof 1.1s steps(6, end) forwards; }
  @keyframes bh-woof { from { transform: translateY(10px) scale(.4); opacity: 0; } 25% { transform: translateY(-8px) scale(1.15); opacity: 1; } 75% { opacity: 1; } to { transform: translateY(-40px) scale(1); opacity: 0; } }

  /* mouse */
  .scene-banners .bh-mouse { left: 166px; top: 452px; width: 92px; height: 96px; }
  .scene-banners .bh-mhole { position: absolute; left: 10px; top: 34px; width: 72px; height: 62px; overflow: hidden; border-radius: 36px 36px 0 0; }
  .scene-banners .bh-mhole > .sprite { position: absolute; left: -4px; top: 8px; transform: translateY(66px); transition: transform .3s steps(4, end); }
  .scene-banners .bh-mouse.out .bh-mhole > .sprite { transform: translateY(0); }

  /* basket */
  .scene-banners .bh-basket { left: 1150px; top: 640px; width: 120px; height: 80px; }
  .scene-banners .bh-basket.bounce { animation: bounce .6s steps(1, end); }

  /* Lady Lark */
  .scene-banners .bh-lark { left: 1068px; top: 318px; width: 200px; height: 400px; }
  .scene-banners .bh-lark.hop { animation: bh-hop .5s steps(1, end); }
  @keyframes bh-hop { 40% { transform: translateY(-18px); } }

  /* garlands */
  .scene-banners .bh-garland { position: absolute; left: 0; top: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 2; transform-origin: 640px 150px; }
  .scene-banners .bh-rope { position: absolute; left: 0; top: 0; }
  .scene-banners .bh-flag { position: absolute; width: 100px; height: 140px; pointer-events: auto; cursor: pointer; }
  .scene-banners .bh-flag.drop { animation: bh-drop .7s cubic-bezier(.3,1.4,.5,1) both; }
  @keyframes bh-drop { from { transform: translateY(-260px); opacity: 0; } 40% { opacity: 1; } }
  .scene-banners .bh-fin { width: 100%; height: 100%; transform-origin: 50% 7%; animation: bh-sway 2.6s steps(4, end) infinite alternate; }
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
  .scene-banners .bh-cin { width: 100%; height: 100%; transform-origin: 50% 7%; animation: bh-sway 2.2s steps(4, end) infinite alternate; transition: opacity .3s, filter .3s; }
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
      root.appendChild(api.img('assets/banners/bg.png', { w: 640, h: 360, x: 0, y: 0, class: 'bh-bg' }));

      /* ---------- Lady Lark + speech ---------- */
      const lark = api.el('div', { class: 'bh-x bh-lark pixel' });
      const larkS = api.sprite('assets/banners/lark.png', { frame: [100, 200], blink: 'blink', anims: {
        idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 }, talk: { frames: [3, 0], fps: 7 } } });
      lark.appendChild(larkS.el);
      let talkTok = 0;
      function larkSay(text) {
        const tok = ++talkTok;
        larkS.play('talk');
        return api.say(text, { who: 'Lady Lark', pitch: 1.4, rate: 0.95 }).then(() => {
          if (tok === talkTok) larkS.play('idle');
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
      const propEl = (cls, spr) => api.el('div', { class: 'bh-x pixel ' + cls }, spr.el);
      const chand = propEl('bh-chand', Castle.sprite('assets/banners/chand.png', { frame: [120, 85] }));
      const armorS = Castle.sprite('assets/banners/armor.png', { frame: [70, 150], cols: 2 });
      const armor = propEl('bh-armor', armorS);
      const mouse = api.el('div', { class: 'bh-x pixel bh-mouse' }, api.el('div', { class: 'bh-mhole' }, Castle.sprite('assets/banners/mouse.png', { frame: [40, 26] }).el));
      const dogS = Castle.sprite('assets/banners/dog.png', { frame: [75, 40], cols: 2 });
      const dog = propEl('bh-dog', dogS);
      const basket = propEl('bh-basket', Castle.sprite('assets/banners/basket.png', { frame: [60, 40] }));
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
        retrigger(armor, 'wiggle', 550);
        armor.classList.add('open'); armorS.frame(1);
        api.setTimeout(() => { if (armor.classList.contains('open')) api.sfx('giggle'); }, 450);
        if (visorT) clearTimeout(visorT);
        visorT = api.setTimeout(() => { armor.classList.remove('open'); armorS.frame(0); api.sfx('click'); }, 2200);
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
        dog.classList.add('happy'); dogS.frame(1);
        if (dogT) clearTimeout(dogT);
        dogT = api.setTimeout(() => { dog.classList.remove('happy'); dogS.frame(0); }, 1600);
        const woof = api.el('div', { class: 'bh-woof', text: 'Woof!', style: { left: '990px', top: '596px' } });
        root.appendChild(woof);
        api.setTimeout(() => woof.remove(), 1150);
      });

      api.on(basket, 'click', () => {
        api.sfx('pop');
        retrigger(basket, 'bounce', 600);
        ['G5', 'B5', 'D6'].forEach((n, i) => api.setTimeout(() => api.note(n, 0.25, 'pluck'), i * 110));
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
            class: 'bh-fin',
            style: { animationDelay: (-Math.random() * 2.6).toFixed(2) + 's', animationDuration: (2.3 + Math.random() * 0.7).toFixed(2) + 's' },
          });
          const flag = api.el('div', {
            class: 'bh-flag drop' + (isSlot ? ' bh-slot' : ''),
            style: { left: (cx - 50) + 'px', top: (ropeY(cx) - 10) + 'px', animationDelay: (i * 70) + 'ms' },
          }, fin);
          gEl.appendChild(flag);
          fin.appendChild(isSlot ? slotEl() : flagEl(P.seq[i]));
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
          const cin = api.el('div', { class: 'bh-cin', style: { animationDelay: (-Math.random() * 2).toFixed(2) + 's' } });
          cin.appendChild(flagEl(ch.item));
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
        slotFin.replaceChildren(flagEl(R.P.answer));
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
