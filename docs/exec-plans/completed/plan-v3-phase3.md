# Plan: V3 Phase 3 (P3a + P3b) — motor-learning surfacing + framing

## Goal
Surface the P1/P2 motor-learning logic (spaced retrieval, fluency, difficulty, daily framing, mental practice) in the UI. Consume P1/P2 data; degrade gracefully when absent. No regression to 272 tests.

## Recs
- R7 spaced-retrieval: "Bring back: {skill}" review cards in Free Play; mark-done advances review.
- R10 fluency: fluency-check flow on learned nodes in SkillGraphPanel; "Fluent" badge on node + panel.
- R3 difficulty: difficultyVerdict ("Too easy / Just right / Too hard") in SkillGraphPanel.
- R1 daily framing: "15 minutes today beats 2 hours on Sunday." in Onboarding + on the stand.
- R9 mental practice: dismissible audiation card on stand (esp. first-back mode).

## Steps
- [ ] useAppState: add `reviewSkill(nodeId)` (advanceReview on skillReview) + `markFluent(nodeId)` (markNodeFluent on skillProgress).
- [ ] FreeSlot: render review prompts from `reviewSkills`, wire `reviewSkill`.
- [ ] SkillGraphNode: render "Fluent" badge when data.fluent; thread fluent via layout data.
- [ ] skillGraphLayout: add `fluent` to node data.
- [ ] SkillGraphPanel: fluency-check (prompt + "I did it"), Fluent badge, difficulty verdict. New props from container.
- [ ] SkillGraph (container): pass progress-derived isFluent + difficulty + markFluent.
- [ ] PracticeStand: daily-framing line near stats; mental-practice card (dismissible, first-back aware).
- [ ] Onboarding: daily-framing line.
- [ ] Tests for new hook actions + new pure surfacing (difficulty/fluency display logic if any).
- [ ] Gate: tsc, test:run, build. Screenshots. Commit.

## Decisions made
- Section micro-labels in SkillGraphPanel are an existing stylistic choice (lowercase); new functional copy uses CAPITALIZED voice per task. No em-dashes in app copy.
- Mental-practice card uses localStorage-free session dismiss (useState) to avoid a state migration; it reappears next session, which is the intended "helpful option, not nag" behavior since it is only shown in first-back / once per session.
