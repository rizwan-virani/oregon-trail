# Oregon Trail: Unbroken

## What this is

A wagon-train survival game for the browser, built for a 9–12 year old who has
played the classic and wants more out of it. You take five people and one wagon
2,000 miles from Independence, Missouri to the Willamette Valley in Oregon,
across **13 legs of real trail** — and unlike the original, every leg ends in an
arcade challenge you actually have to play, six of them boss fights.

It keeps what makes the original good — food math, hard choices, people dying of
cholera — and adds what a kid actually wants: a repeating rifle, a grizzly bear,
a bandit gang, a blizzard you survive by feeding a fire, and a final run down the
Columbia River rapids.

It runs entirely in the browser with no build step, no dependencies, and no
network calls. All artwork is drawn at runtime with canvas primitives.

## What this is not

- **Not a clone of the commercial game.** No original code, art, text, or assets.
  Every line and every drawing here is original, inspired by the history and the
  genre. See the trademark note in `LICENSE`.
- **Not a history lesson.** The landmarks, distances, and dangers are broadly
  accurate to the 1848 emigrant trail, but this is a game first.
- **Not multiplayer, and not online.** One player, one machine, saves in
  `localStorage`.
- **Not gentle.** People get sick, break bones, drown, and starve. You can finish
  with two survivors. That is the point — but nothing on screen is gory.

## At a glance

| | |
|---|---|
| **Ages** | 9–12 (readable text, real difficulty) |
| **Legs of trail** | 13, Independence → Willamette Valley |
| **Boss fights** | 6 — bandit gang, grizzly, blizzard, wolf pack, Snake River, Columbia |
| **Arcade engines** | 4 — shooter, dodger, survival, repair |
| **Written events** | 30, most with 2–3 real choices |
| **Gear upgrades** | 12 |
| **Playable characters** | 4 classes, each with a score multiplier |
| **Session length** | ~20–35 minutes per run |
| **Tech** | Vanilla HTML/CSS/JS + canvas. No build, no dependencies |
| **Port** | 8127 |

## Features

- **13 real landmarks.** Kansas River, Fort Kearny, Chimney Rock, Fort Laramie,
  Independence Rock, South Pass, Green River, Fort Hall, Snake River, the Blue
  Mountains, The Dalles, and the Columbia.
- **Six boss fights.** The Kearny Gang rides your wagon down. The Laramie grizzly
  charges in waves. The South Pass blizzard makes you keep a fire alive until
  dawn. A wolf pack comes from both sides. Then the Snake, and finally the
  Columbia.
- **Four arcade engines**, reskinned per leg so no two challenges feel identical:
  mouse-aim shooting, wagon steering, fire survival, and hammer-timing repair.
- **Gear that changes how the game plays.** The Repeating Rifle gives you 8
  rounds and a faster trigger. Iron-Banded Wheels cut all wagon damage 40%. A dog
  named Bandit finds rabbits. Buy the Raft Kit *before* the Snake River.
- **Resource management that bites.** Food, ammo, parts, medicine, oxen, wagon
  condition, and five people with individual health. Pace and rations trade speed
  against lives.
- **30 written events** with choices that have real costs — including a few with
  no clean answer.
- **Four classes**: Trailblazer ($1,600, ×1 score), Carpenter (tougher wagon, ×2),
  Frontier Doc (medicine and health, ×2), Hunter (best gun, ×3).
- **Scoring and a Hall of Legends** kept in `localStorage`, so runs compete.
- **Autosave**, so a run survives a closed tab.

## How to use it

1. Open the game and pick a class. **Hunter** is the most fun and scores highest;
   **Trailblazer** is the easiest way to learn.
2. Name your five people. The first is you.
3. Buy supplies at Matt's. Food is life — but a broken wagon strands you, so
   leave money for parts.
4. On the trail, press **TRAVEL** to roll. Set **pace** and **rations** to trade
   speed against your party's health.
5. Handle events as they come. Reach the landmark, play the challenge.
6. Forts (Kearny, Laramie, Hall, The Dalles) let you resupply and buy gear —
   at a markup that climbs the further west you get.
7. Reach Oregon with as many people, oxen, and supplies as you can.

**Controls** — Shooting: mouse to aim, click or `Space` to fire, `R` to reload.
Steering: `←` `→` or `A` `D`. Everything else is a click.

## Run it locally

From the repository folder:

```
python -m http.server 8127
```

Then open **http://localhost:8127**. Any static file server works; there is no
build step and nothing to install.

## Project structure

```
oregon-trail/
├── index.html          All screens (title, shop, trail, challenge, end)
├── css/
│   └── style.css       Frontier theme — dust, iron, lantern light
├── js/
│   ├── data.js         Content: classes, the 13 legs, forts, shop, 30 events
│   ├── state.js        Save file, party, resources, the rules of survival
│   ├── minigames.js    Canvas: 4 arcade engines + the scrolling trail scene
│   ├── ui.js           Screen switching and all non-canvas rendering
│   └── game.js         Controller: trail → event → challenge → fort loop
├── README.md
└── LICENSE
```

Adding a leg means appending one object to `DATA.LEVELS` in `js/data.js`; adding
an event means appending one object to `DATA.EVENTS`. Neither requires touching
the engine.

## License

Dual-licensed — MIT for the code, CC BY-NC-SA 4.0 for the written game content.
See [LICENSE](LICENSE), including the trademark note on "The Oregon Trail".
