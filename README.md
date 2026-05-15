# Primer Starter

A Vite + React starter that runs Primer inside a separately buildable game. The root app hosts the game in an iframe and sends Primer config through a small `postMessage` bridge.

The repo supports two workflows:

- Embedded mode: run the host app and game together. The host reads `.env` and sends the Primer publishable key through `host:init`.
- Standalone mode: run or build only the game. The game reads `game/.env` directly and can be hosted as static files without the host bridge.

## Setup

Install dependencies from the repo root:

```bash
bun install
```

For the embedded host workflow, copy the root env example:

```bash
cp .env.example .env
```

Set your Primer publishable key:

```env
VITE_PRIMER_PUBLISHABLE_KEY=pk_live_your_actual_key_here
```

You can get a publishable key from [https://primerlearn.dev/keys](https://primerlearn.dev/keys).

## Embedded Development

Run the host and game dev servers together:

```bash
bun dev
```

Open [http://localhost:5173](http://localhost:5173). The host iframe loads the game dev server at `http://localhost:5174`, so both apps keep normal Vite HMR.

## Embedded Build

Build the game into the host public directory, then build the host:

```bash
bun run build
```

Embedded output flow:

```txt
game build -> public/game/ -> host build -> dist/game/
```

The production host iframe loads `/game/index.html`.

## Standalone Game

For game-only development, copy the game env example:

```bash
cp game/.env.example game/.env
```

Then set `VITE_PRIMER_PUBLISHABLE_KEY` in `game/.env` and run:

```bash
bun run dev:standalone
```

Build standalone static output with:

```bash
bun run build:standalone
```

Standalone output goes to `game/dist/`. That bundle includes the game env publishable key and does not wait for the host bridge.

## Scripts

| Command | What it does |
| --- | --- |
| `bun dev` | Run embedded dev with host on 5173 and game on 5174 |
| `bun run build` | Build embedded game output, then the host |
| `bun run dev:standalone` | Run only the game with config from `game/.env` |
| `bun run build:standalone` | Build only the standalone game into `game/dist/` |
| `bun run typecheck` | TypeScript check |
| `bun run lint` | Biome check |

## Project Layout

```txt
src/                 host app
game/                Primer game
shared/              bridge and Primer config schemas shared by both apps
public/game/         generated embedded game output
game/dist/           generated standalone game output
```

The game uses `VITE_IS_EMBEDDED` to choose deployment behavior: 

- Embedded mode waits for `host:init`
- Standalone mode reads `game/.env`
