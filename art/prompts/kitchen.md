# Kitchen pilot — Gemini prompts

How to use: open Gemini (image generation), start each prompt with the
**style block** from `art/STYLE.md`, attach the listed reference images, and
paste the prompt. Save the result **unchanged** as PNG to `art/raw/<file>`.
If Gemini offers an aspect ratio, use the one listed.

Generate in this order. After #1, stop and send it to Claude for the
palette/look approval before doing the rest.

---

## 1. Kitchen background — `kitchen-bg.jpg` (16:9 landscape)
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
