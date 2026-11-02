# CLAUDE.md — SLATE-REBUILD

This repository is a fresh rebuild of SLATE, an actor/actress life simulator. Its rules are SLATE's
(`montrealroots/SLATE`: `CLAUDE.md`, `docs/MANDATE.md`, `docs/BUILD-ORDER.md`, `.claude/rules/title-case.md`),
brought over on 2026-11-02 at the owner's word: "Bring over all of SLATE's rules except the one-agent rule and
deploying to base44." The one-agent rule (SLATE's MANDATE rule 9) is left out; parallel subagents hold instead
(below). SLATE's rules never named Base44, so nothing was removed for it; Base44 deployment was 1221's, and this
repository has none.

Features come over from SLATE one at a time, as the owner picks them. Nothing from SLATE's code, research or
package is assumed here until it is brought over. Read `HANDOFF.md` for where the build stands.

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
  covers all 252 countries and territories and 170,911 places of the map; every row cites the primary source and the
  date it was read, in a research register the gate holds; a row without its source fails. Do everything possible to
  find a fact (web search in every phrasing, the institution's own site and documents, official registers, trade
  press quoting a primary source, archived copies). A fact not found is a blocker recorded by name and date, never a
  guess; the game tells the player what isn't modeled, and nothing is invented. No half facts: a figure from memory
  or a summary is not a figure.
- **No stopping until done.** Done is the whole matrix covered and the gate green from end to end, not a first
  screen that works. Work is checkpointed in `HANDOFF.md` so an interruption resumes, never restarts.
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
  6. The voice: every string rewritten in the owner's voice against the text inventory, with the voice checks in
     the gate.
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
