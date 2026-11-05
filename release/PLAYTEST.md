# Playtest and physical-iPhone protocol

Engineering checks are automated; participant/device results below must be observed, not inferred from them.

## Five unfamiliar players

Recruit five people unfamiliar with the controls, including Polish and English readers. Give them a fresh profile with the new warm-up and say nothing for the first 90 seconds. Observe taps without visible changes, time to first Check and time to solve. The targets are an unaided warm-up solve within 90 seconds, an explanation that feedback counts describe the whole row, and an unaided first Daily guess. These are playtest targets, not guarantees or automated evidence.

After the warm-up, ask them to solve Easy with existing renewable hints available, explain what a lock versus a revealed eye means, find Help, share a result without spoilers, and find Story as an optional extra. Include absent heroes and excess copies, a return visit, and a player who skips the warm-up. Check whether a single daily solve feels like a satisfying stopping point and whether optional next difficulties are understood.

Record anonymous participant IDs, language, device/build, completion, hesitation, accidental taps, hints and misunderstood feedback. Ask each participant to explain a deduction before coaching. Keep the existing hint budget/cooldown unchanged during this pass. Defer streaks, timing, deduction helpers and monetization until observed results justify another experiment. Collect no unnecessary personal information. Fix wrong-scoring, lost-save, navigation and accessibility blockers before beta sign-off.

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

- Fresh install and **first launch in airplane mode**: Daily, the worked-example warm-up, all three optional tutorial scenes, all eleven story scenes, four daily difficulties, icons/fonts and celebration. Verify the date labels and no core network dependency.
- Wrong/incomplete/duplicate rows, unlimited attempts beyond five, hints, edit Undo, drag/swap/copy, quick swipes and long histories.
- Each chapter: Home/Back, background/call/notification/lock, force-close/relaunch, then Continue. Check draft, hints, guesses and verified facts. Restart/reset cancellation must keep data; confirmed operations affect only their labelled scope.
- Native daily shares: inspect aggregate payload, cancel sheet, share through a chosen app, return safely. Test without network; no answer pieces/order may appear.
- Date midnight/resume, timezone travel and backward clock change: preserve the old dated board and avoid scoring stale drafts. Do not change the clock on a personal device without understanding effects on other apps; use simulator/injectable browser-clock tests for controlled cases.
- Install a newer development build over an existing build with valid saves: verify migration/persistence. Uninstall behavior must agree with support copy; no cross-device promises.
- VoiceOver: complete tutorial and daily, listen for slot/piece labels, feedback totals and focus after checking; verify modal focus/return and no colour-only requirement.
- Watch launch responsiveness, drag smoothness and memory with many attempts/restarts on lower-powered hardware. Record measured timings and observed memory; do not invent a performance result or fixed budget.
- Inspect signed archive permissions/manifests, actual network traffic, debug settings, privacy/support links and app version/build. Resolve crashes, soft locks and missing resources before release.

Record date, tester, device/OS, exact commit/version/build and result for each group. Only then set the related publisher.json evidence fields.
