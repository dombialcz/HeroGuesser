import test from "node:test";
import assert from "node:assert/strict";
import { ADVENTURES, ADVENTURE_HEALTH, actAdventure, adventureScene, createAdventure } from "../src/mastermind-adventure-core.js";
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
const byClue = {
  "shared-drink": r => r[0] === "thief" && Math.abs(r.indexOf("thief") - r.indexOf("ale")) === 1 && Math.abs(r.indexOf("knight") - r.indexOf("ale")) === 1,
  "third-chair": r => r[0] === "thief" && r[4] === "bard" && r.every((p, i) => p === "ale" ? i > 0 && i < 4 && r[i - 1] !== "ale" && r[i + 1] !== "ale" : r[i - 1] === "ale" || r[i + 1] === "ale"),
  "back-door": r => r[0] === "zombie" && r[1] === "zombie" && r[2] === "knight" && r[4] === "thief" && r[3] === "bard",
  "hedge-mage": r => r[0] === "thief" && r[r.indexOf("mage") - 1] === "coin" && r[r.indexOf("mage") + 1] === "coin",
  "broken-bell": r => r[0] === "knight" && r[4] === "knight" && r[2] === "mage" && r[1] === "thief" && r[3] === "bard",
  "royal-awakening": r => r[r.indexOf("king") - 1] === "knight" && r[r.indexOf("king") + 1] === "knight",
  "enchanted-corridor": r => r[0] === "zombie" && r[r.indexOf("king") - 1] === "knight" && r[r.indexOf("king") + 1] === "knight",
  "chapel-defence": r => r[0] === "zombie" && r[1] === "zombie" && r[4] === "king" && r[2] === "knight" && r[3] === "knight",
  "tower-square": r => r[0] === "zombie" && r[1] === "zombie" && r[2] === "knight" && r[4] === "thief" && r[3] === "mage",
  "sealed-stair": r => r[0] === "knight" && r[3] === "thief" && r[r.indexOf("coin") - 1] === "mage" && r[r.indexOf("coin") + 1] === "thief",
  "silence-the-bell": r => r[0] === "knight" && r[3] === "bell" && r.indexOf("mage") === r.indexOf("bell") - 1 && r[1] === "thief",
};
test("all eleven scenes have exactly one arrangement satisfying their story clues", () => {
  for (const adventure of ADVENTURES) for (const scene of adventure.scenes) {
    const candidates = permutations(scene.solution).filter(byClue[scene.id]);
    assert.deepEqual(candidates, [scene.solution], scene.id);
    for (const locale of ["en", "pl"]) {
      const copy = ADVENTURE_COPY[locale].scenes[Object.keys(byClue).indexOf(scene.id)];
      assert.ok(copy.story && copy.fact && copy.clues.length >= 3 && copy.hints.length === 2);
    }
  }
});
test("only a complete incorrect check costs health; failures archive and empty the row", () => {
  const s = createAdventure(); act(s, "next");
  act(s, "check"); assert.equal(s.health, ADVENTURE_HEALTH);
  fill(s, ["thief", "thief"]); assert.equal(s.notice, "limit"); assert.equal(s.health, 5);
  act(s, "hint"); act(s, "hint"); act(s, "hint"); assert.equal(s.hint, 2); assert.equal(s.health, 5);
  act(s, "clear"); fill(s, ["knight", "ale", "thief"]); act(s, "check");
  assert.equal(s.health, 4); assert.deepEqual(s.draft, [null, null, null]);
  assert.deepEqual(s.guesses[0], { pieces: ["knight", "ale", "thief"], exact: 1, misplaced: 2, absent: 0 });
  act(s, "check"); assert.equal(s.health, 4); assert.equal(s.guesses.length, 1);
  fill(s, adventureScene(s).solution); act(s, "check");
  assert.equal(s.phase, "solved"); assert.equal(s.health, 4); assert.equal(s.guesses.length, 0); assert.equal(s.facts.length, 1);
  act(s, "check"); assert.equal(s.facts.length, 1);
  act(s, "next"); assert.equal(s.phase, "intro"); assert.equal(s.health, 4); assert.equal(s.draft.length, 5);
});
test("health reaches zero once, locks the failed run, and a new adventure starts fresh", () => {
  const s = createAdventure(); act(s, "next");
  for (let n = 0; n < 5; n++) { fill(s, ["knight", "ale", "thief"]); act(s, "check"); }
  assert.equal(s.phase, "failed"); assert.equal(s.health, 0); assert.equal(s.guesses.length, 5);
  const before = structuredClone(s);
  for (const type of ["check", "pick", "slot", "move", "next", "clear", "hint"]) act(s, type, { piece: "thief", slot: 0, from: 0, to: 1 });
  assert.deepEqual(s, before); assert.equal(createAdventure(1).health, 5);
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
    assert.equal(s.phase, "complete"); assert.equal(s.facts.length, ADVENTURES[index].scenes.length); assert.equal(s.health, 5); assert.deepEqual(s.guesses, []);
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
test("every new scene charges a wrong reconstruction, clears attempts on solve and carries health", () => {
  for (const index of [2, 3]) {
    const s = createAdventure(index);
    for (const scene of ADVENTURES[index].scenes) {
      act(s, "next");
      const wrong = [...scene.solution.slice(1), scene.solution[0]];
      const health = s.health; fill(s, wrong); act(s, "check");
      assert.equal(s.health, health - 1); assert.ok(s.draft.every(p => p === null)); assert.equal(s.guesses.length, 1);
      fill(s, scene.solution); act(s, "check"); assert.equal(s.guesses.length, 0); assert.equal(s.phase, "solved"); act(s, "next");
    }
    assert.equal(s.phase, "complete"); assert.equal(s.health, 2); assert.equal(s.facts.length, 3);
  }
});
