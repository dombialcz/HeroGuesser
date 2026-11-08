# Guild of Wits

A fantasy deduction game: solve four fresh daily formations, learn through a short playable warm-up, and optionally follow The Cursed Bell through a guided prelude and four story chapters. Free, EN/PL, mouse/touch/keyboard, no ads or accounts.

Previously named HeroGuesser. [Play on the existing website](https://dombialcz.github.io/HeroGuesser/) · [Repository](https://github.com/dombialcz/HeroGuesser). The repository URL, local save namespace and daily seeds remain stable through the rename. Local development changes reach the hosted website when deployed from main.

Mobile monetization is planned separately in [the scenario and implementation checklist](release/MONETIZATION.md): a free daily with a rewarded unlock for the other two, chapter unlocks and an optional one-time purchase. This is not implemented; the current build remains free with no ads or purchases. Open product choices and release timing are recorded in that checklist.

## Develop and verify

Node 22+, Python 3. The browser game is static HTML/CSS/JavaScript; fonts and artwork are bundled. No backend or network resource is needed for core installed gameplay.

```sh
npm ci
npx playwright install chromium webkit
npm run serve
# http://127.0.0.1:4180/
npm test
npm run check:standalone
npm run build
npm run test:browser
```

The browser suite starts a preview server if needed and exercises existing gameplay plus Chromium/WebKit release scenarios. Use HERO_GUESSER_BASE_URL for an already-running alternate server. `npm run serve -- --directory dist --port 4174` previews the exact web build. GitHub Actions verifies pull requests and deploys main to Pages.

## Visual identity

The interface keeps the walnut, parchment, stone textures, colourful portraits and Home/Story ribbons. Daily is the main experience: a compact public roster explains the party-name clues, a large walnut playing field leads the screen, guesses keep results beside portraits, and teal squares, amber diamonds and grey rings show row totals. Grey includes excess copies; feedback never identifies individual slots.

The named picker sits above the large active formation: a single row on desktop and four columns on phones. Check and hint controls follow the formation, then the guess history, newest first, keeping hero selection out of the attempt flow. Larger surfaces use normal page flow. Blue ribbons mark Daily, the formation and hero selection. Each guess appears once, with large portraits, feedback totals and a Use this guess button. On phones only the first submitted guess retains feedback labels. Later guesses show the three shapes and numbers in one row. A collapsible symbol guide above history explains all totals, including excess copies. Tap a portrait from any previous guess to add that hero to the selected open place, just like using the picker. All seven places fit at 320px. The Hint action is separate from the hero choices. Steel padlocks and grey portrait backgrounds mark player locks. The magical frame and check mark identify protected reveals. Existing locks and eye toggles retain their behavior. Essential board copy is at least 13px at the default phone text size. Home emphasizes today's puzzles with a gold button on a blue ribbon; Story remains secondary. Difficulty status and the next-puzzle countdown stay on Daily.

`node scripts/check-guild-design.mjs` verifies Chromium/WebKit desktop, tablet, 320/390px phones, landscape, EN/PL, 200% Polish text, all difficulties, feedback visibility, results/sharing and Story keyboard controls. Screenshots live in `output/overhaul/`. `check-first-run.mjs` covers worked-example onboarding, help/replay, migration and resets; `check-mastermind-mobile-scroll.mjs` covers short and long histories. Preserve existing generated-art provenance under `assets/` and `art-source/`.

## Play and saves

- **First launch:** a three-place warm-up opens with a labelled prepared guess: Knight / Thief / Cleric against a fixed Knight / Bard / Thief answer. Check demonstrates one right place, one wrong place and one absent hero; Use this guess copies it for editing. Warm-up progress, locks, hints and its 30-second cooldown persist separately. Help, language, Settings and Skip remain available. Completion/Skip opens Easy without completing the Story Prelude. Replay is in Help. Returning players open Daily at the last selected difficulty (Easy initially); existing tutorial choices or daily/story saves bypass new onboarding. Direct tutorial/daily/chapter links retain their destination. Story/daily resets preserve onboarding; Reset All clears it for the next normal launch. New state uses `heroguesser:warmup:v1` and `heroguesser:last-difficulty:v1` through localStorage / iOS Preferences.
- **Prelude:** the three guided tutorial scenes open The Cursed Bell from the Story menu. Begin Story starts here until completion; existing chapter saves and legacy declined-tutorial choices retain their continuation behavior. Skipping the new warm-up does not skip the Prelude. Finishing offers **Seek today’s riddles** (Easy daily, with all four daily choices available) first, followed by **Venture forth** (continue the saved story chapter). Completion saves independently, including when choosing dailies; unfinished prelude runs start fresh after exit/reload. Replay is always available from the chapter menu.
- **Story:** The Cursed Bell is one campaign in four chapters, with unlimited attempts and hints. Chapter 1 can also be selected directly to skip the prelude; solving the last scene unlocks the next chapter. Begin/Continue Story follows the prelude and campaign, including pending chapter endings. Existing chapter saves bypass the prelude. Unlocked chapters can be revisited from the chapter menu. Home/reload/background/closure preserve progress. Restart and reset require confirmation. Chapter replay preserves earned unlocks; Reset Story Progress clears prelude completion and chapter saves and locks chapters 2–4 again. Existing valid saves from later chapters retain access. Wrong checks clear the draft and keep history; solving keeps the verified scene fact and drops its attempts.
- **Daily:** four challenges: Easy (five slots), Medium (six), Hard (seven), and Expert (Polish: Ekspert; five; internal id `chaos`). Easy/Medium/Hard have party-name count clues; Expert independently draws every slot from all seven heroes, with unrestricted repeats and no count clues. A teal square means correct place; an amber diamond means included elsewhere; a grey ring means absent or excess copy. Feedback is a total for the entire row. Unlimited guesses, date/difficulty-specific local saves and spoiler-free sharing with aggregate scores and unique places revealed. Solving replaces the picker with a result card and optional next unsolved difficulty; all four solved shows the next local-midnight countdown. No streaks or play timers are recorded. Copy any previous row into the current attempt; its copy action preserves locked positions. Use the open/closed lock icons on the top edge of filled slots to keep those heroes after checking, clearing or copying. Unlock to edit again. Locks are saved player hypotheses, not confirmed feedback. The separate Hint action beside Check reveals a random unrevealed place, starting ready and then recharging for 30 seconds per puzzle. The revealed hero is protected by an open eye in place of its padlock. Close that eye to experiment, then reopen it to restore and protect the correct hero without spending another hint. Reveals, eye states and the cooldown persist across reloads. All revealed places disable further hints; Check still submits the formation. Confirmed open-eye portraits use the animated teal/magenta/violet oracle material, a glowing eye and a check mark. Reduced motion keeps the texture static. The material and original prompt remain in `assets/textures/oracle-shimmer-v1.{jpg,json}` and `art-source/textures/`.

The story learning curve grows from a three-place adjacency puzzle to six-place deductions using ordering, gaps, repeated pieces and exclusions. Free hints teach a next step; solved scenes offer an optional explanation. See [the scene-by-scene progression](release/STORY_PROGRESSION.md). Content edition 2 preserves original chapter-1 saves; older saves in revised chapters 2–4 require a confirmed restart.

New daily puzzles follow the device's calendar date, including resume/date changes. Previous boards save before the date switches; stories are not interrupted. Saves older than 90 days are pruned, with no archive browser in v1. Dates/timezones changed backwards restore matching retained progress. Web and iPhone saves are separate; clearing browser data or uninstalling can remove them. Storage failures visibly mark the session temporary.

Solved Daily tabs show the check mark, attempt count and a small medal graphic. Matching gold, silver and bronze medal graphics mark the guess ranges below the tabs and the award on the result card. Localized names remain available to assistive technology and through tooltips. Gold and silver end at 5 and 8 guesses on Easy, 6 and 10 on Medium, 8 and 11 on Hard, and 10 and 14 on Expert. Any later solve earns bronze. Shared results include the number of hints used, including zero.

Tap to place/clear, hold-drag to move/swap, copy earlier daily portraits and use keyboard shortcuts. EN/PL, enlarged text, descriptive feedback, focus announcements and reduced-motion celebration are supported. Home removes direct-mode query parameters. Existing `?tutorial=1`, `?adventure=1` through `4`, and `?daily=1` links continue to work; adventure links resume their chapter.

Game controls suppress text selection and iOS long-press callouts from the start of a press. Double-tap zoom is disabled across the game with `touch-action: manipulation`; scrolling and pinch zoom remain available outside draggable portraits, which retain custom hold/drag/swipe handling. Story text and clues can still be selected when no drag is active. Run `node scripts/check-browser-gestures.mjs` for Chromium/WebKit gesture checks.

Settings includes About, privacy, support and separate story/daily/all-data resets. Public development pages are privacy.html and support.html; final publisher contact remains a store-release gate.

Character placement and drag moves play one of seven thuds extracted from the supplied recording, avoiding consecutive repeats. Daily puzzles, tutorial and story mode share the effects. Toggle sound effects in Settings; the preference is saved on the device. The standalone WAVs are in `assets/audio/`; regenerate them with `python3 scripts/split-placement-thuds.py '/path/to/Single Thud.wav'`.

Daily wins and solved tutorial/story scenes play `music/correct.wav`. Solving a chapter's final scene plays `music/fanfare.wav` instead, immediately marking chapter completion. The Sound effects setting controls all effects. Both recordings are bundled for web and offline iPhone play.

Removing an individual piece plays a reversed thud at 1.8× speed across all modes. These variants are derived from the existing thuds in memory, with quiet tails trimmed and short fades. Empty-place selection and clearing the whole row stay silent.

Background music shuffles through all six `music/dungeon_melody_1.mp3`–`dungeon_melody_6.mp3` tracks, starting after the first interaction. It defaults off for players without a saved preference, with volume initially 50%. Sound effects remain on. Existing saved music preferences are preserved. Settings has a separate music toggle and 0–100% slider; both persist between runs, independently of sound effects. Music pauses in the background and resumes when returning to the game. All tracks are bundled for offline iPhone play.

## iPhone

Xcode 26+ is the Capacitor baseline; this workspace has Xcode 27 and an iOS 27 simulator. The project adopts UIScene and supports **iPhone / iOS 15.4+**, portrait and landscape. Apple’s upload requirements must be rechecked at submission.

```sh
npm run ios:run   # Build, install and launch in Simulator
npm run ios       # Build, sync and open Xcode
npm run ios:test  # Native UI test
```

The native build bundles an esbuild entry and uses Capacitor Preferences, App, Browser and Share plugins. Browser code has no bare npm imports. Preferences load before boards initialize; writes are serialized. The bundle ID is `com.dombialcz.guildofwits`; native origin stays `capacitor://localhost`. Choose your own signing team in Xcode for a physical iPhone. Run/test select a booted iPhone simulator or one from the newest installed runtime. Use `-- --simulator "iPhone 18 Pro"` (or a UDID) to choose one. See [the short iPhone workflow](IOS.md).

The iOS simulator test verifies a real chapter edit, backgrounding, force-close/relaunch, Preferences restore and solving. Device/VoiceOver/offline/update testing, paid enrollment and TestFlight are still required before publishing. See release/PUBLISHING.md.

## Repository map

- `index.html`, `mastermind.css`, `src/`: shared game and platform adapters.
- `assets/`, `art-source/`: shipped art/fonts with provenance, licenses and source images.
- `native/`, `ios/`: native entry, Xcode/SPM project and native UI test.
- `scripts/`, `test/`: build and verification tools.
- `release/`: naming choice, listing drafts, data inventory, playtests and publisher gates.
- `release/MONETIZATION.md`: proposed player flows, access rules, open decisions and implementation checkboxes for mobile monetization.
- `MASTERMIND_APP_STORE_PLAN.md`: authoritative roadmap; `progress.md`: development history.

Internal Mastermind module filenames are retained to avoid unrelated churn. `npm run baseline` reproduces the original pre-release-work commit; current testing excludes that archived checkout.
