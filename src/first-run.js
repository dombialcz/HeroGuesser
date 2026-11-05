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
