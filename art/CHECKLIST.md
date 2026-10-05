# Kitchen pilot — asset checklist

Raw Gemini output goes in `art/raw/`. Commands run from the repo root.
Previews (4×) are written to `art/preview/` for viewing.

## Gate 1: look + palette
- [x] `kitchen-bg.jpg` generated
- [x] palette extracted: `python tools/pixelize.py palette art/raw/kitchen-bg.jpg --size 640x360`
- [x] background: `python tools/pixelize.py bg art/raw/kitchen-bg.jpg assets/kitchen/bg.png --preview`
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
