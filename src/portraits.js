// The frame owns geometry; failed artwork leaves a readable class token.
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function portraitMarkup(src, label) {
  return `<span class="portrait-frame" aria-hidden="true"><span class="portrait-fallback" hidden><b>${escape(label.slice(0, 1))}</b><small>${escape(label)}</small></span><img src="${escape(src)}" alt="" draggable="false"></span>`;
}
export function createPortrait(src, label) {
  const template = document.createElement('template');
  template.innerHTML = portraitMarkup(src, label);
  return template.content.firstElementChild;
}
document.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement && event.target.closest('.portrait-frame')) {
    event.target.hidden = true;
    event.target.closest('.portrait-frame').querySelector('.portrait-fallback').hidden = false;
  }
}, true);

// Visual feedback never controls gameplay timing and runs only at action boundaries.
export function animatePlacement(element) {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) element?.animate(
    [{ opacity: 0, transform: 'translateY(-6px) scale(.96)' }, { opacity: 1, transform: 'none' }],
    { duration: 170, easing: 'ease-out' },
  );
}
export function animateResultStamp(element) {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) element?.animate(
    [{ opacity: 0, transform: 'translateY(-3px) scale(1.08) rotate(-2deg)' }, { opacity: 1, transform: 'none' }],
    { duration: 160, easing: 'cubic-bezier(.2,.8,.3,1)' },
  );
}
