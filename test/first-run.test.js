import test from 'node:test';
import assert from 'node:assert/strict';
import { firstRunKey, readFirstRun, rememberFirstRun, prepareFirstRun } from '../src/first-run.js';
import { needsPrelude, loadCampaign } from '../src/story-campaign.js';
const memory = (entries = []) => {
  const data = new Map(entries);
  return { data, keys: () => [...data.keys()], getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
};
test('a fresh installation waits for an invitation answer; preferences alone do not mark a visit', () => {
  const store = memory([['heroguesser:language', 'pl'], ['heroguesser:music:v1', '{}']]);
  assert.equal(prepareFirstRun(store), null);
  assert.equal(store.getItem(firstRunKey), null);
  rememberFirstRun(store, 'tutorial');
  assert.equal(prepareFirstRun(store), 'tutorial');
});
test('declining the invitation bypasses the prelude without awarding completion', () => {
  const store = memory();
  rememberFirstRun(store, 'skipped');
  assert.equal(readFirstRun(store), 'skipped');
  assert.equal(needsPrelude(store), false);
  assert.equal(loadCampaign(store).preludeCompleted, false);
  store.data.delete(firstRunKey);
  assert.equal(prepareFirstRun(store), null);
  assert.equal(needsPrelude(store), true);
});
test('existing daily and story players keep their progress and avoid an upgrade invitation', () => {
  for (const key of ['heroguesser:v1:2026-10-27:easy', 'heroguesser:story:campaign:v1']) {
    const store = memory([[key, 'existing-save']]);
    assert.equal(prepareFirstRun(store), 'returning');
    assert.equal(store.getItem(key), 'existing-save');
    assert.equal(prepareFirstRun(store), 'returning');
  }
});
test('invalid first-run records safely offer the invitation again', () => {
  for (const raw of ['{', 'null', '{}', '{"schema":2,"choice":"skipped"}', '{"schema":1,"choice":"unknown"}']) {
    const store = memory([[firstRunKey, raw]]);
    assert.equal(prepareFirstRun(store), null);
  }
});
test('the native Preferences adapter restores the first-run answer and queues subsequent writes', async () => {
  const { installNativePlatform, storage } = await import('../src/platform.js?first-run-test');
  const writes = [];
  installNativePlatform({ set: async (key, value) => writes.push([key, value]) }, {
    [firstRunKey]: JSON.stringify({ schema: 1, choice: 'skipped' }),
  });
  assert.equal(prepareFirstRun(storage), 'skipped');
  rememberFirstRun(storage, 'tutorial');
  await storage.flush();
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], firstRunKey);
  assert.equal(JSON.parse(writes[0][1]).choice, 'tutorial');
});
