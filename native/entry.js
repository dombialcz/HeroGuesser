import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { installNativePlatform, reportStorageFailure, storage } from '../src/platform.js';

const initial = {};
let readable = true;
try {
  const { keys } = await Preferences.keys();
  for (const key of keys.filter(key => key.startsWith('heroguesser:'))) initial[key] = (await Preferences.get({ key })).value;
} catch { readable = false; reportStorageFailure(); }
installNativePlatform({
  set: (key, value) => readable ? Preferences.set({ key, value }) : Promise.reject(Error('Preferences could not be loaded')),
  remove: key => readable ? Preferences.remove({ key }) : Promise.reject(Error('Preferences could not be loaded')),
  share: text => Share.share({ text }),
  open: url => Browser.open({ url }),
}, initial);
await App.addListener('appStateChange', ({ isActive }) => {
  dispatchEvent(new Event(isActive ? 'heroguesser:foreground' : 'heroguesser:background'));
  if (!isActive) void storage.flush();
});
await import('../src/mastermind-ui.js');
