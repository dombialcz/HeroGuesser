import { firstRunKey } from '../src/first-run.js';
import { createAdventure } from '../src/mastermind-adventure-core.js';
import { serializeStory, storyKey } from '../src/story-progress.js';

// Older players could start any chapter. These fixtures exercise that migration
// in isolated browser contexts without adding a production unlock bypass.
export const existingChapterSave = index => ({ key: storyKey(index), raw: serializeStory(createAdventure(index)) });
export async function seedExistingChapter(page, index) {
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), existingChapterSave(index));
}

// Navigation/gameplay regressions exercise an already answered invitation.
export async function seedFirstRunHandled(target) {
  await target.addInitScript(key => localStorage.setItem(key, JSON.stringify({ schema: 1, choice: 'tutorial' })), firstRunKey);
}
