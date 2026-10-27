import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
await mkdir('output/placement-audio', { recursive: true });
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await context.addInitScript(() => {
      window.audioStarts = [];
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...args) {
        const samples = this.buffer.getChannelData(0);
        const entry = { duration: this.buffer.duration, rate: this.playbackRate.value, signature: Array.from(samples.slice(2400, 2410)), state: this.context.state, signal: 0 };
        window.audioStarts.push(entry);
        // Measure the rendered signal, in addition to checking that start() was called.
        const analyser = this.context.createAnalyser();
        this.connect(analyser);
        for (const delay of [15, 40, 70, 100, 150, 200]) setTimeout(() => {
          const data = new Float32Array(analyser.fftSize);
          analyser.getFloatTimeDomainData(data);
          entry.signal = Math.max(entry.signal, ...data.map(Math.abs));
          if (delay === 200) analyser.disconnect();
        }, delay);
        return start.apply(this, args);
      };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${base}/index.html?daily=1`);
    await page.waitForFunction(() => window.render_game_to_text);
    const click = selector => page.locator(selector).tap();
    const count = () => page.evaluate(() => audioStarts.length);
    const expectSound = async (action, label) => {
      const before = await count();
      await action();
      try { await page.waitForFunction(expected => audioStarts.length === expected, before + 1, { timeout: 5000 }); }
      catch (error) { throw new Error(`${name}/${label}: expected one sound; starts=${JSON.stringify(await page.evaluate(() => audioStarts))}`, { cause: error }); }
      await page.waitForTimeout(250);
      const sound = await page.evaluate(() => audioStarts.at(-1));
      assert.equal(sound.state, 'running', `${label}: device unlocked`);
      assert.ok(sound.signal > 0.001, `${label}: rendered nonzero audio`);
      return sound;
    };
    const expectSilence = async (action, label) => {
      const before = await count(); await action(); await page.waitForTimeout(220);
      assert.equal(await count(), before, label);
    };
    await expectSound(() => click('.hero-choice[data-hero="knight"]'), 'first placement');
    await expectSound(() => click('.hero-choice[data-hero="thief"]'), 'second placement');
    const removal = await expectSound(() => click('.row-active [data-slot="0"]'), 'daily removal');
    assert.ok(Math.abs(removal.rate - 1.8) < 0.000001, 'removal plays faster');
    assert.ok(removal.duration / removal.rate < 0.2, 'removal is a short reversed effect');
    await expectSilence(() => click('.row-active [data-slot="0"]'), 'empty-place selection is silent');
    await expectSound(() => click('.hero-choice[data-hero="bard"]'), 'refill');
    await expectSound(async () => {
      await page.locator('#mastermind-home-button').focus();
      await page.keyboard.press('Tab');
      await page.evaluate(() => document.activeElement.blur());
      await page.keyboard.press('1');
    }, 'keyboard placement');
    // Actual pointer hold/drop: one effect on commit, none on same-place drop.
    const drag = async (from, to) => {
      await page.evaluate(() => document.getAnimations().forEach(animation => animation.finish()));
      const source = page.locator(`.row-active [data-slot="${from}"]`);
      await source.scrollIntoViewIfNeeded();
      const a = await source.boundingBox(), b = await page.locator(`.row-active [data-slot="${to}"]`).boundingBox();
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
      await page.waitForTimeout(300);
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 5 }); await page.mouse.up();
    };
    await expectSound(() => drag(0, 4), 'drag move');
    await expectSilence(() => drag(4, 4), 'same-place drop is silent');
    await click('#clear-button');
    // Repeated placements use real decoded variants without adjacent repetition.
    await page.evaluate(() => { let variant = 0; Math.random = () => (variant++ % 7) / 7; });
    for (let i = 0; i < 21; i++) {
      if (i > 0 && i % 5 === 0) await click('#clear-button');
      await expectSound(() => click('.hero-choice[data-hero="knight"]'), `variant ${i}`);
      if (i === 4) await expectSilence(() => click('.hero-choice[data-hero="thief"]'), 'full row rejects placement silently');
    }
    await expectSilence(() => click('#clear-button'), 'clear is silent');
    const starts = await page.evaluate(() => audioStarts.filter(sound => sound.rate === 1));
    for (let i = 1; i < starts.length; i++) assert.notDeepEqual(starts[i].signature, starts[i - 1].signature, 'no consecutive variant repeats');
    assert.equal(new Set(starts.map(sound => JSON.stringify(sound.signature))).size, 7, 'all seven real variants used');
    await click('#settings-open'); await page.locator('#settings-sound').uncheck(); await click('#settings-close');
    await expectSilence(() => click('.hero-choice[data-hero="knight"]'), 'muted placement');
    await expectSilence(() => click('.row-active [data-slot="0"]'), 'muted removal');
    await page.reload();
    await click('#settings-open'); assert.equal(await page.locator('#settings-sound').isChecked(), false, 'mute persists');
    await page.locator('#settings-sound').check(); await click('#settings-close');
    await expectSound(() => click('.hero-choice[data-hero="thief"]'), 'unmute');
    await page.goto(`${base}/index.html?tutorial=1`);
    await expectSound(() => click('#tutorial-pick-thief'), 'tutorial placement');
    await expectSilence(() => click('#tutorial-pick-thief'), 'rejected tutorial duplicate');
    await expectSound(() => click('#tutorial-pick-coin'), 'tutorial coin placement');
    assert.ok(Math.abs((await expectSound(() => click('#tutorial-slot-0'), 'tutorial removal')).rate - 1.8) < 0.000001);
    await expectSilence(() => click('#tutorial-slot-0'), 'empty tutorial place');
    await expectSound(() => click('#tutorial-pick-thief'), 'tutorial refill');
    await page.screenshot({ path: `output/placement-audio/${name}-tutorial.png`, fullPage: true });
    await click('#mastermind-home-button'); await click('#home-play-stories'); await click('#start-adventure-0'); await click('#adventure-next');
    await expectSound(() => click('#adventure-pick-thief'), 'story placement');
    await expectSilence(() => click('#adventure-pick-thief'), 'rejected story duplicate');
    await expectSound(() => click('#adventure-pick-knight'), 'story knight');
    assert.ok(Math.abs((await expectSound(() => click('#adventure-slot-0'), 'story removal')).rate - 1.8) < 0.000001);
    await expectSilence(() => click('#adventure-slot-0'), 'empty story place');
    await expectSound(() => click('#adventure-pick-thief'), 'story refill');
    await page.screenshot({ path: `output/placement-audio/${name}-story.png`, fullPage: true });
    await page.reload();
    await page.waitForTimeout(250); assert.equal(await count(), 0, 'restoring a save is silent');
    await click('[data-locale="pl"]'); await click('#settings-open');
    assert.match(await page.locator('label:has(#settings-sound)').innerText(), /Efekty dźwiękowe/);
    await page.screenshot({ path: `output/placement-audio/${name}-settings-pl.png`, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`${name}: real placement/reversed-removal audio, variation, keyboard/touch/drag, silent no-ops, mute persistence and all three modes pass`);
    await context.close();
    // An unavailable audio device must leave all gameplay operational.
    const silent = await browser.newContext();
    await silent.addInitScript(() => { window.AudioContext = undefined; window.webkitAudioContext = undefined; });
    const fallback = await silent.newPage();
    await fallback.goto(`${base}/index.html?daily=1`);
    await fallback.locator('.hero-choice[data-hero="knight"]').click();
    assert.equal(await fallback.evaluate(() => JSON.parse(render_game_to_text()).draft[0]), 'knight');
    await silent.close();
  } finally { await browser.close(); }
}
