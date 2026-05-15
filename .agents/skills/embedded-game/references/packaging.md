# Build And Portability

## Build Rules

`game/vite.config.ts` must keep portable static output:

```ts
base: './'
build.outDir: isEmbedded ? '../public/game' : 'dist'
```

Treat `public/game/` and `game/dist/` as build output, not source.

## Portability Rules

- Do not assume the game is served from the domain root.
- Avoid root-absolute game asset paths, such as `/assets/example.png` or `/temml/Temml-Local.css`.
- Use `%BASE_URL%` for public assets referenced from `game/index.html`.
- Use `import.meta.env.BASE_URL` for `game/public` assets referenced from source.
- Prefer ESM imports for assets under `game/src`.
- Avoid host-specific product names or assumptions in embedded app code.

## Runtime Config

- The game uses `VITE_IS_EMBEDDED`, not iframe presence, to choose behavior.
- Standalone game dev/builds read Primer config from `game/.env`.
- Embedded execution waits for `host:init` and uses the bridge-provided `primerPublishableKey`.
- Primer startup must use resolved runtime config, not module-level host env constants.
- The embedded app hardcodes Primer origin in both modes; the host must not send Primer origin.

## Layout Rules

- The embedded app fills its iframe viewport.
- The host owns page layout, iframe chrome, border, clipping, headings, navigation, and bridge status display.
- Avoid outer margins, padding, border radius, or frame chrome on the game body, root element, or top-level app shell.
- Put internal spacing and visual treatment inside the learning/game UI.
