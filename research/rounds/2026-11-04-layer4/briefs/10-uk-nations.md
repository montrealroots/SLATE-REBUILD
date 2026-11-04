# Layer 4: the UK's nations and the actor on stage, 2026-11-04

Repository: `/home/user/SLATE-REBUILD` at 47c51eb ("Wire a UK series' and a UK play's producing, directing and writing").
Read `CLAUDE.md`, `HANDOFF.md` (Next step 1, which names these gaps), `gate/`, `.claude/rules/`, that commit's diff and
message (`git show 47c51eb`), and the engines it touched with their tests (`tests/person/producing/stage.test.ts` first).
The owner's rulings in force: own productions only; the four roles on one production; "Films, TV and stage".

## The research

`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/gaps.result.json` (saved files under
`l4f/files2/`, hashes in its `SHA256SUMS`). Model output: check every figure you use against the saved file or page
image. The lead checked: SOLT's performer card has £965.55; the ITC's rates page says "Please note, dates represent the
financial year."; UK Theatre's subsidised card's performer minimum is £547.29 at grades 1-3 for 30 March 2025 to 5 April
2026 (the grade rows above it, £637.19 / £561.88 / £547.29, are another line of the card: read what it is before using
it); Creative Scotland's Open Fund is "open to both individuals and organisations based in Scotland", 2024/25
individuals 535 of 1,761 (30%), organisations 153 of 365 (42%).

## What to build (decided by the lead; where a source won't bear a reading, say so and do the honest thing)

1. **A UK production names its nation** (England, Scotland, Wales, Northern Ireland): by default the nation of the
   life's home where the map gives it (read how identity and the gazetteer hold a region; one model of where things
   are, no second copy), else named when the production is. A series' or play's fund reads it.
2. **A play's fund by nation**: England, Arts Council England's Project Grants as now (its rule on where an applicant
   is based wasn't readable: record that blocker as the result has it, and hold the fund for a production made in
   England); Scotland, Creative Scotland's Open Fund at its 2024/25 rate for an individual (the life applies as itself:
   535 of 1,761), £1,000 to £100,000 as its guidance sets (check the saved page); Wales and Northern Ireland, refused,
   told: their arts councils publish ranges but no rate of yes by fund.
3. **A series' fund by nation**: Screen Scotland, Creative Wales and Northern Ireland Screen publish terms but no rate
   of yes, so a series' fund stays refused everywhere, the player told what is known (that the nation's screen agency
   funds series, on terms the game doesn't model without how often it says yes). Hold no term nothing reads.
4. **The actor on stage**: a West End play's parts under SOLT / Equity's West End agreement by theatre category
   (A 1,100+ seats, B 800-1,099, C up to 799; 8 shows a week; rehearsal at the same minimum; 6 April 2026 to 4 April
   2027, and 2027/28's 5% where the card prints it); a subsidised play's under UK Theatre / Equity's Subsidised
   agreement (£547.29 a week, the year to 5 April 2026, kept past its term as the engines keep an agreement's last step,
   since Equity's notice of 9 October 2026 says 2026/27 is still in negotiation: say so in the comment).
   So the life can act in and direct one play at a subsidised or a West End theatre.
5. **An ITC company's play**: a theatre kind for a play made by an ITC member's company: performers at the ITC's £631 a
   week (2026/27) and the director's preparatory fee and weekly rehearsal rate as its sheet gives them; the writer's ITC
   rates as now. The ITC's years run from 1 April on its own word ("dates represent the financial year"): the reading
   that was the game's in 47c51eb now stands on that source; its transition period's terms are members-only (record it
   in the entry). Check the ITC sheet's dates for each rate you use.

Everything downstream reads the new as it reads the rest (unions, tax and accounts, youth, the producer's record).
Register: entries for the new facts (cite the saved files, read 2026-11-04, sha256 kept in the research file you write,
`research/sources/person/work/tvstage-GB.json` or beside it), blockers for what stays unfound with the attempts the
result records (never one not made), R-9780 to R-9784 and the entries 47c51eb added updated where these findings
change them. Catalog lines for each new refusal or reading (American English, contracted, Title Case on labels), the
text inventory marked. Coverage, effects, anchors, deciders and the matrix updated; a field nothing reads is removed.

## Rules

As 47c51eb's brief (`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/WIRE.md`, "Rules"):
you are the only one editing the tree; no commit, push, or edits to `HANDOFF.md`, `CLAUDE.md` or the owner's documents;
every behaviour pinned with a falsifier per new consumer link; Stryker on every changed code file alone to 100%
(`--tempDirName .stryker-tmp-nations`, deleted after); `npm run gate` at the end, exit status from a file; never raise a
timeout; never stop processes by name.

## Report

Under 350 words: what each nation's series and play now do, the actor's and director's stage terms by theatre, what
stays refused and why, register entries added or changed, catalog lines, tests and mutation numbers per file, the gate's
numbers, anything for the lead. Commit message (decided and why, full prose) to
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/nations-commit.txt`.
