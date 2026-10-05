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
    assert all(c[:3] in pal for c in px.pixels(img.convert('RGBA')))


def body_on_magenta(size=12, body=(2, 10), color=(20, 20, 30)):
    img = Image.new('RGB', (size, size), px.MAGENTA)
    d = img.load()
    for y in range(*body):
        for x in range(*body):
            d[x, y] = color
    return img


def test_key_out_removes_only_border_connected_background():
    img = body_on_magenta()
    d = img.load()
    for y in range(5, 7):
        for x in range(5, 7):
            d[x, y] = px.MAGENTA  # enclosed magenta, not background
    out = px.key_out(img)
    assert out.getpixel((0, 0))[3] == 0
    assert out.getpixel((11, 11))[3] == 0
    assert out.getpixel((2, 2)) == (20, 20, 30, 255)
    assert out.getpixel((5, 5)) == (*px.MAGENTA, 255)


def test_key_out_strips_pink_fringe():
    img = body_on_magenta(body=(3, 9))
    img.putpixel((2, 5), (200, 80, 200))  # blended edge pixel, outside tol
    out = px.key_out(img)
    assert out.getpixel((2, 5))[3] == 0
    assert out.getpixel((3, 5))[3] == 255


def test_key_out_keeps_white_edge_pixels():
    img = body_on_magenta(body=(3, 9))
    img.putpixel((2, 5), (255, 255, 255))  # white highlight on the cut edge
    out = px.key_out(img, tol=120)
    assert out.getpixel((2, 5)) == (255, 255, 255, 255)


def test_key_out_keeps_warm_edge_pixels():
    # peach/orange edge pixels are within 2*tol of magenta but not pinkish
    for c in [(255, 200, 150), (255, 230, 120)]:
        img = body_on_magenta(body=(3, 9))
        img.putpixel((2, 5), c)
        out = px.key_out(img, tol=120)
        assert out.getpixel((2, 5)) == (*c, 255)


def test_hole_clears_cyan_and_reports_box():
    img = body_on_magenta(body=(2, 11))
    d = img.load()
    for y in range(4, 7):
        for x in range(4, 7):
            d[x, y] = px.CYAN
    assert px.color_bbox(img, px.CYAN) == (4, 4, 7, 7)
    out = px.key_out(img, hole=True)
    assert out.getpixel((5, 5))[3] == 0
    assert out.getpixel((3, 5))[3] == 255


def block_on_magenta(tmp_path, name, color, at=(100, 60), cells=(5, 5), block=40, size=(400, 400)):
    grid = [[color] * cells[0] for _ in range(cells[1])]
    img = Image.new('RGB', size, px.MAGENTA)
    img.paste(fake_pixel_art(grid, block, jitter=0, noise=0), at)
    p = tmp_path / name
    img.save(p)
    return p


def opaque_box(sheet, frame, cell):
    cw, ch = cell
    return sheet.crop((frame * cw, 0, frame * cw + cw, ch)).getchannel('A').getbbox()


def test_make_sprite_bottom_centres_frames(tmp_path):
    raw = block_on_magenta(tmp_path, 'a.png', PAL[2])
    sheet, scale, holes = px.make_sprite([raw, raw], (8, 8), scale='40', palette=PAL)
    assert sheet.size == (16, 8)
    assert scale == 40
    assert holes == [None, None]
    for f in (0, 1):
        assert opaque_box(sheet, f, (8, 8)) == (1, 3, 6, 8)
    assert sheet.getpixel((10, 5)) == (*PAL[2], 255)


def test_make_sprite_auto_scale_fits_cell(tmp_path):
    raw = block_on_magenta(tmp_path, 'a.png', PAL[3], cells=(5, 5), block=40)
    sheet, scale, _ = px.make_sprite([raw], (8, 8), palette=PAL)
    assert abs(scale - 200 / 6) < 0.01
    x0, y0, x1, y1 = opaque_box(sheet, 0, (8, 8))
    assert (x1 - x0, y1 - y0) == (6, 6)


def test_make_sprite_shared_box_keeps_frames_aligned(tmp_path):
    a = block_on_magenta(tmp_path, 'a.png', PAL[2], at=(100, 100), cells=(4, 4))
    b = block_on_magenta(tmp_path, 'b.png', PAL[2], at=(100, 60), cells=(4, 5))  # taller: arm raised
    sheet, _, _ = px.make_sprite([a, b], (8, 8), scale='40', palette=PAL)
    assert opaque_box(sheet, 0, (8, 8)) == (2, 4, 6, 8)
    assert opaque_box(sheet, 1, (8, 8)) == (2, 3, 6, 8)


def test_make_sprite_each_fits_frames_independently(tmp_path):
    a = block_on_magenta(tmp_path, 'a.png', PAL[2], at=(10, 10), cells=(2, 2))
    b = block_on_magenta(tmp_path, 'b.png', PAL[4], at=(200, 200), cells=(4, 4))
    sheet, _, _ = px.make_sprite([a, b], (8, 8), scale='40', each=True, palette=PAL)
    assert opaque_box(sheet, 0, (8, 8)) == (3, 6, 5, 8)
    assert opaque_box(sheet, 1, (8, 8)) == (2, 4, 6, 8)


def test_make_sprite_rejects_oversized(tmp_path):
    raw = block_on_magenta(tmp_path, 'a.png', PAL[2])
    with pytest.raises(SystemExit):
        px.make_sprite([raw], (4, 4), scale='40', palette=PAL)


def test_make_sprite_reports_hole(tmp_path):
    grid = [[PAL[0]] * 6 for _ in range(6)]
    for y in range(1, 3):
        for x in range(1, 5):
            grid[y][x] = px.CYAN
    img = Image.new('RGB', (400, 400), px.MAGENTA)
    img.paste(fake_pixel_art(grid, 40, jitter=0, noise=0), (80, 80))
    raw = tmp_path / 'pot.png'
    img.save(raw)
    sheet, _, holes = px.make_sprite([raw], (8, 8), scale='40', hole=True, palette=PAL)
    assert holes == [(2, 3, 6, 5)]  # 6x6 body bottom-centred at (1, 2)
    assert sheet.getpixel((3, 3))[3] == 0


def test_palette_command_adds_accents(tmp_path, monkeypatch):
    raw = tmp_path / 'raw.png'
    fake_pixel_art(rand_grid(16, 9, seed=7), 12).save(raw)
    pal_png, pal_js = tmp_path / 'palette.png', tmp_path / 'palette.js'
    monkeypatch.setattr(px, 'PALETTE_PNG', pal_png)
    monkeypatch.setattr(px, 'PALETTE_JS', pal_js)
    px.main(['palette', str(raw), '--size', '16x9', '--colors', '6'])
    pal = px.load_palette(pal_png)
    for hexc in px.ACCENTS:
        rgb = tuple(int(hexc[i:i + 2], 16) for i in (1, 3, 5))
        assert rgb in pal, hexc
    assert len(pal) <= 6 + len(px.ACCENTS)
