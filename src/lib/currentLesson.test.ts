import { describe, it, expect } from "vitest";
import { currentLessonNode } from "./currentLesson";
import type { ChainDrill, SkillNode, SkillProgress } from "./types";

// ── Minimal fixtures ────────────────────────────────────────────────────────

const node = (id: string, tier: SkillNode["tier"], extra: Partial<SkillNode> = {}): SkillNode => ({
  id,
  instrument: "piano",
  title: id,
  tier,
  category: "scales",
  prereqs: [],
  masteryDrill: "drill",
  unlock: "unlock",
  ...extra,
});

const drill = (id: string): ChainDrill => ({
  id,
  instrument: "piano",
  phase: 1,
  name: id,
  minutes: 5,
  ghostKey: "C",
  pillar: "technique",
  steps: [],
  closingNote: "done",
});

const learned = (): SkillProgress => ({ status: "learned", reps: 5, learnedAt: "2026-01-01" });

describe("currentLessonNode", () => {
  it("returns the node whose chainDrillId matches tonight's drill", () => {
    const nodes = [
      node("a", 1, { chainDrillId: "drill-a" }),
      node("b", 1, { chainDrillId: "drill-b" }),
    ];
    const result = currentLessonNode(nodes, {}, drill("drill-b"));
    expect(result?.id).toBe("b");
  });

  it("returns the first node when two share the drill id (drill-picker rule)", () => {
    const nodes = [
      node("first", 1, { chainDrillId: "shared" }),
      node("second", 1, { chainDrillId: "shared" }),
    ];
    expect(currentLessonNode(nodes, {}, drill("shared"))?.id).toBe("first");
  });

  it("falls back to the frontier when there is no chain drill", () => {
    // a is learned; b (tier 1) and c (tier 2) are available → frontier is the
    // lowest-tier available node.
    const nodes = [
      node("a", 1),
      node("c", 2),
      node("b", 1, { prereqs: ["a"] }),
    ];
    const progress = { a: learned() };
    const result = currentLessonNode(nodes, progress, null);
    expect(result?.id).toBe("b");
  });

  it("falls back to the frontier when the drill has no matching node", () => {
    const nodes = [node("a", 1)]; // no chainDrillId anywhere
    const result = currentLessonNode(nodes, {}, drill("unlinked-drill"));
    // The drill maps to no node, so we surface the frontier (a is available).
    expect(result?.id).toBe("a");
  });

  it("returns null when everything is learned and there is no drill", () => {
    const nodes = [node("a", 1)];
    const progress = { a: learned() };
    expect(currentLessonNode(nodes, progress, null)).toBeNull();
  });

  it("returns null when there are no nodes (no module)", () => {
    expect(currentLessonNode([], {}, null)).toBeNull();
    expect(currentLessonNode([], {}, drill("x"))).toBeNull();
  });

  it("prefers the drilled node over the frontier when both resolve", () => {
    // a available (would be the frontier) but the drill points at b → b wins.
    const nodes = [
      node("a", 1),
      node("b", 1, { chainDrillId: "drill-b" }),
    ];
    expect(currentLessonNode(nodes, {}, drill("drill-b"))?.id).toBe("b");
  });
});
