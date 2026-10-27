import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdventure, actAdventure, adventureScene } from '../src/mastermind-adventure-core.js';
import { restoreStory, serializeStory } from '../src/story-progress.js';
import { generateChallenge } from '../src/mastermind-core.js';
import { restoreDaily, serializeDaily, dailyShareText, pruneDaily, dailyKey } from '../src/daily-progress.js';
import { installNativePlatform, storage } from '../src/platform.js';
import { readFileSync } from 'node:fs';

test('the rename and save changes retain the recorded browser-release daily answers', () => {
  const baseline = JSON.parse(readFileSync(new URL('../release/baseline-dailies.json', import.meta.url), 'utf8'));
  for (const c of baseline) assert.deepEqual(generateChallenge(c.dateKey, c.id).code, c.code);
});

test('chapter saves resume drafts, attempts, hints and verified scenes; scores are recomputed', () => {
  const s = createAdventure(); actAdventure(s, { type: 'next' });
  for (const piece of ['knight', 'ale', 'thief']) actAdventure(s, { type: 'pick', piece });
  actAdventure(s, { type: 'check' }); actAdventure(s, { type: 'hint' }); actAdventure(s, { type: 'pick', piece: 'thief' });
  s.guesses[0].exact = 900;
  const restored = restoreStory(serializeStory(s), 0);
  assert.equal(restored.invalid, false); assert.equal(restored.state.guesses[0].exact, 1);
  assert.equal(restored.state.hint, 1); assert.equal(restored.state.draft[0], 'thief');
  actAdventure(restored.state, { type: 'clear' });
  for (const piece of adventureScene(s).solution) actAdventure(restored.state, { type: 'pick', piece });
  actAdventure(restored.state, { type: 'check' }); actAdventure(restored.state, { type: 'next' });
  const second = restoreStory(serializeStory(restored.state), 0);
  assert.equal(second.invalid, false); assert.equal(second.state.scene, 1); assert.equal(second.state.facts.length, 1);
  assert.deepEqual(second.state.guesses, []);
});
test('all story phases roundtrip and chapter saves cannot be loaded into another chapter', () => {
  for (let index = 0; index < 4; index++) {
    const s = createAdventure(index);
    while (s.phase !== 'complete') {
      assert.equal(restoreStory(serializeStory(s), index).invalid, false);
      if (s.phase === 'play') {
        for (const piece of adventureScene(s).solution) actAdventure(s, { type: 'pick', piece });
        actAdventure(s, { type: 'check' });
      } else actAdventure(s, { type: 'next' });
    }
    assert.equal(restoreStory(serializeStory(s), index).state.phase, 'complete');
    assert.equal(restoreStory(serializeStory(s), (index + 1) % 4).invalid, true);
  }
});
test('corrupt, incompatible and fabricated chapter states need recovery', () => {
  const base = JSON.parse(serializeStory(createAdventure()));
  const bad = [null, {}, { ...base, schema: 8 }, { ...base, content: 42 },
    { ...base, state: { ...base.state, scene: -1 } }, { ...base, state: { ...base.state, phase: 'failed' } },
    { ...base, state: { ...base.state, facts: [{ scene: 0, pieces: ['mage'] }] } },
    { ...base, state: { ...base.state, draft: ['thief', 'thief', 'thief'] } }];
  for (const raw of ['{', ...bad.map(x => JSON.stringify(x))]) assert.equal(restoreStory(raw, 0).invalid, true, raw);
  assert.equal(restoreStory(null, 0).invalid, false);
});
test('original first-chapter saves survive the progression revision; changed chapters require explicit recovery', () => {
  const first = createAdventure();
  actAdventure(first, { type: 'next' });
  actAdventure(first, { type: 'pick', piece: 'thief' });
  const old = JSON.parse(serializeStory(first)); old.content = 1;
  const restored = restoreStory(JSON.stringify(old), 0);
  assert.equal(restored.invalid, false);
  assert.deepEqual(restored.state.draft, ['thief', null, null]);
  assert.equal(JSON.parse(serializeStory(restored.state)).content, 2);
  for (const index of [1, 2, 3]) {
    const previous = JSON.parse(serializeStory(createAdventure(index))); previous.content = 1;
    assert.equal(restoreStory(JSON.stringify(previous), index).invalid, true);
  }
});
test('legacy dailies migrate without changing answers; bad versions and rows are rejected', () => {
  const c = generateChallenge('2026-10-25', 'hard');
  const old = { guesses: [c.code], draft: [...c.code] };
  const result = restoreDaily(JSON.stringify(old), c);
  assert.equal(result.invalid, false); assert.deepEqual(result.progress.guesses, [c.code]); assert.ok(result.progress.draft.every(x => x === null));
  assert.deepEqual(restoreDaily(serializeDaily(result.progress), c), result);
  for (const raw of ['{', '{"schema":99,"guesses":[]}', '{"generator":99,"guesses":[]}', '{"guesses":[["bad"]]}']) assert.equal(restoreDaily(raw, c).invalid, true);
});
test('daily sharing contains aggregate counts only, in both locales, and requires a solve', () => {
  for (const locale of ['en', 'pl']) {
    const c = generateChallenge('2026-10-25', 'easy');
    const wrong = ['mage', 'mage', 'mage', 'mage', 'mage'];
    assert.equal(dailyShareText(c, [wrong], locale), null);
    const text = dailyShareText(c, [wrong, c.code], locale);
    assert.match(text, /2026-10-25/); assert.match(text, /5 🟩 · 0 🟨 · 0 ⬜/);
    assert.ok(text.includes(locale === 'pl' ? 'Próby: 2' : 'Guesses: 2'));
    for (const piece of ['knight', 'thief', 'bard', 'cleric', 'barbarian', 'ranger', 'mage']) assert.ok(!text.includes(piece));
  }
});
test('90-day pruning leaves story/language, future dates and unrelated keys intact', () => {
  const keys = new Set([dailyKey('2026-07-27', 'easy'), dailyKey('2026-07-28', 'easy'), dailyKey('2027-01-01', 'hard'), 'heroguesser:story:v1:last-round', 'heroguesser:language', 'other']);
  pruneDaily({ keys: () => [...keys], removeItem: key => keys.delete(key) }, '2026-10-25');
  assert.equal(keys.has(dailyKey('2026-07-27', 'easy')), false);
  assert.equal(keys.size, 5); assert.equal(keys.has(dailyKey('2026-07-28', 'easy')), true);
});
test('native storage initializes before reads and serializes writes/removal', async () => {
  const calls = [];
  installNativePlatform({ set: async (k, v) => { await new Promise(r => setTimeout(r, v === 'first' ? 15 : 0)); calls.push([k, v]); }, remove: async k => calls.push([k, null]) }, { existing: 'saved' });
  assert.equal(storage.getItem('existing'), 'saved');
  storage.setItem('a', 'first'); storage.setItem('a', 'latest'); storage.removeItem('a');
  await storage.flush(); assert.deepEqual(calls, [['a', 'first'], ['a', 'latest'], ['a', null]]); assert.equal(storage.getItem('a'), null);
  installNativePlatform({ set: async () => { throw Error('disk'); } }, {});
  storage.setItem('a', 'in memory'); await storage.flush(); assert.equal(storage.failed, true); assert.equal(storage.getItem('a'), 'in memory');
});
test('Party Roll saves, sharing and retention are independent of the original dailies', () => {
  const c = generateChallenge('2026-10-25', 'chaos');
  const draft = ['mage', null, 'mage', null, null];
  const partial = { guesses: [Array(5).fill('knight')], draft };
  assert.deepEqual(restoreDaily(serializeDaily(partial), c).progress, partial);
  const complete = restoreDaily(serializeDaily({ guesses: [c.code], draft }), c);
  assert.equal(complete.invalid, false);
  assert.deepEqual(complete.progress.draft, Array(5).fill(null));
  for (const locale of ['en', 'pl']) assert.ok(dailyShareText(c, [c.code], locale).includes(`${locale === 'pl' ? 'Drużyna z przypadku' : 'Party Roll'}\n`));
  assert.notEqual(dailyKey(c.dateKey, 'chaos'), dailyKey(c.dateKey, 'easy'));
  const keys = new Set([dailyKey('2026-07-27', 'chaos'), dailyKey('2026-10-25', 'chaos'), dailyKey('2026-10-25', 'easy')]);
  pruneDaily({ keys: () => [...keys], removeItem: key => keys.delete(key) }, '2026-10-25');
  assert.deepEqual([...keys], [dailyKey(c.dateKey, 'chaos'), dailyKey(c.dateKey, 'easy')]);
});
