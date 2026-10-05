# Castle Quest — Room API contract

Every puzzle room is ONE file: `js/rooms/<id>.js`. Plain script (no ES modules,
no imports, no build step, no network assets; local images under `assets/` are fine). The game must work by
double-clicking `index.html` (file://). Wrap your file in an IIFE.

```js
(function () {
  'use strict';
  Castle.registerRoom({
    id: 'kitchen',            // must match file name
    title: 'Royal Kitchen',
    jewel: 'ruby',            // ruby | sapphire | amethyst | emerald | topaz | diamond
    enter(root, api) { ... }, // build the room into `root`
    exit() {},                // optional; api cleanups already run automatically
  });
})();
```

## The stage
- Logical size is **1280 x 720 px**. `root` is an absolutely positioned div filling
  the stage; position children absolutely in stage pixels. The engine scales it.
- Reserved areas — keep interactive things out of them:
  - **Top-left** 110x110: castle/back button. **Top-right** ~560x90: jewel tray + toggles.
  - **Bottom-left** 190x180: Pip the dragon guide. Speech bubble appears to Pip's right
    along the bottom (x 180–900, y ~590–700) for a few seconds; it has
    `pointer-events:none` but covers art, so do not put essential targets below y≈585
    in x 180–900. Decorative art can go anywhere.
- CSS classes you may use (from css/style.css): `.room-title` (big heading at top-left, x≈118, right of the back button;
  add it as a div), `.round-dots` (container of `<span>`s, add `.done`), `.tap`
  (hover/press scale), `.wiggle`, `.bounce`, `.glow`, `.big-btn` (+ `.green .red .yellow
  .purple .blue .gold`), `.pulse`.
- CSS vars: `--red --blue --yellow --green --purple --orange --pink --sky --cream
  --paper --stone --stone-dark --wood --wood-dark --ink` (ink = outline #3a2a1a).
- Room-specific CSS: inject one `<style>` element into `root` (it is removed when the
  room is left). Prefix all selectors with `.scene-<id>` (root has class `scene scene-<id>`).

## Art style (match the 1996 Fisher-Price CD-ROM feel)
Rooms are being converted to hi-bit pixel art. See `art/STYLE.md` and the pipeline in `art/CHECKLIST.md`. The Kitchen is the reference room. Rooms not yet converted keep the SVG style below.

Bright, chunky, friendly. Flat saturated colors, **thick dark outlines**
(`stroke="#3a2a1a"` width 4–6, round joins), rounded shapes, simple shading blobs,
happy faces with big eyes. Draw everything with inline SVG (or CSS). Fill the whole
1280x720 background with a rich illustrated room (walls, floor, furniture, windows,
details). Add little idle animations (flickering fire, swaying banner, blinking
character) and **clickable fun surprises** (tap the cat → meow + wiggle, etc.) — kids
love poking things. No emoji as primary art (OK as small accents).

## api (second argument to enter)
| member | what it does |
|---|---|
| `api.difficulty` | 1 = ages 3–5, 2 = ages 5–7, 3 = ages 7–9. Must change the puzzle meaningfully. |
| `api.say(text, {who, pitch, rate})` → Promise | Speaks text aloud (speech synthesis) + caption bubble. `who` sets the name label (default "Pip"); give room characters their own `who` and a different `pitch` (0.6–1.6). Resolves when speech ends. Keep lines SHORT and simple: kids can't read. |
| `api.hush()` | Stop speech. |
| `api.sfx(name)` | `click pop pickup drop correct wrong boing sparkle chime whoosh drum plop splash coin giggle roar fanfare` |
| `api.note(note, durSec, instrument)` | Play a pitch, e.g. `'C5'`, `'F#4'`; instruments `bell pluck flute horn` or an oscillator type. |
| `api.wait(ms)` → Promise | Delay. |
| `api.setTimeout / api.setInterval / api.on(target, evt, fn)` | Auto-cleaned when the room exits. ALWAYS use these instead of raw timers/listeners. |
| `api.onCleanup(fn)` | Register extra cleanup. |
| `api.el(tag, attrs, children)` | DOM helper. attrs: `class`, `style` (object), `html`, `text`, `onclick`... |
| `api.svg(markup)` → Element | Parse an SVG/HTML string into one element. |
| `api.sprite(src, {frame:[w,h], anims, fps, cols, scale, class, x, y, blink})` → Sprite | Pixel sprite sheet (one row of equal frames, art px; shown at 2×). `anims` maps names to frame lists or `{frames, fps}`; `idle` auto-plays. Sprite: `el`, `anim`, `frame(i)`, `play(name, {once, then, fps})` → Promise, `stop()`. Timers auto-clean. Use `Castle.sprite(src, opts).frame(i)` for static frames that don't need room cleanup. |
| `api.img(src, {w, h, x, y, class})` | Still pixel image at 2×. |
| `api.rand(n) / api.pick(arr) / api.shuffle(arr)` | Random helpers (shuffle returns a copy). |
| `api.draggable(el, {onStart, onMove, onDrop, enabled})` → handle | Pointer drag (mouse+touch). `el` should be absolutely positioned. `onDrop(d)` gets `{x, y, el, back(), snapTo(targetEl), stay(), lock()}` — x/y is the drop point in stage px. Call `d.back()` to fly home, `d.snapTo(target)` to center on a target, `d.lock()` to make it un-draggable. Handle: `disable() enable() reset()`. |
| `api.hitTest(x, y, el, pad=20)` | Is stage point inside el's box? |
| `api.stageRect(el)` | `{x,y,w,h,cx,cy}` in stage px. |
| `api.celebrate(x, y, n)` | Confetti burst. `api.sparkle(x,y,n)`, `api.sparkleAt(el)`. |
| `api.praise()` / `api.encourage()` | Random "Great job!" / gentle "Try again!" lines (Promises). |
| `api.complete()` | Puzzle finished: engine awards the jewel, shows the celebration card with Play again / Castle buttons. Call ONCE after the final round. |
| `api.jewelSVG(kind, size)` | Markup string for a jewel. |
| `api.alive` | false after the player left; `say/wait` from a dead room never resolve, so async flows simply stop. |

## Design rules for kids under 10
- Every instruction is spoken. Clicking Pip repeats the last line automatically.
- Huge targets (≥ 90 px), drag OR tap where possible.
- Mistakes are never punished: gentle `wrong`/`boing` sfx + wiggle + encouragement, item
  returns. After 2–3 misses on the same step, give a hint (highlight the answer with `.glow`).
- Structure: a short intro by the room's character → **3 rounds** (show progress with
  `.round-dots`) → `api.complete()`. Rounds are randomized so replays differ.
- Don't block input while speech plays (kids click immediately); just guard against
  double-handling.
- Difficulty must scale (bigger numbers, longer sequences, more choices, etc.).
- No timers that pressure the child. No fail states.
- Keep everything self-contained in your file. No network requests.
