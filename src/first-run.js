export const firstRunKey = 'heroguesser:onboarding:v1';
const choices = ['tutorial', 'skipped', 'returning'];

export function readFirstRun(store) {
  try {
    const saved = JSON.parse(store.getItem(firstRunKey));
    return saved?.schema === 1 && choices.includes(saved.choice) ? saved.choice : null;
  } catch { return null; }
}
export function rememberFirstRun(store, choice) {
  if (!choices.includes(choice)) throw Error('Invalid first-run choice');
  store.setItem(firstRunKey, JSON.stringify({ schema: 1, choice }));
}
export function prepareFirstRun(store) {
  const choice = readFirstRun(store);
  if (choice) return choice;
  // Players upgrading with existing boards have already visited the game.
  if (store.keys().some(key => key.startsWith('heroguesser:v1:') || key.startsWith('heroguesser:story:'))) {
    rememberFirstRun(store, 'returning');
    return 'returning';
  }
  return null;
}

const COPY = {
  en: { title: 'Learn the ropes?', text: 'Welcome to Guild of Wits. Try a short, guided story prelude to learn how the puzzles work.', play: 'Play tutorial', skip: 'Skip for now' },
  pl: { title: 'Poznasz zasady?', text: 'Witaj w Guild of Wits. Krótki prolog ze wskazówkami pokaże ci, jak rozwiązywać zagadki.', play: 'Zagraj w samouczek', skip: 'Na razie pomiń' },
};

export function installFirstRun({ store, getLocale, onTutorial, onSkip }) {
  let choice = prepareFirstRun(store), dialog = null;
  function remember(value) { choice = value; rememberFirstRun(store, value); }
  return {
    recordTutorial() { if (!choice) remember('tutorial'); },
    snapshot() { return { choice, invitationOpen: !!dialog }; },
    offer() {
      if (choice || dialog) return;
      const c = COPY[getLocale()];
      dialog = document.createElement('dialog');
      const current = dialog;
      current.className = 'game-dialog first-run-dialog';
      current.id = 'first-run-dialog';
      current.setAttribute('aria-labelledby', 'first-run-title');
      current.setAttribute('aria-describedby', 'first-run-description');
      current.innerHTML = `<h2 id="first-run-title">${c.title}</h2><p id="first-run-description">${c.text}</p><div class="first-run-actions"><button id="first-run-tutorial" type="button">${c.play} →</button><button id="first-run-skip" type="button">${c.skip}</button></div>`;
      let decision = 'skipped';
      current.querySelector('#first-run-tutorial').onclick = () => { decision = 'tutorial'; current.close(); };
      current.querySelector('#first-run-skip').onclick = () => current.close();
      // Escape is the same optional dismissal as Skip for now.
      current.addEventListener('close', () => {
        remember(decision); current.remove(); dialog = null;
        // Let the browser finish restoring modal focus before entering a mode.
        requestAnimationFrame(() => {
          if (decision === 'tutorial') onTutorial();
          else onSkip();
        });
      }, { once: true });
      document.body.append(current); current.showModal();
      current.querySelector('#first-run-tutorial').focus();
    },
  };
}
