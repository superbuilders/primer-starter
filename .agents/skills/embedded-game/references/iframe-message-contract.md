# Iframe Message Contract

Keep `shared/bridge.ts` as the contract source for message schemas, bridge version, and message types.

## Messages

All bridge messages include `bridgeVersion: BRIDGE_VERSION`.

- `host:init`: host to game, includes only `primerPublishableKey`.
- `game:ready`: game to host, listener is installed and can receive `host:init`.
- `game:started`: game to host, Primer startup succeeded.
- `game:complete`: game to host, learning session finished.
- `game:error`: game to host, includes a safe display/log string as `error`.

Do not rename `bridgeVersion`. Do not add access tokens, Primer origin, raw Primer SDK state, or host product data to the bridge.

## Lifecycle

Hosted startup is: iframe loads, game installs listener, game sends `game:ready`, host sends `host:init`, game starts Primer, then game sends `game:started`, `game:complete`, or `game:error`.

`host:init` is idempotent. The host may send it from iframe `load` and again after `game:ready`; the game should start from the first valid init config.

## Validation Rules

- Validate message shape with schemas from `shared/bridge.ts`.
- Validate `type` and `bridgeVersion` before acting.
- Validate sender origin before acting.
- Validate message source when the expected window is known.
- Treat unknown messages, versions, origins, or sources as no-ops.
- Do not use `window.parent === window` to decide embedded vs standalone behavior.
