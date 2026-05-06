# Primer Starter

An opinionated Next.js + TypeScript starter that's wired for Vercel from day one. Type-checking and linting run on every commit so the repo stays clean as it grows.

## Tech stack

| Layer            | Choice                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| Runtime / pkg mgr | [Bun](https://bun.com)                                                            |
| Framework        | [Next.js 16](https://nextjs.org) (App Router, Turbopack)                          |
| Language         | TypeScript (strict, with `noUncheckedIndexedAccess`)                              |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com)                                        |
| Lint / format    | [Biome](https://biomejs.dev) (replaces ESLint + Prettier)                         |
| Env validation   | [`@t3-oss/env-nextjs`](https://env.t3.gg) + [`zod`](https://zod.dev)              |
| Git hooks        | [Lefthook](https://lefthook.dev) — runs `typecheck` and `biome check` pre-commit  |
| Hosting          | [Vercel](https://vercel.com) (auto-detected via `bun.lock`)                       |

## Getting started locally

```bash
bun install                # also installs Lefthook git hooks via the `prepare` script
cp .env.example .env.local # fill in values, or pull from Vercel (see below)
bun dev                    # http://localhost:3000
```

### Scripts

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `bun dev`           | Start the dev server                                  |
| `bun run build`     | Production build (also runs env validation)           |
| `bun start`         | Serve the production build                            |
| `bun run typecheck` | `tsc --noEmit` over the whole project                 |
| `bun run lint`      | `biome check` (lint + format check)                   |
| `bun run lint:fix`  | `biome check --write` (apply safe fixes)              |
| `bun run format`    | `biome format --write`                                |

## Deploying to Vercel

This starter is Vercel-first. Vercel auto-detects bun from the committed `bun.lock`, so there's no extra config — just connect the repo and ship.

### 1. Link the repo to a Vercel project

Either import the repo from the [Vercel dashboard](https://vercel.com/new), or from the terminal:

```bash
bunx vercel link
```

This creates `.vercel/` (gitignored) tying this checkout to a Vercel project.

### 2. Pull env vars to `.env.local`

```bash
bunx vercel env pull .env.local
```

This grabs every env var configured in Vercel for the **Development** environment and writes them to `.env.local`. Re-run whenever you add or rotate vars in the dashboard.

### 3. Configure env vars in Vercel

In the Vercel dashboard go to **Project → Settings → Environment Variables**. For each variable in `.env.example`, add it to the environments where it should apply:

- **Production** — values used by `main` deploys
- **Preview** — values used by PR / branch deploys
- **Development** — values pulled by `vercel env pull` for local dev

Public vars must be prefixed `NEXT_PUBLIC_` and are listed under `client` in `src/env.ts`. Server-only vars stay under `server`.

### 4. Deploy

- **Auto:** push to `main` → production deploy. Open a PR → preview deploy.
- **Manual:** `bunx vercel` for a preview, `bunx vercel --prod` for production.

Builds run env validation at build time (`next.config.ts` imports `./src/env`), so deploys fail fast if a required var is missing or malformed.

## Adding an env var

1. Add it to `src/env.ts` under `server` or `client` (with a zod schema).
2. If it's a client var, also add it to `experimental__runtimeEnv` so Next inlines it correctly.
3. Document it in `.env.example`.
4. Set it in Vercel for Production / Preview / Development as appropriate.
5. Re-run `bunx vercel env pull .env.local` to refresh local values.

## Project layout

```
src/
  app/         # App Router pages, layouts, route handlers
  env.ts       # Typed env validation (server vs client)
biome.json     # Lint + format rules
lefthook.yml   # Pre-commit hooks (typecheck + biome)
.env.example   # Documented env vars
```
