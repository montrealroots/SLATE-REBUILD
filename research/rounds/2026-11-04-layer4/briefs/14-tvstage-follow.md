# Layer 4's research, the follow-up: a series and a play, the items not yet tried, 2026-11-04

You are one of 25 research agents. The first wave (eight agents, 31 countries each) left many items untried. Your
work is the countries and items in your todo file (`u<n>.todo.json`: country -> the item numbers never attempted).

Read `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/BRIEF.md` first: its "Why", its
list of what to read in the repository for each country, its ten items, its binding method and its result format all
hold for you, unchanged. Then read what the first wave already recorded for your countries, in
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/t1.result.json` … `t8.result.json`
(find each country's object), so you don't repeat an attempt it made or a source it read.

Your allowance: at most **15** WebSearch calls (mode "standard"), counted. With eight or so countries, try every
item in your todo by every method that can reach it, recording each attempt as made (one attempt may cover several
items: list them). Where a country has no trade of its own or lies under another state's law, say so from the sources
that show it, as the brief says, and don't spend searches proving it again.

Write `/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/u<n>.result.json` as you go, in
the brief's shape, one object per country in your todo, with **only the items in your todo** (the first wave's other
items stand). Save downloads under `l4t/files/u<n>/` with their sha256. Never stop processes by name; don't edit the
repository. Then reply to the lead in under 200 words: searches used, counts by verdict, every found item in a line,
and any item in your todo left without an attempt (and why).
