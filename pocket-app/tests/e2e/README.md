# E2E scripts

Two plain Playwright scripts (not `@playwright/test` specs — just `node`, so
they run with no test-runner config). Each prints a pass/fail summary and
exits non-zero on any failure, so they're safe to wire into CI later.

- **`regression.mjs`** — functional sweep: goal edit/archive/unarchive,
  activity filters, entry delete, and Insights month navigation including
  the current-month boundary (the "Next month" button must be disabled once
  you're back at the current month — the app refuses to navigate into the
  future).
- **`transitions.mjs`** — verifies the Goal details / Settings / Archived
  goals push-pop transition: both directions, mobile and desktop viewports,
  normal motion and `prefers-reduced-motion: reduce`, a 5x rapid open/back
  stress test that asserts no `.pk-layer` DOM nodes are left behind, and an
  assertion (not just a screenshot) that the reduced-motion preference
  actually suppresses the `.pk-roots` slide/scale animation — see
  "What the reduced-motion check actually asserts" below.

## Running them

From `pocket-app/`:

```sh
npm install
npm run build
npm run preview -- --port 4173 &      # background; use Ctrl+C or `kill %1` when done

npm run test:e2e:regression
npm run test:e2e:transitions
```

On Windows (PowerShell), run the preview server in its own window instead of
backgrounding it with `&`:

```powershell
npm install
npm run build
Start-Process npm -ArgumentList "run","preview","--","--port","4173"

npm run test:e2e:regression
npm run test:e2e:transitions
```
(Stop the preview server afterward from Task Manager, or close its window.)

Both scripts default to `http://localhost:4173` — override with
`E2E_BASE_URL` to point at a different build (e.g. a Vercel preview
deployment):

```sh
E2E_BASE_URL=https://your-preview.vercel.app npm run test:e2e:regression
```

```powershell
$env:E2E_BASE_URL = "https://your-preview.vercel.app"
npm run test:e2e:regression
```

Screenshots land in `tests/e2e/output/` (git-ignored) — they are for
eyeballing what a mid-transition frame actually looked like, not part of
the pass/fail result. Pass/fail comes entirely from the `assertTrue(...)`
calls printed to the console; a script that finishes without throwing but
never called `assertTrue` proves nothing.

### Browser binary

`launchBrowser()` in `_helpers.mjs` defaults to Playwright's own managed
Chromium — the same resolution `chromium.launch()` uses on its own, e.g. a
browser installed via `npx playwright install chromium`, or one found
through `PLAYWRIGHT_BROWSERS_PATH` if that variable happens to point at a
cache with a matching Playwright/browser revision. If neither applies,
install one once:

```sh
npx playwright install chromium
```

If you have a Chromium binary at a fixed path outside Playwright's managed
cache (for example, a sandbox that pre-installs a specific revision that
doesn't match this project's `playwright` version), point at it explicitly
instead of installing another copy — this is the only case that needs the
override:

```sh
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:e2e:regression
```

```powershell
$env:PLAYWRIGHT_CHROMIUM_PATH = "C:\path\to\chrome.exe"
npm run test:e2e:regression
```

### What the reduced-motion check actually asserts

`App.tsx` applies the push-transition "recede" effect (scale to 0.96,
shift left 16px) to `.pk-roots` via Motion's inline `transform` style, and
wraps the app in `<MotionConfig reducedMotion="user">` so that transform
stays static — jumping straight to its target value with no animation —
when the OS/browser reports `prefers-reduced-motion: reduce`.

`transitions.mjs` reads `.pk-roots`'s live inline `transform` at a fixed
~70ms checkpoint right after a push/pop click, and again once the
transition has fully settled:

- Under **normal motion**, the two readings should differ — a real spring
  animation is still in progress at 70ms.
- Under **reduced motion**, the two readings should already be identical —
  Motion applied the target value immediately rather than animating.

This means the check fails if the reduced-motion handling regresses (e.g.
the `MotionConfig` wrapper is removed or its `reducedMotion` prop changes)
and the slide/scale animation comes back for users who asked for reduced
motion. It was verified against this failure mode directly: temporarily
reverting the `MotionConfig` fix and rerunning the suite produces exactly
these four failures (`push`/`pop` × mobile/desktop-reduced-motion), and
restoring the fix makes them pass again.
