# Story progression — content edition 2

The eleven scenes and four-chapter plot remain. Players learn a deduction, practise it, then combine it with earlier deductions. Every scene can be solved from the visible clues; Check is feedback, not a required guessing step. The scenes form one campaign, **The Cursed Bell / Przeklęty dzwon**. Only chapter 1 starts open. Completing a chapter’s final puzzle unlocks the next; unlocked chapters remain available for replay. The campaign menu has one Begin/Continue Story action and a chapter list. Continue includes a pending chapter ending before entering an untouched next chapter.

| Chapter / scene | Places | Main deduction |
| --- | ---: | --- |
| Last Round / One drink, two strangers | 3 | A piece needing two neighbours must be in the middle; orient it with an entrance clue. |
| Last Round / A chair for the Bard | 5 | Alternate heroes and mugs, then order the remaining heroes. |
| Last Round / The back door | 5 | Distinguish somewhere left from immediately left; join an ordered pair. |
| Sleepless Court / The hedge Mage | 5 | Move a three-piece group; reject a forbidden neighbour. |
| Sleepless Court / Before the silent throne | 5 | Overlap adjacency and a one-place gap; use the guards to choose the group’s start. |
| King’s Awakening / A voice in the bell | 5 | Practise the gap with different pieces; deduce the coin rather than being given the King’s position. |
| King’s Awakening / The enchanted corridor | 6 | Extend a known group, then test both boundaries against two other clues. |
| King’s Awakening / Hold the chapel | 6 | Apply a spaced relationship to each duplicate guard; exclude the unsafe orientation. |
| Last Bell / Across the square | 6 | Combine a two-place gap, an ordered pair and an interior-position condition. |
| Last Bell / The sealed stair | 6 | Infer a position from space needed on both sides, then fill the remaining places. |
| Last Bell / Silence the cursed bell | 6 | Combine an inferred end, two pairs, relative order and a forbidden neighbour. |

The King’s first scene is a practice beat, not a reset to a trivial three-place formation. The final scene uses six distinct pieces and combines the earlier techniques. Board size stays at six to preserve touch targets at a 320px viewport. This is an authored learning curve; player difficulty still needs the five unfamiliar-player sessions in PLAYTEST.md.

Each scene has a one-sentence approach cue and two optional free hints. The first hint suggests a technique; the second narrows a deduction without listing the complete answer. After solving, **How the clues fit** offers an optional explanation. Solved facts remain the story record; explanations are not shown before a solve. English and Polish use explicit directional and spacing language. Landmarks remain outside the scored row; only the finale scores the Bell itself.

## Logical verification

`npm test` enumerates distinct permutations for each inventory and applies independently encoded narrative constraints. Each scene has exactly one matching arrangement. Removing any spatial clue leaves more than one candidate, checking that every clue contributes. Inventory clues provide the counts and are not part of the removal check. A unique answer is not a measurement of human difficulty.

`npm run test:browser` plays all scenes in Chromium and WebKit, including 320px, landscape and enlarged-text profiles, keyboard keys 5/6, hints, feedback, optional explanations, persistence and confirmed restart. The native UI test exercises the shared story code through WKWebView; physical-device and observed-player gates remain separate.

## Save compatibility

Story content is now version 2. Chapter 1 retains all original answers/counts, so validated version-1 saves migrate on entry. Chapters 2–4 changed inventories or answers: version-1 saves remain stored and show the existing recovery explanation. Back, Home and cancelling restart preserve the old data; only confirmed restart replaces that chapter. Daily seeds, saves, tutorial and language settings are unaffected. Saves created by this edition resume normally in both web and iOS, independently.

## Campaign saves

Earned access and completion badges use `heroguesser:story:campaign:v1`, separate from each chapter’s existing versioned save. Replaying or restarting a chapter keeps earned access and other chapters’ progress. Reset Story Progress (or all local data) removes both the campaign record and chapter saves. Dailies/language remain independent. Valid pre-campaign later-chapter saves preserve access through that chapter, without inventing completion badges for skipped chapters. Invalid or incompatible chapter data cannot grant access. Menu buttons and direct links enforce the same rule; a locked link returns to the chapter list with an explanation.
