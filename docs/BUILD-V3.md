# V3 Build — Motor-Learning Actionables (R1-R10)

Source: `docs/research/motor-learning.md`. Owner asked (2026-06-08) to implement all actionable recommendations. Layer on top of existing systems; keep everything working.

Coupling note: R2/R4/R5 all rewrite the SAME drill-execution loop; R3/R8 both need per-rep success capture. So this is mostly SEQUENTIAL (shared core), with only a light parallel tail.

Dependency: **P1 core logic → P2 rep-engine UI → {P3a surfacing ∥ P3b framing} → verify/deploy**

| Phase | Recs | What | Isolation | Status |
|-------|------|------|-----------|--------|
| P1 | R3,R4,R6,R7,R8,R10 (logic) | Model + pure logic: rep-block/BPM-ladder/interleave config on drills; per-rep quality fields on SessionLog; success-rate-gated node completion + fluency milestone on SkillNode; spaced-retrieval queue; quality-weighted XP + minimal warmup XP; interleave + review selection in todayPlan. Tests. | main | ✅ |
| P2 | R2,R4,R5,R8 (UI) | Rep-engine: chain-drill + ear execution loop with micro-rest (10-15s) pauses, interleaved rep order, BPM laddering (+5 on 3 successes, metronome via Tone.js), per-rep immediate success feedback (<2s). | main | ⬜ |
| P3a | R7,R10,R3 (UI) | Surfacing: spaced-retrieval "review" skills in free-play/ear; fluency-test milestone flow on skill nodes; success-rate "just right / too easy" indicator. | worktree | ⬜ |
| P3b | R1,R9 (UI/copy) | Daily-practice framing (onboarding + stand: "15 min today > 2 hrs Sunday"); mental-practice card (rest day / missed day / pre-sleep). | worktree | ⬜ |
| P4 | - | Merge-gate, verify, screenshots, telegram, push/deploy | main | ⬜ |

Already-correct (confirmed by research, minimal/no change): warmup slot length+content (R6 — just decouple XP); forgiving streaks (R8 — keep).

Worktree base fix: P3a/P3b agents must `git merge main --no-edit` at start (confirm `git log -1` = the P2 commit) to avoid stale-ref fork.
LSP diagnostics are STALE in this repo; trust `npx tsc --noEmit`.
