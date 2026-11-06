import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {mkdir} from 'node:fs/promises';
const base=process.env.HERO_GUESSER_BASE_URL??'http://127.0.0.1:4180';await mkdir('output/mastermind-mobile-scroll',{recursive:true});
for(const [engine,type] of Object.entries({chromium,webkit})) {
 const browser=await type.launch();try {
  for(const width of [320,390])for(const count of [0,1,8,30]) {
   const page=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`${base}/?daily=1`);
   await page.evaluate(count=>{const {date}=JSON.parse(render_game_to_text());localStorage.setItem(`heroguesser:v1:${date}:easy`,JSON.stringify({guesses:Array.from({length:count},()=>Array(5).fill('knight')),draft:Array(5).fill(null)}));},count);await page.reload();
   await page.locator('#current-guess').scrollIntoViewIfNeeded();
   for(let i=0;i<5;i++)await page.locator('.hero-choice[data-hero=knight]').click();await page.locator('#submit-button').click();
   await page.waitForTimeout(100);
   const geometry=await page.evaluate(()=>({result:document.querySelector('#guess-history > li').getBoundingClientRect().toJSON(),check:document.querySelector('#submit-button').getBoundingClientRect().toJSON(),vh:innerHeight}));
   assert.ok(geometry.check.bottom<=geometry.vh+1,`${engine}/${width}/${count}: Check visible`);
   assert.ok(geometry.result.top>=-1&&geometry.result.bottom<=geometry.vh+1,`${engine}/${width}/${count}: last checked guess visible ${JSON.stringify(geometry)}`);
   const stable=await page.evaluate(()=>({y:scrollY,height:document.documentElement.scrollHeight}));await page.waitForTimeout(100);assert.deepEqual(await page.evaluate(()=>({y:scrollY,height:document.documentElement.scrollHeight})),stable);
   await page.locator('#guess-history').evaluate(el=>el.scrollIntoView({block:'start'}));const height=await page.evaluate(()=>document.documentElement.scrollHeight);await page.evaluate(()=>scrollBy(0,200));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),height);
   if(count===8)await page.screenshot({path:`output/mastermind-mobile-scroll/${engine}-${width}.png`,fullPage:true});assert.deepEqual(errors,[]);await page.close();console.log(`${engine}/${width}/${count}: newest-first history, visible result/controls and stable scroll pass`);
  }
 }finally{await browser.close();}
}
