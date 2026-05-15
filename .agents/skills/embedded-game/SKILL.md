---
title: Embedded Game
description: Use when changing the separately buildable Primer game, host iframe integration, embedded/standalone runtime behavior, or iframe message contract.
---

# Embedded Game

Use this skill when changing the separately buildable Primer game under `game/`, the host iframe integration, embedded or standalone runtime behavior, or the `postMessage` bridge.

Keep `game/` independently understandable. Root scripts may call into it, but the embedded app must remain runnable with Bun's `--cwd` behavior.

## Boundaries

- The game is a Vite app under `game/`.
- The host embeds the game in an iframe.
- `shared/bridge.ts` owns bridge schemas, message types, and bridge version.
- The host owns iframe chrome, page layout, and bridge status display.
- The game owns iframe viewport content only.

## Non-Negotiables

- Keep `game/vite.config.ts` output portable with `base: './'`.
- Embedded build output goes to `public/game`; standalone build output goes to `game/dist`.
- Embedded mode waits for `host:init` and uses the bridge-provided `primerPublishableKey`.
- Standalone mode reads Primer config from `game/.env`.
- Use `VITE_IS_EMBEDDED`, not iframe presence, to choose runtime behavior.
- Do not send Primer origin, access tokens, raw Primer SDK state, or host product data over the bridge.
- Validate bridge message shape, type, version, origin, and source before acting.

## References

- `references/packaging.md`: build outputs, portable assets, embedded vs standalone mode, and iframe layout ownership.
- `references/iframe-message-contract.md`: bridge lifecycle, message contract, and validation rules.
