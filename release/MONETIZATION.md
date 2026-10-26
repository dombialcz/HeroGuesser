# Guild of Wits — monetization scenario and implementation checklist

Recorded 25 October 2026. **Status: working product scenario; not implemented.** Tick implementation items only after their acceptance checks pass and record evidence at the end.

The current web/iPhone build still has all content free, no ads and no purchases. This document describes the proposed mobile model. Explicitly open choices and release timing remain unresolved.

## Working offer

Players try the game for free, choose a rewarded ad for more puzzles, or buy permanent access to the included content. Solving remains uninterrupted: unlimited attempts, free hints and explanations, and no ads after wrong guesses.

| Content | Free access | One earned ad reward | Paid unlock |
| --- | --- | --- | --- |
| Tutorial | All three tutorial scenes | No ad offer | Included |
| Daily puzzles | Easy for the current puzzle date | Medium and Hard together for that date | All three difficulties each day |
| First story chapter | All three scenes of Last Round | No ad required | Included |
| Later chapters | Visible with clear unlock terms | Entire selected chapter, permanently unlocked on the installation | All chapters included in the purchase |

**Daily default:** Easy is free, following the publisher's proposal. Letting players choose one free difficulty was suggested in discussion and remains an alternative, not a settled change. Decide before implementing the daily selector.

**Story interpretation:** current chapters contain 3, 2, 3 and 3 scenes. Three free scenes per chapter would leave all eleven scenes free. Use the first chapter as the three-puzzle introduction and one unlock before each later chapter. Reconsider three introductory scenes followed by one unlock for the remainder if future scenarios become longer.

| Chapter | Scenes | Working rule |
| --- | ---: | --- |
| Last Round (`last-round`) | 3 | Always free |
| Sleepless Court (`sleepless-court`) | 2 | One ad unlocks both scenes |
| King's Awakening (`kings-awakening`) | 3 | One ad unlocks all three scenes |
| Last Bell (`last-bell`) | 3 | One ad unlocks all three scenes |

The current campaign offers at most three successful story ad unlocks per installation. Daily pairs provide the recurring opportunity, at most once per puzzle date. Revenue depends on return visits and voluntary unlocks; this model is a hypothesis to test.

## Player scenarios and acceptance checklist

### A. First visit

- [ ] Home communicates the free daily, free first chapter and optional unlocks before the player encounters a gate.
- [ ] The full tutorial requires no ad, purchase or account.
- [ ] Last Round can be completed, retried and replayed with free hints and no ads.
- [ ] Locked chapters show their scene count and exact unlock terms.
- [ ] Finishing free content never automatically starts an ad.

### B. Daily session

- [ ] Easy opens freely; Medium and Hard show one shared offer. Replace consistently if the free-choice alternative is selected.
- [ ] Offer copy: "Watch one ad to unlock today's Medium and Hard puzzles."
- [ ] Declining returns to normal navigation and the free puzzle.
- [ ] The player can unlock the pair without completing Easy first.
- [ ] One earned reward unlocks both difficulties for the date shown in the offer.
- [ ] Returning, switching difficulty/language, backgrounding, force-close and relaunch preserve both unlocks.
- [ ] Retries, hints where available, sharing and revisiting unlocked puzzles require no further ads.
- [ ] On the next puzzle date, the new pair has a new offer unless the player owns the paid unlock.

### C. Story session

- [ ] Before entering a locked chapter, show its title, scene count and permanent-unlock terms.
- [ ] Example: "Watch one ad to unlock Sleepless Court. Includes two puzzles. Stays unlocked on this device."
- [ ] One reward unlocks the entire selected chapter, including all scenes and replays.
- [ ] No ad gates appear between scenes in an unlocked chapter.
- [ ] Returning, restarting or resetting a chapter's puzzle progress preserves its unlock.
- [ ] Unlocks are independent: an ad for one chapter never grants or charges for another.
- [ ] Preserve freely selectable chapters; do not introduce an earlier-chapter completion prerequisite.

### D. Paid access

- [ ] Offer one non-consumable purchase, working label "Unlock all puzzles," with exact included content and localized price.
- [ ] Owners bypass all daily and included-story ad gates, including unopened chapters.
- [ ] Owners see unlocked content without ad prompts or repeated purchase offers.
- [ ] Purchase and restore preserve existing progress and independent ad-earned unlocks.
- [ ] Provide Restore Purchases and clear pending, cancelled, failed and restored states.
- [ ] Verify ownership through the platform purchase system; a UI flag alone is insufficient.
- [ ] Known valid ownership remains usable offline; temporary verification/network failure does not silently revoke it.
- [ ] State how future separately sold expansions relate to this purchase; do not accidentally promise all future content.

### E. Unavailable or interrupted ad

- [ ] Handle offline, loading, no inventory, provider failure and cancellation without losing progress.
- [ ] Show an ad only after affirmative opt-in; allow leaving the offer.
- [ ] Closing before earning the reward leaves the offer available and the free game playable.
- [ ] Persist an earned unlock immediately; closing the app afterward must not require another ad.
- [ ] Duplicate/late reward events grant only the intended date/chapter once.
- [ ] Working fallback proposal: if an ad genuinely cannot be supplied, grant the selected daily pair or chapter without an ad. Resolve before integration; distinguish unavailability from declining/cancelling an available ad.
- [ ] Storage failure shows the existing temporary-session warning and preserves current-session access; do not claim a permanent save succeeded.

## Unlock and save rules

Share one access decision across menus, direct links and gameplay entry. Keep entitlements separate from puzzle progress so replay/reset cannot become another ad opportunity.

- [ ] Key daily access by puzzle date; record the selected free difficulty if that alternative is chosen.
- [ ] Key permanent story access by stable chapter ID, independent of scene numbers/content revisions.
- [ ] Keep paid ownership, ad-earned access and progress distinct; platform restore recovers purchases.
- [ ] Version/validate access data through the existing storage adapter and serialized native writes.
- [ ] Story/daily progress resets and chapter restarts preserve entitlements. Decide all-data-reset behavior and wording separately.
- [ ] Explain installation/device limits: no account or cloud recovery exists for ad-earned unlocks; uninstall/storage clearing can remove them.
- [ ] Bind a pending daily reward to its offered date. If midnight passes during the ad, preserve that date's grant and explain rollover; never silently apply it to a different date or interrupt a story.
- [ ] Returning to a retained date restores matching access/progress within the existing 90-day retention window; no archive browser is added here.
- [ ] Daily pruning never deletes permanent chapter access or paid ownership.
- [ ] Choose the existing-player upgrade policy before enabling gates. Recommended: preserve access for already-started/completed chapters and today's already-started difficulties; never delete or strand existing progress.
- [ ] Apply the chosen upgrade/access rules consistently to restored saves and direct links.

## Implementation milestones

### M1 — Resolve product choices

- [ ] Choose Easy-free or one player-selected free daily per date.
- [ ] Confirm first chapter free and one permanent ad unlock per later chapter.
- [ ] Confirm unavailable-ad/offline fallback, distinct from user cancellation.
- [ ] Set purchase name, included content, price and future-expansion wording.
- [ ] Choose existing-player migration and all-data-reset behavior.
- [ ] Decide first store release versus a later monetization update; current no-ad build remains the baseline until then.
- [ ] Decide web behavior. Working scope is native mobile; keep web free during development, and review the commercial implications of a free web alternative before launch.
- [ ] Select ad provider/native bridge and purchase integration; record SDK versions, data flows and platform requirements.

### M2 — Build reviewable access flows

- [ ] Implement versioned access state and migration independently of production SDKs.
- [ ] Add development-only simulated ad success/cancellation/unavailability and purchase/restore states.
- [ ] Build daily/story locks, opt-in offers, purchase and restore screens in EN/PL.
- [ ] Preserve phone touch targets, screen-reader focus/announcements, large text, reduced motion and navigation.
- [ ] Review the complete first-visit/daily/story flows on a phone before connecting live services.
- [ ] Exclude development unlock controls from production builds.

### M3 — Integrate rewarded ads

- [ ] Configure native daily-pair and selected-chapter rewarded placements.
- [ ] Use provider test ads for development/device QA.
- [ ] Map earned reward events to the exact pending offer; handle duplicate events, failure and lifecycle interruption.
- [ ] Persist rewards before returning to gameplay; suppress redundant offers.
- [ ] Inspect actual ad presentation; if promising "one ad," avoid an unexpected bundle of multiple ads.
- [ ] Implement the chosen fallback and verify offline/background/relaunch behavior.

### M4 — Integrate the paid unlock

- [ ] Configure the store product, localized description and price.
- [ ] Implement purchase, restore, pending/cancel/failure states and valid offline access.
- [ ] Handle refunded/revoked ownership without deleting independent ad-earned access.
- [ ] Verify sandbox purchase/restore on a physical iPhone and after reinstall; purchase recovery does not imply progress recovery.

### M5 — Prepare the monetized release

- [ ] Review chosen SDKs and implement required consent/privacy behavior for launch territories before ad requests.
- [ ] Update the privacy manifest, data inventory, public policy, Settings summary, store privacy answers and audience/ad-content settings against actual behavior.
- [ ] Rewrite EN/PL listing and reviewer notes: explain free, ad-unlocked and paid content; remove obsolete blanket "no ads or purchases" claims.
- [ ] Update README, release roadmap, publishing instructions and native screenshots for the shipping model.
- [ ] Update baseline tests requiring all content free/no external requests, while preserving free-web and core offline coverage.
- [ ] Record final scope and publisher/device evidence; this plan does not complete submission gates.

### M6 — Verify and playtest

- [ ] Unit checks: free access, one reward for both daily puzzles, independent chapters, duplicate events, dates, migration and resets.
- [ ] Browser checks with simulated services: all entry paths/direct links, EN/PL, decline/cancel, failed storage and accessibility layouts.
- [ ] Native test-ad checks: rewards survive background/force-close/relaunch; cancellation/no inventory follow the chosen policy.
- [ ] Native purchase checks: buy, cancel, pending, failure, restore, offline ownership and ownership changes.
- [ ] Observe first-time players and ask them to explain what one ad or purchase unlocks.
- [ ] Observe returning players accessing the second/third daily and continuing unlocked stories.
- [ ] Confirm comprehension of date-specific daily access versus permanent chapter access.
- [ ] Resolve blocking feedback and record evidence before enabling production monetization.

## Evaluate the model

Choose proportionate measurement before adding telemetry; an analytics SDK is not implicitly approved. Start with observed beta sessions and available aggregate provider/store reports. Document additional collection separately.

- [ ] Measure/observe free daily participation and demand for other difficulties, separating any free-choice experiment.
- [ ] Record offer acceptance, earned rewards and actual play of the unlocked dailies.
- [ ] Record chapter reach, unlocks and completion after unlocking.
- [ ] Compare return visits before/after gates, especially for Medium/Hard players.
- [ ] Record unavailable ads, fallback grants, purchase conversion and support complaints.
- [ ] Agree a review period/success criteria before launch; assess actual revenue against costs, maintenance and retention.

Illustrative arithmetic, **not a forecast or benchmark**: 1,000 daily active players × 40% earning the daily reward × 30 days = 12,000 rewarded impressions/month. An **assumed** $10 revenue per 1,000 impressions yields $120/month from daily ads before costs/taxes. Replace both assumed rates with observed results. Story ads and purchases are separate; a modest audience may produce modest income even if the offer works well.

## References and delivery evidence

Checked during discussion on 25 October 2026:

- [AdMob rewarded-ad policies](https://support.google.com/admob/answer/7313578?hl=en): clear reward disclosure, affirmative opt-in, dismissal, continued normal app use on decline, and delivery of earned rewards. These are design constraints, not advance approval of an implementation.
- [AdMob rewarded-ad overview](https://support.google.com/admob/answer/7372450?hl=en-GB): formats and optional ad pods. Recheck current provider behavior/rules when configuring the SDK.

Append milestone evidence here: commit/build, checks, device observations and unresolved issues.

- Planning only. No SDK, content gate, purchase, telemetry or release behavior changed by this document.
