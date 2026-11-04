# Layer 4: a series and a play in every market, integrated, 2026-11-04

Repository: `/home/user/SLATE-REBUILD` at 7268069. Read `CLAUDE.md`, `HANDOFF.md` (Assumptions; Next step 1),
`gate/`, `.claude/rules/`, `gate/checks/register.ts` and `gate/checks/coverage.ts`, then how the UK's series and plays
were built: `git show 47c51eb aa69c48 7f80741` (messages first), `research/sources/person/work/tvstage-GB.json`,
`nations-GB.json`, and the engines' series and play code with `tests/person/producing/stage.test.ts`.

Four integrators work at once, one per role, each on its own engine's files (named in your prompt). The owner's
rulings in force: own productions only; the four roles on one production; "Films, TV and stage".

## Inputs

The research of 2026-11-04 on a series and a play in every market but the UK:
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/t1..t8.result.json` (the first wave) and
`u1..u25.result.json` (the follow-up, holding only the items the first left untried; where both hold an item, merge
their attempts and sources, the later verdict standing where it read more). Downloads under `l4t/files/<group>/` with
their sha256. Items: 1 a series' incentive, 2 a series' fund, 3 a series' fee cap, 4 a series reaching the screen,
5 a theatre tax incentive, 6 a play's fund, 7 the stage director's minimum, 8 the playwright's, 9 the stage actor's,
10 how a play fares. **They are model output**: verify every figure you use against the saved file (its text, its page
image for a scan or a table), or your own fetch. Never take one on trust.

## The contract between the engines (all four hold it)

- A series or a play may be made in any market. Each step reads that market's research where it stands and is refused,
  told in the player's words, where it doesn't (as the UK's do and as a film's market does today).
- A play outside the UK names the agreement it is staged under, one of its market's agreements whose medium is the
  stage (the actor's engine already holds such agreements by market). The director, the writer and the actor are paid
  under the market's own stage terms where the research holds them; refused, told, where it doesn't.
- What no source counts (how often a series is picked up, a run recoups) stays the game's own reading, as the UK's is,
  moved as the film's release is, told. A market's own count, where found and verified (a fund's rate of yes, a
  broadcaster's commissioning figures), takes its place.
- Where a market follows another's law (a territory under France, the Netherlands, Australia, the US...), it follows
  that market's terms as the existing research already reasons it, and as the found sources show.

## Errors and readings to settle as you integrate

- Attempts recorded for a WebSearch call that was refused (the shared allowance spent) are not attempts: drop them.
  An attempt not made is never recorded.
- A quote that fails a verbatim match because a PDF table or a hyphen broke its text: read it in the PDF's page image
  and record it as the page prints it (named by the agents: ZA's overheads, BR's abatement, the Nigerian and CEDF PDFs).
- A figure an agent computed (a division, a multiplication) is not a figure: hold the stated numbers, not the quotient.
- Argentina: Buenos Aires City's BA Producciones Internacionales (Res. 90 and 141/MDECGC/26) replaces producer-AR's
  2022 figures; Lebanon's Ministry of Culture funds films (the producer file said none was found); Bonaire's (BQ) High-End
  Series incentive reaches the BES islands (t5 had item 1 none-exists); Ghana's GH¢20m: check the 2026 Budget Statement
  for which fund it seeds; Malta's above-the-line cap (€5M today against €12.5M held); bvifilm.com now suspended (the BVI
  producer file cites it as read 2026-11-01: re-check and mark it); Uzbekistan's rebate (PF-6202 para. 9) names series.
- The rulings of the earlier briefs bind: primary vs secondary (a law database's copy is secondary; qanoon.om, WIPO Lex,
  zakon.uchet.kz are secondary), a lead is not a fact (a draft, a bill, press with no address, a snippet), the law in
  force outranks a page, an absence stands only where the text was read whole, a page past a bot check or by another
  route around a block isn't a read (an archive's copy of the institution's own page is). Never get past a bot check.

## Output

Edit your engine's files in the tree (its compile, research files, data, engine code, coverage, tests). **Don't edit
`research/register.json`**: write each entry you change, whole and gate-valid (sha256 re-pinned), to
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4t/out/<group>.register-patch.json` (a plain
JSON array; a new fact `R-NEW-1`…), deletions to `<group>.register-delete.json`, catalog lines to
`<group>.catalog-patch.json` (`{ id: { text, where, status: "placeholder" } }`). Blockers carry every attempt actually
made (the first wave's and the follow-up's) and a `foundInPart` for what was found.

Prove on a scratch copy of the repository with your patch merged (`python3 -I
/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/research3/merge3.py <dir>` run in the copy's
root): tsc, eslint on changed files, vitest on your engine's tests, the register check. Every changed behaviour pinned,
a falsifier for each new consumer link (another market's terms: the outcome moves). Mutation-test every code file you
change alone with Stryker to 100% (`--tempDirName .stryker-tmp-<group>`, deleted after; a disable comment only where no
input can tell a mutant apart; if a whole-file run passes 30 minutes, run its changed lines alone and say so). Don't
run `npm run gate`. No commits, pushes, or edits to `HANDOFF.md`, `CLAUDE.md` or the owner's documents. Never stop
processes by name; only your own, by PID. Never raise a timeout.

## Report

Under 350 words: markets whose series or play now does each step, and on what; what stays refused and why; errors
fixed; entries patched, new and deleted; catalog lines; tests and mutation numbers per file; anything for the lead.
