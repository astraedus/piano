import { describe, it, expect } from "vitest";
import { endSession, depthBumpForSession } from "./sessions";
import { defaultState } from "./storage";
import type { AppState, KeyId, SessionLog, SessionSlotLog, SkillProgress } from "./types";
import { PIANO_NODES } from "./piano/skillNodes";
import { UNLOCK_LIBRARY } from "./piano/unlocks";
import { XP_AWARDS, levelForXp } from "./progression";
import "./piano/module"; // self-registers piano so getModuleSync resolves

function stateWith(partial: Partial<AppState> = {}): AppState {
  return { ...defaultState(), ...partial };
}

function logBase(partial: Partial<Omit<SessionLog, "id">> = {}): Omit<SessionLog, "id"> {
  const slots: SessionSlotLog[] = partial.slotsTouched ?? [
    { slot: "warmup", touched: true },
    { slot: "chain", touched: true },
  ];
  return {
    startedAt: "2026-06-07T10:00:00.000Z",
    endedAt: "2026-06-07T10:30:00.000Z",
    minutes: 30,
    ghostKey: "C",
    phase: 1,
    mode: "full",
    ...partial,
    slotsTouched: slots,
  };
}

const learned = (): SkillProgress => ({ status: "learned", reps: 5, learnedAt: "2026-01-01" });

// ───────────────────────── B4 — depthBumpForSession ─────────────────────────
describe("depthBumpForSession — B4 depth-4 (Lived) promotion", () => {
  const fullSlots: SessionSlotLog[] = [
    { slot: "warmup", touched: true },
    { slot: "chain", touched: true },
    { slot: "piece", touched: true },
  ];

  it("promotes the working key to depth 4 when a piece in that key is logged", () => {
    const log: SessionLog = {
      id: "s1",
      ...logBase({ ghostKey: "C", pieceId: "p1", chainDrillId: "p1-c-major-chain", slotsTouched: fullSlots }),
    };
    const next = depthBumpForSession({ C: 3 }, log, "C");
    expect(next.C).toBe(4);
  });

  it("does NOT skip levels — a fresh key only reaches the chain-bump ceiling without a piece", () => {
    const log: SessionLog = {
      id: "s2",
      ...logBase({ ghostKey: "G", chainDrillId: "p1-g-major-chain" }),
    };
    // warmup + chain, no piece → max depth 3 (Played), never 4.
    const next = depthBumpForSession({}, log, undefined);
    expect(next.G).toBe(3);
    expect(next.G).toBeLessThan(4);
  });

  it("does not promote to 4 when the piece key differs from the ghost/working key", () => {
    const log: SessionLog = {
      id: "s3",
      ...logBase({ ghostKey: "C", pieceId: "p1", chainDrillId: "p1-c-major-chain", slotsTouched: fullSlots }),
    };
    // Piece is in G, but the worked key this week is C → C does not jump to 4.
    const next = depthBumpForSession({ C: 3 }, log, "G" as KeyId);
    expect(next.C).toBe(3);
  });

  it("does not promote in first-back mode (a quick check-in shouldn't bank Lived)", () => {
    const log: SessionLog = {
      id: "s4",
      ...logBase({ ghostKey: "C", pieceId: "p1", mode: "first-back", slotsTouched: fullSlots }),
    };
    const next = depthBumpForSession({ C: 3 }, log, "C");
    expect(next.C).toBe(3);
  });

  it("monotonic: never lowers an already-higher depth", () => {
    const log: SessionLog = { id: "s5", ...logBase({ ghostKey: "C" }) };
    const next = depthBumpForSession({ C: 5 }, log, "C");
    expect(next.C).toBe(5);
  });
});

// ───────────────── B3 / B2 — node-completion → pending unlocks ─────────────────
describe("endSession — node-completion drives unlocks (B3), no phase-jump (B2)", () => {
  it("a tier-0 node with no prereqs learns and earns its linked card", () => {
    // p-t0-keyboard-map has prereqs:[] and unlockCardId u-p1-keyboard-map, but no
    // chainDrillId/keyId — so it is satisfied via the echo/keyboard chain? It has
    // neither link. Use p-key-C which links chainDrillId p1-c-major-chain + keyId C.
    const s = stateWith({ phase: 1, skillProgress: {} });
    // p-key-C requires p-t0-posture ← p-t0-keyboard-map. Pre-learn those roots.
    s.skillProgress = {
      "p-t0-keyboard-map": learned(),
      "p-t0-posture": learned(),
    };
    const { state: next, newUnlocks } = endSession(
      s,
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain" }),
      new Date(),
    );
    // p-key-C satisfied (chain played + key Walked) and prereqs met → learned.
    expect(next.skillProgress?.["p-key-C"]?.status).toBe("learned");
    expect(newUnlocks.map((u) => u.id)).toContain("u-p1-c-map");
    // Earned card is queued for display.
    expect(next.pendingUnlocks.map((u) => u.id)).toContain("u-p1-c-map");
    expect(next.unlocks.map((u) => u.id)).toContain("u-p1-c-map");
  });

  it("a deep node does NOT unlock when its prereq chain is not learned (B2 exploit guard)", () => {
    // p-t3-ii-v-i links chainDrillId p3-ii-v-i-taste but requires a long chain.
    // A user who jumps to phase 3 and plays that drill with empty progress must
    // NOT earn the jazz unlock.
    const s = stateWith({ phase: 3, skillProgress: {} });
    const { state: next, newUnlocks } = endSession(
      s,
      logBase({ phase: 3, ghostKey: "F", chainDrillId: "p3-ii-v-i-taste" }),
      new Date(),
    );
    expect(next.skillProgress?.["p-t3-ii-v-i"]?.status).not.toBe("learned");
    expect(newUnlocks.map((u) => u.id)).not.toContain("u-p3-ii-v-i");
    expect(next.pendingUnlocks).toHaveLength(0);
  });

  it("does not double-earn a card already in unlocks", () => {
    const already = stateWith({
      phase: 1,
      skillProgress: { "p-t0-keyboard-map": learned(), "p-t0-posture": learned() },
      unlocks: [{ id: "u-p1-c-map", phase: 1, title: "x", tryLine: "y", addedAt: "2026-01-01" }],
    });
    const { newUnlocks } = endSession(
      already,
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain" }),
      new Date(),
    );
    expect(newUnlocks.map((u) => u.id)).not.toContain("u-p1-c-map");
  });
});

// ─── #2 BLOCKER regression: transition node is NOT learnable via endSession ───
// The transition node links the transition drill via chainDrillId, but it must be
// owned EXCLUSIVELY by the TransitionDrill threshold path (bestChanges >= target).
// endSession's generic completion loop must SKIP it, or a do-nothing session that
// "ran" the transition drill (no quality reported) would falsely learn it and
// unlock the gated song.
describe("endSession — transition nodes are not gameable via drill completion (#2)", () => {
  it("a sub-threshold transition session (no quality) leaves the node NOT learned", () => {
    // Pre-learn the transition node's prereqs so prereqs are NOT the thing blocking it.
    const s = stateWith({
      phase: 2,
      skillProgress: {
        "p-t0-keyboard-map": learned(),
        "p-t0-posture": learned(),
        "p-key-C": learned(),
        "p-key-am": learned(),
      },
    });
    // Run the transition drill with NO quality (the do-nothing-then-Done repro).
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "am", chainDrillId: "p-trans-am-F-drill" }),
      new Date(),
    );
    expect(next.skillProgress?.["p-trans-am-F"]?.status ?? "available").not.toBe("learned");
  });

  it("the Pop Formula stays locked after a do-nothing transition session", () => {
    const s = stateWith({
      phase: 2,
      skillProgress: {
        "p-t0-keyboard-map": learned(),
        "p-t0-posture": learned(),
        "p-key-C": learned(),
        "p-key-am": learned(),
        "p-t2-chord-under-melody": learned(),
      },
    });
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "am", chainDrillId: "p-trans-am-F-drill" }),
      new Date(),
    );
    // p-t2-pop-formula requires p-trans-am-F (still not learned) → not learned.
    expect(next.skillProgress?.["p-t2-pop-formula"]?.status ?? "available").not.toBe("learned");
  });

  it("a CLEARED transition (node learned via the slot's threshold path) unlocks the song", () => {
    // Simulate the TransitionDrill slot having marked the node learned on a >=target
    // run (it patches skillProgress directly). Then the DAG gate opens.
    const s = stateWith({
      phase: 2,
      skillProgress: {
        "p-t0-keyboard-map": learned(),
        "p-t0-posture": learned(),
        "p-key-C": learned(),
        "p-key-am": learned(),
        "p-t2-chord-under-melody": learned(),
        "p-trans-am-F": { status: "learned", reps: 1, bestChanges: 32, learnedAt: "2026-01-01" },
      },
    });
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "am", chainDrillId: "p2-am-pop-formula" }),
      new Date(),
    );
    expect(next.skillProgress?.["p-t2-pop-formula"]?.status).toBe("learned");
  });
});

// ──────────────────── #7 — Pop-Formula song-unlock cards ────────────────────
describe("endSession — Pop-Formula song unlocks", () => {
  // The pop-formula node becoming learned is the trigger. Mirror the cleared-
  // transition setup so p-t2-pop-formula flips to learned this session.
  function popFormulaLearnedState(extra: Partial<AppState> = {}): AppState {
    return stateWith({
      phase: 2,
      skillProgress: {
        "p-t0-keyboard-map": learned(),
        "p-t0-posture": learned(),
        "p-key-C": learned(),
        "p-key-am": learned(),
        "p-t2-chord-under-melody": learned(),
        "p-trans-am-F": { status: "learned", reps: 1, bestChanges: 32, learnedAt: "2026-01-01" },
      },
      ...extra,
    });
  }

  it("fires one song-unlock card per progression when the pop formula is first learned", () => {
    const { state: next, newUnlocks } = endSession(
      popFormulaLearnedState(),
      logBase({ ghostKey: "am", chainDrillId: "p2-am-pop-formula" }),
      new Date(),
    );
    const songCards = newUnlocks.filter((u) => u.id.startsWith("u-song-"));
    expect(songCards.length).toBe(3); // I-V-vi-IV, I-IV-V, I-vi-IV-V
    expect(songCards.every((c) => c.title.startsWith("You can now play"))).toBe(true);
    // Persisted into unlocks + queued as pending (same path as node unlocks).
    expect(next.unlocks.filter((u) => u.id.startsWith("u-song-")).length).toBe(3);
    expect(next.pendingUnlocks.filter((u) => u.id.startsWith("u-song-")).length).toBe(3);
  });

  it("does NOT re-fire song-unlock cards already earned (dedupe)", () => {
    // Pop formula already learned AND its song cards already in state.unlocks.
    const s = popFormulaLearnedState({
      skillProgress: {
        "p-t0-keyboard-map": learned(),
        "p-t0-posture": learned(),
        "p-key-C": learned(),
        "p-key-am": learned(),
        "p-t2-chord-under-melody": learned(),
        "p-trans-am-F": { status: "learned", reps: 1, bestChanges: 32, learnedAt: "2026-01-01" },
        "p-t2-pop-formula": learned(),
      },
      unlocks: [
        { id: "u-song-I-V-vi-IV", phase: 2, title: "x", tryLine: "x", addedAt: "2026-01-01" },
        { id: "u-song-I-IV-V", phase: 2, title: "x", tryLine: "x", addedAt: "2026-01-01" },
        { id: "u-song-I-vi-IV-V", phase: 2, title: "x", tryLine: "x", addedAt: "2026-01-01" },
      ],
    });
    const { newUnlocks } = endSession(
      s,
      logBase({ ghostKey: "am", chainDrillId: "p2-am-pop-formula" }),
      new Date(),
    );
    expect(newUnlocks.filter((u) => u.id.startsWith("u-song-"))).toEqual([]);
  });
});

// ───────────────────────── endSession bookkeeping ─────────────────────────
describe("endSession — bookkeeping", () => {
  it("caps recentDrillIds at 5, newest first", () => {
    const s = stateWith({ recentDrillIds: ["d1", "d2", "d3", "d4", "d5"] });
    const { state: next } = endSession(
      s,
      logBase({ chainDrillId: "p1-c-major-chain" }),
      new Date(),
    );
    expect(next.recentDrillIds).toHaveLength(5);
    expect(next.recentDrillIds[0]).toBe("p1-c-major-chain");
    expect(next.recentDrillIds).not.toContain("d5");
  });

  it("appends the session and updates lastSessionEndedAt", () => {
    const s = stateWith();
    const { state: next } = endSession(s, logBase(), new Date());
    expect(next.sessions).toHaveLength(1);
    expect(next.lastSessionEndedAt).toBe("2026-06-07T10:30:00.000Z");
  });
});

// ───────────── #2 — cross-session BPM ceiling: targetClears increment ─────────────
// p1-c-major-chain is authored with bpmLadder.targetBpm = 100, linked to node
// p-key-C. A session whose quality.bpmReached clears that ceiling should bump the
// node's targetClears so the effective ceiling can rise next session.
describe("endSession — targetClears (ceiling scaling)", () => {
  it("increments targetClears when the session clears the authored target BPM", () => {
    const s = stateWith();
    const { state: next } = endSession(
      s,
      logBase({
        chainDrillId: "p1-c-major-chain",
        quality: { attempts: 9, successes: 9, bpmReached: 100, metronomeOn: true, interleaved: false },
      }),
      new Date(),
    );
    expect(next.skillProgress?.["p-key-C"]?.targetClears).toBe(1);
  });

  it("does NOT increment when the session stays below the target", () => {
    const s = stateWith();
    const { state: next } = endSession(
      s,
      logBase({
        chainDrillId: "p1-c-major-chain",
        quality: { attempts: 9, successes: 9, bpmReached: 90, metronomeOn: true, interleaved: false },
      }),
      new Date(),
    );
    expect(next.skillProgress?.["p-key-C"]?.targetClears ?? 0).toBe(0);
  });

  it("accumulates across sessions", () => {
    let s = stateWith();
    const clear = () =>
      logBase({
        chainDrillId: "p1-c-major-chain",
        quality: { attempts: 9, successes: 9, bpmReached: 105, metronomeOn: true, interleaved: false },
      });
    s = endSession(s, clear(), new Date()).state;
    s = endSession(s, clear(), new Date()).state;
    expect(s.skillProgress?.["p-key-C"]?.targetClears).toBe(2);
  });

  it("still scales the ceiling for an already-learned node", () => {
    const s = stateWith({
      skillProgress: { "p-key-C": { status: "learned", reps: 20, learnedAt: "2026-01-01" } },
    });
    const { state: next } = endSession(
      s,
      logBase({
        chainDrillId: "p1-c-major-chain",
        quality: { attempts: 9, successes: 9, bpmReached: 100, metronomeOn: true, interleaved: false },
      }),
      new Date(),
    );
    expect(next.skillProgress?.["p-key-C"]?.targetClears).toBe(1);
    // learned status preserved (the increment passes reps:0).
    expect(next.skillProgress?.["p-key-C"]?.status).toBe("learned");
  });
});

// ───────────────── Gamification (V2 Phase A) — XP / level / streak ─────────────────
describe("endSession — gamification accrual", () => {
  // A key already at max depth so warmup/chain bumps don't add depth-up XP noise.
  function baseState(partial: Partial<AppState> = {}): AppState {
    return stateWith({ keyDepths: { C: 5 }, ...partial });
  }

  it("XP accrues from the session (base + engaged slots, no side effects)", () => {
    const s = baseState({ xp: 0, level: 1 });
    const { state: next } = endSession(
      s,
      // warmup + chain engaged, key C already maxed → no depth-up, no node, no ear
      logBase({ ghostKey: "C" }),
      new Date("2026-06-07T10:30:00.000Z"),
    );
    // V3 model: full base (50) + warmup minimal (2) + chain quality-floor (12,
    // no quality data) = 64. Chain is no longer a flat +10 slot — it is the
    // quality-weighted drill award (R6/R8).
    const floorDrill = Math.round(XP_AWARDS.drillQualityMax * XP_AWARDS.drillQualityFloor);
    expect(next.xp).toBe(XP_AWARDS.sessionBase.full + XP_AWARDS.perWarmupEngaged + floorDrill);
    expect(next.level).toBe(levelForXp(next.xp).level);
  });

  it("ear-correct count contributes XP", () => {
    const s = baseState({ xp: 0 });
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "C", earResults: { correctIds: ["a", "b", "c"], wrongIds: ["d"] } }),
      new Date("2026-06-07T10:30:00.000Z"),
    );
    const floorDrill = Math.round(XP_AWARDS.drillQualityMax * XP_AWARDS.drillQualityFloor);
    expect(next.xp).toBe(
      XP_AWARDS.sessionBase.full + XP_AWARDS.perWarmupEngaged + floorDrill + 3 * XP_AWARDS.perEarCorrect,
    );
  });

  it("crossing a level threshold emits a level-up arc event AND a pending level-up", () => {
    // Start just below level 2 (threshold 100). xpForLevel(2) = 100.
    const s = baseState({ xp: 95, level: 1 });
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "C" }), // +64 (50 base + 2 warmup + 12 chain floor) → 159 → level 2
      new Date("2026-06-07T10:30:00.000Z"),
    );
    expect(next.level).toBe(2);
    expect(next.pendingLevelUps).toContain(2);
    const levelUpEvent = next.arc.find((e) => e.kind === "level-up");
    expect(levelUpEvent).toBeTruthy();
    expect(levelUpEvent?.detail?.level).toBe(2);
  });

  it("a big XP jump queues every crossed level (one pending + one arc event each)", () => {
    // 0 → enough to cross several levels at once via node-learned XP.
    // Pre-learn p-key-C's roots so it learns this session (+100 node XP) and
    // also engage many slots; but to force a multi-level jump deterministically
    // we start with high prior xp near a threshold.
    const s = baseState({ xp: 240, level: 2 }); // just below L3 (250)
    const { state: next } = endSession(
      s,
      // base 50 + warmup 2 + chain floor 12 + piece 10 + ear 10 = 84 → 324 → crosses L3 (250) only (324 < 450)
      logBase({
        ghostKey: "C",
        slotsTouched: [
          { slot: "warmup", touched: true },
          { slot: "chain", touched: true },
          { slot: "piece", touched: true },
          { slot: "ear", touched: true },
        ],
      }),
      new Date("2026-06-07T10:30:00.000Z"),
    );
    expect(next.level).toBe(3);
    expect(next.pendingLevelUps).toEqual([3]);
  });

  it("no level-up → no level-up arc event, pendingLevelUps unchanged", () => {
    const s = baseState({ xp: 0, level: 1 });
    const { state: next } = endSession(s, logBase({ ghostKey: "C" }), new Date("2026-06-07T10:30:00.000Z"));
    expect(next.level).toBe(1);
    expect(next.pendingLevelUps).toEqual([]);
    expect(next.arc.some((e) => e.kind === "level-up")).toBe(false);
  });

  it("updates the streak to 1 on first practice", () => {
    const s = baseState();
    const { state: next } = endSession(s, logBase(), new Date("2026-06-07T10:30:00.000Z"));
    expect(next.streak.current).toBe(1);
    expect(next.streak.longest).toBe(1);
    expect(next.streak.lastPracticeDate).toBe("2026-06-07");
  });

  it("streak: consecutive-day session increments", () => {
    const s = baseState({ streak: { current: 1, longest: 1, lastPracticeDate: "2026-06-06" } });
    const { state: next } = endSession(s, logBase(), new Date("2026-06-07T10:30:00.000Z"));
    expect(next.streak.current).toBe(2);
  });

  it("streak: one missed day is graced (continues), two missed days reset", () => {
    const graced = endSession(
      baseState({ streak: { current: 3, longest: 3, lastPracticeDate: "2026-06-05" } }),
      logBase(),
      new Date("2026-06-07T10:30:00.000Z"), // gap of 1 missed day (06-06)
    );
    expect(graced.state.streak.current).toBe(4); // graced

    const reset = endSession(
      baseState({ streak: { current: 3, longest: 3, lastPracticeDate: "2026-06-04" } }),
      logBase(),
      new Date("2026-06-07T10:30:00.000Z"), // gap of 2 missed days
    );
    expect(reset.state.streak.current).toBe(1); // reset
    expect(reset.state.streak.longest).toBe(3); // longest preserved
  });
});

// ─────────────── V3: R3 success-rate gate + R7 spaced review wiring ───────────────
describe("endSession — V3 success-rate gate (R3) + spaced review (R7)", () => {
  // Roots pre-learned so p-key-C is reachable; success rate then decides learning.
  function readyState(partial: Partial<AppState> = {}): AppState {
    return stateWith({
      phase: 1,
      keyDepths: { C: 5 }, // already maxed → no depth-up noise
      skillProgress: { "p-t0-keyboard-map": learned(), "p-t0-posture": learned() },
      ...partial,
    });
  }

  it("does NOT learn a node when the recorded success rate is too low (R3)", () => {
    const { state: next } = endSession(
      readyState(),
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain", quality: { attempts: 10, successes: 5 } }), // 50%
      new Date("2026-06-08T10:30:00.000Z"),
    );
    expect(next.skillProgress?.["p-key-C"]?.status).toBe("in-progress");
    expect(next.skillProgress?.["p-key-C"]?.attempts).toBe(10);
    expect(next.skillProgress?.["p-key-C"]?.successes).toBe(5);
    // No learn → no review enqueued.
    expect(next.skillReview?.["p-key-C"]).toBeUndefined();
  });

  it("learns a node at a solid success rate AND enqueues it for review +1 day (R7)", () => {
    const end = "2026-06-08T10:30:00.000Z";
    const { state: next } = endSession(
      readyState(),
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain", endedAt: end, quality: { attempts: 10, successes: 9 } }), // 90%
      new Date(end),
    );
    expect(next.skillProgress?.["p-key-C"]?.status).toBe("learned");
    const review = next.skillReview?.["p-key-C"];
    expect(review).toBeDefined();
    expect(review!.intervalIndex).toBe(0);
    // Enqueued +1 day from the session's endedAt.
    expect(review!.dueAt).toBe(new Date(new Date(end).getTime() + 86400000).toISOString());
  });

  it("still learns with no quality data (legacy back-compat: gate not applied)", () => {
    const { state: next } = endSession(
      readyState(),
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain" }), // no quality
      new Date("2026-06-08T10:30:00.000Z"),
    );
    expect(next.skillProgress?.["p-key-C"]?.status).toBe("learned");
  });

  it("advances the review interval for a due, practiced node (R7 ladder)", () => {
    // p-key-C already learned and due for review; practicing its drill advances it.
    const end = "2026-06-08T10:30:00.000Z";
    const s = readyState({
      skillProgress: {
        "p-t0-keyboard-map": learned(),
        "p-t0-posture": learned(),
        "p-key-C": learned(),
      },
      skillReview: { "p-key-C": { dueAt: "2026-06-01T00:00:00.000Z", intervalIndex: 0 } }, // overdue
    });
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain", endedAt: end, quality: { attempts: 5, successes: 5 } }),
      new Date(end),
    );
    const review = next.skillReview?.["p-key-C"];
    expect(review!.intervalIndex).toBe(1); // 0 → 1 (3-day interval)
    expect(review!.dueAt).toBe(new Date(new Date(end).getTime() + 3 * 86400000).toISOString());
  });

  it("awards a metronome XP bonus when the session reports metronomeOn (R8)", () => {
    const withMetro = endSession(
      readyState({ xp: 0 }),
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain", quality: { attempts: 5, successes: 5, metronomeOn: true } }),
      new Date("2026-06-08T10:30:00.000Z"),
    );
    const withoutMetro = endSession(
      readyState({ xp: 0 }),
      logBase({ ghostKey: "C", chainDrillId: "p1-c-major-chain", quality: { attempts: 5, successes: 5 } }),
      new Date("2026-06-08T10:30:00.000Z"),
    );
    expect(withMetro.state.xp).toBe((withoutMetro.state.xp ?? 0) + XP_AWARDS.metronomeBonus);
  });
});

// ─────────────── Data-integrity guard: every linked card resolves ───────────────
describe("PIANO_NODES unlock linkage is explicit and resolvable", () => {
  it("every unlockCardId points at a real UnlockCard id", () => {
    const cardIds = new Set(UNLOCK_LIBRARY.map((c) => c.id));
    for (const node of PIANO_NODES) {
      if (node.unlockCardId) {
        expect(cardIds.has(node.unlockCardId)).toBe(true);
      }
    }
  });

  it("no two nodes claim the same unlock card", () => {
    const seen = new Set<string>();
    for (const node of PIANO_NODES) {
      if (!node.unlockCardId) continue;
      expect(seen.has(node.unlockCardId)).toBe(false);
      seen.add(node.unlockCardId);
    }
  });
});

// ───────────────────── earLevel auto-advance (Pattern Recognition) ─────────────────────
describe("endSession — earLevel auto-advance", () => {
  // A session log carrying an ear result tally.
  function earLog(correct: number, wrong: number): Omit<SessionLog, "id"> {
    return logBase({
      earResults: {
        correctIds: Array.from({ length: correct }, (_, i) => `c${i}`),
        wrongIds: Array.from({ length: wrong }, (_, i) => `w${i}`),
      },
    });
  }
  // Prior sessions already in state (as full SessionLogs).
  function priorEarSession(idn: number, correct: number, wrong: number): SessionLog {
    return { id: `prior-${idn}`, ...earLog(correct, wrong) };
  }

  it("advances earLevel one step after a strong recent window", () => {
    const state = stateWith({
      earLevel: 2,
      sessions: [priorEarSession(1, 3, 0), priorEarSession(2, 3, 0)],
    });
    // This session adds 3 more correct → 9/9 over the window → advance L2 → L3.
    const { state: next } = endSession(state, earLog(3, 0), new Date("2026-06-07T10:30:00Z"));
    expect(next.earLevel).toBe(3);
    expect(next.arc.some((e) => e.kind === "ear-level-up")).toBe(true);
  });

  it("holds earLevel when recent accuracy is below threshold", () => {
    const state = stateWith({
      earLevel: 2,
      sessions: [priorEarSession(1, 1, 2), priorEarSession(2, 1, 2)],
    });
    const { state: next } = endSession(state, earLog(1, 2), new Date("2026-06-07T10:30:00Z"));
    expect(next.earLevel).toBe(2);
    expect(next.arc.some((e) => e.kind === "ear-level-up")).toBe(false);
  });

  it("never advances past L5 (content cap)", () => {
    const state = stateWith({
      earLevel: 5,
      sessions: [priorEarSession(1, 3, 0), priorEarSession(2, 3, 0)],
    });
    const { state: next } = endSession(state, earLog(3, 0), new Date("2026-06-07T10:30:00Z"));
    expect(next.earLevel).toBe(5);
    expect(next.arc.some((e) => e.kind === "ear-level-up")).toBe(false);
  });

  it("graces a single bad round inside an otherwise-strong window", () => {
    const state = stateWith({
      earLevel: 3,
      sessions: [priorEarSession(1, 3, 0), priorEarSession(2, 3, 0)],
    });
    // 8 correct, 1 wrong over the window = 0.888 ≥ 0.8 → advance.
    const { state: next } = endSession(state, earLog(2, 1), new Date("2026-06-07T10:30:00Z"));
    expect(next.earLevel).toBe(4);
  });

  it("advances by AT MOST one level per endSession across consecutive calls (ratchet guard)", () => {
    // The windowed history never "resets", so a very strong run must still step
    // L2 → L3 → L4 one level at a time — never L2 → L4 in a single session, even
    // though every prior round in the window was correct.
    let state = stateWith({
      earLevel: 2,
      sessions: [priorEarSession(1, 3, 0), priorEarSession(2, 3, 0)],
    });

    const first = endSession(state, earLog(3, 0), new Date("2026-06-07T10:30:00Z"));
    expect(first.state.earLevel).toBe(3); // +1, not +2
    state = first.state;

    const second = endSession(state, earLog(3, 0), new Date("2026-06-08T10:30:00Z"));
    expect(second.state.earLevel).toBe(4); // exactly one more, never skips to 5
    expect(second.state.earLevel - first.state.earLevel).toBe(1);
  });
});
