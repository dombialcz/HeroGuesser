import test from "node:test";
import assert from "node:assert/strict";
import { ADVENTURES, actAdventure, adventureScene, createAdventure } from "../src/mastermind-adventure-core.js";
import { ADVENTURE_COPY, sceneCopyIndex } from "../src/mastermind-adventure-copy.js";
const act = (s, type, rest = {}) => actAdventure(s, { type, ...rest });
const fill = (s, pieces) => pieces.forEach(piece => act(s, "pick", { piece }));
function permutations(pieces) {
  if (!pieces.length) return [[]];
  return [...new Set(pieces)].flatMap(p => {
    const rest = [...pieces]; rest.splice(rest.indexOf(p), 1);
    return permutations(rest).map(row => [p, ...row]);
  });
}
// Encode narrative constraints independently of the authored answers.
const pos = (r, p) => r.indexOf(p);
const positions = (r, p) => r.flatMap((x, i) => x === p ? [i] : []);
const next = (r, a, b) => Math.abs(pos(r, a) - pos(r, b)) === 1;
const byClue = {
  "shared-drink": [
    r=>next(r,'thief','ale')&&next(r,'knight','ale'),
    r=>pos(r,'thief')===0,
  ],
  "third-chair": [
    r=>positions(r,'ale').every(i=>i>0&&i<4&&r[i-1]!=='ale'&&r[i+1]!=='ale'),
    r=>pos(r,'thief')===0,
    r=>pos(r,'knight')<pos(r,'bard'),
  ],
  "back-door": [
    r=>positions(r,'zombie').every(i=>i<pos(r,'knight')),
    r=>pos(r,'bard')===pos(r,'thief')-1,
    r=>pos(r,'knight')<pos(r,'bard'),
  ],
  "hedge-mage": [
    r=>r[pos(r,'mage')-1]==='coin'&&r[pos(r,'mage')+1]==='coin',
    r=>pos(r,'thief')<pos(r,'mage'),
    r=>!next(r,'knight','thief'),
  ],
  "broken-bell": [
    r=>pos(r,'mage')===pos(r,'thief')+1,
    r=>pos(r,'bard')===pos(r,'thief')+2,
    r=>positions(r,'knight')[1]-positions(r,'knight')[0]>1,
  ],
  "royal-awakening": [
    r=>pos(r,'mage')===pos(r,'king')+2,
    r=>pos(r,'mage')===pos(r,'coin')+1,
    r=>positions(r,'knight')[1]-positions(r,'knight')[0]>1,
  ],
  "enchanted-corridor": [
    r=>r[pos(r,'king')-1]==='knight',
    r=>pos(r,'mage')===pos(r,'coin')+1,
    r=>pos(r,'mage')===pos(r,'king')+2,
    r=>pos(r,'zombie')<pos(r,'king'),
    r=>pos(r,'mage')>0&&pos(r,'mage')<5,
  ],
  "chapel-defence": [
    r=>pos(r,'king')===pos(r,'bard')+1,
    r=>positions(r,'knight').every(i=>r[i-2]==='zombie'),
    r=>!positions(r,'zombie').some(i=>Math.abs(i-pos(r,'king'))===1),
  ],
  "tower-square": [
    r=>positions(r,'zombie').every(i=>i<pos(r,'mage')),
    r=>pos(r,'thief')===pos(r,'coin')+1,
    r=>pos(r,'thief')===pos(r,'knight')+3,
    r=>pos(r,'mage')>0&&pos(r,'mage')<5,
  ],
  "sealed-stair": [
    r=>r[pos(r,'mage')-1]==='coin'&&r[pos(r,'mage')+1]==='coin',
    r=>pos(r,'thief')>pos(r,'mage'),
    r=>pos(r,'mage')===pos(r,'zombie')+3,
  ],
  "silence-the-bell": [
    r=>[0,5].includes(pos(r,'zombie')),
    r=>pos(r,'knight')===pos(r,'zombie')+1,
    r=>pos(r,'mage')===pos(r,'coin')+1,
    r=>next(r,'thief','bell'),
    r=>pos(r,'thief')<pos(r,'mage'),
    r=>!next(r,'bell','knight'),
  ],
};
test("all eleven scenes have exactly one arrangement satisfying their story clues", () => {
  for (const adventure of ADVENTURES) for (const scene of adventure.scenes) {
    const candidates = permutations(scene.solution).filter(r => byClue[scene.id].every(rule => rule(r)));
    assert.deepEqual(candidates, [scene.solution], scene.id);
    for (const locale of ["en", "pl"]) {
      const copy = ADVENTURE_COPY[locale].scenes[Object.keys(byClue).indexOf(scene.id)];
      assert.ok(copy.story && copy.fact && copy.clues.length === byClue[scene.id].length + 1 && copy.hints.length === 2 && copy.lesson && copy.reasoning);
    }
  }
});
test("every spatial clue eliminates an alternative, and boards build to six places", () => {
  const scenes = ADVENTURES.flatMap(a => a.scenes);
  assert.deepEqual(scenes.map(s => s.solution.length), [3, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]);
  for (const scene of scenes) {
    const all = permutations(scene.solution), rules = byClue[scene.id];
    for (let i = 0; i < rules.length; i++) {
      const without = all.filter(r => rules.every((rule, j) => j === i || rule(r)));
      assert.ok(without.length > 1, scene.id + ': redundant clue ' + (i + 2));
    }
    assert.deepEqual(new Set(scene.pieces), new Set(scene.solution));
  }
});
test("incomplete rows and count corrections do not create attempts; wrong checks clear the draft", () => {
  const s = createAdventure(); act(s, "next"); act(s, "check");
  assert.equal(s.guesses.length, 0);
  fill(s, ["thief", "thief"]); assert.equal(s.notice, "limit");
  act(s, "hint"); act(s, "hint"); act(s, "hint"); assert.equal(s.hint, 2);
  act(s, "clear"); fill(s, ["knight", "ale", "thief"]); act(s, "check");
  assert.deepEqual(s.draft, [null, null, null]);
  assert.deepEqual(s.guesses[0], { pieces: ["knight", "ale", "thief"], exact: 1, misplaced: 2, absent: 0 });
  fill(s, adventureScene(s).solution); act(s, "check");
  assert.equal(s.phase, "solved"); assert.equal(s.guesses.length, 0); assert.equal(s.facts.length, 1);
});
test("stories remain playable after twelve wrong checks and can still be solved", () => {
  const s = createAdventure(); act(s, "next");
  for (let n = 0; n < 12; n++) { fill(s, ["knight", "ale", "thief"]); act(s, "check"); }
  assert.equal(s.phase, "play"); assert.equal(s.guesses.length, 12); assert.equal('health' in s, false);
  fill(s, adventureScene(s).solution); act(s, "check"); assert.equal(s.phase, "solved");
});
test("all four adventures complete with only verified scenes retained; edits support moves and invalid input", () => {
  for (let index = 0; index < ADVENTURES.length; index++) {
    const s = createAdventure(index);
    for (let scene = 0; scene < ADVENTURES[index].scenes.length; scene++) {
      assert.equal(s.phase, "intro"); act(s, "pick", { piece: "thief" }); assert.ok(s.draft.every(p => p === null));
      act(s, "next");
      act(s, "slot", { slot: -1 }); act(s, "pick", { piece: "invalid" });
      assert.ok(s.draft.every(p => p === null));
      fill(s, adventureScene(s).solution);
      const answer = [...s.draft]; act(s, "move", { from: 0, to: 1 }); act(s, "move", { from: 0, to: 1 });
      assert.deepEqual(s.draft, answer); act(s, "check"); assert.equal(s.phase, "solved"); act(s, "next");
    }
    assert.equal(s.phase, "complete"); assert.equal(s.facts.length, ADVENTURES[index].scenes.length); assert.deepEqual(s.guesses, []);
  }
});

test("chapter indexes and localized scene offsets stay valid as the campaign grows", () => {
  let offset = 0;
  for (let index = 0; index < ADVENTURES.length; index++) {
    const s = createAdventure(index);
    assert.equal(s.adventure, index);
    for (let scene = 0; scene < ADVENTURES[index].scenes.length; scene++) {
      assert.equal(sceneCopyIndex(s, scene), offset + scene);
      for (const locale of ["en", "pl"]) assert.ok(ADVENTURE_COPY[locale].scenes[sceneCopyIndex(s, scene)].landmarks.length === 2);
    }
    offset += ADVENTURES[index].scenes.length;
  }
  for (const invalid of [-1, 4, 100, null, "3", NaN]) assert.equal(createAdventure(invalid).adventure, 0);
  for (const locale of ["en", "pl"]) {
    assert.equal(ADVENTURE_COPY[locale].adventures.length, ADVENTURES.length);
    assert.equal(ADVENTURE_COPY[locale].scenes.length, offset);
    assert.ok(ADVENTURE_COPY[locale].king && ADVENTURE_COPY[locale].bell);
  }
});
test("every new scene archives wrong attempts and clears them on solve", () => {
  for (const index of [2, 3]) {
    const s = createAdventure(index);
    for (const scene of ADVENTURES[index].scenes) {
      act(s, "next");
      const wrong = [...scene.solution.slice(1), scene.solution[0]];
      fill(s, wrong); act(s, "check");
      assert.ok(s.draft.every(p => p === null)); assert.equal(s.guesses.length, 1);
      fill(s, scene.solution); act(s, "check"); assert.equal(s.guesses.length, 0); assert.equal(s.phase, "solved"); act(s, "next");
    }
    assert.equal(s.phase, "complete"); assert.equal(s.facts.length, 3);
  }
});
