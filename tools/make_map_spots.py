#!/usr/bin/env python3
"""Cut the castle-map hotspots out of assets/castle/map-bg.png.

Each room's building is masked by a polygon (stage px, 1280x720) and saved as
assets/castle/spot-<room>.png (art px, transparent outside the polygon), so
the map can light up just that building on hover. The same polygons are the
tap areas in js/scenes.js (SPOT_POLYS) — keep the two in sync.
Run from the repo root: python tools/make_map_spots.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SPOTS = {
    'kitchen': [(28, 402), (148, 296), (190, 334), (190, 298), (228, 298), (228, 366), (270, 402),
                (246, 402), (246, 556), (52, 556), (52, 402)],
    'bells':   [(262, 214), (336, 98), (336, 56), (378, 70), (346, 84), (410, 214), (394, 214),
                (394, 600), (280, 600), (280, 214)],
    'banners': [(394, 304), (540, 304), (540, 600), (394, 600)],
    'throne':  [(538, 186), (648, 186), (648, 104), (716, 104), (716, 186), (766, 186), (766, 600), (538, 600)],
    'wizard':  [(878, 214), (954, 96), (936, 46), (972, 46), (956, 96), (1028, 214), (1010, 214),
                (1010, 600), (896, 600), (896, 214)],
    'cave':    [(1012, 545), (1050, 390), (1080, 380), (1150, 280), (1190, 226), (1240, 290),
                (1280, 280), (1280, 545)],
    'garden':  [(960, 720), (990, 590), (1030, 548), (1280, 548), (1280, 720)],
}


def main():
    bg = Image.open(ROOT / 'assets' / 'castle' / 'map-bg.png').convert('RGBA')
    for room, poly in SPOTS.items():
        art = [(x / 2, y / 2) for x, y in poly]
        mask = Image.new('L', bg.size, 0)
        ImageDraw.Draw(mask).polygon(art, fill=255)
        cut = Image.new('RGBA', bg.size, (0, 0, 0, 0))
        cut.paste(bg, (0, 0), mask)
        box = mask.getbbox()
        cut.crop(box).save(ROOT / 'assets' / 'castle' / f'spot-{room}.png')
        print(f"{room}: x {box[0] * 2}, y {box[1] * 2}, w {(box[2] - box[0]) * 2}, h {(box[3] - box[1]) * 2}")


if __name__ == '__main__':
    main()
