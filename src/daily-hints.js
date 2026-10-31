import { applyLocks } from './daily-row-tools.js';

export const HINT_COOLDOWN_MS = 30_000;
export const normalizeHints = (value, size) => Array.from({ length: size }, (_, slot) =>
  value?.[slot] === 'open' || value?.[slot] === 'closed' ? value[slot] : null);

export const hintCooldownRemaining = (progress, now = Date.now()) =>
  Math.max(0, (progress.hintReadyAt ?? 0) - now);

// Eye locks use the same protection as player padlocks, with the answer as authority.
export function restoreHintLocks(locks, hints, challenge) {
  return locks.map((hero, slot) => hints[slot] === 'open' ? challenge.code[slot]
    : hints[slot] === 'closed' ? null : hero);
}

export function revealHint(progress, challenge, now = Date.now(), random = Math.random) {
  if (hintCooldownRemaining(progress, now) > 0) return null;
  const hints = normalizeHints(progress.hints, challenge.size);
  const candidates = hints.flatMap((hint, slot) => hint === null ? [slot] : []);
  if (!candidates.length) return null;
  const slot = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))];
  hints[slot] = 'open';
  progress.hints = hints;
  progress.locks = restoreHintLocks(progress.locks ?? Array(challenge.size).fill(null), hints, challenge);
  progress.draft = applyLocks(progress.draft, progress.locks);
  progress.hintReadyAt = now + HINT_COOLDOWN_MS;
  return slot;
}

export function toggleHint(progress, challenge, slot) {
  if (!Number.isInteger(slot) || !progress.hints?.[slot]) return false;
  progress.hints = [...progress.hints];
  progress.hints[slot] = progress.hints[slot] === 'open' ? 'closed' : 'open';
  progress.locks = restoreHintLocks(progress.locks ?? Array(challenge.size).fill(null), progress.hints, challenge);
  progress.draft = applyLocks(progress.draft, progress.locks);
  return true;
}
