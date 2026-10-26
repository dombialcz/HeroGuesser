import { ADVENTURES } from './mastermind-adventure-core.js';
import { restoreStory, storyKey } from './story-progress.js';

// Keep earned access separate from the chapter being replayed. Story resets
// remove this key along with chapter saves; restarting a chapter leaves it.
export const campaignKey = 'heroguesser:story:campaign:v1';
const initial = () => ({ schema: 1, unlockedThrough: 0, completed: ADVENTURES.map(() => false) });
export const chapterFinished = state => state.scene === ADVENTURES[state.adventure].scenes.length - 1 && ['solved', 'complete'].includes(state.phase);

export function restoreCampaign(raw, chapters = []) {
  let campaign = initial();
  try {
    const saved = JSON.parse(raw);
    if (saved?.schema === 1 && Number.isInteger(saved.unlockedThrough) && saved.unlockedThrough >= 0 && saved.unlockedThrough < ADVENTURES.length &&
        Array.isArray(saved.completed) && saved.completed.length === ADVENTURES.length && saved.completed.every(x => typeof x === 'boolean')) {
      campaign = { schema: 1, unlockedThrough: saved.unlockedThrough, completed: [...saved.completed] };
    }
  } catch { /* Invalid metadata falls back to validated chapter saves. */ }
  chapters.forEach((state, index) => {
    if (!state) return;
    // Before chapters were gated, players could start anywhere. Preserve their
    // access without fabricating completion badges for skipped chapters.
    campaign.unlockedThrough = Math.max(campaign.unlockedThrough, index);
    if (chapterFinished(state)) campaign.completed[index] = true;
  });
  campaign.completed.forEach((done, index) => {
    if (done) campaign.unlockedThrough = Math.max(campaign.unlockedThrough, Math.min(index + 1, ADVENTURES.length - 1));
  });
  return campaign;
}

export function loadCampaign(store) {
  const raw = store.getItem(campaignKey);
  const chapters = ADVENTURES.map((_, index) => {
    const saved = store.getItem(storyKey(index));
    if (saved === null) return null;
    const result = restoreStory(saved, index);
    return result.invalid ? null : result.state;
  });
  const progress = restoreCampaign(raw, chapters);
  const serialized = JSON.stringify(progress);
  // Do not recreate a save after Reset Stories when nothing has been earned.
  if (serialized !== JSON.stringify(restoreCampaign(raw))) store.setItem(campaignKey, serialized);
  return progress;
}

export function resumeChapter(store, campaign) {
  const index = campaign.unlockedThrough;
  // Let Continue finish the chapter's ending before entering an untouched next
  // chapter. The chapter list still lets the player choose any earned chapter.
  if (index > 0 && store.getItem(storyKey(index)) === null) {
    const previous = restoreStory(store.getItem(storyKey(index - 1)), index - 1);
    if (!previous.invalid && chapterFinished(previous.state) && previous.state.phase === 'solved') return index - 1;
  }
  return index;
}
