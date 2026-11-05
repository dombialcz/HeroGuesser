import test from 'node:test';
import assert from 'node:assert/strict';
import { WARMUP, WARMUP_HEROES, newWarmup, loadWarmup, saveWarmup, needsWarmup, warmupKey, difficultyKey, readDifficulty, publicRoster, completionSummary, nextPuzzleIn } from '../src/warmup.js';
import { scoreGuess, generateChallenge, HERO_CLASSES } from '../src/mastermind-core.js';
import { dailyShareText } from '../src/daily-progress.js';
import { revealHint, toggleHint } from '../src/daily-hints.js';
const store = entries => { const map = new Map(entries); return { getItem: key => map.get(key) ?? null, setItem: (key,value) => map.set(key,value), keys: () => [...map.keys()] }; };
test('the prepared warm-up demonstrates all three totals against a fixed answer', () => {
  assert.deepEqual(scoreGuess(WARMUP.code, newWarmup().progress.draft), { exact: 1, misplaced: 1 });
  assert.equal(needsWarmup(store()), true);
});
test('unfinished warm-up restores draft, history, locks, eyes and cooldown independently of dailies', () => {
  const db = store(); const warmup = newWarmup();
  warmup.progress.guesses.push([...warmup.progress.draft]); warmup.progress.draft = [null,null,null];
  revealHint(warmup.progress, WARMUP, Date.now(), () => 0); toggleHint(warmup.progress, WARMUP, 0);
  saveWarmup(db, warmup); assert.deepEqual(loadWarmup(db), warmup); assert.equal(needsWarmup(db), true);
  for (const status of ['completed','skipped']) { warmup.status = status; saveWarmup(db,warmup); assert.equal(needsWarmup(db), false); }
  assert.deepEqual(db.keys(), [warmupKey]);
});
test('returning-player detection honors legacy choices and existing saves, but not preferences alone', () => {
  for (const [key,value] of [['heroguesser:onboarding:v1','{"schema":1,"choice":"skipped"}'], ['heroguesser:v1:2026-11-03:easy','{}'], ['heroguesser:story:campaign:v1','{}']]) assert.equal(needsWarmup(store([[key,value]])),false);
  assert.equal(needsWarmup(store([['heroguesser:language','pl']])),true);
  assert.equal(needsWarmup(store([[warmupKey,'bad']])),true);
});
test('last difficulty rejects unrecognized values', () => {
  assert.equal(readDifficulty(store()),'easy'); assert.equal(readDifficulty(store([[difficultyKey,'chaos']])),'chaos'); assert.equal(readDifficulty(store([[difficultyKey,'warmup']])),'easy');
});
test('roster chips depend only on public clues, never hidden counts or code', () => {
  const c = generateChallenge('2026-11-03','medium'); const roster = publicRoster(c);
  assert.deepEqual(publicRoster({...c,code:[],counts:{}}),roster);
  assert.equal(roster.remaining,2); assert.equal(publicRoster(WARMUP).remaining,0);
});
test('completion counts unique revealed places including closed eyes and shares no answer', () => {
  const c = generateChallenge('2026-11-03','hard'); const guesses = [Array(7).fill('mage'),c.code];
  const result=completionSummary(c,{guesses,hints:['open','closed',null]}); assert.deepEqual(result,{solved:true,guesses:2,reveals:2});
  for (const locale of ['en','pl']) { const text=dailyShareText(c,guesses,locale,'Guild of Wits',result.reveals); assert.match(text,locale==='pl'?/Wskazówki: 2/:/Hints: 2/); for(const hero of c.code) assert.ok(!text.includes(hero)); }
});
test('countdown uses the next local calendar midnight', () => {
  assert.equal(nextPuzzleIn(new Date(2026,10,3,23,58,0)),'0h 2m');
  assert.equal(nextPuzzleIn(new Date(2026,10,3,12,0,0)),'12h 0m');
});

test('warm-up choices retain Daily hero order and number shortcuts', () => {
  assert.deepEqual(WARMUP_HEROES, HERO_CLASSES.filter(hero => WARMUP_HEROES.includes(hero.id)).map(hero => hero.id));
});
