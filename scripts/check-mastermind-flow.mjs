import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
const base=process.env.HERO_GUESSER_BASE_URL??'http://127.0.0.1:4180';
for(const [engine,type] of Object.entries({chromium,webkit})) {
 const browser=await type.launch();try {
  for(const [width,height] of [[1280,860],[390,844]]) {
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await page.goto(`${base}/?daily=1`);
   const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   await page.locator('[data-challenge=easy]').focus();await page.keyboard.press('3');assert.equal((await state()).draft[0],'bard');
   await page.keyboard.press('Backspace');assert.equal((await state()).draft[1],null);
   await page.locator('#clear-button').click();
   for(let i=0;i<5;i++){await page.locator('[data-challenge=easy]').focus();await page.keyboard.press('1');}
   await page.locator('#current-guess [data-slot="0"]').focus();await page.keyboard.press('Enter');
   assert.equal((await state()).guesses.length,1);assert.deepEqual((await state()).guesses[0].heroes,Array(5).fill('knight'));
   assert.ok((await state()).draft.every(p=>p===null));
   await page.locator('#help-open').focus();await page.keyboard.press('Enter');await page.locator('#help-dialog').waitFor({state:'visible'});assert.equal((await state()).guesses.length,1);
   await page.keyboard.press('1');assert.ok((await state()).draft.every(p=>p===null));await page.keyboard.press('Escape');
   await page.locator('#current-guess [data-slot="0"]').focus();await page.keyboard.press('Enter');assert.equal((await state()).guesses.length,1);assert.match(await page.locator('#daily-guess-tools-status').textContent(),/Fill all/);
   await page.locator('#current-guess [data-slot="2"]').click();await page.keyboard.press('2');assert.equal((await state()).draft[2],'thief');
   await page.locator('#current-guess [data-slot="2"]').click();await page.keyboard.press('1');assert.equal((await state()).draft[2],'knight');await page.locator('#current-guess [data-slot="2"]').focus();await page.keyboard.press('Backspace');assert.equal((await state()).draft[2],null);
   await page.close();console.log(`${engine}/${width}: numbers with button focus, Enter check, incomplete nudge, selected-place clearing and native Help/dialog keys pass`);
  }
 }finally{await browser.close();}
}
