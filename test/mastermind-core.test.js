import test from 'node:test';
import assert from 'node:assert/strict';
import { generateChallenge, CHALLENGES, HERO_CLASSES, evaluateGuess, scoreGuess } from '../src/mastermind-core.js';
import { localDateKey } from '../src/date.js';

test('daily codes remain deterministic with the documented class-count patterns', () => {
  for (let day = 1; day <= 60; day++) {
    const date = new Date(2026, 9, day), key = localDateKey(date);
    for (const challenge of CHALLENGES) {
      const puzzle = generateChallenge(key, challenge.id);
      assert.deepEqual(puzzle, generateChallenge(key, challenge.id));
      assert.equal(puzzle.code.length, challenge.size);
      assert.ok(puzzle.code.every(type => HERO_CLASSES.some(h => h.id === type)));
      const counts = Object.values(puzzle.counts).sort((a,b) => b-a);
      assert.deepEqual(counts, challenge.id === 'easy' ? [3,1,1] : challenge.id === 'medium' ? [3,1,1,1] : [3,2,1,1]);
      assert.equal(puzzle.counts[puzzle.revealedSingle], 1);
      for (const clue of puzzle.clues) assert.equal(puzzle.counts[clue.type], {trio:3,pair:2,single:1}[clue.kind]);
      assert.deepEqual(evaluateGuess(puzzle.code, puzzle.code), {exact:challenge.size,misplaced:0});
    }
  }
});
test('duplicate scoring does not overcount excess copies', () => {
  assert.deepEqual(scoreGuess(['thief','coin','coin'], ['coin','thief','thief']), {exact:0,misplaced:2});
  assert.deepEqual(evaluateGuess(['knight','thief','mage'], ['knight','knight','knight']), {exact:1,misplaced:0});
  assert.equal(evaluateGuess(['knight'], ['coin']), null);
  assert.equal(evaluateGuess(['knight'], []), null);
});
test('standalone date helper uses local calendar components and zero padding', () => {
  assert.equal(localDateKey(new Date(2026,0,2,23,59)), '2026-01-02');
  assert.equal(localDateKey(new Date(2026,9,25)), '2026-10-25');
});
