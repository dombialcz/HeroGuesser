import { ADVENTURES, STORY_CONTENT_VERSION, createAdventure } from './mastermind-adventure-core.js';
import { scoreGuess } from './mastermind-core.js';
export const storyKey = index => `heroguesser:story:v1:${ADVENTURES[index].id}`;
export const serializeStory = state => JSON.stringify({ schema: 1, content: STORY_CONTENT_VERSION, state });
export function restoreStory(raw, index) {
  const fallback = createAdventure(index);
  if (raw === null) return { state: fallback, invalid: false };
  try {
    const saved = JSON.parse(raw), s = saved.state;
    const scenes = ADVENTURES[index].scenes;
    // Chapter 1 keeps its original answers and counts. Later chapters changed;
    // never score a previous edition's draft against a different answer.
    const compatible = saved.content === STORY_CONTENT_VERSION || saved.content === 1 && index === 0;
    if (saved.schema !== 1 || !compatible || !s || s.adventure !== index ||
        !Number.isInteger(s.scene) || !scenes[s.scene] || !['intro', 'play', 'solved', 'complete'].includes(s.phase)) throw Error('version');
    const scene = scenes[s.scene];
    const rowValid = (row, answer, partial = false) => Array.isArray(row) && row.length === answer.length &&
      row.every(p => partial && p === null || answer.includes(p)) &&
      [...new Set(row)].filter(Boolean).every(p => row.filter(x => x === p).length <= answer.filter(x => x === p).length);
    if (!rowValid(s.draft, scene.solution, true) || !Array.isArray(s.guesses) || !Array.isArray(s.facts) ||
        !Number.isInteger(s.hint) || s.hint < 0 || s.hint > 2) throw Error('shape');
    const factsExpected = s.scene + (['solved', 'complete'].includes(s.phase) ? 1 : 0);
    if (s.facts.length !== factsExpected || s.facts.some((f, i) => f.scene !== i || JSON.stringify(f.pieces) !== JSON.stringify(scenes[i].solution))) throw Error('facts');
    if (s.phase === 'complete' && s.scene !== scenes.length - 1) throw Error('completion');
    const guesses = s.guesses.map(g => {
      if (!rowValid(g.pieces, scene.solution)) throw Error('guess');
      const score = scoreGuess(scene.solution, g.pieces);
      if (score.exact === scene.solution.length) throw Error('solved guess');
      return { pieces: [...g.pieces], ...score, absent: scene.solution.length - score.exact - score.misplaced };
    });
    if (s.phase !== 'play' && guesses.length || ['solved', 'complete'].includes(s.phase) && JSON.stringify(s.draft) !== JSON.stringify(scene.solution)) throw Error('phase');
    return { invalid: false, state: { ...fallback, scene: s.scene, phase: s.phase, draft: [...s.draft], guesses,
      facts: s.facts.map(f => ({ scene: f.scene, pieces: [...f.pieces] })), hint: s.hint,
      selected: Number.isInteger(s.selected) && s.selected >= 0 && s.selected < s.draft.length ? s.selected : null, notice: null } };
  } catch { return { state: fallback, invalid: true }; }
}
