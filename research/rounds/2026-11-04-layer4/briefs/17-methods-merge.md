# Layer 4: the methods round into the register and the engines, 2026-11-04

Repository: `/home/user/SLATE-REBUILD` at 96aff27, with the **uncommitted** series-and-play integration in the tree (do
not revert, stash or reset anything; read `research/rounds/2026-11-04-layer4/README.md` and HANDOFF's "Resume here").
Read `CLAUDE.md`, `gate/checks/register.ts`, your engine's compile, coverage and research files, and
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/INTEGRATE.md` (the contract between the
engines and the rulings, which hold for you unchanged).

The gate is red on two things: producer blockers (`person.markets.producer.blocked.<CC>.tvstage`) short of methods,
and director rows pending (no stage director's minimum, no blocker). The methods round (brief
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/METHODS.md`) made the missing attempts:
`l4t/m1..m20.todo.json` (what each group was to do) and `l4t/m1..m20.result.json` (what it did: per country,
`producer.attempts`, `stage` attempts by item, `found`, `notSearched`, and earlier attempts it **named** rather than
repeated, under keys like `stageExistingAttempts`, `priorStageAttempts`, `stagePriorAttemptsNamed` or in `notes`: those
are in `l4t/t1..t8.result.json` and `l4t/u1..u25.result.json`, a country's `attempts` with the `items` they covered).
Downloads under `l4t/files/m<n>/`. All of it is model output: verify every figure against the saved file.

## What to do, for your role's items (in your prompt)

1. **Attempts into blockers.** For each country and each of your items still without terms in your engine: collect
   every attempt actually made on it (the methods round's, and the named earlier ones from t/u, copied whole: method,
   tried, result, date), drop any that weren't made (a refused search, "not tried"), and write them into your role's
   blocker for that country: append to it where it exists (extending its `sought` to name what the item seeks, saying
   nothing untrue), or create it where none exists (`id` R-NEW-n, `fact` your role's blocker key, `sought`, `status`
   "blocked", `notModeled` your engine's unknown line, `attempts`). A blocker stands only with all five methods: where
   one is still missing (a search that never ran; the round's `notSearched`), list it in your report, don't invent it.
2. **What was found.** Each `found` entry for your items: read it in its saved file. A real minimum or term in force,
   from a primary (or a secondary naming its primary), goes into your engine as the integrators of the series and
   play did (research file, compile, coverage, tests), and that item is then no blocker. A partial, a lead, one
   institution's posts or prizes (not a market's minimum), a statutory minimum wage that its text doesn't apply to the
   role, a recommendation, an expired agreement: goes into the blocker's `foundInPart` with its source, and the item
   stays blocked. A general minimum wage applies to a role only where the wage law covers that kind of work and the
   research shows it; say which.
3. **Rulings the lead made on reads:** an institution's own document served with no challenge counts, even where its
   address was learned from an archive (Iași); a state's own open-data interface counts (Austria's RIS OGD, France's
   DILA); a law database's copy is secondary; SACD's "en France en dehors de Paris" doesn't by itself reach an overseas
   territory (a lead).

## Output

Edit your engine's files in the tree. **Don't edit `research/register.json`**: write each entry you change, whole and
gate-valid, to `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/outm/<group>.register-patch.json`
(a plain array; new ids `R-NEW-n`), deletions to `<group>.register-delete.json`, catalog lines to
`<group>.catalog-patch.json`. Prove on a scratch copy of the tree with your patch merged
(`python3 -I /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/research3/merge3.py <dir>` in the
copy's root; copy the tree, uncommitted changes included, with `cp -a`, not `git clone`): tsc, eslint on changed
files, vitest on your engine's tests, and the register check showing none of your blockers short of a method. Stryker
on any code file you change, alone, to 100% (`--tempDirName .stryker-tmp-<group>m`, deleted after). Don't run
`npm run gate`. No commits, pushes, or edits to `HANDOFF.md`, `CLAUDE.md` or the owner's documents. Never stop
processes by name. Never raise a timeout. If the session nears its end, write what you have to your patch file first.

## Report

Under 250 words: blockers extended and created, items wired in (country, item, value, source), items still short of a
method and why, entries, tests and mutation numbers.
