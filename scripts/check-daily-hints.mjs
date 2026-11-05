import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { generateChallenge } from '../src/mastermind-core.js';

const base = process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180';
const output = 'output/daily-hints';
await mkdir(output, { recursive: true });
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const [profile, width, height, locale, large] of [
      ['desktop', 1440, 1100, 'en', false], ['phone', 390, 844, 'en', false],
      ['small-phone', 320, 740, 'en', false], ['large-pl', 320, 740, 'pl', true],
    ]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      await page.clock.install({ time: new Date('2026-10-31T12:00:00Z') });
      await page.clock.pauseAt(new Date('2026-10-31T12:00:01Z'));
      await page.addInitScript(locale => {
        localStorage.setItem('heroguesser:language', locale);
        Math.random = () => 0;
      }, locale);
      await page.goto(`${base}/?daily=1`);
      const enlarge = async () => { if (large) await page.addStyleTag({ content: 'html { font-size: 200%; }' }); };
      await enlarge();
      const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
      const pick = hero => page.locator(`.hero-choice[data-hero="${hero}"]`).click();
      const hint = () => page.locator('#daily-hint-button');
      const eye = slot => page.locator(`[data-eye-slot="${slot}"]`);
      const tile = slot => page.locator(`#current-guess [data-slot="${slot}"]`);
      const lock = slot => page.locator(`[data-lock-slot="${slot}"]`);
      const clear = () => page.locator('#clear-button').click();
      const shot = async suffix => {
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${engine}/${profile}/${suffix}: no overflow`);
        await page.screenshot({ path: `${output}/${engine}-${profile}-${suffix}.png`, fullPage: true });
      };
      assert.equal(await page.locator('#hero-picker > button').count(), 7);
      assert.equal(await hint().isEnabled(), true);
      await shot('ready');
      const code = generateChallenge((await state()).date, 'easy').code;
      for (let i = 0; i < 5; i++) await pick('mage');
      await page.locator('#submit-button').click();
      await page.locator('[data-copy-guess="0"]').click();
      await lock(0).click(); await lock(2).click();
      await hint().focus(); await page.keyboard.press('Enter');
      let current = await state();
      assert.equal(current.draft[0], code[0], 'reveal replaces a manual lock');
      assert.equal(current.hints[0], 'open');
      assert.equal(current.locks[0], code[0]);
      assert.equal(current.locks[2], 'mage', 'other manual locks survive');
      assert.equal(current.guesses.length, 1, 'hint never submits');
      assert.equal(current.hintCooldownSeconds, 30);
      assert.equal(await hint().isDisabled(), true);
      await hint().evaluate(b => b.click());
      assert.equal((await state()).hints.filter(Boolean).length, 1, 'rapid clicks cannot reveal twice');
      assert.equal(await lock(0).count(), 0, 'eye replaces the padlock');
      assert.equal(await tile(0).isDisabled(), true);
      await tile(0).evaluate(b => b.click());
      assert.equal((await state()).draft[0], code[0]);
      await clear();
      assert.equal((await state()).draft[0], code[0], 'clear retains the revealed hero');
      await page.locator('[data-copy-guess="0"]').click();
      assert.equal((await state()).draft[0], code[0], 'copy protects the answer');
      await page.locator('#submit-button').click();
      assert.equal((await state()).draft[0], code[0], 'check repopulates the answer');
      await eye(0).focus(); await page.keyboard.press('Space');
      assert.equal(await eye(0).getAttribute('aria-pressed'), 'false');
      assert.equal(await tile(0).isEnabled(), true);
      await tile(0).click(); await pick('mage');
      assert.equal((await state()).draft[0], 'mage', 'closed eye permits replacement');
      await page.reload(); await enlarge();
      assert.equal((await state()).hints[0], 'closed');
      assert.equal((await state()).draft[0], 'mage', 'closed-eye experiment persists');
      assert.equal((await state()).hintCooldownSeconds, 30, 'reload retains the cooldown');
      await eye(0).click();
      assert.equal((await state()).draft[0], code[0], 'reopen restores the actual hero');
      assert.equal((await state()).hintCooldownSeconds, 30, 'toggling does not spend another hint');
      if (profile === 'desktop') {
        const source = page.locator('#guess-history [data-history-row="0"][data-slot="0"]');
        await source.scrollIntoViewIfNeeded();
        const a = await source.boundingBox(), b = await tile(0).boundingBox();
        await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
        await page.clock.runFor(300);
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 5 }); await page.mouse.up();
        assert.equal((await state()).draft[0], code[0], 'drag cannot overwrite an open eye');
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.clock.runFor(300);
        assert.equal((await state()).drag, null, 'open-eye hero cannot be dragged out'); await page.mouse.up();
      }
      await page.clock.fastForward(28_000);
      assert.equal(await hint().isDisabled(), true);
      await page.clock.fastForward(2_000);
      assert.equal(await hint().isEnabled(), true, 'button becomes ready when cooldown ends');
      await hint().click();
      assert.equal((await state()).hints[1], 'open', 'second hint reveals a different place');
      await eye(0).click();
      await shot('open-closed-history');
      assert.notEqual(await eye(0).evaluate(el => getComputedStyle(el.querySelector('svg')).filter), 'none', 'closed eye keeps its faint magical glow');
      assert.equal(await tile(1).locator('.portrait-frame').evaluate(el => getComputedStyle(el).animationName), 'none', 'reduced motion stops shimmering');
      await page.reload(); await enlarge();
      assert.equal((await state()).hints[1], 'open');
      assert.equal((await state()).draft[1], code[1]);
      for (const difficulty of ['medium', 'hard', 'chaos']) {
        await page.locator(`[data-challenge="${difficulty}"]`).click();
        assert.equal(await hint().isEnabled(), true, 'each puzzle has its own hint cooldown');
        await hint().click();
        assert.equal((await state()).hints[0], 'open');
        await shot(difficulty);
      }
      await page.locator('[data-challenge="easy"]').click();
      assert.equal((await state()).hints[0], 'closed');
      assert.equal((await state()).hints[1], 'open');
      for (let i = 2; i < 5; i++) { await page.clock.fastForward(30_000); await hint().click(); }
      assert.equal((await state()).hints.filter(Boolean).length, 5);
      assert.equal(await hint().isDisabled(), true, 'all places revealed disables new hints');
      await eye(0).click();
      assert.deepEqual((await state()).draft, code);
      await page.locator('#submit-button').click();
      assert.equal((await state()).result, 'solved');
      assert.equal(await hint().isDisabled(), true);
      if (profile === 'desktop') {
        const previousDate = (await state()).date;
        await page.clock.fastForward(86_400_000);
        assert.notEqual((await state()).date, previousDate, 'rollover loads the next day');
        assert.ok((await state()).hints.every(h => h === null), 'new day clears reveal knowledge');
        assert.equal(await hint().isEnabled(), true);
        await hint().click();
        await page.locator('#settings-open').click(); await page.locator('#reset-dailies').click();
        await page.locator('#confirm-accept').click(); await page.waitForFunction(() => !document.querySelector('#settings-dialog'));
        await page.locator('#home-play-daily').click();
        assert.ok((await state()).hints.every(h => h === null), 'daily reset removes reveals');
        assert.equal((await state()).hintCooldownSeconds, 0);
      }
      await page.locator('#mastermind-home-button').click(); await page.locator('#home-play-stories').click();
      await page.locator('#start-adventure-0').click(); await page.locator('#adventure-next').click();
      assert.equal(await page.locator('#mastermind-adventure .hint-choice, #mastermind-adventure .slot-eye-button').count(), 0);
      await page.goto(`${base}/?tutorial=1`);
      assert.equal(await page.locator('#mastermind-tutorial .hint-choice, #mastermind-tutorial .slot-eye-button').count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`${engine}/${profile}: reveal, 30s cooldown, eye toggles, copy/clear/check/drag protection, save/reload, all difficulties, complete and Daily-only scope pass`);
    }
  } finally { await browser.close(); }
}
