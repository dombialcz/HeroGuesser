import { storage } from "./platform.js";
import { restoreStory, serializeStory, storyKey } from "./story-progress.js";
import { loadCampaign, resumeChapter } from "./story-campaign.js";
import { confirmAction } from "./dialog.js";
import { ADVENTURES, actAdventure, adventureCounts, adventureScene, createAdventure } from "./mastermind-adventure-core.js";
import { ADVENTURE_COPY, sceneCopyIndex } from "./mastermind-adventure-copy.js";
import { installPortraitDrag } from "./mastermind-drag.js";
import { playPlacementSound, playRemovalSound, playCompletionSound } from "./game-audio.js";

const IMAGE = Object.fromEntries(["thief", "knight", "bard", "mage", "ale", "zombie", "king"].map(p => [p, `assets/mastermind/${p}.webp`]));
IMAGE.coin = "assets/mastermind/coin.svg";
IMAGE.bell = "assets/mastermind/bell.svg";
const COLOR = { thief: "#69a7ff", knight: "#f0bd53", bard: "#ec83bd", mage: "#b69aff", ale: "#d99e50", zombie: "#aabd73", coin: "#d1ac58", king: "#d77b8c", bell: "#c4a0e4" };

export function installMastermindAdventures({ root, entry, getLocale, onModeChange, celebration }) {
  let active = false, state = createAdventure(), undo = null, drag, recovery = false, lockedRequest = null;
  const t = () => ADVENTURE_COPY[getLocale()];
  const sceneText = () => t().scenes[sceneCopyIndex(state)];
  root.innerHTML = '<div class="adventure-content"></div><p class="sr-only" id="adventure-announcement" role="status" aria-live="polite" aria-atomic="true"></p>';
  const content = root.querySelector(".adventure-content");
  const announce = text => { root.querySelector("#adventure-announcement").textContent = text; };
  const focus = (selector, preventScroll = false) => root.querySelector(selector)?.focus({ preventScroll });
  function fresh(index = state.adventure) { celebration?.clear(); state = createAdventure(index); undo = null; drag?.cancel(); }
  function persist() { if (!recovery) storage.setItem(storyKey(state.adventure), serializeStory(state)); }
  function start(index = 0) {
    if (!Number.isInteger(index) || !ADVENTURES[index]) index = 0;
    const campaign = loadCampaign(storage);
    if (index > campaign.unlockedThrough) {
      lockedRequest = index; active = false; drag?.cancel(); celebration?.clear();
      onModeChange(false); render(); return;
    }
    lockedRequest = null;
    active = true; drag?.cancel(); celebration?.clear(); undo = null;
    const restored = restoreStory(storage.getItem(storyKey(index)), index);
    state = restored.state; recovery = restored.invalid;
    if (!recovery) persist();
    onModeChange(true); render(); focus("#adventure-guide-title");
  }
  function leave() {
    persist(); active = false; drag?.cancel(); celebration?.clear(); undo = null; render(); onModeChange(false);

  }
  function dispatch(action) {
    if (recovery) return;
    if (action.type === "next") celebration?.clear();
    const before = structuredClone(state), c = t();
    actAdventure(state, action);
    const changed = JSON.stringify(state.draft) !== JSON.stringify(before.draft);
    if (changed && ["pick", "move"].includes(action.type)) playPlacementSound();
    if (changed && action.type === "slot") playRemovalSound();
    if (["pick", "slot", "move", "clear"].includes(action.type) && changed) undo = { draft: before.draft, selected: before.selected };
    if ((action.type === "check" && !state.notice) || action.type === "next") undo = null;
    persist(); render();
    if (state.guesses.length > before.guesses.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) root.querySelector(".story-latest")?.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 180, easing: "ease-out" });
    let message = state.notice ? c[state.notice === "incomplete" ? "incompleteNotice" : state.notice] : "";
    if (!message && action.type === "check") message = state.phase === "solved" ? c.solved : c.result(state.guesses.at(-1));
    if (!message && action.type === "pick" && changed) {
      const slot = state.draft.findIndex((p, i) => p !== before.draft[i]);
      message = c.added(c[action.piece], slot + 1, state.draft.filter(p => !p).length);
    }
    if (!message && action.type === "slot") message = before.draft[action.slot] ? c.removed(action.slot + 1) : c.selected(action.slot + 1);
    if (!message && action.type === "hint") message = sceneText().hints[state.hint - 1];
    if (!message && action.type === "move") message = c.moved;
    if (!message && action.type === "clear") message = c.cleared;
    if (!message && action.type === "next") message = state.phase === "play" ? sceneText().clues.join(" ") : state.phase === "complete" ? c.adventures[state.adventure].ending : sceneText().story;
    if (action.type === "check" && state.facts.length > before.facts.length) {
      celebration?.play({ kind: "scene" });
      playCompletionSound(state.scene === ADVENTURES[state.adventure].scenes.length - 1);
    }
    announce(message);
    if (before.phase !== state.phase) focus(state.phase === "play" ? "#adventure-slot-0" : "#adventure-guide-title");
    else if (action.type === "check" && state.guesses.length > before.guesses.length) focus("#adventure-result-heading");
    else if (action.type === "clear") focus("#adventure-slot-0");
  }
  const image = piece => `<img src="${IMAGE[piece]}" alt="" draggable="false">`;
  function lineup(pieces, sceneIndex, editable = false) {
    const c = t(), text = c.scenes[sceneCopyIndex(state, sceneIndex)];
    const scene = ADVENTURES[state.adventure].scenes[sceneIndex];
    const icons = { hut: { left: "window" }, bedchamber: { right: "bell" }, square: { right: "bell" } }[scene.landmark] || {};
    const landmarkIcon = side => icons[side] ? `<img src="assets/mastermind/${icons[side]}.svg" alt=""> ` : "";
    const label = pieces.map((p, i) => `${c.position} ${i + 1}: ${p ? c[p] : c.empty}`).join("; ");
    return `<div class="adventure-landmarks" aria-label="${text.landmarks.join(" → ")}"><span>${landmarkIcon("left")}${text.landmarks[0]} →</span><span>← ${landmarkIcon("right")}${text.landmarks[1]}</span></div><div class="story-formation no-window"><div class="story-slots${editable ? " row-active" : ""}" style="--story-size:${pieces.length}" role="${editable ? "group" : "img"}" aria-label="${editable ? c.current : label}">${pieces.map((p, i) => {
      const style = p ? `style="--hero-color:${COLOR[p]}"` : "";
      if (!editable) return `<span class="story-piece" ${style}>${p ? image(p) : i + 1}</span>`;
      return `<button type="button" id="adventure-slot-${i}" class="guess-tile story-tile ${p || "empty"}" data-slot="${i}" ${p ? `data-hero="${p}"` : ""} ${style} aria-label="${c.position} ${i + 1}: ${p ? `${c[p]}. ${c.tapClear}` : c.empty}" aria-current="${state.selected === i}" aria-describedby="adventure-clues">${p ? image(p) : i + 1}<span class="story-position" aria-hidden="true">${i + 1}</span></button>`;
    }).join("")}</div></div>`;
  }
  function scores(result) {
    const c = t();
    return `<div class="story-scores">${["exact", "misplaced", "absent"].map(key => `<span><i class="feedback-dot ${key}" aria-hidden="true"></i><b>${result[key]}</b> ${c[key]}</span>`).join("")}</div>`;
  }
  function render() {
    drag?.cancel();
    const c = t();
    const campaign = loadCampaign(storage);
    const resumeIndex = resumeChapter(storage, campaign);
    const endingRead = restoreStory(storage.getItem(storyKey(resumeIndex)), resumeIndex).state.phase === 'complete';
    const entryStatus = index => {
      const raw = storage.getItem(storyKey(index));
      if (!raw) return c.play;
      return restoreStory(raw, index).state.phase === 'complete' ? c.viewEnding : c.resume;
    };
    root.hidden = !active; entry.hidden = active;
    root.setAttribute("aria-label", c.brand);
    entry.setAttribute("aria-label", c.entryTitle);
    entry.innerHTML = `<div><strong>${c.entryTitle}</strong><p>${c.entryText}</p><p class="campaign-progress">${c.progress(campaign.completed.filter(Boolean).length, ADVENTURES.length)}</p></div>
      <button id="campaign-continue" class="story-primary" type="button">${campaign.completed.every(Boolean) && endingRead ? c.revisitStory : storage.getItem(storyKey(0)) || campaign.unlockedThrough > 0 ? c.continueStory : c.beginStory} →</button>
      ${lockedRequest !== null ? `<p class="campaign-locked-notice" role="status">${c.lockedAfter(lockedRequest)}</p>` : ''}
      <div class="adventure-entry-actions" role="group" aria-label="${c.chapters}">${ADVENTURES.map((adventure, index) => {
        const locked = index > campaign.unlockedThrough;
        return `<button class="story-button adventure-story-button${locked ? ' chapter-locked' : ''}" id="start-adventure-${index}" type="button" ${locked ? 'disabled' : ''}><img src="${[IMAGE.thief, IMAGE.mage, IMAGE.king, IMAGE.bell][index]}" alt=""><span><strong>${c.chapter} ${index + 1} · ${c.adventures[index].title}</strong><small>${c.sceneCount(adventure.scenes.length)} · ${locked ? c.lockedAfter(index) : `${campaign.completed[index] ? `${c.completed} · ` : ''}${entryStatus(index)}`}</small></span></button>`;
      }).join("")}</div>`;
    entry.querySelector('#campaign-continue').addEventListener('click', () => start(resumeIndex));
    ADVENTURES.forEach((_, index) => entry.querySelector(`#start-adventure-${index}`).addEventListener("click", () => start(index)));
    if (!active) { content.replaceChildren(); announce(""); return; }
    if (recovery) {
      content.innerHTML = `<h2 id="adventure-guide-title" tabindex="-1">${c.adventures[state.adventure].title}</h2><p role="alert">${c.recovery}</p><button id="adventure-recovery" class="story-primary" type="button">${c.restart}</button><button id="adventure-exit" type="button">${c.back}</button>`;
      root.querySelector('#adventure-exit').onclick = leave;
      root.querySelector('#adventure-recovery').onclick = restart;
      return;
    }
    const focused = root.contains(document.activeElement) ? document.activeElement.id : null;
    const story = c.adventures[state.adventure], text = sceneText(), scene = adventureScene(state), playing = state.phase === "play", latest = state.guesses.at(-1);
    const isIntro = state.phase === "intro", solved = state.phase === "solved", complete = state.phase === "complete";
    const heading = complete ? state.adventure === ADVENTURES.length - 1 ? c.storyComplete : c.completeTitle : solved ? c.solved : text.title;
    document.title = `${story.title} — Guild of Wits`;
    document.querySelector('[data-i18n="brandKicker"]').textContent = c.brand;
    root.dataset.phase = state.phase;
    const counts = adventureCounts(state);
    content.innerHTML = `
      <div class="story-topline"><p class="eyebrow">${c.chapter} ${state.adventure + 1} · ${c.scene} ${state.scene + 1} ${c.of} ${ADVENTURES[state.adventure].scenes.length}</p><button id="adventure-exit" class="story-text-button" type="button">${c.back}</button></div>
      <h1 class="story-title">${story.title}</h1>
      <section class="story-instruction"><h2 id="adventure-guide-title" tabindex="-1">${heading}</h2>${isIntro && state.scene === 0 ? `<p class="adventure-premise">${story.intro}</p>` : ""}<p>${complete ? story.ending : solved ? text.fact : text.story}</p></section>
      ${isIntro && state.scene === 0 ? `<p class="story-evidence">${c.rules}</p>` : ""}
      ${isIntro || playing ? `<aside class="story-name-clue" id="adventure-clues"><h3>${c.clues}</h3><p class="story-lesson">${text.lesson}</p><ul>${text.clues.map(clue => `<li>${clue}</li>`).join("")}</ul><p>${c.adjacency}</p></aside>` : ""}
      ${solved ? `<details class="adventure-feedback-help story-reasoning"><summary>${c.reasoning}</summary><p>${text.reasoning}</p></details>` : ""}
      ${latest ? `<section class="story-latest"><h3 id="adventure-result-heading" tabindex="-1">${c.latest} · ${state.guesses.length}</h3>${lineup(latest.pieces, state.scene)}${scores(latest)}<p>${c.fresh}</p></section>` : ""}
      ${playing ? `<section class="story-room" aria-labelledby="adventure-current-heading"><h3 id="adventure-current-heading">${c.current}</h3><p class="story-current-hint">${c.currentHint}</p>${lineup(state.draft, state.scene, true)}<p class="story-counts">${c.pieces}: ${scene.pieces.map(p => `${c[p]} × ${counts[p]}`).join(" · ")}</p><div class="story-picker" role="group" aria-label="${c.choose}">${scene.pieces.map((p, i) => `<button type="button" id="adventure-pick-${p}" data-piece="${p}" aria-label="${c.add} ${c[p]}, ${c.shortcut} ${i + 1}" aria-keyshortcuts="${i + 1}">${image(p)}<span>${c[p]}</span><kbd aria-hidden="true">${i + 1}</kbd></button>`).join("")}</div><p class="story-ready" id="adventure-ready">${state.draft.every(Boolean) ? c.ready : c.incomplete}</p></section>` : ""}
      <p class="story-notice${state.notice ? " has-notice" : ""}">${state.notice ? c[state.notice === "incomplete" ? "incompleteNotice" : state.notice] : ""}</p>
      <div class="story-primary-actions">${playing ? `<button id="adventure-check" class="story-primary" type="button" aria-describedby="adventure-ready" ${state.draft.every(Boolean) ? "" : "disabled"}>${c.check} →</button>` : isIntro || solved ? `<button id="adventure-next" class="story-primary" type="button">${isIntro ? c.begin : c.next} →</button>` : complete ? `<button id="adventure-finish" class="story-primary" type="button">${state.adventure + 1 < ADVENTURES.length ? `${c.continue}: ${c.adventures[state.adventure + 1].title}` : c.finish} →</button>` : ""}</div>
      <div class="story-edit-actions">${playing ? `<button id="adventure-clear" class="story-text-button" type="button" ${state.draft.some(Boolean) ? "" : "disabled"}>${c.clear}</button><button id="adventure-hint" class="story-text-button" type="button" ${state.hint >= 2 ? "disabled" : ""}>${state.hint === 0 ? c.hint : state.hint === 1 ? c.moreHint : c.hintsShown}</button>` : ""}${undo ? `<button id="adventure-undo" class="story-text-button" type="button">${c.undo}</button>` : ""}</div>
      ${playing && state.hint ? `<aside class="story-hint"><h3>${c.hintHeading}</h3>${text.hints.slice(0, state.hint).map(h => `<p>${h}</p>`).join("")}</aside>` : ""}
      ${playing ? `<p class="story-drag-hint">${c.dragHint}</p><details class="adventure-feedback-help"><summary>${c.exact} / ${c.misplaced} / ${c.absent}</summary><p>${c.feedbackHelp}</p></details>` : ""}
      ${state.guesses.length > 1 ? `<section class="story-history"><h3>${c.earlier}</h3><ol class="story-attempts" reversed start="${state.guesses.length - 1}">${state.guesses.slice(0, -1).map((g, i) => `<li class="story-attempt"><span class="attempt-number">${i + 1}</span><div>${lineup(g.pieces, state.scene)}${scores(g)}<p>${c.hypotheses}</p></div></li>`).reverse().join("")}</ol></section>` : ""}
      ${state.facts.length ? `<section class="story-facts"><h3>${c.facts}</h3>${state.facts.map(f => `<article class="story-fact"><h4>${c.verified} ${f.scene + 1} · ${c.scenes[sceneCopyIndex(state, f.scene)].title}</h4><p>${c.scenes[sceneCopyIndex(state, f.scene)].fact}</p>${lineup(f.pieces, f.scene)}</article>`).join("")}</section>` : ""}
      <div class="story-bottom"><p>${c.noSave}</p><button id="adventure-restart" class="story-text-button" type="button">${complete ? c.replay : c.restart}</button></div>`;
    const bind = (id, cb) => root.querySelector(`#${id}`)?.addEventListener("click", cb);
    bind("adventure-exit", leave);
    bind("adventure-next", () => dispatch({ type: "next" }));
    bind("adventure-check", () => dispatch({ type: "check" }));
    bind("adventure-clear", () => dispatch({ type: "clear" }));
    bind("adventure-hint", () => dispatch({ type: "hint" }));
    bind("adventure-finish", () => state.adventure + 1 < ADVENTURES.length ? start(state.adventure + 1) : leave());
    bind("adventure-restart", restart);
    bind("adventure-undo", () => {
      celebration?.clear();
      state.draft = undo.draft; state.selected = undo.selected; state.notice = null;
      undo = null; persist(); render(); announce(c.undone); focus(state.phase === "play" ? `#adventure-slot-${state.selected ?? 0}` : "#adventure-guide-title");
    });
    root.querySelectorAll("[data-slot]").forEach(b => b.addEventListener("click", () => dispatch({ type: "slot", slot: Number(b.dataset.slot) })));
    root.querySelectorAll("[data-piece]").forEach(b => b.addEventListener("click", () => dispatch({ type: "pick", piece: b.dataset.piece })));
    if (focused && !root.querySelector(`#${focused}`)?.disabled) focus(`#${focused}`, true);
  }
  async function restart() {
    if (!await confirmAction(t().restartConfirm, getLocale())) return;
    recovery = false; fresh(); persist(); render(); announce(t().restarted); focus('#adventure-guide-title');
  }
  drag = installPortraitDrag({ board: root, canDrag: () => active && state.phase === "play", onDrop: ({ sourceSlot, targetSlot }) => dispatch({ type: "move", from: sourceSlot, to: targetSlot }) });
  addEventListener("pagehide", () => { if (active) persist(); drag.cancel(); });
  addEventListener("heroguesser:background", () => drag.cancel());
  return {
    get active() { return active; }, render, start, leave,
    cancelTransient() { drag.cancel(); },
    reset() { active = false; recovery = false; lockedRequest = null; fresh(); render(); },
    campaignSnapshot() {
      const progress = loadCampaign(storage);
      return { title: t().entryTitle, unlockedThrough: progress.unlockedThrough + 1, completed: progress.completed,
        chapters: ADVENTURES.map((a, index) => ({ id: a.id, title: t().adventures[index].title, locked: index > progress.unlockedThrough })) };
    },
    keydown(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "Escape") { drag.cancel(); dispatch({ type: "cancel" }); return; }
      if (state.phase === "play" && /^[1-9]$/.test(event.key)) {
        const piece = adventureScene(state).pieces[Number(event.key) - 1];
        if (piece) {
          event.preventDefault(); const tile = event.target.closest("[data-slot]");
          if (tile && !state.draft[Number(tile.dataset.slot)]) state.selected = Number(tile.dataset.slot);
          dispatch({ type: "pick", piece });
        }
      } else if (event.key === "Enter" && !event.target.closest("button, a, summary")) {
        event.preventDefault(); if (state.phase === "play") dispatch({ type: "check" }); else if (["intro", "solved"].includes(state.phase)) dispatch({ type: "next" });
      }
    },
    snapshot() {
      return { game: "Guild of Wits", mode: "story-adventure", locale: getLocale(), adventure: ADVENTURES[state.adventure].id, title: t().adventures[state.adventure].title, scene: state.scene + 1, sceneId: adventureScene(state).id, phase: state.phase, coordinateSystem: "Places numbered from 1, left to right. Immediate adjacency, no wrapping. Landmarks outside scored row.", draft: state.draft, selectedSlot: state.selected, availablePieces: adventureScene(state).pieces, requiredCounts: adventureCounts(state), clues: sceneText().clues, lesson: sceneText().lesson, revealedHints: sceneText().hints.slice(0, state.hint), landmarks: sceneText().landmarks, guesses: state.guesses, facts: state.facts, hintsShown: state.hint, undoAvailable: !!undo, persistence: "local", recovery, notice: state.notice ? t()[state.notice === "incomplete" ? "incompleteNotice" : state.notice] : null, drag: drag.snapshot(), result: state.phase === "complete" ? "solved" : "playing" };
    },
  };
}
