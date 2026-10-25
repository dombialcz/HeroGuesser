# HeroGuesser — Mobile App Release Plan

Prepared: **25 October 2026**
Scope: a standalone puzzle game for **Apple App Store and Google Play**, reusing this repository's HTML, CSS, JavaScript and artwork.

The game has a working browser foundation. It is **not yet ready for store submission**: native projects, signed release builds, mobile lifecycle integration, privacy/support pages and store materials are missing. Browser tests are useful evidence, but do not establish that the installed app works correctly.

This plan separates store obligations from our own product quality goals. Completing it prepares a release for review; acceptance remains the stores' decision. Recheck linked policies when preparing the actual submission.

## 1. Release scope and current position

### Already available

- Home screen with Tutorial, Stories and Daily Puzzles.
- Three guided tutorial scenes and four connected adventures containing eleven authored story puzzles.
- Three daily difficulty levels, deterministic puzzles, unlimited daily guesses and locally saved daily rows.
- Previous-attempt history, a fresh editable row after checking, hints and verified story facts.
- English and Polish, keyboard/touch controls, descriptive feedback and reduced-motion behavior.
- Victory badge and confetti for solved puzzles.
- Unit tests and desktop/mobile browser regression scripts.
- No advertising or billing integration.

### Known gaps in the inspected source

| Gap | Why it matters | Planned action |
| --- | --- | --- |
| No iOS/Android project or mobile build pipeline | A website cannot be uploaded as a store binary | Create and validate installed builds |
| Google Fonts loaded over the network | First-run appearance depends on connectivity; adds third-party requests | Bundle licensed fonts locally |
| Standalone extraction complete | Root entry, utilities and assets are now independent | Verify native packaging next; cross-game links have been removed |
| Daily date captured once when the page loads | A long-running app can keep yesterday's puzzle | Handle resume and date changes explicitly |
| Story health still implemented | Earlier proposed removal has not happened | Remove it if adopting the proposed unlimited-attempt design |
| No solve timer or share-results flow | Proposed features are not yet implemented | Treat as product improvements, not store prerequisites |
| Story resets use browser lifecycle events | Native backgrounding and termination have different behavior | Define and test app lifecycle rules |
| No in-app privacy/support/about destination found | Release needs clear ownership, support and data information | Add a small Settings/About area and public pages |

## 2. Priority and completion rules

- **P0 — submission blocker:** complete before submitting the affected platform.
- **P1 — release quality:** complete before our public launch, although not necessarily an explicit store rule.
- **P2 — optional:** can follow the first release.
- A checked item needs evidence: a build, test result, document, screenshot or completed console field.
- Developer actions cover code, builds, testing and listing drafts. Publisher actions cover account identity, agreements, rights, contact details and final submission.

## 3. Phase A — Settle the product contract

1. **[P0] Choose the standalone identity and publisher.**
   - [ ] Choose the final app name, icon direction, developer display name and support email.
   - [ ] Check the proposed name and branding for existing store listings and relevant trademark rights. Treat “Mastermind” as a working title until checked; do not assume the name is cleared.
   - [ ] Decide whether Vaultbound remains an explicit brand or is removed from the standalone experience.
   - [ ] Choose supported countries, languages, device types and minimum OS versions.

2. **[P1] Freeze the first release's gameplay rules.**
   - [ ] Keep tutorial and daily puzzles free; keep per-attempt ads out.
   - [ ] Decide which existing stories ship free. Recommended first release: include the existing four-chapter arc and defer paid additions.
   - [ ] Confirm the earlier proposal to remove story health. If adopted, remove health loss, failure lockouts, hearts, restart penalties and related copy/tests together.
   - [ ] Keep wrong attempts visible while solving; discard them when a story scene is solved and retain its verified fact for the current run.
   - [ ] Keep unfinished tutorial/story runs temporary; keep daily progress separate.
   - [ ] Do not advertise purchases, subscriptions, “remove ads” or future story packs that the release does not provide.

3. **[P1] Define interruptions in plain language.**
   - [ ] Recommended rule: switching apps or receiving a call preserves the in-memory scene; explicit exit, a new run or a fresh launch after termination discards it.
   - [ ] Confirm whether “quitting” must also include backgrounding. If so, say this before play and implement it deliberately; an ordinary notification should not silently become an unexplained reset.
   - [ ] Explain near story entry: short runs do not resume after the app is closed.
   - [ ] Keep completed-scene facts only as long as needed for that run; no cloud save or account is needed for this design.

**Exit condition:** one agreed set of rules that matches the UI, tests and eventual store description. Unresolved monetization does not block a free release.

## 4. Phase B — Package a real installed game

4. **[P0] Add a mobile shell around the existing game.**
   - [ ] Evaluate **Capacitor** as the initial route: it supports iOS/Android apps using web technology and fits the existing codebase. This is a proposed engineering choice, not an implementation already present. [Capacitor overview](https://capacitorjs.com/)
   - [x] Create a dedicated static build output for the standalone game (completed during extraction; local font bundling and native packaging remain).
   - [ ] Make the native entry open the game home screen without development URLs or query parameters.
   - [ ] Add platform projects, stable bundle/application identifiers, version numbers, launch screens and platform icon assets.
   - [ ] Pin a supported runtime/plugin/toolchain combination and record reproducible build commands.
   - [ ] Produce an installable release-mode build on a real iPhone and Android phone before adding optional features.

5. **[P0] Make core play independent of our web host.**
   - [ ] Bundle all story content, portraits, props, CSS, JavaScript and licensed fonts with the application.
   - [ ] Verify a first launch in airplane mode: home, tutorial, all stories, daily generation and victory effects must work.
   - [x] Remove unrelated game links (completed during extraction).
   - [ ] Open genuine support/privacy web links through a suitable native browser flow.
   - [ ] Restrict WebView navigation and native bridge access to intended content; do not enable arbitrary remote pages to call native plugins.
   - [ ] Remove local-server instructions from the installed experience; keep development guidance in the web/development build only.

6. **[P0] Meet the platform build requirements.**
   - [ ] **iOS:** the currently published baseline requires Xcode 26 or later and an iOS 26 SDK or later for uploads; the current minimum deployment target rule is iOS 13 or later. Choose a deployment target also supported by our runtime/plugins. SDK version and oldest supported OS are separate settings. [Apple requirements](https://developer.apple.com/news/upcoming-requirements/)
   - [ ] **Android:** new submissions currently need Android 16 / API 36 or higher. Set and test the required target; choose the minimum supported Android version separately. [Google Play target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
   - [ ] Export a signed Android App Bundle (`.aab`) for Play distribution. [Android App Bundles](https://developer.android.com/guide/app-bundle)
   - [ ] Audit bundled native libraries/plugins for 64-bit and 16 KB page-size compatibility and test affected builds. Follow the current console deadlines rather than assuming a JavaScript game has no native dependencies. [Android page-size guidance](https://developer.android.com/guide/practices/page-sizes)
   - [ ] Audit iOS SDK privacy manifests, required-reason API declarations and any applicable SDK signature requirements in the final archive. [Apple SDK requirements](https://developer.apple.com/support/third-party-SDK-requirements/)
   - [ ] Disable production WebView debugging and unnecessary permissions. Keep signing secrets out of source control.

**Exit condition:** signed release builds install and play from bundled assets, without a local server or hosted-game dependency.

## 5. Phase C — Make mobile behavior reliable

7. **[P0] Integrate navigation and app lifecycle.**
   - [ ] Implement Android Back consistently: close an open panel first, return to the relevant menu next, and handle leaving an unfinished story deliberately.
   - [ ] Handle background/resume using native lifecycle events; browser `pagehide` alone is insufficient evidence.
   - [ ] Cancel active drags and transient celebrations on interruption; avoid stuck pointer states after resume.
   - [ ] Test termination, relaunch and interrupted scene transitions against the Phase A persistence rules.
   - [ ] Avoid confusing browser navigation, accidental external navigation and blank screens.

8. **[P1] Correct daily rollover and storage.**
   - [ ] Keep local-calendar daily puzzles initially; display the date and explain when a new puzzle becomes available.
   - [ ] Recheck date on app resume and while active across midnight. Offer a clear transition without scoring yesterday's row against today's solution.
   - [ ] Define timezone travel, daylight-saving and manual clock-change behavior. No server-based anti-cheat is needed without competitive rankings.
   - [ ] Version puzzle generation and saved data so an update cannot silently change the answer behind a saved attempt.
   - [ ] Test old saves, malformed saves, unavailable storage, app updates and daily puzzle restoration.
   - [ ] Choose retention for old daily saves and add a clearly labelled local-data reset. Do not let dated saves grow indefinitely.
   - [ ] Do not promise cross-device saves or migration from website storage; they are separate app storage environments.

9. **[P1] Finish touch and accessibility checks inside the app.**
   - [ ] Test safe areas, notches, status/navigation bars, home indicators and edge-to-edge layouts.
   - [ ] Test phones, tablets and resizable/landscape layouts for every device class we support; do not rely on orientation locks to hide broken layouts.
   - [ ] Verify tap-to-place/clear completes every puzzle without dragging.
   - [ ] Target at least 44 pt touch areas on iOS and 48 dp on Android; confirm physical usability on devices.
   - [ ] Complete tutorial and a daily puzzle with VoiceOver and TalkBack. Check slot names, piece names, reading order, feedback announcements and focus after checking.
   - [ ] Verify large system text, English/Polish wrapping, high contrast and feedback that does not depend on color alone.
   - [ ] Honor reduced motion in native WebViews. Keep the victory effect brief, dismissible through normal navigation and free of flashing.

**Exit condition:** an interrupted player can always understand where they are, what is retained and what happens next.

## 6. Phase D — Validate the puzzles and experience

10. **[P1] Validate content and onboarding.**
    - [ ] Recheck every authored scene for a unique solution, consistent counts and clues that match the story.
    - [ ] Verify green/yellow/grey scoring with duplicate heroes and excess copies.
    - [ ] Make clear that feedback counts describe the entire attempt, rather than corresponding to individual slots.
    - [ ] Recheck the deliberately failed tutorial example: its explanation should make the lesson understandable and fair.
    - [ ] Keep missed attempts visibly separate from established story facts.
    - [ ] Check free hints lead toward reasoning without requiring outside knowledge.
    - [ ] Proofread all English and Polish story, instruction, error and navigation text.
    - [ ] Sample generated daily puzzles across many dates for valid clue counts, deterministic answers and reasonable difficulty. Measure playability separately from mathematical correctness.
    - [ ] Run observed sessions with people unfamiliar with the game. Record confusion, accidental taps, hint use and whether they can finish without coaching.

11. **[P2] Add result stats and spoiler-free sharing if scope permits.**
    - [ ] Define attempts and timing first. Recommended timer: start on first meaningful interaction, stop on solve, exclude background time and avoid a forced countdown.
    - [ ] Specify whether daily timing survives relaunch; label casual stats appropriately without claiming competitive accuracy.
    - [ ] Share date/puzzle identifier, difficulty, attempt count and aggregate feedback for each row, for example `3 green · 2 yellow · 1 grey`.
    - [ ] Never include hero names, portraits, answer order or hidden solution in the share payload.
    - [ ] Generate a compact result summary before discarding solved story attempts if story sharing is added.
    - [ ] Use the native share sheet with a copy-text fallback. Cancelling sharing must preserve the result; no social login or contacts permission is needed.

**Exit condition:** first-time players can learn and solve; optional stats/sharing do not delay an otherwise complete release. Neither feature is a universal store requirement.

## 7. Phase E — Privacy, rights and store declarations

12. **[P0] Create an accurate data inventory and public policy.**
    - [ ] List every actual data flow: local preferences/daily saves, support correspondence, network resources, native plugins, diagnostics and any future analytics.
    - [ ] Prefer an account-free, local-first initial release with no ad/tracking SDKs.
    - [ ] Publish a stable HTTPS privacy policy naming the app/publisher, explaining data use, retention/deletion, third parties and contact details. Add an easily accessible in-app link. Apple requires the link in-app and in store metadata. [Apple review privacy rules](https://developer.apple.com/app-store/review/guidelines/#privacy)
    - [ ] Include an offline-readable privacy summary and support contact in the app.
    - [ ] Complete Apple's privacy answers from the final build's behavior, including integrated partners. [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/)
    - [ ] Complete Google Play Data safety, including SDK behavior; do not select “no data collected” without checking actual transmissions. [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
    - [ ] Check applicable privacy obligations for launch countries against the actual data inventory. Adding analytics later requires a new review of disclosures and consent needs. [Google User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
    - [ ] If accounts are ever introduced, add the required account-deletion routes before shipping them. No account system is needed for the present game.

13. **[P0] Finish content, rights and audience declarations.**
    - [ ] Answer both stores' current age/content questionnaires honestly: include fantasy combat, zombies, theft and tavern/ale references where asked. Do not guess or promise a particular rating.
    - [ ] Choose the real target audience. If targeting children, scope the additional platform obligations before submission; do not label the app for children merely because the artwork is cartoon-like.
    - [ ] Declare no ads in the current Google Play submission and review all other applicable App content fields. [Google review declarations](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en)
    - [ ] Record commercial-use rights and notices for fonts, code dependencies, generated artwork and any other assets. Keep existing art provenance files; verify applicable generation-service terms and third-party rights.
    - [ ] Add About/Credits, app version/build, support contact, privacy and local-data controls.
    - [ ] Confirm publisher/trader status and required public contact information for the chosen territories. Apple requires a trader-status declaration; EU distribution by traders includes verified public contact details. [Apple EU trader requirements](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements)

**Exit condition:** declarations describe the actual shipped app, and public policy/support links work without a login.

## 8. Phase F — Accounts, signing and listing materials

14. **[P0] Establish publishing access.**
    - [ ] Publisher chooses individual or organization accounts and completes identity/business verification requested by each console.
    - [ ] Enroll in Apple Developer Program and Google Play Console; protect accounts with strong authentication and recovery access.
    - [ ] Budget published registration fees: Apple currently lists USD 99 annually, with regional pricing; Google lists a USD 25 one-time fee. Confirm local charges at enrollment. [Apple enrollment](https://developer.apple.com/help/account/membership/program-enrollment/), [Google registration](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)
    - [ ] Reserve final identifiers, configure signing/provisioning and Play App Signing as appropriate, and back up required credentials securely.
    - [ ] Accept applicable agreements; complete any tax/banking setup required by the chosen distribution/payment model.

15. **[P0] Prepare an honest, complete store listing.**
    - [ ] Create final icons, Android feature graphic and screenshots at the sizes currently requested by each console.
    - [ ] Show real tutorial, daily and story gameplay; make text legible on store-sized previews.
    - [ ] Write English and Polish names/descriptions/keywords where supported; match screenshots and availability claims to the release.
    - [ ] Provide privacy/support URLs, category, content ratings, copyright/contact details and release notes.
    - [ ] Set countries, pricing and supported devices intentionally.
    - [ ] Complete export-compliance questions for the actual binary and dependencies; do not assume every game uses the same answers.
    - [ ] Write review notes with exact paths into all modes, offline behavior and the temporary story-run rules. No reviewer credentials are needed if the app has no login.
    - [ ] Explain the game's authored narrative deduction and replayable daily puzzles. Apple's minimum-functionality review considers whether an app offers value beyond a repackaged website; packaging alone does not settle that review. [Apple minimum functionality](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)

**Exit condition:** a reviewer can install the app, understand the release and reach all advertised content using the supplied information.

## 9. Phase G — Test the actual release and publish

16. **[P0] Run a release-build test matrix.**
    - [ ] Cover a real iPhone, a current Android phone and an older/lower-powered supported Android device; add real tablets if supported, with simulators/emulators filling OS/size gaps.
    - [ ] Test clean install, upgrade without losing valid daily data, force-stop/relaunch, uninstall/reinstall behavior, airplane mode and poor connectivity.
    - [ ] Cover background/resume, interruptions, midnight/date changes, language changes, back navigation and all screen sizes/orientations we claim to support.
    - [ ] Finish the tutorial, all eleven story scenes and all daily difficulties; exercise wrong, incomplete and solved rows, hints, restart, history and confetti.
    - [ ] Re-run `npm test` and the relevant `scripts/check-mastermind-*.mjs` browser checks. Add targeted native tests for behavior those scripts cannot cover.
    - [ ] Check cold start, memory growth after many attempts/restarts and animation responsiveness on the lower-powered device. Record measured results against an agreed performance budget.
    - [ ] Check release logs, network traffic and native permissions for crashes, unexpected requests, exposed secrets and development settings.
    - [ ] Resolve crashes, soft locks, lost/corrupted daily data, incorrect scoring, inaccessible core controls and misleading content before submission.

17. **[P0] Complete platform testing tracks.**
    - [ ] Distribute the iOS release candidate through TestFlight and Android through an internal testing track.
    - [ ] Recruit unfamiliar players for a closed beta; keep a simple issue log with reproduction steps and fixes.
    - [ ] If using a Google personal account created after 13 November 2023, currently complete a closed test with **at least 12 testers opted in continuously for 14 days**, then apply for production access. The elapsed period does not automatically grant access; retain meaningful testing feedback. [Google personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB)
    - [ ] Recheck account-specific console requirements and upload validation. Allow time for verification, beta review, fixes and production review.

18. **[P0] Submit and support the release.**
    - [ ] Freeze a release candidate, record its commit/build number and retain test evidence and signed artifacts.
    - [ ] Complete the final gate below; publisher reviews the concrete build and listing before submission.
    - [ ] Submit each platform, answer review questions and reproduce/fix any rejection before resubmitting.
    - [ ] Use a controlled initial launch where platform controls allow; for the first Android release, consider limited countries rather than assuming staged rollout is available.
    - [ ] Monitor platform diagnostics, reviews and the support inbox; prepare an urgent-fix build process and a way to pause further distribution if needed.
    - [ ] Assign ongoing responsibility for OS/runtime upgrades, policy deadlines and support responses.

## 10. Monetization stays outside the first-release critical path

Do not add an ad every five tries, an ad SDK, tracking consent flow or an “ad removal” product to this release. The game currently contains no ads. A useful free launch can validate whether people finish, return and ask for more stories.

If paid stories are introduced later:

- [ ] Decide exactly which chapters are free and which purchase unlocks which new content.
- [ ] Implement the standard store purchasing route for digital story unlocks, accounting for any applicable regional programs/exceptions. [Apple purchases](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase), [Google Play payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en)
- [ ] Handle cancellation, pending/interrupted purchases, duplicate callbacks, entitlement verification, restoration/reinstallation and refunds/revocations appropriately.
- [ ] Define offline access after a verified purchase and make purchase ownership understandable without relying on a temporary story save.
- [ ] Test sandbox transactions and show the exact price/content before purchase.
- [ ] Update store materials, support guidance and privacy disclosures before release.

Subscriptions, advertising, cloud accounts, leaderboards, live services and a backend are **not prerequisites** for this first release. Profitability is a separate question from store eligibility.

## 11. Recommended implementation order

| Order | Deliverable | Completion evidence |
| --- | --- | --- |
| 1 | Identity, release rules, lifecycle contract and publisher accounts | Decisions recorded; account verification underway |
| 2 | Bundled mobile shell and local fonts/assets | Release build plays offline on both platforms |
| 3 | Native navigation, lifecycle, daily rollover and storage versioning | Interruption/date/update tests pass |
| 4 | Gameplay/copy cleanup and accessibility | Observed first-time playtests and native accessibility checks |
| 5 | Privacy/support pages and store declarations | Working links and final-build data inventory |
| 6 | Signed beta, screenshots and listing drafts | TestFlight/internal-track build and complete draft listings |
| 7 | Closed testing and fixes | Test feedback resolved; Google production access if required |
| 8 | Final review and public release | Gate signed off; accepted binaries and support ownership |

Start account verification and tester recruitment early. They can run alongside development. Estimate engineering effort after the first installed-build milestone; a browser game working today does not justify a fixed publication date.

## 12. Final go/no-go checklist

- [ ] Final name, publisher, asset rights and supported devices are settled.
- [ ] All P0 items for the target store are complete; P1 exceptions have a recorded decision and reason.
- [ ] The exact submitted release build passes offline first launch and complete gameplay on real devices.
- [ ] Daily date changes, interruption behavior and persistence match the documented rules.
- [ ] No crashes, blocking navigation bugs, wrong scoring or known core accessibility blockers remain.
- [ ] No ads, dead purchase buttons, misleading payment claims or unimplemented advertised features exist.
- [ ] Privacy/support pages, data declarations, content ratings and audience answers match the binary.
- [ ] Accounts, signing, agreements, required testing and upload validation are complete.
- [ ] Screenshots and review notes describe the submitted build accurately.
- [ ] A named publisher owns review responses, support and urgent fixes.

**First practical milestone:** install a signed, fully offline Mastermind build on one iPhone and one Android phone. Resolve packaging and lifecycle uncertainty before expanding the feature list.
