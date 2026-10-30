import { applyLocks, copyPastRow, toggleLock } from './daily-row-tools.js';
import { createPortrait, animatePlacement, animateResultStamp } from "./portraits.js";
import { storage, shareText } from "./platform.js";
import { dailyKey, restoreDaily, serializeDaily, pruneDaily, dailyShareText } from "./daily-progress.js";
import { showShareText } from "./dialog.js";
import { installSettings } from "./settings.js";
import { playPlacementSound, playRemovalSound, playCompletionSound } from "./game-audio.js";
import { localDateKey } from "./date.js";
import { CHALLENGES, HERO_CLASSES, evaluateGuess, generateChallenge } from "./mastermind-core.js";
import { createMastermindCelebration } from "./mastermind-celebration.js";
import { installPortraitDrag } from "./mastermind-drag.js";
import { installMastermindTutorial } from "./mastermind-tutorial.js";
import { installMastermindAdventures } from "./mastermind-adventure.js";
import { ADVENTURES } from "./mastermind-adventure-core.js";
import { completePrelude } from "./story-campaign.js";
import { installFirstRun } from "./first-run.js";
import { PARTY_NAMES } from "./mastermind-names.js";

const HERO_BY_ID = Object.fromEntries(HERO_CLASSES.map((hero) => [hero.id, hero]));
const COPY = {
  en: {
    home: "Home", homeKicker: "THE PARTY IS A PUZZLE", homeSubtitle: "Read the clues. Find your party.",
    playStories: "Play Story", playDaily: "Daily Puzzles", tutorialReminder: "The tutorial is always in Stories → Prelude.",
    storiesKicker: "A PRELUDE · FOUR CHAPTERS", storiesTitle: "The Cursed Bell", storiesDescription: "A thief, a tavern, a bell that should never ring. Follow the clues through a prelude and four chapters.",
    dailyKicker: "A FRESH CODE EVERY DAY", dailyTitle: "Four hidden formations", dailyDescription: "Four fresh puzzles every day. Read the clues and find your party.",
    brandKicker: "DAILY CHALLENGE",
    gameKicker: "THE DAILY HERO CODE",
    dailyBoardTitle: "Quests",
    gameTitle: "Guild of Wits",
    gameSubtitle: "Read the party name. Rebuild the formation.",
    languageLabel: "Language",
    difficultyLabel: "Daily challenge difficulty",
    guessRowsLabel: "Guess history and current formation",
    currentFormation: "Current formation",
    historyLabel: "Previous guesses, newest first",
    heroClassesLabel: "Hero classes",
    feedbackLegendLabel: "Feedback legend",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    chaos: "Party Roll",
    partyRollSubtitle: "Five random slots. Any hero, any number of times.",
    partyRollRule: "Each of the five slots can hold any of the seven heroes. Repeats are unrestricted—even five of the same hero. Use the feedback to find the order. Everyone gets the same Party Roll puzzle for today’s date.",
    heroes: "heroes",
    todaysParty: "GUILD COMMISSION · DAILY",
    nameClues: "Name clues",
    nameCluesHint: "Each word reveals an exact class count.",
    guessBoard: "Guess board",
    boardSubtitle: "Lock a hero to keep it in later attempts.",
    formation: "FORMATION",
    feedback: "FEEDBACK",
    submitGuess: "Check guess",
    challengeComplete: "Challenge complete",
    clearRow: "Clear current row",
    exactLegend: "Right class, right place",
    misplacedLegend: "Right class, different place",
    absentLegend: "Not included: wrong class or extra copy",
    chooseHeroes: "Choose heroes",
    pickerSubtitle: "Select a class to fill the next open place.",
    keyboardPick: "quick pick",
    keyboardSubmit: "submit",
    dailyNote: "Four new formations arrive each day.",
    dailyFooter: "A new code every day · Four challenges",
    formationRules: "Formation rules", controls: "Controls",
    ruleNote: "No prefix means no pair. No class appears four times; each named duplicate is exact, and every other hero is a singleton.",
    exactCount: (count) => `Exactly ${count}`,
    rowLabel: (number) => `Guess ${number}`,
    emptyPlace: (place) => `Place ${place}, empty`,
    filledPlace: (place, hero) => `Place ${place}, ${hero}. Activate to clear it.`,
    heroChoice: (hero, key) => `Add ${hero}. Keyboard shortcut ${key}.`,
    feedbackCount: (exact, misplaced, absent) => `${exact} in place, ${misplaced} elsewhere, ${absent} not included (wrong class or extra copy)`,
    attempts: (used) => `${used} ${used === 1 ? "guess" : "guesses"}`,
    dateLocale: "en-GB",
    unsolvedMessage: "Choose a hero to fill the highlighted row. Select a filled place to change it.",
    solvedMessage: (attempts, party) => `Solved in ${attempts} ${attempts === 1 ? "guess" : "guesses"}. The hidden party was ${party}.`,
    dragHint: "Hold a portrait, then drag to move or swap it. Drag from an earlier guess to copy a hero, or use Copy for the whole attempt. Padlocks keep heroes in place after checking, clearing or copying. Unlock above a slot to edit it. Unlimited guesses.",
    copyRow: 'Copy', copyRowLabel: n => `Copy guess ${n}; keep locked heroes`,
    lockPlace: (n, hero) => `Lock ${hero} in place ${n} for later attempts`,
    unlockPlace: (n, hero) => `Unlock ${hero} in place ${n}`,
    emptyLock: n => `Place a hero in slot ${n} before locking it`,
    lockedPlace: (n, hero) => `Place ${n}: ${hero}, locked. Unlock using the padlock above.`,
    copyHero: (hero) => `Copy ${hero} to the next open place, or hold and drag to a place.`,
    heroNames: {
      knight: "Knight", thief: "Thief", bard: "Bard", cleric: "Cleric",
      barbarian: "Barbarian", ranger: "Ranger", mage: "Mage",
    },
    heroPlural: {
      knight: "Knights", thief: "Thieves", bard: "Bards", cleric: "Clerics",
      barbarian: "Barbarians", ranger: "Rangers", mage: "Mages",
    },
  },
  pl: {
    home: "Ekran główny", homeKicker: "DRUŻYNA PEŁNA ZAGADEK", homeSubtitle: "Odczytaj wskazówki. Odtwórz drużynę.",
    playStories: "Opowieść", playDaily: "Codzienne zagadki", tutorialReminder: "Samouczek znajdziesz w Opowieści → Prolog.",
    storiesKicker: "PROLOG · CZTERY ROZDZIAŁY", storiesTitle: "Przeklęty dzwon", storiesDescription: "Złodziej, karczma i dzwon, który nie powinien zabrzmieć. Podążaj za wskazówkami przez prolog i cztery rozdziały.",
    dailyKicker: "NOWY KOD KAŻDEGO DNIA", dailyTitle: "Cztery ukryte drużyny", dailyDescription: "Cztery nowe zagadki każdego dnia. Odczytaj wskazówki i odtwórz drużynę.",
    brandKicker: "CODZIENNE WYZWANIE",
    gameKicker: "CODZIENNY KOD BOHATERÓW",
    dailyBoardTitle: "Zadania",
    gameTitle: "Guild of Wits",
    gameSubtitle: "Odczytaj nazwę drużyny. Odtwórz jej skład.",
    languageLabel: "Język",
    difficultyLabel: "Poziom dzisiejszego wyzwania",
    guessRowsLabel: "Historia prób i bieżąca drużyna",
    currentFormation: "Bieżący skład",
    historyLabel: "Wcześniejsze próby, od najnowszej",
    heroClassesLabel: "Klasy bohaterów",
    feedbackLegendLabel: "Legenda wyników",
    easy: "Łatwy",
    medium: "Średni",
    hard: "Trudny",
    chaos: "Drużyna z przypadku",
    partyRollSubtitle: "Pięć losowych miejsc. Każdy bohater może się powtarzać.",
    partyRollRule: "Na każdym z pięciu miejsc może stanąć dowolny z siedmiu bohaterów. Powtórzenia są dowolne — nawet pięć razy ten sam bohater. Odkryj kolejność dzięki wynikom prób. Dzisiejsza „Drużyna z przypadku” jest taka sama dla wszystkich.",
    heroes: "bohaterów",
    todaysParty: "ZLECENIE GILDII · NA DZIŚ",
    nameClues: "Wskazówki w nazwie",
    nameCluesHint: "Każde słowo wskazuje dokładną liczbę klas.",
    guessBoard: "Twoje próby",
    boardSubtitle: "Zablokuj bohatera, aby zachować go w kolejnych próbach.",
    formation: "SKŁAD",
    feedback: "WYNIK",
    submitGuess: "Sprawdź skład",
    challengeComplete: "Wyzwanie ukończone",
    clearRow: "Wyczyść bieżący wiersz",
    exactLegend: "Dobra klasa, dobre miejsce",
    misplacedLegend: "Dobra klasa, inne miejsce",
    absentLegend: "Brak w składzie: inna klasa lub nadmiarowa kopia",
    chooseHeroes: "Wybierz bohaterów",
    pickerSubtitle: "Wybierz klasę, aby uzupełnić kolejne wolne miejsce.",
    keyboardPick: "wybór klas",
    keyboardSubmit: "zatwierdź",
    dailyNote: "Każdego dnia czekają cztery nowe składy.",
    dailyFooter: "Nowy kod każdego dnia · Cztery wyzwania",
    formationRules: "Zasady składu", controls: "Sterowanie",
    ruleNote: "Brak przedrostka oznacza brak pary. Żadna klasa nie występuje cztery razy; wskazane duplikaty są dokładne, a pozostałe klasy pojawiają się pojedynczo.",
    exactCount: (count) => `Dokładnie ${count}×`,
    rowLabel: (number) => `Próba ${number}`,
    emptyPlace: (place) => `Miejsce ${place}, puste`,
    filledPlace: (place, hero) => `Miejsce ${place}, ${hero}. Naciśnij, aby usunąć.`,
    heroChoice: (hero, key) => `Dodaj: ${hero}. Skrót klawiszowy ${key}.`,
    feedbackCount: (exact, misplaced, absent) => `${exact} na miejscu, ${misplaced} w innym miejscu, ${absent} poza składem (inna klasa lub nadmiarowa kopia)`,
    attempts: (used) => `Próby: ${used}`,
    dateLocale: "pl-PL",
    unsolvedMessage: "Wybierz klasę, aby wypełnić podświetlony wiersz. Naciśnij zajęte miejsce, aby je zmienić.",
    solvedMessage: (attempts, party) => `Rozszyfrowano w ${attempts} ${attempts === 1 ? "próbie" : "próbach"}. Ukryta drużyna: ${party}.`,
    dragHint: "Przytrzymaj portret i przeciągnij, aby przenieść lub zamienić bohaterów. Kopiuj odtwarza całą próbę, zachowując zablokowanych bohaterów. Kłódka zachowuje bohatera po sprawdzeniu i czyszczeniu. Odblokuj miejsce, aby je zmienić. Bez limitu prób.",
    copyRow: 'Kopiuj', copyRowLabel: n => `Skopiuj próbę ${n}; zachowaj zablokowanych bohaterów`,
    lockPlace: (n, hero) => `Zablokuj: ${hero}, na miejscu ${n} w kolejnych próbach`,
    unlockPlace: (n, hero) => `Odblokuj: ${hero}, na miejscu ${n}`,
    emptyLock: n => `Umieść bohatera na miejscu ${n}, aby go zablokować`,
    lockedPlace: (n, hero) => `Miejsce ${n}: ${hero}, zablokowane. Odblokuj kłódką powyżej.`,
    copyHero: (hero) => `Skopiuj: ${hero}, na kolejne wolne miejsce lub przytrzymaj i przeciągnij.`,
    heroNames: {
      knight: "Rycerz", thief: "Złodziej", bard: "Bard", cleric: "Kleryk",
      barbarian: "Barbarzyńca", ranger: "Łowca", mage: "Mag",
    },
    heroPlural: {
      knight: "rycerzy", thief: "złodziei", bard: "bardów", cleric: "kleryków",
      barbarian: "barbarzyńców", ranger: "łowców", mage: "magów",
    },
  },
};

let dateKey = localDateKey();
let invalidDaily = false;
let dailyNotice = null;
let levels = Object.fromEntries(
  CHALLENGES.map((challenge) => [challenge.id, generateChallenge(dateKey, challenge.id)]),
);
let progress = Object.fromEntries(CHALLENGES.map((challenge) => [challenge.id, restoreProgress(challenge)]));
const state = { screen: "home", difficulty: "easy", locale: readLocale(), selectedSlot: 0 };

const todayDate = document.querySelector("#today-date");
const languageButtons = [...document.querySelectorAll("[data-locale]")];
const challengeTabs = [...document.querySelectorAll("[data-challenge]")];
const partyName = document.querySelector("#party-name");
const missionLevel = document.querySelector("#mission-level");
const clueParts = document.querySelector("#clue-parts");
const guessCounter = document.querySelector("#guess-counter");
const guessBoard = document.querySelector("#guess-board");
const currentGuess = document.querySelector("#current-guess");
const guessHistory = document.querySelector("#guess-history");
const heroPicker = document.querySelector("#hero-picker");
const clearButton = document.querySelector("#clear-button");
const submitButton = document.querySelector("#submit-button");
const gameMessage = document.querySelector("#game-message");
let portraitDrag, firstRun;
let tutorialReminder = false;
const celebration = createMastermindCelebration({ getLocale: () => state.locale });
const tutorial = installMastermindTutorial({
  root: document.querySelector("#mastermind-tutorial"),
  entry: document.querySelector("#mastermind-tutorial-entry"),
  getLocale: () => state.locale,
  celebration,
  onComplete: () => completePrelude(storage),
  onAdventureStart: () => adventures.continueStory(),
  onDailyStart: () => { showScreen("daily"); chooseChallenge("easy"); },
  onModeChange: active => {
    if (active) firstRun?.recordTutorial();
    portraitDrag?.cancel();
    celebration.clear();
    state.screen = active ? "tutorial" : "home";
    render();
    if (!active) {
      if (state.screen === "home") clearModeParams();
      focusScreen();
    }
  },
});

const adventures = installMastermindAdventures({
  root: document.querySelector("#mastermind-adventure"),
  entry: document.querySelector("#mastermind-adventure-entry"),
  getLocale: () => state.locale,
  celebration,
  onPreludeStart: () => tutorial.start(),
  onModeChange: active => {
    portraitDrag?.cancel();
    celebration.clear();
    state.screen = active ? "adventure" : "stories";
    render();
    if (!active) focusScreen();
  },
});

function focusScreen() {
  const target = { home: "mastermind-home-title", stories: "stories-title", daily: "daily-title" }[state.screen];
  if (target) document.getElementById(target).focus();
}
function clearModeParams() {
  const url = new URL(location.href);
  for (const key of ["tutorial", "adventure", "daily"]) url.searchParams.delete(key);
  history.replaceState(null, "", url);
}
function showScreen(screen) {
  celebration.clear();
  // Tutorial is temporary; each adventure and daily saves independently.
  if (tutorial.active) tutorial.leave();
  if (adventures.active) adventures.leave();
  portraitDrag?.cancel();
  state.screen = screen;
  tutorialReminder = false;
  if (screen === "daily") checkDate(false);
  if (screen === "home") clearModeParams();
  render(); focusScreen();
}

function copy() {
  return COPY[state.locale];
}

function readLocale() {
  try {
    return storage.getItem("heroguesser:language") === "pl" ? "pl" : "en";
  } catch {
    return "en";
  }
}

function setLocale(locale) {
  celebration.clear();
  if (!COPY[locale]) return;
  state.locale = locale;
  try {
    storage.setItem("heroguesser:language", locale);
  } catch {
    // Keep the selected language for this page even if storage is unavailable.
  }
  render();
}

function localizedHero(type) {
  return copy().heroNames[type] ?? HERO_BY_ID[type].label;
}

function localizedPlural(type) {
  return copy().heroPlural[type] ?? copy().heroNames[type];
}

function localizedPartyName(challenge) {
  if (challenge.id === "chaos") return copy().chaos;
  if (state.locale === "en") return challenge.title;
  const names = PARTY_NAMES[state.locale];
  const pair = challenge.clues.find((clue) => clue.kind === "pair");
  const trio = challenge.clues.find((clue) => clue.kind === "trio");
  const single = challenge.clues.find((clue) => clue.kind === "single");
  return [
    ...(pair ? [names.pair[pair.type]] : []),
    names.trio[trio.type],
    names.single[single.type],
  ].join(" ");
}

function restoreProgress(challenge) {
  const restored = restoreDaily(storage.getItem(dailyKey(dateKey, challenge.id)), levels[challenge.id]);
  if (restored.invalid) invalidDaily = true;
  return restored.progress;
}
function saveProgress() {
  storage.setItem(dailyKey(dateKey, state.difficulty), serializeDaily(currentProgress()));
}
function checkDate(redraw = true) {
  if (state.screen === 'adventure' || state.screen === 'tutorial') return false;
  const nextDate = localDateKey();
  if (nextDate === dateKey) return false;
  saveProgress(); portraitDrag?.cancel(); celebration.clear();
  dateKey = nextDate;
  invalidDaily = false;
  levels = Object.fromEntries(CHALLENGES.map(c => [c.id, generateChallenge(dateKey, c.id)]));
  progress = Object.fromEntries(CHALLENGES.map(c => [c.id, restoreProgress(c)]));
  state.selectedSlot = 0;
  pruneDaily(storage, dateKey);
  dailyNotice = 'rollover';
  if (redraw) render();
  return true;
}
function dateGuard() { return checkDate(); }

function currentChallenge() {
  return levels[state.difficulty];
}

function currentProgress() {
  return progress[state.difficulty];
}

function currentResult(guess, challenge = currentChallenge()) {
  const result = evaluateGuess(challenge.code, guess);
  return result ? { ...result, absent: challenge.size - result.exact - result.misplaced } : null;
}

function isFinished(id = state.difficulty, guesses = progress[id].guesses) {
  const challenge = levels[id];
  return guesses.some((guess) => evaluateGuess(challenge.code, guess)?.exact === challenge.size);
}

function chooseChallenge(id) {
  checkDate(false);
  celebration.clear();
  if (!levels[id]) return;
  state.difficulty = id;
  const draft = currentProgress().draft;
  const emptyIndex = draft.findIndex((type, index) => type === null && !currentProgress().locks?.[index]);
  state.selectedSlot = emptyIndex >= 0 ? emptyIndex : Math.max(0, draft.length - 1);
  render();
}

function placeHero(type) {
  if (dateGuard()) return;
  if (isFinished()) return;
  const draft = currentProgress().draft;
  let slot = draft.findIndex((value, index) => index >= state.selectedSlot && value === null && !currentProgress().locks?.[index]);
  if (slot < 0) slot = draft.findIndex((value, index) => value === null && !currentProgress().locks?.[index]);
  if (slot < 0) return;
  draft[slot] = type;
  playPlacementSound();
  const nextEmpty = draft.findIndex((value, index) => index > slot && value === null);
  state.selectedSlot = nextEmpty >= 0 ? nextEmpty : Math.max(0, draft.findIndex((value) => value === null));
  if (state.selectedSlot < 0) state.selectedSlot = slot;
  saveProgress();
  render();
  animatePlacement(currentGuess.querySelector(`[data-slot="${slot}"] .portrait-frame`));
}

function selectSlot(index) {
  if (dateGuard()) return;
  if (isFinished() || !Number.isInteger(index) || index < 0 || index >= currentChallenge().size || currentProgress().locks?.[index]) return;
  const draft = currentProgress().draft;
  if (draft[index] !== null) { draft[index] = null; playRemovalSound(); }
  state.selectedSlot = index;
  saveProgress();
  render();
}

function submitGuess() {
  if (dateGuard()) return;
  const challenge = currentChallenge();
  const current = currentProgress();
  if (isFinished() || current.draft.some((type) => type === null)) return;
  current.guesses.push([...current.draft]);
  current.draft = applyLocks(Array(challenge.size).fill(null), current.locks);
  state.selectedSlot = current.draft.findIndex(type => type === null);
  saveProgress();
  render();
  animateResultStamp(guessHistory.firstElementChild?.querySelector(".row-feedback"));
  if (isFinished()) { celebration.play({ kind: "daily" }); playCompletionSound(); }
}

function copyGuess(index) {
  if (dateGuard() || isFinished()) return;
  const row = copyPastRow(currentProgress(), index);
  if (!row) return;
  currentProgress().draft = row;
  state.selectedSlot = row.findIndex((_, slot) => !currentProgress().locks?.[slot]);
  saveProgress(); render();
  const focus = currentGuess.querySelector('.guess-tile:not(:disabled)') ?? currentGuess.querySelector('.slot-lock-button');
  focus?.focus();
  document.querySelector('#daily-guess-tools-status').textContent = state.locale === 'pl'
    ? `Próba ${index + 1} skopiowana. Zablokowani bohaterowie pozostali na swoich miejscach.`
    : `Guess ${index + 1} copied. Locked heroes stay in place.`;
}

function lockSlot(slot) {
  if (dateGuard() || isFinished() || !toggleLock(currentProgress(), slot)) return;
  state.selectedSlot = currentProgress().draft.findIndex((piece, index) => !piece && !currentProgress().locks?.[index]);
  saveProgress(); render();
  currentGuess.querySelector(`[data-lock-slot="${slot}"]`)?.focus({ preventScroll: true });
}

function clearDraft() {
  if (dateGuard()) return;
  if (isFinished()) return;
  currentProgress().draft = applyLocks(Array(currentChallenge().size).fill(null), currentProgress().locks);
  state.selectedSlot = currentProgress().draft.findIndex(type => type === null);
  saveProgress();
  render();
}

function applyCopy() {
  const strings = copy();
  const reminder = document.querySelector('#home-tutorial-note');
  reminder.hidden = !tutorialReminder;
  reminder.textContent = tutorialReminder ? strings.tutorialReminder : '';
  document.documentElement.lang = state.locale;
  document.title = strings.gameTitle;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = strings[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  document.querySelectorAll("[data-challenge]").forEach((button) => {
    button.setAttribute("aria-label", `${strings[button.dataset.challenge]}, ${levels[button.dataset.challenge].size} ${strings.heroes}`);
  });
  clearButton.setAttribute("aria-label", strings.clearRow);
  clearButton.title = strings.clearRow;
  document.querySelector(".language-switch").setAttribute("aria-label", strings.languageLabel);
  document.querySelector(".difficulty-tabs").setAttribute("aria-label", strings.difficultyLabel);
  guessBoard.setAttribute("aria-label", strings.guessRowsLabel);
  guessBoard.setAttribute("aria-describedby", "drag-hint");
  currentGuess.setAttribute("aria-label", strings.currentFormation);
  guessHistory.setAttribute("aria-label", strings.historyLabel);
  heroPicker.setAttribute("aria-label", strings.heroClassesLabel);
  document.querySelector(".board-legend").setAttribute("aria-label", strings.feedbackLegendLabel);
  const isPartyRoll = currentChallenge().id === "chaos";
  document.querySelector("#party-roll-note").hidden = !isPartyRoll;
  document.querySelector("#rule-note").textContent = isPartyRoll ? strings.partyRollRule : strings.ruleNote;
  languageButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.locale === state.locale)));
  todayDate.dateTime = dateKey;
  todayDate.textContent = new Intl.DateTimeFormat(strings.dateLocale, {
    weekday: "short", month: "short", day: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function applyHeroAppearance(element, hero) {
  element.dataset.hero = hero.id;
  element.style.setProperty("--hero-color", hero.color);
  element.style.setProperty("--hero-tint", `${hero.color}24`);
}

function makeCluePart(clue) {
  const strings = copy();
  const hero = HERO_BY_ID[clue.type];
  const count = clue.kind === "pair" ? 2 : clue.kind === "trio" ? 3 : 1;
  const chip = document.createElement("article");
  chip.className = `clue-card clue-${clue.kind}`;
  applyHeroAppearance(chip, hero);
  const image = createPortrait(hero.image, localizedHero(hero.id));
  const text = document.createElement("span");
  text.className = "clue-text";
  const kind = document.createElement("span");
  kind.className = "clue-kind";
  kind.textContent = PARTY_NAMES[state.locale][clue.kind][clue.type];
  const title = document.createElement("strong");
  title.textContent = localizedHero(clue.type);
  const exact = document.createElement("small");
  exact.textContent = state.locale === "pl"
    ? `${strings.exactCount(count)} ${count === 1 ? localizedHero(clue.type).toLowerCase() : localizedPlural(clue.type)}.`
    : `${strings.exactCount(count)} ${count === 1 ? localizedHero(clue.type) : strings.heroPlural[clue.type]}.`;
  text.append(kind, title, exact);
  chip.append(image, text);
  return chip;
}

function renderClues(challenge) {
  const isPartyRoll = challenge.id === "chaos";
  document.querySelector(".clue-area").hidden = isPartyRoll;
  document.querySelector(".clue-divider").hidden = isPartyRoll;
  clueParts.replaceChildren(...challenge.clues.map(makeCluePart));
}

function renderFeedback(result) {
  const feedback = document.createElement("span");
  feedback.className = "row-feedback";
  feedback.setAttribute("role", "group");
  const label = copy().feedbackCount(result.exact, result.misplaced, result.absent);
  feedback.setAttribute("aria-label", label);
  feedback.title = label;
  for (const [kind, count, legend] of [
    ["exact", result.exact, copy().exactLegend],
    ["misplaced", result.misplaced, copy().misplacedLegend],
    ["absent", result.absent, copy().absentLegend],
  ]) {
    const score = document.createElement("span");
    score.className = `feedback-score ${kind}-score`;
    score.setAttribute('aria-hidden', 'true');
    score.title = `${count} · ${legend}`;
    const dot = document.createElement("i");
    dot.className = `feedback-dot ${kind}`;
    dot.setAttribute("aria-hidden", "true");
    const number = document.createElement("b");
    number.textContent = String(count);
    score.append(dot, number);
    feedback.append(score);
  }
  return feedback;
}

function makePlaceTab(index) {
  const tab = document.createElement("span");
  tab.className = "tile-position";
  tab.setAttribute("aria-hidden", "true");
  tab.textContent = String(index + 1);
  return tab;
}

function makeLineup(challenge, guess, currentRow = false, rowIndex = 0, current = currentProgress()) {
  const lineup = document.createElement("span");
  lineup.className = "row-lineup";
  lineup.style.setProperty("--party-size", challenge.size);
  if (!currentRow && guess) {
    for (const [index, type] of guess.entries()) {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.disabled = isFinished();
      tile.dataset.slot = String(index);
      tile.dataset.historyRow = String(rowIndex);
      tile.setAttribute("aria-label", copy().copyHero(localizedHero(type)));
      tile.addEventListener("click", () => placeHero(type));
      tile.className = "guess-tile";
      applyHeroAppearance(tile, HERO_BY_ID[type]);
      const image = createPortrait(HERO_BY_ID[type].image, localizedHero(type));
      tile.append(image, makePlaceTab(index));
      lineup.append(tile);
    }
    return lineup;
  }
  for (let index = 0; index < challenge.size; index += 1) {
    const type = currentRow ? current.draft[index] : null;
    const tile = document.createElement(currentRow ? "button" : "span");
    tile.className = `guess-tile${type ? " tile-filled" : " tile-empty"}`;
    if (currentRow) {
      tile.type = "button";
      tile.dataset.slot = String(index);
      tile.setAttribute("aria-current", String(index === state.selectedSlot && !current.locks?.[index]));
      tile.setAttribute("aria-label", type
        ? copy().filledPlace(index + 1, localizedHero(type))
        : copy().emptyPlace(index + 1));
      tile.disabled = isFinished() || !!current.locks?.[index];
      if (current.locks?.[index]) { tile.dataset.locked = 'true'; tile.setAttribute('aria-label', copy().lockedPlace(index + 1, localizedHero(type))); }
      tile.addEventListener("click", () => selectSlot(index));
    } else {
      tile.setAttribute("aria-hidden", "true");
    }
    if (type) {
      applyHeroAppearance(tile, HERO_BY_ID[type]);
      const image = createPortrait(HERO_BY_ID[type].image, localizedHero(type));
      tile.append(image);
      if (currentRow) {
        const remove = document.createElement("span");
        remove.className = "tile-remove";
        remove.textContent = "×";
        tile.append(remove);
      }
    }
    tile.append(makePlaceTab(index));
    if (currentRow) {
      const cell = document.createElement('span'); cell.className = 'guess-slot';
      const lock = document.createElement('button'); lock.type = 'button'; lock.className = 'slot-lock-button'; lock.dataset.lockSlot = String(index);
      lock.disabled = !type || isFinished(); lock.setAttribute('aria-pressed', String(!!current.locks?.[index]));
      const label = type ? (current.locks?.[index] ? copy().unlockPlace : copy().lockPlace)(index + 1, localizedHero(type)) : copy().emptyLock(index + 1);
      lock.setAttribute('aria-label', label); lock.title = label;
      const icon = document.createElement('img'); icon.src = current.locks?.[index] ? 'assets/decor/slot-lock-steel-v2.png' : 'assets/decor/slot-unlock-steel-v2.png'; icon.alt = ''; icon.width = 40; icon.height = 40; icon.draggable = false;
      const fallback = document.createElement('span'); fallback.className = 'lock-fallback'; fallback.textContent = current.locks?.[index] ? '🔒' : '🔓'; fallback.setAttribute('aria-hidden', 'true');
      icon.addEventListener('error', () => { icon.hidden = true; });
      lock.append(icon, fallback); lock.addEventListener('click', () => lockSlot(index));
      cell.append(lock, tile); lineup.append(cell);
    } else lineup.append(tile);
  }
  return lineup;
}

function renderBoard(challenge, current) {
  const locked = isFinished();
  const visibleRows = current.guesses.length + (locked ? 0 : 1);
  const rows = Array.from({ length: visibleRows }, (_, index) => {
    const row = document.createElement("li");
    row.className = "guess-row";
    row.value = index + 1;
    row.setAttribute("aria-label", copy().rowLabel(index + 1));
    const number = document.createElement("span");
    number.className = "row-number";
    number.textContent = String(index + 1).padStart(2, "0");
    row.append(number);

    if (index < current.guesses.length) {
      const guess = current.guesses[index];
      const result = currentResult(guess, challenge);
      const solved = result.exact === challenge.size;
      row.classList.add("row-submitted");
      if (solved) row.classList.add("row-solved");
      row.append(makeLineup(challenge, guess, false, index));
      const feedback = renderFeedback(result);
      const clone = document.createElement('button'); clone.type = 'button'; clone.className = 'guess-copy-row'; clone.dataset.copyGuess = String(index);
      clone.textContent = copy().copyRow; clone.setAttribute('aria-label', copy().copyRowLabel(index + 1)); clone.disabled = locked;
      clone.title = copy().copyRowLabel(index + 1);
      const copyIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      copyIcon.setAttribute('viewBox', '0 0 20 20'); copyIcon.setAttribute('aria-hidden', 'true'); copyIcon.setAttribute('focusable', 'false');
      const copyShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      copyShape.setAttribute('d', 'M6 6V3h11v11h-3M3 6h11v11H3Z');
      copyIcon.append(copyShape); clone.prepend(copyIcon);
      clone.addEventListener('click', () => copyGuess(index)); feedback.append(clone);
      row.append(feedback);
    } else if (index === current.guesses.length && !locked) {
      row.classList.add("row-active");
      row.append(makeLineup(challenge, null, true, index, current));
      const pending = document.createElement("span");
      pending.className = "row-pending";
      pending.textContent = "—";
      pending.setAttribute("aria-hidden", "true");
      row.append(pending);
    }
    return row;
  });
  currentGuess.replaceChildren(...rows.filter(row => row.classList.contains("row-active")));
  guessHistory.replaceChildren(...rows.filter(row => row.classList.contains("row-submitted")).reverse());
  guessHistory.start = current.guesses.length;

}

function renderPicker() {
  const locked = isFinished();
  const choices = HERO_CLASSES.map((hero, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-choice";
    applyHeroAppearance(button, hero);
    button.disabled = locked;
    button.setAttribute("aria-label", copy().heroChoice(localizedHero(hero.id), index + 1));
    const image = createPortrait(hero.image, localizedHero(hero.id));
    const name = document.createElement("span");
    name.textContent = localizedHero(hero.id);
    const key = document.createElement("kbd");
    key.textContent = String(index + 1);
    button.append(image, name, key);
    button.addEventListener("click", () => placeHero(hero.id));
    return button;
  });
  heroPicker.replaceChildren(...choices);
}

function renderMessage(challenge, current) {
  gameMessage.className = "game-message";
  if (!isFinished()) {
    gameMessage.textContent = copy().unsolvedMessage;
    return;
  }
  const solvedAt = current.guesses.findIndex((guess) => currentResult(guess, challenge).exact === challenge.size);
  const party = localizedPartyName(challenge);
  gameMessage.classList.add("success");
  gameMessage.textContent = copy().solvedMessage(solvedAt + 1, party);
}

function render() {
  portraitDrag?.cancel();
  const strings = copy();
  const challenge = currentChallenge();
  const current = currentProgress();
  const locked = isFinished();
  const completeDraft = current.draft.every((type) => type !== null);

  applyCopy();
  storageWarning();
  tutorial.render();
  adventures.render();
  document.querySelector("#mastermind-tutorial-entry").hidden = true;
  document.querySelector("#mastermind-adventure-entry").hidden = state.screen !== "stories";
  document.querySelector("#mastermind-home").hidden = state.screen !== "home";
  document.querySelector("#mastermind-stories").hidden = state.screen !== "stories";
  document.querySelector("#mastermind-daily").hidden = state.screen !== "daily";
  document.querySelector(".intro-row").hidden = state.screen !== "daily";
  document.querySelector(".page-footer").hidden = state.screen !== "daily";
  document.querySelector("#mastermind-home-button").hidden = state.screen === "home";
  todayDate.hidden = state.screen !== "daily";
  if (["home", "stories"].includes(state.screen)) document.querySelector('[data-i18n="brandKicker"]').textContent = state.locale === "pl" ? "ZAGADKI BOHATERÓW" : "HERO PUZZLES";
  partyName.textContent = localizedPartyName(challenge);
  missionLevel.textContent = strings[state.difficulty];
  guessCounter.textContent = strings.attempts(current.guesses.length);
  challengeTabs.forEach((button) => {
    const id = button.dataset.challenge;
    button.setAttribute("aria-pressed", String(id === state.difficulty));
    const result = isFinished(id, progress[id].guesses);
    const mark = button.querySelector(".difficulty-result");
    mark.textContent = result ? "✓" : "";
  });
  renderClues(challenge);
  renderBoard(challenge, current);
  renderPicker();
  renderMessage(challenge, current);
  document.querySelector('#share-result').hidden = !locked;
  document.querySelector('#share-result').textContent = state.locale === 'pl' ? 'Udostępnij wynik' : 'Share result';
  renderDailyNotice();
  document.querySelector('#settings-open').textContent = state.locale === 'pl' ? 'Ustawienia' : 'Settings';
  clearButton.disabled = locked || current.draft.every((type, slot) => type === null || current.locks?.[slot]);
  submitButton.disabled = locked || !completeDraft;
  submitButton.querySelector("[data-i18n]").textContent = locked ? strings.challengeComplete : strings.submitGuess;
}

challengeTabs.forEach((button) => button.addEventListener("click", () => chooseChallenge(button.dataset.challenge)));
languageButtons.forEach((button) => button.addEventListener("click", () => setLocale(button.dataset.locale)));
clearButton.addEventListener("click", clearDraft);
submitButton.addEventListener("click", submitGuess);

document.querySelector("#home-play-stories").addEventListener("click", () => showScreen("stories"));
document.querySelector("#home-play-daily").addEventListener("click", () => showScreen("daily"));
document.querySelector("#mastermind-home-button").addEventListener("click", () => showScreen("home"));

document.addEventListener("keydown", (event) => {
  if (document.querySelector("dialog[open]")) return;
  if (event.key === "Escape") celebration.clear();
  if (tutorial.active) { tutorial.keydown(event); return; }
  if (adventures.active) { adventures.keydown(event); return; }
  if (state.screen !== "daily") return;
  if (event.key === "Escape") { portraitDrag.cancel(); return; }
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && (
    ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY"].includes(event.target.tagName)
    || event.target.isContentEditable
  )) return;
  if (/^[1-7]$/.test(event.key)) {
    event.preventDefault();
    placeHero(HERO_CLASSES[Number(event.key) - 1].id);
  } else if (event.key === "Enter") {
    event.preventDefault();
    submitGuess();
  } else if (event.key === "Backspace" && !isFinished()) {
    event.preventDefault();
    selectSlot(state.selectedSlot);
  }
});

window.advanceTime = ms => { celebration.advanceTime(ms); if (!tutorial.active && !adventures.active) render(); };
window.render_game_to_text = () => {
  if (tutorial.active) return JSON.stringify({ ...tutorial.snapshot(), celebration: celebration.snapshot() });
  if (adventures.active) return JSON.stringify({ ...adventures.snapshot(), celebration: celebration.snapshot() });
  if (["home", "stories"].includes(state.screen)) return JSON.stringify({ game: "Guild of Wits", mode: state.screen, locale: state.locale, date: dateKey, firstRun: firstRun?.snapshot(), campaign: state.screen === "stories" ? adventures.campaignSnapshot() : undefined, choices: state.screen === "home" ? [copy().playDaily, copy().playStories] : [...document.querySelectorAll("#mastermind-adventure-entry button")].map(button => button.textContent.trim()) });
  const challenge = currentChallenge();
  const current = currentProgress();
  const solvedAt = current.guesses.findIndex((guess) => currentResult(guess, challenge).exact === challenge.size);
  return JSON.stringify({
    game: "Guild of Wits",
    date: dateKey,
    locale: state.locale,
    difficulty: challenge.id,
    celebration: celebration.snapshot(),
    partyName: localizedPartyName(challenge),
    partySize: challenge.size,
    clues: challenge.clues.map((clue) => ({ kind: clue.kind, hero: localizedHero(clue.type) })),
    draft: current.draft,
    locks: current.locks ?? Array(challenge.size).fill(null),
    guesses: current.guesses.map((guess) => ({ heroes: guess, ...currentResult(guess, challenge) })),
    guessLimit: null,
    guessesRemaining: null,
    drag: portraitDrag.snapshot(),
    result: solvedAt >= 0 ? "solved" : "playing",
    ...(isFinished() ? { solution: challenge.code } : {}),
  });
};

portraitDrag = installPortraitDrag({
  board: guessBoard,
  canDrag: () => state.screen === "daily" && !isFinished(),
  onDrop: ({ hero, sourceSlot, targetSlot, copy: clone }) => {
    if (dateGuard()) return;
    const draft = currentProgress().draft;
    if (currentProgress().locks?.[targetSlot] || (!clone && currentProgress().locks?.[sourceSlot])) return;
    if (!clone && sourceSlot === targetSlot) return;
    const changed = draft[targetSlot] !== hero;
    if (!clone) draft[sourceSlot] = draft[targetSlot];
    draft[targetSlot] = hero;
    if (changed) playPlacementSound();
    state.selectedSlot = draft.findIndex(type => type === null);
    if (state.selectedSlot < 0) state.selectedSlot = targetSlot;
    saveProgress();
    render();
    if (changed) animatePlacement(currentGuess.querySelector(`[data-slot="${targetSlot}"] .portrait-frame`));
  },
});
pruneDaily(storage, dateKey);
function renderDailyNotice() {
  const messages = state.locale === 'pl' ? {
    invalid: 'Nie można odczytać części codziennego zapisu. Te zagadki zaczynają się od nowa.',
    rollover: 'Zmieniła się data. Wczytano dzisiejszą zagadkę; poprzedni układ został zapisany.', copied: 'Wynik skopiowany.',
  } : {
    invalid: 'Some daily progress could not be read. Those puzzles start fresh.',
    rollover: 'The date changed. Today’s puzzle is ready; the previous board was saved.', copied: 'Result copied.',
  };
  document.querySelector('#daily-notice').textContent = messages[invalidDaily ? 'invalid' : dailyNotice] ?? '';
}
function storageWarning() {
  const warning = document.querySelector('#storage-warning');
  warning.hidden = !storage.failed;
  warning.textContent = state.locale === 'pl' ? 'Nie można zapisać postępu. Ta rozgrywka jest tymczasowa; pozostaw grę otwartą.' : 'Progress could not be saved. This session is temporary; keep the game open.';
}
addEventListener('heroguesser:storage', storageWarning);
addEventListener('heroguesser:background', () => { portraitDrag.cancel(); tutorial.cancelTransient(); adventures.cancelTransient(); celebration.clear(); });
addEventListener('heroguesser:foreground', () => { checkDate(); storageWarning(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { dispatchEvent(new Event('heroguesser:background')); }
  else { dispatchEvent(new Event('heroguesser:foreground')); }
});
setInterval(() => { if (!document.hidden) checkDate(); }, 15000);
document.querySelector('#share-result').addEventListener('click', async () => {
  if (dateGuard()) return;
  const text = dailyShareText(currentChallenge(), currentProgress().guesses, state.locale);
  if (!text) return;
  const locale = state.locale;
  const result = await shareText(text);
  if (result === 'manual') showShareText(text, locale);
  if (result === 'copied') { dailyNotice = 'copied'; renderDailyNotice(); }
});
installSettings({ getLocale: () => state.locale, reset: kind => {
  for (const key of storage.keys()) {
    if (!key.startsWith('heroguesser:')) continue;
    if (kind === 'all' || kind === 'stories' && key.startsWith('heroguesser:story:') || kind === 'dailies' && /^heroguesser:v1:/.test(key)) storage.removeItem(key);
  }
  if (kind === 'stories' || kind === 'all') adventures.reset();
  if (kind === 'dailies' || kind === 'all') { state.selectedSlot = 0; dailyNotice = null; invalidDaily = false; progress = Object.fromEntries(CHALLENGES.map(c => [c.id, restoreProgress(c)])); }
  if (kind === 'all') { state.difficulty = 'easy'; state.locale = 'en'; tutorial.leave(); }
  showScreen('home');
}});
firstRun = installFirstRun({
  store: storage, getLocale: () => state.locale,
  onTutorial: () => tutorial.start(),
  onSkip: () => { tutorialReminder = true; render(); focusScreen(); },
});
storageWarning();
if (new URLSearchParams(location.search).get("daily") === "1") state.screen = "daily";
render();
if (new URLSearchParams(location.search).get("tutorial") === "1") tutorial.start();

const adventureParam = new URLSearchParams(location.search).get("adventure");
if (!tutorial.active && ADVENTURES.some((_, index) => adventureParam === String(index + 1))) adventures.start(Number(adventureParam) - 1);
// Direct mode links keep their destination. Offer onboarding on a normal launch.
const modeParams = new URLSearchParams(location.search);
const directMode = modeParams.get("tutorial") === "1" || modeParams.get("daily") === "1" ||
  ADVENTURES.some((_, index) => modeParams.get("adventure") === String(index + 1));
if (!directMode) firstRun.offer();
// Refresh browser-history views without discarding saved chapters.
addEventListener("pageshow", event => { if (event.persisted) render(); });
