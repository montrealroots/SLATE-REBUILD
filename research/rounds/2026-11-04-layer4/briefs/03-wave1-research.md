# Layer 4's research, 2026-11-04: re-attacking the blockers, seeking the primaries

You are one of thirteen research agents working in parallel on SLATE-REBUILD (`/home/user/SLATE-REBUILD`), a life
simulator held to an absolute standard: every fact cites its primary source and the date it was read, and a fact not
found is a *blocker* only after every method was tried. The owner's words: "I want everything done perfectly and to not
be finished until you personally feel we've gotten all the information we could possibly obtain."

Layer 4 (the person: acting, directing, producing, the screenwriter's work, unions, work permits, the rules for
minors in screen work) came over from SLATE on 2026-11-04; its research was last tried on 2026-11-01. Read
`/home/user/SLATE-REBUILD/gate/checks/register.ts` (the register's rules), then each entry of your group in full from
`/home/user/SLATE-REBUILD/research/register.json` (its `sought`, `foundInPart` if any, and every earlier attempt), and
the research file or the engine's research directory it belongs to (`research/sources/person/markets/`,
`research/sources/person/ages/`, `research/sources/papers/permits/`: the shape a found value takes).

## What to do

- **A blocker:** try again today by **every one of the five methods** (`web-search`, `institution`,
  `official-register`, `trade-press`, `archive`), above all what the earlier attempts didn't try: the union's or
  guild's own site and its collective agreements or rate cards; the labour ministry's register of collective
  agreements; the immigration or labour authority's own permit pages and fee schedules; the official gazette; the
  arts council or film commission; the embassies' consular pages (the state's own channel); the country's own
  language; Common Crawl (`python3 -I /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/cc.py list <crawl> '<surt-prefix>'`, then `cc.py get`; crawls
  CC-MAIN-2026-43, -39, -30, -21, 2025-51) and the Wayback Machine. Record each attempt exactly as made.
- **A secondary (group s1):** re-read every source (same, changed or unreachable) and seek the primary its `quotes`
  names; read its figures and compare them with what the research holds.
- **You have at most 15 WebSearch calls** (mode "standard"); the allowance is shared by thirteen agents. Count them.
  Spend them where fetching failed. Fetching is unlimited.

## The rulings (they bind you)

- **An attempt not made is never recorded.** A fetch is recorded under the method it was, never as a web search.
- Every value is read from a page or file you fetched today, saying exactly where. A figure from memory, a search
  snippet or a WebFetch result (a model's summary) is not a figure: read the page verbatim (curl, Playwright, or the
  saved download). A quote joined across columns or read by OCR is checked against the page image.
- **Primary:** the institution's own channel (its site, its gazette or legal register, its published document, its
  official social account, its embassies' pages), a state body's copy of the law, an image of the gazette's own page
  wherever hosted, or an archived copy of any of these. **Secondary,** naming the primary it quotes (`quotes`: its
  address): a legal information institute's copy (PacLII, SAFLII, the national LIIs, Laws.Africa's consolidations),
  GLOBALCIT, Wikipedia, a law firm, news, a union federation's summary of another union's terms (FIA, IAWG, FERA,
  UNI MEI) unless it reproduces the agreement. A secondary with no address for its primary is a lead, in the attempt.
- **A lead, not a fact:** a draft or bill, a law not yet in force, press with no address for what it reports, a search
  snippet, a length or a fee counted from a form's grid, a page about another country.
- **What is in force:** the law outranks a ministry's page; an official page older than a change a current source
  reports isn't the rule in force; a rule enacted for 2027 is recorded with its date.
- **An absence stands as found** only where the primary that would hold the rule was read in full and is silent (the
  union's whole current agreement with no minimum for that role; the Act read whole). "No union found" is not an
  absence: say what was searched.
- Never get past a bot check or turn TLS verification off; completing an incomplete chain with the issuing CA's own
  intermediate (`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/research5/certs/bundle.pem`, verification on) is allowed. A page read only over plain http isn't
  a read. Record a refusal as the attempt's result.
- OCR for 68 languages: `TESSDATA_PREFIX=/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/tessdata tesseract page.png - -l <lang>`; `pdftoppm -r 200 -png` makes
  page images; check a page's rotation.
- Thirteen agents share this machine: never stop processes by name (`pkill`, `killall`); stop only your own, by PID. Save
  downloads under `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4w/files/<group>/`; run Python that reads them with `-I`; never run a downloaded file.
- Do not edit any file in the repository. Write only your result file (path in your prompt), as you go.
- Today is 2026-11-04: `read`/`date` is "2026-11-04".

## Result file

A JSON array, one object per entry, in your group's order:

```json
{ "id": "R-5291", "verdict": "found-now | partial | still-blocked | primary-found | primary-partial | not-found",
  "sources": [ { "url": "...", "status": "same|changed|unreachable", "now": "what it says now, if changed" } ],
  "newSources": [ { "kind": "primary|secondary", "url": "...", "title": "...", "read": "2026-11-04", "said": "verbatim", "quotes": "for a secondary" } ],
  "attempts": [ { "method": "institution", "tried": "exactly what", "result": "what came of it", "date": "2026-11-04" } ],
  "value": "the fact found, in the shape the engine's research files take",
  "notes": "anything the lead must know" }
```

Then reply to the lead in under 200 words: searches used, counts by verdict, every found-now and partial in a line,
and the ids you didn't reach.
