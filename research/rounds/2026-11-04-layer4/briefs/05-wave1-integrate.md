# Layer 4's integration, 2026-11-04

Repository: `/home/user/SLATE-REBUILD`. Read `CLAUDE.md`, `HANDOFF.md` (its Assumptions: the owner's rulings of
tonight, own productions only, the four roles as one), `gate/checks/register.ts` and `gate/checks/coverage.ts` first.

## Your inputs

- The research agents' results, every one for your engine's ids: `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/{m1..m8,m6b,a1,a2,p1,p1b,p1c,p2,p2b,p2c,s1,
  f1..f12}.result.json`, downloads under `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/files/<group>/`. An id may appear in several files (a first-wave
  result and a follow-up's): **merge their attempts and sources**. They are model output: verify every figure you use
  against the saved download, the page image, or your own fetch. Never take one on trust.
- The re-read's unmatched sources for your engine's found and secondary facts: `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/review.json` (id → sources,
  each with its index, URL and the script's verdict: partial, absent, unreachable, http-error, fetched; the script's
  copy is `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/dl/<file>` and its text `<file>.txt`). Read each by hand: **same** (re-date it 2026-11-04),
  **moved** (cite the institution's new address, `said` verbatim), **changed** (correct `said` and every figure the
  file and the data hold from it, as an error found and fixed, the note saying what was and is, past tense), or
  **unreachable** (keep the old date, note what was tried; the fact stays found on its earlier read unless a source
  now contradicts it).

## What you own

You own your engine's files only (named in your prompt): its research under `research/sources/...`, its compiler and
data, its coverage `coverage/<engine>-*.json`, its tests. **Don't edit `research/register.json`**: write every entry you
change, whole and gate-valid (its value's sha256 re-pinned to the file you wrote), to
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/out/<group>.register-patch.json` (a plain JSON array). A new fact gets a new id `R-NEW-1`, `R-NEW-2`…; an entry
to delete goes in `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/out/<group>.register-delete.json`. Don't edit `src/core/text/catalog.json`: player lines to
add or change go in `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/out/<group>.catalog-patch.json` (`{ id: { text, where, status: "placeholder" } }`). The own-productions
rebuild is committed (87a139d, 08e2de3): build every entry you write from the register **as it stands now** at HEAD, not
from a result file's copy (R-4611, R-4615, R-4617, R-4622, R-4623, R-5212, R-5218 and R-5226 were rewritten; R-5213,
R-5216 and R-4624 were retired: write nothing for a retired id, and drop an option-only finding, since the writers'
compile no longer holds options or what waits for photography). Six integrators work at once, one per engine: don't touch
another engine's files or any `src/person/**/*.ts` but your own engine's, and for permits touch only its research and
data, not `permits.ts`. The producer's series and play terms are being wired separately: the producer's integrator
touches no series or play logic.

## The rulings

- **An attempt not made is never recorded.** Some result files list a method with "not tried today" or "none made
  today": that is not an attempt; record only attempts actually made, each under the method it was.
- Status: `found` only when every figure the engine holds stands on a primary you verified; `secondary` names its
  primary (`quotes`); a blocker stays blocked with today's attempts and a `foundInPart` for what was found. A coverage
  row moves from blocked to researched only when the fact is wholly found and the engine reads it.
- **Primary**: the institution's own channel, a state body's copy of the law, an image of the gazette's own page, an
  archived copy of any of these, the French state's open data (DILA), the state's open labour registers (Mexico's
  CFCRL). **Secondary**: a legal information institute's copy, a law database (Jogtár, qanoon.om, Justia, WIPO Lex's
  re-typed texts), an aggregator, a union federation's summary, press naming what it reports. A secondary with no
  address for its primary is a lead.
- **A lead, not a fact**: a draft, bill or law not in force (Suriname's new Civil Code until its start date; a draft
  fund regulation); press with no address; a search snippet; a figure counted from a directory (cities from addresses);
  an inference no text states (the French agreement reaching Guadeloupe or Réunion by the Constitution alone; Martinique
  and Mayotte stand, the labour code naming them); a general administrative ceiling standing in for a stated time
  (Chile's 6 months).
- **What is in force**: the law outranks a page; an official page older than a change a current source reports isn't
  the rule; a rule enacted for 2027 is kept with its date where the engine holds dated rules, recorded otherwise.
- **An absence stands as found** only where the primary that would hold it was read whole and is silent, and only as
  what that text covers (Uruguay's agreement names no director or writer: it sets them no minimum; that doesn't show no
  minimum exists elsewhere). Monaco's Law 629, if read whole, stands for "no union step".
- **Pages read**: a page a normal browser receives with no challenge counts (Denmark's film institute); a challenge got
  past, even one a browser passes on its own, doesn't; a page reached through another route to avoid a block doesn't
  (Qatar's Al Meezan API: hold it only if it is the site's own public interface served with no challenge); a page read
  only over plain http doesn't (Zambia's).
- **Errors to fix where they're yours**: the Czech actors' union fee is CZK 250, not 25; Montenegro's rebate is up to
  35%, not 25%; France's and Saint-Barthélemy's card decision is 90 days extendable by 30, not 4 months; Australia's and
  Christmas Island's 408 processing is 40 days, not 47; Pakistan's fund is PKR 1 billion; Chile's law is idNorma 1096099;
  the Zambian Arts Council is arts.gov.zm (nac.org.zm is the National AIDS Council); filmfiji.com now serves an
  unrelated site, so every source on it is re-checked; Latvia's immigration law was replaced on 15 September 2026;
  Kosovo's 03/L-136 was repealed by 04/L-219; Azerbaijan's and Mauritius' permits as the s1 agent found; the Isle of Man
  wage of £12.86 from April 2026; Kosovo's Cinematography Centre bands are what it funds, recorded as such, not a legal
  minimum.
- Military service isn't read. Never get past a bot check. Never stop processes by name.

## Checks

Run `npx tsc -p tsconfig.json --pretty false`, eslint on files you change, vitest on your engine's tests; prove on a
scratch copy of the repository with your patch merged (`python3 -I /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/research3/merge3.py <dir>` merges a patch dir
into a copy's register). Mutation-test any code you change alone to 100% with Stryker. Don't run `npm run gate`.

## Report

Under 300 words: facts brought in (id, country, what changed), rows whose status changed, sources re-dated, errors
fixed, patch files, commands and results, and anything for the lead.
