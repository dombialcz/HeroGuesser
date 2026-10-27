import { seedFirstRunHandled } from './story-test-fixtures.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { generateChallenge, HERO_CLASSES, scoreGuess } from '../src/mastermind-core.js';

const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
await mkdir('output/mastermind-party-roll', { recursive: true });
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const [name, width, height, locale, large] of [
      ['desktop', 1440, 1000, 'en', false], ['phone', 390, 844, 'en', false],
      ['small-phone', 320, 740, 'pl', false], ['landscape', 844, 390, 'pl', false],
      ['large-pl', 320, 740, 'pl', true],
    ].filter(profile => !process.argv.includes('--large-text-only') || profile[4])) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 500, timezoneId: 'Europe/Warsaw', reducedMotion: 'reduce' });
      await context.addInitScript(({ locale, large }) => {
        localStorage.setItem('heroguesser:language', locale);
        if (large) addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = '200%'; });
      }, { locale, large });
      const page = await context.newPage(), errors = [];
      await seedFirstRunHandled(page);
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await page.clock.install({ time: new Date('2026-10-26T12:00:00+01:00') });
      await page.goto(`${base}/index.html`);
      await page.waitForFunction(() => window.render_game_to_text);
      const click = selector => page.locator(selector).click();
      const state = () => page.evaluate(() => JSON.parse(render_game_to_text()));
      const fill = async heroes => { for (const hero of heroes) await click(`.hero-choice[data-hero="${hero}"]`); };
      const partyRoll = () => click('[data-challenge="chaos"]');
      await click('#home-play-daily');
      assert.equal(await page.locator('[data-challenge]').count(), 4);
      await click('.hero-choice[data-hero="thief"]');
      const easyDraft = (await state()).draft;
      await partyRoll();
      const localizedName = locale === 'pl' ? 'Drużyna z przypadku' : 'Party Roll';
      assert.equal((await state()).partyName, localizedName);
      assert.equal(await page.locator('[data-challenge="chaos"] .difficulty-name').innerText(), localizedName);
      assert.equal((await state()).partySize, 5);
      assert.deepEqual((await state()).clues, []);
      assert.equal('solution' in await state(), false);
      assert.equal(await page.locator('.clue-area').isVisible(), false);
      assert.equal(await page.locator('.clue-divider').isVisible(), false);
      assert.equal(await page.locator('.hero-choice').count(), 7);
      assert.equal(await page.locator('#current-guess .guess-tile').count(), 5);
      assert.match(await page.locator('#rule-note').innerText(), locale === 'pl' ? /pięć razy/ : /five of the same/);
      await click('.hero-choice[data-hero="mage"]');
      await click('#mastermind-home-button'); await click('#home-play-daily');
      assert.equal((await state()).difficulty, 'chaos');
      assert.equal((await state()).draft[0], 'mage');
      await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      await click('#home-play-daily'); await partyRoll();
      assert.equal((await state()).draft[0], 'mage');
      await click('#current-guess [data-slot="0"]');
      assert.equal((await state()).draft[0], null);
      const puzzle = generateChallenge('2026-10-26', 'chaos');
      const missing = HERO_CLASSES.find(hero => !puzzle.counts[hero.id]).id;
      const wrong = Array(5).fill(missing);
      await fill(wrong);
      assert.deepEqual((await state()).draft, wrong, 'five identical heroes allowed');
      assert.equal((await state()).guesses.length, 0, 'full drafts wait for explicit Check');
      await click('#submit-button');
      assert.deepEqual((await state()).guesses[0], { heroes: wrong, ...scoreGuess(puzzle.code, wrong), absent: 5 });
      await click('#guess-history .guess-tile[data-slot="0"]');
      assert.equal((await state()).draft[0], missing, 'history copy works');
      await click('#clear-button');
      await click('[data-challenge="easy"]');
      assert.deepEqual((await state()).draft, easyDraft);
      assert.equal(await page.locator('.clue-area').isVisible(), true);
      await partyRoll();
      await click(`[data-locale="${locale === 'pl' ? 'en' : 'pl'}"]`);
      assert.match(await page.locator('#rule-note').innerText(), locale === 'pl' ? /seven heroes/ : /siedmiu bohaterów/);
      await click(`[data-locale="${locale}"]`);
      await fill(puzzle.code); await click('#submit-button');
      assert.equal((await state()).result, 'solved');
      assert.equal(await page.locator('[data-challenge="chaos"] .difficulty-result').innerText(), '✓');
      assert.equal(await page.locator('#submit-button').isDisabled(), true);
      await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.sharedResult = data.text; } }));
      await click('#share-result');
      assert.ok((await page.evaluate(() => window.sharedResult)).includes(`2026-10-26 · ${localizedName}\n`));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.evaluate(async () => { await document.fonts.ready; document.getAnimations().forEach(a => a.finish()); window.scrollTo(0, 0); });
      await page.screenshot({ path: `output/mastermind-party-roll/${engine}-${name}.png`, fullPage: true });
      await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
      await click('#home-play-daily'); await partyRoll();
      assert.equal((await state()).result, 'solved');
      await page.clock.setFixedTime(new Date('2026-10-27T00:00:05+01:00'));
      await page.evaluate(() => dispatchEvent(new Event('heroguesser:foreground')));
      assert.equal((await state()).date, '2026-10-27');
      assert.equal((await state()).difficulty, 'chaos');
      assert.equal((await state()).result, 'playing');
      assert.deepEqual((await state()).draft, Array(5).fill(null));
      await click('.hero-choice[data-hero="mage"]');
      await page.clock.setFixedTime(new Date('2026-10-26T12:00:00+01:00'));
      await page.evaluate(() => dispatchEvent(new Event('heroguesser:foreground')));
      assert.equal((await state()).result, 'solved', 'previous date restores its solved board');
      await click('#settings-open'); await click('#reset-dailies'); await click('#confirm-accept');
      await page.waitForFunction(() => !document.querySelector('#settings-dialog'));
      await click('#home-play-daily'); await partyRoll();
      assert.equal((await state()).guesses.length, 0);
      assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(key => /^heroguesser:v1:/.test(key)).length), 0);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${engine}/${name}: Party Roll play, repeats, feedback, save isolation, translation, sharing, rollover, reset and layout pass`);
    }
  } finally { await browser.close(); }
}
