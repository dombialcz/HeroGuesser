import { applyLocks, copyPastRow, toggleLock } from './daily-row-tools.js';
import { revealHint, toggleHint, hintCooldownRemaining } from './daily-hints.js';
import { createPortrait, animatePlacement, animateResultStamp } from "./portraits.js";
import { storage, shareText } from "./platform.js";
import { dailyKey, restoreDaily, serializeDaily, pruneDaily, dailyShareText, DAILY_MEDAL_LIMITS, dailyMedal } from "./daily-progress.js";
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
import { WARMUP, WARMUP_HEROES, newWarmup, loadWarmup, saveWarmup, needsWarmup, difficultyKey, readDifficulty, completionSummary, publicRoster, nextPuzzleIn } from './warmup.js';
import { showHelp } from './how-to-play.js';
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
    boardSubtitle: "Keep your choices with locks. Reveal a hero with the eye.",
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
    dragHint: "Tap a hero from a previous guess to add it to your formation. Hold and drag a portrait to move, swap or copy it. Use this guess copies the whole attempt. Padlocks keep heroes in place after checking, clearing or copying. Unlock above a slot to edit it. Unlimited guesses.",
    copyRow: 'Copy', copyRowLabel: n => `Copy guess ${n}; keep locked heroes`,
    lockPlace: (n, hero) => `Lock ${hero} in place ${n} for later attempts`,
    unlockPlace: (n, hero) => `Unlock ${hero} in place ${n}`,
    emptyLock: n => `Place a hero in slot ${n} before locking it`,
    hint: 'Hint', hintReady: 'Reveal one correct hero. Available every 30 seconds.',
    hintWaiting: n => `Next reveal in ${n} seconds`, hintComplete: 'All places revealed',
    hintHelp: 'The eye reveals one correct hero every 30 seconds. Close a revealed eye to experiment; reopen it to restore and protect the correct hero.',
    closeEye: (n, hero) => `Close the eye at place ${n}, ${hero}, to allow changes`,
    openEye: n => `Open the eye at place ${n} to restore and protect the correct hero`,
    revealedPlace: (n, hero) => `Place ${n}: ${hero}, revealed and protected. Close the eye above to allow changes.`,
    hintRevealed: (n, hero) => `Place ${n} revealed: ${hero}. The open eye protects this hero.`,
    eyeClosed: n => `Eye closed at place ${n}. You can change this hero.`,
    eyeOpened: (n, hero) => `Eye open at place ${n}. ${hero} restored and protected.`,
    lockedPlace: (n, hero) => `Place ${n}: ${hero}, locked. Unlock using the padlock above.`,
    copyHero: (hero) => `Add ${hero} to your formation, or hold and drag to a place.`,
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
    boardSubtitle: "Kłódka zachowuje wybór. Oko odkrywa właściwego bohatera.",
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
    dragHint: "Dotknij bohatera z poprzedniej próby, aby dodać go do układu. Przytrzymaj portret i przeciągnij, aby przenieść, zamienić lub skopiować bohatera. Użyj tej próby odtwarza cały układ. Kłódka zachowuje bohatera po sprawdzeniu, czyszczeniu i kopiowaniu. Odblokuj miejsce, aby je zmienić. Bez limitu prób.",
    copyRow: 'Kopiuj', copyRowLabel: n => `Skopiuj próbę ${n}; zachowaj zablokowanych bohaterów`,
    lockPlace: (n, hero) => `Zablokuj: ${hero}, na miejscu ${n} w kolejnych próbach`,
    unlockPlace: (n, hero) => `Odblokuj: ${hero}, na miejscu ${n}`,
    emptyLock: n => `Umieść bohatera na miejscu ${n}, aby go zablokować`,
    hint: 'Wskazówka', hintReady: 'Odkryj jednego właściwego bohatera. Dostępne co 30 sekund.',
    hintWaiting: n => `Następna wskazówka za ${n} s`, hintComplete: 'Wszystkie miejsca odkryte',
    hintHelp: 'Oko co 30 sekund odkrywa jednego właściwego bohatera. Zamknij oko nad odkrytym miejscem, by wypróbować inny układ. Otwórz je ponownie, by przywrócić i zablokować właściwego bohatera.',
    closeEye: (n, hero) => `Zamknij oko nad miejscem ${n} (${hero}), aby umożliwić zmiany`,
    openEye: n => `Otwórz oko nad miejscem ${n}, aby przywrócić i zablokować właściwego bohatera`,
    revealedPlace: (n, hero) => `Miejsce ${n}: ${hero}, odkryte i zablokowane. Zamknij oko powyżej, aby umożliwić zmiany.`,
    hintRevealed: (n, hero) => `Odkryto miejsce ${n}: ${hero}. Otwarte oko chroni tego bohatera.`,
    eyeClosed: n => `Oko nad miejscem ${n} zamknięte. Możesz zmienić bohatera.`,
    eyeOpened: (n, hero) => `Oko nad miejscem ${n} otwarte. Przywrócono i zablokowano: ${hero}.`,
    lockedPlace: (n, hero) => `Miejsce ${n}: ${hero}, zablokowane. Odblokuj kłódką powyżej.`,
    copyHero: (hero) => `Dodaj do układu: ${hero}. Możesz też przytrzymać portret i go przeciągnąć.`,
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

Object.assign(COPY.en, {
  currentFormation: 'Your formation', dailyBoardTitle: 'Daily', dailyTitle: "Today's puzzles", dailyDescription: 'A fresh party for every difficulty. Solve one today, or try all four.',
  chaos: 'Expert', heroes: 'places',
  partyRollSubtitle: 'No clues · repeats allowed', partyRollRule: 'Any hero can appear in any place, any number of times. Use the whole-guess feedback to discover the party.',
  todaysParty: "TODAY’S PARTY", guessBoard: 'Your guesses', boardSubtitle: 'Locks keep your choices; revealed eyes confirm a hero.',
  submitGuess: 'Check', exactLegend: 'Right hero, right place', misplacedLegend: 'Right hero, wrong place', absentLegend: 'Not in the party, or one copy too many',
  chooseHeroes: 'Pick a hero', formationRules: 'How the name works', nameClues: 'Known heroes', nameCluesHint: '',
  copyRow: 'Use this guess', copyRowLabel: n => `Use guess ${n}; keep locked heroes`,
  feedbackCount: (a,b,c) => `${a} right place · ${b} wrong place · ${c} absent or extra`,
  help: 'Help', warmup: 'Warm-up', skip: "Skip to today’s puzzle", example: 'A practice guess, ready to Check. The roster tells you which heroes belong.',
  practice: 'Use the example guess below, then change it. The result describes the whole guess, not individual places.',
  totals: 'Totals describe the whole guess, not individual places.', extra: 'A grey ring can mean an absent hero or one copy too many.',
  feedbackGuide: 'What do the symbols mean?',
  other: n => `${n} other ${n === 1 ? 'hero' : 'heroes'}, each used once`,
  fill: n => `Fill all ${n} places`, found: 'Party found!', firstDaily: "Play today’s Easy", allDone: 'All four puzzles solved today. Come back tomorrow!',
  solvedToday: n => `${n} of 4 solved`, revealsUsed: n => `${n} ${n === 1 ? 'place revealed' : 'places revealed'}`,
  medalTargets: 'Medals by guesses', medals: { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' },
  next: name => `Next: ${name} →`, newIn: time => `New puzzles in ${time}`, clear: 'Clear',
});
Object.assign(COPY.pl, {
  currentFormation: 'Twój układ', dailyBoardTitle: 'Codzienne', dailyTitle: 'Dzisiejsze zagadki', dailyDescription: 'Nowa drużyna na każdym poziomie. Rozwiąż jedną zagadkę lub spróbuj wszystkich czterech.',
  chaos: 'Ekspert', heroes: 'miejsc',
  partyRollSubtitle: 'Bez wskazówek · dowolne powtórzenia', partyRollRule: 'Na każdym miejscu może stanąć dowolny bohater, dowolną liczbę razy. Odkryj drużynę dzięki wynikom całych prób.',
  todaysParty: 'DZISIEJSZA DRUŻYNA', guessBoard: 'Twoje próby', boardSubtitle: 'Kłódka zachowuje twój wybór. Otwarte oko potwierdza bohatera.',
  submitGuess: 'Sprawdź', exactLegend: 'Dobry bohater, dobre miejsce', misplacedLegend: 'Dobry bohater, złe miejsce', absentLegend: 'Poza drużyną lub o jednego za dużo',
  chooseHeroes: 'Wybierz bohatera', formationRules: 'Jak czytać nazwę', nameClues: 'Znani bohaterowie', nameCluesHint: '',
  copyRow: 'Użyj tej próby', copyRowLabel: n => `Użyj próby ${n}; zachowaj zablokowanych bohaterów`,
  feedbackCount: (a,b,c) => `${a} na dobrym miejscu · ${b} na złym miejscu · ${c} poza drużyną lub za dużo`,
  help: 'Jak grać', warmup: 'Rozgrzewka', skip: 'Pomiń — dzisiejsza zagadka', example: 'Przykładowa próba jest gotowa. Naciśnij Sprawdź. Wskazówki podają skład drużyny.',
  practice: 'Użyj przykładowej próby i zmień układ. Wynik dotyczy całej próby, nie poszczególnych miejsc.',
  totals: 'Wynik dotyczy całej próby, nie poszczególnych miejsc.', extra: 'Szare kółko oznacza bohatera spoza drużyny lub nadmiarową kopię.',
  feedbackGuide: 'Co oznaczają symbole?',
  other: n => `${n} ${n === 1 ? 'inny bohater' : 'innych bohaterów'}, każdy tylko raz`,
  fill: n => `Zapełnij wszystkie ${n} ${n === 3 ? "miejsca" : "miejsc"}`, found: 'Drużyna odnaleziona!', firstDaily: 'Zagraj w dzisiejszą łatwą zagadkę', allDone: 'Wszystkie cztery zagadki rozwiązane. Wróć jutro!',
  solvedToday: n => `Rozwiązane: ${n} z 4`, revealsUsed: n => `Odkryte miejsca: ${n}`,
  medalTargets: 'Medale za liczbę prób', medals: { gold: 'Złoto', silver: 'Srebro', bronze: 'Brąz' },
  next: name => `Dalej: ${name} →`, newIn: time => `Nowe zagadki za ${time.replace('h', ' godz.').replace('m', ' min')}`, clear: 'Wyczyść',
});
let warmup = loadWarmup(storage);
const firstVisit = needsWarmup(storage);
const isWarmup = () => state.screen === 'warmup';
const isExample = () => isWarmup() && warmup.progress.guesses.length === 0;
let dateKey = localDateKey();
let invalidDaily = false;
let dailyNotice = null;
let levels = Object.fromEntries(
  CHALLENGES.map((challenge) => [challenge.id, generateChallenge(dateKey, challenge.id)]),
);
let progress = Object.fromEntries(CHALLENGES.map((challenge) => [challenge.id, restoreProgress(challenge)]));
const state = { screen: firstVisit ? "warmup" : "daily", difficulty: readDifficulty(storage), locale: readLocale(), selectedSlot: 0 };

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
let portraitDrag;
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
  const target = { home: "mastermind-home-title", stories: "stories-title", daily: "daily-title", warmup: "daily-title" }[state.screen];
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

function localizedPartyName(challenge) {
  if (challenge.id === "warmup") return copy().warmup;
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
  if (isWarmup()) { if (isFinished()) warmup.status = "completed"; saveWarmup(storage, warmup); return; }
  storage.setItem(dailyKey(dateKey, state.difficulty), serializeDaily(currentProgress()));
}
function checkDate(redraw = true) {
  if (state.screen === 'adventure' || state.screen === 'tutorial' || isWarmup()) return false;
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
  return isWarmup() ? WARMUP : levels[state.difficulty];
}

function currentProgress() {
  return isWarmup() ? warmup.progress : progress[state.difficulty];
}

function currentResult(guess, challenge = currentChallenge()) {
  const result = evaluateGuess(challenge.code, guess);
  return result ? { ...result, absent: challenge.size - result.exact - result.misplaced } : null;
}

function isFinished(id, guesses) {
  const challenge = id ? levels[id] : currentChallenge();
  return (guesses ?? (id ? progress[id] : currentProgress()).guesses).some(guess => evaluateGuess(challenge.code, guess)?.exact === challenge.size);
}

function chooseChallenge(id) {
  checkDate(false);
  celebration.clear();
  if (!levels[id]) return;
  state.difficulty = id;
  storage.setItem(difficultyKey, id);
  const draft = currentProgress().draft;
  const emptyIndex = draft.findIndex((type, index) => type === null && !currentProgress().locks?.[index]);
  state.selectedSlot = emptyIndex >= 0 ? emptyIndex : Math.max(0, draft.length - 1);
  render();
}

function placeHero(type) {
  if (isExample()) return;
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
  currentGuess.scrollIntoView({ block: 'nearest', behavior: 'instant' });
}

function selectSlot(index) {
  if (isExample()) return;
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
  if (isFinished()) return;
  if (current.draft.some(type => type === null)) { announceHint(copy().fill(challenge.size)); return; }
  current.guesses.push([...current.draft]);
  current.draft = applyLocks(Array(challenge.size).fill(null), current.locks);
  state.selectedSlot = current.draft.findIndex(type => type === null);
  saveProgress();
  render();
  const latest = guessHistory.firstElementChild;
  const feedback = latest.querySelector('.row-feedback');
  animateResultStamp(feedback, { inset: true });
  latest.classList.add('just-checked');
  document.querySelector('#guess-feedback-status').textContent = `${copy().rowLabel(current.guesses.length)}. ${feedback.getAttribute('aria-label')}`;
  requestAnimationFrame(() => {
    const result = isFinished() ? document.querySelector('#daily-result') : latest;
    result?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });
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
  if (isExample()) return;
  if (dateGuard() || isFinished() || !toggleLock(currentProgress(), slot)) return;
  state.selectedSlot = currentProgress().draft.findIndex((piece, index) => !piece && !currentProgress().locks?.[index]);
  saveProgress(); render();
  currentGuess.querySelector(`[data-lock-slot="${slot}"]`)?.focus({ preventScroll: true });
}

function announceHint(message) {
  document.querySelector('#daily-guess-tools-status').textContent = message;
}

function revealDailyHint() {
  if (isExample()) return;
  if (dateGuard() || isFinished()) return;
  const slot = revealHint(currentProgress(), currentChallenge());
  if (slot === null) return;
  state.selectedSlot = currentProgress().draft.findIndex(type => type === null);
  saveProgress(); render();
  currentGuess.querySelector(`[data-eye-slot="${slot}"]`)?.focus({ preventScroll: true });
  announceHint(copy().hintRevealed(slot + 1, localizedHero(currentChallenge().code[slot])));
  animatePlacement(currentGuess.querySelector(`[data-slot="${slot}"] .portrait-frame`));
}

function toggleDailyEye(slot) {
  if (dateGuard() || isFinished() || !toggleHint(currentProgress(), currentChallenge(), slot)) return;
  const opened = currentProgress().hints[slot] === 'open';
  state.selectedSlot = opened ? currentProgress().draft.findIndex(type => type === null) : slot;
  saveProgress(); render();
  currentGuess.querySelector(`[data-eye-slot="${slot}"]`)?.focus({ preventScroll: true });
  announceHint(opened ? copy().eyeOpened(slot + 1, localizedHero(currentChallenge().code[slot])) : copy().eyeClosed(slot + 1));
}

function clearDraft() {
  if (isExample()) return;
  if (dateGuard()) return;
  if (isFinished()) return;
  currentProgress().draft = applyLocks(Array(currentChallenge().size).fill(null), currentProgress().locks);
  state.selectedSlot = currentProgress().draft.findIndex(type => type === null);
  saveProgress();
  render();
}

function applyCopy() {
  const strings = copy();
  document.documentElement.lang = state.locale;
  document.title = strings.gameTitle;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = strings[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
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

function renderClues(challenge) {
  const roster = publicRoster(challenge);
  document.querySelector('.clue-area').hidden = challenge.id === 'chaos';
  document.querySelector('.clue-divider').hidden = challenge.id === 'chaos';
  const chips = roster.known.map(clue => {
    const chip = document.createElement('article'); chip.className = 'clue-card';
    chip.append(createPortrait(HERO_BY_ID[clue.type].image, localizedHero(clue.type)));
    const name = document.createElement('strong'); name.textContent = `${localizedHero(clue.type)} ×${clue.count}`;
    chip.append(name); return chip;
  });
  if (roster.remaining > 0) { const other = document.createElement('p'); other.className = 'other-heroes'; other.textContent = copy().other(roster.remaining); chips.push(other); }
  clueParts.replaceChildren(...chips);
  document.querySelector('#formation-rules').hidden = isWarmup();
  if (challenge.id !== 'chaos' && !isWarmup()) {
    const names = PARTY_NAMES[state.locale];
    const meanings = roster.known.map(clue => `${names[clue.kind][clue.type]} = ${localizedHero(clue.type)} ×${clue.count}`);
    document.querySelector('#rule-note').textContent = meanings.join(' · ') + '. ' + copy().other(roster.remaining) + '.';
  }
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
    const words = document.createElement('span'); words.className = 'feedback-words'; words.textContent = legend;
    score.append(dot, number, words);
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

function makeEyeIcon(closed = false) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 48 48'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', closed
    ? 'M6 21Q24 39 42 21M10 25l-3 5m11-1-1 6m13-6 1 6m8-10 3 5'
    : 'M4 24Q24 4 44 24Q24 44 4 24ZM31 24a7 7 0 1 1-14 0a7 7 0 1 1 14 0M24 21v6');
  svg.append(path);
  return svg;
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
      tile.title = copy().copyHero(localizedHero(type));
      tile.setAttribute("aria-label", tile.title);
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
      tile.disabled = isExample() || isFinished() || !!current.locks?.[index];
      if (current.locks?.[index]) { tile.dataset.locked = 'true'; tile.setAttribute('aria-label', copy().lockedPlace(index + 1, localizedHero(type))); }
      if (current.hints?.[index]) {
        tile.dataset.revealed = current.hints[index];
        if (current.hints[index] === 'open') tile.setAttribute('aria-label', copy().revealedPlace(index + 1, localizedHero(type)));
      }
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
      if (current.hints?.[index]) {
        const open = current.hints[index] === 'open';
        const eye = document.createElement('button'); eye.type = 'button'; eye.className = 'slot-eye-button'; eye.dataset.eyeSlot = String(index);
        eye.dataset.open = String(open); eye.disabled = isFinished(); eye.setAttribute('aria-pressed', String(open));
        const label = open ? copy().closeEye(index + 1, localizedHero(challenge.code[index])) : copy().openEye(index + 1);
        eye.setAttribute('aria-label', label); eye.title = label;
        eye.append(makeEyeIcon(!open)); eye.addEventListener('click', () => toggleDailyEye(index));
        cell.append(eye, tile); lineup.append(cell);
        continue;
      }
      const lock = document.createElement('button'); lock.type = 'button'; lock.className = 'slot-lock-button'; lock.dataset.lockSlot = String(index);
      const locked = !!current.locks?.[index];
      lock.disabled = !type || isFinished() || isExample();
      lock.setAttribute('aria-pressed', String(locked));
      const label = type ? (locked ? copy().unlockPlace : copy().lockPlace)(index + 1, localizedHero(type)) : copy().emptyLock(index + 1);
      lock.setAttribute('aria-label', label); lock.title = label;
      const icon = document.createElement('img');
      icon.alt = ''; icon.width = 40; icon.height = 40; icon.draggable = false;
      icon.addEventListener('error', () => { icon.hidden = true; });
      icon.src = locked ? 'assets/decor/slot-lock-steel-v2.png' : 'assets/decor/slot-unlock-steel-v2.png';
      const fallback = document.createElement('span');
      fallback.className = 'lock-fallback'; fallback.textContent = locked ? '🔒' : '🔓'; fallback.setAttribute('aria-hidden', 'true');
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
    number.textContent = copy().rowLabel(index + 1);
    row.append(number);

    if (index < current.guesses.length) {
      const guess = current.guesses[index];
      const result = currentResult(guess, challenge);
      const solved = result.exact === challenge.size;
      row.classList.add("row-submitted");
      if (index === 0) row.classList.add('explained-guess');
      if (solved) row.classList.add("row-solved");
      row.append(makeLineup(challenge, guess, false, index));
      const feedback = renderFeedback(result);
      const clone = document.createElement('button'); clone.type = 'button'; clone.className = 'guess-copy-row'; clone.dataset.copyGuess = String(index);
      clone.textContent = copy().copyRow; clone.setAttribute('aria-label', copy().copyRowLabel(index + 1)); clone.disabled = locked;
      clone.title = copy().copyRowLabel(index + 1);
      if (isWarmup() && current.guesses.length === 1 && current.draft.every(piece => !piece)) clone.classList.add('suggested-action');
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
  guessHistory.replaceChildren(...rows.filter(row => row.classList.contains('row-submitted')).reverse());
  guessHistory.firstElementChild?.classList.add('latest-guess');
  document.querySelector('#guess-feedback-status').textContent = '';
  const explanation = document.querySelector('#feedback-explanation');
  explanation.textContent = `${copy().totals} ${copy().extra}`;

}

function renderPicker() {
  const locked = isFinished();
  const choices = (isWarmup() ? WARMUP_HEROES.map(id => HERO_BY_ID[id]) : HERO_CLASSES).map((hero, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-choice";
    applyHeroAppearance(button, hero);
    button.disabled = locked || isExample();
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
  const hint = document.createElement('button'); hint.type = 'button'; hint.id = 'daily-hint-button'; hint.className = 'hint-action-button';
  hint.setAttribute('aria-describedby', 'daily-hint-help');
  const field = makeEyeIcon(); field.classList.add('hint-icon');
  const countdown = document.createElement('span'); countdown.className = 'hint-cooldown'; countdown.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span'); label.className = 'hint-label';
  hint.append(field, label, countdown); hint.addEventListener('click', revealDailyHint);
  heroPicker.replaceChildren(...choices);
  document.querySelector("#hint-action").replaceChildren(hint);
  let help = document.querySelector('#daily-hint-help');
  if (!help) { help = document.createElement('p'); help.id = 'daily-hint-help'; help.className = 'hint-help'; document.querySelector('#controls-help').append(help); }
  help.textContent = copy().hintHelp;
  updateHintButton();
}

// Only update the countdown: do not rebuild focused controls or cancel a drag each second.
function updateHintButton() {
  const button = document.querySelector('#daily-hint-button');
  if (!button) return;
  const remaining = Math.ceil(hintCooldownRemaining(currentProgress()) / 1000);
  const complete = (currentProgress().hints ?? []).filter(Boolean).length === currentChallenge().size;
  button.disabled = isExample() || isFinished() || complete || remaining > 0;
  button.dataset.ready = String(!button.disabled);
  const label = isFinished() ? copy().challengeComplete : complete ? copy().hintComplete : remaining > 0 ? copy().hintWaiting(remaining) : copy().hintReady;
  button.setAttribute('aria-label', label); button.title = label;
  button.querySelector('.hint-label').textContent = copy().hint;
  const countdown = button.querySelector('.hint-cooldown');
  countdown.hidden = complete || isFinished() || remaining === 0;
  countdown.textContent = countdown.hidden ? '' : `${remaining}s`;
}
setInterval(() => { if (['daily', 'warmup'].includes(state.screen) && !document.hidden) updateHintButton(); }, 250);

function dailyStatus() {
  return CHALLENGES.map(({ id }) => {
    const summary = completionSummary(levels[id], progress[id]);
    return { id, ...summary, medal: dailyMedal(id, summary.guesses) };
  });
}
function updateDailyStatus() {
  const entries = dailyStatus();
  const summary = `${copy().solvedToday(entries.filter(item => item.solved).length)} · ${copy().newIn(nextPuzzleIn())}`;
  document.querySelector('#daily-progress-summary').textContent = summary;
  for (const element of document.querySelectorAll('.next-countdown')) element.textContent = copy().newIn(nextPuzzleIn());
}
setInterval(() => { if (!document.hidden) updateDailyStatus(); }, 30000);
function renderMessage(challenge, current) {
  const solved = isFinished();
  const result = document.querySelector('#daily-result'); result.hidden = !solved;
  document.querySelector('.daily-dock').hidden = solved;
  gameMessage.className = 'game-message';
  if (!solved) return;
  const summary = completionSummary(challenge, current);
  document.querySelector('#result-title').textContent = copy().found;
  gameMessage.textContent = localizedPartyName(challenge) + (isWarmup() ? '' : ` · ${copy()[state.difficulty]}`);
  const medal = dailyMedal(challenge.id, summary.guesses);
  const award = document.querySelector('#result-medal');
  award.hidden = !medal;
  award.dataset.medal = medal ?? '';
  award.textContent = medal ? copy().medals[medal] : '';
  const stats = document.querySelector('#result-stats');
  stats.textContent = `${copy().attempts(summary.guesses)} · ${copy().revealsUsed(summary.reveals)}`;
  const next = document.querySelector('#next-puzzle');
  const entries = dailyStatus();
  const start = CHALLENGES.findIndex(c => c.id === state.difficulty);
  const nextId = Array.from({length: CHALLENGES.length}, (_, i) => CHALLENGES[(start + i + 1) % CHALLENGES.length].id).find(id => !entries.find(item => item.id === id).solved);
  next.hidden = !isWarmup() && !nextId;
  next.textContent = isWarmup() ? copy().firstDaily : nextId ? copy().next(copy()[nextId]) : '';
  next.onclick = () => { const id = next.dataset.next || 'easy'; showScreen('daily'); chooseChallenge(id); focusScreen(); };
  next.dataset.next = isWarmup() ? 'easy' : nextId ?? '';
  if (!isWarmup() && !nextId) stats.textContent += ' · ' + copy().allDone;
}

function renderMedalTargets(strings) {
  const targets = document.querySelector('#medal-targets');
  targets.hidden = isWarmup();
  if (targets.hidden) return;
  const { gold, silver } = DAILY_MEDAL_LIMITS[state.difficulty];
  const ranges = { gold: `1–${gold}`, silver: `${gold + 1}–${silver}`, bronze: `${silver + 1}+` };
  for (const badge of targets.querySelectorAll('[data-medal]')) {
    const tier = badge.dataset.medal;
    badge.textContent = `${strings.medals[tier]} ${ranges[tier]}`;
  }
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
  document.querySelector("#mastermind-daily").hidden = !(["daily", "warmup"].includes(state.screen));
  document.querySelector(".intro-row").hidden = !(["daily", "warmup"].includes(state.screen));
  document.querySelector(".page-footer").hidden = true;
  document.querySelector("#mastermind-home-button").hidden = state.screen === "home";
  todayDate.hidden = !(["daily", "warmup"].includes(state.screen));
  if (["home", "stories"].includes(state.screen)) document.querySelector('[data-i18n="brandKicker"]').textContent = state.locale === "pl" ? "ZAGADKI BOHATERÓW" : "HERO PUZZLES";
  partyName.textContent = localizedPartyName(challenge);
  missionLevel.textContent = strings[state.difficulty];
  guessCounter.textContent = strings.attempts(current.guesses.length);
  challengeTabs.forEach((button) => {
    const id = button.dataset.challenge;
    button.setAttribute("aria-pressed", String(id === state.difficulty));
    const { guesses } = completionSummary(levels[id], progress[id]);
    const medal = dailyMedal(id, guesses);
    const mark = button.querySelector(".difficulty-result");
    mark.hidden = !medal;
    mark.dataset.medal = medal ?? '';
    mark.textContent = medal ? `✓ ${guesses}` : '';
    mark.title = medal ? `${strings.medals[medal]} · ${strings.attempts(guesses)}` : '';
    const label = `${strings[id]}, ${levels[id].size} ${strings.heroes}`;
    button.setAttribute('aria-label', medal ? `${label}, ${mark.title}` : label);
  });
  renderMedalTargets(strings);
  renderClues(challenge);
  renderBoard(challenge, current);
  renderPicker();
  renderMessage(challenge, current);
  document.querySelector('#share-result').hidden = !locked || isWarmup();
  document.querySelector('#share-result').textContent = state.locale === 'pl' ? 'Udostępnij wynik' : 'Share result';
  renderDailyNotice();
  document.querySelector('#settings-open').textContent = state.locale === 'pl' ? 'Ustawienia' : 'Settings';
  clearButton.disabled = isExample() || locked || current.draft.every((type, slot) => type === null || current.locks?.[slot]);
  submitButton.disabled = locked || !completeDraft;
  submitButton.querySelector('[data-i18n]').textContent = completeDraft ? strings.submitGuess : strings.fill(challenge.size);
  document.querySelector('#help-open').textContent = strings.help;
  document.querySelector('.warmup-heading').hidden = !isWarmup();
  document.querySelector('#warmup-instruction').textContent = isExample() ? strings.example : strings.practice;
  document.querySelector('#warmup-skip').textContent = strings.skip;
  document.querySelector('.difficulty-tabs').hidden = isWarmup();
  document.querySelector('#daily-progress-summary').hidden = isWarmup();
  document.querySelector('#daily-title').textContent = isWarmup() ? strings.warmup : strings.dailyBoardTitle;
  document.querySelector('#current-guess').classList.toggle('worked-example', isExample());
  document.querySelector('.picker-panel').hidden = isExample();
  document.querySelector('#hint-action').hidden = isExample();
  document.querySelector('#clear-button').hidden = isExample();
  document.querySelector('#board-subtitle').hidden = isWarmup();
  document.querySelector('#controls-help').hidden = isWarmup();
  const meta = document.querySelector('[data-challenge=chaos] .difficulty-meta');
  meta.textContent = state.locale === 'pl' ? 'Bez wskazówek' : 'No clues';
  if (isWarmup()) document.querySelector('[data-i18n="todaysParty"]').textContent = state.locale === 'pl' ? 'DRUŻYNA DO ĆWICZEŃ' : 'PRACTICE PARTY';
  document.querySelector('.board-panel').hidden = !current.guesses.length;
  document.documentElement.dataset.screen = state.screen;
  updateDailyStatus();
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
  if (!["daily", "warmup"].includes(state.screen)) return;
  if (event.key === "Escape") { portraitDrag.cancel(); return; }
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && (
    ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
    || event.target.isContentEditable
  )) return;
  if (/^[1-7]$/.test(event.key)) {
    event.preventDefault();
    const hero = (isWarmup() ? WARMUP_HEROES.map(id => HERO_BY_ID[id]) : HERO_CLASSES)[Number(event.key) - 1];
    if (hero) placeHero(hero.id);
  } else if (event.key === "Enter" && (!event.target.closest("button, a, summary") || event.target.closest(".row-active .guess-tile"))) {
    event.preventDefault();
    submitGuess();
  } else if (event.key === "Backspace" && !isFinished()) {
    event.preventDefault();
    const focused = event.target.closest?.('.row-active .guess-tile[data-slot]');
    selectSlot(focused ? Number(focused.dataset.slot) : state.selectedSlot);
  }
});

window.advanceTime = ms => { celebration.advanceTime(ms); if (!tutorial.active && !adventures.active) render(); };
window.render_game_to_text = () => {
  if (tutorial.active) return JSON.stringify({ ...tutorial.snapshot(), celebration: celebration.snapshot() });
  if (adventures.active) return JSON.stringify({ ...adventures.snapshot(), celebration: celebration.snapshot() });
  if (["home", "stories"].includes(state.screen)) return JSON.stringify({ game: "Guild of Wits", mode: state.screen, locale: state.locale, date: dateKey,  campaign: state.screen === "stories" ? adventures.campaignSnapshot() : undefined, choices: state.screen === "home" ? [copy().playDaily, copy().playStories] : [...document.querySelectorAll("#mastermind-adventure-entry button")].map(button => button.textContent.trim()) });
  const challenge = currentChallenge();
  const current = currentProgress();
  const solvedAt = current.guesses.findIndex((guess) => currentResult(guess, challenge).exact === challenge.size);
  return JSON.stringify({
    game: "Guild of Wits",
    mode: isWarmup() ? "warmup" : "daily",
    warmupStage: isWarmup() ? isFinished() ? "complete" : isExample() ? "example" : "practice" : undefined,
    date: dateKey,
    locale: state.locale,
    difficulty: challenge.id,
    celebration: celebration.snapshot(),
    partyName: localizedPartyName(challenge),
    partySize: challenge.size,
    clues: challenge.clues.map((clue) => ({ kind: clue.kind, hero: localizedHero(clue.type) })),
    draft: current.draft,
    locks: current.locks ?? Array(challenge.size).fill(null),
    hints: current.hints ?? Array(challenge.size).fill(null),
    hintCooldownSeconds: Math.ceil(hintCooldownRemaining(current) / 1000),
    hintAvailable: !isExample() && !isFinished() && hintCooldownRemaining(current) === 0 && (current.hints ?? []).filter(Boolean).length < challenge.size,
    guesses: current.guesses.map((guess) => ({ heroes: guess, ...currentResult(guess, challenge) })),
    completion: completionSummary(challenge, current),
    dailyProgress: dailyStatus(),
    guessLimit: null,
    guessesRemaining: null,
    drag: portraitDrag.snapshot(),
    result: solvedAt >= 0 ? "solved" : "playing",
    ...(isFinished() ? { solution: challenge.code } : {}),
  });
};

portraitDrag = installPortraitDrag({
  board: guessBoard,
  canDrag: () => ["daily", "warmup"].includes(state.screen) && !isFinished() && !isExample(),
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
  const text = dailyShareText(currentChallenge(), currentProgress().guesses, state.locale, "Guild of Wits", (currentProgress().hints ?? []).filter(Boolean).length);
  if (!text) return;
  const locale = state.locale;
  const result = await shareText(text);
  if (result === 'manual') showShareText(text, locale);
  if (result === 'copied') { dailyNotice = 'copied'; renderDailyNotice(); }
});
installSettings({ getLocale: () => state.locale, onHelp: openHelp, reset: kind => {
  for (const key of storage.keys()) {
    if (!key.startsWith('heroguesser:')) continue;
    if (kind === 'all' || kind === 'stories' && key.startsWith('heroguesser:story:') || kind === 'dailies' && /^heroguesser:v1:/.test(key)) storage.removeItem(key);
  }
  if (kind === 'stories' || kind === 'all') adventures.reset();
  if (kind === 'dailies' || kind === 'all') { state.selectedSlot = 0; dailyNotice = null; invalidDaily = false; progress = Object.fromEntries(CHALLENGES.map(c => [c.id, restoreProgress(c)])); }
  if (kind === 'all') { warmup = newWarmup(); state.difficulty = 'easy'; state.locale = 'en'; tutorial.leave(); }
  showScreen('home');
}});
function replayWarmup() {
  clearModeParams();
  warmup = newWarmup(); saveWarmup(storage, warmup); showScreen('warmup'); state.selectedSlot = 0; render();
}
function openHelp() { showHelp({ locale: state.locale, onWarmup: replayWarmup, onPrelude: () => tutorial.start() }); }
document.querySelector('#help-open').onclick = openHelp;
document.querySelector('#daily-nav').onclick = () => showScreen('daily');
document.querySelector('.brand-lockup').onclick = event => { event.preventDefault(); showScreen('home'); };
document.querySelector('#warmup-skip').onclick = () => { warmup.status = 'skipped'; saveWarmup(storage, warmup); showScreen('daily'); chooseChallenge('easy'); };
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
if (!directMode && isWarmup()) saveWarmup(storage, warmup);
// Refresh browser-history views without discarding saved chapters.
addEventListener("pageshow", event => { if (event.persisted) render(); });

// Large text and short screens use document flow rather than an obscuring dock.
const dock = document.querySelector('.daily-dock');
const sizeDock = () => dock.classList.toggle('flow-layout', innerHeight < 650 || parseFloat(getComputedStyle(document.documentElement).fontSize) > 20 || dock.getBoundingClientRect().height > innerHeight * .55);
new ResizeObserver(sizeDock).observe(dock);
addEventListener('resize', sizeDock);
sizeDock();
