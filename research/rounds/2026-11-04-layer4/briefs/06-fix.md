# Layer 4: the own-productions follow-up, 2026-11-04

Repository: `/home/user/SLATE-REBUILD`, at 87a139d ("Make the four roles work on one production of the life's own;
remove casting and spec sales"). Read `CLAUDE.md`, `HANDOFF.md` (its Assumptions), `gate/`, `.claude/rules/`, that
commit's diff (`git show 87a139d --stat`, then the engines it touched), and the consumer anchors (`@slate:consumer`),
effects, deciders and catalog lines that read what you change.

## The owner's rulings (2026-11-04), in force

- No casting: the life acts only in its own productions. No spec sales: a script goes to the life's own production.
- Union minimum from budget. The four roles work on one production ("them 4 should work in cohesiveness"); quality is
  the equal blend of the four, hired roles at the game's standard.
- "Remove them (Recommended)": the actor's **Auditioning** attribute and **Camera's self-taping** part, which read
  nothing since casting went. (Leave the director's "Holding Auditions": a director holds auditions for the hired cast
  on the life's own production; check it is read, and if it isn't, report it rather than remove it.)

## What to do

1. **Remove the actor's Auditioning attribute and Camera's self-taping part** from `src/person/attributes/` (its JSON
   and whatever compiles or tests it), with everything that names them: research sources and register entries cited
   only by them (retire an entry wholly theirs; rewrite one that also stands on other things, saying nothing untrue),
   coverage rows, consumer anchors, the attribute counts any test or doc pins. Weights that summed over them are
   re-normalised so the engine's other readings don't move except by the removal; say what moved.
2. **The writers' compile's dead outputs** (`tools/person/markets-writer/compile.ts`, lines 30-36 say it): what waits for
   the first day of photography (`held`) and the option's terms (`option`) are compiled but read by nothing. Remove
   them from the compiled output (`src/person/work/markets.json`) and the compile, keeping the research files as they
   are (they are the record of what was read); the comment says in the past tense what went and why. Check whether
   `ITEMS`' `'option'` (what a market's research couldn't find) still tells the player anything true; if not, remove it.
3. **The director's pitching into financing**: since 87a139d the director's Communication "pitches the next film"
   (`src/person/directing/directing.ts` line 30) with nothing that reads it. Wire it as the writer's pitch is wired in
   `src/person/producing/producing.ts` (`pitch`, about line 391): where the life directs the production, the
   director's own pitch stands beside the producer's (and the writer's, where the script is the life's), equally. Pin it
   with a falsifier (the director's Communication raised, the financing's factor and its outcome move; not directing,
   it doesn't). Update the comments that describe the pitch.
4. **R-4622's headshot sources**: casting went, so the headshot rules and prices it cites are read by nothing. Remove
   those sources and the headshot part of `research/sources/person/identity/background.json` (re-pin the sha256),
   reword R-4622's `sought` so it says nothing untrue, and remove any coverage or catalog line left for headshots.
5. Sweep for anything else 87a139d left with no reader (a field, a flag, a line, a coverage row, a register fact): a
   word nothing reads is worse than none. Remove it, or report it if removing it would change a ruling.

Do **not** touch the series' or play's fund, credit, fee or release refusals in producing.ts: their research is being
done now by another agent; a later change wires it.

## Rules

- Other agents work only in scratch directories; you are the only one editing the tree. Don't commit, push, or edit
  `HANDOFF.md`, `CLAUDE.md` or the owner's documents. Touch `research/register.json` only for the entries this change
  retires or rewrites.
- Tests: every changed behaviour pinned, a falsifier for each new consumer link. Mutation-test every code file you
  change alone with Stryker to 100% (`npx stryker run --mutate <files> --tempDirName .stryker-tmp-fix`; a
  `// Stryker disable next-line <Mutator>: <reason>` only where no input can tell a mutant apart), then delete the temp
  dir.
- The machine is loaded: run focused vitest files while working, then `npm run gate:write` if generated files moved,
  then `npm run gate` (fast) at the end, reading its exit status from a file, never a pipe. A test that fails only by
  timing out under load: say so, never raise a timeout.
- Never stop processes by name (`pkill`, `killall`); stop only your own, by PID.

## Report

Under 350 words: what was removed (attributes, parts, outputs, sources, entries) and what moved because of it, the
director's pitch wiring and its falsifier, anything else swept, register entries retired or rewritten, tests and
mutation numbers per file, the gate's result with its numbers, and anything for the lead. Write the commit message
(what was decided and why, full prose) to `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/fix-commit.txt`.
