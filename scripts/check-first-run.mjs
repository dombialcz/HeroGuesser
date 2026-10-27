import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { firstRunKey } from '../src/first-run.js';
const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
const output = 'output/first-run';
await mkdir(output, { recursive: true });
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const [name, locale, width, height, large] of [
      ['desktop', 'en', 1440, 1000, false], ['phone', 'en', 390, 844, false],
      ['pl-large', 'pl', 320, 740, true], ['landscape', 'en', 844, 390, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 500, reducedMotion: 'reduce' });
      await context.addInitScript(({ locale, large }) => {
        localStorage.setItem('heroguesser:language', locale);
        if (large) addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = '200%'; });
      }, { locale, large });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      const state = () => page.evaluate(() => JSON.parse(render_game_to_text()));
      const click = async selector => {
        await page.locator(selector).click();
        if (selector.startsWith('#confirm-')) await page.waitForFunction(() => !document.querySelector('.game-dialog'));
      };
      const saved = () => page.evaluate(key => localStorage.getItem(key), firstRunKey);
      const shot = async suffix => {
        await page.evaluate(() => document.fonts.ready);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(await page.locator('#first-run-dialog button').evaluateAll(buttons => buttons.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent)), []);
        await page.screenshot({ path: `${output}/${engine}-${name}-${suffix}.png`, fullPage: true });
      };
      await page.goto(base); await page.waitForFunction(() => window.render_game_to_text);
      assert.equal((await state()).firstRun.invitationOpen, true);
      assert.equal(await page.locator('.home-choices button').first().getAttribute('id'), 'home-play-daily');
      assert.equal(await page.locator('.home-choices button').last().getAttribute('id'), 'home-play-stories');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'first-run-tutorial');
      await shot('invitation');
      if (name === 'desktop') await page.keyboard.press('Escape');
      else { await page.locator('#first-run-skip').focus(); await page.keyboard.press('Enter'); }
      await page.waitForFunction(() => !document.querySelector('#first-run-dialog'));
      assert.equal(JSON.parse(await saved()).choice, 'skipped');
      await page.locator('#home-tutorial-note').waitFor({ state: 'visible' });
      assert.match(await page.locator('#home-tutorial-note').textContent(), locale === 'pl' ? /Opowieści.*Prolog/ : /Stories.*Prelude/);
      await shot('skipped');
      await click('#home-play-stories');
      assert.match(await page.locator('#campaign-continue').textContent(), locale === 'pl' ? /Rozpocznij opowieść/ : /Begin story/);
      await click('#campaign-continue');
      assert.equal((await state()).mode, 'story-adventure', 'declining the tutorial also skips the default prelude route');
      await click('#mastermind-home-button'); await click('#home-play-stories'); await click('#home-play-tutorial');
      assert.equal((await state()).mode, 'story-tutorial', 'the prelude remains available after skipping');
      await click('#tutorial-exit'); await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      assert.equal((await state()).firstRun.invitationOpen, false);
      assert.equal(await page.locator('#home-tutorial-note').isVisible(), false, 'the reminder is brief and shown only after declining');
      for (const kind of ['dailies', 'stories']) {
        await click('#settings-open'); await click(`#reset-${kind}`); await click('#confirm-accept');
        assert.equal(JSON.parse(await saved()).choice, 'skipped');
      }
      await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      assert.equal((await state()).firstRun.invitationOpen, false);
      await click('#settings-open'); await click('#reset-all'); await click('#confirm-accept');
      assert.equal(await saved(), null);
      await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      assert.equal((await state()).firstRun.invitationOpen, true, 'all-data reset restores the first-run invitation');
      await click('#first-run-tutorial');
      await page.waitForFunction(() => JSON.parse(render_game_to_text()).mode === 'story-tutorial' && document.activeElement.id === 'tutorial-slot-0');
      assert.equal((await state()).mode, 'story-tutorial');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'tutorial-slot-0');
      assert.equal(JSON.parse(await saved()).choice, 'tutorial');
      assert.deepEqual(errors, []); await context.close();
      console.log(`${engine}/${name}: first-run offer, daily-first order, skip/escape, reminder, replay access, persistence and selective/all resets pass`);
    }
    for (const key of ['heroguesser:v1:2026-10-27:easy', 'heroguesser:story:campaign:v1']) {
      const page = await browser.newPage();
      await page.addInitScript(key => localStorage.setItem(key, 'legacy-progress'), key);
      await page.goto(base); await page.waitForFunction(() => window.render_game_to_text);
      assert.equal(await page.locator('#first-run-dialog').count(), 0);
      assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).choice, firstRunKey), 'returning');
      await page.close();
    }
    const noStorage = await browser.newPage();
    await noStorage.addInitScript(() => { Storage.prototype.getItem = Storage.prototype.setItem = Storage.prototype.removeItem = () => { throw Error('Unavailable'); }; });
    await noStorage.goto(base); await noStorage.locator('#first-run-skip').click();
    await noStorage.locator('#home-tutorial-note').waitFor({ state: 'visible' });
    await noStorage.locator('#home-play-stories').click(); await noStorage.locator('#campaign-continue').click();
    assert.equal(await noStorage.evaluate(() => JSON.parse(render_game_to_text()).mode), 'story-adventure');
    await noStorage.close();
    console.log(`${engine}: existing-player migration and unavailable-storage fallback pass`);
  } finally { await browser.close(); }
}
