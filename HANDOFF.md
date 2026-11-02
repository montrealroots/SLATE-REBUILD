# Handoff

Where the rebuild stands, kept current at every checkpoint so an interrupted session resumes rather than restarts.
Read `CLAUDE.md` first.

## Where the build stands

- Branch `claude/quirky-gauss-gnub7q`, off `main` at `3b54d71`. Nothing is merged; nothing is deployed.
- The development tools are set up (`tools/setup/README.md`; `bash tools/setup/verify.sh` reports each one).
- 1221's rules, then SLATE's, are brought over (`CLAUDE.md`, `.claude/rules/`, `docs/STYLE.md`, `docs/GLOSSARY.md`), without SLATE's one-agent rule or 1221's Base44 deployment (2026-11-02).
- No feature from SLATE has been brought over yet. Layer 0 (the repository and the gate) is not started.

## Next

The owner picks which of SLATE's features come over, one at a time. SLATE's 41 engines, by layer, are listed in
`montrealroots/SLATE`'s `registry/engines.json`.
