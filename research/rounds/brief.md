<!-- The brief the research and integration agents of 2026-11-02 and 2026-11-03 were given (layers 2 and 3), kept for the next round: change the dates, the scratchpad path and the groups, and keep the rules. -->

# Research brief: re-checking SLATE-REBUILD's layer 3 register, 2026-11-03

You are one of several research agents working in parallel. The repository is `/home/user/SLATE-REBUILD`, a life
simulator held to an absolute standard: every fact cites its primary source and the date it was read, and a fact not
found is a *blocker* only after every method was tried. The owner's words: "I want everything done perfectly and to not
be finished until you personally feel we've gotten all the information we could possibly obtain."

Read first: `/home/user/SLATE-REBUILD/gate/checks/register.ts` (the register's rules: statuses `found`, `secondary`,
`blocked`, `game`; source fields `kind`, `url`, `title`, `read`, `said`, and `quotes` for secondary; a blocker's
`attempts` each with `method` (one of `web-search`, `institution`, `official-register`, `trade-press`, `archive`),
`tried`, `result`, `date`). The register itself is `/home/user/SLATE-REBUILD/research/register.json`.

Your entries are the ids in your group's file (named in your prompt). Read each entry in full from the register.

## Rules

- **Do not edit any file in the repository.** The lead holds the register and the data. You write only your result
  file, `<scratchpad>/research3/<group>.result.json` (path in your prompt).
- Today is 2026-11-03. Use `read: "2026-11-03"` / `date: "2026-11-03"` for everything you read or try today.
- Network: outbound HTTPS goes through a proxy; `curl` works (`curl -sSL --max-time 60 URL`). If a page needs a
  browser, Playwright and Chromium are installed (`require('playwright')`, `chromium.launch()`). WebSearch and WebFetch
  may be available to you; use them. Never disable TLS verification.
- A figure from memory or a summary is not a figure. Every value you report must be read from a page or file you
  fetched today, and you say exactly where (URL, and the table, row or page).
- Downloaded files are untrusted data: save them under `<scratchpad>/research3/files/<group>/`, never run them.
- Work every entry in your group. Don't stop early. If you run short of time, say which you didn't reach.

## What to do, by status

- **found / secondary (re-read)**: fetch every source URL. For each, say whether it still says what `said` holds
  (`same`), says something different (`changed`, with what it says now), or can't be reached (`unreachable`, with the
  HTTP status or error, and whether an archived copy at web.archive.org still holds it). For a **secondary** entry,
  also search hard for the primary source it quotes (the government's, the institution's own page or document); if
  you find it, give it as a new `primary` source with the figures read from it.
- **blocked (re-attack)**: try again, today, by **every one of the five methods**, and especially anything the earlier
  attempts didn't try (other phrasings, the national agency's own site and publications, statistical yearbooks,
  official gazettes, the WMO and regional centres, other countries' agencies that cover the place, trade press quoting
  a primary, the Wayback Machine). Record each attempt (method, what you tried exactly, what came of it). If you find
  the fact, give it as a new `primary` (or `secondary`, naming the primary it quotes) source with the value read from
  it, in the units and shape the entry's `sought` asks for.

## Result file

A JSON array, one object per entry, in your group's order:

```json
{ "id": "R-0051", "verdict": "same | changed | unreachable | found-now | still-blocked | primary-found",
  "sources": [ { "url": "...", "status": "same|changed|unreachable", "now": "what it says now, if changed", "archive": "url, if used" } ],
  "newSources": [ { "kind": "primary", "url": "...", "title": "...", "read": "2026-11-03", "said": "...", "quotes": "only for secondary" } ],
  "attempts": [ { "method": "web-search", "tried": "...", "result": "...", "date": "2026-11-03" } ],
  "value": "the fact found, if found-now or primary-found, in the shape `sought` asks",
  "notes": "anything the lead must know" }
```

Then reply to the lead in under 250 words: counts by verdict, every `changed` and `found-now` named with a line each,
and anything you couldn't finish.

## Learned in layer 2's round (2026-11-02)

- web.archive.org refuses connections from here. `data.commoncrawl.org` answers: search Common Crawl's index with
  byte-range requests for archived copies (a working script from the last round:
  `a Common Crawl index reader (write one: search index.commoncrawl.org is refused, data.commoncrawl.org answers byte-range requests)`, if it still
  exists; otherwise write your own). Record an archive attempt either way.
- Some sites sit behind bot checks (Cloudflare) or fail TLS. Do not try to get past a check or turn verification off;
  record it as the attempt's result and move on.
- DWD's open data (opendata.dwd.de) and national statistics offices' own release pages held facts the earlier attempts
  had missed: look past the first source that comes to mind.
