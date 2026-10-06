#!/usr/bin/env python3
"""pixelize: turn AI "fake pixel art" into true pixel art for Castle Quest.

Commands (run from the repo root):
  palette RAW [--size 640x360] [--colors 32]
      Extract N colors (default 32) from the approved background and add 16 fixed
      accent colors, then write assets/palette.png + js/palette.js. Run once;
      the palette is then locked.
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
FRINGE_TOL = 150  # max distance from magenta for an edge pixel to count as fringe

# Accent ramps added to every palette, so characters and props keep colors
# the background room may not contain (greens, blues, yellows, fire, purple, pink).
ACCENTS = [
    '#2f8a3a', '#3fb950', '#8fd16b',   # green
    '#1f4f9a', '#2f7fe0', '#9cc0ff',   # blue
    '#e0a300', '#ffd23f', '#fff1a8',   # yellow
    '#ff6a1a', '#ff9a3c',              # fire orange
    '#5b2a9a', '#9b5de5',              # purple
    '#ff8fb0',                         # pink
    '#ffffff', '#3a2a1a',              # white, outline ink
    '#4f9fe8', '#7cc4ff', '#b8e2ff',   # sky
    '#e8eef4',                         # cloud white
    '#e8423f',                         # bright red
    '#c9f7a8',                         # pale green
]


def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def parse_size(s):
    w, h = s.lower().split('x')
    return int(w), int(h)


def dist2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2


def pixels(img):
    """All pixel values, flattened (Pillow 12 renamed getdata)."""
    get = getattr(img, 'get_flattened_data', None)
    return list(get() if get else img.getdata())


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
    used = sorted(set(pixels(q)))
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


NEIGHBOURS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def key_out(img, key=MAGENTA, tol=90, hole=False):
    """Make the background transparent: flood-fill from the border through
    pixels within `tol` of `key`. With hole=True also clear every pixel near
    cyan (the soup cutout). Finally clear opaque pixels on the cut edge that
    are still magenta-ish (blended fringe: near the key and red/blue well above green)."""
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
    f2 = FRINGE_TOL ** 2
    fringe = [(x, y) for y in range(h) for x in range(w)
              if p[x, y][3] and dist2(p[x, y], key) <= f2
              and p[x, y][0] - p[x, y][1] >= 60 and p[x, y][2] - p[x, y][1] >= 60
              and any(0 <= x + dx < w and 0 <= y + dy < h and p[x + dx, y + dy][3] == 0
                      for dx, dy in NEIGHBOURS)]
    for x, y in fringe:
        p[x, y] = (0, 0, 0, 0)
    return img


def color_bbox(img, color, tol=90):
    """Bounding box (x0, y0, x1, y1) of pixels within tol of color, or None."""
    t2 = tol * tol
    mask = Image.new('L', img.size)
    mask.putdata([255 if dist2(c, color) <= t2 else 0 for c in pixels(img.convert('RGB'))])
    return mask.getbbox()


def content_bbox(img, key=MAGENTA, tol=90):
    """Bounding box of everything that isn't background (full resolution)."""
    t2 = tol * tol
    mask = Image.new('L', img.size)
    mask.putdata([0 if dist2(c, key) <= t2 else 255 for c in pixels(img.convert('RGB'))])
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
    return list(dict.fromkeys(pixels(Image.open(path or PALETTE_PNG).convert('RGB'))))


def require_palette():
    if not Path(PALETTE_PNG).exists():
        raise SystemExit('No palette yet: run "python tools/pixelize.py palette art/raw/kitchen-bg.jpg" first.')
    return load_palette(PALETTE_PNG)


def despeckle(img, max_dist=70, passes=2):
    """Remove lone pixels that sit between two close palette colours (a sky
    gradient snapped to two blues turns into noise). A pixel takes the colour
    shared by at least 6 of its 8 neighbours when that colour is within
    max_dist of its own, so dark outlines and real detail survive."""
    img = img.convert('RGBA')
    w, h = img.size
    m2 = max_dist * max_dist
    for _ in range(passes):
        src = img.copy().load()
        p = img.load()
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                c = src[x, y]
                if c[3] == 0:
                    continue
                votes = Counter(src[x + dx, y + dy] for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy)
                best, n = votes.most_common(1)[0]
                if n >= 6 and best != c and best[3] and dist2(best, c) <= m2:
                    p[x, y] = best
    return img


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


def scale_arg(s):
    if s == 'auto':
        return s
    try:
        v = float(s)
    except ValueError:
        v = 0
    if not v > 0:
        raise argparse.ArgumentTypeError(f"invalid scale {s!r}: use 'auto' or a positive number")
    return v


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('palette')
    p.add_argument('raw')
    p.add_argument('--size', default='640x360')
    p.add_argument('--colors', type=int, default=32)
    b = sub.add_parser('bg')
    b.add_argument('raw')
    b.add_argument('out')
    b.add_argument('--size', default='640x360')
    b.add_argument('--preview', action='store_true')
    s = sub.add_parser('sprite')
    s.add_argument('out')
    s.add_argument('raws', nargs='+')
    s.add_argument('--cell', required=True)
    s.add_argument('--scale', type=scale_arg, default='auto')
    s.add_argument('--each', action='store_true')
    s.add_argument('--hole', action='store_true')
    s.add_argument('--tol', type=int, default=90)
    s.add_argument('--preview', action='store_true')
    a = ap.parse_args(argv)

    if a.cmd == 'palette':
        pal = list(dict.fromkeys(extract_palette(downsample(Image.open(a.raw), parse_size(a.size)), a.colors) + [hex_rgb(h) for h in ACCENTS]))
        if len(pal) < a.colors:
            print(f'warning: only {len(pal)} colors found (asked for {a.colors})')
        write_palette(pal, PALETTE_PNG, PALETTE_JS)
        print(f'wrote {PALETTE_PNG} and {PALETTE_JS} ({len(pal)} colors)')
    elif a.cmd == 'bg':
        img = despeckle(snap(downsample(Image.open(a.raw), parse_size(a.size)), require_palette()))
        save(img.convert('RGB'), a.out, a.preview)
    elif a.cmd == 'sprite':
        sheet, sc, holes = make_sprite(a.raws, parse_size(a.cell), a.scale, a.hole, a.each, a.tol, require_palette())
        save(sheet, a.out, a.preview)
        print(f'scale {sc:.2f} source px per art px')
        for i, hb in enumerate(holes):
            if hb:
                print(f'frame {i}: soup hole x={hb[0]} y={hb[1]} w={hb[2] - hb[0]} h={hb[3] - hb[1]} (art px)')


if __name__ == '__main__':
    main()
