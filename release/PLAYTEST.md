# Playtest and physical-iPhone protocol

Engineering checks are automated; participant/device results below must be observed, not inferred from them.

## Five unfamiliar players

Recruit five people unfamiliar with the controls, including Polish and English readers. Give them the app without coaching. Ask them to find and finish the tutorial, start a story, leave/continue it, and solve one daily with hints available. Then ask them to share a solved result without spoilers.

Record anonymous participant IDs, language, device/build, completion, where they hesitated, accidental taps, hint use, misunderstood feedback and whether they could continue unaided. Collect no unnecessary personal information. Review narrative clues, the deliberate tutorial failure, row-total feedback and the meaning of grey. Fix wrong-scoring, lost-save, navigation and core accessibility blockers before beta sign-off.

| Participant | Locale/device/build | Tutorial/daily completed unaided | Confusion/accidental actions/hints | Issue/fix/retest |
| --- | --- | --- | --- | --- |
| P1 | Pending | Pending | Pending | Pending |
| P2 | Pending | Pending | Pending | Pending |
| P3 | Pending | Pending | Pending | Pending |
| P4 | Pending | Pending | Pending | Pending |
| P5 | Pending | Pending | Pending | Pending |

## Story learning curve

For the content-edition-2 pass, ask at least two participants to continue through the four chapters in order. Record time, wrong checks and hints per scene, along with the deduction they describe using. Pay particular attention to “somewhere left” versus adjacency, one/two intervening places, each duplicate guard, and the final pair-order deduction. Ask whether the solved explanation clarifies their reasoning. A pause for practice is useful; a sudden need to guess repeatedly is a cue to revise the preceding lesson. Do not infer difficulty solely from board size or the automated uniqueness proof.

## Device matrix

Use the publisher's real iPhone, a lower/older supported device or OS where available, and simulators for missing sizes. Test the exact Release build, EN/PL, portrait/landscape, large text and reduced motion.

- Fresh install and **first launch in airplane mode**: Home, all three tutorial scenes, all eleven story scenes, three daily difficulties, icons/fonts and celebration. Verify the date labels and no core network dependency.
- Wrong/incomplete/duplicate rows, unlimited attempts beyond five, hints, edit Undo, drag/swap/copy, quick swipes and long histories.
- Each chapter: Home/Back, background/call/notification/lock, force-close/relaunch, then Continue. Check draft, hints, guesses and verified facts. Restart/reset cancellation must keep data; confirmed operations affect only their labelled scope.
- Native daily shares: inspect aggregate payload, cancel sheet, share through a chosen app, return safely. Test without network; no answer pieces/order may appear.
- Date midnight/resume, timezone travel and backward clock change: preserve the old dated board and avoid scoring stale drafts. Do not change the clock on a personal device without understanding effects on other apps; use simulator/injectable browser-clock tests for controlled cases.
- Install a newer development build over an existing build with valid saves: verify migration/persistence. Uninstall behavior must agree with support copy; no cross-device promises.
- VoiceOver: complete tutorial and daily, listen for slot/piece labels, feedback totals and focus after checking; verify modal focus/return and no colour-only requirement.
- Watch launch responsiveness, drag smoothness and memory with many attempts/restarts on lower-powered hardware. Record measured timings and observed memory; do not invent a performance result or fixed budget.
- Inspect signed archive permissions/manifests, actual network traffic, debug settings, privacy/support links and app version/build. Resolve crashes, soft locks and missing resources before release.

Record date, tester, device/OS, exact commit/version/build and result for each group. Only then set the related publisher.json evidence fields.
