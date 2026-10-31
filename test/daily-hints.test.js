import test from 'node:test';
import assert from 'node:assert/strict';
import { revealHint, toggleHint, hintCooldownRemaining, HINT_COOLDOWN_MS } from '../src/daily-hints.js';
import { applyLocks, copyPastRow, toggleLock } from '../src/daily-row-tools.js';
import { blankDaily, restoreDaily, serializeDaily } from '../src/daily-progress.js';
import { generateChallenge } from '../src/mastermind-core.js';

test('a reveal replaces a player hypothesis with the answer, starts cooldown and never repeats a place', () => {
  for (const difficulty of ['easy', 'medium', 'hard', 'chaos']) {
    const challenge = generateChallenge('2026-10-31', difficulty);
    const progress = blankDaily(challenge);
    progress.locks = Array(challenge.size).fill('bard');
    let now = Date.now();
    for (let slot = 0; slot < challenge.size; slot++) {
      assert.equal(revealHint(progress, challenge, now, () => 0), slot);
      assert.equal(progress.draft[slot], challenge.code[slot]);
      assert.equal(progress.locks[slot], challenge.code[slot]);
      assert.equal(hintCooldownRemaining(progress, now), HINT_COOLDOWN_MS);
      const unchanged = structuredClone(progress);
      assert.equal(revealHint(progress, challenge, now + HINT_COOLDOWN_MS - 1), null);
      assert.deepEqual(progress, unchanged);
      now += HINT_COOLDOWN_MS;
    }
    assert.equal(revealHint(progress, challenge, now), null);
    assert.deepEqual(progress.draft, challenge.code);
    assert.deepEqual(progress.guesses, [], 'revealing the formation does not submit it');
  }
});

test('closed eyes allow experiments and reopening always restores the answer without another cooldown', () => {
  const challenge = generateChallenge('2026-10-31', 'easy');
  const progress = blankDaily(challenge);
  const now = Date.now();
  revealHint(progress, challenge, now, () => 0);
  assert.equal(toggleLock(progress, 0), false, 'revealed places use their eye instead of a padlock');
  assert.equal(toggleHint(progress, challenge, 0), true);
  assert.equal(progress.hints[0], 'closed');
  assert.equal(progress.locks[0], null);
  progress.draft[0] = 'mage';
  assert.equal(toggleHint(progress, challenge, 0), true);
  assert.equal(progress.draft[0], challenge.code[0]);
  assert.equal(progress.locks[0], challenge.code[0]);
  assert.equal(progress.hintReadyAt, now + HINT_COOLDOWN_MS);
  assert.equal(revealHint(progress, challenge, now), null);
  for (const slot of [-1, 1, challenge.size, '0']) assert.equal(toggleHint(progress, challenge, slot), false);
});

test('open eyes survive clearing, copying and the next attempt alongside ordinary locks', () => {
  const challenge = generateChallenge('2026-10-31', 'hard');
  const progress = blankDaily(challenge);
  progress.draft[1] = 'thief'; toggleLock(progress, 1);
  revealHint(progress, challenge, Date.now(), () => 0);
  progress.guesses.push(Array(challenge.size).fill('bard'));
  const expected = [challenge.code[0], 'thief', ...Array(challenge.size - 2).fill(null)];
  assert.deepEqual(applyLocks(Array(challenge.size).fill(null), progress.locks), expected);
  assert.deepEqual(copyPastRow(progress, 0), [challenge.code[0], 'thief', ...Array(challenge.size - 2).fill('bard')]);
  toggleHint(progress, challenge, 0);
  assert.equal(copyPastRow(progress, 0)[0], 'bard');
});

test('saved hints restore protection from the actual answer and retain closed experiments and cooldown', () => {
  const challenge = generateChallenge('2026-10-31', 'medium');
  const progress = blankDaily(challenge);
  const now = Date.now();
  revealHint(progress, challenge, now, () => 0);
  revealHint(progress, challenge, now + HINT_COOLDOWN_MS, () => 0);
  toggleHint(progress, challenge, 1);
  progress.draft[1] = 'mage';
  progress.locks[0] = 'thief'; progress.draft[0] = 'thief';
  const restored = restoreDaily(serializeDaily(progress), challenge);
  assert.equal(restored.invalid, false);
  assert.equal(restored.progress.draft[0], challenge.code[0]);
  assert.equal(restored.progress.locks[0], challenge.code[0]);
  assert.equal(restored.progress.draft[1], 'mage');
  assert.equal(restored.progress.locks[1], null);
  assert.ok(hintCooldownRemaining(restored.progress, now) <= HINT_COOLDOWN_MS + 10, 'future clock anomalies cannot cause an unlimited wait');
  const corrupt = restoreDaily(JSON.stringify({ guesses: [], hints: ['invalid', true, 'closed'], hintReadyAt: 'never' }), challenge);
  assert.deepEqual(corrupt.progress.hints, [null, null, 'closed', null, null, null]);
  assert.equal(corrupt.progress.hintReadyAt, 0);
  assert.deepEqual(blankDaily(challenge), { guesses: [], draft: Array(challenge.size).fill(null) });
});
