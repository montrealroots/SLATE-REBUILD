# Handoff

Layer in progress: 0

Where the rebuild stands, kept current at every checkpoint so an interrupted session resumes rather than restarts.
Read `CLAUDE.md` first.

## Where the build stands

- Branch `claude/quirky-gauss-gnub7q`, restarted from `main` at `25fe912` after the owner merged the rules. Nothing is
  deployed. The owner pulls and merges after each layer.
- The development tools are set up (`tools/setup/README.md`; `bash tools/setup/verify.sh` reports each one).
- 1221's rules, then SLATE's, are in `CLAUDE.md` and `.claude/rules/`, with `docs/STYLE.md` and `docs/GLOSSARY.md`,
  without SLATE's one-agent rule or 1221's Base44 deployment. Layer 6 (the voice) is dropped (2026-11-02).
- Layer 0 (the repository and the gate) is built. It is proven when a green full gate (`npm run gate:full`) on a
  committed tree, in a fresh clone, is recorded in `registry/layers.json` (layer, commit, date, evidence) in the
  commit after it. Layers 1 to 7 have not started; the gate refuses code in a layer until every layer under it is
  recorded proven.

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
- With layer 1's `core.text`, before the first label is drawn: title-case and label-sweep (SLATE's one title-case
  check, which reads the rule from `core.text`'s own code); plural-check, voice-check, tics, spelling and typos
  (checks of the catalog's lines, built with the catalog).
- With layer 2's gazetteer: geo-check (the place axis and the all-places test).
- Not brought: devmap, traceability, capabilities, inventory, student-matrix and guide-quotes held 1221's own
  documents (its dev map, its capabilities list, its catalogs, the school's student matrix, the guide's quotes); the
  School, the tutorial and the manual are out of the first build, and the rest is held by the matrices above.

## Next step

1. Commit layer 0, run `npm run gate:full` in a fresh clone of the committed branch, and record the proof in
   `registry/layers.json` and this file (layer 1 then in progress), in the commit after it.
2. Push the branch and read the CI run of the full gate.
3. The owner pulls and merges, then picks what comes over in layer 1 (the core).

## Verification evidence

- `npm run gate` on the working tree before the layer-0 commit: see the commit's `Gate:` trailer.
- The proof run is recorded here and in `registry/layers.json` when it is made.

## Assumptions

- Node 22.23.4 is pinned, the version this session runs and tests on, not SLATE's 22.22.0; both satisfy the engines
  range SLATE set (`>=22.13.0 <23`).
- The place axis is held to 171,654 (SLATE's owner ruling of 2026-10-26: "Use today's GeoNames release, keep going"),
  not the 170,911 `CLAUDE.md` names, the first SLATE's snapshot; the count is decided again by the GeoNames release
  the rebuild's gazetteer reads, in layer 2.
- `registry/voice.json` keeps SLATE's banned patterns (the engine's vocabulary out of the player's sight), sourced to
  `CLAUDE.md` and `docs/STYLE.md`.
- `registry/pages.json` is empty: SLATE's pages were decided in its own documents, which are not here; each page is
  registered when the owner brings its screen over, in layer 5.

## Blockers and open issues

- None for layer 0.

## Questions for the owner

- The place count: `CLAUDE.md` says 170,911 places; SLATE's later ruling replaced it with "today's GeoNames
  release" (171,654 on 2026-10-26). The gate follows the later ruling until you say otherwise.
