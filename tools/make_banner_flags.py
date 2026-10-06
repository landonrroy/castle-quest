#!/usr/bin/env python3
"""Draw the Banner Hall pennants and flag symbols as pixel art.

The flags are procedural (7 colours x 6 symbols x 1-6 symbols per flag), so
they are drawn here rather than generated in Gemini:
  assets/banners/pennants.png  8 cells of 50x70: the 7 COLORS (game order)
                               then the empty "?" slot
  assets/banners/symbols.png   36 cells of 25x25: cell (n-1)*6 + symbol, where
                               n = symbols on the flag (sets the size) and
                               symbol follows SYMBOLS in js/rooms/banners.js
Run from the repo root: python tools/make_banner_flags.py
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw

import pixelize as px

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'banners'
INK = (0x3a, 0x2a, 0x1a, 255)
GOLD, GOLD_D = (0xff, 0xd2, 0x3f, 255), (0xe0, 0xa3, 0x00, 255)
WHITE = (255, 255, 255, 255)
COLORS = [  # fill, dark — same order as COLORS in banners.js
    ('#e8423f', '#b32421'), ('#2f7fe0', '#1d56a3'), ('#ffc928', '#d99a00'),
    ('#3fb950', '#23812f'), ('#9b5de5', '#6a35ad'), ('#ff8c2b', '#c25e0c'),
    ('#ff6fae', '#c93c7e'),
]
SYMBOLS = ['star', 'heart', 'moon', 'circle', 'crown', 'diamond']
SIZES = {1: 25, 2: 18, 3: 16, 4: 15, 5: 14, 6: 12}  # symbol size in art px per count
FW, FH, SC = 50, 70, 25


def rgba(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def flag_poly(inset=0):
    # FLAG_PATH 'M8 10 H92 V98 L50 134 L8 98 Z' at half scale
    return [(4 + inset, 5 + inset), (45 - inset, 5 + inset), (45 - inset, 49 - inset * 0.4),
            (25, 66 - inset * 1.4), (4 + inset, 49 - inset * 0.4)]


def pennant(fill, dark, slot=False):
    im = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if slot:
        d.polygon(flag_poly(), fill=(255, 250, 240, 215))
        pts = flag_poly() + [flag_poly()[0]]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):  # dashed outline
            n = max(1, int(math.hypot(x1 - x0, y1 - y0)))
            for i in range(n):
                if (i // 3) % 2 == 0:
                    t = i / n
                    d.rectangle((round(x0 + (x1 - x0) * t), round(y0 + (y1 - y0) * t)) * 2, fill=INK)
        q = ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..']  # pixel "?"
        for y, row in enumerate(q):
            for x, ch in enumerate(row):
                if ch == '#':
                    d.rectangle((15 + x * 4, 16 + y * 4, 18 + x * 4, 19 + y * 4), fill=WHITE)
                    d.rectangle((15 + x * 4, 19 + y * 4, 18 + x * 4, 19 + y * 4), fill=INK)
    else:
        d.polygon(flag_poly(), fill=INK)
        d.polygon(flag_poly(2), fill=rgba(fill))
        d.polygon([(35, 7), (43, 7), (43, 48), (35, 54)], fill=rgba(dark))      # shade
        d.polygon([(6, 7), (10, 7), (10, 50), (6, 48)], fill=(255, 255, 255, 70))  # highlight
        inner = flag_poly(6)
        for (x0, y0), (x1, y1) in zip(inner, inner[1:] + inner[:1]):           # stitching
            n = max(1, int(math.hypot(x1 - x0, y1 - y0)))
            for i in range(0, n, 4):
                t = i / n
                d.point((round(x0 + (x1 - x0) * t), round(y0 + (y1 - y0) * t)), fill=(255, 255, 255, 190))
        d.ellipse((22, 63, 28, 69), fill=INK); d.ellipse((23, 64, 27, 68), fill=GOLD)
    d.rectangle((1, 1, 48, 8), fill=INK); d.rectangle((2, 2, 47, 7), fill=GOLD)  # gold rod
    d.line((3, 6, 46, 6), fill=GOLD_D)
    return im


def symbol(sym, size):
    k = 8
    S = size * k
    big = Image.new('RGB', (S, S), (255, 0, 255))
    d = ImageDraw.Draw(big)
    c, r = S / 2, S / 2 - k * 0.5
    def star(R, rr):
        return [(c + math.cos(i * math.pi / 5 - math.pi / 2) * (R if i % 2 == 0 else rr),
                 c + math.sin(i * math.pi / 5 - math.pi / 2) * (R if i % 2 == 0 else rr) + k * 0.5) for i in range(10)]
    def heart(R):
        pts = []
        for i in range(60):
            t = i / 60 * 2 * math.pi
            x = 16 * math.sin(t) ** 3
            y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
            pts.append((c + x * R / 17, c - y * R / 17 + R * 0.08))
        return pts
    shapes = {
        'star': lambda R: ('poly', star(R, R * 0.45)),
        'heart': lambda R: ('poly', heart(R)),
        'circle': lambda R: ('ell', (c - R * 0.8, c - R * 0.8, c + R * 0.8, c + R * 0.8)),
        'diamond': lambda R: ('poly', [(c, c - R), (c + R * 0.72, c), (c, c + R), (c - R * 0.72, c)]),
        'crown': lambda R: ('poly', [(c - R * .95, c + R * .65), (c - R * .95, c - R * .55), (c - R * .45, c - R * .05),
                                     (c, c - R * .85), (c + R * .45, c - R * .05), (c + R * .95, c - R * .55), (c + R * .95, c + R * .65)]),
    }
    def draw(R, fill):
        if sym == 'moon':
            d.ellipse((c - R * .8, c - R * .8, c + R * .8, c + R * .8), fill=fill)
        else:
            kind, geo = shapes[sym](R)
            (d.polygon if kind == 'poly' else d.ellipse)(geo, fill=fill)
    draw(r, INK[:3]); draw(r - k * 1.2, WHITE[:3])
    if sym == 'moon':  # bite out of the circle
        R = r * .8; ox = R * .55
        d.ellipse((c - R + ox, c - R - k * .3, c + R + ox, c + R - k * .3), fill=INK[:3])
        d.ellipse((c - R + ox + k * 1.2, c - R - k * .3 + k * 1.2, c + R + ox + k * 3, c + R - k * .3 - k * 1.2), fill=(255, 0, 255))
    small = px.downsample(big, (size, size))
    out = px.key_out(small)
    cell = Image.new('RGBA', (SC, SC), (0, 0, 0, 0))
    cell.paste(out, ((SC - size) // 2, (SC - size) // 2))
    return cell


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGBA', (FW * 8, FH), (0, 0, 0, 0))
    for i, (f, dk) in enumerate(COLORS):
        sheet.paste(pennant(f, dk), (i * FW, 0))
    sheet.paste(pennant(None, None, slot=True), (7 * FW, 0))
    sheet.save(OUT / 'pennants.png')
    syms = Image.new('RGBA', (SC * 36, SC), (0, 0, 0, 0))
    for n, size in SIZES.items():
        for j, s in enumerate(SYMBOLS):
            syms.paste(symbol(s, size), (((n - 1) * 6 + j) * SC, 0))
    syms.save(OUT / 'symbols.png')
    print('wrote', OUT / 'pennants.png', OUT / 'symbols.png')


if __name__ == '__main__':
    main()
