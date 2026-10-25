# HeroGuesser

A standalone fantasy deduction game with a guided tutorial, four short story chapters and three daily puzzles. English and Polish; mouse, touch and keyboard; no ads or runtime dependency on the original games.

**Play:** https://dombialcz.github.io/HeroGuesser/
**Repository:** https://github.com/dombialcz/HeroGuesser

## Run locally

```sh
npm ci
npx playwright install chromium
npm run serve
```

Open http://127.0.0.1:4180/. Node 22 or later and Python 3 are used by the development tooling. The game itself is static HTML/CSS/JavaScript and needs no backend. Google Fonts is the only external presentation resource; fallback fonts remain usable if it is unavailable.

## Verify and publish

```sh
npm test
npm run check:standalone
npm run build
node scripts/check-mastermind-home.mjs
node scripts/check-mastermind-tutorial.mjs
node scripts/check-mastermind-adventures.mjs
node scripts/check-mastermind-celebration.mjs
```

Browser scripts expect the local server on port 4180; set `HERO_GUESSER_BASE_URL` to target another server or a deployed site. Additional check-mastermind scripts cover art, feedback, dragging and mobile scrolling. Internal module/test names retain the familiar Mastermind terminology.

GitHub Actions runs unit/dependency checks, builds a minimal site into `dist/` and deploys it to GitHub Pages on pushes to `main`. Site output excludes tests, development scripts, original PNGs and planning documents. Use `npm run serve -- --directory dist --port 4174` to preview that exact output after building.

## Project structure

- `index.html`, `mastermind.css`, `src/`: independent game and local utilities.
- `assets/`: shipped portraits, props and background; art prompt manifests.
- `art-source/`: original PNGs and source prompt, retained for future art iteration.
- `test/`, `scripts/`: unit tests, browser checks, build and preview tooling.
- `MASTERMIND_APP_STORE_PLAN.md`: prioritized mobile store release roadmap.
- `progress.md`: extraction notes and relevant earlier development history.

Daily save keys use `heroguesser:`. Browser saves on the former site do not automatically transfer to this different origin. The seed namespace is deliberately preserved so the daily formations themselves are unchanged by extraction.

## Gameplay

See the [mobile app store release plan](MASTERMIND_APP_STORE_PLAN.md) for prioritized iOS/Android packaging, product, privacy, testing and submission tasks.

Opening `index.html` shows a home screen with **Play Tutorial**, **Play Stories** and **Daily Puzzles**. Stories opens a separate four-adventure selection, with every chapter shown as a matching illustrated button. The **Home** button returns from any mode; daily difficulty, guesses and unfinished arrangements stay intact, while leaving a short tutorial or story drops that run. Home removes direct-mode parameters so reloading it stays on the home screen. Existing tutorial/adventure links still open their modes, and `index.html?daily=1` opens the daily board directly. Home and navigation support English, Polish, touch and keyboard. Run `node scripts/check-mastermind-home.mjs` for navigation, saved daily progress and responsive/enlarged-text checks.

Solving a daily, story or tutorial puzzle shows a brief gold victory badge with flying confetti. The decoration leaves controls usable and preserves keyboard focus; reduced-motion settings show a static badge without particles. Opening an already solved daily puzzle does not replay the effect. Mastermind has no per-attempt ads. Run `node scripts/check-mastermind-celebration.mjs` for win triggers, navigation cleanup, reduced motion and responsive layouts.

Choose **Play Tutorial** on the home screen, or open `index.html?tutorial=1`, for three short practice scenes in English or Polish. All placements use explicit **Check arrangement**. In the treasury, choose one thief and two piles of coins. Checking the first valid row creates the adaptive worked-example answer: a fixed window appears opposite the first thief (random side for a middle thief), giving one correct place and two elsewhere. The checked example sits immediately beneath each explanation, with a short comprehension question before the window clue. Next, infer the thief's escape from a fixed guard, using optional progressive hints. Finally reconstruct a four-place **Order of Coin / Zakon Monety** using the same exact class-count names as daily play: three Knights and one Thief. A Bard distractor teaches pieces that contribute neither correct-place nor elsewhere feedback. The last formation is a fixed, independent puzzle rather than a supplied solution.

Tap a filled place to clear it; choose an empty place and then a piece to refill. Hold and drag to move or swap, using the same pointer implementation as the daily game. Number shortcuts work while slots are focused; Undo recovers a last edit, clear or restart. Keyboard focus follows the instruction, checked result and editable row in document order. Accessible names identify the window's side and adjacent place, and announcements report placements and scores. Feedback has descriptive labels as well as colour. Fixed guards are labelled static pieces, outside the edit controls. Layouts reflow at 200% text size in both languages, and reduced-motion preferences disable entry animations.

Failed checks clear movable places for a fresh row; the latest checked attempt appears above it and earlier attempts remain below. A solved scene discards all its attempts and adds only its verified arrangement and story fact. Tutorial runs are memory-only: exiting, navigating away, reloading or closing the browser drops the run, including back/forward cache restores. Obsolete tutorial saves are removed; daily challenge saves and the selected language retain their existing behaviour. This is practice with unlimited attempts and no health cost. The tutorial ends with a direct link to the first adventure, with the daily Easy puzzle available as a second choice. Run `node scripts/check-mastermind-tutorial.mjs` for the full responsive, keyboard, focus, pointer, Undo, text-enlargement, lesson and lifecycle checks.

Choose **Play Stories → The Last Round** (`index.html?adventure=1`) for three tavern scenes: share ale, recruit the Bard and escape two Zombies. **The Court That Would Not Sleep** (`adventure=2`) follows the party to a hedge Mage, then uses a royal coin at the empty throne to reveal that the curse targets the King. The bell remains active. **The King’s Awakening** (`adventure=3`) introduces the King in three scenes: wake in his guarded bedchamber, escape an enchanted corridor, and take refuge while guards fight Zombies at the chapel doors. **The Last Bell** (`adventure=4`) sends the Thief, Mage and Knight through the tower square, past a sealed stair and into the belfry to silence the bell and save the King; the Bard stays with him in the chapel. Each chapter links to the next and starts with fresh health. All eleven scenes have exactly one answer under their clues.

The King is the only new character; royal guards reuse Knight pieces with an explicit explanation. The final Cursed Bell is a scored, movable piece, distinct from earlier unscored landmarks. King, ale and zombie artwork generation prompts/source paths are recorded in `assets/mastermind/ADVENTURE_ART.json`; the bell is a small SVG matching existing prop icons.

Each adventure starts with **five health**. A complete incorrect Check costs one health; edits, duplicate-placement corrections, incomplete rows and the two progressive hints cost nothing. Health carries between scenes and refreshes for the next adventure. At zero, the board locks and offers a fresh adventure retry. Scene introductions explain the story and rules before play; clues stay visible alongside the active puzzle. “Next to” means immediate horizontal adjacency, with no wraparound. Doors, windows and distant towers are labelled landmarks outside the scored row; the final scene explicitly introduces the Cursed Bell inside the row. Every authored scene has exactly one answer under its clues. Failed checks clear the current row and keep immutable scored attempts, separated from the verified story facts. Solving removes those attempts. Adventure progress lives only in memory; exit/reload/navigation/BFCache discard it, while daily saves remain isolated. Tap, hold-drag, keyboard picks, focus, announcements and edit/clear/restart Undo match tutorial controls; Undo cannot refund a checked health loss. All four stories and controls are translated into English and Polish. Run `node scripts/check-mastermind-adventures.mjs` for full responsive playthroughs, health/retry, hints, lifecycle, storage isolation and real pointer/keyboard checks.

HeroGuesser is a standalone daily hero-code puzzle game. Easy, Medium, and Hard use ordered parties of five, six, and seven classes, with unlimited guesses. The party name identifies one triplet, an optional pair, and one exact singleton; class portraits and the decoded clue words remain visible while playing. Feedback reports green for heroes in the correct position, yellow for matches in another position, and grey for heroes not included in the hidden formation (a wrong class or an excess copy). These are totals for the entire row; the three counts always add up to the party size, including a visible grey zero for a correct formation. The legend and accessible descriptions explain all three results in English and Polish. Checked guesses appear beneath the active formation in newest-first order, preserving all earlier attempts, and the interface can be switched between English and Polish. Hold a portrait for a moment to drag it: dropping on an occupied active slot swaps heroes, while dragging from a checked row makes a copy. Dropping outside or pressing Escape cancels. Touch drags can scroll the page at its edges. Tap a filled active slot to clear it, or tap an earlier portrait to copy into the next open slot. Daily answers are generated from the browser’s local date and each challenge’s difficulty, with all guesses and the current row saved locally, including old ten-attempt saves. Run `node scripts/check-mastermind-drag.mjs` for mouse/touch and unlimited-history checks, and `node scripts/check-mastermind-flow.mjs` for stationary controls, newest-first history and the static selector. Run `node scripts/check-mastermind-feedback.mjs` for grey counts, duplicate handling, legacy saved rows and responsive feedback layouts.
