# Layer 4: own productions only, 2026-11-04

Repository: `/home/user/SLATE-REBUILD`. Read `CLAUDE.md`, `HANDOFF.md` (its Assumptions: "Own productions only"),
`gate/` and `.claude/rules/` first, then the layer 4 engines in `src/person/` with their tests and the consumer anchors
(`@slate:consumer`) and effects that read them.

## The owner's rulings (2026-11-04)

1. "Remember there is no casting because we're going to be in our own film if we every act." An actor plays only in a
   film the life itself produces or directs. No breakdowns, no submissions, no auditions, no booking by others.
2. "Remove spec sales too." A script is written for the life's own productions; it is never sold or optioned to
   another production. The screenwriter's pitching and selling to others goes.
3. "Union minimum from budget." A part the life plays in its own film is paid from that film's budget at the union's
   minimum for the part (the agreement and term the acting engine already reads from the markets research), through the
   production's accounts, tax and union rules, as it would pay any cast member.

## What to do

- Rebuild the acting engine (`src/person/acting/`) around playing a part in one's own production: the part comes from
  the life's own project (producing or directing: read how those engines hold a project and its stages), the actor's
  craft and attributes still decide how well it's played (the owner's ruling of 2026-10-31: the attributes decide the
  quality of the work), and the pay is the union minimum for the part from the project's budget. Delete the casting
  machinery (breakdowns, submissions, headshots, auditions, the booking chance, person.casting's game reading) and say
  in the past tense what was removed and why.
- Remove spec sales and selling to others from the screenwriter's work (`src/person/work/`, `career.ts` and wherever
  else): a finished script goes to the life's own production. Keep what still bites (writing, revision, the documents,
  networking where it leads to the life's own production's needs; drop what has no consumer left).
- Every engine that read the removed machinery reads the new: unions (parts played, scripts sold: a union's route that
  rests on selling a script to another now rests on a credit in one's own production, where the union's own rules allow
  it; where they don't, say so and keep the route blocked or not modelled), permits (work abroad counted from parts the
  life plays in its own productions abroad), tax and accounts (the performance fee now flows from the life's own
  production budget to the life as actor: model it so the money is not counted twice, and the tax engine taxes what the
  law taxes), youth (a minor in their own production). Update the consumer anchors, effects, deciders, the
  feature-to-effect matrix, coverage and the catalog lines (American English, contracted, Title Case on labels, the
  catalog-text check) to match; retire any register entry that only the removed machinery cited (a `game` reading for
  casting or the booking chance), recording in its place nothing that isn't true.
- Read, bite, downstream: every remaining feature must still read real state, change it, and be read by something that
  changes an outcome. A flag or command left with no consumer is decoration: remove it.
- Tests: every changed behaviour pinned, with a falsifier for each new consumer link. Mutation-test every code file you
  change alone with Stryker to 100% (`npx stryker run --mutate <files> --tempDirName .stryker-tmp-own`; a
  `// Stryker disable next-line <Mutator>: <reason>` only where no input can tell a mutant apart), and delete the temp
  dir after.

## Rules

- Other agents are doing research in scratch directories only; you are the only one editing the tree. Don't commit,
  push, or edit `HANDOFF.md`, `CLAUDE.md` or the owner's documents. Don't touch `research/register.json` entries other
  than the ones this change retires or rewires; research agents' results will be merged later.
- The machine is heavily loaded: run focused vitest files while working, and `npm run gate` (fast) at the end, reading
  its exit status from a file, never a pipe. If a test fails only by timing out under load, say so; don't raise a
  timeout.
- Never stop processes by name.

## Report

Under 400 words: what was removed, what the acting and work engines now do, how each reading engine changed, the pay
path (budget to the actor, accounts and tax), register entries retired, catalog lines changed, tests and mutation
numbers, the gate's result, and anything for the lead. Write the commit message (what was decided and why) to
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4/own-commit.txt`.
