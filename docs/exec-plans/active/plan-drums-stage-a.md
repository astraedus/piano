# Exec Plan — DRUMS module, Stage A (spine generalization + Tier-0 foundation)

Owner-approved 2026-07-17. Plan of record: `docs/research/drums-module-design.md` (decisions 1-12).
Backing research: `docs/research/drums/*.json`. Voice: zero unexplained jargon, WHY lines land for a cold beginner.

## Increments (commit per increment)

### 1. Spine primitives (decisions 1,2,5,7,8,9,12 + shared helpers)
- `types.ts`: `Instrument += "drums"`; `focusKind += "rudiment"`; EarRound audio kind `+= "sticking"` + optional `sticking`/`bpm` payload.
- `instrumentRegistry.ts`: `focusKind: key|chord|rudiment`; `progressMapKind: keymap|fretboard|rudiments`.
- `audio.ts`: percussion layer — `playSticking(pattern, bpm)` (MembraneSynth thud + NoiseSynth stick attack, R/L pan, accent velocity); `playEarRound` handles kind `"sticking"`.
- `transitionDrill.ts`: prefix ternary → `Record<Instrument,string>` map incl. `d`; widen `TransitionPair.instrument`/`findTransitionPair`/`transitionNodeId` to `Instrument`.
- `domAttrs.ts`: `readInstrument` accepts `drums`.
- `LessonMedia.tsx`: `InstrumentDefault` 2-way branch → switch (drums → PadVisual).
- `globals.css`: `:root[data-instrument="drums"]` bronze/brass accent (light + dark, mirrors guitar block).
- `warmupLines.ts` (NEW): extract `fillWarmupLine(line, ghostKey)` (was inline in WarmupSlot) → shared pure helper.
- `print/page.tsx`: route warmup lines through `fillWarmupLine`; focusEyebrow switch; focusName via `mod.focusLabel`.

### 2. Tonal gating (decision 3) — gate on `focusKind === "rudiment"` (non-tonal)
- `PracticeStand.tsx`: focusEyebrow switch (+Rudiment of the Week); header focus label — no tonal TermChip for non-tonal; StartHere hint drums branch.
- `WarmupSlot.tsx`: gate the scale/fingering/Hear-the-Scale/notation block; non-tonal shows PadVisual + rudiment label + Hear-the-sticking. `warmupReferenceLabel` += rudiment case; use `fillWarmupLine` helper.
- `ChainDrillSlot.tsx`: gate progression/pentatonic disclosure; non-tonal shows RhythmGrid + Hear-the-sticking.
- `GhostPicker.tsx` + `settings/page.tsx`: non-tonal → rotation tokens labeled via focusLabel, hide the 24-key wheel.
- `Horizons.tsx`: `Key · KEY_META` → `{focusNoun} · module.focusLabel(token)` (also fixes guitar mislabel).

### 3. Drums module (`src/lib/drums/`) (decisions 4,6)
- `focus.ts` — the ONE token→rudiment interpreter (label/blurb/pattern), `drumsFocusLabel`.
- `components/PadVisual.tsx`, `components/RhythmGrid.tsx`.
- `curriculum.ts` (DRUMS_GHOST_ROTATION — Stage A: `["C"]` all phases, see deviation), `skillNodes.ts` (4 Tier-0), `lessons.ts` (4), `chainDrills.ts` (4), `warmups.ts`, `unlocks.ts` (4), `earRounds.ts` (L1-L2 gen + gates).
- `module.tsx` self-registers; import in `useAppState.tsx`.

### 4. Onboarding / settings / AppShell drums card + experience mapping (decision 10)
- Onboarding: drums instrument card, drums phase options w/ earLevelFloor + ghost token.
- settings + AppShell INSTRUMENTS lists += drums.

### 5. /tree RudimentLadder (decision 6)
- `RudimentLadder.tsx`; tree `ProgressMap` + `mapLabel` handle `rudiments`.

### 6. Glossary + tests (decisions 4,11)
- Glossary: practice pad, matched grip, fulcrum, rebound, four strokes, rudiment, metronome (mind no-shadow test).
- Tests: drums module.test (registration/DAG/gates/ghost tokens), contentAudit-drums, focus.test, earRounds.test, RhythmGrid+PadVisual render, audio smoke, non-tonal-module class guard, tonal-gating tests.

## Deviations from design doc (document in final report)
- **Ghost rotation Stage A = `["C"]` (singles) all phases**, not doc's `phase1: singles,doubles,accents`. Doubles/accents nodes+drills arrive in Stage B; shipping their tokens now would surface a "Rudiment of the Week: Double Stroke Roll" with no content. Full 8-token focus map still defined (ready for B).
- **earLevelGates L2 → `d-t0-click`** (Stage-A analog of counting), not doc's `d-t1-counting` (doesn't exist yet). L1 always ungated (type only gates 2-5). Stage B re-points to Tier-1/2 nodes.
- The 4 Tier-0 drills all use ghostKey `"C"` (single strokes underpin all foundational pad work).

## Gate
`npx tsc --noEmit && npm run test:run && npm run build` (trust tsc, not editor diagnostics).
