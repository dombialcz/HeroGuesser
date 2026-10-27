import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { ADVENTURES } from '../src/mastermind-adventure-core.js';
import { seedExistingChapter, seedFirstRunHandled } from './story-test-fixtures.mjs';
import { generateChallenge } from '../src/mastermind-core.js';
const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
await mkdir('output/release', { recursive: true });
for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
  const browser = await browserType.launch();
  try {
    for (const [profile, width, height, locale, large] of [
      ['desktop', 1440, 1000, 'en', false], ['phone', 390, 844, 'en', false],
      ['small-pl', 320, 740, 'pl', true], ['landscape', 844, 390, 'pl', false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 500, timezoneId: 'Europe/Warsaw', reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [], external = [];
      await seedFirstRunHandled(page);
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', route => {
        if (route.request().url().startsWith(`${base}/`)) return route.continue();
        external.push(route.request().url()); return route.abort();
      });
      await page.clock.install({ time: new Date('2026-10-25T12:00:00+01:00') });
      await page.addInitScript(locale => localStorage.setItem('heroguesser:language', locale), locale);
      await page.goto(base);
      await page.waitForFunction(() => window.render_game_to_text);
      if (large) await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      const click = async selector => {
        await page.locator(selector).click();
        if (selector.startsWith('#confirm-')) await page.waitForFunction(() => !document.querySelector('dialog[aria-labelledby="confirm-heading"]'));
      };
      const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
      const fillStory = async row => { for (const piece of row) await click(`#adventure-pick-${piece}`); };
      const enter = async index => { await click('#home-play-stories'); await click(`#start-adventure-${index}`); };
      const home = () => click('#mastermind-home-button');
      await enter(0); await click('#adventure-next');
      for (let n = 0; n < 7; n++) { await fillStory(['knight', 'ale', 'thief']); await click('#adventure-check'); }
      await click('#adventure-hint'); await click('#adventure-pick-thief');
      const saved = await state();
      assert.equal(saved.guesses.length, 7); assert.equal(saved.phase, 'play'); assert.equal('health' in saved, false);
      await home(); await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      await enter(0);
      assert.deepEqual((await state()).draft, saved.draft); assert.equal((await state()).hintsShown, 1); assert.equal((await state()).guesses.length, 7);
      await home(); await seedExistingChapter(page, 1); await enter(1); await click('#adventure-next'); await click('#adventure-pick-mage'); await home(); await enter(0);
      assert.equal((await state()).guesses.length, 7);
      await click('#adventure-restart'); await click('#confirm-cancel'); assert.equal((await state()).guesses.length, 7);
      await page.evaluate(() => dispatchEvent(new Event('heroguesser:background')));
      assert.equal((await state()).draft[0], 'thief');
      await page.screenshot({ path: `output/release/${engine}-${profile}-story.png`, fullPage: true });
      await home();
      await page.evaluate(() => localStorage.setItem('heroguesser:story:v1:last-round', '{"schema":99}'));
      await enter(0); assert.equal((await state()).recovery, true);
      await click('#adventure-recovery'); await click('#confirm-cancel'); assert.equal((await state()).recovery, true);
      await click('#adventure-recovery'); await click('#confirm-accept'); assert.equal((await state()).phase, 'intro');
      // The original first chapter migrates; revised chapters retain old data
      // behind recovery until the player explicitly confirms a restart.
      await home();
      await seedExistingChapter(page, 2); await enter(2); await home();
      const previous = JSON.stringify({ schema: 1, content: 1, state: { adventure: 2, scene: 0, phase: 'play', draft: ['knight', null, null], selected: 1, guesses: [], facts: [], hint: 1, notice: null } });
      await page.evaluate(raw => {
        localStorage.setItem('heroguesser:story:v1:kings-awakening', raw);
        const first = JSON.parse(localStorage.getItem('heroguesser:story:v1:last-round'));
        first.content = 1; localStorage.setItem('heroguesser:story:v1:last-round', JSON.stringify(first));
      }, previous);
      await enter(0); assert.equal((await state()).recovery, false);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('heroguesser:story:v1:last-round')).content), 2);
      await home(); await enter(2); assert.equal((await state()).recovery, true);
      await click('#adventure-recovery'); await click('#confirm-cancel');
      assert.equal(await page.evaluate(() => localStorage.getItem('heroguesser:story:v1:kings-awakening')), previous);
      await home(); await enter(2); assert.equal((await state()).recovery, true);
      await click('#adventure-recovery'); await click('#confirm-accept');
      assert.equal((await state()).draft.length, 5); assert.equal((await state()).phase, 'intro');
      await home(); await enter(1); assert.equal((await state()).draft[0], 'mage');
      // A date change while playing a story must leave its board untouched.
      await page.clock.setFixedTime(new Date('2026-10-26T00:00:05+01:00'));
      await page.evaluate(() => dispatchEvent(new Event('heroguesser:foreground')));
      assert.equal((await state()).draft[0], 'mage');
      await home(); await click('#home-play-daily'); assert.equal((await state()).date, '2026-10-26');
      await click('.hero-choice[data-hero="thief"]');
      // Backwards clock change is guarded at the edit boundary, too.
      await page.clock.setFixedTime(new Date('2026-10-25T23:59:55+01:00'));
      await click('.hero-choice[data-hero="knight"]');
      assert.equal((await state()).date, '2026-10-25'); assert.ok((await state()).draft.every(x => x === null));
      await click('.hero-choice[data-hero="bard"]');
      // Real hold-drag interrupted by midnight cannot apply a piece to the new board.
      const tile = page.locator('.row-active [data-slot="0"]'); await tile.scrollIntoViewIfNeeded();
      const box = await tile.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(320);
      await page.clock.setFixedTime(new Date('2026-10-26T00:00:05+01:00'));
      await page.evaluate(() => dispatchEvent(new Event('heroguesser:foreground'))); await page.mouse.up();
      assert.equal((await state()).date, '2026-10-26'); assert.equal((await state()).draft[0], 'thief'); assert.equal((await state()).drag, null);
      const old = await page.evaluate(() => JSON.parse(localStorage.getItem('heroguesser:v1:2026-10-25:easy')));
      assert.equal(old.draft[0], 'bard');
      await click('#clear-button');
      const solution = generateChallenge('2026-10-26', 'easy').code;
      for (const hero of solution) await click(`.hero-choice[data-hero="${hero}"]`);
      await click('#submit-button'); assert.equal((await state()).result, 'solved');
      await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.sharedResult = data.text; } }));
      await click('#share-result'); const shared = await page.evaluate(() => window.sharedResult);
      assert.match(shared, /2026-10-26/); assert.match(shared, /5 🟩 · 0 🟨 · 0 ⬜/); assert.ok(!shared.includes(solution.join(',')));
      await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('cancelled', 'AbortError'); } }));
      await click('#share-result'); assert.equal(await page.locator('dialog[open]').count(), 0); assert.equal((await state()).result, 'solved');
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedResult = text; } } });
      });
      await click('#share-result'); assert.equal(await page.evaluate(() => window.copiedResult), shared);
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw Error('denied'); } } });
      });
      await click('#share-result'); await page.locator('.game-dialog textarea').waitFor();
      assert.match(await page.locator('.game-dialog textarea').inputValue(), /5 🟩/);
      await page.screenshot({ path: `output/release/${engine}-${profile}-share.png`, fullPage: true });
      await page.keyboard.press('Escape');
      await click('#settings-open'); await click('#reset-stories'); await click('#confirm-cancel');
      assert.ok(await page.evaluate(() => localStorage.getItem('heroguesser:story:v1:sleepless-court')));
      await click('#reset-stories'); await click('#confirm-accept'); await page.waitForFunction(() => !document.querySelector('#settings-dialog'));
      assert.equal(await page.evaluate(() => localStorage.getItem('heroguesser:story:v1:sleepless-court')), null);
      await click('#home-play-daily'); assert.equal((await state()).result, 'solved');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${engine}/${profile}: no overflow`);
      // Resetting dailies leaves chapter/language data intact; all-data reset is scoped to game keys.
      await home(); await enter(0); await click('#adventure-next'); await click('#adventure-pick-thief'); await home();
      await page.evaluate(() => localStorage.setItem('other:keep', 'yes'));
      await click('#settings-open'); await click('#reset-dailies'); await click('#confirm-accept'); await page.waitForFunction(() => !document.querySelector('#settings-dialog'));
      assert.ok(await page.evaluate(() => localStorage.getItem('heroguesser:story:v1:last-round')));
      await click('#home-play-daily'); assert.equal((await state()).result, 'playing');
      await page.clock.setFixedTime(new Date('2026-10-27T00:00:05+01:00')); await page.clock.fastForward(15000);
      assert.equal((await state()).date, '2026-10-27');
      await click('#settings-open'); await click('#reset-all'); await click('#confirm-accept'); await page.waitForFunction(() => !document.querySelector('#settings-dialog'));
      assert.equal(await page.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('heroguesser:'))), false);
      assert.equal(await page.evaluate(() => localStorage.getItem('other:keep')), 'yes');
      assert.deepEqual(external, []); assert.deepEqual(errors, []);
      await context.close(); console.log(`${engine}/${profile}: resume, unlimited tries, recovery, midnight, sharing, resets and local resources pass`);
    }
    const context = await browser.newContext(); const page = await context.newPage();
    await page.addInitScript(() => { Storage.prototype.getItem = () => { throw Error('denied'); }; Storage.prototype.setItem = () => { throw Error('denied'); }; });
    await page.goto(`${base}/?adventure=1`); await page.locator('#adventure-next').click(); await page.locator('#adventure-pick-thief').click();
    assert.equal(await page.locator('#storage-warning').isVisible(), true);
    assert.equal((await page.evaluate(() => JSON.parse(window.render_game_to_text()))).draft[0], 'thief');
    await context.close();
  } finally { await browser.close(); }
}
