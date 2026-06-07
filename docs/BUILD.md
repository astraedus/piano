# Multi-Instrument Build — Status Tracker

Plan: `docs/research/plan.md`. Reports: `docs/research/{audit,guitar,libs,design}.md`.

Goal: extend piano-only app → **piano + electric guitar**, real skill-tree DAG, Warm Studio colorful UI, tests.

Dependency graph: **P0 → {P1 ∥ P2} → P3 → {P4 ∥ P5} → P6**

| Phase | What | Agent | Isolation | Gate | Status |
|-------|------|-------|-----------|------|--------|
| P0 | Foundation: types(v2), storage migration, skillTree DAG engine + tests, instrumentRegistry, domAttrs, globals.css Warm Studio tokens, deps | senior-dev | main | tsc+vitest+build green | ⏳ |
| P1 | Piano migration onto spine (lib/piano/*, PracticeStand, module) | senior-dev | worktree A | piano runs identically + tests | ⬜ |
| P2 | Bug-fix sweep (6 skill-tree/ghost/depth bugs) | dev | worktree B | bug regression tests pass | ⬜ |
| P3 | SkillGraph render (xyflow+dagre, filter, side panel) | senior-dev | main | DAG renders correct states | ⬜ |
| P4 | Guitar content + visuals (Fretboard, ChordDiagram, Tab, 26 nodes) | senior-dev | worktree C | guitar selectable + renders | ⬜ |
| P5 | Design polish (Warm Studio across all components + motion) | dev | worktree D | visual QA screenshots | ⬜ |
| P6 | Integration QA + deploy | qa + codex | main | full-flow + deploy | ⬜ |

Merge order: P1 before P2; P4 before P5. All parallel = `isolation: worktree`.

Taste calls made (owner said "surprise me"): light-first Warm Studio default (dark retained as toggle); guitar accent = warm crimson (softened from alarm-red); skill graph tier-collapsible on mobile if dense.
