import { solvePrelude } from './tutorial-test-fixtures.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { campaignKey } from '../src/story-campaign.js';
import { storyKey } from '../src/story-progress.js';
const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
const output = 'output/story-prelude';
await mkdir(output, { recursive: true });


for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const [name, locale, width, height, large] of [
      ['desktop', 'en', 1440, 1000, false], ['phone', 'en', 390, 844, false],
      ['pl-large', 'pl', 320, 740, true], ['landscape', 'pl', 844, 390, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 500, reducedMotion: 'reduce' });
      await context.addInitScript(locale => localStorage.setItem('heroguesser:language', locale), locale);
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      const state = () => page.evaluate(() => JSON.parse(render_game_to_text()));
      const click = selector => page.locator(selector).click();
      const saved = key => page.evaluate(key => localStorage.getItem(key), key);
      const dailySaves = () => page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('heroguesser:v1:'))));
      const menu = async () => { await click('#mastermind-home-button'); await click('#home-play-stories'); };
      const capture = async suffix => {
        await page.evaluate(async () => { await document.fonts.ready; document.getAnimations().forEach(a => a.finish()); });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${engine}/${name}/${suffix}: no overflow`);
        assert.deepEqual(await page.locator('.prelude-paths button:visible').evaluateAll(buttons => buttons.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent)), []);
        await page.screenshot({ path: `${output}/${engine}-${name}-${suffix}.png`, fullPage: true });
      };
      await page.goto(`${base}/`); await page.waitForFunction(() => window.render_game_to_text);
      if (large) await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      assert.equal(await page.locator('.home-choices button').count(), 2);
      const dailies = await dailySaves();
      await click('#first-run-tutorial');
      await page.waitForFunction(() => JSON.parse(render_game_to_text()).mode === 'story-tutorial');
      assert.equal((await state()).mode, 'story-tutorial');
      await click('#tutorial-exit');
      await click('#home-play-stories');
      assert.equal((await state()).campaign.preludeCompleted, false);
      assert.equal(await page.locator('.adventure-story-button').count(), 5);
      await click('#campaign-continue'); assert.equal((await state()).mode, 'story-tutorial');
      await click('#tutorial-pick-thief'); await menu();
      assert.equal((await state()).campaign.preludeCompleted, false, 'leaving an unfinished prelude does not complete it');
      await click('#campaign-continue'); assert.ok((await state()).draft.every(piece => piece === null));
      await solvePrelude(page);
      assert.equal(JSON.parse(await saved(campaignKey)).preludeCompleted, true);
      assert.equal(await saved(storyKey(0)), null, 'completion does not create a chapter draft');
      assert.equal(await page.locator('.prelude-paths button').count(), 2);
      assert.equal(await page.locator('.prelude-paths button').first().getAttribute('id'), 'tutorial-finish');
      await capture('choice');
      // Native button keyboard activation must take the chosen path, not the global Enter shortcut.
      await page.locator('#tutorial-finish').focus(); await page.keyboard.press('Enter');
      assert.equal((await state()).difficulty, 'easy');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'daily-title');
      assert.deepEqual(await dailySaves(), dailies);
      await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      await click('#home-play-stories');
      assert.equal((await state()).campaign.preludeCompleted, true);
      assert.deepEqual((await state()).campaign.completed, [false, false, false, false]);
      await click('#campaign-continue'); assert.equal((await state()).mode, 'story-adventure');
      await click('#adventure-next'); await click('#adventure-pick-thief');
      const chapterSave = await saved(storyKey(0));
      await menu(); await click('#home-play-tutorial'); await solvePrelude(page);
      assert.equal(await saved(storyKey(0)), chapterSave, 'replaying the prelude preserves chapter progress');
      await capture('replay-choice');
      if (locale === 'pl') { await page.locator('#tutorial-adventure').focus(); await page.keyboard.press('Enter'); }
      else await click('#tutorial-adventure');
      assert.equal((await state()).mode, 'story-adventure');
      assert.equal((await state()).draft[0], 'thief', 'Venture forth resumes the saved chapter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'adventure-guide-title');
      await capture('chapter');
      await menu(); await click('#settings-open'); await click('#reset-dailies'); await click('#confirm-accept');
      await page.waitForFunction(() => !document.querySelector('.game-dialog'));
      await click('#home-play-stories'); assert.equal((await state()).campaign.preludeCompleted, true);
      await click('#settings-open'); await click('#reset-stories'); await click('#confirm-accept');
      await page.waitForFunction(() => !document.querySelector('.game-dialog'));
      await click('#home-play-stories'); assert.equal((await state()).campaign.preludeCompleted, false);
      await click('#campaign-continue'); assert.equal((await state()).phase, 'setup');
      assert.equal(await saved(storyKey(0)), null);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${engine}/${name}: prelude entry, both paths, keyboard focus, reload, replay/resume, reset isolation and reflow pass`);
    }
    const noStorage = await browser.newPage();
    await noStorage.addInitScript(() => {
      Storage.prototype.getItem = Storage.prototype.setItem = Storage.prototype.removeItem = () => { throw new Error('Storage disabled'); };
    });
    await noStorage.goto(`${base}/?tutorial=1`);
    await noStorage.waitForFunction(() => window.render_game_to_text);
    await solvePrelude(noStorage);
    await noStorage.locator('#tutorial-adventure').click();
    assert.equal(await noStorage.evaluate(() => JSON.parse(render_game_to_text()).mode), 'story-adventure');
    await noStorage.close();
    console.log(`${engine}: unavailable storage keeps the completion-to-story path playable for this session`);
  } finally { await browser.close(); }
}
