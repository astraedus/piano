import { describe, it, expect } from "vitest";
import {
  skillLearnedCount,
  tierLearnedCounts,
  completionFraction,
} from "./skillSummary";
import type { SkillNode, SkillProgress } from "./types";

function node(id: string, tier: 0 | 1 | 2, prereqs: string[] = []): SkillNode {
  return {
    id,
    instrument: "piano",
    title: id,
    tier,
    category: "technique",
    prereqs,
    masteryDrill: "",
    unlock: "",
  };
}

function learned(): SkillProgress {
  return { status: "learned", reps: 1 };
}

const NODES: SkillNode[] = [
  node("a", 0),
  node("b", 1, ["a"]),
  node("c", 1, ["a"]),
  node("d", 2, ["b", "c"]),
];

describe("skillLearnedCount", () => {
  it("counts zero learned on an empty progress map", () => {
    expect(skillLearnedCount(NODES, {})).toEqual({ learned: 0, total: 4 });
  });

  it("counts learned nodes against the total node count", () => {
    const progress = { a: learned(), b: learned() };
    expect(skillLearnedCount(NODES, progress)).toEqual({ learned: 2, total: 4 });
  });

  it("counts a node persisted as learned even if its prereqs were later un-learned (snapshot is authoritative for 'learned')", () => {
    // resolveStatus returns "learned" whenever the snapshot says so, before the
    // prereq check — a node never silently un-learns. This asserts the helper
    // mirrors that engine behavior rather than re-deriving its own rule.
    const progress = { a: learned(), d: learned() };
    expect(skillLearnedCount(NODES, progress).learned).toBe(2);
  });

  it("treats an in-progress node (reps but not learned) as not learned", () => {
    const progress = {
      a: learned(),
      b: { status: "in-progress" as const, reps: 3 },
    };
    expect(skillLearnedCount(NODES, progress).learned).toBe(1);
  });

  it("handles an empty node list without dividing by zero", () => {
    expect(skillLearnedCount([], {})).toEqual({ learned: 0, total: 0 });
  });
});

describe("tierLearnedCounts", () => {
  it("groups learned/total per tier, sorted ascending", () => {
    const progress = { a: learned(), b: learned() };
    const tiers = tierLearnedCounts(NODES, progress);
    expect(tiers).toEqual([
      { tier: 0, learned: 1, total: 1 },
      { tier: 1, learned: 1, total: 2 },
      { tier: 2, learned: 0, total: 1 },
    ]);
  });

  it("returns empty array for no nodes", () => {
    expect(tierLearnedCounts([], {})).toEqual([]);
  });
});

describe("completionFraction", () => {
  it("returns 0 for an empty group (no NaN)", () => {
    expect(completionFraction({ learned: 0, total: 0 })).toBe(0);
  });
  it("computes the fraction", () => {
    expect(completionFraction({ learned: 1, total: 2 })).toBe(0.5);
    expect(completionFraction({ learned: 3, total: 3 })).toBe(1);
  });
});
