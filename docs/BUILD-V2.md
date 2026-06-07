# V2 Build — Gamification + Guitar-Native Loop

Owner asked (2026-06-07) for: XP/streak/points layer + make the guitar daily loop fully guitar-native (chord/riff-of-the-week, fretboard progress map, guitar ear training). Layer gamification ON TOP of the existing capability/territory model (don't replace it). Forgiving streaks (1 missed day = grace) to keep the anti-dropoff soul.

Dependency: **A (foundation, sequential) → {B1 ∥ B2} → C (verify+deploy)**

| Phase | What | Isolation | Status |
|-------|------|-----------|--------|
| A | Core: progression engine (XP/levels/streak) + types + sessions integration + instrument-aware hooks on InstrumentModule (focusKind/focusRotation, earRounds, progressMapKind) + generalize "ghost" → focus + tests | main, sequential | ✅ |
| B1 | Guitar-native data: chord/riff-of-the-week focus rotation, guitar ear rounds (intervals/chord-quality), fretboard progress-map data + `GuitarMap` component, wire /tree map switch | worktree | ✅ |
| B2 | Gamification UI: XP bar + level badge + streak flame, level-up reward moment, surface in AppShell/PracticeStand/Arc, instrument-aware "focus of the week" header | worktree | ✅ |
| C | Gate (tsc+vitest+build) + screenshots + telegram + push/deploy | main | ✅ |

**FINAL (main @ 1aa9e4a, pushed/deployed):** tsc clean · 183 tests · build 10/10. XP/levels/streaks (forgiving: 1 missed day = grace) + guitar-native loop (chord-of-the-week, fretboard "neck map", guitar ear training) all live.

Known issue (pre-existing, NOT from V2, dev-only): HomeGate hydration-mismatch warning shows in the dev overlay / instrumented-Chrome console. Prod `build` is clean (no error). Likely the localStorage boot-script + App-Router RedirectErrorBoundary, possibly amplified by browser-extension DOM injection in the QA Chrome. React self-heals (regenerates on client). Not blind-patched — needs a dedicated debug pass in a clean browser to confirm root cause before changing code.

File ownership (B1∥B2 disjoint): B1 = lib/guitar/*, components/GuitarMap.tsx, app/tree/page.tsx. B2 = components/{XPBar,LevelBadge,StreakFlame,LevelUpModal}.tsx, AppShell.tsx, PracticeStand.tsx, YourArc.tsx, globals.css.

Worktree base fix: each worktree agent must `git merge origin/main --no-edit` at start (last round both worktrees forked from a stale ref — origin/main is current).
