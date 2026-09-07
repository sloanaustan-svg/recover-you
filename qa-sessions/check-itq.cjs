const { chromium } = require('C:/Users/sloan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const out = path.resolve(__dirname, '../output/itq-review');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce', ignoreHTTPSErrors: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/what-is-cptsd.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(5000);
  // Only hide site chrome in the saved close-up previews.
  await page.addStyleTag({ content: '.cookie-banner, #main-nav, #reading-progress, .sk__back-to-top-wrap, .sk__mobile-menu-bar, .sk__mobile-main-logo, .hc-nav-trigger { visibility: hidden !important; }' });
  assert.equal(await page.locator('.ry-itq__q').count(), 12);
  assert.equal(await page.locator('input[type=radio]').count(), 60);
  assert.equal(await page.locator('#ry-itq-submit').isDisabled(), true);
  await page.locator('.ry-reflect-heading').scrollIntoViewIfNeeded();
  await page.locator('.ry-reflect-heading').screenshot({ path: path.join(out, 'questionnaire-desktop.png') });
  const names = await page.locator('.ry-itq__q').evaluateAll(els => els.map(el => el.dataset.q));
  async function fill(values) {
    for (let i = 0; i < names.length; i++) {
      await page.locator(`input[name="${names[i]}"][value="${values[i]}"]`).evaluate(el => el.closest('label').click());
    }
    await page.locator('#ry-itq-submit').click();
    await page.waitForTimeout(120);
    assert.equal(await page.locator('#ry-map').isVisible(), true);
  }
  await fill([4,3,3,3,4,3,3,2,4,4,3,2]);
  assert.equal(await page.locator('.ry-readout__row').count(), 6);
  assert.equal(await page.locator('#ry-plan > .ry-plan__card').count(), 2);
  assert.match(await page.locator('#ry-map-summary').innerText(), /Negative Self-Concept/);
  assert.equal(await page.locator('.ry-radar__tick').allTextContents().then(x => x.join(',')), '1,2,3,4');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'ry-map-title');
  await page.locator('.ry-map__portrait').screenshot({ path: path.join(out, 'map-desktop.png') });
  await page.locator('#ry-plan').screenshot({ path: path.join(out, 'next-steps-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.ry-map__portrait').screenshot({ path: path.join(out, 'map-mobile.png') });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflow = await page.evaluate(() => ['reflect', 'map'].flatMap(id => {
      const root = document.getElementById(id);
      return [...root.querySelectorAll('*')].filter(el => {
        if (el.closest('svg')) return false;
        const rect = el.getBoundingClientRect();
        return rect.width && (rect.right > innerWidth + 1 || rect.left < -1);
      }).map(el => el.className);
    }));
    assert.deepEqual(overflow, [], `Overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.ry-reflect-heading').screenshot({ path: path.join(out, 'questionnaire-mobile.png') });
  await page.locator('input[name="reexp_0"][value="0"]').evaluate(el => el.closest('label').click());
  assert.equal(await page.locator('#ry-map').isVisible(), false, 'Changed answers must not leave stale results visible');
  await page.locator('#ry-itq-reset').click();
  assert.equal(await page.locator('input:checked').count(), 0);
  assert.equal(await page.locator('#ry-radar').innerHTML(), '', 'Clear removes prior results');
  await fill(Array(12).fill(0));
  assert.equal(await page.locator('#ry-plan > .ry-plan__card').count(), 0);
  assert.match(await page.locator('#ry-map-summary').innerText(), /lower end/);
  await fill(Array(12).fill(4));
  assert.match(await page.locator('#ry-map-summary').innerText(), /same level/);
  assert.match(await page.locator('.ry-plan__sub').innerText(), /tied/);
  await page.locator('.ry-plan__rest summary').click();
  assert.equal(await page.locator('.ry-plan__rest .ry-plan__card:visible').count(), 4);
  await fill([4,4,0,0,0,0,0,0,0,0,0,0]);
  assert.equal(await page.locator('#ry-plan > .ry-plan__card').count(), 1, 'Do not recommend a zero-response domain as a priority');
  const internal = await page.locator('#reflect a, #map a').evaluateAll(els => [...new Set(els.map(el => el.getAttribute('href')).filter(h => !h.startsWith('http') && !h.startsWith('#')))]);
  for (const href of internal) assert.ok(fs.existsSync(path.resolve(__dirname, '..', href + '.html')), `Missing linked page ${href}`);
  const content = await page.locator('#reflect, #map').allTextContents();
  assert.ok(!content.join('').includes('—'), 'No em dashes in the reflection or results');
  assert.deepEqual(errors, [], 'No browser script errors');
  const motionPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true });
  await motionPage.goto('http://127.0.0.1:4173/what-is-cptsd.html', { waitUntil: 'networkidle' });
  await motionPage.waitForTimeout(5000);
  await motionPage.addStyleTag({ content: '.cookie-banner, #main-nav, #reading-progress, .sk__back-to-top-wrap { visibility: hidden !important; }' });
  await motionPage.evaluate(() => {
    const section = document.getElementById('reflect');
    if (window.ScrollSmoother && ScrollSmoother.get()) ScrollSmoother.get().scrollTo(section, false, 'top top');
    else section.scrollIntoView();
  });
  await motionPage.waitForTimeout(350);
  const particlesPainted = await motionPage.locator('.ry-reflection-field').first().locator('canvas').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  });
  assert.ok(particlesPainted, 'Reflection particles are painted behind the section');
  await motionPage.screenshot({ path: path.join(out, 'questionnaire-glass-desktop.png') });
  await motionPage.close();
  console.log(JSON.stringify({ status: 'passed', widths: [320,390,768,1024,1440], scenarios: ['mixed','clear','changed answers','all zero','all maximum','ties','single domain'], internalLinks: internal.length, output: out }, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
