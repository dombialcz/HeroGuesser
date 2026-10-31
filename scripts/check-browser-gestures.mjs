import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180';
const output = 'output/browser-gestures';
await mkdir(output, { recursive: true });

for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const phone of [false, true]) {
      const name = `${engine}-${phone ? 'phone' : 'desktop'}`;
      const page = await browser.newPage({
        viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        hasTouch: phone, isMobile: phone, reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
      const selection = () => page.evaluate(() => getSelection().toString());
      const center = async locator => {
        await locator.scrollIntoViewIfNeeded();
        const box = await locator.boundingBox();
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      };
      const protectedControls = async () => {
        assert.ok(await page.locator('button:visible, button:visible *, .guess-tile:visible, .guess-tile:visible *').evaluateAll(elements =>
          elements.every(element => {
            const style = getComputedStyle(element);
            return style.userSelect === 'none' || style.webkitUserSelect === 'none';
          })), `${name}: controls and nested labels are protected before holding`);
        // The callout property exists on iOS, not desktop WebKit builds.
        if (await page.evaluate(() => CSS.supports('-webkit-touch-callout', 'none'))) {
          assert.equal(await page.locator('button:visible').first().evaluate(element =>
            getComputedStyle(element).webkitTouchCallout), 'none');
        }
      };
      const doubleTap = async locator => {
        const point = await center(locator);
        const scale = await page.evaluate(() => visualViewport.scale);
        if (phone) {
          await page.touchscreen.tap(point.x, point.y);
          await page.waitForTimeout(70);
          await page.touchscreen.tap(point.x, point.y);
        } else await page.mouse.dblclick(point.x, point.y);
        await page.waitForTimeout(350);
        assert.equal(await page.evaluate(() => visualViewport.scale), scale, `${name}: double tap preserves viewport scale`);
        await page.evaluate(() => getSelection().removeAllRanges());
      };

      await page.goto(`${base}/?daily=1`);
      await page.waitForFunction(() => window.render_game_to_text);
      assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).touchAction), 'manipulation');
      assert.doesNotMatch(await page.locator('meta[name="viewport"]').getAttribute('content'), /user-scalable\s*=\s*(no|0)|maximum-scale\s*=/);
      await protectedControls();
      await doubleTap(page.locator('#party-name'));

      // Prose stays copyable; the temporary global guard must end with the drag.
      const prose = page.locator('#board-heading');
      const selectProse = () => prose.dblclick({ position: { x: 20, y: 15 } });
      await selectProse();
      assert.ok((await selection()).length > 0, `${name}: ordinary text remains selectable`);
      await page.evaluate(() => getSelection().removeAllRanges());
      for (const hero of ['knight', 'thief']) await page.locator(`.hero-choice[data-hero="${hero}"]`).click();
      const active = slot => page.locator(`#current-guess [data-slot="${slot}"]`);
      const from = await center(active(0));
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.waitForTimeout(320);
      assert.ok((await state()).drag, `${name}: hold starts custom drag`);
      assert.equal(await selection(), '');
      const overText = await prose.boundingBox();
      await page.mouse.move(overText.x + 15, overText.y + overText.height / 2, { steps: 8 });
      assert.equal(await selection(), '', `${name}: dragging across prose never selects it`);
      const to = await active(1).boundingBox();
      await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
      await page.screenshot({ path: `${output}/${name}-drag.png` });
      await page.mouse.up();
      assert.deepEqual((await state()).draft.slice(0, 2), ['thief', 'knight']);
      assert.equal((await state()).drag, null);
      assert.equal(await page.locator('.portrait-drag-ghost, .portrait-dragging').count(), 0);
      await selectProse();
      assert.ok((await selection()).length > 0, `${name}: selectable prose restored after drop`);
      await page.evaluate(() => getSelection().removeAllRanges());

      // Real native touch gestures in Chromium supplement WebKit's policy and
      // tap checks; desktop WebKit emulation cannot reproduce every iOS gesture.
      if (phone && engine === 'chromium') {
        const cdp = await page.context().newCDPSession(page);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 5, y: 650, id: 0 }] });
        for (const y of [590, 530, 470, 410, 350]) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 5, y, id: 0 }] });
          await page.waitForTimeout(30);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        assert.ok(await page.evaluate(() => scrollY) > 0, 'native touch scrolling remains available');
        await page.waitForTimeout(400);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        const scale = await page.evaluate(() => visualViewport.scale);
        await cdp.send('Input.synthesizePinchGesture', { x: 195, y: 140, scaleFactor: 1.5, gestureSourceType: 'touch' });
        assert.ok(await page.evaluate(() => visualViewport.scale) > scale + .2, 'native pinch zoom remains available');
        // A navigation preserves zoom on some engines; reset before other modes.
        await cdp.send('Input.synthesizePinchGesture', { x: 195, y: 140, scaleFactor: 1 / 1.5, gestureSourceType: 'touch' });
      }

      for (const route of ['tutorial=1', 'adventure=1']) {
        await page.goto(`${base}/?${route}`);
        await page.waitForFunction(() => window.render_game_to_text);
        await protectedControls();
        const button = page.locator('#mastermind-tutorial button:visible, #mastermind-adventure button:visible').first();
        await button.focus();
        assert.equal(await button.evaluate(element => document.activeElement === element), true, 'controls retain keyboard focus');
      }
      await page.evaluate(async () => {
        const { showShareText } = await import('./src/dialog.js');
        showShareText('Guild of Wits test result');
      });
      assert.equal(await page.locator('.game-dialog').evaluate(element => getComputedStyle(element).touchAction), 'manipulation', 'scrollable dialogs also suppress double-tap zoom');
      assert.equal(await page.locator('.game-dialog textarea').evaluate(area => area.selectionEnd - area.selectionStart), 'Guild of Wits test result'.length, 'share results remain selectable for copying');
      await page.locator('.game-dialog button').click();
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`${name}: selection-free hold/drag/swap, copyable prose, double taps, focus and shared mode controls pass`);
    }
  } finally { await browser.close(); }
}
