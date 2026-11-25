[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/vickyair1/the-copper-ladle/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/vickyair1/the-copper-ladle/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# The Copper Ladle — a rush-hour kitchen game

A complete, original cooking game that plays offline in a desktop browser from its own files. An entry for [make.fun's "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137).

You run a small kitchen under the lunch rush. Tickets land on the order board with a patience bar; you cook patties, fish, eggs and pasta on the stove, chop tomatoes on the board, stack everything on the plate, and click the ticket to serve before the customer walks out. Serve fast for tips, keep the combo alive, and survive the 150-second shift — then the next day comes faster, with new recipes on the menu.

## What is in the game

- **6 original recipes**: Copper Burger, Garden Stack, Sunrise Omelette, Seaside Pasta, Crispy Fish Bun and Golden Melt — each a different combination of the 8 ingredients, so every ticket is a small route-planning puzzle.
- **Three stations with real timing**: a two-burner stove (collect while golden, toss it when burnt), a chopping board (three chops per tomato), and the plate where the dish is assembled layer by layer.
- **Pressure that grows**: tickets arrive faster as the shift goes on, patience shrinks each day, and a new recipe joins the menu every day. Three hearts — lose one for every walk-out.
- **Scoring with teeth**: dish price plus a tip scaled to patience left, plus a combo bonus for serving streaks without a mistake.
- **Full game shell**: title screen, pause, mute, day-complete stars, game over, restart and next-day flow, keyboard shortcuts (1–8 ingredients, Space to serve, P pause, R restart).
- **Synthesized sound**: chops, sizzles, dings and serve chimes made live with WebAudio — no audio files, no network.
- **Original art**: the kitchen, the counters and every ingredient are drawn in code on canvas.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it over

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/game/, out/screenshots/ and out/dossier.json
```

## Layout

- `game/` — the playable game: `index.html`, `style.css`, and `src/` (one file per system: `config`, `state`, `kitchen`, `render`, `input`, `audio`, `shots`, `main`).
- `screenshots/` — 4 real renders of the game's own code: cover mid-service, the rush, a plate ready to serve, title.
- `main.ts` — the handover program; `vendor/makefun-game.ts` is the kit's file, unchanged.
