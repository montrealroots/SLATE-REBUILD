<!-- The brief the research and integration agents of 2026-11-02 and 2026-11-03 were given (layers 2 and 3), kept for the next round: change the dates, the scratchpad path and the groups, and keep the rules. -->

# Integration brief: bringing 2026-11-03's research into layer 3

Repository: `/home/user/SLATE-REBUILD`. Read `CLAUDE.md` (the rules) first, then `gate/checks/register.ts` and
`gate/checks/coverage.ts` (what a register entry and a coverage row must hold). Research agents re-attacked every
layer 3 blocker today; their results are JSON files in
`<scratchpad>/research/b-*.result.json`, with downloads
under `.../research3/files/<group>/` (and the licence agent's per-entry copies under `.../research3/bl/res/`). They are
model output: verify every figure you use against the downloaded file or by fetching the page again yourself. Never
take one on trust.

## What you own, and what you don't

- You own your engines' files only (named in your prompt): data under `src/papers/<engine>/` or `src/money/<engine>/`,
  compilers under `tools/papers/<engine>/` or `tools/money/<engine>/`, research sources under
  `research/sources/papers/<engine>/` or `research/sources/money/<engine>/` (and `research/sources/person/ages/` for
  ages), coverage matrices `coverage/<engine>-*.json`, and tests under `tests/papers/<engine>/`,
  `tests/money/<engine>/` and `tests/tools/<engine>.test.ts`.
- **You do not edit `research/register.json`.** Write the entries you change, whole and gate-valid, to
  `.../research3/<your group>.register-patch.json`: a JSON array of complete register entries (an existing id replaced
  whole; a new fact gets a new id written `R-NEW-1`, `R-NEW-2`…, which the lead numbers from R-9684 up). If an entry
  must go (a blocker wholly replaced by a new found entry), list its id in `.../research3/<your group>.register-delete.json`.
- Do not edit `src/core/text/catalog.json`; if a player-facing line must change or be added, write it to
  `.../research3/<your group>.catalog-patch.json` (`{ id: { text, where, status: "placeholder" } }`) and say why.
  Player text is American English, contracted where a person would contract (the gate's catalog-text check).
- Do not run `npm run gate` or `npm run gate:write` (other agents work in the same tree at the same time, and the
  gate's run directory is shared). Run `npx tsc -p tsconfig.json --pretty false`, `npx eslint --max-warnings 0 <your
  files>`, and `npx vitest run <your tests>`; a test that only fails because the register lacks your patch is expected,
  so prove it on a scratch copy with the patch merged, as the layer 2 integrators did. If you change any code under
  `tools/` or `src/`, mutation-test it alone: `npx stryker run --mutate <your changed files> --tempDirName
  .stryker-tmp-<group>` and reach 100% (killed plus timeout over counted), with a `// Stryker disable next-line
  <Mutator>: <reason>` only for a mutant no input can tell apart.
- A coverage row moves from `blocked` to `researched` only when the fact is wholly found and the engine reads it; a
  fact found in part keeps the row `blocked` on what is still missing (the blocker entry says what was found, and the
  player-facing line still says what isn't modelled). A row's tests must pass.
- Every new source: `read: "2026-11-03"`; a primary where it is the government's or the institution's own, a
  secondary naming the primary it quotes.

## The lead's rulings (apply them)

- This round ran out of web searches partway (the session's allowance is shared). **An attempt not made is never
  recorded as made.** Append to a blocker only the attempts the result file shows were actually tried today, each with
  its method and dated 2026-11-03; where a method was not tried today, the earlier dated attempt stands and nothing is
  recorded for it. The owner ruled that a new session does the web-search pass later.
- A figure read from the institution's own channel (its site, its gazette, its own published document, its official
  social account) is primary. A government's page about another country (the US Social Security manual on Ghana's
  accounts, Russia's tax service on Tajikistan's numbers) is secondary only where it names the primary it quotes;
  otherwise it is a lead, recorded in the attempt, and the fact stays blocked. Press is secondary only where it names
  the decision or law it reports.
- A check-digit or key algorithm stands only where a primary states it. Where it was only worked out from real
  examples, keep the format (lengths and parts) and leave the check blocked, the entry saying so. Where the engine can't
  express an algorithm a primary states, extend the engine's code to express it and mutation-test it.
- A law not yet in force (Samoa's Credit Information Register Act 2026, awaiting the Minister's start date) is not the
  rule: the entry stays blocked and says what is coming. A figure in force for 2026 is kept; a change already enacted
  for 2027 is kept with its date where the engine holds dated rules, and recorded in the entry where it doesn't.
- Where an agent asked the lead to pick a reading (Latvia's licence fee with or without its issuing fee, the Cook
  Islands' learner age, Zambia's "adult" as the age of majority, the Vatican's staff hiring age as its working age, the
  Bahamas' film-work window), read the source yourself and take the reading the engine's own model and its existing
  files already use for other countries; where the source is genuinely ambiguous, keep that part blocked and say why.
- Eswatini's Act giving 20 and 25 (a drafting slip, by the agent's reading) is not held. A figure read "by eye" from a
  scan (Gabon's BGFIBank fee) is checked against the page image before use.
- Held figures found out of date (Azerbaijan's 2026 wage tax, Belgium's 2026 tax-free sum, North Macedonia's July 2026
  contribution split, Anguilla's levy, French Polynesia's 1% VAT, and every other `changed` in the result files) are
  updated from the primary, as errors found and fixed.

## Report

Under 300 words to the lead: each fact brought in (id, country, what changed in the data), each row whose status
changed, the patch files written, the commands you ran and their results (counts), mutation numbers if any, and
anything left undone or needing the owner.
