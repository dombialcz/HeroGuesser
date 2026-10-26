export function confirmAction(message, locale = 'en') {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.className = 'game-dialog';
    const heading = document.createElement('h2'); heading.textContent = locale === 'pl' ? 'Potwierdź zmianę' : 'Confirm change';
    heading.id = 'confirm-heading'; dialog.setAttribute('aria-labelledby', heading.id);
    const explanation = document.createElement('p'); explanation.textContent = message;
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.id = 'confirm-cancel'; cancel.textContent = locale === 'pl' ? 'Anuluj' : 'Cancel';
    const confirm = document.createElement('button'); confirm.type = 'button'; confirm.id = 'confirm-accept'; confirm.textContent = locale === 'pl' ? 'Potwierdź' : 'Confirm';
    let result = false;
    cancel.onclick = () => dialog.close();
    confirm.onclick = () => { result = true; dialog.close(); };
    const previous = document.activeElement;
    dialog.addEventListener('close', () => { dialog.remove(); previous?.focus(); resolve(result); }, { once: true });
    dialog.append(heading, explanation, cancel, confirm); document.body.append(dialog); dialog.showModal(); cancel.focus();
  });
}
export function showShareText(text, locale = 'en') {
  const dialog = document.createElement('dialog'); dialog.className = 'game-dialog';
  const heading = document.createElement('h2'); heading.textContent = locale === 'pl' ? 'Skopiuj wynik' : 'Copy result';
  heading.id = 'share-heading'; dialog.setAttribute('aria-labelledby', heading.id);
  const area = document.createElement('textarea'); area.readOnly = true; area.value = text; area.setAttribute('aria-label', heading.textContent);
  const close = document.createElement('button'); close.type = 'button'; close.textContent = locale === 'pl' ? 'Zamknij' : 'Close'; close.onclick = () => dialog.close();
  const previous = document.activeElement;
  dialog.addEventListener('close', () => { dialog.remove(); previous?.focus(); }, { once: true });
  dialog.append(heading, area, close); document.body.append(dialog); dialog.showModal(); area.focus(); area.select();
}
