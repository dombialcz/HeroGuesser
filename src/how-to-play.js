export function showHelp({ locale, onWarmup, onPrelude }) {
  const pl = locale === 'pl';
  const dialog = document.createElement('dialog');
  dialog.id = 'help-dialog'; dialog.className = 'game-dialog'; dialog.setAttribute('aria-labelledby', 'help-title');
  dialog.innerHTML = pl ? `<h2 id="help-title">Jak grać</h2>
    <h3>Znajdź ukrytą drużynę</h3><p>Wybierz bohaterów, ustaw ich na miejscach i naciśnij Sprawdź. Wskazówki pod nazwą podają dokładne liczby bohaterów. Pozostałe miejsca zajmują inni bohaterowie, każdy tylko raz. W Ekspercie nie ma wskazówek, a powtórzenia są dowolne.</p>
    <h3>Odczytaj wynik całej próby</h3><p>■ Dobry bohater na dobrym miejscu. ◆ Dobry bohater na innym miejscu. ○ Bohatera nie ma w drużynie lub jest go za dużo. Liczby dotyczą całego układu — nie wskazują konkretnych miejsc.</p>
    <h3>Zmień próbę i sprawdź ponownie</h3><p>Dotknij zajętego miejsca, aby je wyczyścić. Dotknij bohatera z wcześniejszej próby, aby dodać go do układu. Przytrzymaj portret i przeciągnij, aby przenieść lub zamienić bohaterów. Wybierz „Użyj tej próby”, aby skopiować cały układ. Bez limitu prób.</p>
    <p>Kłódka zachowuje twój wybór po sprawdzeniu, czyszczeniu i kopiowaniu. Nie potwierdza jego poprawności. Wskazówka odkrywa poprawnego bohatera co 30 sekund. Zamknij oko, by eksperymentować; otwórz ponownie, by przywrócić poprawnego bohatera bez nowej wskazówki.</p>
    <p>Klawiatura: 1–7 wybiera bohatera, Enter sprawdza podczas edycji planszy, Backspace czyści wybrane miejsce, Escape przerywa przeciąganie. Przyciski nawigacji zachowują zwykłe działanie.</p>` : `<h2 id="help-title">How to play</h2>
    <h3>Find the hidden party</h3><p>Pick heroes, fill the places, and Check. The clues below the name give exact hero counts. Remaining places use other heroes, each only once. Expert has no clues and allows any repeats.</p>
    <h3>Read the whole guess</h3><p>■ Right hero, right place. ◆ Right hero, wrong place. ○ Not in the party, or one copy too many. These totals describe the entire guess — they do not identify individual places.</p>
    <h3>Change your guess and check again</h3><p>Tap a filled place to clear it. Tap a hero in a previous guess to add it to your formation. Hold and drag a portrait to move or swap heroes. Select Use this guess to copy the whole formation. Unlimited guesses.</p>
    <p>A lock keeps your choice after checking, clearing, and copying. It does not confirm that choice. Reveal a correct hero every 30 seconds. Close its eye to experiment; reopen it to restore the correct hero without another reveal.</p>
    <p>Keyboard: 1–7 picks a hero, Enter checks while editing the board, Backspace clears the selected place, Escape cancels dragging. Navigation buttons keep their normal behavior.</p>`;
  const previous = document.activeElement;
  let destination;
  for (const [id, label, callback] of [
    ['help-warmup', pl ? 'Powtórz rozgrzewkę' : 'Replay the warm-up', onWarmup],
    ['help-prelude', pl ? 'Zagraj w Prolog' : 'Play the Prelude', onPrelude],
    ['help-close', pl ? 'Zamknij' : 'Close', null],
  ]) {
    const button = document.createElement('button'); button.type = 'button'; button.id = id; button.textContent = label;
    button.onclick = () => { destination = callback; dialog.close(); }; dialog.append(button);
  }
  dialog.addEventListener('close', () => { dialog.remove(); previous?.focus(); if (destination) requestAnimationFrame(destination); }, { once: true });
  document.body.append(dialog); dialog.showModal(); dialog.querySelector('#help-close').focus();
}
