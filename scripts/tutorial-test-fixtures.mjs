import assert from 'node:assert/strict';

export async function solvePrelude(page) {
  const click = selector => page.locator(selector).click();
  const pick = piece => click(`#tutorial-pick-${piece}`);
  const next = () => click('#tutorial-next');
  const check = () => click('#tutorial-check');
  const state = () => page.evaluate(() => JSON.parse(render_game_to_text()));
  await pick('thief'); await pick('coin'); await pick('coin'); await check();
  await next(); await next();
  await click('#tutorial-answer-elsewhere'); await next(); await next();
  const window = (await state()).window.besidePlace - 1;
  await click(`#tutorial-slot-${window}`); await pick('thief'); await pick('coin'); await pick('coin'); await check();
  await next(); await next();
  await click(`#tutorial-slot-${2 - window}`); await pick('thief'); await pick('coin'); await check();
  await next(); await next();
  for (let thief = 0; thief < 4; thief++) {
    await click(`#tutorial-slot-${thief}`); await pick('thief');
    await pick('knight'); await pick('knight'); await pick('knight'); await check();
    if ((await state()).phase === 'complete') break;
  }
  assert.equal((await state()).phase, 'complete');
}
