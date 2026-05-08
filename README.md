# Primer Starter

A ready-to-go React app with the **Primer SDK** pre-wired. Drop in your publishable key, run two commands, and you have a working learning session you can hook into for games, scoring, progress tracking — anything.

The whole SDK is wrapped in one component:

```tsx
import { Primer } from "./components/primer";

export function App() {
  return <Primer />;
}
```

That's it. Sign-in, the lesson flow, correct/incorrect answers, errors — all handled.

---

## 1. Get your publishable key

1. Go to **[primerlearn.dev](https://primerlearn.dev)**.
2. Click **Sign in with Google** and pick your Google account.
3. In the left sidebar, click **Keys**.
4. Copy your **publishable key** (it starts with `pk_`).

## 2. Set up the project

```bash
# Install dependencies (uses Bun)
bun install

# Create your env file
cp .env.example .env
```

Open `.env` and paste your key into `VITE_PRIMER_PUBLISHABLE_KEY`:

```
VITE_APP_URL=http://localhost:5173
VITE_PRIMER_ORIGIN=https://primerlearn.dev
VITE_PRIMER_PUBLISHABLE_KEY=pk_live_your_key_here
```

## 3. Run it

```bash
bun dev
```

Open **http://localhost:5173**. You should see "Sign in to Primer". Click it, sign in with Google, and you'll start a math lesson.

---

## 4. Hooking into the lesson

Pass any of these callbacks to the `<Primer />` component to react to what the learner does. They're all **optional** — use only what you need.

```tsx
<Primer
  onCorrect={(state)     => score += 10}
  onIncorrect={(state)   => lives -= 1}
  onComplete={()         => showWinScreen()}
  onError={(err)         => showToast(err.message)}
  onPhaseChange={(phase) => console.log("phase:", phase)}
  onAuthenticated={()    => console.log("user signed in")}
/>
```

| Callback          | Fires when                                    | Payload                                                                                              |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `onCorrect`       | The learner submits a **correct** answer      | The full `FeedbackState` (has `submission`, `feedbackContent`, `review`, `interaction`, etc.)        |
| `onIncorrect`     | The learner submits a **wrong** answer        | Same `FeedbackState`, but `isCorrect === false`                                                      |
| `onComplete`      | The lesson finishes                           | —                                                                                                    |
| `onError`         | Anything fails (boot, auth, transition, fatal)| `Error`                                                                                              |
| `onPhaseChange`   | Every phase transition                        | `"unauthenticated" \| "observation" \| "interaction" \| "feedback" \| "completed" \| "errored" \| "fatal"` |
| `onAuthenticated` | The user signs in successfully                | —                                                                                                    |

### Game integration example

```tsx
import { useState } from "react";
import { Primer } from "./components/primer";

export function MathGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [done, setDone] = useState(false);

  return (
    <>
      <header>Score: {score} • Lives: {lives}</header>

      <Primer
        onCorrect={() => setScore((s) => s + 10)}
        onIncorrect={() => setLives((l) => l - 1)}
        onComplete={() => setDone(true)}
      />

      {done && <WinScreen score={score} />}
    </>
  );
}
```

The `Primer` component takes care of everything inside it — you just drive your own UI from the callbacks.

---

## Deploying

This is a static Vite app — push it to **Vercel** (or any static host).

- Build command: `bun run build`
- Output directory: `dist`
- Install command: `bun install`
- Set the same `VITE_*` env vars in your host's environment settings.

## Scripts

| Command             | What it does            |
| ------------------- | ----------------------- |
| `bun dev`           | Start the dev server    |
| `bun run build`     | Production build        |
| `bun run typecheck` | TypeScript check        |
| `bun run lint`      | Biome lint              |
