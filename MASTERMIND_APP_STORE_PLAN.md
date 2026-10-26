# Guild of Wits — web and iPhone release roadmap

Updated 25 October 2026. This is the authoritative release contract for the current build; archived entries in progress.md describe older rules. The proposed mobile monetization scenario and implementation checklist are in [release/MONETIZATION.md](release/MONETIZATION.md). Its explicitly open choices and shipping milestone remain undecided.

## Product contract

- Release name: **Guild of Wits**, selected by the publisher. Repository and public web URL remain dombialcz/HeroGuesser. Keep existing heroguesser save keys and daily seed namespace.
- Web is the primary iteration and testing path. iPhone is the first native release; Android and iPad are later work.
- Current build: existing tutorial, The Cursed Bell campaign (four chapters/eleven scenes), and three daily difficulties are free in EN/PL. No ads, purchases, accounts, analytics SDK, notifications or cloud synchronization. Planned mobile access changes are tracked separately in release/MONETIZATION.md and are not implemented yet.
- The story has sequential chapter access: completing the last puzzle opens the next chapter. Chapter replay preserves earned unlocks; resetting story progress clears unlocks. Valid saves from previously selectable later chapters retain access.
- Stories have unlimited attempts, free hints and explicit Check. Wrong rows clear into immutable history. Solving removes attempts and retains the verified story fact.
- Each chapter saves independently. Home, backgrounding and termination preserve its draft, attempts, hints and verified scenes. Confirmed restart replaces that chapter's run. Edit Undo remains; restart is confirmed rather than undoable.
- Tutorial runs are temporary: in-memory backgrounding is safe, but exit/reload/fresh launch starts over.
- Dailies follow the device's calendar date. Save the old board and switch to the matching date on startup, foreground and a visible 15-second check. Never interrupt a story. Guard daily edits/checks/drop/share against stale dates. Retain 90 days of daily saves; no archive browsing in v1.
- Solved dailies share only the name, date, difficulty, attempt count, aggregate row counts and existing web URL. Native/browser sharing falls back to clipboard or selectable text. Cancellation preserves the result.

## Milestones and evidence

### 1. Foundation

- [x] Preserve original baseline (commit d93c9d6); `npm run baseline` reconstructs it, records its 14 tests, screenshots and representative daily codes.
- [x] Prepare naming research and record publisher choice: see release/NAMING.md.
- [x] One browser regression command: `npm run test:browser`.
- [x] Pull-request CI verifies unit, standalone/build, Chromium/WebKit and unsigned iOS simulator build. Main continues to deploy Pages.
- [ ] Confirm the selected name in App Store Connect before submission; preliminary search is not a reservation or rights clearance.

### 2. Relaxed stories and saves

- [x] Remove health, failure lockouts, hearts and corresponding copy/tests.
- [x] Continue per chapter with schema/content validation, recomputed feedback and visible recovery for bad saves.
- [x] Confirm restart/selective deletion, retain edit Undo and display storage failure warnings.
- [x] Verify all four story playthroughs and actual pointer/keyboard controls across desktop/mobile/large text.

### 3. Daily reliability and sharing

- [x] Rollover guards, backward-date handling, story isolation and 90-day retention.
- [x] Existing daily v1 keys and answers retained; explicit schema/generator metadata added.
- [x] Spoiler-free sharing with cancellation and manual-copy fallback.
- [x] Chromium/WebKit tests cover interrupted dragging, saved previous day, date changes and selective reset.

### 4. Installed iPhone game

- [x] Capacitor 8 + Swift Package Manager; separate offline native output from shared static source.
- [x] Local fonts with OFL notices, native Preferences initialization and serialized writes.
- [x] iPhone portrait/landscape, version 1.0.0/build 1, app icon and restrained launch screen.
- [x] Migrate generated UIKit template to UIScene: required to launch with the installed Xcode 27/iOS 27 SDK.
- [x] Add UserDefaults privacy reason CA92.1 and disable native WebView inspection/logging.
- [x] Simulator Release build and native UI persistence/solve test (repeat after name/build changes).
- [ ] Install signed app on the publisher's real iPhone; verify offline first launch and full gameplay.
- [ ] Verify lower supported OS/device behavior. Deployment minimum is **iOS 15.4**, because the game uses native dialog, structuredClone, Array.at and :has support introduced there. Do not claim iOS 15.0 compatibility.

### 5. Release quality and publishing

- [x] About/Settings, reset controls, offline privacy summary and EN/PL development privacy/support pages.
- [x] Data/rights inventory, listing/reviewer drafts, playtest protocol and enrollment instructions under release/.
- [ ] Five observed first-time playtests and resolved blocking feedback.
- [ ] Real-device VoiceOver tutorial and daily completion; larger system text and reduced motion.
- [ ] Publisher legal identity, support email, Apple Developer enrollment and signing team.
- [ ] Final public privacy/support contact, asset rights review and current App Store declarations.
- [ ] TestFlight beta, complete device/offline/update matrix and blocker resolution.
- [ ] Freeze exact commit/build, approve listing and submit for **Poland** first.

Run `npm run check:release` to list uncompleted publisher/device gates. A simulator success is not physical-device, TestFlight or store approval evidence. The tool must remain blocked until the evidence exists.

## Reproducible commands

```sh
npm ci
npx playwright install chromium webkit
npm test
npm run check:standalone
npm run build
npm run test:browser
npm run ios:sync
npm run ios:open
npm run ios:test
npm run check:release
```

Baseline screenshots/results and current browser/native results are under ignored output/. Sources, check scripts, baseline answers and native project are tracked. `npm test` explicitly targets test/ so reconstructed baseline sources do not become duplicate tests.

## Later work

After iPhone validation: Android lifecycle/Back, signing and Play requirements; iPad-native validation/listing; broader territories; additional chapters, timers and local statistics. The working monetization model is one free daily, one rewarded ad for the remaining pair, a free first story chapter, permanent ad unlocks for later chapters, and an optional paid unlock. Follow [the monetization checklist](release/MONETIZATION.md); whether this ships in v1 or a later update remains open.

## Primary references to recheck before submission

- [Capacitor setup/SPM](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Apple scene lifecycle migration](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle)
- [Safari 15.4 requirements used by the game](https://developer.apple.com/documentation/safari-release-notes/safari-15_4-release-notes)
- [Apple upload requirements](https://developer.apple.com/news/upcoming-requirements/)
- [App privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple enrollment](https://developer.apple.com/programs/enroll/)
