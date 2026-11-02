# CLAUDE.md — SLATE-REBUILD

This repository is a fresh rebuild of SLATE, an actor/actress life simulator. It is held to two sets of rules, read
in this order:

1. **1221's rules** (`montrealroots/1221`, the first SLATE: its `CLAUDE.md`, the SLATE Development Blueprint and
   the House Standard), Part 1 below.
2. **SLATE's rules** (`montrealroots/SLATE`: `CLAUDE.md`, `docs/MANDATE.md`, `docs/BUILD-ORDER.md`,
   `.claude/rules/title-case.md`), Part 2 below.

Brought over on 2026-11-02 at the owner's word: "Bring over all of SLATE's rules except the one-agent rule and
deploying to base44", then "Bring over all 1221's rule too ... it should read the rules of '1221' first followed by
'SLATE' rules." Left out, by that word: SLATE's one-agent rule (its MANDATE rule 9; parallel subagents hold instead,
Part 2) and 1221's Base44 deployment (its rule 14 and the save-schema pin its deployment needed).

**Where the two disagree, SLATE's rule holds.** SLATE's are the later rulings, made for the rebuild, and SLATE's own
`CLAUDE.md` says they outrank anything carried from the first SLATE. The places they meet are named where they
arise in Part 1.

Features come over from SLATE one at a time, as the owner picks them. Nothing from either repository's code,
research or package is assumed here until it is brought over. Read `HANDOFF.md` for where the build stands.

---

# Part 1 — 1221's rules

## The Operating Model

**Claude Code** is the primary reasoning, coding, architecture, debugging and orchestration layer.

**PowerShell 7** (`pwsh`, not the Windows PowerShell 5.1 that ships with the system) is the primary local execution
environment on the owner's Windows machine (the owner, 2026-09-23). Claude Code may use it to inspect and operate on
the real project environment: files and directories, Git, Node and npm, tests, builds, verification scripts, logs,
environment and configuration, automation and diagnostics. In a cloud session the container's shell (bash) does the
same job; commands written for the project work in both.

**Git** is the authoritative safety and version-control layer.

| Layer | Owns |
|---|---|
| Claude Code | Reasoning and orchestration |
| PowerShell 7 (or the cloud session's shell) | Execution and system access |
| Git | Versioning, recovery, audit trail and safety |

## The Rules

1. Work against the real canonical repository (this one), not disposable copies.
2. Inspect current Git state before beginning substantial work.
3. Never assume repository state from conversation memory alone.
4. Break large development work into coherent modules.
5. Validate each substantial module before integrating or moving forward.
6. Run relevant tests, typechecking, linting, verification and regression checks.
7. Never mark work complete solely because code was written.
8. Keep commits coherent and recoverable.
9. Do not perform destructive Git operations unless explicitly justified and safe.
10. Preserve uncommitted work, stashes, branches, worktrees and handoff context before operations that could affect
    them.
11. Update `HANDOFF.md` whenever a major development phase completes and before switching Claude accounts. (1221
    called it `SLATE_CURRENT_MASTER_HANDOFF.md`; here there is one handoff, `HANDOFF.md`, so no fact has two copies.)
12. The repository and verified test results outrank stale conversation assumptions.
13. Claude should explain materially risky operations before executing them.
14. (1221's Base44 deployment rule, left out at the owner's word, 2026-11-02. Deployment waits on the owner's
    explicit word, Part 2.)
15. Maintain an auditable trail of important architecture decisions, fixes, tests and deployment state.
16. Every Claude Code account that works on this repository follows this same workflow.
17. This workflow remains canonical unless the owner explicitly changes it.

## How The Rules Cash Out Here

### Rules 2 and 3 — look before working

Before substantial work, and always after a context compaction or an account switch:

```bash
git status -sb            # branch, tracking, and anything uncommitted
git log --oneline -5      # where HEAD actually is
git stash list            # what is held and must not be lost
git worktree list         # what else is checked out
```

A summary of a previous session is a snapshot, not a source of truth. When a document and the tree disagree, **the
tree wins and the document gets corrected** (rule 12).

### Rules 6 and 7 — what "done" means

The verification gate is one command, `npm run gate`, and it is the bar (Part 2 says what it holds; it is built in
layer 0). Read its exit status **from a file, never from a pipe**: a pipe that stops early ends the gate partway and
can leave the previous command's exit code, which can read as a pass.

```bash
npm run gate > "${TMPDIR:-/tmp}/gate.txt" 2>&1; echo "exit=$?" > "${TMPDIR:-/tmp}/gate-exit.txt"
```

```powershell
npm run gate *> "$env:TEMP\gate.txt"
"exit=$LASTEXITCODE" | Out-File -Encoding utf8 "$env:TEMP\gate-exit.txt"
```

Code that is written is not work that is finished. Nothing is reported complete until the gate has passed and the
report says what the numbers were.

Two things about measurement, both rule 7 in practice. Measure on a **played life, never an idle save**: an idle save
holds every number still and the stillness looks like a result. And apply the falsifiability test to any claim:
**change an input; does the outcome change, or only the sentence?**

### Rules 9 and 10 — what must not be lost

Standing constraints from the owner:

- **Never** apply, pop or drop the stash.
- **Never** merge worktrees.
- **Never** force-push the working branch.
- **Do not merge to `main` without the owner.**

Before anything that could touch uncommitted work, a stash entry, a branch, a worktree or the handoff, preserve it
first and say what is being preserved.

### Rules 11 and 16 — the handoff is the only thing that crosses

When more than one Claude Code account or session works on the rebuild, `HANDOFF.md` is the only state that passes
between them. It is updated when a phase completes and before a switch. A handoff that has drifted from the tree is
worse than no handoff, because it sends the next session to rebuild something that already exists, which happened in
1221.

### Rule 13 — explain before acting

A materially risky operation gets a sentence first: what it does, what it could lose, and why it is the right call.
Destructive Git commands, deployments, deletes and overwrites all qualify.

This does **not** extend to ordinary design and judgement calls. The owner has said repeatedly that Claude should
decide and then report the decision, rather than opening with a question or a menu of options. Deciding is Claude's
job; destroying or publishing is what gets announced first.

### Rule 15 — the auditable trail

The trail lives in four places, all load-bearing:

- **Commit messages** say what was decided and why, not what changed. The diff already says what changed.
- **`HANDOFF.md`** carries state across accounts and sessions.
- **`docs/UNBITTEN.md`** is the open-work ledger: what is declared, written, displayed or believed but changes no
  outcome. It is started the first time such a thing exists.
- **`docs/UNWIRED.json`** is the machine ratchet: its counts **may fall and may not rise**, and the gate fails a
  rise once the gate holds it.

## The House Standard

The project's own rules, which rules 5, 6 and 7 exist to enforce. They are not separate from them.

**THE ONE RULE.** A declared word with nothing that reads it is worse than no word at all.

**THE FALSIFIABILITY TEST.** Change an input. Does the outcome change, or only the sentence?

**Prose here is load-bearing.** Comments and docs do not describe what a function does; they say what was measured,
what was tried, what was deleted and why. A comment your change falsifies **is part of your change**. Say what is no
longer true in the past tense: the past tense is how this project keeps its history. Until a check holds it, review
holds the line.

**A ledger balance is never a number somebody typed.** It is the sum of postings.

**Player-facing text is written for the player** (1221, from 2026-10-17, the owner's brief 14). Every string the game
shows follows `docs/STYLE.md` ("Talking to the player", and "Speak like a finished game") and uses `docs/GLOSSARY.md`'s
words. Both are 1221's, brought over as 1221 wrote them: the checks and tools they name are 1221's and come over with
the gate, and a glossary row binds once its feature comes over (a row for something out of the first build, Part 2,
binds nothing). A new feature's text is plain, specific and true, and it never shows the player the engine: inputs,
weights, dimensions, segments, a command's id or a file name. A new source of text is read and given a status in the
text inventory (Part 2, layer 0), and a changed one is read again and marked again in the same commit. Comments keep
this project's voice; player text keeps the player's.

**Mutation-test every claim a test protects.** A surviving mutation usually means a redundant guard that an earlier
clamp already settles.

---

# Part 2 — SLATE's rules

## The owner's words (SLATE's mandate, 2026-10-26)

> This should be completed perfectly and 100% from end to end. Every single feature on every single page should
> read, bite, and have downstream effects. I want 0 decorations, meaning nothing should be there for show at all;
> everything needs to 100% perfectly read, bite, and have a downstream effect. I want the complete coverage matrix
> and coverage research for each feature, and I want every one 100% covered, so no stopping until it's done and no
> half facts: do whatever it takes to find it. It will retain the most perfect and beautiful UI and navigation
> system known to man. Build my code from top to bottom in the proper perfect order, just how it should be, and
> everything should be 100% connected cohesively and logically while 100% reading, biting, and having downstream
> effects.

And from earlier the same day, still in force: a natural, coherent and realistic voice in every word the game says;
real engines researched to the source behind every field, Billed As and race or ethnicity included; whatever reads a
place covers the whole map built into the game; and no merge or deployment without the owner's word.

## The rules

- **The main law (the owner, 2026-11-01, over everything else, for all that is built and all to come).** "I asked for
  continuity, uniqueness, and freshness to everything this game produces. None should be or feel repetitive, the
  same, and decoration. Everything should 100% perfectly flow cohesively and logically covering every single basis
  and leaving no stone unturned." Every engine, line, draw and screen is held to it: what the game makes (a part, a
  note, a reader's grade, a notice, a line of text) comes from the life's own state and draws, so no two lives and no
  two moments read alike, and nothing repeats that the real thing wouldn't; each thing follows from what came before
  and is read by what comes after; and every basis the research names is covered or named as not modeled. A test
  holds it where it can be held (no two outputs alike for different lives or moments, no line said twice in a row).
  It applies again to what is built already: each engine is checked against it, and what falls short is fixed.
  And with it (the owner, the same day): "everything will be tested like crazy and will be until we get the perfect
  formula for how the backbone of this game operates." Every engine is tested past its unit tests: whole lives run
  through it over many seeds and levels, its outcomes held against the research's real distributions, and each
  formula kept under test and retuned until the owner calls it right; no formula is final before then.
- **Read, bite, downstream.** Every feature on every page reads real state, changes real state when acted on, and is
  read in turn by something else that changes an outcome the player meets. A feature that fails any of the three is
  not built. The proof is mechanical: a feature-to-effect matrix with a consumer at a file and line for every
  feature, and the falsifiability test on every claim (change the input; the outcome changes, not only the
  sentence). The gate that checks both runs on every commit and fails the build on a miss.
- **Zero decoration.** Nothing shown that nothing reads; nothing asked that nothing uses; no number typed where a sum
  belongs; no choice that ends the same whichever way it's made; no text that explains instead of does.
- **Full coverage, researched to the source.** Every engine has a coverage matrix; every engine that reads a place
  covers all 252 countries and territories and every place of the map, as many as the GeoNames release the gazetteer
  reads holds (the owner, 2026-11-02: not the first SLATE's 170,911; SLATE's ruling of 2026-10-26 holds, "Use today's
  GeoNames release, keep going."); every row cites the primary source and the
  date it was read, in a research register the gate holds; a row without its source fails. Do everything possible to
  find a fact (web search in every phrasing, the institution's own site and documents, official registers, trade
  press quoting a primary source, archived copies). A fact not found is a blocker recorded by name and date, never a
  guess; the game tells the player what isn't modeled, and nothing is invented. No half facts: a figure from memory
  or a summary is not a figure.
- **No stopping until done.** Done is the whole matrix covered and the gate green from end to end, not a first
  screen that works. Work is checkpointed in `HANDOFF.md` so an interruption resumes, never restarts. And (the
  owner, 2026-11-02): "I want everything done perfectly and to not be finished until you personally feel we've
  gotten all the information we could possibly obtain." No layer, engine or research row is called finished while
  any avenue for a fact is untried; a blocker is recorded only after every method has been tried, and the report
  says which were tried.
- **Built in order, top to bottom.** Each layer is proven (its tests, its coverage matrix, its research register
  rows, the gate green) before the next is laid on it; nothing in a later layer is started on an assumption about
  an earlier one:
  0. The repository and the gate (the toolchain pinned; typecheck, lint, tests, the feature-to-effect matrix, the
     falsifiability tests, the coverage matrices, the research register, the text inventory, zero-decoration).
  1. The core (time, deterministic randomness, money, the simulation frame, persistence).
  2. The world (the gazetteer and map, the clock, the weather, holidays, prices).
  3. The person's papers and money.
  4. The person.
  5. The screens, in the player's order, each drawn only from state layers 1 to 4 already hold and test.
  6. Dropped (the owner, 2026-11-02: "Don't need Layer 6"). SLATE's layer 6 was a separate pass rewriting every
     string in the owner's voice after the screens. There is no such pass here: the voice rule binds each string as
     it is written, and the text inventory holds it from layer 0.
  7. Verification, end to end: long played lives on real clocks across many places, the falsifiability twins for
     every claim, the matrices complete, the gate green in a clean clone.
- **Connected, cohesive, logical.** One model of the world, every system reading the same state through the same
  engines, no second copy of a fact anywhere; dates, money, places, papers and history never contradict one another,
  and a test holds each such invariant.
- **The voice.** Natural, coherent and realistic in every word the game says, with the engine's vocabulary kept out
  of the player's sight.
- **The UI and the navigation.** The first SLATE's look (its tokens, type, spacing, dark field and gold accent, kept
  in `docs/kept/01-startup-and-persistence/tokens.css`; its one-card-per-thing pages, its menu and top bar) is the
  starting standard, refined into the best interface and navigation the owner has seen, never cluttered: every
  control earns its place by read, bite, downstream, and every screen reads in the order a person would ask its
  questions.
- **Title Case on screens.** `.claude/rules/title-case.md`.

Out of the first build, by the owner's rulings in SLATE: Yale and the School, the career engine, dispositions and
traits, the tutorial and the manual, the body, meals and nourishment, energy and stress, readiness, the earlier
residence, the free-text background. The attributes were on that list until the owner's ruling of 2026-10-31
brought them back for all four roles.

The owner decides: the premise's detail (what the life is a life of, beyond "an actor/actress life simulator"), home
on the first morning, the start date, whether Sleep stays as a clock action, the final wording of every screen, and
which of SLATE's features come over. Ask only when a reading would change the work materially; otherwise decide and
report.

**Parallel subagents (SLATE, from 2026-10-30, the owner: "Enable Parallel Subagent Execution ... explicitly instruct
it to launch parallel subagents ... Delegate independent tasks ... so they run simultaneously rather than
sequentially").** Independent work (research per country, separate engines, drafting and testing) is split across
subagents running at once. The lead agent briefs each one, holds the shared files (the register, `HANDOFF.md`, git)
itself, checks each result against its sources before it lands, and runs the gate; a subagent's report is checked,
never taken on trust. Every rule here binds a subagent as it binds the lead.

Development tools: `.claude/rules/dev-tools.md` says which rules win where a tool's instructions overlap these.

Git: commit messages say what was decided and why; never force-push; no merge to `main` and no deployment without
the owner's explicit word.
