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
