# Pixel Art Pilot — Design Spec

**Date:** 2026-10-04
**Status:** Approved in brainstorming, pending spec review
**Scope:** Royal Kitchen room + Pip the guide

## Goal

Replace the hand-coded SVG art (geometric primitives, flat fills, uniform
outlines) with real **hi-bit pixel art in the style of Dave the Diver**,
produced with Google Gemini and cleaned up by a script. Prove the full
pipeline on one room before rolling it out to the rest of the game.

## Decisions

| Decision | Choice |
|---|---|
| Art source | AI image generation, the user generates the images in **Google Gemini / Imagen** |
| Style | Full pixel art, like Dave the Diver (characters, props and backgrounds) |
| Art resolution | **640×360** logical art pixels, shown at exactly **2×** on the 1280×720 stage |
| Palette | One shared palette of about 48 colors, taken from the Kitchen background and then locked |
| Animation | Frame swaps from sprite sheets. No rotation or smooth scaling of pixel art |
| Pilot scope | Kitchen room (background, props, Cook Clementine, ingredients) + Pip |

## 1. Art pipeline

```
Gemini (user) → art/raw/*.png → tools/pixelize.py → assets/**/*.png → game
```

### tools/pixelize.py

A Python 3 + Pillow developer tool. It is not shipped to players and not
loaded by the game.

Input: a raw Gemini image plus a target size in art pixels (for example
`--size 640x360` for a background, `--size 192x48 --frames 4` for a 4-frame
sheet of 48×48 cells).

Steps:
1. **Downsample to the grid.** Split the source into target-sized cells and
   take the *most common* color in each cell (not the average), so edges stay
   crisp and no in-between colors appear.
2. **Palette lock.** Snap every pixel to the nearest color in
   `assets/palette.png` (no dithering). Skipped in `--extract-palette` mode.
3. **Background removal (sprites only, `--key`).** Flood-fill from the image
   border, removing pixels close to the key color (default magenta `#ff00ff`,
   with a tolerance setting). Then remove stray 1-pixel fringe left from the
   key color.
4. Write an RGBA PNG to the output path.

Modes:
- `--extract-palette N`: run median-cut on the downsampled image to produce
  `assets/palette.png` (N colors, one pixel per color). Used once, on the
  style-anchor background.
- `--preview`: also write a nearest-neighbor 4× upscale next to the output,
  for viewing.

### Asset layout

```
art/
  STYLE.md            style guide
  CHECKLIST.md        every pilot asset, with a checkbox
  prompts/kitchen.md  Gemini prompts, one per asset
  raw/                untouched Gemini output (committed, for reproducibility)
assets/
  palette.png
  common/pip.png
  kitchen/bg.png, fire.png, pot.png, soup.png, bubble.png, basket.png,
          cat.png, bird.png,
          pans.png, clementine.png, ingredients.png
tools/
  pixelize.py
  test_pixelize.py
```

Assets are plain PNGs referenced by relative path, so opening `index.html`
from the file system keeps working offline. `ROOM_API.md` changes from "no
external assets" to "no network assets: local files under `assets/` are fine".

### Consistency in Gemini

- The Kitchen background is generated first and approved as the **style
  anchor**. Every later prompt attaches it as a reference image.
- Character sprites are generated as one clean base pose per character, and
  later prompts for that character attach its approved base sprite.
- Sprites are requested on a flat magenta (`#ff00ff`) background, with frames
  in a horizontal row of equal cells.

## 2. Rendering and animation

### api.sprite (new, in engine.js)

```js
const s = api.sprite('assets/kitchen/cat.png', {
  frame: [64, 48],               // cell size in ART pixels
  anims: { idle: [0, 1], react: [2, 3, 4] },
  fps: 6,                        // default for all anims
  x: 120, y: 300,                // stage px (positioned absolutely)
});
root.appendChild(s.el);
s.play('react', { once: true }).then(() => s.play('idle'));
```

- `s.el` is a div with the sheet as `background-image`, sized at 2×
  (frame × 2 stage px), with `image-rendering: pixelated`.
- Frames advance by setting `background-position` in whole-frame steps, driven
  by `api.setInterval` so it is cleaned up when the room exits.
- `play(name, {once})` switches animation. With `once`, it returns a Promise
  that resolves after the last frame. Otherwise it loops.
- `stop()` holds the current frame.
- `api.img(src, {x, y})` helper for still pixel images (also 2×, pixelated).

### Pip

The SVG Pip in engine.js is replaced by an `api.sprite`-style element using
`assets/common/pip.png` (idle 2, blink 1, talk 2). The engine's existing
`talking` class toggle drives `play('talk')` / `play('idle')`. A random blink
plays every 3–6 s while idle.

### Motion rules

- Moves happen in whole art pixels (2 stage px). No rotation or smooth scaling
  of pixel art.
- Shared feedback classes (`.wiggle`, `.bounce`) stay for the pilot but use
  `steps()` timing on pixel sprites. We judge during play-testing whether they
  hold up.
- Drag behavior from `api.draggable` (fly home, snap) is unchanged.

## 3. Kitchen rebuild

The puzzle logic, rounds, difficulty scaling, speech and audio in
`js/rooms/kitchen.js` stay the same. Only the art changes:

| Element | Old | New | Frames |
|---|---|---|---|
| Room background | `bgSVG()` | `kitchen/bg.png` 640×360 | 1 |
| Fire | `FIRE_SVG` + CSS flicker | `fire.png` | 4-frame loop |
| Soup pot | `POT_SVG` | `pot.png` + `bubble.png` | 1 + 3 |
| Cat | `CAT_SVG` | `cat.png` | idle 2, react 3 |
| Bird | `BIRD_SVG` | `bird.png` | idle 2, hop 3 |
| Pans | `PAN_SVGS` | `pans.png` | idle 1, swing 4 |
| Cook Clementine | `CC_SVG` | `clementine.png` | idle 2, blink 1, talk 2, wave 2 |
| 8 ingredients | `ART` map | `ingredients.png`, 48×48 cells | 1 each |
| Baskets | `BASKET_*` | `basket.png` (back + front halves as 2 frames) | 2 |
| Recipe card | HTML/CSS | same, with a pixel-style CSS border and stepped entrance | n/a |

The soup color tint (which mixes ingredient colors into the broth) is kept:
`soup.png` is a mask of the soup surface, filled through CSS `mask-image` with
the mixed color snapped to the nearest palette color.

Interactive positions (`POS`, `SOUP`, `CC_HEAD`) stay in stage px. If the new
art moves something, these constants are adjusted to match. Hit targets stay
≥ 90 stage px.

Removed SVG art constants and helpers are deleted from `kitchen.js`. The old
versions remain in git history.

### Fallback

If a PNG fails to load, the sprite element keeps its size and position, so
drag targets and hit tests still work and the puzzle can still be finished.
No placeholder art is drawn.

## 4. Style guide contents (art/STYLE.md)

- Hi-bit pixel art in the style of Dave the Diver: chunky, expressive,
  friendly; bold dark outlines on characters and props, softer edges on the
  background.
- Warm lighting from the upper left; cozy and saturated, never dark or scary.
- Camera: straight-on room view, slightly raised; floor visible.
- Characters: big heads, big eyes, simple readable silhouettes, about 1:2
  head-to-body ratio.
- Don'ts: no text in images, no gradients that won't survive the palette, no
  photorealism, no anti-aliased soft edges on sprites.

## 5. Workflow

1. **Me:** write `STYLE.md`, `prompts/kitchen.md`, `CHECKLIST.md`,
   `pixelize.py` + tests.
2. **User:** generate the Kitchen background and save it to `art/raw/`.
3. **Me:** pixelize it and extract the palette. **User:** approve the look and
   palette (repeat until right). Palette is then locked.
4. **User:** generate Pip and Clementine base sprites, then the props.
5. **Me:** clean up, make blink and talk frames (pixel edits or Gemini edits),
   build `api.sprite`, swap Pip, rebuild the Kitchen.
6. **Both:** play-test and adjust. Then plan the rollout to the other rooms.

## 6. Testing

- `tools/test_pixelize.py`: a synthetic image with known blocks (jittered
  block edges + noise) comes back as exactly the expected grid; every output
  pixel is in the palette or fully transparent; magenta keying removes the
  background but not interior magenta-ish pixels that aren't connected to the
  border.
- Browser checks: `api.sprite` frame positions and play/stop/once; Kitchen
  played at all three difficulties; drag and drop and taps land correctly; no
  important targets under Pip's speech bubble; no console errors; works over
  `file://`; screenshots taken for the user to judge.

## Out of scope

Other five rooms, title screen, castle map, throne room, shared HUD and
fonts. Each is a later pass using the same pipeline.
