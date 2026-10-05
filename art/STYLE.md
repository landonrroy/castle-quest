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
Locked after the Kitchen background is approved: `assets/palette.png` — 32 colors taken from the Kitchen background plus 16 fixed accent colors (`ACCENTS` in tools/pixelize.py) for greens, blues, yellows, fire, purple, pink, white and outline ink. `tools/pixelize.py` snaps every asset to it, so small color drift between Gemini images is fine.
