import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { seedFirstRunHandled } from './story-test-fixtures.mjs';
import { generateChallenge, HERO_CLASSES } from '../src/mastermind-core.js';
const base=(process.env.HERO_GUESSER_BASE_URL??'http://127.0.0.1:4180').replace(/\/$/,'');
await mkdir('output/overhaul',{recursive:true});
for(const [engine,type] of Object.entries({chromium,webkit})) {
 const browser=await type.launch();
 try {
  for(const [profile,width,height,locale,large] of [['desktop',1280,860,'en',false],['tablet',1024,768,'en',false],['phone',390,844,'en',false],['small',320,740,'en',false],['phone-pl',390,844,'pl',false],['large-pl',320,740,'pl',true],['landscape',844,390,'pl',false]]) {
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await seedFirstRunHandled(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
   await page.addInitScript(locale=>localStorage.setItem('heroguesser:language',locale),locale);await page.goto(base);
   if(large)await page.addStyleTag({content:'html { font-size:200%; }'});
   const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   const fits=async()=>{await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${engine}/${profile}: no overflow`);};
   assert.equal((await state()).mode,'daily');await page.locator('#mastermind-home-button').click();
   assert.equal(await page.locator('.home-choices button').first().getAttribute('id'),'home-play-daily');
   assert.ok(await page.locator('.home-choice-daily').evaluate(el=>el.getBoundingClientRect().top<document.querySelector('.home-choice-story').getBoundingClientRect().top));
   assert.equal(await page.locator('.home-choice-daily .home-choice-art').evaluate(el=>getComputedStyle(el).opacity),'1');
   await fits();await page.screenshot({path:`output/overhaul/${engine}-${profile}-home.png`,fullPage:true});await page.locator('#home-play-daily').click();
   for(const difficulty of ['easy','medium','hard','chaos']) {
    await page.locator(`[data-challenge=${difficulty}]`).click();const c=generateChallenge((await state()).date,difficulty);const absent=HERO_CLASSES.find(h=>!c.code.includes(h.id)).id;
    assert.equal(await page.locator('#hero-picker .hero-choice').count(),7);assert.equal(await page.locator('#hero-picker #daily-hint-button').count(),0);
    const sizes=await page.locator('.hero-choice > span:not(.portrait-frame), .guess-copy-row, .clue-card strong').evaluateAll(els=>els.map(e=>parseFloat(getComputedStyle(e).fontSize)));assert.ok(sizes.every(s=>s>=13));
    for(const hero of Array(c.size).fill(absent))await page.locator(`.hero-choice[data-hero=${hero}]`).click();await page.locator('#submit-button').click();await page.waitForTimeout(100);
    const latest = page.locator('#guess-history > li').first();
    const geometry = await latest.locator('.guess-tile').evaluateAll(tiles => tiles.map(tile => { const r = tile.getBoundingClientRect(); return { width: r.width, height: r.height }; }));
    assert.equal(geometry.length, c.size);
    assert.ok(geometry.every(tile => {
     const expectedHeight = width <= 760 ? Math.max(44, tile.width) : tile.width;
     return tile.width >= (width >= 1024 ? 48 : 30) && Math.abs(expectedHeight - tile.height) < 1;
    }), `${engine}/${profile}/${difficulty}: history portraits have square frames and a minimum phone tap height ${JSON.stringify(geometry)}`);
    assert.equal(await latest.locator('.feedback-score').count(), 3);
    assert.equal(await latest.locator('.feedback-words:visible').count(), 3);
    assert.ok(await latest.locator('.feedback-dot').evaluateAll(dots => dots.every(dot => dot.offsetWidth >= 14 && dot.offsetHeight >= 14)), 'feedback symbols cannot collapse');
    assert.equal((await state()).guesses.at(-1).absent,c.size);assert.ok(await page.locator('#feedback-explanation').isVisible());
    assert.ok(await page.evaluate(()=>document.querySelector('.board-panel').getBoundingClientRect().top>document.querySelector('#current-guess').getBoundingClientRect().bottom), 'history stays below the primary playing field');
    const flow = await page.evaluate(() => {
     const boxes = ['.picker-panel', '#current-guess', '.board-footer', '.board-panel'].map(selector => document.querySelector(selector).getBoundingClientRect().toJSON());
     const picker = document.querySelector('.picker-panel');
     return { boxes, domOrder: !!(picker.compareDocumentPosition(document.querySelector('#current-guess')) & Node.DOCUMENT_POSITION_FOLLOWING), pickerTops: [...document.querySelectorAll('#hero-picker .hero-choice')].map(el => el.getBoundingClientRect().top) };
    });
    assert.ok(flow.domOrder, 'picker comes before the formation for keyboard and screen-reader navigation');
    assert.ok(flow.boxes.every((box, index) => index === 0 || box.top >= flow.boxes[index - 1].bottom - 1), `${engine}/${profile}/${difficulty}: picker, formation, actions and history follow without interleaving`);
    if (width > 760) assert.ok(flow.pickerTops.every(top => Math.abs(top - flow.pickerTops[0]) < 1), 'desktop picker stays on one row above the slots');
    assert.equal(await page.locator('#board-heading.guild-ribbon, #picker-heading.guild-ribbon, #daily-title.guild-ribbon').count(),3);
    if(width<=760&&!large&&height>=740) {
     const geometry=await page.evaluate(()=>({feedback:document.querySelector('#guess-history > li').getBoundingClientRect().toJSON(),check:document.querySelector('#submit-button').getBoundingClientRect().toJSON(),vh:innerHeight}));
     assert.ok(geometry.feedback.top>=-1&&geometry.feedback.bottom<=geometry.vh+1,`${engine}/${profile}/${difficulty}: last checked guess visible beside controls ${JSON.stringify(geometry)}`);
     assert.ok(geometry.check.bottom<=geometry.vh+1,`${engine}/${profile}: Check visible`);
    }
    await fits();await page.screenshot({path:`output/overhaul/${engine}-${profile}-${difficulty}.png`,fullPage:true});
    for(const hero of c.code)await page.locator(`.hero-choice[data-hero=${hero}]`).click();await page.locator('#submit-button').click();await page.waitForTimeout(100);
    assert.equal((await state()).result,'solved');assert.ok(await page.locator('#daily-result').isVisible());assert.ok(await page.locator('#game-message').isVisible());assert.equal(await page.locator('.daily-dock').isVisible(),false);
    const badge = page.locator(`[data-challenge=${difficulty}] .difficulty-result`);
    assert.equal(await badge.innerText(), '✓ 2');
    assert.equal(await badge.getAttribute('data-medal'), 'gold');
    assert.equal(await page.locator('#result-medal').innerText(), locale === 'pl' ? 'Złoto' : 'Gold');
    await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async ({text})=>{window.shared=text}}));await page.locator('#share-result').click();assert.match(await page.evaluate(()=>window.shared),locale==='pl'?/Wskazówki: 0/:/Hints: 0/);
   }
   assert.equal(await page.locator('#next-puzzle').isVisible(),false);assert.ok((await state()).dailyProgress.every(c=>c.solved));
   await page.screenshot({path:`output/overhaul/${engine}-${profile}-solved.png`,fullPage:true});
   await page.locator('#mastermind-home-button').click();await page.locator('#home-play-stories').click();await page.locator('#start-adventure-0').click();await page.locator('#adventure-next').click();
   await page.keyboard.press('1');await page.keyboard.press('2');await page.keyboard.press('3');const before=(await state()).draft;await page.keyboard.press('Enter');assert.equal((await state()).guesses.length+(await state()).facts.length,1);assert.ok(before.every(Boolean));
   await fits();assert.deepEqual(errors,[]);await page.close();console.log(`${engine}/${profile}: Daily-first home, roster, all boards, visible feedback, results/sharing and Story keyboard pass`);
  }
  const missing = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await missing.route('**/assets/mastermind/*.webp', route => route.abort());
  await missing.goto(`${base}/?daily=1`); await missing.locator('[data-challenge=hard]').click();
  const challenge = generateChallenge(await missing.evaluate(()=>JSON.parse(render_game_to_text()).date), 'hard');
  for (const hero of challenge.code) await missing.locator(`.hero-choice[data-hero=${hero}]`).click();
  await missing.waitForFunction(()=>[...document.querySelectorAll('.portrait-fallback')].filter(e=>!e.hidden&&e.getBoundingClientRect().width).length>=7);
  assert.ok(await missing.locator('.portrait-fallback:visible').count() >= 7);
  await missing.locator('#submit-button').click(); assert.equal(await missing.evaluate(()=>JSON.parse(render_game_to_text()).result),'solved');
  await missing.screenshot({path:`output/overhaul/${engine}-missing-art.png`,fullPage:true}); await missing.close();
 }finally{await browser.close();}
}
