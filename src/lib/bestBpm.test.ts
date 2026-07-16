import { describe, it, expect } from "vitest";
import { bestBpmForKey, bestBpmForDrill, bestBpmForNode } from "./bestBpm";
import { drillRepId, scaleRepId } from "./types";
import type { AppState, SkillNode, SkillProgress } from "./types";

type SkillReps = AppState["skillReps"];

const keyNode: SkillNode = {
  id: "p-key-C",
  instrument: "piano",
  title: "C major",
  tier: 1,
  category: "scales",
  prereqs: [],
  masteryDrill: "x",
  unlock: "x",
  keyId: "C",
  chainDrillId: "p1-c-major-chain",
};

const drillOnlyNode: SkillNode = {
  id: "p-t1-first-improv",
  instrument: "piano",
  title: "First Improv",
  tier: 1,
  category: "expression",
  prereqs: ["p-key-C"],
  masteryDrill: "x",
  unlock: "x",
  chainDrillId: "p1-first-improv",
};

describe("bestBpmForKey / bestBpmForDrill", () => {
  it("returns the recorded maxBpm for a key scale", () => {
    const reps: SkillReps = { [scaleRepId("C")]: { count: 3, maxBpm: 84 } };
    expect(bestBpmForKey("C", reps)).toBe(84);
  });

  it("returns the recorded maxBpm for a drill", () => {
    const reps: SkillReps = { [drillRepId("p1-c-major-chain")]: { count: 2, maxBpm: 95 } };
    expect(bestBpmForDrill("p1-c-major-chain", reps)).toBe(95);
  });

  it("returns undefined (not 0) when nothing recorded", () => {
    expect(bestBpmForKey("C", undefined)).toBeUndefined();
    expect(bestBpmForKey("C", {})).toBeUndefined();
    expect(bestBpmForKey("C", { [scaleRepId("C")]: { count: 1 } })).toBeUndefined();
    expect(bestBpmForKey("C", { [scaleRepId("C")]: { count: 1, maxBpm: 0 } })).toBeUndefined();
    expect(bestBpmForDrill("x", {})).toBeUndefined();
  });
});

describe("bestBpmForNode", () => {
  it("undefined when no tempo anywhere", () => {
    expect(bestBpmForNode(keyNode, {}, {})).toBeUndefined();
    expect(bestBpmForNode(keyNode, undefined, undefined)).toBeUndefined();
  });

  it("uses the node's own rep-engine bpmReached", () => {
    const progress: Record<string, SkillProgress> = {
      "p-key-C": { status: "in-progress", reps: 4, bpmReached: 90 },
    };
    expect(bestBpmForNode(keyNode, progress, {})).toBe(90);
  });

  it("pulls from the linked key scale warmup", () => {
    const reps: SkillReps = { [scaleRepId("C")]: { count: 5, maxBpm: 72 } };
    expect(bestBpmForNode(keyNode, {}, reps)).toBe(72);
  });

  it("pulls from the linked chain drill for a drill-only node", () => {
    const reps: SkillReps = { [drillRepId("p1-first-improv")]: { count: 1, maxBpm: 60 } };
    expect(bestBpmForNode(drillOnlyNode, {}, reps)).toBe(60);
  });

  it("takes the MAX across node progress, key scale, and drill", () => {
    const progress: Record<string, SkillProgress> = {
      "p-key-C": { status: "in-progress", reps: 4, bpmReached: 80, maxBpm: 70 },
    };
    const reps: SkillReps = {
      [scaleRepId("C")]: { count: 5, maxBpm: 88 },
      [drillRepId("p1-c-major-chain")]: { count: 2, maxBpm: 85 },
    };
    expect(bestBpmForNode(keyNode, progress, reps)).toBe(88);
  });
});
