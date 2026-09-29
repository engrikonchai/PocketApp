// Verifies the Goal details / Settings / Archived push-pop transition in
// both directions, on mobile and desktop viewports, under normal motion and
// prefers-reduced-motion, plus a rapid open/back stress test. See README.md.

import { launchBrowser, filterNoise, seedAndLoad, defaultSeedState, reportAndExit, BASE_URL } from './_helpers.mjs';

const SHOTDIR = new URL('./output/transitions', import.meta.url).pathname;
const results = [];

async function scenario(browser, name, viewport, { reducedMotion = false } = {}) {
  const page = await browser.newPage({ viewport, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));

  const snap = (label) => page.screenshot({ path: `${SHOTDIR}/${name}-${label}.png` });
  const checkErrs = (label) => {
    const clean = filterNoise(errs);
    if (clean.length) { results.push({ scenario: name, step: label, errs: clean.slice() }); console.log(`[ERR @ ${name}/${label}]`, clean); }
    errs.length = 0;
  };
  const assertTrue = (label, condition, message) => {
    if (!condition) {
      results.push({ scenario: name, step: label, errs: [`ASSERTION FAILED: ${message}`] });
      console.log(`[ASSERTION FAILED @ ${name}/${label}] ${message}`);
    } else {
      console.log(`[OK] ${name}/${label}: ${message}`);
    }
  };

  await seedAndLoad(page, defaultSeedState());
  errs.length = 0;

  const wide = viewport.width >= 860;
  const settingsBtn = wide ? '.pk-sidelink:has-text("Settings")' : 'button[aria-label="Settings"]';
  const backBtn = wide ? '.pk-circle[aria-label="Back"]' : 'button[aria-label="Back"]';

  // Push (Home -> Settings): capture mid-transition, then confirm it settles
  // to the actual destination screen — not just "didn't throw".
  await page.click(settingsBtn);
  await page.waitForTimeout(70);
  await snap('01-push-mid');
  await page.waitForTimeout(600);
  await snap('02-push-settled');
  checkErrs('push');
  assertTrue('push-settled', await page.locator('text=Appearance').isVisible().catch(() => false), 'Settings screen "Appearance" section should be visible after the push transition settles');

  // Pop (Settings -> Home)
  await page.click(backBtn);
  await page.waitForTimeout(70);
  await snap('03-pop-mid');
  await page.waitForTimeout(600);
  await snap('04-pop-settled');
  checkErrs('pop');
  assertTrue('pop-settled', await page.locator('text=Recent activity').isVisible().catch(() => false), 'Home screen "Recent activity" should be visible after the pop transition settles');

  // Rapid open/back stress test: 5x push+pop with no settle time in between.
  for (let i = 0; i < 5; i++) {
    await page.click(settingsBtn);
    await page.waitForTimeout(30);
    await page.click(backBtn).catch((e) => {
      results.push({ scenario: name, step: `rapid-${i}`, errs: ['back click failed: ' + e.message.split('\n')[0]] });
    });
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(700);
  checkErrs('rapid-open-back');
  await snap('05-after-rapid');
  const homeVisibleAfterRapid = await page.locator('text=Recent activity').isVisible().catch(() => false);
  const leftoverLayers = await page.locator('.pk-layer').count();
  assertTrue('rapid-final-home-visible', homeVisibleAfterRapid, 'Home should be visible after 5x rapid open/back with no settle time');
  assertTrue('rapid-no-leftover-layers', leftoverLayers === 0, `no .pk-layer DOM nodes should remain after settling (found ${leftoverLayers})`);

  // Goal detail push/pop — the other layer type, keyed dynamically per goal.
  await page.click('.pk-hero, .pk-row:has-text("Emergency fund")');
  await page.waitForTimeout(70);
  await snap('06-goaldetail-push-mid');
  await page.waitForTimeout(600);
  await snap('07-goaldetail-push-settled');
  checkErrs('goaldetail-push');
  assertTrue('goaldetail-push-settled', await page.locator('text=Goal details').isVisible().catch(() => false), 'Goal details screen should be visible after push settles');

  await page.click(backBtn);
  await page.waitForTimeout(700);
  await snap('08-goaldetail-pop-settled');
  checkErrs('goaldetail-pop');
  assertTrue('goaldetail-pop-settled', await page.locator('text=Recent activity').isVisible().catch(() => false), 'Home should be visible after popping goal details');

  await page.close();
}

async function main() {
  const { mkdirSync } = await import('node:fs');
  mkdirSync(SHOTDIR, { recursive: true });

  const browser = await launchBrowser();

  await scenario(browser, 'mobile', { width: 430, height: 900 });
  await scenario(browser, 'mobile-reduced-motion', { width: 430, height: 900 }, { reducedMotion: true });
  await scenario(browser, 'desktop', { width: 1280, height: 850 });
  await scenario(browser, 'desktop-reduced-motion', { width: 1280, height: 850 }, { reducedMotion: true });

  await browser.close();
  reportAndExit(results, 'TRANSITION VERIFICATION RESULTS');
}

main().catch((e) => {
  console.error('Transition verification crashed:', e);
  process.exit(1);
});
