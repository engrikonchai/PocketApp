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
  normal motion and `prefers-reduced-motion: reduce`, plus a 5x rapid
  open/back stress test that asserts no `.pk-layer` DOM nodes are left
  behind.

## Running them

From `pocket-app/`:

```sh
npm install                 # installs playwright as a devDependency
npm run build
npm run preview -- --port 4173 &   # or: npx vite preview --port 4173 &

npm run test:e2e:regression
npm run test:e2e:transitions

kill %1                     # stop the preview server
```

Both scripts default to `http://localhost:4173` — override with
`E2E_BASE_URL` to point at a different build (e.g. a Vercel preview
deployment):

```sh
E2E_BASE_URL=https://your-preview.vercel.app npm run test:e2e:regression
```

Screenshots land in `tests/e2e/output/` (git-ignored) — useful for eyeballing
what a mid-transition frame actually looked like, not just whether the
script threw.

### Browser binary

This repo's own dev sandbox pre-installs Chromium at a fixed path
(`/opt/pw-browsers/chromium`) outside Playwright's own managed browser cache.
A project-local `playwright` install can't auto-discover it there, so
`launchBrowser()` in `_helpers.mjs` defaults `executablePath` to that path.
In an environment without that pre-installed binary, install a browser once
with:

```sh
npx playwright install chromium
```

or, if you have a Chromium binary elsewhere, point at it directly instead of
installing another copy:

```sh
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:e2e:regression
```
