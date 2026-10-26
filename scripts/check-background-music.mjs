import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = (process.env.HERO_GUESSER_BASE_URL ?? 'http://127.0.0.1:4180').replace(/\/$/, '');
await mkdir('output/background-music', { recursive: true });
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    // The Python preview server lacks byte ranges. Supply them for real MP3 seeking in QA.
    await context.route('**/music/dungeon_melody_*.mp3', async route => {
      const filename = new URL(route.request().url()).pathname.split('/').at(-1);
      const bytes = await readFile(new URL(`../music/${filename}`, import.meta.url));
      const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range ?? '');
      const start = range ? Number(range[1]) : 0, end = range?.[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      const body = bytes.subarray(start, end + 1);
      await route.fulfill({ status: range ? 206 : 200, headers: {
        'content-type': 'audio/mpeg', 'accept-ranges': 'bytes', 'content-length': String(body.length),
        ...(range ? { 'content-range': `bytes ${start}-${end}/${bytes.length}` } : {}),
      }, body });
    });
    await context.addInitScript(() => {
      const create = AudioContext.prototype.createMediaElementSource;
      AudioContext.prototype.createMediaElementSource = function (element) {
        const source = create.call(this, element), connect = source.connect.bind(source);
        window.musicProbe = { element, context: this, analyser: this.createAnalyser() };
        source.connect = target => {
          musicProbe.gain = target; target.connect(musicProbe.analyser); return connect(target);
        };
        return source;
      };
    });
    const page = await context.newPage(), errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const click = selector => page.locator(selector).tap();
    const status = () => page.evaluate(() => window.musicProbe ? {
      src: musicProbe.element.src, paused: musicProbe.element.paused, time: musicProbe.element.currentTime,
      gain: musicProbe.gain.gain.value, state: musicProbe.context.state,
    } : null);
    const playing = () => page.waitForFunction(() => window.musicProbe && !musicProbe.element.paused && musicProbe.element.currentTime > 0.1 && musicProbe.context.state === 'running');
    const volume = async value => {
      await page.locator('#settings-music-volume').evaluate((input, value) => {
        input.value = String(value); input.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);
      assert.equal(await page.locator('#settings-music-percent').textContent(), `${value}%`);
      assert.ok(Math.abs((await status()).gain - value / 100) < 0.000001);
    };
    await page.goto(`${base}/index.html`);
    await page.waitForFunction(() => window.render_game_to_text);
    assert.equal(await status(), null, 'no playback or track download before interaction');
    assert.ok(!requests.some(url => url.endsWith('.mp3')));
    await click('#home-play-daily'); await playing();
    assert.equal((await status()).gain, 0.5, 'default music gain is 50%');
    await page.waitForFunction(() => {
      const data = new Float32Array(musicProbe.analyser.fftSize);
      musicProbe.analyser.getFloatTimeDomainData(data);
      return Math.max(...data.map(Math.abs)) > 0.00001;
    }, null, { timeout: 10000 });
    // Finish real tracks by seeking near their ends, exercising the actual ended event.
    const sequence = [];
    for (let i = 0; i < 7; i++) {
      await playing(); const current = (await status()).src; sequence.push(current);
      if (i === 6) break;
      await page.waitForFunction(() => Number.isFinite(musicProbe.element.duration));
      await page.evaluate(() => { musicProbe.element.currentTime = musicProbe.element.duration - 0.15; });
      await page.waitForFunction(previous => musicProbe.element.src !== previous, current);
    }
    assert.equal(new Set(sequence.slice(0, 6)).size, 6, 'every track plays once before reshuffling');
    assert.notEqual(sequence[5], sequence[6], 'shuffle cycles do not immediately repeat');
    await click('#settings-open');
    assert.equal(await page.locator('#settings-music').isChecked(), true);
    assert.equal(await page.locator('#settings-music-volume').inputValue(), '50');
    await volume(73); await volume(20); await volume(0);
    assert.equal((await status()).paused, true, 'zero volume pauses playback');
    await volume(73); await playing();
    await page.locator('#settings-sound').uncheck();
    assert.equal((await status()).paused, false, 'sound effects are independent');
    await page.locator('#settings-music').uncheck();
    assert.equal((await status()).paused, true);
    await click('#settings-close'); await page.reload();
    await click('#settings-open');
    assert.equal(await status(), null, 'disabled music stays silent across a new run');
    assert.equal(await page.locator('#settings-music').isChecked(), false);
    assert.equal(await page.locator('#settings-music-volume').inputValue(), '73');
    await page.locator('#settings-music').check(); await playing();
    assert.ok(Math.abs((await status()).gain - 0.73) < 0.000001);
    await click('#settings-close'); await page.reload();
    await click('#settings-open'); await playing();
    assert.equal(await page.locator('#settings-music-volume').inputValue(), '73', 'enabled volume also survives reload');
    await page.screenshot({ path: `output/background-music/${name}-settings-en.png`, fullPage: true });
    await click('#settings-close');
    const track = (await status()).src;
    await page.evaluate(() => dispatchEvent(new Event('heroguesser:background')));
    assert.equal((await status()).paused, true, 'native/background lifecycle pauses music');
    await page.evaluate(() => dispatchEvent(new Event('heroguesser:foreground'))); await playing();
    assert.equal((await status()).src, track, 'foreground resumes the same track');
    if (await page.locator('#mastermind-home-button').isVisible()) await click('#mastermind-home-button');
    await click('#home-play-tutorial');
    assert.equal((await status()).src, track, 'game modes share uninterrupted music');
    await click('#mastermind-home-button'); await click('#home-play-stories'); await click('#campaign-continue');
    assert.equal((await status()).src, track);
    await click('[data-locale="pl"]'); await click('#settings-open');
    assert.match(await page.locator('.settings-music').innerText(), /Muzyka w tle.*Głośność muzyki/s);
    await page.setViewportSize({ width: 320, height: 740 });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await page.locator('#settings-music-volume').scrollIntoViewIfNeeded();
    const bounds = await page.locator('#settings-music-volume').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 320, 'volume slider fits enlarged phone text');
    await page.screenshot({ path: `output/background-music/${name}-settings-pl-large.png`, fullPage: true });
    // Only the all-data reset restores the music defaults.
    await click('#reset-stories'); await click('#confirm-accept'); await page.waitForFunction(() => !document.querySelector('#settings-dialog'));
    await click('#settings-open'); assert.equal(await page.locator('#settings-music-volume').inputValue(), '73');
    await click('#reset-all'); await click('#confirm-accept'); await page.waitForFunction(() => !document.querySelector('#settings-dialog'));
    await click('#settings-open'); assert.equal(await page.locator('#settings-music-volume').inputValue(), '50');
    assert.equal(await page.locator('#settings-music').isChecked(), true);
    assert.deepEqual(errors, []);
    await context.close();
    // Malformed saved settings recover to the requested defaults.
    const invalid = await browser.newContext();
    await invalid.addInitScript(() => localStorage.setItem('heroguesser:music:v1', '{broken'));
    const recovery = await invalid.newPage(); await recovery.goto(`${base}/index.html`);
    await recovery.locator('#settings-open').click();
    assert.equal(await recovery.locator('#settings-music-volume').inputValue(), '50');
    assert.equal(await recovery.locator('#settings-music').isChecked(), true);
    await invalid.close();
    console.log(`${name}: actual music signal, six-track shuffle, 50% default, live volume/mute, persistence, independent effects, lifecycle, modes, resets and EN/PL large-text controls pass`);
  } finally { await browser.close(); }
}
