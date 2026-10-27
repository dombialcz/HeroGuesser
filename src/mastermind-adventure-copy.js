import { ADVENTURES } from "./mastermind-adventure-core.js";

export const ADVENTURE_COPY = {
  en: {
    brand: "THE CURSED BELL", entryTitle: "The Cursed Bell", entryText: "A stolen coin, an unlikely party and a bell that wakes the dead. Learn the clues in the prelude, then follow the Thief from the tavern to the palace tower. Complete each chapter to unlock the next. Chapter progress and prelude completion save on this device.",
    preludeTitle: "Prelude · A thief in the treasury", guidedPrelude: "Learn to play", replayPrelude: "Completed · Replay prelude",
    chapters: "Chapters", beginStory: "Begin story", continueStory: "Continue story", revisitStory: "Revisit the ending", completed: "Completed", storyComplete: "Story complete", progress: (n, total) => `${n} of ${total} chapters completed`, lockedAfter: n => `Locked · Complete Chapter ${n} to unlock.`,
    start: "The Last Round", second: "The Court That Would Not Sleep", back: "Back to chapters", chapter: "Chapter", scene: "Scene", of: "of",
    play: "Play", resume: "Continue", viewEnding: "View ending", recovery: "This chapter save cannot be read or belongs to a different story version. Restart this chapter to play; other chapters and dailies are safe.", restartConfirm: "Restart this chapter? Its saved progress will be replaced. Unlocked chapters stay available.", begin: "Arrange this scene", next: "Continue the story", finish: "Return to chapters", continue: "Next chapter", replay: "Replay chapter", restart: "Restart chapter",
    current: "Current arrangement", currentHint: "Fill every place, then check your reconstruction.", choose: "Choose a piece", add: "Add", shortcut: "key", position: "Place", empty: "empty", tapClear: "Tap to clear",
    check: "Check arrangement", clear: "Clear row", undo: "Undo edit", hint: "Show a hint · free", moreHint: "Show the final hint · free", hintsShown: "Both hints shown", hintHeading: "A little help",
    dragHint: "Tap a filled place to clear it. Hold and drag to move or swap. Number keys choose pieces.", ready: "Ready to check. You can try as many times as you like.", incomplete: "Fill all places to enable Check.",
    rules: "Unlimited attempts and free hints. Finish each chapter to open the next. Your chapter progress and unlocked chapters save on this device. Return home and continue whenever you like.",
    adjacency: "“Next to” means the place immediately left or right. The ends do not connect. Landmarks are outside the scored row.",
    noSave: "Progress saves on this device. Solved scenes keep their story, not their attempts.",
    latest: "Latest attempt", earlier: "Earlier attempts", hypotheses: "An attempted reconstruction, not an event in the story.", fresh: "Build a new arrangement in the empty row. There is no attempt limit.",
    exact: "Correct place", misplaced: "Elsewhere", absent: "Not included", feedbackHelp: "Green: correct piece and place. Yellow: right piece, another place. Grey: wrong piece or extra copy. These are row totals, not marks for individual places.",
    facts: "What you discovered", verified: "Discovered", solved: "Scene solved",
    completeTitle: "Chapter complete", limit: "That is every copy of this piece in the scene. Clear or move one already on the board.", full: "The row is full. Clear a place or move a piece before adding another.", incompleteNotice: "Fill every place first.",
    added: (piece, n, remaining) => `${piece} placed at place ${n}. ${remaining} empty places.`, removed: n => `Place ${n} cleared.`, selected: n => `Place ${n} selected.`, moved: "Pieces moved.", cleared: "Row cleared.", undone: "Edit undone.", restarted: "Chapter restarted.",
    result: r => `${r.exact} correct place, ${r.misplaced} elsewhere, ${r.absent} not included. New row ready.`,
    king: "King", bell: "Cursed Bell", sceneCount: n => `${n} short scenes`,
    thief: "Thief", knight: "Knight", bard: "Bard", mage: "Mage", zombie: "Zombie", ale: "Ale", coin: "Coin", pieces: "Pieces in this scene", clues: "Clues to the scene", reasoning: "How the clues fit",
    adventures: [
      { title: "The Last Round", intro: "Fresh from the royal treasury, the Thief slips into a tavern in search of companions. One quiet drink should be enough to find a party.", ending: "The Knight holds the doorway while the Thief opens the rear exit. Outside, the whole city is walking dead. Whenever the palace bell rings, every zombie turns toward it. The Bard knows a hedge Mage beyond the walls who might explain why. The party takes the old road before dawn." },
      { title: "The Court That Would Not Sleep", intro: "The city is overrun. The Thief, Knight and Bard follow the old road to a hedge Mage. The royal coins in the Thief’s pocket have begun to hum in time with the palace bell.", ending: "The royal coin reveals the curse’s target: the King. The spell cannot be broken here; its source hangs in the bell tower. Another stroke rolls over the empty throne. Upstairs, the King wakes to a voice calling him by name." },
      {"title": "The King’s Awakening", "intro": "Above the empty throne room, the palace bell wakes the King. At first it sounds like a familiar morning chime. Then it speaks his name. His two royal guards, shown as Knights, hurry to his side.", "ending": "The guards fight the Zombies at the chapel doors. Behind their shields, the King struggles against the voice drawing him toward the tower. The Bard stays to keep him awake with a song. The Thief, Mage and their Knight take a side passage: only silencing the cursed bell can save him."},
      {"title": "The Last Bell", "intro": "The King is trapped in the chapel, his guards holding back the dead. The Bard stays with him while the Thief, Mage and Knight fight toward the bell tower. They carry two royal coins and a counterspell that must be spoken beside the bell itself.", "ending": "The Knight holds the stair. The Thief cuts the bell rope while the Mage speaks the counterspell into its cracked bronze mouth. The final note dies. In the chapel, the King’s eyes clear and the Zombies fall still. The King is safe, the city is freed, and a small party leaves the palace together at sunrise."},
    ],
    scenes: [
      {
        "title": "One drink, two strangers",
        "story": "An off-duty Knight offers to hear the Thief’s plan. Only one mug of ale remains. They agree to share it, with the Thief keeping an eye on the entrance.",
        "clues": [
          "Use one Thief, one Knight and one Ale mug.",
          "Both heroes sit immediately beside the mug, on opposite sides.",
          "The Thief sits at the left end, by the entrance."
        ],
        "hints": [
          "The mug needs a neighbour on each side, so it cannot go at an end.",
          "With the mug in the middle, use the entrance clue to choose which hero goes on the left."
        ],
        "fact": "The Thief and Knight share the last drink. The Knight agrees to join the party.",
        "landmarks": [
          "Entrance",
          "Far wall"
        ],
        "lesson": "Start with the piece that needs two neighbours.",
        "reasoning": "Only the middle place has two neighbours. Put the Ale there; the entrance clue fixes the Thief on the left and leaves the right place for the Knight."
      },
      {
        "title": "A chair for the Bard",
        "story": "A Bard overhears their plan and pulls up a chair. The innkeeper finds a second mug. Three adventurers, two drinks—and the beginning of a party.",
        "clues": [
          "Use one Thief, one Knight, one Bard and two Ale mugs.",
          "Each mug is shared by heroes sitting immediately on both sides of it.",
          "The Thief sits at the left end.",
          "The Knight sits somewhere to the left of the Bard."
        ],
        "hints": [
          "Neither mug can go at an end or beside the other mug. Try alternating heroes and mugs.",
          "The Thief fixes one end of the pattern. Of the two remaining hero places, the Knight needs the earlier one."
        ],
        "fact": "The Bard joins them. With two shared mugs between three companions, the party is formed.",
        "landmarks": [
          "Entrance",
          "Far wall"
        ],
        "lesson": "Build a pattern, then use left and right to choose its direction.",
        "reasoning": "The mugs must go in places 2 and 4, with heroes in 1, 3 and 5. The Thief takes 1. The Knight must be left of the Bard, so they take 3 and 5."
      },
      {
        "title": "The back door",
        "story": "The palace bell rings. Two townsfolk stumble through the front door, their eyes blank and their skin green. The Knight draws a sword. The Thief spots a way out.",
        "clues": [
          "Use two Zombies, one Knight, one Bard and one Thief.",
          "Both Zombies stand somewhere to the left of the Knight.",
          "The Bard stands immediately to the left of the Thief.",
          "The Knight stands somewhere to the left of the Bard."
        ],
        "hints": [
          "Treat the Bard and Thief as a pair that moves together. Which side of that pair must the Knight take?",
          "Both Zombies must fit before the Knight. Count how many places the Knight needs on each side."
        ],
        "fact": "The Knight holds off the Zombies, the Bard stays behind the shield, and the Thief opens the rear exit.",
        "landmarks": [
          "Front door",
          "Rear exit"
        ],
        "lesson": "“Somewhere to the left” sets an order; it does not mean immediately beside.",
        "reasoning": "Both Zombies must come before the Knight, and the Bard–Thief pair must come after him. Those groups fill all five places, so the Knight is in place 3."
      },
      {
        "title": "The hedge Mage",
        "story": "At the Mage’s hut, the Bard watches the road. The Knight steps inside with the Thief, who lays out two stolen royal coins. Their humming grows louder as the Mage reaches towards them.",
        "clues": [
          "Use one Thief, one Mage, one Knight and two royal Coins.",
          "The Mage has a Coin immediately on each side.",
          "The Thief stands somewhere to the left of the Mage.",
          "The Knight is not next to the Thief."
        ],
        "hints": [
          "Keep Coin–Mage–Coin together. Try the places where that group can fit.",
          "If the Thief touches the Knight, that arrangement is ruled out, even if the coins fit."
        ],
        "fact": "The coins and palace bell bear the same royal seal. A spell meant to protect the city has been twisted into a summons for the dead. The Mage knows a counterspell, but must reach the bell before dawn.",
        "landmarks": [
          "Hut window",
          "Road"
        ],
        "lesson": "A clue saying “not next to” can choose between two otherwise possible arrangements.",
        "reasoning": "The Coin–Mage–Coin group can start in place 1, 2 or 3. Starting at 1 leaves no place for the Thief on its left. Starting at 3 puts the Thief beside the Knight. Only a start at 2 works."
      },
      {
        "title": "Before the silent throne",
        "story": "They reach the royal court before dawn. The throne stands empty. The Mage examines the royal seal while the Thief brings a humming coin and the Bard listens for a hidden melody. Two Knights guard the doors.",
        "clues": [
          "Use two Knights, one Thief, one Mage and one Bard.",
          "The Mage stands immediately to the right of the Thief.",
          "The Bard stands exactly two places to the right of the Thief, with one place between them.",
          "The Knights are not next to one another."
        ],
        "hints": [
          "The Thief-to-Bard gap has room for one piece. The other clue tells you who fills it.",
          "Move that three-person group along the row. Where can it go without leaving the Knights side by side?"
        ],
        "fact": "The Knights secure the doors. The Thief presents the royal coin beside the Mage while the Bard sings from the other side. The coin answers with the King’s name. They must find him before the bell calls again.",
        "landmarks": [
          "Throne side",
          "Bell side"
        ],
        "lesson": "Two clues can overlap: combine them before placing the guards.",
        "reasoning": "The two Thief clues make a Thief–Mage–Bard group. At either end it leaves the Knights together. In the middle it leaves one Knight on each end."
      },
      {
        "title": "A voice in the bell",
        "story": "The King sits up and reaches for his crown. Outside, the bell tells him to rise. The Mage arrives with a royal coin while two guards block the way out.",
        "clues": [
          "Use one King, one Mage, one royal Coin and two Knights representing the guards.",
          "The Mage stands exactly two places to the right of the King, with one place between them.",
          "The Mage stands immediately to the right of the Coin.",
          "The Knights are not next to one another."
        ],
        "hints": [
          "The King and Mage leave one place between them. Where must the Coin go to touch the Mage on his left?",
          "Try moving the King–Coin–Mage group. Keep the two guards apart."
        ],
        "fact": "The bell calls the King by name. The Mage uses the royal coin to resist the summons while the two guards keep watch.",
        "landmarks": [
          "Bedchamber",
          "Distant bell tower"
        ],
        "lesson": "Count the gap carefully: two places to the right leaves one place between.",
        "reasoning": "The Coin fills the single gap between King and Mage. Putting that group at either end leaves the guards together. The group must occupy places 2–4, with a guard at each end."
      },
      {
        "title": "The enchanted corridor",
        "story": "The King takes a step towards the sound. A dead servant appears in the corridor. The guards lead the King and Mage towards the chapel, keeping the royal coin close.",
        "clues": [
          "Use one Zombie, one King, one Mage, one royal Coin and two Knights representing the guards.",
          "A Knight stands immediately to the left of the King.",
          "The Mage stands immediately to the right of the Coin.",
          "The Mage stands exactly two places to the right of the King, with one place between them.",
          "The Zombie stands somewhere to the left of the King.",
          "The Mage is not at either end of the row."
        ],
        "hints": [
          "Combine the King, Coin and Mage clues, then attach the guard on the King’s left. You now have a group of four.",
          "That group must leave room on its left for the Zombie, but it cannot put the Mage at the right end."
        ],
        "fact": "A guard holds off the dead servant while the Mage carries the coin behind the King. The second guard brings up the rear as they reach the chapel.",
        "landmarks": [
          "Open corridor",
          "Chapel"
        ],
        "lesson": "On a longer row, test a whole group against every clue before filling the gaps.",
        "reasoning": "The clues make Knight–King–Coin–Mage. Starting it in place 1 leaves no room for the Zombie before the King. Starting it in place 3 puts the Mage at the end. It must start at 2; the Zombie takes 1 and the other guard takes 6."
      },
      {
        "title": "Hold the chapel",
        "story": "A second Zombie joins the first. The guards fight at the chapel doors while the Bard leads the King inside. The Mage slips away to find the others.",
        "clues": [
          "Use two Zombies, two Knights representing the guards, one Bard and one King.",
          "The King stands immediately to the right of the Bard.",
          "Each Knight stands exactly two places to the right of a different Zombie, with one place between them.",
          "Neither Zombie is next to the King."
        ],
        "hints": [
          "Each guard needs his own Zombie two places to his left. Try the two pairs together; the pairs may overlap.",
          "Check the King’s neighbours after placing the Bard–King pair. One possible arrangement puts a Zombie beside him."
        ],
        "fact": "Both guards hold the chapel doors. The Bard stays with the King behind their shields, singing against the voice of the bell.",
        "landmarks": [
          "Corridor",
          "Chapel sanctuary"
        ],
        "lesson": "With repeated pieces, apply “each” to every copy, not just one.",
        "reasoning": "With Bard–King kept together, the two spaced Zombie-to-Knight pairs fit only as Zombie–Zombie–Knight–Knight. The Bard–King pair could go before or after that group. Before it, the King would touch a Zombie; the pair must go after it."
      },
      {
        "title": "Across the square",
        "story": "The side passage opens onto the tower square. Two Zombies block the way. The Knight raises his shield while the Mage brings out a coin for the Thief to use at the door.",
        "clues": [
          "Use two Zombies, one Knight, one Mage, one royal Coin and one Thief.",
          "Both Zombies stand somewhere to the left of the Mage.",
          "The Thief stands immediately to the right of the Coin.",
          "The Thief stands exactly three places to the right of the Knight, with two places between them.",
          "The Mage is not at either end of the row."
        ],
        "hints": [
          "Start with the Knight-to-Thief gap. Since the Coin touches the Thief on his left, one of the two intervening places is already spoken for.",
          "The Mage needs room for both Zombies on his left. Try the possible Knight positions and rule out those that cannot leave that room."
        ],
        "fact": "The Knight holds the Zombies at bay while the Mage passes a royal coin to the Thief at the tower door.",
        "landmarks": [
          "Overrun street",
          "Tower door"
        ],
        "lesson": "Combine a gap, a pair and an exclusion without being given an end position.",
        "reasoning": "If the Knight is in place 1 or 2, there is no interior place for the Mage with both Zombies to his left. The Knight must take 3, putting the Thief in 6 and Coin in 5. The Mage takes 4 and the Zombies fill 1–2."
      },
      {
        "title": "The sealed stair",
        "story": "A royal seal locks the door above the stairs. A Zombie follows the party inside. The Mage calls for both stolen coins: one for the seal, the other for the counterspell.",
        "clues": [
          "Use one Zombie, one Knight, one Mage, one Thief and two royal Coins.",
          "The Mage has a Coin immediately on each side.",
          "The Thief stands somewhere to the right of the Mage.",
          "The Mage stands exactly three places to the right of the Zombie, with two places between them."
        ],
        "hints": [
          "The Mage needs two places on his right: one for a Coin, and another for the Thief. How far right can he go?",
          "The Mage also needs three places on his left to make the Zombie gap. Together, those limits fix his place."
        ],
        "fact": "One royal coin opens the seal; the Mage keeps the other for the counterspell. The Knight holds back the Zombie as the Thief reaches the belfry.",
        "landmarks": [
          "Foot of the stair",
          "Sealed door"
        ],
        "lesson": "Use the size of a group and the available space to deduce where it starts.",
        "reasoning": "The Mage cannot be earlier than place 4 because the Zombie is three places to his left. He cannot be later than 4 because the right Coin and Thief both need room. That fixes the Zombie in 1, Coins in 3 and 5, Thief in 6 and Knight in 2."
      },
      {
        "title": "Silence the cursed bell",
        "story": "The cursed Bell swings towards its final stroke. A Zombie climbs the stairs into the belfry. The Knight turns to stop it, the Thief reaches for the rope, and the Mage sets the last coin ringing with his counterspell.",
        "clues": [
          "Use one Zombie, one Knight, one Thief, one Cursed Bell, one royal Coin and one Mage. Here the Bell is a movable, scored piece.",
          "The Zombie stands at one end of the row.",
          "The Knight stands immediately to the right of the Zombie.",
          "The Mage stands immediately to the right of the Coin.",
          "The Thief is next to the Bell.",
          "The Thief stands somewhere to the left of the Mage.",
          "The Bell is not next to the Knight."
        ],
        "hints": [
          "A Knight must fit on the Zombie’s right. Which end does that rule out for the Zombie? Keep Coin–Mage and Thief–Bell together in the remaining space.",
          "Compare the two pairs. Putting Coin–Mage first leaves no room for the Thief on the Mage’s left. Then use the Knight’s forbidden neighbour to turn the Thief–Bell pair."
        ],
        "fact": "The Knight stops the Zombie. The Thief cuts the rope, and the Mage carries the counterspell through the royal coin into the Bell. Its voice breaks. Far below, the King is freed from the curse.",
        "landmarks": [
          "Belfry stairs",
          "Belfry window"
        ],
        "lesson": "Bring the earlier deductions together: ends, direction, pairs and an excluded neighbour.",
        "reasoning": "The Zombie must take the left end, with the Knight in 2. The two pairs fill the remaining four places. Thief–Bell must come before Coin–Mage so the Thief is left of the Mage. The Bell cannot touch the Knight, so the Thief takes 3 and Bell 4."
      }
    ],
  },
  pl: {
    brand: "PRZEKLĘTY DZWON", entryTitle: "Przeklęty dzwon", entryText: "Skradziona moneta, niespodziewana drużyna i dzwon, który budzi umarłych. Poznaj zasady w prologu, a potem rusz za Złodziejem z karczmy do pałacowej wieży. Ukończ rozdział, by odblokować następny. Gra zapamiętuje ukończenie prologu i postęp rozdziałów na tym urządzeniu.",
    preludeTitle: "Prolog · Złodziej w skarbcu", guidedPrelude: "Poznaj zasady gry", replayPrelude: "Ukończony · Powtórz prolog",
    chapters: "Rozdziały", beginStory: "Rozpocznij opowieść", continueStory: "Kontynuuj opowieść", revisitStory: "Wróć do zakończenia", completed: "Ukończony", storyComplete: "Opowieść ukończona", progress: (n, total) => `Ukończone rozdziały: ${n} z ${total}`, lockedAfter: n => `Zablokowany · Ukończ rozdział ${n}, by odblokować.`,
    start: "Ostatnia kolejka", second: "Dwór, który nie mógł zasnąć", back: "Wróć do rozdziałów", chapter: "Rozdział", scene: "Scena", of: "z",
    play: "Zagraj", resume: "Kontynuuj", viewEnding: "Zobacz zakończenie", recovery: "Nie można odczytać zapisu tego rozdziału albo pochodzi on z innej wersji opowieści. Zacznij ten rozdział od nowa. Pozostałe rozdziały i codzienne zagadki zachowają postęp.", restartConfirm: "Zacząć ten rozdział od nowa? Jego zapisany postęp zostanie zastąpiony. Odblokowane rozdziały pozostaną dostępne.", begin: "Ułóż tę scenę", next: "Dalszy ciąg opowieści", finish: "Wróć do rozdziałów", continue: "Następny rozdział", replay: "Powtórz rozdział", restart: "Zacznij rozdział od nowa",
    current: "Obecny układ", currentHint: "Zapełnij wszystkie miejsca i sprawdź swoją wersję zdarzeń.", choose: "Wybierz element", add: "Dodaj", shortcut: "klawisz", position: "Miejsce", empty: "puste", tapClear: "Dotknij, aby usunąć",
    check: "Sprawdź układ", clear: "Wyczyść rząd", undo: "Cofnij zmianę", hint: "Podpowiedź · bez kosztu", moreHint: "Ostatnia podpowiedź · bez kosztu", hintsShown: "Obie podpowiedzi odkryte", hintHeading: "Mała pomoc",
    dragHint: "Dotknij zajętego miejsca, aby je wyczyścić. Przytrzymaj i przeciągnij, aby przesunąć lub zamienić elementy. Klawisze cyfr wybierają elementy.", ready: "Możesz sprawdzić układ. Liczba prób jest nieograniczona.", incomplete: "Zapełnij wszystkie miejsca, aby sprawdzić układ.",
    rules: "Bez limitu prób, z darmowymi podpowiedziami. Ukończ rozdział, by odblokować następny. Postęp i dostęp do rozdziałów zapisują się na tym urządzeniu. Możesz wrócić do menu i kontynuować później.",
    adjacency: "„Obok” oznacza miejsce bezpośrednio po lewej lub prawej. Końce rzędu nie łączą się. Punkty orientacyjne leżą poza sprawdzanym rzędem.",
    noSave: "Postęp zapisuje się na tym urządzeniu. Po rozwiązaniu sceny zostaje jej opowieść, bez wcześniejszych prób.",
    latest: "Ostatnia próba", earlier: "Wcześniejsze próby", hypotheses: "Próba odtworzenia wydarzeń, a nie część opowieści.", fresh: "Ułóż nową wersję w pustym rzędzie. Liczba prób jest nieograniczona.",
    exact: "Właściwe miejsce", misplaced: "Inne miejsce", absent: "Nie pasuje", feedbackHelp: "Zielony: dobry element i miejsce. Żółty: dobry element, inne miejsce. Szary: inny element lub nadmiarowa kopia. To wyniki całego rzędu, nie poszczególnych miejsc.",
    facts: "Odkryta historia", verified: "Odkrycie", solved: "Scena rozwiązana",
    completeTitle: "Rozdział ukończony", limit: "W scenie nie ma więcej kopii tego elementu. Usuń lub przesuń jeden z już ułożonych.", full: "Rząd jest pełny. Zwolnij miejsce lub przesuń element, zanim dodasz kolejny.", incompleteNotice: "Najpierw zapełnij wszystkie miejsca.",
    added: (piece, n, remaining) => `${piece}: miejsce ${n}. Pozostało pustych miejsc: ${remaining}.`, removed: n => `Miejsce ${n} wyczyszczone.`, selected: n => `Wybrano miejsce ${n}.`, moved: "Elementy przesunięte.", cleared: "Rząd wyczyszczony.", undone: "Zmiana cofnięta.", restarted: "Rozdział rozpoczęty od nowa.",
    result: r => `Właściwe miejsce: ${r.exact}, inne miejsce: ${r.misplaced}, nie pasuje: ${r.absent}. Nowy rząd jest gotowy.`,
    king: "Król", bell: "Przeklęty dzwon", sceneCount: n => `Krótkie sceny: ${n}`,
    thief: "Złodziej", knight: "Rycerz", bard: "Bardka", mage: "Mag", zombie: "Zombie", ale: "Piwo", coin: "Moneta", pieces: "Elementy tej sceny", clues: "Wskazówki", reasoning: "Jak połączyć wskazówki",
    adventures: [
      { title: "Ostatnia kolejka", intro: "Z królewskiego skarbca Złodziej trafia prosto do karczmy. Szuka towarzyszy wyprawy. Jeden spokojny kufel powinien wystarczyć, żeby zebrać drużynę.", ending: "Rycerz utrzymuje przejście, a Złodziej otwiera tylne drzwi. Na ulicach roi się od żywych trupów. Za każdym razem, gdy bije pałacowy dzwon, wszystkie zombie zwracają się w jego stronę. Bardka zna maga pustelnika za murami. Może on wie, co się dzieje. Przed świtem drużyna rusza starym traktem." },
      { title: "Dwór, który nie mógł zasnąć", intro: "Miasto opanowały zombie. Złodziej, Rycerz i Bardka ruszają starym traktem do maga pustelnika. Królewskie monety w kieszeni Złodzieja zaczynają brzęczeć w rytm pałacowego dzwonu.", ending: "Królewska moneta ujawnia cel klątwy: Króla. Nie da się złamać czaru tutaj — jego źródło wisi w dzwonnicy. Kolejne uderzenie przetacza się nad pustym tronem. Na piętrze Król budzi się na dźwięk głosu wołającego go po imieniu." },
      {"title": "Przebudzenie Króla", "intro": "Nad pustą salą tronową pałacowy dzwon budzi Króla. Z początku brzmi jak zwykłe poranne bicie. Potem wypowiada jego imię. Dwaj królewscy strażnicy, przedstawieni jako Rycerze, spieszą do komnaty.", "ending": "Strażnicy walczą z Zombie u drzwi kaplicy. Za ich tarczami Król opiera się głosowi ciągnącemu go ku wieży. Bardka zostaje, by podtrzymywać go na duchu pieśnią. Złodziej, Mag i ich Rycerz ruszają bocznym przejściem. Tylko uciszenie przeklętego dzwonu może go ocalić."},
      {"title": "Ostatnie uderzenie", "intro": "Król jest uwięziony w kaplicy, a jego strażnicy powstrzymują nieumarłych. Bardka zostaje z nim. Złodziej, Mag i Rycerz przedzierają się do dzwonnicy. Niosą dwie królewskie monety i przeciwzaklęcie, które trzeba wypowiedzieć przy samym dzwonie.", "ending": "Rycerz utrzymuje schody. Złodziej przecina linę, a Mag wypowiada przeciwzaklęcie do pękniętej spiżowej paszczy. Ostatni dźwięk zamiera. W kaplicy spojrzenie Króla znów staje się jasne, a Zombie nieruchomieją. Król jest bezpieczny, miasto wolne. O wschodzie słońca mała drużyna wspólnie opuszcza pałac."},
    ],
    scenes: [
      {
        "title": "Jeden kufel, dwoje nieznajomych",
        "story": "Rycerz po służbie chce wysłuchać planu Złodzieja. Został tylko jeden kufel piwa. Postanawiają się nim podzielić. Złodziej woli mieć oko na wejście.",
        "clues": [
          "Użyj jednego Złodzieja, jednego Rycerza i jednego kufla Piwa.",
          "Oboje siedzą bezpośrednio przy kuflu, po jego przeciwnych stronach.",
          "Złodziej siedzi na lewym skraju, przy wejściu."
        ],
        "hints": [
          "Kufel potrzebuje sąsiada z obu stron, więc nie może stać na skraju.",
          "Gdy kufel stoi pośrodku, wskazówka o wejściu rozstrzyga, kto siedzi po lewej."
        ],
        "fact": "Złodziej i Rycerz dzielą się ostatnim piwem. Rycerz zgadza się dołączyć do drużyny.",
        "landmarks": [
          "Wejście",
          "Ściana"
        ],
        "lesson": "Zacznij od elementu, który potrzebuje dwóch sąsiadów.",
        "reasoning": "Tylko środkowe miejsce ma dwóch sąsiadów. Tam postaw Piwo. Wskazówka o wejściu wyznacza Złodziejowi miejsce po lewej; dla Rycerza zostaje prawe."
      },
      {
        "title": "Krzesło dla Bardki",
        "story": "Bardka słyszy ich rozmowę i przysuwa krzesło. Karczmarz znajduje drugi kufel. Troje poszukiwaczy przygód, dwa piwa — tak powstaje drużyna.",
        "clues": [
          "Użyj po jednym Złodzieju, Rycerzu i Bardce oraz dwóch kufli Piwa.",
          "Każdy kufel jest dzielony przez bohaterów siedzących bezpośrednio po obu jego stronach.",
          "Złodziej siedzi na lewym skraju.",
          "Rycerz siedzi gdzieś na lewo od Bardki."
        ],
        "hints": [
          "Żaden kufel nie może stać na skraju ani obok drugiego kufla. Spróbuj ustawiać bohaterów i kufle na przemian.",
          "Złodziej zajmuje jeden koniec tego układu. Z dwóch pozostałych miejsc dla bohaterów Rycerz potrzebuje tego po lewej."
        ],
        "fact": "Bardka dołącza do towarzyszy. Dwa wspólne kufle wystarczają dla całej trójki. Drużyna jest gotowa.",
        "landmarks": [
          "Wejście",
          "Ściana"
        ],
        "lesson": "Najpierw znajdź wzór, potem ustal jego kierunek.",
        "reasoning": "Kufle muszą stać na miejscach 2 i 4, a bohaterowie na 1, 3 i 5. Złodziej zajmuje 1. Rycerz musi siedzieć na lewo od Bardki, więc zajmują odpowiednio 3 i 5."
      },
      {
        "title": "Tylne drzwi",
        "story": "Bije pałacowy dzwon. Przez wejście wtacza się dwoje mieszkańców o pustych oczach i zielonkawej skórze. Rycerz wyciąga miecz. Złodziej szuka drogi ucieczki.",
        "clues": [
          "Użyj dwóch Zombie oraz po jednym Rycerzu, Bardce i Złodzieju.",
          "Oba Zombie stoją gdzieś na lewo od Rycerza.",
          "Bardka stoi bezpośrednio na lewo od Złodzieja.",
          "Rycerz stoi gdzieś na lewo od Bardki."
        ],
        "hints": [
          "Potraktuj Bardkę i Złodzieja jak parę, którą przesuwasz razem. Po której jej stronie musi stanąć Rycerz?",
          "Przed Rycerzem muszą zmieścić się oba Zombie. Policz, ilu miejsc potrzebuje on z każdej strony."
        ],
        "fact": "Rycerz odpiera Zombie. Bardka chowa się za jego tarczą, a Złodziej otwiera tylne drzwi.",
        "landmarks": [
          "Wejście",
          "Tylne drzwi"
        ],
        "lesson": "„Gdzieś na lewo” określa kolejność, ale nie wymaga bezpośredniego sąsiedztwa.",
        "reasoning": "Oba Zombie muszą stać przed Rycerzem, a para Bardka–Złodziej za nim. Te grupy zajmują wszystkie pięć miejsc, więc Rycerz stoi na miejscu 3."
      },
      {
        "title": "Mag pustelnik",
        "story": "Przy chacie Maga Bardka pilnuje drogi. Rycerz wchodzi ze Złodziejem, który wykłada dwie skradzione królewskie monety. Ich brzęczenie narasta, gdy Mag wyciąga ku nim rękę.",
        "clues": [
          "Użyj po jednym Złodzieju, Magu i Rycerzu oraz dwóch królewskich Monet.",
          "Mag ma Monetę bezpośrednio po każdej stronie.",
          "Złodziej stoi gdzieś na lewo od Maga.",
          "Rycerz nie stoi obok Złodzieja."
        ],
        "hints": [
          "Trzymaj razem grupę Moneta–Mag–Moneta. Sprawdź, gdzie się zmieści.",
          "Jeśli Złodziej stoi obok Rycerza, taki układ odpada, nawet gdy Monety są na właściwych miejscach."
        ],
        "fact": "Monety i pałacowy dzwon noszą tę samą królewską pieczęć. Czar chroniący miasto zmieniono w wezwanie dla umarłych. Mag zna przeciwzaklęcie, ale musi dotrzeć do dzwonu przed świtem.",
        "landmarks": [
          "Okno chaty",
          "Droga"
        ],
        "lesson": "Wskazówka „nie stoi obok” pozwala wykluczyć układ, który pasuje do pozostałych warunków.",
        "reasoning": "Grupa Moneta–Mag–Moneta może zaczynać się na miejscu 1, 2 albo 3. Początek na 1 nie zostawia miejsca dla Złodzieja po lewej. Początek na 3 stawia go obok Rycerza. Zostaje początek na 2."
      },
      {
        "title": "Przed pustym tronem",
        "story": "Docierają na królewski dwór przed świtem. Tron stoi pusty. Mag bada królewską pieczęć, Złodziej niesie brzęczącą monetę, a Bardka nasłuchuje ukrytej melodii. Dwaj Rycerze pilnują drzwi.",
        "clues": [
          "Użyj dwóch Rycerzy oraz po jednym Złodzieju, Magu i Bardce.",
          "Mag stoi bezpośrednio na prawo od Złodzieja.",
          "Bardka stoi o dwa miejsca na prawo od Złodzieja: dzieli ich dokładnie jedno miejsce.",
          "Rycerze nie stoją obok siebie."
        ],
        "hints": [
          "Między Złodziejem a Bardką jest jedno miejsce. Druga wskazówka mówi, kto je zajmuje.",
          "Przesuwaj tę trzyosobową grupę wzdłuż rzędu. Gdzie może stanąć, żeby Rycerze nie znaleźli się obok siebie?"
        ],
        "fact": "Rycerze zabezpieczają drzwi. Złodziej podaje królewską monetę Magowi, a Bardka śpiewa po jego drugiej stronie. Moneta odpowiada imieniem Króla. Muszą go odnaleźć, zanim dzwon odezwie się ponownie.",
        "landmarks": [
          "Strona tronu",
          "Strona dzwonu"
        ],
        "lesson": "Połącz wskazówki, które dotyczą tych samych postaci, zanim ustawisz strażników.",
        "reasoning": "Dwie wskazówki o Złodzieju tworzą grupę Złodziej–Mag–Bardka. Przy którymkolwiek skraju zostawia ona Rycerzy obok siebie. Pośrodku zostawia dla każdego Rycerza osobny skraj."
      },
      {
        "title": "Głos dzwonu",
        "story": "Król siada na posłaniu i sięga po koronę. Za oknem dzwon wzywa go, by wstał. Mag przybywa z królewską monetą, a dwaj strażnicy zastępują władcy drogę.",
        "clues": [
          "Użyj po jednym Królu, Magu i królewskiej Monecie oraz dwóch Rycerzy przedstawiających strażników.",
          "Mag stoi o dwa miejsca na prawo od Króla: dzieli ich dokładnie jedno miejsce.",
          "Mag stoi bezpośrednio na prawo od Monety.",
          "Rycerze nie stoją obok siebie."
        ],
        "hints": [
          "Król i Mag zostawiają między sobą jedno miejsce. Gdzie musi znaleźć się Moneta, żeby dotykała Maga z lewej?",
          "Spróbuj przesuwać grupę Król–Moneta–Mag. Strażnicy nie mogą stać obok siebie."
        ],
        "fact": "Dzwon woła Króla po imieniu. Mag za pomocą królewskiej monety osłabia wezwanie, a dwaj strażnicy trzymają wartę.",
        "landmarks": [
          "Komnata",
          "Odległa dzwonnica"
        ],
        "lesson": "Licz odstęp uważnie: „o dwa miejsca na prawo” oznacza jedno miejsce pomiędzy.",
        "reasoning": "Moneta wypełnia jedyne miejsce między Królem a Magiem. Grupa przy którymkolwiek skraju zostawiłaby strażników obok siebie. Musi zająć miejsca 2–4, ze strażnikiem na każdym skraju."
      },
      {
        "title": "Zaczarowany korytarz",
        "story": "Król robi krok ku dźwiękowi. W korytarzu pojawia się martwy sługa. Strażnicy prowadzą władcę i Maga do kaplicy, nie oddalając się od królewskiej monety.",
        "clues": [
          "Użyj po jednym Zombie, Królu, Magu i królewskiej Monecie oraz dwóch Rycerzy przedstawiających strażników.",
          "Bezpośrednio na lewo od Króla stoi Rycerz.",
          "Mag stoi bezpośrednio na prawo od Monety.",
          "Mag stoi o dwa miejsca na prawo od Króla: dzieli ich dokładnie jedno miejsce.",
          "Zombie stoi gdzieś na lewo od Króla.",
          "Mag nie stoi na żadnym skraju rzędu."
        ],
        "hints": [
          "Połącz wskazówki o Królu, Monecie i Magu, a potem dodaj strażnika po lewej od Króla. Masz już grupę czterech elementów.",
          "Ta grupa musi zostawić po lewej miejsce dla Zombie, ale nie może stawiać Maga na prawym skraju."
        ],
        "fact": "Jeden strażnik powstrzymuje martwego sługę, a Mag niesie monetę za Królem. Drugi strażnik zamyka pochód do kaplicy.",
        "landmarks": [
          "Otwarty korytarz",
          "Kaplica"
        ],
        "lesson": "W dłuższym rzędzie sprawdź całą grupę według wszystkich wskazówek, zanim wypełnisz luki.",
        "reasoning": "Ze wskazówek powstaje grupa Rycerz–Król–Moneta–Mag. Początek na miejscu 1 nie zostawia miejsca dla Zombie przed Królem. Początek na 3 stawia Maga na skraju. Grupa musi zaczynać się na 2; Zombie zajmuje 1, a drugi strażnik 6."
      },
      {
        "title": "Utrzymać kaplicę",
        "story": "Do pierwszego Zombie dołącza drugi. Strażnicy walczą u drzwi kaplicy, a Bardka prowadzi Króla do środka. Mag wymyka się, by odnaleźć pozostałych.",
        "clues": [
          "Użyj dwóch Zombie, dwóch Rycerzy przedstawiających strażników, jednej Bardki i jednego Króla.",
          "Król stoi bezpośrednio na prawo od Bardki.",
          "Każdy Rycerz stoi o dwa miejsca na prawo od innego Zombie: w każdej parze jest dokładnie jedno miejsce pomiędzy.",
          "Żaden Zombie nie stoi obok Króla."
        ],
        "hints": [
          "Każdy strażnik potrzebuje własnego Zombie o dwa miejsca po lewej. Spróbuj ustawić obie pary razem; mogą się przeplatać.",
          "Po ustawieniu pary Bardka–Król sprawdź sąsiadów Króla. Jeden z możliwych układów stawia przy nim Zombie."
        ],
        "fact": "Obaj strażnicy utrzymują drzwi kaplicy. Za ich tarczami Bardka zostaje z Królem i śpiewem zagłusza głos dzwonu.",
        "landmarks": [
          "Korytarz",
          "Wnętrze kaplicy"
        ],
        "lesson": "Przy powtarzających się elementach słowo „każdy” dotyczy wszystkich kopii.",
        "reasoning": "Gdy Bardka i Król stoją razem, dwie pary Zombie–Rycerz z odstępami mieszczą się tylko we wzorze Zombie–Zombie–Rycerz–Rycerz. Para Bardka–Król może stanąć przed tą grupą albo za nią. Przed nią Król sąsiadowałby z Zombie, więc para musi stanąć za grupą."
      },
      {
        "title": "Przez plac",
        "story": "Boczne przejście prowadzi na plac pod wieżą. Dwa Zombie zagradzają drogę. Rycerz podnosi tarczę, a Mag wyjmuje monetę, którą Złodziej ma otworzyć drzwi.",
        "clues": [
          "Użyj dwóch Zombie oraz po jednym Rycerzu, Magu, królewskiej Monecie i Złodzieju.",
          "Oba Zombie stoją gdzieś na lewo od Maga.",
          "Złodziej stoi bezpośrednio na prawo od Monety.",
          "Złodziej stoi o trzy miejsca na prawo od Rycerza: dzielą ich dokładnie dwa miejsca.",
          "Mag nie stoi na żadnym skraju rzędu."
        ],
        "hints": [
          "Zacznij od odstępu między Rycerzem a Złodziejem. Moneta sąsiaduje ze Złodziejem z lewej, więc zajmuje jedno z dwóch miejsc pomiędzy nimi.",
          "Mag potrzebuje miejsca dla obu Zombie po swojej lewej stronie. Sprawdź możliwe miejsca Rycerza i odrzuć te, przy których tego miejsca zabraknie."
        ],
        "fact": "Rycerz powstrzymuje Zombie, a Mag podaje Złodziejowi królewską monetę przy drzwiach wieży.",
        "landmarks": [
          "Opanowana ulica",
          "Drzwi wieży"
        ],
        "lesson": "Połącz odstęp, parę i wykluczenie, nie znając z góry żadnego skraju.",
        "reasoning": "Przy Rycerzu na miejscu 1 lub 2 nie ma wewnętrznego miejsca dla Maga z oboma Zombie po lewej. Rycerz musi zająć 3, co wyznacza Złodziejowi 6, a Monecie 5. Mag zajmuje 4, Zombie wypełniają 1–2."
      },
      {
        "title": "Zapieczętowane schody",
        "story": "Królewska pieczęć zamyka drzwi nad schodami. Za drużyną wdziera się Zombie. Mag prosi o obie skradzione monety: jedną do pieczęci, drugą do przeciwzaklęcia.",
        "clues": [
          "Użyj po jednym Zombie, Rycerzu, Magu i Złodzieju oraz dwóch królewskich Monet.",
          "Mag ma Monetę bezpośrednio po każdej stronie.",
          "Złodziej stoi gdzieś na prawo od Maga.",
          "Mag stoi o trzy miejsca na prawo od Zombie: dzielą ich dokładnie dwa miejsca."
        ],
        "hints": [
          "Mag potrzebuje dwóch miejsc po prawej: jednego dla Monety, drugiego dla Złodzieja. Jak daleko w prawo może stanąć?",
          "Potrzebuje też trzech miejsc po lewej, by zachować odstęp od Zombie. Oba ograniczenia wyznaczają jego miejsce."
        ],
        "fact": "Jedna królewska moneta otwiera pieczęć; drugą Mag zatrzymuje do przeciwzaklęcia. Rycerz powstrzymuje Zombie, a Złodziej dociera do dzwonnicy.",
        "landmarks": [
          "Podnóże schodów",
          "Zapieczętowane drzwi"
        ],
        "lesson": "Rozmiar grupy i wolne miejsca pozwalają ustalić, gdzie grupa się zaczyna.",
        "reasoning": "Mag nie może stać przed miejscem 4, bo Zombie jest o trzy miejsca na lewo. Nie może też stać dalej niż na 4, bo po prawej muszą zmieścić się Moneta i Złodziej. Zombie zajmuje więc 1, Monety 3 i 5, Złodziej 6, a Rycerz 2."
      },
      {
        "title": "Uciszyć przeklęty dzwon",
        "story": "Przeklęty Dzwon kołysze się ku ostatniemu uderzeniu. Po schodach do dzwonnicy wspina się Zombie. Rycerz odwraca się, by go zatrzymać, Złodziej sięga po linę, a Mag wprawia ostatnią monetę w drżenie słowami przeciwzaklęcia.",
        "clues": [
          "Użyj po jednym Zombie, Rycerzu, Złodzieju, Przeklętym Dzwonie, królewskiej Monecie i Magu. W tej scenie Dzwon jest ruchomym elementem sprawdzanego rzędu.",
          "Zombie stoi na jednym ze skrajów rzędu.",
          "Rycerz stoi bezpośrednio na prawo od Zombie.",
          "Mag stoi bezpośrednio na prawo od Monety.",
          "Złodziej stoi obok Dzwonu.",
          "Złodziej stoi gdzieś na lewo od Maga.",
          "Dzwon nie sąsiaduje z Rycerzem."
        ],
        "hints": [
          "Po prawej od Zombie musi zmieścić się Rycerz. Który skraj to wyklucza? W pozostałej części rzędu trzymaj razem pary Moneta–Mag oraz Złodziej–Dzwon.",
          "Porównaj obie pary. Jeśli Moneta–Mag stoi wcześniej, zabraknie miejsca dla Złodzieja na lewo od Maga. Potem ustal kierunek pary Złodziej–Dzwon, sprawdzając, kto nie może sąsiadować z Rycerzem."
        ],
        "fact": "Rycerz zatrzymuje Zombie. Złodziej przecina linę, a Mag za pośrednictwem królewskiej monety kieruje przeciwzaklęcie w Dzwon. Jego głos się załamuje. Daleko w dole Król zostaje uwolniony od klątwy.",
        "landmarks": [
          "Schody dzwonnicy",
          "Okno dzwonnicy"
        ],
        "lesson": "Połącz wcześniejsze sposoby rozumowania: skraje, kierunek, pary i wykluczone sąsiedztwo.",
        "reasoning": "Zombie musi stać na lewym skraju, a Rycerz na miejscu 2. Dwie pary wypełniają pozostałe cztery miejsca. Złodziej–Dzwon musi stać przed Monetą–Magiem, żeby Złodziej znalazł się na lewo od Maga. Dzwon nie może dotykać Rycerza, więc Złodziej zajmuje 3, a Dzwon 4."
      }
    ],
  },
};
export const sceneCopyIndex = (state, scene = state.scene) => ADVENTURES.slice(0, state.adventure).reduce((count, adventure) => count + adventure.scenes.length, 0) + scene;
