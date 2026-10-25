const COPY = {
  en: { daily: "Party discovered!", scene: "Scene solved!", dailyNote: "A perfect formation.", sceneNote: "The story unfolds." },
  pl: { daily: "Układ odkryty!", scene: "Scena odkryta!", dailyNote: "Drużyna w komplecie.", sceneNote: "Historia toczy się dalej." },
};
const COLORS = ["#f3d58a", "#e7ac55", "#8bcf9d", "#82b8ed", "#b99ae8", "#ed96bb"];
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
    snapshot() { return { active: !!layer, kind, reducedMotion: motion.matches, particles: layer?.querySelectorAll(".celebration-confetti").length ?? 0 }; },
  };
}
