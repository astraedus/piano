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
    // full base (50) + 2 engaged slots * 10 = 70
    expect(next.xp).toBe(XP_AWARDS.sessionBase.full + 20);
    expect(next.level).toBe(levelForXp(next.xp).level);
  });

  it("ear-correct count contributes XP", () => {
    const s = baseState({ xp: 0 });
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "C", earResults: { correctIds: ["a", "b", "c"], wrongIds: ["d"] } }),
      new Date("2026-06-07T10:30:00.000Z"),
    );
    expect(next.xp).toBe(XP_AWARDS.sessionBase.full + 20 + 3 * XP_AWARDS.perEarCorrect);
  });

  it("crossing a level threshold emits a level-up arc event AND a pending level-up", () => {
    // Start just below level 2 (threshold 100). xpForLevel(2) = 100.
    const s = baseState({ xp: 95, level: 1 });
    const { state: next } = endSession(
      s,
      logBase({ ghostKey: "C" }), // +70 → 165 → level 2
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
      // base 50 + 4 engaged slots (40) = 90 → 330 → crosses L3 (250) and L4 (450)? 330 < 450 → only L3
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
