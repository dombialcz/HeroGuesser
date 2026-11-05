import { restoreDaily, serializeDaily } from './daily-progress.js';
import { readFirstRun } from './first-run.js';

export const warmupKey = 'heroguesser:warmup:v1';
export const difficultyKey = 'heroguesser:last-difficulty:v1';
export const WARMUP_HEROES = ['knight', 'thief', 'bard', 'cleric'];
export const WARMUP = Object.freeze({ id: 'warmup', size: 3, code: ['knight', 'bard', 'thief'],
  clues: ['knight', 'bard', 'thief'].map(type => ({ kind: 'single', type })) });
export const newWarmup = () => ({ status: 'active', progress: { guesses: [], draft: ['knight', 'thief', 'cleric'] } });
export function loadWarmup(store) {
  try {
    const saved = JSON.parse(store.getItem(warmupKey));
    if (saved?.schema === 1 && ['active', 'completed', 'skipped'].includes(saved.status)) {
      const restored = restoreDaily(JSON.stringify(saved.progress), WARMUP);
      if (!restored.invalid && (restored.progress.guesses.length || restored.progress.draft.join() === 'knight,thief,cleric')) return { status: saved.status, progress: restored.progress };
    }
  } catch { /* Fall back to a new worked example. */ }
  return newWarmup();
}
export function saveWarmup(store, warmup) {
  store.setItem(warmupKey, JSON.stringify({ schema: 1, status: warmup.status, progress: JSON.parse(serializeDaily(warmup.progress)) }));
}
export function needsWarmup(store) {
  if (store.getItem(warmupKey) !== null) return loadWarmup(store).status === 'active';
  return !readFirstRun(store) && !store.keys().some(key => key.startsWith('heroguesser:v1:') || key.startsWith('heroguesser:story:'));
}
export function readDifficulty(store) {
  const id = store.getItem(difficultyKey);
  return ['easy', 'medium', 'hard', 'chaos'].includes(id) ? id : 'easy';
}
export function completionSummary(challenge, progress) {
  const solvedAt = progress.guesses.findIndex(row => row.every((hero, i) => hero === challenge.code[i]));
  return { solved: solvedAt >= 0, guesses: solvedAt + 1, reveals: (progress.hints ?? []).filter(Boolean).length };
}
export function publicRoster(challenge) {
  const known = challenge.clues.map(clue => ({ ...clue, count: clue.kind === 'trio' ? 3 : clue.kind === 'pair' ? 2 : 1 }));
  return { known, remaining: challenge.size - known.reduce((sum, clue) => sum + clue.count, 0) };
}
export function nextPuzzleIn(now = new Date()) {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const minutes = Math.max(1, Math.ceil((midnight - now) / 60000));
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
