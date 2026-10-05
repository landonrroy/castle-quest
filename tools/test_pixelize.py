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
