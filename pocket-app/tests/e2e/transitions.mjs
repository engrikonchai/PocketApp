// Verifies the Goal details / Settings / Archived push-pop transition in
// both directions, on mobile and desktop viewports, under normal motion and
// prefers-reduced-motion, plus a rapid open/back stress test. See README.md.
//
// Screenshots (snap()) are for eyeballing what a frame actually looked like —
// they are not assertions and a missing/wrong screenshot never fails the
// suite. Pass/fail is decided entirely by assertTrue() calls below, which
// check DOM state and, for the reduced-motion checks, the .pk-roots
// element's live inline `transform` (the scale/translateX push effect
// App.tsx applies via Motion — see the comment on getRootsTransform below).

import { fileURLToPath } from 'node:url';
import { launchBrowser, filterNoise, seedAndLoad, defaultSeedState, reportAndExit, BASE_URL } from './_helpers.mjs';

const SHOTDIR = fileURLToPath(new URL('./output/transitions', import.meta.url));
const results = [];

// Motion applies the push-transition scale/translateX to `.pk-roots` as an
// inline `transform` style. Under normal motion this value changes over the
// ~380ms spring, so a snapshot taken shortly after a click (mid) differs
// from the value once it settles. Under `prefers-reduced-motion: reduce`,
// MotionConfig's `reducedMotion="user"` should make Motion skip animating
// transform-affecting values entirely and jump straight to the target, so
// mid and settled should already be identical at the same early checkpoint.
// This is the assertion that fails if that reduced-motion handling
// regresses (e.g. the MotionConfig wrapper is removed) and the slide/scale
// animation comes back for users who asked for reduced motion.
async function getRootsTransform(page) {
  return page.evaluate(() => document.querySelector('.pk-roots')?.style.transform ?? null);
}

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
  const pushMidTransform = await getRootsTransform(page);
  await snap('01-push-mid');
  await page.waitForTimeout(600);
  const pushSettledTransform = await getRootsTransform(page);
  await snap('02-push-settled');
  checkErrs('push');
  assertTrue('push-settled', await page.locator('text=Appearance').isVisible().catch(() => false), 'Settings screen "Appearance" section should be visible after the push transition settles');
  if (reducedMotion) {
    assertTrue('push-reduced-motion-no-animation', pushMidTransform === pushSettledTransform,
      `under prefers-reduced-motion, .pk-roots should already be at its settled transform (${pushSettledTransform}) at the same early checkpoint, not still animating (found "${pushMidTransform}")`);
  } else {
    assertTrue('push-normal-motion-is-animating', pushMidTransform !== pushSettledTransform,
      `under normal motion, .pk-roots should still be mid-animation (transform "${pushMidTransform}") at the early checkpoint, distinct from its settled value (${pushSettledTransform})`);
  }

  // Pop (Settings -> Home)
  await page.click(backBtn);
  await page.waitForTimeout(70);
  const popMidTransform = await getRootsTransform(page);
  await snap('03-pop-mid');
  await page.waitForTimeout(600);
  const popSettledTransform = await getRootsTransform(page);
  await snap('04-pop-settled');
  checkErrs('pop');
  assertTrue('pop-settled', await page.locator('text=Recent activity').isVisible().catch(() => false), 'Home screen "Recent activity" should be visible after the pop transition settles');
  if (reducedMotion) {
    assertTrue('pop-reduced-motion-no-animation', popMidTransform === popSettledTransform,
      `under prefers-reduced-motion, .pk-roots should already be at its settled transform (${popSettledTransform}) at the same early checkpoint, not still animating (found "${popMidTransform}")`);
  } else {
    assertTrue('pop-normal-motion-is-animating', popMidTransform !== popSettledTransform,
      `under normal motion, .pk-roots should still be mid-animation (transform "${popMidTransform}") at the early checkpoint, distinct from its settled value (${popSettledTransform})`);
  }

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

  // Archived goals push/pop — the third layer type. `layer` in App.tsx is a
  // single slot, not a stack: opening Archived from Settings replaces
  // `settings` with `archived` rather than nesting on top of it, and its
  // back button goes straight to `null` (Home), not back to Settings. Its
  // "Archived goals" row on the Goals tab only renders once an archived
  // goal exists (see GoalsScreen.tsx), and the default seed state has none,
  // so reach it via Settings instead, which shows the row unconditionally.
  await page.click(settingsBtn);
  await page.waitForTimeout(400);
  await page.click('button:has-text("Archived goals")');
  await page.waitForTimeout(70);
  await snap('09-archived-push-mid');
  await page.waitForTimeout(600);
  await snap('10-archived-push-settled');
  checkErrs('archived-push');
  assertTrue('archived-push-settled', await page.locator('.pk-navtitle:has-text("Archived goals")').isVisible().catch(() => false), 'Archived goals screen title should be visible after the push transition settles');

  await page.click(backBtn);
  await page.waitForTimeout(700);
  await snap('11-archived-pop-settled');
  checkErrs('archived-pop');
  assertTrue('archived-pop-settled', await page.locator('text=Recent activity').isVisible().catch(() => false), 'Home should be visible after popping the Archived goals screen (layer is a single slot, not a stack)');

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
