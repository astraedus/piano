import { describe, it, expect } from "vitest";
import { endSession, depthBumpForSession } from "./sessions";
import { defaultState } from "./storage";
import type { AppState, KeyId, SessionLog, SessionSlotLog, SkillProgress } from "./types";
import { PIANO_NODES } from "./piano/skillNodes";
import { UNLOCK_LIBRARY } from "./piano/unlocks";
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
