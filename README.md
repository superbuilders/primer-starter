# Primer Learn

The Vite + React + TypeScript app for [`primerlearn.dev`](https://primerlearn.dev), wired for the Primer SDK. Type-checking and linting run on every commit so the repo stays clean as it grows.

## Tech stack

| Layer            | Choice                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| Runtime / pkg mgr | [Bun](https://bun.com)                                                          |
| Framework        | [Vite](https://vite.dev) + [React](https://react.dev)                           |
| Language         | TypeScript (strict, with `noUncheckedIndexedAccess`)                            |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`              |
| Lint / format    | [Biome](https://biomejs.dev) (replaces ESLint + Prettier)                       |
| Env validation   | [`@t3-oss/env-core`](https://env.t3.gg) + [`zod`](https://zod.dev)              |
| Git hooks        | [Lefthook](https://lefthook.dev) — runs `typecheck` and `biome check` pre-commit |

## Primer integration

This starter ships a working renderer for the [`@superbuilders/primer-tives`](https://www.npmjs.com/package/@superbuilders/primer-tives) adaptive learning runtime (3.7.0), wired client-side. The lifecycle starts with `start()` and may return an unauthenticated state that your UI advances from an explicit user click:

```ts
const state = await start({
  origin: env.VITE_PRIMER_ORIGIN,
  publishableKey: env.VITE_PRIMER_PUBLISHABLE_KEY,
  subject: "math",
  supportedPcis: ["urn:primer:pci:fraction-input"],
  logger,
});

if (state.phase === "unauthenticated") {
  // Call directly from a button click or tap handler.
  const nextState = await state.login();
}
```

`start` resolves any existing learner auth and returns the live `PrimerState` machine the renderer drives by switching on `state.phase` and, for interactions, `state.kind`. When learner sign-in is needed or a previous auth attempt failed, `start` returns `UnauthenticatedState`; render sign-in UI and call `state.login()` directly from the user's button press so browser popup and redirect protections do not block Primer auth.

### Required env vars

- `VITE_PRIMER_ORIGIN` — origin of the Primer deployment, for example `https://primerlearn.dev`.
- `VITE_PRIMER_PUBLISHABLE_KEY` — public Primer frontend key (`pk_...`). Not learner auth; the SDK pairs it with a learner access token resolved in the browser.

Both are validated in `src/env.schema.ts` and exposed through `src/env.ts`. `vite.config.ts` also validates them during startup/build so missing or malformed values fail fast.

### Where to look

- `src/main.tsx` — mounts the React app into `index.html`.
- `src/App.tsx` — app shell and Primer page layout.
- `src/components/primer/session.tsx` — calls `start()`, holds `PrimerState`, dispatches by `phase`, and handles `UnauthenticatedState.login()` plus SDK auth error sentinels (`ErrAuthPopupBlocked`, `ErrAuthCancelled`, `ErrMalformedAccessToken`, ...).
- `src/components/primer/interactions/*` — one renderer per interaction kind (`choice`, `text-entry`, `extended-text`, `order`, `match`) plus the `urn:primer:pci:fraction-input` PCI under `interactions/pci/`.
- `src/components/primer/{frame,content,stimulus}.tsx` — shared content/stimulus rendering.
- `src/components/primer/{errored-frame,fatal-frame}.tsx` — sentinel-aware error UIs for runtime `ErroredState` and `FatalState`.

### Caveats

- `PrimerState` is live, in-memory state. **Do not serialize it** — `JSON.stringify(state)` throws `ErrNotSerializable`. Re-create state by calling `start` again after a reload, remount, or account switch.
- The SDK has no server entrypoint. There is no `/server` subpath, no `createPrimerServer`, no token-minting helper — the browser is the auth boundary.

## Getting started locally

```bash
bun install                # also installs Lefthook git hooks via the prepare script
cp .env.example .env.local # fill in values
bun dev                    # http://localhost:5173
```

### Scripts

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `bun dev`           | Start the Vite dev server                        |
| `bun run build`     | Production build to `dist/`                      |
| `bun start`         | Preview the production build locally             |
| `bun run typecheck` | `tsc --noEmit` over the whole project            |
| `bun run lint`      | `biome check` (lint + format check)              |
| `bun run lint:fix`  | `biome check --write` (apply safe fixes)         |
| `bun run format`    | `biome format --write`                           |

## Deploying

Any static host that supports Vite works. Build with `bun run build` and serve the generated `dist/` directory for `primerlearn.dev`.

For Vercel, set the project framework preset to **Vite** if it is not auto-detected. Use these settings:

- Build command: `bun run build`
- Output directory: `dist`
- Install command: `bun install`

### Configure env vars

Public browser vars must be prefixed `VITE_`. Add every variable from `.env.example` to each deployment environment where `primerlearn.dev` should run.

For Vercel, go to **Project → Settings → Environment Variables** and add them for Production, Preview, and Development as needed. You can still pull them locally with:

```bash
bunx vercel env pull .env.local
```

## Adding an env var

1. Add it to `src/env.schema.ts` with a zod schema.
2. Prefix browser-exposed variables with `VITE_`.
3. Document it in `.env.example`.
4. Set it in your deployment provider for each environment.

## Project layout

```txt
index.html       # Vite HTML entrypoint
src/
  main.tsx       # React mount
  App.tsx        # App shell
  styles.css     # Tailwind and design tokens
  env.schema.ts  # Shared env schema
  env.ts         # Typed env access for browser code
biome.json       # Lint + format rules
lefthook.yml     # Pre-commit hooks (typecheck + biome)
.env.example     # Documented env vars
```
