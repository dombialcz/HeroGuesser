import { confirmAction } from './dialog.js';
import { storage, openExternal } from './platform.js';
import { soundEnabled, setSoundEnabled } from './game-audio.js';
export function installSettings({ getLocale, reset }) {
  const copy = {
    en: { title: 'Settings & About', close: 'Close', version: 'Version 1.0.0 · Development build',
      privacy: 'Your language, daily boards and story progress are saved locally. No account, ads, analytics or purchases. Web and iPhone saves are separate. Device/browser backups may include local data.',
      tutorial: 'The tutorial starts fresh after closing the game. Continue The Cursed Bell from its chapter menu. Resetting story progress also locks later chapters again.',
      stories: 'Reset story progress', dailies: 'Reset daily progress', all: 'Reset all local data',
      confirm: 'Delete this saved data on this device? This cannot be undone.',
      policy: 'Privacy details', support: 'Support', credits: 'Credits',
      creditText: 'Game: dombialcz/HeroGuesser. Character art: generated artwork; source prompts are retained in the repository. Fonts: DM Sans and Marcellus, SIL Open Font License. Native runtime: Capacitor (MIT).',
      sound: 'Sound effects', temporary: 'Saving is unavailable. Current progress is temporary.' },
    pl: { title: 'Ustawienia i informacje', close: 'Zamknij', version: 'Wersja 1.0.0 · Wersja rozwojowa',
      privacy: 'Język, codzienne układy i postęp opowieści zapisują się lokalnie. Bez konta, reklam, analityki i zakupów. Zapisy strony i aplikacji iPhone są osobne. Kopie zapasowe urządzenia lub przeglądarki mogą zawierać te dane.',
      tutorial: 'Po zamknięciu gry samouczek zaczyna się od nowa. Opowieść „Przeklęty dzwon” możesz kontynuować z menu rozdziałów. Usunięcie jej postępu ponownie blokuje dalsze rozdziały.',
      stories: 'Usuń postęp opowieści', dailies: 'Usuń postęp codziennych zagadek', all: 'Usuń wszystkie dane lokalne',
      confirm: 'Usunąć te zapisane dane na tym urządzeniu? Tej operacji nie można cofnąć.',
      policy: 'Prywatność', support: 'Pomoc', credits: 'Autorzy i licencje',
      creditText: 'Gra: dombialcz/HeroGuesser. Postacie: grafika generowana; prompty źródłowe są w repozytorium. Czcionki: DM Sans i Marcellus, SIL Open Font License. Środowisko natywne: Capacitor (MIT).',
      sound: 'Efekty dźwiękowe', temporary: 'Zapis jest niedostępny. Bieżący postęp jest tymczasowy.' },
  };
  document.querySelector('#settings-open').addEventListener('click', () => {
    const locale = getLocale(), c = copy[locale];
    const dialog = document.createElement('dialog'); dialog.id = 'settings-dialog'; dialog.className = 'game-dialog'; dialog.setAttribute('aria-labelledby', 'settings-title');
    dialog.innerHTML = `<h2 id="settings-title">${c.title}</h2><p>${c.version}</p><p>${c.privacy}</p><p>${c.tutorial}</p><p role="status">${storage.failed ? c.temporary : ''}</p><p><a href="privacy.html">${c.policy}</a> · <a href="support.html">${c.support}</a></p><details><summary>${c.credits}</summary><p>${c.creditText}</p></details><div class="settings-resets">${['stories', 'dailies', 'all'].map(kind => `<button type="button" id="reset-${kind}">${c[kind]}</button>`).join('')}</div><button type="button" id="settings-close">${c.close}</button>`;
    const previous = document.activeElement;
    const sound = document.createElement('p');
    sound.innerHTML = `<label><input type="checkbox" id="settings-sound" ${soundEnabled() ? 'checked' : ''}> ${c.sound}</label>`;
    dialog.querySelector('h2').after(sound);
    sound.querySelector('input').addEventListener('change', event => setSoundEnabled(event.target.checked));
    dialog.addEventListener('close', () => { dialog.remove(); previous?.focus(); }, { once: true });
    dialog.querySelector('#settings-close').onclick = () => dialog.close();
    dialog.querySelectorAll('a').forEach(link => link.onclick = event => {
      // Keep gameplay alive while viewing a bundled policy/support document.
      event.preventDefault(); void openExternal(`https://dombialcz.github.io/HeroGuesser/${link.getAttribute('href')}`);
    });
    for (const kind of ['stories', 'dailies', 'all']) dialog.querySelector(`#reset-${kind}`).onclick = async () => {
      if (!await confirmAction(c.confirm, locale)) return;
      reset(kind); await storage.flush(); dialog.close();
    };
    document.body.append(dialog); dialog.showModal(); dialog.querySelector('#settings-close').focus();
  });
}
