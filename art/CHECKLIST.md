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
| [x] | Pip | pip-0-idle, pip-1-breathe, pip-2-blink, pip-3-talk | `python tools/pixelize.py sprite assets/common/pip.png art/raw/pip-0-idle.png art/raw/pip-1-breathe.png art/raw/pip-2-blink.png art/raw/pip-3-talk.png --cell 84x84 --preview` |
| [x] | Clementine | cc-0-idle … cc-7-yum (8) | `python tools/pixelize.py sprite assets/kitchen/clementine.png art/raw/cc-0-idle.png art/raw/cc-1-breathe.png art/raw/cc-2-blink.png art/raw/cc-3-talk.png art/raw/cc-4-wave-a.png art/raw/cc-5-wave-b.png art/raw/cc-6-taste.png art/raw/cc-7-yum.png --cell 90x200 --preview` |
| [x] | Cat | cat-0-idle … cat-4-happy (5) | `python tools/pixelize.py sprite assets/kitchen/cat.png art/raw/cat-0-idle.png art/raw/cat-1-tail.png art/raw/cat-2-ears.png art/raw/cat-3-meow.png art/raw/cat-4-happy.png --cell 64x56 --preview` |
| [x] | Bird | bird-0-idle … bird-4-wings-down (5) | `python tools/pixelize.py sprite assets/kitchen/bird.png art/raw/bird-0-idle.png art/raw/bird-1-peck.png art/raw/bird-2-wings-up.png art/raw/bird-3-wings-mid.png art/raw/bird-4-wings-down.png --cell 32x28 --preview` |
| [x] | Fire | fire-0 … fire-3 | `python tools/pixelize.py sprite assets/kitchen/fire.png art/raw/fire-0.png art/raw/fire-1.png art/raw/fire-2.png art/raw/fire-3.png --cell 150x75 --preview` |
| [x] | Pot | pot-0, pot-1-burp | `python tools/pixelize.py sprite assets/kitchen/pot.png art/raw/pot-0.png art/raw/pot-1-burp.png --cell 160x140 --hole --preview` |
| [x] | Bubbles | bubble-0 … bubble-2 | `python tools/pixelize.py sprite assets/kitchen/bubble.png art/raw/bubble-0.png art/raw/bubble-1.png art/raw/bubble-2.png --cell 16x16 --each --preview` |
| [x] | Pans | pan-0-frying, pan-1-saucepan, pan-2-ladle | `python tools/pixelize.py sprite assets/kitchen/pans.png art/raw/pan-0-frying.png art/raw/pan-1-saucepan.png art/raw/pan-2-ladle.png --cell 36x46 --each --preview` |
| [x] | Basket | basket (used twice) | `python tools/pixelize.py sprite assets/kitchen/basket.png art/raw/basket.png art/raw/basket.png --cell 60x28 --preview`, then cut frame 1 (Task 6) |
| [x] | Ingredients | ing-carrot, ing-tomato, ing-mushroom, ing-onion, ing-potato, ing-peapod, ing-apple, ing-cheese | `python tools/pixelize.py sprite assets/kitchen/ingredients.png art/raw/ing-carrot.png art/raw/ing-tomato.png art/raw/ing-mushroom.png art/raw/ing-onion.png art/raw/ing-potato.png art/raw/ing-peapod.png art/raw/ing-apple.png art/raw/ing-cheese.png --cell 48x48 --each --preview` |

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
- **Bird**: `--cell 40x34` (32x28 was illegible).
- **Basket**: `--cell 60x36`; frame 1 keeps rows ≥ 19 (front wall).
- **Fire**: frames are fire-0, 1, 2, 1 (fire-3 had a tan fill).
- **Bubbles**: `--each --scale 33` so the small/big sizes differ.
- **Pot and pans**: magenta trapped inside handle loops snapped to purple;
  those purple pixels were cleared after pixelizing. Pot soup hole:
  x=32 y=29 w=96 h=37 (art px).
