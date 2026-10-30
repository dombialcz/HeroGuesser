import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { seedFirstRunHandled } from './story-test-fixtures.mjs';
import { generateChallenge } from '../src/mastermind-core.js';
const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
const output = 'output/tabletop-after';
await mkdir(output, { recursive: true });
let before = {};
try { before = JSON.parse(await readFile('output/tabletop-before/measurements.json', 'utf8')); } catch { /* Baseline is optional on clean checkouts. */ }
const measurements = {};
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const [profile, width, height, locale, large] of [
      ['desktop', 1440, 1000, 'en', false], ['tablet', 1024, 768, 'en', false],
      ['phone', 390, 844, 'en', false], ['phone-pl', 390, 844, 'pl', false],
      ['small-phone', 320, 740, 'en', false], ['landscape', 844, 390, 'pl', false],
      ['small-large-pl', 320, 740, 'pl', true],
    ]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: large ? 'reduce' : 'no-preference' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await seedFirstRunHandled(page);
      await page.addInitScript(locale => {
        localStorage.setItem('heroguesser:language', locale);
        window.tabletopEffects = [];
        const original = Element.prototype.animate;
        Element.prototype.animate = function(frames, options) {
          const kind = this.matches('.portrait-frame') ? 'placement' : this.matches('.row-feedback, .story-scores') ? 'result' : null;
          if (kind) window.tabletopEffects.push({ kind, duration: options.duration, frames });
          return original.call(this, frames, options);
        };
      }, locale);
      const largeText = async () => { if (large) await page.addStyleTag({ content: 'html { font-size: 200%; }' }); };
      const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
      const settle = () => page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); document.getAnimations().forEach(a => a.finish()); });
      const fits = async () => {
        await page.evaluate(() => document.fonts.ready);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${engine}/${profile}: page fits`);
        const labels = await page.locator('.hero-choice > span:not(.portrait-frame), .clue-text strong, .clue-text small').evaluateAll(els => els.filter(e => e.getBoundingClientRect().width).every(e => e.scrollWidth <= e.clientWidth + 1 && e.scrollHeight <= e.clientHeight + 1));
        assert.ok(labels, `${engine}/${profile}: full class/clue labels fit`);
        assert.ok(await page.locator('.hero-choice > span:not(.portrait-frame)').evaluateAll(labels => labels.every(label => { const range = document.createRange(); range.selectNodeContents(label); return range.getClientRects().length <= 1; })), 'class names remain whole words');
      };
      await page.goto(base); await page.waitForFunction(() => window.render_game_to_text); await largeText(); await settle();
      await fits();
      const dailyCard = page.locator('.home-choice-daily');
      assert.equal(await dailyCard.locator('button').first().getAttribute('id'), 'home-play-daily');
      assert.equal(await dailyCard.locator('.guild-ribbon').count(), 0, 'Daily keeps a quiet supporting title');
      assert.ok(await dailyCard.evaluate(card => {
        const action = card.querySelector('button').getBoundingClientRect();
        const title = card.querySelector('h2').getBoundingClientRect();
        const art = card.querySelector('.home-choice-art');
        const style = getComputedStyle(art);
        return action.bottom < title.top && style.position === 'absolute' && Number(style.opacity) <= .2 && style.pointerEvents === 'none';
      }), 'Daily action precedes copy and the emblem remains a subdued, inert background');
      assert.ok(await page.locator('.home-choice-story').evaluate(card => {
        const art = card.querySelector('.home-choice-art img').getBoundingClientRect();
        return [...card.querySelectorAll('p, button')].every(el => { const r = el.getBoundingClientRect(); return art.right <= r.left + 1 || art.left >= r.right - 1 || art.bottom <= r.top + 1 || art.top >= r.bottom - 1; });
      }), 'Story artwork stays clear of descriptions and controls');
      if (!large) {
        assert.ok(await page.locator('.home-choice-story').evaluate(card => {
          const art = card.querySelector('.home-choice-art img').getBoundingClientRect();
          const title = card.querySelector('h2').getBoundingClientRect();
          const overlap = Math.min(art.bottom, title.bottom) - Math.max(art.top, title.top);
          return overlap > 0 && overlap <= 96 && Number(getComputedStyle(card.querySelector('h2')).zIndex) > Number(getComputedStyle(card.querySelector('.home-choice-art')).zIndex);
        }), 'Compact Story emblem overlaps behind its title ribbon');
      }
      const ratio = await page.locator('.home-choices').evaluate(el => el.children[0].getBoundingClientRect().width / el.children[1].getBoundingClientRect().width);
      assert.ok(Math.abs(ratio - (width > 760 ? 1.5 : 1)) < .01, 'Home uses 3:2 columns and stacks on phones');
      await page.screenshot({ path: `${output}/${engine}-${profile}-home.png`, fullPage: true });
      await page.locator('#home-play-daily').click(); await settle();
      const geometry = () => page.locator('.hero-choice, .row-active .guess-tile').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return [r.width, r.height]; }));
      measurements[`${engine}-${profile}`] = await page.evaluate(() => Object.fromEntries(['.intro-row', '.mission-card', '.picker-panel', '.row-active', '#submit-button'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return [s, { top: r.top + scrollY, bottom: r.bottom + scrollY, height: r.height, width: r.width }]; })));
      const metrics = measurements[`${engine}-${profile}`];
      if (profile === 'phone') assert.ok(metrics['#submit-button'].bottom <= height + 96, `${engine}: larger portraits and padded ribbons keep Check within a short scroll: ${metrics['#submit-button'].bottom}`);
      if (engine === 'chromium' && before[profile] && locale === 'en') assert.ok(metrics['.row-active'].top < before[profile]['.row-active'].top, `${profile}: padded layout remains above the original playing row`);
      if (width <= 1100) assert.ok(metrics['.picker-panel'].bottom <= metrics['.row-active'].top, 'phone/tablet selector remains above formation');
      assert.equal(await page.locator('.picker-panel').evaluate(el => getComputedStyle(el).position), 'static');
      assert.equal(await page.locator('#formation-rules').evaluate(el => el.open), false);
      assert.equal(await page.locator('#controls-help').evaluate(el => el.open), false);
      assert.equal(await page.locator('#guess-board').getAttribute('aria-describedby'), 'drag-hint');
      assert.ok(await page.locator('.portrait-frame img').evaluateAll(imgs => imgs.every(img => getComputedStyle(img).objectFit === 'contain')));
      assert.equal(await page.locator('#hero-picker .portrait-fallback:visible').count(), 0, 'fallback letters do not bleed through transparent artwork');
      await fits();
      await page.screenshot({ path: `${output}/${engine}-${profile}-daily.png`, fullPage: true });
      if (large) await page.locator('.picker-panel').screenshot({ path: `${output}/${engine}-${profile}-selector.png` });
      // Both native disclosures support keyboard activation and remain open across placements.
      await page.locator('#formation-rules summary').focus(); await page.keyboard.press('Space');
      assert.equal(await page.locator('#formation-rules summary').innerText(), locale === 'pl' ? 'Zasady składu' : 'Formation rules');
      assert.ok(await page.locator('#rule-note').isVisible());
      await page.locator('#controls-help summary').focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#controls-help summary').innerText(), locale === 'pl' ? 'Sterowanie' : 'Controls');
      assert.ok(await page.locator('#drag-hint').isVisible());
      await page.locator('.hero-choice').first().click();
      assert.equal(await page.locator('#formation-rules').evaluate(el => el.open), true);
      assert.equal(await page.locator('#controls-help').evaluate(el => el.open), true);
      await page.locator('#clear-button').click();
      await page.locator('#formation-rules summary').click(); await page.locator('#controls-help summary').click();
      await page.locator('[data-challenge="hard"]').click(); await settle(); await fits();
      const withImages = await geometry();
      await page.route('**/assets/mastermind/*', route => route.abort());
      await page.reload(); await largeText();
      await page.locator('#home-play-daily').click(); await page.locator('[data-challenge="hard"]').click();
      await page.waitForFunction(() => [...document.querySelectorAll('#hero-picker .portrait-frame img')].every(img => img.hidden));
      assert.deepEqual(await geometry(), withImages, `${profile}: failed portraits do not resize controls`);
      await fits();
      const fallback = page.locator('.hero-choice[data-hero="barbarian"] .portrait-fallback small');
      assert.equal(await fallback.textContent(), locale === 'pl' ? 'Barbarzyńca' : 'Barbarian');
      assert.ok(await fallback.isVisible());
      await page.locator('.hero-choice').first().focus(); await page.keyboard.press('ArrowRight');
      assert.ok(await page.locator('.hero-choice').first().evaluate(el => el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none' && getComputedStyle(el).clipPath === 'none'), 'focus outline stays outside the bevelled portrait');
      assert.notEqual(await page.locator('.hero-choice .portrait-frame').first().evaluate(el => getComputedStyle(el).clipPath), 'none');
      await page.evaluate(() => document.activeElement.blur());
      for (let i = 0; i < 7; i++) await page.keyboard.press('1');
      assert.equal((await state()).draft.filter(Boolean).length, 7);
      assert.deepEqual(await page.locator('.row-active .tile-position').allTextContents(), ['1', '2', '3', '4', '5', '6', '7']);
      await page.locator('#controls-help summary').focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#controls-help').evaluate(el => el.open), true);
      assert.equal((await state()).guesses.length, 0, 'Enter on a disclosure never submits a full formation');
      await page.keyboard.press('Enter'); await page.evaluate(() => document.activeElement.blur());
      await page.keyboard.press('Enter'); assert.equal((await state()).guesses.length, 1);
      const effects = await page.evaluate(() => window.tabletopEffects);
      assert.equal(effects.filter(e => e.kind === 'placement' && e.duration === 170).length, large ? 0 : 7);
      assert.equal(effects.filter(e => e.kind === 'result' && e.duration === 160).length, large ? 0 : 1);
      const shapes = await page.locator('#guess-history .feedback-dot').evaluateAll(els => els.map(el => { const s = getComputedStyle(el); return [s.borderRadius, s.transform, s.borderStyle, s.backgroundColor].join(); }));
      assert.equal(new Set(shapes).size, 3, 'feedback has three distinguishable shapes');
      await fits(); await settle();
      await page.screenshot({ path: `${output}/${engine}-${profile}-fallback.png`, fullPage: true });
      const snap = await state();
      for (const hero of generateChallenge(snap.date, 'hard').code) await page.locator(`.hero-choice[data-hero="${hero}"]`).click();
      await page.locator('#submit-button').click(); assert.equal((await state()).result, 'solved');
      await page.unroute('**/assets/mastermind/*');
      await page.reload(); await largeText(); await page.locator('#home-play-daily').click(); await page.locator('[data-challenge="hard"]').click();
      assert.equal((await state()).result, 'solved');
      assert.deepEqual(await page.evaluate(() => window.tabletopEffects), [], 'restoring a solved puzzle does not replay visual effects');
      assert.deepEqual(errors, []); await page.close();
      console.log(`${engine}/${profile}: composition, disclosures, whole labels, fallback geometry, keyboard/focus, place tabs, action-only/reduced motion and solving pass`);
    }
  } finally { await browser.close(); }
}
await writeFile(`${output}/measurements.json`, JSON.stringify(measurements, null, 2));
