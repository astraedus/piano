# Exec Plan — Three-Axis Progress (make progression OBVIOUS)

**Owner intent (verbatim):** "Everything in music breaks down into generation, ability to play
(technical ability), and pattern recognition. We have Neon + Clerk account-based progression —
make the progress bar / skill level / how far we're progressing seen and obvious."

**Core insight from the design pass:** the owner's ask and the app's worst real bug are the same problem.
`earLevel` (1–7, the Pattern-Recognition axis) is set at onboarding, used by `generateEarRound`, but
**never advanced by `sessions.ts` and rendered nowhere outside Settings** — a dead axis. Making progress
visible across the three pillars AND giving the Pattern-Recognition pillar a live signal is ONE upgrade.

**Deep grounding (file:symbol facts) lives in `docs/research/progress-axes-grounding.md` — READ IT FIRST.**
Full idea pool + judge rationale: `docs/research/progress-axes-ideas.json`.

All four features read **already-persisted, Neon-synced `AppState`** — no schema migration. The only new
*written* state is advancing the existing `earLevel` field + one new arc event kind. Cloud sync pushes the
full `AppState` blob (`cloudSync.ts`), so new derived UI needs no sync work; the earLevel write rides the
existing debounced push automatically.

## Build order (sequential — later steps depend on earlier ones)

### 1. Skill-learned count + per-tier completion (effort S) — warm-up, lowest risk
- `/tree` header (`src/app/tree/page.tsx`) currently shows `"Xh · N sessions · N pieces"` and never a
  skill count. Add **"N of M skills learned"** derived from `skillProgress` (count `status === "learned"`)
  over the node list for the active instrument.
- `PathView.tsx` (tier-grouped node list) has no aggregate. Add a **per-tier completion fraction/bar**
  (learned / total in that tier). Fold the standalone "tier bar" and "header pill" ideas in here — ONE
  skill-count surface, do not ship three.
- Pure derivation. Add unit tests for the count/fraction helper (put the helper in `lib/`, test it there).

### 2. Ear Level visibility + auto-advance (effort M) — fix the dead axis
- In `sessions.ts` (where XP/streak/level already update at session end), **advance `earLevel`** when the
  user is performing well: read the recently logged `earResults` (the report notes `sessions.slice(-3)`),
  and bump `earLevel` up one when accuracy clears a threshold over a short window. **Cap at L5** — only
  L1–L5 have authored rounds (L6/L7 have no content; advancing past 5 would generate nothing). This cap is
  correct and honest, not a TODO.
- Emit a new `arc` event (`kind: "ear-level-up"`, analogous to the existing `level-up`) when it advances,
  so the Timeline/Arc shows it.
- Surface `earLevel` in the UI with a human label (it currently only appears in the Settings picker). The
  Three-Axis card (step 4) is its primary surface; also ensure it's legible wherever ear progress shows.
- Tests: the advance logic is pure-ish — extract the decision (given recent earResults + current level →
  new level) into a tested `lib/` function. Cover: advances on good accuracy, holds otherwise, never
  exceeds L5, grace on a single bad round.

### 3. Interval Training rounds (effort M) — give earLevel content + close theory loop
- `earRounds.ts`: the `interval` value is in the `EarRoundType` union but `generateEarRound` never emits it.
  Implement interval rounds (play two notes / a dyad, ask the interval). Gate by `earLevel`. Reuse the
  existing round/answer plumbing and `playSequence`/audio.
- Fold in the **post-answer TermChip auto-reveal**: after answering, auto-open the relevant theory term via
  the existing `useExplain` imperative-open + `EarChoice.termId` pattern (`components/explain/*`). This was a
  separate idea — ship it bundled here, not standalone.
- Tests: interval round generation (correct answer set, deterministic given a seed), gating by level.

### 4. Three-Axis Progress Summary Card in Horizons (effort M) — the headline deliverable, build LAST
- Add to `Horizons.tsx` (renders every load, already shows `keysTouched / 24`). A card that **names all
  three pillars** for the first time and shows a real number/bar per axis, read from existing state:
  - **Generation** — pick the best available proxy from existing state (e.g. improv/free-slot engagement,
    `first-improv` arc event, pieces marked "yours"). If there is genuinely no generation signal yet, show
    an honest "just getting started" state rather than a fake number — do NOT invent a `generationScore`
    field (the judge explicitly cut that).
  - **Ability** — skill-learned count (from step 1) and/or level/XP.
  - **Pattern Recognition** — the now-live `earLevel` (from step 2) + interval accuracy (from step 3).
- Build last so it displays the now-moving earLevel, interval accuracy, and skill count on day one.
- Must read cleanly on mobile (Horizons stacks). Match Warm Studio tokens.
- Tests: the per-axis derivation helpers (pure functions in `lib/`).

## Also fold in (small, from live QA)
- **Focus-ring bug:** the onboarding name input's focus ring renders **red/terracotta** (reads as an error
  state) instead of the gold accent. Fix the focus border/ring to use the accent token
  (`--accent-deep` / `--accent-soft`), consistent with the rest of the flow. Find it in `Onboarding.tsx`
  (step 4 name input) and/or `globals.css`.

## Constraints (hard)
- **Design = "Warm Studio"** tokens only (`app/globals.css` `:root`). Never write `data-*` attrs directly —
  use `setRootAttrs()` from `lib/domAttrs.ts`.
- **Tests are part of the change** — every feature ships with unit tests. Pure `lib/` logic tested first.
- **Gate before declaring done:** `npx tsc --noEmit && npm run test:run && npm run build` must all pass.
  Trust `npx tsc --noEmit`, NOT editor/LSP diagnostics (they go stale in this repo after renames).
- **Do NOT push and do NOT deploy.** Commit locally on a branch is fine; main auto-deploys on push and this
  is the owner's live personal app — leave the push to the orchestrator after QA.
- Keep changes additive; do not refactor unrelated systems. Don't touch the RC/Clerk/Neon wiring beyond the
  earLevel write that rides the existing sync.
- If any grounding fact turns out wrong when you open the file, return `blocked: need X` with what you found —
  do NOT guess or invent fields.
