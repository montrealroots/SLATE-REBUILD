# Layer 4: what 238df9f left, 2026-11-04

Repository: `/home/user/SLATE-REBUILD` at 238df9f. Read `CLAUDE.md`, `HANDOFF.md` (Next step 2's "Left:" and 3),
`gate/`, `.claude/rules/`, `gate/checks/register.ts`, and `git show 238df9f` (message and diff). You are the only agent
editing the tree; eight research agents work in scratch directories only.

## What to do

1. **Foreign-only rebates.** A rebate or incentive whose own terms limit it to foreign productions (or co-productions
   with a foreign partner) is paid today to the life's own production in its home country (Azerbaijan's and, per group
   A, about 35 others). The life's production company is the life's own, in its home country (identity's home): a
   production made in the life's home country isn't foreign there; one made in another country is. Find every market
   whose research text limits its incentive so (read each research file's own quote; don't infer it from a name), hold
   the limit in the compiled data, and pay the credit only where it applies; told to the player where it's refused.
   Pin with a falsifier (the same production, made at home vs abroad).
2. **An agreement's age bar.** Israel's Hebrew Theatre agreement excludes actors under 18 (its signed text, R-5770's
   research). Let an agreement hold the age it covers from, where its text sets one, and refuse a minor under it
   (told); check the other agreements' research for the same clause and hold each found.
3. **A fee per part.** Uruguay's SUA table (the Undécima Ronda's) pays a fee for the part beside a day rate. Add the
   term the engine lacks, where the research holds such a fee, and pay it: Uruguay's stays blocked only on the table
   after the 2.8% rise of 1 July 2026 (pay the January 2026 table up to then, its last step kept past it as the engines
   keep an agreement's last step).
4. **Comments citing research that went** (R-4614's blocker in `acting.ts` ~25, R-4622's 72% in `directing.ts` ~41-45,
   Go Into The Story in `src/person/genres/genres.ts` ~16-17 and `tools/person/genres/compile.ts` ~16-18): say in the
   past tense what was read and why it went, or drop the claim; and the permit research files
   `research/sources/papers/permits/IS.json` and `SG.json`, which still say a matter was "left for papers.work" (it was
   settled in 238df9f): re-pin their entries.
5. **What else looks unread**, per group C: R-4620's awards figures, R-4622's CNC genre figures, the UK class figures
   and the family-share figure, R-4608's staffing, hiring and pay-by-rung figures. Find each figure's reader; remove
   what nothing reads (with sources only it cited), re-pin, reword the entry to say nothing untrue.

Do **not** research the WGA's or SAG-AFTRA's reach into the US territories: leave it in HANDOFF.

## Rules

You may edit `research/register.json` directly (you are the only tree editor), keeping every entry gate-valid. No
commits, pushes, or edits to `HANDOFF.md`, `CLAUDE.md` or the owner's documents. Every behaviour pinned with a
falsifier per changed consumer; Stryker on each changed code file alone to 100% (`--tempDirName .stryker-tmp-left`,
deleted after; a disable comment only where no input can tell a mutant apart). Focused vitest while working;
`npm run gate:write` if generated files moved; `npm run gate` at the end, exit status from a file, never a pipe. The
machine is loaded: never raise a timeout. Never stop processes by name; only your own, by PID.

## Report

Under 350 words: the markets whose rebates are foreign-only (and the quote each rests on), the age bars found, the
per-part fee, comments and files fixed, figures removed, register entries changed, tests and mutation numbers, the
gate's numbers. Commit message (decided and why, full prose) to
`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad/l4f/left-commit.txt`.
