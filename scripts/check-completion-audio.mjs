import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { ADVENTURES } from '../src/mastermind-adventure-core.js';

const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
await mkdir('output/completion-audio', { recursive: true });
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      window.completionSounds = [];
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...args) {
        if (this.buffer.duration >= 1) {
          const entry = { duration: this.buffer.duration, state: this.context.state, signal: 0 };
          completionSounds.push(entry);
          const analyser = this.context.createAnalyser(); this.connect(analyser);
          setTimeout(() => {
            const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data);
            entry.signal = Math.max(...data.map(Math.abs)); this.disconnect(analyser);
          }, 120);
        }
        return start.apply(this, args);
      };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const state = () => page.evaluate(() => JSON.parse(render_game_to_text()));
    const click = selector => page.locator(selector).tap();
    const sounds = () => page.evaluate(() => completionSounds);
    async function checkSound(action, duration, label) {
      const before = (await sounds()).length;
      await action(); await page.waitForTimeout(250);
      const added = (await sounds()).slice(before);
      assert.equal(added.length, duration ? 1 : 0, `${name}/${label}: exactly the expected completion sound`);
      if (duration) {
        assert.equal(added[0].duration, duration, label);
        assert.equal(added[0].state, 'running', label);
        assert.ok(added[0].signal > 0.001, `${label}: nonzero rendered audio`);
      }
    }
    await page.goto(`${base}/index.html?daily=1`);
    for (const difficulty of ['easy', 'medium', 'hard', 'chaos']) {
      await click(`[data-challenge="${difficulty}"]`);
      const code = await page.evaluate(async difficulty => {
        const { generateChallenge } = await import('./src/mastermind-core.js');
        return generateChallenge(JSON.parse(render_game_to_text()).date, difficulty).code;
      }, difficulty);
      const fill = async row => { for (const hero of row) await click(`.hero-choice[data-hero="${hero}"]`); };
      if (difficulty === 'easy') {
        await fill([...code.slice(1), code[0]]);
        await checkSound(() => click('#submit-button'), 0, 'wrong daily');
      }
      await fill(code); await checkSound(() => click('#submit-button'), 2, `${difficulty} win`);
      assert.equal((await state()).result, 'solved');
      await checkSound(() => click('[data-locale="pl"]'), 0, 'rerender solved daily');
      await checkSound(async () => { await page.reload(); await page.waitForFunction(() => window.render_game_to_text); }, 0, 'restore daily');
    }
    await click('#mastermind-home-button'); await click('#home-play-stories'); await click('#campaign-continue');
    for (let chapter = 0; chapter < ADVENTURES.length; chapter++) {
      const scenes = ADVENTURES[chapter].scenes;
      for (let index = 0; index < scenes.length; index++) {
        await checkSound(() => click('#adventure-next'), 0, 'begin scene');
        assert.equal((await state()).phase, 'play', JSON.stringify(await state()));
        for (const piece of scenes[index].solution) await click(`#adventure-pick-${piece}`);
        const last = index === scenes.length - 1;
        // One muted scene confirms the setting covers wins as well as placements.
        if (chapter === 0 && index === 0) {
          await click('#settings-open'); await page.locator('#settings-sound').uncheck(); await click('#settings-close');
          await checkSound(() => click('#adventure-check'), 0, 'muted scene');
          await click('#settings-open'); await page.locator('#settings-sound').check(); await click('#settings-close');
        } else await checkSound(() => click('#adventure-check'), last ? 3.2 : 2, `chapter ${chapter + 1}/scene ${index + 1}`);
        assert.equal((await state()).phase, 'solved');
        if (last) {
          await page.screenshot({ path: `output/completion-audio/${name}-chapter-${chapter + 1}.png`, fullPage: true });
          await checkSound(async () => { await page.goto(`${base}/index.html?adventure=${chapter + 1}`); await page.waitForFunction(() => window.render_game_to_text); }, 0, 'restore completed chapter');
          await checkSound(() => click('#adventure-next'), 0, 'read chapter ending');
        } else await checkSound(() => click('#adventure-next'), 0, 'next scene introduction');
      }
      if (chapter < ADVENTURES.length - 1) await checkSound(() => click('#adventure-finish'), 0, 'next chapter');
    }
    // The tutorial's worked failure and quiz are silent; a genuinely solved scene uses correct.wav.
    await page.goto(`${base}/index.html?tutorial=1`);
    const fillTutorial = async row => { for (const piece of row) await click(`#tutorial-pick-${piece}`); };
    await fillTutorial(['thief', 'coin', 'coin']);
    await checkSound(() => click('#tutorial-check'), 0, 'worked tutorial failure');
    await click('#tutorial-next'); await click('#tutorial-next');
    await checkSound(() => click('#tutorial-answer-elsewhere'), 0, 'tutorial quiz');
    await click('#tutorial-next'); await click('#tutorial-next');
    await click(`#tutorial-slot-${(await state()).window.besidePlace - 1}`);
    await fillTutorial(['thief', 'coin', 'coin']);
    await checkSound(() => click('#tutorial-check'), 2, 'tutorial scene win');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${name}: actual correct/fanfare audio on all daily levels and all eleven chapter scenes; mute, tutorial, failures, navigation and restore guards pass`);
  } finally { await browser.close(); }
}
