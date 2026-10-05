/* =====================================================================
   Castle Quest — core engine
   Scene management, stage scaling, audio (Web Audio synth), speech,
   guide character, HUD, save data, drag-and-drop and room API.
   Plain script (no modules) so the game runs straight from file://.
   ===================================================================== */
(function () {
  'use strict';

  const W = 1280, H = 720;
  const SAVE_KEY = 'castleQuest.save.v1';

  const JEWELS = {
    ruby:     { name: 'Ruby',     color: '#e0245e', light: '#ff8fb0', dark: '#8f0f37' },
    sapphire: { name: 'Sapphire', color: '#2f6fe0', light: '#9cc0ff', dark: '#173f8f' },
    amethyst: { name: 'Amethyst', color: '#9b5de5', light: '#d6b3ff', dark: '#5b2a9a' },
    emerald:  { name: 'Emerald',  color: '#22b26b', light: '#8af0bd', dark: '#0f6b3d' },
    topaz:    { name: 'Topaz',    color: '#ffb020', light: '#ffe8a3', dark: '#b26b00' },
    diamond:  { name: 'Diamond',  color: '#8fdcff', light: '#ffffff', dark: '#3a8fb2' },
  };
  const JEWEL_ORDER = ['ruby', 'sapphire', 'amethyst', 'emerald', 'topaz', 'diamond'];

  const Castle = window.Castle = {
    W, H, JEWELS, JEWEL_ORDER,
    rooms: {},
    scenes: {},
  };

  /* ------------------------------------------------------------------
     Save data
     ------------------------------------------------------------------ */
  const DEFAULTS = { jewels: {}, plays: {}, difficulty: 1, voice: true, music: true, finale: false };
  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      return Object.assign({}, DEFAULTS, raw, { jewels: Object.assign({}, raw.jewels), plays: Object.assign({}, raw.plays) });
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }
  const state = Castle.state = loadState();
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }
  Castle.save = save;
  Castle.resetProgress = function () {
    state.jewels = {}; state.plays = {}; state.finale = false;
    save(); updateHud();
  };
  Castle.jewelCount = () => JEWEL_ORDER.filter(j => state.jewels[j]).length;

  /* ------------------------------------------------------------------
     Small DOM helpers
     ------------------------------------------------------------------ */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return node;
  }
  function svg(markup) {
    const t = document.createElement('template');
    t.innerHTML = markup.trim();
    return t.content.firstElementChild;
  }
  const rand = n => Math.floor(Math.random() * n);
  const pick = arr => arr[rand(arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  Castle.util = { el, svg, rand, pick, shuffle };

  /* ------------------------------------------------------------------
     Pixel art: sprite sheets (one row of equal frames) and still images,
     drawn at 2x so 1 art pixel = 2 stage pixels. Frames are swapped, never
     smoothly scaled, so the pixels stay crisp.
     ------------------------------------------------------------------ */
  const PX = 2;
  function makeSprite(src, o, track) {
    o = o || {};
    const fw = o.frame[0], fh = o.frame[1], sc = o.scale || PX;
    const anims = {};
    let maxF = 0;
    Object.keys(o.anims || {}).forEach(k => {
      const a = o.anims[k];
      anims[k] = Array.isArray(a) ? { frames: a, fps: o.fps || 6 } : { frames: a.frames, fps: a.fps || o.fps || 6 };
      maxF = Math.max(maxF, ...anims[k].frames);
    });
    const cols = o.cols || maxF + 1;
    const node = el('div', { class: 'sprite' + (o.class ? ' ' + o.class : '') });
    Object.assign(node.style, {
      width: fw * sc + 'px', height: fh * sc + 'px',
      backgroundImage: `url("${src}")`,
      backgroundSize: `${cols * fw * sc}px ${fh * sc}px`,
    });
    if (o.x != null) Object.assign(node.style, { position: 'absolute', left: o.x + 'px', top: o.y + 'px' });

    let timer = null, blinkTimer = null, current = null, done = null, then = null;
    function show(f) { s.shown = f; node.style.backgroundPosition = `${-f * fw * sc}px 0px`; }
    function halt() {
      if (timer) { clearInterval(timer); timer = null; }
      then = null;
      if (done) { const d = done; done = null; d(); }
    }
    const s = {
      el: node,
      shown: 0,
      get anim() { return current; },
      frame(f) { halt(); current = null; show(f); return s; },
      play(name, po) {
        po = po || {};
        const a = anims[name];
        if (!a) { console.warn('sprite: no animation', name); return Promise.resolve(); }
        if (name === current && timer && !po.once && !po.fps) return Promise.resolve();
        halt();
        current = name;
        let i = 0;
        show(a.frames[0]);
        if (!po.once && a.frames.length < 2) return Promise.resolve();
        const p = po.once ? new Promise(r => { done = r; }) : Promise.resolve();
        then = po.once ? po.then || null : null;
        timer = setInterval(() => {
          i++;
          if (i < a.frames.length) { show(a.frames[i]); return; }
          if (!po.once) { i = 0; show(a.frames[0]); return; }
          const next = then;
          halt();
          if (next) s.play(next);
        }, 1000 / (po.fps || a.fps));
        return p;
      },
      stop() { halt(); },
      destroy() { halt(); clearTimeout(blinkTimer); },
    };
    function blinkLater() {
      blinkTimer = setTimeout(() => {
        if (current === 'idle') s.play(o.blink, { once: true, then: 'idle' });
        blinkLater();
      }, 3000 + Math.random() * 3000);
    }
    if (track) track(s.destroy);
    if (anims.idle) s.play('idle'); else show(0);
    if (o.blink && anims[o.blink]) blinkLater();
    return s;
  }
  function makeImg(src, o) {
    o = o || {};
    const sc = o.scale || PX;
    const node = el('img', { src, alt: '', draggable: 'false', class: 'px' + (o.class ? ' ' + o.class : '') });
    Object.assign(node.style, { width: o.w * sc + 'px', height: o.h * sc + 'px' });
    if (o.x != null) Object.assign(node.style, { position: 'absolute', left: o.x + 'px', top: o.y + 'px' });
    node.addEventListener('error', () => { node.style.visibility = 'hidden'; });
    return node;
  }
  Castle.sprite = (src, o) => makeSprite(src, o, null);
  Castle.img = makeImg;

  function jewelSVG(kind, size) {
    const j = JEWELS[kind] || JEWELS.ruby;
    size = size || 60;
    return `<svg class="jewel-svg" viewBox="0 0 100 100" width="${size}" height="${size}">
      <polygon points="26,14 74,14 95,40 50,92 5,40" fill="${j.color}" stroke="#3a2a1a" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="26,14 40,40 5,40" fill="${j.light}" opacity=".85"/>
      <polygon points="74,14 60,40 95,40" fill="${j.dark}" opacity=".45"/>
      <polygon points="40,40 60,40 50,92" fill="${j.light}" opacity=".35"/>
      <polygon points="60,40 95,40 50,92" fill="${j.dark}" opacity=".35"/>
      <polyline points="5,40 95,40" fill="none" stroke="#3a2a1a" stroke-width="3"/>
      <polyline points="26,14 40,40 50,14 60,40 74,14" fill="none" stroke="#3a2a1a" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="30" cy="27" r="5" fill="#fff" opacity=".9"/>
    </svg>`;
  }
  Castle.jewelSVG = jewelSVG;

  /* ------------------------------------------------------------------
     Stage + scaling
     ------------------------------------------------------------------ */
  let stage, sceneEl, hudEl, guideEl, bubbleEl, bubbleText, bubbleWho, fxCanvas, modalEl;
  let scale = 1;

  function layout() {
    if (!window.innerWidth || !window.innerHeight) return;
    scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  function toStage(clientX, clientY) {
    const r = stage.getBoundingClientRect();
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
  }
  function stageRect(node) {
    const s = stage.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const x = (r.left - s.left) / scale, y = (r.top - s.top) / scale, w = r.width / scale, h = r.height / scale;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }
  function hitTest(x, y, node, pad) {
    pad = pad == null ? 20 : pad;
    const r = stageRect(node);
    return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
  }
  Castle.toStage = toStage;
  Castle.stageRect = stageRect;
  Castle.hitTest = hitTest;

  /* ------------------------------------------------------------------
     Audio — everything is synthesized, no files needed
     ------------------------------------------------------------------ */
  // Developer/test mute: localStorage 'castleQuest.mute' = '1' or ?mute in the URL silences all audio + speech
  function isMuted() {
    try { return /[?&]mute/.test(location.search) || localStorage.getItem('castleQuest.mute') === '1'; } catch (e) { return false; }
  }
  Castle.devMute = function (on) {
    try { localStorage.setItem('castleQuest.mute', on ? '1' : '0'); } catch (e) {}
    if (master) master.gain.value = on ? 0 : 0.85;
    if (on && window.speechSynthesis) window.speechSynthesis.cancel();
  };
  let actx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain(); master.gain.value = isMuted() ? 0 : 0.85; master.connect(actx.destination);
      sfxBus = actx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
      musicBus = actx.createGain(); musicBus.gain.value = 0.16; musicBus.connect(master);
      noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function tone(freq, dur, o) {
    o = o || {};
    const c = audio(); if (!c) return;
    const t = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    if (o.vibrato) {
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = o.vibrato; lg.gain.value = freq * 0.02;
      lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur + 0.1);
    }
    const vol = o.vol == null ? 0.25 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let out = g;
    if (o.lowpass) {
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lowpass;
      g.connect(f); out = f;
    }
    osc.connect(g);
    out.connect(o.bus || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(dur, o) {
    o = o || {};
    const c = audio(); if (!c) return;
    const t = c.currentTime + (o.delay || 0);
    const src = c.createBufferSource(); src.buffer = noiseBuf;
    const f = c.createBiquadFilter(); f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.from || 800, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.3, t + (o.attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }

  const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteFreq(n) {
    if (typeof n === 'number') return n;
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
    if (!m) return 440;
    let semi = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (parseInt(m[3], 10) + 1) * 12 + semi;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playNote(n, dur, instrument, o) {
    const f = noteFreq(n); dur = dur || 0.6; o = o || {};
    const bus = o.bus;
    switch (instrument || 'bell') {
      case 'bell':
        tone(f, dur * 1.6, { type: 'sine', vol: 0.32, bus, delay: o.delay });
        tone(f * 2.01, dur * 0.9, { type: 'sine', vol: 0.12, bus, delay: o.delay });
        tone(f * 3.02, dur * 0.5, { type: 'sine', vol: 0.06, bus, delay: o.delay });
        break;
      case 'pluck':
        tone(f, dur, { type: 'triangle', vol: o.vol || 0.3, bus, delay: o.delay });
        tone(f * 2, dur * 0.4, { type: 'sine', vol: (o.vol || 0.3) * 0.25, bus, delay: o.delay });
        break;
      case 'flute':
        tone(f, dur, { type: 'sine', vol: o.vol || 0.22, attack: 0.06, vibrato: 5, bus, delay: o.delay });
        break;
      case 'horn':
        tone(f, dur, { type: 'sawtooth', vol: o.vol || 0.14, attack: 0.03, lowpass: 1600, bus, delay: o.delay });
        tone(f / 2, dur, { type: 'triangle', vol: (o.vol || 0.14) * 0.6, attack: 0.03, bus, delay: o.delay });
        break;
      default:
        tone(f, dur, { type: instrument, vol: o.vol || 0.2, bus, delay: o.delay });
    }
  }

  const SFX = {
    click()   { tone(880, 0.07, { type: 'square', vol: 0.06 }); },
    pop()     { tone(380, 0.14, { type: 'sine', slide: 950, vol: 0.28 }); },
    pickup()  { tone(520, 0.1, { type: 'triangle', slide: 780, vol: 0.2 }); },
    drop()    { tone(300, 0.12, { type: 'triangle', slide: 180, vol: 0.22 }); },
    correct() { ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => playNote(n, 0.3, 'pluck', { delay: i * 0.08, vol: 0.25 })); },
    wrong()   { tone(330, 0.35, { type: 'sine', slide: 160, vol: 0.25, vibrato: 9 }); },
    boing()   { tone(180, 0.4, { type: 'sine', slide: 520, vol: 0.28, vibrato: 14 }); },
    sparkle() { for (let i = 0; i < 7; i++) tone(1500 + Math.random() * 1600, 0.18, { type: 'sine', vol: 0.07, delay: i * 0.05 }); },
    chime()   { playNote('E6', 0.9, 'bell'); },
    whoosh()  { noise(0.45, { from: 300, to: 3000, vol: 0.18, q: 0.7 }); },
    drum()    { tone(120, 0.25, { type: 'sine', slide: 50, vol: 0.5 }); noise(0.1, { from: 1200, vol: 0.12 }); },
    plop()    { tone(260, 0.18, { type: 'sine', slide: 90, vol: 0.35 }); },
    splash()  { noise(0.4, { from: 2500, to: 600, vol: 0.2, q: 0.5 }); tone(240, 0.15, { slide: 90, vol: 0.2 }); },
    coin()    { tone(988, 0.08, { type: 'square', vol: 0.08 }); tone(1319, 0.3, { type: 'square', vol: 0.08, delay: 0.08 }); },
    giggle()  { [0, 1, 2, 3].forEach(i => tone(700 + (i % 2) * 180, 0.09, { type: 'triangle', vol: 0.15, delay: i * 0.1, vibrato: 20 })); },
    roar()    { tone(110, 0.7, { type: 'sawtooth', slide: 70, vol: 0.12, lowpass: 700, vibrato: 7 }); noise(0.6, { from: 400, to: 200, vol: 0.08 }); },
    fanfare() {
      const seq = [['G4', 0, 0.18], ['G4', 0.18, 0.18], ['G4', 0.36, 0.18], ['C5', 0.54, 0.6], ['E5', 1.0, 0.25], ['G5', 1.25, 0.9]];
      seq.forEach(([n, d, len]) => playNote(n, len + 0.15, 'horn', { delay: d, vol: 0.16 }));
      SFX.sparkle();
    },
  };
  function sfx(name) { if (SFX[name]) { try { SFX[name](); } catch (e) { /* audio unavailable */ } } }
  Castle.sfx = sfx;
  Castle.playNote = playNote;
  Castle.noteFreq = noteFreq;
  Castle.tone = tone;

  /* Background music: a gentle medieval loop (D dorian), scheduled ahead */
  const TUNE = [
    ['D4', 1], ['F4', 1], ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 2],
    ['C4', 1], ['E4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 2],
    ['D4', 1], ['F4', 1], ['A4', 1], ['C5', 1], ['B4', 1], ['A4', 1], ['G4', 1], ['F4', 1],
    ['E4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 4],
  ];
  const BASS = [['D3', 8], ['C3', 8], ['D3', 4], ['G2', 4], ['A2', 4], ['D3', 4]];
  let musicTimer = null, musicNextTime = 0, musicMelIdx = 0, musicBassIdx = 0, musicBassTime = 0;
  const BEAT = 0.42;
  function musicTick() {
    const c = actx; if (!c) return;
    while (musicNextTime < c.currentTime + 1.2) {
      const [n, b] = TUNE[musicMelIdx];
      const delay = Math.max(0, musicNextTime - c.currentTime);
      playNote(n, b * BEAT * 0.95, 'pluck', { bus: musicBus, delay, vol: 0.5 });
      musicNextTime += b * BEAT;
      musicMelIdx = (musicMelIdx + 1) % TUNE.length;
    }
    while (musicBassTime < c.currentTime + 1.2) {
      const [n, b] = BASS[musicBassIdx];
      const delay = Math.max(0, musicBassTime - c.currentTime);
      playNote(n, b * BEAT, 'flute', { bus: musicBus, delay, vol: 0.35 });
      musicBassTime += b * BEAT;
      musicBassIdx = (musicBassIdx + 1) % BASS.length;
    }
  }
  function startMusic() {
    if (!state.music || musicTimer) return;
    const c = audio(); if (!c) return;
    musicNextTime = musicBassTime = c.currentTime + 0.1;
    musicMelIdx = musicBassIdx = 0;
    musicTimer = setInterval(musicTick, 250);
    musicTick();
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }
  let musicWanted = false;
  Castle.music = {
    play() { musicWanted = true; startMusic(); },
    stop() { musicWanted = false; stopMusic(); },
  };

  /* ------------------------------------------------------------------
     Speech + guide (Pip the little dragon)
     ------------------------------------------------------------------ */
  const synth = window.speechSynthesis || null;
  let voice = null;
  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices().filter(v => /^en/i.test(v.lang));
    const prefs = [/Ana Online/i, /Aria Online/i, /Jenny Online/i, /Natural/i, /Samantha/i, /Google US English/i, /Zira/i, /en-US/i];
    for (const p of prefs) {
      const v = vs.find(v => p.test(v.name) || p.test(v.lang));
      if (v) { voice = v; return; }
    }
    voice = vs[0] || null;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  let sayToken = 0, lastLine = null, sayResolve = null, bubbleTimer = null;
  function finishSpeech() {
    if (guideEl) guideEl.classList.remove('talking');
    if (sayResolve) { const r = sayResolve; sayResolve = null; r(); }
  }
  function say(text, opts) {
    opts = opts || {};
    const token = ++sayToken;
    if (sayResolve) finishSpeech();
    if (synth) synth.cancel();
    lastLine = { text, opts };
    showBubble(opts.caption || text, opts.who);
    guideEl.classList.toggle('talking', !opts.who || opts.who === 'Pip');
    return new Promise(resolve => {
      sayResolve = resolve;
      const fallbackMs = Math.max(1400, text.length * 68) + 400;
      const done = () => { if (token === sayToken) { finishSpeech(); scheduleBubbleHide(); } };
      let timer = setTimeout(done, state.voice && synth && !isMuted() ? fallbackMs + 6000 : fallbackMs);
      if (state.voice && synth && !isMuted()) {
        const u = new SpeechSynthesisUtterance(text.replace(/[★✨]/g, ''));
        if (voice) u.voice = voice;
        u.rate = opts.rate || 0.95;
        u.pitch = opts.pitch || 1.25;
        u.onend = () => { clearTimeout(timer); done(); };
        u.onerror = () => { clearTimeout(timer); done(); };
        try { synth.speak(u); } catch (e) { clearTimeout(timer); timer = setTimeout(done, fallbackMs); }
      }
    });
  }
  function showBubble(text, who) {
    clearTimeout(bubbleTimer);
    bubbleText.textContent = text;
    bubbleWho.textContent = who || 'Pip';
    bubbleEl.classList.add('show');
  }
  function scheduleBubbleHide() {
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubbleEl.classList.remove('show'), 3500);
  }
  function hush() {
    sayToken++;
    if (synth) synth.cancel();
    finishSpeech();
    bubbleEl && bubbleEl.classList.remove('show');
  }
  Castle.say = say;
  Castle.hush = hush;
  Castle.repeat = () => { if (lastLine) say(lastLine.text, lastLine.opts); };

  /* ------------------------------------------------------------------
     Confetti / sparkle effects
     ------------------------------------------------------------------ */
  let particles = [], fxRunning = false, fxCtx;
  const CONFETTI_COLORS = ['#e8423f', '#2f7fe0', '#ffc928', '#3fb950', '#9b5de5', '#ff8c2b', '#ff6fae'];
  function confetti(x, y, count, spread) {
    x = x == null ? W / 2 : x; y = y == null ? H / 3 : y; count = count || 120; spread = spread || 1;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, s = (4 + Math.random() * 9) * spread;
      particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, g: 0.28,
        size: 8 + Math.random() * 10, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        color: pick(CONFETTI_COLORS), life: 120 + rand(60), shape: rand(3),
      });
    }
    runFx();
  }
  function sparkles(x, y, count) {
    count = count || 18;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.02, size: 10 + Math.random() * 10,
        rot: 0, vr: 0.1, color: pick(['#fff7b0', '#ffe14d', '#ffffff', '#ffd1f0']), life: 40 + rand(30), shape: 3 });
    }
    runFx();
  }
  function star(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.45 : r, a = (i * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }
  function runFx() {
    if (fxRunning) return;
    fxRunning = true;
    const step = () => {
      fxCtx.clearRect(0, 0, W, H);
      particles = particles.filter(p => p.life > 0 && p.y < H + 40);
      for (const p of particles) {
        p.vy += p.g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
        fxCtx.save(); fxCtx.translate(p.x, p.y); fxCtx.rotate(p.rot);
        fxCtx.globalAlpha = Math.min(1, p.life / 30);
        fxCtx.fillStyle = p.color;
        if (p.shape === 0) fxCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else if (p.shape === 1) { fxCtx.beginPath(); fxCtx.arc(0, 0, p.size / 3, 0, Math.PI * 2); fxCtx.fill(); }
        else star(fxCtx, p.size / 2);
        fxCtx.restore();
      }
      if (particles.length) requestAnimationFrame(step);
      else { fxRunning = false; fxCtx.clearRect(0, 0, W, H); }
    };
    requestAnimationFrame(step);
  }
  Castle.confetti = confetti;
  Castle.sparkles = sparkles;

  /* ------------------------------------------------------------------
     Drag and drop (pointer events, works with mouse + touch)
     ------------------------------------------------------------------ */
  function makeDraggable(node, opts, track) {
    opts = opts || {};
    node.classList.add('draggable');
    node.style.touchAction = 'none';
    let start = null, dx = 0, dy = 0, disabled = false;
    const setT = (lift) => { node.style.transform = `translate(${dx}px, ${dy}px)` + (lift ? ' scale(1.1)' : ''); };
    function down(e) {
      if (disabled || (opts.enabled && !opts.enabled())) return;
      e.preventDefault(); e.stopPropagation();
      try { node.setPointerCapture(e.pointerId); } catch (_) {}
      const p = toStage(e.clientX, e.clientY);
      start = { x: p.x - dx, y: p.y - dy, id: e.pointerId };
      node.classList.add('dragging');
      node.style.transition = 'none';
      node.style.zIndex = 1000;
      setT(true);
      sfx('pickup');
      if (opts.onStart) opts.onStart(node);
    }
    function move(e) {
      if (!start || e.pointerId !== start.id) return;
      const p = toStage(e.clientX, e.clientY);
      dx = p.x - start.x; dy = p.y - start.y;
      setT(true);
      if (opts.onMove) opts.onMove({ x: p.x, y: p.y, el: node });
    }
    function up(e) {
      if (!start || e.pointerId !== start.id) return;
      const p = toStage(e.clientX, e.clientY);
      start = null;
      node.classList.remove('dragging');
      const ctrl = {
        x: p.x, y: p.y, el: node,
        back() {
          node.style.transition = 'transform .4s cubic-bezier(.3,1.5,.5,1)';
          dx = 0; dy = 0; node.style.transform = '';
          setTimeout(() => { node.style.zIndex = ''; }, 400);
        },
        snapTo(target) {
          const a = stageRect(node), b = stageRect(target);
          dx += b.cx - a.cx; dy += b.cy - a.cy;
          node.style.transition = 'transform .25s ease-out';
          setT(false);
          node.style.zIndex = '';
        },
        stay() { setT(false); node.style.zIndex = ''; },
        lock() { disabled = true; node.classList.remove('draggable'); node.classList.add('locked'); },
      };
      if (opts.onDrop) opts.onDrop(ctrl); else ctrl.back();
    }
    node.addEventListener('pointerdown', down);
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
    const handle = {
      disable() { disabled = true; node.classList.remove('draggable'); },
      enable() { disabled = false; node.classList.add('draggable'); },
      reset() { dx = 0; dy = 0; node.style.transform = ''; },
      destroy() {
        node.removeEventListener('pointerdown', down);
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
      },
    };
    if (track) track(handle.destroy);
    return handle;
  }
  Castle.makeDraggable = makeDraggable;

  /* ------------------------------------------------------------------
     Modal (used for room completion, settings, etc.)
     ------------------------------------------------------------------ */
  function showModal(content, opts) {
    opts = opts || {};
    modalEl.innerHTML = '';
    const card = el('div', { class: 'modal-card' + (opts.wide ? ' wide' : '') + (opts.bare ? ' bare' : '') });
    if (typeof content === 'string') card.innerHTML = content; else card.appendChild(content);
    modalEl.appendChild(card);
    modalEl.classList.add('show');
    return card;
  }
  function hideModal() { modalEl.classList.remove('show'); modalEl.innerHTML = ''; }
  Castle.showModal = showModal;
  Castle.hideModal = hideModal;

  /* ------------------------------------------------------------------
     HUD
     ------------------------------------------------------------------ */
  let backBtn, jewelTray, voiceBtn, musicBtn;
  const ICONS = {
    castle: `<svg viewBox="0 0 64 64" width="46" height="46"><path d="M8 58V22h8v6h6v-6h8v6h4v-6h8v6h6v-6h8v36H38V44a6 6 0 0 0-12 0v14z" fill="#fff" stroke="#3a2a1a" stroke-width="4" stroke-linejoin="round"/></svg>`,
    voiceOn: `<svg viewBox="0 0 64 64" width="34" height="34"><path d="M10 24h10l14-12v40L20 40H10z" fill="#fff" stroke="#3a2a1a" stroke-width="4" stroke-linejoin="round"/><path d="M42 22c5 5 5 15 0 20M48 16c9 9 9 23 0 32" fill="none" stroke="#3a2a1a" stroke-width="4" stroke-linecap="round"/></svg>`,
    voiceOff: `<svg viewBox="0 0 64 64" width="34" height="34"><path d="M10 24h10l14-12v40L20 40H10z" fill="#fff" stroke="#3a2a1a" stroke-width="4" stroke-linejoin="round"/><path d="M42 24l14 16M56 24L42 40" stroke="#3a2a1a" stroke-width="4" stroke-linecap="round"/></svg>`,
    musicOn: `<svg viewBox="0 0 64 64" width="34" height="34"><path d="M24 46V14l26-6v32" fill="none" stroke="#3a2a1a" stroke-width="5" stroke-linejoin="round"/><ellipse cx="18" cy="47" rx="8" ry="6" fill="#fff" stroke="#3a2a1a" stroke-width="4"/><ellipse cx="44" cy="41" rx="8" ry="6" fill="#fff" stroke="#3a2a1a" stroke-width="4"/></svg>`,
    musicOff: `<svg viewBox="0 0 64 64" width="34" height="34"><path d="M24 46V14l26-6v32" fill="none" stroke="#3a2a1a" stroke-width="5" stroke-linejoin="round" opacity=".45"/><ellipse cx="18" cy="47" rx="8" ry="6" fill="#fff" stroke="#3a2a1a" stroke-width="4" opacity=".45"/><ellipse cx="44" cy="41" rx="8" ry="6" fill="#fff" stroke="#3a2a1a" stroke-width="4" opacity=".45"/><path d="M8 8l48 48" stroke="#e8423f" stroke-width="6" stroke-linecap="round"/></svg>`,
    full: `<svg viewBox="0 0 64 64" width="32" height="32"><path d="M10 24V10h14M40 10h14v14M54 40v14H40M24 54H10V40" fill="none" stroke="#3a2a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  function buildHud() {
    backBtn = el('button', { class: 'hud-btn back-btn', title: 'Back to the castle', 'aria-label': 'Back to the castle', html: ICONS.castle,
      onclick: () => { sfx('click'); Castle.go('map'); } });
    jewelTray = el('div', { class: 'jewel-tray', title: 'Crown jewels found' });
    voiceBtn = el('button', { class: 'hud-btn small', 'aria-label': 'Voice on/off', onclick: () => {
      state.voice = !state.voice; save(); updateHud(); if (!state.voice) hush(); sfx('click');
    } });
    musicBtn = el('button', { class: 'hud-btn small', 'aria-label': 'Music on/off', onclick: () => {
      state.music = !state.music; save(); updateHud(); sfx('click');
      if (state.music && musicWanted) startMusic(); else stopMusic();
    } });
    const fullBtn = el('button', { class: 'hud-btn small', 'aria-label': 'Full screen', html: ICONS.full, onclick: () => {
      sfx('click');
      if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen && document.exitFullscreen();
    } });
    hudEl.append(backBtn, el('div', { class: 'hud-right' }, [jewelTray, voiceBtn, musicBtn, fullBtn]));
    updateHud();
  }
  function updateHud() {
    if (!jewelTray) return;
    jewelTray.innerHTML = '';
    JEWEL_ORDER.forEach(k => {
      const slot = el('div', { class: 'jewel-slot' + (state.jewels[k] ? ' got' : ''), 'data-jewel': k });
      slot.innerHTML = state.jewels[k] ? jewelSVG(k, 40) : '';
      jewelTray.appendChild(slot);
    });
    voiceBtn.innerHTML = state.voice ? ICONS.voiceOn : ICONS.voiceOff;
    musicBtn.innerHTML = state.music ? ICONS.musicOn : ICONS.musicOff;
  }
  Castle.updateHud = updateHud;
  function setHud(opts) {
    hudEl.classList.toggle('hidden', !!opts.hidden);
    backBtn.style.visibility = opts.back ? 'visible' : 'hidden';
    jewelTray.style.visibility = opts.tray === false ? 'hidden' : 'visible';
  }

  /* Pip the dragon (guide) */
  const PIP_SVG = `
  <svg viewBox="0 0 200 200" width="170" height="170" class="pip">
    <g class="pip-body">
      <path class="pip-wing" d="M118 92 C150 50 186 62 190 78 C172 76 168 92 176 104 C160 98 150 112 156 124 C140 116 128 118 120 120 Z" fill="#ffc928" stroke="#3a2a1a" stroke-width="5" stroke-linejoin="round"/>
      <path d="M60 170 C40 176 20 168 14 150 C26 158 40 156 52 148" fill="#3fb950" stroke="#3a2a1a" stroke-width="5" stroke-linejoin="round"/>
      <ellipse cx="96" cy="140" rx="48" ry="44" fill="#3fb950" stroke="#3a2a1a" stroke-width="5"/>
      <ellipse cx="96" cy="150" rx="28" ry="28" fill="#c9f7a8" stroke="#3a2a1a" stroke-width="4"/>
      <path d="M80 136h32M78 150h36M82 164h28" stroke="#8fd16b" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="70" cy="182" rx="16" ry="9" fill="#3fb950" stroke="#3a2a1a" stroke-width="5"/>
      <ellipse cx="122" cy="182" rx="16" ry="9" fill="#3fb950" stroke="#3a2a1a" stroke-width="5"/>
      <g class="pip-head">
        <path d="M64 46 L58 18 L78 38 Z M110 40 L122 14 L126 44 Z" fill="#ff8c2b" stroke="#3a2a1a" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="94" cy="72" rx="50" ry="40" fill="#3fb950" stroke="#3a2a1a" stroke-width="5"/>
        <ellipse cx="128" cy="86" rx="26" ry="18" fill="#5ccf6a" stroke="#3a2a1a" stroke-width="4"/>
        <circle cx="136" cy="80" r="3" fill="#3a2a1a"/><circle cx="146" cy="84" r="3" fill="#3a2a1a"/>
        <g class="pip-eyes">
          <ellipse cx="76" cy="64" rx="13" ry="15" fill="#fff" stroke="#3a2a1a" stroke-width="4"/>
          <ellipse cx="108" cy="60" rx="13" ry="15" fill="#fff" stroke="#3a2a1a" stroke-width="4"/>
          <circle cx="80" cy="66" r="6" fill="#3a2a1a"/><circle cx="112" cy="62" r="6" fill="#3a2a1a"/>
          <circle cx="82" cy="63" r="2" fill="#fff"/><circle cx="114" cy="59" r="2" fill="#fff"/>
        </g>
        <ellipse cx="60" cy="86" rx="8" ry="5" fill="#ff8fb0" opacity=".8"/>
        <path class="pip-mouth" d="M104 96 Q118 106 132 98" fill="#7a1f2b" stroke="#3a2a1a" stroke-width="4" stroke-linecap="round"/>
      </g>
    </g>
  </svg>`;

  /* ------------------------------------------------------------------
     Scene manager + room API
     ------------------------------------------------------------------ */
  let current = null;
  let busy = false;

  function teardown() {
    if (current) {
      current.alive = false;
      current.cleanups.forEach(f => { try { f(); } catch (e) { console.error(e); } });
      if (current.def && current.def.exit) { try { current.def.exit(); } catch (e) { console.error(e); } }
      current = null;
    }
    sceneEl.innerHTML = '';
    hideModal();
    hush();
    particles = [];
  }

  function makeApi(ctx, root) {
    const never = () => new Promise(() => {});
    const track = fn => ctx.cleanups.push(fn);
    const api = {
      root,
      W, H,
      get difficulty() { return state.difficulty; },
      get alive() { return ctx.alive; },
      el, svg, rand, pick, shuffle,
      jewelSVG,
      say(text, opts) { return ctx.alive ? say(text, opts) : never(); },
      hush() { if (ctx.alive) hush(); },
      sfx(name) { if (ctx.alive) sfx(name); },
      note(n, dur, instrument) { if (ctx.alive) playNote(n, dur, instrument); },
      noteFreq,
      wait(ms) {
        return ctx.alive ? new Promise(res => { const t = setTimeout(() => { if (ctx.alive) res(); }, ms); track(() => clearTimeout(t)); }) : never();
      },
      setTimeout(fn, ms) { const t = setTimeout(() => { if (ctx.alive) fn(); }, ms); track(() => clearTimeout(t)); return t; },
      setInterval(fn, ms) { const t = setInterval(() => { if (ctx.alive) fn(); }, ms); track(() => clearInterval(t)); return t; },
      on(target, evt, fn, o) { target.addEventListener(evt, fn, o); track(() => target.removeEventListener(evt, fn, o)); },
      onCleanup: track,
      celebrate(x, y, n) { if (ctx.alive) confetti(x, y, n || 70, 0.8); },
      sparkle(x, y, n) { if (ctx.alive) sparkles(x, y, n); },
      sparkleAt(node) { if (ctx.alive) { const r = stageRect(node); sparkles(r.cx, r.cy, 22); } },
      toStage, stageRect, hitTest,
      draggable(node, opts) { return makeDraggable(node, opts, track); },
      sprite(src, o) { return makeSprite(src, o, track); },
      img: makeImg,
      praise() {
        return api.say(pick(['Great job!', 'Hooray!', 'You did it!', 'Wonderful!', 'Super!', 'Way to go!', 'Fantastic!', 'Brilliant!']));
      },
      encourage() {
        return api.say(pick(['Oops! Try again.', 'Not quite. You can do it!', 'Almost! Try another one.', 'Hmm, let\'s try again!']));
      },
      complete() { if (ctx.alive && !ctx.completed) { ctx.completed = true; roomComplete(ctx); } },
      back() { if (ctx.alive) Castle.go('map'); },
      replay() { if (ctx.alive) Castle.go(ctx.id); },
    };
    return api;
  }

  function roomComplete(ctx) {
    const def = ctx.def;
    const kind = def.jewel;
    const first = !state.jewels[kind];
    state.jewels[kind] = true;
    state.plays[def.id] = (state.plays[def.id] || 0) + 1;
    save();
    sfx('fanfare');
    confetti(W / 2, H / 3, 160);
    const j = JEWELS[kind];
    const all = Castle.jewelCount() === JEWEL_ORDER.length;
    const card = el('div', { class: 'complete' }, [
      el('div', { class: 'complete-jewel', html: jewelSVG(kind, 170) }),
      el('h2', { text: first ? `You found the ${j.name}!` : 'You did it again!' }),
      el('div', { class: 'stars' }, [1, 2, 3].map(i => el('span', { class: 'star-pop', style: { animationDelay: (0.3 + i * 0.25) + 's' }, text: '★' }))),
      el('div', { class: 'btn-row' }, [
        el('button', { class: 'big-btn green', html: '<span class="ico">↻</span> Play again', onclick: () => { sfx('click'); Castle.go(def.id); } }),
        el('button', { class: 'big-btn ' + (all && !state.finale ? 'gold pulse' : 'blue'),
          html: all && !state.finale ? '<span class="ico">👑</span> To the King!' : '<span class="ico">🏰</span> Castle',
          onclick: () => { sfx('click'); Castle.go(all && !state.finale ? 'throne' : 'map'); } }),
      ]),
    ]);
    showModal(card);
    updateHud();
    const remaining = JEWEL_ORDER.length - Castle.jewelCount();
    let line;
    if (first && all) line = `You found the ${j.name}! That's all six jewels! Let's take them to the King!`;
    else if (first) line = `Hooray! You found the ${j.name}! ${remaining === 1 ? 'Only one more jewel to find!' : 'Let\'s find more jewels!'}`;
    else line = pick(['You did it again! Great playing!', 'Wow, you are so good at this!', 'Super job! Want to play again?']);
    say(line);
  }

  Castle.registerRoom = function (def) {
    if (!def || !def.id) throw new Error('registerRoom needs an id');
    Castle.rooms[def.id] = def;
  };
  Castle.registerScene = function (name, fn) { Castle.scenes[name] = fn; };

  Castle.go = function (name) {
    if (busy) return;
    busy = true;
    sfx('whoosh');
    stage.classList.add('fade');
    setTimeout(() => {
      teardown();
      const ctx = { id: name, alive: true, cleanups: [], completed: false };
      current = ctx;
      const root = el('div', { class: 'scene scene-' + name });
      sceneEl.appendChild(root);
      const api = makeApi(ctx, root);
      try {
        if (Castle.rooms[name]) {
          ctx.def = Castle.rooms[name];
          setHud({ back: true });
          Castle.music.stop();
          ctx.def.enter(root, api);
        } else if (Castle.scenes[name]) {
          Castle.scenes[name](root, api, ctx);
        } else {
          console.warn('Unknown scene', name);
          Castle.scenes.map && Castle.scenes.map(root, api, ctx);
        }
      } catch (e) {
        console.error(e);
        root.appendChild(el('div', { class: 'error-note', text: 'Oops! This room fell over. Tap the castle to go back.' }));
      }
      stage.classList.remove('fade');
      busy = false;
    }, 260);
  };
  Castle.setHud = function (o) { setHud(o); };

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    stage = document.getElementById('stage');
    sceneEl = el('div', { id: 'scene' });
    fxCanvas = el('canvas', { id: 'fx', width: W, height: H });
    fxCtx = fxCanvas.getContext('2d');
    hudEl = el('div', { id: 'hud' });
    guideEl = el('div', { id: 'guide', title: 'Tap Pip to hear that again' });
    guideEl.innerHTML = PIP_SVG;
    bubbleEl = el('div', { id: 'bubble' });
    bubbleWho = el('div', { class: 'who' });
    bubbleText = el('div', { class: 'text' });
    bubbleEl.append(bubbleWho, bubbleText);
    modalEl = el('div', { id: 'modal' });
    stage.append(sceneEl, guideEl, bubbleEl, hudEl, modalEl, fxCanvas);
    guideEl.addEventListener('click', () => { sfx('giggle'); guideEl.classList.add('hop'); setTimeout(() => guideEl.classList.remove('hop'), 500); Castle.repeat(); });
    buildHud();
    layout();
    window.addEventListener('resize', layout);
    // Unlock audio on the first interaction anywhere
    const unlock = () => { audio(); if (musicWanted) startMusic(); };
    window.addEventListener('pointerdown', unlock, { once: true });
    Castle.go('title');
  }
  Castle.guide = {
    show() { guideEl.classList.remove('away'); },
    hide() { guideEl.classList.add('away'); },
    el: () => guideEl,
  };
  Castle.ICONS = ICONS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
