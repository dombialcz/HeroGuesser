import { storage } from './platform.js';

const SOUND_KEY = 'heroguesser:sound';
const urls = {
  placement: Array.from({ length: 7 }, (_, i) => `assets/audio/thud-${String(i + 1).padStart(2, '0')}.wav`),
  correct: ['music/correct.wav'],
  fanfare: ['music/fanfare.wav'],
};
// Fetch early; create/resume the audio device during a real input gesture.
const files = Object.fromEntries(Object.entries(urls).map(([kind, paths]) => [kind, paths.map(url => fetch(url).then(response => {
  if (!response.ok) throw new Error('Unavailable sound');
  return response.arrayBuffer();
}).catch(() => null))]));
let context, ready, completion, previous = -1;
const playing = new Set();

export const soundEnabled = () => storage.getItem(SOUND_KEY) !== 'off';
export function setSoundEnabled(enabled) {
  storage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
  if (!enabled) for (const source of playing) source.stop();
}

function prepare(kind = 'placement') {
  if (!soundEnabled()) return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!context) {
    context = new AudioContext();
    ready = Object.fromEntries(Object.entries(files).map(([name, group]) => [name, Promise.all(group.map(async file => {
      const data = await file;
      return data ? context.decodeAudioData(data).catch(() => null) : null;
    })).then(buffers => buffers.filter(Boolean))]));
  }
  const resumed = context.state === 'suspended' || context.state === 'interrupted'
    ? context.resume().catch(() => {}) : Promise.resolve();
  return Promise.all([ready[kind], resumed]).then(([buffers]) => buffers);
}

for (const event of ['pointerdown', 'keydown']) document.addEventListener(event, () => {
  try { prepare(); } catch { /* Gameplay still works if audio is unavailable. */ }
}, { capture: true, passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) for (const source of playing) source.stop();
});

function playSound(kind) {
  const requested = performance.now();
  void (async () => {
    const buffers = await prepare(kind);
    // Never replay stale input after loading, tab switching or a blocked device.
    if (!buffers?.length || !soundEnabled() || document.hidden || context.state !== 'running' || performance.now() - requested > (kind === 'placement' ? 200 : 1000)) return;
    let index = 0;
    if (kind === 'placement') {
      index = Math.floor(Math.random() * (buffers.length - (previous >= 0 && buffers.length > 1 ? 1 : 0)));
      if (buffers.length > 1 && previous >= 0 && index >= previous) index++;
      previous = index;
    } else completion?.stop();
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffers[index];
    gain.gain.value = kind === 'placement' ? 0.55 : 0.75;
    source.connect(gain).connect(context.destination);
    source.onended = () => {
      playing.delete(source); source.disconnect(); gain.disconnect();
      if (completion === source) completion = null;
    };
    if (kind !== 'placement') completion = source;
    playing.add(source);
    source.start();
  })().catch(() => { /* Missing/unsupported audio must not interrupt gameplay. */ });
}

export const playPlacementSound = () => playSound('placement');
export const playCompletionSound = (chapter = false) => playSound(chapter ? 'fanfare' : 'correct');
