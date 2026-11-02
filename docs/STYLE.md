# How SLATE Is Written

The convention every surface of the game follows. Where a screen departs
from it, the screen is wrong, not the convention. The checks that hold it in
place are named at the end. The words a player sees for each concept are in
`docs/GLOSSARY.md`.

## Speak like a finished game

From 2026-10-19, at the owner's brief 15 ("Complete Natural-Language Editorial
Pass, Including All Retained Text",
`docs/verification/briefs-2026-10-16/15-complete-natural-language-editorial-pass.txt`).
Brief 14 made the text accurate and taught the tasks, but much of it still
read stiff, indirect or like the engine's own notes: "a word stays plain text
until the chapter that opens it has been read", "put Knows The Scene first: it
counts for more when this piece is shown", "on October 14, 2026, the last time
the advice was noted, the first was composure". This section is the standard
now. Where an older convention below would keep a sentence like those, this
one wins. Real examples, each checked against the code, are in
`docs/verification/editorial-2026-10-19/reference.md`.

Say it the way a well-made game says it to its player:
- **Familiar words, direct instructions.** "Press Go, or Stand Here to wait."
- **A clear subject and verb.** The player, a person or a thing does
  something. Not "is counted", "was begun", "has been read" where someone did
  it.
- **Contractions** where speech has them.
- **Specific consequences.** What happened, what it costs, what it changes.
- **Short first, detail after.** The first sentence says what matters. The
  qualifications follow it, or go behind a drill-down, and never make the
  first sentence unreadable.
- **One word for one thing,** the glossary's, and the screen's exact labels.
- **A voice that fits the speaker:** a teacher, a bank, a friend, the game's
  own guide.

Never:
- the engine's words as ordinary narration ("reads", "inputs", "the work",
  "the game judges", "this life");
- an awkward passive, a cryptic fragment, or a literary sentence about a
  basic control;
- slang, cheerleading or filler;
- one obscure phrase swapped for another. Read the whole sentence, and the
  screens before and after it, not a list of banned words.

Each change keeps exactly what the game does. Read the code that writes or
acts on a consequential sentence before changing it. A sentence that's already
clear, natural and accurate stays, and its status says why in words specific
to it: "already reviewed", "grammatically correct" and "no flagged words"
aren't reasons (`tools/text-inventory.mjs --mark2` refuses them). A quotation
stays as its source wrote it, and the game's explanation around it is marked
as the game's.

Read whole interactions, not lone sentences: what a feature says it's for,
the action, any refusal, the confirmation, the result, the later notice, and
the How This Works and drill-down behind it. Each says what the player needs
at that moment, once, in the same words, with the next step.

## Talking to the player

From 2026-10-17, at the owner's brief 14 ("Complete Player-Facing Language And
Tutorial Overhaul", `docs/verification/briefs-2026-10-16/14-complete-player-facing-language-and-tutorial-overhaul.txt`).
Much of the game's text had come to read like the engine describing itself:
"work reads it", "the take's inputs", "the part most often short", "your
standing falls a step", "a choice rehearsed in". It was accurate and hard to
play. The brief authorized replacing the conventions that caused it, and the
ones replaced are named where they stood, below.

Every string is written for a player who knows the game only by playing it.

- **Direct, familiar English.** Say what a person would say across a table.
- **Short, complete sentences** where you can. One thought each. A sentence
  that needs a colon, a semicolon and a dash is two sentences.
- **A clear subject doing a clear thing.** "Your teacher wants the scene
  memorized", not "the scene's lines, unlearned, held it back".
- **Contractions,** the way speech uses them (Voice, below).
- **Specific to now.** Name the scene, the date, the amount, the person.
- **One name for one thing,** the glossary's. Don't rotate synonyms for
  variety: a player reads a new word as a new thing.
- **Professional, never slangy,** and no elaborate phrasing where a plain word
  says it.
- **No internal concepts.** The player doesn't see an engine, a judge, inputs,
  weights, dimensions, segments, signals, dials or a take (outside a
  self-tape). They see a scene, a teacher's notes, their abilities and their
  preparation. Translate the mechanic into what it means for them, and keep
  its exact meaning: a rewrite that changes what's true is a defect.

### Each kind of text has its own job

- **Navigation and buttons:** familiar, short, Title Case, and the verb is the
  action (Verbs that name the action, below). The label says where it goes or
  what it does, never something clever.
- **Notifications:** what happened first, then what it means in practice, then
  what to do next where there's something to do. For example: "Your card's
  autopay didn't go through. Checking had $41.10 and the minimum payment was
  $48.00, so the payment is late. Move money into Checking, then pay the card
  from Money."
- **Faculty feedback:** a teacher talking about this piece of work. Name what
  they saw and what to do next. Never invent an observation, a line of
  dialogue or knowledge the game doesn't have. Feedback is the school's
  simulated assessment and is labelled as the teacher's note, not as a fact
  about the player. From brief 16 (2026-10-20, `systems/feedback.ts`) a
  showing says what happened (against the course's last piece where the band
  moved), why (the note, or what held a prepared piece back by the judged
  limits), and what to try, in the shape its situation has: a new note, a note
  better but not there, one still there, one back after it was taken, a run of
  strong work, a strong piece despite a bad day. A note given often is said
  short, with what's still open. Each course speaks in its discipline's terms:
  acting of what's wanted, the other person and the choice; voice of breath,
  sound and clarity; movement of weight, coordination and stamina; text of the
  reading and its evidence. A note says it held the piece back most, never that
  it decided the band: the record doesn't say that.
- **Advice:** the recommendation first, short: what, why now, the action in
  the screen's own words, the expected benefit called an estimate, and why
  it can't be done now where it can't. The working behind it (the method, what
  it assumes, preparation against training, how long it's been first, the
  alternatives) goes behind Why This Recommendation, each part said once.
- **Banking and official notices:** clear and professional. Keep every
  amount, date, deadline, condition and uncertainty exactly. Say which parts
  are published rules and which are the game's estimates (Truth in the text,
  below). Never make a legal or money consequence sound more certain than the
  game makes it.
- **Narration:** what actually happened, plainly, with the history that
  matters. No melodrama, no filler and no invented events.
- **Errors and unavailable actions:** the specific obstacle, whether anything
  was charged, changed or saved, and the next real step. For example: "You
  can't book an appointment yet because you don't have health cover. Nothing
  was charged."
  Never promise a recovery or an eligibility the game doesn't offer. Never
  show a command's id or a raw field name. Name a place on screen by its
  labels in words ("Health, then Cover"), never with an arrow.
  A refusal for money that isn't there has one shape everywhere: what can't
  pay, the amount, and, once something has been pressed, what didn't happen.
  "Your bank can’t cover $28.00, so nothing was charged." Where the player
  chose both the account and the amount, the figure that helps is what the
  account has: "Chase Total Checking has only $40.50, so nothing was moved."
  A reason shown beside a control before it's pressed names the amount and
  not what didn't happen, since nothing was tried: "Your bank can’t cover the
  $500.00 down payment." Until 2026-10-17 (brief 14's editorial review) health
  said "It costs …, more than your bank can cover." and Money "… only has $…
  in it." with the cents dropped.

### Tutorials and help teach a task

Every chapter of the guide and every How This Works answers, in this order
and in the screen's own labels: what it's for, where to go, what to press,
what's needed first, what happens, what else it affects, what to do next, and
what to do if you can't. Start with a short plain overview. Then the concrete
steps. Then results and consequences. Deeper explanation and the figures come
last, or behind a drill-down. Every route a tutorial gives is one that works on
the built app today, never a guessed or future one. Reading a tutorial, or
following its link and coming back, never runs a command or moves the clock.
The guide's `opens` decide what a chapter unlocks; a rewrite never changes
them.

These are the distinctions players most often confuse, and each tutorial that
touches one says it plainly: health, stamina and energy; abilities,
techniques, genre knowledge and practice; how ready a piece is now and what a
full preparation would give; choosing a way to play a scene and rehearsing
it; money available and money pending; applying for a document and holding
it; a coursework warning and the term review that follows.

### Text built from parts

A sentence assembled from pieces reads as well in every variant as in the one
you tested. Use the shared helpers (`plural` in `core/text.ts`, the money
formatter, the date formatters, the list joiners) rather than adding an "s"
or a comma by hand. Exercise one, zero, one and many; the names and pronouns
a life can have; a missing optional piece; each academic standing; upcoming,
due and missed deadlines; positive, zero and negative balances. Never print a
fragment, a doubled stop, a stray space before punctuation, an id, `undefined`
or a malformed date. Read figures from the engine's own values, never copy a
rule's number into prose, where it goes stale.

Variety is never drawn from the game's random numbers: a different wording
chosen by a draw changes the draws the game makes after it, and so the game.
Pick a variant from the situation (what changed, what's still open), not at
random. Where a situation has several equally true ways to say it, the choice
is a hash of the event (the piece and the day), skipping any wording the same
speaker said lately, read from the record the save already keeps (`pick`, from
brief 16): a reload says the same words, and nothing is added to the save. When
every way has been said lately, the one said longest ago comes back: a true
repeat, never a new claim.

### Repetition says what changed

A message that comes back says why it's back. What has changed since last
time, what's still unresolved, what the player already did, and why the
advice or the restriction still holds. A teacher doesn't describe the same
weakness as a new discovery each time. Don't paraphrase an unchanged message
to hide that it repeats: a varied wording (Text built from parts, above) still
says it's the same note, how many times, and what's still open. Buttons,
labels, figures, warnings and standing instructions keep one wording, since
they're found by it.

### Comments aren't player text

Code comments keep the project's own rule: what was measured and changed, in
the past tense. A rewrite of player-facing words doesn't need a history comment
beside each string. The pass's record (`docs/verification/language-2026-10-17/`
and the commits) keeps the before and after. A comment the new words make
false is corrected.

## Labels: Title Case, every word

Tabs, buttons, tiles, headings, menu items, chips, column heads, form labels,
decision actions, choice labels in a scene, and the title of a decision or a
notification (its body is prose): every word capitalised, including the short
ones, whether the label is written out or built from a template around a
name — **Showing At 9440 Fairhaven Drive**, **Paid Off The Car Loan**. **Skip To Event**, **Buy A Day Pass**, **Why Did This
Happen?**, **Play It Out**. This is the one rule the player has asked for by
name, and it is applied without exceptions for articles or prepositions.

Real names are spelled the way the world spells them: **iQIYI**, **tvN**,
**Gold's Gym Venice**, **Île-de-France**. A place name from the gazetteer is
never re-cased.

## Prose: sentences

Descriptions, scene text, help, notifications, confirmations, errors and
dialogue are sentences: a capital to start, a full stop to end, and one
thought each. Sentence case inside them. Numbers under ten in words in prose,
figures in facts and tables. Money is always the ledger's figure, in the
account's currency, with cents where cents matter.

Prose says what happened, not what the interface did. "Fed. $24.60 from
Checking." rather than "Order successful!". No exclamation marks in system
messages; a character may use one if that is how they talk.

## Verbs that name the action

A control says what pressing it does: **Review Offer**, **Book Viewing**,
**Confirm Transfer**, **Buy A Day Pass**, **Move It To**. Not **OK**,
**Submit**, **Go**, **Continue** where a specific verb exists. A destructive
or committing action names its cost or its object: **Cancel Membership**,
**Pay $145.00 Now**.

A control that cannot be used says why, in a sentence, where it is: "Too
sore for that today. Easy or steady." A control that is not built does not
pretend: it is marked Locked and says Under Construction.

## Truth in the text

A preview is a preview, a quote is a quote, a pending payment is pending,
and a simulated figure is an estimate and says so. Nothing describes a
purchase, a relationship change or an outcome that a validated command has
not committed. A real name carries its provenance; an invented one is never
called real.

Where a figure comes from goes in one plain line at the foot of what it
explains, not in the middle of the sentence that uses it: "Source: the Yale
Bulletin, 2026–27. How often each class meets is estimated." Until 2026-10-17
this said a simulated price "is SLATE's calibration and says so", and the
prose said "SLATE's estimate", "SLATE's reading", "SLATE's design" and
"SLATE's own" inside its sentences, 208 times. A player knows the game is
SLATE; "estimated" says the same, and a published source is named as one.

## Pictures

The interface is text. No emoji on any tab, tile, breadcrumb, search result,
control or label, and no Unicode glyph standing in for a word, because a
symbol that is a picture on one platform and a box on another is not a
label, and a screen reader has nothing to say about it. The one picture the
game keeps is its own mark, the clapper, where it is the brand — the startup
sequence, the save slots, the creation header and the top bar — and never
inside an accessible name.

Status is a word or a chip: **Locked**, **Real**, **Pending**, **Saved**.
Weather is a word: **Cloudy**, **Storm**. Play and pause are the words Play
and Pause.

The weather keeps a picture beside its word, the one exception
(`WEATHER_EMOJI` in `systems/weather.ts`): it's the place a picture reads
faster than a word, and every forecast uses one. It never stands for the word,
and a screen reader is never given it (`aria-hidden`).
`tests/interface.test.ts` holds both. Brief 15's tutorial area reported the
picture on Home against this section's first paragraph. The code was right,
and this paragraph was missing until 2026-10-19.

## Voice

Narration is second person, present tense, plain. It knows what the
character knows and nothing else: no figures the character has not been
told, no names they have not met, no verdict on a stranger.

Characters keep their own voices. Editorial cleanup fixes spelling and
grammar in narration and interface text; it does not flatten how a person
talks. A trainer who says "Right. Squats." keeps saying it.

Prose contracts the way speech does. "You don’t have a job", "that isn’t
yours", "there’s nothing on today": the uncontracted forms read like a
form letter, and a sentence that never contracts is the single biggest
reason text sounds like a machine wrote it. The apostrophe is the
typographic one (’), which the rest of the prose already uses. The forms
English leaves alone stay alone: possessive "you have" ("you have $50"),
"it is" at the end of a clause ("that is what it is"), "you are" after
"who", "where", "as" or "than". Labels are not prose and are not
contracted. `node tools/voice-check.mjs` counts what is left, `--fix`
rewrites the safe cases, and `--check` holds the line in the gate.

Contractions are half of it. The other half is shape. A habit is fine
once and a tell nine times: a clause tacked on to explain what the
sentence just meant ("…, which is most of it"), an em dash and then a
restatement, "rather than" where "not" would do, a sentence opening on
"Nothing", "the whole point of it". `node tools/tics.mjs` counts nine of
them against a budget and prints every line it found; `--check` fails the
gate when one goes over. The budgets are deliberately not zero. Each of
these is good writing in small numbers.

The same tool watches how long lists begin. Eight hundred attribute
descriptions that all open on a gerund read as generated, however well
each one is written on its own, so any file with twenty or more lines of
prose where a third of them open on the same word fails the gate. Vary
the shape, not just the words: a plain noun phrase, a "you" sentence, a
question, a colon and the thing itself.

## Identifiers

Displayed labels are free to change; command kinds, entity ids, save keys,
schedule kinds and event names are not renamed to improve a label. A label
map (`LEGEND_BY_CATEGORY`, `GENRE_BY_ID`) sits between the id and the
screen.

## What holds it in place

- `tools/label-sweep.mjs` — every label string in the engine content is Title
  Case, including titles built from templates with the slots set aside
  (`--write` re-cases the plain ones). It fails the gate when a label slips.
- `tools/inventory.mjs --check` — every command, scene and route has a line
  in `docs/COVERAGE-MATRIX.md`, and the matrix's appendix matches the code.
- `npm run gate` — typecheck, lint, tests, then the label sweep, the dialogue
  check and the inventory check in one go.
- `tools/text-caps.mjs` — every screen at five widths: nothing clipped,
  crushed, cut off or bleeding; non-sentence text capitalised; words not
  broken in half; the calendar's modals included.
- `tests/interface.test.ts` — no emoji anywhere in the interface but the
  brand mark, and that never in an accessible name; every destination and
  tab label in plain Title Case words.
- `tests/cohesion.test.ts` — duplicates, repeats, wiring and casing across
  the tree.
- `tools/voice-check.mjs` — every string the game shows, counted for the
  places a person would have contracted and did not; `--fix` rewrites the
  safe ones, `--check` fails the gate over budget.
- `tools/tics.mjs` — the same strings, counted for nine stock shapes against
  a budget each, and for a long list where one opening word does too much of
  the work; `--counts` for the totals alone, `--check` fails the gate.
- `tools/cohesion-walk.mjs` — the game as a person meets it, in a browser:
  startup, the slots, creation end to end, Home, every rail destination and
  every tab behind it, the calendar's plan form, then Save & Exit and back in.
  Page errors, leaked `undefined`s, a rail that marks the wrong screen, a
  covered control or a save that does not come back all fail it. A walk that
  cannot get past a step reports that step and stops, rather than reporting
  the five screens it never reached as broken.
- `tools/text-inventory.mjs` — every string the game can show, found in the
  source and grouped into the sources a writer reviews, each with its status
  in `docs/text/statuses/`, recorded against a hash of its text, so a
  source changed since it was read counts as Pending again
  (`docs/text/INVENTORY.md`). It also counts engine-speak, the internal words
  this guide keeps out of the player's sight, against `docs/text/engine-speak.json`,
  whose counts may fall and may not rise. `--check` in the gate fails a new
  source no status names, and a rise in engine-speak (from 2026-10-17). From
  the end of brief 14 the same day, once every source had been read, it also
  fails a source that's Pending: one whose words changed since it was read.
  Until then Pending was counted and allowed while the areas worked. So a
  change to anything a player reads is read again and marked in the same
  commit: `--mark <source> "<status>" --by <area> --reason|--evidence …`.
  From brief 15 (2026-10-19) every source is read again in a second pass,
  with statuses of its own in `docs/text/second-pass/` (Rewritten, Retained,
  Pending, Blocked) and the first pass kept as history. `--mark2` records one,
  only by the area that owns the source, and refuses a reason that isn't
  specific. A source counts as read when either pass matches its words. The
  coordinator closed the second pass at brief 15's end
  (`docs/text/second-pass-closed.json`). Since then `--check` fails a source
  the second pass hasn't read, so a change to anything a player reads is read
  again and marked with `--mark2` in the same commit. The inventory also holds
  the page's title and description in `index.html`, the holiday names under
  `public/holidays/`, and, from brief 15's cross-area review, a citation that
  begins with a web address (a bare address isn't words, and stays out).
- `tools/text-omissions.mjs` — what a walk of the built app shows, line by
  line, against the inventory: held by it, in a file it doesn't read (an
  omission), or built from values by a template. From brief 15, to check the
  inventory covers the game, not just the code it was built from.
- `tools/guide-quotes.mjs` — every sentence the guide quotes in curly quotes,
  five words or more, found in what the game says outside the guide; a quote
  built from parts counts where each stretch between the parts is said whole.
  `--check` fails the gate on a quote the game no longer says (from
  2026-10-17, brief 14, when 74 of 595 had gone stale as the areas rewrote
  their words).
- `tools/tutorial-routes.mjs` — every label a tutorial names, found on a
  screen of the built app or in the game's code. It reads a walk of the built
  app (`tools/text-walk.mjs`), so it isn't in the gate. Run it after a walk,
  whenever a tutorial's route or a screen's labels change.
- `tools/text-render-check.mjs` — what a walk or a played journey shows,
  read for the faults a sentence built from parts can have: a leaked value,
  doubled punctuation, a raw id, a plural that disagrees with its number, a
  fragment. `tests/language-dynamic.test.ts` reads the game's generators with
  the same rules, across each of brief 14's dynamic cases, in the gate.
- `tools/doc-refs.mjs` — every file path a doc names, checked. This section is
  a promise about what is enforced, and it had gone partly false: it named a
  fuzzer and two test files that had been deleted. `--check` fails the gate.
