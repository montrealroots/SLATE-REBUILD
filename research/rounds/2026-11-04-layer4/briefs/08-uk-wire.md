# Layer 4: a series and a play, made in the UK, 2026-11-04

Repository: `/home/user/SLATE-REBUILD` at 362233c. Read `CLAUDE.md`, `HANDOFF.md` (its Assumptions and Next step 1),
`gate/`, `.claude/rules/`, then `src/person/producing/producing.ts` whole, the directing, acting and work engines where
they read a production's format, and their tests (`tests/person/producing/`, `tests/support/production.ts`).

## The owner's rulings in force

Own productions only; the four roles on one production ("them 4 should work in cohesiveness"); any roles, at least
one, the others hired at the game's standard; own script or optioned material; **"Films, TV and stage"**; quality the
equal blend of four. Today a series' or a play's plan has no fee or credit and its fund and release are refused, and a
play can't be directed or written by the life, because none of it had been researched. The UK's has now been.

## The research

`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/tvstage.result.json` (nine items, each
with its sources, verbatim `said`, saved file and sha256 under `l4f/files/`, and attempts). It is model output: check
every figure you use against the saved file (or the page image) before it goes in. The lead checked the files' hashes;
table quotes were taken as the PDFs print them, so read them in the PDF, not only in `pdftotext -layout`.

## What to build (the UK, the engine's home market)

Decided by the lead; where you find a reading the sources won't bear, say so and do the honest thing instead.

1. **A series' credit**: the Audio-Visual Expenditure Credit (CTA 2009 s.1179DV and the sections the result cites): 34%
   for high-end television, 39% for animation (the genre engine's animation); paid on the share the Act counts (the
   lower of 80% of core costs and UK core costs, as the film's credit already reads its own); high-end only where core
   costs reach £1m per hour of slot length (an hour episode an hour, a half-hour episode half) and each episode is over
   20 minutes; animation without the threshold. Below it, no credit, told.
2. **A series' fund**: no UK-wide public fund backs a drama series (the BFI's Global Screen Fund takes television only in
   animation or documentary; the nations' agencies are by nation, and a production here names no nation). Refused,
   told in the player's words; record the absence only as what the read texts cover.
3. **A series' fee cap**: none is published (the BBC's tariffs fold a production fee into the price "in line with the
   Terms of Trade" with no level), so none, as for a film where no funder caps it; told as unknown.
4. **A series' release**: offered to broadcasters once shot. How often an independently financed series is picked up
   isn't counted by any source: the chance is the game's own (person.producing.model, told), moved by the series'
   quality and the producer's sell skill as the film's release is. What the pick-up pays, if anything reads it, is the
   BBC's published tariff per hour for its cost band; if nothing would read it, don't hold it.
5. **A play's credit**: Theatre Tax Relief (s.1217K and the sections cited): 45% touring, 40% otherwise, from 1 April
   2025, on the lower of UK core costs and 80% of core costs, with the cap the Act sets. A play names whether it tours.
6. **A play's fund**: Arts Council England's National Lottery Project Grants, £1,000 to £100,000, at its published
   success rate (29.4% in 2024/25, across art forms; held at second hand as the result says, so the register entry is
   `secondary` naming its primary, or found if you can read ACE's own report). The award is what the plan asks, at most
   £100,000.
7. **A play directed by the life**: lift the refusal. The stage director's minimum: subsidised theatre by its grade
   (UK Theatre / Equity, MRSL grades 1-3, from 6 April 2026) or the West End by seating (SOLT / Equity, categories A-C,
   from 6 April 2026). A play names its theatre (subsidised and its grade, or West End and its category), and the
   actor's stage agreement must be the theatre's (UK Theatre's for subsidised, SOLT's for the West End, as the acting
   engine's STAGE agreements already split them).
8. **A play written by the life**: lift the refusal where an agreement covers the theatre: the UK Theatre / WGGB
   commission by grade (part an advance against a royalty of at least 8%), the ITC's for a play over 70 minutes. No West
   End writers' agreement was found: writing a West End play is refused, told. The script's forms gain a play.
9. **A play's run**: it opens once rehearsed and staged (the life's own production); how often a run recoups or is
   extended isn't counted for the UK (the Broadway figure in the result is another country's, a lead here): the
   chance of recouping is the game's own, told, moved as the film's release is.

Everything downstream reads the new as it reads a film's: the producer's record, the unions' credits, permits (a
touring play's days abroad aren't in scope: UK only), tax and accounts, youth. The other markets keep refusing a
series' and a play's fund, credit and release, told, until their research is done.

Register: new facts (person.markets.producer.GB.series, ...stage, or the shape the engine's facts take; decide and say)
cite the research's sources with the date read (2026-11-04), sha256 of each saved file kept beside the research file
you write under `research/sources/person/`. Blockers for what wasn't found (the pick-up and recoup rates, the series
producer fee, the West End writers' minimum, Northern Ireland Screen's terms) with today's attempts as the result
records them, never one not made. Catalog lines (`src/core/text/catalog.json`: American English, contracted, Title Case
on labels, the catalog-text check) for each new refusal or reading the player meets; the text inventory marked.

Coverage, effects, consumer anchors, deciders, the feature-to-effect matrix updated; read, bite, downstream for every
new field: a field nothing reads is removed.

## Rules

- You are the only one editing the tree. Don't commit, push, or edit `HANDOFF.md`, `CLAUDE.md` or the owner's documents.
- Tests: every changed behaviour pinned, a falsifier for each new consumer link (change the input; the outcome
  changes). Mutation-test every code file you change alone with Stryker to 100% (`npx stryker run --mutate <files>
  --tempDirName .stryker-tmp-wire`; a `// Stryker disable next-line <Mutator>: <reason>` only where no input can tell a
  mutant apart), then delete the temp dir.
- Focused vitest while working; `npm run gate:write` if generated files moved; `npm run gate` at the end, its exit
  status read from a file, never a pipe. A test failing only by timing out under load: say so, never raise a timeout.
- Never stop processes by name; stop only your own, by PID.

## Report

Under 400 words: what a series and a play now do at each step, what stays refused and why, register entries added,
catalog lines, tests and mutation numbers per file, the gate's numbers, and anything for the lead. Write the commit
message (decided and why, full prose) to
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/wire-commit.txt`.
