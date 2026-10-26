import test from 'node:test';
import assert from 'node:assert/strict';
import { generateChallenge, CHALLENGES, HERO_CLASSES, evaluateGuess, scoreGuess } from '../src/mastermind-core.js';
import { localDateKey } from '../src/date.js';

test('daily codes remain deterministic with the documented class-count patterns', () => {
  for (let day = 1; day <= 60; day++) {
    const date = new Date(2026, 9, day), key = localDateKey(date);
    for (const challenge of CHALLENGES.filter(c => c.id !== "chaos")) {
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
test('Chaos is a shared date-seeded five-slot code with all heroes and unrestricted repeats', () => {
  assert.equal(CHALLENGES.length, 4);
  const patterns = new Set();
  const slotHeroes = Array.from({ length: 5 }, () => new Set());
  const answers = new Set();
  for (let day = 0; day < 20000; day++) {
    const key = localDateKey(new Date(2026, 0, day + 1));
    const puzzle = generateChallenge(key, 'chaos');
    assert.deepEqual(puzzle, generateChallenge(key, 'chaos'));
    assert.equal(puzzle.code.length, 5);
    assert.deepEqual(puzzle.clues, []);
    assert.equal(puzzle.revealedSingle, null);
    assert.equal(puzzle.title, 'Chaos');
    assert.equal(puzzle.pattern, 'unrestricted');
    puzzle.code.forEach((hero, slot) => {
      assert.ok(HERO_CLASSES.some(h => h.id === hero));
      slotHeroes[slot].add(hero);
    });
    patterns.add(Object.values(puzzle.counts).sort((a, b) => b - a).join(','));
    answers.add(puzzle.code.join(','));
  }
  assert.deepEqual([...patterns].sort(), ['1,1,1,1,1', '2,1,1,1', '2,2,1', '3,1,1', '3,2', '4,1', '5'].sort());
  slotHeroes.forEach(heroes => assert.equal(heroes.size, HERO_CLASSES.length));
  assert.ok(answers.size > 10000, 'daily codes vary in both heroes and order');
});
test('Chaos feedback handles four or five copies without overcounting', () => {
  assert.deepEqual(evaluateGuess(Array(5).fill('mage'), ['mage', 'mage', 'thief', 'thief', 'thief']), { exact: 2, misplaced: 0 });
  assert.deepEqual(evaluateGuess(['mage', 'mage', 'mage', 'mage', 'thief'], ['thief', 'mage', 'mage', 'mage', 'mage']), { exact: 3, misplaced: 2 });
});
test('standalone date helper uses local calendar components and zero padding', () => {
  assert.equal(localDateKey(new Date(2026,0,2,23,59)), '2026-01-02');
  assert.equal(localDateKey(new Date(2026,9,25)), '2026-10-25');
});
