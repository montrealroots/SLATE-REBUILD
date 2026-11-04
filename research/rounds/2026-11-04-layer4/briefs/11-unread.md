# Layer 4: what the research found that the engines don't read yet, 2026-11-04

Repository: `/home/user/SLATE-REBUILD` at 7f80741. Read `CLAUDE.md`, `HANDOFF.md` (Next step 2 and 3, and the
Assumptions), `gate/`, `.claude/rules/`, `gate/checks/register.ts`, and the engine files of your group with their
tests and compilers. Three agents work at once, one per group below, on disjoint files.

## Inputs

The first wave's research results, `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/*.result.json`
(downloads under `l4w/files/<group>/`), and the register's current entries (`foundInPart` on each blocker names what was
found). They are model output: verify every figure against the saved file, the page image or your own fetch before it
goes in. The research rules bind you: primary vs secondary, a lead is not a fact, the law in force, verbatim reads, no
bot-check bypass, an attempt never recorded unless made (see
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/INTEGRATE.md`, "The rulings").

## Groups

**A, the director and the producer** (files: `src/person/directing/`, `src/person/producing/`, `tools/person/markets-director/`,
`tools/person/markets-producer/`, their research files `research/sources/person/markets/director-*.json` and
`producer-*.json`, coverage `coverage/markets-director-*`, `coverage/markets-producer-*`, `coverage/directing-*`,
`coverage/producing-*`, their tests):
- Azerbaijan's production rebate (25%, cap USD 1m, from USD 200k): the market is in AZN and the director's minimums are
  AZN; read the rebate's dollar terms at the day's rate (money.rates, as the UK play's €50m cap is read), keeping one
  currency a market.
- Canada's DGC 2026-28 Directors Schedule rates and Mexico's STPC director tabulator (MXN 469,033.48 a feature), held as
  `foundInPart`: bring them into the director's market where verified, closing or narrowing their blockers.
- The US Virgin Islands and the Northern Mariana Islands: the DGA's Basic Agreement binds its signatories there; let a
  market follow the DGA's terms if the sources hold it (read the Agreement's own territorial scope), else say why not.

**B, the actor** (files: `src/person/acting/`, `tools/person/markets/`, `research/sources/person/markets/<CC>.json`,
`coverage/markets-countries.json`, `coverage/markets-operations.json`, `coverage/acting-*`, their tests):
- Austria's stage minimums, Uruguay's union rate table, Ecuador's 2025 sectoral minimums, Israel's Hebrew Theatre
  agreement: bring each in where verified and in force, as the engine's agreements are held, closing or narrowing
  blockers.

**C, papers.work and the unread** (files: `src/papers/work/`, its compiler and research `research/sources/papers/work/`,
`research/sources/person/roles/*-calibration*`, `research/sources/person/identity/background.json`, the coverage for
them, their tests):
- The days one may work without a permit, as the permit research found: Latvia 14, Hungary 10, Uruguay 90, Iceland's
  four weeks against the 90 days held, Singapore's performing-artiste scheme having ceased. Read each in its primary
  (the permit research files `research/sources/papers/permits/<CC>.json` and `l4w/files/`), and correct papers.work where
  it is wrong, as an error found and fixed, past tense. papers.work is layer 3's, proven: change only what a source
  shows wrong, and keep its tests whole.
- Research figures only casting and spec sales read, now read by nothing: the actor's calibration audition counts,
  self-tape codes and booking-ratio blocker; the screenwriter's spec-market and query rates; the director's
  debut-to-second count if nothing reads it; R-4620's shares of parts by gender, age and ethnicity (check what still
  reads Sowa's categories); R-4622's spec deals by genre, wealth by occupation and writing programmes. Remove what
  nothing reads from the files, re-pin, and reword or retire the entries so they say nothing untrue (an entry wholly
  unread is retired).

## Output

Edit your group's files in the tree. **Don't edit `research/register.json`**: write each entry you change, whole and
gate-valid (sha256 re-pinned), to `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/out/<group>.register-patch.json`
(a plain array; a new fact `R-NEW-1`…), deletions to `<group>.register-delete.json`, catalog lines to
`<group>.catalog-patch.json`. Prove on a scratch copy with your patch merged (`python3 -I
/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/research3/merge3.py <dir>` run in the copy's root):
tsc, eslint on changed files, vitest on your engine's tests and the register check. Mutation-test any code file you
change alone with Stryker to 100% (`--tempDirName .stryker-tmp-<group>`, deleted after). Don't run `npm run gate`.
No commits, pushes, or edits to `HANDOFF.md`, `CLAUDE.md` or the owner's documents. Never stop processes by name.

## Report

Under 300 words: what each item became (in the engine, narrowed, or why not), errors fixed, entries patched, retired
or new, tests and mutation numbers, and anything for the lead.
