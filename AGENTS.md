# Project Notes

This project uses Vite + React, not Next.js. Use Vite conventions for entrypoints, env vars, and build output.

The repo contains a root host app and a separately buildable Primer game under `game/`.

Use Bun workspaces from the repo root. `bun install` installs root and game dependencies.

## Commands

- `bun dev`: run embedded development with host on port 5173 and game on port 5174.
- `bun run build`: build the embedded game into `public/game/`, then build the host.
- `bun run dev:standalone`: run only the game with config from `game/.env`.
- `bun run build:standalone`: build only the standalone game into `game/dist/`.

The game uses `VITE_IS_EMBEDDED` to choose behavior. Embedded mode waits for `host:init`; standalone mode reads `VITE_PRIMER_PUBLISHABLE_KEY` from `game/.env`.
