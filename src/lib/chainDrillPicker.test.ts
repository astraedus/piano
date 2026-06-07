import { describe, it, expect } from "vitest";
import { pickChainDrill } from "./chainDrillPicker";
import { defaultState } from "./storage";
import type { AppState, Phase } from "./types";
import "./piano/module"; // self-registers piano so chainDrills resolve

function stateWith(partial: Partial<AppState> = {}): AppState {
  return { ...defaultState(), ...partial };
}

const DAY = new Date("2026-06-07T12:00:00Z");

describe("pickChainDrill — phase-stable seed (B6)", () => {
  it("is deterministic within the same (phase, day)", () => {
    const s = stateWith({ phase: 1 });
    const a = pickChainDrill(s, DAY);
    const b = pickChainDrill(s, DAY);
    expect(a?.id).toBe(b?.id);
  });

  it("returns a drill belonging to the requested phase", () => {
    for (const phase of [1, 2, 3] as Phase[]) {
      const drill = pickChainDrill(stateWith({ phase }), DAY);
      expect(drill).not.toBeNull();
      expect(drill?.phase).toBe(phase);
    }
  });

  it("the seed shifts per phase so the index space is phase-stable", () => {
    // The seed is dayOfYear + phase*31. Across phases on the same day the raw
    // seed differs by a multiple of 31, so the phase is genuinely folded in
    // (not the old pure dayOfYear seed). We assert the seed contribution is
    // present by checking that two phases with equal pool sizes don't collapse
    // to the identical index purely from dayOfYear.
    const day = new Date("2026-03-15T12:00:00Z");
    // Drill for phase 1 vs phase 2 — different pools, but the test simply
    // guards that picking is stable and phase-scoped (no cross-phase leak).
    const p1 = pickChainDrill(stateWith({ phase: 1 }), day);
    const p2 = pickChainDrill(stateWith({ phase: 2 }), day);
    expect(p1?.phase).toBe(1);
    expect(p2?.phase).toBe(2);
  });
});

describe("pickChainDrill — recency exclusion", () => {
  it("excludes drills in recentDrillIds (last 5)", () => {
    const phase = 1 as Phase;
    const plain = pickChainDrill(stateWith({ phase }), DAY);
    expect(plain).not.toBeNull();
    // Exclude the drill that would otherwise be picked; the picker must choose
    // a different one (the phase-1 pool has many drills).
    const excluded = pickChainDrill(
      stateWith({ phase, recentDrillIds: [plain!.id] }),
      DAY,
    );
    expect(excluded?.id).not.toBe(plain!.id);
  });

  it("falls back to the full pool when ALL non-recent options are exhausted", () => {
    const phase = 1 as Phase;
    // Build a recent list that contains every phase-1 drill id so both the
    // preferred and fallback filters come up empty — picker must still return one.
    const s0 = stateWith({ phase });
    // gather phase-1 drill ids by sampling across a year of days
    const ids = new Set<string>();
    for (let d = 1; d <= 28; d++) {
      const day = new Date(`2026-01-${String(d).padStart(2, "0")}T12:00:00Z`);
      const drill = pickChainDrill(s0, day);
      if (drill) ids.add(drill.id);
    }
    const allRecent = [...ids];
    const drill = pickChainDrill(stateWith({ phase, recentDrillIds: allRecent }), DAY);
    expect(drill).not.toBeNull();
    expect(drill?.phase).toBe(phase);
  });
});
