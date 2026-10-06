# Kitchen pilot — asset checklist

Raw Gemini output goes in `art/raw/`. Commands run from the repo root.
Previews (4×) are written to `art/preview/` for viewing.

## Gate 1: look + palette
- [x] `kitchen-bg.jpg` generated
- [x] palette extracted: `python tools/pixelize.py palette art/raw/kitchen-bg.jpg --size 640x360`
- [x] background: `python tools/pixelize.py bg art/raw/kitchen-bg.jpg assets/kitchen/bg.png --preview`
- [x] look + palette approved by the user (palette is locked after this)

## Sprites (after Gate 1)
| Done | Asset | Raw files (art/raw/) | Command |
|---|---|---|---|
| [x] | Pip | pip-0-idle, pip-1-breathe, pip-2-blink, pip-3-talk (.png, from pip-pair.jpg) | `python tools/pixelize.py sprite assets/common/pip.png art/raw/pip-0-idle.png art/raw/pip-1-breathe.png art/raw/pip-2-blink.png art/raw/pip-3-talk.png --cell 84x84 --preview` |
| [x] | Clementine | cc-0-idle, cc-2-blink … cc-7-yum (7 .jpg; frame 1 synthesized) | `python tools/pixelize.py sprite assets/kitchen/clementine.png art/raw/cc-0-idle.jpg art/raw/cc-0-idle.jpg art/raw/cc-2-blink.jpg art/raw/cc-3-talk.jpg art/raw/cc-4-wave-a.jpg art/raw/cc-5-wave-b.jpg art/raw/cc-6-taste.jpg art/raw/cc-7-yum.jpg --cell 120x200 --tol 120 --preview` |
| [x] | Cat | cat-0-idle, cat-1-doze, cat-2-ears, cat-3-meow, cat-4-happy (.jpg) | `python tools/pixelize.py sprite assets/kitchen/cat.png art/raw/cat-0-idle.jpg art/raw/cat-1-doze.jpg art/raw/cat-2-ears.jpg art/raw/cat-3-meow.jpg art/raw/cat-4-happy.jpg --cell 64x56 --tol 120 --preview` |
| [x] | Bird | bird-0-idle … bird-4-wings-down (5 .jpg) | `python tools/pixelize.py sprite assets/kitchen/bird.png art/raw/bird-0-idle.jpg art/raw/bird-1-peck.jpg art/raw/bird-2-wings-up.jpg art/raw/bird-3-wings-mid.jpg art/raw/bird-4-wings-down.jpg --cell 40x34 --tol 120 --preview` |
| [x] | Fire | fire-0, fire-1, fire-2 (.jpg; fire-1 used twice) | `python tools/pixelize.py sprite assets/kitchen/fire.png art/raw/fire-0.jpg art/raw/fire-1.jpg art/raw/fire-2.jpg art/raw/fire-1.jpg --cell 150x75 --tol 120 --preview` |
| [x] | Pot | pot-0, pot-1-burp (.jpg) | `python tools/pixelize.py sprite assets/kitchen/pot.png art/raw/pot-0.jpg art/raw/pot-1-burp.jpg --cell 160x140 --hole --tol 120 --preview` |
| [x] | Bubbles | bubble-0 … bubble-2 (.png, from bubbles-basket-sheet.jpg) | `python tools/pixelize.py sprite assets/kitchen/bubble.png art/raw/bubble-0.png art/raw/bubble-1.png art/raw/bubble-2.png --cell 16x16 --each --scale 33 --preview` |
| [x] | Pans | pan-0-frying, pan-1-saucepan, pan-2-ladle (.png, from pans-sheet.jpg) | `python tools/pixelize.py sprite assets/kitchen/pans.png art/raw/pan-0-frying.png art/raw/pan-1-saucepan.png art/raw/pan-2-ladle.png --cell 36x46 --each --preview` |
| [x] | Basket | basket.png (used twice, from bubbles-basket-sheet.jpg) | `python tools/pixelize.py sprite assets/kitchen/basket.png art/raw/basket.png art/raw/basket.png --cell 60x36 --preview`, then keep rows >= 19 of frame 1 (front wall); ` |
| [x] | Ingredients | ing-carrot, ing-tomato, ing-mushroom, ing-onion, ing-potato, ing-peapod, ing-apple, ing-cheese (.png, from ingredients-sheet.jpg) | `python tools/pixelize.py sprite assets/kitchen/ingredients.png art/raw/ing-carrot.png art/raw/ing-tomato.png art/raw/ing-mushroom.png art/raw/ing-onion.png art/raw/ing-potato.png art/raw/ing-peapod.png art/raw/ing-apple.png art/raw/ing-cheese.png --cell 48x48 --each --preview` |

Troubleshooting: a pink halo around a sprite means the magenta wasn't pure.
Re-run with `--tol 120`. "bigger than cell" means the frames are framed
differently: regenerate the odd frame by editing the base image again.

## As built (2026-10-05)
All sprites above were generated and processed. The commands that actually
produced the committed assets differ from the table in these ways:

- **Raws are mostly `.jpg`** (Gemini's download format). Several were made as
  one multi-item image and split: `pip-pair.jpg` (user's two Pip poses →
  `pip-0-idle.png`, `pip-1-breathe.png`), `ingredients-sheet.jpg` (4×2 grid →
  `ing-*.png`), `pans-sheet.jpg` (thirds → `pan-*.png`),
  `bubbles-basket-sheet.jpg` (split at the gaps → `bubble-*.png`, `basket.png`).
- **Frames of one character must share pixel size**: Pip's blink/talk edits
  came back larger and were resized to the base size before pixelizing.
- `--tol 120`/`130` for everything except Pip (JPEG edges).
- **Clementine**: `--cell 120x200` (not 90x200; the taste spoon and wave
  widen the shared box). Frame 1 (breathe) is frame 0 with the upper body
  shifted down 1 px, not a Gemini image.
- **Cat**: frame 1 is "doze" (eyes closed), replacing the planned tail-flick
  frame, which came out with two tails.
- **Bird**: `--cell 40x34` (32x28 was illegible).
- **Basket**: `--cell 60x36`; frame 1 keeps rows ≥ 19 (front wall).
- **Fire**: frames are fire-0, 1, 2, 1 (fire-3 had a tan fill).
- **Bubbles**: `--each --scale 33` so the small/big sizes differ.
- **Pot and pans**: magenta trapped inside handle loops snapped to purple;
  those purple pixels were cleared after pixelizing. Pot soup hole:
  x=32 y=29 w=96 h=37 (art px).

# Music Tower (bells) — as built (2026-10-05)
Raws in `art/raw/`, references `art/ref/bells-*.png`, `bram.png`, `pigeon.png`, `vane.png`.

| Asset | Raws | How |
|---|---|---|
| `assets/bells/bg.png` | `bells-bg.jpg` (Gemini edit: white clouds, yellow sun, clear sky) | `pixelize.py bg` (now despeckles) |
| `assets/bells/bells.png` | `bells-row-0-idle.jpg`, `-1-blink.jpg`, `-2-sing.jpg` (one row of 5 bells each, split at the gaps → `bell-<C|D|E|G|A>-<0|1|2>.png`) | per colour `make_sprite` 3 frames, cell 75x88, one shared scale; 15 cells in C D E G A order; trapped-magenta purple cleared |
| `assets/bells/bram.png` | `bram-0-idle`, `-2-blink`, `-3-talk`, `-4-conduct-a`, `-5-conduct-b` | cell 92x122; frame 1 = breathe (frame 0 upper body shifted down 1 px); purple + detached fleck cleared |
| `assets/bells/pigeon.png` | `pigeon-0-idle`, `-1-peck`, `-2-wings-up`, `-3-wings-down` | cell 46x40, `--tol 100` (keep the purple neck); second pigeon mirrored in CSS |
| `assets/bells/cloud.png` | `cloud-vane-sheet.jpg` left half → `cloud.png` | cell 100x60 |
| `assets/bells/vane.png` | same sheet right half → `vane.png` | cell 50x62; 4 spin frames built in code from the top 30 rows (side, edge-on, mirrored, edge-on mirrored) |

Notes: the first bells row Gemini returned had part of the reference
screenshot blended into it; it was discarded and the eyes-open row was made by
editing the clean blink row. Re-attach the base image for every pose edit —
chained edits drift (bird pecking head, two-tailed cat).

# Royal Garden — as built (2026-10-06)
Raws in `art/raw/`, references `art/ref/garden-*.png`, `gus.png`. Sheets were
split into cells (background turned pure magenta, stray blobs from
neighbouring cells dropped) before `pixelize.py sprite`.

| Asset | Raws | How |
|---|---|---|
| `assets/garden/bg.png` | `garden-bg.jpg` | `pixelize.py bg` |
| `assets/garden/gus.png` | `gus-0-idle`, `-2-blink`, `-3-talk` | cell 125x165, `--tol 110`; face rows 24–90 of blink/talk composited onto frame 0; frame 1 = breathe (upper body above row 90 shifted down 1 px) |
| `assets/garden/pics.png` | `garden-pics-sheet.jpg` (6x4 grid; row 4 was a repeat of row 3 and is unused) | 18 cells of 56x56, `--each` |
| `pot`, `bunny`, `bush`, `fountain`, `sunflower` (x2), `frog` (x2) | `garden-props-a.jpg` (4x2 grid) | cells 90x83, 40x53, 58x45, 95x105, 55x115, 70x55; dark magenta fringe turned to ink; fountain's stray cave purples remapped to stone greys |
| `packets` (x6), `flowers` (x6), `bfly` (x4) | `garden-props-b.jpg` (6x3 grid; ladybug and stone unused) | cells 60x75, 70x85 (frame 0 = sprout), 32x28 |

Palette: added terracotta (`#e0784e #bd5338 #a24230`) and leaf greens
(`#82b451 #44743e`) — the pot and lily pads speckled without them.
Gemini's first picture sheet came back on a pale pink background, not
magenta; only treat pink as background when the sheet really is pink, or
hot-pink art (pink packet, pink flower) gets keyed.
