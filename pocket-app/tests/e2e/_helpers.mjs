// Shared helpers for the scripts in this directory. These are plain Playwright
// scripts (not @playwright/test specs) so they can be run with a bare `node`
// and print a clear pass/fail summary — see README.md for how to run them.

import { chromium } from 'playwright';

export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:4173';

// Defaults to Playwright's own managed browser (whatever `chromium.launch()`
// resolves on its own — installed via `npx playwright install chromium`, or
// found through PLAYWRIGHT_BROWSERS_PATH if that variable happens to point
// at a cache with a matching revision). PLAYWRIGHT_CHROMIUM_PATH is an
// explicit override for an environment that has a Chromium binary at a fixed
// path outside Playwright's managed cache (e.g. a different revision) — set
// it in the environment rather than hardcoding a path here.
export function launchBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  return chromium.launch(executablePath ? { executablePath } : {});
}

// No blanket error filtering: every console/page error surfaced by these
// scripts should be investigated and either fixed or explicitly and
// narrowly excluded here with a comment explaining why it's unavoidable and
// not a symptom of an app bug.
export function filterNoise(errs) {
  return errs;
}

export async function seedAndLoad(page, state) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate((s) => localStorage.setItem('pocket.state.v1', JSON.stringify(s)), state);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
}

export function defaultSeedState() {
  const iso = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  return {
    onboarded: true, startingBalance: 2500, theme: 'system', selectedGoalId: 'g1',
    goals: [
      { id: 'g1', name: 'Emergency fund', target: 5000, icon: 'shield', tint: 'sage', targetDate: null, archived: false, createdAt: now },
      { id: 'g2', name: 'Trip to Japan', target: 2000, icon: 'car', tint: 'slate', targetDate: null, archived: false, createdAt: now },
      { id: 'g3', name: 'New laptop', target: 1400, icon: 'laptop', tint: 'amber', targetDate: null, archived: false, createdAt: now },
    ],
    entries: [
      { id: 'e1', type: 'save', amount: 300, date: iso, time: '09:00', note: null, goalId: 'g1', source: 'available', category: null, createdAt: now },
      { id: 'e2', type: 'expense', amount: 45, date: iso, time: '08:00', note: null, goalId: null, source: null, category: 'groceries', createdAt: now },
      { id: 'e3', type: 'income', amount: 1200, date: iso, time: '10:00', note: null, goalId: null, source: null, category: 'salary', createdAt: now },
      { id: 'e4', type: 'save', amount: 1400, date: iso, time: '11:00', note: null, goalId: 'g3', source: 'available', category: null, createdAt: now },
    ],
  };
}

export function reportAndExit(results, label) {
  console.log(`\n=== ${label} ===`);
  if (results.length === 0) {
    console.log('ALL CHECKS PASSED');
    process.exit(0);
  } else {
    console.log(`${results.length} FAILURE(S):`);
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }
}
