import { describe, it, expect } from "vitest";
import {
  snapshotFromState,
  rehydrateRepState,
  hasResumableWork,
  currentSlot,
  repSessionKey,
  type RepSessionSnapshot,
} from "./repResume";
import { initRepEngine, type RepEngineConfig, type RepEngineState } from "@/lib/repEngine";

const TODAY = "2026-06-08";

function cfg(repCount = 9): RepEngineConfig {
  return {
    reps: Array.from({ length: repCount }, (_, i) => ({ drillId: "d1", label: `rep ${i}` })),
    repBlocks: { repsPerBlock: 3, restSec: 12 },
    bpmLadder: { startBpm: 60, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 },
    interleaved: false,
  };
}

/** A live engine state advanced to a mid-session position. */
function midState(): RepEngineState {
  return {
    ...initRepEngine(cfg()),
    repIndex: 4,
    phase: "rep",
    bpm: 70,
    consecutiveAtBpm: 2,
    repsSinceRest: 1,
    attempts: 4,
    successes: 3,
    bpmReached: 70,
    metronomeOn: true,
  };
}

describe("repSessionKey", () => {
  it("namespaces by drill rep key", () => {
    expect(repSessionKey("drill:d1")).toBe("practice.repSession.drill:d1");
  });
});

describe("snapshotFromState", () => {
  it("captures progress fields and the day key, never the config", () => {
    const snap = snapshotFromState(midState(), TODAY);
    expect(snap.dayKey).toBe(TODAY);
    expect(snap.repIndex).toBe(4);
    expect(snap.attempts).toBe(4);
    expect(snap.successes).toBe(3);
    expect(snap.bpm).toBe(70);
    expect(snap.metronomeOn).toBe(true);
    expect("config" in snap).toBe(false);
  });
});

describe("rehydrateRepState", () => {
  it("restores place in the rep run from a same-day snapshot", () => {
    const snap = snapshotFromState(midState(), TODAY);
    const restored = rehydrateRepState(cfg(), snap, TODAY);
    expect(restored.repIndex).toBe(4);
    expect(restored.attempts).toBe(4);
    expect(restored.successes).toBe(3);
    expect(restored.bpm).toBe(70);
    expect(restored.phase).toBe("rep");
  });

  it("returns fresh init when there is no snapshot", () => {
    const restored = rehydrateRepState(cfg(), null, TODAY);
    expect(restored.repIndex).toBe(0);
    expect(restored.attempts).toBe(0);
  });

  it("discards a stale (different-day) snapshot", () => {
    const snap = snapshotFromState(midState(), "2026-06-07");
    const restored = rehydrateRepState(cfg(), snap, TODAY);
    expect(restored.repIndex).toBe(0);
    expect(restored.attempts).toBe(0);
  });

  it("ignores a zero-progress snapshot (nothing to resume)", () => {
    const snap = snapshotFromState(initRepEngine(cfg()), TODAY);
    const restored = rehydrateRepState(cfg(), snap, TODAY);
    expect(restored.repIndex).toBe(0);
  });

  it("clamps repIndex into a shorter fresh config", () => {
    const snap = snapshotFromState({ ...midState(), repIndex: 8, attempts: 9 }, TODAY);
    const restored = rehydrateRepState(cfg(3), snap, TODAY);
    // config has 3 reps -> index 8 is past the end -> done, clamped index.
    expect(restored.repIndex).toBeLessThanOrEqual(2);
    expect(restored.phase).toBe("done");
  });

  it("resolves a saved rest phase to a resumable rep phase", () => {
    const snap = snapshotFromState({ ...midState(), phase: "rest" }, TODAY);
    const restored = rehydrateRepState(cfg(), snap, TODAY);
    expect(restored.phase).toBe("rep");
  });

  it("clears a dangling bump-offer on reload", () => {
    const snap = snapshotFromState({ ...midState(), bpmBumpOffered: true }, TODAY);
    const restored = rehydrateRepState(cfg(), snap, TODAY);
    expect(restored.bpmBumpOffered).toBe(false);
  });

  it("preserves the rebuilt config, not the snapshot's", () => {
    const fresh = cfg(9);
    const restored = rehydrateRepState(fresh, snapshotFromState(midState(), TODAY), TODAY);
    expect(restored.config).toBe(fresh);
  });
});

describe("hasResumableWork", () => {
  const base: RepSessionSnapshot = snapshotFromState(midState(), TODAY);

  it("is true for same-day in-flight work", () => {
    expect(hasResumableWork(base, TODAY)).toBe(true);
  });
  it("is false for no snapshot", () => {
    expect(hasResumableWork(null, TODAY)).toBe(false);
  });
  it("is false for a different day", () => {
    expect(hasResumableWork({ ...base, dayKey: "2026-06-07" }, TODAY)).toBe(false);
  });
  it("is false when the session is done", () => {
    expect(hasResumableWork({ ...base, phase: "done" }, TODAY)).toBe(false);
  });
  it("is false for zero progress", () => {
    expect(hasResumableWork({ ...base, attempts: 0, repIndex: 0 }, TODAY)).toBe(false);
  });
});

describe("currentSlot", () => {
  it("is the first not-done slot", () => {
    expect(currentSlot({ warmup: true })).toBe("piece");
    expect(currentSlot({ warmup: true, piece: true })).toBe("chain");
    expect(currentSlot({})).toBe("warmup");
  });
  it("falls back to the last slot when everything is done", () => {
    expect(currentSlot({ warmup: true, piece: true, chain: true, ear: true, free: true })).toBe("free");
  });
  it("treats missing flags as not-done", () => {
    expect(currentSlot({ warmup: true, chain: true })).toBe("piece");
  });
});
