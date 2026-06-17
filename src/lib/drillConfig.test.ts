import { describe, expect, it } from "vitest";
import {
  drillWantsTempoLadder,
  withDefaultMotorConfig,
  withDefaultMotorConfigAll,
  seededStartBpm,
  bumpedTargetBpm,
  effectiveBpmLadder,
  clearedTarget,
  DEFAULT_FLAT_BPM_LADDER,
  CEILING_BUMP_AFTER_CLEARS,
  MAX_CEILING_BUMPS,
} from "./drillConfig";
import type { BpmLadderConfig, ChainDrill } from "./types";
import { CHAIN_DRILLS } from "./piano/chainDrills";
import { GUITAR_CHAIN_DRILLS } from "./guitar/chainDrills";

function drill(over: Partial<ChainDrill>): ChainDrill {
  return {
    id: "d",
    instrument: "piano",
    phase: 1,
    name: "d",
    minutes: 4,
    ghostKey: "C",
    pillar: "technique",
    steps: [{ type: "scale", durationSec: 30, instruction: "x" }],
    closingNote: "x",
    ...over,
  };
}

const LADDER: BpmLadderConfig = { startBpm: 60, targetBpm: 100, step: 5, advanceAfterSuccesses: 3 };

describe("drillWantsTempoLadder", () => {
  it("technique / repertoire / lead-sheet / improv drills want a ladder", () => {
    for (const pillar of ["technique", "repertoire", "lead-sheet", "improv"] as const) {
      expect(drillWantsTempoLadder(drill({ pillar })), pillar).toBe(true);
    }
  });
  it("a pure-expression / mood drill (no tempo steps) does NOT want a ladder", () => {
    const moodDrill = drill({
      pillar: "expression",
      steps: [{ type: "moods", durationSec: 60, instruction: "play it tender" }],
    });
    expect(drillWantsTempoLadder(moodDrill)).toBe(false);
  });
  it("a pure by-ear transcription drill does NOT want a ladder", () => {
    const earDrill = drill({
      pillar: "ear",
      steps: [{ type: "transcribe", durationSec: 60, instruction: "echo it" }],
    });
    expect(drillWantsTempoLadder(earDrill)).toBe(false);
  });
  it("an expression drill that still contains scale/progression work DOES want one", () => {
    const mixed = drill({
      pillar: "expression",
      steps: [{ type: "progression", durationSec: 45, instruction: "Em–G–D–C" }],
    });
    expect(drillWantsTempoLadder(mixed)).toBe(true);
  });
});

describe("withDefaultMotorConfig", () => {
  it("gives a flat tempo drill a rest cadence and a ladder", () => {
    const out = withDefaultMotorConfig(drill({ repBlocks: undefined, bpmLadder: undefined }));
    expect(out.repBlocks).toEqual({ repsPerBlock: 3, restSec: 12 });
    expect(out.bpmLadder).toEqual(DEFAULT_FLAT_BPM_LADDER);
    expect(out.interleavable).toBe(true);
  });
  it("gives a mood drill the rest cadence but NO ladder", () => {
    const out = withDefaultMotorConfig(
      drill({
        pillar: "expression",
        steps: [{ type: "moods", durationSec: 60, instruction: "tender" }],
      }),
    );
    expect(out.repBlocks).toEqual({ repsPerBlock: 3, restSec: 12 });
    expect(out.bpmLadder).toBeUndefined();
    expect(out.interleavable).toBe(false);
  });
  it("never overwrites an authored config", () => {
    const authored = drill({
      repBlocks: { repsPerBlock: 4, restSec: 20 },
      bpmLadder: { startBpm: 70, targetBpm: 130, step: 10, advanceAfterSuccesses: 2 },
      interleavable: true,
    });
    const out = withDefaultMotorConfig(authored);
    expect(out.repBlocks).toEqual(authored.repBlocks);
    expect(out.bpmLadder).toEqual(authored.bpmLadder);
  });
  it("is idempotent", () => {
    const once = withDefaultMotorConfig(drill({}));
    const twice = withDefaultMotorConfig(once);
    expect(twice).toEqual(once);
  });
});

describe("exported drill lists carry motor config (#2 — no more flat 'mark done')", () => {
  it("every piano drill now has repBlocks", () => {
    for (const d of CHAIN_DRILLS) expect(d.repBlocks, d.id).toBeTruthy();
  });
  it("every guitar drill now has repBlocks", () => {
    for (const d of GUITAR_CHAIN_DRILLS) expect(d.repBlocks, d.id).toBeTruthy();
  });
  it("every tempo-relevant drill now has a bpmLadder", () => {
    for (const d of [...CHAIN_DRILLS, ...GUITAR_CHAIN_DRILLS]) {
      if (drillWantsTempoLadder(d)) expect(d.bpmLadder, d.id).toBeTruthy();
    }
  });
  it("the previously-flat majority now carry a ladder (>30 of ~48)", () => {
    const all = [...CHAIN_DRILLS, ...GUITAR_CHAIN_DRILLS];
    const withLadder = all.filter((d) => d.bpmLadder).length;
    expect(withLadder).toBeGreaterThan(30);
  });
});

describe("seededStartBpm — persistence across sessions", () => {
  it("with no history, starts at the authored start (amnesiac-safe default)", () => {
    expect(seededStartBpm(LADDER, undefined)).toBe(60);
  });
  it("seeds from prior best minus one step (a warm-up rung)", () => {
    expect(seededStartBpm(LADDER, 95)).toBe(90);
  });
  it("never seeds below the authored start", () => {
    expect(seededStartBpm(LADDER, 62)).toBe(60); // 62-5=57 -> clamp to 60
  });
  it("never seeds above the (passed) target ceiling", () => {
    expect(seededStartBpm(LADDER, 200, 100)).toBe(100);
  });
  it("respects a raised ceiling when seeding", () => {
    // prior best 105 on a bumped target of 110 -> 105-5=100, allowed.
    expect(seededStartBpm(LADDER, 105, 110)).toBe(100);
  });
});

describe("bumpedTargetBpm — ceiling scaling after N clears", () => {
  it("no clears -> authored target", () => {
    expect(bumpedTargetBpm(LADDER, undefined)).toBe(100);
    expect(bumpedTargetBpm(LADDER, 0)).toBe(100);
  });
  it("one clear (< threshold) -> not yet bumped", () => {
    expect(bumpedTargetBpm(LADDER, CEILING_BUMP_AFTER_CLEARS - 1)).toBe(100);
  });
  it("threshold clears -> +1 step", () => {
    expect(bumpedTargetBpm(LADDER, CEILING_BUMP_AFTER_CLEARS)).toBe(105);
  });
  it("double the threshold -> +2 steps", () => {
    expect(bumpedTargetBpm(LADDER, CEILING_BUMP_AFTER_CLEARS * 2)).toBe(110);
  });
  it("caps at MAX_CEILING_BUMPS no matter how many clears", () => {
    expect(bumpedTargetBpm(LADDER, 999)).toBe(100 + MAX_CEILING_BUMPS * 5);
  });
});

describe("effectiveBpmLadder — compose seed + ceiling", () => {
  it("returns null for a drill with no ladder", () => {
    expect(effectiveBpmLadder(null, { status: "in-progress", reps: 1, bpmReached: 90 })).toBeNull();
  });
  it("a fresh node yields the authored ladder unchanged", () => {
    expect(effectiveBpmLadder(LADDER, undefined)).toEqual(LADDER);
  });
  it("a node with history seeds the start", () => {
    const eff = effectiveBpmLadder(LADDER, { status: "in-progress", reps: 3, bpmReached: 95 });
    expect(eff?.startBpm).toBe(90);
    expect(eff?.targetBpm).toBe(100);
  });
  it("after enough clears, target rises AND start can climb above the old target", () => {
    const eff = effectiveBpmLadder(LADDER, {
      status: "learned",
      reps: 10,
      bpmReached: 100,
      targetClears: CEILING_BUMP_AFTER_CLEARS,
    });
    expect(eff?.targetBpm).toBe(105); // ceiling bumped
    expect(eff?.startBpm).toBe(95); // 100-5, allowed under new ceiling
  });
});

describe("clearedTarget", () => {
  it("true when the session reached the authored ceiling", () => {
    expect(clearedTarget(LADDER, 100)).toBe(true);
    expect(clearedTarget(LADDER, 105)).toBe(true);
  });
  it("false below the ceiling, or with no ladder / no reading", () => {
    expect(clearedTarget(LADDER, 95)).toBe(false);
    expect(clearedTarget(null, 100)).toBe(false);
    expect(clearedTarget(LADDER, undefined)).toBe(false);
  });
});

describe("withDefaultMotorConfigAll", () => {
  it("maps every drill", () => {
    const out = withDefaultMotorConfigAll([drill({ id: "a" }), drill({ id: "b", pillar: "expression", steps: [{ type: "moods", durationSec: 1, instruction: "x" }] })]);
    expect(out).toHaveLength(2);
    expect(out[0].bpmLadder).toBeTruthy();
    expect(out[1].bpmLadder).toBeUndefined();
  });
});
