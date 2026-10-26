import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { ADVENTURES, createAdventure, actAdventure } from '../src/mastermind-adventure-core.js';
import { serializeStory, storyKey } from '../src/story-progress.js';
import { campaignKey } from '../src/story-campaign.js';
const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
const output = 'output/story-campaign';
await mkdir(output, { recursive: true });
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const [locale, width, large] of [['en', 390, false], ['pl', 320, true]]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
      await context.addInitScript(locale => localStorage.setItem('heroguesser:language', locale), locale);
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
      const click = async selector => {
        await page.locator(selector).tap();
        if (selector.startsWith('#confirm-')) await page.waitForFunction(() => !document.querySelector('dialog[aria-labelledby="confirm-heading"]'));
      };
      const home = () => click('#mastermind-home-button');
      const menu = async () => { await home(); await click('#home-play-stories'); };
      await page.goto(`${base}/?adventure=4`);
      await page.waitForFunction(() => window.render_game_to_text);
      if (large) await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      assert.equal((await state()).mode, 'stories');
      assert.equal((await state()).campaign.unlockedThrough, 1);
      for (let i = 1; i < 4; i++) assert.equal(await page.locator(`#start-adventure-${i}`).isDisabled(), true);
      // The handler itself guards entry, including a forced click on a disabled button.
      await page.locator('#start-adventure-3').evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      assert.equal((await state()).mode, 'stories');
      assert.equal(await page.locator('#adventure-next').count(), 0);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), storyKey(3)), null);
      assert.ok(await page.locator('.campaign-locked-notice').textContent());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `${output}/${engine}-${locale}-locked.png`, fullPage: true });
      await click('#campaign-continue');
      for (let i = 0; i < ADVENTURES[0].scenes.length; i++) {
        await click('#adventure-next');
        for (const piece of ADVENTURES[0].scenes[i].solution) await click(`#adventure-pick-${piece}`);
        await click('#adventure-check');
        assert.equal((await state()).phase, 'solved');
        if (i < ADVENTURES[0].scenes.length - 1) await click('#adventure-next');
      }
      // Unlock is earned at the final solve, before navigating through the ending.
      await menu(); assert.equal((await state()).campaign.unlockedThrough, 2);
      assert.deepEqual((await state()).campaign.completed, [true, false, false, false]);
      await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      await click('#home-play-stories'); assert.equal(await page.locator('#start-adventure-1').isDisabled(), false);
      await page.screenshot({ path: `${output}/${engine}-${locale}-unlocked.png`, fullPage: true });
      await click('#campaign-continue'); assert.equal((await state()).adventure, ADVENTURES[0].id);
      await click('#adventure-next'); assert.equal((await state()).phase, 'complete');
      await click('#adventure-finish'); assert.equal((await state()).adventure, ADVENTURES[1].id);
      await click('#adventure-next'); await click('#adventure-pick-mage');
      await menu(); await click('#start-adventure-0');
      await click('#adventure-restart'); await click('#confirm-cancel'); assert.equal((await state()).phase, 'complete');
      await click('#adventure-restart'); await click('#confirm-accept'); assert.equal((await state()).phase, 'intro');
      await menu(); assert.equal((await state()).campaign.unlockedThrough, 2);
      assert.equal((await state()).campaign.completed[0], true);
      await click('#campaign-continue'); assert.equal((await state()).draft[0], 'mage');
      await menu(); await click('#settings-open'); await click('#reset-dailies'); await click('#confirm-accept');
      await click('#home-play-stories'); assert.equal((await state()).campaign.unlockedThrough, 2);
      await click('#settings-open'); await click('#reset-stories'); await click('#confirm-cancel');
      assert.ok(await page.evaluate(key => localStorage.getItem(key), campaignKey));
      await click('#reset-stories'); await click('#confirm-accept');
      await click('#home-play-stories'); assert.equal((await state()).campaign.unlockedThrough, 1);
      assert.deepEqual((await state()).campaign.completed, [false, false, false, false]);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), campaignKey), null);
      for (let i = 1; i < 4; i++) assert.equal(await page.locator(`#start-adventure-${i}`).isDisabled(), true);
      assert.deepEqual(errors, []); await context.close();
      console.log(`${engine}/${locale}: locked entry, final-solve unlock, reload, continue, replay, independent saves, selective resets pass`);
    }
    const page = await browser.newPage();
    const legacy = createAdventure(2); actAdventure(legacy, { type: 'next' }); actAdventure(legacy, { type: 'pick', piece: 'king' });
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: storyKey(2), raw: serializeStory(legacy) });
    await page.goto(`${base}/?adventure=3`); await page.waitForFunction(() => window.render_game_to_text);
    assert.equal(await page.evaluate(() => JSON.parse(window.render_game_to_text()).draft[0]), 'king');
    await page.locator('#adventure-exit').click();
    const migrated = await page.evaluate(() => JSON.parse(window.render_game_to_text()).campaign);
    assert.equal(migrated.unlockedThrough, 3); assert.deepEqual(migrated.completed, [false, false, false, false]);
    await page.close(); console.log(`${engine}: existing later-chapter progress remains accessible without inventing completions`);
  } finally { await browser.close(); }
}
