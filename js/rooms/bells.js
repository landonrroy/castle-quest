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
    1: { n: 3, lens: [2, 3, 3], gap: 720 },
    2: { n: 4, lens: [3, 4, 5], gap: 620 },
    3: { n: 5, lens: [4, 5, 6], gap: 540 },
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
  const BW = 150, BH = 176;   // bell sprite: 75x88 art px at 2x

  /* ------------------------------------------------------------------ */
  const CSS = `
  .scene-bells { background: #8fd3ff; }
  .scene-bells .room-title, .scene-bells .round-dots { left: 470px; }
  .scene-bells .bl-bg { position: absolute; left: 0; top: 0; pointer-events: none; }

  /* drifting cloud */
  .scene-bells .bl-cloud { position: absolute; left: 0; top: 36px; width: 200px; height: 120px; z-index: 3;
    cursor: pointer; animation: bells-drift 90s linear infinite; animation-delay: -38s; }
  @keyframes bells-drift { from { transform: translateX(-240px); } to { transform: translateX(1320px); } }
  .scene-bells .bl-cloud { transform-origin: 50% 80%; }
  .scene-bells .bl-cloud.puff { animation: bells-drift 90s linear infinite, bells-puff .6s steps(1, end); animation-delay: -38s, 0s; }
  @keyframes bells-puff { 30% { scale: 1.25 .8; } 60% { scale: .9 1.15; } }

  /* weather vane */
  .scene-bells .bl-vane { position: absolute; left: 115px; top: 28px; z-index: 8; cursor: pointer; }

  /* pigeons */
  .scene-bells .bl-pigeon { position: absolute; width: 92px; height: 80px; z-index: 9; cursor: pointer; }
  .scene-bells .bl-pigeon.flying { pointer-events: none; }
  .scene-bells .bl-pg.flip { transform: scaleX(-1); }
  .scene-bells .bl-pigeon.coo { animation: bells-coo .5s steps(1, end); }
  @keyframes bells-coo { 30% { transform: scale(1.08, .92); } 60% { transform: scale(.96, 1.06); } }

  /* bells */
  .scene-bells .bell-wrap { position: absolute; transform-origin: 50% 0; z-index: 10; cursor: pointer;
    touch-action: manipulation; }
  .scene-bells .bell-wrap.ring { z-index: 12; }
  .scene-bells .bell-swing { position: absolute; inset: 0; transform-origin: 50% 0; }
  .scene-bells .ring > .bell-swing { animation: bells-swing .75s steps(1, end); }
  @keyframes bells-swing { 0% { transform: rotate(0); } 14% { transform: rotate(11deg); } 38% { transform: rotate(-9deg); }
    62% { transform: rotate(5deg); } 84% { transform: rotate(-2deg); } 100% { transform: rotate(0); } }
  .scene-bells .bell-rope { position: absolute; left: 50%; top: -4px; width: 12px; margin-left: -6px;
    border: 3px solid ${INK}; border-radius: 5px;
    background: repeating-linear-gradient(-45deg, #e9c98a 0 5px, #b98a45 5px 9px); }
  .scene-bells .bell-box { position: absolute; left: 0; bottom: 0; width: 100%; transform-origin: 50% 0; transition: transform .1s; }
  .scene-bells .bell-wrap:active .bell-box { transform: scale(.96); }
  .scene-bells .bell-spr { position: absolute; left: 0; top: 0; transition: filter .15s; }
  .scene-bells .ring .bell-spr { filter: brightness(1.12) drop-shadow(0 0 10px #fff59a) drop-shadow(0 0 22px #ffd23f); }
  .scene-bells .bell-halo { position: absolute; left: -30%; top: -20%; width: 160%; height: 135%; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,252,200,.95) 0%, rgba(255,226,90,.6) 38%, rgba(255,226,90,0) 68%);
    opacity: 0; pointer-events: none; }
  .scene-bells .ring .bell-halo { animation: bells-halo .75s ease-out; }
  @keyframes bells-halo { 0% { opacity: 0; transform: scale(.6); } 20% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0; transform: scale(1.25); } }
  .scene-bells .hint .bell-spr { animation: bells-hint 1s ease-in-out infinite; }
  .scene-bells .hint .bell-halo { animation: bells-hint-halo 1s ease-in-out infinite; }
  @keyframes bells-hint { 0%, 100% { filter: drop-shadow(0 0 6px #fff59a) drop-shadow(0 0 12px #ffd23f); }
    50% { filter: brightness(1.12) drop-shadow(0 0 14px #fff59a) drop-shadow(0 0 30px #ffd23f); } }
  @keyframes bells-hint-halo { 0%, 100% { opacity: .25; } 50% { opacity: .75; } }
  .scene-bells .oops .bell-box { animation: bells-oops .5s steps(1, end); }
  @keyframes bells-oops { 20% { transform: translateX(-9px) rotate(-3deg); } 40% { transform: translateX(9px) rotate(3deg); }
    60% { transform: translateX(-5px); } 80% { transform: translateX(4px); } }

  /* Bram the owl */
  .scene-bells .bl-bram { position: absolute; left: 1078px; top: 335px; z-index: 14; cursor: pointer; }

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
      root.appendChild(api.img('assets/bells/bg.png', { w: 640, h: 360, x: 0, y: 0, class: 'bl-bg' }));

      /* ---------- drifting cloud ---------- */
      const cloud = api.sprite('assets/bells/cloud.png', { frame: [100, 60], class: 'bl-cloud pixel' }).el;
      root.appendChild(cloud);
      api.on(cloud, 'pointerdown', () => {
        if (phase !== 'demo') api.sfx('pop');
        restartClass(cloud, 'puff', 650);
      });

      /* ---------- weather vane ---------- */
      const vaneS = api.sprite('assets/bells/vane.png', { frame: [50, 62], class: 'bl-vane', anims: {
        idle: { frames: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3], fps: 2 },
        spin: { frames: [0, 1, 2, 3], fps: 12 } } });
      const vane = vaneS.el;
      root.appendChild(vane);
      let vaneBusy = false;
      api.on(vane, 'pointerdown', () => {
        if (vaneBusy) return;
        vaneBusy = true;
        if (phase !== 'demo') {
          api.sfx('whoosh');
          api.setTimeout(() => api.note('E4', 0.25, 'triangle'), 1200);
        }
        vaneS.play('spin');
        api.setTimeout(() => { vaneS.play('idle'); vaneBusy = false; }, 1600);
      });

      /* ---------- pigeons ---------- */
      const pigeons = [
        { x: 300, dir: 1 },
        { x: 862, dir: -1 },
      ].map((p, k) => {
        const node = api.el('div', { class: 'bl-pigeon pixel p' + (k + 1),
          style: { left: p.x + 'px', top: (BEAM_TOP - 74) + 'px' } });
        const spr = api.sprite('assets/bells/pigeon.png', { frame: [46, 40], class: 'bl-pg' + (p.dir < 0 ? ' flip' : ''), anims: {
          idle: { frames: [0, 0, 0, 0, 0, 0, 0, 1, 0, 1], fps: 3 },
          fly: { frames: [2, 3], fps: 10 } } });
        node.appendChild(spr.el);
        root.appendChild(node);
        const pg = { el: node, spr, dir: p.dir, busy: false };
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
        pg.spr.play('fly');
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
              pg.spr.play('idle');
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
      const slot = (SPAN_R - SPAN_L) / cfg.n;
      const bells = set.map((letter, i) => {
        const info = NOTE_INFO[letter];
        const cx = SPAN_L + slot * (i + 0.5);
        const wrap = api.el('div', { class: 'bell-wrap', style: {
          left: Math.round(cx - BW / 2) + 'px', top: BEAM_BOTTOM + 'px',
          width: BW + 'px', height: (ROPE + BH) + 'px',
        } });
        const swing = api.el('div', { class: 'bell-swing' });
        const rope = api.el('div', { class: 'bell-rope', style: { height: (ROPE + 16) + 'px' } });
        const box = api.el('div', { class: 'bell-box', style: { height: BH + 'px' } });
        box.appendChild(api.el('div', { class: 'bell-halo' }));
        const ci = ['C', 'D', 'E', 'G', 'A'].indexOf(letter);
        const spr = api.sprite('assets/bells/bells.png', { frame: [75, 88], cols: 15, class: 'bell-spr', blink: 'blink', anims: {
          idle: [ci * 3], blink: { frames: [ci * 3 + 1], fps: 6 }, sing: [ci * 3 + 2] } });
        box.appendChild(spr.el);
        swing.append(rope, box);
        wrap.appendChild(swing);
        root.appendChild(wrap);
        const b = { el: wrap, box, spr, note: info.pitch, letter, t: 0, ot: 0 };
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
        b.spr.play('sing');
        b.t = api.setTimeout(() => { b.el.classList.remove('ring'); b.spr.play('idle'); }, 760);
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
      const bramS = api.sprite('assets/bells/bram.png', { frame: [92, 122], class: 'bl-bram pixel', blink: 'blink', anims: {
        idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 },
        talk: { frames: [3, 0], fps: 7 }, conduct: { frames: [4, 5], fps: 4 } } });
      const bram = bramS.el;
      bram.title = 'Bram the Bellringer';
      root.appendChild(bram);
      api.on(bram, 'pointerdown', () => {
        if (phase !== 'demo') {
          api.note('A4', 0.28, 'flute');
          api.setTimeout(() => api.note('F4', 0.5, 'flute'), 300);
          api.setTimeout(() => api.note('E6', 0.25, 'bell'), 120);
        }
        restartClass(bram, 'bounce', 620);
      });
      let bramTalking = false, bramConducting = false;
      function bramPose() { bramS.play(bramConducting ? 'conduct' : bramTalking ? 'talk' : 'idle'); }
      let talkN = 0;
      function bramSay(text) {
        const my = ++talkN;
        bramTalking = true;
        bramPose();
        return api.say(text, { who: 'Bram', pitch: 0.8, rate: 0.92 }).then(() => {
          if (my === talkN) { bramTalking = false; bramPose(); }
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
        bramConducting = true;
        bramPose();
        await api.wait(350);
        const gap = slow ? SLOW_GAP : cfg.gap;
        for (let k = 0; k < seq.length; k++) {
          ring(seq[k], true);
          await api.wait(gap);
        }
        bramConducting = false;
        bramPose();
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
