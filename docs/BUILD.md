# Multi-Instrument Build — Status Tracker

Plan: `docs/research/plan.md`. Reports: `docs/research/{audit,guitar,libs,design}.md`.

Goal: extend piano-only app → **piano + electric guitar**, real skill-tree DAG, Warm Studio colorful UI, tests.

Dependency graph: **P0 → {P1 ∥ P2} → P3 → {P4 ∥ P5} → P6**

| Phase | What | Gate | Status |
|-------|------|------|--------|
| P0 | Foundation: types(v2), storage migration, skillTree DAG engine, instrumentRegistry, domAttrs, Warm Studio tokens | 30 tests green | ✅ |
| P1 | Piano migration onto spine (lib/piano/*, PracticeStand, module) | 43 tests, identical behavior | ✅ |
| P2 | Bug-fix sweep (6 skill-tree/ghost/depth bugs → DAG-driven unlocks) | 69 tests | ✅ |
| P3 | SkillGraph render (xyflow+dagre, filter, side panel, pulse) | 96 tests, SSR-safe | ✅ |
| P4 | Guitar content + visuals (Fretboard, ChordDiagram, Tab, 27 nodes) | 134 tests, build green | ✅ |
| P5 | Design polish (Warm Studio across all components + motion) | 134 tests, screenshots | ✅ |
| P6 | Integration verify (visual QA both instruments) + Telegram screenshots | all screens verified | ✅ |

**FINAL STATE (main @ a8d44ea):** tsc clean · 134 tests · build 10/10 · piano + electric guitar both working.

Notes for next instance:
- Worktree isolation forked both P4/P5 from stale base `76d1691`; P4 self-corrected (ff to main), P5 did not → P5 was re-applied onto main as a fresh pass using its branch as the design spec. If running parallel dev again, verify each worktree's base with `git merge-base main <branch>` before merging.
- LSP/editor diagnostics are STALE in this repo after the `git mv` renames (phantom `module.ts`, false UnlockCardModal "not found"). Trust `npx tsc --noEmit`, not editor diagnostics.
- Architecture: instrument-agnostic spine + `InstrumentModule` registry (`lib/instrumentRegistry.ts`). Add an instrument = new `lib/<name>/` dir (module.tsx self-registers) + one import line in `useAppState.tsx`. Skill tree = real DAG (`lib/skillTree.ts`); nodes link to unlocks via `SkillNode.unlockCardId` and to drills via `chainDrillId`.
- Storage migrated `piano.state` → `practice.state` (v1→v2), old key kept as backup.

Taste calls made (owner said "surprise me"): light-first Warm Studio default (dark retained as toggle); guitar accent = warm crimson #C0432E (softened from alarm-red).

Not yet done (optional follow-ups): deploy new build to Vercel (live site still old); deeper interactive QA (run a full session to fire a real unlock); skill-graph default zoom could fit tighter; HomeGate dev-only hydration warning.
