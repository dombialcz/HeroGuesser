import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVENTURES, createAdventure, actAdventure } from '../src/mastermind-adventure-core.js';
import { serializeStory, storyKey } from '../src/story-progress.js';
import { campaignKey, restoreCampaign, loadCampaign, resumeChapter } from '../src/story-campaign.js';

function finished(index) {
  const state = createAdventure(index);
  for (const scene of ADVENTURES[index].scenes) {
    actAdventure(state, { type: 'next' });
    for (const piece of scene.solution) actAdventure(state, { type: 'pick', piece });
    actAdventure(state, { type: 'check' });
    if (state.scene < ADVENTURES[index].scenes.length - 1) actAdventure(state, { type: 'next' });
  }
  return state;
}
const memory = entries => {
  const data = new Map(entries);
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
};
test('only chapter one starts unlocked; final puzzle unlocks the next without waiting for ending navigation', () => {
  assert.equal(restoreCampaign(null).unlockedThrough, 0);
  for (let index = 0; index < ADVENTURES.length; index++) {
    const chapters = ADVENTURES.map(() => null); chapters[index] = finished(index);
    const result = restoreCampaign(null, chapters);
    assert.equal(result.unlockedThrough, Math.min(index + 1, 3));
    assert.equal(result.completed[index], true);
  }
  const state = createAdventure(); actAdventure(state, { type: 'next' });
  assert.deepEqual(restoreCampaign(null, [state]).completed, [false, false, false, false]);
});
test('unlock and completion survive chapter replay, while a story reset clears both', () => {
  const store = memory([[storyKey(0), serializeStory(finished(0))]]);
  assert.equal(loadCampaign(store).unlockedThrough, 1);
  store.setItem(storyKey(0), serializeStory(createAdventure(0)));
  const replay = loadCampaign(store);
  assert.equal(replay.unlockedThrough, 1); assert.equal(replay.completed[0], true);
  const reload = restoreCampaign(store.getItem(campaignKey));
  assert.deepEqual(reload, replay);
  store.data.clear();
  assert.equal(loadCampaign(store).unlockedThrough, 0); assert.equal(store.data.size, 0);
});
test('validated earlier saves keep later chapters accessible; corrupt and incompatible saves cannot unlock them', () => {
  const store = memory([[storyKey(2), serializeStory(createAdventure(2))]]);
  assert.equal(loadCampaign(store).unlockedThrough, 2);
  assert.deepEqual(loadCampaign(store).completed, [false, false, false, false]);
  for (const value of ['{', JSON.stringify({ schema: 1, content: 1, state: createAdventure(3) })]) {
    const invalid = memory([[storyKey(3), value]]);
    assert.equal(loadCampaign(invalid).unlockedThrough, 0);
  }
});
test('malformed campaign metadata safely falls back to chapter evidence', () => {
  for (const raw of ['{', 'null', '{}', '{"schema":99}', '{"schema":1,"unlockedThrough":99,"completed":[]}', '{"schema":1,"unlockedThrough":3,"completed":[1,1,1,1]}']) {
    assert.equal(restoreCampaign(raw).unlockedThrough, 0);
    assert.equal(restoreCampaign(raw, [finished(0)]).unlockedThrough, 1);
  }
});
test('Continue includes an unfinished chapter ending before moving to an untouched next chapter', () => {
  const chapter = finished(0), store = memory([[storyKey(0), serializeStory(chapter)]]);
  assert.equal(resumeChapter(store, loadCampaign(store)), 0);
  actAdventure(chapter, { type: 'next' }); store.setItem(storyKey(0), serializeStory(chapter));
  assert.equal(resumeChapter(store, loadCampaign(store)), 1);
});
