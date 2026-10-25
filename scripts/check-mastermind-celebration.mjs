const BASE_URL = (process.env.HERO_GUESSER_BASE_URL ?? "http://127.0.0.1:4180").replace(/\/$/, "");
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { generateChallenge } from "../src/mastermind-core.js";
import { ADVENTURES } from "../src/mastermind-adventure-core.js";
const output = "output/mastermind-celebration";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, width, height, reduced, locale, large] of [
    ["desktop", 1440, 1000, false, "en", false], ["phone", 390, 844, false, "en", false],
    ["small-phone", 320, 740, false, "pl", false], ["landscape", 844, 390, false, "en", false],
    ["reduced", 390, 844, true, "en", false], ["pl-large-reduced", 320, 740, true, "pl", true],
  ].filter(([name]) => !process.argv[2] || process.argv[2] === name)) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 500, isMobile: width < 500, reducedMotion: reduced ? "reduce" : "no-preference" });
    await context.addInitScript(locale => localStorage.setItem("heroguesser:language", locale), locale);
    const page = await context.newPage(), errors = [], requests = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => requests.push(r.url()));
    page.on("requestfailed", r => { if (r.url().startsWith(`${BASE_URL}/`)) errors.push(`${r.url()}: ${r.failure()?.errorText}`); });
    page.on("response", r => { if (r.url().startsWith(`${BASE_URL}/`) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
    const click = selector => width < 500 ? page.locator(selector).tap() : page.locator(selector).click();
    async function goto(url) {
      await page.goto(url); await page.waitForFunction(() => window.render_game_to_text);
      if (large) await page.addStyleTag({ content: "html { font-size: 200%; }" });
      await page.evaluate(() => document.fonts.ready);
    }
    async function checkCelebration(kind, suffix) {
      const snapshot = (await state()).celebration;
      assert.equal(snapshot.active, true); assert.equal(snapshot.kind, kind);
      assert.equal(snapshot.reducedMotion, reduced);
      assert.equal(snapshot.particles, reduced ? 0 : width < 700 ? 42 : 68);
      assert.equal(await page.locator(".mastermind-celebration").count(), 1);
      assert.equal(await page.locator(".mastermind-celebration").getAttribute("aria-hidden"), "true");
      assert.equal(await page.locator(".mastermind-celebration").evaluate(e => getComputedStyle(e).pointerEvents), "none");
      assert.equal(await page.evaluate(() => !!document.activeElement?.closest(".mastermind-celebration")), false);
      assert.match(await page.locator(".celebration-copy strong").textContent(), locale === "en" ? /discovered|solved/ : /odkry/);
      if (!reduced) await page.evaluate(() => {
        document.querySelector(".mastermind-celebration").getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = 800; });
      });
      else assert.equal(await page.locator(".mastermind-celebration").evaluate(e => e.getAnimations({ subtree: true }).length), 0);
      await page.screenshot({ path: `${output}/${name}-${suffix}.png` });
      const bounds = await page.locator(".celebration-card").boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `${name}: badge fits viewport ${JSON.stringify(bounds)}`);
      assert.ok(await page.evaluate(width => innerWidth <= width && document.documentElement.scrollWidth <= width, width), `${name}: no viewport widening`);
    }
    await goto(`${BASE_URL}/index.html?daily=1`);
    const dailyFill = async pieces => { for (const p of pieces) await click(`.hero-choice[data-hero="${p}"]`); };
    assert.equal((await state()).celebration.active, false);
    await page.locator("#daily-title").focus(); await page.keyboard.press("Enter");
    assert.equal((await state()).celebration.active, false, "incomplete row does not celebrate");
    await dailyFill(Array(5).fill("knight")); await click("#submit-button");
    assert.equal((await state()).celebration.active, false, "wrong row does not celebrate");
    await dailyFill(generateChallenge((await state()).date, "easy").code); await click("#submit-button");
    assert.equal((await state()).result, "solved"); const guesses = (await state()).guesses;
    await checkCelebration("daily", "daily-win");
    // Re-rendering the daily board keeps the same flourish; it cannot retrigger a win.
    await page.evaluate(() => { window.__previousWinLayer = document.querySelector(".mastermind-celebration"); window.advanceTime(16); });
    assert.equal(await page.evaluate(() => window.__previousWinLayer === document.querySelector(".mastermind-celebration")), true);
    assert.deepEqual((await state()).guesses, guesses);
    await page.keyboard.press("Escape"); assert.equal((await state()).celebration.active, false);
    await page.reload(); assert.equal((await state()).result, "solved"); assert.equal((await state()).celebration.active, false, "restored solve is quiet");
    for (const difficulty of ["medium", "hard"]) {
      await click(`[data-challenge="${difficulty}"]`); await dailyFill(generateChallenge((await state()).date, difficulty).code); await click("#submit-button");
      assert.equal((await state()).celebration.active, true, `${difficulty} has a new win`);
      if (difficulty === "medium") { await page.evaluate(() => window.advanceTime(5000)); assert.equal((await state()).celebration.active, false, "flourish expires"); }
      else { await click("#mastermind-home-button"); assert.equal(await page.locator(".mastermind-celebration").count(), 0, "Home works during confetti"); }
    }
    await goto(`${BASE_URL}/index.html?adventure=3`);
    const sceneFill = async pieces => { for (const p of pieces) await click(`#adventure-pick-${p}`); };
    for (let index = 0; index < 3; index++) {
      await click("#adventure-next");
      assert.equal((await state()).celebration.active, false);
      const answer = ADVENTURES[2].scenes[index].solution;
      if (index === 0) {
        await sceneFill(["king", "knight", "knight"]); await click("#adventure-check");
        assert.equal((await state()).celebration.active, false, "failed scenario row is quiet");
      }
      await sceneFill(answer); await click("#adventure-check");
      assert.equal((await state()).phase, "solved"); assert.deepEqual((await state()).guesses, []);
      await checkCelebration("scene", `scene-${index + 1}-win`);
      assert.equal(await page.evaluate(() => document.activeElement.id), "adventure-guide-title");
      await click("#adventure-next"); assert.equal((await state()).celebration.active, false, "Continue works during confetti");
    }
    assert.equal((await state()).phase, "complete");
    // A locale change and a new run should cancel a celebration instead of replaying it.
    await click("#adventure-restart"); await click("#adventure-next");
    await sceneFill(ADVENTURES[2].scenes[0].solution); await click("#adventure-check");
    await page.locator(`[data-locale="${locale === "en" ? "pl" : "en"}"]`).click();
    assert.equal((await state()).celebration.active, false);
    assert.equal((await state()).phase, "solved");
    assert.ok(!requests.some(url => /doubleclick|googlesyndication|admob/.test(url)), "no ad requests");
    assert.deepEqual(errors, []); await context.close();
    console.log(`${name}: all daily wins, story wins, failed/incomplete guards, no replay, focus/click-through, reduced motion, cleanup and no ads pass`);
  }
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto(`${BASE_URL}/index.html?tutorial=1`);
  const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
  const click = id => page.locator(`#${id}`).click();
  const fill = async row => { for (const p of row) await click(`tutorial-pick-${p}`); };
  await fill(["thief", "coin", "coin"]); await click("tutorial-check");
  assert.equal((await state()).celebration.active, false, "the deliberately failed example is quiet");
  await click("tutorial-next"); await click("tutorial-next"); await click("tutorial-answer-elsewhere");
  assert.equal((await state()).celebration.active, false, "quiz answer is not a puzzle win");
  await click("tutorial-next"); await click("tutorial-next");
  await click(`tutorial-slot-${(await state()).window.besidePlace - 1}`); await fill(["thief", "coin", "coin"]); await click("tutorial-check");
  assert.equal((await state()).celebration.active, true);
  await click("tutorial-next"); assert.equal((await state()).celebration.active, false); await click("tutorial-next");
  await click("tutorial-slot-1"); await fill(["coin", "thief"]); await click("tutorial-check"); assert.equal((await state()).celebration.active, true);
  await click("tutorial-next"); await click("tutorial-next");
  for (let pos = 0; pos < 4; pos++) {
    await fill(Array.from({ length: 4 }, (_, i) => i === pos ? "thief" : "knight")); await click("tutorial-check");
    if ((await state()).phase === "complete") break;
    assert.equal((await state()).celebration.active, false);
  }
  assert.equal((await state()).phase, "complete"); assert.equal((await state()).celebration.active, true);
  await click("tutorial-restart"); assert.equal((await state()).celebration.active, false);
  await page.close(); console.log("Tutorial: every solved scene celebrates; worked failure, quiz, next and restart stay correct");
} finally { await browser.close(); }
