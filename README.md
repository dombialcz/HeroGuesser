# Guild of Wits

A fantasy deduction game: arrange heroes from clues, learn in a three-scene story prelude, follow The Cursed Bell through four chapters and eleven more puzzles, and solve four fresh daily formations. Free, EN/PL, mouse/touch/keyboard, no ads or accounts.

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

The guild board uses walnut brown, warm parchment, antique-gold accents, a compact paper commission and the existing colourful portraits in bevelled square frames. Generated warm-grey stone adds a subtle seamless repeating background across Home, Quests, tutorial and Story; paper grain appears on commissions, scene clues and the Daily invitation. A subtle repeating walnut grain sits beneath brown Home, Daily, Story and dialog panels, tinted to preserve the existing palette and reading contrast. Its 512px JPEG and exact built-in imagegen prompt are in `assets/textures/dark-walnut-v1.{jpg,json}`, with the original in `art-source/textures/`. CSS luminosity blending and warm tints keep the textures within the walnut/parchment palette. Optimized 512px JPEG tiles keep downloads small, with originals and exact prompts preserved in `art-source/textures/` and `assets/textures/GENERATED_TEXTURES.json`. Plain colours remain the fallback. A shared star-and-three-stones guild crest appears on wax seals and engraved heading accents. Full-width blue ribbons with roomy padding, pale-grey lettering and a beaded lozenge trim mark the main Home, Quests and chapter-selection headings; campaign metadata stays quiet above them. Prelude and later chapters reuse the same `story-journal` CSS: one ribbon on the current scene/step title, quiet progress and back links, readable paragraphs, plain section headings and parchment clue panels with dark ink. The daily area is called Quests (Zadania); light-brown difficulty buttons use a brighter selected face, a dark-brown selection edge and a gold focus outline; primary actions use gold; supporting navigation and chapter choices use walnut surfaces. Body text uses warm off-white, metadata uses muted neutral tones, and success text stays light grey. Disabled Check controls retain readable text on a muted brown face. Language and clear controls have at least 44px touch targets; focus on parchment uses a dark outline. Destructive Settings actions use a restrained burgundy treatment. The original vector ornaments are in `assets/decor/`, with all labels kept as live text. Home pairs a prominent Daily invitation with a smaller Story card, using distinct generated campaign emblems: four formation cards and a cursed brass bell. Transparent runtime WebPs live in `assets/campaigns/`; originals and exact prompts are preserved in `art-source/campaigns/` and `assets/campaigns/GENERATED_EMBLEMS.json`. Daily opens with a prominent gold button above a quiet title and short description; its faint formation emblem sits behind the card content with slight decorative overflow. Story also opens with its Play Story button, followed by campaign metadata and a compact bell flourish behind The Cursed Bell title ribbon. The top-aligned 3:2 desktop cards stack Daily first on phones, with no reserved large artwork stage. They replace the Home portrait pairs; gameplay portraits remain unchanged. On phones the labelled hero selector stays above the stationary active formation; previous attempts form a compact ledger below it, with a Copy row action for each attempt. In Daily puzzles, steel padlocks overlapping the top edge of active slots retain chosen heroes through checks, clearing and row copies; locked portraits use a steel-gray frame and stone-gray backing, and locks save per day/difficulty and can be toggled off to edit. These are player hypotheses, never confirmed feedback. Story/Prelude retain their own scene boards. Formation rules and Controls expand through native EN/PL disclosures, including keyboard activation. Frames own image dimensions; missing gameplay artwork reveals a localized class token. Feedback uses a green square, gold diamond and grey ring, with numeric totals and accessible descriptions. Placement and result-stamp motion runs only on actions and respects reduced motion. The focused visual check is `node scripts/check-guild-design.mjs` (also included in the browser suite): Chromium/WebKit across desktop, tablet, phones and landscape, Polish at 200% text, larger 64px phone portraits with only a short scroll to Check at 390×844, disclosures, keyboard focus, action-only motion and solving with failed portrait requests. Screenshots and measurements are written to `output/tabletop-after/`; local before captures are in `output/tabletop-before/`.

## Play and saves

- **First launch:** Home lists Daily Puzzles first and Story second. New players can choose Play tutorial or Skip for now. Skipping briefly points to Story → Prelude and lets the main Story action start Chapter 1. The answer is stored in `heroguesser:onboarding:v1` through localStorage / iOS Preferences. Existing daily/story players bypass the invitation after updating. Story/daily resets preserve the answer; Reset All clears it for the next normal launch. Direct tutorial/daily/chapter links retain their destination.
- **Prelude:** the three guided tutorial scenes open The Cursed Bell from the Story menu. Begin Story starts here unless the player declined the first-launch tutorial. Finishing offers **Seek today’s riddles** (Easy daily, with all four daily choices available) first, followed by **Venture forth** (continue the saved story chapter). Completion saves independently, including when choosing dailies; unfinished prelude runs start fresh after exit/reload. Replay is always available from the chapter menu.
- **Story:** The Cursed Bell is one campaign in four chapters, with unlimited attempts and hints. Chapter 1 can also be selected directly to skip the prelude; solving the last scene unlocks the next chapter. Begin/Continue Story follows the prelude and campaign, including pending chapter endings. Existing chapter saves bypass the prelude. Unlocked chapters can be revisited from the chapter menu. Home/reload/background/closure preserve progress. Restart and reset require confirmation. Chapter replay preserves earned unlocks; Reset Story Progress clears prelude completion and chapter saves and locks chapters 2–4 again. Existing valid saves from later chapters retain access. Wrong checks clear the draft and keep history; solving keeps the verified scene fact and drops its attempts.
- **Daily:** four challenges: Easy (five slots), Medium (six), Hard (seven), and Party Roll (Polish: Drużyna z przypadku; five). Easy/Medium/Hard have party-name count clues; Party Roll independently draws every slot from all seven heroes, with unrestricted repeats and no count clues. Green means correct place; yellow means included elsewhere; grey means absent or excess copy. Feedback is a total for the entire row. Unlimited guesses, date/difficulty-specific local saves and spoiler-free result sharing. Copy any previous row into the current attempt; its copy button preserves locked positions. Use the open/closed steel padlocks on the top edge of filled slots to keep those heroes after checking, clearing or copying. Unlock to edit again. Locks are saved player hypotheses, not confirmed feedback.

The story learning curve grows from a three-place adjacency puzzle to six-place deductions using ordering, gaps, repeated pieces and exclusions. Free hints teach a next step; solved scenes offer an optional explanation. See [the scene-by-scene progression](release/STORY_PROGRESSION.md). Content edition 2 preserves original chapter-1 saves; older saves in revised chapters 2–4 require a confirmed restart.

New daily puzzles follow the device's calendar date, including resume/date changes. Previous boards save before the date switches; stories are not interrupted. Saves older than 90 days are pruned, with no archive browser in v1. Dates/timezones changed backwards restore matching retained progress. Web and iPhone saves are separate; clearing browser data or uninstalling can remove them. Storage failures visibly mark the session temporary.

Tap to place/clear, hold-drag to move/swap, copy earlier daily portraits and use keyboard shortcuts. EN/PL, enlarged text, descriptive feedback, focus announcements and reduced-motion celebration are supported. Home removes direct-mode query parameters. Existing `?tutorial=1`, `?adventure=1` through `4`, and `?daily=1` links continue to work; adventure links resume their chapter.

Settings includes About, privacy, support and separate story/daily/all-data resets. Public development pages are privacy.html and support.html; final publisher contact remains a store-release gate.

Character placement and drag moves play one of seven thuds extracted from the supplied recording, avoiding consecutive repeats. Daily puzzles, tutorial and story mode share the effects. Toggle sound effects in Settings; the preference is saved on the device. The standalone WAVs are in `assets/audio/`; regenerate them with `python3 scripts/split-placement-thuds.py '/path/to/Single Thud.wav'`.

Daily wins and solved tutorial/story scenes play `music/correct.wav`. Solving a chapter's final scene plays `music/fanfare.wav` instead, immediately marking chapter completion. The Sound effects setting controls all effects. Both recordings are bundled for web and offline iPhone play.

Removing an individual piece plays a reversed thud at 1.8× speed across all modes. These variants are derived from the existing thuds in memory, with quiet tails trimmed and short fades. Empty-place selection and clearing the whole row stay silent.

Background music shuffles through all six `music/dungeon_melody_1.mp3`–`dungeon_melody_6.mp3` tracks, starting after the first interaction. It defaults to 50% volume. Settings has a separate music toggle and 0–100% slider; both persist between runs, independently of sound effects. Music pauses in the background and resumes when returning to the game. All tracks are bundled for offline iPhone play.

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
