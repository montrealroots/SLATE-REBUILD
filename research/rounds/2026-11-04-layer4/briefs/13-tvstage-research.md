# Layer 4's research: a series and a play in every market, 2026-11-04

You are one of eight research agents for SLATE-REBUILD (`/home/user/SLATE-REBUILD`), a life simulator held to an
absolute standard: every fact cites its primary source and the date it was read; a fact not found is a *blocker* only
after every method was tried. The owner's words: "I want everything done perfectly and to not be finished until you
personally feel we've gotten all the information we could possibly obtain."

## Why

The owner ruled (2026-11-04) that the life's own productions are "Films, TV and stage", the four roles (actor,
director, producer, writer) working on one. The UK's series and plays now stand on sources: read
`/home/user/SLATE-REBUILD/research/sources/person/work/tvstage-GB.json` and `nations-GB.json` (the shape a found value
takes, and what was sought), and `src/person/producing/producing.ts`'s comments on a series and a play. Every other
market still refuses a series' or a play's fund, credit and release. Find, for **each country in your list**, what the
UK's research found for the UK.

Before you search, read what the repository already holds for each of your countries, so you don't redo it and you know
what is missing: `research/sources/person/markets/producer-<CC>.json` (its incentive and fund: do their texts already
say whether a series counts?), `director-<CC>.json` and `writer-<CC>.json` (any television or stage terms), the actor's
`research/sources/person/markets/<CC>.json` and `src/person/acting/markets.json` (agreements whose media include
`television` or `stage`), and each country's register entries (`research/register.json`, facts
`person.markets.*.<CC>`), whose attempts say where the earlier researchers looked.

## What to find, per country (in force today, each from its primary)

A series (scripted television):
1. The production incentive's terms for a series (rate, threshold per episode or hour, what counts, cap, date in force),
   or that the incentive excludes television, read in its own text.
2. A public fund for a producer's series: terms, and how often it says yes where it publishes it.
3. A cap a funder or broadcaster sets on a series producer's fee and overheads.
4. What happens once a series is made: how a series reaches the screen (the public broadcaster's commissioning terms or
   tariffs) and any count of how often an independent series is picked up.

A play:
5. A tax incentive for theatre production, if any.
6. A public fund for a theatre production: ranges, eligibility (where an applicant must be based), rate of yes.
7. The stage director's minimum (a collective agreement, its rates and dates).
8. The playwright's minimum (commission fee, advance, royalty).
9. The stage actor's minimum, where the acting research holds no stage agreement for the country.
10. How a play fares: any count of runs recouping or extended, box office per performance.

A country or territory with no film, television or theatre trade of its own (no broadcaster, no theatre company, or
under another state's law): say so from the sources that show it (which state's law and bodies apply, as the existing
research files already reason), and don't spend searches proving a negative the earlier research already holds.

## Method (binding)

- The five methods, each attempt recorded as made, under the method it was: `web-search` (at most **15** WebSearch
  calls, mode "standard"; count them; spend them where fetching fails), `institution` (the body's own site and
  documents: the film or screen agency, the arts council, the culture ministry, the public broadcaster, the actors' and
  writers' unions, the theatre managers' association), `official-register` (the official gazette, the legal database,
  the labour ministry's register of collective agreements), `trade-press` (quoting a primary, with its address),
  `archive` (the Wayback Machine; Common Crawl via `python3 -I /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/cc.py list <crawl> '<surt-prefix>'`
  then `cc.py get`; crawls CC-MAIN-2026-43, -39, -30, -21, 2025-51). One attempt may cover several items (one agency's
  site read for its fund and its incentive): list the items it covers. **An attempt not made is never recorded.**
- Every value is read verbatim from a page or file you fetched today, saying exactly where. A figure from memory, a
  search snippet or a WebFetch summary is not a figure. OCR (`TESSDATA_PREFIX=/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/tessdata tesseract page.png - -l <lang>`,
  68 languages; `pdftoppm -r 200 -png`) is checked against the page image. Read in the country's own language.
- **Primary:** the institution's own channel (its site, gazette, legal register, published document, official social
  account, embassy pages) or an archived copy of it; a state body's copy of the law. **Secondary** (naming the primary
  it quotes, `quotes`): a legal information institute's copy, a law database, a law firm, news, a union federation's
  summary, Wikipedia. One with no address for its primary is a lead. A draft, a bill, a law not yet in force, press
  with no address, a search snippet, a figure counted from a directory, an inference no text states: leads.
- The law outranks a ministry's page; a page older than a change a current source reports isn't the rule in force; a
  rule enacted for 2027 is recorded with its date. An absence stands as found only where the text that would hold it
  was read whole and is silent, and only for what that text covers.
- Reads: a page a normal browser receives with no challenge counts; a challenge got past, even automatically, doesn't;
  a page reached through another route to avoid a block doesn't; a page read only over plain http doesn't. Never turn
  TLS verification off (completing a chain with the issuer's own intermediate,
  `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/research5/certs/bundle.pem`, verification on, is
  allowed). Record a refusal as the attempt's result.
- Eight agents share this machine: never stop processes by name (`pkill`, `killall`); stop only your own, by PID. Save
  downloads under `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/files/<group>/` with each
  file's sha256; run Python that reads them with `-I`; never run a downloaded file. Do not edit the repository. Today is
  2026-11-04.

## Result file

Write `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/<group>.result.json` as you go (so
an interruption loses nothing): a JSON array, one object per country, in your list's order:

```json
{ "country": "FR",
  "items": [ { "item": 1, "fact": "what was sought", "verdict": "found | partial | blocked | none-exists",
               "sources": [ { "kind": "primary|secondary", "url": "...", "title": "...", "read": "2026-11-04",
                              "said": "verbatim", "file": "saved path", "sha256": "...", "quotes": "for a secondary" } ],
               "value": "the fact, structured as tvstage-GB.json holds the UK's",
               "notes": "what the engine would need; what isn't known" } ],
  "attempts": [ { "method": "institution", "items": [1, 2], "tried": "exactly what", "result": "what came of it",
                  "date": "2026-11-04" } ],
  "notes": "anything the lead must know" }
```

Then reply to the lead in under 250 words: searches used, counts by verdict, every found item in a line (country,
item, value), and the countries you didn't reach.
