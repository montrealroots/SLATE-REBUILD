# Bring layer 4 over: the person, 2026-11-04

Repository: `/home/user/SLATE-REBUILD` (branch `claude/quirky-gauss-gnub7q`, restarted from `main` at `88256bf`, layers
0 to 3 proven). Source: SLATE at `/home/user/montrealroots/slate` (`acf1874`). Read `CLAUDE.md`, `HANDOFF.md`,
`registry/layers.json`, `gate/` (every check, and `gate/checks/layers.ts` on where a layer's files go) and
`.claude/rules/` first.

The owner's word (2026-11-04): all ten of SLATE's layer 4 engines come over: identity, attributes, acting, directing,
producing, work (the screenwriter), genres, unions, permits and youth (`src/person/*` in SLATE).

## How layer 3 came over (do the same)

Read `git show --stat --format='%B' 0d88140` in the rebuild: layer 3 came over as SLATE wrote it, with its compilers,
research sources, coverage matrices, register entries, catalog lines, deciders and effects, and was changed only where
the rebuild's checks or its own history required; the commit says each change. Layer 4 is the same: copy each
engine's files from SLATE (its `src/person/<engine>/`, its compiler under `tools/` — permits compiles from
`tools/papers/permits`; find each engine's compiler from its build script and SLATE's `package.json` — its research
under `research/sources/`, its coverage under `coverage/`, its tests under `tests/`, any plan or map its code reads
such as `workbench/plans/attribute-map.json`), its register entries (every fact the engine and its coverage cite:
`person.*` and `papers.permits.*` and whatever else they name), its catalog lines (`src/core/text/catalog.json`), its
deciders, its commands and effects, and its rows in the feature-to-effect matrix and in `docs/`.

## Where the rebuild differs from SLATE (reconcile, never overwrite)

- Layers 2 and 3 were read again and corrected on 2026-11-02 and 2026-11-03: the rebuild's world, papers and money
  data, research files and register entries are newer than SLATE's. **Never copy a SLATE file over one the rebuild
  already has**; where a layer 4 engine reads a layer 3 engine (youth reads the ages research, `research/sources/
  person/ages/` and `src/papers/ages/`; permits beside `papers.work`; acting, directing and producing pay through the
  accounts and tax engines; means and family), adapt it to the rebuild's current shape and figures, and say so.
- Register ids: SLATE's own ids stand as SLATE wrote them; the rebuild's new ids are R-9680 up (highest now R-9756).
  Check every id you bring is free here or is the same fact; any clash gets a new id above the register's highest,
  renumbered in every file that cites it.
- The layer 3 port took out five consumer anchors in accounts and tax that named layer 4's commands
  (`acting.perform`, `directing.prep`, `script.pitch`, `producing.shoot`, `youth.release`): put them back once the
  commands exist.
- The owner's rulings stand over SLATE's code: no military service is read (`tools/papers/ages/compile.ts`);
  Slovakia's simple form; the family means' income is now scaled by national accounts (`src/money/means/`,
  `aboutIncome`); player text is American English, contracted, Title Case on labels (`.claude/rules/title-case.md`),
  and the catalog-text check's rules. Items out of the first build (`CLAUDE.md`, Part 2): if SLATE's layer 4 holds one
  (the career engine, dispositions, traits, the body, meals, energy, readiness), say so and ask the lead before
  bringing it.
- Every place test runs over today's 171,750 places.

## Rules

- You are the only agent editing the tree; the lead holds git and `HANDOFF.md`. Don't commit, don't push, don't edit
  `HANDOFF.md` or `CLAUDE.md` or the owner's documents (`npm run lock:owner-docs` is the owner's only).
- Done is `npm run gate` green (fast). Read its exit status from a file, never a pipe:
  `npm run gate > /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/gate.txt 2>&1; echo "exit=$?" > /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/gate-exit.txt`. Run `npm run gate:write` for the
  generated matrices. Don't run `gate:full` (CI proves the layer). Code you change from SLATE's (not copied as is) is
  mutation-tested alone with Stryker to 100% (`npx stryker run --mutate <files> --tempDirName .stryker-tmp-l4`); delete
  the temp dir after.
- Comments and docs keep the project's voice: what was measured, changed and why; what is no longer true in the past
  tense. A comment your change falsifies is part of your change.
- Never stop processes by name.

## Report

Under 400 words: what came over (engines, files, register entries, catalog lines, commands, effects, deciders), each
change from SLATE and why, every id renumbered, the gate's numbers, mutation numbers for changed code, and anything for
the lead. Also write the commit message you'd give it (what was decided and why, in the style of `0d88140`) to
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4/commit-message.txt`.
