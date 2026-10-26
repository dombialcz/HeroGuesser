// The browser uses localStorage. The native entry installs Preferences before game imports.
const memory = new Map();
let native = null;
let queue = Promise.resolve();
let failed = false;
const notify = () => globalThis.dispatchEvent?.(new Event('heroguesser:storage'));
function failure() { failed = true; notify(); }
function enqueue(task) {
  queue = queue.then(task).catch(failure);
}
export function installNativePlatform(adapter, initial) {
  native = adapter;
  memory.clear();
  for (const [key, value] of Object.entries(initial)) memory.set(key, value);
}
export function reportStorageFailure() { failure(); }
export const storage = {
  get failed() { return failed; },
  getItem(key) {
    if (native) return memory.get(key) ?? null;
    try { const value = localStorage.getItem(key); if (value !== null) memory.set(key, value); return value ?? memory.get(key) ?? null; }
    catch { failure(); return memory.get(key) ?? null; }
  },
  setItem(key, value) {
    memory.set(key, value);
    if (native) { enqueue(() => native.set(key, value)); return; }
    try { localStorage.setItem(key, value); } catch { failure(); }
  },
  removeItem(key) {
    memory.delete(key);
    if (native) { enqueue(() => native.remove(key)); return; }
    try { localStorage.removeItem(key); } catch { failure(); }
  },
  keys() {
    if (native) return [...memory.keys()];
    try { return [...new Set([...Object.keys(localStorage), ...memory.keys()])]; }
    catch { failure(); return [...memory.keys()]; }
  },
  async flush() { await queue; },
};
export async function shareText(text) {
  try {
    if (native) { await native.share(text); return 'shared'; }
    if (globalThis.navigator?.share) { await navigator.share({ text }); return 'shared'; }
  } catch (error) {
    if (error.name === 'AbortError' || /cancel/i.test(error.message ?? '')) return 'cancelled';
    // Unsupported sharing falls back to copying or selectable text.
  }
  try { await navigator.clipboard.writeText(text); return 'copied'; }
  catch { return 'manual'; }
}
export async function openExternal(url) {
  const parsed = new URL(url, location.href);
  if (!['https:', 'mailto:'].includes(parsed.protocol)) return;
  if (native) return native.open(parsed.href);
  window.open(parsed.href, '_blank', 'noopener,noreferrer');
}
