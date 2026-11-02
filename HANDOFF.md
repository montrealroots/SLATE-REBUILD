# Handoff

Layer in progress: 1

Where the rebuild stands, kept current at every checkpoint so an interrupted session resumes rather than restarts.
Read `CLAUDE.md` first.

## Where the build stands

- Branch `claude/quirky-gauss-gnub7q`, restarted from `main` at `25fe912` after the owner merged the rules. Nothing is
  deployed. The owner pulls and merges after each layer.
- The development tools are set up (`tools/setup/README.md`; `bash tools/setup/verify.sh` reports each one).
- 1221's rules, then SLATE's, are in `CLAUDE.md` and `.claude/rules/`, with `docs/STYLE.md` and `docs/GLOSSARY.md`,
  without SLATE's one-agent rule or 1221's Base44 deployment. Layer 6 (the voice) is dropped (2026-11-02).
- Layer 0 (the repository and the gate) is proven: the full gate green in a fresh clone of the branch at
  `80e8d7438f9b`, recorded in `registry/layers.json` (2026-11-02). The owner merged it (`ac96497`) and the branch
  restarted from `main` there.
- Layer 1 (the core) is built: all six of SLATE's core engines, at the owner's word ("Every single one of them"). It is
  proven when a green full gate in a fresh clone is recorded in `registry/layers.json`. Layers 2 to 7 have not started
  (6 is dropped); the gate refuses code in a layer until every layer under it is recorded proven.

What layer 1 holds, ported from SLATE's core (`montrealroots/SLATE` at `acf1874`), changed only where a ruling or
today's sources say:

- `core.time` (`src/core/time`): the calendar's arithmetic, time zones compiled from IANA's tzdata as zic compiles
  them, sunrise and sunset by NOAA's method, local time. On tzdata 2026f (2026-10-27), not SLATE's 2026e: Cuba stays on
  -04 through 2027-11-07, and Brazil's 1965 and 1966 DST ends are corrected. Its signature is good from Paul Eggert's
  key; against 2026e only the Cuba and Brazil rule sets differ; zic's transition code is line for line the same
  (register R-0001, R-0003, R-0005). Every zone is held to zic and zdump, and to the ICU zones in Node (tz 2026e), where
  only America/Havana may now differ.
- `core.rng` (`src/core/rng`): SplitMix64 streams keyed by the life's seed and a named decider through FNV-1a 64. No
  decider is registered yet; each comes with the engine that reads it.
- `core.money` (`src/core/money`): amounts in whole minor units, ISO 4217's 155 currencies in use (list one of
  2026-09-17, byte for byte what SIX publishes today).
- `core.frame` (`src/core/frame`): a life's state, commands, scheduled kinds, the passing of time, notices.
- `core.text` (`src/core/text`): the text catalog (seven lines so far, the device store's) and Title Case.
- `core.persistence` (`src/core/persistence`): lives on this device only (the owner, 2026-11-02): IndexedDB with
  local storage behind it, gzip, a copy before every write. SLATE's Base44 server store, its backend functions and
  their catalog lines and coverage rows did not come over, nor the store's `where`, which nothing read without them;
  the schema version is pinned in one place. A life saved, opened and played on is tested on the frame alone
  (`tests/core/persistence/continue.test.ts`); SLATE's version played a layer 3 card, which comes back with it.
- Two checks join the gate: title-case (SLATE's, reading the rule from `src/core/text/case.ts`, with
  `registry/names.json`) and catalog-text (1221's plural-check, voice-check, tics, spelling and typos, over the
  catalog's lines: 27 countable nouns, 14 contraction rules at a budget of zero, 9 tics and lists that open alike at
  1221's density per line of prose, 150 British spellings with 142 real names left as written, 150 misspellings and
  doubled words). The tools that compile time zones and currencies come with their tests (`tests/tools/tzdb.test.ts`,
  `tests/core/money/money.test.ts`) and are mutation-tested; the USNO reader (`tools/research/usno-sun.ts`) is not.
- Research: all 27 register entries read again on 2026-11-02 at their sources, each dated so. Beside the tz release,
  every one says what SLATE read: the 108 USNO sun answers are identical, the ISO 4217 list is byte for byte the same,
  and the calendar, NOAA, SplitMix64, FNV-1a and Amendment 170 sources hold the figures the register cites.

What layer 0 holds, ported from SLATE's gate as it stood on 2026-11-02 (`montrealroots/SLATE` at `acf1874`), which
SLATE proved at a 100% mutation score:

- The toolchain, pinned exactly and matched in the lockfile, the same 88 package versions as SLATE's: TypeScript
  6.0.3, React 19.3.0, Vite 8.3.4, Vitest 4.1.12, ESLint 10.12.0 with typescript-eslint 8.71.1, Stryker 10.0.0, tsx
  4.23.15; Node 22.23.4 (`.nvmrc`); npm 11.6.2 (`packageManager`). `.npmrc` saves exact versions and holds the
  engines strictly.
- The owner's documents (`CLAUDE.md` and everything under `docs/`) locked by SHA-256 in
  `registry/owner-docs.lock.json`.
- The gate (`gate/`): `npm run gate` on every commit (`.githooks/pre-commit`; red stops the commit, and
  `.githooks/commit-msg` writes the verdict into the message as a `Gate:` trailer), `npm run gate:full` (adds the
  audit and mutation testing; proves a layer; `.github/workflows/gate.yml` runs it on every push, in a clean clone),
  and `npm run gate:write` (rewrites `matrix/`). Its checks, each with fixture tests that show it biting:
  - toolchain: every package exactly pinned, the tools the build order names present, the lockfile agreeing, npm
    and Node pinned, an override never a second spelling of a pin.
  - owner-docs: the owner's documents unchanged, and nothing joining `docs/` unlocked.
  - build-order: every source file in a layer; no layer started before the one under it is proven; proofs
    contiguous (a dropped layer passed over, and never proven) and at commits this branch carries; imports only
    downward, and never outside `src/`. New here: a layer can be dropped, with who dropped it and when
    (`registry/layers.json`, layer 6).
  - text-inventory: every player-facing line in the text catalog (from layer 1, `core.text`), each said somewhere in
    the source, none in the engine's vocabulary (`registry/voice.json`); placeholder wording is unfinished work from
    layer 7, since there is no voice layer to rewrite it in (SLATE held it from its layer 6).
  - research-register: every entry found (primary source, page, date read, value), secondary (naming the primary it
    quotes), blocked (all five methods tried and dated, and the line telling the player what isn't modeled), or the
    game's own figure (its reason and its label to the player); no fact held twice; no date after today.
  - typecheck, lint (SLATE's own rules: no raw text in JSX, every control names its feature, every value shown sits
    inside an element naming its feature; no `Math.random`, `Date.now` or `new Date()` in the app), tests.
  - feature-matrix: every feature on a page (`data-feature`), with `@slate:reads`, `@slate:bites` and
    `@slate:downstream` anchors resolved to file and line (downstream outside the files that draw it), and a passing
    falsifier (`tests/support/falsify.ts`) for the bite and the downstream effect, whose outcome is state, never a
    sentence.
  - effects: every command, scheduled kind and notice declared in `src/` registered with what it changes, read by a
    consumer anchored at a file and line (or awaiting a named later layer), and each command and kind falsified.
  - coverage: every engine declared with its matrices; one row per key of each axis, no more, no fewer; the country
    axis held to 252 and the place axis to its count; an engine that reads a place covers the country axis and names
    a passing test over every place; every row researched, proven, blocked or the game's, cited and held by a passing
    test, or pending (incomplete); every blocker cited by a row.
  - handoff: this file's sections, and the layer it names agreeing with the ledger.
  - doc-refs, new here, from `montrealroots/1221`'s `tools/doc-refs.mjs`: every file a doc names is there (this file, the README, the
    rules in `.claude/rules/`, the tools' docs; not the owner's locked documents, which name 1221's and SLATE's
    files). Its first run found two stale names in `.claude/rules/title-case.md`, now fixed.
  - generated: everything in `matrix/` exactly what the checks produce.
  - audit and mutation (full gate only): any known advisory red; Stryker over the gate's own code, static constants
    included, break threshold 100%.

1221's 23 gate checks, each placed (`CLAUDE.md`, Part 1, rules 6 and 7):

- Here now: doc-refs (as its own check); text-inventory and surfaces (the text inventory); effects, sweep and wired
  (the feature matrix and the effects check, which allow no unread declaration at all, so `montrealroots/1221`'s `docs/UNWIRED.json`
  ratchet has nothing to count: its count is held at zero); coverage and completion-matrix (the coverage
  matrices and the research register); deciders (the lint's ban on `Math.random`, and the seeded decider in
  layer 1).
- With layer 1's `core.text`, here now: title-case and label-sweep (SLATE's one title-case check); plural-check,
  voice-check, tics, spelling and typos (the catalog-text check). 1221's `typos.mjs` named punctuation slips in its
  header but held none, and voice-check's four stiff shapes were counted there and never failed it (the tics hold
  them), so none came over; nor did 1221's allowances, which named lines of its own files.
- With layer 2's gazetteer: geo-check (the place axis and the all-places test).
- Not brought: devmap, traceability, capabilities, inventory, student-matrix and guide-quotes held 1221's own
  documents (its dev map, its capabilities list, its catalogs, the school's student matrix, the guide's quotes); the
  School, the tutorial and the manual are out of the first build, and the rest is held by the matrices above.

## Next step

1. Run `npm run gate:full` in a fresh clone of the committed branch, and record layer 1's proof in
   `registry/layers.json` and this file (layer 2 then in progress), in the commit after it.
2. The owner pulls and merges layer 1, then picks what comes over in layer 2, the world: from SLATE, `world.gazetteer`,
   `world.map`, `world.clock`, `world.weather`, `world.holidays` and `world.prices`. With the gazetteer comes 1221's
   geo-check (the place axis and the all-places test), and the place count is set to the GeoNames release it reads.

## Verification evidence

- Layer 0's proof: `npm run gate:full` green in a fresh clone of the branch at `80e8d7438f9b`, after
  `npx -y npm@11.6.2 ci`: every check green; 225 of 225 tests; audit 0 advisories; mutation 100.00% (2,668 of 2,668
  mutants killed, static mutants included); 357 s.
- The full gate before it, at `b173964`, scored 99.89% (2,669 of 2,672), here and in CI run 1: three mutants
  survived (one equivalent in doc-refs, an ordering no test gave in effects, a key no test held absent in the
  layer ledger). `80e8d74` killed them; a mutation run over the three files killed all 571 of their mutants before
  the proof.

## Assumptions

- Node 22.23.4 is pinned, the version this session runs and tests on, not SLATE's 22.22.0; both satisfy the engines
  range SLATE set (`>=22.13.0 <23`).
- The place axis holds 171,654, SLATE's count from the GeoNames release of 2026-10-26, until layer 2's gazetteer reads
  its own release and the count is set to it (the owner, 2026-11-02: not the 170,911; "today's GeoNames release").
- `registry/voice.json` keeps SLATE's banned patterns (the engine's vocabulary out of the player's sight), sourced to
  `CLAUDE.md` and `docs/STYLE.md`.
- `registry/pages.json` is empty: SLATE's pages were decided in its own documents, which are not here; each page is
  registered when the owner brings its screen over, in layer 5.

## Blockers and open issues

- None for layer 0.
- CI's actions moved from v4 (Node.js 20, which GitHub had stopped running) to exact releases on Node.js 24, each
  confirmed in its own repository on 2026-11-02 at the owner's word: `actions/checkout@v7.0.1` (2026-07-17),
  `actions/setup-node@v7.1.0` and `actions/upload-artifact@v7.0.2` (both 2026-10-07). Every input the workflow uses
  is still there; checkout's v7 change (refusing fork code under `pull_request_target` and `workflow_run`) touches
  no trigger here; setup-node now caches npm's downloads itself; upload-artifact still zips by default.

## Questions for the owner

- None open. The place count was answered on 2026-11-02: not 170,911; today's GeoNames release (`CLAUDE.md`).
