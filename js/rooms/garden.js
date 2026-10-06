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

  /* Picture sprites: frame index per word */
  const PIC_ORDER = ['apple', 'ball', 'bee', 'bus', 'cat', 'dog', 'egg', 'fish', 'fox', 'hat', 'moon', 'pig', 'sun', 'bug', 'bed', 'cup', 'hen', 'map'];
  function picEl(word) {
    return Castle.sprite('assets/garden/pics.png', { frame: [56, 56], cols: 18, class: 'gd-pic' }).frame(PIC_ORDER.indexOf(word)).el;
  }

  /* Code-drawn fountain jets (the only SVG left in the room) */
  const FOUNTAIN_JETS = `<svg class="gd-jets-svg" viewBox="0 0 190 210" width="190" height="210">
    <g transform="translate(0 -24)">
      <g class="gd-jets">
        <path d="M95 64 C95 22 64 30 52 92 M95 64 C95 22 126 30 138 92 M95 66 V18" fill="none" stroke="#3a2a1a" stroke-width="9" stroke-linecap="round"/>
        <path class="gd-water" d="M95 64 C95 22 64 30 52 92 M95 64 C95 22 126 30 138 92 M95 66 V18" fill="none" stroke="#9fe3ff" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 8"/>
      </g>
    </g>
  </svg>`;

  /* ------------------------------------------------------------------
     Room styles
     ------------------------------------------------------------------ */
  const CSS = `
  .scene-garden { font-family: var(--font); background: #8fe065; }
  .scene-garden .gd-bg { position: absolute; left: 0; top: 0; pointer-events: none; }

  .scene-garden .gd-layer { position: absolute; inset: 0; pointer-events: none; }
  .scene-garden .gd-layer > * { pointer-events: auto; }

  /* Pots */
  .scene-garden .gd-pot { position: absolute; width: 180px; height: 290px; cursor: pointer; animation: gd-rise .6s cubic-bezier(.3,1.5,.5,1) backwards; }
  @keyframes gd-rise { from { transform: translateY(90px) scale(.5); opacity: 0; } }
  .scene-garden .gd-potbody { position: absolute; left: 0; top: 125px; width: 180px; height: 165px; transform-origin: 50% 100%; }
  .scene-garden .gd-potbody > .sprite { position: absolute; left: 0; top: 0; }
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
  .scene-garden .gd-fl { transform: scale(0); transform-origin: 50% 100%; }
  .scene-garden .gd-flower.sprout .gd-fl { transform: scale(1); transition: transform .45s steps(4, end); }
  .scene-garden .gd-flower.bloom .gd-fl { animation: gd-flpop .5s steps(5, end) both; }
  @keyframes gd-flpop { from { transform: scale(.2); } to { transform: scale(1); } }
  .scene-garden .gd-flower.bloom { animation: gd-sway 3.2s steps(6, end) 1.2s infinite; }
  .scene-garden .gd-flower.gd-dance { animation: gd-dance .45s steps(6, end) infinite alternate; }
  @keyframes gd-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  @keyframes gd-dance { from { transform: rotate(-9deg) scale(1.02); } to { transform: rotate(9deg) scale(1.08); } }

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
  .scene-garden .gd-packet > .sprite { position: absolute; left: 0; top: 0; filter: drop-shadow(0 5px 0 rgba(58,42,26,.35)); }
  .scene-garden .gd-packet-letter { position: absolute; left: 28px; top: 38px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; line-height: 1; color: var(--ink); }
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
  .scene-garden .gd-gus { position: absolute; left: 1006px; top: 262px; width: 250px; height: 330px; cursor: pointer; transform-origin: 50% 100%; }
  .scene-garden .gd-drops { position: absolute; left: 4px; top: 250px; width: 30px; height: 40px; opacity: 0; pointer-events: none; }
  .scene-garden .gd-gus.water .gd-drops { opacity: 1; }
  .scene-garden .gd-drops i { position: absolute; width: 8px; height: 8px; background: #9fe3ff; border: 2px solid var(--ink); box-sizing: border-box; }
  .scene-garden .gd-drops i:nth-child(1) { left: 0; top: 0; }
  .scene-garden .gd-drops i:nth-child(2) { left: 10px; top: 8px; }
  .scene-garden .gd-drops i:nth-child(3) { left: 4px; top: 16px; }
  .scene-garden .gd-gus.water .gd-drops i { animation: gd-drip .45s steps(3, end) infinite; }
  .scene-garden .gd-gus.water .gd-drops i:nth-child(2) { animation-delay: -.15s; }
  .scene-garden .gd-gus.water .gd-drops i:nth-child(3) { animation-delay: -.3s; }
  @keyframes gd-drip { from { transform: translate(0, -4px); } to { transform: translate(-4px, 26px); } }

  /* Extras */
  .scene-garden .gd-sunflower { position: absolute; left: 14px; top: 110px; width: 110px; height: 230px; cursor: pointer; }
  .scene-garden .gd-sunflower > .sprite { transform-origin: 50% 100%; animation: gd-sway 4s steps(6, end) infinite; }

  .scene-garden .gd-bunbox { position: absolute; left: 110px; top: 150px; width: 116px; height: 150px; overflow: hidden; cursor: pointer; }
  .scene-garden .gd-bunny { position: absolute; left: 18px; bottom: 10px; transform: translateY(80px); transform-origin: 50% 100%; transition: transform .45s steps(4, end); }
  .scene-garden .gd-bunbox.peek .gd-bunny { transform: translateY(20px); }
  .scene-garden .gd-bunbox.up .gd-bunny { transform: translateY(0); }
  .scene-garden .gd-bush { position: absolute; left: 0; bottom: 0; }

  .scene-garden .gd-fountain { position: absolute; left: 16px; top: 330px; width: 190px; height: 210px; cursor: pointer; }
  .scene-garden .gd-fountain > .sprite { position: absolute; left: 0; top: 0; }
  .scene-garden .gd-jets-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
  .scene-garden .gd-water { animation: gd-dash .6s linear infinite; }
  @keyframes gd-dash { to { stroke-dashoffset: -18; } }
  .scene-garden .gd-jets { transform-box: fill-box; transform-origin: 50% 100%; transition: transform .3s cubic-bezier(.3,1.6,.5,1); }
  .scene-garden .gd-fountain.splash .gd-jets { transform: scaleY(1.45) scaleX(1.12); }
  .scene-garden .gd-droplet { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #9fe3ff; border: 2.5px solid var(--ink); pointer-events: none; }

  .scene-garden .gd-frogbox { position: absolute; left: 930px; top: 600px; width: 140px; height: 110px; cursor: pointer; }
  .scene-garden .gd-frog { transform-origin: 50% 100%; }
  .scene-garden .gd-frogbox.croak .gd-frog { animation: gd-froghop .6s steps(4, end); }
  @keyframes gd-froghop { 30% { transform: translateY(-26px) scale(1.05, .95); } 60% { transform: translateY(0) scale(1.08, .9); } }
  .scene-garden .gd-ribbit {
    position: absolute; left: 70px; top: -28px; padding: 2px 14px; background: #fff; border: 4px solid var(--ink);
    border-radius: 18px; font-size: 24px; font-weight: 800; white-space: nowrap; pointer-events: none;
    transform: scale(0); transition: transform .25s cubic-bezier(.3,1.6,.5,1);
  }
  .scene-garden .gd-frogbox.croak .gd-ribbit { transform: scale(1) rotate(-6deg); }

  .scene-garden .gd-bfly { position: absolute; width: 64px; height: 56px; cursor: pointer; }
  .scene-garden .gd-bfly-a { left: 34px; top: 128px; animation: gd-fly-a 13s ease-in-out infinite; }
  .scene-garden .gd-bfly-b { left: 1030px; top: 104px; animation: gd-fly-b 11s ease-in-out infinite; }
  @keyframes gd-fly-a { 0%, 100% { transform: translate(0, 0) rotate(-6deg); } 25% { transform: translate(120px, 40px) rotate(10deg); } 50% { transform: translate(70px, 130px) rotate(-8deg); } 75% { transform: translate(-6px, 70px) rotate(6deg); } }
  @keyframes gd-fly-b { 0%, 100% { transform: translate(0, 0) rotate(6deg); } 30% { transform: translate(150px, 30px) rotate(-8deg); } 60% { transform: translate(80px, 100px) rotate(8deg); } 80% { transform: translate(20px, 50px) rotate(-4deg); } }
  .scene-garden .gd-bfly-in { width: 100%; height: 100%; }
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
      root.appendChild(api.img('assets/garden/bg.png', { w: 640, h: 360, x: 0, y: 0, class: 'gd-bg' }));
      root.appendChild(el('div', { class: 'room-title', text: 'Royal Garden' }));
      const dotsEl = el('div', { class: 'round-dots' }, [el('span'), el('span'), el('span')]);
      root.appendChild(dotsEl);
      const dots = Array.from(dotsEl.children);

      /* ---------- Gus & speech ---------- */
      const gus = el('div', { class: 'gd-gus tap pixel' });
      const gusS = api.sprite('assets/garden/gus.png', { frame: [125, 165], blink: 'blink', anims: {
        idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 }, talk: { frames: [3, 0], fps: 7 } } });
      gus.appendChild(gusS.el);
      gus.appendChild(el('div', { class: 'gd-drops' }, [el('i'), el('i'), el('i')]));
      let talkTok = 0;
      function sayGus(text) {
        const tok = ++talkTok;
        gusS.play('talk');
        return api.say(spoken(text), { who: 'Gus', pitch: 1.1, rate: 0.92, caption: captioned(text) }).then(() => {
          if (tok === talkTok) gusS.play('idle');
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
      const sunflower = el('div', { class: 'gd-sunflower' });
      const sunS = Castle.sprite('assets/garden/sunflower.png', { frame: [55, 115], cols: 2 }).frame(1);
      sunflower.appendChild(sunS.el);
      let sfTok = 0;
      api.on(sunflower, 'click', () => {
        const tok = ++sfTok;
        sunflower.classList.add('facing');
        sunS.frame(0);
        api.sfx('chime');
        api.setTimeout(() => api.note('G5', 0.3, 'bell'), 180);
        api.setTimeout(() => { if (tok === sfTok) { sunflower.classList.remove('facing'); sunS.frame(1); } }, 3600);
      });

      // Bunny hiding in the hedge
      const bunbox = el('div', { class: 'gd-bunbox tap' });
      const bunny = Castle.sprite('assets/garden/bunny.png', { frame: [40, 53], class: 'pixel gd-bunny' }).el;
      bunbox.append(bunny, Castle.sprite('assets/garden/bush.png', { frame: [58, 45], class: 'gd-bush' }).el);
      let bunnyUp = false;
      api.on(bunbox, 'click', () => {
        if (bunnyUp) return;
        bunnyUp = true;
        bunbox.classList.remove('peek');
        bunbox.classList.add('up');
        api.setTimeout(() => anim(bunny, 'wiggle', 520), 480);
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
      const fountain = el('div', { class: 'gd-fountain tap' });
      fountain.appendChild(Castle.sprite('assets/garden/fountain.png', { frame: [95, 105] }).el);
      fountain.insertAdjacentHTML('beforeend', FOUNTAIN_JETS);
      let fountainBusy = false;
      api.on(fountain, 'click', () => {
        if (fountainBusy) return;
        fountainBusy = true;
        fountain.classList.add('splash');
        api.sfx('splash');
        api.setTimeout(() => api.sfx('plop'), 250);
        for (let i = 0; i < 12; i++) {
          const d = el('div', { class: 'gd-droplet', style: { left: (89 + api.rand(12)) + 'px', top: '34px' } });
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
      const flappers = [];
      function makeButterfly(cls, f0) {
        const spr = Castle.sprite('assets/garden/bfly.png', { frame: [32, 28], cols: 4 }).frame(f0);
        flappers.push({ spr, f0, open: true });
        const inner = el('div', { class: 'gd-bfly-in' }, spr.el);
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
      const bfA = makeButterfly('gd-bfly-a', 0);
      const bfB = makeButterfly('gd-bfly-b', 2);
      api.setInterval(() => flappers.forEach((b) => { b.open = !b.open; b.spr.frame(b.f0 + (b.open ? 0 : 1)); }), 200);

      // Frog on a lily pad
      const frog = el('div', { class: 'gd-frogbox tap' });
      const frogS = Castle.sprite('assets/garden/frog.png', { frame: [70, 55], cols: 2, class: 'gd-frog' });
      frog.appendChild(frogS.el);
      frog.appendChild(el('div', { class: 'gd-ribbit', text: 'Ribbit!' }));
      let frogBusy = false;
      api.on(frog, 'click', () => {
        if (frogBusy) return;
        frogBusy = true;
        frog.classList.add('croak');
        frogS.frame(1);
        api.note('D3', 0.14, 'sawtooth');
        api.setTimeout(() => api.note('A2', 0.2, 'sawtooth'), 170);
        api.setTimeout(() => api.sfx('plop'), 420);
        api.setTimeout(() => { frog.classList.remove('croak'); frogS.frame(0); frogBusy = false; }, 1000);
      });

      // Gus himself
      const GUS_LINES = ['Hello there, little gardener!', 'Flowers love sunshine and water!', 'Ho ho! I love my garden!', 'Splish, splash! Time to water!'];
      let gusBusy = false;
      api.on(gus, 'click', () => {
        if (gusBusy) return;
        gusBusy = true;
        gus.classList.add('water');
        anim(gus, 'bounce', 650);
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
        pot.bloomFrame = 1 + api.rand(5);
        pot.fl = Castle.sprite('assets/garden/flowers.png', { frame: [70, 85], cols: 6, class: 'gd-fl' }).frame(0);
        pot.flower = el('div', { class: 'gd-flower' }, pot.fl.el);
        pot.body = el('div', { class: 'gd-potbody' }, Castle.sprite('assets/garden/pot.png', { frame: [90, 83] }).el);
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
          art.appendChild(Castle.sprite('assets/garden/packets.png', { frame: [60, 75], cols: 6 }).frame((idx + R.r * 2) % PACKET_COLORS.length).el);
          art.appendChild(el('div', { class: 'gd-packet-letter', text: data.letter }));
        } else if (diff === 2) {
          w = 140; h = 140; top = 118;
          art = el('div', { class: 'gd-card' }, picEl(data.word));
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
        pot.fl.frame(pot.bloomFrame);
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
              el('div', { class: 'gd-sign-board' }, el('div', { class: 'gd-card' }, picEl(word))),
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
