# Engineering verification — 25 October 2026

Release identity: Guild of Wits / com.dombialcz.guildofwits / version 1.0.0, build 1. Changes are local; no remote deployment, TestFlight upload or store submission was performed.

| Check | Result / evidence |
| --- | --- |
| Original baseline | `npm run baseline` reconstructs d93c9d6; original 14 tests, screenshots and daily codes in output/release-baseline/ |
| Current unit suite | 22 passing tests; includes all eleven uniquely solvable authored scenes, unlimited attempts, save/version validation, frozen daily codes, retention, share privacy and native write order |
| Full browser suite | All existing Home/tutorial/adventure/flow/feedback/drag/mobile-scroll/art/celebration checks pass; logs in output/browser-suite/ |
| Release matrix | Chromium + WebKit, 1440 desktop, 390 phone, 320 PL enlarged text, 844 landscape; output/release-final-browser.log and output/release/ |
| Release behaviors | Independent chapter resume, >5 wrong attempts, corrupted-save recovery, foreground/timer/backward-date rollover, interrupted dragging, share/cancel/clipboard/manual-copy, all reset scopes, unavailable storage, no unexpected external requests or page errors |
| Native compilation | Xcode 27.0 / iOS 27 simulator, Release configuration, iPhone target with minimum iOS 15.4; output/ios-build/Build/Products/Release-iphonesimulator/App.app |
| Native UI test | Passed on iPhone 18 Pro simulator: actual piece placement, background/resume, force-close/relaunch with Preferences draft restored, and correct scene solve; output/ios-release-verification.xcresult |
| Visual inspection | Web-game client state/capture, mobile long history, Polish sharing, icon, native Home and solved/confetti screen inspected; output/release/ios-story-solved.png |
| Dependency/build checks | Source, dist/ and dist-ios/ standalone graphs pass; npm audit reports zero vulnerabilities; git diff --check passes |
| Submission gate | `npm run check:release` intentionally fails until publisher and device evidence is supplied |

## Engineering changes prompted by verification

- Generated Capacitor template failed to launch with iOS 27 due to the mandatory UIScene lifecycle. Migrated the app to a scene manifest/delegate; subsequent native Release UI tests pass.
- The app's minimum is iOS 15.4, because native dialog, structuredClone, Array.at and :has require that WebKit version. Lower-OS testing remains pending; no iOS 15.0 compatibility claim.
- CLI 8.4.3 is pinned alongside core/iOS 8.5.3 to avoid the newer CLI's unnecessary vulnerable xcode/uuid dependency chain. Native SPM generation/build is verified with these versions.
- Dialog tests wait for close/focus restoration before continuing; live notices localize after language changes and clear on data reset.

## Pending evidence

No real iPhone was connected during implementation. Physical installation/signing, first offline launch, upgrade retention, lower-device/OS performance, VoiceOver, five observed first-time sessions and TestFlight remain unverified. Store-sized native screenshots/listings are drafts until captured from the approved final build. GitHub Actions workflows are added but have not run remotely for these uncommitted changes.

Publisher name/support email were explicitly deferred by the user. Public development pages point to the project issue tracker; replace development contact language and complete asset-rights/privacy/content/publisher declarations before submission. See PUBLISHING.md, PLAYTEST.md and publisher.json for the remaining gates.
