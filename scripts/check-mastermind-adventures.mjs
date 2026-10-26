const BASE_URL = (process.env.HERO_GUESSER_BASE_URL ?? "http://127.0.0.1:4180").replace(/\/$/, "");
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";
import { ADVENTURES } from "../src/mastermind-adventure-core.js";
const handoffOnly = process.argv.includes("--handoff-only");
const controlsOnly = process.argv.includes("--controls-only");
for (const [engine, browserType] of Object.entries({ chromium, webkit }).filter(([name]) => !process.argv.includes('--webkit-only') || name === 'webkit')) {
const output = `output/mastermind-adventures/${engine}`;
await mkdir(output, { recursive: true });
console.log(`Stories: ${engine}`);
const browser = await browserType.launch({ headless: true });
try {
  for (const [name, width, height, locale, large] of [
    ["desktop", 1440, 1000, "en", false], ["phone", 390, 844, "en", false],
    ["small-phone", 320, 740, "en", false], ["landscape", 844, 390, "en", false],
    ["pl-large", 320, 740, "pl", true], ["en-large", 390, 844, "en", true],
  ].filter(() => !handoffOnly && !controlsOnly)) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 500, isMobile: width < 500, reducedMotion: "reduce" });
    const page = await context.newPage(), errors = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("response", r => { if (r.url().startsWith(`${BASE_URL}/`) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.addInitScript(locale => localStorage.setItem("heroguesser:language", locale), locale);
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForFunction(() => window.render_game_to_text);
    if (large) await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await page.evaluate(() => document.fonts.ready);
    const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
    const click = async selector => {
      if (selector.startsWith("#start-adventure") && !await page.locator(selector).isVisible()) {
        if (await page.locator("#mastermind-home-button").isVisible()) await page.locator("#mastermind-home-button").click();
        await page.locator("#home-play-stories").click();
      }
      await (width < 500 ? page.locator(selector).tap() : page.locator(selector).click());
      if (selector.startsWith("#confirm-")) await page.waitForFunction(() => !document.querySelector(".game-dialog"));
    };
    const pick = p => click(`#adventure-pick-${p}`);
    const fill = async row => { for (const p of row) await pick(p); };
    const next = () => click("#adventure-next");
    const check = () => click("#adventure-check");
    const screenshot = async suffix => {
      await page.waitForFunction(() => [...document.querySelectorAll("#mastermind-adventure img")].every(i => i.complete && i.naturalWidth));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}/${suffix}: no overflow`);
      await page.screenshot({ path: `${output}/${name}-${suffix}.png`, fullPage: true });
    };
    const dailyBefore = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([k]) => k.startsWith("heroguesser:v1:"))));
    await click("#home-play-stories");
    assert.equal(await page.locator("#mastermind-adventure-entry .story-button").count(), 4);
    assert.equal(await page.locator("#mastermind-adventure-entry .story-text-button").count(), 0);
    const buttonStyles = await page.locator(".adventure-story-button").evaluateAll(buttons => buttons.map(b => ({ border: getComputedStyle(b).borderRadius, minHeight: getComputedStyle(b).minHeight })));
    assert.ok(buttonStyles.every(style => JSON.stringify(style) === JSON.stringify(buttonStyles[0])), "all story choices have identical button styling");
    await page.waitForFunction(() => [...document.querySelectorAll(".adventure-story-button img")].every(i => i.complete && i.naturalWidth));
    await page.screenshot({ path: `${output}/${name}-four-story-menu.png`, fullPage: true });
    for (let i = 1; i < 4; i++) assert.equal(await page.locator(`#start-adventure-${i}`).isDisabled(), true);
    await click("#campaign-continue");
    assert.equal((await state()).phase, "intro");
    assert.equal(await page.locator("#mastermind-tutorial-entry").isVisible(), false);
    await next(); assert.equal(await page.evaluate(() => document.activeElement.id), "adventure-slot-0");
    assert.equal(await page.locator("#adventure-check").isDisabled(), true);
    await pick("thief"); await pick("thief"); assert.ok((await state()).notice);
    await click("#adventure-clear"); await click("#adventure-undo"); assert.equal((await state()).draft[0], "thief");
    await click("#adventure-clear");
    await click("#adventure-hint"); await click("#adventure-hint");
    assert.equal((await state()).hintsShown, 2);
    await fill(["knight", "ale", "thief"]); await screenshot("wrong-draft"); await check();
    let s = await state(); assert.deepEqual(s.draft, [null, null, null]); assert.equal(s.guesses.length, 1);
    assert.equal(await page.evaluate(() => document.activeElement.id), "adventure-result-heading");
    assert.equal(await page.locator("#adventure-undo").count(), 0);
    assert.match(await page.locator("#adventure-announcement").textContent(), /place|miejsce/);
    await fill(["knight", "ale", "thief"]); await check();
    assert.equal((await state()).guesses.length, 2);
    assert.equal(await page.locator(".story-history .story-attempt").count(), 1);
    await screenshot("feedback");
    await fill(ADVENTURES[0].scenes[0].solution); await check();
    assert.equal((await state()).phase, "solved"); assert.equal((await state()).guesses.length, 0); assert.equal((await state()).facts.length, 1);
    await next(); assert.equal((await state()).scene, 2);
    for (let i = 1; i < 3; i++) {
      await next(); await fill(ADVENTURES[0].scenes[i].solution); await screenshot(i === 1 ? "tavern" : "zombies");
      if (i === 2 && !large) {
        const sizes = await page.locator(".row-active .story-tile").evaluateAll(els => els.map(el => el.getBoundingClientRect().width));
        assert.ok(sizes.every(w => w >= 44), `${name}: active targets at least 44px: ${sizes}`);
      }
      await check(); await next();
    }
    assert.equal((await state()).phase, "complete"); assert.equal((await state()).facts.length, 3); await screenshot("tavern-complete");
    await click("#adventure-finish"); assert.equal((await state()).adventure, "sleepless-court");
    assert.equal((await state()).facts.length, 0);
    for (let i = 0; i < 2; i++) {
      await next(); await fill(ADVENTURES[1].scenes[i].solution); await screenshot(i === 0 ? "mage" : "court"); await check(); await next();
    }
    assert.equal((await state()).phase, "complete"); assert.equal((await state()).facts.length, 2); await screenshot("court-complete");
    for (const chapter of [2, 3]) {
      await click("#adventure-finish");
      assert.equal((await state()).adventure, ADVENTURES[chapter].id);
      assert.equal((await state()).facts.length, 0);
      for (let i = 0; i < ADVENTURES[chapter].scenes.length; i++) {
        await next();
        const answer = ADVENTURES[chapter].scenes[i].solution;
        if (i === 0) {
          if (chapter === 2) {
            await page.locator("#adventure-slot-0").focus(); await page.keyboard.press("1"); assert.equal((await state()).draft[0], "king");
            await pick("king"); assert.ok((await state()).notice); await click("#adventure-clear");
          }
          await click("#adventure-hint"); await click("#adventure-hint");
          await fill([...answer.slice(1), answer[0]]); await check(); assert.equal((await state()).guesses.length, 1);
          assert.ok((await state()).draft.every(p => p === null));
        }
        assert.ok(await page.locator('.story-lesson').textContent());
        assert.equal(await page.locator('.story-reasoning').count(), 0, 'explanations wait for a solve');
        // Every advertised number shortcut works, including pieces 5 and 6.
        const available = (await state()).availablePieces;
        if (available.length > 4) {
          await page.locator('#adventure-slot-0').focus();
          await page.keyboard.press(String(available.length));
          assert.equal((await state()).draft[0], available.at(-1));
          await click('#adventure-clear');
        }
        await fill(answer); await screenshot(ADVENTURES[chapter].scenes[i].id);
        const sizes = await page.locator('.row-active .story-tile').evaluateAll(els => els.map(el => el.getBoundingClientRect().width));
        assert.ok(sizes.every(w => w >= 44), `${engine}/${name}: six-place targets stay at least 44px: ${sizes}`);
        if (answer.includes("bell")) {
          assert.match(await page.locator(`#adventure-slot-${answer.indexOf("bell")}`).getAttribute("aria-label"), locale === "en" ? /Cursed Bell/ : /Przeklęty dzwon/);
          assert.equal(await page.locator('.row-active img[src$="bell.svg"]').count(), 1);
        }
        await check(); assert.equal((await state()).phase, "solved"); assert.equal((await state()).guesses.length, 0);
        assert.equal((await state()).facts.length, i + 1);
        await click('.story-reasoning summary');
        assert.ok(await page.locator('.story-reasoning p').isVisible());
        assert.ok(await page.locator('.story-reasoning p').textContent());
        await next();
      }
      assert.equal((await state()).phase, "complete"); await screenshot(`${ADVENTURES[chapter].id}-complete`);
    }
    await click("#adventure-finish"); assert.equal((await state()).mode, "stories");
    assert.equal(await page.locator("#mastermind-daily").isVisible(), false);
    await click("#start-adventure-0");
    await click("#adventure-restart"); await click("#confirm-accept"); await next();
    for (let n = 0; n < 7; n++) { await fill(["knight", "ale", "thief"]); await check(); }
    assert.equal((await state()).phase, "play"); assert.equal((await state()).guesses.length, 7);
    await screenshot("unlimited-attempts");
    await pick("ale"); await click("#adventure-restart"); await click("#confirm-cancel");
    assert.equal((await state()).draft[0], "ale");
    await click("#adventure-restart"); await click("#confirm-accept"); assert.equal((await state()).phase, "intro");
    await next(); await pick("ale");
    await page.reload(); await page.waitForFunction(() => window.render_game_to_text);
    assert.equal((await state()).mode, "home");
    await click("#start-adventure-0"); assert.equal((await state()).draft[0], "ale");
    await click("#adventure-exit"); await click("#start-adventure-1");
    await click("#adventure-restart"); await click("#confirm-accept"); await next(); await pick("mage");
    await page.evaluate(() => { dispatchEvent(new Event("pagehide")); dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })); });
    assert.equal((await state()).phase, "play"); assert.equal((await state()).draft[0], "mage");
    assert.equal(await page.locator("#mastermind-tutorial-entry").isVisible(), false);
    await click("#adventure-exit");
    const dailyAfter = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([k]) => k.startsWith("heroguesser:v1:"))));
    assert.deepEqual(dailyAfter, dailyBefore);
    assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith("heroguesser:story:v1:")).length), 4);
    assert.deepEqual(errors, []); await context.close(); console.log(`${name}: all four stories, unlimited attempts, hints, undo, resume lifecycle, isolated daily saves passed`);
  }
  // Actual keyboard and pointer movement use the same controls as the tutorial.
  // CDP supplies real touch drags only in Chromium; WebKit still exercises
  // mouse drags here and native touch taps in every mobile gameplay profile.
  for (const touch of [false, true].filter(touch => !handoffOnly && (!touch || engine === 'chromium'))) {
    const context = await browser.newContext({ viewport: { width: touch ? 390 : 1280, height: 900 }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage(); await page.goto(`${BASE_URL}/index.html?adventure=1`);
    await page.waitForFunction(() => window.render_game_to_text);
    await page.locator("#adventure-next").click();
    const snapshot = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
    await page.locator("#adventure-slot-2").focus(); await page.keyboard.press("1"); assert.equal((await snapshot()).draft[2], "thief");
    await page.locator("#adventure-pick-ale").click(); await page.locator("#adventure-pick-knight").click();
    const a = page.locator("#adventure-slot-2"), b = page.locator("#adventure-slot-0");
    await a.scrollIntoViewIfNeeded(); const from = await a.boundingBox(), to = await b.boundingBox();
    const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 }, end = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
    if (touch) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] }); await page.waitForTimeout(320);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [end] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.waitForTimeout(320); await page.mouse.move(end.x, end.y, { steps: 6 }); await page.mouse.up();
    }
    assert.deepEqual((await snapshot()).draft, ["thief", "knight", "ale"]);
    await page.locator("#adventure-slot-0").click(); assert.equal((await snapshot()).draft[0], null);
    await context.close(); console.log(`${touch ? "touch" : "mouse"}: real hold-drag and keyboard passed`);
  }
  const context = await browser.newContext(); const page = await context.newPage();
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw Error("unavailable"); }; Storage.prototype.getItem = () => { throw Error("unavailable"); }; });
  await page.goto(`${BASE_URL}/index.html?adventure=1`);
  await page.locator("#adventure-next").click(); assert.equal(await page.locator(".row-active .story-tile").count(), 3);
  await context.close(); console.log("Storage unavailable: adventure works");
  const deepLinks = await browser.newPage();
  for (const chapter of [3, 4]) {
    await deepLinks.goto(`${BASE_URL}/index.html?adventure=${chapter}`);
    await deepLinks.waitForFunction(() => window.render_game_to_text);
    const snapshot = await deepLinks.evaluate(() => JSON.parse(window.render_game_to_text()));
    assert.equal(snapshot.mode, "stories"); assert.equal(snapshot.campaign.chapters[chapter - 1].locked, true);
    assert.equal(await deepLinks.locator("#adventure-next").count(), 0);
    await deepLinks.locator("#mastermind-home-button").click(); assert.equal(new URL(deepLinks.url()).search, "");
  }
  await deepLinks.close(); console.log("New chapter deep links and Home cleanup passed");
  const handoff = await browser.newPage();
  await handoff.goto(`${BASE_URL}/index.html?tutorial=1`);
  const click = id => handoff.locator(`#${id}`).click();
  const state = () => handoff.evaluate(() => JSON.parse(window.render_game_to_text()));
  const fill = async row => { for (const p of row) await click(`tutorial-pick-${p}`); };
  await fill(["thief", "coin", "coin"]); await click("tutorial-check");
  await click("tutorial-next"); await click("tutorial-next"); await click("tutorial-answer-elsewhere");
  await click("tutorial-next"); await click("tutorial-next");
  await click(`tutorial-slot-${(await state()).window.besidePlace - 1}`); await fill(["thief", "coin", "coin"]); await click("tutorial-check");
  await click("tutorial-next"); await click("tutorial-next");
  await click("tutorial-slot-1"); await fill(["coin", "thief"]); await click("tutorial-check");
  await click("tutorial-next"); await click("tutorial-next");
  for (let pos = 0; pos < 4; pos++) {
    await fill(Array.from({ length: 4 }, (_, i) => i === pos ? "thief" : "knight")); await click("tutorial-check");
    if ((await state()).phase === "complete") break;
  }
  assert.equal(await handoff.locator("#tutorial-adventure").isVisible(), true);
  await handoff.keyboard.press("Enter"); assert.equal((await state()).adventure, "last-round");
  assert.equal(await handoff.locator("#mastermind-tutorial").isVisible(), false);
  assert.equal(await handoff.locator("#mastermind-tutorial-entry").isVisible(), false);
  await click("adventure-next"); await click("adventure-pick-thief");
  await handoff.locator('[data-locale="pl"]').click(); assert.equal((await state()).locale, "pl"); assert.equal((await state()).draft[0], "thief");
  await handoff.reload(); assert.equal((await state()).phase, "setup");
  await handoff.close(); console.log("Tutorial-to-adventure handoff, locale switch and reload reset passed");
} finally { await browser.close(); }

}
