export function normalizeLocks(value, size, allowed) {
  return Array.from({ length: size }, (_, slot) => typeof value?.[slot] === 'string' && allowed.has(value[slot]) ? value[slot] : null);
}

export const applyLocks = (row, locks = []) => row.map((piece, slot) => locks[slot] ?? piece);

export function copyPastRow(progress, index) {
  if (!Number.isInteger(index) || index < 0 || index >= progress.guesses.length) return null;
  return applyLocks([...progress.guesses[index]], progress.locks);
}

export function toggleLock(progress, slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= progress.draft.length) return false;
  const locks = progress.locks ?? Array(progress.draft.length).fill(null);
  if (!locks[slot] && !progress.draft[slot]) return false;
  progress.locks = [...locks];
  progress.locks[slot] = locks[slot] ? null : progress.draft[slot];
  return true;
}
