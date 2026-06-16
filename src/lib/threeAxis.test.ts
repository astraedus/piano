import { describe, it, expect } from "vitest";
import { generationAxis, abilityAxis, patternAxis } from "./threeAxis";
import type { ArcEvent, Piece, SkillNode, SkillProgress } from "./types";

// Minimal node factory — only the fields the derivations read.
function node(id: string, category: SkillNode["category"], prereqs: string[] = []): SkillNode {
  return {
    id,
    title: id,
    tier: 1,
    category,
    prereqs,
    unlock: "",
    masteryDrill: "",
  } as SkillNode;
}

const learned: SkillProgress = { status: "learned" } as SkillProgress;

function piece(status: Piece["status"]): Piece {
  return { id: "p-" + status, title: "t", status, startedAt: "2026-01-01", minutes: 0 } as Piece;
}

describe("generationAxis", () => {
  it("reports getting-started when there is no generation signal", () => {
    const g = generationAxis([node("a", "technique")], {}, [], []);
    expect(g.gettingStarted).toBe(true);
    expect(g.improvNodesLearned).toBe(0);
    expect(g.piecesYours).toBe(0);
    expect(g.hasFirstImprov).toBe(false);
  });

  it("counts learned expression nodes as improv signal", () => {
    const nodes = [node("imp", "expression"), node("tech", "technique")];
    const g = generationAxis(nodes, { imp: learned, tech: learned }, [], []);
    expect(g.improvNodesLearned).toBe(1); // only the expression node
    expect(g.gettingStarted).toBe(false);
  });

  it("counts pieces marked yours and the first-improv arc moment", () => {
    const arc: ArcEvent[] = [
      { id: "1", at: "2026-01-01", kind: "first-improv", label: "first improv" },
    ];
    const g = generationAxis([], {}, [piece("yours"), piece("learning")], arc);
    expect(g.piecesYours).toBe(1);
    expect(g.hasFirstImprov).toBe(true);
    expect(g.gettingStarted).toBe(false);
  });

  it("does not count an expression node that is not yet learned", () => {
    const g = generationAxis([node("imp", "expression")], {}, [], []);
    expect(g.improvNodesLearned).toBe(0);
  });
});

describe("abilityAxis", () => {
  it("reports learned/total skills and the level", () => {
    const nodes = [node("a", "scales"), node("b", "chords")];
    const a = abilityAxis(nodes, { a: learned }, 4);
    expect(a.skills).toEqual({ learned: 1, total: 2 });
    expect(a.level).toBe(4);
  });

  it("floors level at 1 for a fresh profile (level 0/undefined)", () => {
    expect(abilityAxis([], {}, 0).level).toBe(1);
    expect(abilityAxis([], {}, undefined as unknown as number).level).toBe(1);
  });
});

describe("patternAxis", () => {
  it("surfaces the live ear level + label and the L5 cap", () => {
    const p = patternAxis(3, []);
    expect(p.earLevel).toBe(3);
    expect(p.maxLevel).toBe(5);
    expect(p.label).toBe("Chord Quality");
  });

  it("returns null accuracy when no rounds have been answered", () => {
    const p = patternAxis(1, [undefined, undefined]);
    expect(p.accuracy).toBeNull();
    expect(p.roundsAnswered).toBe(0);
  });

  it("aggregates lifetime ear accuracy across sessions", () => {
    const p = patternAxis(2, [
      { correctIds: ["a", "b"], wrongIds: ["c"] }, // 2/3
      { correctIds: ["d"], wrongIds: [] }, // 1/1
    ]);
    expect(p.roundsAnswered).toBe(4);
    expect(p.accuracy).toBeCloseTo(3 / 4);
  });
});
