# Layer 4's research and integration of 2026-11-04, kept so a fresh session resumes

Everything a session needs to carry on layer 4 from where the session of 2026-11-04 stopped, which lived until then
only in that session's scratch directory and its uncommitted tree. `HANDOFF.md`'s "Next step" says what to do with it,
in order. The raw downloads the agents saved (about 5.8 GB of pages, PDFs and images) aren't kept here: every fact
cites its address and quotes its page verbatim, with the saved file's sha256, in the research files and the register,
so any of them can be fetched and checked again.

## What is here

- `briefs/`: every brief given to the agents of 2026-11-04, numbered in the order they ran. They hold the rules the
  research works by (primary and secondary, leads, the law in force, absences, reads, the five methods, never an
  attempt not made). The paths in them name that session's scratch directory
  (`/tmp/claude-0/-home-user/03f7067b-6e1c-5cca-95b5-33cc49c92f8f/scratchpad`): a new session puts its own scratch
  directory in their place, and this directory's files where the briefs name `l4t/`, `l4f/` and `l4w/`.
  - 01 the port of SLATE's ten engines; 02 the own-productions rebuild (the owner's rulings: no casting, no spec sales,
    union minimum from budget); 03-05 the first research wave and its six integrators (merged as 362233c); 06 the
    follow-up fix (08e2de3); 07-10 the UK's series and plays (47c51eb, aa69c48, 7f80741); 11-12 what the engines didn't
    read (238df9f, 7268069); 13-15 a series and a play in every other market (first wave t1-t8, follow-up u1-u25,
    integrated by four role integrators, **not yet committed**); 16 the methods round (m1-m20, finished 2026-11-04); 17 its merge into the register and the engines (running when this was
    written).
- `results/first-wave/`: the first wave's results (`m1..m8, a1, a2, p1.., s1, f1..f12`) and the re-read's review,
  merged in 362233c.
- `results/uk/`: the UK's series and play research (`tvstage.result.json`) and its gaps (`gaps.result.json`).
- `results/tvstage/`: a series and a play in every other market. `t1..t8.result.json` (31 countries each, the first
  wave), `u1..u25.result.json` (the follow-up: only the items the first left untried, `u<n>.todo.json` naming them),
  `unreached.json` (what the first left untried), `m1..m20.todo.json` (the methods round's work: per country, the
  producer blocker's missing methods and the stage items 7, 8, 9 still to be tried by all five), `gaps.json` (the 235
  producer blockers short of a method, by id). `m<n>.result.json` are the methods round's results as they stood at the last checkpoint; `tools/methods_left.py` lists what each still lacks.
- `integration/`: the four role integrators' register patches (`producer`, `director`, `writer`, `actor`
  `.register-patch.json`, all already merged into the uncommitted tree), their catalog patches (merged), the
  integrators' notes (`producer.method-gaps.json`, `director.stage-attempts.json`, `actor.unrecorded-attempts.json`),
  `renames.json` (the R-NEW ids the merge numbered), and the uncommitted tree itself:
  `wip-tracked.patch` (every tracked file's change from 7268069) and `wip-untracked.tgz` (the 162 new files).
  Applied to 7268069 they rebuild the tree byte for byte (checked on a fresh clone, all 230 files).
- `tools/`: `methods_left.py` (what the methods round still lacks, per group), `merge3.py` (merges a directory of `*.register-patch.json` and `*.register-delete.json` into the register,
  numbering `R-NEW-n` per group; run from the repository's root as `python3 -I <path>/merge3.py <dir>`), `cc.py` (Common
  Crawl's index and record reader, with backoff: `python3 -I cc.py list <crawl> '<surt-prefix>'`, then `cc.py get`),
  `ca-intermediates.pem` (issuers' intermediate certificates that complete chains some sites serve incomplete;
  verification stays on).

## Restoring the uncommitted tree

On a fresh, clean checkout of the branch at the commit that added this package (`git status` shows nothing changed;
the package's commit changes no file the patch touches):

```bash
git apply --binary research/rounds/2026-11-04-layer4/integration/wip-tracked.patch
```

```bash
tar xzf research/rounds/2026-11-04-layer4/integration/wip-untracked.tgz
```

If a later commit on the branch already holds the integration (HANDOFF's "Next step" says so), don't apply them. The gate is red on that tree for two
reasons, both closed by the methods round: 235 producer blockers stand on fewer than five methods, and 39 director
rows are pending (no stage director's minimum and no blocker).
