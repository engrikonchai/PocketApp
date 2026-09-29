// Functional regression sweep: goal CRUD (edit/archive/unarchive), activity
// filters, entry delete, and Insights month navigation including the
// current-month boundary. See README.md for how to run this.
//
// This asserts real outcomes (element visibility, button disabled-state) at
// each step rather than just "the script didn't throw" — a script that runs
// to completion without checking anything is not the same as a passing test.

import { launchBrowser, filterNoise, seedAndLoad, defaultSeedState, reportAndExit } from './_helpers.mjs';

const SHOTDIR = new URL('./output/regression', import.meta.url).pathname;
const results = [];

async function main() {
  const { mkdirSync } = await import('node:fs');
  mkdirSync(SHOTDIR, { recursive: true });

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));

  const snap = async (name) => {
    await page.waitForTimeout(250);
    const clean = filterNoise(errs);
    if (clean.length) { results.push({ step: name, errs: clean.slice() }); console.log(`[ERR @ ${name}]`, clean); }
    errs.length = 0;
    await page.screenshot({ path: `${SHOTDIR}/${name}.png` });
    console.log('snap:', name);
  };
  const assertTrue = (label, condition, message) => {
    if (!condition) {
      results.push({ step: label, errs: [`ASSERTION FAILED: ${message}`] });
      console.log(`[ASSERTION FAILED @ ${label}] ${message}`);
    } else {
      console.log(`[OK] ${label}: ${message}`);
    }
  };

  await seedAndLoad(page, defaultSeedState());
  errs.length = 0;

  // GOALS TAB — g3 ("New laptop") is fully funded (1400 of 1400) and should
  // land in the Completed section.
  await page.click('.pk-tab:has-text("Goals")');
  await snap('01-goals-with-completed');

  await page.click('.pk-row:has-text("New laptop")');
  await snap('02-completed-goal-detail');

  // Edit goal
  await page.click('button:has-text("Edit")');
  await snap('03-edit-goal-sheet');
  await page.fill('#goal-name', 'New MacBook');
  await page.click('button:has-text("Save changes")');
  await snap('04-after-edit');
  assertTrue('edit-goal', await page.locator('text=New MacBook').first().isVisible(), 'renamed goal "New MacBook" should be visible after editing');

  // Archive goal
  await page.click('button:has-text("Archive goal")');
  await snap('05-archive-confirm');
  await page.click('.pk-alert button:has-text("Archive")');
  await page.waitForTimeout(400);
  await snap('06-after-archive-goals-tab');

  // Archived goals screen
  await page.click('button:has-text("Archived goals")');
  await snap('07-archived-screen');
  assertTrue('archived-screen', await page.locator('.pk-row:has-text("New MacBook")').isVisible(), 'archived goal should appear in Archived goals list');

  await page.click('.pk-row:has-text("New MacBook")');
  await snap('08-archived-goal-detail');
  await page.click('button:has-text("Unarchive goal")');
  await page.waitForTimeout(300);
  await page.click('.pk-alert button:has-text("Unarchive")');
  await page.waitForTimeout(400);
  await snap('09-after-unarchive');

  // ACTIVITY TAB filters
  await page.click('.pk-tab:has-text("Activity")');
  await snap('10-activity-all');
  await page.click('.pk-seg button:has-text("Expenses")');
  await snap('11-activity-expenses-filter');
  assertTrue('filter-expenses', await page.locator('text=Groceries').isVisible(), 'Expenses filter should show the groceries expense');
  assertTrue('filter-expenses-excludes-income', !(await page.locator('text=Salary').isVisible().catch(() => false)), 'Expenses filter should not show income entries');

  await page.click('.pk-seg button:has-text("Income")');
  await snap('12-activity-income-filter');
  assertTrue('filter-income', await page.locator('text=Salary').isVisible(), 'Income filter should show the salary entry');

  await page.click('.pk-seg button:has-text("Savings")');
  await snap('13-activity-savings-filter');

  // Entry detail + delete
  await page.locator('.pk-row').first().click();
  await snap('14-entry-detail');
  await page.click('button:has-text("Delete entry")');
  await snap('15-delete-entry-confirm');
  await page.click('.pk-alert button:has-text("Delete")');
  await page.waitForTimeout(400);
  await snap('16-after-delete-entry');

  // INSIGHTS month navigation, including the current-month boundary.
  await page.click('.pk-tab:has-text("Insights")');
  await snap('17-insights-current-month');

  const nextMonthBtn = page.locator('button[aria-label="Next month"]');
  assertTrue(
    'insights-next-month-disabled-at-start',
    await nextMonthBtn.isDisabled(),
    '"Next month" should already be disabled at the current month on load'
  );

  await page.click('button[aria-label="Previous month"]');
  await snap('18-insights-prev-month');
  assertTrue(
    'insights-next-month-enabled-after-prev',
    !(await nextMonthBtn.isDisabled()),
    '"Next month" should be enabled after navigating to a past month'
  );

  await page.click('button[aria-label="Next month"]');
  await snap('19-insights-back-to-current-month');
  // Do NOT click "Next month" again here — it is now correctly disabled
  // (the app refuses to navigate into the future) and Playwright's
  // actionability check on a disabled element never resolves, which is
  // exactly what hung the previous version of this script for 30s until
  // it crashed. Assert the disabled state directly instead.
  assertTrue(
    'insights-next-month-disabled-at-boundary',
    await nextMonthBtn.isDisabled(),
    '"Next month" must be disabled once back at the current month (no navigating into the future)'
  );

  await browser.close();
  reportAndExit(results, 'REGRESSION SUITE RESULTS');
}

main().catch((e) => {
  console.error('Regression suite crashed:', e);
  process.exit(1);
});
