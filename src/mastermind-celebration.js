const COPY = {
  en: { daily: "Party discovered!", scene: "Scene solved!", dailyNote: "A perfect formation.", sceneNote: "The story unfolds." },
  pl: { daily: "Układ odkryty!", scene: "Scena odkryta!", dailyNote: "Drużyna w komplecie.", sceneNote: "Historia toczy się dalej." },
};
const COLORS = ["#d3ae66", "#ead9b5", "#8bcf9d", "#82b8ed", "#b99ae8", "#ed96bb"];
const DURATION = 3200;

// Decorative only: existing result regions announce the win and keep keyboard focus.
export function createMastermindCelebration({ getLocale }) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let layer = null, animations = [], timer = null, started = 0, advanced = 0, kind = null;
  function clear() {
    clearTimeout(timer); timer = null;
    animations.forEach(animation => animation.cancel()); animations = [];
    layer?.remove(); layer = null; kind = null;
  }
  function scheduleClear() {
    clearTimeout(timer);
    const remaining = DURATION - (performance.now() - started + advanced);
    if (remaining <= 0) clear();
    else timer = setTimeout(clear, remaining);
  }
  function play({ kind: requestedKind = "scene" } = {}) {
    clear();
    if (document.hidden) return;
    kind = requestedKind === "daily" ? "daily" : "scene";
    const c = COPY[getLocale()] ?? COPY.en;
    layer = document.createElement("div");
    layer.className = "mastermind-celebration";
    layer.dataset.kind = kind;
    layer.dataset.reducedMotion = String(motion.matches);
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `<div class="celebration-card"><span class="celebration-emblem">✦</span><span class="celebration-copy"><strong>${c[kind]}</strong><span>${c[kind === "daily" ? "dailyNote" : "sceneNote"]}</span></span><span class="celebration-spark">✧</span></div>`;
    document.body.append(layer);
    started = performance.now(); advanced = 0;
    if (!motion.matches) {
      for (const side of ["left", "right"]) {
        const trumpet = document.createElement("div");
        trumpet.className = `celebration-trumpet celebration-trumpet-${side}`;
        trumpet.innerHTML = '<div class="celebration-trumpet-motion"><img src="assets/mastermind/trumpet.png" alt="" width="1983" height="793" draggable="false"></div>';
        layer.append(trumpet);
        animations.push(trumpet.firstElementChild.animate([
          { transform: "translateX(-90px)", opacity: 0 },
          { transform: "translateX(0)", opacity: 1, offset: .09 },
          { transform: "translateX(0)", opacity: 1, offset: .79 },
          { transform: "translateX(-90px)", opacity: 0 },
        ], { duration: DURATION, easing: "ease-out", fill: "both" }));
        // Two short notes, then a longer final swell: poom-poom-pooooo.
        const note = (offset, x = 1, y = 1) => ({ offset, easing: "ease-in-out", transform: `rotate(-24deg) scale(${x}, ${y})` });
        animations.push(trumpet.querySelector("img").animate([
          note(0), note(.09), note(.13, .8, 1.2), note(.2),
          note(.25, .8, 1.2), note(.32),
          note(.4, .77, 1.24), note(.56, .82, 1.18), note(.65), note(1),
        ], { duration: DURATION, fill: "both" }));
      }
      const card = layer.querySelector(".celebration-card");
      animations.push(card.animate([
        { opacity: 0, transform: "translateY(-14px) scale(.88)" },
        { opacity: 1, transform: "translateY(3px) scale(1.03)", offset: .1 },
        { opacity: 1, transform: "translateY(0) scale(1)", offset: .2 },
        { opacity: 1, transform: "translateY(0) scale(1)", offset: .82 },
        { opacity: 0, transform: "translateY(-10px) scale(.98)" },
      ], { duration: DURATION, fill: "both" }));
      animations.push(layer.querySelector(".celebration-emblem").animate([
        { transform: "rotate(-30deg) scale(.65)" },
        { transform: "rotate(12deg) scale(1.18)", offset: .6 },
        { transform: "rotate(0) scale(1)" },
      ], { duration: 650, easing: "ease-out", fill: "both" }));
      const count = innerWidth < 700 ? 42 : 68;
      const width = innerWidth, height = innerHeight;
      for (let i = 0; i < count; i++) {
        const particle = document.createElement("i");
        particle.className = "celebration-confetti";
        particle.style.backgroundColor = COLORS[i % COLORS.length];
        particle.style.width = `${5 + Math.random() * 5}px`;
        particle.style.height = `${8 + Math.random() * 6}px`;
        if (i % 5 === 0) particle.style.borderRadius = "50%";
        layer.append(particle);
        const left = i % 2 === 0;
        const x = width * (left ? .08 : .92), y = height * .76;
        const vx = (left ? 1 : -1) * width * (.09 + Math.random() * .2);
        const vy = -height * (.76 + Math.random() * .3), gravity = height * .94;
        const duration = 2200 + Math.random() * 700;
        const spin = (Math.random() - .5) * 1100;
        const frames = Array.from({ length: 15 }, (_, frame) => {
          const progress = frame / 14, time = progress * duration / 1000;
          return {
            transform: `translate3d(${x + vx * time}px, ${y + vy * time + .5 * gravity * time * time}px, 0) rotate(${spin * progress}deg) scaleX(${.5 + .5 * Math.cos(progress * Math.PI * 5)})`,
            opacity: progress === 0 || progress === 1 ? 0 : progress > .8 ? (1 - progress) / .2 : 1,
            offset: progress,
          };
        });
        animations.push(particle.animate(frames, { duration, delay: Math.random() * 140, fill: "both", easing: "linear" }));
      }
    }
    scheduleClear();
  }
  motion.addEventListener("change", clear);
  addEventListener("pagehide", clear);
  document.addEventListener("visibilitychange", () => { if (document.hidden) clear(); });
  return {
    play, clear,
    advanceTime(ms) {
      if (!layer || !Number.isFinite(ms) || ms <= 0) return;
      advanced += ms;
      animations.forEach(animation => { animation.currentTime = (animation.currentTime ?? 0) + ms; });
      scheduleClear();
    },
    snapshot() { return { active: !!layer, kind, reducedMotion: motion.matches, particles: layer?.querySelectorAll(".celebration-confetti").length ?? 0, trumpets: layer?.querySelectorAll(".celebration-trumpet").length ?? 0 }; },
  };
}
