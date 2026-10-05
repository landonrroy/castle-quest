# Pixel Art Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Royal Kitchen's and Pip's hand-coded SVG art with true hi-bit pixel art (Dave the Diver style) generated in Google Gemini and cleaned up by a script. This proves the pipeline before rolling it out to the other rooms.

**Architecture:** A Python developer tool (`tools/pixelize.py`) turns raw Gemini images into true-grid, palette-locked PNGs under `assets/`. The engine gains a small sprite-sheet helper (`api.sprite` / `api.img`) that shows frames at 2× with `image-rendering: pixelated`. The Kitchen's SVG constants are swapped for these sprites, and the puzzle logic is untouched.

**Tech Stack:** Plain browser JS (no build, no modules, runs from `file://`), CSS, Python 3.12 + Pillow + pytest (tooling only), Google Gemini (image generation, done by the user).

**Spec:** `docs/superpowers/specs/2026-10-04-pixel-art-pilot-design.md`

## Global Constraints

- Art grid: **640×360** art px, shown at exactly **2×** on the 1280×720 stage (1 art px = 2 stage px).
- One shared palette of **48 colors** (`assets/palette.png` + generated `js/palette.js`), extracted from the Kitchen background, then locked.
- Sprite backgrounds are flat **magenta `#ff00ff`**. The pot's soup surface is flat **cyan `#00ffff`** (it becomes a transparent hole).
- Sheets are one horizontal row of equal frames.
- No rotation or smooth scaling of pixel art, except the existing shared `.wiggle`/`.bounce` feedback and the pan swing, which use `steps()` timing (see Spec adjustments).
- Game stays a plain-script, no-build, offline page: assets are local PNGs only, no network requests, and it still works when opened by double-clicking `index.html`.
- Hit targets stay ≥ 90 stage px. Nothing important goes under Pip's speech bubble (x 180–900, y > 585).
- Room code must use `api.setTimeout/setInterval/on` (auto-cleaned), never raw timers. The engine-level Pip sprite is the one exception (it lives for the whole session).
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Spec adjustments (decided while planning)

1. **Pans:** `pans.png` is 3 frames (one per pan), not idle+swing frames. Swing reuses the existing rotation keyframes with `steps(1,end)` timing. The spec already allows this for shared feedback and play-testing will judge it. Reason: four rotated frames per pan would be 12 extra generations for a small decoration.
2. **Pot:** 2 frames (normal face, burp face), because the current pot has a face that opens its mouth on a burp.
3. **Clementine:** 8 frames, which adds `taste` and `yum` to the spec's idle 2 / blink 1 / talk 2 / wave 2, because the existing round-end sequence shows those two poses.
4. **No separate `sheet` command:** `pixelize.py sprite` takes several raw frames and writes the sheet directly, using one shared crop box so animation frames stay aligned.
5. **Palette command name:** the spec's `--extract-palette N` mode is the `palette` subcommand, which also writes `js/palette.js` so the game can snap soup colors (a `file://` page can't read PNG pixels: the canvas is tainted).
6. **Small accents stay code-drawn in the pilot:** steam puffs, splash drops, hearts, the recipe-card bowl icon and pin. They get converted in the rollout.

## File map

| File | Status | Responsibility |
|---|---|---|
| `art/STYLE.md` | create | Style guide shared by every prompt |
| `art/prompts/kitchen.md` | create | Copy-and-paste Gemini prompts for every pilot asset |
| `art/CHECKLIST.md` | create | Every pilot asset: raw file names, pixelize command, checkbox |
| `art/ref/*.png` | create | Layout and pose references cropped from the current game |
| `art/raw/*.png` | create (user) | Untouched Gemini output |
| `.gitignore` | create | Ignore `art/preview/` |
| `.claude/launch.json` | modify | Add a dev server config serving this checkout |
| `tools/pixelize.py` | create | Grid snap, palette, keying, sprite sheets |
| `tools/test_pixelize.py` | create | pytest suite for pixelize |
| `tools/requirements.txt` | create | `pillow>=10` |
| `tools/fixtures/sprite-test.png` | create | 4-frame test sheet for browser checks |
| `assets/palette.png`, `js/palette.js` | generated | Locked palette (PNG for tools, JS for the game) |
| `assets/common/pip.png`, `assets/kitchen/*.png` | generated | Game art |
| `js/engine.js` | modify | `makeSprite`/`makeImg`, `Castle.sprite`, `api.sprite`, `api.img`, Pip sprite |
| `css/style.css` | modify | `.sprite`, `.px`, `.pixel` stepped feedback, Pip CSS |
| `index.html` | modify | Load `js/palette.js` |
| `js/rooms/kitchen.js` | modify | Swap SVG art for sprites |
| `ROOM_API.md`, `README.md` | modify | Document assets, sprite API, pipeline |

## Asset geometry (used by Tasks 1, 6, 7, 8)

| Asset | Cell (art px) | Frames (index: meaning) | Stage box (left, top, w×h) |
|---|---|---|---|
| `kitchen/bg.png` | 640×360 | 1 | 0, 0, 1280×720 |
| `common/pip.png` | 84×84 | 0 idle, 1 breathe, 2 blink, 3 talk | inside `#guide` at 1, 2, 168×168 |
| `kitchen/clementine.png` | 90×200 | 0 idle, 1 breathe, 2 blink, 3 talk, 4 wave A, 5 wave B, 6 taste, 7 yum | 830, 258, 180×400 |
| `kitchen/cat.png` | 64×56 | 0 idle, 1 tail flick, 2–4 react (ears up, meow, happy) | 236, 482, 128×112 |
| `kitchen/bird.png` | 32×28 | 0 idle, 1 peck, 2–4 hop (wings up, mid, down) | 942, 196, 64×56 |
| `kitchen/fire.png` | 150×75 | 0–3 flicker loop (logs included) | 440, 442, 300×150 |
| `kitchen/pot.png` | 160×140 | 0 normal, 1 burp (mouth open) | 430, 280, 320×280 |
| `kitchen/bubble.png` | 16×16 | 0 small, 1 big, 2 pop | over soup |
| `kitchen/pans.png` | 36×46 | 0 frying pan, 1 saucepan, 2 ladle | x−36, 24, 72×92 |
| `kitchen/basket.png` | 60×28 | 0 whole basket, 1 front wall only | slot-relative 0, 64, 120×56 |
| `kitchen/ingredients.png` | 48×48 | 0 carrot, 1 tomato, 2 mushroom, 3 onion, 4 potato, 5 pea pod, 6 apple, 7 cheese | slot-relative 12, 0, 96×96 |

---

### Task 1: Art brief pack (style guide, prompts, checklist, references)

Deliverable: everything the user needs to start generating in Gemini, plus a dev server for this checkout.

**Files:**
- Create: `art/STYLE.md`, `art/prompts/kitchen.md`, `art/CHECKLIST.md`, `art/ref/kitchen-layout.png`, `art/ref/kitchen-full.png`, `art/ref/clementine.png`, `art/ref/pip.png`, `art/ref/cat.png`, `art/ref/pot.png`, `.gitignore`, `tools/requirements.txt`
- Modify: `.claude/launch.json`

**Interfaces:**
- Produces: raw file names in `art/raw/` that Task 6 consumes (listed in CHECKLIST.md below), and references in `art/ref/`.

- [ ] **Step 1: Add a dev server config for this checkout**

The existing `castle` config serves the main checkout on 8642. Add a second one that serves the current directory. In `.claude/launch.json`, add to `configurations`:

```json
    {
      "name": "castle-pixel",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8650"],
      "port": 8650
    }
```

Start it with the preview tool (`preview_start {name: "castle-pixel"}`) and confirm `http://localhost:8650/index.html` shows the title screen.

- [ ] **Step 2: Install tooling deps**

Create `tools/requirements.txt`:

```
pillow>=10
pytest>=8
```

Run: `python -m pip install -r tools/requirements.txt`
Expected: Pillow installs, and `python -c "import PIL; print(PIL.__version__)"` prints ≥ 10.

Create `.gitignore`:

```
art/preview/
__pycache__/
.pytest_cache/
```

- [ ] **Step 3: Capture reference images from the current game**

In the preview tab, set the viewport to exactly 1280×720 (`resize_window {width:1280, height:720}`) so the stage fills it 1:1. Enter the kitchen and silence it:

```js
Castle.go('kitchen'); await new Promise(r => setTimeout(r, 1500)); Castle.hush();
document.getElementById('modal').style.display = 'none';
'ok'
```

Screenshot it (full scene) and copy the saved screenshot file to `art/ref/kitchen-full.png`. The screenshot tool prints the saved path. Convert it with `python -c "from PIL import Image; Image.open(r'<path>').convert('RGB').save('art/ref/kitchen-full.png')"`.

Then hide everything except the background SVG and screenshot again into `art/ref/kitchen-layout.png`:

```js
document.querySelectorAll('.scene-kitchen > *:not(.k-bg):not(style)').forEach(n => n.style.visibility = 'hidden');
['hud', 'guide', 'bubble'].forEach(id => document.getElementById(id).style.visibility = 'hidden');
'ok'
```

If the screenshot isn't 1280×720, resize it to 1280×720 when converting (`.resize((1280, 720))`).

Crop the pose references from `kitchen-full.png` (stage boxes from the geometry table). Pip is at stage (6, 554)–(176, 724), clamped to the image:

```bash
python -c "
from PIL import Image
im = Image.open('art/ref/kitchen-full.png')
for name, box in {'clementine': (820, 250, 1020, 664), 'cat': (226, 470, 376, 600), 'pot': (420, 230, 760, 600), 'pip': (0, 548, 186, 720)}.items():
    im.crop(box).save(f'art/ref/{name}.png')
print('ok')
"
```

Open each crop (Read tool) and confirm it shows the right subject. Reset the viewport with `resize_window {preset: "desktop"}`.

- [ ] **Step 4: Write `art/STYLE.md`**

```markdown
# Castle Quest — Pixel Art Style Guide

Every Gemini prompt starts with the **style block** below. Attach the approved
Kitchen background (`assets/kitchen/bg.png` preview, or `art/raw/kitchen-bg.png`)
as a style reference on every prompt after it has been approved.

## Style block (paste at the start of every prompt)

> Hi-bit pixel art in the style of a modern indie game like Dave the Diver:
> clean chunky pixel clusters, a warm limited palette, bold dark-brown
> (#3a2a1a) outlines on characters and objects, 2–3 tone pixel shading per
> color, cozy warm lighting from the upper left. Cute and friendly for
> children aged 3–9, big expressive eyes, round soft shapes. No text, no
> letters, no numbers, no UI, no watermark, no blur, no smooth gradients,
> no photorealism.

## Rules
- **Camera:** straight-on view of the room, slightly raised; floor visible.
- **Light:** from the upper left; shadows fall down-right.
- **Characters:** big heads, big eyes, simple readable silhouettes, about a
  1:2 head-to-body ratio. Never scary.
- **Sprites:** one subject, centered, whole body visible with a little margin,
  on a flat pure magenta (#ff00ff) background. No shadow on the background,
  no floor.
- **Animation frames:** made by *editing* the approved base frame in Gemini
  ("edit this image: …, keep everything else identical"), so framing and
  size stay the same.
- **Don'ts:** text, gradients, soft glows, anti-aliased edges, drop shadows
  onto the magenta, cropping off any part of the subject.

## Palette
Locked after the Kitchen background is approved: `assets/palette.png`
(48 colors). `tools/pixelize.py` snaps every asset to it, so small color
drift between Gemini images is fine.
```

- [ ] **Step 5: Write `art/prompts/kitchen.md`**

````markdown
# Kitchen pilot — Gemini prompts

How to use: open Gemini (image generation), start each prompt with the
**style block** from `art/STYLE.md`, attach the listed reference images, and
paste the prompt. Save the result **unchanged** as PNG to `art/raw/<file>`.
If Gemini offers an aspect ratio, use the one listed.

Generate in this order. After #1, stop and send it to Claude for the
palette/look approval before doing the rest.

---

## 1. Kitchen background — `kitchen-bg.png` (16:9 landscape)
Attach: `art/ref/kitchen-layout.png`, `art/ref/kitchen-full.png`

```
[style block]
Game background: a cozy medieval castle kitchen, 16:9 landscape. Use the
attached pictures ONLY for composition (where each thing is). Redraw it all
as pixel art.

Keep these areas EMPTY because game objects are added on top later:
- The big stone fireplace in the center: its dark opening is empty (no fire,
  no logs, no pot). The stone hood above it has a metal rack with empty hooks.
- The tall dark wooden shelf unit on the right: three shelves, each with two
  plates standing at the back but the front of each shelf clear; a cupboard
  below.
- The window to the right of the fireplace: the stone sill is empty (blue
  sky and a cloud through the glass).
- The floor area to the right of the fireplace, in front of the shelves, has
  no people.
- The left third of the wall is plain stone (a paper card covers it).

Nice details: a small blue cushion on the floor left of the fireplace,
a woven rug in front of the fireplace, warm checkered red-and-cream floor
tiles, hanging garlic braids, a candle and little jars on the mantel shelf.
```

## 2. Pip — base `pip-0-idle.png` (1:1)
Attach: `art/ref/pip.png`, approved Kitchen background
```
[style block]
Single character sprite on a flat pure magenta (#ff00ff) background:
Pip, a little round baby dragon, the friendly guide of the game. Green body,
pale-green belly with stripes, small yellow wing, two little orange horns,
pink cheeks, big shiny eyes, happy open smile. Sitting, facing slightly
right, whole body visible, centered with a small margin. Same design as the
attached reference, redrawn as pixel art.
```
Frames, each by editing `pip-0-idle.png` ("Edit this image: …, keep everything else identical, same framing, same magenta background"):
- `pip-1-breathe.png`: body very slightly squashed down (breathing in), wing slightly lower
- `pip-2-blink.png`: eyes closed (happy curved lines)
- `pip-3-talk.png`: mouth wide open as if talking

## 3. Cook Clementine — base `cc-0-idle.png` (portrait 9:16 or 2:3)
Attach: `art/ref/clementine.png`, approved Kitchen background
```
[style block]
Single character sprite on a flat pure magenta (#ff00ff) background:
Cook Clementine, a cheerful round castle cook. Tall white chef's hat, brown
hair in a bun, rosy cheeks, big friendly eyes, warm smile, white apron with
a red heart over a blue dress, wooden spoon in her left hand. Standing,
facing the viewer, full body head to shoes, centered with a small margin.
Same design as the attached reference, redrawn as pixel art.
```
Frames by editing `cc-0-idle.png`:
- `cc-1-breathe.png`: shoulders very slightly lower (breathing out)
- `cc-2-blink.png`: eyes closed
- `cc-3-talk.png`: mouth open, talking
- `cc-4-wave-a.png`: right hand raised to shoulder height, waving
- `cc-5-wave-b.png`: right hand raised higher, waving, tilted the other way
- `cc-6-taste.png`: holding the wooden spoon up to her mouth, tasting, a little gold soup on the spoon
- `cc-7-yum.png`: eyes squeezed shut in delight, big smile, spoon lowered

## 4. Cat — base `cat-0-idle.png` (1:1)
Attach: `art/ref/cat.png`
```
[style block]
Single sprite on a flat pure magenta (#ff00ff) background: a small fluffy
cream-colored kitchen cat, curled up sitting, tail wrapped around, sleepy
happy face. No cushion. Whole cat visible, centered.
```
Frames by editing `cat-0-idle.png`:
- `cat-1-tail.png`: tail tip flicked up
- `cat-2-ears.png`: ears perked up, eyes wide open
- `cat-3-meow.png`: mouth open, meowing, eyes closed
- `cat-4-happy.png`: eyes closed happy, little smile

## 5. Bluebird — base `bird-0-idle.png` (1:1)
```
[style block]
Single sprite on a flat pure magenta (#ff00ff) background: a tiny round
bluebird with an orange beak, standing, side view facing left, cheerful.
Whole bird visible, centered.
```
Frames by editing `bird-0-idle.png`:
- `bird-1-peck.png`: head tipped down, pecking
- `bird-2-wings-up.png`: both wings raised, about to hop
- `bird-3-wings-mid.png`: wings spread out level
- `bird-4-wings-down.png`: wings down, feet tucked, mid-hop

## 6. Fire — base `fire-0.png` (16:9 landscape)
```
[style block]
Single sprite on a flat pure magenta (#ff00ff) background: a cheerful
cooking fire for a fireplace, wide and low: a few crossed logs with
bright orange and yellow flames rising from them, glowing embers.
No fireplace, no pot. Centered, whole fire visible.
```
Frames by editing `fire-0.png` ("same logs, only the flames change shape"):
- `fire-1.png`, `fire-2.png`, `fire-3.png`: flames in different flickering shapes, leaning a little left, then tall, then a little right

## 7. Soup pot — base `pot-0.png` (1:1)
Attach: `art/ref/pot.png`
```
[style block]
Single sprite on a flat pure magenta (#ff00ff) background: a big round
black iron cauldron with a cute face on its belly (big eyes, small smile),
two small handles, a wooden spoon sticking out. Seen slightly from above so
the top opening is a wide oval. The soup surface inside the opening is ONE
flat pure cyan (#00ffff) color with no shading and no bubbles. Centered,
whole pot visible.
```
Frames by editing `pot-0.png`:
- `pot-1-burp.png`: the face's mouth wide open like a burp, eyes squeezed. Soup surface stays flat pure cyan.

## 8. Bubbles — `bubble-0.png`, `bubble-1.png`, `bubble-2.png` (1:1, three prompts)
```
[style block]
Single tiny sprite on a flat pure magenta (#ff00ff) background: one soup
bubble, white with a dark outline and a shine dot. [small and round |
big and round | popping, broken into a little splash ring]. Centered.
```

## 9. Pans — `pan-0-frying.png`, `pan-1-saucepan.png`, `pan-2-ladle.png` (portrait, three prompts)
```
[style block]
Single sprite on a flat pure magenta (#ff00ff) background: a shiny copper
[frying pan | saucepan with a lid | ladle] hanging straight down from a
small ring at the top of its handle. Centered, whole object visible.
```

## 10. Basket — `basket.png` (16:9 landscape)
```
[style block]
Single sprite on a flat pure magenta (#ff00ff) background: a wide, shallow,
EMPTY woven wicker basket, seen from the front and slightly above so the
inside rim shows. Centered, whole basket visible.
```

## 11. Ingredients — eight prompts, `ing-<name>.png` (1:1)
Names: `carrot`, `tomato`, `mushroom`, `onion`, `potato`, `peapod`, `apple`, `cheese`.
```
[style block]
Single sprite on a flat pure magenta (#ff00ff) background: one cute
[carrot with green leaves | red tomato with a green star top | brown-capped
mushroom with cream dots | purple onion with green sprouts | brown potato |
open green pea pod showing three peas | green-yellow apple | wedge of yellow
cheese with holes] with a tiny happy face (two dot eyes, pink cheeks, small
smile). Chunky and simple so it reads at a small size. Centered, whole item
visible.
```
After the first ingredient, attach it as a reference to the rest ("same size and style as the attached").
````

- [ ] **Step 6: Write `art/CHECKLIST.md`**

```markdown
# Kitchen pilot — asset checklist

Raw Gemini output goes in `art/raw/`. Commands run from the repo root.
Previews (4×) are written to `art/preview/` for viewing.

## Gate 1: look + palette
- [ ] `kitchen-bg.png` generated
- [ ] palette extracted: `python tools/pixelize.py palette art/raw/kitchen-bg.png`
- [ ] background: `python tools/pixelize.py bg art/raw/kitchen-bg.png assets/kitchen/bg.png --preview`
- [ ] look + palette approved by the user (palette is locked after this)

## Sprites (after Gate 1)
| Done | Asset | Raw files (art/raw/) | Command |
|---|---|---|---|
| [ ] | Pip | pip-0-idle, pip-1-breathe, pip-2-blink, pip-3-talk | `python tools/pixelize.py sprite assets/common/pip.png art/raw/pip-0-idle.png art/raw/pip-1-breathe.png art/raw/pip-2-blink.png art/raw/pip-3-talk.png --cell 84x84 --preview` |
| [ ] | Clementine | cc-0-idle … cc-7-yum (8) | `python tools/pixelize.py sprite assets/kitchen/clementine.png art/raw/cc-0-idle.png art/raw/cc-1-breathe.png art/raw/cc-2-blink.png art/raw/cc-3-talk.png art/raw/cc-4-wave-a.png art/raw/cc-5-wave-b.png art/raw/cc-6-taste.png art/raw/cc-7-yum.png --cell 90x200 --preview` |
| [ ] | Cat | cat-0-idle … cat-4-happy (5) | `python tools/pixelize.py sprite assets/kitchen/cat.png art/raw/cat-0-idle.png art/raw/cat-1-tail.png art/raw/cat-2-ears.png art/raw/cat-3-meow.png art/raw/cat-4-happy.png --cell 64x56 --preview` |
| [ ] | Bird | bird-0-idle … bird-4-wings-down (5) | `python tools/pixelize.py sprite assets/kitchen/bird.png art/raw/bird-0-idle.png art/raw/bird-1-peck.png art/raw/bird-2-wings-up.png art/raw/bird-3-wings-mid.png art/raw/bird-4-wings-down.png --cell 32x28 --preview` |
| [ ] | Fire | fire-0 … fire-3 | `python tools/pixelize.py sprite assets/kitchen/fire.png art/raw/fire-0.png art/raw/fire-1.png art/raw/fire-2.png art/raw/fire-3.png --cell 150x75 --preview` |
| [ ] | Pot | pot-0, pot-1-burp | `python tools/pixelize.py sprite assets/kitchen/pot.png art/raw/pot-0.png art/raw/pot-1-burp.png --cell 160x140 --hole --preview` |
| [ ] | Bubbles | bubble-0 … bubble-2 | `python tools/pixelize.py sprite assets/kitchen/bubble.png art/raw/bubble-0.png art/raw/bubble-1.png art/raw/bubble-2.png --cell 16x16 --each --preview` |
| [ ] | Pans | pan-0-frying, pan-1-saucepan, pan-2-ladle | `python tools/pixelize.py sprite assets/kitchen/pans.png art/raw/pan-0-frying.png art/raw/pan-1-saucepan.png art/raw/pan-2-ladle.png --cell 36x46 --each --preview` |
| [ ] | Basket | basket (used twice) | `python tools/pixelize.py sprite assets/kitchen/basket.png art/raw/basket.png art/raw/basket.png --cell 60x28 --preview`, then cut frame 1 (Task 6) |
| [ ] | Ingredients | ing-carrot, ing-tomato, ing-mushroom, ing-onion, ing-potato, ing-peapod, ing-apple, ing-cheese | `python tools/pixelize.py sprite assets/kitchen/ingredients.png art/raw/ing-carrot.png art/raw/ing-tomato.png art/raw/ing-mushroom.png art/raw/ing-onion.png art/raw/ing-potato.png art/raw/ing-peapod.png art/raw/ing-apple.png art/raw/ing-cheese.png --cell 48x48 --each --preview` |

Troubleshooting: a pink halo around a sprite means the magenta wasn't pure.
Re-run with `--tol 120`. "bigger than cell" means the frames are framed
differently: regenerate the odd frame by editing the base image again.
```

- [ ] **Step 7: Commit**

```bash
git add .claude/launch.json .gitignore tools/requirements.txt art/
git commit -m "Add pixel art brief: style guide, Gemini prompts, checklist, references

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: Hand off to the user**

Tell the user that prompt #1 (Kitchen background) in `art/prompts/kitchen.md` is ready to generate, and that the result goes to `art/raw/kitchen-bg.png`. Tasks 2–4 continue while they generate.

---

### Task 2: pixelize: grid snap, palette extract and snap, background command

**Files:**
- Create: `tools/pixelize.py`, `tools/test_pixelize.py`

**Interfaces:**
- Produces (Python, module `pixelize`): `MAGENTA`, `CYAN`, `ROOT`, `PALETTE_PNG`, `PALETTE_JS`, `parse_size(s) -> (w, h)`, `dist2(a, b) -> int`, `downsample(img, (w, h)) -> RGB Image`, `extract_palette(img, n) -> list[tuple]`, `snap(img, palette) -> RGBA Image`, `write_palette(palette, png, js)`, `load_palette(path) -> list[tuple]`, `main(argv)`.
- CLI: `python tools/pixelize.py palette RAW [--size 640x360] [--colors 48]`; `python tools/pixelize.py bg RAW OUT [--size 640x360] [--preview]`.
- `js/palette.js` format: `Castle.PALETTE = ['#rrggbb', ...];`

- [ ] **Step 1: Write the failing tests**

`tools/test_pixelize.py`:

```python
import random
import sys
from pathlib import Path

import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pixelize as px  # noqa: E402

PAL = [(20, 20, 30), (240, 240, 230), (220, 60, 50), (60, 160, 70), (50, 90, 200), (250, 200, 40)]


def fake_pixel_art(grid, block, jitter=2, noise=6, seed=1):
    """Blow a grid of colors up to block-sized squares with wobbly edges and
    per-pixel noise, like Gemini's 'pixel art'."""
    rnd = random.Random(seed)
    gh, gw = len(grid), len(grid[0])
    W, H = gw * block, gh * block
    xs = [0] + [i * block + rnd.randint(-jitter, jitter) for i in range(1, gw)] + [W]
    ys = [0] + [j * block + rnd.randint(-jitter, jitter) for j in range(1, gh)] + [H]
    img = Image.new('RGB', (W, H))
    p = img.load()
    for gy in range(gh):
        for gx in range(gw):
            c = grid[gy][gx]
            for y in range(ys[gy], ys[gy + 1]):
                for x in range(xs[gx], xs[gx + 1]):
                    p[x, y] = tuple(max(0, min(255, v + rnd.randint(-noise, noise))) for v in c)
    return img


def rand_grid(w, h, seed=2, colors=PAL):
    rnd = random.Random(seed)
    return [[rnd.choice(colors) for _ in range(w)] for _ in range(h)]


def close(a, b, tol):
    return max(abs(x - y) for x, y in zip(a, b)) <= tol


def test_downsample_recovers_grid():
    grid = rand_grid(8, 6)
    out = px.downsample(fake_pixel_art(grid, 10), (8, 6))
    assert out.size == (8, 6)
    for y in range(6):
        for x in range(8):
            assert close(out.getpixel((x, y)), grid[y][x], 10), (x, y)


def test_downsample_non_integer_cells():
    grid = rand_grid(10, 5, seed=3)
    img = fake_pixel_art(grid, 21, jitter=1).resize((205, 103), Image.NEAREST)
    out = px.downsample(img, (10, 5))
    for y in range(5):
        for x in range(10):
            assert close(out.getpixel((x, y)), grid[y][x], 10), (x, y)


def test_snap_lands_exactly_on_palette():
    grid = rand_grid(8, 6, seed=4)
    out = px.snap(px.downsample(fake_pixel_art(grid, 10), (8, 6)), PAL)
    for y in range(6):
        for x in range(8):
            assert out.getpixel((x, y)) == (*grid[y][x], 255)


def test_snap_keeps_transparent_pixels():
    img = Image.new('RGBA', (2, 1), (0, 0, 0, 0))
    img.putpixel((1, 0), (230, 70, 60, 255))
    out = px.snap(img, PAL)
    assert out.getpixel((0, 0))[3] == 0
    assert out.getpixel((1, 0)) == (220, 60, 50, 255)


def test_extract_palette_finds_the_colors():
    four = PAL[:4]
    grid = rand_grid(12, 8, seed=5, colors=four)
    small = px.downsample(fake_pixel_art(grid, 10, noise=0), (12, 8))
    got = px.extract_palette(small, 4)
    assert len(got) == 4
    for want in four:
        assert any(close(g, want, 12) for g in got), want


def test_write_and_load_palette(tmp_path):
    pal = [(255, 0, 0), (0, 16, 255)]
    png, js = tmp_path / 'p.png', tmp_path / 'p.js'
    px.write_palette(pal, png, js)
    assert px.load_palette(png) == pal
    assert "Castle.PALETTE = ['#ff0000', '#0010ff'];" in js.read_text(encoding='utf-8')


def test_bg_command(tmp_path, monkeypatch):
    grid = rand_grid(16, 9, seed=6)
    raw = tmp_path / 'raw.png'
    fake_pixel_art(grid, 12).save(raw)
    pal_png, pal_js = tmp_path / 'palette.png', tmp_path / 'palette.js'
    monkeypatch.setattr(px, 'PALETTE_PNG', pal_png)
    monkeypatch.setattr(px, 'PALETTE_JS', pal_js)
    px.main(['palette', str(raw), '--size', '16x9', '--colors', '6'])
    out = tmp_path / 'bg.png'
    px.main(['bg', str(raw), str(out), '--size', '16x9'])
    img = Image.open(out)
    assert img.size == (16, 9)
    pal = set(px.load_palette(pal_png))
    assert all(c[:3] in pal for c in img.convert('RGBA').getdata())
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tools/test_pixelize.py -v`
Expected: collection error, `ModuleNotFoundError: No module named 'pixelize'`.

- [ ] **Step 3: Write `tools/pixelize.py`**

```python
#!/usr/bin/env python3
"""pixelize: turn AI "fake pixel art" into true pixel art for Castle Quest.

Commands (run from the repo root):
  palette RAW [--size 640x360] [--colors 48]
      Extract the game palette from the approved background and write
      assets/palette.png + js/palette.js. Run once; the palette is then locked.
  bg RAW OUT [--size 640x360] [--preview]
      Background: snap to the pixel grid and the palette.
  sprite OUT RAW [RAW ...] --cell WxH [--scale auto|N] [--each] [--hole] [--tol 90] [--preview]
      Cut-out sprite sheet: one frame per RAW, left to right.

--preview also writes a 4x nearest-neighbor copy to art/preview/ for viewing.
"""
import argparse
from collections import Counter, deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PALETTE_PNG = ROOT / 'assets' / 'palette.png'
PALETTE_JS = ROOT / 'js' / 'palette.js'
PREVIEW_DIR = ROOT / 'art' / 'preview'
MAGENTA = (255, 0, 255)
CYAN = (0, 255, 255)


def parse_size(s):
    w, h = s.lower().split('x')
    return int(w), int(h)


def dist2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2


def downsample(img, size):
    """Resample to exactly `size`. Each output pixel is the dominant color in
    the middle 60% of its source cell (AI pixel edges wobble, so they're
    skipped). Colors vote in coarse buckets so noise can't split the vote;
    the winner is the mean of its bucket."""
    img = img.convert('RGB')
    sw, sh = img.size
    w, h = size
    src = img.load()
    out = Image.new('RGB', (w, h))
    dst = out.load()
    for y in range(h):
        y0, y1 = y * sh / h, (y + 1) * sh / h
        iy = (y1 - y0) * 0.2
        ya = int(y0 + iy)
        ys = range(ya, max(ya + 1, int(y1 - iy)))
        for x in range(w):
            x0, x1 = x * sw / w, (x + 1) * sw / w
            ix = (x1 - x0) * 0.2
            xa = int(x0 + ix)
            xs = range(xa, max(xa + 1, int(x1 - ix)))
            votes = Counter()
            sums = {}
            for j in ys:
                for i in xs:
                    c = src[i, j]
                    k = (c[0] >> 4, c[1] >> 4, c[2] >> 4)
                    votes[k] += 1
                    s = sums.setdefault(k, [0, 0, 0])
                    s[0] += c[0]
                    s[1] += c[1]
                    s[2] += c[2]
            k, n = votes.most_common(1)[0]
            s = sums[k]
            dst[x, y] = (round(s[0] / n), round(s[1] / n), round(s[2] / n))
    return out


def extract_palette(img, n):
    """Median-cut the image down to at most n colors and return them."""
    q = img.convert('RGB').quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    flat = q.getpalette()
    used = sorted(set(q.getdata()))
    return list(dict.fromkeys(tuple(flat[i * 3:i * 3 + 3]) for i in used))


def snap(img, palette):
    """Map every opaque pixel to its nearest palette color. Keeps alpha."""
    img = img.convert('RGBA')
    p = img.load()
    cache = {}
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = p[x, y]
            if a == 0:
                continue
            c = cache.get((r, g, b))
            if c is None:
                c = cache[(r, g, b)] = min(palette, key=lambda q: dist2(q, (r, g, b)))
            p[x, y] = (c[0], c[1], c[2], 255)
    return img


def write_palette(palette, png=None, js=None):
    png = Path(png or PALETTE_PNG)
    js = Path(js or PALETTE_JS)
    png.parent.mkdir(parents=True, exist_ok=True)
    im = Image.new('RGB', (len(palette), 1))
    im.putdata(palette)
    im.save(png)
    hexes = ', '.join("'#%02x%02x%02x'" % c for c in palette)
    js.write_text('/* Generated by tools/pixelize.py palette. Do not edit by hand. */\n'
                  f'Castle.PALETTE = [{hexes}];\n', encoding='utf-8')


def load_palette(path=None):
    return list(dict.fromkeys(Image.open(path or PALETTE_PNG).convert('RGB').getdata()))


def require_palette():
    if not Path(PALETTE_PNG).exists():
        raise SystemExit('No palette yet: run "python tools/pixelize.py palette art/raw/kitchen-bg.png" first.')
    return load_palette(PALETTE_PNG)


def save(img, out, preview):
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    print(f'wrote {out} ({img.width}x{img.height})')
    if preview:
        PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
        pv = PREVIEW_DIR / out.name
        img.resize((img.width * 4, img.height * 4), Image.NEAREST).save(pv)
        print(f'preview {pv}')


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('palette')
    p.add_argument('raw')
    p.add_argument('--size', default='640x360')
    p.add_argument('--colors', type=int, default=48)
    b = sub.add_parser('bg')
    b.add_argument('raw')
    b.add_argument('out')
    b.add_argument('--size', default='640x360')
    b.add_argument('--preview', action='store_true')
    a = ap.parse_args(argv)

    if a.cmd == 'palette':
        pal = extract_palette(downsample(Image.open(a.raw), parse_size(a.size)), a.colors)
        write_palette(pal, PALETTE_PNG, PALETTE_JS)
        print(f'wrote {PALETTE_PNG} and {PALETTE_JS} ({len(pal)} colors)')
    elif a.cmd == 'bg':
        img = snap(downsample(Image.open(a.raw), parse_size(a.size)), require_palette())
        save(img.convert('RGB'), a.out, a.preview)


if __name__ == '__main__':
    main()
```

Note: `main` reads `PALETTE_PNG`/`PALETTE_JS` from module globals at call time, so the test's `monkeypatch.setattr` takes effect.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tools/test_pixelize.py -v`
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add tools/pixelize.py tools/test_pixelize.py
git commit -m "Add pixelize tool: grid snap, palette extract/snap, bg command

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: pixelize: sprite keying, soup hole, sprite sheets

**Files:**
- Modify: `tools/pixelize.py`, `tools/test_pixelize.py`

**Interfaces:**
- Consumes: `downsample`, `snap`, `dist2`, `MAGENTA`, `CYAN`, `require_palette`, `save`, `parse_size` from Task 2.
- Produces: `key_out(img, key=MAGENTA, tol=90, hole=False) -> RGBA`, `color_bbox(img, color, tol=90) -> (x0, y0, x1, y1) | None`, `content_bbox(img, key=MAGENTA, tol=90) -> box | None`, `make_sprite(raws, cell, scale='auto', hole=False, each=False, tol=90, palette=None) -> (sheet RGBA, scale float, holes list)`. Here `holes[i]` is `None` or `(x0, y0, x1, y1)` in that frame's cell coordinates (art px). CLI `sprite` command as documented in the module docstring.

- [ ] **Step 1: Write the failing tests** (append to `tools/test_pixelize.py`)

```python
def body_on_magenta(size=12, body=(2, 10), color=(20, 20, 30)):
    img = Image.new('RGB', (size, size), px.MAGENTA)
    d = img.load()
    for y in range(*body):
        for x in range(*body):
            d[x, y] = color
    return img


def test_key_out_removes_only_border_connected_background():
    img = body_on_magenta()
    d = img.load()
    for y in range(5, 7):
        for x in range(5, 7):
            d[x, y] = px.MAGENTA  # enclosed magenta, not background
    out = px.key_out(img)
    assert out.getpixel((0, 0))[3] == 0
    assert out.getpixel((11, 11))[3] == 0
    assert out.getpixel((2, 2)) == (20, 20, 30, 255)
    assert out.getpixel((5, 5)) == (*px.MAGENTA, 255)


def test_key_out_strips_pink_fringe():
    img = body_on_magenta(body=(3, 9))
    img.putpixel((2, 5), (200, 80, 200))  # blended edge pixel, outside tol
    out = px.key_out(img)
    assert out.getpixel((2, 5))[3] == 0
    assert out.getpixel((3, 5))[3] == 255


def test_hole_clears_cyan_and_reports_box():
    img = body_on_magenta(body=(2, 11))
    d = img.load()
    for y in range(4, 7):
        for x in range(4, 7):
            d[x, y] = px.CYAN
    assert px.color_bbox(img, px.CYAN) == (4, 4, 7, 7)
    out = px.key_out(img, hole=True)
    assert out.getpixel((5, 5))[3] == 0
    assert out.getpixel((3, 5))[3] == 255


def block_on_magenta(tmp_path, name, color, at=(100, 60), cells=(5, 5), block=40, size=(400, 400)):
    grid = [[color] * cells[0] for _ in range(cells[1])]
    img = Image.new('RGB', size, px.MAGENTA)
    img.paste(fake_pixel_art(grid, block, jitter=0, noise=0), at)
    p = tmp_path / name
    img.save(p)
    return p


def opaque_box(sheet, frame, cell):
    cw, ch = cell
    return sheet.crop((frame * cw, 0, frame * cw + cw, ch)).getchannel('A').getbbox()


def test_make_sprite_bottom_centres_frames(tmp_path):
    raw = block_on_magenta(tmp_path, 'a.png', PAL[2])
    sheet, scale, holes = px.make_sprite([raw, raw], (8, 8), scale='40', palette=PAL)
    assert sheet.size == (16, 8)
    assert scale == 40
    assert holes == [None, None]
    for f in (0, 1):
        assert opaque_box(sheet, f, (8, 8)) == (1, 3, 6, 8)
    assert sheet.getpixel((10, 5)) == (*PAL[2], 255)


def test_make_sprite_auto_scale_fits_cell(tmp_path):
    raw = block_on_magenta(tmp_path, 'a.png', PAL[3], cells=(5, 5), block=40)
    sheet, scale, _ = px.make_sprite([raw], (8, 8), palette=PAL)
    assert abs(scale - 200 / 6) < 0.01
    x0, y0, x1, y1 = opaque_box(sheet, 0, (8, 8))
    assert (x1 - x0, y1 - y0) == (6, 6)


def test_make_sprite_shared_box_keeps_frames_aligned(tmp_path):
    a = block_on_magenta(tmp_path, 'a.png', PAL[2], at=(100, 100), cells=(4, 4))
    b = block_on_magenta(tmp_path, 'b.png', PAL[2], at=(100, 60), cells=(4, 5))  # taller: arm raised
    sheet, _, _ = px.make_sprite([a, b], (8, 8), scale='40', palette=PAL)
    assert opaque_box(sheet, 0, (8, 8)) == (2, 4, 6, 8)
    assert opaque_box(sheet, 1, (8, 8)) == (2, 3, 6, 8)


def test_make_sprite_each_fits_frames_independently(tmp_path):
    a = block_on_magenta(tmp_path, 'a.png', PAL[2], at=(10, 10), cells=(2, 2))
    b = block_on_magenta(tmp_path, 'b.png', PAL[4], at=(200, 200), cells=(4, 4))
    sheet, _, _ = px.make_sprite([a, b], (8, 8), scale='40', each=True, palette=PAL)
    assert opaque_box(sheet, 0, (8, 8)) == (3, 6, 5, 8)
    assert opaque_box(sheet, 1, (8, 8)) == (2, 4, 6, 8)


def test_make_sprite_rejects_oversized(tmp_path):
    raw = block_on_magenta(tmp_path, 'a.png', PAL[2])
    with pytest.raises(SystemExit):
        px.make_sprite([raw], (4, 4), scale='40', palette=PAL)


def test_make_sprite_reports_hole(tmp_path):
    grid = [[PAL[0]] * 6 for _ in range(6)]
    for y in range(1, 3):
        for x in range(1, 5):
            grid[y][x] = px.CYAN
    img = Image.new('RGB', (400, 400), px.MAGENTA)
    img.paste(fake_pixel_art(grid, 40, jitter=0, noise=0), (80, 80))
    raw = tmp_path / 'pot.png'
    img.save(raw)
    sheet, _, holes = px.make_sprite([raw], (8, 8), scale='40', hole=True, palette=PAL)
    assert holes == [(2, 3, 6, 5)]  # 6x6 body bottom-centred at (1, 2)
    assert sheet.getpixel((3, 3))[3] == 0
```

- [ ] **Step 2: Run the tests to verify the new ones fail**

Run: `python -m pytest tools/test_pixelize.py -v`
Expected: the 7 Task-2 tests pass, and the new tests fail with `AttributeError: module 'pixelize' has no attribute 'key_out'` (or `make_sprite`/`color_bbox`).

- [ ] **Step 3: Add the sprite functions to `tools/pixelize.py`** (after `snap`)

```python
NEIGHBOURS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def key_out(img, key=MAGENTA, tol=90, hole=False):
    """Make the background transparent: flood-fill from the border through
    pixels within `tol` of `key`. With hole=True also clear every pixel near
    cyan (the soup cutout). Finally clear opaque pixels on the cut edge that
    are still pinkish (blended fringe)."""
    img = img.convert('RGBA')
    w, h = img.size
    p = img.load()
    t2 = tol * tol
    seen = bytearray(w * h)
    q = deque([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
              + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    while q:
        x, y = q.popleft()
        if seen[y * w + x]:
            continue
        seen[y * w + x] = 1
        if dist2(p[x, y], key) > t2:
            continue
        p[x, y] = (0, 0, 0, 0)
        for dx, dy in NEIGHBOURS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                q.append((nx, ny))
    if hole:
        for y in range(h):
            for x in range(w):
                if p[x, y][3] and dist2(p[x, y], CYAN) <= t2:
                    p[x, y] = (0, 0, 0, 0)
    f2 = (tol * 2) ** 2
    fringe = [(x, y) for y in range(h) for x in range(w)
              if p[x, y][3] and dist2(p[x, y], key) <= f2
              and any(0 <= x + dx < w and 0 <= y + dy < h and p[x + dx, y + dy][3] == 0
                      for dx, dy in NEIGHBOURS)]
    for x, y in fringe:
        p[x, y] = (0, 0, 0, 0)
    return img


def color_bbox(img, color, tol=90):
    """Bounding box (x0, y0, x1, y1) of pixels within tol of color, or None."""
    t2 = tol * tol
    mask = Image.new('L', img.size)
    mask.putdata([255 if dist2(c, color) <= t2 else 0 for c in img.convert('RGB').getdata()])
    return mask.getbbox()


def content_bbox(img, key=MAGENTA, tol=90):
    """Bounding box of everything that isn't background (full resolution)."""
    t2 = tol * tol
    mask = Image.new('L', img.size)
    mask.putdata([0 if dist2(c, key) <= t2 else 255 for c in img.convert('RGB').getdata()])
    return mask.getbbox()


def make_sprite(raws, cell, scale='auto', hole=False, each=False, tol=90, palette=None):
    """Build a one-row sprite sheet, one frame per raw image.

    Frames share one crop box (the union of their content) so animation
    frames stay aligned; each=True fits every frame on its own instead (for
    sheets of different objects). Each frame is bottom-centred in its cell.
    scale = source pixels per art pixel; 'auto' picks the smallest scale that
    fits the cell with a 1px margin each side."""
    cw, ch = cell
    imgs = [Image.open(r).convert('RGB') for r in raws]
    boxes = [content_bbox(im, tol=tol) for im in imgs]
    if any(b is None for b in boxes):
        raise SystemExit('A frame is empty (all background): check the image and --tol.')
    if not each:
        u = (min(b[0] for b in boxes), min(b[1] for b in boxes),
             max(b[2] for b in boxes), max(b[3] for b in boxes))
        boxes = [u] * len(imgs)
    sheet = Image.new('RGBA', (cw * len(imgs), ch), (0, 0, 0, 0))
    holes, used = [], None
    for i, (im, box) in enumerate(zip(imgs, boxes)):
        bw, bh = box[2] - box[0], box[3] - box[1]
        s = float(scale) if scale not in (None, 'auto') else max(bw / (cw - 2), bh / (ch - 2))
        w, h = max(1, round(bw / s)), max(1, round(bh / s))
        if w > cw or h > ch:
            raise SystemExit(f'{raws[i]}: {w}x{h} art px is bigger than the {cw}x{ch} cell; use a larger --scale.')
        small = downsample(im.crop(box), (w, h))
        hb = color_bbox(small, CYAN, tol) if hole else None
        cut = key_out(small, tol=tol, hole=hole)
        if palette:
            cut = snap(cut, palette)
        ox, oy = (cw - w) // 2, ch - h
        sheet.paste(cut, (i * cw + ox, oy))
        holes.append(None if hb is None else (hb[0] + ox, hb[1] + oy, hb[2] + ox, hb[3] + oy))
        used = s
    return sheet, used, holes
```

Note: `dist2` reads only the first three channels, so passing RGBA pixels is fine.

- [ ] **Step 4: Add the `sprite` CLI command**

In `main`, after the `bg` parser:

```python
    s = sub.add_parser('sprite')
    s.add_argument('out')
    s.add_argument('raws', nargs='+')
    s.add_argument('--cell', required=True)
    s.add_argument('--scale', default='auto')
    s.add_argument('--each', action='store_true')
    s.add_argument('--hole', action='store_true')
    s.add_argument('--tol', type=int, default=90)
    s.add_argument('--preview', action='store_true')
```

and after the `bg` branch:

```python
    elif a.cmd == 'sprite':
        sheet, sc, holes = make_sprite(a.raws, parse_size(a.cell), a.scale, a.hole, a.each, a.tol, require_palette())
        save(sheet, a.out, a.preview)
        print(f'scale {sc:.2f} source px per art px')
        for i, hb in enumerate(holes):
            if hb:
                print(f'frame {i}: soup hole x={hb[0]} y={hb[1]} w={hb[2] - hb[0]} h={hb[3] - hb[1]} (art px)')
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `python -m pytest tools/test_pixelize.py -v`
Expected: 16 passed.

- [ ] **Step 6: Commit**

```bash
git add tools/pixelize.py tools/test_pixelize.py
git commit -m "pixelize: sprite sheets with magenta keying and soup hole

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Engine sprite helper (`api.sprite`, `api.img`, `Castle.sprite`)

**Files:**
- Modify: `js/engine.js` (add after `Castle.util = …` near line 89, and in `makeApi` near line 640)
- Modify: `css/style.css` (append)
- Create: `tools/fixtures/sprite-test.png`

**Interfaces:**
- Produces (JS):
  - `Castle.sprite(src, opts) -> Sprite` (untracked: use only for static frames via `.frame()`)
  - `api.sprite(src, opts) -> Sprite` (timers auto-cleaned when the room exits)
  - `Castle.img(src, opts)` / `api.img(src, opts) -> HTMLImageElement`
  - `opts` for sprite: `{ frame: [w, h] (art px), anims: { name: [frames] | { frames, fps } }, fps = 6, cols, scale = 2, class, x, y, blink: animName }`
  - `opts` for img: `{ w, h (art px), scale = 2, class, x, y }`
  - `Sprite`: `{ el, shown, anim (getter), frame(i) -> Sprite, play(name, { once, then, fps }) -> Promise, stop(), destroy() }`
    - `play` with `once` resolves when the animation finishes **or is interrupted**. `then` (an anim name) plays only on natural finish.
    - If an `idle` anim exists it starts automatically, otherwise frame 0 shows.
    - With `blink: 'name'`, every 3–6 s, if the current anim is `idle`, it plays `name` once and then returns to idle.
- CSS classes: `.sprite`, `.px`, `.pixel` (stepped `.wiggle`/`.bounce`).

- [ ] **Step 1: Make the test sheet fixture**

```bash
python -c "
from PIL import Image
im = Image.new('RGB', (32, 8))
for i, c in enumerate([(255,0,0), (0,200,0), (0,0,255), (255,220,0)]):
    im.paste(c, (i*8, 0, i*8+8, 8))
im.save('tools/fixtures/sprite-test.png')
"
```

(Create `tools/fixtures/` first if needed.)

- [ ] **Step 2: Write the failing browser check**

Reload `http://localhost:8650/index.html` in the preview and run (javascript_tool):

```js
const s = Castle.sprite('tools/fixtures/sprite-test.png', { frame: [8, 8], anims: { idle: { frames: [0, 1], fps: 10 }, flash: { frames: [2, 3], fps: 10 } }, x: 600, y: 300 });
document.getElementById('scene').appendChild(s.el);
const log = [s.el.style.width, s.el.style.backgroundSize, s.el.style.backgroundPosition];
await new Promise(r => setTimeout(r, 140)); log.push(s.shown);
const t0 = performance.now(); await s.play('flash', { once: true, then: 'idle' });
log.push(Math.round((performance.now() - t0) / 100), s.anim);
log.push(s.frame(3).shown, s.el.style.backgroundPosition, s.anim);
const im = Castle.img('tools/fixtures/sprite-test.png', { w: 32, h: 8, x: 0, y: 0 });
log.push(im.style.width, im.style.height, im.className);
s.destroy(); s.el.remove();
JSON.stringify(log)
```

Expected now: error `Castle.sprite is not a function`.

- [ ] **Step 3: Implement in `js/engine.js`**

Insert after the line `Castle.util = { el, svg, rand, pick, shuffle };`:

```js
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
```

In `makeApi`, add these members next to `draggable(...)`:

```js
      sprite(src, o) { return makeSprite(src, o, track); },
      img: makeImg,
```

- [ ] **Step 4: Add global CSS** (append to `css/style.css`)

```css
/* ---------- Pixel art ---------- */
.sprite { display: block; background-repeat: no-repeat; image-rendering: pixelated; }
.px { display: block; image-rendering: pixelated; user-select: none; -webkit-user-drag: none; }
/* Feedback on pixel art jumps between poses instead of gliding. */
.pixel.wiggle, .pixel.bounce { animation-timing-function: steps(1, end); }
```

- [ ] **Step 5: Re-run the browser check**

Reload and run the Step 2 snippet.
Expected: `["16px","64px 16px","0px 0px",1,2,"idle",3,"-48px 0px",null,"64px","16px","px"]`

Then check the console (`read_console_messages {onlyErrors:true}`): no errors. Play the title screen → map → kitchen once to confirm nothing else broke.

- [ ] **Step 6: Commit**

```bash
git add js/engine.js css/style.css tools/fixtures/sprite-test.png
git commit -m "Engine: pixel sprite sheets and images (api.sprite, api.img)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: GATE 1: background, palette, user approval

**Blocked until** the user has saved `art/raw/kitchen-bg.png`.

**Files:**
- Create (generated): `assets/palette.png`, `js/palette.js`, `assets/kitchen/bg.png`
- Modify: `index.html`, `art/CHECKLIST.md`

**Interfaces:**
- Produces: the locked palette used by every later `pixelize` run, and `Castle.PALETTE` (array of `'#rrggbb'`) in the game.

- [ ] **Step 1: Extract the palette and build the background**

```bash
python tools/pixelize.py palette art/raw/kitchen-bg.png
python tools/pixelize.py bg art/raw/kitchen-bg.png assets/kitchen/bg.png --preview
```

Expected: `wrote …palette.png and …palette.js (48 colors)`, `wrote assets/kitchen/bg.png (640x360)`.

- [ ] **Step 2: Inspect it yourself**

Read `art/preview/bg.png`. Check that: the fireplace opening, shelf fronts, window sill and Clementine's floor area are empty (see Task 1 prompt). Nothing important sits in the reserved HUD corners: top-left 0–110 × 0–110 stage px, top-right x > 720, y < 90 (this is decoration only, which is allowed, but busy detail there hurts readability). Pixels look crisp, not smeared. If Gemini ignored the layout (for example it drew a fire or a pot), go back to the user with a specific re-prompt note before going further.

- [ ] **Step 3: Load the palette in the game**

In `index.html`, after `<script src="js/engine.js"></script>` add:

```html
  <script src="js/palette.js"></script>
```

- [ ] **Step 4: Show the user and get approval**

Send `art/preview/bg.png` and `assets/palette.png` (also make a 16× preview of the palette: `python -c "from PIL import Image; im=Image.open('assets/palette.png'); im.resize((im.width*24, 48), Image.NEAREST).save('art/preview/palette.png')"`) with SendUserFile. Ask: "Is this the look? Approving locks the palette for the whole game." If they want changes, either re-prompt Gemini (new raw, repeat Steps 1–2) or adjust `--colors`. **Do not continue until the user approves.**

- [ ] **Step 5: Commit**

Tick the Gate 1 boxes in `art/CHECKLIST.md`, then:

```bash
git add art/raw/kitchen-bg.png art/CHECKLIST.md assets/palette.png assets/kitchen/bg.png js/palette.js index.html
git commit -m "Lock pixel palette from approved kitchen background

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Hand off**

Tell the user prompts #2–#11 in `art/prompts/kitchen.md` are next, and to attach `art/preview/bg.png` as the style reference.

---

### Task 6: GATE 2: process the sprite assets

**Blocked until** the user has saved the raw files listed in `art/CHECKLIST.md` (Sprites table). Process whatever is available. Pip + Clementine + ingredients unblock most of Tasks 7–8.

**Files:**
- Create (generated): `assets/common/pip.png`, `assets/kitchen/{clementine,cat,bird,fire,pot,bubble,pans,basket,ingredients}.png`, `art/raw/*.png` (committed)
- Modify: `art/CHECKLIST.md`

**Interfaces:**
- Produces: sheets exactly matching the **Asset geometry** table, plus the pot's soup-hole box (art px), which Task 8 needs.

- [ ] **Step 1: Run each command from the CHECKLIST Sprites table**

For example: `python tools/pixelize.py sprite assets/common/pip.png art/raw/pip-0-idle.png art/raw/pip-1-breathe.png art/raw/pip-2-blink.png art/raw/pip-3-talk.png --cell 84x84 --preview`

Expected per run: `wrote … (W×H)` where W = cell width × frame count, H = cell height. For the pot, also note the printed line `frame 0: soup hole x=… y=… w=… h=…`.

- [ ] **Step 2: Make basket frame 1 (front wall only)**

Open `art/preview/basket.png` and find the art-px row where the back rim's inside ends and the front wall begins (call it `ROW`, usually about 8–12). Then:

```bash
python -c "
from PIL import Image
ROW = 10  # set from the preview
im = Image.open('assets/kitchen/basket.png').convert('RGBA')
for y in range(ROW):
    for x in range(60, 120):
        im.putpixel((x, y), (0, 0, 0, 0))
im.save('assets/kitchen/basket.png')
"
```

- [ ] **Step 3: Check every preview**

Read each `art/preview/*.png`. For each one, check that: there's no pink halo (if there is, re-run with `--tol 120`); animation frames line up (the subject doesn't jump between frames); faces read clearly at the size shown; and the pot preview has a transparent oval where the soup goes. Fix problems by re-running pixelize or asking the user to regenerate one specific frame (name the file and what's wrong).

- [ ] **Step 4: Commit**

Tick the boxes in `art/CHECKLIST.md`, then:

```bash
git add art/raw art/CHECKLIST.md assets/
git commit -m "Add kitchen pilot pixel sprites

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Pip becomes a pixel sprite

**Files:**
- Modify: `js/engine.js` (remove `PIP_SVG` ~lines 579–605, edit `finishSpeech`/`say` ~lines 337–345, edit `boot` ~line 748)
- Modify: `css/style.css` (lines 92–101, the `#guide .pip-*` rules)

**Interfaces:**
- Consumes: `makeSprite` (Task 4), `assets/common/pip.png` (Task 6; 84×84 cells: 0 idle, 1 breathe, 2 blink, 3 talk).
- Produces: unchanged `Castle.guide` API and `#guide.talking` class behavior.

- [ ] **Step 1: Write the failing browser check**

Reload the game and run:

```js
const g = document.getElementById('guide');
const sp = g.querySelector('.sprite');
JSON.stringify({ hasSprite: !!sp, hasSvg: !!g.querySelector('svg'), bg: sp && sp.style.backgroundImage, w: sp && sp.style.width })
```

Expected now: `{"hasSprite":false,"hasSvg":true,…}`.

- [ ] **Step 2: Replace the SVG Pip**

In `js/engine.js`, delete the whole `const PIP_SVG = \`…\`;` block (keep the `/* Pip the dragon (guide) */` comment) and put this in its place:

```js
  let pip = null;
  function setPipTalking(on) {
    if (!guideEl) return;
    guideEl.classList.toggle('talking', on);
    if (pip) pip.play(on ? 'talk' : 'idle');
  }
```

In `finishSpeech`, replace `if (guideEl) guideEl.classList.remove('talking');` with:

```js
    setPipTalking(false);
```

In `say`, replace `guideEl.classList.toggle('talking', !opts.who || opts.who === 'Pip');` with:

```js
    setPipTalking(!opts.who || opts.who === 'Pip');
```

In `boot`, replace `guideEl.innerHTML = PIP_SVG;` with:

```js
    pip = makeSprite('assets/common/pip.png', {
      frame: [84, 84],
      anims: { idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 }, talk: { frames: [3, 0], fps: 7 } },
      blink: 'blink',
    }, null);
    guideEl.appendChild(pip.el);
```

- [ ] **Step 3: Replace the Pip CSS**

In `css/style.css`, delete the lines from `#guide .pip-body { …` through the `#guide.talking .pip-head` rule and its `@keyframes nod`, **but keep** `@keyframes blink` and `@keyframes talk` if anything else uses them. Check with `grep -n "blink\|talk\b\|nod" js css`. Add:

```css
#guide .sprite { position: absolute; left: 1px; top: 2px; }
```

- [ ] **Step 4: Re-run the check and watch Pip**

Expected: `{"hasSprite":true,"hasSvg":false,"bg":"url(\"assets/common/pip.png\")","w":"168px"}`.

Then on the title screen: screenshot Pip (zoom on the bottom-left), confirm the pixels are crisp, the mouth moves while the intro line plays (`Castle.repeat()`), Pip blinks within ~6 s while idle, and tapping Pip still hops and repeats the line. No console errors.

- [ ] **Step 5: Commit**

```bash
git add js/engine.js css/style.css
git commit -m "Pip the guide is now a pixel sprite

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Rebuild the Kitchen with pixel art

**Files:**
- Modify: `js/rooms/kitchen.js`

**Interfaces:**
- Consumes: `api.sprite`, `api.img`, `Castle.sprite` (Task 4), `Castle.PALETTE` (Task 5), all `assets/kitchen/*.png` (Task 6), and the pot soup-hole box from Task 6 Step 1.
- Produces: same room behavior. Nothing else depends on kitchen internals.

Line numbers refer to the file before this task. Work top-down.

- [ ] **Step 1: Write the browser check script (it fails now)**

```js
Castle.go('kitchen'); await new Promise(r => setTimeout(r, 1200)); Castle.hush();
const r = document.querySelector('.scene-kitchen');
JSON.stringify({
  svgs: r.querySelectorAll('svg').length,          // only recipe-card icons and hearts may remain
  sprites: r.querySelectorAll('.sprite').length,
  bg: !!r.querySelector('img.k-bg'),
  items: r.querySelectorAll('.k-item .sprite').length,
  pot: !!r.querySelector('.k-pot .k-soup'),
})
```

Expected after this task (Level 1): `svgs` ≤ 2 (card bowl icon, plus a heart if one is showing), `sprites` ≥ 12, `bg: true`, `items: 3`, `pot: true`. Right now `bg` is `false`.

- [ ] **Step 2: Remove the SVG art**

Delete: `face()` (lines 31–37), `const ART = {…}` (39–91), `ingSVG` (92–94), `BASKET_BACK`/`BASKET_FRONT` (105–112), `PAN_SVGS` (114–133), `BIRD_SVG`, `FIRE_SVG`, `POT_SVG`, `CAT_SVG`, `CC_SVG` (135–277), and the whole "Background (one big SVG)" section: `floorTiles`, `garlic`, `plate`, `cloud`, `bgSVG` (285–461). Keep `INK`, `K`, `NUM`, `BROTH`, `GOLD`, `ING`, `KINDS`, `nm`, `hexRgb`, `mix`, `BOWL_ICON`, `HEART`. Update the "Art: baskets, pots, characters" comment header to "Small code-drawn accents (card icon, hearts)".

- [ ] **Step 3: Add the pixel art helpers** (where `ingSVG` was)

```js
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
    return Castle.sprite(IMG + 'basket.png', { frame: [60, 28], cols: 2, class: 'k-bk' }).frame(f).el;
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
```

- [ ] **Step 4: Replace the art CSS**

In `const CSS`, replace everything from `.scene-kitchen { background:#c9b79c; }` down to and including the `@keyframes kit-nod …` line with:

```css
.scene-kitchen { background:#c9b79c; }
.scene-kitchen .k-bg { position:absolute; left:0; top:0; pointer-events:none; }

.scene-kitchen .k-pan { position:absolute; top:24px; cursor:pointer; transform-origin:50% 0; }
.scene-kitchen .k-pan:hover { filter:brightness(1.12); }
.scene-kitchen .k-pan.kit-swing { animation:kit-swing 1s steps(1,end); }
@keyframes kit-swing { 12% { transform:rotate(20deg); } 32% { transform:rotate(-15deg); } 52% { transform:rotate(9deg); } 72% { transform:rotate(-5deg); } 88% { transform:rotate(2deg); } }

.scene-kitchen .k-bird { position:absolute; left:942px; top:196px; cursor:pointer; }
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
.scene-kitchen .k-cc { position:absolute; left:830px; top:258px; cursor:pointer; transform-origin:50% 100%; }
.scene-kitchen .k-cc.nod { animation:kit-nod .55s steps(1,end); }
@keyframes kit-nod { 35% { transform:translateY(-12px); } 70% { transform:translateY(0); } }
```

In the recipe-card rules, delete `.scene-kitchen .k-ico svg { display:block; }` and `.scene-kitchen .k-grp svg { display:block; }`.

Replace the block from `.scene-kitchen .k-slot .k-bk {` through `.scene-kitchen .k-fly svg { display:block; overflow:visible; }` with:

```css
.scene-kitchen .k-slot .k-bk { position:absolute; left:0; top:64px; pointer-events:none; }
.scene-kitchen .k-item { position:absolute; left:12px; top:0; width:96px; height:96px; pointer-events:auto; }
.scene-kitchen .k-iart { transform-origin:50% 85%; }
.scene-kitchen .k-item:hover .k-iart { transform:translateY(-4px); }
.scene-kitchen .k-iart.k-pop { animation:kit-pop .5s steps(4,end) both; }
@keyframes kit-pop { 0% { transform:translateY(40px) scale(.3); } 100% { transform:none; } }
.scene-kitchen .k-item.glow .k-iart { animation:kit-hintbob .9s steps(2,end) infinite; }
@keyframes kit-hintbob { 50% { transform:translateY(-10px); } }

.scene-kitchen .k-fly { position:absolute; width:96px; height:96px; z-index:30; pointer-events:none; }
```

(Keep the `.k-slots`, `.k-slot`, `.k-drop`, `.k-heart` rules as they are.)

- [ ] **Step 5: Soup geometry from the pot sprite**

At the top of `enter()`, replace

```js
      const SOUP = { x: 590, y: 366 };      // soup surface centre (stage px)
```

with (fill `SOUP_BOX` from Task 6's printed hole: each art-px number × 2):

```js
      // Soup hole in pot.png, in stage px relative to the pot box (art px x 2,
      // from "pixelize ... --hole").
      const SOUP_BOX = { x: 36, y: 64, w: 248, h: 44 };
      const SOUP = { x: 430 + SOUP_BOX.x + SOUP_BOX.w / 2, y: 280 + SOUP_BOX.y + SOUP_BOX.h / 2 };
```

Also change `let slots = [], soupColor = BROTH;` to `let slots = [], soupColor = toPalette(BROTH);`.

- [ ] **Step 6: Rebuild the scene construction**

Replace the `cSay` function with:

```js
      function cSay(text) {
        const my = ++talkTok;
        if (ccS.anim !== 'taste' && ccS.anim !== 'yum') ccS.play('talk');
        return api.say(text, VOICE).then(() => { if (my === talkTok && ccS.anim === 'talk') ccS.play('idle'); });
      }
```

Replace the block from `const bg = api.svg(bgSVG());` through `root.appendChild(cc);` (the Cook Clementine line) with:

```js
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
        frame: [32, 28], class: 'k-bird pixel',
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
        frame: [90, 200], class: 'k-cc pixel', blink: 'blink',
        anims: {
          idle: { frames: [0, 1], fps: 2 }, blink: { frames: [2], fps: 6 }, talk: { frames: [3, 0], fps: 7 },
          wave: { frames: [4, 5, 4, 5], fps: 5 }, taste: [6], yum: [7],
        },
      });
      const cc = ccS.el;
      root.appendChild(cc);
```

- [ ] **Step 7: Update the fun extras**

Replace the `cat` and `cc` click handlers with:

```js
      api.on(cat, 'click', () => {
        meow();
        catS.play('react', { once: true, then: 'idle' });
        heart(300, 470);
      });
```

```js
      api.on(cc, 'click', () => {
        api.sfx('giggle');
        retrigger(cc, 'bounce', 650);
        if (accepting && cur) { introCut = true; cSay(instr(cur)); }
        else if (ccS.anim === 'idle') ccS.play('wave', { once: true, then: 'idle' });
      });
```

In the fire click handler, replace `retrigger(fire, 'flare', 850);` with:

```js
        fireS.play('idle', { fps: 18 });
        api.setTimeout(() => fireS.play('idle', { fps: 8 }), 850);
```

- [ ] **Step 8: Update the ingredient and card code**

In `renderCard`: replace `g.appendChild(api.svg(ingSVG(l.kind, 34)));` with `g.appendChild(ingEl(l.kind, 34));`, and replace `row.appendChild(api.el('div', { class: 'k-ico', html: ingSVG(l.kind, 72) }));` with `row.appendChild(api.el('div', { class: 'k-ico' }, ingEl(l.kind, 72)));`.

In `makeSlot`, replace the `item` and `slot.append` lines with:

```js
        const item = api.el('div', { class: 'k-item pixel', 'aria-label': ING[kind].one }, ingEl(kind, 96, 'k-iart pixel'));
        slot.append(basketEl(0), item, basketEl(1));
```

In `flyArc`, replace the `const f = …` line with:

```js
        const f = api.el('div', { class: 'k-fly', style: { left: (from.x - 48) + 'px', top: (from.y - 48) + 'px' } }, ingEl(kind, 96));
```

- [ ] **Step 9: Update the soup, burp and round-end states**

- In `landed`: replace `soupColor = mix(soupColor, ING[line.kind].soup, 0.35); soupEl.style.fill = soupColor;` with:
  ```js
        soupColor = toPalette(mix(soupColor, ING[line.kind].soup, 0.35));
        soupEl.style.background = soupColor;
  ```
  Note: snapping after every mix can stick on one palette color. If the soup visibly never changes in play-testing, keep an unsnapped `soupMix` variable for mixing and snap only for display.
- In `burp`: after `retrigger(pot, 'burp', 650);` add `potS.play('burp', { once: true, then: 'idle' });`.
- In `startRound`: replace `soupColor = BROTH; soupEl.style.fill = BROTH;` with `soupColor = toPalette(BROTH); soupEl.style.background = soupColor;`.
- In `finishRound`: `soupEl.style.fill = GOLD;` → `soupEl.style.background = toPalette(GOLD);`; `cc.classList.add('taste');` → `ccS.play('taste');`; `cc.classList.add('yum');` → `ccS.play('yum');`; delete `cc.classList.remove('taste');`; `cc.classList.remove('yum');` → `ccS.play('idle');`.

Then search the file for leftovers: `grep -n "ingSVG\|_SVG\|bgSVG\|\.fill\b\|classList.*\(taste\|yum\|talking\)\|k-isvg" js/rooms/kitchen.js`. Expected: no matches.

- [ ] **Step 10: Run the browser check**

Reload and run the Step 1 script. Expected as stated there. Then `read_console_messages {onlyErrors:true}`: no errors.

- [ ] **Step 11: Commit**

```bash
git add js/rooms/kitchen.js
git commit -m "Kitchen: swap SVG art for pixel sprites

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Play-test, verify, document

**Files:**
- Modify: `ROOM_API.md`, `README.md`, and possibly `js/rooms/kitchen.js` (position tweaks only)

- [ ] **Step 1: Full play-through at each level**

For difficulty 1, 2 and 3 (set with `Castle.state.difficulty = N; Castle.save(); Castle.go('kitchen')`), in the preview at 1280×720:
- Drag one ingredient into the pot. It lands, the soup changes color, and the tally updates.
- Tap an ingredient. It flies into the pot.
- Drop a wrong ingredient. The pot burps (mouth-open frame), the item flies back, and after 2 misses the right items glow.
- Finish all 3 rounds. Clementine shows taste → yum → idle, and the jewel card appears.
- Tap the cat (react frames), bird (hop), pans (swing + notes), fire (fast flicker), pot (plop) and Clementine (wave).
- Watch Clementine and Pip blink and talk.

Record any misalignment (for example the basket front not covering the food's bottom, the soup ellipse not matching the hole, or Clementine's feet floating) and fix it by adjusting stage-px positions in kitchen.js CSS or `SOUP_BOX`. Keep all offsets even numbers.

- [ ] **Step 2: Layout and safety checks**

Run:

```js
const st = document.getElementById('stage').getBoundingClientRect(), k = st.width / 1280;
JSON.stringify([...document.querySelectorAll('.scene-kitchen .k-item, .scene-kitchen .k-pot, .scene-kitchen .k-cc')].map(n => {
  const r = n.getBoundingClientRect();
  return { c: n.className, x: Math.round((r.left - st.left) / k), y: Math.round((r.top - st.top) / k), w: Math.round(r.width / k), h: Math.round(r.height / k) };
}))
```

Check: every target is ≥ 90 px in both dimensions, and none of them has its whole box inside x 180–900, y > 585.

- [ ] **Step 3: file:// check**

Navigate the preview to `file:///` + the absolute path of this checkout's `index.html` (for example `file:///C:/Users/lando/OneDrive/Documents/Projects/FisherPriceGame/.claude/worktrees/svg-design-pass-bde9ad/index.html`). Open the kitchen and confirm the art loads (`document.querySelector('.scene-kitchen img.k-bg').naturalWidth === 640`) and there are no console errors. If the browser pane refuses file URLs, say so in the report instead of claiming it passed.

- [ ] **Step 4: Screenshots for the user**

Take full-stage screenshots of: the title screen (Pip), the Kitchen mid-round (Level 2), and the Kitchen at the golden-soup "yum" moment. Send them with SendUserFile alongside one screenshot of the old Kitchen (`art/ref/kitchen-full.png`) for before/after.

- [ ] **Step 5: Update docs**

`ROOM_API.md`:
- Change "no external assets" in the first paragraph to: "no network assets (local images under `assets/` are fine)".
- Add rows to the api table:
  - `` `api.sprite(src, {frame:[w,h], anims, fps, cols, scale, class, x, y, blink})` → Sprite `` | "Pixel sprite sheet (one row of equal frames, art px; shown at 2×). `anims` maps names to frame lists or `{frames, fps}`; `idle` auto-plays. Sprite: `el`, `anim`, `frame(i)`, `play(name, {once, then, fps})` → Promise, `stop()`. Timers auto-clean." |
  - `` `api.img(src, {w, h, x, y, class})` `` | "Still pixel image at 2×." |
- Replace the "Art style" section's first sentence with: "Rooms are being converted to hi-bit pixel art. See `art/STYLE.md` and the pipeline in `art/CHECKLIST.md`. The Kitchen is the reference room. Rooms not yet converted keep the SVG style below."

`README.md`, in "Code layout", add:
- `` `assets/` `` holds the pixel art PNGs and `assets/palette.png` (the locked game palette).
- `` `art/` `` has the style guide, Gemini prompts, asset checklist and raw generations.
- `` `tools/pixelize.py` `` turns raw Gemini images into true pixel art (`pip install -r tools/requirements.txt`, tests: `python -m pytest tools`).

- [ ] **Step 6: Final test run and commit**

Run: `python -m pytest tools -v`
Expected: 16 passed.

```bash
git add ROOM_API.md README.md js/rooms/kitchen.js
git commit -m "Docs: pixel art pipeline and sprite API; kitchen layout tweaks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Report to the user**

Summarize what changed, link the screenshots, list any tweaks you made or problems left open, and ask whether the look is right before planning the rollout to the other rooms.
