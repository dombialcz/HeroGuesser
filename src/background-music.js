import { storage } from './platform.js';
import { getAudioContext } from './game-audio.js';

const KEY = 'heroguesser:music:v1';
const tracks = Array.from({ length: 6 }, (_, i) => `music/dungeon_melody_${i + 1}.mp3`);
function loadSettings() {
  try {
    const saved = JSON.parse(storage.getItem(KEY));
    return {
      enabled: typeof saved?.enabled === 'boolean' ? saved.enabled : true,
      volume: typeof saved?.volume === 'number' && Number.isFinite(saved.volume) ? Math.min(1, Math.max(0, saved.volume)) : 0.5,
    };
  } catch { return { enabled: true, volume: 0.5 }; }
}
let settings = loadSettings(), audio, gain, mediaSource, interacted = false, backgrounded = false;
let order = [], current = -1;
const unavailable = new Set();

export const musicSettings = () => ({ ...settings });

function nextTrack() {
  if (!order.length) {
    order = tracks.map((_, i) => i).filter(i => !unavailable.has(i));
    for (let i = order.length - 1; i > 0; i--) {
      const other = Math.floor(Math.random() * (i + 1));
      [order[i], order[other]] = [order[other], order[i]];
    }
    if (order.length > 1 && order[0] === current) [order[0], order[1]] = [order[1], order[0]];
  }
  if (!order.length) return false;
  current = order.shift();
  audio.src = tracks[current];
  return true;
}

function play() {
  if (!interacted || !settings.enabled || settings.volume === 0 || backgrounded || document.hidden) {
    audio?.pause(); return;
  }
  try {
    const context = getAudioContext();
    if (!context) return;
    if (!audio) {
      audio = new Audio();
      audio.preload = 'none';
      // Use Web Audio gain: iPhone ignores programmatic HTML media volume.
      mediaSource = context.createMediaElementSource(audio);
      gain = context.createGain();
      mediaSource.connect(gain).connect(context.destination);
      audio.addEventListener('ended', () => { if (nextTrack()) play(); });
      audio.addEventListener('error', () => {
        unavailable.add(current); order = order.filter(i => !unavailable.has(i));
        if (nextTrack()) play();
      });
      if (!nextTrack()) return;
    }
    gain.gain.value = settings.volume;
    // Invoke both in the input gesture so Safari can unlock media and its mixer.
    if (context.state === 'suspended' || context.state === 'interrupted') void context.resume().catch(() => {});
    if (audio.paused) void audio.play().catch(() => { /* Retry on the next user gesture if autoplay was blocked. */ });
  } catch { /* Unavailable audio must leave the game playable. */ }
}

export function setMusicSettings(update) {
  if (typeof update.enabled === 'boolean') settings.enabled = update.enabled;
  if (typeof update.volume === 'number' && Number.isFinite(update.volume)) settings.volume = Math.min(1, Math.max(0, update.volume));
  storage.setItem(KEY, JSON.stringify(settings));
  if (gain) gain.gain.value = settings.volume;
  play();
}

export function refreshMusicSettings() {
  settings = loadSettings();
  if (gain) gain.gain.value = settings.volume;
  play();
}

for (const event of ['pointerdown', 'keydown', 'click']) document.addEventListener(event, () => {
  interacted = true; play();
}, { capture: true, passive: true });
addEventListener('heroguesser:background', () => { backgrounded = true; audio?.pause(); });
addEventListener('heroguesser:foreground', () => { backgrounded = false; play(); });
addEventListener('pagehide', () => { backgrounded = true; audio?.pause(); });
addEventListener('pageshow', () => { backgrounded = false; play(); });
