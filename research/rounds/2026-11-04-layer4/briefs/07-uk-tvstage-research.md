# Layer 4's research: a series and a play in the UK, 2026-11-04

You are a research agent for SLATE-REBUILD (`/home/user/SLATE-REBUILD`), a life simulator held to an absolute
standard: every fact cites its primary source and the date it was read; a fact not found is a *blocker* only after
every method was tried. The owner's words: "I want everything done perfectly and to not be finished until you
personally feel we've gotten all the information we could possibly obtain."

## Why

The owner ruled (2026-11-04) that the life's own productions are "Films, TV and stage", the four roles (actor,
director, producer, writer) working on one. The film side stands on sources (R-4612: the BFI's fee line, funding
rate and award terms, the UK's film credit, the BFI's release and recoupment rates by budget). A series' or a play's
producing is refused today because none of that was researched for them: read
`/home/user/SLATE-REBUILD/src/person/producing/producing.ts` lines 1-100 and 660-850 (what a film's plan, fund,
credit, fee and release read), the register's R-4612 and R-4613 in full (`research/register.json`), and
`gate/checks/register.ts` (the register's rules). Then find, for the **UK** (the engine's home market), what the
same steps are for a **television series** and a **stage play**, so the game can make, finance and release them on
the record.

## What to find (UK, in force today, each from its primary)

A series (high-end and other scripted television):
1. The tax incentive a producer claims: the Audio-Visual Expenditure Credit for high-end television (and for
   children's and animation if it differs): its rate, its spend threshold (per slot hour or per episode), what share of
   expenditure counts, any cap, its date in force (HMRC's manual, the Act on legislation.gov.uk, the BFI's
   certification guidance).
2. A public fund that backs a producer's series, if any (the BFI's funds, the UK Global Screen Fund, the nations'
   screen agencies: Screen Scotland, Ffilm Cymru Wales / Creative Wales, Northern Ireland Screen): its terms (share,
   cap, eligible budgets), and how often it says yes where it publishes it. An absence stands only where the fund's
   whole guidance was read and is silent.
3. A cap on the producer's fee and overheads a funder or broadcaster sets (the broadcasters' terms of trade under the
   Ofcom-approved codes of practice, Pact's guidance).
4. What happens once a series is made: how a UK series reaches the screen and earns, the share of a series' budget a
   broadcaster's or streamer's licence fee covers (Ofcom's and Pact's census reports, the BFI's statistical yearbook
   on high-end TV), and how often an independently financed series is picked up, where any source counts it.

A play:
5. Theatre Tax Relief: its rates (touring and non-touring) in force today and their dates, what counts, any cap
   (HMRC, legislation.gov.uk).
6. Public funding for a producer's play: Arts Council England's National Lottery Project Grants (and the other
   nations' arts councils), their ranges and published success rates.
7. The stage director's minimum: the UK Theatre and the SOLT agreements with Equity (or Stage Directors UK) for
   directors, their current rates and terms, and what they pay by the week or the production.
8. The playwright's minimum: the UK Theatre / Writers' Guild / Equity theatre writers' agreement and the SOLT / WGGB
   West End agreement (and the ITC's), their commission fees, royalties and advances.
9. What happens once a play is made: how often a production recoups or a run is extended, the box office per
   performance or week, where SOLT, UK Theatre, the Arts Council or a published study counts it.

## Method (binding)

- Every one of the five methods, recorded as made: `web-search` (at most **12** WebSearch calls, mode "standard";
  count them), `institution` (the body's own site and documents), `official-register` (legislation.gov.uk, HMRC's
  manuals, Companies House filings), `trade-press` (quoting a primary, with its address), `archive` (the Wayback
  Machine; Common Crawl via `python3 -I /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/cc.py list <crawl> '<surt-prefix>'`
  then `cc.py get`, crawls CC-MAIN-2026-43, -39, -30, -21, 2025-51).
- Every value is read verbatim from a page or file you fetched today (curl, Playwright or the saved download), saying
  exactly where. A figure from memory, a search snippet or a WebFetch summary is not a figure. OCR
  (`TESSDATA_PREFIX=/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/tessdata tesseract page.png - -l eng`, `pdftoppm -r 200 -png`) is checked against the page image.
- **Primary:** the institution's own channel or an archived copy of it; a state body's copy of the law. **Secondary**
  (naming the primary it quotes, `quotes`): a law firm, news, a trade summary, Wikipedia. One with no address for its
  primary is a lead. A draft, a consultation, a rule not yet in force is a lead, recorded with its date.
- The law outranks a ministry's page; a page older than a change a current source reports isn't the rule in force.
- Never get past a bot check or turn TLS verification off (completing a chain with the issuer's own intermediate,
  `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/research5/certs/bundle.pem`, verification on, is allowed); a page read only over plain http isn't a
  read. A refusal is recorded as the attempt's result.
- Save downloads under `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/files/`, with each file's sha256; run Python
  that reads them with `-I`; never run a downloaded file. Do not edit the repository. Never stop processes by name;
  stop only your own, by PID. Today is 2026-11-04.

## Result file

Write `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/tvstage.result.json` as you go: a JSON array, one object per item
1-9:

```json
{ "item": 1, "fact": "what was sought", "verdict": "found | partial | blocked",
  "sources": [ { "kind": "primary|secondary", "url": "...", "title": "...", "read": "2026-11-04", "said": "verbatim",
                 "file": "saved path", "sha256": "...", "quotes": "for a secondary" } ],
  "attempts": [ { "method": "institution", "tried": "exactly what", "result": "what came of it", "date": "2026-11-04" } ],
  "value": "the fact, structured as a film's equivalent is in producing.ts / markets.json",
  "notes": "what the engine would need, and what isn't known" }
```

Then reply in under 250 words: searches used, each item's verdict and value in a line, and what stays unknown.
