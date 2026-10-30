import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { generateChallenge } from '../src/mastermind-core.js';
const base = process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180';
const output = 'output/daily-locks';
await mkdir(output, { recursive: true });
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const [profile, width, height, locale, large] of [
      ['desktop', 1440, 1000, 'en', false], ['phone', 390, 844, 'en', false],
      ['small-phone', 320, 740, 'en', false], ['large-pl', 320, 740, 'pl', true],
    ]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      await page.addInitScript(locale => localStorage.setItem('heroguesser:language', locale), locale);
      await page.goto(`${base}/?daily=1`);
      if (large) await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
      const pick = hero => page.locator(`.hero-choice[data-hero="${hero}"]`).click();
      const clear = () => page.locator('#clear-button').click();
      const check = () => page.locator('#submit-button').click();
      const lock = slot => page.locator(`[data-lock-slot="${slot}"]`);
      const copy = index => page.locator(`[data-copy-guess="${index}"]`);
      const settle = () => page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
      const shot = async suffix => {
        await settle();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${profile}/${suffix}: no overflow`);
        await page.screenshot({ path: `${output}/${engine}-${profile}-${suffix}.png`, fullPage: true });
      };
      assert.equal(await lock(0).isDisabled(), true);
      for (let i = 0; i < 5; i++) await pick('knight');
      await check();
      assert.equal((await state()).guesses.length, 1);
      await copy(0).focus(); await page.keyboard.press('Enter');
      assert.deepEqual((await state()).draft, Array(5).fill('knight'));
      assert.equal((await state()).guesses.length, 1, 'copy does not submit');
      await page.locator('#current-guess [data-slot="0"]').click(); await pick('bard');
      await lock(0).focus(); await page.keyboard.press('Space');
      assert.equal(await lock(0).getAttribute('aria-pressed'), 'true');
      await copy(0).click();
      assert.deepEqual((await state()).draft, ['bard', 'knight', 'knight', 'knight', 'knight']);
      assert.deepEqual((await state()).guesses[0].heroes, Array(5).fill('knight'));
      await check();
      assert.deepEqual((await state()).draft, ['bard', null, null, null, null], 'next attempt repopulates locked hero');
      assert.equal(await page.locator('#clear-button').isDisabled(), true);
      await page.locator('#guess-history [data-history-row="0"][data-slot="0"]').click();
      assert.deepEqual((await state()).draft, ['bard', 'knight', null, null, null], 'individual copies skip locks');
      await clear(); assert.equal((await state()).draft[0], 'bard');
      if (profile === 'desktop') {
        const source = page.locator('#guess-history [data-history-row="0"][data-slot="0"]');
        await source.scrollIntoViewIfNeeded();
        const a = await source.boundingBox(), b = await page.locator('#current-guess [data-slot="0"]').boundingBox();
        await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await page.waitForTimeout(300);
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up();
        assert.equal((await state()).draft[0], 'bard', 'drag cannot overwrite a lock');
      }
      await shot('locked-history');
      await page.reload(); if (large) await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      assert.equal((await state()).locks[0], 'bard'); assert.equal((await state()).draft[0], 'bard');
      await page.locator('[data-challenge="medium"]').click(); assert.ok((await state()).locks.every(x => x === null));
      await page.locator('[data-challenge="easy"]').click(); assert.equal((await state()).locks[0], 'bard');
      await lock(0).click(); await clear();
      assert.ok((await state()).draft.every(x => x === null));
      await copy(0).click(); assert.deepEqual((await state()).draft, Array(5).fill('knight'));
      await page.locator('#current-guess [data-slot="1"]').click();
      assert.deepEqual((await state()).guesses[0].heroes, Array(5).fill('knight'), 'editing copied draft does not mutate history');
      await clear();
      const solution = generateChallenge((await state()).date, 'easy').code;
      for (const hero of solution) await pick(hero);
      await lock(0).click(); await check();
      assert.equal((await state()).result, 'solved');
      assert.equal(await page.locator('#current-guess .guess-tile').count(), 0);
      assert.ok(await page.locator('.guess-copy-row').evaluateAll(buttons => buttons.every(b => b.disabled)));
      for (const difficulty of ['hard', 'chaos']) {
        await page.locator(`[data-challenge="${difficulty}"]`).click();
        const size = (await state()).partySize;
        const hero = generateChallenge((await state()).date, difficulty).code.every(piece => piece === 'knight') ? 'bard' : 'knight';
        for (let i = 0; i < size; i++) await pick(hero);
        await lock(size - 1).click(); await check();
        assert.equal((await state()).draft[size - 1], hero);
        await copy(0).click(); assert.equal((await state()).draft.length, size);
        await shot(difficulty);
      }
      await page.locator('#mastermind-home-button').click(); await page.locator('#home-play-stories').click();
      await page.locator('#start-adventure-0').click(); await page.locator('#adventure-next').click();
      assert.equal(await page.locator('#mastermind-adventure .slot-lock-button, #mastermind-adventure .guess-copy-row').count(), 0);
      await page.goto(`${base}/?tutorial=1`);
      assert.equal(await page.locator('#mastermind-tutorial .slot-lock-button, #mastermind-tutorial .guess-copy-row').count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`${engine}/${profile}: copy any row, preserve/clear/repopulate locks, keyboard, reload/isolation, drag protection, solve, Hard/Party Roll and Daily-only scope pass`);
    }
  } finally { await browser.close(); }
}
