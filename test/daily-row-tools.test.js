import test from 'node:test';
import assert from 'node:assert/strict';
import { applyLocks, copyPastRow, normalizeLocks, toggleLock } from '../src/daily-row-tools.js';
import { restoreDaily, serializeDaily } from '../src/daily-progress.js';
import { generateChallenge } from '../src/mastermind-core.js';

test('copying any historical row preserves position and locks without mutating history', () => {
  const progress = { guesses: [['knight', 'thief', 'bard'], ['bard', 'knight', 'thief']], draft: [null, null, null], locks: ['mage', null, null] };
  const copy = copyPastRow(progress, 0);
  assert.deepEqual(copy, ['mage', 'thief', 'bard']);
  copy[1] = 'cleric';
  assert.deepEqual(progress.guesses[0], ['knight', 'thief', 'bard']);
  assert.deepEqual(copyPastRow(progress, 1), ['mage', 'knight', 'thief']);
  for (const index of [-1, 2, '0', NaN]) assert.equal(copyPastRow(progress, index), null);
});

test('locking requires a hero; unlocking retains the draft and removes the constraint', () => {
  const progress = { guesses: [], draft: ['knight', null] };
  assert.equal(toggleLock(progress, 1), false);
  assert.equal(toggleLock(progress, -1), false);
  assert.equal(toggleLock(progress, 0), true);
  assert.deepEqual(applyLocks([null, 'bard'], progress.locks), ['knight', 'bard']);
  assert.equal(toggleLock(progress, 0), true);
  assert.deepEqual(progress.draft, ['knight', null]);
  assert.deepEqual(applyLocks([null, null], progress.locks), [null, null]);
});

test('lock data is validated separately from legacy puzzle progress', () => {
  const challenge = generateChallenge('2026-10-30', 'easy');
  const draft = Array(challenge.size).fill(null);
  const legacy = { guesses: [], draft };
  assert.deepEqual(restoreDaily(serializeDaily(legacy), challenge).progress, legacy);
  const restored = restoreDaily(serializeDaily({ ...legacy, locks: ['thief', 'invalid', 3] }), challenge);
  assert.equal(restored.invalid, false);
  assert.deepEqual(restored.progress.locks, ['thief', ...Array(challenge.size - 1).fill(null)]);
  assert.deepEqual(restored.progress.draft, ['thief', ...Array(challenge.size - 1).fill(null)]);
  assert.deepEqual(normalizeLocks({ 0: 'bard' }, 2, new Set(['bard'])), ['bard', null]);
});

test('locks round-trip while confirmed wins and aggregate scoring remain unchanged', () => {
  const challenge = generateChallenge('2026-10-30', 'easy');
  const locks = ['knight', ...Array(challenge.size - 1).fill(null)];
  const current = { guesses: [], draft: applyLocks(Array(challenge.size).fill(null), locks), locks };
  assert.deepEqual(restoreDaily(serializeDaily(current), challenge).progress, current);
  const solved = restoreDaily(serializeDaily({ ...current, guesses: [challenge.code] }), challenge);
  assert.deepEqual(solved.progress.guesses, [challenge.code]);
  assert.ok(solved.progress.draft.every(piece => piece === null));
});
