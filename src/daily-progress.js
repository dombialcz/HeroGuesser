import { HERO_CLASSES, evaluateGuess } from './mastermind-core.js';
const valid = new Set(HERO_CLASSES.map(hero => hero.id));
export const DAILY_SCHEMA = 2;
export const GENERATOR_VERSION = 1;
export const dailyKey = (date, difficulty) => `heroguesser:v1:${date}:${difficulty}`;
export const blankDaily = challenge => ({ guesses: [], draft: Array(challenge.size).fill(null) });
export function restoreDaily(raw, challenge) {
  const fallback = blankDaily(challenge);
  if (raw === null) return { progress: fallback, invalid: false };
  try {
    const saved = JSON.parse(raw);
    if (!saved || (saved.schema !== undefined && saved.schema !== DAILY_SCHEMA) ||
        (saved.generator !== undefined && saved.generator !== GENERATOR_VERSION) || !Array.isArray(saved.guesses)) throw Error('version');
    const guesses = [];
    for (const guess of saved.guesses) {
      if (!Array.isArray(guess) || guess.length !== challenge.size || guess.some(type => !valid.has(type))) throw Error('row');
      guesses.push([...guess]);
      if (evaluateGuess(challenge.code, guess).exact === challenge.size) break;
    }
    const solved = guesses.some(guess => evaluateGuess(challenge.code, guess).exact === challenge.size);
    const draft = Array.isArray(saved.draft) && saved.draft.length === challenge.size
      ? saved.draft.map(type => type === null || valid.has(type) ? type : null) : fallback.draft;
    return { progress: { guesses, draft: solved ? fallback.draft : draft }, invalid: false };
  } catch { return { progress: fallback, invalid: true }; }
}
export const serializeDaily = progress => JSON.stringify({ schema: DAILY_SCHEMA, generator: GENERATOR_VERSION, ...progress });
export function pruneDaily(storage, date) {
  const today = Date.parse(`${date}T00:00:00Z`);
  for (const key of storage.keys()) {
    const match = /^heroguesser:v1:(\d{4}-\d{2}-\d{2}):(easy|medium|hard)$/.exec(key);
    if (match && today - Date.parse(`${match[1]}T00:00:00Z`) >= 90 * 86400000) storage.removeItem(key);
  }
}
export function dailyShareText(challenge, guesses, locale = 'en', name = 'Guild of Wits') {
  const labels = locale === 'pl' ? { easy: 'Łatwy', medium: 'Średni', hard: 'Trudny' } : { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  const solvedAt = guesses.findIndex(guess => evaluateGuess(challenge.code, guess)?.exact === challenge.size);
  if (solvedAt < 0) return null;
  const rows = guesses.slice(0, solvedAt + 1).map(guess => {
    const { exact, misplaced } = evaluateGuess(challenge.code, guess);
    return `${exact} 🟩 · ${misplaced} 🟨 · ${challenge.size - exact - misplaced} ⬜`;
  });
  return [`${name} · ${challenge.dateKey} · ${labels[challenge.id]}`, `${locale === 'pl' ? 'Próby' : 'Guesses'}: ${solvedAt + 1}`, ...rows, 'https://dombialcz.github.io/HeroGuesser/'].join('\n');
}
