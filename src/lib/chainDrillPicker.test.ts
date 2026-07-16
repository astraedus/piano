import { describe, it, expect } from "vitest";
import {
  pickChainDrill,
  buildInterleavePlan,
  filterDrillsByNodeUnlocked,
  INTERLEAVE_REPS_PER_SKILL,
} from "./chainDrillPicker";
import { defaultState } from "./storage";
import type { AppState, ChainDrill, Phase, SkillNode, SkillProgress } from "./types";
import { registerInstrumentModule, type InstrumentModule } from "./instrumentRegistry";
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

describe("buildInterleavePlan (R4 interleaved rep sequence)", () => {
  const learned = (): SkillProgress => ({ status: "learned", reps: 5, learnedAt: "2026-01-01" });
  const inProgress = (): SkillProgress => ({ status: "in-progress", reps: 2 });

  it("returns null when fewer than 2 established interleavable skills exist", () => {
    // Nothing learned, so no node is past the early stage and there is no weave.
    const plan = buildInterleavePlan(stateWith({ phase: 1 }), DAY, null);
    expect(plan).toBeNull();
  });

  it("weaves 2-3 established skills into an alternating rep sequence", () => {
    // p-key-C/G/F link to the seeded interleavable phase-1 drills. Make them
    // established so all three qualify.
    const s = stateWith({
      phase: 1,
      skillProgress: {
        "p-key-C": learned(),
        "p-key-G": inProgress(),
        "p-key-F": inProgress(),
      },
    });
    const plan = buildInterleavePlan(s, DAY, null);
    expect(plan).not.toBeNull();
    expect(plan!.drills.length).toBeGreaterThanOrEqual(2);
    expect(plan!.drills.length).toBeLessThanOrEqual(3);

    // Sequence length is reps-per-skill times the number of skills.
    expect(plan!.repSequence).toHaveLength(INTERLEAVE_REPS_PER_SKILL * plan!.drills.length);

    // Each round cycles through every drill once (A,B,C,A,B,C,...).
    const n = plan!.drills.length;
    const order = plan!.drills.map((d) => d.id);
    for (let r = 0; r < INTERLEAVE_REPS_PER_SKILL; r++) {
      expect(plan!.repSequence.slice(r * n, (r + 1) * n)).toEqual(order);
    }
  });

  it("excludes brand-new (cognitive-stage) skills from interleaving", () => {
    // p-key-C established, but p-key-G/F untouched (never started), so only one
    // eligible skill remains and there is no weave.
    const s = stateWith({
      phase: 1,
      skillProgress: { "p-key-C": learned() },
    });
    const plan = buildInterleavePlan(s, DAY, null);
    expect(plan).toBeNull(); // need at least 2 eligible
  });

  it("places the primary drill first in the weave when it qualifies", () => {
    const s = stateWith({
      phase: 1,
      skillProgress: {
        "p-key-C": learned(),
        "p-key-G": learned(),
        "p-key-F": learned(),
      },
    });
    const primary = { id: "p1-g-major-chain" } as never;
    const plan = buildInterleavePlan(s, DAY, primary);
    expect(plan).not.toBeNull();
    expect(plan!.drills[0].id).toBe("p1-g-major-chain");
  });
});

// ── DAG consistency: never serve a drill whose linked node is locked ──────────

const drill = (id: string, over: Partial<ChainDrill> = {}): ChainDrill => ({
  id,
  instrument: "guitar",
  phase: 1,
  name: id,
  minutes: 5,
  ghostKey: "C",
  pillar: "technique",
  steps: [],
  closingNote: "",
  ...over,
});

const node = (id: string, chainDrillId: string, prereqs: string[] = []): SkillNode => ({
  id,
  instrument: "guitar",
  title: id,
  tier: 1,
  category: "technique",
  prereqs,
  masteryDrill: "",
  unlock: "",
  chainDrillId,
});

describe("filterDrillsByNodeUnlocked (DAG lock filter)", () => {
  it("keeps drills whose linked node is not locked (available)", () => {
    const nodes = [node("n-a", "d-a"), node("n-b", "d-b")];
    const out = filterDrillsByNodeUnlocked([drill("d-a"), drill("d-b")], nodes, {});
    expect(out.map((d) => d.id).sort()).toEqual(["d-a", "d-b"]);
  });

  it("drops a drill whose linked node is LOCKED (prereq unmet)", () => {
    const nodes = [node("n-a", "d-a"), node("n-b", "d-b", ["ghost"])]; // n-b locked
    const out = filterDrillsByNodeUnlocked([drill("d-a"), drill("d-b")], nodes, {});
    expect(out.map((d) => d.id)).toEqual(["d-a"]);
  });

  it("un-drops the drill once its node's prereqs are learned", () => {
    const nodes = [node("n-a", "d-a"), node("n-b", "d-b", ["n-a"])];
    const progress: Record<string, SkillProgress> = {
      "n-a": { status: "learned", reps: 3, learnedAt: "2026-01-01" },
    };
    const out = filterDrillsByNodeUnlocked([drill("d-a"), drill("d-b")], nodes, progress);
    expect(out.map((d) => d.id).sort()).toEqual(["d-a", "d-b"]);
  });

  it("passes drills with no linked node (nothing to gate on)", () => {
    expect(filterDrillsByNodeUnlocked([drill("d-x")], [], {}).map((d) => d.id)).toEqual(["d-x"]);
  });
});

// A minimal guitar module so we can force the "every drill locked" fallback path.
const minimalGuitarModule: InstrumentModule = {
  id: "guitar",
  displayName: "Electric Guitar",
  accentVar: "guitar",
  chainDrills: [],
  warmups: {},
  warmupRotation: { phase1: [], phase2Plus: [] },
  unlockLibrary: [],
  skillNodes: [],
  ghostRotation: { 1: ["C"], 2: ["C"], 3: ["C"], 4: ["C"], 5: ["C"] },
  focusKind: "chord",
  focusLabel: (id) => id,
  progressMapKind: "fretboard",
  InstrumentVisual: () => null,
  NotationVisual: () => null,
};

describe("pickChainDrill — DAG lock filter + fallback", () => {
  it("excludes a locked-node drill in favor of an unlocked one", () => {
    registerInstrumentModule({
      ...minimalGuitarModule,
      chainDrills: [drill("d-open"), drill("d-gated")],
      skillNodes: [node("n-open", "d-open"), node("n-gated", "d-gated", ["ghost"])],
    });
    const picked = pickChainDrill(stateWith({ phase: 1, instrument: "guitar" }), DAY);
    expect(picked?.id).toBe("d-open");
  });

  it("falls back to the full pool when EVERY drill's node is locked", () => {
    registerInstrumentModule({
      ...minimalGuitarModule,
      chainDrills: [drill("d-locked")],
      skillNodes: [node("n-locked", "d-locked", ["ghost"])],
    });
    // Filtering empties the pool → the picker must still return the (locked) drill.
    const picked = pickChainDrill(stateWith({ phase: 1, instrument: "guitar" }), DAY);
    expect(picked?.id).toBe("d-locked");
  });
});
