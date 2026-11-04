# Layer 4's methods round: every blocker by all five methods, 2026-11-04

You are one of 20 research agents. The research on a series and a play in every market (the first wave `t1..t8`, the
follow-up `u1..u25`) left blockers that stand on fewer than the five methods the register requires, and stage pay
(items 7 the stage director's minimum, 8 the playwright's, 9 the stage actor's) that no role's blocker yet records
properly. Your job: for each country in your todo, **make every missing attempt for real**, by the method it is, and
record exactly what was tried and what came of it.

Read first: `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/BRIEF.md` (its ten items, its
binding method and rulings hold for you unchanged) and `gate/checks/register.ts` in `/home/user/SLATE-REBUILD` (the
methods: `web-search`, `institution`, `official-register`, `trade-press`, `archive`). For each country read what is
already recorded so you don't repeat it: the country's objects in `l4t/t*.result.json` and `l4t/u*.result.json`, and
the register entries your todo names (`/home/user/SLATE-REBUILD/research/register.json`: their `sought`, `attempts`,
`foundInPart`).

## Your todo (`m<n>.todo.json`: country -> what to do)

- `producer`: a blocker (`blocker`: its id) on a series' and a play's producing in that market, missing the methods in
  `missing`. Make an attempt by each missing method on what that blocker seeks (its `sought`), and only those.
- `stage`: items (7, 8, 9) whose pay no agreement of that market's role holds. For each item, make an attempt by **all
  five methods** (one attempt may cover several items: list them), unless a recorded attempt by that method on that
  item already exists in the t/u result files (then name it, don't repeat it). `blockers` names each role's existing
  blocker id (null where the role has none).

The methods, concretely: `web-search` (at most **10** WebSearch calls in all, mode "standard"; count them; if one is
refused because the shared allowance is spent, it is **not** an attempt: record it under `notSearched`, never under
`attempts`); `institution` (the union's, the theatre managers' association's, the culture ministry's, the arts
council's, the screen agency's, the public broadcaster's own site and documents); `official-register` (the gazette, the
legal database of the state, the labour ministry's register of collective agreements); `trade-press` (a press or trade
article you fetch and read, quoting a primary with its address); `archive` (the Wayback Machine for the institution's
page, or Common Crawl: `python3 -I /tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/cc.py list
<crawl> '<surt-prefix>'` then `cc.py get`, crawls CC-MAIN-2026-43, -39, -30, -21, 2025-51). A refusal, an error page, a
bot check (not got past), nothing found: each is a result, recorded as such. **Never record an attempt not made.** A
country with no trade of its own or under another state's law: the attempt that shows it (the law or body that applies)
is the attempt; record it under each method you actually used to show it.

If an attempt finds the fact, record the source verbatim with its saved file and sha256, as the brief says (a primary,
or a secondary naming its primary), in the country's `found` list.

## Result

Write `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/m<n>.result.json` as you go: a JSON
object, country -> `{ "producer": { "blocker": "R-…", "attempts": [ … ] }, "stage": { "7": [ … ], "8": [ … ], "9":
[ … ] }, "found": [ { "item": 7, "value": "…", "sources": [ … ] } ], "notSearched": [ … ], "notes": "…" }`, each
attempt `{ "method": "…", "tried": "exactly what", "result": "what came of it", "date": "2026-11-04" }`. Save downloads
under `l4t/files/m<n>/` with their sha256. Don't edit the repository. Never stop processes by name; only your own, by
PID. Then reply in under 150 words: searches used, per method the attempts made, every fact found in a line, and any
blocker or item still short of a method (and why).
