# Castle Quest — The King's Lost Jewels

A point-and-click castle adventure for kids under 10, inspired by the 1996
Fisher-Price *Castle* CD-ROM. A big gust of wind blew the six jewels off King
Rollo's crown. Pip the little dragon needs help finding them, and every room
in the castle has a puzzle to solve.

## How to play
**Play online:** https://landonrroy.github.io/castle-quest/

Double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox or Safari).
It needs no install, no server and no internet connection. With internet it also loads a
nicer rounded font.

To serve it locally instead, run:

```bash
python -m http.server 8642
```

then open http://localhost:8642.

## Rooms & skills
| Room | Character | Jewel | Skill |
|---|---|---|---|
| Royal Kitchen | Cook Clementine | Ruby | Counting, adding |
| Music Tower | Bram the Bellringer | Sapphire | Listening, sequence memory |
| Wizard's Tower | Wizard Wendell | Amethyst | Memory matching, sight words |
| Banner Hall | Lady Lark | Emerald | Patterns |
| Dragon's Cave | Mama Ember | Topaz | Mazes, planning |
| Royal Garden | Gus the Gardener | Diamond | Letters, phonics, spelling |
| Throne Room | King Rollo | – | Grand finale once all six jewels are found |

Three levels: **Little Squire** (ages 3–5), **Brave Knight** (5–7) and
**Royal Wizard** (7–9). Pick one on the title screen, or tap the star badge on
the castle map. Every puzzle is randomized, so replays are different.

Pip speaks every instruction aloud using the browser's built-in voice. Tap Pip
to hear the last line again. Voice, music and full-screen toggles are in the
top-right corner. Progress is saved in the browser's local storage.

## Code layout
- `index.html` loads everything with plain `<script>` tags. There is no build step.
- `js/engine.js` holds the stage scaling, synthesized audio, speech, the Pip guide, HUD, drag & drop, saving and the room API.
- `js/scenes.js` has the title screen, the castle map and the throne-room finale.
- `js/rooms/*.js` has one file per puzzle room. See `ROOM_API.md` for the contract.
- `css/style.css` holds the shared styles.
- `assets/` holds the pixel art PNGs and `assets/palette.png` (the locked game palette).
- `art/` has the style guide, Gemini prompts, asset checklist and raw generations.
- `tools/pixelize.py` turns raw Gemini images into true pixel art (`pip install -r tools/requirements.txt`, tests: `python -m pytest tools`).
