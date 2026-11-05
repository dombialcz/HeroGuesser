import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { warmupKey } from '../src/warmup.js';
const base=process.env.HERO_GUESSER_BASE_URL??'http://127.0.0.1:4180';
await mkdir('output/first-run',{recursive:true});
for(const [engine,type] of Object.entries({chromium,webkit})) {
 const browser=await type.launch();
 try {
  for(const [profile,width,height,locale,large] of [['desktop',1280,860,'en',false],['phone',390,844,'en',false],['small',320,740,'pl',false],['large',320,740,'pl',true]]) {
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}); const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(locale=>localStorage.setItem('heroguesser:language',locale),locale);
   const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   await page.goto(base); if(large) await page.addStyleTag({content:'html { font-size:200% }'});
   assert.equal((await state()).mode,'warmup'); assert.equal((await state()).warmupStage,'example'); assert.equal(await page.locator('#first-run-dialog').count(),0);
   await page.locator('#help-open').click(); await page.locator('#help-close').click();
   await page.locator('#settings-open').click();await page.locator('#settings-help').click();await page.locator('#help-close').click();
   await page.locator('#submit-button').click();assert.deepEqual((await state()).guesses[0],{heroes:['knight','thief','cleric'],exact:1,misplaced:1,absent:1});
   assert.deepEqual((await state()).draft,[null,null,null]);assert.ok(await page.locator('.suggested-action').isVisible());
   await page.locator('#last-check-copy').click();assert.deepEqual((await state()).draft,['knight','thief','cleric']);
   await page.locator('#current-guess [data-slot="1"]').click();await page.reload();assert.equal((await state()).draft[1],null);
   await page.locator('#clear-button').click();for(const hero of ['knight','bard','thief'])await page.locator(`.hero-choice[data-hero="${hero}"]`).click();
   await page.locator('#submit-button').click();assert.equal((await state()).warmupStage,'complete');
   assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('heroguesser:story:'))),false);
   await page.screenshot({path:`output/first-run/${engine}-${profile}-complete.png`,fullPage:true});
   await page.locator('#next-puzzle').click();assert.equal((await state()).difficulty,'easy');assert.equal((await state()).mode,'daily');
   await page.locator('[data-challenge=medium]').click();await page.reload();assert.equal((await state()).difficulty,'medium');
   await page.locator('#help-open').click();await page.locator('#help-warmup').click();await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='warmup');assert.equal((await state()).warmupStage,'example');
   await page.locator('#warmup-skip').click();await page.reload();assert.equal((await state()).mode,'daily');
   await page.locator('#settings-open').click();await page.locator('#reset-dailies').click();await page.locator('#confirm-accept').click();assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).status,warmupKey),'skipped');
   await page.locator('#settings-open').click();await page.locator('#reset-all').click();await page.locator('#confirm-accept').click();await page.waitForFunction(()=>!document.querySelector('#settings-dialog'));await page.reload();assert.equal((await state()).mode,'warmup');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);await page.close();console.log(`${engine}/${profile}: worked example, copy/edit/resume, solve/skip/replay, help, defaults and resets pass`);
  }
  for(const [key,value] of [['heroguesser:onboarding:v1','{"schema":1,"choice":"skipped"}'],['heroguesser:v1:2026-11-03:easy','{"guesses":[],"draft":[null,null,null,null,null]}'],['heroguesser:story:campaign:v1','{}']]) {
   const p=await browser.newPage();await p.addInitScript(({key,value})=>localStorage.setItem(key,value),{key,value});await p.goto(base);assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).mode),'daily');await p.close();
  }
  const p=await browser.newPage();await p.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=Storage.prototype.removeItem=()=>{throw Error('Unavailable')};});await p.goto(base);await p.locator('#submit-button').click();await p.locator('#warmup-skip').click();assert.ok(await p.locator('#storage-warning').isVisible());await p.close();
 }finally{await browser.close();}
}
