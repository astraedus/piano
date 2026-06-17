# Exec Plan — Curriculum Batch 2 (pedagogy/motivation layer)

**Status: QUEUED — not started.** Batch 1 shipped & live (merge `a207bbd`). This is the next batch.
**Source of truth:** `docs/research/curriculum-audit-2026-06-17.md` (answers Q1-Q7 + ranked plan; items #3/#7/#8 below).
Fingering reference: `docs/research/piano-scale-fingerings.md`.

**Why queued mid-session:** hit the account session limit 2026-06-17 (resets ~1:30pm Brisbane). Resume by running
the SAME loop batch 1 used: dev build → independent adversarial + music-theory review (report-only) → fix pass →
fresh-build QA (VERIFY served BUILD_ID — see CLAUDE.md QA note) → merge to main → push (auto-deploys).

## Build order

### #3 — Taught, interactive Circle of Fifths (effort M) — the owner's explicit Q2, do FIRST
The KeyMap wheel (`src/components/KeyMap.tsx`) ALREADY renders a correct circle of fifths (majors outer / relative
minors inner, clockwise) — it's just never named or taught. KeyDetailPanel already generates AND plays the I-IV-V
progression. So this is labeling + a highlight overlay + a glossary entry on existing data, NOT new infra.
- Name it "Circle of Fifths" in the UI (center label is currently "The Keys"); add a glossary entry
  (`src/lib/explain/glossary.ts` — there is none for "circle of fifths"/"fifths").
- On key-tap, highlight that key's **I** (root), **V** (clockwise neighbor), **IV** (counter-clockwise neighbor),
  and **vi** (inner-ring relative minor) simultaneously on the wheel + a chord grid below, with audio playback
  (reuse the chord playback already in KeyDetailPanel).
- One-line caption teaching the adjacency rule: I-IV-V are the three adjacent majors; vi is the inner neighbor —
  "these four chords are most pop songs."
- Extends: `KeyMap.tsx`, KeyDetailPanel, `src/lib/music.ts` (CIRCLE_MAJORS/MINORS, progressionChords), `glossary.ts`.
- Tests: the I/IV/V/vi neighbor derivation (pure fn — given a key, return its 4 circle neighbors), with pins.

### #7 — "Pop Formula" song catalog + song-unlock cards (effort M) — NEEDS owner song input
- Extend the existing `p-t2-pop-formula` node + `src/lib/guitar/songs.ts` with a "Songs You Can Now Play" panel:
  8-10 recognizable titles per progression (I-V-vi-IV, I-IV-V, I-vi-IV-V), tagged by progression/key.
- Add a song-unlock card (variant of the existing unlock card) fired from `endSession` when a song's prereq nodes
  all become learned ("You can now play Wonderwall").
- **OWNER INPUT NEEDED before building:** which songs to feature (taste/licensing-safe titles). Propose a list,
  get Anti's pick, THEN build. Don't fabricate a catalog unilaterally.
- Extends: `glossary.ts` (pop-formula), `guitar/songs.ts`, `sessions.ts` (endSession unlock firing), unlock card component.

### #8 — Guitar capo module (effort M) — guitar key-multiplier, LAST
- Add a `g-t1-capo` skill node after open chords: a static capo chart (5 shapes × frets 0-7 → sounding key) + a
  two-dropdown capo calculator (target key + shape → fret). Reuse the One-Minute-Changes drill; add a capo indicator
  to `ChordDiagram`.
- Extends: `src/lib/guitar/skillNodes.ts`, `src/lib/guitar/components/ChordDiagram.tsx`, `src/components/LessonMedia.tsx`.
- Tests: the capo calculator (shape + fret → sounding key) pure fn.

## Constraints (same as batch 1)
- Branch `feat/curriculum-batch-2` off main; commit per-item; do NOT push until merged after QA. Web build only.
- Tests are part of the change. Warm Studio tokens; setRootAttrs; theory-correct (cross-check the audit + fingering docs).
- GATE: `npx tsc --noEmit && npm run test:run && npm run build` all green. Trust tsc, not editor diagnostics.
- QA on `next start`: free the port with `fuser -k PORT/tcp` (NOT pkill -f, it self-matches the shell) and VERIFY the
  served BUILD_ID before trusting QA — a stale server reads as "feature absent" across the board (cost us a false FAIL).
- Music content must be theory-correct; a reviewer already caught a fabricated fingering and a bypassable gate — keep
  the adversarial + music-theory review lenses.

## Optional polish carried over from batch-1 QA (taste-level, low priority)
- The Warmup RH/LH fingering toggle is low-affordance — consider a stronger selected-state.
- Home horizon italic sub-captions are low-contrast (`--ink-3` on cream) — nudge to `--ink-2`.
